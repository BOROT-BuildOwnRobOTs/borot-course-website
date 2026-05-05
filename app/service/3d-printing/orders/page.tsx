'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, FileBox, ChevronRight, Plus } from 'lucide-react'
import type { PrintOrderStatus } from '@/models/PrintOrder'

interface OrderListItem {
  _id: string
  orderNumber: string
  status: PrintOrderStatus
  total: number
  currency: string
  items: Array<{ file: { fileName: string }; quantity: number; material: string }>
  createdAt: string
}

const STATUS_CONFIG: Record<PrintOrderStatus, { label: string; classes: string }> = {
  pending_review:    { label: 'Pending review',     classes: 'bg-gray-100 text-gray-700' },
  quoted:            { label: 'Quoted',             classes: 'bg-blue-100 text-blue-700' },
  waiting_payment:   { label: 'Waiting payment',    classes: 'bg-amber-100 text-amber-700' },
  paid:              { label: 'Paid',               classes: 'bg-emerald-100 text-emerald-700' },
  slicing:           { label: 'Slicing',            classes: 'bg-violet-100 text-violet-700' },
  in_queue:          { label: 'In queue',           classes: 'bg-violet-100 text-violet-700' },
  printing:          { label: 'Printing',           classes: 'bg-indigo-100 text-indigo-700' },
  post_processing:   { label: 'Post-processing',    classes: 'bg-indigo-100 text-indigo-700' },
  ready_for_pickup:  { label: 'Ready for pickup',   classes: 'bg-green-100 text-green-700' },
  shipping:          { label: 'Shipping',           classes: 'bg-green-100 text-green-700' },
  completed:         { label: 'Completed',          classes: 'bg-green-100 text-green-700' },
  failed:            { label: 'Failed',             classes: 'bg-red-100 text-red-700' },
  revision_needed:   { label: 'Revision needed',    classes: 'bg-red-100 text-red-700' },
}

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/print/orders')
        const json = await res.json()
        if (!cancelled && json.success) setOrders(json.data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage your 3D print orders.</p>
          </div>
          <Link href="/service/3d-printing">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-1" /> New order
            </Button>
          </Link>
        </header>

        {loading ? (
          <div className="flex justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center text-center text-gray-500 gap-3">
              <FileBox className="w-10 h-10 text-gray-300" />
              <p className="font-medium text-gray-700">No orders yet</p>
              <p className="text-sm">Upload your first model to get started.</p>
              <Link href="/service/3d-printing">
                <Button className="bg-orange-500 hover:bg-orange-600 mt-2">Start a new order</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => {
              const cfg = STATUS_CONFIG[o.status]
              const firstItem = o.items[0]
              return (
                <Link
                  key={o._id}
                  href={`/service/3d-printing/orders/${o._id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm text-gray-900">{o.orderNumber}</span>
                          <Badge className={cfg.classes + ' border-0'}>{cfg.label}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {firstItem?.file.fileName ?? '—'}
                          {firstItem && (
                            <span className="text-gray-400">
                              {' · '}{firstItem.material.toUpperCase()} × {firstItem.quantity}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(o.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        {o.total > 0 ? (
                          <div className="text-sm font-semibold text-gray-900">
                            ฿{o.total.toLocaleString()}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">Awaiting quote</div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
