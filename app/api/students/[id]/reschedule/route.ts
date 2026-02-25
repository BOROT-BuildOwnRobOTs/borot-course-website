import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'

// POST /api/students/[id]/reschedule
// Body: { enrollmentIndex, originalDate, newSlot: { day, time }, newDate, reason? }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { enrollmentIndex, originalDate, newSlot, newDate, reason } = await req.json()

    if (enrollmentIndex === undefined || !originalDate || !newSlot || !newDate) {
      return NextResponse.json(
        { success: false, error: 'enrollmentIndex, originalDate, newSlot, newDate are required' },
        { status: 400 }
      )
    }

    const student = await Student.findById(params.id)
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    }

    const enrollment = student.enrollments[enrollmentIndex]
    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Enrollment not found' }, { status: 404 })
    }

    if (!enrollment.reschedules) enrollment.reschedules = []

    // Remove existing reschedule for this originalDate if any
    const origStr = new Date(originalDate).toDateString()
    enrollment.reschedules = enrollment.reschedules.filter(
      (r: any) => new Date(r.originalDate).toDateString() !== origStr
    )

    enrollment.reschedules.push({
      originalDate: new Date(originalDate),
      newSlot,
      newDate: new Date(newDate),
      reason: reason || '',
    })

    student.markModified('enrollments')
    await student.save()

    return NextResponse.json({ success: true, data: student })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to save reschedule' }, { status: 500 })
  }
}

// DELETE /api/students/[id]/reschedule
// Body: { enrollmentIndex, originalDate } — cancel a reschedule
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { enrollmentIndex, originalDate } = await req.json()

    const student = await Student.findById(params.id)
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    }

    const enrollment = student.enrollments[enrollmentIndex]
    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Enrollment not found' }, { status: 404 })
    }

    const origStr = new Date(originalDate).toDateString()
    enrollment.reschedules = (enrollment.reschedules || []).filter(
      (r: any) => new Date(r.originalDate).toDateString() !== origStr
    )

    student.markModified('enrollments')
    await student.save()

    return NextResponse.json({ success: true, data: student })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to cancel reschedule' }, { status: 500 })
  }
}
