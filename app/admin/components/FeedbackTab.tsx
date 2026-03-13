'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  MessageSquare, Star, Video, CheckCircle2, AlertTriangle, RefreshCw,
  ChevronDown, ChevronUp, Search, Filter, Clock, Image as ImageIcon,
  BarChart3, GraduationCap, BookOpen, CalendarDays, Users,
} from 'lucide-react'

/* ── Types ── */
interface StampData {
  stampNumber: number
  date: string
  originalDate: string
  isToday: boolean
  isPast: boolean
  isRescheduled: boolean
  isCheckedIn: boolean
  hasFeedback: boolean
  hasRating: boolean
  hasVideo: boolean
  hasImages: boolean
  feedback: string
  rating: number
  videoUrl: string
  imageUrls: string[]
  sessionId: string
  sessionTopic: string
}

interface EnrollmentData {
  courseId: string
  courseName: string
  status: string
  slot: { day: string; time: string } | null
  slotLabel: string
  startDate: string | null
  courseDurationWeeks: number
  totalStamps: number
  checkedInCount: number
  feedbackCount: number
  videoCount: number
  stamps: StampData[]
}

interface StudentData {
  studentId: string
  studentName: string
  studentNickname: string
  age: number | null
  enrollments: EnrollmentData[]
}

interface TeacherData {
  teacherId: string
  teacherName: string
  students: StudentData[]
  totalStamps: number
  totalCheckedIn: number
  totalFeedback: number
  totalVideo: number
  incompleteSessions: number
  // computed in frontend
  missingFeedbackCount?: number
  missedCheckinCount?: number
}

type FilterStatus = 'all' | 'incomplete' | 'complete'
type FilterCourseStatus = 'all' | 'active' | 'completed' | 'dropped' | 'pending' | 'not_completed'

/* ── Stamp circle style ── */
function getStampCircleStyle(stamp: StampData) {
  if (stamp.isCheckedIn) {
    return 'bg-green-500 text-white shadow-md shadow-green-200'
  }
  if (stamp.isToday) {
    return 'bg-blue-500 text-white shadow-md shadow-blue-200'
  }
  if (stamp.isPast) {
    return 'bg-red-100 text-red-400 border-2 border-red-300'
  }
  return 'bg-gray-100 text-gray-400 border-2 border-gray-300'
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  dropped: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

const STATUS_LABELS: Record<string, string> = {
  active: '🕐 In Progress',
  completed: '✅ Completed',
  dropped: '❌ Dropped',
  pending: '⏳ Pending',
}

export default function FeedbackTab() {
  const [teachers, setTeachers] = useState<TeacherData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterTeacher, setFilterTeacher] = useState<string>('all')
  const [filterCourseStatus, setFilterCourseStatus] = useState<FilterCourseStatus>('not_completed')
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null)
  const [expandedEnrollments, setExpandedEnrollments] = useState<Set<string>>(new Set())

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedStamp, setSelectedStamp] = useState<StampData | null>(null)
  const [selectedStudentName, setSelectedStudentName] = useState('')
  const [selectedCourseName, setSelectedCourseName] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/feedback')
      const json = await res.json()
      if (json.success) setTeachers(json.data)
    } catch {
      // ignore
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // Helper: filter enrollments by course status
  const filterEnrollmentsByCourseStatus = (enrollments: EnrollmentData[]) => {
    if (filterCourseStatus === 'all') return enrollments
    if (filterCourseStatus === 'not_completed') return enrollments.filter(e => e.status !== 'completed')
    return enrollments.filter(e => e.status === filterCourseStatus)
  }

  // Filtered teachers (with course status filtering applied to enrollments)
  const filteredTeachers = useMemo(() => {
    // First, apply course status filter to enrollments inside each teacher/student
    let result = teachers.map(t => ({
      ...t,
      students: t.students.map(s => ({
        ...s,
        enrollments: filterEnrollmentsByCourseStatus(s.enrollments),
      })).filter(s => s.enrollments.length > 0),
    })).filter(t => t.students.length > 0)

    // Recalculate teacher-level stats after course status filtering
    result = result.map(t => {
      let totalStamps = 0, totalCheckedIn = 0, totalFeedback = 0, totalVideo = 0
      let missingFeedbackCount = 0, missedCheckinCount = 0
      for (const s of t.students) {
        for (const e of s.enrollments) {
          totalStamps += e.totalStamps
          // Recalculate from stamps to ensure correctness
          const checkedIn = e.stamps.filter(st => st.isCheckedIn).length
          const feedback = e.stamps.filter(st => st.isCheckedIn && (st.hasFeedback || st.hasRating)).length
          totalCheckedIn += checkedIn
          totalFeedback += feedback
          totalVideo += e.videoCount
          // Count checked-in stamps without feedback
          missingFeedbackCount += e.stamps.filter(st => st.isCheckedIn && !st.hasFeedback && !st.hasRating).length
          // Count past stamps that were NOT checked in (missed classes)
          missedCheckinCount += e.stamps.filter(st => st.isPast && !st.isCheckedIn).length
        }
      }
      const incompleteSessions = t.students.reduce((count, student) => {
        return count + student.enrollments.reduce((c, e) => {
          const pastCheckedIn = e.stamps.filter(s => s.isPast && s.isCheckedIn)
          const pastWithFeedback = pastCheckedIn.filter(s => s.hasFeedback || s.hasRating)
          return c + (pastCheckedIn.length > 0 && pastWithFeedback.length < pastCheckedIn.length ? 1 : 0)
        }, 0)
      }, 0)
      return { ...t, totalStamps, totalCheckedIn, totalFeedback, totalVideo, incompleteSessions, missingFeedbackCount, missedCheckinCount }
    })

    if (filterTeacher !== 'all') {
      result = result.filter(t => t.teacherId === filterTeacher)
    }

    if (filterStatus === 'incomplete') {
      result = result.filter(t => t.incompleteSessions > 0)
    } else if (filterStatus === 'complete') {
      result = result.filter(t => t.incompleteSessions === 0 && t.totalCheckedIn > 0)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.map(t => ({
        ...t,
        students: t.students.filter(s =>
          s.studentName.toLowerCase().includes(q) ||
          s.studentNickname?.toLowerCase().includes(q) ||
          s.enrollments.some(e => e.courseName.toLowerCase().includes(q))
        ),
      })).filter(t => t.students.length > 0 || t.teacherName.toLowerCase().includes(q))
    }

    return result
  }, [teachers, filterStatus, filterTeacher, searchQuery, filterCourseStatus])

  // Helper: recalculate enrollment stats from stamps (source of truth)
  const getEnrollmentStats = (e: EnrollmentData) => {
    const checkedIn = e.stamps.filter(st => st.isCheckedIn).length
    const feedback = e.stamps.filter(st => st.isCheckedIn && (st.hasFeedback || st.hasRating)).length
    return { checkedIn, feedback }
  }

  // Global stats (respects course status filter)
  const globalStats = useMemo(() => {
    let totalStamps = 0, totalCheckedIn = 0, totalFeedback = 0, totalVideo = 0, totalStudents = 0
    const studentIds = new Set<string>()
    for (const t of teachers) {
      for (const s of t.students) {
        const filteredEnrollments = filterEnrollmentsByCourseStatus(s.enrollments)
        if (filteredEnrollments.length > 0) {
          studentIds.add(s.studentId)
          for (const e of filteredEnrollments) {
            const stats = getEnrollmentStats(e)
            totalStamps += e.totalStamps
            totalCheckedIn += stats.checkedIn
            totalFeedback += stats.feedback
            totalVideo += e.videoCount
          }
        }
      }
    }
    totalStudents = studentIds.size
    return { totalStamps, totalCheckedIn, totalFeedback, totalVideo, totalStudents, totalTeachers: teachers.length }
  }, [teachers, filterCourseStatus])

  const uniqueTeachers = useMemo(() => {
    return teachers.map(t => [t.teacherId, t.teacherName] as [string, string]).sort((a, b) => a[1].localeCompare(b[1]))
  }, [teachers])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
  }

  const formatDateFull = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric', weekday: 'short',
    })
  }

  const toggleEnrollment = (key: string) => {
    setExpandedEnrollments(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleStampClick = (stamp: StampData, studentName: string, courseName: string) => {
    setSelectedStamp(stamp)
    setSelectedStudentName(studentName)
    setSelectedCourseName(courseName)
    setDialogOpen(true)
  }

  const getCompletionColor = (filled: number, total: number) => {
    if (total === 0) return 'text-gray-400'
    const pct = filled / total
    if (pct === 1) return 'text-green-600'
    if (pct >= 0.5) return 'text-yellow-600'
    return 'text-red-500'
  }

  const getCompletionBg = (filled: number, total: number) => {
    if (total === 0) return 'bg-gray-50 border-gray-200'
    const pct = filled / total
    if (pct === 1) return 'bg-green-50 border-green-200'
    if (pct >= 0.5) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-semibold text-gray-800">
          <MessageSquare className="w-5 h-5 inline mr-2 text-orange-500" />
          Feedback Overview
        </h2>
        <Button variant="outline" size="sm" onClick={fetchData} className="text-xs">รีเฟรช</Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : (
        <>
          {/* ── Global Summary ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="border border-gray-200">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-gray-800">{globalStats.totalStamps}</p>
                <p className="text-xs text-gray-400">Sessions ทั้งหมด</p>
              </CardContent>
            </Card>
            <Card className="border border-green-200 bg-green-50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{globalStats.totalCheckedIn}</p>
                <p className="text-xs text-green-500">เข้าเรียน</p>
              </CardContent>
            </Card>
            <Card className="border border-orange-200 bg-orange-50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {globalStats.totalFeedback}/{globalStats.totalCheckedIn}
                </p>
                <p className="text-xs text-orange-400">Feedback กรอกแล้ว</p>
              </CardContent>
            </Card>
            <Card className="border border-blue-200 bg-blue-50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{globalStats.totalVideo}</p>
                <p className="text-xs text-blue-400">มีวิดีโอ</p>
              </CardContent>
            </Card>
            <Card className="border border-purple-200 bg-purple-50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{globalStats.totalStudents}</p>
                <p className="text-xs text-purple-400">นักเรียน</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-gray-800">{globalStats.totalTeachers}</p>
                <p className="text-xs text-gray-400">ครูทั้งหมด</p>
              </CardContent>
            </Card>
          </div>

          {/* ── Filters ── */}
          <div className="flex flex-wrap items-center gap-3 bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <Input placeholder="ค้นหา ครู, คอร์ส, นักเรียน..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                <SelectTrigger className="h-8 w-[140px] text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="incomplete">ยังไม่ครบ</SelectItem>
                  <SelectItem value="complete">ครบแล้ว</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
              <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                <SelectTrigger className="h-8 w-[160px] text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ครูทั้งหมด</SelectItem>
                  {uniqueTeachers.map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
              <Select value={filterCourseStatus} onValueChange={(v) => setFilterCourseStatus(v as FilterCourseStatus)}>
                <SelectTrigger className="h-8 w-[180px] text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">คอร์สทั้งหมด</SelectItem>
                  <SelectItem value="not_completed">ยังไม่จบ (ซ่อน Completed)</SelectItem>
                  <SelectItem value="active">🕐 In Progress</SelectItem>
                  <SelectItem value="completed">✅ Completed</SelectItem>
                  <SelectItem value="pending">⏳ Pending</SelectItem>
                  <SelectItem value="dropped">❌ Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Stamp Legend ── */}
          <div className="flex gap-4 flex-wrap bg-white rounded-lg border border-gray-200 px-4 py-2.5">
            <span className="text-xs font-medium text-gray-500 mr-1">สถานะ:</span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <div className="w-4 h-4 rounded-full bg-green-500 shrink-0" /> เข้าเรียน
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <div className="w-4 h-4 rounded-full bg-red-100 border-2 border-red-300 shrink-0" /> ขาดเรียน
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <div className="w-4 h-4 rounded-full bg-blue-500 shrink-0" /> วันนี้
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <div className="w-4 h-4 rounded-full bg-gray-100 border-2 border-gray-300 shrink-0" /> ยังไม่ถึง
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                <MessageSquare className="w-2.5 h-2.5 text-white" />
              </span>
              มี Feedback
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <span className="w-4 h-4 rounded-full bg-orange-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-2.5 h-2.5 text-white" />
              </span>
              เลื่อน
            </span>
          </div>

          {/* ── Teacher sections ── */}
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>ไม่พบข้อมูล</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTeachers.map((teacher) => {
                const isExpanded = expandedTeacher === teacher.teacherId
                const feedbackPct = teacher.totalCheckedIn > 0
                  ? Math.min(Math.round((teacher.totalFeedback / teacher.totalCheckedIn) * 100), 100) : 0
                const hasMissingFeedback = (teacher.missingFeedbackCount || 0) > 0
                const hasMissedCheckins = (teacher.missedCheckinCount || 0) > 0
                const hasAnyRedFlag = hasMissingFeedback || hasMissedCheckins

                // Determine card border/bg: red if any red flag
                const cardStyle = hasAnyRedFlag
                  ? 'bg-red-50 border-red-300'
                  : getCompletionBg(teacher.totalFeedback, teacher.totalCheckedIn)

                return (
                  <Card key={teacher.teacherId} className={`border overflow-hidden ${cardStyle}`}>
                    <CardHeader className="pb-2 pt-4 px-4 cursor-pointer" onClick={() => setExpandedTeacher(isExpanded ? null : teacher.teacherId)}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <GraduationCap className="w-5 h-5 text-orange-500 shrink-0" />
                            <CardTitle className="text-base">{teacher.teacherName}</CardTitle>
                            {!hasAnyRedFlag && teacher.totalCheckedIn > 0 ? (
                              <Badge className="bg-green-100 text-green-600 border-green-300 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />ครบทุก session
                              </Badge>
                            ) : null}
                            {hasMissingFeedback && (
                              <Badge className="bg-red-100 text-red-600 border-red-300 text-xs">
                                <MessageSquare className="w-3 h-3 mr-1" />Feedback ไม่ครบ ({teacher.missingFeedbackCount})
                              </Badge>
                            )}
                            {hasMissedCheckins && (
                              <Badge className="bg-red-100 text-red-600 border-red-300 text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />ขาดเช็คอิน ({teacher.missedCheckinCount})
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                            <span><Users className="w-3 h-3 inline mr-0.5" />{teacher.students.length} students</span>
                            <span className={getCompletionColor(teacher.totalFeedback, teacher.totalCheckedIn)}>
                              <MessageSquare className="w-3 h-3 inline mr-0.5" />
                              {teacher.totalFeedback}/{teacher.totalCheckedIn} ({feedbackPct}%)
                            </span>
                            <span><Video className="w-3 h-3 inline mr-0.5 text-blue-500" />{teacher.totalVideo}/{teacher.totalCheckedIn}</span>
                          </div>
                          <div className="mt-2 w-full max-w-xs">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${feedbackPct === 100 ? 'bg-green-500' : feedbackPct >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`} style={{ width: `${Math.min(feedbackPct, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-1 pb-4 px-4 space-y-4">
                        {teacher.students.map((student) => (
                          <Card key={student.studentId} className="border hover:shadow-sm transition-shadow">
                            <CardHeader className="pb-2 pt-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                                  {student.studentName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm leading-tight">
                                    {student.studentName}
                                    {student.studentNickname && (
                                      <span className="text-gray-400 font-normal ml-1">({student.studentNickname})</span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {student.age && `Age ${student.age}`}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-[10px]">{student.enrollments.length} courses</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 pb-3 px-4 space-y-3">
                              {student.enrollments.map((enrollment, eIdx) => {
                                const enrollKey = `${student.studentId}-${eIdx}`
                                const isEnrollExpanded = expandedEnrollments.has(enrollKey)

                                // Per-enrollment stats recalculated from stamps (source of truth)
                                const enrollStats = getEnrollmentStats(enrollment)
                                const enrollMissingFeedback = enrollment.stamps.filter(st => st.isCheckedIn && !st.hasFeedback && !st.hasRating).length
                                const enrollMissedCheckin = enrollment.stamps.filter(st => st.isPast && !st.isCheckedIn).length
                                const enrollHasRedFlag = enrollMissingFeedback > 0 || enrollMissedCheckin > 0
                                const enrollBorderClass = enrollHasRedFlag
                                  ? 'border-2 border-red-300 bg-red-50/30'
                                  : 'border'

                                return (
                                  <div key={eIdx} className={`${enrollBorderClass} rounded-xl overflow-hidden`}>
                                    <div className={`flex items-start justify-between px-3 py-2.5 ${enrollHasRedFlag ? 'bg-red-50/50' : 'bg-gray-50/50'}`}>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                                          <span className="text-xs font-semibold">{enrollment.courseName}</span>
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLORS[enrollment.status] || ''}`}>
                                            <Clock className="h-3 w-3" />{STATUS_LABELS[enrollment.status] || enrollment.status}
                                          </span>
                                          {enrollMissingFeedback > 0 && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-red-300 bg-red-100 text-red-600">
                                              <MessageSquare className="h-3 w-3" />Feedback ไม่ครบ ({enrollMissingFeedback})
                                            </span>
                                          )}
                                          {enrollMissedCheckin > 0 && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-red-300 bg-red-100 text-red-600">
                                              <AlertTriangle className="h-3 w-3" />ขาดเช็คอิน ({enrollMissedCheckin})
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                          {enrollment.slotLabel && (
                                            <span className="text-[10px] text-purple-600 flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full">
                                              <CalendarDays className="h-3 w-3" />{enrollment.slotLabel}
                                            </span>
                                          )}
                                          {enrollment.startDate && (
                                            <span className="text-[10px] text-gray-400">
                                              Start: {formatDateFull(enrollment.startDate)}
                                            </span>
                                          )}
                                          <span className="text-[10px] text-gray-400">
                                            Feedback: <span className={getCompletionColor(enrollStats.feedback, enrollStats.checkedIn)}>{enrollStats.feedback}/{enrollStats.checkedIn}</span>
                                          </span>
                                        </div>
                                      </div>
                                      {enrollment.stamps.length > 0 && (
                                        <button onClick={() => toggleEnrollment(enrollKey)} className="flex items-center gap-1 text-[10px] text-primary ml-2 shrink-0">
                                          <CalendarDays className="h-3 w-3" />
                                          <span>{enrollment.stamps.length} sessions</span>
                                          {isEnrollExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                        </button>
                                      )}
                                    </div>

                                    {isEnrollExpanded && enrollment.stamps.length > 0 && (
                                      <div className="px-3 pt-2 pb-3 bg-white">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                          Full Schedule — {enrollment.stamps.length} sessions
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                          {enrollment.stamps.map((stamp) => {
                                            const hasFeedbackBadge = stamp.isCheckedIn && (stamp.hasFeedback || stamp.hasVideo)
                                            return (
                                              <div key={stamp.stampNumber} className="flex flex-col items-center gap-1">
                                                <div className="relative">
                                                  <button
                                                    onClick={() => handleStampClick(stamp, `${student.studentName}${student.studentNickname ? ` (${student.studentNickname})` : ''}`, enrollment.courseName)}
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all hover:scale-110 cursor-pointer ${getStampCircleStyle(stamp)} ${stamp.isRescheduled ? 'ring-2 ring-orange-400 ring-offset-1' : ''}`}
                                                    title={`${stamp.sessionTopic || `Session ${stamp.stampNumber}`}\n${formatDateFull(stamp.date)}\n${stamp.isCheckedIn ? 'เข้าเรียน' : stamp.isPast ? 'ขาดเรียน' : 'ยังไม่ถึง'}`}
                                                  >
                                                    {stamp.stampNumber}
                                                  </button>
                                                  {hasFeedbackBadge && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                                                      <MessageSquare className="h-2.5 w-2.5 text-white" />
                                                    </span>
                                                  )}
                                                  {stamp.isRescheduled && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center shadow-sm">
                                                      <RefreshCw className="h-2.5 w-2.5 text-white" />
                                                    </span>
                                                  )}
                                                </div>
                                                <span className="text-[9px] text-center text-gray-500 leading-tight max-w-[48px]">
                                                  {formatDate(stamp.date)}
                                                </span>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}

          {/* ── Stamp Detail Dialog ── */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              {selectedStamp && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-base flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getStampCircleStyle(selectedStamp)}`}>
                        {selectedStamp.stampNumber}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate">{selectedStudentName}</p>
                        <p className="text-xs font-normal text-gray-400 mt-0.5">
                          {selectedCourseName} · {selectedStamp.sessionTopic || `Session ${selectedStamp.stampNumber}`}
                        </p>
                      </div>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-3">
                    {/* Date & Status */}
                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateFull(selectedStamp.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {selectedStamp.isCheckedIn ? (
                          <><CheckCircle2 className="w-3 h-3 text-green-500" /><span className="text-green-600">เข้าเรียนแล้ว</span></>
                        ) : selectedStamp.isPast ? (
                          <><AlertTriangle className="w-3 h-3 text-red-400" /><span className="text-red-500">ขาดเรียน</span></>
                        ) : selectedStamp.isToday ? (
                          <><Clock className="w-3 h-3 text-blue-500" /><span className="text-blue-600">วันนี้</span></>
                        ) : (
                          <><Clock className="w-3 h-3 text-gray-400" /><span>ยังไม่ถึง</span></>
                        )}
                      </div>
                      {selectedStamp.isRescheduled && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <RefreshCw className="w-3 h-3" /> เลื่อนจาก {formatDateFull(selectedStamp.originalDate)}
                        </div>
                      )}
                    </div>

                    {/* Feedback details */}
                    {selectedStamp.isCheckedIn && (
                      <div className="space-y-2">
                        {/* Rating */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 w-16">Rating:</span>
                          {selectedStamp.hasRating ? (
                            <span className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < selectedStamp.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                              ))}
                            </span>
                          ) : (
                            <span className="text-red-300">— ยังไม่ให้ Rating</span>
                          )}
                        </div>
                        {/* Feedback text */}
                        <div className="text-xs">
                          <span className="text-gray-500">Feedback:</span>
                          {selectedStamp.hasFeedback ? (
                            <p className="mt-1 text-gray-700 bg-green-50 rounded-lg p-2.5 leading-relaxed">
                              <MessageSquare className="w-3 h-3 inline mr-1 text-orange-400" />
                              {selectedStamp.feedback}
                            </p>
                          ) : (
                            <p className="mt-1 text-red-300">— ยังไม่มี Feedback</p>
                          )}
                        </div>
                        {/* Video */}
                        <div className="text-xs">
                          <span className="text-gray-500 flex items-center gap-1 mb-1">
                            <Video className="w-3 h-3 text-blue-400" /> Video:
                          </span>
                          {selectedStamp.hasVideo ? (
                            <div className="mt-1 rounded-lg overflow-hidden border border-gray-200 bg-black">
                              <video
                                src={selectedStamp.videoUrl}
                                controls
                                className="w-full max-h-[300px] object-contain"
                                preload="metadata"
                              />
                            </div>
                          ) : (
                            <p className="mt-1 text-gray-300">— ยังไม่มีวิดีโอ</p>
                          )}
                        </div>
                        {/* Images */}
                        {selectedStamp.hasImages && (
                          <div className="text-xs">
                            <span className="text-gray-500 flex items-center gap-1 mb-1">
                              <ImageIcon className="w-3 h-3 text-purple-400" /> รูปภาพ ({selectedStamp.imageUrls.length}):
                            </span>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {selectedStamp.imageUrls.map((url, idx) => (
                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-gray-200 hover:border-purple-400 transition-colors hover:shadow-md">
                                  <img
                                    src={url}
                                    alt={`รูป ${idx + 1}`}
                                    className="w-full h-auto object-cover max-h-[200px]"
                                    loading="lazy"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!selectedStamp.isCheckedIn && !selectedStamp.isPast && (
                      <p className="text-xs text-gray-400 text-center py-2">Session นี้ยังไม่ถึงวัน</p>
                    )}
                    {!selectedStamp.isCheckedIn && selectedStamp.isPast && (
                      <p className="text-xs text-red-400 text-center py-2">นักเรียนไม่ได้เข้าเรียน session นี้</p>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
