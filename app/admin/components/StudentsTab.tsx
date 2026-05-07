'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import {
  Mail, Phone, Search, X, Users, Trash2, Loader2, ChevronDown, ChevronUp,
  BookOpen, GraduationCap, CalendarDays, Stamp,
} from 'lucide-react'
import { SLOTS } from '@/lib/slots'
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog'

interface AttendanceEntry {
  student: string | { _id: string }
  checkedIn: boolean
}

interface SessionRecord {
  _id: string
  course: string | { _id: string }
  attendance?: AttendanceEntry[]
}

interface Enrollment {
  _id?: string
  course?: string
  courseName?: string
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

interface ParentInfo {
  _id: string
  name: string
  email: string
  phone?: string
}

interface Student {
  _id: string
  name: string
  age?: number
  nickname?: string
  notes?: string
  enrollments: Enrollment[]
  parent: ParentInfo | string | null
  createdAt?: string
}

const STATUS_DOT: Record<string, string> = {
  active: 'bg-green-500',
  completed: 'bg-blue-500',
  dropped: 'bg-red-500',
  pending: 'bg-yellow-500',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'In Progress',
  completed: 'Completed',
  dropped: 'Dropped',
  pending: 'Pending',
}

type StatusFilter = 'all' | 'active' | 'completed' | 'pending' | 'no-course'
type SortKey = 'name' | 'newest' | 'enrollments'

export default function StudentsTab() {
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Student | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [sRes, sessRes] = await Promise.all([
        fetch('/api/admin/students'),
        fetch('/api/admin/sessions'),
      ])
      const [sJson, sessJson] = await Promise.all([sRes.json(), sessRes.json()])
      if (sJson.success) setStudents(sJson.data)
      if (sessJson.success) setSessions(sessJson.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  // Build a map: studentId -> { total: X, perCourse: { courseId: count } }
  const stampMap = useMemo(() => {
    const map: Record<string, { total: number; perCourse: Record<string, number> }> = {}
    for (const sess of sessions) {
      const courseId = typeof sess.course === 'object' && sess.course
        ? sess.course._id
        : (sess.course as string | undefined)
      for (const att of sess.attendance || []) {
        if (!att.checkedIn) continue
        const studentId = typeof att.student === 'object' && att.student
          ? att.student._id
          : (att.student as string | undefined)
        if (!studentId) continue
        if (!map[studentId]) map[studentId] = { total: 0, perCourse: {} }
        map[studentId].total++
        if (courseId) {
          map[studentId].perCourse[courseId] = (map[studentId].perCourse[courseId] || 0) + 1
        }
      }
    }
    return map
  }, [sessions])

  const getParent = (s: Student): ParentInfo | null =>
    s.parent && typeof s.parent === 'object' ? s.parent : null

  const handleDelete = async (s: Student) => {
    setDeletingId(s._id)
    try {
      const res = await fetch(`/api/admin/students/${s._id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) {
        alert(json.error || 'Failed to delete')
        throw new Error(json.error || 'Failed to delete')
      }
      setStudents((prev) => prev.filter((x) => x._id !== s._id))
    } catch (err) {
      if (!(err instanceof Error && err.message === 'Failed to delete')) {
        alert('Failed to delete')
      }
      throw err
    } finally {
      setDeletingId(null)
    }
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let list = students.filter((s) => {
      if (statusFilter === 'no-course') {
        if ((s.enrollments?.length || 0) > 0) return false
      } else if (statusFilter !== 'all') {
        const hasMatching = s.enrollments?.some((e) => e.status === statusFilter)
        if (!hasMatching) return false
      }
      if (!q) return true
      if (s.name.toLowerCase().includes(q)) return true
      if (s.nickname?.toLowerCase().includes(q)) return true
      const parent = getParent(s)
      if (parent) {
        if (parent.name.toLowerCase().includes(q)) return true
        if (parent.email.toLowerCase().includes(q)) return true
        if (parent.phone?.toLowerCase().includes(q)) return true
      }
      if (s.enrollments?.some((e) => e.courseName?.toLowerCase().includes(q))) return true
      return false
    })

    list = [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name)
      if (sortKey === 'enrollments')
        return (b.enrollments?.length || 0) - (a.enrollments?.length || 0)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })

    return list
  }, [students, searchQuery, statusFilter, sortKey])

  const totalEnrollments = students.reduce((sum, s) => sum + (s.enrollments?.length || 0), 0)
  const totalStamps = Object.values(stampMap).reduce((sum, m) => sum + m.total, 0)
  const activeCount = students.filter((s) =>
    s.enrollments?.some((e) => e.status === 'active'),
  ).length
  const noCourseCount = students.filter((s) => (s.enrollments?.length || 0) === 0).length

  return (
    <div className="space-y-4">
      {/* Big-number stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <p className="text-3xl font-bold text-gray-800 leading-none">{students.length}</p>
          <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">Total Students</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <p className="text-3xl font-bold text-green-600 leading-none">{activeCount}</p>
          <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">Active</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <p className="text-3xl font-bold text-purple-600 leading-none">{totalEnrollments}</p>
          <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">Enrollments</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <p className="text-3xl font-bold text-amber-600 leading-none">{totalStamps}</p>
          <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider flex items-center gap-1">
            <Stamp className="w-3 h-3" />Stamps
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search student, parent, or course..."
          className="pl-9 pr-9 h-9 text-sm border-gray-200 focus-visible:ring-orange-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          {(
            [
              { value: 'all',       label: `All ${students.length}`,    activeClass: 'bg-gray-700 text-white border-gray-700' },
              { value: 'active',    label: `Active ${activeCount}`,     activeClass: 'bg-blue-500 text-white border-blue-500' },
              { value: 'completed', label: 'Completed',                 activeClass: 'bg-green-500 text-white border-green-500' },
              { value: 'pending',   label: 'Pending',                   activeClass: 'bg-yellow-500 text-white border-yellow-500' },
              { value: 'no-course', label: `No Course ${noCourseCount}`, activeClass: 'bg-orange-500 text-white border-orange-500' },
            ] as const
          ).map(({ value, label, activeClass }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={[
                'rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all',
                statusFilter === value
                  ? activeClass
                  : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[11px] text-gray-400">Sort:</span>
          {(
            [
              { value: 'name',        label: 'A→Z' },
              { value: 'newest',      label: 'New' },
              { value: 'enrollments', label: 'Courses' },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSortKey(value)}
              className={[
                'rounded-md border px-2 py-0.5 text-[11px] transition-all',
                sortKey === value
                  ? 'border-orange-300 bg-orange-50 text-orange-600 font-medium'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No students yet</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No matching students</p>
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
            className="text-xs text-orange-500 hover:underline mt-1"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
          {filtered.map((s) => {
            const parent = getParent(s)
            const enrollments = s.enrollments || []
            const isExpanded = expanded.has(s._id)
            const isDeleting = deletingId === s._id
            const statusCounts = enrollments.reduce<Record<string, number>>((acc, e) => {
              acc[e.status] = (acc[e.status] || 0) + 1
              return acc
            }, {})
            const studentStamps = stampMap[s._id] || { total: 0, perCourse: {} }
            const totalCapacity = enrollments.reduce(
              (sum, e) => sum + (e.courseDurationWeeks || 0),
              0,
            )

            return (
              <div key={s._id} className={isDeleting ? 'opacity-50 pointer-events-none' : ''}>
                {/* Compact row */}
                <div
                  onClick={() => enrollments.length > 0 && toggleExpand(s._id)}
                  className={[
                    'flex items-center gap-3 px-3 py-2',
                    enrollments.length > 0 ? 'cursor-pointer hover:bg-gray-50' : '',
                  ].join(' ')}
                >
                  {/* Avatar bubble */}
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {s.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name + parent */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-medium text-sm text-gray-800 truncate">{s.name}</span>
                      {s.nickname && (
                        <span className="text-[11px] text-gray-400">({s.nickname})</span>
                      )}
                      {s.age != null && (
                        <span className="text-[11px] text-gray-400">{s.age}y</span>
                      )}
                    </div>
                    {parent ? (
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                        <span className="truncate flex items-center gap-1">
                          <Users className="w-3 h-3 shrink-0" />{parent.name}
                        </span>
                        {parent.phone && (
                          <span className="hidden sm:flex items-center gap-1 shrink-0">
                            <Phone className="w-3 h-3" />{parent.phone}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic mt-0.5">No parent</p>
                    )}
                  </div>

                  {/* Stamps + status + count */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Stamp progress badge */}
                    {(studentStamps.total > 0 || totalCapacity > 0) && (
                      <span
                        title={`Attended ${studentStamps.total} of ${totalCapacity} sessions`}
                        className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"
                      >
                        <Stamp className="w-3 h-3" />
                        {studentStamps.total}
                        {totalCapacity > 0 && (
                          <span className="text-amber-400">/{totalCapacity}</span>
                        )}
                      </span>
                    )}
                    {/* Status dots */}
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <span
                        key={status}
                        title={`${count} ${STATUS_LABELS[status]}`}
                        className="flex items-center gap-0.5 text-[11px] text-gray-600"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                        {count}
                      </span>
                    ))}
                    <span className="text-[11px] font-semibold text-gray-700 bg-gray-100 rounded-full px-2 py-0.5 min-w-[2rem] text-center">
                      {enrollments.length}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {enrollments.length > 0 && (
                      isExpanded
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setPendingDelete(s) }}
                      disabled={isDeleting}
                      title="Delete student"
                      className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {isDeleting
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && enrollments.length > 0 && (
                  <div className="bg-gray-50 px-3 py-2 border-t border-gray-100 space-y-1">
                    {parent && (
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 pb-1.5 border-b border-gray-200">
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3" />{parent.email}
                        </span>
                      </div>
                    )}
                    {enrollments.map((e, idx) => {
                      const slotLabel = e.slot
                        ? SLOTS.find((sl) => sl.day === e.slot!.day && sl.time === e.slot!.time)?.dayLabel ?? e.slot.day
                        : null
                      const capacity = e.courseDurationWeeks || 0
                      const attended = e.course ? (studentStamps.perCourse[e.course] || 0) : 0
                      const pct = capacity > 0 ? Math.min(100, (attended / capacity) * 100) : 0
                      return (
                        <div
                          key={e._id ?? idx}
                          className="text-xs py-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 text-gray-700">
                                <BookOpen className="w-3 h-3 text-purple-400 shrink-0" />
                                <span className="font-medium truncate">{e.courseName || '—'}</span>
                                {e.courseLevel && (
                                  <span className="text-[10px] text-orange-500 shrink-0">{e.courseLevel}</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px] text-gray-500 ml-4">
                                {e.teacherName && (
                                  <span className="flex items-center gap-0.5">
                                    <GraduationCap className="w-3 h-3" />{e.teacherName}
                                  </span>
                                )}
                                {slotLabel && (
                                  <span className="flex items-center gap-0.5 text-purple-600">
                                    <CalendarDays className="w-3 h-3" />{slotLabel} {e.slot?.time}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-medium text-gray-600 shrink-0">
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[e.status]}`} />
                              {STATUS_LABELS[e.status]}
                            </span>
                          </div>

                          {/* Stamps progress per enrollment */}
                          {(capacity > 0 || attended > 0) && (
                            <div className="ml-4 mt-1.5 flex items-center gap-2">
                              <span className="flex items-center gap-1 text-[10px] font-medium text-amber-700 shrink-0">
                                <Stamp className="w-3 h-3" />
                                {attended}{capacity > 0 ? ` / ${capacity}` : ''}
                              </span>
                              {capacity > 0 && capacity <= 24 ? (
                                <div className="flex flex-wrap gap-0.5">
                                  {Array.from({ length: capacity }).map((_, i) => (
                                    <span
                                      key={i}
                                      className={[
                                        'w-2 h-2 rounded-full border',
                                        i < attended
                                          ? 'bg-amber-400 border-amber-500'
                                          : 'bg-white border-gray-300',
                                      ].join(' ')}
                                    />
                                  ))}
                                </div>
                              ) : capacity > 0 ? (
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-[120px]">
                                  <div
                                    className="h-full bg-amber-400 transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => { if (!o) setPendingDelete(null) }}
        itemType="student"
        itemName={
          pendingDelete
            ? (pendingDelete.nickname
                ? `${pendingDelete.name} (${pendingDelete.nickname})`
                : pendingDelete.name)
            : ''
        }
        confirmPhrase={pendingDelete?.name ?? ''}
        consequences={[
          'The student record will be removed from the database',
          'Their enrollments and slot assignments will be lost',
          'Past attendance entries will become orphaned (the student name remains in session history)',
        ]}
        onConfirm={async () => {
          if (pendingDelete) await handleDelete(pendingDelete)
        }}
        destructiveLabel="Delete student"
      />
    </div>
  )
}
