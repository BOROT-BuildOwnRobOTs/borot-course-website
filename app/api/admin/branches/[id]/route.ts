import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Branch from '@/models/Branch'
import Parent from '@/models/Parent'
import Student from '@/models/Student'
import Admin from '@/models/Admin'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const branch = await Branch.findById(params.id)
    if (!branch) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: branch })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch branch' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, status, address, phone, note } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = String(name).trim()
    if (status !== undefined) updateData.status = status
    if (address !== undefined) updateData.address = address
    if (phone !== undefined) updateData.phone = phone
    if (note !== undefined) updateData.note = note

    const branch = await Branch.findByIdAndUpdate(params.id, updateData, { new: true })
    if (!branch) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: branch })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update branch' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const [parents, students, admins] = await Promise.all([
      Parent.countDocuments({ branch: params.id }),
      Student.countDocuments({ branch: params.id }),
      Admin.countDocuments({ branch: params.id }),
    ])

    if (parents + students + admins > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Branch is in use (${parents} parents, ${students} students, ${admins} admins). Move or delete them first.`,
        },
        { status: 400 }
      )
    }

    const branch = await Branch.findByIdAndDelete(params.id)
    if (!branch) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete branch' }, { status: 500 })
  }
}
