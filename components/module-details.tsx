"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookOpen, Code, Cpu, Zap, Users, Calendar, ArrowRight } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

export function ModuleDetails() {
  const [openDialog, setOpenDialog] = useState<number | null>(null)

  const modules = [
    {
      id: 1,
      title: "Explore & Build Basics",
      subtitle: "สำรวจและสร้างพื้นฐาน (Smart Dispenser Project)",
      icon: BookOpen,
      duration: "5 ครั้ง × 6 ชม.",
      online: "Online 1 ครั้ง (พื้นฐาน Coding และระบบ Input–Output)",
      onsite: "Onsite 4 ครั้ง (Circuit, Sensor, Integration, Showcase)",
      color: "bg-primary",
      image: "/images/module-1-learning.png",
      description:
        "เรียนรู้พื้นฐานการสร้างระบบหุ่นยนต์จากสถานการณ์จริง ผ่านโปรเจกต์ Smart Medicine Dispenser ตั้งแต่ระบบเตือนกินยาอัตโนมัติ ตรวจมือจ่ายยา การรับรู้สัญญาณชีพ การตรวจสภาพยา ไปจนถึงการรวมระบบสมบูรณ์ เพื่อให้เข้าใจวงจร Input–Process–Output–Feedback อย่างเป็นระบบ พร้อมบูรณาการความรู้คณิต ฟิสิกส์ เคมี ชีวะ วัสดุ และการเขียนโปรแกรมในงานวิศวกรรมจริง",
      topics: [
        "Day 1: ระบบเตือนอัตโนมัติ (Smart Reminder) — นับเวลา, ควบคุมไฟ/เสียง, การคิดแบบ Input–Process–Output",
        "Day 2: ตรวจมือก่อนจ่ายยา (Sensor Interaction) — การเชื่อม Sensor กับ Servo, การตั้ง threshold ระยะ",
        "Day 3: ระบบรับรู้อาการจ่ายยา (Adaptive Dosing) — อ่านค่าสัญญาณชีพ, เขียน if–else หลายระดับ",
        "Day 4: ระบบตรวจสภาพยาและวัสดุ (Safety & Environment) — ใช้ DHT11 ตรวจอุณหภูมิ/ความชื้น, วิเคราะห์วัสดุกันชื้น",
        "Day 5: การรวมระบบและวิเคราะห์โครงสร้าง (Integration & Optimization) — รวมโค้ดทุกระบบ, ทดสอบวัสดุ, สร้าง Smart Dispenser V4",
      ],
      engineeringPath: {
        title: "Foundations of Mechatronics & System Integration",
        skills: [
          "Build basic electronic circuits using LED, Buzzer, Button, and Sensor modules",
          "Write Arduino programs with loops, conditions, and multi-input decision logic",
          "Integrate sensors (IR, Ultrasonic, DHT11, Pulse) with actuators (Servo Motor)",
          "Analyze sensor data and environmental effects on system performance",
          "Apply materials science to structural optimization and humidity control",
          "Combine coding, electronics, and physical testing to create functional prototypes",
          "Collaborate in small teams using engineering design and debugging processes",
        ],
        outcomes: [
          "Understand the complete Input–Process–Output–Feedback cycle in robotics",
          "Connect interdisciplinary knowledge (Physics, Chemistry, Biology, Math, Programming)",
          "Develop systematic thinking and engineering design skills through iterative testing",
          "Create a working prototype: Smart Medicine Dispenser V4 with safety and efficiency",
          "Present and explain engineering logic and test results effectively",
        ],
      },
    },
    {
      id: 2,
      title: "Control & Navigation",
      subtitle: "การควบคุมและนำทาง",
      icon: Cpu,
      duration: "5 ครั้ง × 6 ชม.",
      online: "Online 2 ครั้ง (Kinematics, Path Planning, Simulation)",
      onsite: "Onsite 3 ครั้ง (Sensors, Motor Control, Mobile Robot Test)",
      color: "bg-secondary",
      image: "/images/module-2-learning.png",
      description:
        "ศึกษาระบบควบคุมและการนำทางแบบอัตโนมัติ ผ่านตัวอย่างจริงเช่น รถยนต์ไร้คนขับ (Autonomous Car) หุ่นยนต์ส่งอาหารในร้านอาหาร และหุ่นยนต์บริการต่างๆ เพื่อให้เห็นภาพการทำงานของระบบเซ็นเซอร์ การวางแผนเส้นทาง และการตัดสินใจแบบอัตโนมัติในสถานการณ์จริง",
      topics: [
        "ระบบเซ็นเซอร์และการทำงาน",
        "การควบคุมมอเตอร์",
        "การวางแผนเส้นทาง",
        "ระบบนำทางอัตโนมัติ (Autonomous Navigation)",
        "หุ่นยนต์บริการและรถยนต์ไร้คนขับ",
        "การทดสอบหุ่นยนต์เคลื่อนที่",
      ],
      engineeringPath: {
        title: "Foundations of Electrical & Mechanical Engineering",
        skills: [
          "Understand electrical circuits, logic gates, and microcontroller programming",
          "Design and control motor systems and robotic movement",
          "Integrate sensors with navigation and control systems",
          "Learn from real-world autonomous systems like self-driving cars and service robots",
          "Strengthen problem-solving skills through robotic control challenges",
        ],
        outcomes: [
          "Master experimental methods and collaborative teamwork",
          "Transmit sensor data to IoT dashboards/cloud platforms",
          "Begin IoT-based monitoring and data collection systems",
        ],
      },
    },
    {
      id: 3,
      title: "Perception & AI",
      subtitle: "การรับรู้และปัญญาประดิษฐ์",
      icon: Zap,
      duration: "5 ครั้ง × 6 ชม.",
      online: "Online 2 ครั้ง (Vision, ML Basics, Data Processing)",
      onsite: "Onsite 3 ครั้ง (Camera Setup, Object Detection, Robotic Arm Integration)",
      color: "bg-accent",
      image: "/images/module-3-learning.png",
      description:
        "เจาะลึก AI และแขนกลที่ประยุกต์ใช้กับงานทางชีววิทยา เช่น การวิเคราะห์พืช การศึกษาสมอง และการใช้ Machine Learning ในการทำนายราคาบ้าน ราคาหุ้น หรือการวินิจฉัยโรคร้าย เพื่อให้เห็นพลังของ AI ในการแก้ปัญหาที่ซับซ้อนและส่งผลกระทบต่อชีวิตจริง",
      topics: [
        "ระบบการมองเห็นของเครื่อง (Computer Vision)",
        "พื้นฐานการเรียนรู้ของเครื่อง (Machine Learning)",
        "การประมวลผลข้อมูล",
        "การรู้จำวัตถุและการวิเคราะห์ภาพ",
        "AI ทางชีววิทยา (การวิเคราะห์พืช สมอง)",
        "การทำนายด้วย AI (ราคาบ้าน หุ้น โรคร้าย)",
        "การควบคุมแขนกลด้วย AI",
      ],
      engineeringPath: {
        title: "Foundations of AI, Machine Learning, and Computer Vision",
        skills: [
          "Process images and data using computer vision techniques",
          "Apply basic AI/ML for classification and pattern recognition",
          "Use AI for decision-making instead of rule-based programming",
          "Apply AI to biological analysis, plant recognition, and medical diagnostics",
          "Build predictive models for real-world applications (housing prices, stocks, disease prediction)",
          "Connect perception to action through robotic arm control (vision-based pick-and-place)",
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
      icon: Users,
      duration: "5 ครั้ง × 6 ชม.",
      online: "Online 1 ครั้ง (Project Planning & Design)",
      onsite: "Onsite 4 ครั้ง (Build, Test, Showcase Presentation)",
      color: "bg-gradient-to-r from-primary to-accent",
      image: "/images/module-4-learning.png",
      description:
        "นำความรู้ทั้งหมดมาบูรณาการในโปรเจกต์จริง แก้ปัญหาในชีวิตจริงผ่าน Project-Based Learning เช่น Smart Farm ที่ช่วยเกษตรกร หรือการสร้างหุ่นยนต์จากวัสดุธรรมชาติ เพื่อพัฒนาทักษะการทำงานเป็นทีม การแก้ปัญหา และการนำเสนอผลงานอย่างมืออาชีพ",
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
          "Solve real-world problems through project-based learning (Smart Farm, bio-inspired robotics)",
          "Work with sustainable materials and nature-inspired design",
          "Present and communicate engineering solutions professionally",
        ],
        outcomes: [
          "Connect IoT systems to transmit robot data (status, sensors, position) to cloud dashboards",
          "Develop complete end-to-end engineering solutions for real-world challenges",
          "Master professional communication and project management in engineering",
        ],
      },
    },
  ]

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-sm font-semibold px-4 py-2">
            Module Details
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            {"รายละเอียด"} <span className="text-primary">{"แต่ละโมดูล"}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            {"เจาะลึกเนื้อหาในแต่ละโมดูล พร้อมรูปแบบการเรียนการสอนที่หลากหลาย"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {modules.map((module) => (
            <Card
              key={module.id}
              className="hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/30 group overflow-hidden"
            >
              <CardHeader className="relative">
                <div
                  className={`absolute inset-0 ${module.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                />
                <div className="flex items-center gap-4 relative z-10">
                  <div
                    className={`w-16 h-16 ${module.color} rounded-xl flex items-center justify-center text-white shadow-lg`}
                  >
                    <module.icon className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      Module {module.id}
                    </CardTitle>
                    <h3 className="font-bold text-lg text-foreground">{module.title}</h3>
                    <p className="text-muted-foreground">{module.subtitle}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pb-6">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border-2 border-primary/10">
                  <Image
                    src={module.image || "/placeholder.svg"}
                    alt={`${module.title} - ตัวอย่างการเรียน`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                  <p className="text-sm leading-relaxed text-foreground/90">{module.description}</p>
                </div>

                {/* Duration and Format */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{module.duration}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{module.online}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                      <span>{module.onsite}</span>
                    </div>
                  </div>
                </div>

                {/* Topics */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" />
                    หัวข้อที่เรียน
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {module.topics.map((topic, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Dialog open={openDialog === module.id} onOpenChange={(open) => setOpenDialog(open ? module.id : null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-4 group hover:bg-primary hover:text-white transition-all duration-300 bg-transparent"
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-primary mb-4">
                        Module {module.id}: {module.title}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold mb-3 text-foreground">
                          Engineering Skills You'll Develop
                        </h4>
                        <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-r-lg">
                          <span className="text-sm font-bold text-orange-700 uppercase tracking-wide">
                            {module.engineeringPath.title}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {module.engineeringPath.skills.map((skill, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                              <span className="text-muted-foreground">{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold mb-3 text-foreground">Career & Learning Outcomes:</h4>
                        <ul className="space-y-2">
                          {module.engineeringPath.outcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                              <span className="text-muted-foreground">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
