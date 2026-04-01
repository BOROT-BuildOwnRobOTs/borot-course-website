import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'

export const dynamic = 'force-dynamic'

// GET /api/parent/sessions?studentIds=id1,id2
// Returns all sessions where any of the given students appear in attendance
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const studentIdsParam = searchParams.get('studentIds')

    if (!studentIdsParam) {
      return NextResponse.json({ success: false, error: 'studentIds is required' }, { status: 400 })
    }

    const studentIds = studentIdsParam.split(',').filter(Boolean)

    const sessions = await Session.find({
      'attendance.student': { $in: studentIds },
    })
      .sort({ scheduledAt: 1 })
      .lean()

    return NextResponse.json({ success: true, data: sessions })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 })
  }
}
