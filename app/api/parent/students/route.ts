import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import Course from '@/models/Course'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const parentId = searchParams.get('parentId')

    if (!parentId) {
      return NextResponse.json({ success: false, error: 'parentId required' }, { status: 400 })
    }

    const students = await Student.find({ parent: parentId }).lean()

    // Enrich courseDurationWeeks from Course document
    const courseIds = [...new Set(
      students.flatMap((s: any) => s.enrollments.map((e: any) => e.course?.toString()).filter(Boolean))
    )]
    const courseDocs = courseIds.length > 0
      ? await Course.find({ _id: { $in: courseIds } }, 'durationWeeks').lean()
      : []
    const courseMap: Record<string, number> = {}
    ;(courseDocs as any[]).forEach((c: any) => { courseMap[c._id.toString()] = c.durationWeeks || 0 })

    const enrichedStudents = students.map((s: any) => ({
      ...s,
      enrollments: s.enrollments.map((e: any) => ({
        ...e,
        courseDurationWeeks: (e.courseDurationWeeks && e.courseDurationWeeks > 0)
          ? e.courseDurationWeeks
          : courseMap[e.course?.toString()] || 0,
      })),
    }))

    return NextResponse.json({ success: true, data: enrichedStudents })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch students' }, { status: 500 })
  }
}
