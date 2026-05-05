'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Loader2, ArrowUp, ArrowDown, Trash2, Printer, Clock, RefreshCw,
} from 'lucide-react'
import { PRINT_JOB_STATUSES, type PrintJobStatus } from '@/lib/print-enums'

interface PrintJobRow {
  _id: string
  order: string
  orderNumber: string
  itemId: string
  printerName: string
  position: number
  status: PrintJobStatus
  estStartAt?: string
  estEndAt?: string
  startedAt?: string
  endedAt?: string
  notes?: string
  failureReason?: string
}

const STATUS_BADGE: Record<PrintJobStatus, string> = {
  queued:   'bg-gray-100 text-gray-700 border-gray-200',
  printing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  done:     'bg-green-100 text-green-700 border-green-200',
  failed:   'bg-red-100 text-red-700 border-red-200',
  paused:   'bg-amber-100 text-amber-700 border-amber-200',
}

export default function PrintQueueTab() {
  const [jobs, setJobs] = useState<PrintJobRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/print-jobs')
      const json = await res.json()
      if (json.success) setJobs(json.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  // Group by printer, preserve sort order from server (printerName, position)
  const groups = useMemo(() => {
    const m = new Map<string, PrintJobRow[]>()
    for (const j of jobs) {
      if (!m.has(j.printerName)) m.set(j.printerName, [])
      m.get(j.printerName)!.push(j)
    }
    return Array.from(m.entries()).map(([printer, list]) => ({ printer, list }))
  }, [jobs])

  const moveJob = async (job: PrintJobRow, direction: 'up' | 'down') => {
    const sameLane = jobs.filter((j) => j.printerName === job.printerName).sort((a, b) => a.position - b.position)
    const idx = sameLane.findIndex((j) => j._id === job._id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sameLane.length) return
    const other = sameLane[swapIdx]

    setBusyId(job._id)
    try {
      // Two PATCHes — non-atomic but fine for MVP. The unique-position constraint
      // would force a temp value if we had one, but we don't, so straight swap works.
      const [r1, r2] = await Promise.all([
        fetch(`/api/admin/print-jobs/${job._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position: other.position }),
        }),
        fetch(`/api/admin/print-jobs/${other._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position: job.position }),
        }),
      ])
      const j1 = await r1.json()
      const j2 = await r2.json()
      if (!j1.success || !j2.success) {
        toast.error('Failed to reorder')
        return
      }
      // Update local state
      setJobs((prev) => prev.map((x) => {
        if (x._id === job._id) return { ...x, position: other.position }
        if (x._id === other._id) return { ...x, position: job.position }
        return x
      }))
    } finally {
      setBusyId(null)
    }
  }

  const updateStatus = async (job: PrintJobRow, status: PrintJobStatus) => {
    setBusyId(job._id)
    try {
      const res = await fetch(`/api/admin/print-jobs/${job._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? 'Failed to update'); return }
      setJobs((prev) => prev.map((x) => (x._id === job._id ? { ...x, ...json.data } : x)))
      toast.success(`Status → ${status}`)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (job: PrintJobRow) => {
    if (!confirm(`Remove ${job.orderNumber} from the queue?`)) return
    setBusyId(job._id)
    try {
      const res = await fetch(`/api/admin/print-jobs/${job._id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? 'Failed to remove'); return }
      setJobs((prev) => prev.filter((x) => x._id !== job._id))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print queue
          </h2>
          <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading && jobs.length === 0 ? (
          <div className="flex justify-center py-10 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No jobs in queue. Add one from the Orders tab.
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(({ printer, list }) => (
              <div key={printer}>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-medium text-gray-900">{printer}</span>
                  <span className="text-xs text-gray-500">({list.length} job{list.length !== 1 ? 's' : ''})</span>
                </div>
                <div className="space-y-2">
                  {list.map((job, i) => {
                    const isFirst = i === 0
                    const isLast = i === list.length - 1
                    const busy = busyId === job._id
                    return (
                      <div
                        key={job._id}
                        className="border rounded-lg p-3 bg-white flex items-center gap-3 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveJob(job, 'up')}
                            disabled={isFirst || busy}
                            className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                            aria-label="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveJob(job, 'down')}
                            disabled={isLast || busy}
                            className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                            aria-label="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="font-mono text-xs text-gray-500 w-10 text-center">#{i + 1}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm text-gray-900">{job.orderNumber}</span>
                            <Badge className={STATUS_BADGE[job.status] + ' border'}>{job.status}</Badge>
                          </div>
                          {(job.startedAt || job.estEndAt) && (
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {job.startedAt && <>started {new Date(job.startedAt).toLocaleTimeString('en-GB')}</>}
                              {job.estEndAt && <>· ETA {new Date(job.estEndAt).toLocaleTimeString('en-GB')}</>}
                            </div>
                          )}
                          {job.failureReason && (
                            <div className="text-xs text-red-700 mt-0.5">{job.failureReason}</div>
                          )}
                        </div>

                        <Select
                          value={job.status}
                          onValueChange={(v) => updateStatus(job, v as PrintJobStatus)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PRINT_JOB_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(job)}
                          disabled={busy}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          aria-label="Remove from queue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
