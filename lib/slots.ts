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
// 9:00-10:00, 10:00-11:00, 11:00-12:00, 13:00-14:00, 14:00-15:00, 15:00-16:00, 16:00-17:00
export const SLOTS = [
  { id: 'tue-0900', day: 'tuesday',  dayLabel: 'Tuesday',   time: '09:00-10:00', startHour: 9,  startMin: 0 },
  { id: 'tue-1000', day: 'tuesday',  dayLabel: 'Tuesday',   time: '10:00-11:00', startHour: 10, startMin: 0 },
  { id: 'tue-1100', day: 'tuesday',  dayLabel: 'Tuesday',   time: '11:00-12:00', startHour: 11, startMin: 0 },
  { id: 'tue-1300', day: 'tuesday',  dayLabel: 'Tuesday',   time: '13:00-14:00', startHour: 13, startMin: 0 },
  { id: 'tue-1400', day: 'tuesday',  dayLabel: 'Tuesday',   time: '14:00-15:00', startHour: 14, startMin: 0 },
  { id: 'tue-1500', day: 'tuesday',  dayLabel: 'Tuesday',   time: '15:00-16:00', startHour: 15, startMin: 0 },
  { id: 'tue-1600', day: 'tuesday',  dayLabel: 'Tuesday',   time: '16:00-17:00', startHour: 16, startMin: 0 },
  { id: 'fri-0900', day: 'friday',   dayLabel: 'Friday',    time: '09:00-10:00', startHour: 9,  startMin: 0 },
  { id: 'fri-1000', day: 'friday',   dayLabel: 'Friday',    time: '10:00-11:00', startHour: 10, startMin: 0 },
  { id: 'fri-1100', day: 'friday',   dayLabel: 'Friday',    time: '11:00-12:00', startHour: 11, startMin: 0 },
  { id: 'fri-1300', day: 'friday',   dayLabel: 'Friday',    time: '13:00-14:00', startHour: 13, startMin: 0 },
  { id: 'fri-1400', day: 'friday',   dayLabel: 'Friday',    time: '14:00-15:00', startHour: 14, startMin: 0 },
  { id: 'fri-1500', day: 'friday',   dayLabel: 'Friday',    time: '15:00-16:00', startHour: 15, startMin: 0 },
  { id: 'fri-1600', day: 'friday',   dayLabel: 'Friday',    time: '16:00-17:00', startHour: 16, startMin: 0 },
  { id: 'sat-0900', day: 'saturday', dayLabel: 'Saturday',  time: '09:00-10:00', startHour: 9,  startMin: 0 },
  { id: 'sat-1000', day: 'saturday', dayLabel: 'Saturday',  time: '10:00-11:00', startHour: 10, startMin: 0 },
  { id: 'sat-1100', day: 'saturday', dayLabel: 'Saturday',  time: '11:00-12:00', startHour: 11, startMin: 0 },
  { id: 'sat-1300', day: 'saturday', dayLabel: 'Saturday',  time: '13:00-14:00', startHour: 13, startMin: 0 },
  { id: 'sat-1400', day: 'saturday', dayLabel: 'Saturday',  time: '14:00-15:00', startHour: 14, startMin: 0 },
  { id: 'sat-1500', day: 'saturday', dayLabel: 'Saturday',  time: '15:00-16:00', startHour: 15, startMin: 0 },
  { id: 'sat-1600', day: 'saturday', dayLabel: 'Saturday',  time: '16:00-17:00', startHour: 16, startMin: 0 },
  { id: 'sun-0900', day: 'sunday',   dayLabel: 'Sunday',    time: '09:00-10:00', startHour: 9,  startMin: 0 },
  { id: 'sun-1000', day: 'sunday',   dayLabel: 'Sunday',    time: '10:00-11:00', startHour: 10, startMin: 0 },
  { id: 'sun-1100', day: 'sunday',   dayLabel: 'Sunday',    time: '11:00-12:00', startHour: 11, startMin: 0 },
  { id: 'sun-1300', day: 'sunday',   dayLabel: 'Sunday',    time: '13:00-14:00', startHour: 13, startMin: 0 },
  { id: 'sun-1400', day: 'sunday',   dayLabel: 'Sunday',    time: '14:00-15:00', startHour: 14, startMin: 0 },
  { id: 'sun-1500', day: 'sunday',   dayLabel: 'Sunday',    time: '15:00-16:00', startHour: 15, startMin: 0 },
  { id: 'sun-1600', day: 'sunday',   dayLabel: 'Sunday',    time: '16:00-17:00', startHour: 16, startMin: 0 },
] as const

export const MAX_PER_SLOT = 6

export type SlotDay = 'tuesday' | 'friday' | 'saturday' | 'sunday'
export type SlotTime = '09:00-10:00' | '10:00-11:00' | '11:00-12:00' | '13:00-14:00' | '15:00-16:00' | '16:00-17:00'

export interface SlotInfo {
  day: string
  time: string
}

// ── 2-Hour Slot Helpers ─────────────────────────────────────────────────────
// 2-hour slots are formed from adjacent 1-hour slots, skipping the 9:00-10:00 slot.
// e.g., 10:00-11:00 + 11:00-12:00 = 10:00-12:00
//       15:00-16:00 + 16:00-17:00 = 15:00-17:00
//       13:00-14:00 stands alone (no adjacent 14:00-15:00)

/**
 * Check if a slot time string represents a 2-hour booking.
 * 1-hr: "10:00-11:00", 2-hr: "10:00-12:00"
 */
export function isTwoHourTime(time: string): boolean {
  if (!time || !time.includes('-')) return false
  const parts = time.split('-')
  if (parts.length !== 2) return false
  const startH = parseInt(parts[0].split(':')[0], 10)
  const endH = parseInt(parts[1].split(':')[0], 10)
  if (isNaN(startH) || isNaN(endH)) return false
  return endH - startH === 2
}

/**
 * Break a 2-hour time string into constituent 1-hour time strings.
 * Uses pre-defined TWO_HOUR_SLOT_BLOCKS as source of truth.
 * e.g., "10:00-12:00" -> ["10:00-11:00", "11:00-12:00"]
 *        "13:00-15:00" -> ["13:00-14:00", "14:00-15:00"]
 */
export function getConstituentSlotTimes(twoHourTime: string): string[] {
  const block = TWO_HOUR_SLOT_BLOCKS.find((b) => b.time === twoHourTime)
  if (block) return [...block.constituentTimes]
  // Fallback: compute arithmetically
  const parts = twoHourTime.split('-')
  if (parts.length !== 2) return []
  const startH = parseInt(parts[0].split(':')[0], 10)
  const endH = parseInt(parts[1].split(':')[0], 10)
  if (isNaN(startH) || isNaN(endH) || endH - startH !== 2) return []
  return [
    `${String(startH).padStart(2, '0')}:00-${String(startH + 1).padStart(2, '0')}:00`,
    `${String(startH + 1).padStart(2, '0')}:00-${String(endH).padStart(2, '0')}:00`,
  ]
}

/**
 * Get constituent SlotInfo objects for a 2-hour booking.
 * e.g., { day: "tuesday", time: "10:00-12:00" } ->
 *   [{ day: "tuesday", time: "10:00-11:00" }, { day: "tuesday", time: "11:00-12:00" }]
 */
export function getConstituentSlots(slot: SlotInfo): SlotInfo[] {
  if (!isTwoHourTime(slot.time)) return [slot]
  const times = getConstituentSlotTimes(slot.time)
  return times.map((time) => ({ day: slot.day, time }))
}

/**
 * Pre-defined 2-hour slot blocks.
 * Maps 2-hour time ranges to constituent 1-hour slots.
 * Only 3 blocks: 10:00-12:00, 13:00-15:00, 15:00-17:00 (skip 9:00).
 */
export const TWO_HOUR_SLOT_BLOCKS = [
  {
    time: '10:00-12:00' as const,
    constituentTimes: ['10:00-11:00', '11:00-12:00'] as const,
  },
  {
    time: '13:00-15:00' as const,
    constituentTimes: ['13:00-14:00', '14:00-15:00'] as const,
  },
  {
    time: '15:00-17:00' as const,
    constituentTimes: ['15:00-16:00', '16:00-17:00'] as const,
  },
] as const

/**
 * Compute available 2-hour slot options from pre-defined blocks.
 */
export function getTwoHourSlotOptions(): {
  id: string
  day: string
  dayLabel: string
  time: string
  constituentSlots: { day: string; time: string }[]
}[] {
  const result: ReturnType<typeof getTwoHourSlotOptions> = []
  const days = ['tuesday', 'friday', 'saturday', 'sunday']
  for (const day of days) {
    for (const block of TWO_HOUR_SLOT_BLOCKS) {
      result.push({
        id: `${day}-${block.time.replace(/[:]/g, '').replace('-', '00-')}00`,
        day,
        dayLabel: SLOTS.find((s) => s.day === day)?.dayLabel || day,
        time: block.time,
        constituentSlots: block.constituentTimes.map((t) => ({ day, time: t })),
      })
    }
  }
  return result
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getSlotById(id: string) {
  return SLOTS.find((s) => s.id === id)
}

export function getSlotByDayAndTime(day: string, time: string) {
  // Check 1-hr slots first
  const found = SLOTS.find((s) => s.day === day && s.time === time)
  if (found) return found
  // Check 2-hr slot options
  if (isTwoHourTime(time)) {
    const twoHourOptions = getTwoHourSlotOptions()
    const twoHr = twoHourOptions.find((s) => s.day === day && s.time === time)
    if (twoHr) {
      // Return the first constituent slot info (for startHour, startMin etc.)
      return SLOTS.find((s) => s.day === day && s.time === twoHr.constituentSlots[0].time)
    }
  }
  return undefined
}

export function getSlotLabel(slot: SlotInfo | null | undefined): string {
  if (!slot) return ''
  if (isTwoHourTime(slot.time)) {
    const parts = getConstituentSlotTimes(slot.time)
    const found = SLOTS.find((s) => s.day === slot.day && s.time === parts[0])
    const dayLabel = found ? found.dayLabel : slot.day
    return `${dayLabel} ${parts.join(' , ')}`
  }
  const found = SLOTS.find((s) => s.day === slot.day && s.time === slot.time)
  return found ? `${found.dayLabel} ${found.time}` : `${slot.day} ${slot.time}`
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

  // For 2-hour slots, find the first constituent 1-hr slot's startHour/startMin
  let startHour: number
  let startMin: number
  if (isTwoHourTime(slot.time)) {
    const parts = getConstituentSlotTimes(slot.time)
    const firstSlot = SLOTS.find((s) => s.day === slot.day && s.time === parts[0])
    startHour = firstSlot?.startHour ?? parseInt(slot.time.split(':')[0], 10)
    startMin = firstSlot?.startMin ?? 0
  } else {
    const slotInfo = SLOTS.find((s) => s.day === slot.day && s.time === slot.time)
    if (!slotInfo) return []
    startHour = slotInfo.startHour
    startMin = slotInfo.startMin
  }

  const start = new Date(startDate)
  return Array.from({ length: durationWeeks }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i * 7)
    d.setHours(startHour, startMin, 0, 0)
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