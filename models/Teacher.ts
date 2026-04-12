import mongoose, { Schema, Document } from 'mongoose'

export interface ITeacher extends Document {
  name: string
  email: string
  password: string
  phone?: string
  specialization?: string
  clerkId?: string | null
  createdAt: Date
  updatedAt: Date
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    specialization: { type: String, default: '' },
    clerkId: { type: String, default: null, sparse: true },
  },
  { timestamps: true }
)

export default mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema)
