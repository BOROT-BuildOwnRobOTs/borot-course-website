"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  AlertCircle, BookOpen, CalendarDays, CheckCircle2, ChevronDown,
  ChevronUp, Clock, Loader2, MessageSquare, RefreshCw, Trophy, Users, XCircle,
} from "lucide-react"
import { SLOTS, generateStampDates, isSameDay } from "@/lib/slots"
import {
  UserData, StudentData, SessionData, Enrollment, AttendanceEntry, Reschedule,
} from "../types"
import { STATUS_LABELS, STATUS_COLORS } from "../types"
import SlotDialog from "./SlotDialog"
import RescheduleDialog from "./RescheduleDialog"
import FeedbackDialog from "./FeedbackDialog"

// STATUS_ICONS defined locally (needs JSX)
const STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <Clock className="h-3.5 w-3.5" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5" />,
  dropped: <XCircle className="h-3.5 w-3.5" />,
  pending: <Clock className="h-3.5 w-3.5" />,
}

function getSlotLabel(slot: { day: string; time: string } | null | undefined): string {
  if (!slot) return ""
  const found = SLOTS.find((s) => s.day === slot.day && s.time === slot.time)
  return found ? `${found.dayLabel} ${found.time} น.` : `${slot.day} ${slot.time}`
}

interface Props {
  user: UserData
  setUser: (user: UserData) => void
  sessions: SessionData[]
  loadingSessions: boolean
}

export default function ParentView({ user, setUser, sessions, loadingSessions }: Props) {
  const [expandedEnrollment, setExpandedEnrollment] = useState<string | null>(null)
  const [parentStatusFilter, setParentStatusFilter] = useState<"active" | "completed" | "all">("active")

  // Slot dialog state
  const [slotDialogOpen, setSlotDialogOpen] = useState(false)
  const [slotDialogStudent, setSlotDialogStudent] = useState<StudentData | null>(null)
  const [slotDialogEnrollIdx, setSlotDialogEnrollIdx] = useState(0)

  // Reschedule dialog state
  const [reschedDialogOpen, setReschedDialogOpen] = useState(false)
  const [reschedStudent, setReschedStudent] = useState<StudentData | null>(null)
  const [reschedEnrollIdx, setReschedEnrollIdx] = useState(0)
  const [reschedOrigDate, setReschedOrigDate] = useState<Date | null>(null)

  // Feedback dialog state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [feedbackEntry, setFeedbackEntry] = useState<AttendanceEntry | null>(null)
  const [feedbackSessionInfo, setFeedbackSessionInfo] = useState<{ topic: string; date: string } | null>(null)

  // ── Find session for a stamp date ─────────────────────────────────────────
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

  // ── Slot saved callback ───────────────────────────────────────────────────
  const handleSlotSaved = (studentId: string, updatedEnrollments: Enrollment[]) => {
    const raw = sessionStorage.getItem("borot_user")
    if (!raw) return
    const u = JSON.parse(raw)
    const updatedStudents = u.students.map((s: StudentData) =>
      s._id === studentId ? { ...s, enrollments: updatedEnrollments } : s
    )
    const updated = { ...u, students: updatedStudents }
    sessionStorage.setItem("borot_user", JSON.stringify(updated))
    setUser(updated)
  }

  // ── Reschedule saved callback ─────────────────────────────────────────────
  const handleRescheduleSaved = (data: {
    studentId: string
    enrollIdx: number
    originalDate: Date
    newSlot: { day: string; time: string }
    newDate: Date
    reason: string
  }) => {
    const raw = sessionStorage.getItem("borot_user")
    if (!raw) return
    const u = JSON.parse(raw)
    const updatedStudents = u.students.map((s: StudentData) => {
      if (s._id !== data.studentId) return s
      const updEnrollments = s.enrollments.map((e: Enrollment, i: number) => {
        if (i !== data.enrollIdx) return e
        const reschedules = [
          ...(e.reschedules || []).filter(
            (r: Reschedule) => new Date(r.originalDate).toDateString() !== data.originalDate.toDateString()
          ),
          {
            originalDate: data.originalDate.toISOString(),
            newSlot: data.newSlot,
            newDate: data.newDate.toISOString(),
            reason: data.reason,
          },
        ]
        return { ...e, reschedules }
      })
      return { ...s, enrollments: updEnrollments }
    })
    const updated = { ...u, students: updatedStudents }
    sessionStorage.setItem("borot_user", JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">ข้อมูลนักเรียน</h2>
        </div>
        {loadingSessions && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Status Filter */}
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

      {/* Empty state */}
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
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" />
                        <span>ความคืบหน้าโดยรวม</span>
                      </div>
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
                    const realEnrollIdx = allEnrollsForStudent.indexOf(enroll)
                    const enrollKey = `${student._id}-${enrollIdx}`
                    const isExpanded = expandedEnrollment === enrollKey
                    const stamps = enroll.startDate && enroll.slot && (enroll.courseDurationWeeks || 0) > 0
                      ? generateStampDates(enroll.startDate, enroll.courseDurationWeeks!, enroll.slot)
                      : []

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
                                onClick={() => {
                                  setSlotDialogStudent(student)
                                  setSlotDialogEnrollIdx(realEnrollIdx)
                                  setSlotDialogOpen(true)
                                }}
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
                                const session = findSessionForStamp(enroll.course, student._id, stampDate, actualDate)
                                const attendance = session?.attendance.find((a) => a.student === student._id)
                                const isToday = isSameDay(actualDate, new Date())
                                const isPast = actualDate < new Date() && !isToday
                                const isFuture = !isPast && !isToday
                                const isCheckedIn = attendance?.checkedIn === true
                                const hasFeedback = !!(
                                  attendance?.feedback ||
                                  attendance?.videoUrl ||
                                  (attendance?.imageUrls && attendance.imageUrls.length > 0) ||
                                  (attendance?.rating && attendance.rating > 0)
                                )
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
                                            setFeedbackEntry(attendance!)
                                            setFeedbackSessionInfo({
                                              topic: session?.topic || "",
                                              date: actualDate.toLocaleDateString("th-TH"),
                                            })
                                            setFeedbackDialogOpen(true)
                                          } else if (!isCheckedIn && (isFuture || isToday)) {
                                            setReschedStudent(student)
                                            setReschedEnrollIdx(realEnrollIdx)
                                            setReschedOrigDate(stampDate)
                                            setReschedDialogOpen(true)
                                          }
                                        }}
                                        disabled={!isClickable}
                                        title={
                                          isCheckedIn
                                            ? hasFeedback ? "ดู Feedback จากครู" : "ดูข้อมูลการเข้าเรียน"
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

      {/* Dialogs */}
      <SlotDialog
        open={slotDialogOpen}
        onClose={() => setSlotDialogOpen(false)}
        student={slotDialogStudent}
        enrollIdx={slotDialogEnrollIdx}
        userRole={user.role}
        onSaved={handleSlotSaved}
      />

      <RescheduleDialog
        open={reschedDialogOpen}
        onClose={() => setReschedDialogOpen(false)}
        student={reschedStudent}
        enrollIdx={reschedEnrollIdx}
        origDate={reschedOrigDate}
        onSaved={handleRescheduleSaved}
      />

      <FeedbackDialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        entry={feedbackEntry}
        sessionInfo={feedbackSessionInfo}
      />
    </div>
  )
}
