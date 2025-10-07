"use client"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  TimelineModal,
  TimelineModalContent,
  TimelineModalHeader,
  TimelineModalTitle,
  TimelineModalTrigger,
} from "@/components/timeline-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  CheckCircle,
  Info,
  Star,
  Award,
  Clock,
  CreditCard,
  Calendar,
  Banknote,
  FileText,
  BookOpen,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from "lucide-react"

export default function PricingPage() {
  const [showPaymentPlans, setShowPaymentPlans] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showSchoolQuotaPopup, setShowSchoolQuotaPopup] = useState(false)

  useEffect(() => {
    setShowSchoolQuotaPopup(true)
  }, [])

  const pricingData = [
    {
      module: "Module 1",
      title: "Explore & Build Basics",
      individualPrice: 15000, // keeping individual price at 15,000 per person
      schoolPrice: 225000, // updated to 225,000 baht (7,500 per person × 30)
      dailyPrice: 3000,
      duration: "5 Sessions",
      color: "from-orange-500 to-orange-600",
      discountPercent: 50, // updated to show 50% discount
    },
    {
      module: "Module 2",
      title: "Control & Navigation",
      individualPrice: 18000,
      schoolPrice: 255000, // 8,500 per person × 30 = 255,000
      dailyPrice: 3600,
      duration: "5 Sessions",
      color: "from-red-500 to-red-600",
      discountPercent: 53,
    },
    {
      module: "Module 3",
      title: "Perception & AI",
      individualPrice: 21000,
      schoolPrice: 285000, // 9,500 per person × 30 = 285,000
      dailyPrice: 4200,
      duration: "5 Sessions",
      color: "from-red-600 to-red-700",
      discountPercent: 55,
    },
    {
      module: "Module 4",
      title: "Integration Project",
      individualPrice: 23000,
      schoolPrice: 337750, // 45% discount from individual (20500 * 30 * 0.55)
      dailyPrice: 4600,
      duration: "5 Sessions",
      color: "from-orange-600 to-orange-700",
      discountPercent: 45,
    },
  ]

  const totalIndividualPrice = pricingData.reduce((sum, item) => sum + item.individualPrice, 0)
  const totalSchoolPrice = pricingData.reduce((sum, item) => sum + item.schoolPrice, 0)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <div className="py-12">
          <div className="container mx-auto px-6 text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-balance mb-6">
              <span className="text-foreground">Course</span> <span className="text-primary">Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
              เลือกแพ็กเกจที่เหมาะสมกับคุณ - School Package หรือ Individual Premium Track
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-600 font-medium">ราคารวมค่าธรรมเนียมบัตรเครดิตและค่าสอบแล้ว</p>
            </div>
            <div className="mt-6">
              <Dialog open={showPaymentPlans} onOpenChange={setShowPaymentPlans}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 mr-4"
                  >
                    <CreditCard className="h-5 w-5 mr-3" />
                    <span className="text-lg">ดูแผนการชำระเงิน</span>
                  </Button>
                </DialogTrigger>
                <TimelineModal open={showTimeline} onOpenChange={setShowTimeline}>
                  <TimelineModalTrigger asChild>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-transparent"
                    >
                      <Calendar className="h-5 w-5 mr-3" />
                      <span className="text-lg">ดูตารางเรียน</span>
                    </Button>
                  </TimelineModalTrigger>
                  <TimelineModalContent>
                    <TimelineModalHeader>
                      <TimelineModalTitle className="text-foreground">ตารางเวลาการเรียน</TimelineModalTitle>
                      <p className="text-center text-muted-foreground">
                        ตารางเวลาการเรียนแบบปฏิทิน เข้าใจง่าย ชัดเจน พร้อมความยืดหยุ่นตามความต้องการของโรงเรียน
                      </p>
                    </TimelineModalHeader>

                    <div className="space-y-8 p-6">
                      {/* Weekly Calendar Table */}
                      <Card className="shadow-lg border">
                        <CardHeader className="bg-primary text-primary-foreground">
                          <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-primary-foreground/20 rounded-lg">
                              <Calendar className="h-6 w-6" />
                            </div>
                            ตารางปฏิทินการเรียน Module 1 (ตัวอย่าง)
                          </CardTitle>
                          <CardDescription className="text-primary-foreground/80 text-base">
                            เลือกวันในสัปดาห์ที่สะดวก แล้วเรียนต่อเนื่องตามตารางนี้
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg">
                              <thead>
                                <tr className="bg-primary text-primary-foreground">
                                  <th className="p-3 text-left font-semibold text-sm">สัปดาห์</th>
                                  <th className="p-3 text-center font-semibold text-sm">จันทร์</th>
                                  <th className="p-3 text-center font-semibold text-sm">อังคาร</th>
                                  <th className="p-3 text-center font-semibold text-sm">พุธ</th>
                                  <th className="p-3 text-center font-semibold text-sm">พฤหัสบดี</th>
                                  <th className="p-3 text-center font-semibold text-sm">ศุกร์</th>
                                  <th className="p-3 text-center font-semibold text-sm">เสาร์</th>
                                  <th className="p-3 text-center font-semibold text-sm">อาทิตย์</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[1, 2, 3, 4, 5].map((week) => (
                                  <tr key={week} className="border-b border-border hover:bg-muted/50 transition-colors">
                                    <td className="p-3 font-semibold bg-muted text-foreground text-sm">
                                      สัปดาห์ที่ {week}
                                    </td>
                                    <td className="p-2 text-center"></td>
                                    <td className="p-2 text-center"></td>
                                    <td className="p-2 text-center">
                                      {week === 5 ? (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                                          <div className="flex items-center justify-center gap-1 mb-1">
                                            <FileText className="h-3 w-3 text-orange-700" />
                                            <span className="font-semibold text-orange-800 text-xs">ผ่าน Module</span>
                                          </div>
                                          <div className="text-xs text-orange-600 font-medium">ข้อเขียน + ปฏิบัติ</div>
                                          <div className="flex items-center justify-center gap-1 mt-1">
                                            <Award className="h-3 w-3 text-blue-600" />
                                            <span className="text-xs text-blue-700 font-medium">
                                              Certificate for next module
                                            </span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                                          <div className="flex items-center justify-center gap-1 mb-1">
                                            <BookOpen className="h-3 w-3 text-green-700" />
                                            <span className="font-semibold text-green-800 text-xs">Session {week}</span>
                                          </div>
                                          <div className="text-xs text-green-600 font-medium">9:00-16:00</div>
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-2 text-center"></td>
                                    <td className="p-2 text-center"></td>
                                    <td className="p-2 text-center"></td>
                                    <td className="p-2 text-center"></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="mt-6 p-4 bg-muted rounded-xl border">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">💡 ความยืดหยุ่นในการจัดตาราง</h4>
                                <ul className="text-muted-foreground space-y-1 text-sm">
                                  <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    โรงเรียนเลือกวันที่สะดวกได้ (ไม่จำเป็นต้องเป็นวันพุธ)
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    สามารถเว้นสัปดาห์หรือจัดเป็นรายเดือนได้
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    เวลาเรียน 9:00-16:00 น. (7 ชั่วโมงเต็ม)
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Monthly Schedule Table */}
                      <Card className="shadow-lg border">
                        <CardHeader className="bg-secondary text-secondary-foreground">
                          <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-secondary-foreground/20 rounded-lg">
                              <Clock className="h-6 w-6" />
                            </div>
                            ตัวเลือกการจัดเรียนแบบรายเดือน
                          </CardTitle>
                          <CardDescription className="text-secondary-foreground/80 text-base">
                            สำหรับโรงเรียนที่ต้องการความยืดหยุ่นมากขึ้น
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg">
                              <thead>
                                <tr className="bg-secondary text-secondary-foreground">
                                  <th className="p-3 text-left font-semibold text-sm">เดือน</th>
                                  <th className="p-3 text-center font-semibold text-sm">กิจกรรม</th>
                                  <th className="p-3 text-center font-semibold text-sm">เวลา</th>
                                  <th className="p-3 text-center font-semibold text-sm">หมายเหตุ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[1, 2, 3, 4, 5].map((month) => (
                                  <tr
                                    key={month}
                                    className="border-b border-border hover:bg-muted/50 transition-colors"
                                  >
                                    <td className="p-3 font-semibold bg-muted text-foreground text-sm">
                                      เดือนที่ {month}
                                    </td>
                                    <td className="p-3 text-center">
                                      {month === 5 ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-lg">
                                          <FileText className="h-3 w-3 text-orange-700" />
                                          <span className="font-semibold text-orange-800 text-sm">ผ่าน Module</span>
                                        </div>
                                      ) : (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-green-50 border border-green-200">
                                          <BookOpen className="h-3 w-3 text-green-700" />
                                          <span className="font-semibold text-green-800 text-sm">Session {month}</span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3 text-center font-medium text-sm">9:00-16:00</td>
                                    <td className="p-3 text-center text-sm text-muted-foreground">
                                      {month === 5 ? "ข้อเขียน + ปฏิบัติ + Certificate for next module" : "เลือกวันที่สะดวก"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Summary and Additional Info */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <Card className="shadow-lg border">
                          <CardHeader className="bg-destructive text-destructive-foreground">
                            <CardTitle className="flex items-center gap-3">
                              <div className="p-2 bg-destructive-foreground/20 rounded-lg">
                                <FileText className="h-4 w-4" />
                              </div>
                              ระบบการสอบ
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 space-y-4">
                            <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <h4 className="font-semibold text-green-800">สอบครั้งแรก - ฟรี!</h4>
                              </div>
                              <p className="text-green-700 text-sm">สำหรับผู้ที่เรียนครบทั้ง 4 โมดูล สามารถสอบครั้งแรกได้ฟรี</p>
                            </div>

                            <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                <h4 className="font-semibold text-orange-800">สอบซ้ำ</h4>
                              </div>
                              <p className="text-orange-700 mb-2 text-sm">หากสอบไม่ผ่าน สามารถสอบซ้ำได้</p>
                              <Badge className="bg-orange-100 text-orange-800 border-orange-300 px-2 py-1 text-xs">
                                ค่าธรรมเนียม +500 บาท/คน
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="shadow-lg border">
                          <CardHeader className="bg-primary text-primary-foreground">
                            <CardTitle className="flex items-center gap-3">
                              <div className="p-2 bg-primary-foreground/20 rounded-lg">
                                <Users className="h-4 w-4" />
                              </div>
                              ข้อมูลสำคัญ
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 space-y-4">
                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Users className="h-4 w-4 text-blue-600" />
                                <h4 className="font-semibold text-blue-800">ขนาดคลาส</h4>
                              </div>
                              <p className="text-blue-700 text-sm">30-40 คน ต่อคลาส (School Package)</p>
                            </div>

                            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-purple-600" />
                                <h4 className="font-semibold text-purple-800">เวลาเรียน</h4>
                              </div>
                              <p className="text-purple-700 text-sm">9:00-16:00 น. (7 ชั่วโมง/วัน)</p>
                            </div>

                            <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <h4 className="font-semibold text-green-800">ความยืดหยุ่น</h4>
                              </div>
                              <p className="text-green-700 text-sm">โรงเรียนเลือกวันเรียนได้ตามความสะดวก</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Complete 4-Module Overview */}
                      <Card className="shadow-lg border">
                        <CardHeader className="bg-secondary text-secondary-foreground">
                          <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-secondary-foreground/20 rounded-lg">
                              <Calendar className="h-6 w-6" />
                            </div>
                            ตารางเรียนครบหลักสูตร 4 Modules
                          </CardTitle>
                          <CardDescription className="text-secondary-foreground/80 text-base">
                            ภาพรวมการเรียนทั้งหมด 20 สัปดาห์
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg text-sm">
                              <thead>
                                <tr className="bg-secondary text-secondary-foreground">
                                  <th className="p-3 font-semibold">Module</th>
                                  <th className="p-3 font-semibold">สัปดาห์ที่ 1</th>
                                  <th className="p-3 font-semibold">สัปดาห์ที่ 2</th>
                                  <th className="p-3 font-semibold">สัปดาห์ที่ 3</th>
                                  <th className="p-3 font-semibold">สัปดาห์ที่ 4</th>
                                  <th className="p-3 font-semibold">สัปดาห์ที่ 5</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[1, 2, 3, 4].map((moduleNum) => (
                                  <tr
                                    key={moduleNum}
                                    className="border-b border-border hover:bg-muted/50 transition-colors"
                                  >
                                    <td className="p-3 font-semibold bg-muted text-foreground">Module {moduleNum}</td>
                                    {[1, 2, 3, 4, 5].map((session) => (
                                      <td key={session} className="p-2 text-center">
                                        {session === 5 ? (
                                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                              <FileText className="h-3 w-3 text-orange-700" />
                                              <span className="font-semibold text-orange-800 text-xs">Exam</span>
                                            </div>
                                            <div className="text-xs text-orange-600 font-medium mb-1">ผ่าน Module</div>
                                            <div className="flex items-center justify-center gap-1">
                                              <Award className="h-3 w-3 text-blue-600" />
                                              <span className="text-xs text-blue-700 font-medium">
                                                Certificate for next module
                                              </span>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                              <BookOpen className="h-3 w-3 text-green-700" />
                                              <span className="font-semibold text-green-800 text-xs">
                                                Session {session}
                                              </span>
                                            </div>
                                            <div className="text-xs text-green-600 font-medium">9:00-16:00</div>
                                          </div>
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="mt-6 p-6 bg-muted rounded-xl border">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-primary/10 rounded-xl">
                                <AlertCircle className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-bold text-foreground mb-3 text-lg">📊 สรุประยะเวลาทั้งหมด</h4>
                                <div className="grid md:grid-cols-3 gap-4">
                                  <div className="p-3 bg-card rounded-lg border">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Calendar className="h-4 w-4 text-primary" />
                                      <span className="font-semibold text-foreground text-sm">แบบรายสัปดาห์</span>
                                    </div>
                                    <p className="text-muted-foreground text-sm">20 สัปดาห์ (5 เดือน)</p>
                                  </div>
                                  <div className="p-3 bg-card rounded-lg border">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Clock className="h-4 w-4 text-primary" />
                                      <span className="font-semibold text-foreground text-sm">แบบรายเดือน</span>
                                    </div>
                                    <p className="text-muted-foreground text-sm">20 เดือน</p>
                                  </div>
                                  <div className="p-3 bg-card rounded-lg border">
                                    <div className="flex items-center gap-2 mb-1">
                                      <CheckCircle className="h-4 w-4 text-primary" />
                                      <span className="font-semibold text-foreground text-sm">ยืดหยุ่น</span>
                                    </div>
                                    <p className="text-muted-foreground text-sm">ปรับตารางได้ตามความเหมาะสม</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TimelineModalContent>
                </TimelineModal>
                <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] overflow-y-auto">
                  <DialogHeader className="pb-4">
                    <DialogTitle className="text-2xl font-bold text-center text-gray-900">แผนการชำระเงิน</DialogTitle>
                    <p className="text-center text-gray-600">ชำระแบบแบ่งงวดเพื่อลดภาระทางการเงิน</p>
                  </DialogHeader>

                  <div className="space-y-6">
                    <Tabs defaultValue="credit" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="credit" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          บัตรเครดิต
                        </TabsTrigger>
                        <TabsTrigger value="transfer" className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          โอนธนาคาร
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="credit" className="space-y-6">
                        <Card className="border-2 border-gray-200">
                          <CardHeader className="text-center bg-gray-50">
                            <CardTitle className="text-xl font-bold">แผนการชำระ 3 งวด</CardTitle>
                            <p className="text-gray-600">แต่ละงวด 87,500 บาท (สำหรับ Module 1)</p>
                            <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm font-semibold text-blue-800">
                                รวมทั้งหมด: 87,500 × 3 งวด = 262,500 บาท (สำหรับ Module 1)
                              </p>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                                  1
                                </div>
                                <h3 className="font-semibold mb-2">ก่อนเริ่มเรียน</h3>
                                <p className="text-2xl font-bold text-blue-600 mb-1">87,500฿</p>
                                <p className="text-sm text-gray-600">งวดแรก</p>
                              </div>

                              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                                  2
                                </div>
                                <h3 className="font-semibold mb-2">กลางคอร์ส</h3>
                                <p className="text-2xl font-bold text-orange-600 mb-1">87,500฿</p>
                                <p className="text-sm text-gray-600">หลังเรียนไป 2 ครั้ง</p>
                              </div>

                              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                                  3
                                </div>
                                <h3 className="font-semibold mb-2">ก่อนสอบ</h3>
                                <p className="text-2xl font-bold text-green-600 mb-1">87,500฿</p>
                                <p className="text-sm text-gray-600">งวดสุดท้าย</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-4">
                          <Card className="border border-blue-200">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-lg">ข้อดีการแบ่งจ่าย</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">ลดภาระ Cash Flow ของโรงเรียน</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">ชำระด้วยบัตรเครดิตได้ทันที</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">จ่ายตามความคืบหน้าการเรียน</span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border border-green-200">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-green-600" />
                                <CardTitle className="text-lg">ความยืดหยุ่น</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">เรียนแบบเดิม: 5 สัปดาห์</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">เรียนแบบใหม่: 10 สัปดาห์</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">เรียนแบบยืดหยุ่น: 5 เดือน</span>
                              </div>
                              <div className="mt-3 p-2 bg-green-50 rounded text-center">
                                <p className="text-green-700 font-medium text-sm">ยิ่งยืดเวลา ยิ่งลดภาระการเงิน</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="transfer" className="space-y-6">
                        <Card className="border-2 border-green-200">
                          <CardHeader className="text-center bg-green-50">
                            <CardTitle className="text-xl font-bold">โอนธนาคาร - แบ่งจ่ายได้</CardTitle>
                            <p className="text-gray-600">ชำระผ่านการโอนเงินธนาคาร สามารถแบ่งจ่ายได้เช่นเดียวกัน</p>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span>ไม่มีค่าธรรมเนียมเพิ่มเติม</span>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span>
                                  <strong>สามารถแบ่งจ่าย 3 งวดได้เช่นเดียวกัน</strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span>รับใบเสร็จอย่างเป็นทางการ</span>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span>ประหยัดค่าธรรมเนียมบัตรเครดิต</span>
                              </div>
                            </div>

                            {/* Added installment plan for bank transfer */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                              <h4 className="font-semibold text-green-800 mb-2">แผนการโอนแบ่งจ่าย</h4>
                              <div className="text-sm text-green-700 space-y-1">
                                <p>• งวดที่ 1: โอนก่อนเริ่มเรียน 87,500 ฿</p>
                                <p>• งวดที่ 2: โอนกลางคอร์ส 87,500 ฿</p>
                                <p>• งวดที่ 3: โอนก่อนสอบ 87,500 ฿</p>
                                <div className="mt-2 pt-2 border-t border-green-300">
                                  <p className="font-semibold text-green-800">รวมทั้งหมด: 87,500 × 3 งวด = 262,500 บาท</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* START UPDATED SCHOOL QUOTA POPUP */}
            <div className="mt-4">
              <Dialog open={showSchoolQuotaPopup} onOpenChange={setShowSchoolQuotaPopup}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 animate-pulse"
                  >
                    <Sparkles className="h-5 w-5 mr-3" />
                    <span className="text-lg">🎓 พิเศษสำหรับโรงเรียน - โควต้า มจธ.ราชบุรี</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-6">
                    <DialogTitle className="text-3xl font-bold text-center text-purple-900 flex items-center justify-center gap-3">
                      <GraduationCap className="h-10 w-10 text-purple-600" />
                      สำหรับผู้ที่สอบผ่านทั้ง 4 Module
                    </DialogTitle>
                    <p className="text-center text-purple-700 font-medium mt-2">โอกาสพิเศษเข้าศึกษาต่อ มจธ.ราชบุรี</p>
                  </DialogHeader>

                  <div className="space-y-6 p-2">
                    <div className="bg-gradient-to-br from-purple-50 via-white to-orange-50 p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-purple-900 mb-2">โควต้าพิเศษ มจธ.ราชบุรี</h3>
                        <p className="text-purple-700">จำนวนที่รับต่อปี</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        <Card className="border-4 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                          <CardContent className="p-8 text-center">
                            <div className="mb-4">
                              <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                              <h3 className="text-lg font-bold text-orange-900 mb-2">ต่อภาคการศึกษา</h3>
                            </div>
                            <div className="relative">
                              <div className="text-7xl font-black text-orange-600 mb-2 drop-shadow-lg">4</div>
                              <div className="text-2xl font-bold text-orange-800">คน</div>
                            </div>
                            <div className="mt-4 pt-4 border-t-2 border-orange-300">
                              <p className="text-sm font-semibold text-orange-700">สูงสุดต่อภาค</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-4 border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                          <CardContent className="p-8 text-center">
                            <div className="mb-4">
                              <Star className="h-12 w-12 text-green-600 mx-auto mb-3" />
                              <h3 className="text-lg font-bold text-green-900 mb-2">รวมทั้งปี</h3>
                            </div>
                            <div className="relative">
                              <div className="text-7xl font-black text-green-600 mb-2 drop-shadow-lg">8</div>
                              <div className="text-2xl font-bold text-green-800">คน</div>
                            </div>
                            <div className="mt-4 pt-4 border-t-2 border-green-300">
                              <p className="text-sm font-semibold text-green-700">รวม 2 ภาคการศึกษา</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mt-6 text-center">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-100 border-2 border-purple-300 rounded-full">
                          <Users className="h-6 w-6 text-purple-600" />
                          <span className="text-lg font-bold text-purple-900">มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี</span>
                        </div>
                        <p className="text-purple-700 font-medium mt-2">วิทยาเขตราชบุรี</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-2 border-blue-200 bg-blue-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-xl">
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                            <span className="text-blue-900">ข้อกำหนด</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-base text-blue-800 font-medium">ต้องสอบผ่านครบทั้ง 4 Module</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-base text-blue-800 font-medium">ได้รับใบประกาศนียบัตรทุกโมดูล</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-base text-blue-800 font-medium">ผ่านการประเมินขั้นสุดท้าย</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-green-200 bg-green-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-xl">
                            <Award className="h-6 w-6 text-green-600" />
                            <span className="text-green-900">สิทธิพิเศษ</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-base text-green-800 font-medium">เข้าเรียนที่ มจธ.ราชบุรี</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-base text-green-800 font-medium">Portfolio ที่แข็งแกร่ง</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-base text-green-800 font-medium">ประสบการณ์ STEM ระดับมหาวิทยาลัย</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border-4 border-yellow-300 bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 shadow-xl">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-4">
                          <Sparkles className="h-8 w-8 text-yellow-600 mt-1 flex-shrink-0 animate-pulse" />
                          <div className="flex-1">
                            <h3 className="font-black text-yellow-900 text-2xl mb-3">โอกาสทองสำหรับนักเรียน</h3>
                            <p className="text-base text-yellow-800 leading-relaxed">
                              นี่คือโอกาสพิเศษที่จะได้เรียนต่อในระดับมหาวิทยาลัยชั้นนำ พร้อมประสบการณ์การเรียนรู้ด้าน Robotics และ AI ที่ทันสมัย
                              <span className="font-bold"> มีเพียง 8 ที่นั่งต่อปีเท่านั้น!</span>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="text-center pt-4">
                      <Button
                        onClick={() => setShowSchoolQuotaPopup(false)}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold px-12 py-3 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        เข้าใจแล้ว
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {/* END UPDATED SCHOOL QUOTA POPUP */}
          </div>

          <div className="container mx-auto px-6">
            <Tabs defaultValue="school" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="school" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  School Package
                </TabsTrigger>
                <TabsTrigger value="individual" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Individual Premium
                </TabsTrigger>
              </TabsList>

              <TabsContent value="school" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">School Package</h2>
                  <p className="text-muted-foreground">สำหรับโรงเรียนที่ต้องการจัดหลักสูตรให้นักเรียนทั้งคลาส</p>
                </div>

                <div className="max-w-6xl mx-auto">
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                      <CardTitle className="text-center text-2xl">Pricing Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left font-semibold">Module</th>
                              <th className="px-6 py-4 text-center font-semibold">
                                <div className="flex items-center justify-center gap-2">
                                  <Users className="h-4 w-4" />
                                  School Package
                                </div>
                                <div className="text-xs text-green-600 font-semibold">Base - คุ้มค่าที่สุด</div>
                              </th>
                              <th className="px-6 py-4 text-center font-semibold">
                                <div className="flex items-center justify-center gap-2">
                                  <Star className="h-4 w-4" />
                                  Individual Premium
                                </div>
                                <div className="text-xs text-orange-600 font-semibold">Premium Track</div>
                              </th>
                              <th className="px-6 py-4 text-center font-semibold">
                                <div className="text-green-600">💰 ประหยัด</div>
                                <div className="text-xs text-green-600 font-semibold">(30 คน)</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pricingData.map((item, index) => {
                              const individualTotal30 = item.individualPrice * 30
                              const savings = individualTotal30 - item.schoolPrice

                              return (
                                <tr key={index} className="border-b hover:bg-gray-50/50">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-8 h-8 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-sm`}
                                      >
                                        {index + 1}
                                      </div>
                                      <div>
                                        <div className="font-semibold">{item.module}</div>
                                        <div className="text-sm text-muted-foreground">{item.title}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                      {item.schoolPrice.toLocaleString()} ฿
                                    </div>
                                    <div className="text-sm text-muted-foreground">ต่อคลาส (30-40 คน)</div>
                                    <div className="text-sm font-semibold text-green-700 mt-1">
                                      ≈ {Math.round(item.schoolPrice / 30).toLocaleString()} ฿/คน
                                    </div>
                                    <div className="mt-1">
                                      <Badge className="bg-green-100 text-green-700 text-xs">
                                        ลด {item.discountPercent}%
                                      </Badge>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                      {item.individualPrice.toLocaleString()} ฿
                                    </div>
                                    <div className="text-sm text-muted-foreground">ต่อคน</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      30 คน = {individualTotal30.toLocaleString()} ฿
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="text-xl font-bold text-green-600">{savings.toLocaleString()} ฿</div>
                                    <div className="text-sm font-semibold text-green-700">
                                      ประหยัด {item.discountPercent}%
                                    </div>
                                    <div className="text-xs text-green-600 mt-1">vs Individual Premium</div>
                                  </td>
                                </tr>
                              )
                            })}
                            <tr className="border-b-2 border-green-200 bg-green-50/50 font-bold">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                                    ∑
                                  </div>
                                  <div>
                                    <div className="font-bold text-lg">รวมทั้งหมด</div>
                                    <div className="text-sm text-green-700">All 4 Modules</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-3xl font-bold text-green-600">
                                  {totalSchoolPrice.toLocaleString()} ฿
                                </div>
                                <div className="text-sm text-green-700 font-semibold">School Package</div>
                                <div className="text-sm font-semibold text-green-700 mt-1">
                                  ≈ {Math.round(totalSchoolPrice / 30).toLocaleString()} ฿/คน
                                </div>
                                <div className="mt-1">
                                  <Badge className="bg-green-100 text-green-700 text-sm">เฉลี่ยลด 37.5%</Badge>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-3xl font-bold text-orange-600">
                                  {totalIndividualPrice.toLocaleString()} ฿
                                </div>
                                <div className="text-sm text-orange-700 font-semibold">ต่อคน</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  30 คน = {(totalIndividualPrice * 30).toLocaleString()} ฿
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-3xl font-bold text-green-600">
                                  {(totalIndividualPrice * 30 - totalSchoolPrice).toLocaleString()} ฿
                                </div>
                                <div className="text-sm font-bold text-green-700">
                                  ประหยัด{" "}
                                  {Math.round(
                                    ((totalIndividualPrice * 30 - totalSchoolPrice) / (totalIndividualPrice * 30)) *
                                      100,
                                  )}
                                  %
                                </div>
                                <div className="text-xs text-green-600 mt-1">🎉 ประหยัดมหาศาล!</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-blue-900">หมายเหตุสำหรับโรงเรียน</h3>
                          <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span>ราคาสำหรับโรงเรียนคิดเป็นก้อนตามจำนวนขั้นต่ำ 30-40 คน</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span>หากนักเรียนเกิน 40 คน → คิดเพิ่มรายหัวตามเรทปกติ</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span>ราคานี้รวม ทีมสอน, staff, อุปกรณ์หลัก, ระบบสอบ และค่าธรรมเนียมบัตรเครดิตแล้ว</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-3">
                          <h3 className="font-semibold text-green-900">ข้อดีของ School Package</h3>
                          <ul className="space-y-2 text-sm text-green-800">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>
                                <strong>ประหยัดมหาศาล!</strong> หากเรียนรายบุคคล 30 คน ={" "}
                                {(totalIndividualPrice * 30).toLocaleString()} ฿ แต่ School Package เพียง{" "}
                                {totalSchoolPrice.toLocaleString()} ฿
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>
                                <strong>
                                  ประหยัดได้ {(totalIndividualPrice * 30 - totalSchoolPrice).toLocaleString()} ฿
                                </strong>{" "}
                                เมื่อเทียบกับการเรียน Individual Premium 30 คน
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>
                                <strong>ส่วนลดเพิ่มขึ้นทุก Module!</strong> เริ่มต้น 30% และเพิ่มขึ้นเป็น 45% ใน Module สุดท้าย
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>Investment เพื่อให้นักเรียนมี pathway สู่โควต้า + portfolio STEM</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>โรงเรียนสามารถจัดงบประมาณได้ชัดเจน ไม่ต้องเก็บเงินจากนักเรียน</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>หลักสูตรครบถ้วนสำหรับทั้งคลาส พร้อมการสนับสนุนจากทีมงาน</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="individual" className="space-y-8">
                <div className="text-center mb-8">
                  <Badge className="mb-4 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-200 px-4 py-2 text-sm font-semibold">
                    ⭐ Individual Premium Track
                  </Badge>
                  <h2 className="text-2xl font-bold mb-2">Individual Premium Track</h2>
                  <p className="text-muted-foreground">สำหรับผู้เรียนรายบุคคลที่ต้องการประสบการณ์เรียนรู้แบบ Exclusive</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {pricingData.map((item, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-orange-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 shadow-lg"
                    >
                      <CardHeader className="text-center pb-4">
                        <div
                          className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg`}
                        >
                          {index + 1}
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900">{item.module}</CardTitle>
                        <p className="text-sm text-gray-600 font-medium">{item.title}</p>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="mb-6">
                          <div className="text-4xl font-extrabold text-orange-600 mb-2 drop-shadow-sm">
                            {item.individualPrice.toLocaleString()} ฿
                          </div>
                          <div className="text-sm text-gray-500">
                            ต่อคน ({item.dailyPrice.toLocaleString()} ฿/session)
                          </div>
                          <div className="text-xs text-blue-600 mt-1">รวมค่าสอบและค่าธรรมเนียมบัตรเครดิต</div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="font-semibold bg-orange-100 text-orange-700 border border-orange-200 px-4 py-1 hover:bg-orange-200"
                        >
                          {item.duration}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="max-w-2xl mx-auto mb-8">
                  <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-semibold text-amber-900 mb-2">ราคารวมทั้ง 4 โมดูล</h3>
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {totalIndividualPrice.toLocaleString()} ฿
                      </div>
                      <p className="text-sm text-amber-700">
                        <strong>แนะนำ:</strong> หากเรียนครบ 4 โมดูลจะได้ประสบการณ์เรียนรู้ที่สมบูรณ์และ portfolio ที่แข็งแกร่ง
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="max-w-4xl mx-auto mb-8">
                  <Card className="border-orange-200 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-semibold text-orange-900 mb-4">Premium Track Benefits</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                              <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-orange-900">เวลาตัวต่อตัวมากกว่า</div>
                                <div className="text-sm text-orange-700">ได้รับความใส่ใจเป็นพิเศษจาก Instructor</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-orange-900">Feedback รายบุคคล</div>
                                <div className="text-sm text-orange-700">คำแนะนำเฉพาะตัวสำหรับการพัฒนา</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Award className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-orange-900">Certificate เฉพาะ</div>
                                <div className="text-sm text-orange-700">ใบประกาศนียบัตรสำหรับ Premium Track</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Star className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-orange-900">Exclusive Access</div>
                                <div className="text-sm text-orange-700">เข้าถึงเนื้อหาและกิจกรรมพิเศษ</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="max-w-4xl mx-auto mb-8">
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-2">แนะนำสำหรับ</h3>
                          <p className="text-sm text-blue-800 mb-3">
                            ผู้เรียนรายบุคคลที่ไม่ได้เข้าผ่านโรงเรียน แต่ยังอยากเก็บ portfolio และสิทธิ์สอบโควต้า
                            พร้อมรับประสบการณ์การเรียนรู้แบบ Premium ที่ได้รับความใส่ใจเป็นพิเศษ
                          </p>
                          <p className="text-sm text-blue-800 font-medium">
                            💡 <strong>คำแนะนำ:</strong> หากเรียนครบ 4 โมดูลจะได้ประโยชน์สูงสุดและ portfolio ที่สมบูรณ์
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  )
}
