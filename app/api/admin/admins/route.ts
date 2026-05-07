import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Admin from '@/models/Admin'
import Branch from '@/models/Branch'
import bcrypt from 'bcryptjs'
import { bootstrapAdmin } from '@/lib/bootstrapAdmin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    await bootstrapAdmin()
    const admins = await Admin.find({}).sort({ createdAt: -1 }).select('-password').populate('branch', 'name slug status')
    return NextResponse.json({ success: true, data: admins })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch admins' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, email, password, role, branch, active } = body

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, password are required' }, { status: 400 })
    }

    const finalRole = role === 'super' ? 'super' : 'branch'

    if (finalRole === 'branch' && !branch) {
      return NextResponse.json({ success: false, error: 'Branch is required for branch admins' }, { status: 400 })
    }

    if (branch) {
      const exists = await Branch.findById(branch)
      if (!exists) {
        return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 400 })
      }
    }

    const lowerEmail = String(email).toLowerCase().trim()
    const existing = await Admin.findOne({ email: lowerEmail })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const admin = await Admin.create({
      name: String(name).trim(),
      email: lowerEmail,
      password: hashed,
      role: finalRole,
      branch: finalRole === 'super' ? null : branch,
      active: active !== false,
    })

    const obj = admin.toObject()
    delete obj.password
    return NextResponse.json({ success: true, data: obj }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create admin' }, { status: 500 })
  }
}
