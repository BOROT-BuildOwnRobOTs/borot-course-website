import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Admin from '@/models/Admin'
import Branch from '@/models/Branch'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const admin = await Admin.findById(params.id).select('-password').populate('branch', 'name slug status')
    if (!admin) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: admin })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch admin' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, email, password, role, branch, active } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = String(name).trim()
    if (email !== undefined) updateData.email = String(email).toLowerCase().trim()
    if (active !== undefined) updateData.active = !!active
    if (role !== undefined) {
      updateData.role = role === 'super' ? 'super' : 'branch'
      if (role === 'super') updateData.branch = null
    }
    if (branch !== undefined) {
      if (branch) {
        const exists = await Branch.findById(branch)
        if (!exists) {
          return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 400 })
        }
        updateData.branch = branch
      } else {
        updateData.branch = null
      }
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const admin = await Admin.findByIdAndUpdate(params.id, updateData, { new: true })
      .select('-password')
      .populate('branch', 'name slug status')
    if (!admin) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: admin })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update admin' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const admin = await Admin.findById(params.id)
    if (!admin) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    if (admin.role === 'super') {
      const remainingSupers = await Admin.countDocuments({ role: 'super', _id: { $ne: admin._id } })
      if (remainingSupers === 0) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the last super admin' },
          { status: 400 }
        )
      }
    }

    await Admin.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete admin' }, { status: 500 })
  }
}
