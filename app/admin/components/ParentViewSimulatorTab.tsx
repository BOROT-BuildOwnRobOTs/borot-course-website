'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Eye, Mail, Phone, Search, Users, X, Loader2, ArrowLeft, Info,
} from 'lucide-react'
import ProfileHeader from '@/app/profile/components/ProfileHeader'
import ParentView from '@/app/profile/components/ParentView'
import type { UserData, SessionData, StudentData } from '@/app/profile/types'

interface ParentRecord {
  _id: string
  name: string
  email: string
  phone?: string
  createdAt?: string
}

export default function ParentViewSimulatorTab() {
  const [parents, setParents] = useState<ParentRecord[]>([])
  const [studentsMap, setStudentsMap] = useState<Record<string, StudentData[]>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [simUser, setSimUser] = useState<UserData | null>(null)
  const [simSessions, setSimSessions] = useState<SessionData[]>([])
  const [loadingSim, setLoadingSim] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)

  // Fetch all parents + students once
  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/admin/parents').then(r => r.json()),
      fetch('/api/admin/students').then(r => r.json()),
    ]).then(([pj, sj]) => {
      if (pj.success) setParents(pj.data)
      if (sj.success) {
        const map: Record<string, StudentData[]> = {}
        sj.data.forEach((s: any) => {
          if (!s.parent) return
          const pid = typeof s.parent === 'object' ? s.parent._id : s.parent
          if (!pid) return
          if (!map[pid]) map[pid] = []
          map[pid].push(s)
        })
        setStudentsMap(map)
      }
    }).finally(() => setLoading(false))
  }, [])

  // When a parent is selected, build a "fake" UserData and load sessions
  useEffect(() => {
    if (!selectedParentId) {
      setSimUser(null)
      setSimSessions([])
      return
    }

    const parent = parents.find(p => p._id === selectedParentId)
    if (!parent) return

    setLoadingSim(true)

    // Use the same parent students endpoint that the real ParentView uses
    fetch(`/api/parent/students?parentId=${selectedParentId}`)
      .then(r => r.json())
      .then(j => {
        const students: StudentData[] = j.success ? j.data : (studentsMap[selectedParentId] || [])
        const userData: UserData = {
          _id: parent._id,
          role: 'parent',
          name: parent.name,
          email: parent.email,
          phone: parent.phone,
          students,
        }
        setSimUser(userData)

        // Now fetch sessions for these students
        if (students.length > 0) {
          const ids = students.map(s => s._id).join(',')
          setLoadingSessions(true)
          fetch(`/api/parent/sessions?studentIds=${ids}`)
            .then(r => r.json())
            .then(sj => { if (sj.success) setSimSessions(sj.data) })
            .finally(() => setLoadingSessions(false))
        } else {
          setSimSessions([])
        }
      })
      .finally(() => setLoadingSim(false))
  }, [selectedParentId, parents, studentsMap])

  // Search filter
  const filteredParents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return parents
    return parents.filter(p => {
      if (p.name?.toLowerCase().includes(q)) return true
      if (p.email?.toLowerCase().includes(q)) return true
      if (p.phone?.toLowerCase().includes(q)) return true
      const children = studentsMap[p._id] || []
      return children.some(s =>
        s.name?.toLowerCase().includes(q) ||
        (s.nickname && s.nickname.toLowerCase().includes(q))
      )
    })
  }, [parents, studentsMap, searchQuery])

  // ── Detail view (simulating what parent sees) ─────────────────────────────
  if (selectedParentId) {
    return (
      <div className="space-y-4">
        {/* Top bar — clearly mark this as a simulated admin view */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setSelectedParentId(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Parent List
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
            <Eye className="w-3.5 h-3.5" />
            Admin Preview · Viewing as parent (read-only simulation)
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            This is exactly what the parent <strong>{simUser?.name || ''}</strong> sees when they log in.
            Dialogs (slot, reschedule, feedback) will work but any saves are persisted to the real account
            — please <em>do not click save</em> unless you intend to modify on behalf of this parent.
          </p>
        </div>

        {/* Render the actual ParentView with the simulated user */}
        {loadingSim || !simUser ? (
          <div className="py-16 flex items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading parent data…
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-blue-200 p-6">
            {/* Mimic the profile page container */}
            <div className="bg-gradient-to-br from-background via-background to-muted/10 -m-6 p-6 rounded-2xl">
              <ProfileHeader
                user={simUser}
                tierSessionCount={0}
                onLogout={() => { /* no-op in admin preview */ }}
              />
              <ParentView
                user={simUser}
                setUser={(u) => setSimUser(u)}
                sessions={simSessions}
                loadingSessions={loadingSessions}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── List view — pick a parent to simulate ─────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            Parent View Simulator
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Select any parent below to preview their profile page exactly as they see it.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {parents.length} parents
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by parent name, email, phone, or student name..."
          className="pl-9 pr-9 h-10 border-gray-200 focus-visible:ring-blue-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Result count */}
      {searchQuery.trim() && (
        <p className="text-xs text-gray-500">
          Found <span className="font-semibold text-gray-700">{filteredParents.length}</span> of {parents.length} parents
        </p>
      )}

      {/* Parents grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          Loading parents…
        </div>
      ) : filteredParents.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No parents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredParents.map((p) => {
            const children = studentsMap[p._id] || []
            const totalEnrollments = children.reduce(
              (sum, s) => sum + (s.enrollments?.length || 0), 0
            )
            const activeEnrollments = children.reduce(
              (sum, s) => sum + (s.enrollments?.filter((e: any) => e.status === 'active').length || 0), 0
            )

            return (
              <button
                key={p._id}
                onClick={() => setSelectedParentId(p._id)}
                className="text-left group"
              >
                <Card className="border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-11 h-11 shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                          {p.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{p.email}</span>
                        </div>
                        {p.phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{p.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-1 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-800 leading-none">{children.length}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Students</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-500 leading-none">{activeEnrollments}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Active</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-orange-500 leading-none">{totalEnrollments}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Total</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-3.5 h-3.5" />
                      Preview parent view
                    </div>
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
