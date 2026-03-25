import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import { SLOTS, MAX_PER_SLOT, generateStampDates } from '@/lib/slots'

// Force dynamic — never cache this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/admin/slots
// Returns seat count per slot across ALL courses (shared classroom capacity)
// Also returns list of students (nickname, name, courseName) per slot for display
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Fetch ALL students who have at least one active/pending enrollment
    const students = await Student.find({
      enrollments: {
        $elemMatch: {
          status: { $in: ['active', 'pending'] },
        },
      },
    }).lean()

    // Count unique students per slot across ALL courses
    // Use a Set per slot to avoid double-counting a student who has
    // multiple enrollments in the same time slot (e.g. 2 courses)
    const slotStudentSets: Record<string, Set<string>> = {}
    // Also track each (student, course) enrollment per slot for display
    const slotStudentList: Record<string, { id: string; name: string; nickname: string; courseName: string; courseLevel: string }[]> = {}

    SLOTS.forEach((s) => {
      slotStudentSets[`${s.day}|${s.time}`] = new Set()
      slotStudentList[`${s.day}|${s.time}`] = []
    })

    const now = new Date()

    for (const student of students as any[]) {
      const studentId = (student._id as any).toString()
      for (const enrollment of student.enrollments) {
        if (!['active', 'pending'].includes(enrollment.status)) continue
        if (!enrollment.slot?.day || !enrollment.slot?.time) continue

        // Determine the effective slot for the next upcoming session,
        // taking reschedules into account.
        let effectiveSlot = { day: enrollment.slot.day, time: enrollment.slot.time }

        if (
          enrollment.reschedules &&
          enrollment.reschedules.length > 0 &&
          enrollment.startDate &&
          enrollment.courseDurationWeeks
        ) {
          // Generate all stamp dates for this enrollment
          const stamps = generateStampDates(
            enrollment.startDate,
            enrollment.courseDurationWeeks,
            enrollment.slot
          )

          // Find the next upcoming stamp date (>= today)
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const nextStamp = stamps.find((d: Date) => d >= todayStart)

          if (nextStamp) {
            // Check if this stamp date has been rescheduled
            const nextStampStr = nextStamp.toDateString()
            const reschedule = enrollment.reschedules.find(
              (r: any) => new Date(r.originalDate).toDateString() === nextStampStr
            )
            if (reschedule?.newSlot?.day && reschedule?.newSlot?.time) {
              effectiveSlot = { day: reschedule.newSlot.day, time: reschedule.newSlot.time }
            }
          } else {
            // All stamps are in the past — check if the last stamp was rescheduled
            // (enrollment may still be marked active but course is finished)
            // Just use the original slot in this case
          }
        }

        const key = `${effectiveSlot.day}|${effectiveSlot.time}`
        if (slotStudentSets[key] !== undefined) {
          slotStudentSets[key].add(studentId)
          slotStudentList[key].push({
            id: studentId,
            name: student.name || '',
            nickname: student.nickname || '',
            courseName: enrollment.courseName || '',
            courseLevel: enrollment.courseLevel || '',
          })
        }
      }
    }

    const result = SLOTS.map((s) => {
      const key = `${s.day}|${s.time}`
      const count = slotStudentSets[key]?.size ?? 0
      return {
        id: s.id,
        day: s.day,
        dayLabel: s.dayLabel,
        time: s.time,
        count,
        max: MAX_PER_SLOT,
        available: count < MAX_PER_SLOT,
        students: slotStudentList[key] || [],
      }
    })

    const response = NextResponse.json({ success: true, data: result })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    return response
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to fetch slot availability' }, { status: 500 })
  }
}
