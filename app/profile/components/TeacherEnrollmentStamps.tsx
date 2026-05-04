"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, CalendarDays, ChevronDown, ChevronUp, Clock, AlertCircle, Users, CheckCircle2, Trophy } from "lucide-react"
import { generateStampDates, isSameDay, SLOTS, getNextSlotDateStr, isTwoHourTime, getConstituentSlotTimes, getTwoHourSlotOptions, getSlotLabel as libGetSlotLabel, MAX_PER_SLOT } from "@/lib/slots"
import StampCircle from "./StampCircle"
import StampLegend from "./StampLegend"
import TeacherStampDialog from "./TeacherStampDialog"
import type { TeacherStudentData, TeacherStudentEnrollment, SessionData, AttendanceEntry } from "../types"
import { STATUS_LABELS, STATUS_COLORS } from "../types"

// Reschedule dialog imports
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

// Day options for reschedule day selector
const RESCHED_DAY_OPTIONS = [
  { value: "tuesday", label: "Tuesday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
]

interface Props {
  student: TeacherStudentData
  enrollment: TeacherStudentEnrollment
  enrollIdx: number
  sessions: SessionData[]
  teacherId: string
  onSessionsUpdate: (updater: (prev: SessionData[]) => SessionData[]) => void
  onSessionAdd: (session: SessionData) => void
  onStudentUpdate?: (studentId: string, updatedEnrollments: TeacherStudentEnrollment[]) => void
}

function getSlotLabel(slot: { day: string; time: string } | undefined): string {
  if (!slot) return ""
  return libGetSlotLabel(slot as any)
}

function findSessionForStamp(
  sessions: SessionData[],
  courseId: string,
  studentId: string,
  originalStampDate: Date,
  actualDate?: Date
): SessionData | undefined {
  // Use actualDate as the definitive date to match against.
  // For non-rescheduled stamps actualDate === originalStampDate.
  // For rescheduled stamps actualDate is the NEW date — we must NOT match on
  // the original date, otherwise a session created on the rescheduled date can
  // also be picked up by a different stamp whose original date happens to
  // coincide, causing "double green bubbles".
  const targetDate = actualDate || originalStampDate
  return sessions.find((s) => {
    if (String(s.course) !== String(courseId)) return false
    const sessionDate = new Date(s.scheduledAt)
    if (!isSameDay(sessionDate, targetDate)) return false
    return s.attendance.some((a) => String(a.student) === String(studentId))
  })
}

export default function TeacherEnrollmentStamps({
  student, enrollment, enrollIdx, sessions, teacherId, onSessionsUpdate, onSessionAdd, onStudentUpdate,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [stampDialogOpen, setStampDialogOpen] = useState(false)
  const [selectedStampIdx, setSelectedStampIdx] = useState(0)
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null)
  const [selectedAttendee, setSelectedAttendee] = useState<AttendanceEntry | null>(null)
  const [selectedStampDate, setSelectedStampDate] = useState<Date | null>(null)
  const [selectedOrigStampDate, setSelectedOrigStampDate] = useState<Date | null>(null)

  // Reschedule state
  const [reschedOpen, setReschedOpen] = useState(false)
  const [reschedOrigDate, setReschedOrigDate] = useState<Date | null>(null)
  const [reschedNewSlotDay, setReschedNewSlotDay] = useState("")
  const [reschedNewSlotTime, setReschedNewSlotTime] = useState("")
  const [reschedNewDate, setReschedNewDate] = useState("")
  const [reschedReason, setReschedReason] = useState("")
  const [rescheduleRemaining, setRescheduleRemaining] = useState(false)
  const [savingResched, setSavingResched] = useState(false)
  const [reschedSlotAvailability, setReschedSlotAvailability] = useState<{
    id: string; day: string; dayLabel: string; time: string; count: number; max: number; available: boolean
  }[]>([])
  const [loadingReschedSlots, setLoadingReschedSlots] = useState(false)
  const [reschedSelectedDay, setReschedSelectedDay] = useState("")
  const [reschedDurationTab, setReschedDurationTab] = useState<"1hr" | "2hr">("1hr")

  // Complete course state
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false)
  const [completingCourse, setCompletingCourse] = useState(false)

  const stamps = enrollment.startDate && enrollment.slot && (enrollment.courseDurationWeeks || 0) > 0
    ? generateStampDates(enrollment.startDate, enrollment.courseDurationWeeks!, enrollment.slot)
    : []

  const now = new Date()
  const enrollKey = `${student._id}-${enrollIdx}`

  // ── Compute total attended hours across all stamps ─────────────────────────
  const totalAttendedHours = stamps.reduce((sum, d) => {
    const r = enrollment.reschedules?.find((re) =>
      new Date(re.originalDate).toDateString() === d.toDateString()
    )
    const actual = r ? new Date(r.newDate) : d
    const ses = findSessionForStamp(sessions, enrollment.course, student._id, d, actual)
    const att = ses?.attendance.find((a) => a.student === student._id)
    return sum + (att?.attendedHours ?? 0)
  }, 0)

  const courseHours = enrollment.courseHours ?? 0

  // Count how many stamps are checked in
  const checkedInCount = stamps.filter((d) => {
    const r = enrollment.reschedules?.find((re) =>
      new Date(re.originalDate).toDateString() === d.toDateString()
    )
    const actual = r ? new Date(r.newDate) : d
    const ses = findSessionForStamp(sessions, enrollment.course, student._id, d, actual)
    const att = ses?.attendance.find((a) => a.student === student._id)
    return att?.checkedIn === true
  }).length

  // Can complete when:
  // 1. courseHours is set → totalAttendedHours >= courseHours
  // 2. courseHours is 0/unset → all stamps have been checked in
  const canComplete =
    enrollment.status === "active" &&
    stamps.length > 0 &&
    (
      (courseHours > 0 && totalAttendedHours >= courseHours) ||
      (courseHours === 0 && checkedInCount === stamps.length)
    )

  // ── Complete course handler ────────────────────────────────────────────────
  const handleCompleteCourse = async () => {
    setCompletingCourse(true)
    try {
      const res = await fetch("/api/teacher/complete-enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student._id, enrollmentIndex: enrollIdx }),
      })
      const j = await res.json()
      if (j.success) {
        setCompleteConfirmOpen(false)
        // Reload page so the updated status is reflected correctly everywhere
        window.location.reload()
      }
    } finally {
      setCompletingCourse(false)
    }
  }

  const handleStampClick = (stampIdx: number, stampDate: Date, actualDate: Date) => {
    const session = findSessionForStamp(sessions, enrollment.course, student._id, stampDate, actualDate)
    const attendance = session?.attendance.find((a) => a.student === student._id)
    setSelectedStampIdx(stampIdx)
    setSelectedSession(session || null)
    setSelectedAttendee(attendance || null)
    setSelectedStampDate(actualDate)
    setSelectedOrigStampDate(stampDate)
    setStampDialogOpen(true)
  }

  const handleCheckinToggle = async (sessionId: string, studentId: string, checkedIn: boolean) => {
    const res = await fetch(`/api/admin/sessions/${sessionId}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, checkedIn }),
    })
    const j = await res.json()
    if (j.success) {
      onSessionsUpdate((prev) =>
        prev.map((s) =>
          s._id !== sessionId ? s : {
            ...s,
            attendance: s.attendance.map((a) =>
              a.student !== studentId ? a : {
                ...a, checkedIn,
                checkedInAt: checkedIn ? new Date().toISOString() : undefined,
              }
            ),
          }
        )
      )
      setSelectedAttendee((prev) => prev ? { ...prev, checkedIn, checkedInAt: checkedIn ? new Date().toISOString() : undefined } : prev)
    }
  }

  const handleCheckinRetroactive = async (
    courseId: string, courseName: string, studentId: string, scheduledAt: string, checkedIn: boolean
  ): Promise<SessionData | null> => {
    const res = await fetch("/api/teacher/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, courseName, teacherId, studentId, scheduledAt, checkedIn }),
    })
    const j = await res.json()
    if (j.success && j.data) {
      const newSession = j.data as SessionData
      onSessionAdd(newSession)
      setSelectedSession(newSession)
      const att = newSession.attendance.find((a) => a.student === studentId)
      if (att) setSelectedAttendee(att)
      return newSession
    }
    return null
  }

  const handleFeedbackSaved = async (
    sessionId: string, studentId: string, feedback: string, rating: number, videoUrl: string, imageUrls: string[], artworkImageUrl: string, artworkName: string, artworkDescription: string, attendedHours: number
  ) => {
    const res = await fetch(`/api/admin/sessions/${sessionId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, feedback, rating: rating || undefined, videoUrl, imageUrls, artworkImageUrl, artworkName, artworkDescription, attendedHours }),
    })
    const j = await res.json()
    if (j.success) {
      // The feedback API auto-sets checkedIn = true on the backend,
      // so we also update the local state to reflect this.
      onSessionsUpdate((prev) =>
        prev.map((s) =>
          s._id !== sessionId ? s : {
            ...s,
            attendance: s.attendance.map((a) =>
              a.student !== studentId ? a : {
                ...a,
                feedback,
                rating: rating || undefined,
                videoUrl,
                imageUrls,
                artworkImageUrl,
                artworkName,
                artworkDescription,
                attendedHours,
                checkedIn: true,
                checkedInAt: a.checkedInAt || new Date().toISOString(),
              }
            ),
          }
        )
      )
      // Also update the selected attendee so the dialog reflects the check-in
      setSelectedAttendee((prev) =>
        prev ? {
          ...prev,
          feedback,
          rating: rating || undefined,
          videoUrl,
          imageUrls,
          artworkImageUrl,
          artworkName,
          artworkDescription,
          attendedHours,
          checkedIn: true,
          checkedInAt: prev.checkedInAt || new Date().toISOString(),
        } : prev
      )
    }
  }

  // Reschedule handlers
  const openReschedule = (origDate: Date) => {
    const currentTime = enrollment.slot?.time || ""
    setReschedOrigDate(origDate)
    setReschedNewSlotDay(enrollment.slot?.day || "")
    setReschedNewDate(getNextSlotDateStr(enrollment.slot?.day || "saturday"))
    setReschedReason("")
    setRescheduleRemaining(false)
    setReschedSlotAvailability([])
    setReschedSelectedDay(enrollment.slot?.day || "tuesday")

    // Detect if enrollment slot OR any existing reschedule is 2hr
    let detectedTwoHr = isTwoHourTime(currentTime)
    let twoHrTime = ""
    if (!detectedTwoHr && enrollment.reschedules?.length) {
      for (const r of enrollment.reschedules as any[]) {
        if (isTwoHourTime(r.newSlot?.time)) {
          detectedTwoHr = true
          twoHrTime = r.newSlot.time
          break
        }
      }
    }
    setReschedDurationTab(detectedTwoHr ? "2hr" : "1hr")
    setReschedNewSlotTime(twoHrTime || currentTime)

    setReschedOpen(true)
    // Fetch slot availability
    setLoadingReschedSlots(true)
    fetch(`/api/admin/slots?courseId=${enrollment.course}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setReschedSlotAvailability(j.data) })
      .finally(() => setLoadingReschedSlots(false))
  }

  // Count remaining sessions from the selected date onward (for the UI label)
  const remainingSessionsCount = reschedOrigDate
    ? stamps.filter((s) => s.getTime() >= reschedOrigDate.getTime() - 12 * 60 * 60 * 1000).length
    : 0

  const handleSaveReschedule = async () => {
    if (!reschedOrigDate || !reschedNewSlotDay || !reschedNewSlotTime || !reschedNewDate) return
    setSavingResched(true)
    try {
      const res = await fetch(`/api/students/${student._id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentIndex: enrollIdx,
          originalDate: reschedOrigDate.toISOString(),
          newSlot: { day: reschedNewSlotDay, time: reschedNewSlotTime },
          newDate: new Date(reschedNewDate).toISOString(),
          reason: reschedReason,
          rescheduleRemaining,
        }),
      })
      const j = await res.json()
      if (j.success) {
        setReschedOpen(false)
        // Update local state so stamps reflect the change immediately
        if (onStudentUpdate) {
          const updatedEnrollments = student.enrollments.map((e, i) => {
            if (i !== enrollIdx) return e

            if (rescheduleRemaining) {
              // Bulk: apply offset to all remaining stamp dates
              const origDateObj = reschedOrigDate
              const newDateObj = new Date(reschedNewDate)
              const offsetMs = newDateObj.getTime() - origDateObj.getTime()
              const remainingStamps = stamps.filter(
                (s) => s.getTime() >= origDateObj.getTime() - 12 * 60 * 60 * 1000
              )
              // Remove old reschedules for these dates, then add new ones
              const remainingDateStrs = new Set(remainingStamps.map((s) => s.toDateString()))
              const existingRescheds = (e.reschedules || []).filter(
                (r) => !remainingDateStrs.has(new Date(r.originalDate).toDateString())
              )
              const newRescheds = remainingStamps.map((stampDate) => ({
                originalDate: stampDate.toISOString(),
                newSlot: { day: reschedNewSlotDay, time: reschedNewSlotTime },
                newDate: new Date(stampDate.getTime() + offsetMs).toISOString(),
                reason: reschedReason,
              }))
              return { ...e, reschedules: [...existingRescheds, ...newRescheds] }
            } else {
              // Single reschedule
              const origStr = reschedOrigDate.toDateString()
              const existingRescheds = (e.reschedules || []).filter(
                (r) => new Date(r.originalDate).toDateString() !== origStr
              )
              return {
                ...e,
                reschedules: [
                  ...existingRescheds,
                  {
                    originalDate: reschedOrigDate.toISOString(),
                    newSlot: { day: reschedNewSlotDay, time: reschedNewSlotTime },
                    newDate: new Date(reschedNewDate).toISOString(),
                    reason: reschedReason,
                  },
                ],
              }
            }
          })
          onStudentUpdate(student._id, updatedEnrollments)
        }
      }
    } finally {
      setSavingResched(false)
    }
  }

  return (
    <>
      <div className={`border rounded-xl overflow-hidden ${canComplete ? "ring-2 ring-green-400 border-green-300" : ""}`}>
        {/* Enrollment header */}
        <div className={`flex items-start justify-between px-4 py-3 ${canComplete ? "bg-green-50/60" : "bg-muted/20"}`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <BookOpen className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-semibold">{enrollment.courseName}</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${canComplete ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"}`}>
                {totalAttendedHours}/{courseHours} hrs
                {canComplete && <CheckCircle2 className="h-3 w-3 ml-0.5" />}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[enrollment.status] || ""}`}>
                <Clock className="h-3.5 w-3.5" />{STATUS_LABELS[enrollment.status] || enrollment.status}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {enrollment.slot ? (
                <span className="text-xs text-purple-600 flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full">
                  <CalendarDays className="h-3 w-3" />{getSlotLabel(enrollment.slot)}
                </span>
              ) : (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />No slot selected
                </span>
              )}
              {enrollment.startDate && (
                <span className="text-xs text-muted-foreground">
                  Start: {new Date(enrollment.startDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
          {stamps.length > 0 && (
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-primary ml-2 shrink-0">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{stamps.length} sessions</span>
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        {/* ── Complete Course Banner ────────────────────────────────────────── */}
        {canComplete && (
          <div className="px-4 py-3 bg-green-50 border-t border-green-200 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-green-700">
              <Trophy className="h-4 w-4 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold leading-tight">🎉 เรียนครบแล้ว!</p>
                <p className="text-xs text-green-600 mt-0.5">
                  {courseHours > 0
                    ? <>นักเรียนเช็คอินครบ <strong>{totalAttendedHours} ชั่วโมง</strong> ตามหลักสูตร {courseHours} ชั่วโมง</>
                    : <>นักเรียนเช็คอินครบทุก session แล้ว (<strong>{checkedInCount}/{stamps.length} sessions</strong>)</>
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setCompleteConfirmOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-semibold shadow-sm transition-all shrink-0"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete Course
            </button>
          </div>
        )}

        {/* Session stamps */}
        {expanded && stamps.length > 0 && (
          <div className="px-4 pt-3 pb-4 bg-white">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Full Schedule — {stamps.length} sessions
            </p>
            <div className="flex flex-wrap gap-3">
              {stamps.map((stampDate, stampIdx) => {
                const reschedule = enrollment.reschedules?.find(
                  (r) => isSameDay(new Date(r.originalDate), stampDate)
                )
                const actualDate = reschedule ? new Date(reschedule.newDate) : stampDate
                const session = findSessionForStamp(sessions, enrollment.course, student._id, stampDate, actualDate)
                const attendance = session?.attendance.find((a) => a.student === student._id)
                const isToday = isSameDay(actualDate, now)
                const isPast = actualDate < now && !isToday
                const isCheckedIn = attendance?.checkedIn === true
                const hasFeedback = !!(attendance?.feedback || attendance?.videoUrl || attendance?.artworkName || attendance?.artworkImageUrl)

                return (
                  <StampCircle
                    key={stampIdx}
                    stampNumber={stampIdx + 1}
                    date={actualDate}
                    isToday={isToday}
                    isPast={isPast}
                    isCheckedIn={isCheckedIn}
                    hasFeedback={hasFeedback}
                    isRescheduled={!!reschedule}
                    isClickable={true}
                    onClick={() => handleStampClick(stampIdx, stampDate, actualDate)}
                  />
                )
              })}
            </div>
            <StampLegend />
          </div>
        )}
      </div>

      {/* Stamp check-in/feedback dialog */}
      <TeacherStampDialog
        open={stampDialogOpen}
        onOpenChange={setStampDialogOpen}
        session={selectedSession}
        attendee={selectedAttendee}
        stampDate={selectedStampDate}
        stampNumber={selectedStampIdx + 1}
        courseId={enrollment.course}
        courseName={enrollment.courseName}
        teacherId={teacherId}
        studentId={student._id}
        studentName={student.name}
        onCheckinToggle={handleCheckinToggle}
        onCheckinRetroactive={handleCheckinRetroactive}
        onFeedbackSaved={handleFeedbackSaved}
        onReschedule={selectedOrigStampDate ? () => openReschedule(selectedOrigStampDate) : undefined}
      />

      {/* Reschedule dialog */}
      <Dialog open={reschedOpen} onOpenChange={setReschedOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {reschedOrigDate && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
                Original date: {reschedOrigDate.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
            )}

            {/* Duration Tab Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setReschedDurationTab("1hr")
                  setReschedNewSlotTime("")
                }}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                  reschedDurationTab === "1hr"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ⏱ 1 Hour
              </button>
              <button
                type="button"
                onClick={() => {
                  setReschedDurationTab("2hr")
                  setReschedNewSlotTime("")
                }}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                  reschedDurationTab === "2hr"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ⏱⏱ 2 Hours
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Select New Day</Label>
                {loadingReschedSlots && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </div>
              {/* Day dropdown */}
              <div className="relative">
                <select
                  value={reschedSelectedDay}
                  onChange={(e) => {
                    const newDay = e.target.value
                    setReschedSelectedDay(newDay)
                    // Clear time selection when changing day (unless same day)
                    if (newDay !== reschedNewSlotDay) {
                      setReschedNewSlotTime("")
                      setReschedNewSlotDay("")
                    }
                    // Update date to next occurrence of the selected day
                    setReschedNewDate(getNextSlotDateStr(newDay))
                  }}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm font-medium focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer"
                >
                  {RESCHED_DAY_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Time slots for selected day */}
            {reschedSelectedDay && (
              <div>
                <Label className="mb-2 block">
                  Select Time — <span className="text-orange-600 font-semibold">{RESCHED_DAY_OPTIONS.find((d) => d.value === reschedSelectedDay)?.label}</span>
                  {reschedDurationTab === "2hr" && (
                    <span className="ml-1 text-[11px] text-gray-400 font-normal">(2-hour block)</span>
                  )}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(() => {
                    const rawSlotList = reschedSlotAvailability.length > 0
                      ? reschedSlotAvailability
                      : SLOTS.map((s) => ({ id: s.id, day: s.day, dayLabel: s.dayLabel, time: s.time, count: 0, max: 8, available: true }))

                    if (reschedDurationTab === "1hr") {
                      return rawSlotList.filter((slot) => slot.day === reschedSelectedDay)
                    } else {
                      const twoHourOptions = getTwoHourSlotOptions()
                      const dayTwoHourOptions = twoHourOptions.filter((s) => s.day === reschedSelectedDay)
                      const availMap = new Map<string, typeof rawSlotList[0]>()
                      for (const s of rawSlotList) {
                        availMap.set(`${s.day}|${s.time}`, s)
                      }
                      return dayTwoHourOptions.map((twoHr) => {
                        const slotsData = twoHr.constituentSlots.map((cs) =>
                          availMap.get(`${twoHr.day}|${cs.time}`) || { id: `${twoHr.day}-${cs.time}`, day: twoHr.day, dayLabel: twoHr.dayLabel, time: cs.time, count: 0, max: MAX_PER_SLOT, available: true }
                        )
                        const combinedCount = Math.max(...slotsData.map((s) => s.count))
                        const combinedAvailable = slotsData.every((s) => s.count < s.max)
                        return {
                          id: twoHr.id,
                          day: twoHr.day,
                          dayLabel: twoHr.dayLabel,
                          time: twoHr.time,
                          count: combinedCount,
                          max: MAX_PER_SLOT,
                          available: combinedAvailable,
                        }
                      })
                    }
                  })().map((slot) => {
                    const isSelected = reschedNewSlotDay === slot.day && reschedNewSlotTime === slot.time
                    const remaining = slot.max - slot.count
                    const isFull = remaining <= 0
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isFull}
                        onClick={() => {
                          setReschedNewSlotDay(slot.day)
                          setReschedNewSlotTime(slot.time)
                          setReschedNewDate(getNextSlotDateStr(slot.day))
                        }}
                        className={`relative text-center px-2 py-3 rounded-lg border text-xs transition-all ${
                          isSelected
                            ? "bg-orange-500 text-white border-orange-500 shadow-md"
                            : isFull
                            ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                            : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                        }`}
                      >
                        <div className="font-semibold text-sm">{slot.time}</div>
                        {reschedSlotAvailability.length > 0 && (
                          <div className={`flex items-center justify-center gap-0.5 mt-1.5 text-[10px] font-medium ${
                            isSelected ? "text-white/80" : isFull ? "text-red-500" : slot.count >= 5 ? "text-orange-500" : "text-green-600"
                          }`}>
                            <Users className="h-2.5 w-2.5" />
                            <span>{slot.count}/{slot.max}</span>
                          </div>
                        )}
                        {isFull && reschedSlotAvailability.length > 0 && (
                          <span className="absolute top-1 right-1 text-[9px] bg-red-100 text-red-500 px-1 rounded">Full</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <div>
              <Label>New Date</Label>
              <Input type="date" value={reschedNewDate} onChange={(e) => setReschedNewDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Reason (optional)</Label>
              <Input value={reschedReason} onChange={(e) => setReschedReason(e.target.value)} placeholder="e.g. Sick / Unavailable" className="mt-1" />
            </div>
            {/* Reschedule all remaining option */}
            {remainingSessionsCount > 1 && (
              <div
                onClick={() => setRescheduleRemaining(!rescheduleRemaining)}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  rescheduleRemaining
                    ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`mt-0.5 h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                  rescheduleRemaining
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300 bg-white"
                }`}>
                  {rescheduleRemaining && (
                    <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${rescheduleRemaining ? "text-blue-700" : "text-gray-700"}`}>
                    เลื่อนที่เหลือทั้งหมด
                  </p>
                  <p className={`text-xs mt-0.5 ${rescheduleRemaining ? "text-blue-600" : "text-muted-foreground"}`}>
                    Reschedule all {remainingSessionsCount} remaining sessions with the same offset
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReschedOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveReschedule} disabled={savingResched || !reschedNewSlotDay || !reschedNewDate} className="bg-orange-500 hover:bg-orange-600 text-white">
              {savingResched ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : rescheduleRemaining ? `Reschedule ${remainingSessionsCount} Sessions` : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Complete Course Confirmation Dialog ────────────────────────────── */}
      <Dialog open={completeConfirmOpen} onOpenChange={setCompleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <Trophy className="h-5 w-5 text-green-500" />
              Complete Course
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-sm shrink-0">
                  {(student.name?.trim().charAt(0) || "?").toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-green-800">{student.name}</p>
                  <p className="text-xs text-green-600">{enrollment.courseName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <p className="text-sm text-green-700">
                  {courseHours > 0
                    ? <>เช็คอินครบ <strong>{totalAttendedHours} ชั่วโมง</strong> จากทั้งหมด {courseHours} ชั่วโมง</>
                    : <>เช็คอินครบทุก session <strong>{checkedInCount}/{stamps.length} sessions</strong></>
                  }
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              การกด <strong>Confirm</strong> จะเปลี่ยนสถานะหลักสูตรนี้เป็น <strong className="text-green-600">Completed</strong> และไม่สามารถย้อนกลับได้ผ่านหน้านี้
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCompleteConfirmOpen(false)}
              disabled={completingCourse}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteCourse}
              disabled={completingCourse}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {completingCourse ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Completing...</>
              ) : (
                <><CheckCircle2 className="h-4 w-4 mr-2" />Confirm Complete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
