"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GraduationCap, Award, BookOpen, Users, Target, Heart, Briefcase, ExternalLink } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

const projects = [
  {
    id: 1,
    title: "ค่ายอบรมโรงเรียนสาธิตมหาวิทยาลัยเกษตรศาสตร์",
    description:
      "ค่ายอบรมการเขียนโปรแกรม วิทยาการหุ่นยนต์ และปัญญาประดิษฐ์ขั้นพื้นฐานให้กับน้องๆ ในระดับชั้นประถมศึกษา และมัธยมศึกษา โรงเรียนสาธิตแห่งมหาวิทยาลัยเกษตรศาสตร์จังหวัดชลบุรี",
    image: "/images/portfolio/project-5.png",
    partner: "โรงเรียนสาธิตแห่งมหาวิทยาลัยเกษตรศาสตร์",
    category: "Workshop",
  },
  {
    id: 2,
    title: "ค่ายอบรมร่วมกับ Know Are",
    description:
      "ร่วมมือกับ Know Are จัดทำค่ายอบรมวิทยาการหุ่นยนต์และปัญญาประดิษฐ์ ให้กับน้องๆ ชั้นมัธยมปลายที่มีความสนใจศึกษาต่อทางด้านสาขาวิศวกรรมหุ่นยนต์และปัญญาประดิษฐ์",
    image: "/images/portfolio/project-7.png",
    partner: "Know Are",
    category: "Training Camp",
  },
  {
    id: 3,
    title: "Play Fun Fest - วันเด็กแห่งชาติ",
    description: "ร่วมมือกับ บพค. จัดทำเวิร์คชอปเขียนโปรแกรมหุ่นยนต์ให้กับน้องๆ ในงาน Play Fun Fest เนื่องในโอกาสวันเด็กแห่งชาติ",
    image: "/images/portfolio/project-6.png",
    partner: "บพค. (องค์การพิพิธภัณฑ์วิทยาศาสตร์แห่งชาติ)",
    category: "Public Event",
  },
  {
    id: 4,
    title: "เวิร์คชอป 3D Design & Circuit",
    description:
      "ร่วมมือกับมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี และสถาบันวิทยาการหุ่นยนต์ภาคสนาม จัดทำเวิร์คชอปสอนวาดชิ้นงาน 3 มิติ ต่อวงจรไฟฟ้า",
    image: "/images/portfolio/project-1.png",
    partner: "KMUTT & สถาบันวิทยาการหุ่นยนต์ภาคสนาม",
    category: "Workshop",
  },
  {
    id: 5,
    title: "เวิร์คชอป Robotics Programming",
    description:
      "ร่วมมือกับมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี และสถาบันวิทยาการหุ่นยนต์ภาคสนาม จัดทำเวิร์คชอปสอนวาดชิ้นงาน 3 มิติ ต่อวงจรไฟฟ้า และเขียนโปรแกรมสั่งการหุ่นยนต์",
    image: "/images/portfolio/project-3.png",
    partner: "KMUTT & สถาบันวิทยาการหุ่นยนต์ภาคสนาม",
    category: "Workshop",
  },
  {
    id: 6,
    title: "เวิร์คชอปหุ่นยนต์ - ศูนย์สิริกิต",
    description: "ร่วมมือกับมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี และสถาบันวิทยาการหุ่นยนต์ภาคสนาม จัดทำเวิร์คชอปหุ่นยนต์สำหรับเด็กที่ศูนย์สิริกิต",
    image: "/images/portfolio/project-4.png",
    partner: "KMUTT & สถาบันวิทยาการหุ่นยนต์ภาคสนาม",
    category: "Community Outreach",
  },
  {
    id: 7,
    title: "Science Fair Exhibition",
    description:
      "ร่วมมือกับมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี จัดแสดงนิทรรศการและเวิร์คชอปหุ่นยนต์ในงาน Science Fair เพื่อส่งเสริมการเรียนรู้ด้าน STEM",
    image: "/images/portfolio/project-2.png",
    partner: "KMUTT",
    category: "Exhibition",
  },
]

export default function AboutPage() {
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[0] | null>(null)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <div className="py-12">
          <div className="container mx-auto px-6 text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-balance mb-6">
              <span className="text-foreground">เกี่ยวกับ</span> <span className="text-primary">BOROT</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
              บริษัทผู้นำด้านการศึกษาวิศวกรรมและเทคโนโลยีหุ่นยนต์
            </p>
          </div>

          <div className="container mx-auto px-6 space-y-12">
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

            <Card className="max-w-6xl mx-auto">
              <CardContent className="p-12">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    <span className="text-foreground">ผลงาน</span> <span className="text-primary">Company Profile</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
                    โครงการและกิจกรรมที่เราได้ร่วมมือกับสถาบันการศึกษาและองค์กรชั้นนำ
                  </p>
                </div>

                {/* Projects Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <Dialog key={project.id}>
                      <DialogTrigger asChild>
                        <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/50">
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={project.image || "/placeholder.svg"}
                              alt={project.title}
                              width={400}
                              height={300}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-primary/90 backdrop-blur-sm">{project.category}</Badge>
                            </div>
                          </div>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-bold mb-2 text-balance line-clamp-2 group-hover:text-primary transition-colors">
                              {project.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {project.partner}
                              </Badge>
                              <ExternalLink className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl text-balance pr-8">{project.title}</DialogTitle>
                          <DialogDescription className="text-base pt-2">
                            <Badge className="mb-4">{project.category}</Badge>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="rounded-lg overflow-hidden">
                            <Image
                              src={project.image || "/placeholder.svg"}
                              alt={project.title}
                              width={800}
                              height={600}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-lg mb-2">รายละเอียดโครงการ</h4>
                              <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                            </div>
                            <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                              <Users className="w-5 h-5 text-primary flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium">ความร่วมมือกับ</p>
                                <p className="text-sm text-muted-foreground">{project.partner}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>

                {/* Stats Section */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
                    <div className="text-3xl font-bold text-primary mb-2">7+</div>
                    <div className="text-sm text-muted-foreground">โครงการที่สำเร็จ</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl">
                    <div className="text-3xl font-bold text-secondary mb-2">500+</div>
                    <div className="text-sm text-muted-foreground">นักเรียนที่เข้าร่วม</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl">
                    <div className="text-3xl font-bold text-accent mb-2">5+</div>
                    <div className="text-sm text-muted-foreground">พันธมิตรทางการศึกษา</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-chart-1/5 to-chart-1/10 rounded-xl">
                    <div className="text-3xl font-bold text-chart-1 mb-2">100%</div>
                    <div className="text-sm text-muted-foreground">ความพึงพอใจ</div>
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
