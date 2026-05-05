import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import PrintOrder from '@/models/PrintOrder'

// PHASE 2 SECURITY: see note in app/api/admin/print-orders/route.ts.

export const dynamic = 'force-dynamic'

const BodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('verify') }),
  z.object({ action: z.literal('reject'), reason: z.string().min(1).max(500) }),
])

// POST /api/admin/print-orders/[id]/verify-slip
// Verify → payment.status=verified, order.status=paid, paidAt set.
// Reject → payment.status=rejected with reason, order.status reverts to 'quoted'
//          so the customer can re-pay (slipUrl is kept for audit).
export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid order id' }, { status: 400 })
  }
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
  }

  try {
    await connectDB()
    const order = await PrintOrder.findById(id)
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

    if (order.status !== 'waiting_payment') {
      return NextResponse.json(
        { success: false, error: `Cannot verify slip in status "${order.status}"` },
        { status: 409 }
      )
    }
    if (!order.payment.slipUrl) {
      return NextResponse.json({ success: false, error: 'No slip submitted yet' }, { status: 409 })
    }

    const now = new Date()
    if (parsed.data.action === 'verify') {
      order.payment.status = 'verified'
      order.payment.verifiedBy = 'admin'
      order.payment.verifiedAt = now
      order.statusHistory.push({
        status: 'paid', changedBy: 'admin', reason: 'Slip verified', changedAt: now,
      })
      order.status = 'paid'
      if (!order.paidAt) order.paidAt = now
    } else {
      order.payment.status = 'rejected'
      order.payment.rejectReason = parsed.data.reason
      order.statusHistory.push({
        status: 'quoted',
        changedBy: 'admin',
        reason: `Slip rejected: ${parsed.data.reason}`,
        changedAt: now,
      })
      order.status = 'quoted'
    }

    await order.save()
    return NextResponse.json({ success: true, data: order.toObject() })
  } catch (err) {
    console.error('[admin verify-slip POST] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to update slip status' }, { status: 500 })
  }
}
