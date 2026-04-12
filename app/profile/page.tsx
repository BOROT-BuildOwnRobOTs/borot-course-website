"use client"

import { useState } from "react"
import { Loader2, GraduationCap, Users, ArrowRightLeft, KeyRound } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Home } from "lucide-react"
import { useProfileData } from "./hooks/useProfileData"
import ProfileHeader from "./components/ProfileHeader"
import TeacherView from "./components/TeacherView"
import ParentView from "./components/ParentView"
import ClerkLinkBanner from "./components/ClerkLinkBanner"

export default function ProfilePage() {
  const {
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
  } = useProfileData()

  // Legacy Login Dialog state
  const [showLegacyDialog, setShowLegacyDialog] = useState(false)
  const [legacyEmail, setLegacyEmail] = useState("")
  const [legacyPassword, setLegacyPassword] = useState("")
  const [legacyLinkClerk, setLegacyLinkClerk] = useState(true)
  const [legacyLoading, setLegacyLoading] = useState(false)
  const [legacyError, setLegacyError] = useState("")

  const handleLegacyLogin = async () => {
    setLegacyError("")
    setLegacyLoading(true)
    const result = await legacyLogin(legacyEmail, legacyPassword, legacyLinkClerk)
    setLegacyLoading(false)
    if (result.success) {
      setShowLegacyDialog(false)
      setLegacyEmail("")
      setLegacyPassword("")
    } else {
      setLegacyError(result.error || "เกิดข้อผิดพลาด")
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // ── Account Selection (multiple accounts found) ─────────────────────────
  if (selectingAccount && accounts && accounts.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <div className="container mx-auto px-4 py-24 max-w-lg">
          {/* Back button */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="gap-2 -ml-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                กลับหน้าหลัก
              </Link>
            </Button>
          </div>

          <Card className="border-2">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">เลือกบัญชีที่ต้องการใช้งาน</CardTitle>
              <CardDescription>
                อีเมลนี้มีบัญชีหลายบทบาทในระบบ กรุณาเลือกบัญชีที่ต้องการ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {accounts.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => selectAccount(acc.role)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left group"
                >
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0 ${
                    acc.role === "teacher"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-blue-100 text-blue-600"
                  }`}>
                    {acc.role === "teacher" ? (
                      <GraduationCap className="h-7 w-7" />
                    ) : (
                      <Users className="h-7 w-7" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {acc.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {acc.role === "teacher" ? "บัญชีครูผู้สอน" : "บัญชีผู้ปกครอง"}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    acc.role === "teacher"
                      ? "bg-orange-50 text-orange-600 border border-orange-200"
                      : "bg-blue-50 text-blue-600 border border-blue-200"
                  }`}>
                    {acc.role === "teacher" ? "Teacher" : "Parent"}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── New User — Show Onboarding + Legacy Login option ─────────────────────
  if (isNewUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <div className="container mx-auto px-4 py-24 max-w-lg">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">ยินดีต้อนรับสู่ BOROT!</CardTitle>
              <CardDescription className="text-base">
                ยังไม่พบบัญชีในระบบสำหรับอีเมลนี้
                <br />
                กรุณาเลือกวิธีดำเนินการ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Option 1: New registration */}
              <Button asChild className="w-full" size="lg">
                <Link href="/onboarding">
                  เริ่มลงทะเบียนใหม่
                </Link>
              </Button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">
                    หรือ
                  </span>
                </div>
              </div>

              {/* Option 2: Legacy login */}
              <Button
                variant="outline"
                className="w-full gap-2"
                size="lg"
                onClick={() => setShowLegacyDialog(true)}
              >
                <KeyRound className="h-5 w-5" />
                เข้าสู่ระบบด้วยบัญชีเก่า
              </Button>

              <p className="text-xs text-center text-muted-foreground pt-1">
                สำหรับผู้ที่มีบัญชีอยู่แล้ว แต่ใช้อีเมลคนละตัวกับ Clerk
              </p>

              <Button variant="ghost" className="w-full" onClick={handleLogout}>
                ออกจากระบบ
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Legacy Login Dialog */}
        <Dialog open={showLegacyDialog} onOpenChange={setShowLegacyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                เข้าสู่ระบบด้วยบัญชีเก่า
              </DialogTitle>
              <DialogDescription>
                กรอก Email และ Password ที่เคยใช้ในระบบเดิม
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="legacy-email">Email</Label>
                <Input
                  id="legacy-email"
                  type="email"
                  placeholder="email@example.com"
                  value={legacyEmail}
                  onChange={(e) => setLegacyEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLegacyLogin()}
                />
              </div>

              <div>
                <Label htmlFor="legacy-password">Password</Label>
                <Input
                  id="legacy-password"
                  type="password"
                  placeholder="กรอก password"
                  value={legacyPassword}
                  onChange={(e) => setLegacyPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLegacyLogin()}
                />
              </div>

              {/* Link to Clerk checkbox */}
              <div className="flex items-start space-x-3 rounded-lg border p-3 bg-muted/30">
                <Checkbox
                  id="link-clerk"
                  checked={legacyLinkClerk}
                  onCheckedChange={(checked) => setLegacyLinkClerk(!!checked)}
                  className="mt-0.5"
                />
                <div className="grid gap-0.5 leading-none">
                  <label
                    htmlFor="link-clerk"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    เชื่อมบัญชีกับ Clerk ด้วย
                  </label>
                  <p className="text-xs text-muted-foreground">
                    ครั้งหน้า login ด้วย Clerk ได้เลย ไม่ต้องกรอก password อีก
                  </p>
                </div>
              </div>

              {legacyError && (
                <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-lg">
                  {legacyError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowLegacyDialog(false)}>
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleLegacyLogin}
                  disabled={!legacyEmail.trim() || !legacyPassword.trim() || legacyLoading}
                  className="gap-2"
                >
                  {legacyLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ── No user loaded ──────────────────────────────────────────────────────
  if (!user) {
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
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          {/* Switch account button — only show if user might have multiple roles */}
          {accounts && accounts.length > 1 && (
            <Button variant="outline" size="sm" onClick={switchAccount} className="gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              สลับบัญชี
            </Button>
          )}
        </div>

        {/* Clerk Link Banner — show when logged in via legacy but not linked */}
        {isLegacyLogin && user && (
          <ClerkLinkBanner
            userEmail={user.email}
            onLink={linkToClerk}
            onDismiss={dismissLegacyBanner}
          />
        )}

        {/* Profile Header */}
        <ProfileHeader
          user={user}
          tierSessionCount={tierSessionCount}
          onLogout={handleLogout}
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
