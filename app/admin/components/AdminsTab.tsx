'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Pencil, Trash2, ShieldCheck, Shield, Mail, Eye, EyeOff } from 'lucide-react'
import { useBranchContext, BranchSummary } from './BranchContext'
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog'

interface AdminRecord {
  _id: string
  name: string
  email: string
  role: 'super' | 'branch'
  branch: BranchSummary | null
  active: boolean
  createdAt?: string
}

export default function AdminsTab() {
  const { branches, session } = useBranchContext()
  const isSuper = session?.role === 'super'

  const [admins, setAdmins] = useState<AdminRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminRecord | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'branch' as 'super' | 'branch',
    branch: '',
    active: true,
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<AdminRecord | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/admins')
      const json = await res.json()
      if (json.success) setAdmins(json.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', email: '', password: '', role: 'branch', branch: '', active: true })
    setError('')
    setShowPassword(false)
    setDialogOpen(true)
  }

  const openEdit = (a: AdminRecord) => {
    setEditing(a)
    setForm({
      name: a.name,
      email: a.email,
      password: '',
      role: a.role,
      branch: a.branch?._id || '',
      active: a.active,
    })
    setError('')
    setShowPassword(false)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required')
      return
    }
    if (!editing && !form.password.trim()) {
      setError('Password is required')
      return
    }
    if (form.role === 'branch' && !form.branch) {
      setError('Branch admins must be assigned to a branch')
      return
    }

    setSaving(true)
    setError('')
    try {
      const url = editing ? `/api/admin/admins/${editing._id}` : '/api/admin/admins'
      const method = editing ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        role: form.role,
        branch: form.role === 'super' ? null : form.branch,
        active: form.active,
      }
      if (form.password) body.password = form.password
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Save failed')
        return
      }
      setDialogOpen(false)
      await fetchAll()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (a: AdminRecord) => {
    const res = await fetch(`/api/admin/admins/${a._id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!json.success) {
      alert(json.error || 'Delete failed')
      throw new Error(json.error || 'Delete failed')
    }
    await fetchAll()
  }

  if (!isSuper) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Only super admins can manage admins.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Admins ({admins.length})</h2>
        <Button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Admin
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        Branch admins log in with their email + password. Super admins see all branches; branch admins only see their own.
      </p>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : admins.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No admins yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {admins.map((a) => (
            <Card key={a._id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback
                        className={
                          a.role === 'super'
                            ? 'bg-purple-100 text-purple-600 font-bold'
                            : 'bg-orange-100 text-orange-600 font-bold'
                        }
                      >
                        {a.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800 truncate">{a.name}</p>
                        <Badge
                          variant="secondary"
                          className={
                            a.role === 'super'
                              ? 'text-xs bg-purple-100 text-purple-700'
                              : 'text-xs bg-orange-100 text-orange-700'
                          }
                        >
                          {a.role === 'super' ? 'Super' : 'Branch'}
                        </Badge>
                        {!a.active && (
                          <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-500">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{a.email}</span>
                      </p>
                      {a.branch ? (
                        <p className="text-xs text-orange-600 mt-1">Branch: {a.branch.name}</p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1">All branches</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>
                      <Pencil className="w-3.5 h-3.5 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPendingDelete(a)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </Button>
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
            <DialogTitle>{editing ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div>
              <Label>Full Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Admin name"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <Label>{editing ? 'Password (leave blank to keep)' : 'Password *'}</Label>
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
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as 'super' | 'branch', branch: v === 'super' ? '' : form.branch })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="branch">Branch admin</SelectItem>
                  <SelectItem value="super">Super admin (all branches)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.role === 'branch' && (
              <div>
                <Label>Branch *</Label>
                <Select value={form.branch} onValueChange={(v) => setForm({ ...form, branch: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b._id} value={b._id}>
                        {b.name} {b.status !== 'active' && <span className="text-gray-400">({b.status})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                id="adminActive"
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="adminActive" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => { if (!o) setPendingDelete(null) }}
        itemType="admin"
        itemName={pendingDelete?.email ?? ''}
        consequences={[
          'The admin user will lose access to the dashboard',
          'This cannot be reversed without re-creating the account',
        ]}
        onConfirm={async () => {
          if (pendingDelete) await handleDelete(pendingDelete)
        }}
        destructiveLabel="Delete admin"
      />
    </div>
  )
}
