'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Loader2, FileBox, MapPin, Truck, Clock, CheckCircle2, XCircle,
  Upload, AlertCircle, ChevronLeft,
} from 'lucide-react'
import type { PrintOrderStatus } from '@/models/PrintOrder'
import { StlViewerSkeleton } from '@/components/print/stl-viewer-skeleton'

const StlViewer = dynamic(() => import('@/components/print/stl-viewer'), {
  ssr: false,
  loading: () => <StlViewerSkeleton />,
})

interface OrderDetail {
  _id: string
  orderNumber: string
  status: PrintOrderStatus
  statusHistory: Array<{ status: PrintOrderStatus; reason?: string; changedAt: string }>
  items: Array<{
    _id?: string
    file: { url: string; fileName: string; fileFormat: 'stl' | 'obj'; sizeBytes: number }
    material: string
    color: string
    layerHeightMm: number
    infillPct: number
    quantity: number
    priority: 'standard' | 'express'
    estWeightG?: number
    estTimeMin?: number
    unitPrice?: number
    lineTotal?: number
    notes?: string
  }>
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  currency: string
  deliveryMethod: 'pickup' | 'kerry' | 'flash' | 'ems'
  shippingAddress?: {
    recipient: string; phone: string; line1: string; line2?: string
    district?: string; province: string; postalCode: string
  }
  trackingNumber?: string
  payment: {
    method?: 'promptpay' | 'bank_transfer'
    status: 'pending' | 'submitted' | 'verified' | 'rejected'
    amount?: number
    slipUrl?: string
    slipUploadedAt?: string
    rejectReason?: string
  }
  notesCustomer?: string
  notesAdmin?: string
  quotedAt?: string
  paidAt?: string
  createdAt: string
}

const TIMELINE: Array<{ status: PrintOrderStatus; label: string }> = [
  { status: 'pending_review', label: 'Pending review' },
  { status: 'quoted', label: 'Quoted' },
  { status: 'waiting_payment', label: 'Waiting payment' },
  { status: 'paid', label: 'Paid' },
  { status: 'in_queue', label: 'In queue' },
  { status: 'printing', label: 'Printing' },
  { status: 'post_processing', label: 'Post-processing' },
  { status: 'ready_for_pickup', label: 'Ready / Shipping' },
  { status: 'completed', label: 'Completed' },
]

const TERMINAL_BAD: PrintOrderStatus[] = ['failed', 'revision_needed']

const STATUS_BADGE: Record<PrintOrderStatus, string> = {
  pending_review:   'bg-gray-100 text-gray-700',
  quoted:           'bg-blue-100 text-blue-700',
  waiting_payment:  'bg-amber-100 text-amber-700',
  paid:             'bg-emerald-100 text-emerald-700',
  slicing:          'bg-violet-100 text-violet-700',
  in_queue:         'bg-violet-100 text-violet-700',
  printing:         'bg-indigo-100 text-indigo-700',
  post_processing:  'bg-indigo-100 text-indigo-700',
  ready_for_pickup: 'bg-green-100 text-green-700',
  shipping:         'bg-green-100 text-green-700',
  completed:        'bg-green-100 text-green-700',
  failed:           'bg-red-100 text-red-700',
  revision_needed:  'bg-red-100 text-red-700',
}

const STATUS_LABEL: Record<PrintOrderStatus, string> = {
  pending_review: 'Pending review', quoted: 'Quoted', waiting_payment: 'Waiting payment',
  paid: 'Paid', slicing: 'Slicing', in_queue: 'In queue', printing: 'Printing',
  post_processing: 'Post-processing', ready_for_pickup: 'Ready for pickup',
  shipping: 'Shipping', completed: 'Completed', failed: 'Failed',
  revision_needed: 'Revision needed',
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const orderId = params.id
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrLoading, setQrLoading] = useState(false)
  const [qr, setQr] = useState<{ dataUrl: string; amount: number } | null>(null)
  const [slipUploading, setSlipUploading] = useState(false)
  const slipInputRef = useRef<HTMLInputElement>(null)

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/print/orders/${orderId}`)
      const json = await res.json()
      if (json.success) setOrder(json.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  // Initial fetch + 10s polling for status updates
  useEffect(() => {
    fetchOrder()
    const t = setInterval(fetchOrder, 10_000)
    return () => clearInterval(t)
  }, [fetchOrder])

  // Auto-load QR once order is quoted
  useEffect(() => {
    if (!order) return
    if ((order.status === 'quoted' || order.status === 'waiting_payment') && !qr && !qrLoading) {
      setQrLoading(true)
      fetch(`/api/print/orders/${order._id}/qr`)
        .then((r) => r.json())
        .then((json) => {
          if (json.success) setQr({ dataUrl: json.data.dataUrl, amount: json.data.amount })
        })
        .finally(() => setQrLoading(false))
    }
  }, [order, qr, qrLoading])

  const handleSlipPick = () => slipInputRef.current?.click()

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !order) return
    e.target.value = ''

    setSlipUploading(true)
    try {
      // Step 1: upload slip image to /api/upload (existing image endpoint)
      const fd = new FormData()
      fd.append('file', file)
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
      const upJson = await upRes.json()
      if (!upJson.success) {
        toast.error(upJson.error ?? 'Slip upload failed')
        return
      }
      // Step 2: attach the slip URL to the order
      const subRes = await fetch(`/api/print/orders/${order._id}/slip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slipUrl: upJson.url }),
      })
      const subJson = await subRes.json()
      if (!subJson.success) {
        toast.error(subJson.error ?? 'Failed to submit slip')
        return
      }
      toast.success('Slip submitted — awaiting verification')
      fetchOrder()
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit slip')
    } finally {
      setSlipUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 gap-3">
        <AlertCircle className="w-10 h-10 text-gray-300" />
        <p>Order not found</p>
        <Link href="/service/3d-printing/orders"><Button variant="outline">Back to orders</Button></Link>
      </div>
    )
  }

  const item = order.items[0]
  const isTerminalBad = TERMINAL_BAD.includes(order.status)
  const currentIdx = TIMELINE.findIndex((t) => t.status === order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Link href="/service/3d-printing/orders" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-4 h-4 mr-1" /> All orders
        </Link>

        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-mono text-xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-xs text-gray-400 mt-1">
              Created {new Date(order.createdAt).toLocaleString('en-GB')}
            </p>
          </div>
          <Badge className={STATUS_BADGE[order.status] + ' border-0 text-sm py-1 px-3'}>
            {STATUS_LABEL[order.status]}
          </Badge>
        </header>

        {/* Status timeline */}
        {!isTerminalBad && (
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center justify-between gap-1 overflow-x-auto">
                {TIMELINE.map((step, i) => {
                  const reached = i <= Math.max(currentIdx, 0)
                  return (
                    <div key={step.status} className="flex items-center gap-1 flex-shrink-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                          reached ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {reached ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={`text-xs ${reached ? 'text-gray-700' : 'text-gray-400'} hidden sm:inline`}>
                        {step.label}
                      </span>
                      {i < TIMELINE.length - 1 && (
                        <div className={`w-4 h-px ${reached ? 'bg-orange-300' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {isTerminalBad && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">
                  {order.status === 'failed' ? 'Print failed' : 'Revision needed'}
                </p>
                {order.notesAdmin && (
                  <p className="text-sm text-red-800 mt-1">{order.notesAdmin}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending review notice */}
        {order.status === 'pending_review' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">We&apos;re reviewing your order</p>
                <p className="text-sm text-blue-800 mt-0.5">
                  You&apos;ll be notified once we&apos;ve quoted the job (usually within 24 hours).
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment section */}
        {(order.status === 'quoted' || order.status === 'waiting_payment') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-gray-600 text-sm">Amount due</span>
                <span className="text-2xl font-bold text-gray-900">฿{order.total.toLocaleString()}</span>
              </div>

              {order.payment.status === 'submitted' || order.payment.status === 'verified' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-700 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-amber-900 text-sm">
                        {order.payment.status === 'verified' ? 'Payment verified' : 'Slip submitted — awaiting verification'}
                      </p>
                      <p className="text-xs text-amber-800 mt-0.5">
                        We&apos;ll start your print as soon as the slip is verified.
                      </p>
                    </div>
                  </div>
                  {order.payment.slipUrl && (
                    <a
                      href={order.payment.slipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-700 underline ml-6"
                    >
                      View submitted slip
                    </a>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                    {qrLoading || !qr ? (
                      <div className="w-[240px] h-[240px] flex items-center justify-center text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <Image
                        src={qr.dataUrl}
                        alt="PromptPay QR code"
                        width={240}
                        height={240}
                        unoptimized
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-2">Scan with any PromptPay-enabled banking app</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">After payment, upload your slip</p>
                    <input
                      ref={slipInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSlipUpload}
                    />
                    <Button
                      onClick={handleSlipPick}
                      disabled={slipUploading}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      {slipUploading
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…</>
                        : <><Upload className="w-4 h-4 mr-2" /> Upload payment slip</>}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Item / model details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StlViewer url={item.file.url} format={item.file.fileFormat} color={item.color} />
            <div className="flex items-center gap-2 text-sm">
              <FileBox className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{item.file.fileName}</span>
              <span className="text-gray-400">({(item.file.sizeBytes / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <Spec label="Material" value={item.material.toUpperCase()} />
              <Spec
                label="Color"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-gray-200 inline-block"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.color}
                  </span>
                }
              />
              <Spec label="Quantity" value={item.quantity} />
              <Spec label="Layer height" value={`${item.layerHeightMm} mm`} />
              <Spec label="Infill" value={`${item.infillPct}%`} />
              <Spec label="Priority" value={item.priority === 'express' ? 'Express' : 'Standard'} />
              {item.estWeightG ? <Spec label="Est. weight" value={`${item.estWeightG} g`} /> : null}
              {item.estTimeMin ? (
                <Spec
                  label="Est. print time"
                  value={`${Math.floor(item.estTimeMin / 60)}h ${item.estTimeMin % 60}m`}
                />
              ) : null}
            </div>

            {item.notes && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm">
                <p className="text-xs text-gray-500 mb-1">Admin notes</p>
                <p className="text-gray-700">{item.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing breakdown */}
        {order.total > 0 && (
          <Card>
            <CardContent className="py-4 space-y-2 text-sm">
              <Row label="Subtotal" value={`฿${order.subtotal.toLocaleString()}`} />
              {order.shippingFee > 0 && <Row label="Shipping" value={`฿${order.shippingFee.toLocaleString()}`} />}
              {order.discount > 0 && <Row label="Discount" value={`-฿${order.discount.toLocaleString()}`} />}
              <Separator />
              <Row label="Total" value={`฿${order.total.toLocaleString()}`} bold />
            </CardContent>
          </Card>
        )}

        {/* Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {order.deliveryMethod === 'pickup'
                ? <MapPin className="w-4 h-4" />
                : <Truck className="w-4 h-4" />}
              Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-1">
            {order.deliveryMethod === 'pickup' ? (
              <p>Pickup at our shop. We&apos;ll notify you when ready.</p>
            ) : (
              <>
                <p className="font-medium">{order.deliveryMethod.toUpperCase()}</p>
                {order.shippingAddress && (
                  <p className="text-gray-600">
                    {order.shippingAddress.recipient} ({order.shippingAddress.phone})<br />
                    {order.shippingAddress.line1}
                    {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
                    {order.shippingAddress.district ? `${order.shippingAddress.district}, ` : ''}
                    {order.shippingAddress.province} {order.shippingAddress.postalCode}
                  </p>
                )}
                {order.trackingNumber && (
                  <p className="text-gray-700 mt-2">
                    <span className="text-gray-500">Tracking:</span>{' '}
                    <span className="font-mono">{order.trackingNumber}</span>
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {order.notesCustomer && (
          <Card>
            <CardContent className="py-4 text-sm">
              <p className="text-xs text-gray-500 mb-1">Your notes</p>
              <p className="text-gray-700">{order.notesCustomer}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? 'font-semibold text-gray-900' : 'text-gray-600'}>{label}</span>
      <span className={bold ? 'font-bold text-gray-900' : 'text-gray-900'}>{value}</span>
    </div>
  )
}
