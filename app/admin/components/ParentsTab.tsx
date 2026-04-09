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
  RefreshCw,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { SLOTS, MAX_PER_SLOT, getNextSlotDateStr, getSlotDayOfWeek, generateStampDates } from '@/lib/slots'

interface Course {
  _id: string
  name: string
  level: string
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
}

interface Parent {
  _id: string
  name: string
  email: string
  phone: string
  createdAt: string
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

export default function ParentsTab() {
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
  const [parentForm, setParentForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [parentError, setParentError] = useState('')
  const [savingParent, setSavingParent] = useState(false)
  const [showParentPassword, setShowParentPassword] = useState(false)

  // Student dialog
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [studentParentId, setStudentParentId] = useState('')
  const [studentForm, setStudentForm] = useState({ name: '', age: '', nickname: '', notes: '' })
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
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [savingEnroll, setSavingEnroll] = useState(false)

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
    const [parentsRes, coursesRes, studentsRes, teachersRes] = await Promise.all([
      fetch('/api/admin/parents'),
      fetch('/api/admin/courses'),
      fetch('/api/admin/students'),
      fetch('/api/admin/teachers'),
    ])
    const [pj, cj, sj, tj] = await Promise.all([parentsRes.json(), coursesRes.json(), studentsRes.json(), teachersRes.json()])
    if (pj.success) setParents(pj.data)
    if (cj.success) setCourses(cj.data)
    if (tj.success) setTeachers(tj.data)
    if (sj.success) {
      const map: Record<string, Student[]> = {}
      sj.data.forEach((s: Student & { parent: { _id: string } }) => {
        const pid = typeof s.parent === 'object' ? s.parent._id : s.parent
        if (!map[pid]) map[pid] = []
        map[pid].push(s)
      })
      setStudentsMap(map)
    }
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  // ===== Parent CRUD =====
  const openAddParent = () => {
    setEditParent(null)
    setParentForm({ name: '', email: '', password: '', phone: '' })
    setParentError('')
    setParentDialogOpen(true)
  }

  const openEditParent = (p: Parent) => {
    setEditParent(p)
    setParentForm({ name: p.name, email: p.email, password: '', phone: p.phone })
    setParentError('')
    setParentDialogOpen(true)
  }

  const handleSaveParent = async () => {
    if (!parentForm.name.trim() || !parentForm.email.trim()) return
    if (!editParent && !parentForm.password.trim()) { setParentError('Please enter a password'); return }
    setSavingParent(true)
    setParentError('')
    try {
      const url = editParent ? `/api/admin/parents/${editParent._id}` : '/api/admin/parents'
      const method = editParent ? 'PUT' : 'POST'
      const body = editParent
        ? { name: parentForm.name, email: parentForm.email, phone: parentForm.phone, ...(parentForm.password ? { password: parentForm.password } : {}) }
        : parentForm
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
    if (!confirm('Delete this parent? Linked student data will remain.')) return
    await fetch(`/api/admin/parents/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  // ===== Student CRUD =====
  const openAddStudent = (parentId: string) => {
    setEditStudent(null)
    setStudentParentId(parentId)
    setStudentForm({ name: '', age: '', nickname: '', notes: '' })
    setStudentDialogOpen(true)
  }

  const openEditStudent = (s: Student, parentId: string) => {
    setEditStudent(s)
    setStudentParentId(parentId)
    setStudentForm({ name: s.name, age: s.age?.toString() || '', nickname: s.nickname || '', notes: s.notes || '' })
    setStudentDialogOpen(true)
  }

  const handleSaveStudent = async () => {
    if (!studentForm.name.trim()) return
    setSavingStudent(true)
    try {
      const url = editStudent ? `/api/admin/students/${editStudent._id}` : '/api/admin/students'
      const method = editStudent ? 'PUT' : 'POST'
      const body = {
        name: studentForm.name,
        age: studentForm.age ? Number(studentForm.age) : undefined,
        nickname: studentForm.nickname,
        notes: studentForm.notes,
        parentId: studentParentId,
      }
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      setStudentDialogOpen(false)
      fetchAll()
    } finally {
      setSavingStudent(false)
    }
  }

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Delete this student?')) return
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

  // ===== Enrollment =====
  const openEnroll = (s: Student) => {
    setEnrollStudent(s)
    setEnrollCourseId('')
    setEnrollTeacherId('')
    setEnrollStatus('pending')
    setEnrollSlotDay('')
    setEnrollSlotTime('')
    setEnrollStartDate('')
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
        courseDurationWeeks: (course as any).durationWeeks || 0,
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
    if (!confirm('Remove this enrollment?')) return
    const updated = student.enrollments.filter((_, i) => i !== enrollmentIdx)
    await fetch(`/api/admin/students/${student._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollments: updated }),
    })
    fetchAll()
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
        if (p.email.toLowerCase().includes(normalizedQuery)) return true
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

            return (
              <Card key={p._id} className="border border-gray-200 overflow-hidden">
                <CardContent className="p-4">
                  {/* Parent Header */}
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                        {p.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-800">{p.name}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />{p.email}
                            </span>
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
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteParent(p._id)}>
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
                                  <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => handleDeleteStudent(s._id)}>
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
                                        <p className="text-xs font-medium text-gray-800 truncate">{e.courseName}</p>
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
                                        onClick={() => handleRemoveEnrollment(s, idx)}
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
              <Label>Full Name *</Label>
              <Input value={parentForm.name} onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })} placeholder="Parent name" />
            </div>
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                          <p className="text-sm font-medium leading-tight truncate">{selected.name}</p>
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
                          <span className="text-sm font-medium">{c.name}</span>
                          <span className="text-xs text-gray-500">{c.level}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Slot selector */}
            {enrollCourseId && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>Select Class Time Slot</Label>
                  {loadingSlots && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(slotAvailability.length > 0 ? slotAvailability : SLOTS.map(s => ({
                    id: s.id, day: s.day, dayLabel: s.dayLabel, time: s.time, count: 0, max: MAX_PER_SLOT, available: true
                  }))).map((slot) => {
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
                        <div className="font-semibold">{slot.dayLabel}</div>
                        <div className="text-[10px] mt-0.5 opacity-80">{slot.time}</div>
                        <div className={`text-[10px] mt-1 font-medium ${
                          isSelected ? 'text-white/80' : isFull ? 'text-red-400' : 'text-green-600'
                        }`}>
                          {slot.count}/{slot.max} seats
                        </div>
                        {isFull && !isSelected && (
                          <span className="absolute top-1 right-1 text-[9px] bg-red-100 text-red-500 px-1 rounded">Full</span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {enrollSlotDay && enrollSlotTime && (
                  <p className="text-xs text-purple-600 mt-1.5 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    Selected: {SLOTS.find(s => s.day === enrollSlotDay && s.time === enrollSlotTime)?.dayLabel} {enrollSlotTime}
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
    </div>
  )
}
