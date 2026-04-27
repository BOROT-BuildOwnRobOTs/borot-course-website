"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, RefreshCcw, Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Error boundary for the /profile route.
 * Replaces the default blank "Application error: a client-side exception has occurred"
 * screen with a friendlier recovery UI when something inside the profile page throws.
 */
export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log to the browser console for diagnostics
    console.error("[profile/error]", error)
  }, [error])

  const handleClearAndReload = () => {
    try {
      sessionStorage.removeItem("borot_user")
      sessionStorage.removeItem("borot_legacy_login")
    } catch {
      /* ignore */
    }
    reset()
  }

  const handleSignOut = () => {
    try {
      sessionStorage.removeItem("borot_user")
      sessionStorage.removeItem("borot_legacy_login")
    } catch {
      /* ignore */
    }
    router.replace("/login")
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border-2 border-orange-100 rounded-2xl shadow-sm p-6 text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-orange-50 flex items-center justify-center">
          <AlertTriangle className="h-7 w-7 text-orange-500" />
        </div>

        <h1 className="text-xl font-bold mb-1">เกิดข้อผิดพลาดในหน้า Profile</h1>
        <p className="text-sm text-muted-foreground mb-4">
          ขออภัย หน้านี้โหลดไม่สำเร็จ ลองรีเซ็ตข้อมูลแล้วโหลดใหม่ดูได้นะครับ
        </p>

        {process.env.NODE_ENV !== "production" && error?.message && (
          <pre className="text-left text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg p-2 mb-4 overflow-auto max-h-40 whitespace-pre-wrap">
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={handleClearAndReload} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            รีเซ็ตและโหลดใหม่
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
            <Home className="h-4 w-4" />
            กลับหน้าแรก
          </Button>
          <Button variant="ghost" onClick={handleSignOut} className="gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            ออกจากระบบและล็อกอินใหม่
          </Button>
        </div>
      </div>
    </div>
  )
}
