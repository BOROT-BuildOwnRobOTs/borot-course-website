import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'

export const dynamic = 'force-dynamic'

// GET /api/parent/portfolio?studentId=...
// Aggregates all session media, feedback, and metadata for portfolio generation
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ success: false, error: 'studentId is required' }, { status: 400 })
    }

    const sessions = await Session.find({
      'attendance.student': studentId,
    })
      .sort({ scheduledAt: 1 })
      .lean()

    // Aggregate portfolio data from sessions
    const projects: Array<{
      courseId: string
      courseName: string
      topic: string
      date: string
      imageUrls: string[]
      videoUrl: string | null
      artworkImageUrl: string | null
      artworkName: string | null
      artworkDescription: string | null
      feedback: string | null
      rating: number | null
      attendedHours: number
    }> = []

    let totalSessions = 0
    let attendedSessions = 0
    let totalImages = 0
    let totalVideos = 0
    let totalArtworks = 0
    let totalHours = 0
    const allSkills = new Set<string>()
    const courseNames = new Set<string>()

    for (const session of sessions) {
      const attendance = (session.attendance as any[]).find(
        (a) => a.student?.toString() === studentId
      )
      if (!attendance) continue

      totalSessions++
      if (attendance.checkedIn) attendedSessions++

      const imageUrls: string[] = attendance.imageUrls || []
      const videoUrl: string | null = attendance.videoUrl || null
      const artworkImageUrl: string | null = attendance.artworkImageUrl || null

      if (imageUrls.length > 0) totalImages += imageUrls.length
      if (videoUrl) totalVideos++
      if (artworkImageUrl) totalArtworks++
      if (attendance.attendedHours) totalHours += attendance.attendedHours

      // Collect skills/topics as tags
      if (session.topic) {
        allSkills.add(session.topic)
      }
      courseNames.add(session.courseName)

      projects.push({
        courseId: session.course?.toString() || '',
        courseName: session.courseName,
        topic: session.topic,
        date: (session.scheduledAt as Date).toISOString(),
        imageUrls,
        videoUrl,
        artworkImageUrl,
        artworkName: attendance.artworkName || null,
        artworkDescription: attendance.artworkDescription || null,
        feedback: attendance.feedback || null,
        rating: attendance.rating || null,
        attendedHours: attendance.attendedHours || 0,
      })
    }

    // Group projects by course
    const coursesMap = new Map<string, {
      courseId: string
      courseName: string
      projects: typeof projects
      sessionCount: number
      attendedCount: number
      totalHours: number
      totalImages: number
      totalVideos: number
      totalArtworks: number
    }>()

    for (const p of projects) {
      const existing = coursesMap.get(p.courseId)
      if (existing) {
        existing.projects.push(p)
        existing.sessionCount++
        if (p.rating || p.feedback || p.imageUrls.length > 0) existing.attendedCount++
        existing.totalHours += p.attendedHours
        existing.totalImages += p.imageUrls.length
        if (p.videoUrl) existing.totalVideos++
        if (p.artworkImageUrl) existing.totalArtworks++
      } else {
        coursesMap.set(p.courseId, {
          courseId: p.courseId,
          courseName: p.courseName,
          projects: [p],
          sessionCount: 1,
          attendedCount: (p.rating || p.feedback || p.imageUrls.length > 0) ? 1 : 0,
          totalHours: p.attendedHours,
          totalImages: p.imageUrls.length,
          totalVideos: p.videoUrl ? 1 : 0,
          totalArtworks: p.artworkImageUrl ? 1 : 0,
        })
      }
    }

    const courses = Array.from(coursesMap.values())

    return NextResponse.json({
      success: true,
      data: {
        studentId,
        summary: {
          totalSessions,
          attendedSessions,
          totalImages,
          totalVideos,
          totalArtworks,
          totalHours,
          courseCount: courseNames.size,
          skills: Array.from(allSkills),
          courses: Array.from(courseNames),
        },
        courses,
        projects,
      },
    })
  } catch (error) {
    console.error('[portfolio] Failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio data' },
      { status: 500 }
    )
  }
}