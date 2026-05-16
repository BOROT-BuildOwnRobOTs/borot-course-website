import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import { generateShareToken } from '@/lib/portfolio'

export const dynamic = 'force-dynamic'

// POST /api/portfolio/share
// Body: { studentId: string, action: 'create' | 'revoke' }
// Returns { token } on create, { revoked: true } on revoke.
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { studentId, action } = body || {}

    if (!studentId || !action || !['create', 'revoke'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'studentId and action ("create" | "revoke") required' },
        { status: 400 }
      )
    }

    const student = await Student.findById(studentId)
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    }

    if (action === 'revoke') {
      student.portfolioShareToken = null
      student.portfolioSharedAt = null
      await student.save()
      return NextResponse.json({ success: true, revoked: true })
    }

    // create — reuse existing token if one already exists so the link stays stable
    if (!student.portfolioShareToken) {
      student.portfolioShareToken = generateShareToken()
      student.portfolioSharedAt = new Date()
      await student.save()
    }

    return NextResponse.json({
      success: true,
      token: student.portfolioShareToken,
      sharedAt: student.portfolioSharedAt,
    })
  } catch (error) {
    console.error('[/api/portfolio/share] error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update share token' }, { status: 500 })
  }
}

// GET /api/portfolio/share?studentId=...
// Returns the current share token (if any) for the student.
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    if (!studentId) {
      return NextResponse.json({ success: false, error: 'studentId required' }, { status: 400 })
    }
    const student = await Student.findById(studentId, 'portfolioShareToken portfolioSharedAt').lean<any>()
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    }
    return NextResponse.json({
      success: true,
      token: student.portfolioShareToken || null,
      sharedAt: student.portfolioSharedAt || null,
    })
  } catch (error) {
    console.error('[/api/portfolio/share] GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load share state' }, { status: 500 })
  }
}
