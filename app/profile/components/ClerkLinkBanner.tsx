"use client"

import { useState } from "react"
import { Link2, X, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface ClerkLinkBannerProps {
  userEmail: string
  onLink: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  onDismiss: () => void
}

export default function ClerkLinkBanner({ userEmail, onLink, onDismiss }: ClerkLinkBannerProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(userEmail)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleLink = async () => {
    setError("")
    setLoading(true)
    const result = await onLink(email, password)
    setLoading(false)
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 2000)
    } else {
      setError(result.error || "เกิดข้อผิดพลาด")
    }
  }

  if (success && !open) return null

  return (
    <>
      {/* Banner */}
      <div className="relative mb-6 rounded-xl border-2 border-blue-200 bg-blue-50 p-4 dark:bg-blue-950/30 dark:border-blue-800">
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="ปิด"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
            <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-blue-900 dark:text-blue-100">
              เชื่อมบัญชีกับ Clerk
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">
              เชื่อมบัญชีเก่ากับ Clerk เพื่อให้ครั้งหน้า login ได้ง่ายขึ้น ไม่ต้องกรอก password อีก
            </p>
            <Button
              size="sm"
              className="mt-3 gap-2"
              onClick={() => setOpen(true)}
            >
              <Link2 className="h-4 w-4" />
              เชื่อมบัญชีตอนนี้
            </Button>
          </div>
        </div>
      </div>

      {/* Link Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              เชื่อมบัญชีกับ Clerk
            </DialogTitle>
            <DialogDescription>
              กรอก Email และ Password ของบัญชีเก่าเพื่อยืนยันตัวตนและเชื่อมบัญชี
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-green-700">เชื่อมบัญชีสำเร็จ!</p>
              <p className="text-sm text-muted-foreground mt-1">
                ครั้งหน้าคุณสามารถ login ด้วย Clerk ได้เลย
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="link-email">Email บัญชีเก่า</Label>
                <Input
                  id="link-email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="link-password">Password</Label>
                <Input
                  id="link-password"
                  type="password"
                  placeholder="กรอก password บัญชีเก่า"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleLink}
                  disabled={!email.trim() || !password.trim() || loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังเชื่อม...
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4" />
                      เชื่อมบัญชี
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
