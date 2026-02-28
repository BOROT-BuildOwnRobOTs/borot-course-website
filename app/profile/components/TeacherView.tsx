"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  BookOpen, CalendarDays, Loader2, Users, Trophy, Clock, FilterX,
} from "lucide-react"
import TeacherEnrollmentStamps from "./TeacherEnrollmentStamps"
import type { UserData, TeacherStudentData, SessionData } from "../types"
import { SLOTS } from "@/lib/slots"

interface TeacherViewProps {
  user: UserData
  onSessionCountLoaded?: (count: number) => void
}

// All possible slot combos
const ALL_SLOTS = SLOTS.map((s) => ({ id: s.id, day: s.day, dayLabel: s.dayLabel, time: s.time }))

const DAY_COLOR: Record<string, string> = {
  saturday: "orange",
  sunday:   "purple",
}

const DAY_STYLES: Record<string, { card: string; activeCard: string; badge: string; btn: string; activeBtn: string }> = {
  saturday: {
    card:       "border-orange-200 bg-orange-50/40",
    activeCard: "border-orange-400 bg-orange-100 shadow-md ring-2 ring-orange-300",
    badge:      "bg-orange-100 text-orange-700 border-orange-200",
    btn:        "border-orange-200 text-orange-700 hover:bg-orange-50",
    activeBtn:  "bg-orange-500 text-white hover:bg-orange-600",
  },
  sunday: {
    card:       "border-purple-200 bg-purple-50/40",
    activeCard: "border-purple-400 bg-purple-100 shadow-md ring-2 ring-purple-300",
    badge:      "bg-purple-100 text-purple-700 border-purple-200",
    btn:        "border-purple-200 text-purple-700 hover:bg-purple-50",
    activeBtn:  "bg-purple-500 text-white hover:bg-purple-600",
  },
}

export default function TeacherView({ user, onSessionCountLoaded }: TeacherViewProps) {
  const [students, setStudents] = useState<TeacherStudentData[]>([])
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"active" | "completed" | "all">("active")
  const [systemStats, setSystemStats] = useState<{ totalAll: number; totalActive: number } | null>(null)

  // Fetch system-wide student stats (same for all teachers)
  useEffect(() => {
    fetch("/api/teacher/stats")
      .then((r) => r.json())
      .then((j) => { if (j.success) setSystemStats(j.data) })
  }, [])

  // Fetch students with enrollments for this teacher
  useEffect(() => {
    setLoadingStudents(true)
    fetch(`/api/teacher/students?teacherId=${user._id}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setStudents(j.data) })
      .finally(() => setLoadingStudents(false))
  }, [user._id])

  // Fetch all sessions for this teacher
  useEffect(() => {
    setLoadingSessions(true)
    fetch(`/api/teacher/sessions?teacherId=${user._id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setSessions(j.data)
      })
      .finally(() => setLoadingSessions(false))
  }, [user._id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Compute tier score: sum of courseDurationWeeks for all COMPLETED enrollments
  // of students this teacher has taught (each week = 1 session = 1 point)
  useEffect(() => {
    if (loadingStudents || loadingSessions) return

    const teacherCourseIdsSet = new Set(sessions.map((s) => String(s.course)))
    const sessionStudentIdsSet = new Set(
      sessions.flatMap((s) => s.attendance.map((a) => String(a.student)))
    )

    const completedSessionCount = students
      .filter((student) => {
        const hasMatchingEnrollment = student.enrollments.some(
          (e) =>
            String(e.teacher) === String(user._id) ||
            (teacherCourseIdsSet.has(String(e.course)) && (!e.teacher || e.teacher === ""))
        )
        return hasMatchingEnrollment || sessionStudentIdsSet.has(String(student._id))
      })
      .flatMap((student) => {
        const matching = student.enrollments.filter(
          (e) =>
            String(e.teacher) === String(user._id) ||
            (teacherCourseIdsSet.has(String(e.course)) && (!e.teacher || e.teacher === ""))
        )
        return matching.length > 0 ? matching : student.enrollments
      })
      .filter((e) => e.status === "completed")
      .reduce((sum, e) => sum + (e.courseDurationWeeks ?? 0), 0)

    onSessionCountLoaded?.(completedSessionCount)
  }, [students, sessions, loadingStudents, loadingSessions, user._id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSessionsUpdate = (updater: (prev: SessionData[]) => SessionData[]) => {
    setSessions(updater)
  }

  const handleSessionAdd = (newSession: SessionData) => {
    setSessions((prev) => {
      const exists = prev.some((s) => s._id === newSession._id)
      if (exists) return prev.map((s) => s._id === newSession._id ? newSession : s)
      return [...prev, newSession]
    })
  }

  const loading = loadingStudents || loadingSessions

  // Build set of course IDs this teacher teaches (from sessions)
  const teacherCourseIds = new Set(sessions.map((s) => String(s.course)))

  // Build set of student IDs that appear in any of this teacher's sessions
  const sessionStudentIds = new Set(
    sessions.flatMap((s) => s.attendance.map((a) => String(a.student)))
  )

  // Build full student list with relevant enrollments
  const teacherStudentsWithEnrollments = students
    .map((student) => {
      const matchingEnrollments = student.enrollments.filter(
        (e) =>
          // ✅ direct: enrollment ระบุชื่อครูตรงๆ
          String(e.teacher) === String(user._id) ||
          // ✅ fallback เฉพาะกรณีที่ enrollment ยังไม่มี teacher กำกับ
          //    (ข้อมูลเก่าที่ยังไม่ได้ assign ครู) + course ตรงกับที่ครูสอน
          (teacherCourseIds.has(String(e.course)) && (!e.teacher || e.teacher === ""))
      )
      return {
        ...student,
        // Only show enrollments that belong to this teacher — never fallback to all enrollments
        enrollments: matchingEnrollments,
      }
    })
    .filter((s) => s.enrollments.length > 0 || sessionStudentIds.has(String(s._id)))

  // ── Slot count map: slotId → Set<studentId> ────────────────────────────────
  const slotStudentMap = new Map<string, Set<string>>()
  for (const slot of ALL_SLOTS) {
    slotStudentMap.set(slot.id, new Set())
  }
  for (const student of teacherStudentsWithEnrollments) {
    for (const enrollment of student.enrollments) {
      if (!enrollment.slot) continue
      if (enrollment.status !== "active") continue   // นับเฉพาะกำลังเรียน
      const match = ALL_SLOTS.find(
        (s) => s.day === enrollment.slot!.day && s.time === enrollment.slot!.time
      )
      if (match) slotStudentMap.get(match.id)?.add(student._id)
    }
  }

  // ── Filter students by selected slot ──────────────────────────────────────
  const selectedSlot = selectedSlotId ? ALL_SLOTS.find((s) => s.id === selectedSlotId) : null

  const filteredStudents = teacherStudentsWithEnrollments
    .map((student) => {
      let enrollments = student.enrollments
      // Filter by slot
      if (selectedSlot) {
        enrollments = enrollments.filter(
          (e) =>
            e.slot &&
            e.slot.day === selectedSlot.day &&
            e.slot.time === selectedSlot.time
        )
        // เมื่อดูตามคลาส → แสดงเฉพาะที่กำลังเรียน (active) เท่านั้น
        enrollments = enrollments.filter((e) => e.status === "active")
      } else {
        // Filter by status (ใช้เมื่อไม่ได้เลือก slot)
        if (statusFilter !== "all") {
          enrollments = enrollments.filter((e) => e.status === statusFilter)
        }
      }
      return { ...student, enrollments }
    })
    .filter((s) => s.enrollments.length > 0)

  // ── Group slots by day for layout ─────────────────────────────────────────
  const saturdaySlots = ALL_SLOTS.filter((s) => s.day === "saturday")
  const sundaySlots   = ALL_SLOTS.filter((s) => s.day === "sunday")

  return (
    <div className="space-y-6">
      {/* Summary — system-wide total + teacher-specific active */}
      <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          นักเรียนทั้งหมด
          <strong className="text-foreground ml-0.5">
            {systemStats ? `${systemStats.totalAll} คน` : "…"}
          </strong>
        </span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-1">
          นักเรียนของฉัน (กำลังเรียน)
          <strong className="text-orange-600 ml-0.5">
            {teacherStudentsWithEnrollments.filter((s) =>
              s.enrollments.some((e) => e.status === "active")
            ).length} คน
          </strong>
        </span>
      </div>

      {/* ── Status Filter ─────────────────────────────────────────────────────── */}
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
            onClick={() => setStatusFilter(value)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
              statusFilter === value
                ? activeClass
                : "border-gray-200 text-muted-foreground hover:border-gray-400 hover:text-foreground",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Slot Filter Panel (compact) ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-semibold text-muted-foreground">ดูตามคลาส</span>
          {selectedSlotId && (
            <button
              onClick={() => setSelectedSlotId(null)}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <FilterX className="h-3 w-3" />
              ล้าง
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {[
            { label: "เสาร์", slots: saturdaySlots, day: "saturday" },
            { label: "อาทิตย์", slots: sundaySlots, day: "sunday" },
          ].map(({ label, slots, day }) => {
            const styles = DAY_STYLES[day]
            return (
              <div key={day} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground w-12 shrink-0">{label}</span>
                {slots.map((slot) => {
                  const count = slotStudentMap.get(slot.id)?.size ?? 0
                  const isActive = selectedSlotId === slot.id
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlotId((prev) => (prev === slot.id ? null : slot.id))}
                      className={[
                        "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                        isActive ? styles.activeCard + " border-2" : styles.card + " hover:opacity-80",
                      ].join(" ")}
                    >
                      <Clock className="h-3 w-3 opacity-60" />
                      {slot.time} น.
                      <span className={[
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        isActive ? "bg-white/60" : "bg-white/80 text-foreground",
                      ].join(" ")}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        {selectedSlot && (
          <p className="mt-2 text-xs text-muted-foreground">
            แสดงเฉพาะ <strong className="text-foreground">{selectedSlot.dayLabel} {selectedSlot.time} น.</strong>
            {" "}— <strong className="text-foreground">{filteredStudents.length} คน</strong>
          </p>
        )}
      </div>

      {/* Students section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold">
            {selectedSlot ? `นักเรียนในคลาสนี้` : "นักเรียนของฉัน"}
          </h2>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {!loading && (
            <Badge variant="secondary" className="ml-auto">
              {filteredStudents.length} คน
            </Badge>
          )}
        </div>

        {filteredStudents.length === 0 && !loading ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>
                {statusFilter === "active"
                  ? "ไม่มีนักเรียนที่กำลังเรียนอยู่"
                  : statusFilter === "completed"
                  ? "ไม่มีนักเรียนที่เรียนจบแล้ว"
                  : selectedSlot
                  ? "ไม่มีนักเรียนในคลาสนี้"
                  : "ยังไม่มีนักเรียน"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {filteredStudents.map((student) => {
              const total = student.enrollments.length
              const done = student.enrollments.filter((e) => e.status === "completed").length
              const progress = total > 0 ? Math.round((done / total) * 100) : 0

              return (
                <Card key={student._id} className="border-2 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-base">
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
                      <Badge variant="secondary">{total} คอร์ส</Badge>
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
                    {student.enrollments.map((enrollment, enrollIdx) => (
                      <TeacherEnrollmentStamps
                        key={enrollIdx}
                        student={student}
                        enrollment={enrollment}
                        enrollIdx={enrollIdx}
                        sessions={sessions}
                        teacherId={user._id}
                        onSessionsUpdate={handleSessionsUpdate}
                        onSessionAdd={handleSessionAdd}
                      />
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
