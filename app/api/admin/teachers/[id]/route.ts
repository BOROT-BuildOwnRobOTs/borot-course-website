import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Teacher from '@/models/Teacher'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const teacher = await Teacher.findById(params.id).select('-password').populate('branch', 'name slug status')
    if (!teacher) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: teacher })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch teacher' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, email, password, phone, specialization, branch } = body

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (email) updateData.email = email.toLowerCase()
    if (phone !== undefined) updateData.phone = phone
    if (specialization !== undefined) updateData.specialization = specialization
    if (branch !== undefined) updateData.branch = branch || null
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const teacher = await Teacher.findByIdAndUpdate(params.id, updateData, { new: true })
      .select('-password')
      .populate('branch', 'name slug status')
    if (!teacher) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: teacher })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update teacher' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const teacher = await Teacher.findByIdAndDelete(params.id)
    if (!teacher) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete teacher' }, { status: 500 })
  }
}
