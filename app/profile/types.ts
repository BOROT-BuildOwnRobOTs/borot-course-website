export interface SlotInfo {
  day: string
  time: string
}

export interface Reschedule {
  originalDate: string
  newSlot: SlotInfo
  newDate: string
  reason?: string
}

export interface Enrollment {
  course: string
  courseName: string
  courseLevel?: string
  courseDurationWeeks?: number
  status: "active" | "completed" | "dropped" | "pending"
  progress?: number
  startDate?: string
  slot?: SlotInfo
  reschedules?: Reschedule[]
}

export interface AttendanceEntry {
  student: string
  studentName: string
  checkedIn: boolean
  checkedInAt?: string
  feedback?: string
  rating?: number
  videoUrl?: string
  imageUrls?: string[]
}

export interface SessionData {
  _id: string
  course: string
  courseName: string
  scheduledAt: string
  topic: string
  slot?: SlotInfo
  attendance: AttendanceEntry[]
}

export interface SlotAvailability {
  id: string
  day: string
  dayLabel: string
  time: string
  count: number
  max: number
  available: boolean
}

export interface StudentData {
  _id: string
  name: string
  nickname?: string
  age?: number
  enrollments: Enrollment[]
}

export interface UserData {
  _id: string
  role: "teacher" | "parent" | "admin"
  name: string
  email: string
  phone?: string
  specialization?: string
  students?: StudentData[]
}

export interface TeacherStudentEnrollment {
  course: string
  courseName: string
  courseDurationWeeks?: number
  status: string
  startDate?: string
  slot?: SlotInfo
  reschedules?: Reschedule[]
  teacher?: string
}

export interface TeacherStudentData {
  _id: string
  name: string
  nickname?: string
  age?: number
  enrollments: TeacherStudentEnrollment[]
}

// Status helpers
export const STATUS_LABELS: Record<string, string> = {
  active: "กำลังเรียน",
  completed: "จบแล้ว",
  dropped: "ออกกลางคัน",
  pending: "รอเริ่ม",
}

export const STATUS_COLORS: Record<string, string> = {
  active: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  dropped: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
}
