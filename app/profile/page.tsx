"use client"

import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useProfileData } from "./hooks/useProfileData"
import ProfileHeader from "./components/ProfileHeader"
import TeacherView from "./components/TeacherView"
import ParentView from "./components/ParentView"

export default function ProfilePage() {
  const { signOut } = useClerk()
  const router = useRouter()
  const {
    user,
    setUser,
    loading,
    sessions,
    loadingSessions,
    tierSessionCount,
    setTierSessionCount,
    handleLogout,
  } = useProfileData()

  const handleFullLogout = async () => {
    handleLogout()
    try {
      await signOut()
    } catch {
      // Clerk sign out may fail if not signed in via Clerk — ignore
    }
    router.push("/")
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-24 max-w-5xl">

        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Profile Header */}
        <ProfileHeader
          user={user}
          tierSessionCount={tierSessionCount}
          onLogout={handleFullLogout}
        />

        {/* Teacher view */}
        {user.role === "teacher" && (
          <TeacherView user={user} onSessionCountLoaded={setTierSessionCount} />
        )}

        {/* Parent view */}
        {user.role === "parent" && (
          <ParentView
            user={user}
            setUser={setUser}
            sessions={sessions}
            loadingSessions={loadingSessions}
          />
        )}

      </div>
    </div>
  )
}