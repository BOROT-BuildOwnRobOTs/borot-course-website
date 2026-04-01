import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    const courses = await Course.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: courses })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, description, level, durationWeeks } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Course name is required' }, { status: 400 })
    }

    const course = await Course.create({ name, description, level, durationWeeks })
    return NextResponse.json({ success: true, data: course }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create course' }, { status: 500 })
  }
}
