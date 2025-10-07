import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, CreditCard, Calendar, Banknote } from "lucide-react"

export default function PaymentPlansPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-16">
        <div className="container mx-auto px-6 py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              แก้ปัญหา Cash Flow
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              แผนการชำระเงิน
              <span className="text-primary"> แบ่งจ่าย</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              แบ่งจ่าย 3 งวด ไม่ต้องจ่ายครั้งเดียว 262,500 บาท
            </p>
          </div>

          {/* Payment Methods */}
          <div className="flex items-center justify-center gap-6 mb-12">
            <div className="flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-full border border-blue-200">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="text-blue-700 font-medium">บัตรเครดิต</span>
            </div>
            <div className="flex items-center gap-3 bg-green-50 px-6 py-3 rounded-full border border-green-200">
              <Banknote className="h-5 w-5 text-green-600" />
              <span className="text-green-700 font-medium">โอนธนาคาร</span>
            </div>
          </div>

          <Card className="max-w-4xl mx-auto mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">แผนการชำระ 3 งวด</CardTitle>
              <CardDescription>แต่ละงวด 87,500 บาท</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    1
                  </div>
                  <h3 className="font-semibold text-lg mb-2">ก่อนเริ่มเรียน</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-2">87,500฿</p>
                  <p className="text-sm text-muted-foreground">งวดแรก</p>
                </div>

                <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    2
                  </div>
                  <h3 className="font-semibold text-lg mb-2">กลางคอร์ส</h3>
                  <p className="text-3xl font-bold text-orange-600 mb-2">87,500฿</p>
                  <p className="text-sm text-muted-foreground">หลังเรียนไป 2 ครั้ง</p>
                </div>

                <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    3
                  </div>
                  <h3 className="font-semibold text-lg mb-2">ก่อนสอบ</h3>
                  <p className="text-3xl font-bold text-green-600 mb-2">87,500฿</p>
                  <p className="text-sm text-muted-foreground">งวดสุดท้าย</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <CardTitle>ข้อดีการแบ่งจ่าย</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>ลดภาระ Cash Flow ของโรงเรียน</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>ชำระด้วยบัตรเครดิตได้ทันที</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>จ่ายตามความคืบหน้าการเรียน</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>ได้คุณภาพการสอนเต็มที่</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <CardTitle>ความยืดหยุ่น</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>เรียนแบบเดิม: 5 สัปดาห์</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>เรียนแบบใหม่: 10 สัปดาห์</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>เรียนแบบยืดหยุ่น: 5 เดือน</span>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">ยิ่งยืดเวลา ยิ่งลดภาระการเงิน</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
