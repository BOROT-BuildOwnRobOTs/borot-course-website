"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, GraduationCap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mockup login - just redirect to profile
    router.push("/profile")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="h-12">
              <Image
                src="/images/borot-kmutt-logo.png"
                alt="BOROT x KMUTT"
                width={140}
                height={48}
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <GraduationCap className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Learning Portal</h1>
          </div>
          <p className="text-muted-foreground text-sm">เข้าสู่ระบบเพื่อดูความก้าวหน้าและผลงานของคุณ</p>
        </div>

        {/* Login Card */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">เข้าสู่ระบบ</CardTitle>
            <CardDescription className="text-center">กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  อีเมล
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  รหัสผ่าน
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-muted-foreground">จดจำฉันไว้</span>
                </label>
                <a href="#" className="text-primary hover:underline">
                  ลืมรหัสผ่าน?
                </a>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold">
                เข้าสู่ระบบ
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">หรือ</span>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                ยังไม่มีบัญชี?{" "}
                <a href="#" className="text-primary font-semibold hover:underline">
                  สมัครสมาชิก
                </a>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          การเข้าสู่ระบบแสดงว่าคุณยอมรับ{" "}
          <a href="#" className="text-primary hover:underline">
            เงื่อนไขการใช้งาน
          </a>{" "}
          และ{" "}
          <a href="#" className="text-primary hover:underline">
            นโยบายความเป็นส่วนตัว
          </a>
        </p>
      </div>
    </div>
  )
}
