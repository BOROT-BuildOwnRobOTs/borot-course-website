import connectDB from './mongodb'
import Student from '@/models/Student'
import Session from '@/models/Session'
import Course from '@/models/Course'
import { generateStampDates, isSameDay } from './slots'
import { optimizeMediaUrl } from './portfolio-types'
import type { PortfolioData, PortfolioSession, PortfolioCourse } from './portfolio-types'

// Re-export client-safe types & helpers so existing callers don't have to
// switch their import path.
export type {
  PortfolioData, PortfolioSession, PortfolioCourse,
  PortfolioWork, PortfolioComment,
} from './portfolio-types'
export {
  flattenWorks, flattenComments, listCourseNames, optimizeMediaUrl,
} from './portfolio-types'

/**
 * Build the full portfolio for a single student.
 * Pulls every enrollment + every session attendance and groups by course.
 * Caller is responsible for authorization — this function does no access checks.
 */
export async function buildPortfolio(studentId: string): Promise<PortfolioData | null> {
  await connectDB()

  const student = await Student.findById(studentId).lean<any>()
  if (!student) return null

  // Pull all sessions where this student appears
  const sessions = await Session.find({
    'attendance.student': studentId,
  })
    .sort({ scheduledAt: 1 })
    .lean<any[]>()

  // Enrich any missing course duration/hours from Course collection
  const courseIds = [
    ...new Set(
      (student.enrollments || [])
        .map((e: any) => e.course?.toString())
        .filter(Boolean) as string[]
    ),
  ]
  const courseDocs =
    courseIds.length > 0
      ? await Course.find({ _id: { $in: courseIds } }, 'durationWeeks hours').lean<any[]>()
      : []
  const courseMap: Record<string, { durationWeeks: number; hours: number }> = {}
  ;(courseDocs as any[]).forEach((c: any) => {
    courseMap[c._id.toString()] = { durationWeeks: c.durationWeeks || 0, hours: c.hours || 0 }
  })

  let totalSessionsAll = 0
  let attendedAll = 0
  let attendedHoursAll = 0
  let photoCount = 0
  let videoCount = 0
  let artworkCount = 0
  let completedCourses = 0

  const courses: PortfolioCourse[] = (student.enrollments || []).map((enroll: any) => {
    const courseIdStr = enroll.course?.toString() ?? ''
    const totalWeeks =
      enroll.courseDurationWeeks && enroll.courseDurationWeeks > 0
        ? enroll.courseDurationWeeks
        : courseMap[courseIdStr]?.durationWeeks || 0
    const totalHours =
      enroll.courseHours && enroll.courseHours > 0
        ? enroll.courseHours
        : courseMap[courseIdStr]?.hours || 0

    const stamps =
      enroll.startDate && enroll.slot && totalWeeks > 0
        ? generateStampDates(enroll.startDate, totalWeeks, enroll.slot)
        : []

    let courseAttendedHours = 0
    let courseAttendedSessions = 0

    const portfolioSessions: PortfolioSession[] = stamps.map((stampDate, idx) => {
      const reschedule = enroll.reschedules?.find((r: any) =>
        isSameDay(new Date(r.originalDate), stampDate)
      )
      const actualDate = reschedule ? new Date(reschedule.newDate) : stampDate

      const session = sessions.find((s: any) => {
        if (s.course?.toString() !== courseIdStr) return false
        const sd = new Date(s.scheduledAt)
        if (!isSameDay(sd, actualDate)) return false
        return s.attendance?.some(
          (a: any) => a.student?.toString() === studentId
        )
      })

      const att = session?.attendance?.find(
        (a: any) => a.student?.toString() === studentId
      )

      const checkedIn = att?.checkedIn === true
      const attendedHours = att?.attendedHours ?? 0
      if (checkedIn) {
        courseAttendedSessions++
        courseAttendedHours += attendedHours
      }

      const imageUrls: string[] = (att?.imageUrls ?? []).map(optimizeMediaUrl)
      const videoUrl: string = optimizeMediaUrl(att?.videoUrl ?? '')
      const artworkImage = optimizeMediaUrl(att?.artworkImageUrl ?? '')
      const artworkName = att?.artworkName ?? ''
      const artworkDescription = att?.artworkDescription ?? ''

      photoCount += imageUrls.length
      if (videoUrl) videoCount++
      if (artworkImage || artworkName) artworkCount++

      return {
        weekNumber: idx + 1,
        scheduledDate: stampDate.toISOString(),
        actualDate: actualDate.toISOString(),
        rescheduled: !!reschedule,
        topic: session?.topic ?? '',
        teacherName: session?.teacherName ?? enroll.teacherName ?? '',
        checkedIn,
        attendedHours,
        rating: att?.rating ?? null,
        feedback: att?.feedback ?? '',
        imageUrls,
        videoUrl,
        artwork:
          artworkImage || artworkName || artworkDescription
            ? {
                name: artworkName,
                description: artworkDescription,
                imageUrl: artworkImage,
              }
            : null,
      }
    })

    // A completed course counts as fully attended even if the teacher never
    // tapped check-in for every session — the hours were delivered.
    const isCompleted = enroll.status === 'completed'
    const effectiveAttendedHours =
      isCompleted && totalHours > 0 ? totalHours : courseAttendedHours

    totalSessionsAll += stamps.length
    attendedAll += courseAttendedSessions
    attendedHoursAll += effectiveAttendedHours
    if (enroll.status === 'completed') completedCourses++

    return {
      courseId: courseIdStr,
      courseName: enroll.courseName || 'Untitled Course',
      courseLevel: enroll.courseLevel || '',
      status: enroll.status || 'pending',
      startDate: enroll.startDate ? new Date(enroll.startDate).toISOString() : null,
      totalWeeks,
      totalHours,
      attendedHours: effectiveAttendedHours,
      attendedSessions: courseAttendedSessions,
      sessions: portfolioSessions,
    }
  })

  return {
    student: {
      _id: student._id.toString(),
      name: student.name || '',
      nickname: student.nickname || '',
      age: student.age ?? null,
    },
    stats: {
      totalCourses: courses.length,
      completedCourses,
      totalSessions: totalSessionsAll,
      attendedSessions: attendedAll,
      totalAttendedHours: attendedHoursAll,
      photoCount,
      videoCount,
      artworkCount,
    },
    courses,
    assessment: student.portfolioAssessment?.data ?? null,
    generatedAt: new Date().toISOString(),
  }
}

/** Generate a 32-char URL-safe random token. */
export function generateShareToken(): string {
  const bytes = new Uint8Array(24)
  if (typeof globalThis.crypto !== 'undefined') {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return Buffer.from(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}
