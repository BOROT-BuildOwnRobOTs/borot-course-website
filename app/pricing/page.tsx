"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

export default function PricingPage() {
  const modules = [
    {
      number: "0",
      title: "Intelligent Systems Engineering",
      schoolPrice: "1,500",
      schoolSessions: "เรียนทั้งหมด 1 ครั้ง (6 ชั่วโมง)",
      schoolRate: "เฉลี่ย 250 บาท/ชั่วโมง",
      personalPrice: "1,500",
      personalSessions: "เรียนทั้งหมด 1 ครั้ง (ครั้งละ 3 ชั่วโมง)",
      personalRate: "เฉลี่ย 250 บาท/ชั่วโมง",
    },
    {
      number: "1",
      title: "Electronics, Embedded & Control",
      schoolPrice: "6,000",
      schoolSessions: "เรียนทั้งหมด 4 ครั้ง (ครั้งละ 6 ชั่วโมง)",
      schoolRate: "เฉลี่ย 250 บาท/ชั่วโมง",
      personalPrice: "14,400",
      personalSessions: "เรียนทั้งหมด 8 ครั้ง (ครั้งละ 3 ชั่วโมง)",
      personalRate: "เฉลี่ย 600 บาท/ชั่วโมง",
    },
    {
      number: "2",
      title: "IoT + Data + Python Programming",
      schoolPrice: "6,600",
      schoolSessions: "เรียนทั้งหมด 4 ครั้ง (ครั้งละ 6 ชั่วโมง)",
      schoolRate: "เฉลี่ย 278 บาท/ชั่วโมง",
      personalPrice: "16,560",
      personalSessions: "เรียนทั้งหมด 8 ครั้ง (ครั้งละ 3 ชั่วโมง)",
      personalRate: "เฉลี่ย 690 บาท/ชั่วโมง",
    },
    {
      number: "3",
      title: "AI (Vision/ML for Bio-inspired Tasks + Robotic Arm I/O)",
      schoolPrice: "7,260",
      schoolSessions: "เรียนทั้งหมด 4 ครั้ง (ครั้งละ 6 ชั่วโมง)",
      schoolRate: "เฉลี่ย 303 บาท/ชั่วโมง",
      personalPrice: "19,044",
      personalSessions: "เรียนทั้งหมด 8 ครั้ง (ครั้งละ 3 ชั่วโมง)",
      personalRate: "เฉลี่ย 794 บาท/ชั่วโมง",
    },
    {
      number: "4",
      title: "Robot car+Robotic arm",
      schoolPrice: "7,986",
      schoolSessions: "เรียนทั้งหมด 4 ครั้ง (ครั้งละ 6 ชั่วโมง)",
      schoolRate: "เฉลี่ย 333 บาท/ชั่วโมง",
      personalPrice: "21,901",
      personalSessions: "เรียนทั้งหมด 8 ครั้ง (ครั้งละ 3 ชั่วโมง)",
      personalRate: "เฉลี่ย 913 บาท/ชั่วโมง",
    },
    {
      number: "5",
      title: "Integration + Portfolio (Project-Based)",
      schoolPrice: "8,785",
      schoolSessions: "เรียนทั้งหมด 4 ครั้ง (ครั้งละ 6 ชั่วโมง)",
      schoolRate: "เฉลี่ย 366 บาท/ชั่วโมง",
      personalPrice: "25,186",
      personalSessions: "เรียนทั้งหมด 8 ครั้ง (ครั้งละ 3 ชั่วโมง)",
      personalRate: "เฉลี่ย 1049 บาท/ชั่วโมง",
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-6 py-16 max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              Course Pricing
            </h1>
            <p className="text-xl text-muted-foreground">
              Engineering Learning Program
            </p>
          </div>

          {/* Package Headers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="md:col-span-1" />
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-2 border-orange-200 dark:border-orange-800">
              <CardHeader className="py-8 text-center">
                <CardTitle className="text-2xl font-bold mb-2">
                  School Package
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium">
                  (จำกัดนักเรียนต่อ class 36 คน)
                </p>
              </CardHeader>
            </Card>
            <Card className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 border-2 border-orange-300 dark:border-orange-700">
              <CardHeader className="py-8 text-center">
                <CardTitle className="text-2xl font-bold">
                  Personal Package
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Module Rows */}
          <div className="space-y-5 mb-16">
            {modules.map((module) => (
              <div
                key={module.number}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Module Name */}
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 flex items-center justify-center text-center min-h-[140px]">
                    <div className="space-y-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs font-semibold px-3 py-1">
                        Module {module.number}
                      </Badge>
                      <div className="text-lg font-bold text-white leading-tight">
                        {module.title}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* School Package Price */}
                <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border border-pink-200 dark:border-pink-800 hover:shadow-md transition-shadow">
                  <CardContent className="p-8 min-h-[140px] flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="text-4xl font-bold tracking-tight">
                        {module.schoolPrice}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium leading-snug">
                        {module.schoolSessions}
                      </div>
                      <div className="text-xs text-muted-foreground/80 pt-1">
                        {module.schoolRate}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Package Price */}
                <Card className="bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800 border border-pink-300 dark:border-pink-700 hover:shadow-md transition-shadow">
                  <CardContent className="p-8 min-h-[140px] flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="text-4xl font-bold tracking-tight">
                        {module.personalPrice}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium leading-snug">
                        {module.personalSessions}
                      </div>
                      <div className="text-xs text-muted-foreground/80 pt-1">
                        {module.personalRate}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Total Package Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="md:col-span-1" />
            <Card className="border-2 border-orange-400 dark:border-orange-600 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-10 text-center">
                <Badge className="mb-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 text-sm font-semibold">
                  Complete Package
                </Badge>
                <div className="text-5xl font-bold mb-3 tracking-tight">
                  ฿36,631
                </div>
                <p className="text-base text-muted-foreground font-medium">
                  ทั้งหมด 6 Modules
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-orange-500 dark:border-orange-500 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-10 text-center">
                <Badge className="mb-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 text-sm font-semibold">
                  Complete Package
                </Badge>
                <div className="text-5xl font-bold mb-3 tracking-tight">
                  ฿97,090
                </div>
                <p className="text-base text-muted-foreground font-medium">
                  ทั้งหมด 6 Modules
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Info */}
          <Card className="border-2 bg-gradient-to-br from-muted/30 to-muted/50">
            <CardContent className="p-10">
              <div className="flex items-start gap-5">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Info className="w-6 h-6 text-primary flex-shrink-0" />
                </div>
                <div className="space-y-3 flex-1">
                  <h4 className="text-xl font-bold">Payment Options</h4>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    สามารถแบ่งจ่ายได้ ชำระผ่านบัตรเครดิตหรือโอนธนาคาร
                    สำหรับผู้ที่สอบผ่านครบทุก Module จะได้รับสิทธิ์สอบโควต้าเข้า มจธ.ราชบุรี
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mt-20">
            <Button size="lg" className="text-lg px-12 py-6 shadow-lg hover:shadow-xl transition-all">
              Get Started
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              เริ่มต้นเส้นทางสู่การเป็นวิศวกรด้วยหลักสูตรที่ออกแบบมาเพื่อคุณ
            </p>
          </div>
        </div>
      </main>
    </>
  )
}