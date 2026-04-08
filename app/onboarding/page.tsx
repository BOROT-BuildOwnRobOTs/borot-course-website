"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Loader2,
  Home,
  UserCheck,
  Clock,
  RefreshCw,
  LogOut,
  CheckCircle2,
} from "lucide-react"

export default function OnboardingPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [status, setStatus] = useState<"loading" | "not_linked" | "linked">("loading")

  const checkLink = useCallback(async () => {
    setChecking(true)
    try {
      const res = await fetch("/api/auth/clerk-resolve")
      const json = await res.json()

      if (json.success) {
        // User is linked! Store data and redirect to profile
        sessionStorage.setItem("borot_user", JSON.stringify(json.user))
        setStatus("linked")
        setTimeout(() => router.replace("/profile"), 1500)
      } else if (json.error === "not_linked") {
        setStatus("not_linked")
      } else {
        setStatus("not_linked")
      }
    } catch {
      setStatus("not_linked")
    } finally {
      setChecking(false)
    }
  }, [router])

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace("/login")
      return
    }
    checkLink()
  }, [isLoaded, isSignedIn, router, checkLink])

  const handleSignOut = async () => {
    sessionStorage.removeItem("borot_user")
    await signOut()
    router.push("/")
  }

  // Loading state
  if (!isLoaded || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Linked - redirecting
  if (status === "linked") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto animate-bounce" />
          <h2 className="text-xl font-bold text-green-600">พบบัญชีของคุณแล้ว!</h2>
          <p className="text-muted-foreground">กำลังนำคุณไปยังโปรไฟล์...</p>
          <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
        </div>
      </div>
    )
  }

  // Not linked
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-20">
      <div className="container mx-auto max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/images/borot-kmutt-logo.png"
              alt="BOROT x KMUTT"
              width={140}
              height={48}
              className="h-12 w-auto object-contain mx-auto"
            />
          </Link>
        </div>

        <Card className="border-2 shadow-lg">
          <CardContent className="p-8 text-center space-y-6">
            {/* Welcome */}
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                <UserCheck className="h-8 w-8 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold">ยินดีต้อนรับ! 🎉</h1>
              {user && (
                <p className="text-muted-foreground">
                  สวัสดี{" "}
                  <span className="font-medium text-foreground">
                    {user.firstName || user.emailAddresses[0]?.emailAddress}
                  </span>
                </p>
              )}
            </div>

            {/* Status */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-amber-600">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">รอการผูกบัญชี</span>
              </div>
              <p className="text-sm text-amber-700">
                บัญชี Clerk ของคุณยังไม่ได้ผูกกับข้อมูลผู้ปกครองหรือครูในระบบ
                <br />
                กรุณาแจ้งแอดมินเพื่อผูกบัญชีให้ หรือรอแอดมินดำเนินการ
              </p>
            </div>

            {/* User info */}
            {user && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">อีเมล:</span>{" "}
                  <span className="font-medium">
                    {user.emailAddresses[0]?.emailAddress}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Clerk ID:</span>{" "}
                  <span className="font-mono text-xs">{user.id}</span>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={checkLink}
                disabled={checking}
                className="w-full gap-2"
                variant="default"
              >
                {checking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                ตรวจสอบอีกครั้ง
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  asChild
                >
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    กลับหน้าแรก
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="flex-1 gap-2 text-muted-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </Button>
              </div>
            </div>

            {/* Info footer */}
            <p className="text-xs text-muted-foreground pt-2">
              💡 หากคุณเป็นผู้ปกครอง ให้แจ้งอีเมลที่ใช้สมัคร Clerk ให้แอดมิน
              <br />
              แอดมินจะผูกบัญชีให้ แล้วกดปุ่ม &ldquo;ตรวจสอบอีกครั้ง&rdquo; ได้เลย
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
