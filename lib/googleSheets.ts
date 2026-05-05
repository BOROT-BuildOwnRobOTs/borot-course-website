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

  await writeWeekTab(sheets, weekTabId, students)
  await writeOverviewTab(sheets, overviewTabId, students, courseHoursMap, findAttendance)
  await writeScheduleTab(sheets, scheduleTabId, students)
}

// ──────────────────────────────────────────────────────────────────────────────
// Tab 1: สัปดาห์นี้  (preserves manual "สถานะคอนเฟิร์ม" column)
// ──────────────────────────────────────────────────────────────────────────────
async function writeWeekTab(
  sheets: ReturnType<typeof google.sheets>,
  sheetId: number,
  students: any[]
) {
  const header = [
    'วันที่', 'วัน', 'เวลา', 'ชื่อนักเรียน', 'ชื่อเล่น',
    'คอร์ส', 'ระดับ', 'ครู', 'ผู้ปกครอง', 'เบอร์โทร', 'สถานะคอนเฟิร์ม',
  ]
  const CONFIRM_COL_INDEX = header.indexOf('สถานะคอนเฟิร์ม')
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
      for (const inst of insts) {
        if (inst.date < monday || inst.date > sunday) continue
        rows.push({
          date: inst.date,
          values: [
            // Apostrophe forces Sheets to keep this as plain text under
            // USER_ENTERED, otherwise "05/05/2569" gets parsed as a date.
            "'" + formatDate(inst.date),
            inst.slotDay ? dayLabel(inst.slotDay) : '',
            // Same treatment — Sheets parses "10:00-11:00" as a duration.
            "'" + inst.slotTime,
            student.name ?? '',
            student.nickname ?? '',
            enrollment.courseName ?? '',
            enrollment.courseLevel ?? '',
            enrollment.teacherName ?? '',
            parent?.name ?? '',
            // Phone numbers — keep leading 0 by forcing text
            "'" + (parent?.phone ?? ''),
            'FALSE', // checkbox default: unchecked
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
  // Old layouts: row 0 = title, row 1 = header, row 2+ = data — start scanning at row 2
  for (let i = 2; i < existingValues.length; i++) {
    const r = existingValues[i] || []
    const oldDate = (r[0] ?? '').toString()
    const oldTime = (r[2] ?? '').toString()
    const oldName = (r[3] ?? '').toString().trim()
    const oldCourse = (r[5] ?? '').toString().trim()
    const raw = r[CONFIRM_COL_INDEX]
    // Checkbox stored values come back as strings "TRUE"/"FALSE" or booleans
    const isChecked =
      raw === true ||
      (typeof raw === 'string' && raw.toUpperCase() === 'TRUE')
    if (!isChecked) continue
    oldConfirms.set(`${oldDate}|${oldTime}|${oldName}|${oldCourse}`, true)
  }

  // Strip leading apostrophe (text-format marker) when building lookup keys
  const stripQuote = (s: string) => (s.startsWith("'") ? s.slice(1) : s)
  for (const row of rows) {
    const key = [
      stripQuote(row.values[0]),
      stripQuote(row.values[2]),
      (row.values[3] || '').trim(),
      (row.values[5] || '').trim(),
    ].join('|')
    if (oldConfirms.get(key)) row.values[CONFIRM_COL_INDEX] = 'TRUE'
  }

  const titleRow = [`สัปดาห์ ${weekRangeLabel(monday)} — ${rows.length} คาบ`]
  const values: any[][] = [titleRow, header]
  if (rows.length === 0) {
    values.push(['—', '—', '—', '(ไม่มีนักเรียนเรียนสัปดาห์นี้)', '', '', '', '', '', '', 'FALSE'])
  } else {
    for (const r of rows) values.push(r.values)
  }

  // Reset BEFORE writing so leftover merges/formatting don't swallow the
  // header row or shift cell content
  await resetTab(sheets, sheetId)
  // USER_ENTERED so the "TRUE"/"FALSE" strings in the confirm column become
  // real booleans that the checkbox data validation can toggle. Other columns
  // (e.g. Thai-formatted dates "05/05/2569") stay as text since they don't
  // parse as numbers/dates in any locale.
  await clearAndWrite(sheets, TAB_WEEK, values, header.length, 'USER_ENTERED')

  // Confirm column setup — first compute its 0-indexed cell range
  const confirmStartRow = 2 // row index of first data row (0-based: title=0, header=1, data=2+)
  const confirmEndRow = confirmStartRow + Math.max(rows.length, 0)

  const requests: any[] = [
    freezeRows(sheetId, 2),
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
  }

  await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests } })
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
