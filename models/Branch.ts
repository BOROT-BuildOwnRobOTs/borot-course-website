import mongoose, { Schema, Document } from 'mongoose'

export type BranchStatus = 'active' | 'coming_soon' | 'closed'

export interface IBranch extends Document {
  name: string
  slug: string
  status: BranchStatus
  address?: string
  phone?: string
  note?: string
  createdAt: Date
  updatedAt: Date
}

const BranchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'coming_soon', 'closed'],
      default: 'active',
    },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    note: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema)
