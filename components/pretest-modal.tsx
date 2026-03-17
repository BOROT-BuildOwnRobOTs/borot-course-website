"use client"

import { useState, useCallback } from "react"
import { X, ChevronRight, ChevronLeft, RotateCcw, Sparkles, Globe } from "lucide-react"

type Lang = "th" | "en"

interface Question {
  id: string
  th: string
  en: string
  options: {
    th: string
    en: string
    // Score weights for each track: [rj_basic, rj_advanced, inventors3d, robogenesis]
    scores: [number, number, number, number]
  }[]
}

const questions: Question[] = [
  {
    id: "age",
    th: "บุตรหลานของท่านอายุเท่าไหร่?",
    en: "How old is your child?",
    options: [
      { th: "4–6 ปี", en: "4–6 years old", scores: [3, 0, 1, 1] },
      { th: "7–8 ปี", en: "7–8 years old", scores: [3, 0, 2, 2] },
      { th: "9–10 ปี", en: "9–10 years old", scores: [2, 2, 3, 3] },
      { th: "11–12 ปี", en: "11–12 years old", scores: [1, 3, 3, 3] },
      { th: "13 ปีขึ้นไป", en: "13+ years old", scores: [0, 3, 2, 2] },
    ],
  },
  {
    id: "interest",
    th: "บุตรหลานของท่านชอบทำกิจกรรมแบบไหนมากที่สุด?",
    en: "What type of activity does your child enjoy the most?",
    options: [
      { th: "ต่อเลโก้ ประกอบของเล่น สร้างสิ่งประดิษฐ์", en: "Building with Lego, assembling toys, making inventions", scores: [3, 1, 2, 2] },
      { th: "เล่นเกมคอมพิวเตอร์ สนใจเทคโนโลยี", en: "Playing computer games, interested in technology", scores: [1, 3, 1, 2] },
      { th: "วาดรูป ออกแบบ งานศิลปะ งานประดิษฐ์", en: "Drawing, designing, arts & crafts", scores: [1, 0, 3, 2] },
      { th: "ทดลองวิทยาศาสตร์ สังเกตธรรมชาติ ชอบถามว่า 'ทำไม?'", en: "Science experiments, observing nature, always asking 'why?'", scores: [2, 2, 1, 3] },
    ],
  },
  {
    id: "experience",
    th: "บุตรหลานของท่านเคยมีประสบการณ์ด้านใดมาก่อน?",
    en: "Does your child have any prior experience in the following?",
    options: [
      { th: "เคยเรียนหรือเล่นหุ่นยนต์ / Lego Robotics", en: "Has learned or played with robots / Lego Robotics", scores: [2, 3, 1, 2] },
      { th: "เคยลองเขียนโปรแกรมหรือ Coding (เช่น Scratch, Block coding)", en: "Has tried programming / coding (e.g., Scratch, Block coding)", scores: [1, 3, 1, 3] },
      { th: "เคยใช้โปรแกรม 3D หรือออกแบบดิจิทัล", en: "Has used 3D software or digital design tools", scores: [0, 1, 3, 2] },
      { th: "ยังไม่เคยมีประสบการณ์ — เริ่มต้นใหม่เลย!", en: "No prior experience — starting fresh!", scores: [3, 0, 2, 2] },
    ],
  },
  {
    id: "learning_style",
    th: "บุตรหลานของท่านชอบเรียนรู้แบบไหน?",
    en: "How does your child prefer to learn?",
    options: [
      { th: "ลงมือทำเลย ทดลองจริง เรียนรู้จากการปฏิบัติ", en: "Hands-on, learn by doing and experimenting", scores: [3, 2, 2, 3] },
      { th: "ทำตามขั้นตอน เป็นระบบ เรียนทีละอย่าง", en: "Step-by-step, systematic, one thing at a time", scores: [2, 3, 2, 1] },
      { th: "ออกแบบเอง สร้างสรรค์อิสระ จินตนาการ", en: "Creative freedom, designing, using imagination", scores: [1, 1, 3, 2] },
      { th: "ชอบทำงานเป็นทีม แข่งขัน ท้าทาย", en: "Teamwork, competition, challenges", scores: [3, 2, 1, 3] },
    ],
  },
  {
    id: "exciting",
    th: "อะไรจะทำให้บุตรหลานตื่นเต้นมากที่สุด?",
    en: "What would excite your child the most?",
    options: [
      { th: "สร้างหุ่นยนต์ที่เคลื่อนที่ได้จริง 🤖", en: "Building a robot that actually moves 🤖", scores: [3, 2, 0, 2] },
      { th: "สร้างบ้านอัจฉริยะ หรือ AI ที่คิดเองได้ 🏠", en: "Creating a smart home or AI that thinks 🏠", scores: [0, 3, 0, 1] },
      { th: "ออกแบบของเจ๋งๆ แล้วปริ้นท์ 3D ออกมาจับได้จริง 🎨", en: "Designing cool stuff and 3D printing it 🎨", scores: [0, 0, 3, 1] },
      { th: "ต่อวงจรไฟฟ้า เขียนโค้ด ทำเกมเอง ⚡", en: "Wiring circuits, coding, making your own games ⚡", scores: [1, 2, 1, 3] },
    ],
  },
  {
    id: "problem_solving",
    th: "เมื่อเจอปัญหา บุตรหลานของท่านมักจะ...?",
    en: "When facing a problem, your child usually...?",
    options: [
      { th: "ลองทำหลายๆ แบบ จนกว่าจะสำเร็จ", en: "Tries multiple approaches until it works", scores: [3, 2, 2, 3] },
      { th: "คิดวิเคราะห์หาเหตุผลก่อนลงมือทำ", en: "Thinks and analyzes before taking action", scores: [1, 3, 1, 2] },
      { th: "หาวิธีสร้างสรรค์ใหม่ๆ ที่ไม่เหมือนใคร", en: "Finds creative and unique solutions", scores: [1, 1, 3, 2] },
      { th: "ถามผู้ใหญ่หรือเพื่อน แล้วเรียนรู้จากคำแนะนำ", en: "Asks others and learns from guidance", scores: [3, 1, 2, 1] },
    ],
  },
  {
    id: "future_dream",
    th: "บุตรหลานของท่านอยากเป็นอะไรในอนาคต? (หรือชอบด้านไหน)",
    en: "What does your child dream of becoming? (or what field interests them?)",
    options: [
      { th: "วิศวกร / นักประดิษฐ์ / ช่างเครื่อง", en: "Engineer / Inventor / Mechanic", scores: [3, 2, 1, 2] },
      { th: "โปรแกรมเมอร์ / นักพัฒนา AI / Data Scientist", en: "Programmer / AI Developer / Data Scientist", scores: [0, 3, 0, 2] },
      { th: "นักออกแบบ / สถาปนิก / ศิลปิน / ดีไซเนอร์", en: "Designer / Architect / Artist", scores: [0, 0, 3, 1] },
      { th: "นักวิทยาศาสตร์ / นักสำรวจ / ยังไม่แน่ใจ — อยากลองหลายๆ อย่าง", en: "Scientist / Explorer / Not sure — want to try everything", scores: [2, 1, 2, 3] },
    ],
  },
  {
    id: "commitment",
    th: "ท่านสนใจให้บุตรหลานเรียนรูปแบบไหน?",
    en: "What format are you interested in?",
    options: [
      { th: "คอร์สยาว 10–12 ครั้ง เรียนรู้เจาะลึก", en: "Long course (10–12 sessions), in-depth learning", scores: [3, 3, 0, 0] },
      { th: "คอร์สสั้น 4 ครั้ง ลองเรียนก่อน", en: "Short course (4 sessions), try it first", scores: [0, 0, 3, 3] },
      { th: "Mini Camp 2 วัน เรียนเข้มข้น", en: "2-day Mini Camp, intensive learning", scores: [0, 0, 3, 1] },
      { th: "ยังไม่แน่ใจ — อยากได้คำแนะนำ", en: "Not sure yet — want a recommendation", scores: [2, 2, 2, 2] },
    ],
  },
]

interface CareerPath {
  key: string
  emoji: string
  name: { th: string; en: string }
  description: { th: string; en: string }
  color: string
  // Score weights matching [rj_basic, rj_advanced, inventors3d, robogenesis]
  weights: [number, number, number, number]
}

const careerPaths: CareerPath[] = [
  {
    key: "robotics_engineer",
    emoji: "🤖",
    name: { th: "วิศวกรหุ่นยนต์", en: "Robotics Engineer" },
    description: {
      th: "ออกแบบและสร้างหุ่นยนต์ ระบบอัตโนมัติ และเครื่องจักรอัจฉริยะ",
      en: "Design and build robots, automation systems, and intelligent machines",
    },
    color: "#E5690D",
    weights: [3, 2, 0, 1],
  },
  {
    key: "ai_developer",
    emoji: "🧠",
    name: { th: "นักพัฒนา AI / Machine Learning", en: "AI / Machine Learning Developer" },
    description: {
      th: "สร้างระบบปัญญาประดิษฐ์ที่เรียนรู้และตัดสินใจได้เอง",
      en: "Build artificial intelligence systems that learn and make decisions",
    },
    color: "#C2410C",
    weights: [0, 3, 0, 1],
  },
  {
    key: "programmer",
    emoji: "💻",
    name: { th: "โปรแกรมเมอร์ / Software Developer", en: "Programmer / Software Developer" },
    description: {
      th: "เขียนโค้ดสร้างแอป เว็บ และซอฟต์แวร์ที่ใช้ในชีวิตประจำวัน",
      en: "Write code to build apps, websites, and everyday software",
    },
    color: "#6366F1",
    weights: [0, 2, 0, 3],
  },
  {
    key: "game_developer",
    emoji: "🎮",
    name: { th: "นักพัฒนาเกม", en: "Game Developer" },
    description: {
      th: "ออกแบบและสร้างเกม ผสมผสานศิลปะ เทคนิค และ Coding",
      en: "Design and create games, combining art, mechanics, and coding",
    },
    color: "#8B5CF6",
    weights: [0, 1, 2, 3],
  },
  {
    key: "product_designer",
    emoji: "🎨",
    name: { th: "นักออกแบบผลิตภัณฑ์ / 3D Designer", en: "Product / 3D Designer" },
    description: {
      th: "ออกแบบสิ่งของ ผลิตภัณฑ์ และงาน 3D ที่สวยงามและใช้งานได้จริง",
      en: "Design products, objects, and 3D creations that are beautiful and functional",
    },
    color: "#0D9488",
    weights: [0, 0, 3, 1],
  },
  {
    key: "architect",
    emoji: "🏗️",
    name: { th: "สถาปนิก / วิศวกรโครงสร้าง", en: "Architect / Structural Engineer" },
    description: {
      th: "ออกแบบอาคาร โครงสร้าง และสิ่งก่อสร้างที่สร้างสรรค์",
      en: "Design buildings, structures, and creative constructions",
    },
    color: "#059669",
    weights: [1, 0, 3, 1],
  },
  {
    key: "iot_smart",
    emoji: "🏠",
    name: { th: "วิศวกร IoT / Smart System", en: "IoT / Smart System Engineer" },
    description: {
      th: "สร้างระบบอัจฉริยะ บ้านอัจฉริยะ อุปกรณ์เชื่อมต่ออินเทอร์เน็ต",
      en: "Build smart systems, smart homes, and internet-connected devices",
    },
    color: "#2563EB",
    weights: [0, 3, 0, 2],
  },
  {
    key: "inventor",
    emoji: "🔬",
    name: { th: "นักประดิษฐ์ / Innovator", en: "Inventor / Innovator" },
    description: {
      th: "คิดค้นสิ่งใหม่ๆ ผสมผสานหลายศาสตร์เพื่อแก้ปัญหาของโลก",
      en: "Invent new things, combining multiple disciplines to solve world problems",
    },
    color: "#D97706",
    weights: [2, 1, 1, 3],
  },
]

interface TrackResult {
  key: string
  name: { th: string; en: string }
  description: { th: string; en: string }
  color: string
  colorLight: string
  emoji: string
  recommended: { th: string; en: string }
}

const trackResults: TrackResult[] = [
  {
    key: "rj_basic",
    name: { th: "RoboJourney — พื้นฐาน", en: "RoboJourney — Beginner" },
    description: {
      th: "เหมาะสำหรับเด็กที่ชอบต่อของเล่น ลงมือทำ สร้างหุ่นยนต์ด้วย Lego — เรียนรู้พื้นฐานวิศวกรรมและโปรแกรมมิ่ง",
      en: "Perfect for kids who love building, hands-on creation, and robots with Lego — learning engineering and programming fundamentals",
    },
    color: "#E5690D",
    colorLight: "#FFF7F0",
    emoji: "🦾",
    recommended: {
      th: "แนะนำ: Junior Discovery (Level 1) สำหรับเริ่มต้น",
      en: "Recommended: Junior Discovery (Level 1) to start",
    },
  },
  {
    key: "rj_advanced",
    name: { th: "RoboJourney — ขั้นสูง", en: "RoboJourney — Advanced" },
    description: {
      th: "เหมาะสำหรับเด็กที่สนใจเทคโนโลยี AI, IoT, และอยากสร้างโปรเจกต์อัจฉริยะ — Smart House, AI Waste Sorter, Robotic Hand",
      en: "Ideal for tech-savvy kids interested in AI, IoT, and smart projects — Smart House, AI Waste Sorter, Robotic Hand",
    },
    color: "#C2410C",
    colorLight: "#FFF1EB",
    emoji: "🤖",
    recommended: {
      th: "แนะนำ: IoT Smart House (Level 5) เพื่อเข้าสู่โลก AI & IoT",
      en: "Recommended: IoT Smart House (Level 5) to enter the world of AI & IoT",
    },
  },
  {
    key: "inventors3d",
    name: { th: "Little 3D Inventors", en: "Little 3D Inventors" },
    description: {
      th: "เหมาะสำหรับเด็กที่ชอบออกแบบ สร้างสรรค์ ใช้จินตนาการ — ออกแบบ 3D แล้วปริ้นท์ออกมาจับต้องได้จริง",
      en: "Great for creative kids who love design and imagination — design in 3D and hold your creation in real life",
    },
    color: "#0D9488",
    colorLight: "#F0FDFA",
    emoji: "🎨",
    recommended: {
      th: "แนะนำ: 3D Inventors Basic (Level 1) เริ่มจากออกแบบพวงกุญแจ!",
      en: "Recommended: 3D Inventors Basic (Level 1) — start by designing a keychain!",
    },
  },
  {
    key: "robogenesis",
    name: { th: "Robogenesis", en: "Robogenesis" },
    description: {
      th: "เหมาะสำหรับเด็กที่อยากลองหลายๆ อย่าง — 3D + วงจรไฟฟ้า + เขียนโค้ด ในแพ็คเกจเดียว สายอาชีพนวัตกร",
      en: "Perfect for curious kids who want to try everything — 3D + Circuits + Coding in one integrated package, future innovator track",
    },
    color: "#6366F1",
    colorLight: "#EEF2FF",
    emoji: "⚡",
    recommended: {
      th: "แนะนำ: Basic Create — Design 3D (Step 1) เป็นจุดเริ่มต้น",
      en: "Recommended: Basic Create — Design 3D (Step 1) as a starting point",
    },
  },
]

interface PretestModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PretestModal({ isOpen, onClose }: PretestModalProps) {
  const [lang, setLang] = useState<Lang>("th")
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResult, setShowResult] = useState(false)

  const totalQuestions = questions.length

  const handleAnswer = useCallback((questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentStep < totalQuestions - 1) {
        setCurrentStep((prev) => prev + 1)
      } else {
        setShowResult(true)
      }
    }, 300)
  }, [currentStep, totalQuestions])

  const handleReset = useCallback(() => {
    setAnswers({})
    setCurrentStep(0)
    setShowResult(false)
  }, [])

  const getTrackScores = useCallback((): [number, number, number, number] => {
    const scores: [number, number, number, number] = [0, 0, 0, 0]
    Object.entries(answers).forEach(([questionId, optionIndex]) => {
      const question = questions.find((q) => q.id === questionId)
      if (question) {
        const option = question.options[optionIndex]
        if (option) {
          option.scores.forEach((s, i) => {
            scores[i] += s
          })
        }
      }
    })
    return scores
  }, [answers])

  const calculateResult = useCallback((): TrackResult[] => {
    const scores = getTrackScores()
    const indexed = scores.map((score, i) => ({ index: i, score }))
    indexed.sort((a, b) => b.score - a.score)
    return indexed.map((item) => trackResults[item.index])
  }, [getTrackScores])

  const calculateCareerPaths = useCallback((): { career: CareerPath; score: number; percent: number }[] => {
    const trackScores = getTrackScores()
    
    const scored = careerPaths.map((career) => {
      let score = 0
      career.weights.forEach((w, i) => {
        score += w * trackScores[i]
      })
      return { career, score }
    })

    scored.sort((a, b) => b.score - a.score)
    const maxScore = scored[0]?.score || 1

    return scored.map((item) => ({
      ...item,
      percent: Math.round((item.score / maxScore) * 100),
    }))
  }, [getTrackScores])

  if (!isOpen) return null

  const currentQuestion = questions[currentStep]
  const progress = showResult ? 100 : ((currentStep) / totalQuestions) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] max-w-[540px] max-h-[90vh] overflow-hidden flex flex-col"
        style={{ animation: "pretestSlideIn 0.3s cubic-bezier(0.32, 0.72, 0, 1)" }}>
        <style>{`
          @keyframes pretestSlideIn {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes pretestFadeIn {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .pretest-fade-in {
            animation: pretestFadeIn 0.3s ease-out;
          }
          .option-btn {
            transition: all 0.2s ease;
          }
          .option-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          .option-btn:active {
            transform: scale(0.98);
          }
          .option-btn.selected {
            border-color: #E5690D !important;
            background: #FFF7F0 !important;
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E5690D] to-[#FF8C00] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827] leading-tight">
                {lang === "th" ? "แบบทดสอบค้นหาคอร์สที่ใช่" : "Find the Right Course"}
              </h2>
              <p className="text-[11px] text-[#9CA3AF]">
                {lang === "th" ? "ค้นหาเส้นทางการเรียนรู้ที่เหมาะกับบุตรหลาน" : "Discover the best learning path for your child"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "th" ? "en" : "th")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "th" ? "EN" : "ไทย"}
            </button>
            {/* Close */}
            <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-full transition-colors">
              <X className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-5 pt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
              {showResult
                ? (lang === "th" ? "✨ ผลลัพธ์" : "✨ Result")
                : `${lang === "th" ? "คำถามที่" : "Question"} ${currentStep + 1}/${totalQuestions}`}
            </span>
            {!showResult && currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-1 text-[11px] text-[#9CA3AF] hover:text-[#E5690D] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                {lang === "th" ? "ย้อนกลับ" : "Back"}
              </button>
            )}
          </div>
          <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #E5690D, #FF8C00)",
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ WebkitOverflowScrolling: "touch" }}>
          {!showResult && currentQuestion && (
            <div key={currentQuestion.id} className="pretest-fade-in">
              {/* Question */}
              <h3 className="text-lg font-bold text-[#111827] leading-snug mb-4">
                {lang === "th" ? currentQuestion.th : currentQuestion.en}
              </h3>

              {/* Options */}
              <div className="flex flex-col gap-2.5">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(currentQuestion.id, idx)}
                      className={`option-btn w-full text-left px-4 py-3.5 rounded-xl border-2 ${
                        isSelected ? "selected" : "border-[#E9ECEF] bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                          style={{
                            background: isSelected ? "#E5690D" : "#F3F4F6",
                            color: isSelected ? "#fff" : "#9CA3AF",
                          }}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-sm font-medium text-[#374151] leading-snug">
                          {lang === "th" ? option.th : option.en}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {showResult && (() => {
            const careers = calculateCareerPaths()
            const topCareers = careers.slice(0, 3)
            const otherCareers = careers.slice(3, 6)

            return (
            <div className="pretest-fade-in">
              {/* Header */}
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-xl font-bold text-[#111827]">
                  {lang === "th" ? "ผลการวิเคราะห์" : "Your Analysis Result"}
                </h3>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  {lang === "th"
                    ? "จากคำตอบของท่าน บุตรหลานมีแนวโน้มเหมาะกับสายอาชีพเหล่านี้"
                    : "Based on your answers, your child shows aptitude for these career paths"}
                </p>
              </div>

              {/* ═══ Career Path Section ═══ */}
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
                  🧭 {lang === "th" ? "สายอาชีพที่เหมาะสม" : "Suitable Career Paths"}
                </p>
                
                {/* Top Career — Featured */}
                {topCareers[0] && (
                  <div
                    className="rounded-xl border-2 p-4 mb-3"
                    style={{
                      borderColor: topCareers[0].career.color,
                      background: `linear-gradient(135deg, ${topCareers[0].career.color}08 0%, ${topCareers[0].career.color}15 100%)`,
                      boxShadow: `0 4px 16px -4px ${topCareers[0].career.color}33`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl flex-shrink-0">{topCareers[0].career.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white inline-block mb-1.5"
                          style={{ background: topCareers[0].career.color }}
                        >
                          ⭐ {lang === "th" ? "เหมาะสมที่สุด" : "Best Match"}
                        </span>
                        <h4 className="text-base font-bold text-[#111827]">
                          {lang === "th" ? topCareers[0].career.name.th : topCareers[0].career.name.en}
                        </h4>
                        <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                          {lang === "th" ? topCareers[0].career.description.th : topCareers[0].career.description.en}
                        </p>
                        {/* Score bar */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${topCareers[0].percent}%`,
                                background: `linear-gradient(90deg, ${topCareers[0].career.color}, ${topCareers[0].career.color}CC)`,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-bold" style={{ color: topCareers[0].career.color }}>
                            {topCareers[0].percent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2nd & 3rd Career */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {topCareers.slice(1).map((item, idx) => (
                    <div
                      key={item.career.key}
                      className="rounded-xl border p-3"
                      style={{ borderColor: "#E9ECEF", background: "#FAFAFA" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{item.career.emoji}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-[#6B7280] bg-[#F3F4F6]">
                          #{idx + 2}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-[#111827] leading-snug">
                        {lang === "th" ? item.career.name.th : item.career.name.en}
                      </h5>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${item.percent}%`,
                              background: item.career.color,
                              opacity: 0.7,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#9CA3AF]">{item.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Other matching careers — compact */}
                {otherCareers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {otherCareers.map((item) => (
                      <span
                        key={item.career.key}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border border-[#E9ECEF] bg-white text-[#6B7280]"
                      >
                        <span>{item.career.emoji}</span>
                        {lang === "th" ? item.career.name.th : item.career.name.en}
                        <span className="text-[#C4C4C4]">{item.percent}%</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ═══ Divider ═══ */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#E9ECEF]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C4C4C4]">
                  {lang === "th" ? "คอร์สที่แนะนำ" : "Recommended Courses"}
                </span>
                <div className="flex-1 h-px bg-[#E9ECEF]" />
              </div>

              {/* ═══ Course Recommendations ═══ */}
              <p className="text-xs text-[#9CA3AF] mb-3">
                {lang === "th"
                  ? "เริ่มต้นเส้นทางสายอาชีพด้วยคอร์สเหล่านี้"
                  : "Start your career path journey with these courses"}
              </p>
              <div className="flex flex-col gap-2.5">
                {calculateResult().slice(0, 2).map((track, idx) => (
                  <div
                    key={track.key}
                    className="rounded-xl border-2 p-3.5 transition-all"
                    style={{
                      borderColor: idx === 0 ? track.color : "#E9ECEF",
                      background: idx === 0 ? track.colorLight : "#FAFAFA",
                      boxShadow: idx === 0 ? `0 4px 16px -4px ${track.color}33` : "none",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">{track.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {idx === 0 && (
                            <span
                              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                              style={{ background: track.color }}
                            >
                              {lang === "th" ? "🏆 แนะนำอันดับ 1" : "🏆 Top Pick"}
                            </span>
                          )}
                          {idx === 1 && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-[#6B7280] bg-[#F3F4F6]">
                              {lang === "th" ? "อันดับ 2" : "#2 Pick"}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-[#111827]">
                          {lang === "th" ? track.name.th : track.name.en}
                        </h4>
                        <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                          {lang === "th" ? track.description.th : track.description.en}
                        </p>
                        <div
                          className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold"
                          style={{ color: track.color }}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                          {lang === "th" ? track.recommended.th : track.recommended.en}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col gap-2.5 mt-5">
                <a
                  href="/courses"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #E5690D, #FF8C00)" }}
                >
                  {lang === "th" ? "ดูรายละเอียดคอร์สทั้งหมด" : "View All Course Details"}
                  <ChevronRight className="w-4 h-4" />
                </a>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  {lang === "th" ? "ทำแบบทดสอบอีกครั้ง" : "Retake the Test"}
                </button>
              </div>
            </div>
            )
          })()}
        </div>

        {/* Footer hint */}
        {!showResult && (
          <div className="px-5 pb-4 pt-1">
            <p className="text-[10px] text-center text-[#C4C4C4]">
              {lang === "th"
                ? "เลือกคำตอบที่ตรงกับบุตรหลานมากที่สุด • คำตอบจะถูกวิเคราะห์โดยอัตโนมัติ"
                : "Choose the answer that best describes your child • Results are analyzed automatically"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
