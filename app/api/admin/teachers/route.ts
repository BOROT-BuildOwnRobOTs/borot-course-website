import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Teacher from '@/models/Teacher'
import bcrypt from 'bcryptjs'
import { bootstrapBranches } from '@/lib/bootstrapBranches'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    await bootstrapBranches()
    const branchId = req.nextUrl.searchParams.get('branch')
    const filter: Record<string, unknown> = {}
    if (branchId) filter.branch = branchId
    const teachers = await Teacher.find(filter)
      .sort({ createdAt: -1 })
      .select('-password')
      .populate('branch', 'name slug status')
    return NextResponse.json({ success: true, data: teachers })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch teachers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, email, password, phone, specialization, branch } = body

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email and password are required' }, { status: 400 })
    }

    const existing = await Teacher.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const teacher = await Teacher.create({
      name,
      email,
      password: hashedPassword,
      phone,
      specialization,
      branch: branch || null,
    })

    const teacherObj = teacher.toObject()
    delete teacherObj.password

    return NextResponse.json({ success: true, data: teacherObj }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create teacher' }, { status: 500 })
  }
}
