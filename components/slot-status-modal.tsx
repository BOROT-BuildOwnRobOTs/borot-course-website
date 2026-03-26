"use client"

import { useEffect, useState } from "react"
import { X, Users, Clock, Calendar, RefreshCw, Loader2, ChevronDown, ChevronUp, BookOpen, Coffee } from "lucide-react"

interface StudentEntry {
  id: string
  name: string
  nickname: string
  courseName: string
  courseLevel: string
}

interface SlotData {
  id: string
  day: string
  dayLabel: string
  time: string
  count: number
  max: number
  available: boolean
  students: StudentEntry[]
}

interface TrialSlotData {
  id: string
  time: string
  count: number
  max: number
  available: boolean
}

type ActiveTab = "regular" | "trial"

interface SlotStatusModalProps {
  isOpen: boolean
  onClose: () => void
}

/** Truncate course name to maxLen characters */
function truncateCourse(name: string, maxLen = 22): string {
  if (!name) return "—"
  return name.length > maxLen ? name.slice(0, maxLen) + "…" : name
}

/** Display label for a student: prefer nickname, fallback to first name */
function getDisplayName(entry: StudentEntry): string {
  return entry.nickname ? entry.nickname : entry.name.split(" ")[0]
}

export function SlotStatusModal({ isOpen, onClose }: SlotStatusModalProps) {
  const [slots, setSlots] = useState<SlotData[]>([])
  const [trialSlots, setTrialSlots] = useState<TrialSlotData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<ActiveTab>("regular")

  const fetchSlots = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/slots", { cache: "no-store" })
      const json = await res.json()
      if (json.success) {
        setSlots(json.data)
        setTrialSlots(json.trialSlots || [])
        setLastUpdated(new Date())
      } else {
        setError("Unable to load data")
      }
    } catch {
      setError("Connection error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchSlots()
      setExpandedSlots(new Set())
    }
  }, [isOpen])

  if (!isOpen) return null

  const tuesdaySlots = slots.filter((s) => s.day === "tuesday")
  const saturdaySlots = slots.filter((s) => s.day === "saturday")
  const sundaySlots = slots.filter((s) => s.day === "sunday")

  const totalStudents = slots.reduce((sum, s) => sum + s.count, 0)

  // Aggregate course popularity from all students across all slots
  const courseCountMap = new Map<string, number>()
  slots.forEach((slot) => {
    slot.students?.forEach((student) => {
      const key = student.courseName || "Unknown"
      courseCountMap.set(key, (courseCountMap.get(key) || 0) + 1)
    })
  })
  const popularCourses = Array.from(courseCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const rankMedals = ["🥇", "🥈", "🥉"]

  const toggleSlot = (slotId: string) => {
    setExpandedSlots((prev) => {
      const next = new Set(prev)
      if (next.has(slotId)) next.delete(slotId)
      else next.add(slotId)
      return next
    })
  }

  const getStatusColor = (count: number, max: number) => {
    const ratio = count / max
    if (ratio >= 1) return { bg: "bg-red-100", text: "text-red-600", bar: "bg-red-500", badge: "Full", badgeBg: "bg-red-100 text-red-600" }
    if (ratio >= 0.75) return { bg: "bg-orange-50", text: "text-orange-600", bar: "bg-orange-500", badge: "Almost Full", badgeBg: "bg-orange-100 text-orange-600" }
    return { bg: "bg-green-50", text: "text-green-600", bar: "bg-green-500", badge: "Available", badgeBg: "bg-green-100 text-green-600" }
  }

  // Trial-specific status (blue theme)
  const getTrialStatusColor = (count: number, max: number) => {
    const ratio = count / max
    if (ratio >= 1) return { bg: "bg-red-50", text: "text-red-600", bar: "bg-red-500", badge: "Full", badgeBg: "bg-red-100 text-red-600" }
    if (ratio >= 0.67) return { bg: "bg-amber-50", text: "text-amber-600", bar: "bg-amber-500", badge: "Almost Full", badgeBg: "bg-amber-100 text-amber-600" }
    return { bg: "bg-blue-50", text: "text-blue-600", bar: "bg-blue-500", badge: "Available", badgeBg: "bg-blue-100 text-blue-600" }
  }

  const SlotCard = ({ slot }: { slot: SlotData }) => {
    const status = getStatusColor(slot.count, slot.max)
    const pct = Math.min((slot.count / slot.max) * 100, 100)
    const isExpanded = expandedSlots.has(slot.id)
    const hasStudents = slot.students && slot.students.length > 0

    return (
      <div className={`rounded-xl border border-gray-100 ${status.bg} transition-all overflow-hidden`}>
        {/* Main slot info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-800 text-sm">{slot.time}</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status.badgeBg}`}>
              {status.badge}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ease-out ${status.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-400" />
              <span className={`text-sm font-bold ${status.text}`}>{slot.count}</span>
              <span className="text-xs text-gray-400">/ {slot.max} students</span>
            </div>
            <span className="text-xs text-gray-400">{slot.max - slot.count} seats available</span>
          </div>
        </div>

        {/* Toggle button — only show if there are students */}
        {hasStudents && (
          <button
            onClick={() => toggleSlot(slot.id)}
            className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors border-t border-gray-200/60
              ${isExpanded ? "bg-white/70 text-gray-600" : "bg-white/40 text-gray-500 hover:bg-white/60"}`}
          >
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              View students ({slot.students.length})
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Expanded student list */}
        {isExpanded && hasStudents && (
          <div className="bg-white/80 border-t border-gray-100 divide-y divide-gray-100/80">
            {slot.students.map((student, idx) => (
              <div key={`${student.id}-${idx}`} className="flex items-center gap-2 px-4 py-2">
                <span className="text-xs font-semibold text-orange-600 border border-orange-300 bg-orange-50 rounded-md px-2 py-0.5 shrink-0 max-w-[96px] truncate" title={getDisplayName(student)}>
                  {getDisplayName(student)}
                </span>
                <span
                  className="flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 min-w-0 truncate"
                  title={student.courseName}
                >
                  <BookOpen className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{truncateCourse(student.courseName)}</span>
                </span>
                <span
                  className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5 shrink-0 max-w-[110px] truncate"
                  title={student.courseLevel || "No level specified"}
                >
                  {student.courseLevel || "No level specified"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const DaySection = ({ label, icon, slotList }: { label: string; icon: string; slotList: SlotData[] }) => (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-gray-700 text-base">{label}</h3>
      </div>
      <div className="space-y-3">
        {slotList.map((slot) => (
          <SlotCard key={slot.id} slot={slot} />
        ))}
      </div>
    </div>
  )

  // Split trial slots into morning / afternoon
  const morningTrialSlots = trialSlots.filter((ts) => parseInt(ts.time.split(":")[0]) < 12)
  const afternoonTrialSlots = trialSlots.filter((ts) => parseInt(ts.time.split(":")[0]) >= 13)

  const TrialSlotCard = ({ ts }: { ts: TrialSlotData }) => {
    const status = getTrialStatusColor(ts.count, ts.max)
    const seatsLeft = ts.max - ts.count
    const pct = Math.min((ts.count / ts.max) * 100, 100)
    return (
      <div
        className={`rounded-lg border ${status.bg} ${
          ts.available ? "border-blue-200" : "border-red-200"
        } px-3 py-2 transition-all`}
      >
        <div className="flex items-center gap-3">
          {/* Time */}
          <div className="flex items-center gap-1.5 shrink-0 w-[105px]">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-sm font-bold text-gray-800">{ts.time}</span>
          </div>

          {/* Progress bar — takes remaining space */}
          <div className="flex-1 bg-blue-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${status.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Count */}
          <div className="flex items-center gap-1 shrink-0">
            <Users className="w-3 h-3 text-blue-400" />
            <span className={`text-xs font-bold ${status.text}`}>{ts.count}/{ts.max}</span>
          </div>

          {/* Badge */}
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${status.badgeBg}`}>
            {seatsLeft > 0 ? `${seatsLeft} left` : "Full"}
          </span>
        </div>
      </div>
    )
  }

  // Dynamic header based on active tab
  const headerGradient = activeTab === "trial"
    ? "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)"
    : "linear-gradient(135deg, #E5690D 0%, #FF8C00 100%)"

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4 transition-all duration-300"
          style={{ background: headerGradient }}
        >
          {/* Drag indicator (mobile) */}
          <div className="sm:hidden w-10 h-1 bg-white/40 rounded-full mx-auto mb-4" />

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{activeTab === "trial" ? "🧪" : "🎓"}</span>
                <h2 className="text-white font-bold text-xl leading-tight">
                  {activeTab === "trial" ? "Trial Class Schedule" : "Current Enrollment Status"}
                </h2>
              </div>
              <p className={`text-sm ${activeTab === "trial" ? "text-blue-100" : "text-orange-100"}`}>
                {activeTab === "trial" ? "Free 20-min trial · max 3 students per slot" : "Seats available per class slot"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors ml-3 flex-shrink-0 mt-0.5"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Summary Stats — only on regular tab */}
          {activeTab === "regular" && !loading && slots.length > 0 && (
            <div className="mt-3 bg-white/12 rounded-xl px-3.5 py-2.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/90 text-xs font-medium">
                  👦 <span className="font-bold text-white">{totalStudents}</span> students already joined
                </p>
                <span className="text-[10px] font-semibold text-white/80">🔥 Popular class this week</span>
              </div>
              {popularCourses.length > 0 && (
                <div className="flex gap-1.5">
                  {popularCourses.map((course, idx) => (
                    <div
                      key={course.name}
                      className="flex-1 bg-white/10 rounded-lg px-2 py-1.5 min-w-0"
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-xs">{rankMedals[idx]}</span>
                        <span className="text-white/70 font-bold text-[10px]">{course.count}</span>
                      </div>
                      <p className="text-white text-[10px] font-medium truncate leading-tight">{course.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Trial tab summary */}
          {activeTab === "trial" && !loading && (
            <div className="mt-3 bg-white/12 rounded-xl px-3.5 py-2.5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-white/90 text-xs font-medium">
                    <span className="font-bold text-white">{trialSlots.length}</span> time slots
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-white/90 text-xs font-medium">
                    <span className="font-bold text-white">{trialSlots.filter(s => s.available).length}</span> slots available
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex mt-4 bg-white/15 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab("regular")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "regular"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-sm">📅</span>
              Regular Class
            </button>
            <button
              onClick={() => setActiveTab("trial")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "trial"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-sm">🧪</span>
              Trial Class
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] sm:max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className={`w-8 h-8 animate-spin mb-3 ${activeTab === "trial" ? "text-blue-400" : "text-orange-400"}`} />
              <p className="text-sm">Loading...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-red-400">
              <p className="text-sm mb-3">{error}</p>
              <button
                onClick={fetchSlots}
                className={`text-xs underline ${activeTab === "trial" ? "text-blue-500 hover:text-blue-700" : "text-orange-500 hover:text-orange-700"}`}
              >
                Try again
              </button>
            </div>
          ) : activeTab === "regular" ? (
            /* ── Regular Class Content ── */
            <div className="space-y-6">
              <DaySection label="Tuesday" icon="📅" slotList={tuesdaySlots} />
              <div className="border-t border-gray-100" />
              <DaySection label="Saturday" icon="📅" slotList={saturdaySlots} />
              <div className="border-t border-gray-100" />
              <DaySection label="Sunday" icon="📅" slotList={sundaySlots} />
            </div>
          ) : (
            /* ── Trial Class Content ── */
            <div className="space-y-4">
              {/* Info banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <span className="font-semibold">📌 Free Trial Class</span> — Pick a convenient time slot. Each session is 20 minutes, limited to 3 students per slot, spaced 30 minutes apart.
                </p>
              </div>

              {/* Morning slots */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5 ml-0.5">
                  <span className="text-base">🌅</span>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Morning</span>
                  <span className="text-[10px] text-gray-400 font-medium">10:00 – 11:50</span>
                </div>
                <div className="space-y-1.5">
                  {morningTrialSlots.map((ts) => (
                    <TrialSlotCard key={ts.id} ts={ts} />
                  ))}
                </div>
              </div>

              {/* Lunch break divider */}
              <div className="flex items-center gap-2 my-1">
                <div className="flex-1 border-t border-dashed border-amber-300" />
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
                  <Coffee className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px] font-semibold text-amber-600">Lunch Break 12:00 – 13:00</span>
                </div>
                <div className="flex-1 border-t border-dashed border-amber-300" />
              </div>

              {/* Afternoon slots */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5 ml-0.5">
                  <span className="text-base">☀️</span>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Afternoon</span>
                  <span className="text-[10px] text-gray-400 font-medium">13:00 – 16:50</span>
                </div>
                <div className="space-y-1.5">
                  {afternoonTrialSlots.map((ts) => (
                    <TrialSlotCard key={ts.id} ts={ts} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-1 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            {lastUpdated ? (
              <span>Updated {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
            ) : (
              <span>—</span>
            )}
          </div>
          <button
            onClick={fetchSlots}
            disabled={loading}
            className={`flex items-center gap-1.5 text-xs font-medium disabled:opacity-50 transition-colors ${
              activeTab === "trial"
                ? "text-blue-500 hover:text-blue-700"
                : "text-orange-500 hover:text-orange-700"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}
