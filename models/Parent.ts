import mongoose, { Schema, Document } from 'mongoose'

export interface IParent extends Document {
  name: string
  email: string
  password: string
  phone?: string
  userId?: string       // Clerk user ID (e.g. user_xxx) — links Clerk account to this parent
  createdAt: Date
  updatedAt: Date
}

const ParentSchema = new Schema<IParent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    userId: { type: String, default: null, sparse: true },  // Clerk user ID
  },
  { timestamps: true }
)

export default mongoose.models.Parent || mongoose.model<IParent>('Parent', ParentSchema)
