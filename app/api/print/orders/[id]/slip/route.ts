import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import mongoose from 'mongoose'
import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import PrintOrder from '@/models/PrintOrder'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  slipUrl: z.string().url(),
})

// POST /api/print/orders/[id]/slip
// Customer submits a payment slip URL (already uploaded to /api/upload).
// Transitions order: quoted → waiting_payment.
export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = ctx.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid order id' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 400 })
  }

  try {
    await connectDB()
    const order = await PrintOrder.findById(id)
    if (!order || order.clerkUserId !== userId) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    if (!['quoted', 'waiting_payment'].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: 'Order is not ready for slip submission' },
        { status: 409 }
      )
    }

    const now = new Date()
    order.payment.method = 'bank_transfer'
    order.payment.status = 'submitted'
    order.payment.slipUrl = parsed.data.slipUrl
    order.payment.slipUploadedAt = now
    order.payment.amount = order.total

    if (order.status !== 'waiting_payment') {
      order.statusHistory.push({
        status: 'waiting_payment',
        changedBy: userId,
        reason: 'Customer submitted payment slip',
        changedAt: now,
      })
      order.status = 'waiting_payment'
    }

    await order.save()

    return NextResponse.json({
      success: true,
      data: { status: order.status, slipUrl: order.payment.slipUrl },
    })
  } catch (err) {
    console.error('[print orders slip POST] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to submit slip' }, { status: 500 })
  }
}
