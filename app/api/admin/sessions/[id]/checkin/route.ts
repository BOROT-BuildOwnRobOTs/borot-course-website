import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'

export const dynamic = 'force-dynamic'

// POST /api/admin/sessions/[id]/checkin
// Body: { studentId, checkedIn: true/false }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { studentId, checkedIn } = await req.json()

    if (!studentId) {
      return NextResponse.json({ success: false, error: 'studentId is required' }, { status: 400 })
    }

    const session = await Session.findById(params.id)
    if (!session) return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })

    const attendanceEntry = session.attendance.find(
      (a: any) => a.student.toString() === studentId
    )

    if (!attendanceEntry) {
      // Add new attendance entry
      session.attendance.push({
        student: studentId,
        studentName: '',
        checkedIn: checkedIn ?? true,
        checkedInAt: checkedIn !== false ? new Date() : undefined,
      })
    } else {
      attendanceEntry.checkedIn = checkedIn ?? true
      if (checkedIn !== false) {
        attendanceEntry.checkedInAt = new Date()
      }
    }

    await session.save()
    return NextResponse.json({ success: true, data: session })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update check-in' }, { status: 500 })
  }
}
