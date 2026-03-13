import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IAttendance {
  student: Types.ObjectId
  studentName: string
  checkedIn: boolean
  checkedInAt?: Date
  feedback?: string
  rating?: number
  videoUrl?: string
  imageUrls?: string[]
  artworkImageUrl?: string
  artworkName?: string
  artworkDescription?: string
}

export interface ISession extends Document {
  course: Types.ObjectId
  courseName: string
  teacher: Types.ObjectId
  teacherName: string
  scheduledAt: Date
  topic: string
  notes?: string
  slot?: { day: string; time: string }
  attendance: IAttendance[]
  createdAt: Date
  updatedAt: Date
}

const AttendanceSchema = new Schema<IAttendance>({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date },
  feedback: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5 },
  videoUrl: { type: String, default: '' },
  imageUrls: { type: [String], default: [] },
  artworkImageUrl: { type: String, default: '' },
  artworkName: { type: String, default: '' },
  artworkDescription: { type: String, default: '' },
})

const SessionSchema = new Schema<ISession>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    courseName: { type: String, required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    teacherName: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    topic: { type: String, required: true },
    notes: { type: String, default: '' },
    slot: {
      day: { type: String },
      time: { type: String },
    },
    attendance: [AttendanceSchema],
  },
  { timestamps: true }
)

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)
