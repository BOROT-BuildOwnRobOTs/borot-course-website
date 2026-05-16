import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import { buildPortfolio } from '@/lib/portfolio'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// GET /api/portfolio/public/[token]
// Public endpoint — looks up the student by share token and returns the portfolio.
// No auth: the token itself IS the credential.
export async function GET(_req: NextRequest, ctx: { params: { token: string } }) {
  try {
    const { token } = ctx.params
    if (!token) {
      return NextResponse.json({ success: false, error: 'token required' }, { status: 400 })
    }

    await connectDB()
    const student = await Student.findOne({ portfolioShareToken: token }, '_id').lean<any>()
    if (!student) {
      return NextResponse.json({ success: false, error: 'Portfolio not found or link revoked' }, { status: 404 })
    }

    const data = await buildPortfolio(student._id.toString())
    if (!data) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[/api/portfolio/public/:token] error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load portfolio' }, { status: 500 })
  }
}
