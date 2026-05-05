import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import PrintOrder, { PRINT_ORDER_STATUSES, type PrintOrderStatus } from '@/models/PrintOrder'

// PHASE 2 SECURITY: see note in app/api/admin/print-orders/route.ts.

export const dynamic = 'force-dynamic'

// GET /api/admin/print-orders/[id]
export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid order id' }, { status: 400 })
  }
  try {
    await connectDB()
    const order = await PrintOrder.findById(id).lean()
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: order })
  } catch (err) {
    console.error('[admin print-orders GET id] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to load order' }, { status: 500 })
  }
}

// PATCH /api/admin/print-orders/[id]
// Generic order updates: status transition, admin notes, tracking number, item notes.
const PatchSchema = z.object({
  status: z.enum(PRINT_ORDER_STATUSES).optional(),
  reason: z.string().max(500).optional(),
  notesAdmin: z.string().max(2000).optional(),
  trackingNumber: z.string().max(80).optional(),
  itemNotes: z.string().max(500).optional(), // sets notes on items[0] for MVP single-item
})

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid order id' }, { status: 400 })
  }
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
  }
  const data = parsed.data

  try {
    await connectDB()
    const order = await PrintOrder.findById(id)
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

    if (data.status && data.status !== order.status) {
      const now = new Date()
      order.statusHistory.push({
        status: data.status,
        changedBy: 'admin',
        reason: data.reason,
        changedAt: now,
      })
      order.status = data.status
      if (data.status === 'paid' && !order.paidAt) order.paidAt = now
      if (data.status === 'completed' && !order.completedAt) order.completedAt = now
    }

    if (data.notesAdmin !== undefined) order.notesAdmin = data.notesAdmin
    if (data.trackingNumber !== undefined) order.trackingNumber = data.trackingNumber
    if (data.itemNotes !== undefined && order.items[0]) order.items[0].notes = data.itemNotes

    await order.save()
    return NextResponse.json({ success: true, data: order.toObject() })
  } catch (err) {
    console.error('[admin print-orders PATCH] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 })
  }
}
