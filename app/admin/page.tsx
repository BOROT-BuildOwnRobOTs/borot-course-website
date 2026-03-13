'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Users, GraduationCap, BookOpen, CalendarDays, Shield, LogOut, Eye, EyeOff, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import ParentsTab from './components/ParentsTab'
import TeachersTab from './components/TeachersTab'
import CoursesTab from './components/CoursesTab'
import SessionsTab from './components/SessionsTab'
import FeedbackTab from './components/FeedbackTab'

interface Stats {
  parents: number
  students: number
  teachers: number
  courses: number
  sessions: number
}

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 relative mb-3">
            <Image src="/images/borot-logo.png" alt="BOROT" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-1">BOROT Course Management</p>
        </div>

        {/* Card */}
        <div
          className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transition-all ${
            shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
          }`}
          style={
            shaking
              ? { animation: 'shake 0.4s ease-in-out' }
              : {}
          }
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-gray-700">Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError('') }}
                placeholder="Enter username"
                autoComplete="username"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Password
              </label>
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

            {/* Error */}
            {error && (
              <p className="text-red-500 text-xs text-center bg-red-50 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>

      {/* Shake keyframe */}
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

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [stats, setStats] = useState<Stats>({ parents: 0, students: 0, teachers: 0, courses: 0, sessions: 0 })

  // Check session on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    setIsAuthenticated(auth === '1')
  }, [])

  // Load stats after login
  useEffect(() => {
    if (!isAuthenticated) return
    const fetchStats = async () => {
      const [pRes, sRes, tRes, cRes, sessRes] = await Promise.all([
        fetch('/api/admin/parents'),
        fetch('/api/admin/students'),
        fetch('/api/admin/teachers'),
        fetch('/api/admin/courses'),
        fetch('/api/admin/sessions'),
      ])
      const [pj, sj, tj, cj, sessj] = await Promise.all([
        pRes.json(), sRes.json(), tRes.json(), cRes.json(), sessRes.json()
      ])
      setStats({
        parents: pj.success ? pj.data.length : 0,
        students: sj.success ? sj.data.length : 0,
        teachers: tj.success ? tj.data.length : 0,
        courses: cj.success ? cj.data.length : 0,
        sessions: sessj.success ? sessj.data.length : 0,
      })
    }
    fetchStats()
  }, [isAuthenticated])

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth')
    setIsAuthenticated(false)
  }

  // Still hydrating
  if (isAuthenticated === null) return null

  // Not logged in
  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />
  }

  const statCards = [
    { label: 'Parents', value: stats.parents, icon: Users, color: 'bg-orange-50 text-orange-500' },
    { label: 'Students', value: stats.students, icon: Users, color: 'bg-blue-50 text-blue-500' },
    { label: 'Teachers', value: stats.teachers, icon: GraduationCap, color: 'bg-green-50 text-green-500' },
    { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'bg-purple-50 text-purple-500' },
    { label: 'Sessions', value: stats.sessions, icon: CalendarDays, color: 'bg-pink-50 text-pink-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative">
              <Image src="/images/borot-logo.png" alt="BOROT" fill className="object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-gray-800">Admin Dashboard</span>
              </div>
              <p className="text-xs text-gray-400">BOROT Course Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back to Home
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors border border-red-100 hover:border-red-300 rounded-lg px-3 py-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {statCards.map((stat) => (
            <Card key={stat.label} className="border border-gray-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800 leading-none">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="parents" className="space-y-4">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg h-auto flex-wrap gap-1">
            <TabsTrigger
              value="parents"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-all"
            >
              <Users className="w-4 h-4 mr-1.5" />
              Parents & Students
            </TabsTrigger>
            <TabsTrigger
              value="teachers"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-all"
            >
              <GraduationCap className="w-4 h-4 mr-1.5" />
              Teachers
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-all"
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              Courses
            </TabsTrigger>
            <TabsTrigger
              value="sessions"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-all"
            >
              <CalendarDays className="w-4 h-4 mr-1.5" />
              Class Sessions
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-all"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Feedback Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parents" className="mt-0">
            <ParentsTab />
          </TabsContent>

          <TabsContent value="teachers" className="mt-0">
            <TeachersTab />
          </TabsContent>

          <TabsContent value="courses" className="mt-0">
            <CoursesTab />
          </TabsContent>

          <TabsContent value="sessions" className="mt-0">
            <SessionsTab />
          </TabsContent>

          <TabsContent value="feedback" className="mt-0">
            <FeedbackTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}