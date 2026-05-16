import { NextRequest, NextResponse } from 'next/server'
import { buildPortfolio } from '@/lib/portfolio'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// GET /api/portfolio?studentId=...
// Returns the full portfolio data for a student.
// NOTE: Access control is enforced upstream (parent profile / admin panel
// already gate access to their own students). This endpoint trusts the caller
// the same way /api/parent/sessions does.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    if (!studentId) {
      return NextResponse.json({ success: false, error: 'studentId required' }, { status: 400 })
    }

    const data = await buildPortfolio(studentId)
    if (!data) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[/api/portfolio] error:', error)
    return NextResponse.json({ success: false, error: 'Failed to build portfolio' }, { status: 500 })
  }
}
