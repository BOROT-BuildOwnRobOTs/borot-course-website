"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ChevronDown } from "lucide-react"
import { SLOTS, MAX_PER_SLOT, getNextSlotDateStr, getTwoHourSlotOptions, isTwoHourTime, getConstituentSlotTimes } from "@/lib/slots"
import { StudentData, Enrollment, SlotAvailability } from "../types"

interface Props {
  open: boolean
  onClose: () => void
  student: StudentData | null
  enrollIdx: number
  userRole: "teacher" | "parent" | "admin"
  onSaved: (studentId: string, updatedEnrollments: Enrollment[]) => void
}

// Unique days in order
const DAY_OPTIONS = [
  { value: "tuesday", label: "Tuesday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
]

type DurationTab = "1hr" | "2hr"

export default function SlotDialog({ open, onClose, student, enrollIdx, userRole, onSaved }: Props) {
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [newSlotDay, setNewSlotDay] = useState("")
  const [newSlotTime, setNewSlotTime] = useState("")
  const [newStartDate, setNewStartDate] = useState("")
  const [savingSlot, setSavingSlot] = useState(false)
  const [selectedDay, setSelectedDay] = useState("")
  const [durationTab, setDurationTab] = useState<DurationTab>("1hr")

  useEffect(() => {
    if (!open || !student) return
    const enroll = student.enrollments[enrollIdx]
    const currentDay = enroll.slot?.day || ""
    const currentTime = enroll.slot?.time || ""
    setNewSlotDay(currentDay)
    setNewSlotTime(currentTime)
    setNewStartDate(enroll.startDate ? enroll.startDate.slice(0, 10) : "")
    setSlotAvailability([])
    setSelectedDay(currentDay || "tuesday")

    // Detect if current slot is 2hr
    // Detect if current slot or any existing reschedule is 2hr
    let detectedTwoHr = isTwoHourTime(currentTime)
    if (!detectedTwoHr && enroll.reschedules?.length) {
      for (const r of enroll.reschedules as any[]) {
        if (isTwoHourTime(r.newSlot?.time)) {
          detectedTwoHr = true
          break
        }
      }
    }
    setDurationTab(detectedTwoHr ? "2hr" : "1hr")

    // fetch slot availability
    setLoadingSlots(true)
    fetch(`/api/admin/slots?courseId=${enroll.course}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setSlotAvailability(j.data) })
      .finally(() => setLoadingSlots(false))
  }, [open, student, enrollIdx])

  const handleSave = async () => {
    if (!student || !newSlotDay || !newSlotTime) return
    setSavingSlot(true)
    const updatedEnrollments = student.enrollments.map((e, i) =>
      i === enrollIdx
        ? { ...e, slot: { day: newSlotDay, time: newSlotTime }, startDate: newStartDate ? new Date(newStartDate).toISOString() : e.startDate }
        : e
    )
    try {
      const res = await fetch(`/api/admin/students/${student._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollments: updatedEnrollments }),
      })
      const j = await res.json()
      if (j.success) {
        onSaved(student._id, updatedEnrollments)
        onClose()
      }
    } finally {
      setSavingSlot(false)
    }
  }

  // Get raw 1hr slot list
  const rawSlotList = slotAvailability.length > 0
    ? slotAvailability
    : SLOTS.map((s) => ({ id: s.id, day: s.day, dayLabel: s.dayLabel, time: s.time, count: 0, max: MAX_PER_SLOT, available: true }))

  // Build the displayed slot list based on duration tab
  const displaySlotList = useMemo(() => {
    if (!selectedDay) return []

    if (durationTab === "1hr") {
      // Show 1-hour slots
      return rawSlotList.filter((s) => s.day === selectedDay && !isTwoHourTime(s.time))
    } else {
      // Show 2-hour grouped slots
      const twoHourOptions = getTwoHourSlotOptions()
      const dayTwoHourOptions = twoHourOptions.filter((s) => s.day === selectedDay)

      // Build availability map for 1hr slots
      const availMap = new Map<string, SlotAvailability>()
      for (const s of rawSlotList) {
        availMap.set(`${s.day}|${s.time}`, s)
      }

      return dayTwoHourOptions.map((twoHr) => {
        const slotsData = twoHr.constituentSlots.map((cs) =>
          availMap.get(`${twoHr.day}|${cs.time}`) || { id: `${twoHr.day}-${cs.time}`, day: twoHr.day, dayLabel: twoHr.dayLabel, time: cs.time, count: 0, max: MAX_PER_SLOT, available: true }
        )
        const combinedCount = Math.max(...slotsData.map((s) => s.count))
        const combinedAvailable = slotsData.every((s) => s.count < (s.max || MAX_PER_SLOT))

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
  }, [selectedDay, durationTab, rawSlotList])

  // Get the label for the selected day
  const selectedDayLabel = DAY_OPTIONS.find((d) => d.value === selectedDay)?.label || ""

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Class Slot</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Current slot info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-700 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-purple-500">
              <span>📌 Current slot:</span>
              <span className="font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
                {student?.enrollments[enrollIdx]?.slot
                  ? (() => {
                      const s = student.enrollments[enrollIdx].slot!
                      if (isTwoHourTime(s.time)) {
                        const parts = getConstituentSlotTimes(s.time)
                        return `${s.day.charAt(0).toUpperCase() + s.day.slice(1)} ${parts.join(' , ')}`
                      }
                      return `${s.day.charAt(0).toUpperCase() + s.day.slice(1)} ${s.time}`
                    })()
                  : 'Not set'}
              </span>
            </div>
          </div>

          {/* Duration Tab Switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                setDurationTab("1hr")
                setNewSlotTime("")
              }}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                durationTab === "1hr"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ⏱ 1 Hour
            </button>
            <button
              type="button"
              onClick={() => {
                setDurationTab("2hr")
                setNewSlotTime("")
              }}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                durationTab === "2hr"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ⏱⏱ 2 Hours
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Select Day</Label>
              {loadingSlots && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            {/* Day dropdown */}
            <div className="relative">
              <select
                value={selectedDay}
                onChange={(e) => {
                  setSelectedDay(e.target.value)
                  // Clear time selection when changing day (unless same day)
                  if (e.target.value !== newSlotDay) {
                    setNewSlotTime("")
                    setNewSlotDay("")
                  }
                }}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm font-medium focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all cursor-pointer"
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
                Select Time — <span className="text-purple-600 font-semibold">{selectedDayLabel}</span>
                {durationTab === "2hr" && (
                  <span className="ml-1 text-[11px] text-gray-400 font-normal">(2-hour block)</span>
                )}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {displaySlotList.map((slot) => {
                  const isSelected = newSlotDay === slot.day && newSlotTime === slot.time
                  const isFull = slot.count >= (slot.max || MAX_PER_SLOT) && !isSelected
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isFull}
                      onClick={() => {
                        if (isSelected) { setNewSlotDay(""); setNewSlotTime("") }
                        else {
                          setNewSlotDay(slot.day)
                          setNewSlotTime(slot.time)
                          if (!newStartDate) setNewStartDate(getNextSlotDateStr(slot.day))
                        }
                      }}
                      className={`relative text-center px-2 py-3 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? "bg-purple-500 text-white border-purple-500 shadow-md"
                          : isFull
                          ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                    >
                      <div className="font-semibold text-sm">{slot.time}</div>
                      <div className={`text-[10px] mt-1.5 font-medium ${isSelected ? "text-white/80" : isFull ? "text-red-400" : "text-green-600"}`}>
                        {slot.count}/{slot.max || MAX_PER_SLOT} seats
                      </div>
                      {isFull && <span className="absolute top-1 right-1 text-[9px] bg-red-100 text-red-500 px-1 rounded">Full</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <Label>First Class Date</Label>
            {userRole === "admin" || userRole === "teacher" ? (
              <Input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} className="mt-1" />
            ) : (
              <div className="mt-1 px-3 py-2 rounded-md border bg-muted/40 text-sm text-muted-foreground">
                {newStartDate
                  ? new Date(newStartDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
                  : "Not set yet"}
                <p className="text-xs mt-0.5 text-muted-foreground/70">* Can only be edited by admin or teacher</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={savingSlot || !newSlotDay || !newSlotTime} className="bg-purple-500 hover:bg-purple-600 text-white">
            {savingSlot ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Save Slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}