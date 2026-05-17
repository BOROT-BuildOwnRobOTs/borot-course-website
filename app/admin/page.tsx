'use client'

import { useState, useEffect } from 'react'
import {
  Users, GraduationCap, BookOpen, CalendarDays, Shield, LogOut, Eye, EyeOff,
  MessageSquare, FlaskConical, RefreshCw, CheckCircle, XCircle, Box, Printer,
  LayoutDashboard, Home, ArrowUpRight, Sparkles, Building2, ShieldCheck,
  CloudUpload, Clock, ArrowRight, AlertTriangle, AlertCircle,
} from 'lucide-react'
import Image from 'next/image'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import ParentsTab from './components/ParentsTab'
import StudentsTab from './components/StudentsTab'
import TeachersTab from './components/TeachersTab'
import CoursesTab from './components/CoursesTab'
import SessionsTab from './components/SessionsTab'
import FeedbackTab from './components/FeedbackTab'
import TrialClassTab from './components/TrialClassTab'
import ParentViewSimulatorTab from './components/ParentViewSimulatorTab'
import OrdersTab from './components/OrdersTab'
import PrintQueueTab from './components/PrintQueueTab'
import BranchesTab from './components/BranchesTab'
import AdminsTab from './components/AdminsTab'
import { BranchProvider, useBranchContext, AdminSession } from './components/BranchContext'

type ViewId =
  | 'overview'
  | 'parents'
  | 'students'
  | 'teachers'
  | 'courses'
  | 'sessions'
  | 'feedback'
  | 'print-orders'
  | 'print-queue'
  | 'trial-class'
  | 'parent-view'
  | 'branches'
  | 'admins'

interface Stats {
  parents: number
  students: number
  teachers: number
  courses: number
  sessions: number
}

interface NavItem {
  id: ViewId
  label: string
  icon: typeof Users
  iconClass: string
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Dashboard',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard, iconClass: 'text-orange-500' },
    ],
  },
  {
    label: 'Course Management',
    items: [
      { id: 'parents', label: 'Parents & Students', icon: Users, iconClass: 'text-orange-500' },
      { id: 'students', label: 'Students', icon: Users, iconClass: 'text-sky-500' },
      { id: 'teachers', label: 'Teachers', icon: GraduationCap, iconClass: 'text-emerald-500' },
      { id: 'courses', label: 'Courses', icon: BookOpen, iconClass: 'text-purple-500' },
      { id: 'sessions', label: 'Class Sessions', icon: CalendarDays, iconClass: 'text-pink-500' },
      { id: 'feedback', label: 'Feedback', icon: MessageSquare, iconClass: 'text-sky-500' },
    ],
  },
  {
    label: '3D Printing',
    items: [
      { id: 'print-orders', label: 'Print Orders', icon: Box, iconClass: 'text-violet-500' },
      { id: 'print-queue', label: 'Print Queue', icon: Printer, iconClass: 'text-violet-500' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { id: 'trial-class', label: 'Trial Class', icon: FlaskConical, iconClass: 'text-blue-500' },
      { id: 'parent-view', label: 'Parent View', icon: Eye, iconClass: 'text-gray-500' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'branches', label: 'Branches', icon: Building2, iconClass: 'text-orange-500' },
      { id: 'admins', label: 'Admins', icon: ShieldCheck, iconClass: 'text-purple-500' },
    ],
  },
]

const FLAT_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items)

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (session: AdminSession) => void }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // SECURITY (phase 2 — must fix before processing real payments via /print):
  // sessionStorage flag is acceptable for the course CMS, but the 3D-print
  // order flow handles money. Move to a signed cookie + server-side check
  // before launch.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Incorrect email or password')
        setShaking(true)
        setTimeout(() => setShaking(false), 500)
        return
      }
      sessionStorage.setItem('admin_auth', '1')
      sessionStorage.setItem('admin_session', JSON.stringify(json.data))
      onLogin(json.data)
    } catch {
      setError('Login failed — please try again')
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 relative mb-3">
            <Image src="/images/borot-logo.png" alt="BOROT" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-1">BOROT Course Management</p>
        </div>

        <div
          className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transition-all ${
            shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
          }`}
          style={shaking ? { animation: 'shake 0.4s ease-in-out' } : {}}
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-gray-700">Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Email or Username</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError('') }}
                placeholder="admin@example.com หรือ admin"
                autoComplete="username"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm transition-all"
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

            {error && (
              <p className="text-red-500 text-xs text-center bg-red-50 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
            >
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}

// ─── Overview (Stats + Quick Actions) ───────────────────────────────────────
function OverviewView({
  stats,
  loading,
  onNavigate,
}: {
  stats: Stats
  loading: boolean
  onNavigate: (id: ViewId) => void
}) {
  const cards: {
    id: ViewId
    label: string
    value: number
    icon: typeof Users
    accent: string
    bg: string
    text: string
  }[] = [
    { id: 'parents',  label: 'Parents',  value: stats.parents,  icon: Users,         accent: 'from-orange-500 to-orange-400',   bg: 'bg-orange-50',   text: 'text-orange-600' },
    { id: 'students', label: 'Students', value: stats.students, icon: Users,         accent: 'from-sky-500 to-sky-400',         bg: 'bg-sky-50',      text: 'text-sky-600' },
    { id: 'teachers', label: 'Teachers', value: stats.teachers, icon: GraduationCap, accent: 'from-emerald-500 to-emerald-400', bg: 'bg-emerald-50',  text: 'text-emerald-600' },
    { id: 'courses',  label: 'Courses',  value: stats.courses,  icon: BookOpen,      accent: 'from-purple-500 to-purple-400',   bg: 'bg-purple-50',   text: 'text-purple-600' },
    { id: 'sessions', label: 'Sessions', value: stats.sessions, icon: CalendarDays,  accent: 'from-pink-500 to-pink-400',       bg: 'bg-pink-50',     text: 'text-pink-600' },
  ]

  const quickLinks: { id: ViewId; label: string; description: string; icon: typeof Box; accent: string }[] = [
    { id: 'print-orders', label: '3D Print Orders', description: 'Review submissions, quotes, and shipping', icon: Box,          accent: 'bg-violet-500' },
    { id: 'print-queue',  label: 'Print Queue',     description: 'Track which prints are running on each printer', icon: Printer, accent: 'bg-violet-500' },
    { id: 'trial-class',  label: 'Trial Class',     description: 'Manage upcoming trial bookings',           icon: FlaskConical, accent: 'bg-blue-500' },
    { id: 'parent-view',  label: 'Parent View',     description: 'Preview the dashboard a parent sees',      icon: Eye,          accent: 'bg-gray-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 p-6 text-white shadow-sm">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider opacity-90">Welcome back</span>
            </div>
            <h2 className="text-2xl font-bold">BOROT Admin Dashboard</h2>
            <p className="text-sm opacity-90 mt-1">
              เลือกหมวดที่ต้องการจัดการได้จากแถบด้านซ้าย หรือคลิกการ์ดด้านล่าง
            </p>
          </div>
          <div className="hidden sm:block w-20 h-20 relative opacity-90 shrink-0">
            <Image src="/images/borot-logo.png" alt="BOROT" fill className="object-contain" />
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* Stats grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">At a glance</h3>
          <span className="text-xs text-gray-400">Click a card to manage</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {cards.map((c) => (
            <button
              key={c.label}
              onClick={() => onNavigate(c.id)}
              className="group text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-2xl font-bold text-gray-800 leading-none">
                {loading ? <span className="inline-block w-8 h-6 bg-gray-100 rounded animate-pulse" /> : c.value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">{c.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((q) => (
            <button
              key={q.id}
              onClick={() => onNavigate(q.id)}
              className="group flex items-start gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-md transition-all text-left"
            >
              <div className={`w-10 h-10 rounded-lg ${q.accent} text-white flex items-center justify-center shrink-0`}>
                <q.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-gray-800 text-sm">{q.label}</p>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{q.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Branch selector for top bar ────────────────────────────────────────────
function BranchSelector() {
  const { branches, selectedBranchId, setSelectedBranchId, session } = useBranchContext()
  const isSuper = session?.role === 'super'

  if (!isSuper) {
    if (session?.branch) {
      return (
        <Badge variant="secondary" className="bg-orange-50 text-orange-600 border border-orange-200 gap-1">
          <Building2 className="w-3 h-3" />
          <span className="hidden sm:inline">Branch:</span>
          {session.branch.name}
        </Badge>
      )
    }
    return null
  }

  return (
    <Select value={selectedBranchId || '__all__'} onValueChange={(v) => setSelectedBranchId(v === '__all__' ? '' : v)}>
      <SelectTrigger className="h-8 text-xs gap-1.5 min-w-[150px]">
        <Building2 className="w-3.5 h-3.5 text-orange-500" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All branches</SelectItem>
        {branches.map((b) => (
          <SelectItem key={b._id} value={b._id}>
            {b.name}
            {b.status !== 'active' && <span className="text-gray-400 ml-1">({b.status === 'coming_soon' ? 'Soon' : b.status})</span>}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ─── Main Admin Page ────────────────────────────────────────────────────────
function AdminPageInner({ session, onLogout }: { session: AdminSession; onLogout: () => void }) {
  const { scopeQuery } = useBranchContext()
  const [stats, setStats] = useState<Stats>({ parents: 0, students: 0, teachers: 0, courses: 0, sessions: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const [activeView, setActiveView] = useState<ViewId>('overview')
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importStage, setImportStage] = useState<'confirm' | 'result'>('confirm')
  const [importResult, setImportResult] = useState<{
    attendanceUpdates: Array<{ studentName: string; nickname: string; courseName: string; courseLevel: string; date: string; hours: number }>
    leaveReschedules: Array<{ studentName: string; nickname: string; courseName: string; courseLevel: string; fromDate: string; toDate: string; cascadedCount: number }>
    moveReschedules: Array<{ studentName: string; nickname: string; courseName: string; courseLevel: string; fromDate: string; fromTime: string; toDate: string; toTime: string; cascadedCount?: number }>
    errors: string[]
    warnings: string[]
  } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const handleSyncSheet = async () => {
    setSyncing(true)
    setSyncStatus('idle')
    try {
      const res = await fetch('/api/admin/sync-sheet', { method: 'POST' })
      const j = await res.json()
      setSyncStatus(j.success ? 'success' : 'error')
    } catch {
      setSyncStatus('error')
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncStatus('idle'), 4000)
    }
  }

  const openImportDialog = () => {
    setImportStage('confirm')
    setImportResult(null)
    setImportError(null)
    setImportDialogOpen(true)
  }

  const runImport = async () => {
    setImporting(true)
    setImportStatus('idle')
    setImportError(null)
    try {
      const res = await fetch('/api/admin/sync-from-sheet', { method: 'POST' })
      const j = await res.json()
      if (!j.success) {
        setImportStatus('error')
        setImportError(j.error ?? 'Unknown error')
        setImportStage('result')
        return
      }
      setImportResult({
        attendanceUpdates: j.attendanceUpdates ?? [],
        leaveReschedules: j.leaveReschedules ?? [],
        moveReschedules: j.moveReschedules ?? [],
        errors: j.errors ?? [],
        warnings: j.warnings ?? [],
      })
      setImportStatus('success')
      setImportStage('result')
    } catch (e: any) {
      setImportStatus('error')
      setImportError(e?.message ?? String(e))
      setImportStage('result')
    } finally {
      setImporting(false)
      setTimeout(() => setImportStatus('idle'), 4000)
    }
  }

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true)
      try {
        const qs = scopeQuery ? `?${scopeQuery}` : ''
        const [pRes, sRes, tRes, cRes, sessRes] = await Promise.all([
          fetch(`/api/admin/parents${qs}`),
          fetch(`/api/admin/students${qs}`),
          fetch('/api/admin/teachers'),
          fetch('/api/admin/courses'),
          fetch('/api/admin/sessions'),
        ])
        const [pj, sj, tj, cj, sessj] = await Promise.all([
          pRes.json(), sRes.json(), tRes.json(), cRes.json(), sessRes.json(),
        ])
        setStats({
          parents:  pj.success    ? pj.data.length    : 0,
          students: sj.success    ? sj.data.length    : 0,
          teachers: tj.success    ? tj.data.length    : 0,
          courses:  cj.success    ? cj.data.length    : 0,
          sessions: sessj.success ? sessj.data.length : 0,
        })
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [scopeQuery])

  const NAV_VISIBLE = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      // Branch admins can't manage other admins.
      if (item.id === 'admins' && session.role !== 'super') return false
      return true
    }),
  })).filter((g) => g.items.length > 0)

  const FLAT_VISIBLE = NAV_VISIBLE.flatMap((g) => g.items)
  const activeItem = FLAT_VISIBLE.find((i) => i.id === activeView) ?? FLAT_VISIBLE[0]

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-gray-200">
        <SidebarHeader className="border-b border-gray-100">
          <div className="flex items-center gap-2.5 px-2 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
            <div className="w-8 h-8 relative shrink-0">
              <Image src="/images/borot-logo.png" alt="BOROT" fill className="object-contain" />
            </div>
            <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-bold text-gray-800">BOROT</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Admin Panel</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {NAV_VISIBLE.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = activeView === item.id
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.label}
                          onClick={() => setActiveView(item.id)}
                          className={
                            isActive
                              ? 'bg-orange-50 text-orange-600 hover:bg-orange-50 hover:text-orange-600 data-[active=true]:bg-orange-50 data-[active=true]:text-orange-600 font-medium'
                              : 'text-gray-600'
                          }
                        >
                          <item.icon className={isActive ? 'text-orange-500' : item.iconClass} />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-gray-100">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to Home">
                <a href="/" className="text-gray-600">
                  <Home />
                  <span>Back to Home</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="px-2 py-1.5 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-medium text-gray-700 truncate">{session.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{session.email}</p>
                <p className="text-[10px] text-orange-500 mt-0.5">
                  {session.role === 'super' ? 'Super admin' : `Branch: ${session.branch?.name ?? '—'}`}
                </p>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onLogout}
                tooltip="Sign Out"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-gray-50">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <SidebarTrigger className="text-gray-500 hover:text-gray-800" />
              <Separator orientation="vertical" className="mx-1 h-6 hidden sm:block" />
              <div className="flex items-center gap-2 min-w-0">
                <activeItem.icon className={`w-4 h-4 ${activeItem.iconClass} shrink-0`} />
                <h1 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                  {activeItem.label}
                </h1>
                {activeView === 'overview' && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-600 hover:bg-orange-100 text-[10px] hidden sm:inline-flex">
                    Dashboard
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <BranchSelector />
              <Button
                onClick={handleSyncSheet}
                disabled={syncing}
                variant="outline"
                size="sm"
                className={`gap-1.5 text-xs h-8 ${
                  syncStatus === 'success'
                    ? 'border-green-300 text-green-600 hover:text-green-700'
                    : syncStatus === 'error'
                    ? 'border-red-300 text-red-600 hover:text-red-700'
                    : 'border-green-200 text-green-600 hover:border-green-400 hover:bg-green-50'
                }`}
              >
                {syncing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : syncStatus === 'success' ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : syncStatus === 'error' ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {syncing
                    ? 'กำลัง Sync...'
                    : syncStatus === 'success'
                    ? 'Sync สำเร็จ!'
                    : syncStatus === 'error'
                    ? 'Sync ล้มเหลว'
                    : 'Sync Sheet'}
                </span>
              </Button>
              <Button
                onClick={openImportDialog}
                disabled={importing}
                variant="outline"
                size="sm"
                className={`gap-1.5 text-xs h-8 ${
                  importStatus === 'success'
                    ? 'border-blue-300 text-blue-600 hover:text-blue-700'
                    : importStatus === 'error'
                    ? 'border-red-300 text-red-600 hover:text-red-700'
                    : 'border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {importing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : importStatus === 'success' ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : importStatus === 'error' ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <CloudUpload className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {importing
                    ? 'กำลังอัปเดต...'
                    : importStatus === 'success'
                    ? 'อัปเดตสำเร็จ!'
                    : importStatus === 'error'
                    ? 'อัปเดตล้มเหลว'
                    : 'Sync to Web'}
                </span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {activeView === 'overview' && (
              <OverviewView stats={stats} loading={statsLoading} onNavigate={setActiveView} />
            )}
            {activeView === 'parents'      && <ParentsTab />}
            {activeView === 'students'     && <StudentsTab />}
            {activeView === 'teachers'     && <TeachersTab />}
            {activeView === 'courses'      && <CoursesTab />}
            {activeView === 'sessions'     && <SessionsTab />}
            {activeView === 'feedback'     && <FeedbackTab />}
            {activeView === 'trial-class'  && <TrialClassTab />}
            {activeView === 'parent-view'  && <ParentViewSimulatorTab />}
            {activeView === 'print-orders' && <OrdersTab />}
            {activeView === 'print-queue'  && <PrintQueueTab />}
            {activeView === 'branches'     && <BranchesTab />}
            {activeView === 'admins'       && session.role === 'super' && <AdminsTab />}
          </div>
        </main>
      </SidebarInset>

      <Dialog open={importDialogOpen} onOpenChange={(o) => { if (!importing) setImportDialogOpen(o) }}>
        <DialogContent className="sm:max-w-2xl">
          {importStage === 'confirm' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CloudUpload className="w-5 h-5 text-blue-600" />
                  Sync to Web — ยืนยันการอัปเดต
                </DialogTitle>
                <DialogDescription>
                  ระบบจะอ่านชีท "สัปดาห์นี้" และอัปเดตฐานข้อมูลตามแถวที่ติ๊กคอนเฟิร์มแล้วเท่านั้น
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-green-900">ติ๊กคอนเฟิร์ม + เข้าเรียนปกติ</p>
                      <p className="text-green-700/80 text-xs mt-0.5">บันทึกชั่วโมงเรียน + reschedule ถ้าเปลี่ยนวัน/เวลาในชีท</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-pink-200 bg-pink-50/50 p-3">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-pink-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-pink-900">ติ๊กคอนเฟิร์ม + ลา</p>
                      <p className="text-pink-700/80 text-xs mt-0.5">เลื่อนเรียนของคนนั้นออกไป 1 สัปดาห์</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportDialogOpen(false)} disabled={importing}>ยกเลิก</Button>
                <Button onClick={runImport} disabled={importing} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {importing ? <><RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> กำลังอัปเดต...</> : <>ยืนยัน</>}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {importError ? (
                    <><XCircle className="w-5 h-5 text-red-600" /> Sync to Web ล้มเหลว</>
                  ) : (
                    <><CheckCircle className="w-5 h-5 text-green-600" /> Sync to Web สำเร็จ</>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {importError
                    ? 'ไม่สามารถอัปเดตฐานข้อมูลจากชีทได้'
                    : 'อัปเดตเรียบร้อย — ชีทถูก refresh ใหม่แล้ว'}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-3">
                <div className="space-y-4 py-2">
                  {importError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {importError}
                    </div>
                  )}
                  {importResult && (
                    <>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-lg bg-green-50 border border-green-200 p-2">
                          <div className="text-2xl font-bold text-green-700">{importResult.attendanceUpdates.length}</div>
                          <div className="text-green-700/80">ชั่วโมงเรียน</div>
                        </div>
                        <div className="rounded-lg bg-pink-50 border border-pink-200 p-2">
                          <div className="text-2xl font-bold text-pink-700">{importResult.leaveReschedules.length}</div>
                          <div className="text-pink-700/80">เลื่อน (ลา)</div>
                        </div>
                        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-2">
                          <div className="text-2xl font-bold text-yellow-700">{importResult.moveReschedules.length}</div>
                          <div className="text-yellow-700/80">ปรับวัน/เวลา</div>
                        </div>
                      </div>

                      {importResult.attendanceUpdates.length > 0 && (
                        <section>
                          <h3 className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> บันทึกชั่วโมงเรียน
                          </h3>
                          <ul className="space-y-1.5">
                            {importResult.attendanceUpdates.map((r, i) => (
                              <li key={i} className="text-sm rounded-md bg-green-50/60 border border-green-100 px-3 py-1.5 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <span className="font-medium text-gray-900">{r.studentName}</span>
                                  {r.nickname && <span className="text-gray-500"> ({r.nickname})</span>}
                                  <span className="text-gray-500"> · {r.courseName}{r.courseLevel ? ` / ${r.courseLevel}` : ''}</span>
                                </div>
                                <div className="text-xs text-gray-600 shrink-0">
                                  {r.date} <span className="font-semibold text-green-700">{r.hours} ชม.</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {importResult.leaveReschedules.length > 0 && (
                        <section>
                          <h3 className="text-xs font-semibold text-pink-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> เลื่อนเรียน (ลา) — เลื่อนต่อเนื่องทั้งหมด
                          </h3>
                          <ul className="space-y-1.5">
                            {importResult.leaveReschedules.map((r, i) => (
                              <li key={i} className="text-sm rounded-md bg-pink-50/60 border border-pink-100 px-3 py-1.5">
                                <div className="font-medium text-gray-900">
                                  {r.studentName}{r.nickname && <span className="text-gray-500"> ({r.nickname})</span>}
                                  <span className="text-gray-500 font-normal"> · {r.courseName}{r.courseLevel ? ` / ${r.courseLevel}` : ''}</span>
                                </div>
                                <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                  <span>{r.fromDate}</span>
                                  <ArrowRight className="w-3 h-3 text-pink-500" />
                                  <span className="font-semibold text-pink-700">{r.toDate}</span>
                                  {r.cascadedCount > 1 && (
                                    <span className="text-pink-600/70 ml-1">
                                      (+ เลื่อนคาบที่เหลืออีก {r.cascadedCount - 1} คาบ)
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {importResult.moveReschedules.length > 0 && (
                        <section>
                          <h3 className="text-xs font-semibold text-yellow-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> ปรับวัน/เวลาเรียน
                          </h3>
                          <ul className="space-y-1.5">
                            {importResult.moveReschedules.map((r, i) => (
                              <li key={i} className="text-sm rounded-md bg-yellow-50/60 border border-yellow-100 px-3 py-1.5">
                                <div className="font-medium text-gray-900">
                                  {r.studentName}{r.nickname && <span className="text-gray-500"> ({r.nickname})</span>}
                                  <span className="text-gray-500 font-normal"> · {r.courseName}{r.courseLevel ? ` / ${r.courseLevel}` : ''}</span>
                                </div>
                                <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                  <span>{r.fromDate} {r.fromTime}</span>
                                  <ArrowRight className="w-3 h-3 text-yellow-600" />
                                  <span className="font-semibold text-yellow-800">{r.toDate} {r.toTime}</span>
                                  {r.cascadedCount && r.cascadedCount > 1 && (
                                    <span className="text-[11px] text-yellow-700 bg-yellow-100 border border-yellow-200 rounded px-1.5 py-0.5">
                                      (+ ย้ายวันคาบที่เหลืออีก {r.cascadedCount - 1} คาบ)
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {importResult.errors.length > 0 && (
                        <section>
                          <h3 className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" /> ข้อผิดพลาด
                          </h3>
                          <ul className="space-y-1">
                            {importResult.errors.map((e, i) => (
                              <li key={i} className="text-xs text-red-700 bg-red-50/60 border border-red-100 rounded px-2 py-1">{e}</li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {importResult.warnings.length > 0 && (
                        <section>
                          <h3 className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> คำเตือน
                          </h3>
                          <ul className="space-y-1">
                            {importResult.warnings.map((w, i) => (
                              <li key={i} className="text-xs text-orange-700 bg-orange-50/60 border border-orange-100 rounded px-2 py-1">{w}</li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {importResult.attendanceUpdates.length === 0 &&
                        importResult.leaveReschedules.length === 0 &&
                        importResult.moveReschedules.length === 0 &&
                        importResult.errors.length === 0 &&
                        importResult.warnings.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">ไม่มีแถวที่ติ๊กคอนเฟิร์ม — ไม่มีอะไรอัปเดต</p>
                        )}
                    </>
                  )}
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button onClick={() => setImportDialogOpen(false)}>ปิด</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

// ─── Page wrapper: handles auth + session bootstrapping ─────────────────────
export default function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    const raw = sessionStorage.getItem('admin_session')
    if (auth === '1' && raw) {
      try {
        setSession(JSON.parse(raw) as AdminSession)
      } catch {
        sessionStorage.removeItem('admin_auth')
        sessionStorage.removeItem('admin_session')
      }
    }
    setReady(true)
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth')
    sessionStorage.removeItem('admin_session')
    setSession(null)
  }

  if (!ready) return null
  if (!session) return <LoginScreen onLogin={(s) => setSession(s)} />

  return (
    <BranchProvider session={session}>
      <AdminPageInner session={session} onLogout={handleLogout} />
    </BranchProvider>
  )
}
