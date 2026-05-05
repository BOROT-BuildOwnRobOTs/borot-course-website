import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import PrintOrder from '@/models/PrintOrder'
import PrintJob from '@/models/PrintJob'

// PHASE 2 SECURITY: see note in app/api/admin/print-orders/route.ts.

export const dynamic = 'force-dynamic'

// GET /api/admin/print-jobs?printer=Default
// Returns all jobs (sorted by printer, then position) so the queue tab can group them client-side.
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const printer = searchParams.get('printer')

    const filter: Record<string, unknown> = {}
    if (printer) filter.printerName = printer

    const jobs = await PrintJob.find(filter)
      .sort({ printerName: 1, position: 1 })
      .limit(500)
      .lean()

    return NextResponse.json({ success: true, data: jobs })
  } catch (err) {
    console.error('[admin print-jobs GET] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to load jobs' }, { status: 500 })
  }
}

const CreateSchema = z.object({
  orderId: z.string().refine((s) => mongoose.Types.ObjectId.isValid(s), 'Invalid orderId'),
  itemId: z.string().refine((s) => mongoose.Types.ObjectId.isValid(s), 'Invalid itemId'),
  printerName: z.string().min(1).max(60).default('Default'),
  notes: z.string().max(500).optional(),
})

// POST /api/admin/print-jobs
// Assigns an order item to a printer at the end of its queue.
export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
  }
  const { orderId, itemId, printerName, notes } = parsed.data

  try {
    await connectDB()
    const order = await PrintOrder.findById(orderId).lean()
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

    const item = order.items.find((it) => it._id?.toString() === itemId)
    if (!item) return NextResponse.json({ success: false, error: 'Item not in order' }, { status: 404 })

    // Sparse positions (10, 20, 30…) so future reorders rarely renumber everything.
    const last = await PrintJob.findOne({ printerName }).sort({ position: -1 }).lean()
    const nextPos = (last?.position ?? 0) + 10

    const job = await PrintJob.create({
      order: order._id,
      orderNumber: order.orderNumber,
      itemId: new mongoose.Types.ObjectId(itemId),
      printerName,
      position: nextPos,
      status: 'queued',
      notes,
    })

    return NextResponse.json({ success: true, data: job.toObject() })
  } catch (err) {
    console.error('[admin print-jobs POST] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to create job' }, { status: 500 })
  }
}
