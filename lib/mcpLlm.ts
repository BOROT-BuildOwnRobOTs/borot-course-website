// Server-only client for the MCP LLM Switcher (Qwen3 30B, OpenAI-compatible).
//
// Auth is via the `X-API-Key` header (NOT Bearer). The backend can only hold one
// model in VRAM at a time, so before a completion we best-effort check /api/status
// and load the target model if a different one is active (swap takes 30s–2min).
//
// `assessStudent()` turns a student's portfolio data into a teacher-style
// assessment: a narrative summary plus a 0–100 score + reason for each of the 5
// fixed skills (engineering + soft).

import {
  ASSESSMENT_SKILLS,
  flattenComments,
  flattenWorks,
  type PortfolioAssessment,
  type PortfolioData,
  type PortfolioSkill,
} from './portfolio-types'

const BASE_URL = process.env.MCP_LLM_BASE_URL || 'https://llm.mcp-digitalstudio.com/v1'
const API_KEY = process.env.MCP_LLM_API_KEY || ''
const MODEL = process.env.MCP_LLM_MODEL || 'qwen3_thinking_30b_a3b'

// The /api/* control endpoints live one level above the /v1 OpenAI base URL.
const API_ROOT = BASE_URL.replace(/\/v1\/?$/, '')

class McpLlmError extends Error {}

/** Ensure the target model is loaded. Best-effort — never throws. */
async function ensureModelLoaded(): Promise<void> {
  try {
    const res = await fetch(`${API_ROOT}/api/status`, {
      headers: { 'X-API-Key': API_KEY },
      cache: 'no-store',
    })
    if (!res.ok) return
    const status = await res.json()
    if (status?.active_model?.id === MODEL) return
    // Different (or no) model loaded — request the swap. The load endpoint blocks
    // until the model is ready, so awaiting it is enough.
    await fetch(`${API_ROOT}/api/load/${MODEL}`, {
      method: 'POST',
      headers: { 'X-API-Key': API_KEY },
    })
  } catch {
    // Status/load is best-effort. If it fails the completion call below will
    // either succeed (model already loaded) or surface its own error.
  }
}

/** Build a compact, token-bounded transcript of the student's attended sessions. */
function buildTranscript(data: PortfolioData): string {
  const lines: string[] = []
  for (const course of data.courses) {
    for (const s of course.sessions) {
      if (!s.checkedIn) continue
      const bits: string[] = []
      const date = s.actualDate ? new Date(s.actualDate).toLocaleDateString('en-GB') : ''
      bits.push(`[${course.courseName}${date ? ` · ${date}` : ''}]`)
      if (s.topic) bits.push(`Topic: ${s.topic}.`)
      if (s.artwork?.name) bits.push(`Project: ${s.artwork.name}.`)
      if (s.artwork?.description) bits.push(`Project notes: ${s.artwork.description}`)
      if (s.rating) bits.push(`Rating: ${s.rating}/5.`)
      if (s.feedback) bits.push(`Teacher feedback: ${s.feedback}`)
      // Only keep sessions that carry some signal.
      if (s.feedback || s.rating || s.artwork?.name || s.artwork?.description) {
        lines.push(bits.join(' '))
      }
    }
  }
  let transcript = lines.join('\n')
  // Hard cap to stay comfortably within context (Qwen3 has 131k but we keep the
  // prompt small for latency). ~24k chars is plenty for many sessions.
  const MAX = 24000
  if (transcript.length > MAX) transcript = transcript.slice(-MAX)
  return transcript
}

export interface AssessmentReadiness {
  ready: boolean
  works: number
  comments: number
  missing: string[]
}

/**
 * Quality gate before generating an assessment. Across ALL courses combined the
 * student needs at least one piece of work (any photo, video, or tagged
 * project/artwork) AND at least one real teacher comment (a rating with no text
 * does not count). Returns what's missing so the caller can tell the
 * parent/teacher exactly what to add.
 */
export function checkAssessmentReadiness(data: PortfolioData): AssessmentReadiness {
  // Any uploaded media counts as "a work" — not just sessions tagged as a project.
  const works = flattenWorks(data).length
  const comments = flattenComments(data).filter((c) => c.text.trim()).length

  const missing: string[] = []
  if (works < 1) missing.push('at least 1 photo or project')
  if (comments < 1) missing.push('at least 1 teacher comment')

  return { ready: missing.length === 0, works, comments, missing }
}

/** Strip Qwen-thinking `<think>…</think>` blocks and ```json fences, return JSON text. */
function extractJson(raw: string): string {
  let text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  // Drop a leading unmatched <think> (truncated reasoning) up to its close or first {
  text = text.replace(/^[\s\S]*?<\/think>/i, '').trim()
  // Strip markdown fences
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) text = fence[1].trim()
  // Fall back to the outermost { … } span
  const first = text.indexOf('{')
  const last = text.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) {
    text = text.slice(first, last + 1)
  }
  return text
}

function clampScore(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(100, Math.round(v)))
}

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => String(x).trim()).filter(Boolean)
}

const SYSTEM_PROMPT = `You are an experienced robotics and engineering instructor at BOROT Academy writing a portfolio assessment for a young student. You are given a transcript of session-by-session notes written by the student's teachers.

Write the assessment in ENGLISH, in a warm but professional teacher's voice, suitable for parents and school applications.

These are 1-on-1 classes, so do NOT assess teamwork. Evaluate the student on EXACTLY these ${ASSESSMENT_SKILLS.length} skills, each scored 0-100, with a concrete one-paragraph reason that cites specific sessions, projects, or behaviours from the transcript (do not invent facts that are not supported by the notes):
${ASSESSMENT_SKILLS.map((s) => `- ${s.key}: ${s.name}`).join('\n')}

Base every judgement only on evidence in the transcript. If evidence for a skill is thin, give a moderate score and say so honestly in the reason.

Return ONLY a JSON object, no prose before or after, matching exactly this schema:
{
  "summary": "2-4 sentence narrative overview of the student as a learner",
  "skills": [
${ASSESSMENT_SKILLS.map((s) => `    { "key": "${s.key}", "name": "${s.name}", "score": 0, "reason": "..." }`).join(',\n')}
  ],
  "strengths": ["short bullet", "short bullet"],
  "growthAreas": ["short bullet", "short bullet"],
  "recommendation": "1-2 sentence suggested next step or course"
}`

/**
 * Generate a teacher-style assessment for a student from their portfolio data.
 * Throws McpLlmError on transport / parse failures so the API route can surface
 * a clean error to the client.
 */
export async function assessStudent(data: PortfolioData): Promise<PortfolioAssessment> {
  if (!API_KEY) throw new McpLlmError('MCP_LLM_API_KEY is not configured')

  const transcript = buildTranscript(data)
  if (!transcript.trim()) throw new McpLlmError('No assessable session data')

  const studentName = data.student.nickname || data.student.name || 'The student'

  await ensureModelLoaded()

  const requestBody = JSON.stringify({
    model: MODEL,
    temperature: 0.3,
    stream: false,
    // The thinking model can ramble; cap so a runaway generation can't crash the
    // single-GPU backend (the 500s we saw correlate with very long outputs).
    max_tokens: 4000,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Student: ${studentName}\nTotal attended sessions: ${data.stats.attendedSessions}\nTotal studio hours: ${data.stats.totalAttendedHours}\n\nSession notes:\n${transcript}`,
      },
    ],
  })

  // The MCP backend (single-GPU llama.cpp) occasionally returns a transient 5xx.
  // Retry a couple of times before giving up.
  let content = ''
  let lastErr = ''
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      body: requestBody,
    })
    if (res.ok) {
      const json = await res.json()
      content = json?.choices?.[0]?.message?.content ?? ''
      if (content) break
      lastErr = 'empty content'
    } else {
      const body = await res.text().catch(() => '')
      lastErr = `${res.status}: ${body.slice(0, 200)}`
      // 4xx (bad key/request) won't fix itself — stop early.
      if (res.status >= 400 && res.status < 500) break
    }
  }
  if (!content) throw new McpLlmError(`LLM request failed (${lastErr})`)

  let parsed: any
  try {
    parsed = JSON.parse(extractJson(content))
  } catch {
    throw new McpLlmError('Failed to parse LLM JSON output')
  }

  // Normalise skills to exactly the 5 fixed ones, in canonical order.
  const bySource: Record<string, any> = {}
  if (Array.isArray(parsed.skills)) {
    for (const s of parsed.skills) {
      if (s?.key) bySource[String(s.key)] = s
    }
  }
  const skills: PortfolioSkill[] = ASSESSMENT_SKILLS.map((def) => {
    const src = bySource[def.key] || {}
    return {
      key: def.key,
      name: def.name,
      score: clampScore(src.score),
      reason: String(src.reason || '').trim(),
    }
  })

  if (skills.every((s) => !s.reason)) {
    throw new McpLlmError('LLM output missing skill reasoning')
  }

  return {
    summary: String(parsed.summary || '').trim(),
    skills,
    strengths: toStringArray(parsed.strengths),
    growthAreas: toStringArray(parsed.growthAreas),
    recommendation: String(parsed.recommendation || '').trim(),
    generatedAt: new Date().toISOString(),
    model: MODEL,
  }
}
