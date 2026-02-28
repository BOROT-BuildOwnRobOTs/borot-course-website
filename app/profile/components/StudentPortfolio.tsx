"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Image,
  Video,
  Box,
  FolderOpen,
  Download,
  Sparkles,
  CheckCircle2,
  Lock,
} from "lucide-react"

// ── Mock portfolio items ────────────────────────────────────────────────────
const MOCK_PROJECTS = [
  {
    title: "หุ่นยนต์หลีกเลี่ยงสิ่งกีดขวาง",
    module: "Module 1",
    date: "ต.ค. 2567",
    thumbnail: null,
    hasVideo: true,
    hasImage: true,
    has3D: false,
    tags: ["Robotics", "Sensors", "Arduino"],
  },
  {
    title: "โปรแกรม Line Follower",
    module: "Module 2",
    date: "พ.ย. 2567",
    thumbnail: null,
    hasVideo: false,
    hasImage: true,
    has3D: true,
    tags: ["Programming", "Control"],
  },
  {
    title: "ระบบ Smart Home จำลอง",
    module: "Module 3",
    date: "ธ.ค. 2567",
    thumbnail: null,
    hasVideo: true,
    hasImage: true,
    has3D: true,
    tags: ["IoT", "Automation", "Design"],
  },
]

const PORTFOLIO_FEATURES = [
  {
    icon: <Image className="h-5 w-5 text-blue-500" />,
    label: "รูปภาพโปรเจกต์",
    desc: "รวบรวมรูปจากทุก session อัตโนมัติ",
    color: "bg-blue-50 border-blue-200",
  },
  {
    icon: <Video className="h-5 w-5 text-red-500" />,
    label: "วิดีโอผลงาน",
    desc: "ไฮไลต์วิดีโอการสาธิตผลงาน",
    color: "bg-red-50 border-red-200",
  },
  {
    icon: <Box className="h-5 w-5 text-purple-500" />,
    label: "ไฟล์ 3D Model",
    desc: "แบบ 3D ที่ออกแบบและพิมพ์จริง",
    color: "bg-purple-50 border-purple-200",
  },
  {
    icon: <FolderOpen className="h-5 w-5 text-orange-500" />,
    label: "โปรเจกต์ทั้งหมด",
    desc: "สรุปผลงานทุกโมดูลครบถ้วน",
    color: "bg-orange-50 border-orange-200",
  },
]

interface Props {
  studentName?: string
}

export default function StudentPortfolio({ studentName }: Props) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Student Portfolio</h2>
            <p className="text-xs text-muted-foreground">
              Digital Engineering Portfolio · Auto-generated · Coming Soon
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
          🚀 Coming Soon
        </Badge>
      </div>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-4 left-8 w-24 h-24 rounded-full bg-white/20 blur-xl" />
        </div>
        <div className="relative space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <span className="text-sm font-semibold text-yellow-200">Digital Engineering Portfolio</span>
          </div>
          <h3 className="text-xl font-bold leading-snug">
            {studentName ? `${studentName}'s Portfolio` : "Student Portfolio"}
          </h3>
          <p className="text-sm text-white/80 leading-relaxed max-w-md">
            ระบบจะดึงรูป วิดีโอ ไฟล์ 3D และโปรเจกต์ทั้งหมดมา generate เป็น
            <span className="text-yellow-200 font-semibold"> "Digital Engineering Portfolio"</span>
            {" "}ที่ผู้ปกครองสามารถ download เป็น PDF ได้
          </p>
          <div className="flex gap-2 flex-wrap pt-1">
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">📚 สมัครโรงเรียน</span>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">🏆 เข้าแข่งขัน</span>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">💼 แสดงผลงาน</span>
          </div>
        </div>
      </div>

      {/* What will be included */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-3">📂 ระบบจะรวบรวมอัตโนมัติ</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PORTFOLIO_FEATURES.map((f) => (
            <Card key={f.label} className={`border ${f.color}`}>
              <CardContent className="pt-4 pb-3 px-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  {f.icon}
                  <span className="text-xs font-semibold">{f.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mock project list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            🗂️ ตัวอย่างโปรเจกต์
            <span className="text-xs font-normal text-muted-foreground">(Coming Soon)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_PROJECTS.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border p-3 bg-muted/20"
            >
              {/* Placeholder thumbnail */}
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center shrink-0 text-2xl">
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.title}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                    {p.module}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{p.date}</span>
                </div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {p.tags.map((t) => (
                    <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              {/* Media indicators */}
              <div className="flex gap-1.5 shrink-0">
                {p.hasImage && (
                  <span title="มีรูปภาพ" className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Image className="h-3 w-3 text-blue-500" />
                  </span>
                )}
                {p.hasVideo && (
                  <span title="มีวิดีโอ" className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <Video className="h-3 w-3 text-red-500" />
                  </span>
                )}
                {p.has3D && (
                  <span title="มีไฟล์ 3D" className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <Box className="h-3 w-3 text-purple-500" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* PDF download preview (locked) */}
      <Card className="border-2 border-dashed border-amber-300 bg-amber-50/50">
        <CardContent className="py-6 text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                <Download className="h-8 w-8 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center shadow">
                <Lock className="h-3.5 w-3.5 text-white" />
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">Download PDF Portfolio</p>
            <p className="text-xs text-amber-700 mt-0.5">
              ผู้ปกครองสามารถ download Portfolio เป็น PDF ได้ — ฟีเจอร์นี้กำลังจะมาเร็วๆ นี้
            </p>
          </div>
          <button
            disabled
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-300/50 text-amber-700 text-sm font-semibold cursor-not-allowed opacity-70 border border-amber-300"
          >
            <Download className="h-4 w-4" />
            Download Portfolio PDF
            <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full">Coming Soon</span>
          </button>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">✅ Portfolio จะมีอะไรบ้าง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "หน้าปกพร้อมชื่อนักเรียนและโรงเรียน",
              "สรุปทักษะ Skill Radar Chart",
              "รายการโปรเจกต์ทุกโมดูล",
              "รูปภาพและวิดีโอผลงาน",
              "ไฟล์ 3D Design ที่เคยสร้าง",
              "คำแนะนำและ feedback จากครู",
              "ใบรับรองการผ่านหลักสูตร",
              "QR Code เชื่อมโยง Digital Portfolio",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-2">
        🚀 Student Portfolio กำลังจะมาเร็วๆ นี้ (Coming Soon)
      </p>
    </div>
  )
}
