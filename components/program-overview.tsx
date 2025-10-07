import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Award, Target } from "lucide-react"

export function ProgramOverview() {
  const stats = [
    {
      icon: Clock,
      label: "ระยะเวลา",
      value: "16 สัปดาห์",
      description: "เรียนรู้แบบเข้มข้น",
    },
    {
      icon: Users,
      label: "นักเรียน",
      value: "24 คน",
      description: "ต่อรุ่น",
    },
    {
      icon: Award,
      label: "โมดูล",
      value: "4 โมดูล",
      description: "ครอบคลุมทุกด้าน",
    },
    {
      icon: Target,
      label: "โปรเจกต์",
      value: "1 โปรเจกต์",
      description: "ใหญ่ต่อทีม",
    },
  ]

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-sm font-semibold px-4 py-2">
            Program Overview
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            {"ภาพรวม"} <span className="text-primary">{"หลักสูตร"}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            {"หลักสูตรที่ออกแบบมาเพื่อพัฒนาทักษะด้านวิศวกรรมอย่างครอบคลุม จากทฤษฎีสู่การปฏิบัติจริง"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
            >
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-2">{stat.value}</h3>
                <p className="font-semibold text-foreground mb-1">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-4 bg-card border-2 border-primary/20 rounded-2xl p-8 shadow-xl">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-foreground mb-1">เป้าหมายหลัก</h3>
              <p className="text-muted-foreground">{"สร้างวิศวกรรุ่นใหม่ที่มีทักษะครบครัน พร้อมสำหรับอุตสาหกรรม 4.0"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
