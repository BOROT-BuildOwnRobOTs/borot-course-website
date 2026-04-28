import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'

export const dynamic = 'force-dynamic'

/**
 * Migration: Backfill `hours` for existing courses
 * Sets hours = durationWeeks * 2 for courses that have 0 hours but have durationWeeks > 0
 *
 * GET  → dry-run (preview what would change)
 * POST → actually apply the migration
 */

export async function GET() {
  try {
    await connectDB()

    const courses = await Course.find({ hours: { $in: [0, null, undefined] }, durationWeeks: { $gt: 0 } }).lean()
    const preview = courses.map((c: any) => ({
      courseId: c._id.toString(),
      name: c.name,
      level: c.level,
      durationWeeks: c.durationWeeks,
      currentHours: c.hours ?? 0,
      newHours: c.durationWeeks * 2,
    }))

    return NextResponse.json({
      success: true,
      message: `DRY RUN: Found ${preview.length} courses to migrate. POST to this endpoint to apply.`,
      rule: 'hours = durationWeeks * 2',
      preview,
      totalChanges: preview.length,
    })
  } catch (error) {
    console.error('Migration preview error:', error)
    return NextResponse.json({ success: false, error: 'Migration preview failed' }, { status: 500 })
  }
}

export async function POST() {
  try {
    await connectDB()

    const courses = await Course.find({ hours: { $in: [0, null, undefined] }, durationWeeks: { $gt: 0 } })
    let updated = 0

    for (const course of courses) {
      course.hours = course.durationWeeks! * 2
      await course.save()
      updated++
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      rule: 'hours = durationWeeks * 2',
      results: { coursesUpdated: updated },
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ success: false, error: 'Migration failed' }, { status: 500 })
  }
}