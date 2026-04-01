import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

// Force dynamic — never cache this route on Vercel
export const dynamic = 'force-dynamic'
export const revalidate = 0
import Session from '@/models/Session'
import Student from '@/models/Student'
import Teacher from '@/models/Teacher'
import { generateStampDates, isSameDay, SLOTS } from '@/lib/slots'

// GET /api/admin/feedback
// Returns teacher → student → enrollment structure with full schedule stamps
export async function GET() {
  try {
    await connectDB()

    // 1. Fetch all data in parallel
    const [allTeachers, allStudents, allSessions] = await Promise.all([
      Teacher.find({}, { name: 1 }).lean(),
      Student.find({}).lean(),
      Session.find({}).sort({ scheduledAt: -1 }).lean(),
    ])

    const now = new Date()

    // Build teacher name map
    const teacherNameMap = new Map<string, string>()
    for (const t of allTeachers as any[]) {
      teacherNameMap.set(t._id.toString(), t.name)
    }

    // Build session lookup: courseId → sessions[]
    const sessionsByCourse = new Map<string, any[]>()
    for (const s of allSessions as any[]) {
      const courseId = s.course?.toString() || ''
      if (!sessionsByCourse.has(courseId)) sessionsByCourse.set(courseId, [])
      sessionsByCourse.get(courseId)!.push(s)
    }

    // 2. Group students by teacher
    const teacherMap = new Map<string, {
      teacherId: string
      teacherName: string
      students: any[]
    }>()

    for (const student of allStudents as any[]) {
      const studentEnrollments = student.enrollments || []
      for (let enrollIdx = 0; enrollIdx < studentEnrollments.length; enrollIdx++) {
        const enrollment = studentEnrollments[enrollIdx]
        const teacherId = enrollment.teacher?.toString()
        if (!teacherId) continue

        const teacherName = teacherNameMap.get(teacherId) || 'Unknown'

        if (!teacherMap.has(teacherId)) {
          teacherMap.set(teacherId, {
            teacherId,
            teacherName,
            students: [],
          })
        }

        const courseId = enrollment.course?.toString() || ''
        const courseSessions = sessionsByCourse.get(courseId) || []
        const durationWeeks = enrollment.courseDurationWeeks || 0
        const slot = enrollment.slot

        // Generate all planned stamp dates
        const stampDates = (enrollment.startDate && slot && durationWeeks > 0)
          ? generateStampDates(enrollment.startDate, durationWeeks, slot)
          : []

        // Build stamps - track used sessions to prevent duplicates
        // Only non-rescheduled (original date) stamps exclusively claim a session.
        // Rescheduled stamps may share a session when multiple stamps are moved
        // to the same date (e.g. make-up double class on the same day).
        const usedByOriginalStamps = new Set<string>()
        const stamps = stampDates.map((stampDate, idx) => {
          // Check for reschedule
          const reschedule = (enrollment.reschedules || []).find(
            (r: any) => isSameDay(new Date(r.originalDate), stampDate)
          )
          const actualDate = reschedule ? new Date(reschedule.newDate) : stampDate

          // For rescheduled stamps, ONLY match on the actualDate (new date).
          // For non-rescheduled stamps, match on the original stampDate.
          // This prevents a rescheduled stamp from "stealing" a session that
          // belongs to another stamp whose original date coincides.
          //
          // Sessions claimed by non-rescheduled stamps are exclusive — no other
          // stamp may reuse them.  Rescheduled stamps do NOT exclusively claim
          // sessions, so multiple rescheduled stamps on the same actual date can
          // share a single session record.
          const targetDate = reschedule ? actualDate : stampDate
          const session = courseSessions.find((s: any) => {
            const sid = s._id?.toString()
            if (sid && usedByOriginalStamps.has(sid)) return false
            const sessionDate = new Date(s.scheduledAt)
            if (!isSameDay(sessionDate, targetDate)) return false
            return (s.attendance || []).some((a: any) => a.student?.toString() === student._id.toString())
          })

          // Only non-rescheduled stamps exclusively claim the session
          if (session?._id && !reschedule) {
            usedByOriginalStamps.add(session._id.toString())
          }

          const attendance = session?.attendance?.find(
            (a: any) => a.student?.toString() === student._id.toString()
          )

          const isToday = isSameDay(actualDate, now)
          const isPast = actualDate < now && !isToday

          return {
            stampNumber: idx + 1,
            date: actualDate.toISOString(),
            originalDate: stampDate.toISOString(),
            isToday,
            isPast,
            isRescheduled: !!reschedule,
            isCheckedIn: !!attendance?.checkedIn,
            hasFeedback: !!(attendance?.feedback && attendance.feedback.trim()),
            hasRating: !!(attendance?.rating && attendance.rating > 0),
            hasVideo: !!(attendance?.videoUrl && attendance.videoUrl.trim()),
            hasImages: !!(attendance?.imageUrls && attendance.imageUrls.length > 0),
            feedback: attendance?.feedback || '',
            rating: attendance?.rating || 0,
            videoUrl: attendance?.videoUrl || '',
            imageUrls: attendance?.imageUrls || [],
            sessionId: session?._id?.toString() || '',
            sessionTopic: session?.topic || '',
          }
        })

        // Find or create student entry in teacher's students list
        const teacherEntry = teacherMap.get(teacherId)!
        let studentEntry = teacherEntry.students.find(
          (s: any) => s.studentId === student._id.toString()
        )
        if (!studentEntry) {
          studentEntry = {
            studentId: student._id.toString(),
            studentName: student.name || '',
            studentNickname: student.nickname || '',
            age: student.age || null,
            enrollments: [],
          }
          teacherEntry.students.push(studentEntry)
        }

        const slotInfo = slot
          ? SLOTS.find((s) => s.day === slot.day && s.time === slot.time)
          : null

        studentEntry.enrollments.push({
          enrollmentIndex: enrollIdx,
          courseId,
          courseName: enrollment.courseName || '',
          status: enrollment.status || 'pending',
          slot: slot || null,
          slotLabel: slotInfo ? `${slotInfo.dayLabel} ${slotInfo.time}` : '',
          startDate: enrollment.startDate ? new Date(enrollment.startDate).toISOString() : null,
          courseDurationWeeks: durationWeeks,
          totalStamps: stamps.length,
          checkedInCount: stamps.filter((s) => s.isCheckedIn).length,
          feedbackCount: stamps.filter((s) => s.isCheckedIn && (s.hasFeedback || s.hasRating)).length,
          videoCount: stamps.filter((s) => s.hasVideo).length,
          stamps,
        })
      }
    }

    // 3. Convert to array and add summary stats
    const data = Array.from(teacherMap.values()).map((teacher) => {
      let totalStamps = 0
      let totalCheckedIn = 0
      let totalFeedback = 0
      let totalVideo = 0

      for (const student of teacher.students) {
        for (const enrollment of student.enrollments) {
          totalStamps += enrollment.totalStamps
          totalCheckedIn += enrollment.checkedInCount
          totalFeedback += enrollment.feedbackCount
          totalVideo += enrollment.videoCount
        }
      }

      const incompleteSessions = teacher.students.reduce((count: number, student: any) => {
        return count + student.enrollments.reduce((c: number, e: any) => {
          const pastCheckedIn = e.stamps.filter((s: any) => s.isPast && s.isCheckedIn)
          const pastWithFeedback = pastCheckedIn.filter((s: any) => s.hasFeedback || s.hasRating)
          return c + (pastCheckedIn.length > 0 && pastWithFeedback.length < pastCheckedIn.length ? 1 : 0)
        }, 0)
      }, 0)

      return {
        ...teacher,
        totalStamps,
        totalCheckedIn,
        totalFeedback,
        totalVideo,
        incompleteSessions,
        // Sort students by name
        students: teacher.students.sort((a: any, b: any) => a.studentName.localeCompare(b.studentName)),
      }
    }).sort((a, b) => {
      // Teachers with most incomplete first
      if (b.incompleteSessions !== a.incompleteSessions) return b.incompleteSessions - a.incompleteSessions
      return a.teacherName.localeCompare(b.teacherName)
    })

    const response = NextResponse.json({ success: true, data })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('CDN-Cache-Control', 'no-store')
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store')
    return response
  } catch (error) {
    console.error('Admin feedback API error:', error)
    const errorResponse = NextResponse.json({ success: false, error: 'Failed to fetch feedback overview' }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return errorResponse
  }
}
