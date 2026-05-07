import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Branch from '@/models/Branch'
import { bootstrapBranches } from '@/lib/bootstrapBranches'

export const dynamic = 'force-dynamic'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  try {
    await connectDB()
    await bootstrapBranches()
    const branches = await Branch.find({}).sort({ status: 1, name: 1 })
    return NextResponse.json({ success: true, data: branches })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch branches' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, slug, status, address, phone, note } = body

    if (!name || !String(name).trim()) {
      return NextResponse.json({ success: false, error: 'Branch name is required' }, { status: 400 })
    }

    const finalSlug = slug ? slugify(slug) : slugify(name)
    if (!finalSlug) {
      return NextResponse.json({ success: false, error: 'Invalid slug' }, { status: 400 })
    }

    const existing = await Branch.findOne({ slug: finalSlug })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 })
    }

    const branch = await Branch.create({
      name: String(name).trim(),
      slug: finalSlug,
      status: status || 'active',
      address: address || '',
      phone: phone || '',
      note: note || '',
    })
    return NextResponse.json({ success: true, data: branch }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create branch' }, { status: 500 })
  }
}
