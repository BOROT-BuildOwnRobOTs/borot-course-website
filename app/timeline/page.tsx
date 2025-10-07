import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, FileText, Users, AlertCircle, BookOpen, Award, CheckCircle } from "lucide-react"

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Calendar className="h-4 w-4" />
            Learning Schedule & Timeline
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            <span className="text-foreground">ตารางเวลา</span> <span className="text-primary">การเรียน</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto text-balance">
            ตารางเวลาการเรียนแบบปฏิทิน เข้าใจง่าย ชัดเจน พร้อมความยืดหยุ่นตามความต้องการของโรงเรียน
          </p>
        </div>

        <Card className="mb-12 shadow-lg border">
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
          <CardContent className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="p-4 text-left font-semibold">สัปดาห์</th>
                    <th className="p-4 text-center font-semibold">จันทร์</th>
                    <th className="p-4 text-center font-semibold">อังคาร</th>
                    <th className="p-4 text-center font-semibold">พุธ</th>
                    <th className="p-4 text-center font-semibold">พฤหัสบดี</th>
                    <th className="p-4 text-center font-semibold">ศุกร์</th>
                    <th className="p-4 text-center font-semibold">เสาร์</th>
                    <th className="p-4 text-center font-semibold">อาทิตย์</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((week) => (
                    <tr key={week} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-semibold bg-muted text-foreground">สัปดาห์ที่ {week}</td>
                      <td className="p-3 text-center"></td>
                      <td className="p-3 text-center"></td>
                      <td className="p-3 text-center">
                        <div
                          className={`rounded-lg p-3 ${
                            week === 5 ? "bg-orange-50 border border-orange-200" : "bg-green-50 border border-green-200"
                          }`}
                        >
                          {week === 5 ? (
                            <>
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <FileText className="h-4 w-4 text-orange-700" />
                                <span className="font-semibold text-orange-800">ผ่าน Module</span>
                              </div>
                              <div className="text-xs text-orange-600 font-medium">ข้อเขียน + ปฏิบัติ</div>
                              <div className="flex items-center justify-center gap-1 mt-1">
                                <Award className="h-3 w-3 text-blue-600" />
                                <span className="text-xs text-blue-700 font-medium">Certificate for next module</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <BookOpen className="h-4 w-4 text-green-700" />
                                <span className="font-semibold text-green-800">Session {week}</span>
                              </div>
                              <div className="text-xs text-green-600 font-medium">9:00-16:00</div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center"></td>
                      <td className="p-3 text-center"></td>
                      <td className="p-3 text-center"></td>
                      <td className="p-3 text-center"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-6 bg-muted rounded-xl border">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-lg">💡 ความยืดหยุ่นในการจัดตาราง</h4>
                  <ul className="text-muted-foreground space-y-2">
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

        <Card className="mb-12 shadow-lg border">
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
          <CardContent className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg">
                <thead>
                  <tr className="bg-secondary text-secondary-foreground">
                    <th className="p-4 text-left font-semibold">เดือน</th>
                    <th className="p-4 text-center font-semibold">กิจกรรม</th>
                    <th className="p-4 text-center font-semibold">เวลา</th>
                    <th className="p-4 text-center font-semibold">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((month) => (
                    <tr key={month} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-semibold bg-muted text-foreground">เดือนที่ {month}</td>
                      <td className="p-4 text-center">
                        {month === 5 ? (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                            <FileText className="h-4 w-4 text-orange-700" />
                            <span className="font-semibold text-orange-800">ผ่าน Module</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                            <BookOpen className="h-4 w-4 text-green-700" />
                            <span className="font-semibold text-green-800">Session {month}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center font-medium">9:00-16:00</td>
                      <td className="p-4 text-center text-sm text-muted-foreground">
                        {month === 5 ? "ข้อเขียน + ปฏิบัติ + Certificate for next module" : "เลือกวันที่สะดวก"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-lg border">
            <CardHeader className="bg-destructive text-destructive-foreground">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-destructive-foreground/20 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                ระบบการสอบ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-800 text-lg">สอบครั้งแรก - ฟรี!</h4>
                </div>
                <p className="text-green-700">สำหรับผู้ที่เรียนครบทั้ง 4 โมดูล สามารถสอบครั้งแรกได้ฟรี</p>
              </div>

              <div className="p-5 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-orange-800 text-lg">สอบซ้ำ</h4>
                </div>
                <p className="text-orange-700 mb-3">หากสอบไม่ผ่าน สามารถสอบซ้ำได้</p>
                <Badge className="bg-orange-100 text-orange-800 border-orange-300 px-3 py-1">
                  ค่าธรรมเนียม +500 บาท/คน
                </Badge>
              </div>

              <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-800 text-lg">รูปแบบการสอบ</h4>
                </div>
                <ul className="text-blue-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    ข้อเขียน (ทฤษฎี)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    ภาคปฏิบัติ (Hands-on)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary-foreground/20 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                ข้อมูลสำคัญ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-800 text-lg">ขนาดคลาส</h4>
                </div>
                <p className="text-blue-700">30-40 คน ต่อคลาส (School Package)</p>
              </div>

              <div className="p-5 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-purple-800 text-lg">เวลาเรียน</h4>
                </div>
                <p className="text-purple-700">9:00-16:00 น. (7 ชั่วโมง/วัน)</p>
              </div>

              <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-800 text-lg">ความยืดหยุ่น</h4>
                </div>
                <p className="text-green-700">โรงเรียนเลือกวันเรียนได้ตามความสะดวก</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border">
          <CardHeader className="bg-secondary text-secondary-foreground">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-secondary-foreground/20 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
              ตารางเรียนครบหลักสูตร 4 Modules (แบบรายสัปดาห์)
            </CardTitle>
            <CardDescription className="text-secondary-foreground/80 text-base">
              ภาพรวมการเรียนทั้งหมด 20 สัปดาห์
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg text-sm">
                <thead>
                  <tr className="bg-secondary text-secondary-foreground">
                    <th className="p-4 font-semibold">Module</th>
                    <th className="p-4 font-semibold">สัปดาห์ที่ 1</th>
                    <th className="p-4 font-semibold">สัปดาห์ที่ 2</th>
                    <th className="p-4 font-semibold">สัปดาห์ที่ 3</th>
                    <th className="p-4 font-semibold">สัปดาห์ที่ 4</th>
                    <th className="p-4 font-semibold">สัปดาห์ที่ 5</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map((moduleNum) => (
                    <tr key={moduleNum} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-semibold bg-muted text-foreground">Module {moduleNum}</td>
                      {[1, 2, 3, 4, 5].map((session) => (
                        <td key={session} className="p-3 text-center">
                          {session === 5 ? (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <FileText className="h-3 w-3 text-orange-700" />
                                <span className="font-semibold text-orange-800">Exam</span>
                              </div>
                              <div className="text-xs text-orange-600 font-medium mb-1">ผ่าน Module</div>
                              <div className="flex items-center justify-center gap-1">
                                <Award className="h-3 w-3 text-blue-600" />
                                <span className="text-xs text-blue-700 font-medium">Certificate for next module</span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <BookOpen className="h-3 w-3 text-green-700" />
                                <span className="font-semibold text-green-800">Session {session}</span>
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

            <div className="mt-10 p-8 bg-muted rounded-xl border">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-4 text-xl">📊 สรุประยะเวลาทั้งหมด</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 bg-card rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">แบบรายสัปดาห์</span>
                      </div>
                      <p className="text-muted-foreground">20 สัปดาห์ (5 เดือน)</p>
                    </div>
                    <div className="p-4 bg-card rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">แบบรายเดือน</span>
                      </div>
                      <p className="text-muted-foreground">20 เดือน</p>
                    </div>
                    <div className="p-4 bg-card rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">ยืดหยุ่น</span>
                      </div>
                      <p className="text-muted-foreground">ปรับตารางได้ตามความเหมาะสม</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
