import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import { bootstrapBranches } from '@/lib/bootstrapBranches'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    await bootstrapBranches()
    const branchId = req.nextUrl.searchParams.get('branch')
    const filter: Record<string, unknown> = {}
    if (branchId) filter.branch = branchId
    const students = await Student.find(filter)
      .sort({ createdAt: -1 })
      .populate('parent', 'name email phone branch')
      .populate('branch', 'name slug status')
    return NextResponse.json({ success: true, data: students })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, age, nickname, parentId, notes, branch } = body

    if (!name || !parentId) {
      return NextResponse.json({ success: false, error: 'Name and parent are required' }, { status: 400 })
    }

    const student = await Student.create({
      name,
      age,
      nickname,
      parent: parentId,
      branch: branch || null,
      notes,
      enrollments: [],
    })
    const populated = await student.populate([
      { path: 'parent', select: 'name email phone branch' },
      { path: 'branch', select: 'name slug status' },
    ])
    return NextResponse.json({ success: true, data: populated }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create student' }, { status: 500 })
  }
}
