import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'
import Student from '@/models/Student'

export async function GET() {
  try {
    await connectDB()
    const sessions = await Session.find({}).sort({ scheduledAt: -1 })
    return NextResponse.json({ success: true, data: sessions })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { courseId, courseName, teacherId, teacherName, scheduledAt, topic, notes } = body

    if (!courseId || !teacherId || !scheduledAt || !topic) {
      return NextResponse.json({ success: false, error: 'courseId, teacherId, scheduledAt and topic are required' }, { status: 400 })
    }

    // Auto-populate attendance with all students enrolled in this course
    const enrolledStudents = await Student.find({
      'enrollments.course': courseId,
      'enrollments.status': { $in: ['active', 'pending'] }
    })

    const attendance = enrolledStudents.map((s) => ({
      student: s._id,
      studentName: s.name,
      checkedIn: false,
    }))

    const session = await Session.create({
      course: courseId,
      courseName,
      teacher: teacherId,
      teacherName,
      scheduledAt,
      topic,
      notes,
      attendance,
    })

    return NextResponse.json({ success: true, data: session }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create session' }, { status: 500 })
  }
}
