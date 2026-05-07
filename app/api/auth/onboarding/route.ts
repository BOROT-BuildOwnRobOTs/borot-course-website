import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Parent from '@/models/Parent'
import Teacher from '@/models/Teacher'
import Student from '@/models/Student'
import Branch from '@/models/Branch'
import bcrypt from 'bcryptjs'
import { bootstrapBranches } from '@/lib/bootstrapBranches'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/onboarding
 * Register a new parent (+ students) or teacher from Clerk-authenticated user.
 * Since Clerk handles auth, we generate a random password for DB compatibility.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    await bootstrapBranches()
    const body = await req.json()
    const { role, name, email, phone, specialization, students, branch } = body

    if (!role || !['teacher', 'parent'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเลือกบทบาท (Teacher หรือ Parent)' },
        { status: 400 }
      )
    }

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกชื่อและอีเมล' },
        { status: 400 }
      )
    }

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเลือกสาขา' },
        { status: 400 }
      )
    }

    const branchDoc = await Branch.findById(branch)
    if (!branchDoc || branchDoc.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'สาขานี้ยังไม่เปิดให้บริการ' },
        { status: 400 }
      )
    }

    const lowerEmail = email.toLowerCase().trim()

    // Generate a random password (Clerk handles real auth)
    const randomPassword = Math.random().toString(36).slice(-12) + 'Aa1!'
    const hashedPassword = await bcrypt.hash(randomPassword, 10)

    // ── Teacher Registration ──────────────────────────────────
    if (role === 'teacher') {
      const existingTeacher = await Teacher.findOne({ email: lowerEmail })
      if (existingTeacher) {
        return NextResponse.json(
          { success: false, error: 'อีเมลนี้มีบัญชีครูในระบบแล้ว' },
          { status: 409 }
        )
      }

      const teacher = await Teacher.create({
        name: name.trim(),
        email: lowerEmail,
        password: hashedPassword,
        phone: phone?.trim() || '',
        specialization: specialization?.trim() || '',
        branch: branchDoc._id,
      })

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

    // ── Parent Registration ───────────────────────────────────
    if (role === 'parent') {
      if (!students || !Array.isArray(students) || students.length === 0) {
        return NextResponse.json(
          { success: false, error: 'กรุณาเพิ่มข้อมูลนักเรียนอย่างน้อย 1 คน' },
          { status: 400 }
        )
      }

      const existingParent = await Parent.findOne({ email: lowerEmail })
      if (existingParent) {
        return NextResponse.json(
          { success: false, error: 'อีเมลนี้มีบัญชีผู้ปกครองในระบบแล้ว' },
          { status: 409 }
        )
      }

      const parent = await Parent.create({
        name: name.trim(),
        email: lowerEmail,
        password: hashedPassword,
        phone: phone?.trim() || '',
        branch: branchDoc._id,
      })

      // Create students — inherit parent's branch
      const createdStudents = []
      for (const s of students) {
        if (!s.name?.trim()) continue
        const student = await Student.create({
          name: s.name.trim(),
          nickname: s.nickname?.trim() || '',
          age: s.age ? Number(s.age) : undefined,
          parent: parent._id,
          branch: branchDoc._id,
          enrollments: [],
        })
        createdStudents.push(student)
      }

      return NextResponse.json({
        success: true,
        user: {
          _id: parent._id.toString(),
          role: 'parent',
          name: parent.name,
          email: parent.email,
          phone: parent.phone,
          students: createdStudents.map((s: any) => ({
            _id: s._id.toString(),
            name: s.name,
            nickname: s.nickname,
            age: s.age,
            enrollments: [],
          })),
        },
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid role' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
