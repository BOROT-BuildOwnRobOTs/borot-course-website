import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Parent from '@/models/Parent'
import Student from '@/models/Student'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const parent = await Parent.findById(params.id).select('-password')
    if (!parent) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    const students = await Student.find({ parent: params.id })
    return NextResponse.json({ success: true, data: { ...parent.toObject(), students } })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch parent' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, email, password, phone } = body

    const updateData: Record<string, string> = {}
    if (name) updateData.name = name
    if (email) updateData.email = email.toLowerCase()
    if (phone !== undefined) updateData.phone = phone
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const parent = await Parent.findByIdAndUpdate(params.id, updateData, { new: true }).select('-password')
    if (!parent) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: parent })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update parent' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const parent = await Parent.findByIdAndDelete(params.id)
    if (!parent) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete parent' }, { status: 500 })
  }
}
