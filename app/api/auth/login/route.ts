import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Teacher from '@/models/Teacher'
import Parent from '@/models/Parent'
import Student from '@/models/Student'
import Course from '@/models/Course'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'กรุณากรอก email และ password' }, { status: 400 })
    }

    const lowerEmail = email.toLowerCase().trim()

    // ── ลองหาใน Teacher ก่อน ──────────────────────────────────────
    const teacher = await Teacher.findOne({ email: lowerEmail })
    if (teacher) {
      const match = await bcrypt.compare(password, teacher.password)
      if (!match) {
        return NextResponse.json({ success: false, error: 'Email หรือ Password ไม่ถูกต้อง' }, { status: 401 })
      }
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

    // ── ลองหาใน Parent ────────────────────────────────────────────
    const parent = await Parent.findOne({ email: lowerEmail })
    if (parent) {
      const match = await bcrypt.compare(password, parent.password)
      if (!match) {
        return NextResponse.json({ success: false, error: 'Email หรือ Password ไม่ถูกต้อง' }, { status: 401 })
      }

      // ดึงข้อมูลลูกๆ พร้อม enrollments
      const students = await Student.find({ parent: parent._id }).lean()

      // Enrich courseDurationWeeks from Course document (in case enrollment stored 0)
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
        user: {
          _id: parent._id,
          role: 'parent',
          name: parent.name,
          email: parent.email,
          phone: parent.phone,
          students: enrichedStudents,
        },
      })
    }

    return NextResponse.json({ success: false, error: 'ไม่พบบัญชีนี้ในระบบ' }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 })
  }
}
