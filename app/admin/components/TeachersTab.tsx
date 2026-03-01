'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Pencil, Trash2, Mail, Phone, GraduationCap, Eye, EyeOff } from 'lucide-react'

interface Teacher {
  _id: string
  name: string
  email: string
  phone: string
  specialization: string
  createdAt: string
}

export default function TeachersTab() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', specialization: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const fetchTeachers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/teachers')
    const json = await res.json()
    if (json.success) setTeachers(json.data)
    setLoading(false)
  }

  useEffect(() => { fetchTeachers() }, [])

  const openAdd = () => {
    setEditTeacher(null)
    setForm({ name: '', email: '', password: '', phone: '', specialization: '' })
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (t: Teacher) => {
    setEditTeacher(t)
    setForm({ name: t.name, email: t.email, password: '', phone: t.phone, specialization: t.specialization })
    setError('')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return
    if (!editTeacher && !form.password.trim()) { setError('Please enter a password'); return }
    setSaving(true)
    setError('')
    try {
      const url = editTeacher ? `/api/admin/teachers/${editTeacher._id}` : '/api/admin/teachers'
      const method = editTeacher ? 'PUT' : 'POST'
      const body = editTeacher
        ? { name: form.name, email: form.email, phone: form.phone, specialization: form.specialization, ...(form.password ? { password: form.password } : {}) }
        : form
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!json.success) { setError(json.error || 'An error occurred'); return }
      setDialogOpen(false)
      fetchTeachers()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this teacher?')) return
    await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' })
    fetchTeachers()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">All Teachers ({teachers.length})</h2>
        <Button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Teacher
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No teachers yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((t) => (
            <Card key={t._id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 bg-orange-100">
                    <AvatarFallback className="text-orange-600 font-bold">
                      {t.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{t.name}</p>
                        {t.specialization && (
                          <p className="text-xs text-orange-500">{t.specialization}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                          <Pencil className="w-3.5 h-3.5 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(t._id)}>
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail className="w-3.5 h-3.5" /><span className="truncate">{t.email}</span>
                      </div>
                      {t.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone className="w-3.5 h-3.5" /><span>{t.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTeacher ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div>
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Teacher name" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="teacher@example.com" />
            </div>
            <div>
              <Label>{editTeacher ? 'Password (leave blank to keep unchanged)' : 'Password *'}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0812345678" />
            </div>
            <div>
              <Label>Specialization</Label>
              <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Robotics, Coding" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}