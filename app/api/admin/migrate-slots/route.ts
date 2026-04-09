import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import Session from '@/models/Session'

export const dynamic = 'force-dynamic'

/**
 * Migration: Map old slot times to nearest new slot times
 *
 * Old slots:       New slots (nearest match):
 * 10:00-12:00  →  10:00-11:00  (same start time)
 * 13:00-15:00  →  13:30-14:30  (closest, 30 min diff)
 * 15:30-17:30  →  15:00-16:00  (closest, 30 min diff)
 *
 * This updates:
 *  - Student.enrollments[].slot.time
 *  - Student.enrollments[].reschedules[].newSlot.time
 *  - Session.slot.time
 */

const SLOT_TIME_MAP: Record<string, string> = {
  '10:00-12:00': '10:00-11:00',
  '13:00-15:00': '13:30-14:30',
  '15:30-17:30': '15:00-16:00',
}

const OLD_SLOT_TIMES = Object.keys(SLOT_TIME_MAP)

// GET  → dry-run (preview what would change)
// POST → actually apply the migration
export async function GET() {
  try {
    await connectDB()

    const preview = {
      studentsEnrollmentSlots: [] as { studentId: string; name: string; enrollIdx: number; oldTime: string; newTime: string }[],
      studentsRescheduleSlots: [] as { studentId: string; name: string; enrollIdx: number; reschedIdx: number; oldTime: string; newTime: string }[],
      sessionSlots: [] as { sessionId: string; topic: string; oldTime: string; newTime: string }[],
    }

    // ── Students ──
    const students = await Student.find({}).lean()
    for (const s of students as any[]) {
      const sid = s._id.toString()
      for (let ei = 0; ei < (s.enrollments || []).length; ei++) {
        const enroll = s.enrollments[ei]
        // Check enrollment slot
        if (enroll.slot?.time && OLD_SLOT_TIMES.includes(enroll.slot.time)) {
          preview.studentsEnrollmentSlots.push({
            studentId: sid,
            name: s.name,
            enrollIdx: ei,
            oldTime: enroll.slot.time,
            newTime: SLOT_TIME_MAP[enroll.slot.time],
          })
        }
        // Check reschedules
        for (let ri = 0; ri < (enroll.reschedules || []).length; ri++) {
          const r = enroll.reschedules[ri]
          if (r.newSlot?.time && OLD_SLOT_TIMES.includes(r.newSlot.time)) {
            preview.studentsRescheduleSlots.push({
              studentId: sid,
              name: s.name,
              enrollIdx: ei,
              reschedIdx: ri,
              oldTime: r.newSlot.time,
              newTime: SLOT_TIME_MAP[r.newSlot.time],
            })
          }
        }
      }
    }

    // ── Sessions ──
    const sessions = await Session.find({}).lean()
    for (const sess of sessions as any[]) {
      if (sess.slot?.time && OLD_SLOT_TIMES.includes(sess.slot.time)) {
        preview.sessionSlots.push({
          sessionId: sess._id.toString(),
          topic: sess.topic,
          oldTime: sess.slot.time,
          newTime: SLOT_TIME_MAP[sess.slot.time],
        })
      }
    }

    const totalChanges =
      preview.studentsEnrollmentSlots.length +
      preview.studentsRescheduleSlots.length +
      preview.sessionSlots.length

    return NextResponse.json({
      success: true,
      message: `DRY RUN: Found ${totalChanges} slot(s) to migrate. POST to this endpoint to apply.`,
      mapping: SLOT_TIME_MAP,
      preview,
      totalChanges,
    })
  } catch (error) {
    console.error('Migration preview error:', error)
    return NextResponse.json({ success: false, error: 'Migration preview failed' }, { status: 500 })
  }
}

export async function POST() {
  try {
    await connectDB()

    const results = {
      studentsUpdated: 0,
      enrollmentSlotsUpdated: 0,
      rescheduleSlotsUpdated: 0,
      sessionsUpdated: 0,
    }

    // ── Migrate Student enrollment slots & reschedule slots ──
    const students = await Student.find({})
    for (const student of students) {
      let modified = false
      for (let ei = 0; ei < student.enrollments.length; ei++) {
        const enroll = student.enrollments[ei] as any
        // Update enrollment slot time
        if (enroll.slot?.time && OLD_SLOT_TIMES.includes(enroll.slot.time)) {
          enroll.slot.time = SLOT_TIME_MAP[enroll.slot.time]
          modified = true
          results.enrollmentSlotsUpdated++
        }
        // Update reschedule newSlot time
        if (enroll.reschedules) {
          for (let ri = 0; ri < enroll.reschedules.length; ri++) {
            const r = enroll.reschedules[ri] as any
            if (r.newSlot?.time && OLD_SLOT_TIMES.includes(r.newSlot.time)) {
              r.newSlot.time = SLOT_TIME_MAP[r.newSlot.time]
              modified = true
              results.rescheduleSlotsUpdated++
            }
          }
        }
      }
      if (modified) {
        student.markModified('enrollments')
        await student.save()
        results.studentsUpdated++
      }
    }

    // ── Migrate Session slots ──
    const sessions = await Session.find({})
    for (const session of sessions) {
      const slot = (session as any).slot
      if (slot?.time && OLD_SLOT_TIMES.includes(slot.time)) {
        slot.time = SLOT_TIME_MAP[slot.time]
        session.markModified('slot')
        await session.save()
        results.sessionsUpdated++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      mapping: SLOT_TIME_MAP,
      results,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ success: false, error: 'Migration failed' }, { status: 500 })
  }
}
