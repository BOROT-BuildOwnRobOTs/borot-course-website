"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Award, BookOpen, Users, Target, Heart } from "lucide-react"
import Image from "next/image"
import { ShowCaseSection } from "@/components/showcase-section"

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <div className="py-12">
          {/* <div className="container mx-auto px-6 text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-balance mb-6">
              <span className="text-foreground">เกี่ยวกับ</span> <span className="text-primary">BOROT</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
              บริษัทผู้นำด้านการศึกษาวิศวกรรมและเทคโนโลยีหุ่นยนต์
            </p>
          </div> */}

          {/* Show Case Section - ย้ายมาไว้ด้านบนสุด */}
          <ShowCaseSection />

          <div className="container mx-auto px-6 space-y-12 mt-12">
            {/* Company Info */}
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-12 text-center">
                <div className="mb-8">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white p-4">
                    <Image
                      src="/images/borot-logo.png"
                      alt="BOROT Logo"
                      width={96}
                      height={96}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">BOROT Company</h2>
                  <Badge variant="outline" className="mb-6">
                    Engineering Education Leader
                  </Badge>
                </div>

                <div className="space-y-10 max-w-3xl mx-auto">
                  {/* About Us Section */}
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">About Us</h3>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Borot เกิดขึ้นจากกลุ่มนักศึกษาวิศวกรรมหุ่นยนต์และระบบอัตโนมัติ ที่มีความสนใจและหลงใหลในด้านหุ่นยนต์และปัญญาประดิษฐ์
                      โดยมีความต้องการที่จะผลักดันให้คนไทยมีความรู้และให้ความสำคัญกับวิทยาการหุ่นยนต์และปัญญาประดิษฐ์
                      เพื่อเพิ่มขีดความสามารถของคนในประเทศในยุคที่ขับเคลื่อนด้วยเทคโนโลยี
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border"></div>

                  {/* Our Goal Section */}
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-secondary" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Our Goal</h3>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Borot มีจุดมุ่งหมายในการพัฒนาเยาวชนไทยให้มีความรู้ ความสามารถ ทางด้านหุ่นยนต์และปัญญาประดิษฐ์
                      เพื่อที่จะเป็นกำลังขับเคลื่อนและเพิ่มศักยภาพให้กับสังคม ในยุคที่เทคโนโลยีพัฒนาอย่างรวดเร็ว
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partnership Section */}
            <Card className="max-w-6xl mx-auto">
              <CardContent className="p-12">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    <span className="text-foreground">ความร่วมมือกับ</span>{" "}
                    <span className="text-primary">มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
                    โครงการความร่วมมือพิเศษที่เปิดโอกาสให้ผู้เรียนได้รับการศึกษาต่อในระดับมหาวิทยาลัย
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {/* Campus Image */}
                  <div className="order-2 md:order-1">
                    <div className="rounded-2xl overflow-hidden shadow-2xl">
                      <Image
                        src="/images/kmutt-campus.png"
                        alt="KMUTT Ratchaburi Campus"
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี วิทยาเขตราชบุรี
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="order-1 md:order-2 space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">โควตาพิเศษ</h3>
                        <p className="text-muted-foreground">
                          ผู้ที่จบครบ 4 โมดูลและสอบผ่าน จะได้รับโควตาเข้าศึกษาต่อที่ มจธ. วิทยาเขตราชบุรี
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">ทุนการศึกษา</h3>
                        <p className="text-muted-foreground">
                          ได้รับการพิจารณาเป็นพิเศษสำหรับทุนการศึกษาและโอกาสในการเข้าศึกษาต่อ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">หลักสูตรมาตรฐาน</h3>
                        <p className="text-muted-foreground">หลักสูตรที่ได้รับการรับรองและพัฒนาร่วมกับมหาวิทยาลัยชั้นนำ</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-chart-1/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-chart-1" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">เครือข่ายวิชาการ</h3>
                        <p className="text-muted-foreground">เข้าถึงเครือข่ายวิชาการและโอกาสในการทำงานร่วมกับอุตสาหกรรม</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partnership Logo */}
                <div className="mt-12 text-center">
                  <div className="inline-block p-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl">
                    <Image
                      src="/images/borot-kmutt-logo.png"
                      alt="BOROT x KMUTT Partnership"
                      width={400}
                      height={120}
                      className="w-auto h-16 md:h-20 object-contain mx-auto"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}