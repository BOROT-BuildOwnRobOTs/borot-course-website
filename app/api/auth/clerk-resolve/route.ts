import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Parent from '@/models/Parent'
import Teacher from '@/models/Teacher'
import Student from '@/models/Student'
import Course from '@/models/Course'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/clerk-resolve
 * Resolves the current Clerk user → Parent or Teacher in our DB
 * Uses the Clerk userId stored in the Parent/Teacher document
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'not_authenticated', message: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    await connectDB()

    // ── Try Teacher first ──────────────────────────────────────────
    const teacher = await Teacher.findOne({ userId })
    if (teacher) {
      return NextResponse.json({
        success: true,
        user: {
          _id: teacher._id.toString(),
          role: 'teacher',
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone,
          specialization: teacher.specialization,
        },
      })
    }

    // ── Try Parent ─────────────────────────────────────────────────
    const parent = await Parent.findOne({ userId })
    if (parent) {
      // Fetch children with enrollments (same logic as login API)
      const students = await Student.find({ parent: parent._id }).lean()

      const courseIds = [...new Set(
        students.flatMap((s: any) =>
          s.enrollments.map((e: any) => e.course?.toString()).filter(Boolean)
        )
      )]
      const courseDocs = courseIds.length > 0
        ? await Course.find({ _id: { $in: courseIds } }, 'durationWeeks').lean()
        : []
      const courseMap: Record<string, number> = {}
      ;(courseDocs as any[]).forEach((c: any) => {
        courseMap[c._id.toString()] = c.durationWeeks || 0
      })

      const enrichedStudents = students.map((s: any) => ({
        ...s,
        enrollments: s.enrollments.map((e: any) => ({
          ...e,
          courseDurationWeeks:
            e.courseDurationWeeks && e.courseDurationWeeks > 0
              ? e.courseDurationWeeks
              : courseMap[e.course?.toString()] || 0,
        })),
      }))

      return NextResponse.json({
        success: true,
        user: {
          _id: parent._id.toString(),
          role: 'parent',
          name: parent.name,
          email: parent.email,
          phone: parent.phone,
          students: enrichedStudents,
        },
      })
    }

    // ── Not linked ─────────────────────────────────────────────────
    return NextResponse.json({
      success: false,
      error: 'not_linked',
      message: 'บัญชี Clerk ยังไม่ได้ผูกกับข้อมูลในระบบ',
      clerkUserId: userId,
    })
  } catch (error) {
    console.error('Clerk resolve error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
