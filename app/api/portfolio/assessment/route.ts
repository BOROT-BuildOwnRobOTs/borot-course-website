import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import { buildPortfolio } from '@/lib/portfolio'
import { assessStudent, checkAssessmentReadiness } from '@/lib/mcpLlm'

export const dynamic = 'force-dynamic'
// Model swaps on the single-GPU backend can take 30s–2min, so allow headroom.
export const maxDuration = 120

// GET /api/portfolio/assessment?studentId=...
// Returns the cached assessment (or null). Never calls the LLM.
// Access is trusted upstream, the same way /api/portfolio is.
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    if (!studentId) {
      return NextResponse.json({ success: false, error: 'studentId required' }, { status: 400 })
    }
    const student = await Student.findById(studentId, 'portfolioAssessment').lean<any>()
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    }
    return NextResponse.json({
      success: true,
      data: student.portfolioAssessment?.data ?? null,
      generatedAt: student.portfolioAssessment?.generatedAt ?? null,
    })
  } catch (error) {
    console.error('[/api/portfolio/assessment] GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load assessment' }, { status: 500 })
  }
}

// POST /api/portfolio/assessment
// Body: { studentId }
// Builds the portfolio, calls the MCP LLM, caches and returns the assessment.
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { studentId } = (await req.json()) || {}
    if (!studentId) {
      return NextResponse.json({ success: false, error: 'studentId required' }, { status: 400 })
    }

    const portfolio = await buildPortfolio(studentId)
    if (!portfolio) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    }

    const readiness = checkAssessmentReadiness(portfolio)
    if (!readiness.ready) {
      return NextResponse.json({
        success: false,
        notEnoughData: true,
        missing: readiness.missing,
        works: readiness.works,
        comments: readiness.comments,
        error: `Add ${readiness.missing.join(' and ')} before generating.`,
      })
    }

    const assessment = await assessStudent(portfolio)

    await Student.findByIdAndUpdate(studentId, {
      portfolioAssessment: {
        data: assessment,
        sessionsCount: portfolio.stats.attendedSessions,
        generatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: assessment })
  } catch (error: any) {
    console.error('[/api/portfolio/assessment] POST error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate assessment' },
      { status: 500 }
    )
  }
}
