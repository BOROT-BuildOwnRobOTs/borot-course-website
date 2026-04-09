"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Users, ChevronDown } from "lucide-react"
import { SLOTS, MAX_PER_SLOT, getNextSlotDateStr } from "@/lib/slots"
import { StudentData, SlotAvailability } from "../types"

interface RescheduleSavedData {
  studentId: string
  enrollIdx: number
  originalDate: Date
  newSlot: { day: string; time: string }
  newDate: Date
  reason: string
}

interface Props {
  open: boolean
  onClose: () => void
  student: StudentData | null
  enrollIdx: number
  origDate: Date | null
  onSaved: (data: RescheduleSavedData) => void
}

// Unique days in order
const DAY_OPTIONS = [
  { value: "tuesday", label: "Tuesday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
]

export default function RescheduleDialog({ open, onClose, student, enrollIdx, origDate, onSaved }: Props) {
  const [reschedSlotAvailability, setReschedSlotAvailability] = useState<SlotAvailability[]>([])
  const [loadingReschedSlots, setLoadingReschedSlots] = useState(false)
  const [reschedNewSlotDay, setReschedNewSlotDay] = useState("")
  const [reschedNewSlotTime, setReschedNewSlotTime] = useState("")
  const [reschedNewDate, setReschedNewDate] = useState("")
  const [reschedReason, setReschedReason] = useState("")
  const [savingResched, setSavingResched] = useState(false)
  const [selectedDay, setSelectedDay] = useState("")

  useEffect(() => {
    if (!open || !student) return
    const enroll = student.enrollments[enrollIdx]
    const currentDay = enroll.slot?.day || ""
    setReschedNewSlotDay(currentDay)
    setReschedNewSlotTime(enroll.slot?.time || "")
    setReschedNewDate(getNextSlotDateStr(currentDay || "saturday"))
    setReschedReason("")
    setReschedSlotAvailability([])
    setSelectedDay(currentDay || "tuesday")
    // Fetch slot availability
    setLoadingReschedSlots(true)
    fetch(`/api/admin/slots?courseId=${enroll.course}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setReschedSlotAvailability(j.data) })
      .finally(() => setLoadingReschedSlots(false))
  }, [open, student, enrollIdx])

  const handleSave = async () => {
    if (!student || !origDate || !reschedNewSlotDay || !reschedNewSlotTime || !reschedNewDate) return
    setSavingResched(true)
    try {
      const res = await fetch(`/api/students/${student._id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentIndex: enrollIdx,
          originalDate: origDate.toISOString(),
          newSlot: { day: reschedNewSlotDay, time: reschedNewSlotTime },
          newDate: new Date(reschedNewDate).toISOString(),
          reason: reschedReason,
        }),
      })
      const j = await res.json()
      if (j.success) {
        onSaved({
          studentId: student._id,
          enrollIdx,
          originalDate: origDate,
          newSlot: { day: reschedNewSlotDay, time: reschedNewSlotTime },
          newDate: new Date(reschedNewDate),
          reason: reschedReason,
        })
        onClose()
      }
    } finally {
      setSavingResched(false)
    }
  }

  const slotList = reschedSlotAvailability.length > 0
    ? reschedSlotAvailability
    : SLOTS.map((s) => ({ id: s.id, day: s.day, dayLabel: s.dayLabel, time: s.time, count: 0, max: MAX_PER_SLOT, available: true }))

  // Filter slots by selected day
  const filteredSlots = useMemo(() => {
    if (!selectedDay) return []
    return slotList.filter((s) => s.day === selectedDay)
  }, [slotList, selectedDay])

  // Get the label for the selected day
  const selectedDayLabel = DAY_OPTIONS.find((d) => d.value === selectedDay)?.label || ""

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {origDate && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
              Original date: {origDate.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Select New Day</Label>
              {loadingReschedSlots && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            {/* Day dropdown */}
            <div className="relative">
              <select
                value={selectedDay}
                onChange={(e) => {
                  const newDay = e.target.value
                  setSelectedDay(newDay)
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
                {DAY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Time slots for selected day */}
          {selectedDay && (
            <div>
              <Label className="mb-2 block">
                Select Time — <span className="text-orange-600 font-semibold">{selectedDayLabel}</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {filteredSlots.map((slot) => {
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
                      className={`relative text-center px-2 py-3 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? "bg-orange-500 text-white border-orange-500 shadow-md"
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={savingResched || !reschedNewSlotDay || !reschedNewSlotTime || !reschedNewDate}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {savingResched ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Confirm Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
