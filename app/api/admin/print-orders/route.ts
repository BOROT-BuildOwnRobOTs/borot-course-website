import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PrintOrder, { PRINT_ORDER_STATUSES, type PrintOrderStatus } from '@/models/PrintOrder'

// PHASE 2 SECURITY: this admin route has no server-side auth — same pattern as
// the rest of /api/admin/*. The hardcoded admin login in app/admin/page.tsx is
// the only gate. Replace with a proper Clerk-role check before processing real
// payments through /print.

export const dynamic = 'force-dynamic'

const STATUS_SET = new Set<PrintOrderStatus>(PRINT_ORDER_STATUSES)
// "Actionable" pseudo-filter: orders that need admin attention right now
const ACTIONABLE: PrintOrderStatus[] = ['pending_review', 'waiting_payment']

// GET /api/admin/print-orders?status=pending_review&search=foo
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.trim()

    const filter: Record<string, unknown> = {}
    if (status === 'actionable') {
      filter.status = { $in: ACTIONABLE }
    } else if (status && STATUS_SET.has(status as PrintOrderStatus)) {
      filter.status = status
    }
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i')
      filter.$or = [
        { orderNumber: re },
        { customerName: re },
        { customerPhone: re },
      ]
    }

    const orders = await PrintOrder.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()

    return NextResponse.json({ success: true, data: orders })
  } catch (err) {
    console.error('[admin print-orders GET] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to load orders' }, { status: 500 })
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
