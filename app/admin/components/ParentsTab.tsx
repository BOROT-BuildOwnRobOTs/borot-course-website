'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Plus, Pencil, Trash2, Mail, Phone, Users, ChevronDown, ChevronUp,
  UserPlus, BookOpen, X, Eye, EyeOff, CalendarDays, Loader2, Search,
  RefreshCw, PlusCircle, Building2,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { SLOTS, MAX_PER_SLOT, getNextSlotDateStr, getSlotDayOfWeek, generateStampDates, getTwoHourSlotOptions, isTwoHourTime } from '@/lib/slots'
import { useBranchContext, BranchSummary } from './BranchContext'
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog'

interface Course {
  _id: string
  name: string
  level: string
  durationWeeks?: number
  hours?: number
}

interface Teacher {
  _id: string
  name: string
}

interface SlotAvailability {
  id: string
  day: string
  dayLabel: string
  time: string
  count: number
  max: number
  available: boolean
}

interface Enrollment {
  _id?: string
  course: string
  courseName: string
  courseLevel?: string
  courseDurationWeeks?: number
  courseHours?: number
  teacher?: string
  teacherName?: string
  status: 'active' | 'completed' | 'dropped' | 'pending'
  progress?: number
  startDate?: string
  slot?: { day: string; time: string }
}

interface Student {
  _id: string
  name: string
  age?: number
  nickname?: string
  notes?: string
  enrollments: Enrollment[]
  branch?: BranchSummary | string | null
}

interface Parent {
  _id: string
  name: string
  email?: string | null
  phone: string
  createdAt: string
  branch?: BranchSummary | string | null
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  dropped: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'In Progress',
  completed: 'Completed',
  dropped: 'Dropped',
  pending: 'Pending',
}

function branchIdOf(value: BranchSummary | string | null | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id || ''
}

export default function ParentsTab() {
  const { branches, selectedBranchId, scopeQuery, session } = useBranchContext()
  const lockedBranchId = session?.role === 'branch' && session.branch ? session.branch._id : ''

  const [parents, setParents] = useState<Parent[]>([])
  const [studentsMap, setStudentsMap] = useState<Record<string, Student[]>>({})
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedParent, setExpandedParent] = useState<string | null>(null)
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<'active' | 'completed' | 'all'>('active')
  const [searchQuery, setSearchQuery] = useState('')

  // Parent dialog
  const [parentDialogOpen, setParentDialogOpen] = useState(false)
  const [editParent, setEditParent] = useState<Parent | null>(null)
  const [parentForm, setParentForm] = useState({ name: '', email: '', password: '', phone: '', branch: '' })
  const [parentError, setParentError] = useState('')
  const [savingParent, setSavingParent] = useState(false)
  const [showParentPassword, setShowParentPassword] = useState(false)
  const [parentNoEmail, setParentNoEmail] = useState(false)

  // Student dialog
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [studentParentId, setStudentParentId] = useState('')
  const [studentForm, setStudentForm] = useState({ name: '', age: '', nickname: '', notes: '', branch: '' })
  const [studentError, setStudentError] = useState('')
  const [savingStudent, setSavingStudent] = useState(false)

  // Enrollment dialog
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false)
  const [enrollStudent, setEnrollStudent] = useState<Student | null>(null)
  const [enrollCourseId, setEnrollCourseId] = useState('')
  const [enrollTeacherId, setEnrollTeacherId] = useState('')
  const [enrollStatus, setEnrollStatus] = useState<'active' | 'pending'>('pending')
  const [enrollSlotDay, setEnrollSlotDay] = useState('')
  const [enrollSlotTime, setEnrollSlotTime] = useState('')
  const [enrollStartDate, setEnrollStartDate] = useState('')
  const [enrollSelectedDay, setEnrollSelectedDay] = useState('tuesday')
  const [enrollDurationTab, setEnrollDurationTab] = useState<'1hr' | '2hr'>('1hr')
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [savingEnroll, setSavingEnroll] = useState(false)

  // Extend duration dialog
  const [extendDialogOpen, setExtendDialogOpen] = useState(false)
  const [extendStudent, setExtendStudent] = useState<Student | null>(null)
  const [extendEnrollmentIdx, setExtendEnrollmentIdx] = useState(-1)
  const [extendWeeks, setExtendWeeks] = useState('4')
  const [savingExtend, setSavingExtend] = useState(false)

  // Delete-confirmation dialogs
  const [pendingParentDelete, setPendingParentDelete] = useState<Parent | null>(null)
  const [pendingStudentDelete, setPendingStudentDelete] = useState<Student | null>(null)
  const [pendingEnrollmentDelete, setPendingEnrollmentDelete] = useState<
    { student: Student; idx: number } | null
  >(null)

  // Reschedule dialog
  const [reschedDialogOpen, setReschedDialogOpen] = useState(false)
  const [reschedStudent, setReschedStudent] = useState<Student | null>(null)
  const [reschedEnrollmentIdx, setReschedEnrollmentIdx] = useState(-1)
  const [reschedSlotAvailability, setReschedSlotAvailability] = useState<SlotAvailability[]>([])
  const [loadingReschedSlots, setLoadingReschedSlots] = useState(false)
  const [reschedNewSlotDay, setReschedNewSlotDay] = useState('')
  const [reschedNewSlotTime, setReschedNewSlotTime] = useState('')
  const [reschedNewDate, setReschedNewDate] = useState('')
  const [reschedReason, setReschedReason] = useState('')
  const [reschedRemaining, setReschedRemaining] = useState(true)
  const [savingResched, setSavingResched] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    const qs = scopeQuery ? `?${scopeQuery}` : ''
    const [parentsRes, coursesRes, studentsRes, teachersRes] = await Promise.all([
      fetch(`/api/admin/parents${qs}`),
      fetch('/api/admin/courses'),
      fetch(`/api/admin/students${qs}`),
      fetch('/api/admin/teachers'),
    ])
    const [pj, cj, sj, tj] = await Promise.all([parentsRes.json(), coursesRes.json(), studentsRes.json(), teachersRes.json()])
    if (pj.success) setParents(pj.data)
    if (cj.success) setCourses(cj.data)
    if (tj.success) setTeachers(tj.data)
    if (sj.success) {
      const map: Record<string, Student[]> = {}
      sj.data.forEach((s: Student & { parent: { _id: string } | string | null }) => {
        if (!s.parent) return
        const pid = typeof s.parent === 'object' ? s.parent._id : s.parent
        if (!pid) return
        if (!map[pid]) map[pid] = []
        map[pid].push(s)
      })
      setStudentsMap(map)
    }
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [scopeQuery])

  // ===== Parent CRUD =====
  const openAddParent = () => {
    setEditParent(null)
    const defaultBranch = lockedBranchId || selectedBranchId || ''
    setParentForm({ name: '', email: '', password: '', phone: '', branch: defaultBranch })
    setParentNoEmail(false)
    setParentError('')
    setParentDialogOpen(true)
  }

  const openEditParent = (p: Parent) => {
    setEditParent(p)
    const noEmail = !p.email
    setParentForm({
      name: p.name,
      email: p.email || '',
      password: '',
      phone: p.phone,
      branch: branchIdOf(p.branch),
    })
    setParentNoEmail(noEmail)
    setParentError('')
    setParentDialogOpen(true)
  }

  const handleSaveParent = async () => {
    if (!parentForm.name.trim()) { setParentError('Please enter a name'); return }
    if (!parentForm.branch) { setParentError('Please select a branch'); return }
    if (!parentNoEmail) {
      if (!parentForm.email.trim()) { setParentError('Please enter an email or check "No email yet"'); return }
      if (!editParent && !parentForm.password.trim()) { setParentError('Please enter a password'); return }
    }
    setSavingParent(true)
    setParentError('')
    try {
      const url = editParent ? `/api/admin/parents/${editParent._id}` : '/api/admin/parents'
      const method = editParent ? 'PUT' : 'POST'
      const emailValue = parentNoEmail ? '' : parentForm.email
      const passwordValue = parentNoEmail ? '' : parentForm.password
      const body = editParent
        ? {
            name: parentForm.name,
            email: emailValue,
            phone: parentForm.phone,
            branch: parentForm.branch,
            ...(passwordValue ? { password: passwordValue } : {}),
          }
        : { ...parentForm, email: emailValue, password: passwordValue }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!json.success) { setParentError(json.error || 'An error occurred'); return }
      setParentDialogOpen(false)
      fetchAll()
    } finally {
      setSavingParent(false)
    }
  }

  const handleDeleteParent = async (id: string) => {
    await fetch(`/api/admin/parents/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  // ===== Student CRUD =====
  const openAddStudent = (parentId: string) => {
    setEditStudent(null)
    setStudentParentId(parentId)
    const parent = parents.find((pp) => pp._id === parentId)
    const defaultBranch = branchIdOf(parent?.branch) || lockedBranchId || selectedBranchId || ''
    setStudentForm({ name: '', age: '', nickname: '', notes: '', branch: defaultBranch })
    setStudentError('')
    setStudentDialogOpen(true)
  }

  const openEditStudent = (s: Student, parentId: string) => {
    setEditStudent(s)
    setStudentParentId(parentId)
    setStudentForm({
      name: s.name,
      age: s.age?.toString() || '',
      nickname: s.nickname || '',
      notes: s.notes || '',
      branch: branchIdOf(s.branch),
    })
    setStudentError('')
    setStudentDialogOpen(true)
  }

  const handleSaveStudent = async () => {
    if (!studentForm.name.trim()) return
    if (!studentForm.branch) {
      setStudentError('Please select a branch')
      return
    }
    setSavingStudent(true)
    setStudentError('')
    try {
      const url = editStudent ? `/api/admin/students/${editStudent._id}` : '/api/admin/students'
      const method = editStudent ? 'PUT' : 'POST'
      const body = {
        name: studentForm.name,
        age: studentForm.age ? Number(studentForm.age) : undefined,
        nickname: studentForm.nickname,
        notes: studentForm.notes,
        parentId: studentParentId,
        branch: studentForm.branch,
      }
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      setStudentDialogOpen(false)
      fetchAll()
    } finally {
      setSavingStudent(false)
    }
  }

  const handleDeleteStudent = async (id: string) => {
    await fetch(`/api/admin/students/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  // ===== Slot availability =====
  useEffect(() => {
    if (!enrollCourseId || !enrollDialogOpen) { setSlotAvailability([]); return }
    setLoadingSlots(true)
    fetch(`/api/admin/slots?courseId=${enrollCourseId}`)
      .then(r => r.json())
      .then(j => { if (j.success) setSlotAvailability(j.data) })
      .finally(() => setLoadingSlots(false))
  }, [enrollCourseId, enrollDialogOpen])

  // Default duration tab based on selected course's hours
  useEffect(() => {
    if (!enrollCourseId) return
    const course = courses.find(c => c._id === enrollCourseId)
    setEnrollDurationTab(course?.hours === 2 ? '2hr' : '1hr')
    setEnrollSlotDay('')
    setEnrollSlotTime('')
    setEnrollStartDate('')
  }, [enrollCourseId, courses])

  // ===== Enrollment =====
  const openEnroll = (s: Student) => {
    setEnrollStudent(s)
    setEnrollCourseId('')
    setEnrollTeacherId('')
    setEnrollStatus('pending')
    setEnrollSlotDay('')
    setEnrollSlotTime('')
    setEnrollStartDate('')
    setEnrollSelectedDay('tuesday')
    setEnrollDurationTab('1hr')
    setSlotAvailability([])
    setEnrollDialogOpen(true)
  }

  const handleSelectSlot = (day: string, time: string) => {
    if (enrollSlotDay === day && enrollSlotTime === time) {
      setEnrollSlotDay('')
      setEnrollSlotTime('')
      setEnrollStartDate('')
    } else {
      setEnrollSlotDay(day)
      setEnrollSlotTime(time)
      setEnrollStartDate(getNextSlotDateStr(day))
    }
  }

  const handleAddEnrollment = async () => {
    if (!enrollCourseId || !enrollStudent) return
    const course = courses.find(c => c._id === enrollCourseId)
    if (!course) return
    const teacher = teachers.find(t => t._id === enrollTeacherId)
    setSavingEnroll(true)
    try {
      const currentEnrollments = enrollStudent.enrollments || []
      const newEntry: Record<string, unknown> = {
        course: enrollCourseId,
        courseName: course.name,
        courseLevel: course.level,
        courseDurationWeeks: course.durationWeeks || 0,
        courseHours: course.hours || 0,
        teacher: enrollTeacherId || undefined,
        teacherName: teacher?.name || '',
        status: enrollStatus,
        progress: 0,
      }
      if (enrollSlotDay && enrollSlotTime) {
        newEntry.slot = { day: enrollSlotDay, time: enrollSlotTime }
      }
      if (enrollStartDate) {
        newEntry.startDate = new Date(enrollStartDate).toISOString()
      }
      const newEnrollments = [...currentEnrollments, newEntry]
      await fetch(`/api/admin/students/${enrollStudent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollments: newEnrollments }),
      })
      setEnrollDialogOpen(false)
      fetchAll()
    } finally {
      setSavingEnroll(false)
    }
  }

  const handleUpdateEnrollmentStatus = async (student: Student, enrollmentIdx: number, newStatus: string) => {
    const updated = student.enrollments.map((e, i) =>
      i === enrollmentIdx ? { ...e, status: newStatus } : e
    )
    await fetch(`/api/admin/students/${student._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollments: updated }),
    })
    fetchAll()
  }

  const handleUpdateEnrollmentCourse = async (student: Student, enrollmentIdx: number, courseId: string) => {
    const course = courses.find(c => c._id === courseId)
    if (!course) return
    const updated = student.enrollments.map((e, i) =>
      i === enrollmentIdx
        ? { ...e, course: course._id, courseName: course.name, courseLevel: course.level, courseHours: course.hours ?? 0, courseDurationWeeks: course.durationWeeks ?? 0 }
        : e
    )
    await fetch(`/api/admin/students/${student._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollments: updated }),
    })
    fetchAll()
  }

  const handleUpdateEnrollmentTeacher = async (student: Student, enrollmentIdx: number, teacherId: string) => {
    const teacher = teachers.find(t => t._id === teacherId)
    const updated = student.enrollments.map((e, i) =>
      i === enrollmentIdx
        ? { ...e, teacher: teacherId || undefined, teacherName: teacher?.name || '' }
        : e
    )
    await fetch(`/api/admin/students/${student._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollments: updated }),
    })
    fetchAll()
  }

  const handleRemoveEnrollment = async (student: Student, enrollmentIdx: number) => {
    const updated = student.enrollments.filter((_, i) => i !== enrollmentIdx)
    await fetch(`/api/admin/students/${student._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollments: updated }),
    })
    fetchAll()
  }

  // ===== Extend Duration =====
  const openExtendDuration = (student: Student, enrollmentIdx: number) => {
    setExtendStudent(student)
    setExtendEnrollmentIdx(enrollmentIdx)
    setExtendWeeks('4')
    setExtendDialogOpen(true)
  }

  const extendEnrollment = extendStudent && extendEnrollmentIdx >= 0
    ? extendStudent.enrollments[extendEnrollmentIdx]
    : null

  const handleExtendDuration = async () => {
    if (!extendStudent || extendEnrollmentIdx < 0 || !extendWeeks) return
    const weeks = Number(extendWeeks)
    if (weeks <= 0 || isNaN(weeks)) return

    setSavingExtend(true)
    try {
      const updated = extendStudent.enrollments.map((e, i) => {
        if (i !== extendEnrollmentIdx) return e
        const currentWeeks = e.courseDurationWeeks || 0
        return { ...e, courseDurationWeeks: currentWeeks + weeks }
      })
      await fetch(`/api/admin/students/${extendStudent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollments: updated }),
      })
      setExtendDialogOpen(false)
      fetchAll()
    } finally {
      setSavingExtend(false)
    }
  }

  // ===== Reschedule =====
  const openReschedule = (student: Student, enrollmentIdx: number) => {
    const enrollment = student.enrollments[enrollmentIdx]
    setReschedStudent(student)
    setReschedEnrollmentIdx(enrollmentIdx)
    setReschedNewSlotDay('')
    setReschedNewSlotTime('')
    setReschedNewDate('')
    setReschedReason('')
    setReschedRemaining(true)
    setReschedSlotAvailability([])
    setReschedDialogOpen(true)

    // Fetch slot availability
    if (enrollment.course) {
      setLoadingReschedSlots(true)
      fetch(`/api/admin/slots?courseId=${enrollment.course}`)
        .then(r => r.json())
        .then(j => { if (j.success) setReschedSlotAvailability(j.data) })
        .finally(() => setLoadingReschedSlots(false))
    }
  }

  const handleRescheduleSave = async () => {
    if (!reschedStudent || reschedEnrollmentIdx < 0 || !reschedNewSlotDay || !reschedNewSlotTime || !reschedNewDate) return

    const enrollment = reschedStudent.enrollments[reschedEnrollmentIdx]
    const hasScheduleInfo = enrollment.startDate && enrollment.slot && enrollment.courseDurationWeeks

    setSavingResched(true)
    try {
      if (hasScheduleInfo && reschedRemaining) {
        // Use reschedule API to move remaining sessions
        const stamps = generateStampDates(enrollment.startDate!, enrollment.courseDurationWeeks!, enrollment.slot!)
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const nextStamp = stamps.find(d => d >= now)
        const originalDate = nextStamp
          ? nextStamp.toISOString()
          : stamps[stamps.length - 1]?.toISOString() || new Date().toISOString()

        const res = await fetch(`/api/students/${reschedStudent._id}/reschedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentIndex: reschedEnrollmentIdx,
            originalDate,
            newSlot: { day: reschedNewSlotDay, time: reschedNewSlotTime },
            newDate: new Date(reschedNewDate).toISOString(),
            reason: reschedReason,
            rescheduleRemaining: true,
          }),
        })
        const j = await res.json()
        if (!j.success) {
          alert(j.error || 'Failed to reschedule')
          return
        }
      } else {
        // Directly update the enrollment's slot (no schedule data or single change)
        const updated = reschedStudent.enrollments.map((e, i) =>
          i === reschedEnrollmentIdx
            ? { ...e, slot: { day: reschedNewSlotDay, time: reschedNewSlotTime } }
            : e
        )
        await fetch(`/api/admin/students/${reschedStudent._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollments: updated }),
        })
      }
      setReschedDialogOpen(false)
      fetchAll()
    } finally {
      setSavingResched(false)
    }
  }

  const reschedSlotList = reschedSlotAvailability.length > 0
    ? reschedSlotAvailability
    : SLOTS.map((sl) => ({ id: sl.id, day: sl.day, dayLabel: sl.dayLabel, time: sl.time, count: 0, max: MAX_PER_SLOT, available: true }))

  const reschedEnrollment = reschedStudent && reschedEnrollmentIdx >= 0
    ? reschedStudent.enrollments[reschedEnrollmentIdx]
    : null

  // ===== Search / Filter =====
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredParents = normalizedQuery
    ? parents.filter((p) => {
        // Match parent fields
        if (p.name.toLowerCase().includes(normalizedQuery)) return true
        if (p.email && p.email.toLowerCase().includes(normalizedQuery)) return true
        if (p.phone?.toLowerCase().includes(normalizedQuery)) return true
        // Match children name / nickname
        const children = studentsMap[p._id] || []
        return children.some(
          (s) =>
            s.name.toLowerCase().includes(normalizedQuery) ||
            (s.nickname && s.nickname.toLowerCase().includes(normalizedQuery))
        )
      })
    : parents

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">All Parents ({parents.length})</h2>
        <Button onClick={openAddParent} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Parent
        </Button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by parent name, email, phone, or student name..."
          className="pl-9 pr-9 h-10 border-gray-200 focus-visible:ring-orange-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search result count */}
      {normalizedQuery && (
        <p className="text-xs text-gray-500">
          Found <span className="font-semibold text-gray-700">{filteredParents.length}</span> of {parents.length} parents
        </p>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : parents.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No parents yet</p>
        </div>
      ) : filteredParents.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No results for &ldquo;{searchQuery}&rdquo;</p>
          <button onClick={() => setSearchQuery('')} className="text-xs text-orange-500 hover:underline mt-1">
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredParents.map((p) => {
            const children = studentsMap[p._id] || []
            const isExpanded = expandedParent === p._id
            const totalEnrollments = children.reduce((sum, s) => sum + (s.enrollments?.length || 0), 0)
            const isIncomplete = !p.email

            return (
              <Card key={p._id} className={`overflow-hidden ${isIncomplete ? 'border-2 border-amber-300 bg-amber-50/40' : 'border border-gray-200'}`}>
                <CardContent className="p-4">
                  {/* Parent Header */}
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className={`font-bold ${isIncomplete ? 'bg-amber-100 text-amber-600' : 'bg-orange-100 text-orange-600'}`}>
                        {p.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-800">{p.name}</p>
                            {isIncomplete && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded"
                                title="ผู้ปกครองยังไม่มีอีเมล — กดแก้ไขเพื่อเพิ่มข้อมูล"
                              >
                                ⚠️ ข้อมูลไม่ครบ
                              </span>
                            )}
                            {(() => {
                              // Only show the chip in "All branches" mode so a single-branch
                              // view stays uncluttered; in mixed mode it's the visual cue
                              // separating who belongs to which branch.
                              if (selectedBranchId) return null
                              const b = typeof p.branch === 'object' ? p.branch : null
                              if (!b) return null
                              return (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded">
                                  <Building2 className="w-3 h-3" />
                                  {b.name}
                                </span>
                              )
                            })()}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                            {p.email ? (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Mail className="w-3 h-3" />{p.email}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-amber-600 italic">
                                <Mail className="w-3 h-3" />ยังไม่ระบุ
                              </span>
                            )}
                            {p.phone && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="w-3 h-3" />{p.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {children.length} students / {totalEnrollments} courses
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={() => openEditParent(p)}>
                            <Pencil className="w-3.5 h-3.5 text-gray-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setPendingParentDelete(p)}>
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => setExpandedParent(isExpanded ? null : p._id)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Children Section */}
                  {isExpanded && (
                    <div className="mt-4 ml-13 pl-4 border-l-2 border-orange-100">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-gray-600">Students ({children.length})</p>
                        <Button size="sm" variant="outline" onClick={() => openAddStudent(p._id)}
                          className="h-7 text-xs border-orange-300 text-orange-600 hover:bg-orange-50">
                          <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Student
                        </Button>
                      </div>

                      {/* Enrollment Status Filter */}
                      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        <span className="text-xs text-gray-500 shrink-0">Courses:</span>
                        {(
                          [
                            { value: 'active',    label: '🕐 In Progress', activeClass: 'bg-blue-500 text-white border-blue-500' },
                            { value: 'completed', label: '✅ Completed',    activeClass: 'bg-green-500 text-white border-green-500' },
                            { value: 'all',       label: 'All',             activeClass: 'bg-gray-600 text-white border-gray-600' },
                          ] as const
                        ).map(({ value, label, activeClass }) => (
                          <button
                            key={value}
                            onClick={() => setEnrollmentStatusFilter(value)}
                            className={[
                              'rounded-full border px-3 py-0.5 text-xs font-medium transition-all',
                              enrollmentStatusFilter === value
                                ? activeClass
                                : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700',
                            ].join(' ')}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {children.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-2">No students yet</p>
                      ) : (
                        <div className="space-y-3">
                          {children.map((s) => (
                            <div key={s._id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="font-medium text-sm text-gray-800">{s.name}</span>
                                  {s.nickname && <span className="text-xs text-gray-400 ml-1">({s.nickname})</span>}
                                  {s.age && <span className="text-xs text-gray-400 ml-1">Age {s.age}</span>}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost" size="sm" className="h-6 px-2 text-xs"
                                    onClick={() => openEnroll(s)}
                                  >
                                    <BookOpen className="w-3 h-3 mr-1" /> Add Course
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => openEditStudent(s, p._id)}>
                                    <Pencil className="w-3 h-3 text-gray-400" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => setPendingStudentDelete(s)}>
                                    <Trash2 className="w-3 h-3 text-red-400" />
                                  </Button>
                                </div>
                              </div>

                              {/* Enrollments */}
                              {s.enrollments && s.enrollments.length > 0 && (
                                <div className="mt-2 space-y-1.5">
                                  {s.enrollments
                                  .filter(e => enrollmentStatusFilter === 'all' || e.status === enrollmentStatusFilter)
                                  .map((e) => {
                                    const idx = s.enrollments.indexOf(e)
                                    return (
                                    <div key={idx} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                                      {/* Course info */}
                                      <div className="flex-1 min-w-0">
                                        <Select
                                          value={e.course || '__none__'}
                                          onValueChange={(val) => handleUpdateEnrollmentCourse(s, idx, val)}
                                        >
                                          <SelectTrigger className="h-auto w-auto border-0 p-0 focus:ring-0 shadow-none shrink-0 gap-0.5 max-w-full">
                                            <span className="text-xs font-medium text-gray-800 truncate">
                                              {e.courseName || 'Select course'}
                                              {' '}
                                              <span className="text-gray-400 font-normal">
                                                ({(() => { const c = courses.find(co => co._id === e.course); return (c?.hours ?? e.courseHours ?? 0) })()} hrs, {(() => { const c = courses.find(co => co._id === e.course); return (c?.durationWeeks ?? e.courseDurationWeeks ?? 0) })()} wks)
                                              </span>
                                            </span>
                                          </SelectTrigger>
                                          <SelectContent>
                                            {courses.map(c => (
                                              <SelectItem key={c._id} value={c._id} className="text-xs">
                                                <span className="font-medium">{c.name}</span>
                                                {c.level && <span className="text-orange-500 ml-1 text-[10px]">{c.level}</span>}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                          {e.courseLevel && (
                                            <span className="text-[10px] text-orange-500 truncate">{e.courseLevel}</span>
                                          )}
                                          <Select
                                            value={e.teacher || '__none__'}
                                            onValueChange={(val) => handleUpdateEnrollmentTeacher(s, idx, val === '__none__' ? '' : val)}
                                          >
                                            <SelectTrigger className="h-auto w-auto border-0 p-0 text-xs focus:ring-0 shadow-none shrink-0 gap-0.5">
                                              <span className={`text-[10px] flex items-center gap-0.5 ${e.teacherName ? 'text-blue-500' : 'text-gray-400'}`}>
                                                👨‍🏫 {e.teacherName || 'No teacher'}
                                              </span>
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="__none__" className="text-xs text-gray-400">No teacher</SelectItem>
                                              {teachers.map(t => (
                                                <SelectItem key={t._id} value={t._id} className="text-xs">{t.name}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          {e.slot?.day && e.slot?.time && (
                                            <span className="text-[10px] text-purple-600 flex items-center gap-0.5 bg-purple-50 px-1 rounded">
                                              📅 {SLOTS.find(sl => sl.day === e.slot!.day && sl.time === e.slot!.time)?.dayLabel ?? e.slot.day} {e.slot.time}
                                              <button
                                                onClick={(ev) => { ev.stopPropagation(); openReschedule(s, idx) }}
                                                className="ml-0.5 text-orange-500 hover:text-orange-700 transition-colors"
                                                title="เลื่อนเวลาเรียน"
                                              >
                                                <RefreshCw className="w-3 h-3" />
                                              </button>
                                            </span>
                                          )}
                                          {!e.slot?.day && (
                                            <button
                                              onClick={(ev) => { ev.stopPropagation(); openReschedule(s, idx) }}
                                              className="text-[10px] text-orange-500 hover:text-orange-700 flex items-center gap-0.5"
                                              title="ตั้งเวลาเรียน"
                                            >
                                              <CalendarDays className="w-3 h-3" /> Set slot
                                            </button>
                                          )}
                                          {e.startDate && (
                                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                              Start {new Date(e.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' })}
                                            </span>
                                          )}
                                          {e.courseDurationWeeks != null && e.courseDurationWeeks > 0 && (
                                            <span className="text-[10px] text-teal-600 flex items-center gap-0.5 bg-teal-50 px-1 rounded">
                                              📚 {e.courseDurationWeeks} wks
                                              <button
                                                onClick={(ev) => { ev.stopPropagation(); openExtendDuration(s, idx) }}
                                                className="ml-0.5 text-teal-500 hover:text-teal-700 transition-colors"
                                                title="เพิ่มระยะเวลาคอร์ส"
                                              >
                                                <PlusCircle className="w-3 h-3" />
                                              </button>
                                            </span>
                                          )}
                                          {(!e.courseDurationWeeks || e.courseDurationWeeks === 0) && (
                                            <button
                                              onClick={(ev) => { ev.stopPropagation(); openExtendDuration(s, idx) }}
                                              className="text-[10px] text-teal-500 hover:text-teal-700 flex items-center gap-0.5"
                                              title="เพิ่มระยะเวลาคอร์ส"
                                            >
                                              <PlusCircle className="w-3 h-3" /> เพิ่มสัปดาห์
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      {/* Status select */}
                                      <Select
                                        value={e.status}
                                        onValueChange={(val) => handleUpdateEnrollmentStatus(s, idx, val)}
                                      >
                                        <SelectTrigger className="h-5 w-auto border-0 p-0 text-xs focus:ring-0 shadow-none shrink-0">
                                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[e.status]}`}>
                                            {STATUS_LABELS[e.status]}
                                          </span>
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Object.entries(STATUS_LABELS).map(([val, label]) => (
                                            <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <button
                                        onClick={() => setPendingEnrollmentDelete({ student: s, idx })}
                                        className="text-gray-300 hover:text-red-400 shrink-0"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )})}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Parent Dialog */}
      <Dialog open={parentDialogOpen} onOpenChange={setParentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editParent ? 'Edit Parent' : 'Add New Parent'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {parentError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{parentError}</p>}
            <div>
              <Label>Branch *</Label>
              <Select
                value={parentForm.branch}
                onValueChange={(v) => setParentForm({ ...parentForm, branch: v })}
                disabled={!!lockedBranchId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขา..." />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => {
                    const disabled = b.status !== 'active'
                    return (
                      <SelectItem key={b._id} value={b._id} disabled={disabled}>
                        <span className="flex items-center gap-2">
                          <span className={disabled ? 'text-gray-400' : ''}>{b.name}</span>
                          {b.status === 'coming_soon' && (
                            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                              Coming Soon
                            </span>
                          )}
                          {b.status === 'closed' && (
                            <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                              Closed
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Full Name *</Label>
              <Input value={parentForm.name} onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })} placeholder="Parent name" />
            </div>

            {/* No-email-yet toggle */}
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <Checkbox
                checked={parentNoEmail}
                onCheckedChange={(v) => setParentNoEmail(!!v)}
                className="mt-0.5"
              />
              <span className="text-sm text-gray-700 leading-tight">
                ยังไม่มีข้อมูล email — กรอกทีหลัง
                <span className="block text-[11px] text-gray-400">
                  ผู้ปกครองจะยังล็อกอินไม่ได้จนกว่าจะเพิ่ม email และ password
                </span>
              </span>
            </label>

            {parentNoEmail && (
              <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-700">
                ⚠️ ระบบจะบันทึกเป็น <strong>ข้อมูลไม่ครบ</strong> — เห็นได้ในรายการผู้ปกครอง
              </div>
            )}

            {!parentNoEmail && (
              <>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={parentForm.email} onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })} placeholder="parent@example.com" />
                </div>
                <div>
                  <Label>{editParent ? 'Password (leave blank to keep unchanged)' : 'Password *'}</Label>
                  <div className="relative">
                    <Input
                      type={showParentPassword ? 'text' : 'password'}
                      value={parentForm.password}
                      onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowParentPassword(!showParentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showParentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <Label>Phone</Label>
              <Input value={parentForm.phone} onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })} placeholder="0812345678" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setParentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveParent} disabled={savingParent} className="bg-orange-500 hover:bg-orange-600 text-white">
              {savingParent ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Dialog */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {studentError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{studentError}</p>}
            <div>
              <Label>Branch *</Label>
              <Select
                value={studentForm.branch}
                onValueChange={(v) => setStudentForm({ ...studentForm, branch: v })}
                disabled={!!lockedBranchId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขา..." />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => {
                    const isComingSoon = b.status === 'coming_soon'
                    const isClosed = b.status === 'closed'
                    const disabled = isComingSoon || isClosed
                    return (
                      <SelectItem key={b._id} value={b._id} disabled={disabled}>
                        <span className="flex items-center gap-2">
                          <span className={disabled ? 'text-gray-400' : ''}>{b.name}</span>
                          {isComingSoon && (
                            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                              Coming Soon
                            </span>
                          )}
                          {isClosed && (
                            <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                              Closed
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {lockedBranchId && (
                <p className="text-[11px] text-gray-400 mt-1">Locked to your branch.</p>
              )}
            </div>
            <div>
              <Label>Full Name *</Label>
              <Input value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} placeholder="Student name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nickname</Label>
                <Input value={studentForm.nickname} onChange={(e) => setStudentForm({ ...studentForm, nickname: e.target.value })} placeholder="Nickname" />
              </div>
              <div>
                <Label>Age</Label>
                <Input type="number" value={studentForm.age} onChange={(e) => setStudentForm({ ...studentForm, age: e.target.value })} placeholder="Age" />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={studentForm.notes} onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })} rows={2} placeholder="Additional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveStudent} disabled={savingStudent} className="bg-orange-500 hover:bg-orange-600 text-white">
              {savingStudent ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enrollment Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enroll in Course — {enrollStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Course */}
            <div>
              <Label>Select Course *</Label>
              <Select value={enrollCourseId} onValueChange={setEnrollCourseId}>
                <SelectTrigger className="h-auto min-h-10">
                  <SelectValue placeholder="Select a course...">
                    {enrollCourseId && (() => {
                      const selected = courses.find(c => c._id === enrollCourseId)
                      return selected ? (
                        <div className="text-left">
                          <p className="text-sm font-medium leading-tight truncate">{selected.name} ({(selected as any).hours ?? 0} hrs, {selected.durationWeeks ?? 0} wks)</p>
                          <p className="text-xs text-gray-500 leading-tight truncate">{selected.level}</p>
                        </div>
                      ) : null
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-w-lg">
                  {courses
                    .filter(c => !enrollStudent?.enrollments?.find(e => e.course === c._id))
                    .map(c => (
                      <SelectItem key={c._id} value={c._id} className="py-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">{c.name} ({(c as any).hours ?? 0} hrs, {c.durationWeeks ?? 0} wks)</span>
                          <span className="text-xs text-gray-500">{c.level}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Slot selector */}
            {enrollCourseId && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Select Class Time Slot</Label>
                  {loadingSlots && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                </div>

                {/* Duration tab switcher */}
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEnrollDurationTab('1hr')
                      setEnrollSlotDay('')
                      setEnrollSlotTime('')
                      setEnrollStartDate('')
                    }}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                      enrollDurationTab === '1hr' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    ⏱ 1 Hour
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEnrollDurationTab('2hr')
                      setEnrollSlotDay('')
                      setEnrollSlotTime('')
                      setEnrollStartDate('')
                    }}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                      enrollDurationTab === '2hr' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    ⏱⏱ 2 Hours
                  </button>
                </div>

                {/* Day dropdown */}
                <div className="relative">
                  <select
                    value={enrollSelectedDay}
                    onChange={(e) => {
                      const newDay = e.target.value
                      setEnrollSelectedDay(newDay)
                      if (newDay !== enrollSlotDay) {
                        setEnrollSlotDay('')
                        setEnrollSlotTime('')
                        setEnrollStartDate('')
                      }
                    }}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm font-medium focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all cursor-pointer"
                  >
                    <option value="tuesday">Tuesday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                {/* Time slot grid for the selected day + duration */}
                {(() => {
                  const rawSlotList = slotAvailability.length > 0
                    ? slotAvailability
                    : SLOTS.map(s => ({
                        id: s.id, day: s.day, dayLabel: s.dayLabel, time: s.time, count: 0, max: MAX_PER_SLOT, available: true
                      }))

                  let displaySlotList: SlotAvailability[]
                  if (enrollDurationTab === '1hr') {
                    displaySlotList = rawSlotList.filter(s => s.day === enrollSelectedDay && !isTwoHourTime(s.time))
                  } else {
                    const twoHourOptions = getTwoHourSlotOptions().filter(s => s.day === enrollSelectedDay)
                    const availMap = new Map<string, SlotAvailability>()
                    for (const s of rawSlotList) availMap.set(`${s.day}|${s.time}`, s)
                    displaySlotList = twoHourOptions.map(twoHr => {
                      const slotsData = twoHr.constituentSlots.map(cs =>
                        availMap.get(`${twoHr.day}|${cs.time}`) || { id: `${twoHr.day}-${cs.time}`, day: twoHr.day, dayLabel: twoHr.dayLabel, time: cs.time, count: 0, max: MAX_PER_SLOT, available: true }
                      )
                      const combinedCount = Math.max(...slotsData.map(s => s.count))
                      const combinedAvailable = slotsData.every(s => s.count < (s.max || MAX_PER_SLOT))
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

                  return (
                    <div>
                      <Label className="mb-2 block text-xs">
                        Times — <span className="text-purple-600 font-semibold">
                          {SLOTS.find(s => s.day === enrollSelectedDay)?.dayLabel || enrollSelectedDay}
                        </span>
                        {enrollDurationTab === '2hr' && (
                          <span className="ml-1 text-[11px] text-gray-400 font-normal">(2-hour block)</span>
                        )}
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {displaySlotList.map((slot) => {
                          const isSelected = enrollSlotDay === slot.day && enrollSlotTime === slot.time
                          const isFull = slot.count >= slot.max
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={isFull && !isSelected}
                              onClick={() => handleSelectSlot(slot.day, slot.time)}
                              className={`relative text-center px-2 py-2.5 rounded-lg border text-xs transition-all ${
                                isSelected
                                  ? 'bg-purple-500 text-white border-purple-500 shadow-sm'
                                  : isFull
                                  ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                              }`}
                            >
                              <div className="font-semibold">{slot.time}</div>
                              {slotAvailability.length > 0 && (
                                <div className={`flex items-center justify-center gap-0.5 mt-1 text-[10px] font-medium ${
                                  isSelected ? 'text-white/80' : isFull ? 'text-red-500' : 'text-green-600'
                                }`}>
                                  <Users className="h-2.5 w-2.5" />
                                  <span>{slot.count}/{slot.max}</span>
                                </div>
                              )}
                              {isFull && slotAvailability.length > 0 && !isSelected && (
                                <span className="absolute top-1 right-1 text-[9px] bg-red-100 text-red-500 px-1 rounded">Full</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}

                {enrollSlotDay && enrollSlotTime && (
                  <p className="text-xs text-purple-600 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    Selected: {SLOTS.find(s => s.day === enrollSlotDay)?.dayLabel || enrollSlotDay} {enrollSlotTime}
                  </p>
                )}
              </div>
            )}

            {/* Start date — only show if slot selected */}
            {enrollSlotDay && (
              <div>
                <Label>First Class Date</Label>
                <Input
                  type="date"
                  value={enrollStartDate}
                  onChange={(e) => setEnrollStartDate(e.target.value)}
                  className="mt-1"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  * Should be a {SLOTS.find(s => s.day === enrollSlotDay)?.dayLabel || enrollSlotDay}
                </p>
              </div>
            )}

            {/* Teacher */}
            <div>
              <Label>Assigned Teacher</Label>
              <Select value={enrollTeacherId} onValueChange={setEnrollTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label>Initial Status</Label>
              <Select value={enrollStatus} onValueChange={(v) => setEnrollStatus(v as 'active' | 'pending')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEnrollment} disabled={savingEnroll || !enrollCourseId} className="bg-orange-500 hover:bg-orange-600 text-white">
              {savingEnroll ? 'Saving...' : 'Enroll'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Duration Dialog */}
      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-teal-500" />
              เพิ่มระยะเวลาคอร์ส
            </DialogTitle>
          </DialogHeader>
          {extendEnrollment && extendStudent && (
            <div className="space-y-4">
              {/* Info */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium text-teal-700">{extendStudent.name}</p>
                <p className="text-xs text-teal-600">{extendEnrollment.courseName}</p>
                <p className="text-xs text-teal-500">
                  ระยะเวลาปัจจุบัน: <span className="font-semibold">{extendEnrollment.courseDurationWeeks || 0}</span> สัปดาห์
                </p>
                {extendEnrollment.startDate && extendEnrollment.slot && extendEnrollment.courseDurationWeeks ? (
                  (() => {
                    const stamps = generateStampDates(extendEnrollment.startDate, extendEnrollment.courseDurationWeeks, extendEnrollment.slot)
                    const lastDate = stamps.length > 0 ? stamps[stamps.length - 1] : null
                    return lastDate ? (
                      <p className="text-xs text-teal-500">
                        สัปดาห์สุดท้ายปัจจุบัน: {lastDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    ) : null
                  })()
                ) : null}
              </div>

              {/* Weeks input */}
              <div>
                <Label className="text-sm font-medium">จำนวนสัปดาห์ที่ต้องการเพิ่ม</Label>
                <Input
                  type="number"
                  min="1"
                  max="52"
                  value={extendWeeks}
                  onChange={(e) => setExtendWeeks(e.target.value)}
                  className="mt-1"
                  placeholder="เช่น 4"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  สัปดาห์ใหม่จะนับต่อจากสัปดาห์สุดท้ายล่าสุด
                </p>
              </div>

              {/* Preview */}
              {extendWeeks && Number(extendWeeks) > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm space-y-1">
                  <p className="font-medium text-blue-700 text-xs">ผลลัพธ์หลังเพิ่ม:</p>
                  <p className="text-xs text-blue-600">
                    ระยะเวลาใหม่: <span className="font-semibold">{(extendEnrollment.courseDurationWeeks || 0) + Number(extendWeeks)}</span> สัปดาห์
                    <span className="text-blue-400 ml-1">
                      ({extendEnrollment.courseDurationWeeks || 0} + {extendWeeks})
                    </span>
                  </p>
                  {extendEnrollment.startDate && extendEnrollment.slot && (
                    (() => {
                      const newTotalWeeks = (extendEnrollment.courseDurationWeeks || 0) + Number(extendWeeks)
                      const newStamps = generateStampDates(extendEnrollment.startDate, newTotalWeeks, extendEnrollment.slot)
                      const newLastDate = newStamps.length > 0 ? newStamps[newStamps.length - 1] : null
                      return newLastDate ? (
                        <p className="text-xs text-blue-600">
                          สัปดาห์สุดท้ายใหม่: <span className="font-semibold">{newLastDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </p>
                      ) : null
                    })()
                  )}
                </div>
              )}

              {/* Actions */}
              <DialogFooter>
                <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>ยกเลิก</Button>
                <Button
                  onClick={handleExtendDuration}
                  disabled={savingExtend || !extendWeeks || Number(extendWeeks) <= 0}
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                >
                  {savingExtend ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />กำลังบันทึก...</>
                  ) : (
                    <><PlusCircle className="w-4 h-4 mr-2" />เพิ่มสัปดาห์</>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={reschedDialogOpen} onOpenChange={setReschedDialogOpen}>
        <DialogContent
          className="sm:max-w-md max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-orange-500" />
              เลื่อนเวลาเรียน
            </DialogTitle>
          </DialogHeader>
          {reschedEnrollment && reschedStudent && (
            <div className="space-y-4">
              {/* Info */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium text-orange-700">{reschedStudent.name}</p>
                <p className="text-xs text-orange-600">{reschedEnrollment.courseName}</p>
                {reschedEnrollment.slot && (
                  <p className="text-xs text-orange-500">
                    Slot ปัจจุบัน: {SLOTS.find(sl => sl.day === reschedEnrollment.slot!.day && sl.time === reschedEnrollment.slot!.time)?.dayLabel ?? reschedEnrollment.slot.day} {reschedEnrollment.slot.time}
                  </p>
                )}
              </div>

              {/* Slot selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm font-medium">เลือก Slot ใหม่</Label>
                  {loadingReschedSlots && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {reschedSlotList.map((slot) => {
                    const isSelected = reschedNewSlotDay === slot.day && reschedNewSlotTime === slot.time
                    const isFull = slot.count >= slot.max
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setReschedNewSlotDay(slot.day)
                          setReschedNewSlotTime(slot.time)
                          setReschedNewDate(getNextSlotDateStr(slot.day))
                        }}
                        className={`relative text-center px-2 py-2.5 rounded-lg border text-xs transition-all ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : isFull
                            ? 'border-gray-200 bg-gray-50 text-gray-300'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        <div className="font-semibold">{slot.dayLabel}</div>
                        <div className="text-[10px] mt-0.5 opacity-80">{slot.time}</div>
                        {reschedSlotAvailability.length > 0 && (
                          <div className={`flex items-center justify-center gap-0.5 mt-1 text-[10px] font-medium ${
                            isSelected ? 'text-white/80' : isFull ? 'text-red-500' : 'text-green-600'
                          }`}>
                            <Users className="h-2.5 w-2.5" />
                            <span>{slot.count}/{slot.max}</span>
                          </div>
                        )}
                        {isFull && reschedSlotAvailability.length > 0 && !isSelected && (
                          <span className="absolute top-1 right-1 text-[9px] bg-red-100 text-red-500 px-1 rounded">Full</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Date picker */}
              {reschedNewSlotDay && (
                <div>
                  <Label className="text-sm font-medium">วันที่เริ่มต้นใหม่</Label>
                  <Input
                    type="date"
                    value={reschedNewDate}
                    onChange={(e) => setReschedNewDate(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    * ควรเป็นวัน{SLOTS.find(sl => sl.day === reschedNewSlotDay)?.dayLabel || reschedNewSlotDay}
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <Label className="text-sm font-medium">เหตุผล (ไม่บังคับ)</Label>
                <Input
                  value={reschedReason}
                  onChange={(e) => setReschedReason(e.target.value)}
                  placeholder="เช่น เปลี่ยนเวลาเรียน / ติดธุระ"
                  className="mt-1"
                />
              </div>

              {/* Reschedule remaining checkbox */}
              {reschedEnrollment.startDate && reschedEnrollment.courseDurationWeeks && reschedEnrollment.slot && (
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <Checkbox
                    id="reschedRemainingParent"
                    checked={reschedRemaining}
                    onCheckedChange={(checked) => setReschedRemaining(checked === true)}
                    className="mt-0.5"
                  />
                  <div>
                    <label htmlFor="reschedRemainingParent" className="text-sm font-medium text-blue-700 cursor-pointer">
                      เลื่อนทั้งหมดที่เหลือ
                    </label>
                    <p className="text-[11px] text-blue-500 mt-0.5">
                      เลื่อน session ที่เหลือทั้งหมดไปยัง Slot ใหม่ (แนะนำ)
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <DialogFooter>
                <Button variant="outline" onClick={() => setReschedDialogOpen(false)}>ยกเลิก</Button>
                <Button
                  onClick={handleRescheduleSave}
                  disabled={savingResched || !reschedNewSlotDay || !reschedNewDate}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {savingResched ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />กำลังบันทึก...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4 mr-2" />บันทึก</>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!pendingParentDelete}
        onOpenChange={(o) => { if (!o) setPendingParentDelete(null) }}
        itemType="parent"
        itemName={pendingParentDelete?.name ?? ''}
        consequences={[
          'The parent record will be removed',
          'Linked student records remain but will be detached',
          'The parent will lose access to the parent portal',
        ]}
        onConfirm={async () => {
          if (pendingParentDelete) await handleDeleteParent(pendingParentDelete._id)
        }}
        destructiveLabel="Delete parent"
      />

      <DeleteConfirmDialog
        open={!!pendingStudentDelete}
        onOpenChange={(o) => { if (!o) setPendingStudentDelete(null) }}
        itemType="student"
        itemName={
          pendingStudentDelete
            ? (pendingStudentDelete.nickname
                ? `${pendingStudentDelete.name} (${pendingStudentDelete.nickname})`
                : pendingStudentDelete.name)
            : ''
        }
        confirmPhrase={pendingStudentDelete?.name ?? ''}
        consequences={[
          'The student record will be removed from the database',
          'Their enrollments and slot assignments will be lost',
          'Past attendance entries will become orphaned (the student name remains in session history)',
        ]}
        onConfirm={async () => {
          if (pendingStudentDelete) await handleDeleteStudent(pendingStudentDelete._id)
        }}
        destructiveLabel="Delete student"
      />

      <DeleteConfirmDialog
        open={!!pendingEnrollmentDelete}
        onOpenChange={(o) => { if (!o) setPendingEnrollmentDelete(null) }}
        itemType="enrollment"
        itemName={
          pendingEnrollmentDelete
            ? (pendingEnrollmentDelete.student.enrollments[pendingEnrollmentDelete.idx]?.courseName
                ?? 'this enrollment')
            : ''
        }
        confirmPhrase="REMOVE"
        description={
          pendingEnrollmentDelete ? (
            <p>
              Removing the enrollment for{' '}
              <strong className="text-gray-900">{pendingEnrollmentDelete.student.name}</strong>.
            </p>
          ) : null
        }
        consequences={[
          'The course enrollment will be removed from this student',
          'Slot assignment for this enrollment will be released',
        ]}
        onConfirm={async () => {
          if (pendingEnrollmentDelete) {
            await handleRemoveEnrollment(
              pendingEnrollmentDelete.student,
              pendingEnrollmentDelete.idx
            )
          }
        }}
        destructiveLabel="Remove enrollment"
      />
    </div>
  )
}
