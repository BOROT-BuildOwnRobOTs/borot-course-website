import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Parent from '@/models/Parent'
import bcrypt from 'bcryptjs'
import { bootstrapBranches } from '@/lib/bootstrapBranches'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    await bootstrapBranches()
    const branchId = req.nextUrl.searchParams.get('branch')
    const filter: Record<string, unknown> = {}
    if (branchId) filter.branch = branchId
    const parents = await Parent.find(filter)
      .sort({ createdAt: -1 })
      .select('-password')
      .populate('branch', 'name slug status')
    return NextResponse.json({ success: true, data: parents })
  } catch (error) {
    console.error('[GET /api/admin/parents] fetch failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch parents' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, email, password, phone, branch } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    const trimmedEmail = typeof email === 'string' ? email.trim() : ''
    const hasEmail = trimmedEmail.length > 0

    if (hasEmail && !password) {
      return NextResponse.json({ success: false, error: 'Password is required when email is provided' }, { status: 400 })
    }

    if (hasEmail) {
      const existing = await Parent.findOne({ email: trimmedEmail.toLowerCase() })
      if (existing) {
        return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 })
      }
    }

    const createData: Record<string, unknown> = {
      name,
      phone,
      branch: branch || null,
    }
    if (hasEmail) {
      createData.email = trimmedEmail
      createData.password = await bcrypt.hash(password, 10)
    }

    const parent = await Parent.create(createData)

    const parentObj = parent.toObject()
    delete parentObj.password

    return NextResponse.json({ success: true, data: parentObj }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/parents] create failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to create parent' }, { status: 500 })
  }
}
