"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"

/* ─── Track config ─────────────────────────────────────────────── */
const tracks = {
  rj_basic: {
    color: "#E5690D",
    colorLight: "#FFF7F0",
    colorMid: "#FED7AA",
  },
  rj_advanced: {
    color: "#C2410C",
    colorLight: "#FFF1EB",
    colorMid: "#FDBA74",
  },
  inventors3d: {
    color: "#0D9488",
    colorLight: "#F0FDFA",
    colorMid: "#99F6E4",
  },
  robogenesis: {
    color: "#6366F1",
    colorLight: "#EEF2FF",
    colorMid: "#C7D2FE",
  },
}

type TrackKey = keyof typeof tracks

interface Node {
  id: string
  track: TrackKey
  col: 0 | 1 | 2 | 3
  row: number
  badge: string
  title: string
  age: string
  sessions: string
  price: string
  priceNote?: string
  desc: string
  tools: string
  emoji: string
  miniCamp?: {
    price: string
    note: string
  }
}

/* ─── Node data ────────────────────────────────────────────────── */
const nodes: Node[] = [
  /* ── Col 0 : RoboJourney Beginner ── */
  {
    id: "rj-l1", track: "rj_basic", col: 0, row: 0,
    badge: "Level 1", title: "Junior Discovery", age: "Age 4–8",
    sessions: "10 sessions · 2 hrs each",
    price: "14,490 THB",
    desc: "First steps into robotics — explore simple mechanisms and give your first programming commands using Lego WeDo.",
    tools: "Lego WeDo",
    emoji: "🦾",
  },
  {
    id: "rj-l2", track: "rj_basic", col: 0, row: 1,
    badge: "Level 2", title: "Junior Challenge", age: "Age 4–8",
    sessions: "10 sessions · 2 hrs each",
    price: "15,990 THB",
    desc: "Solve robot challenges using Lego WeDo — analytical thinking to build and program robots meeting set criteria.",
    tools: "Lego WeDo",
    emoji: "🏆",
  },
  {
    id: "rj-l3", track: "rj_basic", col: 0, row: 2,
    badge: "Level 3", title: "Master Adventure", age: "Age 7–12",
    sessions: "10 sessions · 2 hrs each",
    price: "19,990 THB",
    desc: "Step up to Lego Spike Prime with diverse motors & sensors — intermediate programming for simulated missions.",
    tools: "Lego Spike Prime",
    emoji: "🚀",
  },
  {
    id: "rj-l4", track: "rj_basic", col: 0, row: 3,
    badge: "Level 4", title: "Master Mission", age: "Age 7–12",
    sessions: "10 sessions · 2 hrs each",
    price: "19,900 THB",
    desc: "Complex mechanisms like extendable grabber arms — precision coding and robust structural design for demanding missions.",
    tools: "Lego Spike Prime",
    emoji: "🦿",
  },

  /* ── Col 1 : RoboJourney Advanced ── */
  {
    id: "rj-l5", track: "rj_advanced", col: 1, row: 0,
    badge: "Level 5", title: "IoT Smart House", age: "Age 9+",
    sessions: "12 sessions · 2 hrs each",
    price: "23,990 THB",
    desc: "Build a Smart House model — connect and control electronic devices over a network using IoT principles.",
    tools: "ESP32 · Wi-Fi · Dashboard",
    emoji: "🏠",
  },
  {
    id: "rj-l6", track: "rj_advanced", col: 1, row: 1,
    badge: "Level 6", title: "Waste Sorting AI", age: "Age 9+",
    sessions: "12 sessions · 2 hrs each",
    price: "25,990 THB",
    desc: "Build a smart trash bin that auto-sorts waste — learn foundational AI for object classification and recognition.",
    tools: "Camera Module · AI · Arduino",
    emoji: "♻️",
  },
  {
    id: "rj-l7", track: "rj_advanced", col: 1, row: 2,
    badge: "Level 7", title: "AI Robotic Hand", age: "Age 9+",
    sessions: "12 sessions · 2 hrs each",
    price: "28,990 THB",
    priceNote: "+ 12,000 THB for robot kit",
    desc: "Assemble and program an AI Robotic Hand — merge Micro:bit with biomechanical concepts and machine learning.",
    tools: "Micro:bit · Servo · ML Model",
    emoji: "🖐️",
  },
  {
    id: "rj-l8", track: "rj_advanced", col: 1, row: 3,
    badge: "Level 8", title: "Smart Manipulator", age: "Age 9+",
    sessions: "12 sessions · 2 hrs each",
    price: "31,290 THB",
    priceNote: "+ 15,000 THB for robot kit",
    desc: "Control an industrial robotic arm simulation using Computer Vision — advanced AI for high-precision object handling.",
    tools: "Robotic Arm · Computer Vision · AI",
    emoji: "🦾",
  },

  /* ── Col 2 : Little 3D Inventors ── */
  {
    id: "3d-l1", track: "inventors3d", col: 2, row: 0,
    badge: "Level 1", title: "3D Inventors Basic", age: "Age 5+",
    sessions: "4 sessions · 2 hrs each",
    price: "8,390 THB",
    desc: "Learn 2D/3D spatial concepts, design your first models in Onshape, and create real keychains & toys with a 3D printer.",
    tools: "Onshape · 3D Printer · AI ideation",
    emoji: "🧱",
    miniCamp: {
      price: "12,990 THB",
      note: "Mini Camp available once a month (2-day intensive, 10:00 AM – 3:00 PM)",
    },
  },
  {
    id: "3d-l2", track: "inventors3d", col: 2, row: 1,
    badge: "Level 2", title: "3D Inventors Pro", age: "Age 7+",
    sessions: "4 sessions · 2 hrs each",
    price: "8,890 THB",
    desc: "Master precision measurement with Vernier calipers, design functional items like lamps and vases, balance form vs. function.",
    tools: "Onshape · Vernier Calipers · 3D Printer",
    emoji: "🏮",
  },
  {
    id: "3d-l3", track: "inventors3d", col: 2, row: 2,
    badge: "Level 3", title: "3D Inventors Advanced", age: "Age 10+",
    sessions: "4 sessions · 2 hrs each",
    price: "9,390 THB",
    desc: "3D Assembly design, build a working Vise and Snail Robot, use engineering hand tools, and master full print settings.",
    tools: "Onshape Assembly · Engineering Tools · 3D Printer",
    emoji: "🤖",
  },

  /* ── Col 3 : Robogenesis ── */
  {
    id: "rg-s1", track: "robogenesis", col: 3, row: 0,
    badge: "Step 1", title: "Basic Create — Design 3D", age: "Age 5+",
    sessions: "4 sessions · 2 hrs each",
    price: "9,590 THB",
    desc: "3D thinking with Tinkercad — create keychains, house models, and creative pieces through hands-on experimentation.",
    tools: "Tinkercad · 3D Printer",
    emoji: "🎨",
  },
  {
    id: "rg-s2", track: "robogenesis", col: 3, row: 1,
    badge: "Step 2", title: "Power — Circuits", age: "Age 5+",
    sessions: "4 sessions · 2 hrs each",
    price: "9,990 THB",
    desc: "Breadboard wiring, control LEDs & motors, learn Logic Gates (AND/OR), and practice real circuit troubleshooting.",
    tools: "Breadboard · LEDs · Motors · RGB LED",
    emoji: "⚡",
  },
  {
    id: "rg-s3", track: "robogenesis", col: 3, row: 2,
    badge: "Step 3", title: "Control — Programming", age: "Age 5+",
    sessions: "4 sessions · 2 hrs each",
    price: "10,590 THB",
    desc: "Block-based coding, loops & events, if-else logic — build interactive Micro:bit games and team projects.",
    tools: "Micro:bit · Block Editor · Sensors",
    emoji: "💻",
  },
]

/* ─── Column metadata ──────────────────────────────────────────── */
const columns = [
  {
    col: 0,
    trackNum: "Track 1 — Beginner",
    label: "RoboJourney",
    sub: "Robotics Foundations",
    color: "#E5690D",
    bg: "#FFF7F0",
    border: "#FED7AA",
  },
  {
    col: 1,
    trackNum: "Track 1 — Advanced",
    label: "RoboJourney",
    sub: "AI & IoT Innovation",
    color: "#C2410C",
    bg: "#FFF1EB",
    border: "#FDBA74",
  },
  {
    col: 2,
    trackNum: "Track 2",
    label: "Little 3D Inventors",
    sub: "3D Design & Innovation",
    color: "#0D9488",
    bg: "#F0FDFA",
    border: "#99F6E4",
  },
  {
    col: 3,
    trackNum: "Track 3",
    label: "Robogenesis Series",
    sub: "Integrated Innovation",
    color: "#6366F1",
    bg: "#EEF2FF",
    border: "#C7D2FE",
  },
]

/* ─── Add-on packages ──────────────────────────────────────────── */
const addons = [
  {
    track: "Track 1",
    color: "#E5690D",
    bg: "#FFF7F0",
    border: "#FED7AA",
    items: [
      {
        icon: "🇬🇧",
        title: "Instruction in English",
        desc: "Native-level instructors guaranteed with IELTS 4.5+ / TOEIC 550+",
        price: "+3,499 THB / course",
      },
    ],
  },
  {
    track: "Track 2",
    color: "#0D9488",
    bg: "#F0FDFA",
    border: "#99F6E4",
    items: [
      {
        icon: "👤",
        title: "Private Class",
        desc: "One-on-one tutoring — learn at your own pace",
        price: "+790 THB / course",
      },
      {
        icon: "🇬🇧",
        title: "Instruction in English",
        desc: "Native-level instructors guaranteed with IELTS 4.5+ / TOEIC 550+",
        price: "+2,499 THB / course",
      },
    ],
  },
  {
    track: "Track 3",
    color: "#6366F1",
    bg: "#EEF2FF",
    border: "#C7D2FE",
    items: [
      {
        icon: "👤",
        title: "Private Class",
        desc: "One-on-one tutoring — learn at your own pace",
        price: "+790 THB / course",
      },
      {
        icon: "🇬🇧",
        title: "Instruction in English",
        desc: "Native-level instructors guaranteed with IELTS 4.5+ / TOEIC 550+",
        price: "+2,499 THB / course",
      },
    ],
  },
]

/* ─── Arrow ────────────────────────────────────────────────────── */
function Arrow({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center" style={{ height: 28 }}>
      <div className="w-px flex-1" style={{ background: color, opacity: 0.3 }} />
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path d="M5 6L0 0H10L5 6Z" fill={color} fillOpacity={0.35} />
      </svg>
    </div>
  )
}

/* ─── Node Card ────────────────────────────────────────────────── */
function NodeCard({ node, isActive, onClick }: { node: Node; isActive: boolean; onClick: () => void }) {
  const t = tracks[node.track]
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden"
      style={{
        borderColor: isActive ? t.color : "#E9ECEF",
        background: isActive ? t.colorLight : "#FFFFFF",
        boxShadow: isActive ? `0 6px 28px -4px ${t.color}28` : "0 1px 6px 0 #00000008",
      }}
    >
      {/* Banner */}
      <div
        className="w-full relative overflow-hidden"
        style={{
          height: 96,
          background: `linear-gradient(135deg, ${t.colorMid}55 0%, ${t.colorLight} 100%)`,
          borderBottom: `1px solid ${t.colorMid}55`,
        }}
      >
        <img
          src={`/images/courses/${node.id}.png`}
          alt={node.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // fallback to emoji if image not found
            const target = e.currentTarget
            target.style.display = "none"
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = "flex"
          }}
        />
        {/* Emoji fallback — hidden when image loads */}
        <div
          className="absolute inset-0 items-center justify-center"
          style={{ display: "none" }}
        >
          <span style={{ fontSize: 32 }}>{node.emoji}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Badge + Age */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ color: t.color, background: t.colorMid + "66" }}
          >
            {node.badge}
          </span>
          <span className="text-[11px] text-[#9CA3AF] font-medium">{node.age}</span>
        </div>

        {/* Title */}
        <p className="font-semibold text-sm leading-snug" style={{ color: isActive ? t.color : "#111827" }}>
          {node.title}
        </p>

        {/* Always-visible: sessions + price */}
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="text-[11px] text-[#6B7280]">{node.sessions}</span>
          <span className="text-[12px] font-bold" style={{ color: t.color }}>{node.price}</span>
        </div>

        {/* Expandable */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: isActive ? "300px" : "0px", opacity: isActive ? 1 : 0 }}
        >
          {node.priceNote && (
            <p className="text-[11px] mt-1 font-medium" style={{ color: t.color }}>
              {node.priceNote}
            </p>
          )}
          <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">{node.desc}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {node.tools.split(" · ").map((tool) => (
              <span
                key={tool}
                className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                style={{ borderColor: t.colorMid, color: t.color, background: t.colorLight }}
              >
                {tool}
              </span>
            ))}
          </div>

          {/* Mini Camp badge */}
          {node.miniCamp && (
            <div
              className="mt-3 rounded-xl p-2.5 border"
              style={{ background: t.colorLight, borderColor: t.colorMid }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: t.color }}>
                🏕 Mini Camp Option
              </p>
              <p className="text-[11px] text-[#374151] leading-relaxed">{node.miniCamp.note}</p>
              <p className="text-[12px] font-bold mt-1" style={{ color: t.color }}>{node.miniCamp.price}</p>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function CoursesPage() {
  const [active, setActive] = useState<string | null>(null)
  const colNodes = (col: number) => nodes.filter((n) => n.col === col).sort((a, b) => a.row - b.row)
  const toggle = (id: string) => setActive((prev) => (prev === id ? null : id))

  return (
    <>
      <Navbar />
      <main className="min-h-screen font-sans relative">
        {/* Background image */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: "url('/images/bg-classroom.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            opacity: 0.07,
          }}
        />
        {/* Orange-white tint layer */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: "linear-gradient(135deg, #FFF7F0 0%, #FFFBF7 40%, #F9F8F6 100%)",
          }}
        />
        {/* ── Header ── */}
        <div className="pt-28 pb-10 px-6 container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold tracking-[0.22em] uppercase text-[#E5690D] mb-2">
                Learning Pathways
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F0F0F] leading-tight">
                Course Roadmap
              </h1>
              <p className="mt-3 text-[#6B7280] text-base max-w-lg leading-relaxed">
                Three interconnected tracks — follow one path or combine them.
                Click any card to see full details.
              </p>
            </div>
            {/* Legend */}
            <div className="flex flex-col gap-2 lg:items-end">
              {[
                { color: "#E5690D", label: "Track 1 — RoboJourney (Robotics & AI)" },
                { color: "#0D9488", label: "Track 2 — Little 3D Inventors" },
                { color: "#6366F1", label: "Track 3 — Robogenesis Series" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                  <span className="text-sm text-[#374151] font-medium">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Roadmap Grid ── */}
        <div className="px-6 container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {columns.map((col) => (
              <div key={col.col} className="flex flex-col">
                {/* Column header */}
                <div
                  className="rounded-2xl px-4 py-3 text-center mb-3 border"
                  style={{ background: col.bg, borderColor: col.border, borderBottomWidth: 3, borderBottomColor: col.color }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: col.color }}>
                    {col.trackNum}
                  </p>
                  <p className="text-base font-bold text-[#111827]">{col.label}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{col.sub}</p>
                </div>

                {/* Part 2 label for advanced */}
                {col.col === 1 && (
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="flex-1 h-px" style={{ background: "#C2410C", opacity: 0.2 }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#C2410C", opacity: 0.5 }}>
                      Beyond the Mission
                    </span>
                    <div className="flex-1 h-px" style={{ background: "#C2410C", opacity: 0.2 }} />
                  </div>
                )}

                {/* Nodes */}
                <div className="flex flex-col">
                  {colNodes(col.col).map((node, idx, arr) => (
                    <div key={node.id} className="flex flex-col">
                      <NodeCard node={node} isActive={active === node.id} onClick={() => toggle(node.id)} />
                      {idx < arr.length - 1 && <Arrow color={tracks[node.track].color} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Bottom row: Cross-track + Add-ons side by side ── */}
          <div className="mt-6 grid xl:grid-cols-2 gap-4 pb-6">

            {/* Cross-Track Pathways */}
            <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
                ↔ Cross-Track Pathways
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  { from: "3D Inventors Advanced (L3)", fromColor: "#0D9488", to: "Robogenesis Step 2", toColor: "#6366F1", note: "Apply 3D background into circuits" },
                  { from: "3D Inventors Advanced (L3)", fromColor: "#0D9488", to: "RoboJourney L5–8", toColor: "#C2410C", note: "Skip straight to AI & IoT" },
                  { from: "Robogenesis Step 3", fromColor: "#6366F1", to: "RoboJourney L5–8", toColor: "#C2410C", note: "3D + Circuits + Code → Advanced AI" },
                  { from: "RoboJourney L4", fromColor: "#E5690D", to: "RoboJourney L5–8", toColor: "#C2410C", note: "Natural progression within Track 1" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-2 flex-wrap">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fromColor }} />
                    <span className="text-sm font-semibold" style={{ color: p.fromColor }}>{p.from}</span>
                    <span className="text-[#9CA3AF] text-sm">→</span>
                    <span className="text-sm font-semibold" style={{ color: p.toColor }}>{p.to}</span>
                    <span className="text-xs text-[#9CA3AF]">— {p.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Add-on Packages — single box, color-coded rows */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
                ✦ Special Add-on Packages
              </p>
              <div className="flex flex-col divide-y divide-[#F3F4F6]">

                {/* Track 1 only — English */}
                <div className="flex items-center gap-3 py-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 w-16 text-center" style={{ color: "#E5690D", background: "#FFF7F0" }}>
                    Track 1
                  </span>
                  <span className="text-base flex-shrink-0">🇬🇧</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111827] leading-snug">Instruction in English</p>
                    <p className="text-xs text-[#9CA3AF]">IELTS 4.5+ / TOEIC 550+ instructors guaranteed</p>
                  </div>
                  <span className="text-xs font-bold whitespace-nowrap flex-shrink-0 text-[#E5690D]">+3,499 THB / course</span>
                </div>

                {/* Track 2 + 3 shared — Private Class */}
                <div className="flex items-center gap-3 py-2.5">
                  <div className="flex flex-col gap-1 flex-shrink-0 w-16">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-center" style={{ color: "#0D9488", background: "#F0FDFA" }}>Track 2</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-center" style={{ color: "#6366F1", background: "#EEF2FF" }}>Track 3</span>
                  </div>
                  <span className="text-base flex-shrink-0">👤</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111827] leading-snug">Private Class</p>
                    <p className="text-xs text-[#9CA3AF]">One-on-one tutoring at your own pace</p>
                  </div>
                  <span className="text-xs font-bold whitespace-nowrap flex-shrink-0 text-[#6B7280]">+790 THB / course</span>
                </div>

                {/* Track 2 + 3 shared — English */}
                <div className="flex items-center gap-3 py-2.5">
                  <div className="flex flex-col gap-1 flex-shrink-0 w-16">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-center" style={{ color: "#0D9488", background: "#F0FDFA" }}>Track 2</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-center" style={{ color: "#6366F1", background: "#EEF2FF" }}>Track 3</span>
                  </div>
                  <span className="text-base flex-shrink-0">🇬🇧</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111827] leading-snug">Instruction in English</p>
                    <p className="text-xs text-[#9CA3AF]">IELTS 4.5+ / TOEIC 550+ instructors guaranteed</p>
                  </div>
                  <span className="text-xs font-bold whitespace-nowrap flex-shrink-0 text-[#6B7280]">+2,499 THB / course</span>
                </div>

              </div>
            </div>
          </div>

          {/* ── Contact section ── */}
          <div className="pb-16">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-5">
                📬 Contact Us
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* Phone */}
                <div>
                  <p className="text-xs font-bold text-[#374151] mb-2 flex items-center gap-1.5">
                    <span>📞</span> Phone
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { label: "KMUTT Smart Kid", number: "02 003 6619" },
                      { label: "Jib", number: "062 445 3659" },
                      { label: "Sine", number: "089 885 8860" },
                      { label: "Da", number: "095 241 5393" },
                      { label: "Plaifah", number: "095 739 3384" },
                    ].map((p) => (
                      <div key={p.label} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[#9CA3AF]">{p.label}</span>
                        <a
                          href={`tel:${p.number.replace(/\s/g, "")}`}
                          className="text-xs font-semibold text-[#111827] hover:text-[#E5690D] transition-colors"
                        >
                          {p.number}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <p className="text-xs font-bold text-[#374151] mb-2 flex items-center gap-1.5">
                    <span>📍</span> Location
                  </p>
                  <p className="text-sm font-semibold text-[#111827]">KMUTT Smart Kid</p>
                  <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                    2nd Floor, EMJOY Zone<br />EmQuartier
                  </p>
                </div>

                {/* LINE */}
                <div>
                  <p className="text-xs font-bold text-[#374151] mb-2 flex items-center gap-1.5">
                    <span>💬</span> LINE Official
                  </p>
                  <a
                    href="https://line.me/R/ti/p/@679vxwsy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E5E7EB] hover:border-[#06C755] hover:bg-[#F0FFF4] transition-all group"
                  >
                    <span className="text-lg">🟢</span>
                    <span className="text-sm font-semibold text-[#111827] group-hover:text-[#06C755]">
                      @679vxwsy
                    </span>
                  </a>
                  <p className="text-xs text-[#9CA3AF] mt-1.5">KMUTT Smart Kid</p>
                </div>

                {/* Facebook */}
                <div>
                  <p className="text-xs font-bold text-[#374151] mb-2 flex items-center gap-1.5">
                    <span>📘</span> Facebook
                  </p>
                  <a
                    href="https://facebook.com/KMUTTWORKS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E5E7EB] hover:border-[#1877F2] hover:bg-[#EFF6FF] transition-all group"
                  >
                    <span className="text-lg">📘</span>
                    <span className="text-sm font-semibold text-[#111827] group-hover:text-[#1877F2]">
                      KMUTTWORKS
                    </span>
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}