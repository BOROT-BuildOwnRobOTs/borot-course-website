"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Briefcase, ChevronRight, Users } from "lucide-react"
import type { CarouselApi } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

export function ShowCaseSection() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [openDialog, setOpenDialog] = useState<number | null>(null)
  
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  const showcases = [
    {
      id: 1,
      logos: ["/images/show_case/showcase-logo-1.png"],
      images: [
        "/images/show_case/showcase-1-1.png",
        "/images/show_case/showcase-1-2.png",
        "/images/show_case/showcase-1-3.png"
      ],
      title: "ค่ายอบรมการเขียนโปรแกรม วิทยาการหุ่นยนต์ และปัญญาประดิษฐ์",
      subtitle: "โครงการอบรมเชิงปฏิบัติการสำหรับนักเรียนระดับประถมศึกษาและมัธยมศึกษา เพื่อเสริมสร้างพื้นฐานด้านการเขียนโปรแกรม หุ่นยนต์ และปัญญาประดิษฐ์",
      footer: "โรงเรียนสาธิตแห่งมหาวิทยาลัยเกษตรศาสตร์ จังหวัดชลบุรี",
      gradient: "from-orange-400 via-amber-500 to-yellow-500",
    },
    {
      id: 2,
      logos: ["/images/show_case/showcase-logo-2.png"],
      images: [
        "/images/show_case/showcase-2-1.png",
        "/images/show_case/showcase-2-2.png"
      ],
      title: "ค่ายอบรมวิทยาการหุ่นยนต์และปัญญาประดิษฐ์ สำหรับนักเรียนมัธยมปลาย",
      subtitle: "ความร่วมมือระหว่าง Borot และ Know Are เพื่อพัฒนาเยาวชนที่สนใจศึกษาต่อด้านวิศวกรรมหุ่นยนต์และปัญญาประดิษฐ์ ผ่านกิจกรรมเชิงปฏิบัติที่ผสานความรู้และเทคโนโลยีเข้าด้วยกัน",
      footer: "ร่วมจัดโดย Borot Co., Ltd. และ Know Are",
      gradient: "from-red-500 via-orange-500 to-amber-500",
    },
    {
      id: 3,
      logos: ["/images/show_case/showcase-logo-3.png"],
      images: [
        "/images/show_case/showcase-3-1.png",
        "/images/show_case/showcase-3-2.png",
        "/images/show_case/showcase-3-3.png"
      ],
      title: "โครงการส่งเสริมการเรียนรู้หุ่นยนต์และการเขียนโปรแกรม สำหรับเยาวชนในงาน Play Fun Fest",
      subtitle: "ความร่วมมือระหว่าง Borot และ บพค. (PMU-B) ในการจัดกิจกรรมเวิร์กชอปเขียนโปรแกรมหุ่นยนต์สำหรับเยาวชน ภายในงาน Play Fun Fest เนื่องในโอกาสวันเด็กแห่งชาติ เพื่อส่งเสริมการเรียนรู้ด้านเทคโนโลยีและวิทยาการหุ่นยนต์",
      footer: "จัดโดย Borot Co., Ltd. ร่วมกับ บพค. (PMU-B)",
      gradient: "from-amber-600 via-orange-600 to-red-600",
    },
    {
      id: 4,
      logos: [
        "/images/show_case/showcase-logo-4.png",
        "/images/show_case/showcase-logo-4-1.png",
        "/images/show_case/showcase-logo-4-2.png",
        "/images/show_case/showcase-logo-4-3.png"
      ],
      images: [
        "/images/show_case/showcase-4-1.png",
        "/images/show_case/showcase-4-2.png",
        "/images/show_case/showcase-4-3.png"
      ],
      title: "โครงการเวิร์กชอปสร้างสรรค์นวัตกรรมหุ่นยนต์และงานออกแบบ 3 มิติ",
      subtitle: "ความร่วมมือระหว่าง Borot, มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (KMUTT) และสถาบันวิทยาการหุ่นยนต์ภาคสนาม (FIBO) จัดกิจกรรมเวิร์กชอปให้เยาวชนได้เรียนรู้พื้นฐานการออกแบบงาน 3 มิติ และการต่อวงจรไฟฟ้าผ่านกิจกรรมลงมือทำจริง ณ CX Smart Play",
      footer: "จัดโดย Borot Co., Ltd. ร่วมกับ KMUTT, FIBO และ KX Smart Play",
      gradient: "from-yellow-500 via-orange-500 to-red-500",
    },
    {
      id: 5,
      logos: [
        "/images/show_case/showcase-logo-4.png",
        "/images/show_case/showcase-logo-4-1.png",
        "/images/show_case/showcase-logo-4-2.png",
        "/images/show_case/showcase-logo-4-3.png"
      ],
      images: [
        "/images/show_case/showcase-5-1.png",
        "/images/show_case/showcase-5-2.png",
        "/images/show_case/showcase-5-3.png"
      ],
      title: "โครงการเวิร์กชอปสร้างหุ่นยนต์และต่อวงจรไฟฟ้า",
      subtitle: "ความร่วมมือระหว่าง Borot, มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (KMUTT) และสถาบันวิทยาการหุ่นยนต์ภาคสนาม (FIBO) จัดกิจกรรมเวิร์กชอปเชิงปฏิบัติการให้นักเรียนได้เรียนรู้พื้นฐานการเขียนโปรแกรมสั่งการหุ่นยนต์ การต่อวงจรไฟฟ้า และการสร้างชิ้นงาน 3 มิติ ณ CX Smart Play",
      footer: "จัดโดย Borot Co., Ltd. ร่วมกับ KMUTT, FIBO และ KX Smart Play",
      gradient: "from-orange-500 via-red-500 to-pink-500",
    },
    {
      id: 6,
      logos: [
        "/images/show_case/showcase-logo-6.png",
        "/images/show_case/showcase-logo-4-1.png",
        "/images/show_case/showcase-logo-4-2.png",
        "/images/show_case/showcase-logo-4.png"
      ],
      images: [
        "/images/show_case/showcase-6-1.png",
        "/images/show_case/showcase-6-2.png"
      ],
      title: "โครงการเวิร์กชอปเขียนโปรแกรม Micro:bit สำหรับเยาวชน",
      subtitle: "ความร่วมมือระหว่าง Borot, มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (KMUTT) และสถาบันวิทยาการหุ่นยนต์ภาคสนาม (FIBO) จัดกิจกรรมเวิร์กชอปสอนเขียนโปรแกรมเบื้องต้นด้วย Micro:bit ในรูปแบบ Block-based Coding สำหรับเด็กและเยาวชน ณ ศูนย์สิริกิติ์ ภายในงาน Thailand SciFair",
      footer: "จัดโดย Borot Co., Ltd. ร่วมกับ KMUTT, FIBO และ Thailand SciFair",
      gradient: "from-blue-500 via-purple-500 to-pink-500",
    },
    {
      id: 7,
      logos: [
        "/images/show_case/showcase-logo-7.png",
        "/images/show_case/showcase-logo-4-1.png",
        "/images/show_case/showcase-logo-4-2.png",
        "/images/show_case/showcase-logo-4.png"
      ],
      images: [
        "/images/show_case/showcase-7-1.png",
        "/images/show_case/showcase-7-2.png",
        "/images/show_case/showcase-7-3.png"
      ],
      title: "โครงการสาธิตเทคโนโลยีหุ่นยนต์ในงานครบรอบ 25 ปี FIBO",
      subtitle: "ความร่วมมือระหว่าง Borot และคณะวิศวกรรมหุ่นยนต์และระบบอัตโนมัติ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (KMUTT) ในการจัดแสดงและสาธิตเทคโนโลยีหุ่นยนต์อุตสาหกรรมแขนกล เพื่อเฉลิมฉลองครบรอบ 25 ปีของสถาบันวิทยาการหุ่นยนต์ภาคสนาม (FIBO)",
      footer: "จัดโดย Borot Co., Ltd. ร่วมกับ FIBO และคณะวิศวกรรมหุ่นยนต์และระบบอัตโนมัติ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี",
      gradient: "from-green-500 via-teal-500 to-cyan-500",
    }
  ]

  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <section className="py-12 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-6 space-y-3">
          <h2 className="text-5xl md:text-6xl font-bold text-balance py-2">
            <span className="text-foreground">ผลงาน </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 leading-tight">Company Profile</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            โครงการและกิจกรรมที่เราได้ร่วมมือกับสถาบันการศึกษาและองค์กรชั้นนำ
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[plugin.current as any]}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent>
              {showcases.map((showcase, index) => (
                <CarouselItem key={showcase.id}>
                  <Card className="border-0 bg-transparent shadow-none">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Image Section */}
                        <div className="relative group">
                          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            {/* Main Image Display - Grid based on number of images */}
                            <div 
                              className={`grid gap-3 p-5 bg-gradient-to-br ${showcase.gradient}`}
                              style={{
                                gridTemplateColumns: showcase.images.length === 1 
                                  ? "1fr" 
                                  : showcase.images.length === 2 
                                  ? "1fr 1fr" 
                                  : "repeat(2, 1fr)",
                                minHeight: showcase.images.length === 1 
                                  ? "420px" 
                                  : showcase.images.length === 2 
                                  ? "380px" 
                                  : "400px"
                              }}
                            >
                              {showcase.images.map((img, imgIndex) => (
                                <div
                                  key={imgIndex}
                                  className={`rounded-xl overflow-hidden relative bg-white shadow-lg ${
                                    showcase.images.length === 1 
                                      ? "col-span-1" 
                                      : showcase.images.length === 2 
                                      ? "col-span-1" 
                                      : imgIndex === 2 
                                      ? "col-span-2" 
                                      : "col-span-1"
                                  }`}
                                  style={{ 
                                    height: showcase.images.length === 1 
                                      ? "100%" 
                                      : showcase.images.length === 2 
                                      ? "100%" 
                                      : imgIndex === 2 
                                      ? "185px" 
                                      : "185px"
                                  }}
                                >
                                  <Image
                                    src={img}
                                    alt={`${showcase.title} - Image ${imgIndex + 1}`}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority={index === 0}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 bg-gradient-to-br ${showcase.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                <Briefcase className="h-6 w-6 text-white" />
                              </div>
                              <Badge className={`bg-gradient-to-r ${showcase.gradient} text-white border-0 px-4 py-1`}>
                                Project {showcase.id}
                              </Badge>
                            </div>
                            
                            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
                              {showcase.title}
                            </h3>

                            {/* Partner Logos - ย้ายมาไว้ที่นี่ */}
                            <div className="flex flex-wrap gap-2 py-2">
                              {showcase.logos.map((logo, logoIndex) => (
                                <div
                                  key={logoIndex}
                                  className="rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden border-2 border-muted"
                                  style={{
                                    width: showcase.logos.length === 1 ? "56px" : "44px",
                                    height: showcase.logos.length === 1 ? "56px" : "44px",
                                  }}
                                >
                                  <Image
                                    src={logo}
                                    alt={`Partner Logo ${logoIndex + 1}`}
                                    width={showcase.logos.length === 1 ? 56 : 44}
                                    height={showcase.logos.length === 1 ? 56 : 44}
                                    className="w-full h-full object-contain p-1.5"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                            {showcase.subtitle}
                          </p>

                          {/* Footer Info */}
                          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                            <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">ความร่วมมือกับ</p>
                              <p className="text-sm font-semibold">{showcase.footer}</p>
                            </div>
                          </div>

                          {/* CTA Button */}
                          <Dialog open={openDialog === showcase.id} onOpenChange={(open) => setOpenDialog(open ? showcase.id : null)}>
                            <DialogTrigger asChild>
                              <Button
                                size="lg"
                                className={`w-full md:w-auto bg-gradient-to-r ${showcase.gradient} text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group`}
                              >
                                ดูรายละเอียดเพิ่มเติม
                                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                              <DialogHeader>
                                <div className="flex items-center gap-4 mb-4">
                                  <div className={`w-16 h-16 bg-gradient-to-br ${showcase.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                                    <Briefcase className="h-8 w-8 text-white" />
                                  </div>
                                  <div>
                                    <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground">
                                      {showcase.title}
                                    </DialogTitle>
                                  </div>
                                </div>
                              </DialogHeader>

                              <div className="space-y-6 mt-6">
                                {/* Partner Logos */}
                                <div className="flex flex-wrap gap-4 justify-center p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                                  {showcase.logos.map((logo, logoIndex) => (
                                    <div
                                      key={logoIndex}
                                      className="rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white"
                                      style={{
                                        width: "90px",
                                        height: "90px",
                                      }}
                                    >
                                      <Image
                                        src={logo}
                                        alt={`Partner Logo ${logoIndex + 1}`}
                                        width={90}
                                        height={90}
                                        className="w-full h-full object-contain p-2"
                                      />
                                    </div>
                                  ))}
                                </div>

                                {/* All Images */}
                                <div>
                                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <div className={`w-1 h-6 bg-gradient-to-b ${showcase.gradient} rounded-full`} />
                                    ภาพกิจกรรม
                                  </h4>
                                  <div className={`grid gap-4 ${showcase.images.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                                    {showcase.images.map((img, imgIndex) => (
                                      <div
                                        key={imgIndex}
                                        className="rounded-lg overflow-hidden relative aspect-video shadow-md hover:shadow-xl transition-shadow"
                                      >
                                        <Image
                                          src={img}
                                          alt={`Activity ${imgIndex + 1}`}
                                          fill
                                          className="object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Description */}
                                <div className="p-6 bg-muted/50 rounded-xl">
                                  <h4 className="text-lg font-semibold mb-3">รายละเอียดโครงการ</h4>
                                  <p className="text-muted-foreground leading-relaxed mb-4">{showcase.subtitle}</p>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Users className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{showcase.footer}</span>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Custom Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <CarouselPrevious className="relative left-0 translate-x-0 translate-y-0 h-12 w-12 rounded-xl shadow-lg hover:shadow-xl" />
              
              {/* Dots Indicator */}
              <div className="flex gap-2">
                {showcases.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`transition-all duration-300 rounded-full ${
                      current === index
                        ? "w-8 h-3 bg-gradient-to-r from-primary to-accent"
                        : "w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Go to project ${index + 1}`}
                  />
                ))}
              </div>
              
              <CarouselNext className="relative right-0 translate-x-0 translate-y-0 h-12 w-12 rounded-xl shadow-lg hover:shadow-xl" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  )
}