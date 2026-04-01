import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'

export const dynamic = 'force-dynamic'

// GET /api/teacher/all-students
// Returns ALL students with their enrollments (across all teachers)
// This allows a teacher to see and manage students from other teachers too.
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const allStudents = await Student.find({}).lean()

    // Normalize ObjectId fields to plain strings for consistent frontend comparison
    const normalized = allStudents.map((s: any) => ({
      ...s,
      _id: s._id?.toString(),
      parent: s.parent?.toString(),
      enrollments: (s.enrollments || []).map((e: any) => ({
        ...e,
        _id: e._id?.toString(),
        course: e.course?.toString(),
        teacher: e.teacher?.toString(),
        teacherName: e.teacherName || '',
        startDate: e.startDate ? new Date(e.startDate).toISOString() : undefined,
        endDate: e.endDate ? new Date(e.endDate).toISOString() : undefined,
        reschedules: (e.reschedules || []).map((r: any) => ({
          ...r,
          originalDate: r.originalDate ? new Date(r.originalDate).toISOString() : undefined,
          newDate: r.newDate ? new Date(r.newDate).toISOString() : undefined,
        })),
      })),
    }))

    return NextResponse.json({ success: true, data: normalized })
  } catch (error) {
    console.error('Teacher all-students API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch all students' }, { status: 500 })
  }
}
