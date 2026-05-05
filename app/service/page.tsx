"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GraduationCap, Users, Printer, ArrowRight, Sparkles } from "lucide-react"

interface ServiceItem {
  href: string
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
  badge: string
  badgeClass: string
  cta: string
  comingSoon?: boolean
}

const SERVICES: ServiceItem[] = [
  {
    href: "/service/academy-franchise",
    title: "Academy Franchise",
    subtitle: "เปิดสถาบันสอนหุ่นยนต์ในชื่อของคุณ",
    description:
      "ระบบแฟรนไชส์อะคาเดมีครบวงจร — หลักสูตร, ครูผู้สอน, อุปกรณ์, และระบบจัดการนักเรียนพร้อมเปิดสาขาใหม่ได้ทันที",
    icon: <GraduationCap className="w-7 h-7" />,
    badge: "Mockup",
    badgeClass: "bg-amber-100 text-amber-700",
    cta: "ดูรายละเอียด",
    comingSoon: true,
  },
  {
    href: "/service/training",
    title: "Training",
    subtitle: "สำหรับองค์กร โรงเรียน และบุคคลทั่วไป",
    description:
      "คอร์สอบรมเชิงปฏิบัติการ ออกแบบเฉพาะสำหรับโรงเรียน ภาคเอกชน และอุตสาหกรรม — ตั้งแต่พื้นฐานหุ่นยนต์ ไปจนถึงระบบอัตโนมัติขั้นสูง",
    icon: <Users className="w-7 h-7" />,
    badge: "Mockup",
    badgeClass: "bg-amber-100 text-amber-700",
    cta: "ดูรายละเอียด",
    comingSoon: true,
  },
  {
    href: "/service/3d-printing",
    title: "3D Model Printing",
    subtitle: "บริการพิมพ์ชิ้นงาน 3D คุณภาพสูง",
    description:
      "อัปโหลดไฟล์ STL/OBJ ของคุณ คำนวณราคาอัตโนมัติ เลือกวัสดุ สี และความละเอียด — พร้อมจัดส่งทั่วประเทศ",
    icon: <Printer className="w-7 h-7" />,
    badge: "Available",
    badgeClass: "bg-emerald-100 text-emerald-700",
    cta: "เริ่มสั่งพิมพ์",
  },
]

export default function ServiceHubPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 sm:pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14">
            <Badge variant="outline" className="mb-4 gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Our Services
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
              บริการของ BOROT
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              ตั้งแต่การศึกษาด้านหุ่นยนต์ ไปจนถึงการพิมพ์ชิ้นงาน 3D —
              เราพร้อมสนับสนุนคุณในทุกขั้นตอน
            </p>
          </div>

          {/* Service cards */}
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <Link key={s.href} href={s.href} className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 border-border/60">
                  <CardContent className="p-6 sm:p-7 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #E5690D 0%, #FF8C00 100%)",
                        }}
                      >
                        {s.icon}
                      </div>
                      <Badge className={`${s.badgeClass} border-0`}>
                        {s.badge}
                      </Badge>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold mb-1.5">
                      {s.title}
                    </h2>
                    <p className="text-sm font-medium text-orange-600 mb-3">
                      {s.subtitle}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {s.description}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground group-hover:text-orange-600 transition-colors">
                        {s.cta}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-14 sm:mt-20 text-center">
            <Card className="max-w-3xl mx-auto bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
              <CardContent className="p-8 sm:p-10">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  ต้องการบริการที่กำหนดเอง?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-5">
                  ทีมงานของเราพร้อมให้คำปรึกษาและออกแบบโซลูชันให้เหมาะกับคุณ
                </p>
                <Link href="/about">
                  <Button
                    size="lg"
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    ติดต่อเรา
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
