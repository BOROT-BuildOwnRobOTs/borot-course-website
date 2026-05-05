import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import PrintOrder from '@/models/PrintOrder'
import { generatePromptPayQR } from '@/lib/promptpay'

export const dynamic = 'force-dynamic'

// GET /api/print/orders/[id]/qr
// Generates (or regenerates) a PromptPay QR for an order.
// Only available once the order has been quoted (status = 'quoted' or 'waiting_payment').
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
    const order = await PrintOrder.findById(id)
    if (!order || order.clerkUserId !== userId) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    if (!['quoted', 'waiting_payment'].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: 'Order is not ready for payment' },
        { status: 409 }
      )
    }

    if (!order.total || order.total <= 0) {
      return NextResponse.json(
        { success: false, error: 'Order total is not set' },
        { status: 409 }
      )
    }

    const { payload, dataUrl } = await generatePromptPayQR(order.total)

    // Persist the payload so we have a record of the exact QR shown
    if (order.payment.qrPayload !== payload) {
      order.payment.qrPayload = payload
      order.payment.amount = order.total
      await order.save()
    }

    return NextResponse.json({
      success: true,
      data: { dataUrl, payload, amount: order.total, currency: order.currency },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to generate QR'
    console.error('[print orders qr] error:', err)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
