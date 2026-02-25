import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import { SLOTS, MAX_PER_SLOT } from '@/lib/slots'

// GET /api/admin/slots
// Returns seat count per slot across ALL courses (shared classroom capacity)
// Optional ?courseId=xxx is accepted but ignored — slots are a global shared resource
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
    SLOTS.forEach((s) => { slotStudentSets[`${s.day}|${s.time}`] = new Set() })

    for (const student of students as any[]) {
      const studentId = (student._id as any).toString()
      for (const enrollment of student.enrollments) {
        if (!['active', 'pending'].includes(enrollment.status)) continue
        if (!enrollment.slot?.day || !enrollment.slot?.time) continue
        const key = `${enrollment.slot.day}|${enrollment.slot.time}`
        if (slotStudentSets[key] !== undefined) {
          slotStudentSets[key].add(studentId)
        }
      }
    }

    const result = SLOTS.map((s) => {
      const count = slotStudentSets[`${s.day}|${s.time}`]?.size ?? 0
      return {
        id: s.id,
        day: s.day,
        dayLabel: s.dayLabel,
        time: s.time,
        count,
        max: MAX_PER_SLOT,
        available: count < MAX_PER_SLOT,
      }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to fetch slot availability' }, { status: 500 })
  }
}
