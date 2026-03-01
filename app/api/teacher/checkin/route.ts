import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'
import Student from '@/models/Student'
import Teacher from '@/models/Teacher'

// POST /api/teacher/checkin
// Body: { courseId, courseName, teacherId, studentId, scheduledAt, checkedIn }
// This API finds or creates a session for the given date, then checks in the student.
// This enables retroactive check-in for teachers.
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { courseId, courseName, teacherId, studentId, scheduledAt, checkedIn } = await req.json()

    if (!courseId || !teacherId || !studentId || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: 'courseId, teacherId, studentId, and scheduledAt are required' },
        { status: 400 }
      )
    }

    const targetDate = new Date(scheduledAt)
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Try to find existing session for this course on this date
    let session = await Session.findOne({
      course: courseId,
      scheduledAt: { $gte: startOfDay, $lte: endOfDay },
    })

    if (!session) {
      // Create a new session automatically
      const teacher = await Teacher.findById(teacherId)
      const teacherName = teacher?.name || ''

      // Find all students enrolled in this course
      const enrolledStudents = await Student.find({
        'enrollments.course': courseId,
        'enrollments.status': { $in: ['active', 'pending'] },
      })

      const attendance = enrolledStudents.map((s) => ({
        student: s._id,
        studentName: s.name,
        checkedIn: false,
      }))

      session = await Session.create({
        course: courseId,
        courseName: courseName || '',
        teacher: teacherId,
        teacherName,
        scheduledAt: targetDate,
        topic: `Session ${targetDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`,
        attendance,
      })
    }

    // Ensure the teacher field is set on the session (in case it was created by admin
    // or another mechanism without this teacher's ID)
    if (!session.teacher || session.teacher.toString() !== teacherId) {
      session.teacher = teacherId
    }

    // Now check-in the student
    const attendanceEntry = session.attendance.find(
      (a: any) => a.student.toString() === studentId
    )

    if (attendanceEntry) {
      attendanceEntry.checkedIn = checkedIn ?? true
      if (checkedIn !== false) {
        attendanceEntry.checkedInAt = new Date()
      } else {
        attendanceEntry.checkedInAt = undefined
      }
    } else {
      // Student not in attendance list yet, add them
      const student = await Student.findById(studentId)
      session.attendance.push({
        student: studentId,
        studentName: student?.name || '',
        checkedIn: checkedIn ?? true,
        checkedInAt: checkedIn !== false ? new Date() : undefined,
      })
    }

    await session.save()

    return NextResponse.json({ success: true, data: session })
  } catch (error) {
    console.error('Teacher checkin error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check-in' },
      { status: 500 }
    )
  }
}
