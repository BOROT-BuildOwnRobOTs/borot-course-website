'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Plus, Trash2, CalendarDays, Users, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Star, MessageSquare, Clock, Video, CalendarCheck,
} from 'lucide-react'
import { SLOTS } from '@/lib/slots'

const ADMIN_DAY_OPTIONS = [
  { value: "tuesday", label: "Tuesday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
]

interface Course {
  _id: string
  name: string
  level: string
}

interface Teacher {
  _id: string
  name: string
}

interface AttendanceEntry {
  student: string
  studentName: string
  checkedIn: boolean
  checkedInAt?: string
  feedback?: string
  rating?: number
  videoUrl?: string
}

interface Session {
  _id: string
  course: string
  courseName: string
  teacher: string
  teacherName: string
  scheduledAt: string
  topic: string
  notes?: string
  slot?: { day: string; time: string }
  attendance: AttendanceEntry[]
  createdAt: string
}

export default function SessionsTab() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  // Add session dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [form, setForm] = useState({
    courseId: '', teacherId: '', scheduledAt: '', topic: '', notes: '',
    slotDay: '', slotTime: '',
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Feedback dialog
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [feedbackSession, setFeedbackSession] = useState<Session | null>(null)
  const [feedbackEntry, setFeedbackEntry] = useState<AttendanceEntry | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackRating, setFeedbackRating] = useState<number>(0)
  const [feedbackVideo, setFeedbackVideo] = useState('')
  const [savingFeedback, setSavingFeedback] = useState(false)
  const [slotFilterDay, setSlotFilterDay] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    const [sessRes, crsRes, tchRes] = await Promise.all([
      fetch('/api/admin/sessions'),
      fetch('/api/admin/courses'),
      fetch('/api/admin/teachers'),
    ])
    const [sj, cj, tj] = await Promise.all([sessRes.json(), crsRes.json(), tchRes.json()])
    if (sj.success) setSessions(sj.data)
    if (cj.success) setCourses(cj.data)
    if (tj.success) setTeachers(tj.data)
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const handleAddSession = async () => {
    if (!form.courseId || !form.teacherId || !form.scheduledAt || !form.topic) {
      setFormError('Please fill in all required fields')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const course = courses.find(c => c._id === form.courseId)
      const teacher = teachers.find(t => t._id === form.teacherId)
      const body: Record<string, unknown> = {
        courseId: form.courseId,
        courseName: course?.name || '',
        teacherId: form.teacherId,
        teacherName: teacher?.name || '',
        scheduledAt: form.scheduledAt,
        topic: form.topic,
        notes: form.notes,
      }
      if (form.slotDay && form.slotTime) {
        body.slot = { day: form.slotDay, time: form.slotTime }
      }
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) { setFormError(json.error || 'An error occurred'); return }
      setAddDialogOpen(false)
      fetchAll()
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Delete this session?')) return
    await fetch(`/api/admin/sessions/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  const handleCheckIn = async (session: Session, entry: AttendanceEntry, checked: boolean) => {
    await fetch(`/api/admin/sessions/${session._id}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: entry.student, checkedIn: checked }),
    })
    fetchAll()
  }

  const openFeedback = (session: Session, entry: AttendanceEntry) => {
    setFeedbackSession(session)
    setFeedbackEntry(entry)
    setFeedbackText(entry.feedback || '')
    setFeedbackRating(entry.rating || 0)
    setFeedbackVideo(entry.videoUrl || '')
    setFeedbackDialogOpen(true)
  }

  const handleSaveFeedback = async () => {
    if (!feedbackSession || !feedbackEntry) return
    setSavingFeedback(true)
    try {
      await fetch(`/api/admin/sessions/${feedbackSession._id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: feedbackEntry.student,
          feedback: feedbackText,
          rating: feedbackRating || undefined,
          videoUrl: feedbackVideo,
        }),
      })
      setFeedbackDialogOpen(false)
      fetchAll()
    } finally {
      setSavingFeedback(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const getSlotLabel = (slot?: { day: string; time: string }) => {
    if (!slot) return null
    const found = SLOTS.find(s => s.day === slot.day && s.time === slot.time)
    return found ? `${found.dayLabel} ${found.time}` : `${slot.day} ${slot.time}`
  }

  // When slot day changes, auto-set a matching scheduledAt date
  const handleSlotDayChange = (day: string) => {
    setForm(f => {
      const dayNum = day === 'tuesday' ? 2 : day === 'friday' ? 5 : day === 'saturday' ? 6 : 0
      const today = new Date()
      const current = today.getDay()
      let diff = (dayNum - current + 7) % 7
      if (diff === 0) diff = 7
      const next = new Date(today)
      next.setDate(today.getDate() + diff)
      const dateStr = next.toISOString().slice(0, 10)
      // Keep existing time or set from slot
      const timePart = f.slotTime ? f.slotTime.split('-')[0] + ':00' : '10:00'
      return { ...f, slotDay: day, scheduledAt: `${dateStr}T${timePart}` }
    })
  }

  const handleSlotTimeChange = (time: string) => {
    setForm(f => {
      const startTime = time.split('-')[0] + ':00'
      const datePart = f.scheduledAt ? f.scheduledAt.slice(0, 10) : ''
      return { ...f, slotTime: time, scheduledAt: datePart ? `${datePart}T${startTime}` : f.scheduledAt }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Class Sessions ({sessions.length})</h2>
        <Button
          onClick={() => {
            setForm({ courseId: '', teacherId: '', scheduledAt: '', topic: '', notes: '', slotDay: '', slotTime: '' })
            setFormError('')
            setSlotFilterDay('')
            setAddDialogOpen(true)
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Session
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No sessions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const isExpanded = expandedSession === s._id
            const checkedInCount = s.attendance.filter(a => a.checkedIn).length
            const totalCount = s.attendance.length
            const slotLabel = getSlotLabel(s.slot)

            return (
              <Card key={s._id} className="border border-gray-200 overflow-hidden">
                <CardHeader className="pb-0 pt-4 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">{s.topic}</CardTitle>
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-300 shrink-0">
                          {s.courseName}
                        </Badge>
                        {slotLabel && (
                          <Badge variant="outline" className="text-xs text-purple-600 border-purple-300 shrink-0">
                            <CalendarCheck className="w-3 h-3 mr-1" />{slotLabel}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />{formatDate(s.scheduledAt)}
                        </span>
                        <span className="text-xs text-gray-500">Teacher: {s.teacherName}</span>
                        <span className="flex items-center gap-1 text-xs">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className={checkedInCount > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                            {checkedInCount}/{totalCount} checked in
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteSession(s._id)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setExpandedSession(isExpanded ? null : s._id)}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-3 pb-4 px-4">
                    {s.notes && (
                      <p className="text-sm text-gray-500 mb-3 italic">"{s.notes}"</p>
                    )}

                    {s.attendance.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No students in this course</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Student List</p>
                        {s.attendance.map((a) => (
                          <div
                            key={a.student}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                              a.checkedIn ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            {a.checkedIn
                              ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                              : <XCircle className="w-4 h-4 text-gray-300 shrink-0" />
                            }

                            <span className="text-sm font-medium text-gray-800 flex-1">{a.studentName}</span>

                            {a.checkedIn && a.checkedInAt && (
                              <span className="text-xs text-green-600">
                                {new Date(a.checkedInAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}

                            {a.rating && a.rating > 0 && (
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < (a.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                ))}
                              </div>
                            )}

                            {a.videoUrl && (
                              <span title="Has video">
                                <Video className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              </span>
                            )}

                            {a.feedback && (
                              <span title={a.feedback}>
                                <MessageSquare className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              </span>
                            )}

                            <div className="flex items-center gap-2 shrink-0">
                              <Switch
                                checked={a.checkedIn}
                                onCheckedChange={(checked) => handleCheckIn(s, a, checked)}
                                className="data-[state=checked]:bg-green-500 scale-75"
                              />
                              <Button
                                variant="ghost" size="sm"
                                className="h-6 px-2 text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => openFeedback(s, a)}
                              >
                                <MessageSquare className="w-3 h-3 mr-1" /> Feedback
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Session Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Class Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {formError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{formError}</p>}

            <div>
              <Label>Course *</Label>
              <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                <SelectTrigger className="h-auto min-h-10">
                  <SelectValue placeholder="Select a course...">
                    {form.courseId && (() => {
                      const selected = courses.find(c => c._id === form.courseId)
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
                  {courses.map(c => (
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

            <div>
              <Label>Teacher *</Label>
              <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Slot selection — Day first, then time */}
            <div>
              <Label>Slot Day (optional)</Label>
              <div className="relative mt-1.5">
                <select
                  value={slotFilterDay}
                  onChange={(e) => {
                    const newDay = e.target.value
                    setSlotFilterDay(newDay)
                    if (newDay !== form.slotDay) {
                      setForm(f => ({ ...f, slotDay: '', slotTime: '' }))
                    }
                    if (newDay) handleSlotDayChange(newDay)
                  }}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm font-medium focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all cursor-pointer"
                >
                  <option value="">— No slot —</option>
                  {ADMIN_DAY_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Time slots for selected day */}
            {slotFilterDay && (
              <div>
                <Label className="mb-2 block">
                  Select Time — <span className="text-purple-600 font-semibold">{ADMIN_DAY_OPTIONS.find(d => d.value === slotFilterDay)?.label}</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {SLOTS.filter(slot => slot.day === slotFilterDay).map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        if (form.slotDay === slot.day && form.slotTime === slot.time) {
                          setForm(f => ({ ...f, slotDay: '', slotTime: '' }))
                        } else {
                          handleSlotDayChange(slot.day)
                          handleSlotTimeChange(slot.time)
                          setForm(f => ({ ...f, slotDay: slot.day, slotTime: slot.time }))
                        }
                      }}
                      className={`text-center px-2 py-3 rounded-lg border text-xs transition-all ${
                        form.slotDay === slot.day && form.slotTime === slot.time
                          ? 'bg-purple-500 text-white border-purple-500 shadow-md'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="font-semibold text-sm">{slot.time}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Date & Time *</Label>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>

            <div>
              <Label>Topic *</Label>
              <Input
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="e.g. Introduction to Sensors"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSession} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
              {saving ? 'Saving...' : 'Create Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feedback — {feedbackEntry?.studentName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating (1–5 stars)</Label>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} onClick={() => setFeedbackRating(i + 1)}>
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        i < feedbackRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
                {feedbackRating > 0 && (
                  <button onClick={() => setFeedbackRating(0)} className="ml-2 text-xs text-gray-400 hover:text-red-400">
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div>
              <Label>Comments / Feedback</Label>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                placeholder="Write feedback for this student's session..."
                className="mt-1"
              />
            </div>

            <div>
              <Label className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-500" />
                Video Link (YouTube / Google Drive etc.)
              </Label>
              <Input
                value={feedbackVideo}
                onChange={(e) => setFeedbackVideo(e.target.value)}
                placeholder="https://youtube.com/..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFeedback} disabled={savingFeedback} className="bg-orange-500 hover:bg-orange-600 text-white">
              {savingFeedback ? 'Saving...' : 'Save Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}