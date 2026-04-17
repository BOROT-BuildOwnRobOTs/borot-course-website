"use client"

import { useState, useRef, useEffect } from "react"
import { Navbar } from "@/components/navbar"

/* ─── Track config ─────────────────────────────────────────────── */
const tracks = {
  digital_artist: { color: "#DB2777", colorLight: "#FDF2F8", colorMid: "#FBCFE8" },
  maker3d: { color: "#0D9488", colorLight: "#F0FDFA", colorMid: "#99F6E4" },
  robogenesis: { color: "#6366F1", colorLight: "#EEF2FF", colorMid: "#C7D2FE" },
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
  miniCamp?: { price: string; note: string }
}

/* ─── Node data ────────────────────────────────────────────────── */
const nodes: Node[] = [
  /* ── 3D Digital Artist Series ── */
  {
    id: "da-l1", track: "digital_artist", col: 0, row: 0, badge: "Level 1", title: "Little 3D Inventors (Basic)",
    age: "Age 5+", sessions: "16 sessions · 1 hr each", price: "16,780 THB",
    desc: "Build a foundation in 2D/3D spatial thinking. Practice 3D modeling in Tinkercad, explore technical views (Front, Right, Top, Isometric), learn Digital Sculpting basics with Nomad Sculpt to create organic shapes, and use AI to generate ideas — then bring them to life as real toys and keychains.",
    tools: "Tinkercad · Nomad Sculpt · AI ideation · 3D Printer",
  },
  {
    id: "da-l2", track: "digital_artist", col: 0, row: 1, badge: "Level 2", title: "Character Creator",
    age: "Age 7+", sessions: "16 sessions · 1 hr each", price: "19,780 THB",
    desc: "Master advanced sculpting tools — Crease, Flatten, and Masking — for precision work. Study anatomy and proportions to create believable characters and creatures. Explore digital painting and PBR textures (Metallic, Roughness, Gloss), manage projects with professional Layer & Folder systems, and design an original character from concept to 3D model ready for printing.",
    tools: "Nomad Sculpt · PBR Textures · Layer System",
  },
  {
    id: "da-l3", track: "digital_artist", col: 0, row: 2, badge: "Level 3", title: "Professional Digital Sculptor",
    age: "Age 9+", sessions: "16 sessions · 1 hr each", price: "21,780 THB",
    desc: "Construct complex scenes and dioramas by combining multiple sculpted objects. Master professional lighting and environments using HDRIs and custom lights. Learn post-processing and rendering to create high-quality portfolio images. Use Alpha brushes and stamps to add realistic details — scales, fur, skin textures. Advance into 3D print preparation: master slicing and custom supports for high-detail art.",
    tools: "Nomad Sculpt · HDRIs · Alpha Brushes · Slicer",
  },

  /* ── Little 3D Maker Series ── */
  {
    id: "mk-l1", track: "maker3d", col: 1, row: 0, badge: "Level 1", title: "Little 3D Inventors (Basic)",
    age: "Age 5+", sessions: "16 sessions · 1 hr each", price: "16,780 THB",
    desc: "Build a foundation in 2D/3D spatial thinking. Practice 3D modeling in Tinkercad, explore technical views (Front, Right, Top, Isometric), learn Digital Sculpting basics with Nomad Sculpt, and use AI to generate ideas — then bring them to life as real toys and keychains.",
    tools: "Tinkercad · Nomad Sculpt · AI ideation · 3D Printer",
  },
  {
    id: "mk-l2", track: "maker3d", col: 1, row: 1, badge: "Level 2", title: "Little 3D Inventors (Pro)",
    age: "Age 7+", sessions: "16 sessions · 1 hr each", price: "19,780 THB",
    desc: "Learn to use a ruler and understand simple scale for accurate design. Advance 3D design skills using Tinkercad Part Modeling to create functional items like lamps and vases. Create sculptures based on your own imagination while understanding the balance between aesthetics and functionality.",
    tools: "Tinkercad · Ruler & Scale · 3D Printer",
  },
  {
    id: "mk-l3", track: "maker3d", col: 1, row: 2, badge: "Level 3", title: "Little 3D Inventors (Advanced)",
    age: "Age 10+", sessions: "16 sessions · 1 hr each", price: "21,780 THB",
    desc: "Master 3D Assembly design using Tinkercad. Build a Vise (clamp) and custom engineering projects. Learn mechanical movement principles and practice using engineering tools — screwdrivers and heat-set inserts. Master print settings (Infill, Support, Orientation) and troubleshooting for complex functional parts.",
    tools: "Tinkercad Assembly · Engineering Tools · 3D Printer",
  },

  /* ── Robogenesis Series ── */
  {
    id: "rg-l1", track: "robogenesis", col: 2, row: 0, badge: "Level 1", title: "Little 3D Inventors (Basic)",
    age: "Age 5+", sessions: "16 sessions · 1 hr each", price: "16,780 THB",
    desc: "Build a foundation in 2D/3D spatial thinking. Practice 3D modeling in Tinkercad, explore technical views (Front, Right, Top, Isometric), learn Digital Sculpting basics with Nomad Sculpt, and use AI to generate ideas — then bring them to life as real toys and keychains.",
    tools: "Tinkercad · Nomad Sculpt · AI ideation · 3D Printer",
  },
  {
    id: "rg-l2", track: "robogenesis", col: 2, row: 1, badge: "Level 2", title: "Circuit Explorers",
    age: "Age 7+", sessions: "16 sessions · 1 hr each", price: "19,780 THB",
    desc: "Understand the basics of electrical circuits: Power supply, Resistor, Switch. Connect circuits on a breadboard safely and correctly. Control LEDs, Motors, and RGB LEDs. Learn about Timers and Logic Gates (AND/OR) for logical thinking. Practice analyzing and solving circuits step-by-step for practical engineering solutions.",
    tools: "Breadboard · LEDs · Motors · RGB LED · Logic Gates",
  },
  {
    id: "rg-l3", track: "robogenesis", col: 2, row: 2, badge: "Level 3", title: "Logic Programmers",
    age: "Age 9+", sessions: "16 sessions · 1 hr each", price: "21,780 THB",
    desc: "Understand program structure: Sequence, Loops, and Events. Write block-based code to control images, sound, and devices. Use variables and conditions (if-else) to think logically. Create interactive projects and games with Micro:bit. Work as a team to communicate ideas and share results.",
    tools: "Micro:bit · Block Editor · Sensors",
  },
]

/* ─── Column metadata ──────────────────────────────────────────── */
const columns = [
  { col: 0, trackNum: "Track 1", label: "3D Digital Artist", sub: "Sculpting & Digital Art", color: "#DB2777", bg: "#FDF2F8", border: "#FBCFE8" },
  { col: 1, trackNum: "Track 2", label: "Little 3D Maker", sub: "Engineering & Making", color: "#0D9488", bg: "#F0FDFA", border: "#99F6E4" },
  { col: 2, trackNum: "Track 3", label: "Robogenesis", sub: "Circuits & Programming", color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" },
]

/* ─── Weekly mockup data ────────────────────────────────────────── */
const weeklyMockup: Record<string, { week: string; topic: string; activity: string }[]> = {
  "da-l1": [
    { week: "Session 1–2", topic: "2D & 3D Fundamentals", activity: "Spatial reasoning exercises, technical views: Front, Right, Top, Isometric" },
    { week: "Session 3–5", topic: "Tinkercad Part Modeling", activity: "Design your first 3D models — keychains and basic shapes" },
    { week: "Session 6–9", topic: "Nomad Sculpt Basics", activity: "Digital sculpting to create organic shapes and characters" },
    { week: "Session 10–12", topic: "AI-Assisted Design", activity: "Use AI tools to boost creativity and generate new ideas" },
    { week: "Session 13–14", topic: "Toys & Keychains Project", activity: "Design and create your own toys and keychains from scratch" },
    { week: "Session 15–16", topic: "Final Showcase", activity: "Bring your idea to life as a tangible 3D-printed object" },
  ],
  "da-l2": [
    { week: "Session 1–3", topic: "Advanced Sculpting Tools", activity: "Master Crease, Flatten, and Masking for precision sculpting" },
    { week: "Session 4–6", topic: "Anatomy & Proportions", activity: "Study anatomy to create believable characters and creatures" },
    { week: "Session 7–9", topic: "Digital Painting & PBR", activity: "Apply Metallic, Roughness, and Gloss textures to your models" },
    { week: "Session 10–12", topic: "Layer & Folder Systems", activity: "Manage complex projects with professional workflow" },
    { week: "Session 13–14", topic: "Character Design", activity: "Design and sculpt an original character from concept to 3D model" },
    { week: "Session 15–16", topic: "Print Preparation", activity: "Ensure structural balance and prepare for 3D printing complex shapes" },
  ],
  "da-l3": [
    { week: "Session 1–3", topic: "Dioramas & Scenes", activity: "Construct complex scenes by combining multiple sculpted objects" },
    { week: "Session 4–6", topic: "Professional Lighting", activity: "Master lighting and environments using HDRIs and custom lights" },
    { week: "Session 7–9", topic: "Post-Processing & Rendering", activity: "Create high-quality portfolio-ready rendered images" },
    { week: "Session 10–12", topic: "Alpha Brushes & Stamps", activity: "Add realistic details — scales, fur, and skin textures" },
    { week: "Session 13–14", topic: "Advanced 3D Print Prep", activity: "Master slicing and custom supports for high-detail art" },
    { week: "Session 15–16", topic: "Portfolio Showcase", activity: "Present your professional digital sculpture portfolio" },
  ],
  "mk-l1": [
    { week: "Session 1–2", topic: "2D & 3D Fundamentals", activity: "Spatial reasoning exercises, technical views: Front, Right, Top, Isometric" },
    { week: "Session 3–5", topic: "Tinkercad Part Modeling", activity: "Design your first 3D models — keychains and basic shapes" },
    { week: "Session 6–9", topic: "Nomad Sculpt Basics", activity: "Digital sculpting to create organic shapes and objects" },
    { week: "Session 10–12", topic: "AI-Assisted Design", activity: "Use AI tools to boost creativity and generate new ideas" },
    { week: "Session 13–14", topic: "Toys & Keychains Project", activity: "Design and create your own toys and keychains from scratch" },
    { week: "Session 15–16", topic: "Final Showcase", activity: "Bring your idea to life as a tangible 3D-printed object" },
  ],
  "mk-l2": [
    { week: "Session 1–3", topic: "Ruler & Scale Basics", activity: "Learn to use a ruler and understand simple scale for accurate design" },
    { week: "Session 4–7", topic: "Advanced Tinkercad Modeling", activity: "Part modeling techniques — create functional and complex shapes" },
    { week: "Session 8–10", topic: "Functional Items", activity: "Design and print lamps and vases with practical dimensions" },
    { week: "Session 11–13", topic: "Creative Sculptures", activity: "Create sculptures based on your own imagination" },
    { week: "Session 14–15", topic: "Aesthetics vs. Functionality", activity: "Balance visual appeal with practical usability" },
    { week: "Session 16", topic: "Final Project", activity: "Present your functional or artistic 3D-printed creation" },
  ],
  "mk-l3": [
    { week: "Session 1–3", topic: "Assembly Design", activity: "Master 3D Assembly design — multi-part models with joints" },
    { week: "Session 4–6", topic: "Vise (Clamp) Build", activity: "Design and build a working vise with mechanical movement" },
    { week: "Session 7–9", topic: "Custom Engineering Projects", activity: "Create custom engineering parts and practical objects" },
    { week: "Session 10–12", topic: "Engineering Tools", activity: "Practice using screwdrivers and heat-set inserts" },
    { week: "Session 13–14", topic: "Print Settings Mastery", activity: "Master Infill, Support, and Orientation for functional parts" },
    { week: "Session 15–16", topic: "Troubleshooting & Showcase", activity: "Debug prints and present your engineering project" },
  ],
  "rg-l1": [
    { week: "Session 1–2", topic: "2D & 3D Fundamentals", activity: "Spatial reasoning exercises, technical views: Front, Right, Top, Isometric" },
    { week: "Session 3–5", topic: "Tinkercad Part Modeling", activity: "Design your first 3D models — keychains and basic shapes" },
    { week: "Session 6–9", topic: "Nomad Sculpt Basics", activity: "Digital sculpting to create organic shapes and objects" },
    { week: "Session 10–12", topic: "AI-Assisted Design", activity: "Use AI tools to boost creativity and generate new ideas" },
    { week: "Session 13–14", topic: "Toys & Keychains Project", activity: "Design and create your own toys and keychains from scratch" },
    { week: "Session 15–16", topic: "Final Showcase", activity: "Bring your idea to life as a tangible 3D-printed object" },
  ],
  "rg-l2": [
    { week: "Session 1–3", topic: "Circuit Basics", activity: "Understand Power supply, Resistor, Switch — build simple circuits" },
    { week: "Session 4–6", topic: "Breadboard Wiring", activity: "Connect circuits correctly and safely on a breadboard" },
    { week: "Session 7–9", topic: "Controlling Devices", activity: "Control LEDs, Motors, and RGB LEDs with circuits" },
    { week: "Session 10–12", topic: "Timers & Logic Gates", activity: "AND/OR gate experiments and logical thinking exercises" },
    { week: "Session 13–14", topic: "Circuit Analysis", activity: "Step-by-step circuit troubleshooting and problem solving" },
    { week: "Session 15–16", topic: "Final Circuit Project", activity: "Build and present a functional circuit system" },
  ],
  "rg-l3": [
    { week: "Session 1–3", topic: "Program Structure", activity: "Understand Sequence, Loops, and Events with block-based code" },
    { week: "Session 4–6", topic: "Controlling Devices", activity: "Write code to control images, sound, and Micro:bit devices" },
    { week: "Session 7–9", topic: "Variables & Conditions", activity: "Use if-else logic and variables for smart programs" },
    { week: "Session 10–12", topic: "Interactive Games", activity: "Create interactive Micro:bit games and experiments" },
    { week: "Session 13–14", topic: "Team Project", activity: "Collaborate to build a sensor-based team project" },
    { week: "Session 15–16", topic: "Showcase & Presentation", activity: "Present your project — communicate ideas and share results" },
  ],
}

/* Level 1 of every series shares the same assets */
const imageId = (id: string) => (id.endsWith("-l1") ? "level1-basic" : id)

const learningOutcomes: Record<string, string[]> = {
  "da-l1": ["Understand 2D and 3D spatial concepts and technical views", "Practice 3D modeling using Tinkercad Part Modeling", "Learn Digital Sculpting basics with Nomad Sculpt", "Use AI to boost creativity and generate new ideas", "Design and create your own toys and keychains", "Bring ideas to life as tangible 3D-printed objects"],
  "da-l2": ["Master advanced sculpting tools: Crease, Flatten, Masking", "Understand anatomy and proportions for believable characters", "Apply digital painting and PBR textures (Metallic, Roughness, Gloss)", "Manage complex projects with professional Layer & Folder systems", "Design an original character from concept to 3D model", "Ensure structural balance for 3D printing complex organic shapes"],
  "da-l3": ["Construct complex scenes and dioramas from multiple sculpted objects", "Master professional lighting with HDRIs and custom lights", "Create high-quality portfolio images through rendering", "Use Alpha brushes and stamps for realistic surface details", "Prepare high-detail art for 3D printing with advanced slicing", "Present a professional digital sculpture portfolio"],
  "mk-l1": ["Understand 2D and 3D spatial concepts and technical views", "Practice 3D modeling using Tinkercad Part Modeling", "Learn Digital Sculpting basics with Nomad Sculpt", "Use AI to boost creativity and generate new ideas", "Design and create your own toys and keychains", "Bring ideas to life as tangible 3D-printed objects"],
  "mk-l2": ["Use a ruler and understand simple scale for accurate design", "Advance 3D design skills with Tinkercad Part Modeling", "Create functional items: Lamps and Vases", "Create sculptures based on your own imagination", "Understand the balance between aesthetics and functionality", "Print and present a finished functional or artistic object"],
  "mk-l3": ["Master 3D Assembly design using Tinkercad", "Build a Vise (clamp) and custom engineering projects", "Understand mechanical movement principles", "Practice using engineering tools: screwdrivers and heat-set inserts", "Master print settings: Infill, Support, Orientation", "Troubleshoot 3D print problems independently"],
  "rg-l1": ["Understand 2D and 3D spatial concepts and technical views", "Practice 3D modeling using Tinkercad Part Modeling", "Learn Digital Sculpting basics with Nomad Sculpt", "Use AI to boost creativity and generate new ideas", "Design and create your own toys and keychains", "Bring ideas to life as tangible 3D-printed objects"],
  "rg-l2": ["Understand basics of electrical circuits: Power supply, Resistor, Switch", "Connect circuits on a breadboard correctly, safely, and practically", "Control LEDs, Motors, and RGB LEDs with circuits", "Understand Timers and Logic Gates: AND/OR for logical thinking", "Analyze and solve circuits step-by-step for practical solutions"],
  "rg-l3": ["Understand program structure: Sequence, Loops, Events", "Write block-based code to control images, sound, and devices", "Use variables and conditions (if-else) to think logically", "Create interactive projects and games with Micro:bit", "Work as a team, communicate ideas, and share results"],
}

/* ─── Lightbox ─────────────────────────────────────────────────── */
function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", animation: "fadeIn 0.18s ease" }}
      onClick={onClose}
    >
      <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } } @keyframes zoomIn { from { transform:scale(0.88); opacity:0 } to { transform:scale(1); opacity:1 } }`}</style>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
      >
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full rounded-2xl object-contain"
        style={{ maxHeight: "90vh", animation: "zoomIn 0.22s cubic-bezier(0.32,0.72,0,1)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

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

/* ─── Mobile Bottom Sheet Course Detail ────────────────────────── */
function MobileDetailSheet({ node, onClose }: { node: Node; onClose: () => void }) {
  const t = tracks[node.track]
  const weekly = weeklyMockup[node.id] ?? []
  const outcomes = learningOutcomes[node.id] ?? []
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "outcomes">("overview")
  const [lightbox, setLightbox] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Prevent body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
        style={{
          maxHeight: "92vh",
          borderRadius: "24px 24px 0 0",
          background: "#FFFFFF",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          animation: "slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        {/* Hero Image — full cover with text overlay */}
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{
            borderRadius: "24px 24px 0 0",
            background: `linear-gradient(135deg, ${t.colorMid}99 0%, ${t.colorLight} 100%)`,
          }}
        >
          <img
            src={`/images/courses/${imageId(node.id)}.png`}
            alt={node.title}
            className="w-full object-cover cursor-zoom-in"
            style={{ minHeight: 220, maxHeight: 280 }}
            onClick={() => setLightbox(true)}
            onError={(e) => { e.currentTarget.style.display = "none" }}
          />
          {/* Gradient only over bottom text area */}
          <div className="absolute inset-x-0 bottom-0" style={{ height: "80%", background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.1) 80%, transparent 100%)" }} />

          {/* Drag handle */}
          <div className="absolute top-0 left-0 right-0 flex justify-center pt-3">
            <div className="w-10 h-1 rounded-full bg-white opacity-60" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Icon top-left */}
          <div className="absolute top-4 left-4 w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
            <img src={`/images/icons/${imageId(node.id)}.png`} alt={node.title} className="w-7 h-7 object-contain" onError={(e) => { e.currentTarget.style.display = "none" }} />
          </div>

          {/* Text overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5 z-10 flex flex-col gap-1.5" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white" style={{ background: t.color }}>
                {node.badge}
              </span>
              <span className="text-[11px] font-medium text-white">{node.age}</span>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{node.title}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-white/90">{node.sessions}</span>
              <span className="text-base font-bold text-white">{node.price}</span>
              {node.priceNote && <span className="text-[10px] text-white/80">{node.priceNote}</span>}
            </div>
            <div className="flex gap-1.5 flex-wrap mt-0.5">
              {node.tools.split(" · ").map((tool) => (
                <span key={tool} className="text-[10px] px-2.5 py-1 rounded-full border font-medium" style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-[#F3F4F6] px-5 flex-shrink-0 gap-1">
          {(["overview", "sessions", "outcomes"] as const).map((tab) => {
            const labels = { overview: "📋 Overview", sessions: "📅 Sessions", outcomes: "🎯 Outcomes" }
            const active = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap"
                style={{
                  color: active ? t.color : "#9CA3AF",
                  borderBottom: active ? `2px solid ${t.color}` : "2px solid transparent",
                }}
              >
                {labels[tab]}
              </button>
            )
          })}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ WebkitOverflowScrolling: "touch" }}>

          {activeTab === "overview" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#374151] leading-relaxed">{node.desc}</p>
              {node.miniCamp && (
                <div className="rounded-2xl p-4 border" style={{ background: t.colorLight, borderColor: t.colorMid }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: t.color }}>🏕 Mini Camp Option</p>
                  <p className="text-xs text-[#374151] leading-relaxed">{node.miniCamp.note}</p>
                  <p className="text-sm font-bold mt-2" style={{ color: t.color }}>{node.miniCamp.price}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "sessions" && weekly.length > 0 && (
            <div className="flex flex-col gap-3">
              {weekly.map((w, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 text-[10px] font-bold px-2 py-1.5 rounded-xl text-center" style={{ background: t.colorMid + "55", color: t.color, minWidth: 70 }}>
                    {w.week}
                  </div>
                  <div className="flex-1 py-0.5">
                    <p className="text-xs font-semibold text-[#111827]">{w.topic}</p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 leading-snug">{w.activity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "outcomes" && outcomes.length > 0 && (
            <div className="flex flex-col gap-3">
              {outcomes.map((o, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5" style={{ background: t.color }}>
                    {i + 1}
                  </span>
                  <p className="text-sm text-[#374151] leading-snug">{o}</p>
                </div>
              ))}
            </div>
          )}

          {/* Bottom safe area padding */}
          <div style={{ height: 24 }} />
        </div>

        {/* CTA footer */}
        <div className="px-5 pb-6 pt-3 border-t border-[#F3F4F6] flex-shrink-0" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}>
          <a
            href="https://line.me/R/ti/p/@679vxwsy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-opacity active:opacity-80"
            style={{ background: t.color }}
          >
            <span>Enquire about this course</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
      {lightbox && (
        <ImageLightbox
          src={`/images/courses/${imageId(node.id)}.png`}
          alt={node.title}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  )
}

/* ─── Mobile Node Card ─────────────────────────────────────────── */
function MobileNodeCard({ node, onClick }: { node: Node; onClick: () => void }) {
  const t = tracks[node.track]
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border transition-all duration-150 active:scale-[0.98] overflow-hidden"
      style={{
        borderColor: "#E9ECEF",
        background: "#FFFFFF",
        boxShadow: "0 1px 6px 0 #0000000A",
      }}
    >
      <div className="p-4 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: t.colorMid + "55" }}>
          <img src={`/images/icons/${imageId(node.id)}.png`} alt={node.title} className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = "none" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ color: t.color, background: t.colorMid + "66" }}>
              {node.badge}
            </span>
            <span className="text-[10px] text-[#9CA3AF] truncate">{node.age}</span>
          </div>
          <p className="font-semibold text-sm leading-tight text-[#111827] truncate">{node.title}</p>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5 truncate">{node.sessions}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-sm font-bold" style={{ color: t.color }}>{node.price}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="#D1D5DB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </button>
  )
}

/* ─── Mobile Info Sheet ────────────────────────────────────────── */
function MobileInfoSheet({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"contact" | "cross" | "addons">("contact")

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }} onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
        style={{
          maxHeight: "80vh",
          borderRadius: "24px 24px 0 0",
          background: "#FFFFFF",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          animation: "slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-4 flex-shrink-0">
          <p className="text-base font-bold text-[#111827]">Contact & Info</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#F3F4F6" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-[#F3F4F6] px-5 flex-shrink-0">
          {(["contact", "cross", "addons"] as const).map((t) => {
            const labels = { contact: "📬 Contact", cross: "↔ Pathway", addons: "✦ Add-ons" }
            const active = tab === t
            return (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all"
                style={{ color: active ? "#E5690D" : "#9CA3AF", borderBottom: active ? "2px solid #E5690D" : "2px solid transparent" }}>
                {labels[t]}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {tab === "contact" && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-3">📞 Phone</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "KMUTT Smart Kid", number: "02 003 6619" },
                    { label: "Jib", number: "062 445 3659" },
                    { label: "Sine", number: "089 885 8860" },
                    { label: "Da", number: "095 241 5393" },
                    { label: "Plaifah", number: "095 739 3384" },
                  ].map((p) => (
                    <a key={p.label} href={`tel:${p.number.replace(/\s/g, "")}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#F3F4F6] bg-[#FAFAFA] active:bg-[#F3F4F6]">
                      <span className="text-sm text-[#374151] font-medium">{p.label}</span>
                      <span className="text-sm font-bold text-[#E5690D]">{p.number}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-3">📍 Location</p>
                <div className="p-3 rounded-xl border border-[#FED7AA44] bg-[#FFF7F0]">
                  <p className="text-sm font-bold text-[#111827]">KMUTT Smart Kid</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">2nd Floor, EMJOY Zone · EmQuartier</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-3">💬 Social</p>
                <div className="flex gap-3">
                  <a href="https://line.me/R/ti/p/@679vxwsy" target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-2.5 p-3 rounded-xl border border-[#E5E7EB] bg-white active:bg-[#F3F4F6]">
                    <span className="w-8 h-8 rounded-xl bg-[#06C755] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">L</span>
                    <div>
                      <p className="text-xs font-bold text-[#111827]">@679vxwsy</p>
                      <p className="text-[10px] text-[#9CA3AF]">LINE</p>
                    </div>
                  </a>
                  <a href="https://facebook.com/KMUTTWORKS" target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-2.5 p-3 rounded-xl border border-[#E5E7EB] bg-white active:bg-[#F3F4F6]">
                    <span className="w-8 h-8 rounded-xl bg-[#1877F2] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">f</span>
                    <div>
                      <p className="text-xs font-bold text-[#111827]">KMUTTWORKS</p>
                      <p className="text-[10px] text-[#9CA3AF]">Facebook</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          )}

          {tab === "cross" && (
            <div className="flex flex-col gap-3">
              {[
                { from: "3D Digital Artist L3", fromC: "#DB2777", fromBg: "#FDF2F8", to: "Robogenesis L2", toC: "#6366F1", toBg: "#EEF2FF", note: "Apply digital art skills into circuits" },
                { from: "3D Maker L3", fromC: "#0D9488", fromBg: "#F0FDFA", to: "Robogenesis L2", toC: "#6366F1", toBg: "#EEF2FF", note: "Engineering skills meet electronics" },
                { from: "Robogenesis L3", fromC: "#6366F1", fromBg: "#EEF2FF", to: "3D Digital Artist L2", toC: "#DB2777", toBg: "#FDF2F8", note: "Add creative sculpting to your skills" },
                { from: "3D Maker L2", fromC: "#0D9488", fromBg: "#F0FDFA", to: "3D Digital Artist L2", toC: "#DB2777", toBg: "#FDF2F8", note: "Expand into character & organic design" },
              ].map((p, i) => (
                <div key={i} className="rounded-xl border border-[#F3F4F6] bg-[#FAFAFA] p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: p.fromC, background: p.fromBg }}>{p.from}</span>
                    <svg width="14" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: p.toC, background: p.toBg }}>{p.to}</span>
                  </div>
                  <p className="text-xs text-[#6B7280]">{p.note}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "addons" && (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-[#FBCFE8] bg-[#FDF2F8] p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-[#111827]">🇬🇧 English Instruction</p>
                  <p className="text-sm font-bold text-[#DB2777]">+4,500 THB / course</p>
                </div>
                <p className="text-xs text-[#9CA3AF]">Class taught in English · Available for all tracks</p>
              </div>
            </div>
          )}

          <div style={{ height: 24 }} />
        </div>
      </div>
    </>
  )
}

/* ─── Desktop components (unchanged) ───────────────────────────── */
function NodeCard({ node, isActive, onClick }: { node: Node; isActive: boolean; onClick: () => void }) {
  const t = tracks[node.track]
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden"
      style={{
        borderColor: isActive ? t.color : "#E9ECEF",
        background: isActive ? t.colorLight : "#FFFFFF",
        boxShadow: isActive ? `0 4px 18px -4px ${t.color}33` : "0 1px 4px 0 #00000008",
      }}
    >
      <div className="p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: t.colorMid + "55" }}>
          <img src={`/images/icons/${imageId(node.id)}.png`} alt={node.title} className="w-7 h-7 object-contain" onError={(e) => { e.currentTarget.style.display = "none" }} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ color: t.color, background: t.colorMid + "66" }}>
            {node.badge}
          </span>
          <p className="font-semibold text-sm leading-snug mt-0.5 truncate" style={{ color: isActive ? t.color : "#111827" }}>
            {node.title}
          </p>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <span className="text-[10px] text-[#9CA3AF]">{node.sessions}</span>
            <span className="text-[11px] font-bold flex-shrink-0" style={{ color: t.color }}>{node.price}</span>
          </div>
        </div>
        {isActive && <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: t.color }} />}
      </div>
    </button>
  )
}

function InfoCard() {
  const [tab, setTab] = useState<"cross" | "addons" | "contact">("contact")
  const tabs = [
    { key: "cross" as const, icon: "↔", label: "Pathways" },
    { key: "addons" as const, icon: "✦", label: "Add-ons" },
    { key: "contact" as const, icon: "📬", label: "Contact" },
  ]
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden" style={{ width: 580, boxShadow: "0 2px 12px 0 #00000009" }}>
      <div className="flex border-b border-[#F3F4F6] bg-[#FAFAFA]">
        {tabs.map((t) => {
          const active = tab === t.key
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className="flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all"
              style={{ background: active ? "#fff" : "transparent", borderBottom: active ? "2px solid #E5690D" : "2px solid transparent" }}>
              <span className="text-sm leading-none">{t.icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider leading-none" style={{ color: active ? "#E5690D" : "#B0B7C3" }}>{t.label}</span>
            </button>
          )
        })}
      </div>
      <div className="p-4">
        {tab === "cross" && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { from: "3D Digital Artist L3", fromC: "#DB2777", fromBg: "#FDF2F8", to: "Robogenesis L2", toC: "#6366F1", toBg: "#EEF2FF", note: "Apply digital art skills into circuits" },
              { from: "3D Maker L3", fromC: "#0D9488", fromBg: "#F0FDFA", to: "Robogenesis L2", toC: "#6366F1", toBg: "#EEF2FF", note: "Engineering skills meet electronics" },
              { from: "Robogenesis L3", fromC: "#6366F1", fromBg: "#EEF2FF", to: "3D Digital Artist L2", toC: "#DB2777", toBg: "#FDF2F8", note: "Add creative sculpting to your skills" },
              { from: "3D Maker L2", fromC: "#0D9488", fromBg: "#F0FDFA", to: "3D Digital Artist L2", toC: "#DB2777", toBg: "#FDF2F8", note: "Expand into character & organic design" },
            ].map((p, i) => (
              <div key={i} className="rounded-xl border border-[#F3F4F6] bg-[#FAFAFA] px-3 py-2.5 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 flex-nowrap">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color: p.fromC, background: p.fromBg }}>{p.from}</span>
                  <svg width="12" height="10" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color: p.toC, background: p.toBg }}>{p.to}</span>
                </div>
                <p className="text-[9px] text-[#9CA3AF] leading-snug">{p.note}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "addons" && (
          <div className="grid grid-cols-1 gap-2">
            <div className="rounded-xl border border-[#FBCFE8] bg-[#FDF2F8] px-3 py-2.5 flex items-center gap-3">
              <span className="text-2xl flex-shrink-0">🇬🇧</span>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-[#111827]">English Instruction</p>
                <p className="text-[9px] text-[#9CA3AF] mt-0.5">Class taught in English · Available for all tracks</p>
              </div>
              <p className="text-[13px] font-bold text-[#DB2777] flex-shrink-0">+4,500 THB / course</p>
            </div>
          </div>
        )}
        {tab === "contact" && (
          <div className="flex gap-4 overflow-hidden">
            <div className="flex-shrink-0" style={{ width: 200 }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">📞 Phone</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "KMUTT Smart Kid", number: "02 003 6619" },
                  { label: "Jib", number: "062 445 3659" },
                  { label: "Sine", number: "089 885 8860" },
                  { label: "Da", number: "095 241 5393" },
                  { label: "Plaifah", number: "095 739 3384" },
                ].map((p) => (
                  <div key={p.label} className="flex items-center justify-between gap-3">
                    <span className="text-[10px] text-[#9CA3AF] whitespace-nowrap">{p.label}</span>
                    <a href={`tel:${p.number.replace(/\s/g, "")}`} className="text-[10px] font-bold text-[#374151] hover:text-[#E5690D] transition-colors tabular-nums whitespace-nowrap">{p.number}</a>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-px bg-[#F3F4F6] flex-shrink-0" />
            <div className="flex-shrink-0" style={{ width: 140 }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">📍 Location</p>
              <div className="rounded-xl bg-[#FFF7F0] border border-[#FED7AA44] px-2.5 py-2">
                <p className="text-[11px] font-bold text-[#111827] whitespace-nowrap">KMUTT Smart Kid</p>
                <p className="text-[10px] text-[#6B7280] mt-0.5 leading-snug">2nd Fl, EMJOY Zone · EmQuartier</p>
              </div>
            </div>
            <div className="w-px bg-[#F3F4F6] flex-shrink-0" />
            <div className="flex-shrink-0 flex flex-col gap-2" style={{ width: 150 }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">💬 Social</p>
              <a href="https://line.me/R/ti/p/@679vxwsy" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#06C755] transition-all group">
                <span className="w-6 h-6 rounded-lg bg-[#06C755] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">L</span>
                <div><p className="text-[10px] font-bold text-[#111827] group-hover:text-[#06C755] transition-colors whitespace-nowrap">@679vxwsy</p><p className="text-[9px] text-[#9CA3AF]">LINE</p></div>
              </a>
              <a href="https://facebook.com/KMUTTWORKS" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#1877F2] transition-all group">
                <span className="w-6 h-6 rounded-lg bg-[#1877F2] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">f</span>
                <div><p className="text-[10px] font-bold text-[#111827] group-hover:text-[#1877F2] transition-colors whitespace-nowrap">KMUTTWORKS</p><p className="text-[9px] text-[#9CA3AF]">Facebook</p></div>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CourseDetailPanel({ node }: { node: Node }) {
  const t = tracks[node.track]
  const weekly = weeklyMockup[node.id] ?? []
  const outcomes = learningOutcomes[node.id] ?? []
  const [lightbox, setLightbox] = useState(false)
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: t.colorMid }}>
        <div className="w-full relative" style={{ minHeight: 220, background: `linear-gradient(135deg, ${t.colorMid}88 0%, ${t.colorLight} 100%)` }}>
          {/* Full cover image — no tint on top */}
          <img src={`/images/courses/${imageId(node.id)}.png`} alt={node.title} className="w-full h-full object-cover absolute inset-0 cursor-zoom-in" onClick={() => setLightbox(true)} onError={(e) => { e.currentTarget.style.display = "none" }} />
          {/* Gradient only over the bottom text area */}
          <div className="absolute inset-x-0 bottom-0" style={{ height: "80%", background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.1) 80%, transparent 100%)" }} />
          {/* Content overlaid on the image */}
          <div className="relative z-10 p-5 pt-28 flex flex-col gap-2" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
            <span className="self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ color: "#fff", background: t.color, textShadow: "none" }}>{node.badge} · {node.age}</span>
            <h2 className="text-xl font-bold text-white leading-tight">{node.title}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-white/90">{node.sessions}</span>
              <span className="text-base font-bold text-white">{node.price}</span>
              {node.priceNote && <span className="text-xs text-white/80">{node.priceNote}</span>}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {node.tools.split(" · ").map((tool) => (
                <span key={tool} className="text-[10px] px-2 py-0.5 rounded-full border font-medium" style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", textShadow: "none" }}>{tool}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">📋 Course Overview</p>
        <p className="text-sm text-[#374151] leading-relaxed">{node.desc}</p>
        {node.miniCamp && (
          <div className="mt-3 rounded-xl p-3 border" style={{ background: t.colorLight, borderColor: t.colorMid }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: t.color }}>🏕 Mini Camp Option</p>
            <p className="text-xs text-[#374151] leading-relaxed">{node.miniCamp.note}</p>
            <p className="text-sm font-bold mt-1" style={{ color: t.color }}>{node.miniCamp.price}</p>
          </div>
        )}
      </div>
      {weekly.length > 0 && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">📅 Session Breakdown</p>
          <div className="flex flex-col gap-2">
            {weekly.map((w, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg text-center min-w-[72px]" style={{ background: t.colorMid + "55", color: t.color }}>{w.week}</div>
                <div><p className="text-xs font-semibold text-[#111827]">{w.topic}</p><p className="text-[11px] text-[#6B7280] mt-0.5">{w.activity}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {outcomes.length > 0 && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">🎯 Learning Outcomes</p>
          <div className="flex flex-col gap-2">
            {outcomes.map((o, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5" style={{ background: t.color }}>{i + 1}</span>
                <p className="text-sm text-[#374151]">{o}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {lightbox && (
        <ImageLightbox
          src={`/images/courses/${imageId(node.id)}.png`}
          alt={node.title}
          onClose={() => setLightbox(false)}
        />
      )}
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function CoursesPage() {
  const [activeCol, setActiveCol] = useState<number | null>(0)
  const [activeNodeId, setActiveNodeId] = useState<string | null>("da-l1")
  // Mobile-specific state
  const [mobileDetailNode, setMobileDetailNode] = useState<Node | null>(null)
  const [showMobileInfo, setShowMobileInfo] = useState(false)

  const colNodes = (col: number) => nodes.filter((n) => n.col === col).sort((a, b) => a.row - b.row)

  const selectCol = (col: number) => {
    if (activeCol === col) {
      setActiveCol(null)
      setActiveNodeId(null)
    } else {
      setActiveCol(col)
      const first = colNodes(col)[0]
      if (first) setActiveNodeId(first.id)
    }
  }

  const activeNode = nodes.find((n) => n.id === activeNodeId) ?? null

  return (
    <>
      <Navbar />
      <main className="min-h-screen font-sans relative">
        {/* Background */}
        <div className="fixed inset-0 -z-10" style={{ backgroundImage: "url('/images/bg-classroom.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", opacity: 0.07 }} />
        <div className="fixed inset-0 -z-10" style={{ background: "linear-gradient(135deg, #FFF7F0 0%, #FFFBF7 40%, #F9F8F6 100%)" }} />

        {/* ══════════════════════════════════════════════════════════
            MOBILE LAYOUT  (hidden on md+)
        ══════════════════════════════════════════════════════════ */}
        <div className="md:hidden flex flex-col min-h-screen">

          {/* Spacer for fixed navbar — 72px covers most mobile navbars */}
          <div style={{ height: 120 }} />

          {/* Mobile Header */}
          <div className="px-4 pt-4 pb-4">
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#E5690D] mb-1">Learning Pathways</p>
            <div className="flex items-end justify-between gap-2">
              <h1 className="text-2xl font-bold text-[#0F0F0F] leading-tight">Course Roadmap</h1>
              {/* Info button */}
              <button
                onClick={() => setShowMobileInfo(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-xs font-bold text-[#374151] flex-shrink-0"
                style={{ boxShadow: "0 1px 4px 0 #00000008" }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#9CA3AF" strokeWidth="1.5" />
                  <path d="M8 7v4M8 5.5v.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Contact
              </button>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1.5">Select a track, then tap a course for details</p>
          </div>

          {/* Track tabs — horizontal scroll */}
          <div className="px-4 mb-4">
            <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
              {columns.map((col) => {
                const isSelected = activeCol === col.col
                return (
                  <button
                    key={col.col}
                    onClick={() => selectCol(col.col)}
                    className="flex-shrink-0 rounded-2xl px-4 py-3 text-left border-2 transition-all duration-200"
                    style={{
                      width: 148,
                      background: isSelected ? col.color : col.bg,
                      borderColor: isSelected ? col.color : col.border,
                      borderBottomWidth: 3,
                      borderBottomColor: col.color,
                      boxShadow: isSelected ? `0 4px 16px -4px ${col.color}55` : "0 1px 4px 0 #00000008",
                    }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-widest leading-tight" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : col.color }}>
                      {col.trackNum}
                    </p>
                    <p className="text-sm font-bold leading-tight mt-0.5" style={{ color: isSelected ? "#fff" : "#111827" }}>
                      {col.label}
                    </p>
                    <p className="text-[10px] mt-0.5 leading-tight" style={{ color: isSelected ? "rgba(255,255,255,0.6)" : "#9CA3AF" }}>
                      {col.sub}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Course list or empty state */}
          <div className="flex-1 px-4 pb-8">
            {activeCol === null ? (
              <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border-2 border-dashed border-[#E5E7EB]">
                <span className="text-4xl mb-3">👆</span>
                <p className="text-[#9CA3AF] font-medium text-sm">Select a track to view courses</p>
                <p className="text-[#C4C4C4] text-xs mt-1">Swipe → to browse all tracks</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {colNodes(activeCol).map((node, idx, arr) => (
                  <div key={node.id} className="flex flex-col">
                    <MobileNodeCard node={node} onClick={() => setMobileDetailNode(node)} />
                    {idx < arr.length - 1 && <Arrow color={tracks[node.track].color} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            DESKTOP LAYOUT  (hidden on mobile, shown on md+)
        ══════════════════════════════════════════════════════════ */}
        <div className="hidden md:block">
          {/* Header */}
          <div className="pt-28 pb-8 px-6 container mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1">
                <p className="text-xs font-bold tracking-[0.22em] uppercase text-[#E5690D] mb-2">Learning Pathways</p>
                <h1 className="text-4xl md:text-5xl font-bold text-[#0F0F0F] leading-tight">Course Roadmap</h1>
                <p className="mt-3 text-[#6B7280] text-base max-w-lg leading-relaxed">
                  Three interconnected tracks — follow one path or combine them.<br />
                  Select a track to explore courses, then click a course to see full details.
                </p>
              </div>
              <div className="flex-shrink-0 lg:mt-1">
                <InfoCard />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-6 container mx-auto max-w-7xl pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {columns.map((col) => {
                const isSelected = activeCol === col.col
                return (
                  <button key={col.col} onClick={() => selectCol(col.col)}
                    className="rounded-2xl px-4 py-3 text-center border-2 transition-all duration-200 cursor-pointer w-full"
                    style={{
                      background: isSelected ? col.color : col.bg,
                      borderColor: isSelected ? col.color : col.border,
                      borderBottomWidth: 3,
                      borderBottomColor: col.color,
                      boxShadow: isSelected ? `0 4px 20px -4px ${col.color}55` : "0 1px 4px 0 #00000008",
                    }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.75)" : col.color }}>{col.trackNum}</p>
                    <p className="text-base font-bold leading-tight" style={{ color: isSelected ? "#fff" : "#111827" }}>{col.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.65)" : "#6B7280" }}>{col.sub}</p>
                  </button>
                )
              })}
            </div>

            {activeCol === null && (
              <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-[#E5E7EB]">
                <span className="text-5xl mb-4">👆</span>
                <p className="text-[#9CA3AF] font-medium text-base">Select a track above to explore courses</p>
                <p className="text-[#C4C4C4] text-sm mt-1">Click any track tab to see its course roadmap</p>
              </div>
            )}

            {activeCol !== null && (
              <div className="flex gap-5" style={{ alignItems: "flex-start" }}>
                <div style={{ width: 320, flexShrink: 0 }}>
                  <div className="flex flex-col">
                    {colNodes(activeCol).map((node, idx, arr) => (
                      <div key={node.id} className="flex flex-col">
                        <NodeCard node={node} isActive={activeNodeId === node.id} onClick={() => setActiveNodeId(node.id)} />
                        {idx < arr.length - 1 && <Arrow color={tracks[node.track].color} />}
                      </div>
                    ))}
                  </div>
                </div>
                {activeNode && (
                  <div className="flex-1 min-w-0" style={{ position: "sticky", top: 100, maxHeight: "calc(100vh - 110px)", overflowY: "auto" }}>
                    <CourseDetailPanel node={activeNode} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Overlays ── */}
        {mobileDetailNode && (
          <MobileDetailSheet node={mobileDetailNode} onClose={() => setMobileDetailNode(null)} />
        )}
        {showMobileInfo && (
          <MobileInfoSheet onClose={() => setShowMobileInfo(false)} />
        )}
      </main>
    </>
  )
}