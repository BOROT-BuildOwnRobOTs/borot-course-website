import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IParent extends Document {
  name: string
  email?: string | null
  password?: string | null
  phone?: string
  branch?: Types.ObjectId | null
  clerkId?: string | null
  createdAt: Date
  updatedAt: Date
}

const ParentSchema = new Schema<IParent>(
  {
    name: { type: String, required: true },
    // Email is optional so admins can pre-create a parent record and fill in
    // the contact details later. Sparse + unique allows multiple "no email yet"
    // records while still preventing duplicate real emails.
    email: { type: String, required: false, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String, required: false },
    phone: { type: String, default: '' },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
    clerkId: { type: String, default: null, sparse: true },
  },
  { timestamps: true }
)

const Parent =
  (mongoose.models.Parent as mongoose.Model<IParent>) ||
  mongoose.model<IParent>('Parent', ParentSchema)

// One-time-per-process: drop any stale (non-sparse) email index left over from an
// earlier schema version, then rebuild indexes to match the current schema.
// syncIndexes() is idempotent and cheap after the first run.
declare global {
  // eslint-disable-next-line no-var
  var __parentIndexesSynced: boolean | undefined
}
if (!global.__parentIndexesSynced) {
  global.__parentIndexesSynced = true
  Parent.syncIndexes().catch((e) => {
    global.__parentIndexesSynced = false // allow retry on next import if it failed
    console.error('[Parent] syncIndexes failed:', e)
  })
}

export default Parent
