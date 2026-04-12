"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader2,
  Users,
  UserPlus,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Plus,
  CheckCircle2,
  LogOut,
} from "lucide-react"

interface StudentForm {
  name: string
  nickname: string
  age: string
}

const EMPTY_STUDENT: StudentForm = { name: "", nickname: "", age: "" }

type SelectedRole = "teacher" | "parent" | null

export default function OnboardingPage() {
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerk()

  // Step: 1 = choose role, 2 = personal info, 3 = student info (parent only), 4 = done
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null)

  // Shared form
  const [name, setName] = useState(clerkUser?.fullName || "")
  const [phone, setPhone] = useState("")

  // Teacher-specific
  const [specialization, setSpecialization] = useState("")

  // Parent-specific: students
  const [students, setStudents] = useState<StudentForm[]>([{ ...EMPTY_STUDENT }])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const email = clerkUser?.primaryEmailAddress?.emailAddress || ""

  // ── Validation ──────────────────────────────────────────────
  const isStep2Valid = name.trim().length > 0
  const isStep3Valid = students.some((s) => s.name.trim().length > 0)

  // Total steps depends on role
  const totalSteps = selectedRole === "parent" ? 3 : 2

  // ── Student helpers ─────────────────────────────────────────
  const addStudent = () => setStudents((prev) => [...prev, { ...EMPTY_STUDENT }])
  const removeStudent = (idx: number) =>
    setStudents((prev) => prev.filter((_, i) => i !== idx))
  const updateStudent = (idx: number, field: keyof StudentForm, value: string) =>
    setStudents((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    )

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError("")
    setSubmitting(true)
    try {
      const payload: any = {
        role: selectedRole,
        name: name.trim(),
        email,
        phone: phone.trim(),
      }

      if (selectedRole === "teacher") {
        payload.specialization = specialization.trim()
      }

      if (selectedRole === "parent") {
        payload.students = students
          .filter((s) => s.name.trim())
          .map((s) => ({
            name: s.name.trim(),
            nickname: s.nickname.trim(),
            age: s.age ? Number(s.age) : undefined,
          }))
      }

      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const j = await res.json()
      if (j.success && j.user) {
        sessionStorage.setItem("borot_user", JSON.stringify(j.user))
        setStep(selectedRole === "parent" ? 4 : 3)
      } else {
        setError(j.error || "เกิดข้อผิดพลาด กรุณาลองใหม่")
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    sessionStorage.removeItem("borot_user")
    await signOut()
    router.push("/")
  }

  // ── Loading state ───────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // ── Step indicator ──────────────────────────────────────────
  const stepLabels =
    selectedRole === "parent"
      ? ["เลือกบทบาท", "ข้อมูลผู้ปกครอง", "ข้อมูลนักเรียน"]
      : ["เลือกบทบาท", "ข้อมูลครูผู้สอน"]

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {stepLabels.map((label, i) => {
        const s = i + 1
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            <span
              className={`text-sm hidden sm:inline ${
                step >= s ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < stepLabels.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 ${
                  step > s ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )

  // ── Success step ────────────────────────────────────────────
  const doneStep = selectedRole === "parent" ? 4 : 3
  if (step === doneStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-2 text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">ลงทะเบียนสำเร็จ! 🎉</CardTitle>
            <CardDescription className="text-base">
              ยินดีต้อนรับสู่ BOROT
              <br />
              คุณสามารถเริ่มใช้งานได้ทันที
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push("/profile")}
            >
              ไปหน้าโปรไฟล์
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-16 max-w-lg">
        {selectedRole && <StepIndicator />}

        {/* ── Step 1: Choose Role ─────────────────────────────── */}
        {step === 1 && (
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">ยินดีต้อนรับสู่ BOROT!</CardTitle>
              <CardDescription className="text-base">
                คุณต้องการสมัครในฐานะอะไร?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => {
                  setSelectedRole("parent")
                  setStep(2)
                }}
                className="w-full flex items-center gap-4 p-5 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left group"
              >
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Users className="h-7 w-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg group-hover:text-primary transition-colors">
                    ผู้ปกครอง (Parent)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    สมัครเพื่อจัดการข้อมูลนักเรียนและดูความก้าวหน้า
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedRole("teacher")
                  setStep(2)
                }}
                className="w-full flex items-center gap-4 p-5 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left group"
              >
                <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-7 w-7 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg group-hover:text-primary transition-colors">
                    ครูผู้สอน (Teacher)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    สมัครเพื่อจัดการคลาสเรียนและนักเรียน
                  </p>
                </div>
              </button>

              <div className="pt-2 text-center">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="gap-2 text-muted-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Step 2: Personal Info (Parent) ─────────────────── */}
        {step === 2 && selectedRole === "parent" && (
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <CardTitle className="text-xl">ข้อมูลผู้ปกครอง</CardTitle>
              <CardDescription>
                กรุณากรอกข้อมูลผู้ปกครองสำหรับบัญชีนี้
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  อีเมลจาก Clerk — ไม่สามารถแก้ไขได้
                </p>
              </div>

              <div>
                <Label htmlFor="name">ชื่อผู้ปกครอง *</Label>
                <Input
                  id="name"
                  placeholder="เช่น สมศรี ใจดี"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="phone"
                  placeholder="เช่น 081-234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep(1)
                    setSelectedRole(null)
                  }}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  ย้อนกลับ
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!isStep2Valid}
                  className="gap-2"
                >
                  ถัดไป
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Step 2: Personal Info (Teacher) ────────────────── */}
        {step === 2 && selectedRole === "teacher" && (
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-orange-600" />
              </div>
              <CardTitle className="text-xl">ข้อมูลครูผู้สอน</CardTitle>
              <CardDescription>
                กรุณากรอกข้อมูลของคุณสำหรับบัญชีครู
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  อีเมลจาก Clerk — ไม่สามารถแก้ไขได้
                </p>
              </div>

              <div>
                <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                <Input
                  id="name"
                  placeholder="เช่น อ.สมชาย รักเรียน"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="phone"
                  placeholder="เช่น 081-234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="specialization">ความเชี่ยวชาญ</Label>
                <Input
                  id="specialization"
                  placeholder="เช่น Robotics, Coding, Arduino"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep(1)
                    setSelectedRole(null)
                  }}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  ย้อนกลับ
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isStep2Valid || submitting}
                  className="gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      ลงทะเบียน
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Step 3: Student Info (Parent only) ─────────────── */}
        {step === 3 && selectedRole === "parent" && (
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <UserPlus className="h-7 w-7 text-green-600" />
              </div>
              <CardTitle className="text-xl">ข้อมูลนักเรียน</CardTitle>
              <CardDescription>
                เพิ่มข้อมูลนักเรียน (ลูกของคุณ) อย่างน้อย 1 คน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {students.map((s, idx) => (
                <div
                  key={idx}
                  className="border rounded-xl p-4 space-y-3 relative bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                      นักเรียนคนที่ {idx + 1}
                    </span>
                    {students.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStudent(idx)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label>ชื่อ-นามสกุล *</Label>
                    <Input
                      placeholder="เช่น ด.ช. สมชาย ใจดี"
                      value={s.name}
                      onChange={(e) => updateStudent(idx, "name", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>ชื่อเล่น</Label>
                      <Input
                        placeholder="เช่น เจมส์"
                        value={s.nickname}
                        onChange={(e) =>
                          updateStudent(idx, "nickname", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>อายุ (ปี)</Label>
                      <Input
                        type="number"
                        placeholder="เช่น 10"
                        value={s.age}
                        onChange={(e) =>
                          updateStudent(idx, "age", e.target.value)
                        }
                        min={1}
                        max={25}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addStudent}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                เพิ่มนักเรียนอีกคน
              </Button>

              {error && (
                <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  ย้อนกลับ
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isStep3Valid || submitting}
                  className="gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      ลงทะเบียน
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
