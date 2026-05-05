'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Loader2, Search, FileBox, Phone, MapPin, Truck, Eye,
  CheckCircle2, XCircle, Send, Receipt,
} from 'lucide-react'
import { PRINT_ORDER_STATUSES, type PrintOrderStatus } from '@/lib/print-enums'
import { estimatePrice, formatPrintTime } from '@/lib/print-estimate'
import { StlViewerSkeleton } from '@/components/print/stl-viewer-skeleton'

const StlViewer = dynamic(() => import('@/components/print/stl-viewer'), {
  ssr: false,
  loading: () => <StlViewerSkeleton />,
})

interface AdminOrder {
  _id: string
  orderNumber: string
  clerkUserId?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
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
    volumeCm3?: number
    surfaceAreaCm2?: number
    customerEstimateUnitPrice?: number
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
  createdAt: string
}

const STATUS_BADGE: Record<PrintOrderStatus, string> = {
  pending_review:   'bg-gray-100 text-gray-700 border-gray-200',
  quoted:           'bg-blue-100 text-blue-700 border-blue-200',
  waiting_payment:  'bg-amber-100 text-amber-700 border-amber-200',
  paid:             'bg-emerald-100 text-emerald-700 border-emerald-200',
  slicing:          'bg-violet-100 text-violet-700 border-violet-200',
  in_queue:         'bg-violet-100 text-violet-700 border-violet-200',
  printing:         'bg-indigo-100 text-indigo-700 border-indigo-200',
  post_processing:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  ready_for_pickup: 'bg-green-100 text-green-700 border-green-200',
  shipping:         'bg-green-100 text-green-700 border-green-200',
  completed:        'bg-green-100 text-green-700 border-green-200',
  failed:           'bg-red-100 text-red-700 border-red-200',
  revision_needed:  'bg-red-100 text-red-700 border-red-200',
}

const STATUS_LABEL: Record<PrintOrderStatus, string> = {
  pending_review: 'Pending review', quoted: 'Quoted', waiting_payment: 'Waiting payment',
  paid: 'Paid', slicing: 'Slicing', in_queue: 'In queue', printing: 'Printing',
  post_processing: 'Post-processing', ready_for_pickup: 'Ready for pickup',
  shipping: 'Shipping', completed: 'Completed', failed: 'Failed',
  revision_needed: 'Revision needed',
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('actionable')
  const [search, setSearch] = useState('')

  const [selected, setSelected] = useState<AdminOrder | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (search.trim()) params.set('search', search.trim())
      const res = await fetch(`/api/admin/print-orders?${params}`)
      const json = await res.json()
      if (json.success) setOrders(json.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const counts = useMemo(() => {
    return orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1
      return acc
    }, {})
  }, [orders])

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search order number or customer name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchOrders() }}
              className="max-w-md"
            />
            <Button variant="outline" size="sm" onClick={fetchOrders}>Search</Button>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="actionable">Needs attention</SelectItem>
              <SelectItem value="all">All</SelectItem>
              {PRINT_ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                  {counts[s] ? <span className="text-gray-400 ml-1">({counts[s]})</span> : null}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-10 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">No orders match the current filter.</div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="text-xs text-gray-500 uppercase">
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Order</th>
                  <th className="text-left py-2 px-3 font-medium">Customer</th>
                  <th className="text-left py-2 px-3 font-medium">Model</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                  <th className="text-right py-2 px-3 font-medium">Total</th>
                  <th className="text-left py-2 px-3 font-medium">Created</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const item = o.items[0]
                  return (
                    <tr key={o._id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(o)}>
                      <td className="py-2 px-3 font-mono text-xs text-gray-900">{o.orderNumber}</td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-gray-900">{o.customerName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {o.customerPhone}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5 text-gray-700 max-w-[240px]">
                          <FileBox className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{item?.file.fileName ?? '—'}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {item?.material.toUpperCase()} × {item?.quantity}
                          {item?.priority === 'express' ? ' · Express' : ''}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <Badge className={STATUS_BADGE[o.status] + ' border'}>{STATUS_LABEL[o.status]}</Badge>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {o.total > 0 ? (
                          <span className="font-semibold">฿{o.total.toLocaleString()}</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-500">
                        {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-2 px-3">
                        <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {selected && (
        <OrderDetailDialog
          order={selected}
          onClose={() => setSelected(null)}
          onChanged={(updated) => {
            setSelected(updated)
            // Update the row in the list
            setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)))
          }}
        />
      )}
    </Card>
  )
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────
function OrderDetailDialog({
  order, onClose, onChanged,
}: {
  order: AdminOrder
  onClose: () => void
  onChanged: (updated: AdminOrder) => void
}) {
  const item = order.items[0]
  const [unitPrice, setUnitPrice] = useState<string>(item?.unitPrice ? String(item.unitPrice) : '')
  const [shippingFee, setShippingFee] = useState<string>(String(order.shippingFee || 0))
  const [discount, setDiscount] = useState<string>(String(order.discount || 0))
  const [estWeight, setEstWeight] = useState<string>(item?.estWeightG ? String(item.estWeightG) : '')
  const [estTime, setEstTime] = useState<string>(item?.estTimeMin ? String(item.estTimeMin) : '')
  const [itemNotes, setItemNotes] = useState<string>(item?.notes ?? '')
  const [adminNotes, setAdminNotes] = useState<string>(order.notesAdmin ?? '')
  const [tracking, setTracking] = useState<string>(order.trackingNumber ?? '')
  const [statusVal, setStatusVal] = useState<PrintOrderStatus>(order.status)
  const [statusReason, setStatusReason] = useState<string>('')
  const [printerName, setPrinterName] = useState<string>('Default')
  const [busy, setBusy] = useState(false)
  const [showSlip, setShowSlip] = useState(false)
  const [rejectReason, setRejectReason] = useState<string>('')
  const [showReject, setShowReject] = useState(false)

  const canQuote = ['pending_review', 'quoted', 'revision_needed'].includes(order.status)

  // Suggested price uses the same algorithm the customer saw — recomputed here
  // because settings (or the pricing config) might have changed since submit.
  const suggested = useMemo(() => {
    if (!item || !item.volumeCm3) return null
    return estimatePrice({
      volumeCm3: item.volumeCm3,
      surfaceAreaCm2: item.surfaceAreaCm2 ?? 0,
      material: item.material as Parameters<typeof estimatePrice>[0]['material'],
      layerHeightMm: item.layerHeightMm as 0.12 | 0.20 | 0.28,
      infillPct: item.infillPct,
      quantity: item.quantity,
      priority: item.priority,
    })
  }, [item])

  const handleQuote = async () => {
    const price = Number(unitPrice)
    if (!Number.isFinite(price) || price <= 0) {
      toast.error('Enter a valid unit price')
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/print-orders/${order._id}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitPrice: price,
          shippingFee: Number(shippingFee) || 0,
          discount: Number(discount) || 0,
          estWeightG: estWeight ? Number(estWeight) : undefined,
          estTimeMin: estTime ? Number(estTime) : undefined,
          itemNotes: itemNotes.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? 'Failed to set quote'); return }
      toast.success('Quote sent to customer')
      onChanged(json.data)
    } finally {
      setBusy(false)
    }
  }

  const handleVerifySlip = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/print-orders/${order._id}/verify-slip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? 'Failed to verify'); return }
      toast.success('Payment verified — order marked paid')
      onChanged(json.data)
    } finally {
      setBusy(false)
    }
  }

  const handleRejectSlip = async () => {
    if (!rejectReason.trim()) { toast.error('Enter a reason'); return }
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/print-orders/${order._id}/verify-slip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: rejectReason.trim() }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? 'Failed to reject'); return }
      toast.success('Slip rejected — customer notified')
      onChanged(json.data)
      setShowReject(false)
      setRejectReason('')
    } finally {
      setBusy(false)
    }
  }

  const handleSaveMisc = async () => {
    setBusy(true)
    try {
      const body: Record<string, unknown> = {}
      if (statusVal !== order.status) {
        body.status = statusVal
        if (statusReason.trim()) body.reason = statusReason.trim()
      }
      if (adminNotes !== (order.notesAdmin ?? '')) body.notesAdmin = adminNotes
      if (tracking !== (order.trackingNumber ?? '')) body.trackingNumber = tracking
      if (Object.keys(body).length === 0) { toast.info('No changes to save'); return }

      const res = await fetch(`/api/admin/print-orders/${order._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? 'Failed to save'); return }
      toast.success('Order updated')
      onChanged(json.data)
      setStatusReason('')
    } finally {
      setBusy(false)
    }
  }

  const handleAddToQueue = async () => {
    if (!item?._id) { toast.error('Item missing'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/admin/print-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          itemId: item._id,
          printerName: printerName.trim() || 'Default',
        }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? 'Failed to queue'); return }
      toast.success(`Added to "${printerName}" queue`)
    } finally {
      setBusy(false)
    }
  }

  const slipPending = order.status === 'waiting_payment' && order.payment.status === 'submitted'

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono">{order.orderNumber}</span>
            <Badge className={STATUS_BADGE[order.status] + ' border'}>{STATUS_LABEL[order.status]}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: model + details */}
          <div className="space-y-4">
            {item && <StlViewer url={item.file.url} format={item.file.fileFormat} color={item.color} className="w-full h-[320px] rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 border" />}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Spec label="File" value={item?.file.fileName ?? '—'} />
              <Spec label="Size" value={item ? `${(item.file.sizeBytes / (1024 * 1024)).toFixed(2)} MB` : '—'} />
              <Spec label="Material" value={item?.material.toUpperCase() ?? '—'} />
              <Spec
                label="Color"
                value={item ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block border" style={{ backgroundColor: item.color }} />
                    {item.color}
                  </span>
                ) : '—'}
              />
              <Spec label="Quantity" value={item?.quantity ?? '—'} />
              <Spec label="Priority" value={item?.priority === 'express' ? 'Express' : 'Standard'} />
              <Spec label="Layer height" value={`${item?.layerHeightMm ?? '—'} mm`} />
              <Spec label="Infill" value={`${item?.infillPct ?? '—'}%`} />
            </div>

            <Separator />

            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-900">{order.customerName}</p>
              <p className="text-gray-600">📞 {order.customerPhone}{order.customerEmail ? ` · ${order.customerEmail}` : ''}</p>
              <div className="flex items-start gap-1.5 text-gray-600 mt-2">
                {order.deliveryMethod === 'pickup'
                  ? <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  : <Truck className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                <div>
                  {order.deliveryMethod === 'pickup' ? (
                    <span>Pickup at shop</span>
                  ) : (
                    <>
                      <span className="font-medium">{order.deliveryMethod.toUpperCase()}</span>
                      {order.shippingAddress && (
                        <span className="block text-xs">
                          {order.shippingAddress.recipient}, {order.shippingAddress.line1}
                          {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''},{' '}
                          {order.shippingAddress.province} {order.shippingAddress.postalCode}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              {order.notesCustomer && (
                <div className="bg-gray-50 border rounded p-2 text-xs mt-2">
                  <p className="text-gray-500 mb-0.5">Customer notes</p>
                  <p className="text-gray-700">{order.notesCustomer}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="space-y-5">
            {/* Quote */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Receipt className="w-4 h-4" /> Quote
              </h3>

              {/* Auto-suggestion hint */}
              {suggested?.ok && canQuote && (
                <div className="mb-3 p-2.5 bg-blue-50 border border-blue-100 rounded-md text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-900">
                      Suggested: ฿{suggested.unitPrice.toLocaleString()} / unit
                    </span>
                    <button
                      type="button"
                      onClick={() => setUnitPrice(String(suggested.unitPrice))}
                      className="text-blue-700 hover:text-blue-900 underline"
                    >
                      Use
                    </button>
                  </div>
                  <p className="text-blue-800">
                    Based on {(item?.volumeCm3 ?? 0).toFixed(1)} cm³ · ~{suggested.estWeightG.toFixed(1)} g · {formatPrintTime(suggested.estTimeMin)}
                  </p>
                  {item?.customerEstimateUnitPrice !== undefined && (
                    <p className="text-blue-700">
                      Customer was shown: ฿{item.customerEstimateUnitPrice.toLocaleString()} / unit
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Unit price (THB)</Label>
                  <Input type="number" min={0} value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} disabled={!canQuote} />
                </div>
                <div>
                  <Label className="text-xs">Line total</Label>
                  <Input
                    readOnly
                    value={item ? `฿${(Number(unitPrice || 0) * item.quantity).toLocaleString()}` : '—'}
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label className="text-xs">Shipping (THB)</Label>
                  <Input type="number" min={0} value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} disabled={!canQuote} />
                </div>
                <div>
                  <Label className="text-xs">Discount (THB)</Label>
                  <Input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} disabled={!canQuote} />
                </div>
                <div>
                  <Label className="text-xs">Est. weight (g)</Label>
                  <Input type="number" min={0} value={estWeight} onChange={(e) => setEstWeight(e.target.value)} disabled={!canQuote} />
                </div>
                <div>
                  <Label className="text-xs">Est. time (min)</Label>
                  <Input type="number" min={0} value={estTime} onChange={(e) => setEstTime(e.target.value)} disabled={!canQuote} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Notes for customer</Label>
                  <Textarea rows={2} value={itemNotes} onChange={(e) => setItemNotes(e.target.value)} disabled={!canQuote} placeholder="e.g. needs support, thin walls flagged" />
                </div>
              </div>
              <Button onClick={handleQuote} disabled={!canQuote || busy} className="mt-2 w-full bg-orange-500 hover:bg-orange-600">
                {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {item?.unitPrice ? 'Update quote' : 'Send quote'}
              </Button>
              {!canQuote && (
                <p className="text-xs text-gray-500 mt-1.5">Quoting is locked once payment is in flight.</p>
              )}
            </section>

            {/* Slip review */}
            {(order.payment.slipUrl || slipPending) && (
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Payment slip</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={
                    order.payment.status === 'verified' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 border' :
                    order.payment.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200 border' :
                    'bg-amber-100 text-amber-700 border-amber-200 border'
                  }>
                    {order.payment.status}
                  </Badge>
                  {order.payment.amount && (
                    <span className="text-xs text-gray-600">฿{order.payment.amount.toLocaleString()}</span>
                  )}
                </div>
                {order.payment.slipUrl && (
                  <button
                    type="button"
                    onClick={() => setShowSlip(true)}
                    className="block w-full border rounded-lg overflow-hidden hover:opacity-90"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={order.payment.slipUrl} alt="Payment slip" className="w-full max-h-[200px] object-contain bg-gray-50" />
                  </button>
                )}
                {order.payment.rejectReason && (
                  <p className="text-xs text-red-700 mt-1">Rejection: {order.payment.rejectReason}</p>
                )}
                {slipPending && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button onClick={handleVerifySlip} disabled={busy} className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Verify
                    </Button>
                    <Button onClick={() => setShowReject(true)} disabled={busy} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                      <XCircle className="w-4 h-4 mr-1.5" /> Reject
                    </Button>
                  </div>
                )}
              </section>
            )}

            {/* Status / notes / tracking / queue */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Order updates</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={statusVal} onValueChange={(v) => setStatusVal(v as PrintOrderStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRINT_ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Reason (optional)</Label>
                  <Input value={statusReason} onChange={(e) => setStatusReason(e.target.value)} placeholder="why this change" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Tracking number</Label>
                <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Carrier tracking #" />
              </div>
              <div>
                <Label className="text-xs">Internal admin notes</Label>
                <Textarea rows={2} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
              </div>
              <Button onClick={handleSaveMisc} disabled={busy} variant="outline" className="w-full">
                Save changes
              </Button>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Print queue</h3>
              <div className="flex gap-2">
                <Input value={printerName} onChange={(e) => setPrinterName(e.target.value)} placeholder="Printer name" />
                <Button onClick={handleAddToQueue} disabled={busy} variant="outline" className="shrink-0">
                  Add to queue
                </Button>
              </div>
              <p className="text-xs text-gray-500">Adds this item to the end of the named printer&apos;s queue.</p>
            </section>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>

      {/* Slip large preview */}
      {showSlip && order.payment.slipUrl && (
        <Dialog open onOpenChange={(o) => !o && setShowSlip(false)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Payment slip</DialogTitle></DialogHeader>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={order.payment.slipUrl} alt="Slip" className="w-full max-h-[80vh] object-contain bg-gray-50" />
          </DialogContent>
        </Dialog>
      )}

      {/* Reject reason modal */}
      {showReject && (
        <Dialog open onOpenChange={(o) => !o && setShowReject(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Reject slip</DialogTitle></DialogHeader>
            <Label className="text-xs">Reason (visible to customer)</Label>
            <Textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. amount mismatch, wrong account" />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowReject(false)}>Cancel</Button>
              <Button onClick={handleRejectSlip} disabled={busy} className="bg-red-600 hover:bg-red-700">
                Reject slip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}

function Spec({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900 truncate">{value}</p>
    </div>
  )
}
