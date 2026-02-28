"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Send, Sparkles, User, Loader2 } from "lucide-react"

// ── Locked AI answers map ──────────────────────────────────────────────────
// key = normalized question text, value = answer lines
const LOCKED_ANSWERS: Record<string, string[]> = {
  "ควรต่อ level 2 หรือ robotics": [
    "จากข้อมูล 12 sessions ที่ผ่านมา แนะนำให้ต่อ **Robotics Level 2** ก่อนเลยครับ 🤖",
    "เหตุผล: น้องมี Logical Thinking และ Problem Solving ที่แข็งแกร่ง เหมาะกับการต่อยอด programming-based",
    "3D Printing เหมาะกว่าในภายหลัง เมื่อ Engineering Skill พัฒนาขึ้นแล้ว",
  ],
  "ควรต่อ level 2": [
    "จากข้อมูล 12 sessions ที่ผ่านมา แนะนำให้ต่อ **Robotics Level 2** ก่อนเลยครับ 🤖",
    "เหตุผล: น้องมี Logical Thinking และ Problem Solving ที่แข็งแกร่ง เหมาะกับการต่อยอด programming-based",
    "3D Printing เหมาะกว่าในภายหลัง เมื่อ Engineering Skill พัฒนาขึ้นแล้ว",
  ],
  "mechanical structure": [
    "ใช่เลย! จากการสังเกต session 4–6 โครงสร้างหุ่นยนต์มักจะหลวมในส่วน joint 🔧",
    "แนะนำให้ฝึก: Lego Technic structure, Bridge challenge, Load-bearing design",
    "ใช้เวลาแค่ 1–2 สัปดาห์เสริม ก็จะเห็นความแตกต่างชัดเจน",
  ],
  "competition track": [
    "น้องเหมาะมากกับ Competition Track! 🏆",
    "Teamwork score อยู่ที่ 90/100 และ Problem Solving 78/100 — สูงกว่าค่าเฉลี่ยนักเรียนทั่วไป",
    "แนะนำให้เริ่มเตรียมตัวด้วย Competition Prep Module ในเทอมหน้า",
  ],
  "animation": [
    "น่าสนใจมากเลยครับ! Animation เหมาะกับน้องมากเพราะ Creativity score สูงถึง 85/100 🎨",
    "แนะนำให้ลอง: Scratch animation, Stop-motion, Servo motor choreography",
    "การทำ Animation จะเสริม presentation skill และเปิดโลก digital art ให้กว้างขึ้น",
  ],
  "engineering หรือ design": [
    "จากการวิเคราะห์ น้องมีแนวโน้มด้าน **Engineering** มากกว่า Design ประมาณ 60:40 🧠",
    "Logical Thinking (72) และ Problem Solving (78) ชี้ว่าน้องชอบ 'ทำให้มันทำงานได้' มากกว่า 'ทำให้มันสวย'",
    "แต่ Creativity (85) สูงมากเช่นกัน อาจเป็น Engineering-Creative hybrid ที่หายากมาก!",
  ],
  "ทักษะที่ควรฝึก": [
    "ทักษะที่ควรเน้นตอนนี้ตามลำดับความสำคัญ: 💪",
    "1. 🔴 Mechanical Structure (ฝึกด่วน) — โครงสร้างยังหลวม",
    "2. 🟡 Animation & Motion Design — Creativity สูง ควรนำมาใช้",
    "3. 🟡 Electronics & Circuit — จะช่วย debug robot ได้เร็วขึ้น",
    "4. 🟢 Data & Coding Logic — เสริมพื้นฐาน AI/ML ในอนาคต",
  ],
  "คอร์สถัดไป": [
    "คอร์สที่แนะนำถัดไป (เรียงตามความเหมาะสม): 🎯",
    "🥇 Robotics Level 2 — match 92% (แนะนำสูงสุด)",
    "🥈 Competition Prep Track — match 85%",
    "🥉 Electronics Fundamentals — match 74%",
  ],
  "default": [
    "ขอบคุณสำหรับคำถามนะครับ! 🤖",
    "ฟีเจอร์นี้ยังอยู่ในช่วง Coming Soon — ในเวอร์ชันจริง AI จะวิเคราะห์จากข้อมูลการเรียนทั้งหมดและตอบคำถามนี้ได้อย่างแม่นยำ",
    "ลองกดคำถามสำเร็จรูปด้านบนเพื่อดูตัวอย่างผลลัพธ์ได้เลยครับ 👆",
  ],
}

// ── Preset questions ───────────────────────────────────────────────────────
const PRESET_QUESTIONS = [
  { label: "ควรต่อ Level 2 หรือ Robotics?",         key: "ควรต่อ level 2 หรือ robotics" },
  { label: "ควรฝึก Mechanical structure เพิ่มไหม?",  key: "mechanical structure" },
  { label: "เหมาะกับ Competition Track ไหม?",        key: "competition track" },
  { label: "ควรลอง Animation ไหม?",                  key: "animation" },
  { label: "Engineering หรือ Design มากกว่า?",        key: "engineering หรือ design" },
  { label: "ทักษะที่ควรฝึกเพิ่มตอนนี้คืออะไร?",      key: "ทักษะที่ควรฝึก" },
  { label: "แนะนำคอร์สถัดไป",                         key: "คอร์สถัดไป" },
]

// ── Types ──────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: "user" | "ai"
  text?: string
  lines?: string[]
  isTyping?: boolean
}

// ── Helper ─────────────────────────────────────────────────────────────────
function matchAnswer(question: string): string[] {
  const q = question.toLowerCase()
  for (const [key, answer] of Object.entries(LOCKED_ANSWERS)) {
    if (key !== "default" && q.includes(key)) return answer
  }
  return LOCKED_ANSWERS["default"]
}

// ── Render bold markdown inline ────────────────────────────────────────────
function renderLine(line: string) {
  const parts = line.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

// ── Component ──────────────────────────────────────────────────────────────
interface Props {
  studentName?: string
}

export default function AIRecommendation({ studentName }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      lines: [
        `สวัสดีครับ! ผม BOROT AI 🤖`,
        `${studentName ? `ผมได้วิเคราะห์ข้อมูลการเรียนของน้อง ${studentName} แล้ว` : "ผมวิเคราะห์ข้อมูลการเรียนพร้อมแล้ว"}`,
        "ลองกดคำถามด้านล่าง หรือพิมพ์ถามได้เลยครับ (Demo mode — คำตอบเป็นตัวอย่าง)",
      ],
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = (text: string) => {
    if (!text.trim() || isLoading) return
    const question = text.trim()
    setInput("")

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: question }])
    setIsLoading(true)

    // Simulate AI thinking
    setTimeout(() => {
      const answer = matchAnswer(question)
      setMessages((prev) => [...prev, { role: "ai", lines: answer }])
      setIsLoading(false)
    }, 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">AI Recommendation</h2>
            <p className="text-xs text-muted-foreground">
              ทดลองถาม AI วิเคราะห์พัฒนาการ · Demo Mode
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
          🚀 Coming Soon · Demo
        </Badge>
      </div>

      {/* Preset question chips */}
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-2">💡 คำถามตัวอย่าง — กดเพื่อถามเลย:</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((q) => (
            <button
              key={q.key}
              onClick={() => sendMessage(q.label)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700
                hover:bg-purple-100 hover:border-purple-300 transition-all font-medium
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <Card className="border border-purple-100 overflow-hidden">
        <CardHeader className="py-2.5 px-4 bg-gradient-to-r from-violet-600 to-purple-600">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            BOROT AI Chat · Demo
            <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
              คำตอบเป็นตัวอย่าง
            </span>
          </CardTitle>
        </CardHeader>

        {/* Messages */}
        <CardContent className="p-0">
          <div className="h-80 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={[
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm",
                  msg.role === "ai"
                    ? "bg-gradient-to-br from-violet-500 to-purple-600"
                    : "bg-gradient-to-br from-blue-500 to-cyan-500",
                ].join(" ")}>
                  {msg.role === "ai" ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>

                {/* Bubble */}
                <div className={[
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm space-y-0.5",
                  msg.role === "ai"
                    ? "bg-white border border-purple-100 rounded-tl-none text-gray-700"
                    : "bg-gradient-to-br from-blue-500 to-cyan-500 rounded-tr-none text-white",
                ].join(" ")}>
                  {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                  {msg.lines?.map((line, j) => (
                    <p key={j} className="leading-relaxed">
                      {renderLine(line)}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 flex-row">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-purple-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t bg-white px-3 py-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="พิมพ์คำถามของคุณ... (กด Enter หรือ ส่ง)"
              disabled={isLoading}
              className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300
                placeholder:text-gray-400 disabled:opacity-60"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-purple-600
                flex items-center justify-center text-white shadow-sm
                hover:shadow-md transition-all hover:scale-105 active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground pb-2">
        🤖 Demo เท่านั้น — AI จริงจะเชื่อมกับข้อมูลการเรียน · Coming Soon
      </p>
    </div>
  )
}
