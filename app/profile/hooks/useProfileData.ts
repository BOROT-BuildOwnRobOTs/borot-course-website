"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { UserData, SessionData } from "../types"

export interface AccountOption {
  role: "teacher" | "parent"
  name: string
  email: string
}

/**
 * useProfileData
 *
 * Authentication note:
 *   We deliberately do NOT use Clerk's `useUser()` here. With Clerk
 *   production keys (custom Frontend API at clerk.borot.co.th), the
 *   client-side hook can briefly report `isSignedIn=false` while the
 *   FAPI is resolving the session — even though the server-side
 *   middleware/`auth()` already verified the cookie. That race condition
 *   was the root cause of the /profile <-> /login bounce loop.
 *
 *   Instead, the parent Server Component (`app/profile/page.tsx`) calls
 *   `auth()` + `currentUser()` and passes the verified `clerkUserId`
 *   and `clerkEmail` down as props. By the time this hook runs, those
 *   values are guaranteed to exist.
 */
export function useProfileData(clerkUserId: string, clerkEmail: string) {
  const router = useRouter()
  const { signOut } = useClerk()

  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tierSessionCount, setTierSessionCount] = useState(0)

  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  // Multiple-account selection state
  const [accounts, setAccounts] = useState<AccountOption[] | null>(null)
  const [selectingAccount, setSelectingAccount] = useState(false)

  // New user (no DB account) state
  const [isNewUser, setIsNewUser] = useState(false)

  // Legacy login state (user logged in with old email/password, may need to link Clerk)
  const [isLegacyLogin, setIsLegacyLogin] = useState(false)

  // Prevent duplicate sync calls
  const syncAttempted = useRef(false)

  // Load user: sessionStorage first, then DB sync (with Clerk data from props).
  useEffect(() => {
    // 1) Try sessionStorage first
    const raw = sessionStorage.getItem("borot_user")
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        // Validate shape — must have at minimum _id and role.
        // Old/stale data without these fields will crash render code, so
        // we treat it as invalid and fall through to a fresh sync.
        const isValid =
          parsed &&
          typeof parsed === "object" &&
          typeof parsed._id === "string" &&
          (parsed.role === "teacher" || parsed.role === "parent" || parsed.role === "admin")

        if (isValid) {
          setUser(parsed)
          // Check if this was a legacy login (no Clerk link yet)
          const legacyFlag = sessionStorage.getItem("borot_legacy_login")
          if (legacyFlag === "true") {
            setIsLegacyLogin(true)
          }
          setLoading(false)
          return
        }
        // Invalid shape — clear and fall through
        sessionStorage.removeItem("borot_user")
      } catch {
        sessionStorage.removeItem("borot_user")
      }
    }

    // 2) Sync with DB using verified Clerk data from server-side props
    if (!clerkEmail) {
      // No email on the Clerk user — we can't look up a DB account.
      // Treat as new user so they can complete onboarding.
      setIsNewUser(true)
      setLoading(false)
      return
    }

    if (syncAttempted.current) return // prevent double calls in StrictMode
    syncAttempted.current = true

    fetch("/api/auth/clerk-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: clerkEmail, clerkId: clerkUserId }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.multiple && j.accounts) {
          // Multiple accounts found — show account picker
          setAccounts(j.accounts)
          setSelectingAccount(true)
        } else if (j.success && j.user) {
          // Single account — proceed
          sessionStorage.setItem("borot_user", JSON.stringify(j.user))
          setUser(j.user)
        } else if (j.newUser) {
          // No account in DB — new user, show onboarding option
          setIsNewUser(true)
        } else {
          // Unexpected — log and stop loading; UI will show fallback
          console.error("[useProfileData] clerk-sync unexpected response", j)
        }
      })
      .catch((err) => {
        console.error("[useProfileData] clerk-sync failed", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [clerkUserId, clerkEmail])

  // Select a specific account (when multiple exist)
  const selectAccount = useCallback(
    async (role: "teacher" | "parent") => {
      if (!clerkEmail) return
      setSelectingAccount(false)
      setLoading(true)

      try {
        const res = await fetch("/api/auth/clerk-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: clerkEmail, selectRole: role, clerkId: clerkUserId }),
        })
        const j = await res.json()
        if (j.success && j.user) {
          sessionStorage.setItem("borot_user", JSON.stringify(j.user))
          setUser(j.user)
          // Keep accounts list so user can switch later
        }
      } catch {
        router.replace("/")
      } finally {
        setLoading(false)
      }
    },
    [clerkEmail, clerkUserId, router]
  )

  // Switch account — clear current session and go back to account picker
  const switchAccount = useCallback(() => {
    sessionStorage.removeItem("borot_user")
    sessionStorage.removeItem("borot_legacy_login")
    setUser(null)
    setIsLegacyLogin(false)
    syncAttempted.current = false
    setLoading(true)

    if (!clerkEmail) {
      setLoading(false)
      return
    }

    fetch("/api/auth/clerk-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: clerkEmail, clerkId: clerkUserId }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.multiple && j.accounts) {
          setAccounts(j.accounts)
          setSelectingAccount(true)
        } else if (j.success && j.user) {
          sessionStorage.setItem("borot_user", JSON.stringify(j.user))
          setUser(j.user)
        }
      })
      .finally(() => setLoading(false))
  }, [clerkEmail, clerkUserId])

  // Legacy login: authenticate with old email/password, optionally link Clerk
  const legacyLogin = useCallback(
    async (legacyEmail: string, password: string, linkClerk: boolean) => {
      try {
        const res = await fetch("/api/auth/link-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            legacyEmail,
            password,
            clerkId: linkClerk ? clerkUserId : undefined,
          }),
        })
        const j = await res.json()
        if (j.success && j.user) {
          sessionStorage.setItem("borot_user", JSON.stringify(j.user))
          setUser(j.user)
          setIsNewUser(false)

          if (!linkClerk || !j.linked) {
            // Mark as legacy login so we show the link banner
            sessionStorage.setItem("borot_legacy_login", "true")
            setIsLegacyLogin(true)
          } else {
            // Successfully linked — no banner needed
            sessionStorage.removeItem("borot_legacy_login")
            setIsLegacyLogin(false)
          }
          return { success: true }
        }
        return { success: false, error: j.error || "เกิดข้อผิดพลาด" }
      } catch {
        return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }
      }
    },
    [clerkUserId]
  )

  // Link existing DB account to Clerk (called from ClerkLinkBanner)
  const linkToClerk = useCallback(
    async (legacyEmail: string, password: string) => {
      if (!clerkUserId) return { success: false, error: "ไม่พบ Clerk user" }
      try {
        const res = await fetch("/api/auth/link-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ legacyEmail, password, clerkId: clerkUserId }),
        })
        const j = await res.json()
        if (j.success && j.linked) {
          sessionStorage.removeItem("borot_legacy_login")
          setIsLegacyLogin(false)
          return { success: true }
        }
        return { success: false, error: j.error || "เกิดข้อผิดพลาด" }
      } catch {
        return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }
      }
    },
    [clerkUserId]
  )

  // Dismiss legacy login banner
  const dismissLegacyBanner = useCallback(() => {
    sessionStorage.removeItem("borot_legacy_login")
    setIsLegacyLogin(false)
  }, [])

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
    sessionStorage.removeItem("borot_legacy_login")
    // Sign out from Clerk as well
    await signOut()
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
    // Multi-account
    accounts,
    selectingAccount,
    selectAccount,
    switchAccount,
    // New user onboarding
    isNewUser,
    // Legacy login
    isLegacyLogin,
    legacyLogin,
    linkToClerk,
    dismissLegacyBanner,
  }
}
