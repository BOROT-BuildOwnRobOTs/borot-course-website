"use client"

import { Navbar } from "@/components/navbar"
import { ModuleSlideshow } from "@/components/module-slideshow"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, CheckCircle2, Award, Shield, Globe, QrCode, ArrowDown } from "lucide-react"

export default function ModulesPage() {
  const scrollToCertificate = () => {
    const element = document.getElementById('certificate-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <ModuleSlideshow />
        
        {/* Floating Button */}
        <Button
          onClick={scrollToCertificate}
          size="lg"
          className="fixed bottom-8 right-8 z-50 rounded-full w-14 h-14 shadow-2xl hover:shadow-primary/50 transition-all duration-300 group bg-primary hover:bg-primary/90"
        >
          <div className="flex flex-col items-center">
            <Award className="w-6 h-6" />
            <ArrowDown className="w-4 h-4 -mt-1 group-hover:translate-y-1 transition-transform" />
          </div>
        </Button>
        
        {/* Certificate Highlights Section */}
        <section id="certificate-section" className="py-16 px-6 scroll-mt-16">
          <div className="container mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8 md:p-12 border-2 border-primary/20">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
              
              <div className="relative">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-3 mb-6">
                    <div className="h-1 w-8 bg-primary rounded-full" />
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent py-2 leading-tight">
                      จุดเด่นของใบรับรองจากสถาบันเรา
                    </h2>
                    <Sparkles className="w-6 h-6 text-primary" />
                    <div className="h-1 w-8 bg-primary rounded-full" />
                  </div>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    ใบรับรองมาตรฐานสากล พร้อมเทคโนโลยี Blockchain
                  </p>
                </div>

                <div className="space-y-6">
                  {/* First row - 3 cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-8">
                        <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all shadow-lg">
                          <CheckCircle2 className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                          ยืนยันผลงานและความสามารถจริง
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          แสดงถึงผลงานที่นักเรียนได้สร้างหรือเข้าร่วมจริง พร้อมรายละเอียดที่ตรวจสอบได้
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-8">
                        <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all shadow-lg">
                          <Award className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                          ได้รับการรับรองโดยมหาวิทยาลัย
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          ออกโดยสถาบันการศึกษาที่เชื่อถือได้ ช่วยเพิ่มน้ำหนักให้กับแฟ้มสะสมผลงาน
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-8">
                        <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all shadow-lg">
                          <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                          ปลอดภัยและตรวจสอบได้ทุกเวลา
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          ข้อมูลบันทึกบนบล็อกเชน ป้องกันการปลอมแปลง และตรวจสอบได้ตลอดเวลา
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Second row - 2 cards centered */}
                  <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <Card className="border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-8">
                        <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all shadow-lg">
                          <Globe className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                          ทันสมัยและเป็นทางการ
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          ใช้เทคโนโลยีดิจิทัลเดียวกับระบบระดับโลก แสดงถึงมาตรฐานของผลงานยุคใหม่
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-8">
                        <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all shadow-lg">
                          <QrCode className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                          ยืนยันผลงานได้ง่าย ทุกที่ ทุกเวลา
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          เพียงสแกน QR หรือเปิดลิงก์ ก็สามารถตรวจสอบใบรับรองและรายละเอียดผลงานได้ทันที
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
