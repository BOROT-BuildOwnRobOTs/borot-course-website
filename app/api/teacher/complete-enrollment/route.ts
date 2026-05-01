import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { studentId, enrollmentIndex } = await req.json()

    if (!studentId || enrollmentIndex === undefined || enrollmentIndex === null) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const student = await Student.findById(studentId)
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    }

    if (!student.enrollments[enrollmentIndex]) {
      return NextResponse.json({ success: false, error: 'Enrollment not found' }, { status: 404 })
    }

    student.enrollments[enrollmentIndex].status = 'completed'
    student.enrollments[enrollmentIndex].endDate = new Date()
    student.markModified('enrollments')
    await student.save()

    return NextResponse.json({
      success: true,
      data: student.enrollments[enrollmentIndex],
    })
  } catch (error) {
    console.error('[complete-enrollment]', error)
    return NextResponse.json({ success: false, error: 'Failed to complete enrollment' }, { status: 500 })
  }
}
