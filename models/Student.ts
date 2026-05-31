import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ISlotInfo {
  day: string
  time: string
}

export interface IReschedule {
  originalDate: Date
  newSlot: ISlotInfo
  newDate: Date
  reason?: string
}

export interface IEnrollment {
  course: Types.ObjectId
  courseName: string
  courseLevel?: string
  courseDurationWeeks?: number
  teacher?: Types.ObjectId
  teacherName?: string
  status: 'active' | 'completed' | 'dropped' | 'pending'
  startDate?: Date
  endDate?: Date
  progress?: number
  slot?: ISlotInfo
  reschedules?: IReschedule[]
}

export interface IStudent extends Document {
  name: string
  age?: number
  nickname?: string
  parent: Types.ObjectId
  branch?: Types.ObjectId | null
  enrollments: IEnrollment[]
  notes?: string
  portfolioShareToken?: string
  portfolioSharedAt?: Date
  portfolioAssessment?: {
    data: any
    sessionsCount: number
    generatedAt: Date
  } | null
  createdAt: Date
  updatedAt: Date
}

const RescheduleSchema = new Schema<IReschedule>(
  {
    originalDate: { type: Date, required: true },
    newSlot: {
      day: { type: String, required: true },
      time: { type: String, required: true },
    },
    newDate: { type: Date, required: true },
    reason: { type: String, default: '' },
  },
  { _id: false }
)

const EnrollmentSchema = new Schema<IEnrollment>({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  courseName: { type: String, required: true },
  courseLevel: { type: String, default: '' },
  courseDurationWeeks: { type: Number, default: 0 },
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  teacherName: { type: String, default: '' },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'pending'],
    default: 'pending',
  },
  startDate: { type: Date },
  endDate: { type: Date },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  slot: {
    day: { type: String },
    time: { type: String },
  },
  reschedules: { type: [RescheduleSchema], default: [] },
})

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    age: { type: Number },
    nickname: { type: String, default: '' },
    parent: { type: Schema.Types.ObjectId, ref: 'Parent', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
    enrollments: [EnrollmentSchema],
    notes: { type: String, default: '' },
    portfolioShareToken: { type: String, default: null, index: true },
    portfolioSharedAt: { type: Date, default: null },
    portfolioAssessment: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
)

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema)
