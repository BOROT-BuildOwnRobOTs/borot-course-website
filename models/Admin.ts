import mongoose, { Schema, Document, Types } from 'mongoose'

export type AdminRole = 'super' | 'branch'

export interface IAdmin extends Document {
  name: string
  email: string
  password: string
  role: AdminRole
  branch?: Types.ObjectId | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['super', 'branch'],
      default: 'branch',
    },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema)
