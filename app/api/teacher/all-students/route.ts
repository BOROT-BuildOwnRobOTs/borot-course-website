import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import Parent from '@/models/Parent'

export const dynamic = 'force-dynamic'

// GET /api/teacher/all-students
// Returns ALL students with their enrollments (across all teachers)
// This allows a teacher to see and manage students from other teachers too.
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const allStudents = await Student.find({}).lean()

    // Fetch parent info for phone numbers
    const parentIds = [...new Set(allStudents.map((s: any) => s.parent?.toString()).filter(Boolean))]
    const parents = parentIds.length > 0
      ? await Parent.find({ _id: { $in: parentIds.map(id => new mongoose.Types.ObjectId(id)) } }, 'name phone').lean()
      : []
    const parentMap = new Map(parents.map((p: any) => [p._id.toString(), { name: p.name, phone: p.phone }]))

    // Normalize ObjectId fields to plain strings for consistent frontend comparison
    const normalized = allStudents.map((s: any) => {
      const parentInfo = parentMap.get(s.parent?.toString())
      return {
      ...s,
      _id: s._id?.toString(),
      parent: s.parent?.toString(),
      parentPhone: parentInfo?.phone || '',
      parentName: parentInfo?.name || '',
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
    }})

    return NextResponse.json({ success: true, data: normalized })
  } catch (error) {
    console.error('Teacher all-students API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch all students' }, { status: 500 })
  }
}
