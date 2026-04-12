import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Teacher from '@/models/Teacher'
import Parent from '@/models/Parent'
import Student from '@/models/Student'
import Course from '@/models/Course'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/clerk-sync
 * Sync Clerk-authenticated user with our DB.
 * Looks up by email (no password needed — Clerk already authenticated the user).
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { email, selectRole, clerkId } = await req.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const lowerEmail = email.toLowerCase().trim()

    // ── Lookup both Teacher and Parent (by email OR clerkId) ───
    const teacher = await Teacher.findOne({
      $or: [{ email: lowerEmail }, ...(clerkId ? [{ clerkId }] : [])],
    })
    const parent = await Parent.findOne({
      $or: [{ email: lowerEmail }, ...(clerkId ? [{ clerkId }] : [])],
    })

    // ── Helper: build parent user payload ──────────────────────
    const buildParentPayload = async (p: any) => {
      const students = await Student.find({ parent: p._id }).lean()
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

      return {
        _id: p._id.toString(),
        role: 'parent' as const,
        name: p.name,
        email: p.email,
        phone: p.phone,
        students: enrichedStudents,
      }
    }

    const buildTeacherPayload = (t: any) => ({
      _id: t._id.toString(),
      role: 'teacher' as const,
      name: t.name,
      email: t.email,
      phone: t.phone,
      specialization: t.specialization,
    })

    // ── If selectRole is provided, user chose a specific role ──
    if (selectRole) {
      if (selectRole === 'teacher' && teacher) {
        return NextResponse.json({ success: true, user: buildTeacherPayload(teacher) })
      }
      if (selectRole === 'parent' && parent) {
        return NextResponse.json({ success: true, user: await buildParentPayload(parent) })
      }
    }

    // ── Both accounts exist — let user choose ──────────────────
    if (teacher && parent) {
      return NextResponse.json({
        success: true,
        multiple: true,
        accounts: [
          { role: 'teacher', name: teacher.name, email: teacher.email },
          { role: 'parent', name: parent.name, email: parent.email },
        ],
      })
    }

    // ── Single account found ───────────────────────────────────
    if (teacher) {
      return NextResponse.json({ success: true, user: buildTeacherPayload(teacher) })
    }

    if (parent) {
      return NextResponse.json({ success: true, user: await buildParentPayload(parent) })
    }

    // ── No account found — new user ───────────────────────────
    return NextResponse.json({ success: false, newUser: true, error: 'ไม่พบบัญชีนี้ในระบบ' }, { status: 404 })
  } catch (error) {
    console.error('Clerk sync error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 })
  }
}
