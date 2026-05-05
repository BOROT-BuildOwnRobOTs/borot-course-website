import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import PrintOrder from '@/models/PrintOrder'

// PHASE 2 SECURITY: see note in app/api/admin/print-orders/route.ts.

export const dynamic = 'force-dynamic'

const QuoteSchema = z.object({
  unitPrice: z.number().positive().max(1_000_000),
  shippingFee: z.number().nonnegative().max(10_000).optional().default(0),
  discount: z.number().nonnegative().max(1_000_000).optional().default(0),
  estWeightG: z.number().nonnegative().max(100_000).optional(),
  estTimeMin: z.number().int().nonnegative().max(60 * 24 * 30).optional(),
  itemNotes: z.string().max(500).optional(),
})

// POST /api/admin/print-orders/[id]/quote
// Sets the unit price on the (single) item, recomputes totals, transitions status to 'quoted'.
export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid order id' }, { status: 400 })
  }
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = QuoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
  }
  const { unitPrice, shippingFee, discount, estWeightG, estTimeMin, itemNotes } = parsed.data

  try {
    await connectDB()
    const order = await PrintOrder.findById(id)
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

    if (!['pending_review', 'quoted', 'revision_needed'].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: `Cannot quote an order in status "${order.status}"` },
        { status: 409 }
      )
    }

    const item = order.items[0]
    if (!item) {
      return NextResponse.json({ success: false, error: 'Order has no items' }, { status: 409 })
    }

    item.unitPrice = unitPrice
    item.lineTotal = round2(unitPrice * item.quantity)
    item.adminOverride = true
    if (estWeightG !== undefined) item.estWeightG = estWeightG
    if (estTimeMin !== undefined) item.estTimeMin = estTimeMin
    if (itemNotes !== undefined) item.notes = itemNotes

    order.subtotal = round2(item.lineTotal)
    order.shippingFee = round2(shippingFee)
    order.discount = round2(discount)
    order.total = round2(Math.max(0, order.subtotal + order.shippingFee - order.discount))
    order.payment.amount = order.total

    const now = new Date()
    if (order.status !== 'quoted') {
      order.statusHistory.push({
        status: 'quoted',
        changedBy: 'admin',
        reason: 'Admin set price',
        changedAt: now,
      })
      order.status = 'quoted'
    }
    order.quotedBy = 'admin'
    order.quotedAt = now

    await order.save()
    return NextResponse.json({ success: true, data: order.toObject() })
  } catch (err) {
    console.error('[admin quote POST] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to set quote' }, { status: 500 })
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
