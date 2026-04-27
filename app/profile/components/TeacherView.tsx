"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BookOpen, CalendarDays, Loader2, Users, Trophy, Clock, FilterX, Globe, Search, Phone,
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
  // ── Tab state ──────────────────────────────────────────────────────────────
  const [viewTab, setViewTab] = useState<"my" | "all">("my")

  // ── My Students state ──────────────────────────────────────────────────────
  const [students, setStudents] = useState<TeacherStudentData[]>([])
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"active" | "completed" | "all">("active")
  const [systemStats, setSystemStats] = useState<{ totalAll: number; totalActive: number } | null>(null)

  // ── All Students state ─────────────────────────────────────────────────────
  const [allStudents, setAllStudents] = useState<TeacherStudentData[]>([])
  const [allSessions, setAllSessions] = useState<SessionData[]>([])
  const [loadingAllStudents, setLoadingAllStudents] = useState(false)
  const [loadingAllSessions, setLoadingAllSessions] = useState(false)
  const [allSelectedSlotId, setAllSelectedSlotId] = useState<string | null>(null)
  const [allStatusFilter, setAllStatusFilter] = useState<"active" | "completed" | "all">("active")
  const [allSearchQuery, setAllSearchQuery] = useState("")
  const [allDataLoaded, setAllDataLoaded] = useState(false)

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

  // Fetch ALL students & sessions when "All Students" tab is first opened
  useEffect(() => {
    if (viewTab !== "all" || allDataLoaded) return
    setLoadingAllStudents(true)
    setLoadingAllSessions(true)
    fetch("/api/teacher/all-students")
      .then((r) => r.json())
      .then((j) => { if (j.success) setAllStudents(j.data) })
      .finally(() => setLoadingAllStudents(false))
    fetch("/api/teacher/all-sessions")
      .then((r) => r.json())
      .then((j) => { if (j.success) setAllSessions(j.data) })
      .finally(() => setLoadingAllSessions(false))
    setAllDataLoaded(true)
  }, [viewTab, allDataLoaded])

  // Compute tier score: sum of courseDurationWeeks for all COMPLETED enrollments
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

  // ── Session handlers (shared for both tabs) ────────────────────────────────
  const handleSessionsUpdate = (updater: (prev: SessionData[]) => SessionData[]) => {
    setSessions(updater)
    // Also update allSessions if loaded
    if (allDataLoaded) setAllSessions(updater)
  }

  const handleSessionAdd = (newSession: SessionData) => {
    const addOrUpdate = (prev: SessionData[]) => {
      const exists = prev.some((s) => s._id === newSession._id)
      if (exists) return prev.map((s) => s._id === newSession._id ? newSession : s)
      return [...prev, newSession]
    }
    setSessions(addOrUpdate)
    if (allDataLoaded) setAllSessions(addOrUpdate)
  }

  // Update a student's enrollments locally after reschedule
  const handleStudentUpdate = (studentId: string, updatedEnrollments: TeacherStudentData["enrollments"]) => {
    setStudents((prev) =>
      prev.map((s) =>
        s._id === studentId ? { ...s, enrollments: updatedEnrollments } : s
      )
    )
    if (allDataLoaded) {
      setAllStudents((prev) =>
        prev.map((s) =>
          s._id === studentId ? { ...s, enrollments: updatedEnrollments } : s
        )
      )
    }
  }

  // ── "All Students" specific session handlers ───────────────────────────────
  const handleAllSessionsUpdate = (updater: (prev: SessionData[]) => SessionData[]) => {
    setAllSessions(updater)
    // Also update my sessions
    setSessions(updater)
  }

  const handleAllSessionAdd = (newSession: SessionData) => {
    const addOrUpdate = (prev: SessionData[]) => {
      const exists = prev.some((s) => s._id === newSession._id)
      if (exists) return prev.map((s) => s._id === newSession._id ? newSession : s)
      return [...prev, newSession]
    }
    setAllSessions(addOrUpdate)
    setSessions(addOrUpdate)
  }

  const handleAllStudentUpdate = (studentId: string, updatedEnrollments: TeacherStudentData["enrollments"]) => {
    setAllStudents((prev) =>
      prev.map((s) =>
        s._id === studentId ? { ...s, enrollments: updatedEnrollments } : s
      )
    )
    setStudents((prev) =>
      prev.map((s) =>
        s._id === studentId ? { ...s, enrollments: updatedEnrollments } : s
      )
    )
  }

  const loading = loadingStudents || loadingSessions
  const allLoading = loadingAllStudents || loadingAllSessions

  // ══════════════════════════════════════════════════════════════════════════
  // MY STUDENTS computed data
  // ══════════════════════════════════════════════════════════════════════════

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
          String(e.teacher) === String(user._id) ||
          (teacherCourseIds.has(String(e.course)) && (!e.teacher || e.teacher === ""))
      )
      return {
        ...student,
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
      if (enrollment.status !== "active") continue
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
      if (selectedSlot) {
        enrollments = enrollments.filter(
          (e) =>
            e.slot &&
            e.slot.day === selectedSlot.day &&
            e.slot.time === selectedSlot.time
        )
        enrollments = enrollments.filter((e) => e.status === "active")
      } else {
        if (statusFilter !== "all") {
          enrollments = enrollments.filter((e) => e.status === statusFilter)
        }
      }
      return { ...student, enrollments }
    })
    .filter((s) => s.enrollments.length > 0)

  // ══════════════════════════════════════════════════════════════════════════
  // ALL STUDENTS computed data
  // ══════════════════════════════════════════════════════════════════════════

  // For "all" tab — show all students with all their enrollments (no teacher filter)
  const allStudentsWithEnrollments = allStudents
    .filter((s) => s.enrollments && s.enrollments.length > 0)

  // Slot count for all students
  const allSlotStudentMap = new Map<string, Set<string>>()
  for (const slot of ALL_SLOTS) {
    allSlotStudentMap.set(slot.id, new Set())
  }
  for (const student of allStudentsWithEnrollments) {
    for (const enrollment of student.enrollments) {
      if (!enrollment.slot) continue
      if (enrollment.status !== "active") continue
      const match = ALL_SLOTS.find(
        (s) => s.day === enrollment.slot!.day && s.time === enrollment.slot!.time
      )
      if (match) allSlotStudentMap.get(match.id)?.add(student._id)
    }
  }

  const allSelectedSlot = allSelectedSlotId ? ALL_SLOTS.find((s) => s.id === allSelectedSlotId) : null

  const filteredAllStudents = allStudentsWithEnrollments
    .map((student) => {
      let enrollments = student.enrollments
      if (allSelectedSlot) {
        enrollments = enrollments.filter(
          (e) =>
            e.slot &&
            e.slot.day === allSelectedSlot.day &&
            e.slot.time === allSelectedSlot.time
        )
        enrollments = enrollments.filter((e) => e.status === "active")
      } else {
        if (allStatusFilter !== "all") {
          enrollments = enrollments.filter((e) => e.status === allStatusFilter)
        }
      }
      return { ...student, enrollments }
    })
    .filter((s) => s.enrollments.length > 0)
    .filter((s) => {
      if (!allSearchQuery.trim()) return true
      const q = allSearchQuery.toLowerCase()
      return (
        (s.name || "").toLowerCase().includes(q) ||
        (s.nickname && s.nickname.toLowerCase().includes(q)) ||
        s.enrollments.some((e) => (e.courseName || "").toLowerCase().includes(q))
      )
    })

  // ── Group slots by day for layout ─────────────────────────────────────────
  const saturdaySlots = ALL_SLOTS.filter((s) => s.day === "saturday")
  const sundaySlots   = ALL_SLOTS.filter((s) => s.day === "sunday")

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  const renderSlotFilter = (
    slotMap: Map<string, Set<string>>,
    selSlotId: string | null,
    setSelSlotId: (v: string | null) => void,
    selSlot: typeof selectedSlot,
    studentCount: number
  ) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-semibold text-muted-foreground">View by class</span>
        {selSlotId && (
          <button
            onClick={() => setSelSlotId(null)}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <FilterX className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {[
          { label: "Saturday", slots: saturdaySlots, day: "saturday" },
          { label: "Sunday",   slots: sundaySlots,   day: "sunday" },
        ].map(({ label, slots, day }) => {
          const styles = DAY_STYLES[day]
          return (
            <div key={day} className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>
              {slots.map((slot) => {
                const count = slotMap.get(slot.id)?.size ?? 0
                const isActive = selSlotId === slot.id
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelSlotId(selSlotId === slot.id ? null : slot.id)}
                    className={[
                      "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                      isActive ? styles.activeCard + " border-2" : styles.card + " hover:opacity-80",
                    ].join(" ")}
                  >
                    <Clock className="h-3 w-3 opacity-60" />
                    {slot.time}
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

      {selSlot && (
        <p className="mt-2 text-xs text-muted-foreground">
          Showing <strong className="text-foreground">{selSlot.dayLabel} {selSlot.time}</strong>
          {" "}— <strong className="text-foreground">{studentCount} students</strong>
        </p>
      )}
    </div>
  )

  const renderStatusFilter = (
    currentFilter: "active" | "completed" | "all",
    setFilter: (v: "active" | "completed" | "all") => void
  ) => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground font-medium shrink-0">Show:</span>
      {(
        [
          { value: "active",    label: "🕐 In Progress", activeClass: "bg-blue-500 text-white border-blue-500" },
          { value: "completed", label: "✅ Completed",   activeClass: "bg-green-500 text-white border-green-500" },
          { value: "all",       label: "All",            activeClass: "bg-gray-700 text-white border-gray-700" },
        ] as const
      ).map(({ value, label, activeClass }) => (
        <button
          key={value}
          onClick={() => setFilter(value)}
          className={[
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
            currentFilter === value
              ? activeClass
              : "border-gray-200 text-muted-foreground hover:border-gray-400 hover:text-foreground",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  )

  const renderStudentCards = (
    studentList: typeof filteredStudents,
    sessionList: SessionData[],
    isLoading: boolean,
    currentStatusFilter: "active" | "completed" | "all",
    currentSlot: typeof selectedSlot,
    title: string,
    sessionsUpdateHandler: (updater: (prev: SessionData[]) => SessionData[]) => void,
    sessionAddHandler: (session: SessionData) => void,
    studentUpdateHandler: (studentId: string, updatedEnrollments: TeacherStudentData["enrollments"]) => void,
    isAllTab?: boolean
  ) => (
    <div>
      <div className="flex items-center gap-3 mb-4">
        {isAllTab ? <Globe className="h-6 w-6 text-blue-500" /> : <Users className="h-6 w-6 text-orange-500" />}
        <h2 className="text-2xl font-bold">{title}</h2>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {!isLoading && (
          <Badge variant="secondary" className="ml-auto">
            {studentList.length} students
          </Badge>
        )}
      </div>

      {studentList.length === 0 && !isLoading ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>
              {currentStatusFilter === "active"
                ? "No students currently in progress"
                : currentStatusFilter === "completed"
                ? "No students have completed yet"
                : currentSlot
                ? "No students in this class"
                : "No students found"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {studentList.map((student) => {
            const total = student.enrollments.length
            const done = student.enrollments.filter((e) => e.status === "completed").length
            const progress = total > 0 ? Math.round((done / total) * 100) : 0

            // For "all" tab, find original teacher names from enrollments
            const teacherNames = isAllTab
              ? [...new Set(
                  student.enrollments
                    .map((e) => (e as any).teacherName)
                    .filter((n: string) => n && n.trim())
                )]
              : []

            return (
              <Card key={student._id} className={`border-2 hover:shadow-md transition-shadow ${isAllTab ? "border-blue-100" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-base ${isAllTab ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}>
                        {(student.name?.trim().charAt(0) || "?").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-lg leading-tight">{student.name || "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.nickname && `(${student.nickname})`}
                          {student.age && ` Age ${student.age}`}
                          {isAllTab && teacherNames.length > 0 && (
                            <span className="ml-1 text-blue-600">
                              · Teacher: {teacherNames.join(", ")}
                            </span>
                          )}
                        </p>
                        {student.parentPhone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3 text-green-600" />
                            <span className="text-green-700 font-medium">
                              {student.parentName && `${student.parentName}: `}
                              <a href={`tel:${student.parentPhone}`} className="hover:underline">{student.parentPhone}</a>
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary">{total} courses</Badge>
                  </div>
                  {total > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3.5 w-3.5" />
                          <span>Overall Progress</span>
                        </div>
                        <span className="font-semibold">{done}/{total} courses ({progress}%)</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {student.enrollments.map((enrollment, enrollIdx) => {
                    // Find the correct enrollIdx in the original student data
                    // (important for reschedule which uses enrollmentIndex)
                    const origStudent = isAllTab
                      ? allStudents.find((s) => s._id === student._id)
                      : students.find((s) => s._id === student._id)
                    const origEnrollIdx = origStudent
                      ? origStudent.enrollments.findIndex(
                          (e) => e.course === enrollment.course && e.startDate === enrollment.startDate
                        )
                      : enrollIdx

                    return (
                      <TeacherEnrollmentStamps
                        key={enrollIdx}
                        student={student}
                        enrollment={enrollment}
                        enrollIdx={origEnrollIdx >= 0 ? origEnrollIdx : enrollIdx}
                        sessions={sessionList}
                        teacherId={user._id}
                        onSessionsUpdate={sessionsUpdateHandler}
                        onSessionAdd={sessionAddHandler}
                        onStudentUpdate={studentUpdateHandler}
                      />
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Summary — system-wide total + teacher-specific active */}
      <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          Total students
          <strong className="text-foreground ml-0.5">
            {systemStats ? `${systemStats.totalAll}` : "…"}
          </strong>
        </span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-1">
          My students (active)
          <strong className="text-orange-600 ml-0.5">
            {teacherStudentsWithEnrollments.filter((s) =>
              s.enrollments.some((e) => e.status === "active")
            ).length}
          </strong>
        </span>
      </div>

      {/* ── Tab Switcher ──────────────────────────────────────────────────────── */}
      <div className="flex gap-2 border-b pb-0">
        <button
          onClick={() => setViewTab("my")}
          className={[
            "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-[1px]",
            viewTab === "my"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300",
          ].join(" ")}
        >
          <Users className="h-4 w-4" />
          My Students
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {teacherStudentsWithEnrollments.length}
          </Badge>
        </button>
        <button
          onClick={() => setViewTab("all")}
          className={[
            "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-[1px]",
            viewTab === "all"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300",
          ].join(" ")}
        >
          <Globe className="h-4 w-4" />
          All Students
          {allDataLoaded && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {allStudentsWithEnrollments.length}
            </Badge>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MY STUDENTS TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {viewTab === "my" && (
        <div className="space-y-6">
          {renderStatusFilter(statusFilter, setStatusFilter)}

          {renderSlotFilter(
            slotStudentMap,
            selectedSlotId,
            setSelectedSlotId,
            selectedSlot,
            filteredStudents.length
          )}

          {renderStudentCards(
            filteredStudents,
            sessions,
            loading,
            statusFilter,
            selectedSlot,
            selectedSlot ? "Students in this class" : "My Students",
            handleSessionsUpdate,
            handleSessionAdd,
            handleStudentUpdate,
            false
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ALL STUDENTS TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {viewTab === "all" && (
        <div className="space-y-6">
          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 flex items-start gap-2">
            <Globe className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">All Students (Cross-Teacher View)</p>
              <p className="text-xs text-blue-600 mt-0.5">
                แสดง student ทุกคนในระบบ สามารถเช็คชื่อ กรอก feedback และจัดการข้ามครูได้
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, nickname, or course..."
              value={allSearchQuery}
              onChange={(e) => setAllSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {renderStatusFilter(allStatusFilter, setAllStatusFilter)}

          {renderSlotFilter(
            allSlotStudentMap,
            allSelectedSlotId,
            setAllSelectedSlotId,
            allSelectedSlot,
            filteredAllStudents.length
          )}

          {renderStudentCards(
            filteredAllStudents,
            allSessions,
            allLoading,
            allStatusFilter,
            allSelectedSlot,
            allSelectedSlot ? "Students in this class" : "All Students",
            handleAllSessionsUpdate,
            handleAllSessionAdd,
            handleAllStudentUpdate,
            true
          )}
        </div>
      )}
    </div>
  )
}
