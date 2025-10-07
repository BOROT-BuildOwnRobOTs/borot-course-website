"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookOpen, Code, Cpu, Zap, Users, Calendar, ArrowRight } from "lucide-react"
import { useState } from "react"

export function ModuleDetails() {
  const [openDialog, setOpenDialog] = useState<number | null>(null)

  const modules = [
    {
      id: 1,
      title: "Explore & Build Basics",
      subtitle: "สำรวจและสร้างพื้นฐาน",
      icon: BookOpen,
      duration: "5 ครั้ง × 6 ชม.",
      online: "Online 1 ครั้ง (พื้นฐาน Math/Physics, Coding)",
      onsite: "Onsite 4 ครั้ง (CAD, Build, Line Follower)",
      color: "bg-primary",
      topics: ["พื้นฐานคณิตศาสตร์และฟิสิกส์", "การเขียนโปรแกรมเบื้องต้น", "การออกแบบด้วย CAD", "การสร้างหุ่นยนต์ตามเส้น"],
      engineeringPath: {
        title: "Foundations of General Engineering",
        skills: [
          "Apply mathematics and physics fundamentals to solve engineering problems",
          "Develop basic programming skills (Python/Arduino)",
          "Use CAD and 3D Printing tools for rapid prototyping",
          "Practice Active Learning and Project-based approaches",
        ],
        outcomes: [
          "Build systematic thinking and problem-solving abilities",
          "Create functional prototypes using engineering design principles",
          "Understand the engineering design process from concept to real-world implementation",
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
      topics: ["ระบบเซ็นเซอร์และการทำงาน", "การควบคุมมอเตอร์", "การวางแผนเส้นทาง", "การทดสอบหุ่นยนต์เคลื่อนที่"],
      engineeringPath: {
        title: "Foundations of Electrical & Mechanical Engineering",
        skills: [
          "Understand electrical circuits, logic gates, and microcontroller programming",
          "Design and control motor systems and robotic movement",
          "Integrate sensors with navigation and control systems",
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
      topics: ["ระบบการมองเห็นของเครื่อง", "พื้นฐานการเรียนรู้ของเครื่อง", "การประมวลผลข้อมูล", "การรู้จำวัตถุ"],
      engineeringPath: {
        title: "Foundations of AI, Machine Learning, and Computer Vision",
        skills: [
          "Process images and data using computer vision techniques",
          "Apply basic AI/ML for classification and pattern recognition",
          "Use AI for decision-making instead of rule-based programming",
          "Connect perception to action through robotic arm control (vision-based pick-and-place)",
        ],
        outcomes: [
          "Integrate Vision + IoT systems for cloud data storage",
          "Send image data and classification results to cloud platforms",
          "Develop intelligent automation and robotics systems",
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
      topics: ["การวางแผนโปรเจกต์", "การทำงานเป็นทีม", "การสร้างหุ่นยนต์อัจฉริยะ", "การนำเสนอผลงาน"],
      engineeringPath: {
        title: "Foundations of Systems & Industrial Engineering",
        skills: [
          "Integrate knowledge from Modules 1–3 using a Systems Thinking approach",
          "Collaborate in teams through the Engineering Design Process",
          "Analyze problems, design, and test prototypes",
          "Present and communicate engineering solutions professionally",
        ],
        outcomes: [
          "Connect IoT systems to transmit robot data (status, sensors, position) to cloud dashboards",
          "Develop complete end-to-end engineering solutions",
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
