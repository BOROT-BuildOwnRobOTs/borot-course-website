import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BookOpen, Settings, Brain, Rocket } from "lucide-react"

export function LearningPath() {
  const modules = [
    {
      number: 1,
      title: "Explore & Build Basics",
      subtitle: "สำรวจและสร้างพื้นฐาน",
      icon: BookOpen,
      description: "Algebra, Functions, Electronics, Mechanics → Mini Line Follower Robot",
      color: "from-orange-500 to-yellow-500",
    },
    {
      number: 2,
      title: "Control & Navigation",
      subtitle: "การควบคุมและนำทาง",
      icon: Settings,
      description: "Sensors, Kinematics, Path Planning → Mobile Robot Navigation",
      color: "from-yellow-500 to-orange-600",
    },
    {
      number: 3,
      title: "Perception & AI",
      subtitle: "การรับรู้และปัญญาประดิษฐ์",
      icon: Brain,
      description: "Vision, Machine Learning, Data Processing → Object Recognition",
      color: "from-orange-600 to-red-500",
    },
    {
      number: 4,
      title: "Integration Project",
      subtitle: "โปรเจกต์บูรณาการ",
      icon: Rocket,
      description: "Team Project – Design, Build, and Present an Intelligent Robot",
      color: "from-red-500 to-orange-500",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-sm font-semibold px-4 py-2 border-primary text-primary">
            Learning Path
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            {"เส้นทาง"} <span className="text-primary">{"การเรียนรู้"}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            {"เรียนรู้ทีละขั้นตอนด้วย 4 โมดูลหลัก ที่ออกแบบมาเพื่อพัฒนาทักษะด้านวิศวกรรมอย่างครบถ้วน"}
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <div key={index} className="relative">
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30 group">
                  <CardContent className="p-6">
                    {/* Module Number and Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${module.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                      >
                        <module.icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-bold">
                        Module {module.number}
                      </Badge>
                    </div>

                    {/* Module Title */}
                    <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 font-medium">{module.subtitle}</p>

                    {/* Module Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">{module.description}</p>
                  </CardContent>
                </Card>

                {/* Arrow between modules (hidden on last module) */}
                {index < modules.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Learning Path Summary */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-full border border-primary/20">
              <Rocket className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">{"เสร็จสิ้นทั้ง 4 โมดูล คุณพร้อมเป็นวิศวกรหุ่นยนต์แล้ว!"}</span>
              <Rocket className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
