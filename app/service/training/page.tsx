"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  ChevronLeft,
  User,
  School,
  Factory,
  Clock,
  MapPin,
  Award,
  CheckCircle2,
  Construction,
} from "lucide-react"

const AUDIENCES = [
  {
    icon: <User className="w-6 h-6" />,
    title: "Private",
    subtitle: "บุคคลทั่วไป",
    description:
      "คอร์สส่วนตัวสำหรับผู้สนใจหุ่นยนต์ ตั้งแต่นักเรียน นักศึกษา ไปจนถึงคนทำงาน",
    examples: [
      "Workshop หุ่นยนต์เบื้องต้น",
      "Arduino & IoT Hands-on",
      "Python for Robotics",
      "Personal coaching 1-on-1",
    ],
  },
  {
    icon: <School className="w-6 h-6" />,
    title: "School",
    subtitle: "โรงเรียน / สถาบันการศึกษา",
    description:
      "หลักสูตรเสริมสำหรับโรงเรียน รองรับตั้งแต่ระดับประถมจนถึงมหาวิทยาลัย",
    examples: [
      "STEM Workshop ประถม-มัธยม",
      "ค่ายหุ่นยนต์ (Robotics Camp)",
      "หลักสูตรเสริม In-house",
      "Train-the-Teacher Program",
    ],
  },
  {
    icon: <Factory className="w-6 h-6" />,
    title: "Industrial",
    subtitle: "องค์กร / อุตสาหกรรม",
    description:
      "หลักสูตรเฉพาะทางสำหรับภาคเอกชน เน้นการนำไปใช้จริงในงานอุตสาหกรรม",
    examples: [
      "Industrial Automation",
      "PLC & SCADA Training",
      "Robot Operator Certification",
      "Custom Corporate Programs",
    ],
  },
]

const HIGHLIGHTS = [
  {
    icon: <Clock className="w-5 h-5" />,
    label: "ยืดหยุ่น",
    description: "ปรับระยะเวลาและเนื้อหาตามความต้องการ",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    label: "On-site / Online",
    description: "อบรมที่สถานที่ของคุณ หรือผ่านระบบออนไลน์",
  },
  {
    icon: <Award className="w-5 h-5" />,
    label: "ใบรับรอง",
    description: "รับ Certificate ที่ออกร่วมกับ KMUTT",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "ทีมผู้สอนคุณภาพ",
    description: "ผู้เชี่ยวชาญด้านหุ่นยนต์และระบบอัตโนมัติ",
  },
]

const PROCESS = [
  {
    step: "01",
    title: "ปรึกษา",
    description: "พูดคุยกับทีม BOROT เพื่อเข้าใจเป้าหมายและความต้องการของคุณ",
  },
  {
    step: "02",
    title: "ออกแบบหลักสูตร",
    description: "ทีมงานออกแบบหลักสูตรเฉพาะ พร้อมตารางเวลาและงบประมาณ",
  },
  {
    step: "03",
    title: "อบรม",
    description: "ดำเนินการอบรมโดยทีมผู้เชี่ยวชาญ พร้อมอุปกรณ์ครบครัน",
  },
  {
    step: "04",
    title: "ติดตามผล",
    description: "ประเมินผลและให้คำปรึกษาต่อเนื่องหลังจบการอบรม",
  },
]

export default function TrainingPage() {
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
              <Users className="w-8 h-8" />
            </div>
            <Badge variant="outline" className="mb-4">
              Training
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              คอร์สอบรมเฉพาะทาง
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              ออกแบบหลักสูตรอบรมเชิงปฏิบัติการให้เหมาะกับ
              บุคคลทั่วไป โรงเรียน และองค์กรอุตสาหกรรม —
              พร้อมทีมผู้สอนและอุปกรณ์มาตรฐาน
            </p>
          </div>

          {/* Audience tiers */}
          <section className="mb-14 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">
              ออกแบบสำหรับคุณ
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {AUDIENCES.map((a) => (
                <Card key={a.title} className="border-border/60 h-full">
                  <CardContent className="p-6 sm:p-7 flex flex-col h-full">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4"
                      style={{
                        background:
                          "linear-gradient(135deg, #E5690D 0%, #FF8C00 100%)",
                      }}
                    >
                      {a.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-1">{a.title}</h3>
                    <p className="text-sm font-medium text-orange-600 mb-3">
                      {a.subtitle}
                    </p>
                    <p className="text-sm text-muted-foreground mb-5 flex-1">
                      {a.description}
                    </p>
                    <ul className="space-y-2 pt-4 border-t border-border/60">
                      {a.examples.map((ex) => (
                        <li
                          key={ex}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Highlights */}
          <section className="mb-14 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">
              ทำไมต้อง BOROT Training
            </h2>
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
              {HIGHLIGHTS.map((h) => (
                <Card key={h.label} className="border-border/60">
                  <CardContent className="p-5 sm:p-6">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                      {h.icon}
                    </div>
                    <h3 className="font-semibold mb-1.5">{h.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {h.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Process */}
          <section className="mb-14 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
              ขั้นตอนการให้บริการ
            </h2>
            <p className="text-center text-muted-foreground mb-8 sm:mb-10">
              ตั้งแต่การปรึกษาจนถึงการติดตามผล
            </p>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {PROCESS.map((p) => (
                <Card key={p.step} className="border-border/60">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-orange-500 mb-3">
                      {p.step}
                    </div>
                    <h3 className="font-semibold mb-1.5">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {p.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
            <CardContent className="p-8 sm:p-12 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                พร้อมจัดอบรมให้ทีมของคุณ?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                บอกเราว่าทีมของคุณต้องการอะไร —
                เราจะออกแบบหลักสูตรและประเมินงบประมาณให้คุณภายใน 3 วันทำการ
              </p>
              <Link href="/about">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  ขอใบเสนอราคา
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
