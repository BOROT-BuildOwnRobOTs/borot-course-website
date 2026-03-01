"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Send, Sparkles, User, Loader2 } from "lucide-react"

// ── Locked AI answers map ──────────────────────────────────────────────────
// key = normalized question text, value = answer lines
const LOCKED_ANSWERS: Record<string, string[]> = {
  "ควรต่อ level 2 หรือ robotics": [
    "Based on 12 past sessions, I recommend continuing with **Robotics Level 2** first! 🤖",
    "Reason: The student has strong Logical Thinking and Problem Solving skills — perfect for a programming-based track.",
    "3D Printing is better suited for later, once Engineering Skills have developed further.",
  ],
  "ควรต่อ level 2": [
    "Based on 12 past sessions, I recommend continuing with **Robotics Level 2** first! 🤖",
    "Reason: The student has strong Logical Thinking and Problem Solving skills — perfect for a programming-based track.",
    "3D Printing is better suited for later, once Engineering Skills have developed further.",
  ],
  "mechanical structure": [
    "Yes! Based on observations from sessions 4–6, the robot structure tends to be loose at the joints. 🔧",
    "Recommended practice: Lego Technic structure, Bridge challenge, Load-bearing design.",
    "Just 1–2 weeks of focused practice will make a noticeable difference.",
  ],
  "competition track": [
    "The student is a great fit for the Competition Track! 🏆",
    "Teamwork score: 90/100 and Problem Solving: 78/100 — both above average for peers.",
    "Recommend starting Competition Prep Module next semester.",
  ],
  "animation": [
    "Excellent idea! Animation is a great match because the Creativity score is as high as 85/100. 🎨",
    "Suggested activities: Scratch animation, Stop-motion, Servo motor choreography.",
    "Animation will build presentation skills and open the door to the world of digital art.",
  ],
  "engineering หรือ design": [
    "Based on the analysis, the student leans toward **Engineering** over Design, roughly 60:40. 🧠",
    "Logical Thinking (72) and Problem Solving (78) suggest a preference for 'making it work' over 'making it beautiful'.",
    "However, Creativity (85) is also very high — this could be a rare Engineering-Creative hybrid!",
  ],
  "ทักษะที่ควรฝึก": [
    "Skills to focus on right now, in priority order: 💪",
    "1. 🔴 Mechanical Structure (urgent) — structural joints are still loose.",
    "2. 🟡 Animation & Motion Design — high Creativity score should be leveraged.",
    "3. 🟡 Electronics & Circuit — will speed up robot debugging.",
    "4. 🟢 Data & Coding Logic — builds foundation for AI/ML in the future.",
  ],
  "คอร์สถัดไป": [
    "Recommended next courses (ranked by suitability): 🎯",
    "🥇 Robotics Level 2 — 92% match (top recommendation)",
    "🥈 Competition Prep Track — 85% match",
    "🥉 Electronics Fundamentals — 74% match",
  ],
  "default": [
    "Thanks for your question! 🤖",
    "This feature is still Coming Soon — in the real version, AI will analyze all learning data and answer accurately.",
    "Try clicking the preset questions above to see example results! 👆",
  ],
}

// ── Preset questions ───────────────────────────────────────────────────────
const PRESET_QUESTIONS = [
  { label: "Continue Level 2 or Robotics?",          key: "ควรต่อ level 2 หรือ robotics" },
  { label: "Should we practice Mechanical Structure?", key: "mechanical structure" },
  { label: "Is the student suited for Competition Track?", key: "competition track" },
  { label: "Should we try Animation?",               key: "animation" },
  { label: "More Engineering or Design?",             key: "engineering หรือ design" },
  { label: "What skills should we focus on now?",    key: "ทักษะที่ควรฝึก" },
  { label: "Recommend next course",                   key: "คอร์สถัดไป" },
]

// ── Types ──────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: "user" | "ai"
  text?: string
  lines?: string[]
  isTyping?: boolean
}

// ── Helper ─────────────────────────────────────────────────────────────────
function matchAnswer(question: string): string[] {
  const q = question.toLowerCase()
  for (const [key, answer] of Object.entries(LOCKED_ANSWERS)) {
    if (key !== "default" && q.includes(key)) return answer
  }
  return LOCKED_ANSWERS["default"]
}

// ── Render bold markdown inline ────────────────────────────────────────────
function renderLine(line: string) {
  const parts = line.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

// ── Component ──────────────────────────────────────────────────────────────
interface Props {
  studentName?: string
}

export default function AIRecommendation({ studentName }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      lines: [
        `Hello! I'm BOROT AI 🤖`,
        `${studentName ? `I've analyzed the learning data for ${studentName}.` : "I've finished analyzing the learning data."}`,
        "Try clicking a question below, or type your own! (Demo mode — answers are examples)",
      ],
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = (text: string) => {
    if (!text.trim() || isLoading) return
    const question = text.trim()
    setInput("")

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: question }])
    setIsLoading(true)

    // Simulate AI thinking
    setTimeout(() => {
      const answer = matchAnswer(question)
      setMessages((prev) => [...prev, { role: "ai", lines: answer }])
      setIsLoading(false)
    }, 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">AI Recommendation</h2>
            <p className="text-xs text-muted-foreground">
              Ask AI to analyze learning progress · Demo Mode
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
          🚀 Coming Soon · Demo
        </Badge>
      </div>

      {/* Preset question chips */}
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-2">💡 Sample questions — click to ask:</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((q) => (
            <button
              key={q.key}
              onClick={() => sendMessage(q.label)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700
                hover:bg-purple-100 hover:border-purple-300 transition-all font-medium
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <Card className="border border-purple-100 overflow-hidden">
        <CardHeader className="py-2.5 px-4 bg-gradient-to-r from-violet-600 to-purple-600">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            BOROT AI Chat · Demo
            <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
              Example answers only
            </span>
          </CardTitle>
        </CardHeader>

        {/* Messages */}
        <CardContent className="p-0">
          <div className="h-80 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={[
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm",
                  msg.role === "ai"
                    ? "bg-gradient-to-br from-violet-500 to-purple-600"
                    : "bg-gradient-to-br from-blue-500 to-cyan-500",
                ].join(" ")}>
                  {msg.role === "ai" ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>

                {/* Bubble */}
                <div className={[
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm space-y-0.5",
                  msg.role === "ai"
                    ? "bg-white border border-purple-100 rounded-tl-none text-gray-700"
                    : "bg-gradient-to-br from-blue-500 to-cyan-500 rounded-tr-none text-white",
                ].join(" ")}>
                  {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                  {msg.lines?.map((line, j) => (
                    <p key={j} className="leading-relaxed">
                      {renderLine(line)}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 flex-row">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-purple-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t bg-white px-3 py-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question... (Press Enter or Send)"
              disabled={isLoading}
              className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300
                placeholder:text-gray-400 disabled:opacity-60"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-purple-600
                flex items-center justify-center text-white shadow-sm
                hover:shadow-md transition-all hover:scale-105 active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground pb-2">
        🤖 Demo only — Real AI will connect to learning data · Coming Soon
      </p>
    </div>
  )
}