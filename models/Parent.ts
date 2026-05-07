import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IParent extends Document {
  name: string
  email: string
  password: string
  phone?: string
  branch?: Types.ObjectId | null
  clerkId?: string | null
  createdAt: Date
  updatedAt: Date
}

const ParentSchema = new Schema<IParent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
    clerkId: { type: String, default: null, sparse: true },
  },
  { timestamps: true }
)

export default mongoose.models.Parent || mongoose.model<IParent>('Parent', ParentSchema)
