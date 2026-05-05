"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  ChevronLeft,
  BookOpen,
  Users,
  Wrench,
  TrendingUp,
  Shield,
  Building2,
  CheckCircle2,
  Construction,
} from "lucide-react"

const FEATURES = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "หลักสูตรครบชุด",
    description: "หลักสูตรหุ่นยนต์และ STEM ที่ผ่านการพัฒนาร่วมกับ KMUTT",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "อบรมครูผู้สอน",
    description: "Train-the-Trainer และระบบรับรองคุณภาพการสอน",
  },
  {
    icon: <Wrench className="w-5 h-5" />,
    title: "อุปกรณ์และห้องเรียน",
    description: "ชุดอุปกรณ์การเรียน ครุภัณฑ์ และไกด์ไลน์การจัดห้องเรียน",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "การตลาดและแบรนด์",
    description: "สื่อการตลาด, เว็บไซต์สาขา, และการสนับสนุนการรับสมัครนักเรียน",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "ระบบจัดการ",
    description: "Dashboard บริหารนักเรียน, ตารางเรียน, และการเก็บค่าบริการ",
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: "Operation Support",
    description: "ที่ปรึกษาธุรกิจและการสนับสนุนการดำเนินงานต่อเนื่อง",
  },
]

const PACKAGES = [
  {
    name: "Starter",
    price: "ติดต่อสอบถาม",
    description: "เหมาะสำหรับเปิดสาขาขนาดเล็ก 1-2 ห้องเรียน",
    features: [
      "หลักสูตรพื้นฐาน 6 ระดับ",
      "อบรมครูผู้สอน 2 คน",
      "ชุดอุปกรณ์เริ่มต้น",
      "การสนับสนุน 6 เดือน",
    ],
  },
  {
    name: "Standard",
    price: "ติดต่อสอบถาม",
    description: "เหมาะสำหรับสาขาขนาดกลาง 3-5 ห้องเรียน",
    features: [
      "หลักสูตรครบชุด ทุกระดับ",
      "อบรมครูผู้สอน 5 คน",
      "ชุดอุปกรณ์มาตรฐาน",
      "การสนับสนุน 12 เดือน",
      "ระบบจัดการนักเรียน",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    price: "ติดต่อสอบถาม",
    description: "เหมาะสำหรับสาขาขนาดใหญ่ 6+ ห้องเรียน",
    features: [
      "ทุกอย่างใน Standard",
      "อบรมครูผู้สอนไม่จำกัด",
      "ชุดอุปกรณ์ระดับสูง",
      "การสนับสนุนต่อเนื่อง",
      "ที่ปรึกษาเฉพาะกิจ",
    ],
  },
]

export default function AcademyFranchisePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 sm:pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          {/* Back link */}
          <Link
            href="/service"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            กลับไปหน้าบริการ
          </Link>

          {/* Mockup banner */}
          <Card className="mb-8 border-amber-200 bg-amber-50/60">
            <CardContent className="p-4 flex items-center gap-3">
              <Construction className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-900">
                <span className="font-semibold">หน้านี้เป็น Mockup</span> —
                เนื้อหายังอยู่ระหว่างการจัดทำ ข้อมูลในหน้านี้เป็นตัวอย่างเท่านั้น
              </p>
            </CardContent>
          </Card>

          {/* Hero */}
          <div className="text-center mb-12 sm:mb-16">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white mb-5"
              style={{
                background: "linear-gradient(135deg, #E5690D 0%, #FF8C00 100%)",
              }}
            >
              <GraduationCap className="w-8 h-8" />
            </div>
            <Badge variant="outline" className="mb-4">
              Academy Franchise
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              เปิดสถาบันสอนหุ่นยนต์ในชื่อของคุณ
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              ระบบแฟรนไชส์อะคาเดมีครบวงจรจาก BOROT × KMUTT —
              พร้อมหลักสูตร อุปกรณ์ ครู และระบบจัดการ ให้คุณเปิดสาขาได้ทันที
            </p>
          </div>

          {/* Features grid */}
          <section className="mb-14 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">
              สิ่งที่คุณจะได้รับ
            </h2>
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <Card key={f.title} className="border-border/60">
                  <CardContent className="p-5 sm:p-6">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                      {f.icon}
                    </div>
                    <h3 className="font-semibold mb-1.5">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Packages */}
          <section className="mb-14 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
              แพ็กเกจแฟรนไชส์
            </h2>
            <p className="text-center text-muted-foreground mb-8 sm:mb-10">
              เลือกแพ็กเกจที่เหมาะกับขนาดและเป้าหมายของคุณ
            </p>
            <div className="grid gap-5 md:grid-cols-3">
              {PACKAGES.map((p) => (
                <Card
                  key={p.name}
                  className={
                    p.highlighted
                      ? "border-orange-300 shadow-lg ring-2 ring-orange-200/50"
                      : "border-border/60"
                  }
                >
                  <CardContent className="p-6 sm:p-7">
                    {p.highlighted && (
                      <Badge className="mb-3 bg-orange-500 hover:bg-orange-500 border-0">
                        แนะนำ
                      </Badge>
                    )}
                    <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {p.description}
                    </p>
                    <div className="text-2xl font-bold mb-5 text-orange-600">
                      {p.price}
                    </div>
                    <ul className="space-y-2.5 mb-6">
                      {p.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={
                        p.highlighted
                          ? "w-full bg-orange-500 hover:bg-orange-600"
                          : "w-full"
                      }
                      variant={p.highlighted ? "default" : "outline"}
                    >
                      ติดต่อสอบถาม
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
            <CardContent className="p-8 sm:p-12 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                สนใจเปิดสาขา?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                ทีมงานของเรายินดีให้คำปรึกษาและจัดทำแผนธุรกิจให้กับคุณ
                โดยไม่มีค่าใช้จ่ายในการสอบถามเบื้องต้น
              </p>
              <Link href="/about">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  ติดต่อทีมแฟรนไชส์
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
