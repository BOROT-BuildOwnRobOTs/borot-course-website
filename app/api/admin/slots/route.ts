import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import TrialRegistration from '@/models/TrialRegistration'
import { SLOTS, MAX_PER_SLOT, TRIAL_SLOTS, MAX_PER_TRIAL_SLOT, generateStampDates, isSameDay, isTwoHourTime, getConstituentSlotTimes } from '@/lib/slots'

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

    // ── Optional branch scope ──
    const branchParam = req.nextUrl.searchParams.get('branch')

    // Fetch students who have at least one active/pending enrollment, scoped
    // to a branch when requested.
    const studentFilter: Record<string, unknown> = {
      enrollments: {
        $elemMatch: {
          status: { $in: ['active', 'pending'] },
        },
      },
    }
    if (branchParam) studentFilter.branch = branchParam
    const students = await Student.find(studentFilter).lean()

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

        // For 2-hour slots, the enrollment counts toward BOTH constituent 1-hour slots
        const isTwoHr = isTwoHourTime(enrollment.slot.time)
        const constituentTimes = isTwoHr ? getConstituentSlotTimes(enrollment.slot.time) : [enrollment.slot.time]

        const originalSlotKeys = constituentTimes.map((t) => `${enrollment.slot.day}|${t}`)
        const primarySlotKey = `${enrollment.slot.day}|${enrollment.slot.time}`
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
          isTwoHour: isTwoHourTime(enrollment.slot.time),
        }

        // ── Handle ORIGINAL slot ──
        // For 2-hour slots, add the student to EACH constituent 1-hour slot key
        const originalDayDate = dayDates[enrollment.slot.day]

        // Determine if student should show on the original day date
        let showInOriginal = true

        if (hasStampInfo && stamps.length > 0 && originalDayDate) {
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

        if (showInOriginal && originalDayDate) {
          // Add to EACH constituent slot (for 2-hr: both 1-hr slots; for 1-hr: just one)
          for (const key of originalSlotKeys) {
            if (slotStudentSets[key] !== undefined) {
              const alreadyListed = slotStudentSets[key].has(studentId)
              slotStudentSets[key].add(studentId)
              if (!alreadyListed) {
                slotStudentList[key].push(studentInfo)
              }
            }
          }
        }

        // ── Handle RESCHEDULED-IN to different slots ──
        // Check if any reschedule moves this student INTO a different slot on that slot's date
        for (const reschedule of reschedules) {
          if (!reschedule.newSlot?.day || !reschedule.newSlot?.time) continue
          const reschedConstituent = isTwoHourTime(reschedule.newSlot.time)
            ? getConstituentSlotTimes(reschedule.newSlot.time)
            : [reschedule.newSlot.time]
          const reschedSlotKeys = reschedConstituent.map((t) => `${reschedule.newSlot.day}|${t}`)

          const newSlotDayDate = dayDates[reschedule.newSlot.day]
          if (!newSlotDayDate) continue

          // Check if the reschedule's newDate matches this slot's target date
          if (isSameDay(new Date(reschedule.newDate), newSlotDayDate)) {
            // Add to ALL constituent slots. Set deduplication prevents double-counting
            // when original slot and reschedule-in both target the same 1-hr slot.
            // Use the reschedule's isTwoHour flag in the student info.
            const reschedStudentInfo = {
              ...studentInfo,
              isTwoHour: isTwoHourTime(reschedule.newSlot.time),
            }
            for (const key of reschedSlotKeys) {
              if (slotStudentSets[key] !== undefined) {
                const alreadyListed = slotStudentSets[key].has(studentId)
                slotStudentSets[key].add(studentId)
                if (!alreadyListed) {
                  slotStudentList[key].push(reschedStudentInfo)
                }
              }
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
    if (branchParam) {
      trialFilter.branch = branchParam
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
