"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { SLOTS, MAX_PER_SLOT, getNextSlotDateStr } from "@/lib/slots"
import { StudentData, Enrollment, SlotAvailability } from "../types"

interface Props {
  open: boolean
  onClose: () => void
  student: StudentData | null
  enrollIdx: number
  userRole: "teacher" | "parent" | "admin"
  onSaved: (studentId: string, updatedEnrollments: Enrollment[]) => void
}

export default function SlotDialog({ open, onClose, student, enrollIdx, userRole, onSaved }: Props) {
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [newSlotDay, setNewSlotDay] = useState("")
  const [newSlotTime, setNewSlotTime] = useState("")
  const [newStartDate, setNewStartDate] = useState("")
  const [savingSlot, setSavingSlot] = useState(false)

  useEffect(() => {
    if (!open || !student) return
    const enroll = student.enrollments[enrollIdx]
    setNewSlotDay(enroll.slot?.day || "")
    setNewSlotTime(enroll.slot?.time || "")
    setNewStartDate(enroll.startDate ? enroll.startDate.slice(0, 10) : "")
    setSlotAvailability([])
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

  const slotList = slotAvailability.length > 0
    ? slotAvailability
    : SLOTS.map((s) => ({ id: s.id, day: s.day, dayLabel: s.dayLabel, time: s.time, count: 0, max: MAX_PER_SLOT, available: true }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              {slotList.map((slot) => {
                const isSelected = newSlotDay === slot.day && newSlotTime === slot.time
                const isFull = slot.count >= slot.max && !isSelected
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
                    className={`relative text-center px-2 py-2.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? "bg-purple-500 text-white border-purple-500"
                        : isFull
                        ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
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
            {userRole === "admin" || userRole === "teacher" ? (
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
          <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
          <Button onClick={handleSave} disabled={savingSlot || !newSlotDay} className="bg-purple-500 hover:bg-purple-600 text-white">
            {savingSlot ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />กำลังบันทึก...</> : "บันทึก Slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
