import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'

export const dynamic = 'force-dynamic'

// POST /api/admin/debug-student/fix-reschedules?q=<name>&mode=<clear|resync>
//   mode=clear   → remove ALL reschedules from every enrollment of the matched student
//   mode=resync  → keep reschedules but set newSlot.day to the actual weekday of newDate
//
// Always run dry-run first by passing ?dry=1
function gregorianDayKey(d: Date): string {
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d.getDay()]
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const q = req.nextUrl.searchParams.get('q') ?? ''
    const mode = (req.nextUrl.searchParams.get('mode') ?? 'resync') as 'clear' | 'resync'
    const dry = req.nextUrl.searchParams.get('dry') === '1'

    if (!q) {
      return NextResponse.json({ success: false, error: 'pass ?q=<name>' }, { status: 400 })
    }

    const regex = new RegExp(q, 'i')
    const students = await Student.find({
      $or: [{ name: regex }, { nickname: regex }],
    })

    if (students.length === 0) {
      return NextResponse.json({ success: false, error: `no student matched ${q}` }, { status: 404 })
    }

    const report: any[] = []

    for (const student of students) {
      for (let i = 0; i < student.enrollments.length; i++) {
        const e = student.enrollments[i] as any
        const before = (e.reschedules ?? []).length
        const changes: any[] = []

        if (mode === 'clear') {
          if (before > 0) {
            changes.push({ action: 'clear', removed: before })
            if (!dry) e.reschedules = []
          }
        } else {
          for (const r of e.reschedules ?? []) {
            const actual = gregorianDayKey(new Date(r.newDate))
            const stored = r.newSlot?.day
            if (stored !== actual) {
              changes.push({
                originalDate: r.originalDate,
                newDate: r.newDate,
                from: stored,
                to: actual,
              })
              if (!dry) {
                if (r.newSlot) r.newSlot.day = actual
                else r.newSlot = { day: actual, time: e.slot?.time ?? '' }
              }
            }
          }
        }

        if (changes.length > 0) {
          report.push({
            studentId: String(student._id),
            studentName: student.name,
            courseName: e.courseName,
            mode,
            before,
            changes,
          })
        }
      }
      if (!dry) {
        student.markModified('enrollments')
        await student.save()
      }
    }

    return NextResponse.json({ success: true, dry, mode, report })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message ?? 'failed' },
      { status: 500 },
    )
  }
}
