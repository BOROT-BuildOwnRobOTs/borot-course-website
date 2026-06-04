import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import Session from '@/models/Session'
import { bootstrapBranches } from '@/lib/bootstrapBranches'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// GET /api/admin/portfolio-bulk[?branch=...]
// Lists every student with their assessment readiness — does NOT call the LLM.
// Readiness is tallied directly from session attendance in ONE pass (no per-student
// buildPortfolio) so the whole roster loads fast.
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    await bootstrapBranches()

    const branchId = req.nextUrl.searchParams.get('branch')
    const filter: Record<string, unknown> = {}
    if (branchId) filter.branch = branchId

    const students = await Student.find(filter)
      .sort({ name: 1 })
      .select('name nickname portfolioAssessment')
      .lean<any[]>()

    const ids = students.map((s) => s._id.toString())

    // Pull every session touching any of these students, once.
    const sessions = await Session.find({ 'attendance.student': { $in: ids } })
      .select('attendance')
      .lean<any[]>()

    // Tally works (photos + videos + tagged artworks) and text comments per student.
    const tally: Record<string, { works: number; comments: number }> = {}
    for (const id of ids) tally[id] = { works: 0, comments: 0 }

    for (const sess of sessions) {
      for (const att of sess.attendance || []) {
        const sid = att.student?.toString()
        if (!sid || !tally[sid]) continue
        const t = tally[sid]
        if (Array.isArray(att.imageUrls)) {
          // photos (artwork image is also typically in imageUrls or separate — count both kinds)
          t.works += att.imageUrls.filter(Boolean).length
        }
        if (att.videoUrl) t.works += 1
        if (att.artworkImageUrl && !(att.imageUrls || []).includes(att.artworkImageUrl)) t.works += 1
        if (att.feedback && String(att.feedback).trim()) t.comments += 1
      }
    }

    const data = students.map((s) => {
      const id = s._id.toString()
      const { works, comments } = tally[id]
      const missing: string[] = []
      if (works < 1) missing.push('at least 1 photo or project')
      if (comments < 1) missing.push('at least 1 teacher comment')
      return {
        studentId: id,
        name: s.name || 'Unnamed',
        nickname: s.nickname || '',
        ready: missing.length === 0,
        works,
        comments,
        missing,
        hasAssessment: !!s.portfolioAssessment?.data,
        generatedAt: s.portfolioAssessment?.generatedAt ?? null,
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[/api/admin/portfolio-bulk] error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load portfolio list' }, { status: 500 })
  }
}
