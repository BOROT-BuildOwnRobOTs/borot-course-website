import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import PrintOrder from '@/models/PrintOrder'

export const dynamic = 'force-dynamic'

// GET /api/print/orders/[id]
// Returns the order if the current Clerk user owns it.
export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = ctx.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid order id' }, { status: 400 })
  }

  try {
    await connectDB()
    const order = await PrintOrder.findById(id).lean()
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }
    if (order.clerkUserId !== userId) {
      // Don't leak existence of other users' orders
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: order })
  } catch (err) {
    console.error('[print orders GET id] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to load order' }, { status: 500 })
  }
}
