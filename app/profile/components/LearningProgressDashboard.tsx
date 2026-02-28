"use client"

import { useState } from "react"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart2,
  Brain,
  Lightbulb,
  Wrench,
  Users,
  Puzzle,
  Flame,
  Star,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
} from "lucide-react"
import { StudentData } from "../types"

// ── Preview / mock data ────────────────────────────────────────────────────
const SKILL_DATA = [
  { skill: "Logical Thinking",   fullMark: 100, current: 72, previous: 55 },
  { skill: "Creativity",         fullMark: 100, current: 85, previous: 60 },
  { skill: "Engineering Skill",  fullMark: 100, current: 68, previous: 50 },
  { skill: "Teamwork",           fullMark: 100, current: 90, previous: 75 },
  { skill: "Problem Solving",    fullMark: 100, current: 78, previous: 62 },
  { skill: "Persistence",        fullMark: 100, current: 82, previous: 70 },
]

const SKILL_ICONS: Record<string, React.ReactNode> = {
  "Logical Thinking":  <Brain className="h-4 w-4 text-purple-500" />,
  "Creativity":        <Lightbulb className="h-4 w-4 text-yellow-500" />,
  "Engineering Skill": <Wrench className="h-4 w-4 text-blue-500" />,
  "Teamwork":          <Users className="h-4 w-4 text-green-500" />,
  "Problem Solving":   <Puzzle className="h-4 w-4 text-orange-500" />,
  "Persistence":       <Flame className="h-4 w-4 text-red-500" />,
}

const MONTHLY_PROGRESS = [
  { month: "ต.ค.", sessions: 4, completed: 4 },
  { month: "พ.ย.", sessions: 4, completed: 3 },
  { month: "ธ.ค.", sessions: 4, completed: 4 },
  { month: "ม.ค.", sessions: 4, completed: 2 },
]

const MOCK_ACHIEVEMENTS = [
  { label: "First Build",       icon: "🏗️", desc: "สร้างหุ่นยนต์ครั้งแรก",     earned: true },
  { label: "Bug Squasher",      icon: "🐛", desc: "แก้บัค 10 ครั้ง",           earned: true },
  { label: "Team Player",       icon: "🤝", desc: "ทำงานร่วมทีม 5 โปรเจกต์",  earned: true },
  { label: "Creative Mind",     icon: "💡", desc: "ออกแบบโปรเจกต์สร้างสรรค์", earned: false },
  { label: "Code Master",       icon: "👨‍💻", desc: "เขียนโค้ด 100 บรรทัด",     earned: false },
  { label: "Robot Champion",    icon: "🤖", desc: "จบ Module ทั้งหมด",         earned: false },
]

// ── Custom tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-xs space-y-1">
        <p className="font-semibold text-gray-700">{payload[0]?.payload?.skill}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>/100
          </p>
        ))}
      </div>
    )
  }
  return null
}

// ── Student selector ───────────────────────────────────────────────────────
interface Props {
  students: StudentData[]
}

export default function LearningProgressDashboard({ students }: Props) {
  const [selectedStudentIdx, setSelectedStudentIdx] = useState(0)
  const student = students[selectedStudentIdx]

  const avgCurrent = Math.round(
    SKILL_DATA.reduce((sum, s) => sum + s.current, 0) / SKILL_DATA.length
  )
  const avgPrevious = Math.round(
    SKILL_DATA.reduce((sum, s) => sum + s.previous, 0) / SKILL_DATA.length
  )
  const growth = avgCurrent - avgPrevious

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BarChart2 className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Learning Progress Dashboard</h2>
            <p className="text-xs text-muted-foreground">
              ติดตามพัฒนาการทักษะของลูก · Coming Soon
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
          🔮 Coming Soon
        </Badge>
      </div>

      {/* Student selector (if multiple) */}
      {students.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {students.map((s, i) => (
            <button
              key={s._id}
              onClick={() => setSelectedStudentIdx(i)}
              className={[
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border transition-all",
                selectedStudentIdx === i
                  ? "bg-primary text-white border-primary shadow"
                  : "border-gray-200 text-muted-foreground hover:border-gray-400",
              ].join(" ")}
            >
              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                {s.name.charAt(0)}
              </span>
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: <Star className="h-5 w-5 text-yellow-500" />,
            label: "คะแนนเฉลี่ย",
            value: `${avgCurrent}/100`,
            sub: "ทุกทักษะ",
            color: "bg-yellow-50 border-yellow-200",
          },
          {
            icon: <TrendingUp className="h-5 w-5 text-green-500" />,
            label: "พัฒนาการ",
            value: `+${growth} pts`,
            sub: "จากเดือนก่อน",
            color: "bg-green-50 border-green-200",
          },
          {
            icon: <BookOpen className="h-5 w-5 text-blue-500" />,
            label: "คอร์สที่ลงทะเบียน",
            value: student ? String(student.enrollments?.length ?? 0) : "—",
            sub: "คอร์ส",
            color: "bg-blue-50 border-blue-200",
          },
          {
            icon: <Clock className="h-5 w-5 text-purple-500" />,
            label: "ชั่วโมงเรียน",
            value: "32 ชม.",
            sub: "สะสม",
            color: "bg-purple-50 border-purple-200",
          },
        ].map((card, i) => (
          <Card key={i} className={`border ${card.color}`}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 mb-1">{card.icon}<span className="text-xs text-muted-foreground">{card.label}</span></div>
              <p className="text-2xl font-bold leading-tight">{card.value}</p>
              <p className="text-[11px] text-muted-foreground">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main: Radar Chart + Skill bars */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Radar */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              🕸️ Skill Radar Chart
              <span className="text-xs font-normal text-muted-foreground">(Coming Soon)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={SKILL_DATA}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: "#9ca3af" }}
                    tickCount={4}
                  />
                  <Radar
                    name="เดือนก่อน"
                    dataKey="previous"
                    stroke="#c4b5fd"
                    fill="#c4b5fd"
                    fillOpacity={0.25}
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                  />
                  <Radar
                    name="ปัจจุบัน"
                    dataKey="current"
                    stroke="#7c3aed"
                    fill="#7c3aed"
                    fillOpacity={0.35}
                    strokeWidth={2}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    iconType="circle"
                    iconSize={8}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Skill breakdown bars */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">📊 รายละเอียดทักษะ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SKILL_DATA.map((s) => {
              const diff = s.current - s.previous
              return (
                <div key={s.skill} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {SKILL_ICONS[s.skill]}
                      <span className="text-xs font-medium">{s.skill}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">{s.current}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        diff > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
                      }`}>
                        {diff > 0 ? "+" : ""}{diff}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full bg-gray-100 overflow-hidden">
                    {/* Previous */}
                    <div
                      className="absolute top-0 left-0 h-full rounded-full bg-purple-200"
                      style={{ width: `${s.previous}%` }}
                    />
                    {/* Current */}
                    <div
                      className="absolute top-0 left-0 h-full rounded-full bg-purple-600 transition-all"
                      style={{ width: `${s.current}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Monthly attendance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">📅 การเข้าเรียนรายเดือน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MONTHLY_PROGRESS.map((m) => {
              const pct = Math.round((m.completed / m.sessions) * 100)
              return (
                <div key={m.month} className="rounded-xl bg-muted/30 p-3 text-center space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">{m.month}</p>
                  <div className="relative w-14 h-14 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9"
                        fill="none"
                        stroke={pct === 100 ? "#22c55e" : pct >= 75 ? "#7c3aed" : "#f59e0b"}
                        strokeWidth="3"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                      {pct}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.completed}/{m.sessions} ครั้ง</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MOCK_ACHIEVEMENTS.map((a) => (
              <div
                key={a.label}
                className={[
                  "flex items-center gap-3 rounded-xl p-3 border transition-all",
                  a.earned
                    ? "bg-amber-50 border-amber-200 shadow-sm"
                    : "bg-gray-50 border-gray-200 opacity-50 grayscale",
                ].join(" ")}
              >
                <span className="text-2xl shrink-0">{a.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{a.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{a.desc}</p>
                  {a.earned && (
                    <span className="text-[10px] text-amber-600 font-semibold">✓ ได้รับแล้ว</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground pb-2">
        🚀 ฟีเจอร์นี้กำลังจะมาเร็วๆ นี้ (Coming Soon)
      </p>
    </div>
  )
}
