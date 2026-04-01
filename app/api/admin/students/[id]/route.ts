import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const student = await Student.findById(params.id).populate('parent', 'name email phone')
    if (!student) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: student })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch student' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, age, nickname, parentId, notes, enrollments } = body

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (age !== undefined) updateData.age = age
    if (nickname !== undefined) updateData.nickname = nickname
    if (parentId) updateData.parent = parentId
    if (notes !== undefined) updateData.notes = notes
    if (enrollments !== undefined) updateData.enrollments = enrollments

    const student = await Student.findByIdAndUpdate(params.id, updateData, { new: true }).populate('parent', 'name email phone')
    if (!student) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: student })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update student' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const student = await Student.findByIdAndDelete(params.id)
    if (!student) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete student' }, { status: 500 })
  }
}
