import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import PrintOrder, {
  generateOrderNumber,
  PRINT_MATERIALS,
  type PrintMaterial,
  type DeliveryMethod,
  type PrintPriority,
} from '@/models/PrintOrder'

export const dynamic = 'force-dynamic'

// ─── Validation ──────────────────────────────────────────────────────────────
const FileSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  fileName: z.string().min(1),
  fileFormat: z.enum(['stl', 'obj']),
  sizeBytes: z.number().int().nonnegative(),
})

const ItemSchema = z.object({
  file: FileSchema,
  material: z.enum(PRINT_MATERIALS),
  color: z.string().min(1).max(40),
  layerHeightMm: z.union([z.literal(0.12), z.literal(0.2), z.literal(0.28)]),
  infillPct: z.number().int().min(10).max(100),
  quantity: z.number().int().min(1).max(50),
  priority: z.enum(['standard', 'express']),
  volumeCm3: z.number().positive().max(1_000_000).optional(),
  surfaceAreaCm2: z.number().positive().max(1_000_000).optional(),
  customerEstimateUnitPrice: z.number().nonnegative().max(1_000_000).optional(),
})

const AddressSchema = z.object({
  recipient: z.string().min(1),
  phone: z.string().min(9).max(15),
  line1: z.string().min(1),
  line2: z.string().optional(),
  district: z.string().optional(),
  province: z.string().min(1),
  postalCode: z.string().min(5).max(10),
})

const CreateBodySchema = z.object({
  customerName: z.string().min(1).max(120),
  customerPhone: z.string().min(9).max(15),
  customerEmail: z.string().email().optional().or(z.literal('')).transform((v) => v || undefined),
  item: ItemSchema,
  deliveryMethod: z.enum(['pickup', 'kerry', 'flash', 'ems']),
  shippingAddress: AddressSchema.optional(),
  notesCustomer: z.string().max(2000).optional(),
}).refine(
  (data) => data.deliveryMethod === 'pickup' || !!data.shippingAddress,
  { message: 'shippingAddress is required when deliveryMethod is not pickup', path: ['shippingAddress'] }
)

// ─── POST: create a draft order ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }
  const data = parsed.data

  try {
    await connectDB()
    const orderNumber = generateOrderNumber()
    const order = await PrintOrder.create({
      orderNumber,
      clerkUserId: userId,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.replace(/\D/g, ''),
      customerEmail: data.customerEmail,
      status: 'pending_review',
      statusHistory: [{ status: 'pending_review', changedBy: userId, changedAt: new Date() }],
      items: [{
        file: data.item.file,
        material: data.item.material,
        color: data.item.color,
        layerHeightMm: data.item.layerHeightMm,
        infillPct: data.item.infillPct,
        quantity: data.item.quantity,
        priority: data.item.priority,
        volumeCm3: data.item.volumeCm3,
        surfaceAreaCm2: data.item.surfaceAreaCm2,
        customerEstimateUnitPrice: data.item.customerEstimateUnitPrice,
        adminOverride: false,
      }],
      // Pricing left blank — admin will quote
      subtotal: 0,
      shippingFee: 0,
      discount: 0,
      total: 0,
      currency: 'THB',
      deliveryMethod: data.deliveryMethod as DeliveryMethod,
      shippingAddress: data.deliveryMethod === 'pickup' ? undefined : data.shippingAddress,
      notesCustomer: data.notesCustomer,
      payment: { status: 'pending' },
    })

    return NextResponse.json({
      success: true,
      data: { id: order._id.toString(), orderNumber: order.orderNumber, status: order.status },
    })
  } catch (err) {
    console.error('[print orders POST] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 })
  }
}

// ─── GET: list current user's orders ─────────────────────────────────────────
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    const orders = await PrintOrder
      .find({ clerkUserId: userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    return NextResponse.json({ success: true, data: orders })
  } catch (err) {
    console.error('[print orders GET] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to load orders' }, { status: 500 })
  }
}
