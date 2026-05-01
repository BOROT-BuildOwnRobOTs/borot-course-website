// ── Trial slot definitions ───────────────────────────────────────────────────
// 20-minute trial sessions, spaced every 30 minutes, lunch break 12:00–13:00
export const TRIAL_SLOTS = [
  { id: 'trial-1000', time: '10:00-10:20', startHour: 10, startMin: 0 },
  { id: 'trial-1030', time: '10:30-10:50', startHour: 10, startMin: 30 },
  { id: 'trial-1100', time: '11:00-11:20', startHour: 11, startMin: 0 },
  { id: 'trial-1130', time: '11:30-11:50', startHour: 11, startMin: 30 },
  // ── Lunch break 12:00–13:00 ──
  { id: 'trial-1300', time: '13:00-13:20', startHour: 13, startMin: 0 },
  { id: 'trial-1330', time: '13:30-13:50', startHour: 13, startMin: 30 },
  { id: 'trial-1400', time: '14:00-14:20', startHour: 14, startMin: 0 },
  { id: 'trial-1430', time: '14:30-14:50', startHour: 14, startMin: 30 },
  { id: 'trial-1500', time: '15:00-15:20', startHour: 15, startMin: 0 },
  { id: 'trial-1530', time: '15:30-15:50', startHour: 15, startMin: 30 },
  { id: 'trial-1600', time: '16:00-16:20', startHour: 16, startMin: 0 },
  { id: 'trial-1630', time: '16:30-16:50', startHour: 16, startMin: 30 },
] as const

export const MAX_PER_TRIAL_SLOT = 3

// ── Regular slot definitions ─────────────────────────────────────────────────
// 1-hour sessions with 30-minute breaks between slots (except first two are back-to-back)
// 9:00-10:00, 10:00-11:00, 11:00-12:00, 13:00-14:00, 15:00-16:00, 16:00-17:00
export const SLOTS = [
  { id: 'tue-0900', day: 'tuesday',  dayLabel: 'Tuesday',   time: '09:00-10:00', startHour: 9,  startMin: 0 },
  { id: 'tue-1000', day: 'tuesday',  dayLabel: 'Tuesday',   time: '10:00-11:00', startHour: 10, startMin: 0 },
  { id: 'tue-1100', day: 'tuesday',  dayLabel: 'Tuesday',   time: '11:00-12:00', startHour: 11, startMin: 0 },
  { id: 'tue-1300', day: 'tuesday',  dayLabel: 'Tuesday',   time: '13:00-14:00', startHour: 13, startMin: 0 },
  { id: 'tue-1500', day: 'tuesday',  dayLabel: 'Tuesday',   time: '15:00-16:00', startHour: 15, startMin: 0 },
  { id: 'tue-1600', day: 'tuesday',  dayLabel: 'Tuesday',   time: '16:00-17:00', startHour: 16, startMin: 0 },
  { id: 'fri-0900', day: 'friday',   dayLabel: 'Friday',    time: '09:00-10:00', startHour: 9,  startMin: 0 },
  { id: 'fri-1000', day: 'friday',   dayLabel: 'Friday',    time: '10:00-11:00', startHour: 10, startMin: 0 },
  { id: 'fri-1100', day: 'friday',   dayLabel: 'Friday',    time: '11:00-12:00', startHour: 11, startMin: 0 },
  { id: 'fri-1300', day: 'friday',   dayLabel: 'Friday',    time: '13:00-14:00', startHour: 13, startMin: 0 },
  { id: 'fri-1500', day: 'friday',   dayLabel: 'Friday',    time: '15:00-16:00', startHour: 15, startMin: 0 },
  { id: 'fri-1600', day: 'friday',   dayLabel: 'Friday',    time: '16:00-17:00', startHour: 16, startMin: 0 },
  { id: 'sat-0900', day: 'saturday', dayLabel: 'Saturday',  time: '09:00-10:00', startHour: 9,  startMin: 0 },
  { id: 'sat-1000', day: 'saturday', dayLabel: 'Saturday',  time: '10:00-11:00', startHour: 10, startMin: 0 },
  { id: 'sat-1100', day: 'saturday', dayLabel: 'Saturday',  time: '11:00-12:00', startHour: 11, startMin: 0 },
  { id: 'sat-1300', day: 'saturday', dayLabel: 'Saturday',  time: '13:00-14:00', startHour: 13, startMin: 0 },
  { id: 'sat-1500', day: 'saturday', dayLabel: 'Saturday',  time: '15:00-16:00', startHour: 15, startMin: 0 },
  { id: 'sat-1600', day: 'saturday', dayLabel: 'Saturday',  time: '16:00-17:00', startHour: 16, startMin: 0 },
  { id: 'sun-0900', day: 'sunday',   dayLabel: 'Sunday',    time: '09:00-10:00', startHour: 9,  startMin: 0 },
  { id: 'sun-1000', day: 'sunday',   dayLabel: 'Sunday',    time: '10:00-11:00', startHour: 10, startMin: 0 },
  { id: 'sun-1100', day: 'sunday',   dayLabel: 'Sunday',    time: '11:00-12:00', startHour: 11, startMin: 0 },
  { id: 'sun-1300', day: 'sunday',   dayLabel: 'Sunday',    time: '13:00-14:00', startHour: 13, startMin: 0 },
  { id: 'sun-1500', day: 'sunday',   dayLabel: 'Sunday',    time: '15:00-16:00', startHour: 15, startMin: 0 },
  { id: 'sun-1600', day: 'sunday',   dayLabel: 'Sunday',    time: '16:00-17:00', startHour: 16, startMin: 0 },
] as const

export const MAX_PER_SLOT = 8

export type SlotDay = 'tuesday' | 'friday' | 'saturday' | 'sunday'
export type SlotTime = '09:00-10:00' | '10:00-11:00' | '11:00-12:00' | '13:00-14:00' | '15:00-16:00' | '16:00-17:00'

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
  return found ? `${found.dayLabel} ${found.time}` : ''
}

export function getSlotDayOfWeek(day: string): number {
  // JS: 0=Sun, 2=Tue, 5=Fri, 6=Sat
  if (day === 'tuesday') return 2
  if (day === 'friday') return 5
  if (day === 'saturday') return 6
  return 0 // sunday
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

/** Get the next upcoming slot date string (YYYY-MM-DD) */
export function getNextSlotDateStr(slotDay: string): string {
  const target = getSlotDayOfWeek(slotDay)
  const today = new Date()
  const current = today.getDay()
  let diff = (target - current + 7) % 7
  if (diff === 0) diff = 7 // always pick a future date
  const next = new Date(today)
  next.setDate(today.getDate() + diff)
  // Use local date components instead of toISOString() to avoid UTC timezone shift
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
}

/** Check if two dates fall on the same calendar day */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}