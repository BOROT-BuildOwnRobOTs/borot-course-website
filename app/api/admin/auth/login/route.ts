import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Admin from '@/models/Admin'
import bcrypt from 'bcryptjs'
import { bootstrapAdmin } from '@/lib/bootstrapAdmin'
import { bootstrapBranches } from '@/lib/bootstrapBranches'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    await bootstrapBranches()
    await bootstrapAdmin()

    const body = await req.json()
    const identifier = String(body.identifier ?? body.email ?? body.username ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')

    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 })
    }

    // Legacy "admin/admin" shortcut maps to the seeded super admin
    const lookupEmail = identifier === 'admin' ? 'admin@borot.local' : identifier

    const admin = await Admin.findOne({ email: lookupEmail }).populate('branch', 'name slug status')
    if (!admin || !admin.active) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, admin.password)
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const branch = admin.branch as { _id: unknown; name: string; slug: string; status: string } | null

    return NextResponse.json({
      success: true,
      data: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        branch: branch
          ? { _id: String(branch._id), name: branch.name, slug: branch.slug, status: branch.status }
          : null,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 })
  }
}
