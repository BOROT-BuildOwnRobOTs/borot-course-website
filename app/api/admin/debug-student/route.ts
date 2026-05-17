import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const q = req.nextUrl.searchParams.get('q') ?? ''
    if (!q) {
      return NextResponse.json({ success: false, error: 'pass ?q=<name or nickname>' }, { status: 400 })
    }

    const regex = new RegExp(q, 'i')
    const matches = await Student.find({
      $or: [{ name: regex }, { nickname: regex }],
    })
      .populate('parent', 'name email phone branch')
      .populate('branch', 'name slug status')
      .lean()

    return NextResponse.json({
      success: true,
      query: q,
      count: matches.length,
      students: matches.map((s: any) => ({
        _id: String(s._id),
        name: s.name,
        nickname: s.nickname,
        age: s.age,
        branch: s.branch
          ? { _id: String(s.branch._id), name: s.branch.name, status: s.branch.status }
          : null,
        parent: s.parent
          ? {
              _id: String(s.parent._id),
              name: s.parent.name,
              phone: s.parent.phone,
              email: s.parent.email,
              branchId: s.parent.branch ? String(s.parent.branch) : null,
            }
          : null,
        enrollments: (s.enrollments ?? []).map((e: any) => ({
          courseName: e.courseName,
          courseLevel: e.courseLevel,
          status: e.status,
          startDate: e.startDate,
          slot: e.slot,
          courseDurationWeeks: e.courseDurationWeeks,
          rescheduleCount: (e.reschedules ?? []).length,
          reschedules: (e.reschedules ?? []).map((r: any) => ({
            originalDate: r.originalDate,
            newDate: r.newDate,
            newSlot: r.newSlot,
            reason: r.reason,
          })),
        })),
        createdAt: s.createdAt,
      })),
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message ?? 'failed' },
      { status: 500 },
    )
  }
}
