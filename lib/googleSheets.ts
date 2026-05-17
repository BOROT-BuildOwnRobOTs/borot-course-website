import { google } from 'googleapis'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import Session from '@/models/Session'
import Course from '@/models/Course'
import '@/models/Parent'
import { generateStampDates, isSameDay, isTwoHourTime, getConstituentSlotTimes } from '@/lib/slots'

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const TAB_WEEK = 'สัปดาห์นี้'
const TAB_OVERVIEW = 'Overview'
const TAB_SCHEDULE = 'ตารางเรียน'
const KEEP_TABS = new Set([TAB_WEEK, TAB_OVERVIEW, TAB_SCHEDULE])

// Hard-coded students to hide from all sheets (still kept in DB)
const HIDDEN_STUDENT_NAMES = new Set([
  'ธนภัทร พันธิสุนทร',
])
const HIDDEN_STUDENT_NICKNAMES = new Set([
  'โอ๊ค',
])

function isHiddenStudent(student: any): boolean {
  const name = (student?.name ?? '').trim()
  const nick = (student?.nickname ?? '').trim()
  if (HIDDEN_STUDENT_NAMES.has(name)) return true
  if (nick && HIDDEN_STUDENT_NICKNAMES.has(nick) && name.includes('ธนภัทร')) return true
  return false
}

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

const TH_MONTH_ABBR = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

// Hour slots used by Schedule tab — 10:00–17:00 (7 columns per day)
const HOUR_SLOTS: { time: string; label: string }[] = [
  { time: '10:00-11:00', label: '10–11' },
  { time: '11:00-12:00', label: '11–12' },
  { time: '12:00-13:00', label: '12–13' },
  { time: '13:00-14:00', label: '13–14' },
  { time: '14:00-15:00', label: '14–15' },
  { time: '15:00-16:00', label: '15–16' },
  { time: '16:00-17:00', label: '16–17' },
]

function formatDate(d: Date | string | undefined): string {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('th-TH', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Bangkok',
  })
}

function dayLabel(day: string): string {
  const map: Record<string, string> = {
    monday: 'จันทร์', tuesday: 'อังคาร', wednesday: 'พุธ', thursday: 'พฤหัส',
    friday: 'ศุกร์', saturday: 'เสาร์', sunday: 'อาทิตย์',
  }
  return map[day] ?? day
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'กำลังเรียน', completed: 'เรียนจบแล้ว', dropped: 'ออกแล้ว', pending: 'รอเริ่ม',
  }
  return map[status] ?? status
}

function hoursPerSession(time: string | undefined): number {
  if (!time) return 1
  return isTwoHourTime(time) ? 2 : 1
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function weekRangeLabel(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const buddhistYear = sunday.getFullYear() + 543
  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.getDate()}–${sunday.getDate()} ${TH_MONTH_ABBR[sunday.getMonth()]} ${buddhistYear}`
  }
  return `${monday.getDate()} ${TH_MONTH_ABBR[monday.getMonth()]} – ${sunday.getDate()} ${TH_MONTH_ABBR[sunday.getMonth()]} ${buddhistYear}`
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function getSheetTabIds(sheets: ReturnType<typeof google.sheets>): Promise<Record<string, number>> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID, fields: 'sheets.properties' })
  const result: Record<string, number> = {}
  for (const s of meta.data.sheets ?? []) {
    if (s.properties?.title != null && s.properties?.sheetId != null) {
      result[s.properties.title] = s.properties.sheetId
    }
  }
  return result
}

async function ensureTab(
  sheets: ReturnType<typeof google.sheets>,
  tabName: string,
  existingTabs: Record<string, number>
): Promise<number> {
  if (tabName in existingTabs) return existingTabs[tabName]
  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] },
  })
  const newId = res.data.replies?.[0]?.addSheet?.properties?.sheetId ?? 0
  existingTabs[tabName] = newId
  return newId
}

async function deleteUnusedTabs(
  sheets: ReturnType<typeof google.sheets>,
  existingTabs: Record<string, number>
) {
  const toDelete = Object.entries(existingTabs).filter(([name]) => !KEEP_TABS.has(name))
  if (toDelete.length === 0) return
  const remainingCount = Object.keys(existingTabs).length - toDelete.length
  const safeToDelete = remainingCount >= 1 ? toDelete : toDelete.slice(1)
  if (safeToDelete.length === 0) return
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: safeToDelete.map(([, id]) => ({ deleteSheet: { sheetId: id } })),
    },
  })
  for (const [name] of safeToDelete) delete existingTabs[name]
}

const COL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
function colLetter(n: number): string {
  let s = ''
  let x = n
  while (x > 0) {
    const r = (x - 1) % 26
    s = COL_LETTERS[r] + s
    x = Math.floor((x - 1) / 26)
  }
  return s
}

async function clearAndWrite(
  sheets: ReturnType<typeof google.sheets>,
  tabName: string,
  values: any[][],
  numCols: number,
  valueInputOption: 'RAW' | 'USER_ENTERED' = 'RAW',
) {
  const last = colLetter(numCols)
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A:${last}`,
  })
  if (values.length === 0) return
  // Pad every row to numCols so short rows (like a single-cell title row)
  // don't leave the rest of the row at its previous value
  const padded = values.map((r) => {
    const out = r.slice()
    while (out.length < numCols) out.push('')
    return out
  })
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1:${last}${padded.length}`,
    valueInputOption,
    requestBody: { values: padded },
  })
}

// Pastel palette
const HDR_PASTEL_BLUE = { red: 0.76, green: 0.85, blue: 0.95 }   // header row
const HDR_PASTEL_LAVENDER = { red: 0.85, green: 0.83, blue: 0.95 } // subheader
const HDR_PASTEL_PEACH = { red: 0.99, green: 0.89, blue: 0.82 }
const HDR_PASTEL_MINT = { red: 0.83, green: 0.93, blue: 0.86 }
const HDR_PASTEL_PINK = { red: 0.98, green: 0.85, blue: 0.88 }
const HDR_PASTEL_YELLOW = { red: 1.0, green: 0.93, blue: 0.78 }
const WEEK_PALETTE = [HDR_PASTEL_BLUE, HDR_PASTEL_LAVENDER, HDR_PASTEL_PEACH, HDR_PASTEL_MINT, HDR_PASTEL_PINK, HDR_PASTEL_YELLOW]

const GREEN_FILL = { red: 0.3, green: 0.7, blue: 0.4 }
const TEXT_DARK = { red: 0.15, green: 0.15, blue: 0.2 }
const WHITE = { red: 1, green: 1, blue: 1 }

function styleRange(sheetId: number, startRow: number, endRow: number, startCol: number, endCol: number, opts: {
  bg?: { red: number; green: number; blue: number }
  bold?: boolean
  italic?: boolean
  fg?: { red: number; green: number; blue: number }
  align?: 'LEFT' | 'CENTER' | 'RIGHT'
  vAlign?: 'TOP' | 'MIDDLE' | 'BOTTOM'
} = {}) {
  const fields: string[] = []
  const userEnteredFormat: any = {}
  if (opts.bg) { userEnteredFormat.backgroundColor = opts.bg; fields.push('backgroundColor') }
  if (opts.bold !== undefined || opts.fg || opts.italic !== undefined) {
    userEnteredFormat.textFormat = {}
    if (opts.bold !== undefined) userEnteredFormat.textFormat.bold = opts.bold
    if (opts.italic !== undefined) userEnteredFormat.textFormat.italic = opts.italic
    if (opts.fg) userEnteredFormat.textFormat.foregroundColor = opts.fg
    fields.push('textFormat')
  }
  if (opts.align) { userEnteredFormat.horizontalAlignment = opts.align; fields.push('horizontalAlignment') }
  if (opts.vAlign) { userEnteredFormat.verticalAlignment = opts.vAlign; fields.push('verticalAlignment') }
  return {
    repeatCell: {
      range: { sheetId, startRowIndex: startRow, endRowIndex: endRow, startColumnIndex: startCol, endColumnIndex: endCol },
      cell: { userEnteredFormat },
      fields: `userEnteredFormat(${fields.join(',')})`,
    },
  }
}

function freezeRows(sheetId: number, count: number) {
  return {
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: count } },
      fields: 'gridProperties.frozenRowCount',
    },
  }
}

function freezeCols(sheetId: number, count: number) {
  return {
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenColumnCount: count } },
      fields: 'gridProperties.frozenColumnCount',
    },
  }
}

// Wipe ALL existing merges in a tab — required before re-merging, since the
// Sheets API rejects a merge that overlaps any pre-existing merge.
// Reads each existing merge explicitly and unmerges them one by one, which is
// more reliable than the bare `unmergeCells: { range: { sheetId } }` form
// (which can silently no-op or partially apply on some sheets).
async function unmergeAllInTab(
  sheets: ReturnType<typeof google.sheets>,
  sheetId: number
) {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    fields: 'sheets(properties(sheetId),merges)',
  })
  const sheet = (meta.data.sheets ?? []).find((s) => s.properties?.sheetId === sheetId)
  const merges = sheet?.merges ?? []
  if (merges.length === 0) return
  const requests = merges.map((m) => ({ unmergeCells: { range: m } }))
  // Send in chunks to stay well under request size limits
  for (let i = 0; i < requests.length; i += 200) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: requests.slice(i, i + 200) },
    })
  }
}

// Reset a tab to a clean slate: unmerge all + strip all per-cell formatting
// and data validation, and reset hidden/zero-height rows. Prevents leftover
// state from making newly-written cells appear blank or hidden.
async function resetTab(
  sheets: ReturnType<typeof google.sheets>,
  sheetId: number
) {
  await unmergeAllInTab(sheets, sheetId)

  // Find the sheet's row count to reset all row dimensions
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    fields: 'sheets(properties(sheetId,gridProperties))',
  })
  const sheet = (meta.data.sheets ?? []).find((s) => s.properties?.sheetId === sheetId)
  const rowCount = sheet?.properties?.gridProperties?.rowCount ?? 1000

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          updateCells: {
            range: { sheetId },
            fields: 'userEnteredFormat,dataValidation',
          },
        },
        // Unhide and reset row heights to default (21px) for the whole sheet
        {
          updateDimensionProperties: {
            range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: rowCount },
            properties: { hiddenByUser: false, pixelSize: 21 },
            fields: 'hiddenByUser,pixelSize',
          },
        },
        // Reset frozen counts to 0 — they get re-applied per tab afterwards
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 0, frozenColumnCount: 0 } },
            fields: 'gridProperties.frozenRowCount,gridProperties.frozenColumnCount',
          },
        },
      ],
    },
  })
}

// Per-enrollment list of expected attendance dates with their effective slot
type AttendInstance = { date: Date; slotTime: string; slotDay: string }

function effectiveAttendances(enrollment: any): AttendInstance[] {
  if (!enrollment.startDate || !enrollment.slot || !enrollment.courseDurationWeeks) return []
  const stamps = generateStampDates(enrollment.startDate, enrollment.courseDurationWeeks, enrollment.slot)
  const reschedules = (enrollment.reschedules ?? []) as any[]

  return stamps.map((stampDate) => {
    const r = reschedules.find((x) => isSameDay(new Date(x.originalDate), stampDate))
    if (r) {
      return {
        date: new Date(r.newDate),
        slotTime: r.newSlot?.time ?? '',
        slotDay: r.newSlot?.day ?? '',
      }
    }
    return { date: stampDate, slotTime: enrollment.slot.time ?? '', slotDay: enrollment.slot.day ?? '' }
  })
}

// Convert a slot time (1hr or 2hr) into the indices of HOUR_SLOTS it covers.
// Returns [] if outside 10:00-17:00 range.
function hourIndicesForTime(slotTime: string): number[] {
  if (!slotTime) return []
  if (isTwoHourTime(slotTime)) {
    const parts = getConstituentSlotTimes(slotTime)
    return parts
      .map((t) => HOUR_SLOTS.findIndex((s) => s.time === t))
      .filter((i) => i >= 0)
  }
  const idx = HOUR_SLOTS.findIndex((s) => s.time === slotTime)
  return idx >= 0 ? [idx] : []
}

// ──────────────────────────────────────────────────────────────────────────────
// Main entry
// ──────────────────────────────────────────────────────────────────────────────
export async function syncScheduleToSheet(): Promise<void> {
  await connectDB()
  const allStudents = await Student.find({}).populate('parent', 'name phone').lean()
  const students = allStudents.filter((s) => !isHiddenStudent(s))

  const courses = await Course.find({}, { _id: 1, hours: 1 }).lean()
  const courseHoursMap = new Map<string, number>()
  for (const c of courses) courseHoursMap.set(c._id.toString(), c.hours ?? 0)

  const allSessions = await Session.find({}, { course: 1, scheduledAt: 1, attendance: 1 }).lean()
  const sessionIndex = new Map<string, (typeof allSessions[number])[]>()
  for (const s of allSessions) {
    const key = `${s.course.toString()}|${new Date(s.scheduledAt).toDateString()}`
    if (!sessionIndex.has(key)) sessionIndex.set(key, [])
    sessionIndex.get(key)!.push(s)
  }

  function findAttendance(courseId: string, studentId: string, date: Date) {
    const list = sessionIndex.get(`${courseId}|${date.toDateString()}`) ?? []
    for (const ses of list) {
      const att = ses.attendance.find((a: any) => a.student.toString() === studentId)
      if (att) return att
    }
    return undefined
  }

  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const tabIds = await getSheetTabIds(sheets)

  const weekTabId = await ensureTab(sheets, TAB_WEEK, tabIds)
  const overviewTabId = await ensureTab(sheets, TAB_OVERVIEW, tabIds)
  const scheduleTabId = await ensureTab(sheets, TAB_SCHEDULE, tabIds)
  await deleteUnusedTabs(sheets, tabIds)

  await writeWeekTab(sheets, weekTabId, students, courseHoursMap, findAttendance)
  await writeOverviewTab(sheets, overviewTabId, students, courseHoursMap, findAttendance)
  await writeScheduleTab(sheets, scheduleTabId, students)
}

// ──────────────────────────────────────────────────────────────────────────────
// Tab 1: สัปดาห์นี้  (preserves manual "สถานะคอนเฟิร์ม" column)
// ──────────────────────────────────────────────────────────────────────────────
async function writeWeekTab(
  sheets: ReturnType<typeof google.sheets>,
  sheetId: number,
  students: any[],
  courseHoursMap: Map<string, number>,
  findAttendance: (c: string, s: string, d: Date) => any
) {
  const header = [
    'วันที่', 'วัน', 'เวลา', 'ระยะเวลา', 'ชื่อนักเรียน', 'ชื่อเล่น',
    'คอร์ส', 'ระดับ', 'ครู', 'ผู้ปกครอง', 'เบอร์โทร',
    'ชั่วโมงทั้งหมด', 'เรียนแล้ว (ชม.)', 'สถานะคอนเฟิร์ม',
    'สถานะการเรียน',
  ]
  const CONFIRM_COL_INDEX = header.indexOf('สถานะคอนเฟิร์ม')
  const STATUS_COL_INDEX = header.indexOf('สถานะการเรียน')
  const NAME_COL_INDEX = header.indexOf('ชื่อนักเรียน')
  const COURSE_COL_INDEX = header.indexOf('คอร์ส')
  const STATUS_DEFAULT = 'เข้าเรียนปกติ'
  const STATUS_LEAVE = 'ลา'
  const monday = getMonday(new Date())
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  type Row = { date: Date; values: string[] }
  const rows: Row[] = []

  for (const student of students) {
    for (const enrollment of student.enrollments ?? []) {
      if (enrollment.status !== 'active' && enrollment.status !== 'pending') continue
      const insts = effectiveAttendances(enrollment)
      const parent = student.parent as any
      const courseId = enrollment.course.toString()
      const totalCourseHours = courseHoursMap.get(courseId) ?? 0

      // Cumulative attended hours across the whole enrollment (matches Overview tab)
      let attendedHoursTotal = 0
      for (const inst of insts) {
        const att = findAttendance(courseId, student._id.toString(), inst.date)
        attendedHoursTotal += att?.attendedHours ?? 0
      }

      for (const inst of insts) {
        if (inst.date < monday || inst.date > sunday) continue
        // Derive day name from the actual stamp/reschedule date — slotDay can
        // drift when a ลา cascade shifts newDate without updating newSlot.day.
        const dayName = dayLabel(gregorianDayKey(inst.date))
        const sessionHours = hoursPerSession(inst.slotTime)
        rows.push({
          date: inst.date,
          values: [
            // Apostrophe forces Sheets to keep this as plain text under
            // USER_ENTERED, otherwise "05/05/2569" gets parsed as a date.
            "'" + formatDate(inst.date),
            // "วัน" prefix so cell value matches the dropdown options below
            dayName ? `วัน${dayName}` : '',
            // Same treatment — Sheets parses "10:00-11:00" as a duration.
            "'" + inst.slotTime,
            `${sessionHours} ชม.`,
            student.name ?? '',
            student.nickname ?? '',
            enrollment.courseName ?? '',
            enrollment.courseLevel ?? '',
            enrollment.teacherName ?? '',
            parent?.name ?? '',
            // Phone numbers — keep leading 0 by forcing text
            "'" + (parent?.phone ?? ''),
            String(totalCourseHours),
            String(attendedHoursTotal),
            'FALSE', // checkbox default: unchecked
            STATUS_DEFAULT,
          ],
        })
      }
    }
  }

  rows.sort((a, b) => a.date.getTime() - b.date.getTime())

  // ── Read existing confirm cells to preserve manual edits ───────────────────
  // Match by (วันที่ + เวลา + ชื่อ + คอร์ส) so the same session keeps its confirm value
  const lastCol = colLetter(header.length)
  let existingValues: any[][] = []
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${TAB_WEEK}!A1:${lastCol}`,
    })
    existingValues = res.data.values ?? []
  } catch {
    existingValues = []
  }
  const oldConfirms = new Map<string, boolean>()
  const oldStatuses = new Map<string, string>()
  // Old layouts: row 0 = title, row 1 = header, row 2+ = data — start scanning at row 2
  for (let i = 2; i < existingValues.length; i++) {
    const r = existingValues[i] || []
    const oldDate = (r[0] ?? '').toString()
    const oldTime = (r[2] ?? '').toString()
    // Name/course indices shifted across schema versions:
    //   pre-hours, pre-duration:  name@3, course@5
    //   post-duration (current):  name@4, course@6
    // Add a key for both layouts — only the correct one will match a real row.
    const preName = (r[3] ?? '').toString().trim()
    const preCourse = (r[5] ?? '').toString().trim()
    const curName = (r[4] ?? '').toString().trim()
    const curCourse = (r[6] ?? '').toString().trim()
    // Check current confirm column, plus legacy positions for prior schemas.
    // Numeric/text columns at these indices are never "TRUE", so this is safe:
    //   v1 confirm @10, v2 confirm @12 (after hours cols), v3 confirm @13 (after duration col)
    const candidates = [r[CONFIRM_COL_INDEX], r[10], r[11], r[12]]
    const isChecked = candidates.some(
      (raw) => raw === true || (typeof raw === 'string' && raw.toUpperCase() === 'TRUE')
    )
    if (isChecked) {
      oldConfirms.set(`${oldDate}|${oldTime}|${preName}|${preCourse}`, true)
      oldConfirms.set(`${oldDate}|${oldTime}|${curName}|${curCourse}`, true)
    }

    // Preserve "สถานะการเรียน" — only at current index (didn't exist in older schemas).
    // Only "ลา" needs preservation; the default ("เข้าเรียนปกติ") is what new rows get anyway.
    const statusRaw = (r[STATUS_COL_INDEX] ?? '').toString().trim()
    if (statusRaw === STATUS_LEAVE || statusRaw === STATUS_DEFAULT) {
      oldStatuses.set(`${oldDate}|${oldTime}|${preName}|${preCourse}`, statusRaw)
      oldStatuses.set(`${oldDate}|${oldTime}|${curName}|${curCourse}`, statusRaw)
    }
  }

  // Strip leading apostrophe (text-format marker) when building lookup keys
  const stripQuote = (s: string) => (s.startsWith("'") ? s.slice(1) : s)
  for (const row of rows) {
    const key = [
      stripQuote(row.values[0]),
      stripQuote(row.values[2]),
      (row.values[NAME_COL_INDEX] || '').trim(),
      (row.values[COURSE_COL_INDEX] || '').trim(),
    ].join('|')
    if (oldConfirms.get(key)) row.values[CONFIRM_COL_INDEX] = 'TRUE'
    const preservedStatus = oldStatuses.get(key)
    if (preservedStatus) row.values[STATUS_COL_INDEX] = preservedStatus
  }

  // ── Hidden helper columns power the dependent "เวลา" dropdown ──────────────
  // Per-row formulas in helper cells switch between the 1-hr and 2-hr time
  // lists based on the row's "ระยะเวลา" cell. The "เวลา" dropdown is then a
  // ONE_OF_RANGE pointing at that row's helper range, so changing the duration
  // cell live-updates the time options without re-syncing.
  const HELPER_START_COL = header.length // 0-based column index where helpers begin
  const NUM_HELPER_COLS = 6              // max length of either list
  const TOTAL_COLS = HELPER_START_COL + NUM_HELPER_COLS
  const DURATION_COL_LETTER = colLetter(header.indexOf('ระยะเวลา') + 1)
  const HELPER_LETTER_START = colLetter(HELPER_START_COL + 1)
  const HELPER_LETTER_END = colLetter(TOTAL_COLS)

  function timeHelperFormulas(sheetRow1Based: number): string[] {
    const d = `$${DURATION_COL_LETTER}${sheetRow1Based}`
    // 2-hr list (3 items, then blanks) | 1-hr list (6 items)
    return [
      `=IF(${d}="2 ชม.","10:00-12:00","10:00-11:00")`,
      `=IF(${d}="2 ชม.","13:00-15:00","11:00-12:00")`,
      `=IF(${d}="2 ชม.","15:00-17:00","13:00-14:00")`,
      `=IF(${d}="2 ชม.","","14:00-15:00")`,
      `=IF(${d}="2 ชม.","","15:00-16:00")`,
      `=IF(${d}="2 ชม.","","16:00-17:00")`,
    ]
  }

  const titleRow = [`สัปดาห์ ${weekRangeLabel(monday)} — ${rows.length} คาบ`]
  const values: any[][] = [titleRow, header]
  if (rows.length === 0) {
    values.push(['—', '—', '—', '—', '(ไม่มีนักเรียนเรียนสัปดาห์นี้)', '', '', '', '', '', '', '', '', 'FALSE', ''])
  } else {
    for (let i = 0; i < rows.length; i++) {
      // Sheet row is 1-based: title=1, header=2, data starts at 3
      const sheetRowNum = 3 + i
      values.push([...rows[i].values, ...timeHelperFormulas(sheetRowNum)])
    }
  }

  // Reset BEFORE writing so leftover merges/formatting don't swallow the
  // header row or shift cell content
  await resetTab(sheets, sheetId)
  // USER_ENTERED so the "TRUE"/"FALSE" strings in the confirm column become
  // real booleans that the checkbox data validation can toggle, AND so the
  // helper cells' "=IF(...)" formulas evaluate. Other columns (e.g.
  // Thai-formatted dates "05/05/2569") stay as text since they don't parse
  // as numbers/dates in any locale.
  await clearAndWrite(sheets, TAB_WEEK, values, TOTAL_COLS, 'USER_ENTERED')

  // Confirm column setup — first compute its 0-indexed cell range
  const confirmStartRow = 2 // row index of first data row (0-based: title=0, header=1, data=2+)
  const confirmEndRow = confirmStartRow + Math.max(rows.length, 0)

  const requests: any[] = [
    freezeRows(sheetId, 2),
    // Unhide visible columns first — when the schema grows (e.g. a former
    // helper column is now a visible column), the previous sync's hide flag
    // would otherwise leave the new visible column hidden. resetTab doesn't
    // touch column visibility.
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: header.length },
        properties: { hiddenByUser: false },
        fields: 'hiddenByUser',
      },
    },
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: header.length },
        mergeType: 'MERGE_ALL',
      },
    },
    styleRange(sheetId, 0, 1, 0, header.length, {
      bg: HDR_PASTEL_LAVENDER, bold: true, fg: TEXT_DARK, align: 'CENTER', vAlign: 'MIDDLE',
    }),
    styleRange(sheetId, 1, 2, 0, header.length, {
      bg: HDR_PASTEL_BLUE, bold: true, fg: TEXT_DARK, align: 'CENTER', vAlign: 'MIDDLE',
    }),
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: header.length },
        properties: { pixelSize: 130 },
        fields: 'pixelSize',
      },
    },
  ]

  // Center-align data cells. Done via static styleRange because conditional
  // formatting rules can't carry alignment (API restriction).
  if (confirmEndRow > confirmStartRow) {
    requests.push(styleRange(sheetId, confirmStartRow, confirmEndRow, 0, header.length, {
      align: 'CENTER', vAlign: 'MIDDLE',
    }))
  }

  // Convert "สถานะคอนเฟิร์ม" column to checkboxes for data rows
  if (confirmEndRow > confirmStartRow) {
    requests.push({
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: confirmStartRow,
          endRowIndex: confirmEndRow,
          startColumnIndex: CONFIRM_COL_INDEX,
          endColumnIndex: CONFIRM_COL_INDEX + 1,
        },
        rule: {
          condition: { type: 'BOOLEAN' },
          strict: true,
        },
      },
    })

    // Dropdown for "วัน" column (index 1) so admins can edit in the sheet.
    // strict: false → don't block other values (e.g. legacy days outside
    // school's operating Tue/Fri/Sat/Sun); UI still shows the dropdown chip.
    const DAY_COL_INDEX = header.indexOf('วัน')
    requests.push({
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: confirmStartRow,
          endRowIndex: confirmEndRow,
          startColumnIndex: DAY_COL_INDEX,
          endColumnIndex: DAY_COL_INDEX + 1,
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: [
              { userEnteredValue: 'วันอังคาร' },
              { userEnteredValue: 'วันศุกร์' },
              { userEnteredValue: 'วันเสาร์' },
              { userEnteredValue: 'วันอาทิตย์' },
            ],
          },
          strict: false,
          showCustomUi: true,
        },
      },
    })

    // Dropdown for "ระยะเวลา" column — drives the per-row "เวลา" dropdown.
    const DURATION_COL_INDEX = header.indexOf('ระยะเวลา')
    requests.push({
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: confirmStartRow,
          endRowIndex: confirmEndRow,
          startColumnIndex: DURATION_COL_INDEX,
          endColumnIndex: DURATION_COL_INDEX + 1,
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: [
              { userEnteredValue: '1 ชม.' },
              { userEnteredValue: '2 ชม.' },
            ],
          },
          strict: false,
          showCustomUi: true,
        },
      },
    })

    // Per-row "เวลา" dropdown — ONE_OF_RANGE pointing at the row's helper
    // range. Helpers contain IF() formulas keyed off the duration cell, so
    // changing duration → time options swap live (no re-sync needed).
    const TIME_COL_INDEX = header.indexOf('เวลา')
    for (let i = 0; i < rows.length; i++) {
      const rowIdx = confirmStartRow + i
      const sheetRowNum = rowIdx + 1 // 1-based for formula
      requests.push({
        setDataValidation: {
          range: {
            sheetId,
            startRowIndex: rowIdx,
            endRowIndex: rowIdx + 1,
            startColumnIndex: TIME_COL_INDEX,
            endColumnIndex: TIME_COL_INDEX + 1,
          },
          rule: {
            condition: {
              type: 'ONE_OF_RANGE',
              values: [{
                userEnteredValue: `='${TAB_WEEK}'!$${HELPER_LETTER_START}$${sheetRowNum}:$${HELPER_LETTER_END}$${sheetRowNum}`,
              }],
            },
            strict: false,
            showCustomUi: true,
          },
        },
      })
    }

    // Dropdown for "สถานะการเรียน" column
    requests.push({
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: confirmStartRow,
          endRowIndex: confirmEndRow,
          startColumnIndex: STATUS_COL_INDEX,
          endColumnIndex: STATUS_COL_INDEX + 1,
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: [
              { userEnteredValue: STATUS_DEFAULT },
              { userEnteredValue: STATUS_LEAVE },
            ],
          },
          strict: true,
          showCustomUi: true,
        },
      },
    })

    // Hide the helper columns so they don't clutter the sheet
    requests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: HELPER_START_COL, endIndex: TOTAL_COLS },
        properties: { hiddenByUser: true },
        fields: 'hiddenByUser',
      },
    })

    // ── Conditional formatting (react to user edits in dropdown cells) ──────
    // Static cell formatting only paints once at sync time. Conditional rules
    // re-evaluate on every cell change, so e.g. ticking "ลา" in the dropdown
    // turns the cell pink immediately without re-syncing.
    const TOTAL_HOURS_COL = header.indexOf('ชั่วโมงทั้งหมด')
    const STUDIED_COL = header.indexOf('เรียนแล้ว (ชม.)')
    const dataRange = { sheetId, startRowIndex: confirmStartRow, endRowIndex: confirmEndRow }
    const firstDataRow1Based = confirmStartRow + 1 // for relative-row formulas
    const dCol = colLetter(DURATION_COL_INDEX + 1) // 'D' (ระยะเวลา)
    const lCol = colLetter(TOTAL_HOURS_COL + 1)    // 'L' (ชั่วโมงทั้งหมด)
    const mCol = colLetter(STUDIED_COL + 1)        // 'M' (เรียนแล้ว)

    type Rgb = { red: number; green: number; blue: number }
    // Sheets API rejects alignment fields in conditional-format formats —
    // only bold/italic/strikethrough/foregroundColor/backgroundColor allowed.
    // Cell-level alignment is handled by the static styleRange on data rows
    // below (or inherits the column default).
    const cfFormat = (bg: Rgb) => ({
      backgroundColor: bg,
      textFormat: { bold: true, foregroundColor: TEXT_DARK },
    })
    function addCfRule(colIdx: number, condition: any, bg: Rgb) {
      requests.push({
        addConditionalFormatRule: {
          rule: {
            ranges: [{ ...dataRange, startColumnIndex: colIdx, endColumnIndex: colIdx + 1 }],
            booleanRule: { condition, format: cfFormat(bg) },
          },
        },
      })
    }
    const textEq = (v: string) => ({ type: 'TEXT_EQ', values: [{ userEnteredValue: v }] })
    const customFormula = (f: string) => ({ type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: f }] })

    // วัน — Thai day-color tradition
    addCfRule(DAY_COL_INDEX, textEq('วันอังคาร'), HDR_PASTEL_PINK)
    addCfRule(DAY_COL_INDEX, textEq('วันศุกร์'), HDR_PASTEL_BLUE)
    addCfRule(DAY_COL_INDEX, textEq('วันเสาร์'), HDR_PASTEL_LAVENDER)
    addCfRule(DAY_COL_INDEX, textEq('วันอาทิตย์'), HDR_PASTEL_PEACH)

    // ระยะเวลา — mint for 1hr, yellow for 2hr
    addCfRule(DURATION_COL_INDEX, textEq('1 ชม.'), HDR_PASTEL_MINT)
    addCfRule(DURATION_COL_INDEX, textEq('2 ชม.'), HDR_PASTEL_YELLOW)

    // เวลา — same color as the row's ระยะเวลา (drives off $D{row})
    addCfRule(TIME_COL_INDEX, customFormula(`=$${dCol}${firstDataRow1Based}="1 ชม."`), HDR_PASTEL_MINT)
    addCfRule(TIME_COL_INDEX, customFormula(`=$${dCol}${firstDataRow1Based}="2 ชม."`), HDR_PASTEL_YELLOW)

    // เรียนแล้ว — progress tint by ratio (mutually exclusive bands so order is moot)
    const ratio = `$${mCol}${firstDataRow1Based}/$${lCol}${firstDataRow1Based}`
    const guard = `$${lCol}${firstDataRow1Based}>0`
    addCfRule(STUDIED_COL, customFormula(`=AND(${guard}, $${mCol}${firstDataRow1Based}>0, ${ratio}<0.5)`), HDR_PASTEL_MINT)
    addCfRule(STUDIED_COL, customFormula(`=AND(${guard}, ${ratio}>=0.5, ${ratio}<0.9)`), HDR_PASTEL_YELLOW)
    addCfRule(STUDIED_COL, customFormula(`=AND(${guard}, ${ratio}>=0.9)`), HDR_PASTEL_PEACH)

    // สถานะการเรียน — mint for normal, pink for ลา (the exception)
    addCfRule(STATUS_COL_INDEX, textEq(STATUS_DEFAULT), HDR_PASTEL_MINT)
    addCfRule(STATUS_COL_INDEX, textEq(STATUS_LEAVE), HDR_PASTEL_PINK)
  }

  // Existing conditional format rules from prior syncs would otherwise stack
  // up indefinitely. Read the current count and prepend deletes (in reverse
  // index order so each delete doesn't shift the next index).
  const cfMeta = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    fields: 'sheets(properties(sheetId),conditionalFormats)',
  })
  const targetSheetMeta = (cfMeta.data.sheets ?? []).find((s) => s.properties?.sheetId === sheetId)
  const oldCfCount = targetSheetMeta?.conditionalFormats?.length ?? 0
  const deleteCfRequests: any[] = []
  for (let i = oldCfCount - 1; i >= 0; i--) {
    deleteCfRequests.push({ deleteConditionalFormatRule: { sheetId, index: i } })
  }
  const finalRequests = [...deleteCfRequests, ...requests]

  // Send formatting in chunks to stay within Sheets API request limits
  for (let i = 0; i < finalRequests.length; i += 200) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: finalRequests.slice(i, i + 200) },
    })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Tab 2: Overview
// ──────────────────────────────────────────────────────────────────────────────
async function writeOverviewTab(
  sheets: ReturnType<typeof google.sheets>,
  sheetId: number,
  students: any[],
  courseHoursMap: Map<string, number>,
  findAttendance: (c: string, s: string, d: Date) => any
) {
  const header = [
    'ชื่อนักเรียน', 'ชื่อเล่น', 'คอร์ส', 'ระดับ', 'ครู',
    'วันเรียน', 'เวลา', 'วันเริ่มเรียน',
    'ชั่วโมงทั้งหมด', 'เรียนแล้ว (ชม.)', 'คงเหลือ (ชม.)',
    'สถานะ', 'ผู้ปกครอง', 'เบอร์โทร',
  ]
  const rows: any[][] = [header]

  for (const student of students) {
    for (const enrollment of student.enrollments ?? []) {
      const parent = student.parent as any
      const courseId = enrollment.course.toString()
      const totalCourseHours = courseHoursMap.get(courseId) ?? 0

      let attendedHoursTotal = 0
      const insts = effectiveAttendances(enrollment)
      for (const inst of insts) {
        const att = findAttendance(courseId, student._id.toString(), inst.date)
        attendedHoursTotal += att?.attendedHours ?? 0
      }

      const remaining = Math.max(0, totalCourseHours - attendedHoursTotal)

      rows.push([
        student.name ?? '',
        student.nickname ?? '',
        enrollment.courseName ?? '',
        enrollment.courseLevel ?? '',
        enrollment.teacherName ?? '',
        enrollment.slot?.day ? dayLabel(enrollment.slot.day) : '',
        enrollment.slot?.time ?? '',
        formatDate(enrollment.startDate),
        String(totalCourseHours),
        String(attendedHoursTotal),
        String(remaining),
        statusLabel(enrollment.status),
        parent?.name ?? '',
        parent?.phone ?? '',
      ])
    }
  }

  await clearAndWrite(sheets, TAB_OVERVIEW, rows, header.length)

  const requests: any[] = [
    freezeRows(sheetId, 1),
    styleRange(sheetId, 0, 1, 0, header.length, {
      bg: HDR_PASTEL_BLUE, bold: true, fg: TEXT_DARK, align: 'CENTER', vAlign: 'MIDDLE',
    }),
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: header.length },
        properties: { pixelSize: 120 },
        fields: 'pixelSize',
      },
    },
  ]
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests } })
}

// ──────────────────────────────────────────────────────────────────────────────
// Tab 3: ตารางเรียน — week-by-week blocks stacked vertically
//
// For each week (oldest → newest), one block:
//   Row A: week label — merged across all data columns (pastel color, rotates)
//   Row B: day headers (e.g. "อังคาร 4 ก.พ.") — each merged across HOUR_SLOTS columns
//   Row C: hour slot labels ("10–11", "11–12", ... "16–17")
//   Row D...: enrollment rows (ชื่อ | ชื่อเล่น | คอร์ส | ระดับ | ...green cells)
//   blank row
// ──────────────────────────────────────────────────────────────────────────────
async function writeScheduleTab(
  sheets: ReturnType<typeof google.sheets>,
  sheetId: number,
  students: any[]
) {
  const FIXED = ['ชื่อนักเรียน', 'ชื่อเล่น', 'คอร์ส', 'ระดับ']
  const numFixed = FIXED.length

  type EnrollmentInst = {
    studentName: string
    nickname: string
    courseName: string
    courseLevel: string
    enrollmentStart: Date
    // dateKey -> array of hour-slot indices to paint green
    hoursByDate: Map<string, number[]>
    // dateKey -> "10:00-11:00" or "10:00-12:00" string for display in first cell
    timeLabelByDate: Map<string, string>
  }

  // Collect active enrollments + attendance dates
  const enrollmentInsts: EnrollmentInst[] = []
  const allDateKeys = new Set<string>()
  const dateMeta = new Map<string, Date>()

  for (const student of students) {
    for (const enrollment of student.enrollments ?? []) {
      if (enrollment.status !== 'active' && enrollment.status !== 'pending') continue
      const insts = effectiveAttendances(enrollment)
      if (insts.length === 0) continue

      const hoursByDate = new Map<string, number[]>()
      const timeLabelByDate = new Map<string, string>()

      for (const inst of insts) {
        const k = dateKey(inst.date)
        const indices = hourIndicesForTime(inst.slotTime)
        if (indices.length === 0) continue // outside 10-17
        hoursByDate.set(k, indices)
        timeLabelByDate.set(k, inst.slotTime)
        allDateKeys.add(k)
        if (!dateMeta.has(k)) {
          dateMeta.set(k, new Date(inst.date.getFullYear(), inst.date.getMonth(), inst.date.getDate()))
        }
      }

      if (hoursByDate.size === 0) continue

      enrollmentInsts.push({
        studentName: student.name ?? '',
        nickname: student.nickname ?? '',
        courseName: enrollment.courseName ?? '',
        courseLevel: enrollment.courseLevel ?? '',
        enrollmentStart: new Date(enrollment.startDate),
        hoursByDate,
        timeLabelByDate,
      })
    }
  }

  // Group dates by ISO Monday-week
  type WeekGroup = { mondayKey: string; mondayDate: Date; label: string; dates: Date[] }
  const weekMap = new Map<string, WeekGroup>()
  for (const k of allDateKeys) {
    const d = dateMeta.get(k)!
    const mon = getMonday(d)
    const monKey = dateKey(mon)
    if (!weekMap.has(monKey)) {
      weekMap.set(monKey, { mondayKey: monKey, mondayDate: mon, label: weekRangeLabel(mon), dates: [] })
    }
    weekMap.get(monKey)!.dates.push(d)
  }
  // Sort weeks oldest → newest, dates within each week chronological
  const weekGroupsAll = Array.from(weekMap.values()).sort((a, b) => a.mondayKey.localeCompare(b.mondayKey))
  for (const wg of weekGroupsAll) {
    wg.dates.sort((a, b) => a.getTime() - b.getTime())
  }
  // Drop weeks that are fully in the past (Sunday < today). Keep current week even if it's still ongoing.
  const todayMonday = getMonday(new Date())
  const todayMondayKey = dateKey(todayMonday)
  const weekGroups = weekGroupsAll.filter((wg) => wg.mondayKey >= todayMondayKey)

  // Empty state
  if (weekGroups.length === 0) {
    const header = FIXED
    const values = [header, ['(ไม่มีนักเรียนที่กำลังเรียนอยู่)', '', '', '']]
    await clearAndWrite(sheets, TAB_SCHEDULE, values, header.length)
    await unmergeAllInTab(sheets, sheetId)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [styleRange(sheetId, 0, 1, 0, header.length, {
          bg: HDR_PASTEL_BLUE, bold: true, fg: TEXT_DARK, align: 'CENTER',
        })],
      },
    })
    return
  }

  // Total columns = fixed + max(week) * HOUR_SLOTS — but each week has its own day count.
  // We need uniform column count across the sheet. Use max columns across all weeks.
  const HOURS_PER_DAY = HOUR_SLOTS.length
  let maxDataCols = 0
  for (const wg of weekGroups) {
    const cols = wg.dates.length * HOURS_PER_DAY
    if (cols > maxDataCols) maxDataCols = cols
  }
  const totalCols = numFixed + maxDataCols

  // Build values + formatting requests
  const values: any[][] = []
  const requests: any[] = []
  let currentRow = 0

  // Sort enrollments globally: newest enrollmentStart first, oldest last
  const sortedEnrollments = [...enrollmentInsts].sort(
    (a, b) => b.enrollmentStart.getTime() - a.enrollmentStart.getTime()
  )

  for (let wIdx = 0; wIdx < weekGroups.length; wIdx++) {
    const wg = weekGroups[wIdx]
    const weekColor = WEEK_PALETTE[wIdx % WEEK_PALETTE.length]
    const dataCols = wg.dates.length * HOURS_PER_DAY
    const blockTotalCols = numFixed + dataCols

    // Filter enrollments that have any attending date in this week
    const dateKeysInWeek = new Set(wg.dates.map((d) => dateKey(d)))
    const rowsForWeek = sortedEnrollments.filter((er) =>
      [...er.hoursByDate.keys()].some((k) => dateKeysInWeek.has(k))
    )
    if (rowsForWeek.length === 0) continue

    // ── Row A: week label (merged across data columns only — leave fixed cols empty) ──
    const rowA = new Array(totalCols).fill('')
    rowA[numFixed] = `สัปดาห์ ${wg.label}`
    values.push(rowA)
    const rowAIdx = currentRow
    currentRow++

    if (dataCols > 1) {
      requests.push({
        mergeCells: {
          range: { sheetId, startRowIndex: rowAIdx, endRowIndex: rowAIdx + 1, startColumnIndex: numFixed, endColumnIndex: blockTotalCols },
          mergeType: 'MERGE_ALL',
        },
      })
    }
    requests.push(styleRange(sheetId, rowAIdx, rowAIdx + 1, 0, totalCols, {
      bg: weekColor, bold: true, fg: TEXT_DARK, align: 'CENTER', vAlign: 'MIDDLE',
    }))

    // ── Row B: day headers (each merged across HOURS_PER_DAY columns) ──────────
    const rowB = new Array(totalCols).fill('')
    // Row C: hour-slot labels
    const rowC = new Array(totalCols).fill('')
    // Fill fixed-column headers in row C (the row right before data)
    for (let i = 0; i < numFixed; i++) rowC[i] = FIXED[i]

    for (let dIdx = 0; dIdx < wg.dates.length; dIdx++) {
      const d = wg.dates[dIdx]
      const dayName = dayLabel(['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][d.getDay()])
      const dayHeaderText = `${dayName} ${d.getDate()} ${TH_MONTH_ABBR[d.getMonth()]}`
      const startCol = numFixed + dIdx * HOURS_PER_DAY
      rowB[startCol] = dayHeaderText
      // hour labels
      for (let h = 0; h < HOURS_PER_DAY; h++) {
        rowC[startCol + h] = HOUR_SLOTS[h].label
      }
    }
    values.push(rowB)
    const rowBIdx = currentRow
    currentRow++
    values.push(rowC)
    const rowCIdx = currentRow
    currentRow++

    // Merge day-header cells in row B
    for (let dIdx = 0; dIdx < wg.dates.length; dIdx++) {
      const startCol = numFixed + dIdx * HOURS_PER_DAY
      requests.push({
        mergeCells: {
          range: {
            sheetId,
            startRowIndex: rowBIdx,
            endRowIndex: rowBIdx + 1,
            startColumnIndex: startCol,
            endColumnIndex: startCol + HOURS_PER_DAY,
          },
          mergeType: 'MERGE_ALL',
        },
      })
    }
    // Style row B (day headers) — same week color but slightly bolder
    requests.push(styleRange(sheetId, rowBIdx, rowBIdx + 1, 0, totalCols, {
      bg: weekColor, bold: true, fg: TEXT_DARK, align: 'CENTER', vAlign: 'MIDDLE',
    }))
    // Style row C (hour labels + fixed headers)
    requests.push(styleRange(sheetId, rowCIdx, rowCIdx + 1, 0, totalCols, {
      bg: HDR_PASTEL_BLUE, bold: true, fg: TEXT_DARK, align: 'CENTER', vAlign: 'MIDDLE',
    }))

    // ── Data rows ──────────────────────────────────────────────────────────────
    const dataStartRow = currentRow
    for (const er of rowsForWeek) {
      const row = new Array(totalCols).fill('')
      row[0] = er.studentName
      row[1] = er.nickname
      row[2] = er.courseName
      row[3] = er.courseLevel

      for (let dIdx = 0; dIdx < wg.dates.length; dIdx++) {
        const d = wg.dates[dIdx]
        const k = dateKey(d)
        const hourIdxs = er.hoursByDate.get(k)
        if (!hourIdxs || hourIdxs.length === 0) continue
        const baseCol = numFixed + dIdx * HOURS_PER_DAY
        // Cells stay empty — color alone signals attendance
        // Queue green fill — find contiguous runs
        const sortedIdx = [...hourIdxs].sort((a, b) => a - b)
        let runStart: number | null = null
        const sortedSet = new Set(sortedIdx)
        for (let h = 0; h <= HOURS_PER_DAY; h++) {
          const inRun = h < HOURS_PER_DAY && sortedSet.has(h)
          if (inRun && runStart === null) runStart = h
          if (!inRun && runStart !== null) {
            requests.push({
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: currentRow,
                  endRowIndex: currentRow + 1,
                  startColumnIndex: baseCol + runStart,
                  endColumnIndex: baseCol + h,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: GREEN_FILL,
                  },
                },
                fields: 'userEnteredFormat.backgroundColor',
              },
            })
            runStart = null
          }
        }
      }

      values.push(row)
      currentRow++
    }
    const dataEndRow = currentRow // exclusive

    // ── Borders: thick line between days, also between header rows and data ───
    // Apply to the whole block (header B + header C + data rows)
    const blockTopRow = rowBIdx
    const blockBottomRow = dataEndRow
    if (blockBottomRow > blockTopRow) {
      // Thin internal grid borders for the whole block
      requests.push({
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: blockTopRow,
            endRowIndex: blockBottomRow,
            startColumnIndex: 0,
            endColumnIndex: blockTotalCols,
          },
          innerHorizontal: { style: 'SOLID', colorStyle: { rgbColor: { red: 0.85, green: 0.85, blue: 0.88 } } },
          innerVertical: { style: 'SOLID', colorStyle: { rgbColor: { red: 0.9, green: 0.9, blue: 0.92 } } },
        },
      })
      // Heavy vertical borders between days (right edge of each day except last)
      for (let dIdx = 0; dIdx < wg.dates.length - 1; dIdx++) {
        const dayEndCol = numFixed + (dIdx + 1) * HOURS_PER_DAY
        requests.push({
          updateBorders: {
            range: {
              sheetId,
              startRowIndex: blockTopRow,
              endRowIndex: blockBottomRow,
              startColumnIndex: dayEndCol - 1,
              endColumnIndex: dayEndCol,
            },
            right: { style: 'SOLID_THICK', colorStyle: { rgbColor: { red: 0.4, green: 0.4, blue: 0.5 } } },
          },
        })
      }
      // Heavy vertical border between fixed cols and first day
      requests.push({
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: blockTopRow,
            endRowIndex: blockBottomRow,
            startColumnIndex: numFixed - 1,
            endColumnIndex: numFixed,
          },
          right: { style: 'SOLID_THICK', colorStyle: { rgbColor: { red: 0.4, green: 0.4, blue: 0.5 } } },
        },
      })
    }

    // Spacer row
    values.push(new Array(totalCols).fill(''))
    currentRow++
  }

  // Column widths
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: numFixed },
      properties: { pixelSize: 140 },
      fields: 'pixelSize',
    },
  })
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: numFixed, endIndex: totalCols },
      properties: { pixelSize: 75 },
      fields: 'pixelSize',
    },
  })
  requests.push(freezeCols(sheetId, numFixed))

  await clearAndWrite(sheets, TAB_SCHEDULE, values, totalCols)
  await unmergeAllInTab(sheets, sheetId)

  // Send formatting in chunks
  for (let i = 0; i < requests.length; i += 200) {
    const chunk = requests.slice(i, i + 200)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: chunk },
    })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Sheet → DB import (for the "Sync to Web" admin button)
//
// Reads the "สัปดาห์นี้" tab and applies confirmed rows back to MongoDB:
//   • confirm + เข้าเรียนปกติ → set Session.attendance.attendedHours; if the
//     row's date/time was edited, also write a reschedule for that stamp.
//   • confirm + ลา → push the lesson out by 7 days from its current effective
//     date (replace existing reschedule for that stamp, or add a new one).
//
// After processing, kicks off syncScheduleToSheet so the sheet refreshes —
// rescheduled "ลา" rows will then disappear from the current week.
// ──────────────────────────────────────────────────────────────────────────────

// Sheet column indexes for the visible (post-status) schema.
// Helpers are after these but never read here.
const WEEK_COL = {
  DATE: 0,
  DAY: 1,
  TIME: 2,
  DURATION: 3,
  NAME: 4,
  NICK: 5,
  COURSE: 6,
  LEVEL: 7,
  TEACHER: 8,
  PARENT: 9,
  PHONE: 10,
  TOTAL_HOURS: 11,
  STUDIED: 12,
  CONFIRM: 13,
  STATUS: 14,
}

const STATUS_DEFAULT_VALUE = 'เข้าเรียนปกติ'
const STATUS_LEAVE_VALUE = 'ลา'

// Parse "DD/MM/YYYY" Buddhist-year date as written by formatDate(). Returns
// a JS Date set to midnight in the runtime's local TZ (matches how stamp
// dates compare via isSameDay).
function parseBuddhistDate(s: string): Date | null {
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const day = parseInt(m[1], 10)
  const month = parseInt(m[2], 10) - 1
  const year = parseInt(m[3], 10) - 543
  const d = new Date(year, month, day, 0, 0, 0, 0)
  return isNaN(d.getTime()) ? null : d
}

function gregorianDayKey(d: Date): string {
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d.getDay()]
}

function startOfDay(d: Date): Date {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x
}
function endOfDay(d: Date): Date {
  const x = new Date(d); x.setHours(23, 59, 59, 999); return x
}

export type ImportAttendanceRecord = {
  studentName: string
  nickname: string
  courseName: string
  courseLevel: string
  date: string
  hours: number
}
export type ImportLeaveRecord = {
  studentName: string
  nickname: string
  courseName: string
  courseLevel: string
  fromDate: string
  toDate: string
  cascadedCount: number
}
export type ImportMoveRecord = {
  studentName: string
  nickname: string
  courseName: string
  courseLevel: string
  fromDate: string
  fromTime: string
  toDate: string
  toTime: string
}

export type ImportResult = {
  success: boolean
  attendanceUpdates: ImportAttendanceRecord[]
  leaveReschedules: ImportLeaveRecord[]
  moveReschedules: ImportMoveRecord[]
  errors: string[]
  warnings: string[]
}

export async function syncFromSheetToDb(): Promise<ImportResult> {
  await connectDB()

  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  // Read visible columns A:O (helper columns past O are formula-derived)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${TAB_WEEK}!A1:O`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  })
  const sheetRows = res.data.values ?? []

  const result: ImportResult = {
    success: true,
    attendanceUpdates: [],
    leaveReschedules: [],
    moveReschedules: [],
    errors: [],
    warnings: [],
  }

  // Skip title (0) and header (1)
  const dataRows = sheetRows.slice(2)

  for (const row of dataRows) {
    const confirmRaw = row[WEEK_COL.CONFIRM]
    const isConfirmed =
      confirmRaw === true ||
      (typeof confirmRaw === 'string' && confirmRaw.toUpperCase() === 'TRUE')
    if (!isConfirmed) continue

    const dateStr = String(row[WEEK_COL.DATE] ?? '').trim()
    const timeStr = String(row[WEEK_COL.TIME] ?? '').trim()
    const durationStr = String(row[WEEK_COL.DURATION] ?? '').trim()
    const studentName = String(row[WEEK_COL.NAME] ?? '').trim()
    const courseName = String(row[WEEK_COL.COURSE] ?? '').trim()
    const courseLevel = String(row[WEEK_COL.LEVEL] ?? '').trim()
    const status = String(row[WEEK_COL.STATUS] ?? STATUS_DEFAULT_VALUE).trim() || STATUS_DEFAULT_VALUE

    const rowLabel = `${studentName} / ${courseName} / ${dateStr}`

    if (!studentName || !courseName) {
      result.errors.push(`ข้อมูลแถวไม่ครบ: ${rowLabel}`)
      continue
    }

    const sheetDate = parseBuddhistDate(dateStr)
    if (!sheetDate) {
      result.errors.push(`รูปแบบวันที่ไม่ถูกต้อง: ${rowLabel}`)
      continue
    }

    // Resolve student + enrollment by (name, courseName, courseLevel)
    const candidates = await Student.find({ name: studentName })
    const matches = candidates
      .map((s) => {
        const idx = s.enrollments.findIndex(
          (e: any) => e.courseName === courseName && (e.courseLevel ?? '') === courseLevel,
        )
        return idx >= 0 ? { student: s, enrollmentIdx: idx } : null
      })
      .filter((x): x is { student: any; enrollmentIdx: number } => x !== null)

    if (matches.length === 0) {
      result.errors.push(`ไม่พบ enrollment: ${rowLabel}`)
      continue
    }
    if (matches.length > 1) {
      result.errors.push(`มี enrollment ตรงหลายรายการ — ข้าม: ${rowLabel}`)
      continue
    }

    const { student, enrollmentIdx } = matches[0]
    const enrollment = student.enrollments[enrollmentIdx]

    if (!enrollment.startDate || !enrollment.slot || !enrollment.courseDurationWeeks) {
      result.errors.push(`enrollment ไม่มี slot/startDate/durationWeeks: ${rowLabel}`)
      continue
    }

    // Find which stamp this row corresponds to (effective date matches sheet)
    const stamps = generateStampDates(enrollment.startDate, enrollment.courseDurationWeeks, enrollment.slot)
    const reschedules = enrollment.reschedules ?? []
    let originalStamp: Date | null = null
    let currentReschedule: any = null
    let effectiveDate: Date | null = null
    for (const stampDate of stamps) {
      const r = reschedules.find((x: any) => isSameDay(new Date(x.originalDate), stampDate))
      const eff = r ? new Date(r.newDate) : stampDate
      if (isSameDay(eff, sheetDate)) {
        originalStamp = stampDate
        currentReschedule = r
        effectiveDate = eff
        break
      }
    }

    if (!originalStamp || !effectiveDate) {
      result.errors.push(`จับคู่ stamp ไม่ได้: ${rowLabel}`)
      continue
    }

    const currentSlot = currentReschedule?.newSlot ?? enrollment.slot
    // Snapshot "from" values BEFORE any mutation. Mongoose's setter on
    // `subdoc.newSlot = ...` mutates the existing object in place, so
    // reading `currentSlot.time` AFTER mutation would already return the
    // new value — which made the result dialog show "11→11" instead of
    // "12→11". Capture primitives now and use them in the result.
    const fromTimeSnapshot: string = currentSlot.time ?? ''
    const fromDateLabel: string = formatDate(effectiveDate)

    if (status === STATUS_LEAVE_VALUE) {
      // Cascade: push the ลา stamp AND every subsequent stamp by 7 days from
      // their current effective dates. Without the cascade, the ลา stamp
      // would land on next week's regular stamp date and collide. End effect:
      // the remaining schedule shifts forward by one week.
      const stampIndex = stamps.findIndex((s) => isSameDay(s, originalStamp!))
      if (stampIndex < 0) {
        result.errors.push(`stamp index lookup failed: ${rowLabel}`)
        continue
      }
      const laIso = effectiveDate.toISOString().slice(0, 10)
      let firstNewDate: Date | null = null
      let cascadedCount = 0

      for (let i = stampIndex; i < stamps.length; i++) {
        const stamp = stamps[i]
        const r = reschedules.find((x: any) => isSameDay(new Date(x.originalDate), stamp))
        const currentEff = r ? new Date(r.newDate) : stamp
        const slotForReschedule = r?.newSlot ?? enrollment.slot

        const shifted = new Date(currentEff)
        shifted.setDate(shifted.getDate() + 7)

        if (r) {
          r.newDate = shifted
          // Resync newSlot.day to the actual weekday of the shifted date.
          // Without this, ลา cascade can leave newSlot.day pointing at a
          // different day than newDate (e.g. shifting Sun → next Sat keeps
          // the stale "sunday" label), which then makes Sheet+slot lookups
          // mis-attribute the row.
          if (r.newSlot) {
            r.newSlot.day = gregorianDayKey(shifted)
          } else {
            r.newSlot = { day: gregorianDayKey(shifted), time: enrollment.slot.time }
          }
          if (i === stampIndex) {
            r.reason = `ลา - เลื่อนจาก ${laIso}`
          }
        } else {
          const list = student.enrollments[enrollmentIdx].reschedules || []
          list.push({
            originalDate: stamp,
            newDate: shifted,
            newSlot: { day: slotForReschedule.day, time: slotForReschedule.time },
            reason: i === stampIndex
              ? `ลา - เลื่อนจาก ${laIso}`
              : `เลื่อนต่อเนื่องจากการลา ${laIso}`,
          } as any)
          student.enrollments[enrollmentIdx].reschedules = list
        }

        if (i === stampIndex) firstNewDate = new Date(shifted)
        cascadedCount++
      }

      student.markModified('enrollments')
      await student.save()
      result.leaveReschedules.push({
        studentName,
        nickname: student.nickname ?? '',
        courseName,
        courseLevel,
        fromDate: fromDateLabel,
        toDate: formatDate(firstNewDate!),
        cascadedCount,
      })
      continue
    }

    // status === เข้าเรียนปกติ
    // 1) If sheet's date or time differs from current effective, apply as reschedule
    const sheetDayKey = gregorianDayKey(sheetDate)
    const dateChanged = !isSameDay(sheetDate, effectiveDate)
    const timeChanged = !!timeStr && timeStr !== fromTimeSnapshot
    if (dateChanged || timeChanged) {
      // Always derive day from the actual sheet date — currentSlot.day can be
      // stale (e.g. left over from a prior reschedule whose newDate has since
      // been shifted by a ลา cascade without re-syncing the day field).
      const newSlotInfo = {
        day: sheetDayKey,
        time: timeStr || fromTimeSnapshot,
      }
      if (currentReschedule) {
        currentReschedule.newDate = sheetDate
        currentReschedule.newSlot = newSlotInfo
      } else {
        const list = student.enrollments[enrollmentIdx].reschedules || []
        list.push({
          originalDate: originalStamp,
          newDate: sheetDate,
          newSlot: newSlotInfo,
        } as any)
        student.enrollments[enrollmentIdx].reschedules = list
      }
      student.markModified('enrollments')
      await student.save()
      result.moveReschedules.push({
        studentName,
        nickname: student.nickname ?? '',
        courseName,
        courseLevel,
        fromDate: fromDateLabel,
        fromTime: fromTimeSnapshot,
        toDate: formatDate(sheetDate),
        toTime: newSlotInfo.time,
      })
    }

    // 2) Update Session.attendance.attendedHours to match the duration column
    const hours = parseInt(durationStr, 10)
    if (!hours || hours < 1) {
      result.warnings.push(`อ่าน "ระยะเวลา" ไม่ออก: ${rowLabel} (${durationStr})`)
      continue
    }

    const session = await Session.findOne({
      course: enrollment.course,
      scheduledAt: { $gte: startOfDay(sheetDate), $lte: endOfDay(sheetDate) },
    })
    if (!session) {
      result.warnings.push(`ไม่พบ Session สำหรับ ${rowLabel} — ข้าม attendedHours`)
      continue
    }

    const att = (session.attendance as any[]).find(
      (a: any) => a.student.toString() === student._id.toString(),
    )
    if (!att) {
      result.warnings.push(`ไม่พบ attendance entry: ${rowLabel} — ข้าม attendedHours`)
      continue
    }
    att.attendedHours = hours
    if (!att.checkedIn) {
      att.checkedIn = true
      att.checkedInAt = new Date()
    }
    session.markModified('attendance')
    await session.save()
    result.attendanceUpdates.push({
      studentName,
      nickname: student.nickname ?? '',
      courseName,
      courseLevel,
      date: formatDate(sheetDate),
      hours,
    })
  }

  // Refresh the sheet so rescheduled "ลา" rows leave this week's view
  try {
    await syncScheduleToSheet()
  } catch (e: any) {
    result.warnings.push(`Sync sheet หลัง import ล้มเหลว: ${e?.message ?? e}`)
  }

  return result
}
