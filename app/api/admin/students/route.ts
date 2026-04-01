import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    const students = await Student.find({}).sort({ createdAt: -1 }).populate('parent', 'name email phone')
    return NextResponse.json({ success: true, data: students })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, age, nickname, parentId, notes } = body

    if (!name || !parentId) {
      return NextResponse.json({ success: false, error: 'Name and parent are required' }, { status: 400 })
    }

    const student = await Student.create({ name, age, nickname, parent: parentId, notes, enrollments: [] })
    const populated = await student.populate('parent', 'name email phone')
    return NextResponse.json({ success: true, data: populated }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create student' }, { status: 500 })
  }
}
