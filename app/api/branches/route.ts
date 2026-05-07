import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Branch from '@/models/Branch'
import { bootstrapBranches } from '@/lib/bootstrapBranches'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Public branches list — used by the home-page slot/trial modal so visitors
 * can pick a branch before seeing schedules. Returns active and coming_soon
 * branches only (closed branches are hidden from public).
 */
export async function GET() {
  try {
    await connectDB()
    await bootstrapBranches()
    const branches = await Branch.find({ status: { $in: ['active', 'coming_soon'] } })
      .sort({ status: 1, name: 1 })
      .select('name slug status address phone')
    return NextResponse.json({ success: true, data: branches })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch branches' }, { status: 500 })
  }
}
