import { google } from 'googleapis'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import Session from '@/models/Session'
import Course from '@/models/Course'
import '@/models/Parent'
import { generateStampDates, isSameDay } from '@/lib/slots'

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const OVERVIEW_TAB = 'Overview'

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

function formatDate(d: Date | string | undefined): string {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Bangkok',
  })
}

function formatDateTime(d: Date | string | undefined, time: string | undefined): string {
  if (!d) return ''
  return `${formatDate(d)}${time ? ' ' + time : ''}`
}

function dayLabel(day: string): string {
  const map: Record<string, string> = {
    tuesday: 'อังคาร',
    friday: 'ศุกร์',
    saturday: 'เสาร์',
    sunday: 'อาทิตย์',
  }
  return map[day] ?? day
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'กำลังเรียน',
    completed: 'เรียนจบแล้ว',
    dropped: 'ออกแล้ว',
    pending: 'รอเริ่ม',
  }
  return map[status] ?? status
}

function sessionStatusLabel(stampDate: Date, rescheduleNewDate?: Date): string {
  const now = new Date()
  if (rescheduleNewDate) return 'เลื่อน'
  if (stampDate < now) return 'เรียนแล้ว'
  return 'ยังไม่ถึง'
}

// Thai month abbreviation + Buddhist year
function thaiMonthTabName(date: Date): string {
  const monthAbbr = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  const month = monthAbbr[date.getMonth()]
  const buddhistYear = date.getFullYear() + 543
  return `${month} ${buddhistYear}`
}

// Monday of the week containing date
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Format week range label: "28 เม.ย. – 4 พ.ค. 2569"
function weekRangeLabel(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const thDay = (d: Date) => d.getDate()
  const thMonth = (d: Date) => ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][d.getMonth()]
  const buddhistYear = sunday.getFullYear() + 543

  if (monday.getMonth() === sunday.getMonth()) {
    return `${thDay(monday)}–${thDay(sunday)} ${thMonth(sunday)} ${buddhistYear}`
  }
  return `${thDay(monday)} ${thMonth(monday)} – ${thDay(sunday)} ${thMonth(sunday)} ${buddhistYear}`
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
    requestBody: {
      requests: [{ addSheet: { properties: { title: tabName } } }],
    },
  })
  const newId = res.data.replies?.[0]?.addSheet?.properties?.sheetId ?? 0
  existingTabs[tabName] = newId
  return newId
}

async function deleteMonthTabs(
  sheets: ReturnType<typeof google.sheets>,
  existingTabs: Record<string, number>,
  keepTabs: Set<string>
) {
  const MONTH_PATTERN = /^[ก-ฮ].+\.\s\d{4}$/
  const toDelete = Object.entries(existingTabs).filter(
    ([name]) => MONTH_PATTERN.test(name) && !keepTabs.has(name)
  )
  if (toDelete.length === 0) return
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: toDelete.map(([, id]) => ({ deleteSheet: { sheetId: id } })),
    },
  })
}

async function writeTab(
  sheets: ReturnType<typeof google.sheets>,
  tabName: string,
  sheetId: number,
  rows: (string[] | null)[],
  numCols: number
) {
  const colLetter = String.fromCharCode(64 + numCols)
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A:${colLetter}`,
  })

  // Replace null (separator rows) with empty arrays for values API
  const values = rows.map(r => r ?? [])
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values },
  })

  // Collect row indices for styling
  const headerRows: number[] = []
  const weekRows: number[] = []
  rows.forEach((r, i) => {
    if (r === null) weekRows.push(i)
    else if (i === 0) headerRows.push(i)
  })

  const requests: any[] = [
    // Freeze header row
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: 'gridProperties.frozenRowCount',
      },
    },
    // Header row style (blue)
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
            backgroundColor: { red: 0.2, green: 0.5, blue: 0.8 },
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)',
      },
    },
  ]

  // Week separator rows style (light grey + bold + merged)
  for (const rowIdx of weekRows) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: rowIdx, endRowIndex: rowIdx + 1 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, italic: true },
            backgroundColor: { red: 0.85, green: 0.9, blue: 0.95 },
          },
        },
        fields: 'userEnteredFormat(textFormat,backgroundColor)',
      },
    })
    requests.push({
      mergeCells: {
        range: { sheetId, startRowIndex: rowIdx, endRowIndex: rowIdx + 1, startColumnIndex: 0, endColumnIndex: numCols },
        mergeType: 'MERGE_ALL',
      },
    })
  }

  await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests } })
}

type SessionRow = {
  dateObj: Date
  monthKey: string
  weekKey: string
  weekLabel: string
  row: string[]
}

export async function syncScheduleToSheet(): Promise<void> {
  await connectDB()
  const students = await Student.find({}).populate('parent', 'name phone').lean()

  // Build courseHours map: courseId → hours
  const courses = await Course.find({}, { _id: 1, hours: 1 }).lean()
  const courseHoursMap = new Map<string, number>()
  for (const c of courses) courseHoursMap.set(c._id.toString(), c.hours ?? 0)

  // Fetch all sessions and index by courseId+date for fast lookup
  // Multiple students can share the same course+date session, so store array per key
  const allSessions = await Session.find({}, {
    course: 1, scheduledAt: 1, slot: 1, attendance: 1,
  }).lean()

  // Index: `${courseId}|${dateKey}` → session[]
  const sessionIndex = new Map<string, (typeof allSessions[number])[]>()
  for (const s of allSessions) {
    const dateKey = new Date(s.scheduledAt).toDateString()
    const key = `${s.course.toString()}|${dateKey}`
    if (!sessionIndex.has(key)) sessionIndex.set(key, [])
    sessionIndex.get(key)!.push(s)
  }

  // Find the session that contains attendance for this specific student
  function findAttendance(courseId: string, studentId: string, stampDate: Date, actualDate: Date) {
    const candidates = [
      ...(sessionIndex.get(`${courseId}|${actualDate.toDateString()}`) ?? []),
      ...(actualDate.toDateString() !== stampDate.toDateString()
        ? (sessionIndex.get(`${courseId}|${stampDate.toDateString()}`) ?? [])
        : []),
    ]
    for (const ses of candidates) {
      const att = ses.attendance.find((a: any) => a.student.toString() === studentId)
      if (att) return att
    }
    return undefined
  }

  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const tabIds = await getSheetTabIds(sheets)

  // ── Overview tab ──────────────────────────────────────────────────────────────
  const overviewHeader = [
    'ชื่อนักเรียน', 'ชื่อเล่น', 'คอร์ส', 'ระดับ', 'ครู',
    'วันเรียน', 'เวลา', 'วันเริ่มเรียน', 'จำนวนสัปดาห์', 'ชั่วโมง (คอร์ส)',
    'ชั่วโมงที่เรียนแล้ว', 'สถานะ', 'ชื่อผู้ปกครอง', 'เบอร์โทร',
  ]
  const overviewRows: string[][] = [overviewHeader]

  for (const student of students) {
    for (const enrollment of student.enrollments ?? []) {
      const parent = student.parent as any
      const courseId = enrollment.course.toString()
      const courseHours = courseHoursMap.get(courseId) ?? 0

      // Sum attendedHours across all stamps for this enrollment
      let attendedHoursTotal = 0
      if (enrollment.startDate && enrollment.slot && enrollment.courseDurationWeeks) {
        const stamps = generateStampDates(enrollment.startDate, enrollment.courseDurationWeeks, enrollment.slot)
        for (const stampDate of stamps) {
          const reschedule = (enrollment.reschedules ?? []).find((r: any) =>
            isSameDay(new Date(r.originalDate), stampDate)
          )
          const actualDate = reschedule ? new Date(reschedule.newDate) : stampDate
          const att = findAttendance(courseId, student._id.toString(), stampDate, actualDate)
          attendedHoursTotal += att?.attendedHours ?? 0
        }
      }

      overviewRows.push([
        student.name ?? '',
        student.nickname ?? '',
        enrollment.courseName ?? '',
        enrollment.courseLevel ?? '',
        enrollment.teacherName ?? '',
        enrollment.slot?.day ? dayLabel(enrollment.slot.day) : '',
        enrollment.slot?.time ?? '',
        formatDate(enrollment.startDate),
        String(enrollment.courseDurationWeeks ?? ''),
        String(courseHours),
        String(attendedHoursTotal),
        statusLabel(enrollment.status),
        parent?.name ?? '',
        parent?.phone ?? '',
      ])
    }
  }

  // ── Build all session rows ────────────────────────────────────────────────────
  const scheduleHeader = [
    'วันที่', 'วัน', 'เวลา', 'ครั้งที่', 'ชื่อนักเรียน', 'ชื่อเล่น',
    'คอร์ส', 'ครู', 'เช็คอิน', 'ชั่วโมง (ครั้งนี้)', 'สถานะ', 'หมายเหตุ',
  ]

  const allRows: SessionRow[] = []

  for (const student of students) {
    for (const enrollment of student.enrollments ?? []) {
      if (!enrollment.startDate || !enrollment.slot || !enrollment.courseDurationWeeks) continue

      const courseId = enrollment.course.toString()
      const stamps = generateStampDates(enrollment.startDate, enrollment.courseDurationWeeks, enrollment.slot)

      stamps.forEach((stampDate, index) => {
        const reschedule = (enrollment.reschedules ?? []).find((r: any) =>
          isSameDay(new Date(r.originalDate), stampDate)
        )

        const displayDate = reschedule ? new Date(reschedule.newDate) : stampDate
        const displaySlot = reschedule ? reschedule.newSlot : enrollment.slot
        const status = sessionStatusLabel(stampDate, reschedule ? new Date(reschedule.newDate) : undefined)

        const att = findAttendance(courseId, student._id.toString(), stampDate, displayDate)
        const checkedIn = att?.checkedIn ? 'เช็คอินแล้ว' : ''
        const attendedHours = att?.attendedHours != null ? String(att.attendedHours) : ''

        let note = ''
        if (reschedule) {
          const reason = reschedule.reason ? ` (${reschedule.reason})` : ''
          note = `เลื่อนจาก ${formatDateTime(stampDate, enrollment.slot?.time)}${reason}`
        }

        const monday = getMonday(displayDate)
        const weekKey = monday.toISOString().slice(0, 10)
        const monthKey = thaiMonthTabName(displayDate)

        allRows.push({
          dateObj: displayDate,
          monthKey,
          weekKey,
          weekLabel: weekRangeLabel(monday),
          row: [
            formatDate(displayDate),
            displaySlot?.day ? dayLabel(displaySlot.day) : '',
            displaySlot?.time ?? '',
            String(index + 1),
            student.name ?? '',
            student.nickname ?? '',
            enrollment.courseName ?? '',
            enrollment.teacherName ?? '',
            checkedIn,
            attendedHours,
            status,
            note,
          ],
        })
      })
    }
  }

  allRows.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

  // ── Group by month → week ─────────────────────────────────────────────────────
  const monthMap = new Map<string, SessionRow[]>()
  for (const row of allRows) {
    if (!monthMap.has(row.monthKey)) monthMap.set(row.monthKey, [])
    monthMap.get(row.monthKey)!.push(row)
  }

  const usedMonthTabs = new Set<string>(monthMap.keys())

  // Delete stale month tabs
  await deleteMonthTabs(sheets, tabIds, usedMonthTabs)

  // ── Write Overview ────────────────────────────────────────────────────────────
  const overviewId = await ensureTab(sheets, OVERVIEW_TAB, tabIds)
  await writeTab(sheets, OVERVIEW_TAB, overviewId, overviewRows, overviewHeader.length)

  // ── Write each month tab ──────────────────────────────────────────────────────
  for (const [monthKey, monthRows] of monthMap) {
    const sheetId = await ensureTab(sheets, monthKey, tabIds)

    // Group by week
    const weekMap = new Map<string, SessionRow[]>()
    for (const r of monthRows) {
      if (!weekMap.has(r.weekKey)) weekMap.set(r.weekKey, [])
      weekMap.get(r.weekKey)!.push(r)
    }

    const finalRows: (string[] | null)[] = [scheduleHeader]
    for (const [, weekRows] of weekMap) {
      // Separator row (null = week label merged cell)
      finalRows.push(null)
      // Inject week label into first cell via placeholder
      finalRows[finalRows.length - 1] = [`── สัปดาห์ ${weekRows[0].weekLabel} ──`]
      for (const wr of weekRows) finalRows.push(wr.row)
    }

    await writeTab(sheets, monthKey, sheetId, finalRows, scheduleHeader.length)
  }
}
