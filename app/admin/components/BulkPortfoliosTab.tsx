'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import {
  Loader2, Sparkles, Download, CheckCircle2, XCircle, AlertTriangle, FileText,
} from 'lucide-react'

type RowStatus = 'idle' | 'running' | 'done' | 'error'

interface BulkRow {
  studentId: string
  name: string
  nickname: string
  ready: boolean
  works: number
  comments: number
  missing: string[]
  hasAssessment: boolean
  generatedAt: string | null
}

export default function BulkPortfoliosTab() {
  const [rows, setRows] = useState<BulkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Per-student generation status + which row is downloading
  const [status, setStatus] = useState<Record<string, RowStatus>>({})
  const [downloading, setDownloading] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    fetch('/api/admin/portfolio-bulk')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setRows(j.data)
        else setError(j.error || 'Failed to load')
      })
      .catch((e) => setError(e?.message || 'Network error'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const counts = useMemo(() => {
    const ready = rows.filter((r) => r.ready).length
    const generated = rows.filter((r) => r.hasAssessment).length
    return { ready, notReady: rows.length - ready, generated, total: rows.length }
  }, [rows])

  const generateOne = async (id: string): Promise<boolean> => {
    setStatus((s) => ({ ...s, [id]: 'running' }))
    try {
      const res = await fetch('/api/portfolio/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id }),
      })
      const j = await res.json()
      if (j.success && j.data) {
        setStatus((s) => ({ ...s, [id]: 'done' }))
        setRows((rs) =>
          rs.map((r) =>
            r.studentId === id ? { ...r, hasAssessment: true, generatedAt: new Date().toISOString() } : r
          )
        )
        return true
      }
      setStatus((s) => ({ ...s, [id]: 'error' }))
      return false
    } catch {
      setStatus((s) => ({ ...s, [id]: 'error' }))
      return false
    }
  }

  // Sequential — single GPU can only run one at a time.
  const generateAll = async () => {
    const eligible = rows.filter((r) => r.ready)
    if (eligible.length === 0 || running) return
    setRunning(true)
    setProgress({ done: 0, total: eligible.length })
    for (let i = 0; i < eligible.length; i++) {
      await generateOne(eligible[i].studentId)
      setProgress({ done: i + 1, total: eligible.length })
    }
    setRunning(false)
  }

  const download = async (row: BulkRow) => {
    setDownloading(row.studentId)
    try {
      const res = await fetch(`/api/portfolio?studentId=${row.studentId}`)
      const j = await res.json()
      if (!j.success || !j.data) throw new Error(j.error || 'Failed to load portfolio')
      const { generatePortfolioPdf } = await import('@/lib/portfolio-pdf')
      await generatePortfolioPdf(j.data)
    } catch (e) {
      console.error(e)
      alert('Could not generate PDF — please try again.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-orange-500" />
          <div>
            <h2 className="text-2xl font-bold">Bulk Portfolios</h2>
            <p className="text-xs text-muted-foreground">
              Generate AI portfolio assessments for every student in one place
            </p>
          </div>
        </div>
        <Button
          onClick={generateAll}
          disabled={running || counts.ready === 0}
          className="gap-2 text-white"
          style={{ background: 'linear-gradient(135deg, #E5690D, #FF8C00)' }}
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {running
            ? `Generating ${progress?.done ?? 0}/${progress?.total ?? 0}…`
            : `Generate All Eligible (${counts.ready})`}
        </Button>
      </div>

      {/* Summary counts */}
      {!loading && !error && (
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline" className="gap-1 border-green-300 text-green-700 bg-green-50">
            <CheckCircle2 className="h-3.5 w-3.5" /> Ready: {counts.ready}
          </Badge>
          <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700 bg-amber-50">
            <AlertTriangle className="h-3.5 w-3.5" /> Not ready: {counts.notReady}
          </Badge>
          <Badge variant="outline" className="gap-1 border-blue-300 text-blue-700 bg-blue-50">
            <FileText className="h-3.5 w-3.5" /> Generated: {counts.generated}
          </Badge>
          <span className="text-muted-foreground self-center">· {counts.total} students</span>
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading students & checking eligibility…</p>
        </div>
      )}
      {error && (
        <div className="py-10 text-center text-red-500 text-sm">{error}</div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Works</TableHead>
                <TableHead className="text-center">Comments</TableHead>
                <TableHead>Eligibility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Portfolio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const st = status[r.studentId] || 'idle'
                return (
                  <TableRow key={r.studentId} className={r.ready ? '' : 'opacity-60'}>
                    <TableCell className="font-medium">
                      {r.name}
                      {r.nickname && <span className="text-muted-foreground"> ({r.nickname})</span>}
                    </TableCell>
                    <TableCell className="text-center">{r.works}</TableCell>
                    <TableCell className="text-center">{r.comments}</TableCell>
                    <TableCell>
                      {r.ready ? (
                        <Badge variant="outline" className="gap-1 border-green-300 text-green-700 bg-green-50">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700 bg-amber-50">
                          <AlertTriangle className="h-3.5 w-3.5" /> Needs {r.missing.join(' & ')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {st === 'running' && (
                        <span className="inline-flex items-center gap-1.5 text-orange-600 text-sm">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…
                        </span>
                      )}
                      {st === 'done' && (
                        <span className="inline-flex items-center gap-1.5 text-green-600 text-sm">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </span>
                      )}
                      {st === 'error' && (
                        <span className="inline-flex items-center gap-1.5 text-red-500 text-sm">
                          <XCircle className="h-3.5 w-3.5" /> Failed
                        </span>
                      )}
                      {st === 'idle' && (
                        <span className="text-xs text-muted-foreground">
                          {r.hasAssessment ? 'Previously generated' : '—'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={!r.hasAssessment || downloading === r.studentId}
                        onClick={() => download(r)}
                      >
                        {downloading === r.studentId
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Download className="h-3.5 w-3.5" />}
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Generation runs one student at a time (shared GPU) — keep this tab open while it works.
        Students missing a photo/project or a teacher comment are skipped.
      </p>
    </div>
  )
}
