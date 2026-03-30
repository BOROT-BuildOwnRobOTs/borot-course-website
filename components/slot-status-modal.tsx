"use client"

import { useEffect, useRef, useState } from "react"
import { X, Users, Clock, Calendar, RefreshCw, Loader2, ChevronDown, ChevronUp, BookOpen, Coffee, ArrowLeft, CheckCircle2, User, Phone, Baby, GraduationCap, Upload, ImageIcon, Trash2 } from "lucide-react"

// ── Trial-eligible courses ──
const TRIAL_COURSES = [
  { name: "Lego Robot", levels: ["Level 1", "Level 2", "Level 3", "Level 4"] },
  { name: "3D Inventor", levels: ["Level 1", "Level 2", "Level 3", "Level 4"] },
]

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

interface TrialStudentEntry {
  studentName: string
  age: number
}

interface TrialSlotData {
  id: string
  time: string
  count: number
  max: number
  available: boolean
  students: TrialStudentEntry[]
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
  const [expandedTrialSlots, setExpandedTrialSlots] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<ActiveTab>("regular")

  // ── Trial Date State ──
  const [trialDate, setTrialDate] = useState<string>(() => {
    const now = new Date()
    return now.toISOString().split("T")[0] // default to today YYYY-MM-DD
  })

  // ── Trial Registration State ──
  const [selectedTrialSlot, setSelectedTrialSlot] = useState<TrialSlotData | null>(null)
  const [regForm, setRegForm] = useState({ studentName: "", age: "", phone: "", courseName: "", courseLevel: "" })
  const [regSubmitting, setRegSubmitting] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)
  const [regSuccess, setRegSuccess] = useState(false)

  // ── Payment Method State ──
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("transfer")

  // ── Slip Upload State ──
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [slipPreview, setSlipPreview] = useState<string | null>(null)
  const [slipUploading, setSlipUploading] = useState(false)
  const [slipUrl, setSlipUrl] = useState<string | null>(null)
  const slipInputRef = useRef<HTMLInputElement>(null)

  const fetchSlots = async (dateOverride?: string) => {
    setLoading(true)
    setError(null)
    try {
      const dateParam = dateOverride ?? trialDate
      const res = await fetch(`/api/admin/slots?trialDate=${dateParam}`, { cache: "no-store" })
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

  // Refetch trial slot availability when date changes
  const handleTrialDateChange = (newDate: string) => {
    setTrialDate(newDate)
    setSelectedTrialSlot(null)
    setRegSuccess(false)
    fetchSlots(newDate)
  }

  // ── Lock body scroll when modal is open (prevent background scrolling on mobile) ──
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      const originalStyle = document.body.style.cssText
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.cssText = originalStyle
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      fetchSlots()
      setExpandedSlots(new Set())
      setExpandedTrialSlots(new Set())
      setSelectedTrialSlot(null)
      setRegForm({ studentName: "", age: "", phone: "", courseName: "", courseLevel: "" })
      setRegError(null)
      setRegSuccess(false)
      setSlipFile(null)
      setSlipPreview(null)
      setSlipUrl(null)
      setSlipUploading(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const tuesdaySlots = slots.filter((s) => s.day === "tuesday")
  const fridaySlots = slots.filter((s) => s.day === "friday")
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

  // ── Trial Registration Handlers ──
  const handleSelectTrialSlot = (ts: TrialSlotData) => {
    if (!ts.available) return
    setSelectedTrialSlot(ts)
    setRegForm({ studentName: "", age: "", phone: "", courseName: "", courseLevel: "" })
    setRegError(null)
    setRegSuccess(false)
    setSlipFile(null)
    setSlipPreview(null)
    setSlipUrl(null)
    setPaymentMethod("transfer")
  }

  const handleBackToSlots = () => {
    setSelectedTrialSlot(null)
    setRegForm({ studentName: "", age: "", phone: "", courseName: "", courseLevel: "" })
    setRegError(null)
    setRegSuccess(false)
    setSlipFile(null)
    setSlipPreview(null)
    setSlipUrl(null)
    setPaymentMethod("transfer")
  }

  // ── Slip Upload Handlers ──
  const handleSlipSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type (images only)
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"]
    if (!allowed.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
      setRegError("Please upload an image file (JPG, PNG, WebP).")
      return
    }

    // Max 10 MB
    if (file.size > 10 * 1024 * 1024) {
      setRegError("Slip image must be under 10 MB.")
      return
    }

    setSlipFile(file)
    setSlipPreview(URL.createObjectURL(file))
    setSlipUrl(null)
    setRegError(null)

    // Upload immediately
    setSlipUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const json = await res.json()
      if (json.success && json.url) {
        setSlipUrl(json.url)
      } else {
        setRegError(json.error || "Failed to upload slip. Please try again.")
        setSlipFile(null)
        setSlipPreview(null)
      }
    } catch {
      setRegError("Failed to upload slip. Please try again.")
      setSlipFile(null)
      setSlipPreview(null)
    } finally {
      setSlipUploading(false)
    }
  }

  const handleRemoveSlip = () => {
    setSlipFile(null)
    setSlipPreview(null)
    setSlipUrl(null)
    if (slipInputRef.current) slipInputRef.current.value = ""
  }

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTrialSlot) return

    setRegSubmitting(true)
    setRegError(null)

    try {
      const res = await fetch("/api/trial-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: regForm.studentName,
          age: regForm.age,
          phone: regForm.phone,
          courseName: `${regForm.courseName} — ${regForm.courseLevel}`,
          slipUrl: paymentMethod === "transfer" ? slipUrl : "",
          paymentMethod,
          slotId: selectedTrialSlot.id,
          trialDate,
        }),
      })
      const json = await res.json()

      if (json.success) {
        setRegSuccess(true)
        // Refresh slot data to reflect new count
        fetchSlots()
      } else {
        setRegError(json.error || "Something went wrong. Please try again.")
      }
    } catch {
      setRegError("Connection failed. Please try again.")
    } finally {
      setRegSubmitting(false)
    }
  }

  const toggleTrialSlot = (slotId: string) => {
    setExpandedTrialSlots((prev) => {
      const next = new Set(prev)
      if (next.has(slotId)) next.delete(slotId)
      else next.add(slotId)
      return next
    })
  }

  const TrialSlotCard = ({ ts }: { ts: TrialSlotData }) => {
    const status = getTrialStatusColor(ts.count, ts.max)
    const seatsLeft = ts.max - ts.count
    const pct = Math.min((ts.count / ts.max) * 100, 100)
    const isExpanded = expandedTrialSlots.has(ts.id)
    const hasStudents = ts.students && ts.students.length > 0

    return (
      <div className={`rounded-lg border overflow-hidden transition-all duration-200 ${status.bg} ${
        ts.available ? "border-blue-200" : "border-red-200 opacity-60"
      }`}>
        {/* Main clickable area — register for slot */}
        <button
          type="button"
          onClick={() => handleSelectTrialSlot(ts)}
          disabled={!ts.available}
          className={`w-full px-3 py-2 text-left transition-all duration-200 ${
            ts.available
              ? "hover:bg-blue-100/50 cursor-pointer"
              : "cursor-not-allowed"
          }`}
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
        </button>

        {/* Toggle button — only show if there are registered students */}
        {hasStudents && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleTrialSlot(ts.id)
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-medium transition-colors border-t border-blue-200/60
              ${isExpanded ? "bg-white/70 text-blue-600" : "bg-white/40 text-blue-500 hover:bg-white/60"}`}
          >
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              View registered students ({ts.students.length})
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}

        {/* Expanded student list */}
        {isExpanded && hasStudents && (
          <div className="bg-white/80 border-t border-blue-100 divide-y divide-blue-50">
            {ts.students.map((student, idx) => (
              <div key={`${ts.id}-student-${idx}`} className="flex items-center gap-2 px-3 py-2">
                <span className="text-xs font-semibold text-blue-700 border border-blue-300 bg-blue-50 rounded-md px-2 py-0.5 shrink-0 max-w-[120px] truncate" title={student.studentName}>
                  👦 {student.studentName}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5 shrink-0">
                  <Baby className="w-2.5 h-2.5 shrink-0" />
                  {student.age} yrs
                </span>
              </div>
            ))}
          </div>
        )}
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm touch-none"
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
                {activeTab === "trial" ? "20-min trial · ฿500 per session · max 3 students per slot" : "Seats available per class slot"}
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
        <div className="px-6 py-5 max-h-[70vh] sm:max-h-[60vh] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className={`w-8 h-8 animate-spin mb-3 ${activeTab === "trial" ? "text-blue-400" : "text-orange-400"}`} />
              <p className="text-sm">Loading...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-red-400">
              <p className="text-sm mb-3">{error}</p>
              <button
                onClick={() => fetchSlots()}
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
              <DaySection label="Friday" icon="📅" slotList={fridaySlots} />
              <div className="border-t border-gray-100" />
              <DaySection label="Saturday" icon="📅" slotList={saturdaySlots} />
              <div className="border-t border-gray-100" />
              <DaySection label="Sunday" icon="📅" slotList={sundaySlots} />
            </div>
          ) : selectedTrialSlot ? (
            /* ── Trial Registration Form ── */
            <div className="space-y-4">
              {/* Back button + Selected slot info */}
              <button
                type="button"
                onClick={handleBackToSlots}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Choose another slot
              </button>

              {/* Selected slot badge */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900">🧪 Trial Class</p>
                  <p className="text-xs text-blue-600 font-medium">
                    📅 {new Date(trialDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {selectedTrialSlot.time} · {selectedTrialSlot.max - selectedTrialSlot.count} seats left
                  </p>
                </div>
              </div>

              {regSuccess ? (
                /* ── Success State ── */
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-9 h-9 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Registration Successful! 🎉</h3>
                  <p className="text-sm text-gray-500 mb-1">
                    Thank you for signing up for the Trial Class
                  </p>
                  <p className="text-xs text-blue-600 font-medium mb-5">
                    📅 {new Date(trialDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · Time: {selectedTrialSlot.time}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBackToSlots}
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                    >
                      View all slots
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Registration Form ── */
                <form onSubmit={handleRegSubmit} className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100 rounded-xl p-4 space-y-3.5">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <span className="text-base">📝</span>
                      Registration Details
                    </h4>

                    {/* Student Name */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        Student Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John"
                        value={regForm.studentName}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, studentName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300"
                      />
                    </div>

                    {/* Age */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                        <Baby className="w-3.5 h-3.5 text-blue-500" />
                        Age (years) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={3}
                        max={18}
                        placeholder="e.g. 8"
                        value={regForm.age}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, age: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        Contact Phone <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0812345678"
                        value={regForm.phone}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300"
                      />
                    </div>

                    {/* Course Selection */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                        Course <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={regForm.courseName}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, courseName: e.target.value, courseLevel: "" }))}
                        className={`w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${
                          regForm.courseName ? "text-gray-800" : "text-gray-300"
                        }`}
                      >
                        <option value="" disabled>— Select a course —</option>
                        {TRIAL_COURSES.map((course) => (
                          <option key={course.name} value={course.name}>{course.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Level Selection — only show after course is selected */}
                    {regForm.courseName && (
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                          Level <span className="text-red-400">*</span>
                        </label>
                        <select
                          required
                          value={regForm.courseLevel}
                          onChange={(e) => setRegForm((prev) => ({ ...prev, courseLevel: e.target.value }))}
                          className={`w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${
                            regForm.courseLevel ? "text-gray-800" : "text-gray-300"
                          }`}
                        >
                          <option value="" disabled>— Select a level —</option>
                          {TRIAL_COURSES.find((c) => c.name === regForm.courseName)?.levels.map((level) => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💳</span>
                      <h4 className="text-sm font-bold text-gray-700">Payment</h4>
                    </div>
                    <div className="bg-white/80 rounded-lg px-3.5 py-2.5 border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Trial Class Fee</span>
                        <span className="text-base font-bold text-emerald-700">฿500</span>
                      </div>
                    </div>

                    {/* Payment Method Toggle */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
                        💰 Payment Method <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => { setPaymentMethod("cash"); handleRemoveSlip() }}
                          className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border-2 transition-all duration-200 ${
                            paymentMethod === "cash"
                              ? "border-emerald-500 bg-emerald-50 shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <span className="text-xl">💵</span>
                          <span className={`text-xs font-bold ${paymentMethod === "cash" ? "text-emerald-700" : "text-gray-500"}`}>
                            Cash
                          </span>
                          <span className="text-[10px] text-gray-400">Pay cash on class day</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("transfer")}
                          className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border-2 transition-all duration-200 ${
                            paymentMethod === "transfer"
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <span className="text-xl">🏦</span>
                          <span className={`text-xs font-bold ${paymentMethod === "transfer" ? "text-blue-700" : "text-gray-500"}`}>
                            Transfer
                          </span>
                          <span className="text-[10px] text-gray-400">Transfer + attach slip</span>
                        </button>
                      </div>
                    </div>

                    {/* Transfer: Show QR / bank info image + slip upload */}
                    {paymentMethod === "transfer" && (
                      <div className="space-y-3 pt-1">
                        {/* Fee QR / Bank info image */}
                        <div className="rounded-lg border border-blue-200 overflow-hidden bg-white">
                          <img
                            src="/images/fee500.jpeg"
                            alt="Payment info - ฿500"
                            className="w-full object-contain"
                          />
                        </div>

                        {/* Slip Upload */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                            <Upload className="w-3.5 h-3.5 text-emerald-500" />
                            Payment Slip <span className="text-red-400">*</span>
                          </label>

                          {slipPreview ? (
                            /* Preview uploaded slip */
                            <div className="relative rounded-lg border border-emerald-200 overflow-hidden bg-white">
                              <img
                                src={slipPreview}
                                alt="Payment slip"
                                className="w-full max-h-48 object-contain"
                              />
                              {/* Uploading overlay */}
                              {slipUploading && (
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                    <span className="text-xs font-medium text-blue-600">Uploading...</span>
                                  </div>
                                </div>
                              )}
                              {/* Upload success indicator */}
                              {slipUrl && !slipUploading && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                              )}
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={handleRemoveSlip}
                                disabled={slipUploading}
                                className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            /* Upload drop zone */
                            <button
                              type="button"
                              onClick={() => slipInputRef.current?.click()}
                              className="w-full rounded-lg border-2 border-dashed border-emerald-300 hover:border-emerald-400 bg-white hover:bg-emerald-50/50 py-6 flex flex-col items-center gap-2 transition-all"
                            >
                              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-emerald-500" />
                              </div>
                              <span className="text-xs font-medium text-gray-500">Tap to upload payment slip</span>
                              <span className="text-[10px] text-gray-400">JPG, PNG, WebP · Max 10 MB</span>
                            </button>
                          )}

                          <input
                            ref={slipInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleSlipSelect}
                          />
                        </div>
                      </div>
                    )}

                    {/* Cash: Show note */}
                    {paymentMethod === "cash" && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
                        <p className="text-xs text-amber-700 font-medium">
                          💵 Please prepare ฿500 cash for payment on Trial Class day
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Error message */}
                  {regError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 flex items-center gap-2">
                      <span className="text-sm">⚠️</span>
                      <p className="text-xs text-red-600 font-medium">{regError}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={regSubmitting || slipUploading || !regForm.studentName || !regForm.age || !regForm.phone || !regForm.courseName || !regForm.courseLevel || (paymentMethod === "transfer" && !slipUrl)}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)",
                    }}
                  >
                    {regSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Register for Trial Class
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ── Trial Class Slot List ── */
            <div className="space-y-4">

              {/* Date Picker */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={trialDate}
                  onChange={(e) => handleTrialDateChange(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-800 font-medium"
                />
                <p className="text-[10px] text-blue-500 mt-1.5 font-medium">
                  📅 Showing slots for: {new Date(trialDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
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
            onClick={() => fetchSlots()}
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
