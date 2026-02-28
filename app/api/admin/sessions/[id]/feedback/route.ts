import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'

// POST /api/admin/sessions/[id]/feedback
// Body: { studentId, feedback, rating, videoUrl, imageUrls }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { studentId, feedback, rating, videoUrl, imageUrls, skillScores } = await req.json()

    if (!studentId) {
      return NextResponse.json({ success: false, error: 'studentId is required' }, { status: 400 })
    }

    const session = await Session.findById(params.id)
    if (!session) return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })

    const attendanceEntry = session.attendance.find(
      (a) => a.student.toString() === studentId
    )

    if (!attendanceEntry) {
      return NextResponse.json({ success: false, error: 'Student not in attendance list' }, { status: 404 })
    }

    if (feedback !== undefined) attendanceEntry.feedback = feedback
    if (rating !== undefined) attendanceEntry.rating = rating
    if (videoUrl !== undefined) attendanceEntry.videoUrl = videoUrl
    if (imageUrls !== undefined) attendanceEntry.imageUrls = imageUrls
    if (skillScores !== undefined) attendanceEntry.skillScores = skillScores

    await session.save()
    return NextResponse.json({ success: true, data: session })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save feedback' }, { status: 500 })
  }
}
