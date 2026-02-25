// ── Slot definitions ─────────────────────────────────────────────────────────
export const SLOTS = [
  { id: 'sat-1000', day: 'saturday', dayLabel: 'วันเสาร์',   time: '10:00-12:00', startHour: 10, startMin: 0 },
  { id: 'sat-1300', day: 'saturday', dayLabel: 'วันเสาร์',   time: '13:00-15:00', startHour: 13, startMin: 0 },
  { id: 'sat-1530', day: 'saturday', dayLabel: 'วันเสาร์',   time: '15:30-17:30', startHour: 15, startMin: 30 },
  { id: 'sun-1000', day: 'sunday',   dayLabel: 'วันอาทิตย์', time: '10:00-12:00', startHour: 10, startMin: 0 },
  { id: 'sun-1300', day: 'sunday',   dayLabel: 'วันอาทิตย์', time: '13:00-15:00', startHour: 13, startMin: 0 },
  { id: 'sun-1530', day: 'sunday',   dayLabel: 'วันอาทิตย์', time: '15:30-17:30', startHour: 15, startMin: 30 },
] as const

export const MAX_PER_SLOT = 8

export type SlotDay = 'saturday' | 'sunday'
export type SlotTime = '10:00-12:00' | '13:00-15:00' | '15:30-17:30'

export interface SlotInfo {
  day: string
  time: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getSlotById(id: string) {
  return SLOTS.find((s) => s.id === id)
}

export function getSlotByDayAndTime(day: string, time: string) {
  return SLOTS.find((s) => s.day === day && s.time === time)
}

export function getSlotLabel(slot: SlotInfo | null | undefined): string {
  if (!slot) return ''
  const found = SLOTS.find((s) => s.day === slot.day && s.time === slot.time)
  return found ? `${found.dayLabel} ${found.time} น.` : ''
}

export function getSlotDayOfWeek(day: string): number {
  // JS: 0=Sun, 6=Sat
  return day === 'saturday' ? 6 : 0
}

/** Generate all stamp dates for an enrollment */
export function generateStampDates(
  startDate: Date | string,
  durationWeeks: number,
  slot: SlotInfo
): Date[] {
  if (!startDate || !durationWeeks || !slot) return []
  const slotInfo = SLOTS.find((s) => s.day === slot.day && s.time === slot.time)
  if (!slotInfo) return []

  const start = new Date(startDate)
  return Array.from({ length: durationWeeks }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i * 7)
    d.setHours(slotInfo.startHour, slotInfo.startMin, 0, 0)
    return d
  })
}

/** Get the next upcoming Saturday or Sunday date string (YYYY-MM-DD) */
export function getNextSlotDateStr(slotDay: string): string {
  const target = getSlotDayOfWeek(slotDay)
  const today = new Date()
  const current = today.getDay()
  let diff = (target - current + 7) % 7
  if (diff === 0) diff = 7 // always pick a future date
  const next = new Date(today)
  next.setDate(today.getDate() + diff)
  return next.toISOString().split('T')[0]
}

/** Check if two dates fall on the same calendar day */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
