import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Teacher from '@/models/Teacher'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    const teachers = await Teacher.find({}).sort({ createdAt: -1 }).select('-password')
    return NextResponse.json({ success: true, data: teachers })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch teachers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, email, password, phone, specialization } = body

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email and password are required' }, { status: 400 })
    }

    const existing = await Teacher.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const teacher = await Teacher.create({ name, email, password: hashedPassword, phone, specialization })

    const teacherObj = teacher.toObject()
    delete teacherObj.password

    return NextResponse.json({ success: true, data: teacherObj }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create teacher' }, { status: 500 })
  }
}
