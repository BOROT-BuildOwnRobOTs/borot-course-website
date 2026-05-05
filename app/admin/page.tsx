'use client'

import { useState, useEffect } from 'react'
import {
  Users, GraduationCap, BookOpen, CalendarDays, Shield, LogOut, Eye, EyeOff,
  MessageSquare, FlaskConical, RefreshCw, CheckCircle, XCircle, Box, Printer,
  LayoutDashboard, Home, ArrowUpRight, Sparkles,
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
import ParentsTab from './components/ParentsTab'
import TeachersTab from './components/TeachersTab'
import CoursesTab from './components/CoursesTab'
import SessionsTab from './components/SessionsTab'
import FeedbackTab from './components/FeedbackTab'
import TrialClassTab from './components/TrialClassTab'
import ParentViewSimulatorTab from './components/ParentViewSimulatorTab'
import OrdersTab from './components/OrdersTab'
import PrintQueueTab from './components/PrintQueueTab'

type ViewId =
  | 'overview'
  | 'parents'
  | 'teachers'
  | 'courses'
  | 'sessions'
  | 'feedback'
  | 'print-orders'
  | 'print-queue'
  | 'trial-class'
  | 'parent-view'

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
]

const FLAT_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items)

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)

  // SECURITY (phase 2 — must fix before processing real payments via /print):
  // Hardcoded credentials + sessionStorage flag is acceptable for the course CMS,
  // but the 3D-print order flow handles money. Replace with Clerk-gated admin
  // role check (see middleware.ts) and remove this client-side auth before launch.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'admin' && password === 'admin') {
      sessionStorage.setItem('admin_auth', '1')
      onLogin()
    } else {
      setError('Incorrect username or password')
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
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
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError('') }}
                placeholder="Enter username"
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
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
            >
              Sign In
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
    { id: 'parents',  label: 'Students', value: stats.students, icon: Users,         accent: 'from-sky-500 to-sky-400',         bg: 'bg-sky-50',      text: 'text-sky-600' },
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

// ─── Main Admin Page ────────────────────────────────────────────────────────
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [stats, setStats] = useState<Stats>({ parents: 0, students: 0, teachers: 0, courses: 0, sessions: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const [activeView, setActiveView] = useState<ViewId>('overview')
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')

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

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    setIsAuthenticated(auth === '1')
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    const fetchStats = async () => {
      setStatsLoading(true)
      try {
        const [pRes, sRes, tRes, cRes, sessRes] = await Promise.all([
          fetch('/api/admin/parents'),
          fetch('/api/admin/students'),
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
  }, [isAuthenticated])

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth')
    setIsAuthenticated(false)
  }

  if (isAuthenticated === null) return null
  if (!isAuthenticated) return <LoginScreen onLogin={() => setIsAuthenticated(true)} />

  const activeItem = FLAT_NAV.find((i) => i.id === activeView) ?? FLAT_NAV[0]

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
          {NAV_GROUPS.map((group) => (
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
              <SidebarMenuButton
                onClick={handleLogout}
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
            {activeView === 'teachers'     && <TeachersTab />}
            {activeView === 'courses'      && <CoursesTab />}
            {activeView === 'sessions'     && <SessionsTab />}
            {activeView === 'feedback'     && <FeedbackTab />}
            {activeView === 'trial-class'  && <TrialClassTab />}
            {activeView === 'parent-view'  && <ParentViewSimulatorTab />}
            {activeView === 'print-orders' && <OrdersTab />}
            {activeView === 'print-queue'  && <PrintQueueTab />}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
