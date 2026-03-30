'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Trash2, Pencil, Search, Clock, Phone, Baby, BookOpen,
  AlertTriangle, Loader2, Users, ImageIcon, ChevronDown, ChevronUp,
  FlaskConical, RefreshCw,
} from 'lucide-react'
import { TRIAL_SLOTS } from '@/lib/slots'

interface TrialRegistration {
  _id: string
  studentName: string
  age: number
  phone: string
  courseName: string
  slipUrl: string
  paymentMethod?: 'cash' | 'transfer'
  slotId: string
  slotTime: string
  trialDate: string          // YYYY-MM-DD
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Pending',
  confirmed: '✅ Confirmed',
  cancelled: '❌ Cancelled',
}

export default function TrialClassTab() {
  const [registrations, setRegistrations] = useState<TrialRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')
  const [slotFilter, setSlotFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<TrialRegistration | null>(null)
  const [editForm, setEditForm] = useState({
    studentName: '',
    age: '',
    phone: '',
    courseName: '',
    slotId: '',
    trialDate: '',
    status: 'pending' as string,
  })
  const [saving, setSaving] = useState(false)

  // Delete all dialog
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [clearing, setClearing] = useState(false)

  // Slip preview dialog
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null)

  // Expanded slots for grouping view
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'list' | 'bySlot'>('bySlot')

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/trial-registrations')
      const json = await res.json()
      if (json.success) {
        setRegistrations(json.data)
      }
    } catch (error) {
      console.error('Failed to fetch trial registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  // Filter registrations
  const filtered = registrations.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (slotFilter !== 'all' && r.slotId !== slotFilter) return false
    if (dateFilter && r.trialDate !== dateFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.courseName.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Group by slot
  const slotGroups = TRIAL_SLOTS.map((slot) => {
    const items = filtered.filter((r) => r.slotId === slot.id)
    return { ...slot, items }
  }).filter((g) => g.items.length > 0)

  // Stats
  const totalCount = registrations.length
  const pendingCount = registrations.filter((r) => r.status === 'pending').length
  const confirmedCount = registrations.filter((r) => r.status === 'confirmed').length
  const cancelledCount = registrations.filter((r) => r.status === 'cancelled').length

  // ── Handlers ──
  const openEdit = (r: TrialRegistration) => {
    setEditItem(r)
    setEditForm({
      studentName: r.studentName,
      age: r.age.toString(),
      phone: r.phone,
      courseName: r.courseName,
      slotId: r.slotId,
      trialDate: r.trialDate || '',
      status: r.status,
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editItem) return
    setSaving(true)
    try {
      const slot = TRIAL_SLOTS.find((s) => s.id === editForm.slotId)
      const res = await fetch(`/api/admin/trial-registrations/${editItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: editForm.studentName,
          age: Number(editForm.age),
          phone: editForm.phone,
          courseName: editForm.courseName,
          slotId: editForm.slotId,
          slotTime: slot?.time || editItem.slotTime,
          trialDate: editForm.trialDate,
          status: editForm.status,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setEditDialogOpen(false)
        fetchRegistrations()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this Trial Class registration?')) return
    try {
      await fetch(`/api/admin/trial-registrations/${id}`, { method: 'DELETE' })
      fetchRegistrations()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleClearAll = async () => {
    setClearing(true)
    try {
      await fetch('/api/admin/trial-registrations', { method: 'DELETE' })
      setClearDialogOpen(false)
      fetchRegistrations()
    } finally {
      setClearing(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/trial-registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchRegistrations()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const toggleSlotExpand = (slotId: string) => {
    setExpandedSlots((prev) => {
      const next = new Set(prev)
      if (next.has(slotId)) next.delete(slotId)
      else next.add(slotId)
      return next
    })
  }

  const expandAll = () => {
    setExpandedSlots(new Set(slotGroups.map((g) => g.id)))
  }

  const collapseAll = () => {
    setExpandedSlots(new Set())
  }

  // Registration card component
  const RegistrationCard = ({ r }: { r: TrialRegistration }) => (
    <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
      {/* Left: Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-gray-800">{r.studentName}</span>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[r.status]}`}>
            {STATUS_LABELS[r.status]}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Baby className="w-3 h-3" /> {r.age} yrs
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Phone className="w-3 h-3" /> {r.phone}
          </span>
          <span className="flex items-center gap-1 text-xs text-blue-600">
            <BookOpen className="w-3 h-3" /> {r.courseName}
          </span>
          <span className="flex items-center gap-1 text-xs text-purple-600">
            <Clock className="w-3 h-3" /> {r.slotTime}
          </span>
          {r.trialDate && (
            <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full font-medium">
              📅 {new Date(r.trialDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-gray-400">
            Registered: {new Date(r.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
            r.paymentMethod === 'cash'
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : 'bg-blue-50 text-blue-600 border-blue-200'
          }`}>
            {r.paymentMethod === 'cash' ? '💵 Cash' : '🏦 Transfer'}
          </span>
          {r.slipUrl && (
            <button
              onClick={() => setSlipPreviewUrl(r.slipUrl)}
              className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
            >
              <ImageIcon className="w-3 h-3" /> View Slip
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {/* Quick status change */}
        <Select value={r.status} onValueChange={(val) => handleStatusChange(r._id, val)}>
          <SelectTrigger className="h-6 w-auto border-0 p-0 text-xs focus:ring-0 shadow-none">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLORS[r.status]}`}>
              {r.status}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending" className="text-xs">⏳ Pending</SelectItem>
            <SelectItem value="confirmed" className="text-xs">✅ Confirmed</SelectItem>
            <SelectItem value="cancelled" className="text-xs">❌ Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => openEdit(r)}>
            <Pencil className="w-3 h-3 text-gray-400" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => handleDelete(r._id)}>
            <Trash2 className="w-3 h-3 text-red-400" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">
            Trial Class Registrations
          </h2>
          <Badge variant="secondary" className="text-xs">
            {totalCount} total
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRegistrations}
            disabled={loading}
            className="h-8 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setClearDialogOpen(true)}
            disabled={totalCount === 0}
            className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Clear All Data
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="border border-gray-200">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800 leading-none">{totalCount}</p>
              <p className="text-[10px] text-gray-400">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-yellow-200 bg-yellow-50/30">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-yellow-700 leading-none">{pendingCount}</p>
              <p className="text-[10px] text-gray-400">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-green-200 bg-green-50/30">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-green-700 leading-none">{confirmedCount}</p>
              <p className="text-[10px] text-gray-400">Confirmed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-red-200 bg-red-50/30">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-red-600 leading-none">{cancelledCount}</p>
              <p className="text-[10px] text-gray-400">Cancelled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search name, phone, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1">
          {(
            [
              { value: 'all', label: 'All', activeClass: 'bg-gray-600 text-white border-gray-600' },
              { value: 'pending', label: '⏳ Pending', activeClass: 'bg-yellow-500 text-white border-yellow-500' },
              { value: 'confirmed', label: '✅ Confirmed', activeClass: 'bg-green-500 text-white border-green-500' },
              { value: 'cancelled', label: '❌ Cancelled', activeClass: 'bg-red-500 text-white border-red-500' },
            ] as const
          ).map(({ value, label, activeClass }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={[
                'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                statusFilter === value
                  ? activeClass
                  : 'border-gray-200 text-gray-500 hover:border-gray-400',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-9 w-auto min-w-[150px] text-xs"
          placeholder="Select date"
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="text-xs text-red-500 hover:text-red-700 font-medium whitespace-nowrap"
          >
            ✕ Clear date
          </button>
        )}

        {/* Slot filter */}
        <Select value={slotFilter} onValueChange={setSlotFilter}>
          <SelectTrigger className="h-9 w-auto min-w-[140px] text-xs">
            <SelectValue placeholder="Select Slot" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Slots</SelectItem>
            {TRIAL_SLOTS.map((slot) => (
              <SelectItem key={slot.id} value={slot.id} className="text-xs">
                🕐 {slot.time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('bySlot')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'bySlot' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            By Slot
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-3" />
          <p className="text-sm">Loading data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {totalCount === 0 ? 'No Trial Class registrations yet' : 'No results matching your search'}
          </p>
        </div>
      ) : viewMode === 'bySlot' ? (
        /* ── By Slot View ── */
        <div className="space-y-2">
          {/* Expand/Collapse all buttons */}
          <div className="flex items-center gap-2 justify-end">
            <button onClick={expandAll} className="text-xs text-blue-500 hover:text-blue-700 font-medium">
              Expand All
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={collapseAll} className="text-xs text-blue-500 hover:text-blue-700 font-medium">
              Collapse All
            </button>
          </div>

          {slotGroups.map((group) => {
            const isExpanded = expandedSlots.has(group.id)
            const pendingInSlot = group.items.filter((i) => i.status === 'pending').length
            const confirmedInSlot = group.items.filter((i) => i.status === 'confirmed').length

            return (
              <Card key={group.id} className="border border-gray-200 overflow-hidden">
                {/* Slot Header */}
                <button
                  onClick={() => toggleSlotExpand(group.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-800">🧪 Slot {group.time}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-500">{group.items.length} students</span>
                        {pendingInSlot > 0 && (
                          <span className="text-[10px] text-yellow-600 bg-yellow-50 px-1.5 rounded-full border border-yellow-200">
                            ⏳ {pendingInSlot} pending
                          </span>
                        )}
                        {confirmedInSlot > 0 && (
                          <span className="text-[10px] text-green-600 bg-green-50 px-1.5 rounded-full border border-green-200">
                            ✅ {confirmedInSlot} confirmed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {group.items.length}/3
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Slot Content */}
                {isExpanded && (
                  <CardContent className="p-3 space-y-2 bg-gray-50/50">
                    {group.items.map((r) => (
                      <RegistrationCard key={r._id} r={r} />
                    ))}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        /* ── List View ── */
        <div className="space-y-2">
          {filtered.map((r) => (
            <RegistrationCard key={r._id} r={r} />
          ))}
        </div>
      )}

      {/* ── Edit Dialog ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Trial Registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student Name *</Label>
              <Input
                value={editForm.studentName}
                onChange={(e) => setEditForm({ ...editForm, studentName: e.target.value })}
                placeholder="Student name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Age *</Label>
                <Input
                  type="number"
                  min={3}
                  max={18}
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  placeholder="Age"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="0812345678"
                />
              </div>
            </div>
            <div>
              <Label>Course</Label>
              <Input
                value={editForm.courseName}
                onChange={(e) => setEditForm({ ...editForm, courseName: e.target.value })}
                placeholder="e.g. Lego Robot — Level 1"
              />
            </div>
            <div>
              <Label>Class Time Slot</Label>
              <Select value={editForm.slotId} onValueChange={(val) => setEditForm({ ...editForm, slotId: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Slot" />
                </SelectTrigger>
                <SelectContent>
                  {TRIAL_SLOTS.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id} className="text-sm">
                      🕐 {slot.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trial Date</Label>
              <Input
                type="date"
                value={editForm.trialDate}
                onChange={(e) => setEditForm({ ...editForm, trialDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(val) => setEditForm({ ...editForm, status: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending" className="text-sm">⏳ Pending</SelectItem>
                  <SelectItem value="confirmed" className="text-sm">✅ Confirmed</SelectItem>
                  <SelectItem value="cancelled" className="text-sm">❌ Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving || !editForm.studentName.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Clear All Dialog ── */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Clear All Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete all Trial Class Registration data?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-600 font-medium">
                ⚠️ This action cannot be undone. All data ({totalCount} records) will be permanently deleted.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleClearAll}
              disabled={clearing}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {clearing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete All
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Slip Preview Dialog ── */}
      <Dialog open={!!slipPreviewUrl} onOpenChange={() => setSlipPreviewUrl(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Slip</DialogTitle>
          </DialogHeader>
          {slipPreviewUrl && (
            <div className="flex justify-center">
              <img
                src={slipPreviewUrl}
                alt="Payment slip"
                className="max-h-[60vh] object-contain rounded-lg border border-gray-200"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
