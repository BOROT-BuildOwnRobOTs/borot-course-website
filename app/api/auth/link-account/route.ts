import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Teacher from '@/models/Teacher'
import Parent from '@/models/Parent'
import Student from '@/models/Student'
import Course from '@/models/Course'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/link-account
 * Legacy login (email + password) → then link clerkId to the DB record.
 * Used when a Clerk-authenticated user has an existing DB account with a different email.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { legacyEmail, password, clerkId } = await req.json()

    if (!legacyEmail || !password) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอก Email และ Password' },
        { status: 400 }
      )
    }

    const lowerEmail = legacyEmail.toLowerCase().trim()

    // ── Try Teacher first ──────────────────────────────────────
    const teacher = await Teacher.findOne({ email: lowerEmail })
    if (teacher) {
      const match = await bcrypt.compare(password, teacher.password)
      if (!match) {
        return NextResponse.json(
          { success: false, error: 'Email หรือ Password ไม่ถูกต้อง' },
          { status: 401 }
        )
      }

      // Link clerkId if provided
      if (clerkId && !teacher.clerkId) {
        teacher.clerkId = clerkId
        await teacher.save()
      }

      return NextResponse.json({
        success: true,
        linked: !!clerkId,
        user: {
          _id: teacher._id.toString(),
          role: 'teacher' as const,
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone,
          specialization: teacher.specialization,
        },
      })
    }

    // ── Try Parent ─────────────────────────────────────────────
    const parent = await Parent.findOne({ email: lowerEmail })
    if (parent) {
      const match = await bcrypt.compare(password, parent.password)
      if (!match) {
        return NextResponse.json(
          { success: false, error: 'Email หรือ Password ไม่ถูกต้อง' },
          { status: 401 }
        )
      }

      // Link clerkId if provided
      if (clerkId && !parent.clerkId) {
        parent.clerkId = clerkId
        await parent.save()
      }

      // Fetch students with enriched enrollments
      const students = await Student.find({ parent: parent._id }).lean()
      const courseIds = [...new Set(
        students.flatMap((s: any) => s.enrollments.map((e: any) => e.course?.toString()).filter(Boolean))
      )]
      const courseDocs = courseIds.length > 0
        ? await Course.find({ _id: { $in: courseIds } }, 'durationWeeks').lean()
        : []
      const courseMap: Record<string, number> = {}
      ;(courseDocs as any[]).forEach((c: any) => { courseMap[c._id.toString()] = c.durationWeeks || 0 })

      const enrichedStudents = students.map((s: any) => ({
        ...s,
        enrollments: s.enrollments.map((e: any) => ({
          ...e,
          courseDurationWeeks: (e.courseDurationWeeks && e.courseDurationWeeks > 0)
            ? e.courseDurationWeeks
            : courseMap[e.course?.toString()] || 0,
        })),
      }))

      return NextResponse.json({
        success: true,
        linked: !!clerkId,
        user: {
          _id: parent._id.toString(),
          role: 'parent' as const,
          name: parent.name,
          email: parent.email,
          phone: parent.phone,
          students: enrichedStudents,
        },
      })
    }

    // ── Not found ──────────────────────────────────────────────
    return NextResponse.json(
      { success: false, error: 'ไม่พบบัญชีนี้ในระบบ กรุณาตรวจสอบ Email อีกครั้ง' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Link account error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
