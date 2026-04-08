import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import Session from '@/models/Session'
import Parent from '@/models/Parent'

export const dynamic = 'force-dynamic'

// GET /api/teacher/students?teacherId=xxx
// Returns all students related to this teacher via:
//   1) enrollments.teacher === teacherId  (direct enrollment assignment)
//   2) students that appear in sessions taught by this teacher
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const teacherId = req.nextUrl.searchParams.get('teacherId')
    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'teacherId is required' }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return NextResponse.json({ success: false, error: 'Invalid teacherId' }, { status: 400 })
    }

    const objectId = new mongoose.Types.ObjectId(teacherId)

    // Strategy 1: Students with enrollments directly assigned to this teacher
    const enrollmentStudents = await Student.find({ 'enrollments.teacher': objectId }).lean()

    // Strategy 2: Find students from sessions taught by this teacher
    const sessions = await Session.find({ teacher: objectId }, 'attendance.student').lean()
    const sessionStudentIds = new Set<string>()
    for (const session of sessions) {
      for (const att of (session as any).attendance || []) {
        if (att.student) sessionStudentIds.add(att.student.toString())
      }
    }

    // Collect IDs we already have from strategy 1
    const enrollmentStudentIds = new Set(enrollmentStudents.map((s: any) => s._id.toString()))

    // Find additional students from sessions that we don't already have
    const missingIds = [...sessionStudentIds].filter((id) => !enrollmentStudentIds.has(id))
    let sessionOnlyStudents: any[] = []
    if (missingIds.length > 0) {
      const objectIds = missingIds.map((id) => new mongoose.Types.ObjectId(id))
      sessionOnlyStudents = await Student.find({ _id: { $in: objectIds } }).lean()
    }

    // Merge both lists
    const allStudents = [...enrollmentStudents, ...sessionOnlyStudents]

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
    console.error('Teacher students API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch students' }, { status: 500 })
  }
}
