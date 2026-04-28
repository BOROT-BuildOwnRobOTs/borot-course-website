'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'

interface Course {
  _id: string
  name: string
  description: string
  level: string
  durationWeeks: number
  hours: number
  createdAt: string
}

// ──────────────────────────────────────────────
// Course catalogue – program → levels
// ──────────────────────────────────────────────
const COURSE_CATALOGUE: Record<string, string[]> = {
  'Robogenesis': [
    'Basic Create (Design 3D)',
    'PRE-INTERMEDIATE POWER (CIRCUITS)',
    'INTERMEDIATE CONTROL (Programming)',
  ],
  'Little 3D Inventors Series': [
    'Level #1 – Little 3D Inventors (Basic)',
    'Level #2 – Little 3D Inventors (Pro)',
    'Level #3 – Little 3D Inventors (Advanced)',
  ],
  'RoboJourney: From Discovery to Mission': [
    'Level #1 – Junior Robotics Discovery (Lego Wedo)',
    'Level #2 – Junior Robotics Challenge (Lego Wedo)',
    'Level #3 – Master Robotics Adventure (Lego Spike Prime)',
    'Level #4 – Master Robotics Mission (Lego Spike Prime)',
  ],
}

const PROGRAM_NAMES = Object.keys(COURSE_CATALOGUE)

export default function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editCourse, setEditCourse] = useState<Course | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    level: '',
    durationWeeks: 0,
    hours: 0,
  })
  const [saving, setSaving] = useState(false)

  const fetchCourses = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/courses')
    const json = await res.json()
    if (json.success) setCourses(json.data)
    setLoading(false)
  }

  useEffect(() => { fetchCourses() }, [])

  const openAdd = () => {
    setEditCourse(null)
    setForm({ name: '', description: '', level: '', durationWeeks: 0, hours: 0 })
    setDialogOpen(true)
  }

  const openEdit = (c: Course) => {
    setEditCourse(c)
    setForm({ name: c.name, description: c.description, level: c.level, durationWeeks: c.durationWeeks, hours: c.hours ?? 0 })
    setDialogOpen(true)
  }

  // When program changes, reset level
  const handleProgramChange = (value: string) => {
    setForm({ ...form, name: value, level: '' })
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.level.trim()) return
    setSaving(true)
    try {
      if (editCourse) {
        await fetch(`/api/admin/courses/${editCourse._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        await fetch('/api/admin/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      setDialogOpen(false)
      fetchCourses()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
    fetchCourses()
  }

  // Available levels for the currently selected program
  const availableLevels = form.name ? COURSE_CATALOGUE[form.name] ?? [] : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">All Courses ({courses.length})</h2>
        <Button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Course
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No courses yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Card key={c._id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">{c.name} ({c.hours ?? 0} hrs, {c.durationWeeks ?? 0} wks)</CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs text-orange-600 border-orange-300">
                      {c.level}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c._id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {c.description && <p className="text-sm text-gray-500 mb-2">{c.description}</p>}
                {c.durationWeeks > 0 && (
                  <p className="text-xs text-gray-400">{c.durationWeeks} weeks</p>
                )}
                <p className="text-xs text-gray-400">{c.hours ?? 0} hours</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">

            {/* ── Program dropdown ── */}
            <div>
              <Label>Program / Course *</Label>
              <Select value={form.name} onValueChange={handleProgramChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAM_NAMES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Level dropdown (shown only when program is selected) ── */}
            {form.name && (
              <div>
                <Label>Level *</Label>
                <Select
                  value={form.level}
                  onValueChange={(value) => setForm({ ...form, level: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLevels.map((lv) => (
                      <SelectItem key={lv} value={lv}>{lv}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ── Duration ── */}
            <div>
              <Label>Duration (weeks)</Label>
              <Input
                type="number"
                value={form.durationWeeks}
                onChange={(e) => setForm({ ...form, durationWeeks: Number(e.target.value) })}
              />
            </div>

            {/* ── Hours ── */}
            <div>
              <Label>Total Hours</Label>
              <Input
                type="number"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
              />
            </div>

            {/* ── Description ── */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name || !form.level}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}