"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { UserData, SessionData } from "../types"

export function useProfileData() {
  const router = useRouter()
  const { isLoaded: clerkLoaded, isSignedIn } = useUser()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tierSessionCount, setTierSessionCount] = useState(0)
  const resolvedRef = useRef(false) // prevent double-resolve

  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  // ── Load user: sessionStorage first, then Clerk resolve ──────────────────
  useEffect(() => {
    // Wait for Clerk to finish loading
    if (!clerkLoaded) return

    // 1. Try sessionStorage first (works for both old login and cached Clerk)
    const raw = sessionStorage.getItem("borot_user")
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setUser(parsed)
        setLoading(false)
        return
      } catch {
        sessionStorage.removeItem("borot_user")
      }
    }

    // 2. If signed in via Clerk but no sessionStorage, resolve from API
    if (isSignedIn && !resolvedRef.current) {
      resolvedRef.current = true
      fetch("/api/auth/clerk-resolve")
        .then((r) => r.json())
        .then((json) => {
          if (json.success && json.user) {
            // Store in sessionStorage for subsequent loads
            sessionStorage.setItem("borot_user", JSON.stringify(json.user))
            setUser(json.user)
            setLoading(false)
          } else if (json.error === "not_linked") {
            // Clerk user not linked to any Parent/Teacher → onboarding
            router.replace("/onboarding")
          } else {
            // Other error → back to login
            router.replace("/login")
          }
        })
        .catch(() => {
          router.replace("/login")
        })
      return
    }

    // 3. Not signed in at all → back to login
    if (!isSignedIn) {
      router.replace("/login")
      return
    }

    setLoading(false)
  }, [clerkLoaded, isSignedIn, router])

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

  const handleLogout = async () => {
    sessionStorage.removeItem("borot_user")
    // If the user is signed in via Clerk, sign out from Clerk too
    // (We don't call useClerk here — just clear sessionStorage and redirect)
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
