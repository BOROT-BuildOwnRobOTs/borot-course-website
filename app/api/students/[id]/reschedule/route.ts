import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import { generateStampDates } from '@/lib/slots'

// POST /api/students/[id]/reschedule
// Body: { enrollmentIndex, originalDate, newSlot: { day, time }, newDate, reason?, rescheduleRemaining?: boolean }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { enrollmentIndex, originalDate, newSlot, newDate, reason, rescheduleRemaining } = await req.json()

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

    if (rescheduleRemaining) {
      // Bulk reschedule: reschedule all remaining sessions from originalDate onward
      const origDateObj = new Date(originalDate)
      const newDateObj = new Date(newDate)
      const offsetMs = newDateObj.getTime() - origDateObj.getTime()

      // Generate all stamp dates for this enrollment
      const stamps = enrollment.startDate && enrollment.slot && enrollment.courseDurationWeeks
        ? generateStampDates(enrollment.startDate, enrollment.courseDurationWeeks, enrollment.slot)
        : []

      // Find all stamp dates >= originalDate (same day or later)
      const remainingStamps = stamps.filter((stampDate: Date) => {
        return stampDate.getTime() >= origDateObj.getTime() - 12 * 60 * 60 * 1000 // allow small tolerance for timezone
      })

      for (const stampDate of remainingStamps) {
        const stampOrigStr = stampDate.toDateString()
        // Remove existing reschedule for this date
        enrollment.reschedules = enrollment.reschedules.filter(
          (r: any) => new Date(r.originalDate).toDateString() !== stampOrigStr
        )
        // Compute new date by applying the same offset
        const newStampDate = new Date(stampDate.getTime() + offsetMs)
        enrollment.reschedules.push({
          originalDate: stampDate,
          newSlot,
          newDate: newStampDate,
          reason: reason || '',
        })
      }
    } else {
      // Single reschedule
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
    }

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
