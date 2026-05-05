import mongoose, { Schema, Document, Types } from 'mongoose'
import { PRINT_JOB_STATUSES, type PrintJobStatus } from '@/lib/print-enums'

export { PRINT_JOB_STATUSES }
export type { PrintJobStatus }

export interface IPrintJob extends Document {
  order: Types.ObjectId           // ref PrintOrder
  orderNumber: string             // denormalized for queue rendering without populate
  itemId: Types.ObjectId          // PrintItem._id within the order
  printerName: string             // free-form for MVP (single printer expected); becomes Printer ref in phase 2
  position: number                // queue ordering; sparse spacing (10, 20, 30) for cheap reorders
  status: PrintJobStatus
  estStartAt?: Date
  estEndAt?: Date
  startedAt?: Date
  endedAt?: Date
  failureReason?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const PrintJobSchema = new Schema<IPrintJob>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'PrintOrder', required: true, index: true },
    orderNumber: { type: String, required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    printerName: { type: String, required: true, index: true },
    position: { type: Number, required: true },
    status: { type: String, enum: PRINT_JOB_STATUSES, default: 'queued', index: true },
    estStartAt: { type: Date },
    estEndAt: { type: Date },
    startedAt: { type: Date },
    endedAt: { type: Date },
    failureReason: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
)

// Queue rendering: list jobs for a printer in order
PrintJobSchema.index({ printerName: 1, position: 1 })

const PrintJob =
  (mongoose.models.PrintJob as mongoose.Model<IPrintJob>) ||
  mongoose.model<IPrintJob>('PrintJob', PrintJobSchema)

export default PrintJob
