"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  BookOpen, GraduationCap, Home, LogOut, Mail, Phone, Users, Trophy,
  CheckCircle2, Clock, XCircle, Loader2, CalendarDays, ChevronDown, ChevronUp,
  Video, Star, MessageSquare, RefreshCw, AlertCircle, Upload, ImageIcon,
  X, FileVideo, Trash2, ZoomIn, UserCheck, UserX,
} from "lucide-react"
import Link from "next/link"
import { SLOTS, MAX_PER_SLOT, getNextSlotDateStr, generateStampDates, isSameDay } from "@/lib/slots"
import TeacherView from "./components/TeacherView"
import { getTierInfo, TEACHER_TIERS } from "./components/TeacherTierBadge"

// ── Video compression helper ──────────────────────────────────────────────────
async function compressVideoFile(
  file: File,
  onProgress: (p: number) => void
): Promise<File> {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    const objectUrl = URL.createObjectURL(file)
    video.src = objectUrl
    video.preload = "auto"
    video.muted = true

    video.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file) }

    video.onloadeddata = () => {
      const duration = video.duration
      if (!duration || !isFinite(duration)) { URL.revokeObjectURL(objectUrl); resolve(file); return }

      let stream: MediaStream
      try { stream = (video as any).captureStream(30) }
      catch { URL.revokeObjectURL(objectUrl); resolve(file); return }

      const mimeTypes = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
      let selectedMime = "video/webm"
      for (const mt of mimeTypes) {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mt)) { selectedMime = mt; break }
      }

      let recorder: MediaRecorder
      try {
        recorder = new MediaRecorder(stream, { mimeType: selectedMime, videoBitsPerSecond: 800_000, audioBitsPerSecond: 96_000 })
      } catch { URL.revokeObjectURL(objectUrl); resolve(file); return }

      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

      const progressInterval = setInterval(() => {
        if (video.currentTime && duration) onProgress(Math.min(Math.round((video.currentTime / duration) * 100), 95))
      }, 300)

      recorder.onstop = () => {
        clearInterval(progressInterval)
        URL.revokeObjectURL(objectUrl)
        onProgress(100)
        const blob = new Blob(chunks, { type: selectedMime })
        const ext = selectedMime.includes("mp4") ? "mp4" : "webm"
        resolve(new File([blob], file.name.replace(/\.\w+$/, `.${ext}`), { type: selectedMime }))
      }
      recorder.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file) }

      video.onended = () => recorder.stop()
      recorder.start(250)
      video.play().catch(() => { clearInterval(progressInterval); URL.revokeObjectURL(objectUrl); resolve(file) })
    }
  })
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/upload", { method: "POST", body: formData })
  const j = await res.json()
  if (!j.success) throw new Error(j.error || "Upload failed")
  return j.url
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SlotInfo { day: string; time: string }

interface Reschedule {
  originalDate: string
  newSlot: SlotInfo
  newDate: string
  reason?: string
}

interface Enrollment {
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

interface AttendanceEntry {
  student: string
  studentName: string
  checkedIn: boolean
  checkedInAt?: string
  feedback?: string
  rating?: number
  videoUrl?: string
  imageUrls?: string[]
}

interface SessionData {
  _id: string
  course: string
  courseName: string
  scheduledAt: string
  topic: string
  slot?: SlotInfo
  attendance: AttendanceEntry[]
}

interface SlotAvailability {
  id: string; day: string; dayLabel: string; time: string
  count: number; max: number; available: boolean
}

interface StudentData {
  _id: string
  name: string
  nickname?: string
  age?: number
  enrollments: Enrollment[]
}

interface UserData {
  _id: string
  role: "teacher" | "parent" | "admin"
  name: string
  email: string
  phone?: string
  specialization?: string
  students?: StudentData[]
}

interface TeacherStudentEnrollment {
  course: string
  courseName: string
  courseDurationWeeks?: number
  status: string
  startDate?: string
  slot?: SlotInfo
  reschedules?: Reschedule[]
  teacher?: string
}

interface TeacherStudentData {
  _id: string
  name: string
  enrollments: TeacherStudentEnrollment[]
}

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  active: "กำลังเรียน",
  completed: "จบแล้ว",
  dropped: "ออกกลางคัน",
  pending: "รอเริ่ม",
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  dropped: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <Clock className="h-3.5 w-3.5" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5" />,
  dropped: <XCircle className="h-3.5 w-3.5" />,
  pending: <Clock className="h-3.5 w-3.5" />,
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getSlotLabel(slot: SlotInfo | null | undefined): string {
  if (!slot) return ""
  const found = SLOTS.find((s) => s.day === slot.day && s.time === slot.time)
  return found ? `${found.dayLabel} ${found.time} น.` : `${slot.day} ${slot.time}`
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tierSessionCount, setTierSessionCount] = useState(0)

  // Sessions for parent view
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  // Expanded enrollment stamps
  const [expandedEnrollment, setExpandedEnrollment] = useState<string | null>(null)

  // Status filter for parent view
  const [parentStatusFilter, setParentStatusFilter] = useState<"active" | "completed" | "all">("active")

  // Slot change dialog
  const [slotDialogOpen, setSlotDialogOpen] = useState(false)
  const [slotDialogStudent, setSlotDialogStudent] = useState<StudentData | null>(null)
  const [slotDialogEnrollIdx, setSlotDialogEnrollIdx] = useState(0)
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [newSlotDay, setNewSlotDay] = useState("")
  const [newSlotTime, setNewSlotTime] = useState("")
  const [newStartDate, setNewStartDate] = useState("")
  const [savingSlot, setSavingSlot] = useState(false)

  // Reschedule dialog
  const [reschedDialogOpen, setReschedDialogOpen] = useState(false)
  const [reschedStudent, setReschedStudent] = useState<StudentData | null>(null)
  const [reschedEnrollIdx, setReschedEnrollIdx] = useState(0)
  const [reschedOrigDate, setReschedOrigDate] = useState<Date | null>(null)
  const [reschedNewSlotDay, setReschedNewSlotDay] = useState("")
  const [reschedNewSlotTime, setReschedNewSlotTime] = useState("")
  const [reschedNewDate, setReschedNewDate] = useState("")
  const [reschedReason, setReschedReason] = useState("")
  const [savingResched, setSavingResched] = useState(false)
  const [reschedSlotAvailability, setReschedSlotAvailability] = useState<SlotAvailability[]>([])
  const [loadingReschedSlots, setLoadingReschedSlots] = useState(false)

  // Feedback view dialog (parent)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [feedbackEntry, setFeedbackEntry] = useState<AttendanceEntry | null>(null)
  const [feedbackSessionInfo, setFeedbackSessionInfo] = useState<{ topic: string; date: string } | null>(null)

  // Lightbox for parent feedback images
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem("borot_user")
    if (!raw) {
      router.replace("/login")
      return
    }
    try {
      const parsed = JSON.parse(raw)
      setUser(parsed)
    } catch {
      router.replace("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  // Re-fetch fresh student data from API (to get correct courseDurationWeeks etc.)
  useEffect(() => {
    if (!user || user.role !== "parent") return
    fetch(`/api/parent/students?parentId=${user._id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) {
          const updated = { ...user, students: j.data }
          sessionStorage.setItem("borot_user", JSON.stringify(updated))
          setUser(updated)
        }
      })
      .catch(() => {}) // silently fail, keep existing data
  }, [user?._id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch sessions for parent's students
  useEffect(() => {
    if (!user || user.role !== "parent" || !user.students?.length) return
    const ids = user.students.map((s) => s._id).join(",")
    setLoadingSessions(true)
    fetch(`/api/parent/sessions?studentIds=${ids}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setSessions(j.data) })
      .finally(() => setLoadingSessions(false))
  }, [user])

  const handleLogout = () => {
    sessionStorage.removeItem("borot_user")
    router.push("/")
  }

  // ── Find session for a stamp date ─────────────────────────────────────────
  // Match by originalStampDate OR actualDate (after reschedule) so teacher
  // check-ins on the original-date session still show up on the parent's
  // rescheduled stamp circle.
  const findSessionForStamp = (
    courseId: string,
    studentId: string,
    originalStampDate: Date,
    actualDate?: Date,
  ) => {
    return sessions.find((s) => {
      if (s.course !== courseId) return false
      const sessionDate = new Date(s.scheduledAt)
      const matchOriginal = isSameDay(sessionDate, originalStampDate)
      const matchActual = actualDate ? isSameDay(sessionDate, actualDate) : false
      if (!matchOriginal && !matchActual) return false
      return s.attendance.some((a) => a.student === studentId)
    })
  }

  // ── Open slot change dialog ───────────────────────────────────────────────
  const openSlotDialog = (student: StudentData, enrollIdx: number) => {
    const enroll = student.enrollments[enrollIdx]
    setSlotDialogStudent(student)
    setSlotDialogEnrollIdx(enrollIdx)
    setNewSlotDay(enroll.slot?.day || "")
    setNewSlotTime(enroll.slot?.time || "")
    setNewStartDate(enroll.startDate ? enroll.startDate.slice(0, 10) : "")
    setSlotAvailability([])
    setSlotDialogOpen(true)
    // fetch slot availability
    setLoadingSlots(true)
    fetch(`/api/admin/slots?courseId=${enroll.course}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setSlotAvailability(j.data) })
      .finally(() => setLoadingSlots(false))
  }

  const handleSaveSlot = async () => {
    if (!slotDialogStudent || !newSlotDay || !newSlotTime) return
    setSavingSlot(true)
    const enroll = slotDialogStudent.enrollments[slotDialogEnrollIdx]
    const updatedEnrollments = slotDialogStudent.enrollments.map((e, i) =>
      i === slotDialogEnrollIdx
        ? { ...e, slot: { day: newSlotDay, time: newSlotTime }, startDate: newStartDate ? new Date(newStartDate).toISOString() : e.startDate }
        : e
    )
    try {
      const res = await fetch(`/api/admin/students/${slotDialogStudent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollments: updatedEnrollments }),
      })
      const j = await res.json()
      if (j.success) {
        // Update local sessionStorage user data
        const raw = sessionStorage.getItem("borot_user")
        if (raw) {
          const u = JSON.parse(raw)
          const updatedStudents = u.students.map((s: StudentData) =>
            s._id === slotDialogStudent._id ? { ...s, enrollments: updatedEnrollments } : s
          )
          const updated = { ...u, students: updatedStudents }
          sessionStorage.setItem("borot_user", JSON.stringify(updated))
          setUser(updated)
        }
        setSlotDialogOpen(false)
      }
    } finally {
      setSavingSlot(false)
    }
  }

  // ── Open reschedule dialog ────────────────────────────────────────────────
  const openRescheduleDialog = (student: StudentData, enrollIdx: number, origDate: Date) => {
    const enroll = student.enrollments[enrollIdx]
    setReschedStudent(student)
    setReschedEnrollIdx(enrollIdx)
    setReschedOrigDate(origDate)
    setReschedNewSlotDay(enroll.slot?.day || "")
    setReschedNewSlotTime(enroll.slot?.time || "")
    setReschedNewDate(getNextSlotDateStr(enroll.slot?.day || "saturday"))
    setReschedReason("")
    setReschedSlotAvailability([])
    setReschedDialogOpen(true)
    // Fetch slot availability
    setLoadingReschedSlots(true)
    fetch(`/api/admin/slots?courseId=${enroll.course}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setReschedSlotAvailability(j.data) })
      .finally(() => setLoadingReschedSlots(false))
  }

  const handleSaveReschedule = async () => {
    if (!reschedStudent || !reschedOrigDate || !reschedNewSlotDay || !reschedNewSlotTime || !reschedNewDate) return
    setSavingResched(true)
    try {
      const res = await fetch(`/api/students/${reschedStudent._id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentIndex: reschedEnrollIdx,
          originalDate: reschedOrigDate.toISOString(),
          newSlot: { day: reschedNewSlotDay, time: reschedNewSlotTime },
          newDate: new Date(reschedNewDate).toISOString(),
          reason: reschedReason,
        }),
      })
      const j = await res.json()
      if (j.success) {
        // Reload user data with updated reschedules
        const raw = sessionStorage.getItem("borot_user")
        if (raw) {
          const u = JSON.parse(raw)
          const updatedStudents = u.students.map((s: StudentData) => {
            if (s._id !== reschedStudent._id) return s
            const updEnrollments = s.enrollments.map((e, i) => {
              if (i !== reschedEnrollIdx) return e
              const reschedules = [...(e.reschedules || []).filter(
                (r: Reschedule) => new Date(r.originalDate).toDateString() !== reschedOrigDate.toDateString()
              ), { originalDate: reschedOrigDate.toISOString(), newSlot: { day: reschedNewSlotDay, time: reschedNewSlotTime }, newDate: new Date(reschedNewDate).toISOString(), reason: reschedReason }]
              return { ...e, reschedules }
            })
            return { ...s, enrollments: updEnrollments }
          })
          const updated = { ...u, students: updatedStudents }
          sessionStorage.setItem("borot_user", JSON.stringify(updated))
          setUser(updated)
        }
        setReschedDialogOpen(false)
      }
    } finally {
      setSavingResched(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // ── Computed stats (parent) ───────────────────────────────────────────────
  const allEnrollments: Enrollment[] = (user.students ?? []).flatMap((s) => s.enrollments ?? [])
  const completedCount = allEnrollments.filter((e) => e.status === "completed").length
  const activeCount = allEnrollments.filter((e) => e.status === "active").length

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-24 max-w-5xl">

        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              กลับหน้าแรก
            </Link>
          </Button>
        </div>

        {/* ── Profile Header ─────────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div className="flex items-start gap-5">
              {/* Avatar — teacher gets tier ring, others get plain circle */}
              {user.role === "teacher" ? (() => {
                const { tier: tInfo, percent: tPct } = getTierInfo(tierSessionCount)
                const ringColors = ["#94a3b8", "#6366f1", "#8b5cf6", "#f59e0b"]
                const ringColor = ringColors[tInfo.id - 1]
                const circ = 2 * Math.PI * 42
                return (
                  <div className="relative shrink-0 flex flex-col items-center gap-1.5">
                    <div className="relative" style={{ width: 92, height: 92 }}>
                      {/* Circular progress ring */}
                      <svg width="92" height="92" viewBox="0 0 92 92"
                        className="absolute inset-0"
                        style={{ transform: "rotate(-90deg)" }}
                      >
                        {/* Track */}
                        <circle cx="46" cy="46" r="42" fill="none" stroke="#e2e8f0" strokeWidth="4.5" />
                        {/* Progress */}
                        <circle
                          cx="46" cy="46" r="42"
                          fill="none"
                          stroke={ringColor}
                          strokeWidth="4.5"
                          strokeLinecap="round"
                          strokeDasharray={`${circ}`}
                          strokeDashoffset={`${circ * (1 - tPct / 100)}`}
                          style={{ transition: "stroke-dashoffset 0.8s ease" }}
                        />
                      </svg>
                      {/* Avatar inside ring */}
                      <div className="absolute inset-[7px] rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user.name.charAt(0)}
                      </div>
                    </div>
                    {/* Tier label pill below avatar */}
                    <span
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                      style={{ color: ringColor, borderColor: ringColor + "50", backgroundColor: ringColor + "18" }}
                    >
                      {tInfo.label}
                    </span>
                  </div>
                )
              })() : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <Badge
                    variant="outline"
                    className={
                      user.role === "teacher"
                        ? "border-orange-300 text-orange-600 bg-orange-50"
                        : "border-blue-300 text-blue-600 bg-blue-50"
                    }
                  >
                    {user.role === "teacher" ? (
                      <><GraduationCap className="h-3 w-3 mr-1" /> ครู</>
                    ) : (
                      <><Users className="h-3 w-3 mr-1" /> ผู้ปกครอง</>
                    )}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.role === "teacher" && user.specialization && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{user.specialization}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>

          {/* Summary card (parent only) */}
          {user.role === "parent" && (
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="pt-5 pb-5">
                <div className="grid grid-cols-3 divide-x divide-primary/10 text-center">
                  <div>
                    <p className="text-3xl font-bold text-primary">{user.students?.length ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">นักเรียน</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-500">{activeCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">กำลังเรียน</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-500">{completedCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">จบแล้ว</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Teacher view ───────────────────────────────────────────────── */}
        {user.role === "teacher" && (
          <TeacherView user={user} onSessionCountLoaded={setTierSessionCount} />
        )}

        {/* ── Parent view ────────────────────────────────────────────────── */}
        {user.role === "parent" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">ข้อมูลนักเรียน</h2>
              </div>
              {loadingSessions && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            {/* ── Status Filter ─────────────────────────────────────────── */}
            {user.students && user.students.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium shrink-0">แสดง:</span>
                {(
                  [
                    { value: "active",    label: "🕐 กำลังเรียน", activeClass: "bg-blue-500 text-white border-blue-500" },
                    { value: "completed", label: "✅ จบแล้ว",     activeClass: "bg-green-500 text-white border-green-500" },
                    { value: "all",       label: "ทั้งหมด",        activeClass: "bg-gray-700 text-white border-gray-700" },
                  ] as const
                ).map(({ value, label, activeClass }) => (
                  <button
                    key={value}
                    onClick={() => setParentStatusFilter(value)}
                    className={[
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                      parentStatusFilter === value
                        ? activeClass
                        : "border-gray-200 text-muted-foreground hover:border-gray-400 hover:text-foreground",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {!user.students || user.students.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>ยังไม่มีข้อมูลนักเรียน</p>
                  <p className="text-xs mt-1">ติดต่อผู้ดูแลระบบเพื่อเพิ่มข้อมูล</p>
                </CardContent>
              </Card>
            ) : (
              user.students.map((student) => {
                const allEnrollsForStudent = student.enrollments ?? []
                const filteredEnrollments = parentStatusFilter === "all"
                  ? allEnrollsForStudent
                  : allEnrollsForStudent.filter((e) => e.status === parentStatusFilter)

                const total = allEnrollsForStudent.length
                const done = allEnrollsForStudent.filter((e) => e.status === "completed").length
                const progress = total > 0 ? Math.round((done / total) * 100) : 0

                // Hide student card entirely if no enrollments match filter
                if (filteredEnrollments.length === 0 && parentStatusFilter !== "all") return null

                return (
                  <Card key={student._id} className="border-2 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-lg leading-tight">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.nickname && `(${student.nickname})`}
                              {student.age && ` อายุ ${student.age} ปี`}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{filteredEnrollments.length} คอร์ส</Badge>
                      </div>
                      {total > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                            <div className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /><span>ความคืบหน้าโดยรวม</span></div>
                            <span className="font-semibold">{done}/{total} คอร์ส ({progress}%)</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {filteredEnrollments.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">ยังไม่ได้ลงทะเบียนคอร์ส</p>
                      ) : (
                        filteredEnrollments.map((enroll, enrollIdx) => {
                          // Get real index in original array for slot/reschedule dialog
                          const realEnrollIdx = allEnrollsForStudent.indexOf(enroll)
                          const enrollKey = `${student._id}-${enrollIdx}`
                          const isExpanded = expandedEnrollment === enrollKey
                          const stamps = enroll.startDate && enroll.slot && (enroll.courseDurationWeeks || 0) > 0
                            ? generateStampDates(enroll.startDate, enroll.courseDurationWeeks!, enroll.slot)
                            : []
                          const now = new Date()

                          return (
                            <div key={enrollIdx} className="border rounded-xl overflow-hidden">
                              {/* Enrollment header */}
                              <div className="flex items-start justify-between bg-muted/20 px-4 py-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <BookOpen className="h-4 w-4 text-primary shrink-0" />
                                    <span className="text-sm font-semibold">{enroll.courseName}</span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[enroll.status]}`}>
                                      {STATUS_ICONS[enroll.status]}{STATUS_LABELS[enroll.status]}
                                    </span>
                                  </div>
                                  {/* Slot info */}
                                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    {enroll.slot ? (
                                      <span className="text-xs text-purple-600 flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full">
                                        <CalendarDays className="h-3 w-3" />{getSlotLabel(enroll.slot)}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />ยังไม่ได้เลือก slot
                                      </span>
                                    )}
                                    {enroll.startDate && (
                                      <span className="text-xs text-muted-foreground">
                                        เริ่ม {new Date(enroll.startDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => openSlotDialog(student, realEnrollIdx)}
                                      className="text-xs text-blue-500 hover:text-blue-700 underline"
                                    >
                                      {enroll.slot ? "เปลี่ยน slot" : "เลือก slot"}
                                    </button>
                                  </div>
                                </div>
                                {stamps.length > 0 && (
                                  <button
                                    onClick={() => setExpandedEnrollment(isExpanded ? null : enrollKey)}
                                    className="flex items-center gap-1 text-xs text-primary ml-2 shrink-0"
                                  >
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    <span>{stamps.length} ครั้ง</span>
                                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                  </button>
                                )}
                              </div>

                              {/* Session stamps */}
                              {isExpanded && stamps.length > 0 && (
                                <div className="px-4 pt-3 pb-4 bg-white">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                    ตารางเรียนทั้งหมด {stamps.length} ครั้ง
                                  </p>
                                  <div className="flex flex-wrap gap-3">
                                    {stamps.map((stampDate, stampIdx) => {
                                      const reschedule = enroll.reschedules?.find(
                                        (r) => isSameDay(new Date(r.originalDate), stampDate)
                                      )
                                      const actualDate = reschedule ? new Date(reschedule.newDate) : stampDate
                                      // Pass both originalStampDate and actualDate so we can match the session
                                      // regardless of whether the parent has rescheduled this stamp or not.
                                      const session = findSessionForStamp(enroll.course, student._id, stampDate, actualDate)
                                      const attendance = session?.attendance.find((a) => a.student === student._id)
                                      const isToday = isSameDay(actualDate, new Date())
                                      const isPast = actualDate < new Date() && !isToday
                                      const isFuture = !isPast && !isToday
                                      const isCheckedIn = attendance?.checkedIn === true
                                      const hasFeedback = !!(attendance?.feedback || attendance?.videoUrl || (attendance?.imageUrls && attendance.imageUrls.length > 0) || (attendance?.rating && attendance.rating > 0))
                                      // ถ้า checkin แล้ว (สีเขียว) สามารถคลิกดู feedback ได้เสมอ
                                      const isClickable = isCheckedIn || (!isCheckedIn && (isFuture || isToday))

                                      const circleStyle = isCheckedIn
                                        ? "bg-green-500 text-white shadow-md shadow-green-200"
                                        : isToday
                                        ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                                        : isPast
                                        ? "bg-red-100 text-red-400 border-2 border-red-300"
                                        : "bg-gray-100 text-gray-400 border-2 border-gray-300"

                                      return (
                                        <div key={stampIdx} className="flex flex-col items-center gap-1">
                                          <div className="relative">
                                            <button
                                              onClick={() => {
                                                if (isCheckedIn) {
                                                  // คลิก stamp สีเขียวได้เสมอ ไม่ว่าจะมี feedback หรือไม่
                                                  setFeedbackEntry(attendance!)
                                                  setFeedbackSessionInfo({ topic: session?.topic || "", date: actualDate.toLocaleDateString("th-TH") })
                                                  setFeedbackDialogOpen(true)
                                                } else if (!isCheckedIn && (isFuture || isToday)) {
                                                  openRescheduleDialog(student, realEnrollIdx, stampDate)
                                                }
                                              }}
                                              disabled={!isClickable}
                                              title={
                                                isCheckedIn ? (hasFeedback ? "ดู Feedback จากครู" : "ดูข้อมูลการเข้าเรียน")
                                                : (!isCheckedIn && (isFuture || isToday)) ? "เปลี่ยนวันเรียน"
                                                : undefined
                                              }
                                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all
                                                ${circleStyle}
                                                ${reschedule ? "ring-2 ring-orange-400 ring-offset-1" : ""}
                                                ${isClickable ? "hover:scale-110 cursor-pointer" : "cursor-default"}
                                              `}
                                            >
                                              {stampIdx + 1}
                                            </button>
                                            {/* Feedback badge */}
                                            {isCheckedIn && hasFeedback && (
                                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                                                <MessageSquare className="h-2.5 w-2.5 text-white" />
                                              </span>
                                            )}
                                            {/* Reschedule badge */}
                                            {reschedule && (
                                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center shadow-sm">
                                                <RefreshCw className="h-2.5 w-2.5 text-white" />
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[9px] text-center text-muted-foreground leading-tight max-w-[48px]">
                                            {actualDate.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                  {/* Legend */}
                                  <div className="flex gap-4 mt-4 pt-3 border-t flex-wrap">
                                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                      <div className="w-3.5 h-3.5 rounded-full bg-green-500 shrink-0" />เข้าเรียนแล้ว
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                      <div className="w-3.5 h-3.5 rounded-full bg-red-100 border-2 border-red-300 shrink-0" />ขาดเรียน
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                      <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0" />วันนี้
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                      <div className="w-3.5 h-3.5 rounded-full bg-gray-100 border-2 border-gray-300 shrink-0" />ยังไม่ถึง
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>

    {/* ── Slot change dialog ──────────────────────────────────────────────── */}
    <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เลือก Slot เวลาเรียน</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>เลือก Slot</Label>
              {loadingSlots && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(slotAvailability.length > 0 ? slotAvailability : SLOTS.map((s) => ({
                id: s.id, day: s.day, dayLabel: s.dayLabel, time: s.time, count: 0, max: MAX_PER_SLOT, available: true,
              }))).map((slot) => {
                const isSelected = newSlotDay === slot.day && newSlotTime === slot.time
                const isFull = slot.count >= slot.max && !isSelected
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => {
                      if (isSelected) { setNewSlotDay(""); setNewSlotTime("") }
                      else { setNewSlotDay(slot.day); setNewSlotTime(slot.time); if (!newStartDate) setNewStartDate(getNextSlotDateStr(slot.day)) }
                    }}
                    className={`relative text-center px-2 py-2.5 rounded-lg border text-xs transition-all ${
                      isSelected ? "bg-purple-500 text-white border-purple-500" : isFull ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed" : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    <div className="font-semibold">{slot.dayLabel}</div>
                    <div className="text-[10px] mt-0.5 opacity-80">{slot.time}</div>
                    <div className={`text-[10px] mt-1 font-medium ${isSelected ? "text-white/80" : isFull ? "text-red-400" : "text-green-600"}`}>
                      {slot.count}/{slot.max} ที่นั่ง
                    </div>
                    {isFull && <span className="absolute top-1 right-1 text-[9px] bg-red-100 text-red-500 px-1 rounded">เต็ม</span>}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <Label>วันเริ่มเรียนครั้งแรก</Label>
            {user && (user.role === "admin" || user.role === "teacher") ? (
              <Input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} className="mt-1" />
            ) : (
              <div className="mt-1 px-3 py-2 rounded-md border bg-muted/40 text-sm text-muted-foreground">
                {newStartDate
                  ? new Date(newStartDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
                  : "ยังไม่ได้กำหนด"}
                <p className="text-xs mt-0.5 text-muted-foreground/70">* แก้ไขได้โดยแอดมิน/ครูเท่านั้น</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSlotDialogOpen(false)}>ยกเลิก</Button>
          <Button onClick={handleSaveSlot} disabled={savingSlot || !newSlotDay} className="bg-purple-500 hover:bg-purple-600 text-white">
            {savingSlot ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />กำลังบันทึก...</> : "บันทึก Slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* ── Reschedule dialog ───────────────────────────────────────────────── */}
    <Dialog open={reschedDialogOpen} onOpenChange={setReschedDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เปลี่ยนวันเรียน</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {reschedOrigDate && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
              วันเดิม: {reschedOrigDate.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>เลือก Slot ใหม่</Label>
              {loadingReschedSlots && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(reschedSlotAvailability.length > 0
                ? reschedSlotAvailability
                : SLOTS.map((s) => ({ id: s.id, day: s.day, dayLabel: s.dayLabel, time: s.time, count: 0, max: MAX_PER_SLOT, available: true }))
              ).map((slot) => {
                const isSelected = reschedNewSlotDay === slot.day && reschedNewSlotTime === slot.time
                const remaining = slot.max - slot.count
                const isFull = remaining <= 0
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => {
                      setReschedNewSlotDay(slot.day)
                      setReschedNewSlotTime(slot.time)
                      setReschedNewDate(getNextSlotDateStr(slot.day))
                    }}
                    className={`relative text-center px-2 py-2.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? "bg-orange-500 text-white border-orange-500"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    <div className="font-semibold">{slot.dayLabel}</div>
                    <div className="text-[10px] mt-0.5 opacity-80">{slot.time}</div>
                    {reschedSlotAvailability.length > 0 && (
                      <div className={`flex items-center justify-center gap-0.5 mt-1 text-[10px] font-medium ${
                        isSelected ? "text-white/80" : isFull ? "text-red-500" : slot.count >= 5 ? "text-orange-500" : "text-green-600"
                      }`}>
                        <Users className="h-2.5 w-2.5" />
                        <span>{slot.count}/{slot.max} คน</span>
                      </div>
                    )}
                    {isFull && reschedSlotAvailability.length > 0 && (
                      <span className="absolute top-1 right-1 text-[9px] bg-red-100 text-red-500 px-1 rounded">เต็ม</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <Label>วันที่ใหม่</Label>
            <Input type="date" value={reschedNewDate} onChange={(e) => setReschedNewDate(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>เหตุผล (ไม่บังคับ)</Label>
            <Input value={reschedReason} onChange={(e) => setReschedReason(e.target.value)} placeholder="เช่น ป่วย / ติดธุระ" className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setReschedDialogOpen(false)}>ยกเลิก</Button>
          <Button onClick={handleSaveReschedule} disabled={savingResched || !reschedNewSlotDay || !reschedNewDate} className="bg-orange-500 hover:bg-orange-600 text-white">
            {savingResched ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />กำลังบันทึก...</> : "ยืนยันเปลี่ยนวัน"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* ── Feedback view dialog (parent) ───────────────────────────────────── */}
    <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>รายละเอียดการเรียน</DialogTitle>
        </DialogHeader>
        {feedbackEntry && (
          <div className="space-y-4">
            {/* Session info */}
            {feedbackSessionInfo && (
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-medium">{feedbackSessionInfo.topic || "ไม่ระบุหัวข้อ"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{feedbackSessionInfo.date}</p>
              </div>
            )}

            {/* Check-in status */}
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <div>
                <span className="font-medium">เข้าเรียนแล้ว</span>
                {feedbackEntry.checkedInAt && (
                  <span className="text-xs text-green-500 ml-2">
                    เวลา {new Date(feedbackEntry.checkedInAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            {feedbackEntry.rating && feedbackEntry.rating > 0 ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">คะแนนจากครู</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < (feedbackEntry.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                  ))}
                  <span className="text-sm font-semibold ml-1 text-yellow-600">{feedbackEntry.rating}/5</span>
                </div>
              </div>
            ) : null}

            {/* Feedback text */}
            {feedbackEntry.feedback ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">ความคิดเห็นจากครู</p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-gray-700">{feedbackEntry.feedback}</div>
              </div>
            ) : null}

            {/* Images */}
            {feedbackEntry.imageUrls && feedbackEntry.imageUrls.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" />รูปภาพ</p>
                <div className="flex flex-wrap gap-2">
                  {feedbackEntry.imageUrls.map((url, i) => (
                    <img key={i} src={url} alt="" onClick={() => setLightboxImg(url)} className="w-20 h-20 object-cover rounded-lg border cursor-zoom-in hover:opacity-80 transition-opacity" />
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {feedbackEntry.videoUrl && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Video className="h-3.5 w-3.5" />วิดีโอการเรียน</p>
                <video src={feedbackEntry.videoUrl} controls className="w-full rounded-lg border max-h-48" />
              </div>
            )}

            {/* No feedback message */}
            {!feedbackEntry.feedback && !feedbackEntry.videoUrl && !(feedbackEntry.imageUrls && feedbackEntry.imageUrls.length > 0) && !(feedbackEntry.rating && feedbackEntry.rating > 0) && (
              <div className="text-center py-4 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">ยังไม่มี feedback จากครู</p>
                <p className="text-xs mt-1 opacity-70">ครูจะเพิ่ม feedback ภายหลัง</p>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => setFeedbackDialogOpen(false)}>ปิด</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
    {lightboxImg && (
      <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
        <img src={lightboxImg} alt="" className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
        <button onClick={() => setLightboxImg(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
    )}
    </>
  )
}
