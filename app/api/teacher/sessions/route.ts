import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'
import Student from '@/models/Student'

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

    // Find all course IDs this teacher is responsible for via student enrollments
    const enrolledStudents = await Student.find({ 'enrollments.teacher': objectId }).lean()
    const courseIdSet = new Set<string>()
    for (const student of enrolledStudents as any[]) {
      for (const e of student.enrollments || []) {
        if (e.teacher?.toString() === teacherId) {
          courseIdSet.add(e.course.toString())
        }
      }
    }
    const courseObjectIds = [...courseIdSet].map((id) => new mongoose.Types.ObjectId(id))

    // Query sessions where teacher matches OR course is one this teacher teaches
    const query = courseObjectIds.length > 0
      ? { $or: [{ teacher: objectId }, { course: { $in: courseObjectIds } }] }
      : { teacher: objectId }

    const sessions = await Session.find(query).sort({ scheduledAt: -1 }).lean()

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
