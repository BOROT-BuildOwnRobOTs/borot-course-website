"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserData, SessionData } from "../types"

export function useProfileData() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tierSessionCount, setTierSessionCount] = useState(0)

  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  // Load user from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem("borot_user")
    if (!raw) {
      router.replace("/login")
      return
    }
    try {
      const parsed = JSON.parse(raw)
      setUser(parsed)
    } catch {
      router.replace("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  // Re-fetch fresh student data from API (to get correct courseDurationWeeks etc.)
  useEffect(() => {
    if (!user || user.role !== "parent") return
    fetch(`/api/parent/students?parentId=${user._id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) {
          const updated = { ...user, students: j.data }
          sessionStorage.setItem("borot_user", JSON.stringify(updated))
          setUser(updated)
        }
      })
      .catch(() => {}) // silently fail, keep existing data
  }, [user?._id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch sessions for parent's students
  useEffect(() => {
    if (!user || user.role !== "parent" || !user.students?.length) return
    const ids = user.students.map((s) => s._id).join(",")
    setLoadingSessions(true)
    fetch(`/api/parent/sessions?studentIds=${ids}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setSessions(j.data) })
      .finally(() => setLoadingSessions(false))
  }, [user])

  const handleLogout = () => {
    sessionStorage.removeItem("borot_user")
    router.push("/")
  }

  return {
    user,
    setUser,
    loading,
    sessions,
    loadingSessions,
    tierSessionCount,
    setTierSessionCount,
    handleLogout,
  }
}
