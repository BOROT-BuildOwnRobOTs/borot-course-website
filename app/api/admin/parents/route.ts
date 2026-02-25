import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Parent from '@/models/Parent'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    await connectDB()
    const parents = await Parent.find({}).sort({ createdAt: -1 }).select('-password')
    return NextResponse.json({ success: true, data: parents })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch parents' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, email, password, phone } = body

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email and password are required' }, { status: 400 })
    }

    const existing = await Parent.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const parent = await Parent.create({ name, email, password: hashedPassword, phone })

    const parentObj = parent.toObject()
    delete parentObj.password

    return NextResponse.json({ success: true, data: parentObj }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create parent' }, { status: 500 })
  }
}
