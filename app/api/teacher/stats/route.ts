import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'

export const dynamic = 'force-dynamic'

// GET /api/teacher/stats
// Returns system-wide student stats (same for all teachers)
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const students = await Student.find({}, 'enrollments').lean()

    // Total unique students that have at least 1 active enrollment
    const totalActive = students.filter((s: any) =>
      (s.enrollments || []).some((e: any) => e.status === 'active')
    ).length

    // Total unique students across system
    const totalAll = students.length

    return NextResponse.json({ success: true, data: { totalAll, totalActive } })
  } catch (error) {
    console.error('Teacher stats API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}
