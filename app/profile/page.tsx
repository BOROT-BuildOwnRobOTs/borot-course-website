"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  GraduationCap,
  Home,
  LogOut,
  Mail,
  Medal,
  Star,
  Trophy,
  User,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const [editedUser, setEditedUser] = useState({
    name: "สมชาย ใจดี",
    email: "somchai@example.com",
    school: "โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย",
  })

  // Mock user data
  const user = {
    name: "สมชาย ใจดี",
    email: "somchai@example.com",
    school: "โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย",
    enrolledDate: "มกราคม 2024",
    completedModules: 3,
    totalModules: 4,
    overallProgress: 75,
  }

  const modules = [
    {
      id: 1,
      name: "Module 1: Robotics Fundamentals",
      status: "completed",
      completedDate: "15 ก.พ. 2024",
      score: 95,
      certificate: true,
    },
    {
      id: 2,
      name: "Module 2: Programming & Control",
      status: "completed",
      completedDate: "20 มี.ค. 2024",
      score: 88,
      certificate: true,
    },
    {
      id: 3,
      name: "Module 3: Sensors & Integration",
      status: "completed",
      completedDate: "25 เม.ย. 2024",
      score: 92,
      certificate: true,
    },
    {
      id: 4,
      name: "Module 4: Advanced Projects",
      status: "in-progress",
      progress: 60,
      certificate: false,
    },
  ]

  const achievements = [
    {
      id: 1,
      title: "Early Bird",
      description: "ลงทะเบียนเรียนภายใน 1 สัปดาห์แรก",
      icon: "🎯",
      earned: true,
      date: "5 ม.ค. 2024",
    },
    {
      id: 2,
      title: "Perfect Score",
      description: "ได้คะแนนเต็มในการสอบ Module",
      icon: "💯",
      earned: true,
      date: "15 ก.พ. 2024",
    },
    {
      id: 3,
      title: "Fast Learner",
      description: "จบ Module ก่อนกำหนด",
      icon: "⚡",
      earned: true,
      date: "20 มี.ค. 2024",
    },
    {
      id: 4,
      title: "Team Player",
      description: "ทำงานกลุ่มได้ดีเยี่ยม",
      icon: "🤝",
      earned: true,
      date: "25 เม.ย. 2024",
    },
    {
      id: 5,
      title: "Graduate",
      description: "จบครบทั้ง 4 Module",
      icon: "🎓",
      earned: false,
      date: null,
    },
    {
      id: 6,
      title: "Excellence Award",
      description: "คะแนนเฉลี่ยสูงกว่า 90%",
      icon: "🏆",
      earned: false,
      date: null,
    },
  ]

  const handleLogout = () => {
    // Mockup logout - just redirect to home
    router.push("/")
  }

  const handleEditProfile = () => {
    setEditedUser({
      name: user.name,
      email: user.email,
      school: user.school,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveProfile = () => {
    // Mockup save - just close dialog
    setIsEditDialogOpen(false)
    // In real implementation, would save to backend here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              กลับหน้าแรก
            </Link>
          </Button>
        </div>

        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 text-balance">{user.name}</h1>
                <div className="flex flex-col gap-1 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>{user.school}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>เริ่มเรียน: {user.enrolledDate}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 bg-transparent" onClick={handleEditProfile}>
                <User className="h-4 w-4" />
                แก้ไขโปรไฟล์
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-transparent text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                ออกจากระบบ
              </Button>
            </div>
          </div>

          {/* Overall Progress */}
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">ความคืบหน้าโดยรวม</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {user.completedModules}/{user.totalModules} Module
                </span>
              </div>
              <Progress value={user.overallProgress} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground text-right">{user.overallProgress}% เสร็จสมบูรณ์</p>
            </CardContent>
          </Card>
        </div>

        {/* Modules Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">รายวิชาที่เรียน</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {modules.map((module) => (
              <Card
                key={module.id}
                className={`border-2 transition-all hover:shadow-lg ${
                  module.status === "completed"
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900"
                    : "hover:border-primary/50"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 text-balance">{module.name}</CardTitle>
                      {module.status === "completed" ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-semibold">เสร็จสมบูรณ์</span>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          กำลังเรียน
                        </Badge>
                      )}
                    </div>
                    {module.certificate && <Award className="h-8 w-8 text-yellow-500 flex-shrink-0" />}
                  </div>
                </CardHeader>
                <CardContent>
                  {module.status === "completed" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">วันที่จบ:</span>
                        <span className="font-medium">{module.completedDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">คะแนน:</span>
                        <span className="font-bold text-lg text-primary">{module.score}%</span>
                      </div>
                      {module.certificate && (
                        <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                          <Download className="h-4 w-4" />
                          ดาวน์โหลดเกียรติบัตร
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">ความคืบหน้า:</span>
                        <span className="font-semibold">{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                      <Button size="sm" className="w-full">
                        เรียนต่อ
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Medal className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">ความสำเร็จ</h2>
            <Badge variant="secondary" className="ml-2">
              {achievements.filter((a) => a.earned).length}/{achievements.length}
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`border-2 transition-all ${
                  achievement.earned
                    ? "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-900 hover:shadow-lg"
                    : "opacity-60 grayscale hover:opacity-80"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1 flex items-center gap-2">
                        {achievement.title}
                        {achievement.earned && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      </CardTitle>
                      <CardDescription className="text-sm">{achievement.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {achievement.earned && achievement.date && (
                  <CardContent>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      ได้รับเมื่อ: {achievement.date}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Certificates Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Award className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">เกียรติบัตรดิจิทัล</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules
              .filter((m) => m.certificate)
              .map((module) => (
                <Card
                  key={module.id}
                  className="border-2 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <Award className="h-16 w-16 text-primary mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-lg mb-2 text-balance">Certificate of Completion</h3>
                      <p className="text-sm text-muted-foreground mb-1">{module.name}</p>
                      <p className="text-xs text-muted-foreground">{user.name}</p>
                      <div className="mt-4 text-xs font-mono text-muted-foreground">{module.completedDate}</div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" className="gap-2">
                        <Download className="h-4 w-4" />
                        ดาวน์โหลด
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </section>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">แก้ไขโปรไฟล์</DialogTitle>
              <DialogDescription>แก้ไขข้อมูลส่วนตัวของคุณ (ยังไม่มีการบันทึกจริง)</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                <Input
                  id="name"
                  value={editedUser.name}
                  onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                  placeholder="กรอกอีเมล"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">โรงเรียน</Label>
                <Input
                  id="school"
                  value={editedUser.school}
                  onChange={(e) => setEditedUser({ ...editedUser, school: e.target.value })}
                  placeholder="กรอกชื่อโรงเรียน"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleSaveProfile}>บันทึก (Mockup)</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
