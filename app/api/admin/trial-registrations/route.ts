import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TrialRegistration from '@/models/TrialRegistration'

export const dynamic = 'force-dynamic'

// GET /api/admin/trial-registrations
// Fetch all trial registrations (with optional status filter)
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'pending' | 'confirmed' | 'cancelled' | null (all)

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status

    const registrations = await TrialRegistration.find(filter)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, data: registrations })
  } catch (error) {
    console.error('Failed to fetch trial registrations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trial registrations' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/trial-registrations
// Delete ALL trial registrations (clear all data)
export async function DELETE(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // optionally clear only specific status

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status

    const result = await TrialRegistration.deleteMany(filter)

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} trial registration(s)`,
    })
  } catch (error) {
    console.error('Failed to delete trial registrations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete trial registrations' },
      { status: 500 }
    )
  }
}
