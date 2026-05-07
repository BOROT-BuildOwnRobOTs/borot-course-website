'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

export interface BranchSummary {
  _id: string
  name: string
  slug: string
  status: 'active' | 'coming_soon' | 'closed'
}

export interface AdminSession {
  _id: string
  name: string
  email: string
  role: 'super' | 'branch'
  branch: BranchSummary | null
}

interface BranchContextValue {
  branches: BranchSummary[]
  loading: boolean
  refreshBranches: () => Promise<void>
  /** Selected filter ID, '' = All branches (super admin only). */
  selectedBranchId: string
  setSelectedBranchId: (id: string) => void
  /** Convenience: the active branch object, or null when 'All'. */
  selectedBranch: BranchSummary | null
  /** True when a non-empty branch filter is active and APIs should pass ?branch=. */
  scopeQuery: string
  session: AdminSession | null
}

const BranchContext = createContext<BranchContextValue | null>(null)

const SELECTED_KEY = 'admin_selected_branch'

export function BranchProvider({ session, children }: { session: AdminSession | null; children: ReactNode }) {
  const [branches, setBranches] = useState<BranchSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBranchId, setSelectedBranchIdState] = useState('')

  const refreshBranches = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/branches')
      const json = await res.json()
      if (json.success) setBranches(json.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshBranches()
  }, [refreshBranches])

  // Initial selection: branch admins are locked to their branch; super admins
  // restore their last choice from localStorage, or default to the first
  // active branch so the dashboard isn't a "mixed all-branches" view by
  // accident. They can still switch to "All branches" explicitly.
  useEffect(() => {
    if (!session) return
    if (session.role === 'branch' && session.branch) {
      setSelectedBranchIdState(session.branch._id)
      return
    }
    if (branches.length === 0) return
    const stored = typeof window !== 'undefined' ? localStorage.getItem(SELECTED_KEY) : ''
    if (stored === '__all__') {
      setSelectedBranchIdState('')
      return
    }
    if (stored && branches.some((b) => b._id === stored)) {
      setSelectedBranchIdState(stored)
      return
    }
    const firstActive = branches.find((b) => b.status === 'active')
    if (firstActive) setSelectedBranchIdState(firstActive._id)
  }, [session, branches])

  const setSelectedBranchId = useCallback(
    (id: string) => {
      if (session?.role === 'branch') return // locked
      setSelectedBranchIdState(id)
      if (typeof window !== 'undefined') {
        // Use a distinct sentinel for "All branches" so we can tell it apart
        // from "no preference yet" on the next session restore.
        localStorage.setItem(SELECTED_KEY, id || '__all__')
      }
    },
    [session]
  )

  const selectedBranch = branches.find((b) => b._id === selectedBranchId) || null
  const scopeQuery = selectedBranchId ? `branch=${selectedBranchId}` : ''

  return (
    <BranchContext.Provider
      value={{
        branches,
        loading,
        refreshBranches,
        selectedBranchId,
        setSelectedBranchId,
        selectedBranch,
        scopeQuery,
        session,
      }}
    >
      {children}
    </BranchContext.Provider>
  )
}

export function useBranchContext() {
  const ctx = useContext(BranchContext)
  if (!ctx) throw new Error('useBranchContext must be used inside BranchProvider')
  return ctx
}
