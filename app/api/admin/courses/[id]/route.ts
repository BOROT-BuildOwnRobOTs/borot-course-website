import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await req.json()

    // Build $set explicitly so Mongoose always sets the field even if it didn't exist in old documents
    const setFields: Record<string, any> = {}
    if (body.name !== undefined) setFields.name = body.name
    if (body.description !== undefined) setFields.description = body.description
    if (body.level !== undefined) setFields.level = body.level
    if (body.durationWeeks !== undefined) setFields.durationWeeks = body.durationWeeks
    if (body.hours !== undefined) setFields.hours = body.hours

    const course = await Course.findByIdAndUpdate(params.id, { $set: setFields }, { new: true })
    if (!course) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: course })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update course' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const course = await Course.findByIdAndDelete(params.id)
    if (!course) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete course' }, { status: 500 })
  }
}
