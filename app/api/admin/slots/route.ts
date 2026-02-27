import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import { SLOTS, MAX_PER_SLOT } from '@/lib/slots'

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

    for (const student of students as any[]) {
      const studentId = (student._id as any).toString()
      for (const enrollment of student.enrollments) {
        if (!['active', 'pending'].includes(enrollment.status)) continue
        if (!enrollment.slot?.day || !enrollment.slot?.time) continue
        const key = `${enrollment.slot.day}|${enrollment.slot.time}`
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

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to fetch slot availability' }, { status: 500 })
  }
}
