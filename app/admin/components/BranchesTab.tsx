'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, Building2, MapPin, Phone } from 'lucide-react'
import { useBranchContext, BranchSummary } from './BranchContext'

interface BranchRecord extends BranchSummary {
  address?: string
  phone?: string
  note?: string
  createdAt?: string
}

const STATUS_LABELS: Record<BranchSummary['status'], string> = {
  active: 'Active',
  coming_soon: 'Coming Soon',
  closed: 'Closed',
}

const STATUS_COLORS: Record<BranchSummary['status'], string> = {
  active: 'bg-green-100 text-green-700',
  coming_soon: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-gray-200 text-gray-600',
}

export default function BranchesTab() {
  const { refreshBranches, session } = useBranchContext()
  const isSuper = session?.role === 'super'
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BranchRecord | null>(null)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    status: 'active' as BranchSummary['status'],
    address: '',
    phone: '',
    note: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/branches')
      const json = await res.json()
      if (json.success) setBranches(json.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', slug: '', status: 'active', address: '', phone: '', note: '' })
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (b: BranchRecord) => {
    setEditing(b)
    setForm({
      name: b.name,
      slug: b.slug,
      status: b.status,
      address: b.address || '',
      phone: b.phone || '',
      note: b.note || '',
    })
    setError('')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Branch name is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const url = editing ? `/api/admin/branches/${editing._id}` : '/api/admin/branches'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Save failed')
        return
      }
      setDialogOpen(false)
      await fetchAll()
      await refreshBranches()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (b: BranchRecord) => {
    if (!confirm(`Delete branch "${b.name}"?`)) return
    const res = await fetch(`/api/admin/branches/${b._id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!json.success) {
      alert(json.error || 'Delete failed')
      return
    }
    await fetchAll()
    await refreshBranches()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Branches ({branches.length})</h2>
        {isSuper && (
          <Button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Branch
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : branches.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No branches yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {branches.map((b) => (
            <Card key={b._id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800">{b.name}</p>
                        <Badge variant="secondary" className={`text-xs ${STATUS_COLORS[b.status]}`}>
                          {STATUS_LABELS[b.status]}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">slug: {b.slug}</p>
                      <div className="mt-2 space-y-0.5 text-xs text-gray-500">
                        {b.address && (
                          <p className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                            <span className="break-words">{b.address}</span>
                          </p>
                        )}
                        {b.phone && (
                          <p className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{b.phone}</span>
                          </p>
                        )}
                        {b.note && <p className="text-gray-400 italic">{b.note}</p>}
                      </div>
                    </div>
                  </div>
                  {isSuper && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>
                        <Pencil className="w-3.5 h-3.5 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(b)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Emquatier"
              />
            </div>
            {!editing && (
              <div>
                <Label>Slug (optional)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generated from name"
                />
              </div>
            )}
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as BranchSummary['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Branch address"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0812345678"
              />
            </div>
            <div>
              <Label>Note</Label>
              <Textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={2}
                placeholder="Internal note"
              />
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
    </div>
  )
}
