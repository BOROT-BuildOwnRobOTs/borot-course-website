import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'

// GET /api/teacher/sessions?teacherId=xxx
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const teacherId = req.nextUrl.searchParams.get('teacherId')
    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'teacherId is required' }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return NextResponse.json({ success: false, error: 'Invalid teacherId' }, { status: 400 })
    }

    const objectId = new mongoose.Types.ObjectId(teacherId)
    const sessions = await Session.find({ teacher: objectId }).sort({ scheduledAt: -1 }).lean()

    // Normalize ObjectId fields to plain strings for consistent frontend comparison
    const normalized = sessions.map((s: any) => ({
      ...s,
      _id: s._id?.toString(),
      course: s.course?.toString(),
      teacher: s.teacher?.toString(),
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
    console.error('Teacher sessions API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 })
  }
}
