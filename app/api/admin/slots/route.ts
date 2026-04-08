import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import TrialRegistration from '@/models/TrialRegistration'
import { SLOTS, MAX_PER_SLOT, TRIAL_SLOTS, MAX_PER_TRIAL_SLOT, generateStampDates, isSameDay } from '@/lib/slots'

// Force dynamic — never cache this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Get the next upcoming date for a given day of the week.
 * If today IS that day, return today. Otherwise return the next occurrence.
 * This must match the frontend logic so dates are in sync.
 */
function getUpcomingDateForDay(day: string, weekOffset = 0): Date {
  const dayMap: Record<string, number> = {
    tuesday: 2,
    friday: 5,
    saturday: 6,
    sunday: 0,
  }
  const target = dayMap[day] ?? 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const current = today.getDay()
  const diff = (target - current + 7) % 7
  const result = new Date(today)
  result.setDate(today.getDate() + diff + weekOffset * 7)
  return result
}

// GET /api/admin/slots
// Returns seat count per slot across ALL courses (shared classroom capacity)
// Also returns list of students (nickname, name, courseName) per slot for display
// Now date-aware: computes the specific date for each day and correctly handles reschedules
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

    // ── Read weekOffset from query params (0 = this week, 1 = next week, etc.) ──
    const weekOffsetParam = req.nextUrl.searchParams.get('weekOffset')
    const weekOffset = weekOffsetParam ? parseInt(weekOffsetParam, 10) || 0 : 0

    // ── Compute target dates for each day ──
    // These dates must match the frontend display
    const dayDates: Record<string, Date> = {
      tuesday: getUpcomingDateForDay('tuesday', weekOffset),
      friday: getUpcomingDateForDay('friday', weekOffset),
      saturday: getUpcomingDateForDay('saturday', weekOffset),
      sunday: getUpcomingDateForDay('sunday', weekOffset),
    }

    // Count unique students per slot across ALL courses
    const slotStudentSets: Record<string, Set<string>> = {}
    const slotStudentList: Record<string, { id: string; name: string; nickname: string; courseName: string; courseLevel: string }[]> = {}

    SLOTS.forEach((s) => {
      slotStudentSets[`${s.day}|${s.time}`] = new Set()
      slotStudentList[`${s.day}|${s.time}`] = []
    })

    for (const student of students as any[]) {
      const studentId = (student._id as any).toString()

      for (const enrollment of student.enrollments) {
        if (!['active', 'pending'].includes(enrollment.status)) continue
        if (!enrollment.slot?.day || !enrollment.slot?.time) continue

        const originalSlotKey = `${enrollment.slot.day}|${enrollment.slot.time}`
        const hasStampInfo = enrollment.startDate && enrollment.courseDurationWeeks
        const reschedules: any[] = enrollment.reschedules || []

        // Generate stamps if possible
        const stamps: Date[] = hasStampInfo
          ? generateStampDates(enrollment.startDate, enrollment.courseDurationWeeks, enrollment.slot)
          : []

        const studentInfo = {
          id: studentId,
          name: student.name || '',
          nickname: student.nickname || '',
          courseName: enrollment.courseName || '',
          courseLevel: enrollment.courseLevel || '',
        }

        // ── Handle ORIGINAL slot ──
        // Check if the student should appear in their original slot on that day's date
        const originalDayDate = dayDates[enrollment.slot.day]
        if (originalDayDate && slotStudentSets[originalSlotKey] !== undefined) {
          let showInOriginal = true

          if (hasStampInfo && stamps.length > 0) {
            // Check if there's a stamp on the original slot's specific date
            const hasStampOnDate = stamps.some((d: Date) => isSameDay(d, originalDayDate))
            if (!hasStampOnDate) {
              showInOriginal = false
            }

            // Check if rescheduled OUT from this date
            if (showInOriginal && reschedules.length > 0) {
              const rescheduledOut = reschedules.some(
                (r: any) => isSameDay(new Date(r.originalDate), originalDayDate)
              )
              if (rescheduledOut) {
                showInOriginal = false
              }
            }

            // Check if rescheduled IN to the SAME slot on this date
            // (e.g. rescheduled from Sat Apr 4 → Sat Apr 11, same time slot)
            if (!showInOriginal && reschedules.length > 0) {
              const rescheduledInSameSlot = reschedules.some(
                (r: any) =>
                  r.newSlot?.day === enrollment.slot.day &&
                  r.newSlot?.time === enrollment.slot.time &&
                  isSameDay(new Date(r.newDate), originalDayDate)
              )
              if (rescheduledInSameSlot) {
                showInOriginal = true
              }
            }
          }
          // If no stamp info (legacy enrollment), show by default

          if (showInOriginal) {
            slotStudentSets[originalSlotKey].add(studentId)
            slotStudentList[originalSlotKey].push(studentInfo)
          }
        }

        // ── Handle RESCHEDULED-IN to different slots ──
        // Check if any reschedule moves this student INTO a different slot on that slot's date
        for (const reschedule of reschedules) {
          if (!reschedule.newSlot?.day || !reschedule.newSlot?.time) continue
          const newSlotKey = `${reschedule.newSlot.day}|${reschedule.newSlot.time}`

          // Skip if it's the same as original slot (handled above)
          if (newSlotKey === originalSlotKey) continue

          const newSlotDayDate = dayDates[reschedule.newSlot.day]
          if (!newSlotDayDate) continue

          // Check if the reschedule's newDate matches this slot's target date
          if (isSameDay(new Date(reschedule.newDate), newSlotDayDate)) {
            if (slotStudentSets[newSlotKey] !== undefined) {
              slotStudentSets[newSlotKey].add(studentId)
              slotStudentList[newSlotKey].push(studentInfo)
            }
          }
        }
      }
    }

    const result = SLOTS.map((s) => {
      const key = `${s.day}|${s.time}`
      const count = slotStudentSets[key]?.size ?? 0
      const targetDate = dayDates[s.day]
      return {
        id: s.id,
        day: s.day,
        dayLabel: s.dayLabel,
        time: s.time,
        count,
        max: MAX_PER_SLOT,
        available: count < MAX_PER_SLOT,
        students: slotStudentList[key] || [],
        // Include the target date so frontend can verify sync
        // Use local date components instead of toISOString() to avoid UTC timezone shift
        targetDate: targetDate
          ? `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`
          : null,
      }
    })

    // Build trial slot data from actual registrations in DB
    // If a `trialDate` query param is provided, filter by that date only
    const trialDateParam = req.nextUrl.searchParams.get('trialDate') // YYYY-MM-DD
    const trialFilter: Record<string, unknown> = {
      status: { $in: ['pending', 'confirmed'] },
    }
    if (trialDateParam) {
      trialFilter.trialDate = trialDateParam
    }

    const trialRegs = await TrialRegistration.find(trialFilter)
      .select('slotId studentName age trialDate')
      .lean()

    // Group registrations by slotId
    const trialSlotStudents: Record<string, { studentName: string; age: number }[]> = {}
    for (const r of trialRegs as any[]) {
      const sid = r.slotId as string
      if (!trialSlotStudents[sid]) trialSlotStudents[sid] = []
      trialSlotStudents[sid].push({ studentName: r.studentName, age: r.age })
    }

    const trialSlots = TRIAL_SLOTS.map((ts) => {
      const students = trialSlotStudents[ts.id] || []
      return {
        id: ts.id,
        time: ts.time,
        count: students.length,
        max: MAX_PER_TRIAL_SLOT,
        available: students.length < MAX_PER_TRIAL_SLOT,
        students,
      }
    })

    const response = NextResponse.json({ success: true, data: result, trialSlots })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    return response
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to fetch slot availability' }, { status: 500 })
  }
}
