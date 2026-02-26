"use client"

import { useEffect, useState } from "react"
import { X, Users, Clock, Calendar, RefreshCw, Loader2 } from "lucide-react"

interface SlotData {
  id: string
  day: string
  dayLabel: string
  time: string
  count: number
  max: number
  available: boolean
}

interface SlotStatusModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SlotStatusModal({ isOpen, onClose }: SlotStatusModalProps) {
  const [slots, setSlots] = useState<SlotData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchSlots = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/slots")
      const json = await res.json()
      if (json.success) {
        setSlots(json.data)
        setLastUpdated(new Date())
      } else {
        setError("ไม่สามารถโหลดข้อมูลได้")
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) fetchSlots()
  }, [isOpen])

  if (!isOpen) return null

  const saturdaySlots = slots.filter((s) => s.day === "saturday")
  const sundaySlots = slots.filter((s) => s.day === "sunday")

  const totalStudents = slots.reduce((sum, s) => sum + s.count, 0)
  const totalCapacity = slots.reduce((sum, s) => sum + s.max, 0)

  const getStatusColor = (count: number, max: number) => {
    const ratio = count / max
    if (ratio >= 1) return { bg: "bg-red-100", text: "text-red-600", bar: "bg-red-500", badge: "เต็มแล้ว", badgeBg: "bg-red-100 text-red-600" }
    if (ratio >= 0.75) return { bg: "bg-orange-50", text: "text-orange-600", bar: "bg-orange-500", badge: "ใกล้เต็ม", badgeBg: "bg-orange-100 text-orange-600" }
    return { bg: "bg-green-50", text: "text-green-600", bar: "bg-green-500", badge: "ยังมีที่ว่าง", badgeBg: "bg-green-100 text-green-600" }
  }

  const SlotCard = ({ slot }: { slot: SlotData }) => {
    const status = getStatusColor(slot.count, slot.max)
    const pct = Math.min((slot.count / slot.max) * 100, 100)

    return (
      <div className={`rounded-xl p-4 border border-gray-100 ${status.bg} transition-all`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-800 text-sm">{slot.time} น.</span>
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
            <span className="text-xs text-gray-400">/ {slot.max} คน</span>
          </div>
          <span className="text-xs text-gray-400">ที่ว่าง {slot.max - slot.count} ที่</span>
        </div>
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
          className="px-6 pt-6 pb-5"
          style={{ background: "linear-gradient(135deg, #E5690D 0%, #FF8C00 100%)" }}
        >
          {/* Drag indicator (mobile) */}
          <div className="sm:hidden w-10 h-1 bg-white/40 rounded-full mx-auto mb-4" />

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🎓</span>
                <h2 className="text-white font-bold text-xl leading-tight">
                  สถานะผู้เรียนปัจจุบัน
                </h2>
              </div>
              <p className="text-orange-100 text-sm">จำนวนที่นั่งในแต่ละรอบเรียน</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors ml-3 flex-shrink-0 mt-0.5"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Summary Stats */}
          {!loading && slots.length > 0 && (
            <div className="mt-4 bg-white/15 rounded-xl p-3 flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-white/80 text-xs">ผู้เรียนทั้งหมด</p>
                <p className="text-white font-bold text-xl">{totalStudents}</p>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="text-center flex-1">
                <p className="text-white/80 text-xs">ความจุรวม</p>
                <p className="text-white font-bold text-xl">{totalCapacity}</p>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="text-center flex-1">
                <p className="text-white/80 text-xs">ที่ว่างรวม</p>
                <p className="text-white font-bold text-xl">{totalCapacity - totalStudents}</p>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] sm:max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-orange-400" />
              <p className="text-sm">กำลังโหลดข้อมูล...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-red-400">
              <p className="text-sm mb-3">{error}</p>
              <button
                onClick={fetchSlots}
                className="text-xs text-orange-500 hover:text-orange-700 underline"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <DaySection label="วันเสาร์" icon="📅" slotList={saturdaySlots} />
              <div className="border-t border-gray-100" />
              <DaySection label="วันอาทิตย์" icon="📅" slotList={sundaySlots} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-1 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            {lastUpdated ? (
              <span>อัปเดต {lastUpdated.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.</span>
            ) : (
              <span>—</span>
            )}
          </div>
          <button
            onClick={fetchSlots}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-700 font-medium disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            รีเฟรช
          </button>
        </div>
      </div>
    </div>
  )
}
