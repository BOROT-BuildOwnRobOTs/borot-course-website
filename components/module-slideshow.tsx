"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { BookOpen, Cpu, Zap, Users, Calendar, ChevronRight, Sparkles } from "lucide-react"
import type { CarouselApi } from "@/components/ui/carousel"
import { useEffect } from "react"
import Autoplay from "embla-carousel-autoplay"

export function ModuleSlideshow() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [openDialog, setOpenDialog] = useState<number | null>(null)
  
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  const modules = [
    {
      id: 1,
      title: "Explore & Build Basics",
      subtitle: "เครื่องจ่ายยาอัตโนมัติ",
      project: "Smart Dispenser Project",
      icon: BookOpen,
      duration: "5 ครั้ง × 6 ชม.",
      online: "Online 1 ครั้ง",
      onsite: "Onsite 4 ครั้ง",
      gradient: "from-orange-400 via-amber-500 to-yellow-500",
      image: "/images/module-1-learning.png",
      description:
        "เรียนรู้พื้นฐานการสร้างระบบหุ่นยนต์จากสถานการณ์จริง ผ่านโปรเจกต์ Smart Medicine Dispenser ตั้งแต่ระบบเตือนกินยาอัตโนมัติ ตรวจมือจ่ายยา การรับรู้สัญญาณชีพ การตรวจสภาพยา ไปจนถึงการรวมระบบสมบูรณ์",
      topics: [
        "ระบบเตือนอัตโนมัติ (Smart Reminder)",
        "ตรวจมือก่อนจ่ายยา (Sensor Interaction)",
        "ระบบรับรู้อาการจ่ายยา (Adaptive Dosing)",
        "ระบบตรวจสภาพยาและวัสดุ (Safety & Environment)",
        "การรวมระบบและวิเคราะห์โครงสร้าง",
      ],
      engineeringPath: {
        title: "Foundations of Interdisciplinary STEM & Smart System Design",
        skills: [
          "เข้าใจแนวคิดพื้นฐานของระบบอัตโนมัติผ่านโครงงาน Smart Medicine Dispenser",
          "เชื่อมโยงความรู้ ฟิสิกส์ เคมี ชีววิทยา และคณิตศาสตร์ เข้ากับการออกแบบหุ่นยนต์จริง",
          "ทดลองและสร้างวงจรอิเล็กทรอนิกส์พื้นฐาน (LED, Buzzer, Button, Sensor)",
          "เขียนโปรแกรมควบคุมด้วย Arduino ใช้เงื่อนไข if–else, loop และ multi-sensor integration",
          "เรียนรู้หลักการของเซนเซอร์ IR, Ultrasonic, DHT11, Pulse Sensor และการทำงานของมอเตอร์ Servo",
          "ออกแบบและทดสอบวัสดุที่มีคุณสมบัติกันชื้น/กันร้อน พร้อมวิเคราะห์ผลทางเคมีและฟิสิกส์",
          "ฝึกกระบวนการออกแบบเชิงวิศวกรรม (Design–Test–Improve) และการคิดเชิงระบบ",
          "ทำงานร่วมกันในทีม พัฒนาแนวทางแก้ปัญหาจริง และสื่อสารหลักการเชิงวิทยาศาสตร์",
        ],
        outcomes: [
          "เข้าใจวงจรการทำงานของระบบ Input–Process–Output–Feedback อย่างครบวงจร",
          "มองเห็นความเชื่อมโยงของศาสตร์ต่าง ๆ ในการแก้ปัญหาจริง",
          "สามารถวิเคราะห์และปรับปรุงระบบจากข้อมูลการทดลองจริงได้อย่างมีหลักการ",
          "พัฒนาแนวคิดเชิงออกแบบและการคิดแบบผู้สร้าง (Maker Mindset)",
          "สร้างต้นแบบ Smart Dispenser ที่ทำงานได้จริง มีความปลอดภัย",
          "สื่อสารผลการทดลองและกระบวนการคิดได้อย่างเป็นระบบ",
        ],
      },
    },
    {
      id: 2,
      title: "Smart Hospital Rescue Bot",
      subtitle: "หุ่นยนต์ขนส่งอวัยวะอัจฉริยะ",
      project: "IoT Ambulance Robot",
      icon: Cpu,
      duration: "5 ครั้ง × 6 ชม.",
      online: "Online 2 ครั้ง",
      onsite: "Onsite 3 ครั้ง",
      gradient: "from-red-500 via-orange-500 to-amber-500",
      image: "/images/module-2-learning.png",
      description:
        "เรียนรู้ระบบหุ่นยนต์อัตโนมัติและการเชื่อมต่อข้อมูลผ่าน Internet of Things (IoT) โดยจำลองสถานการณ์จริงของการขนส่งอวัยวะในโรงพยาบาล สร้างหุ่นยนต์ขนส่งที่สามารถตรวจจับเส้นทาง หลีกสิ่งกีดขวาง วัดอุณหภูมิ และส่งข้อมูลแบบเรียลไทม์ผ่าน Dashboard",
      topics: [
        "การสร้างหุ่นยนต์ขนส่งอวัยวะจำลอง",
        "การติดตั้งเซนเซอร์วัดอุณหภูมิ ความชื้น การเอียง",
        "การเชื่อมต่อข้อมูลจากหุ่นยนต์เข้าสู่ระบบ IoT ผ่าน Wi-Fi",
        "การแสดงผลข้อมูลแบบเรียลไทม์บน Dashboard",
        "การทดลองในสถานการณ์จำลอง",
        "การนำเสนอผลงานและแนวคิดเชิงวิศวกรรม",
      ],
      engineeringPath: {
        title: "Foundations of IoT & Autonomous Robotics Engineering",
        skills: [
          "เขียนโปรแกรมควบคุมบอร์ดไมโครคอนโทรลเลอร์ (Arduino / ESP32)",
          "เข้าใจหลักการทำงานของระบบหุ่นยนต์อัตโนมัติ (Line Tracking, Obstacle Avoidance)",
          "ใช้งานเซนเซอร์เพื่อวัดอุณหภูมิ ความชื้น การเอียง และการเคลื่อนไหว",
          "เชื่อมต่อและส่งข้อมูลด้วยระบบ IoT (Wi-Fi, MQTT, Blynk)",
          "สร้าง Dashboard เพื่อแสดงข้อมูลแบบเรียลไทม์",
          "ฝึกคิดเชิงระบบและทำงานร่วมกันในทีม",
        ],
        outcomes: [
          "สามารถสร้างและควบคุมหุ่นยนต์อัตโนมัติได้จริง",
          "สามารถวัดและส่งข้อมูลแบบเรียลไทม์ผ่านระบบ IoT",
          "เข้าใจการทำงานของ Sensor และระบบอัจฉริยะที่เชื่อมต่อกัน",
          "ได้รับใบประกาศนียบัตรและผลงานหุ่นยนต์ของตนเอง",
          "พัฒนาทักษะการทำงานร่วมกันและการแก้ปัญหาในสถานการณ์จริง",
          "เห็นภาพรวมของการประยุกต์ใช้เทคโนโลยีในวงการแพทย์และสาธารณสุข",
        ],
      },
    },
    {
      id: 3,
      title: "Perception & AI",
      subtitle: "การรับรู้และปัญญาประดิษฐ์",
      project: "Vision AI & Robotic Arm",
      icon: Zap,
      duration: "5 ครั้ง × 6 ชม.",
      online: "Online 2 ครั้ง",
      onsite: "Onsite 3 ครั้ง",
      gradient: "from-amber-600 via-orange-600 to-red-600",
      image: "/images/module-3-learning.png",
      description:
        "เจาะลึก AI และแขนกลที่ประยุกต์ใช้กับงานทางชีววิทยา เช่น การวิเคราะห์พืช การศึกษาสมอง และการใช้ Machine Learning ในการทำนายราคาบ้าน ราคาหุ้น หรือการวินิจฉัยโรคร้าย เพื่อให้เห็นพลังของ AI ในการแก้ปัญหาที่ซับซ้อน",
      topics: [
        "ระบบการมองเห็นของเครื่อง (Computer Vision)",
        "พื้นฐานการเรียนรู้ของเครื่อง (Machine Learning)",
        "การประมวลผลข้อมูล",
        "การรู้จำวัตถุและการวิเคราะห์ภาพ",
        "AI ทางชีววิทยา (การวิเคราะห์พืช สมอง)",
        "การทำนายด้วย AI (ราคาบ้าน หุ้น โรคร้าย)",
      ],
      engineeringPath: {
        title: "Foundations of AI, Machine Learning, and Computer Vision",
        skills: [
          "Process images and data using computer vision techniques",
          "Apply basic AI/ML for classification and pattern recognition",
          "Use AI for decision-making instead of rule-based programming",
          "Apply AI to biological analysis, plant recognition, and medical diagnostics",
          "Build predictive models for real-world applications",
          "Connect perception to action through robotic arm control",
        ],
        outcomes: [
          "Integrate Vision + IoT systems for cloud data storage",
          "Send image data and classification results to cloud platforms",
          "Develop intelligent automation and robotics systems with real-world impact",
        ],
      },
    },
    {
      id: 4,
      title: "Integration Project",
      subtitle: "โปรเจกต์บูรณาการ",
      project: "Smart Farm & Bio-inspired Robotics",
      icon: Users,
      duration: "5 ครั้ง × 6 ชม.",
      online: "Online 1 ครั้ง",
      onsite: "Onsite 4 ครั้ง",
      gradient: "from-yellow-500 via-orange-500 to-red-500",
      image: "/images/module-4-learning.png",
      description:
        "นำความรู้ทั้งหมดมาบูรณาการในโปรเจกต์จริง แก้ปัญหาในชีวิตจริงผ่าน Project-Based Learning เช่น Smart Farm ที่ช่วยเกษตรกร หรือการสร้างหุ่นยนต์จากวัสดุธรรมชาติ เพื่อพัฒนาทักษะการทำงานเป็นทีม การแก้ปัญหา และการนำเสนอผลงาน",
      topics: [
        "การวางแผนโปรเจกต์",
        "การทำงานเป็นทีม",
        "โปรเจกต์แก้ปัญหาจริง (Smart Farm)",
        "การสร้างหุ่นยนต์จากวัสดุธรรมชาติ",
        "การบูรณาการระบบ IoT และ AI",
        "การนำเสนอผลงานอย่างมืออาชีพ",
      ],
      engineeringPath: {
        title: "Foundations of Systems & Industrial Engineering",
        skills: [
          "Integrate knowledge from Modules 1–3 using a Systems Thinking approach",
          "Collaborate in teams through the Engineering Design Process",
          "Analyze problems, design, and test prototypes",
          "Solve real-world problems through project-based learning",
          "Work with sustainable materials and nature-inspired design",
          "Present and communicate engineering solutions professionally",
        ],
        outcomes: [
          "Connect IoT systems to transmit robot data to cloud dashboards",
          "Develop complete end-to-end engineering solutions for real-world challenges",
          "Master professional communication and project management in engineering",
        ],
      },
    },
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
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 leading-tight">Learning Modules</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            4 โมดูลที่จะพาคุณก้าวสู่โลกแห่ง Robotics และ AI อย่างครบวงจร
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
              {modules.map((module, index) => (
                <CarouselItem key={module.id}>
                  <Card className="border-0 bg-transparent shadow-none">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Image Section */}
                        <div className="relative group">
                          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                              src={module.image}
                              alt={module.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              priority={index === 0}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            
                            {/* Module Number Badge */}
                            <div className="absolute top-4 left-4">
                              <div className={`w-16 h-16 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                <span className="text-2xl font-bold text-white">M{module.id}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                <module.icon className="h-6 w-6 text-white" />
                              </div>
                              <Badge className={`bg-gradient-to-r ${module.gradient} text-white border-0 px-4 py-1`}>
                                Module {module.id}
                              </Badge>
                            </div>
                            
                            <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent py-2 leading-tight">
                              {module.title}
                            </h3>
                            <p className="text-lg text-muted-foreground">{module.subtitle}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="font-normal">
                                {module.project}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-foreground/80 leading-relaxed">
                            {module.description}
                          </p>

                          {/* Duration Info */}
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">{module.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                              <div className="w-2 h-2 bg-primary rounded-full" />
                              <span className="text-sm">{module.online}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg">
                              <div className="w-2 h-2 bg-accent rounded-full" />
                              <span className="text-sm">{module.onsite}</span>
                            </div>
                          </div>

                          {/* Topics Preview */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-muted-foreground">หัวข้อเด่น:</h4>
                            <div className="flex flex-wrap gap-2">
                              {module.topics.slice(0, 3).map((topic, idx) => (
                                <Badge key={idx} variant="secondary" className="font-normal text-xs">
                                  {topic.split("(")[0].trim()}
                                </Badge>
                              ))}
                              {module.topics.length > 3 && (
                                <Badge variant="secondary" className="font-normal text-xs">
                                  +{module.topics.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* CTA Button */}
                          <Dialog open={openDialog === module.id} onOpenChange={(open) => setOpenDialog(open ? module.id : null)}>
                            <DialogTrigger asChild>
                              <Button
                                size="lg"
                                className={`w-full md:w-auto bg-gradient-to-r ${module.gradient} text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group`}
                              >
                                ดูรายละเอียดเพิ่มเติม
                                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                              <DialogHeader>
                                <div className="flex items-center gap-4 mb-4">
                                  <div className={`w-16 h-16 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                    <module.icon className="h-8 w-8 text-white" />
                                  </div>
                                  <div>
                                    <DialogTitle className="text-3xl font-bold text-foreground">
                                      Module {module.id}: {module.title}
                                    </DialogTitle>
                                    <p className="text-muted-foreground">{module.subtitle}</p>
                                  </div>
                                </div>
                              </DialogHeader>

                              <div className="space-y-8 mt-6">
                                {/* Full Description */}
                                <div className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                                  <p className="leading-relaxed">{module.description}</p>
                                </div>

                                {/* All Topics */}
                                <div>
                                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
                                    หัวข้อที่เรียนทั้งหมด
                                  </h4>
                                  <div className="grid gap-3">
                                    {module.topics.map((topic, index) => (
                                      <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                        <div className={`w-8 h-8 bg-gradient-to-br ${module.gradient} rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm font-bold`}>
                                          {index + 1}
                                        </div>
                                        <span className="text-sm leading-relaxed pt-1">{topic}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Engineering Path */}
                                <div>
                                  <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-l-4 border-orange-500 rounded-r-xl">
                                    <h4 className="text-lg font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide">
                                      {module.engineeringPath.title}
                                    </h4>
                                  </div>
                                  
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                      <h5 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        ทักษะที่จะได้พัฒนา
                                      </h5>
                                      <ul className="space-y-2">
                                        {module.engineeringPath.skills.map((skill, index) => (
                                          <li key={index} className="flex items-start gap-2 text-sm">
                                            <div className={`w-1.5 h-1.5 bg-gradient-to-br ${module.gradient} rounded-full mt-2 flex-shrink-0`} />
                                            <span className="text-muted-foreground">{skill}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div>
                                      <h5 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-accent" />
                                        ผลลัพธ์การเรียนรู้
                                      </h5>
                                      <ul className="space-y-2">
                                        {module.engineeringPath.outcomes.map((outcome, index) => (
                                          <li key={index} className="flex items-start gap-2 text-sm">
                                            <div className={`w-1.5 h-1.5 bg-gradient-to-br ${module.gradient} rounded-full mt-2 flex-shrink-0`} />
                                            <span className="text-muted-foreground">{outcome}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
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
                {modules.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`transition-all duration-300 rounded-full ${
                      current === index
                        ? "w-8 h-3 bg-gradient-to-r from-primary to-accent"
                        : "w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
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
