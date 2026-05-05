import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import PrintJob, { PRINT_JOB_STATUSES, type PrintJobStatus } from '@/models/PrintJob'

// PHASE 2 SECURITY: see note in app/api/admin/print-orders/route.ts.

export const dynamic = 'force-dynamic'

const PatchSchema = z.object({
  status: z.enum(PRINT_JOB_STATUSES).optional(),
  position: z.number().int().min(0).optional(),
  printerName: z.string().min(1).max(60).optional(),
  notes: z.string().max(500).optional(),
  estStartAt: z.string().datetime().optional(),
  estEndAt: z.string().datetime().optional(),
  failureReason: z.string().max(500).optional(),
})

// PATCH /api/admin/print-jobs/[id]
// Used both for status transitions and for queue reordering (client sends new position).
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid job id' }, { status: 400 })
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
    const job = await PrintJob.findById(id)
    if (!job) return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 })

    if (data.status !== undefined) {
      const now = new Date()
      job.status = data.status
      if (data.status === 'printing' && !job.startedAt) job.startedAt = now
      if ((data.status === 'done' || data.status === 'failed') && !job.endedAt) job.endedAt = now
    }
    if (data.position !== undefined) job.position = data.position
    if (data.printerName !== undefined) job.printerName = data.printerName
    if (data.notes !== undefined) job.notes = data.notes
    if (data.estStartAt !== undefined) job.estStartAt = new Date(data.estStartAt)
    if (data.estEndAt !== undefined) job.estEndAt = new Date(data.estEndAt)
    if (data.failureReason !== undefined) job.failureReason = data.failureReason

    await job.save()
    return NextResponse.json({ success: true, data: job.toObject() })
  } catch (err) {
    console.error('[admin print-jobs PATCH] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to update job' }, { status: 500 })
  }
}

// DELETE /api/admin/print-jobs/[id]
export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid job id' }, { status: 400 })
  }
  try {
    await connectDB()
    const result = await PrintJob.findByIdAndDelete(id)
    if (!result) return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin print-jobs DELETE] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to delete job' }, { status: 500 })
  }
}
