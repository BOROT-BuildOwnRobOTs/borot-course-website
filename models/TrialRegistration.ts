import mongoose, { Schema, Document } from 'mongoose'

export interface ITrialRegistration extends Document {
  studentName: string
  age: number
  phone: string
  courseName: string
  slipUrl: string
  slotId: string
  slotTime: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

const TrialRegistrationSchema = new Schema<ITrialRegistration>(
  {
    studentName: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true },
    courseName: { type: String, required: true },
    slipUrl: { type: String, default: '' },
    slotId: { type: String, required: true },
    slotTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

// Index for quick slot-based queries
TrialRegistrationSchema.index({ slotId: 1, status: 1 })

export default mongoose.models.TrialRegistration ||
  mongoose.model<ITrialRegistration>('TrialRegistration', TrialRegistrationSchema)
