import mongoose, { Schema, Document } from 'mongoose'

export interface ICourse extends Document {
  name: string
  description?: string
  level: string
  durationWeeks?: number
  createdAt: Date
  updatedAt: Date
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    level: { type: String, default: 'Module 1' },
    durationWeeks: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)
