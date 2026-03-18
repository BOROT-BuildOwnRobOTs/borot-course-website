import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'

// GET /api/teacher/all-sessions
// Returns ALL sessions across all teachers
// This allows a teacher to see and manage sessions from other teachers too.
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const sessions = await Session.find({}).sort({ scheduledAt: -1 }).lean()

    // Normalize ObjectId fields to plain strings for consistent frontend comparison
    const normalized = sessions.map((s: any) => ({
      ...s,
      _id: s._id?.toString(),
      course: s.course?.toString(),
      teacher: s.teacher?.toString(),
      teacherName: s.teacherName || '',
      scheduledAt: s.scheduledAt ? new Date(s.scheduledAt).toISOString() : undefined,
      attendance: (s.attendance || []).map((a: any) => ({
        ...a,
        _id: a._id?.toString(),
        student: a.student?.toString(),
        checkedInAt: a.checkedInAt ? new Date(a.checkedInAt).toISOString() : undefined,
      })),
    }))

    return NextResponse.json({ success: true, data: normalized })
  } catch (error) {
    console.error('Teacher all-sessions API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch all sessions' }, { status: 500 })
  }
}
