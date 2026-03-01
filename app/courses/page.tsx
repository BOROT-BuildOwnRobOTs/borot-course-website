"use client"

import { useState, useRef, useEffect } from "react"
import { Navbar } from "@/components/navbar"

/* ─── Track config ─────────────────────────────────────────────── */
const tracks = {
  rj_basic: { color: "#E5690D", colorLight: "#FFF7F0", colorMid: "#FED7AA" },
  rj_advanced: { color: "#C2410C", colorLight: "#FFF1EB", colorMid: "#FDBA74" },
  inventors3d: { color: "#0D9488", colorLight: "#F0FDFA", colorMid: "#99F6E4" },
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
  emoji: string
  miniCamp?: { price: string; note: string }
}

/* ─── Node data ────────────────────────────────────────────────── */
const nodes: Node[] = [
  { id: "rj-l1", track: "rj_basic", col: 0, row: 0, badge: "Level 1", title: "Junior Discovery", age: "Age 4–8", sessions: "10 sessions · 2 hrs each", price: "14,490 THB", desc: "First steps into robotics — explore simple mechanisms and give your first programming commands using Lego WeDo.", tools: "Lego WeDo", emoji: "🦾" },
  { id: "rj-l2", track: "rj_basic", col: 0, row: 1, badge: "Level 2", title: "Junior Challenge", age: "Age 4–8", sessions: "10 sessions · 2 hrs each", price: "15,990 THB", desc: "Solve robot challenges using Lego WeDo — analytical thinking to build and program robots meeting set criteria.", tools: "Lego WeDo", emoji: "🏆" },
  { id: "rj-l3", track: "rj_basic", col: 0, row: 2, badge: "Level 3", title: "Master Adventure", age: "Age 7–12", sessions: "10 sessions · 2 hrs each", price: "19,990 THB", desc: "Step up to Lego Spike Prime with diverse motors & sensors — intermediate programming for simulated missions.", tools: "Lego Spike Prime", emoji: "🚀" },
  { id: "rj-l4", track: "rj_basic", col: 0, row: 3, badge: "Level 4", title: "Master Mission", age: "Age 7–12", sessions: "10 sessions · 2 hrs each", price: "19,900 THB", desc: "Complex mechanisms like extendable grabber arms — precision coding and robust structural design for demanding missions.", tools: "Lego Spike Prime", emoji: "🦿" },
  { id: "rj-l5", track: "rj_advanced", col: 1, row: 0, badge: "Level 5", title: "IoT Smart House", age: "Age 9+", sessions: "12 sessions · 2 hrs each", price: "23,990 THB", desc: "Build a Smart House model — connect and control electronic devices over a network using IoT principles.", tools: "ESP32 · Wi-Fi · Dashboard", emoji: "🏠" },
  { id: "rj-l6", track: "rj_advanced", col: 1, row: 1, badge: "Level 6", title: "Waste Sorting AI", age: "Age 9+", sessions: "12 sessions · 2 hrs each", price: "25,990 THB", desc: "Build a smart trash bin that auto-sorts waste — learn foundational AI for object classification and recognition.", tools: "Camera Module · AI · Arduino", emoji: "♻️" },
  { id: "rj-l7", track: "rj_advanced", col: 1, row: 2, badge: "Level 7", title: "AI Robotic Hand", age: "Age 9+", sessions: "12 sessions · 2 hrs each", price: "28,990 THB", priceNote: "+ 12,000 THB for robot kit", desc: "Assemble and program an AI Robotic Hand — merge Micro:bit with biomechanical concepts and machine learning.", tools: "Micro:bit · Servo · ML Model", emoji: "🖐️" },
  { id: "rj-l8", track: "rj_advanced", col: 1, row: 3, badge: "Level 8", title: "Smart Manipulator", age: "Age 9+", sessions: "12 sessions · 2 hrs each", price: "31,290 THB", priceNote: "+ 15,000 THB for robot kit", desc: "Control an industrial robotic arm simulation using Computer Vision — advanced AI for high-precision object handling.", tools: "Robotic Arm · Computer Vision · AI", emoji: "🦾" },
  { id: "3d-l1", track: "inventors3d", col: 2, row: 0, badge: "Level 1", title: "3D Inventors Basic", age: "Age 5+", sessions: "4 sessions · 2 hrs each", price: "8,390 THB", desc: "Learn 2D/3D spatial concepts, design your first models in Onshape, and create real keychains & toys with a 3D printer.", tools: "Onshape · 3D Printer · AI ideation", emoji: "🧱", miniCamp: { price: "12,990 THB", note: "Mini Camp available once a month (2-day intensive, 10:00 AM – 3:00 PM)" } },
  { id: "3d-l2", track: "inventors3d", col: 2, row: 1, badge: "Level 2", title: "3D Inventors Pro", age: "Age 7+", sessions: "4 sessions · 2 hrs each", price: "8,890 THB", desc: "Master precision measurement with Vernier calipers, design functional items like lamps and vases, balance form vs. function.", tools: "Onshape · Vernier Calipers · 3D Printer", emoji: "🏮" },
  { id: "3d-l3", track: "inventors3d", col: 2, row: 2, badge: "Level 3", title: "3D Inventors Advanced", age: "Age 10+", sessions: "4 sessions · 2 hrs each", price: "9,390 THB", desc: "3D Assembly design, build a working Vise and Snail Robot, use engineering hand tools, and master full print settings.", tools: "Onshape Assembly · Engineering Tools · 3D Printer", emoji: "🤖" },
  { id: "rg-s1", track: "robogenesis", col: 3, row: 0, badge: "Step 1", title: "Basic Create — Design 3D", age: "Age 5+", sessions: "4 sessions · 2 hrs each", price: "9,590 THB", desc: "3D thinking with Tinkercad — create keychains, house models, and creative pieces through hands-on experimentation.", tools: "Tinkercad · 3D Printer", emoji: "🎨" },
  { id: "rg-s2", track: "robogenesis", col: 3, row: 1, badge: "Step 2", title: "Power — Circuits", age: "Age 5+", sessions: "4 sessions · 2 hrs each", price: "9,990 THB", desc: "Breadboard wiring, control LEDs & motors, learn Logic Gates (AND/OR), and practice real circuit troubleshooting.", tools: "Breadboard · LEDs · Motors · RGB LED", emoji: "⚡" },
  { id: "rg-s3", track: "robogenesis", col: 3, row: 2, badge: "Step 3", title: "Control — Programming", age: "Age 5+", sessions: "4 sessions · 2 hrs each", price: "10,590 THB", desc: "Block-based coding, loops & events, if-else logic — build interactive Micro:bit games and team projects.", tools: "Micro:bit · Block Editor · Sensors", emoji: "💻" },
]

/* ─── Column metadata ──────────────────────────────────────────── */
const columns = [
  { col: 0, trackNum: "Track 1 — Beginner", label: "RoboJourney", sub: "Robotics Foundations", color: "#E5690D", bg: "#FFF7F0", border: "#FED7AA" },
  { col: 1, trackNum: "Track 1 — Advanced", label: "RoboJourney", sub: "AI & IoT Innovation", color: "#C2410C", bg: "#FFF1EB", border: "#FDBA74" },
  { col: 2, trackNum: "Track 2", label: "Little 3D Inventors", sub: "3D Design & Innovation", color: "#0D9488", bg: "#F0FDFA", border: "#99F6E4" },
  { col: 3, trackNum: "Track 3", label: "Robogenesis", sub: "Integrated Innovation", color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" },
]

/* ─── Weekly mockup data ────────────────────────────────────────── */
const weeklyMockup: Record<string, { week: string; topic: string; activity: string }[]> = {
  "rj-l1": [
    { week: "Week 1–2", topic: "Introduction to Robotics", activity: "Explore Lego WeDo parts, build your first simple robot" },
    { week: "Week 3–4", topic: "Movement & Mechanisms", activity: "Program motors and explore gear systems" },
    { week: "Week 5–6", topic: "Sensors & Reactions", activity: "Use tilt and motion sensors to make robots respond" },
    { week: "Week 7–8", topic: "Creative Missions", activity: "Design robots to complete mini challenge tasks" },
    { week: "Week 9–10", topic: "Final Project", activity: "Build and present a robot solving a real-world problem" },
  ],
  "rj-l2": [
    { week: "Week 1–2", topic: "Review & Advanced Builds", activity: "Reinforce WeDo skills with complex structures" },
    { week: "Week 3–4", topic: "Analytical Problem Solving", activity: "Robot challenges with scoring criteria" },
    { week: "Week 5–6", topic: "Programming Logic", activity: "Sequential and conditional programming" },
    { week: "Week 7–8", topic: "Team Challenge", activity: "Cooperative mission with partner robots" },
    { week: "Week 9–10", topic: "Competition Simulation", activity: "Mock robotics competition with judging" },
  ],
  "rj-l3": [
    { week: "Week 1–2", topic: "Lego Spike Prime Intro", activity: "Explore the Spike Prime kit and Python basics" },
    { week: "Week 3–4", topic: "Motors & Sensors Deep Dive", activity: "Color, distance, and force sensor projects" },
    { week: "Week 5–6", topic: "Mission Programming", activity: "Simulated mission maps and autonomous runs" },
    { week: "Week 7–8", topic: "Mechanical Design", activity: "Optimize attachment designs for efficiency" },
    { week: "Week 9–10", topic: "Showcase Mission", activity: "Full mission run with debrief and optimization" },
  ],
  "rj-l4": [
    { week: "Week 1–2", topic: "Advanced Mechanisms", activity: "Extendable arms, grabbers, and lifts" },
    { week: "Week 3–4", topic: "Precision Coding", activity: "PID control concepts and accurate navigation" },
    { week: "Week 5–6", topic: "Structural Engineering", activity: "Stress-test robot frames for demanding tasks" },
    { week: "Week 7–8", topic: "Complex Mission Strategy", activity: "Multi-step autonomous mission planning" },
    { week: "Week 9–10", topic: "Championship Prep", activity: "Full run simulation and team presentation" },
  ],
  "rj-l5": [
    { week: "Week 1–2", topic: "IoT Fundamentals", activity: "Network basics, Wi-Fi, and ESP32 setup" },
    { week: "Week 3–4", topic: "Sensor Integration", activity: "Temperature, humidity, and light sensors" },
    { week: "Week 5–6", topic: "Dashboard & Control", activity: "Build a web dashboard to monitor the house" },
    { week: "Week 7–8", topic: "Automation Rules", activity: "If-this-then-that smart home logic" },
    { week: "Week 9–10", topic: "Smart House Demo", activity: "Present a fully connected Smart House model" },
    { week: "Week 11–12", topic: "Advanced Features", activity: "Voice control and multi-device integration" },
  ],
  "rj-l6": [
    { week: "Week 1–2", topic: "AI & Computer Vision Basics", activity: "Camera module setup, image capture" },
    { week: "Week 3–4", topic: "Object Classification", activity: "Train a simple ML model to classify waste" },
    { week: "Week 5–6", topic: "Mechanical Sorting", activity: "Servo-based sorting gate mechanism" },
    { week: "Week 7–8", topic: "Model Optimization", activity: "Improve accuracy and reduce false positives" },
    { week: "Week 9–10", topic: "Live Testing", activity: "Real waste sorting demo with multiple categories" },
    { week: "Week 11–12", topic: "Final Showcase", activity: "Fully autonomous waste bin presentation" },
  ],
  "rj-l7": [
    { week: "Week 1–2", topic: "Biomechanics & Hand Design", activity: "Study human hand anatomy, plan robotic version" },
    { week: "Week 3–4", topic: "Servo Programming", activity: "Control individual finger servos with Micro:bit" },
    { week: "Week 5–6", topic: "Gesture Recognition", activity: "Train ML model to detect hand gestures" },
    { week: "Week 7–8", topic: "Assembly & Calibration", activity: "Full robotic hand assembly and tuning" },
    { week: "Week 9–10", topic: "Interactive Demo", activity: "Mirror human hand movements in real time" },
    { week: "Week 11–12", topic: "Final Project", activity: "Present AI Robotic Hand with gesture control" },
  ],
  "rj-l8": [
    { week: "Week 1–2", topic: "Computer Vision Fundamentals", activity: "Object detection setup with camera" },
    { week: "Week 3–4", topic: "Robotic Arm Kinematics", activity: "Understand joint movements and degrees of freedom" },
    { week: "Week 5–6", topic: "Pick & Place Programming", activity: "Automate object pick-up and placement" },
    { week: "Week 7–8", topic: "Precision Calibration", activity: "Fine-tune arm accuracy for small objects" },
    { week: "Week 9–10", topic: "Advanced Vision Pipeline", activity: "Multi-object detection and sorting" },
    { week: "Week 11–12", topic: "Industrial Simulation", activity: "Simulate factory assembly line with robotic arm" },
  ],
  "3d-l1": [
    { week: "Session 1", topic: "2D & 3D Thinking", activity: "Spatial reasoning exercises, intro to Onshape" },
    { week: "Session 2", topic: "First 3D Model", activity: "Design a custom keychain from scratch" },
    { week: "Session 3", topic: "3D Printing Process", activity: "Slice and print your model, learn settings" },
    { week: "Session 4", topic: "Creative Project", activity: "Design and print a unique toy or figurine" },
  ],
  "3d-l2": [
    { week: "Session 1", topic: "Precision Measurement", activity: "Use Vernier calipers to measure real objects" },
    { week: "Session 2", topic: "Functional Design", activity: "Design a lamp or vase with practical dimensions" },
    { week: "Session 3", topic: "Form vs. Function", activity: "Iterate design for both looks and usability" },
    { week: "Session 4", topic: "Final Print", activity: "Print and present functional object with reflection" },
  ],
  "3d-l3": [
    { week: "Session 1", topic: "Assembly Design", activity: "Multi-part designs with joints and assemblies" },
    { week: "Session 2", topic: "Vise Build", activity: "Engineer a working vise with moving parts" },
    { week: "Session 3", topic: "Snail Robot", activity: "Design and assemble an articulated robot model" },
    { week: "Session 4", topic: "Full Print & Showcase", activity: "Advanced print settings and final presentation" },
  ],
  "rg-s1": [
    { week: "Session 1", topic: "3D Thinking with Tinkercad", activity: "Intro to Tinkercad, basic shapes and tools" },
    { week: "Session 2", topic: "Keychain & Models", activity: "Design personalized keychain and house model" },
    { week: "Session 3", topic: "Creative Exploration", activity: "Combine shapes for original creative pieces" },
    { week: "Session 4", topic: "Print & Present", activity: "3D print your design and share your creation" },
  ],
  "rg-s2": [
    { week: "Session 1", topic: "Breadboard Basics", activity: "Wire LEDs and resistors, understand circuits" },
    { week: "Session 2", topic: "Motor Control", activity: "Control motors with switches and logic gates" },
    { week: "Session 3", topic: "Logic Gates", activity: "AND/OR gate experiments with real components" },
    { week: "Session 4", topic: "Troubleshooting", activity: "Debug a broken circuit, real engineering practice" },
  ],
  "rg-s3": [
    { week: "Session 1", topic: "Block Coding Intro", activity: "First programs with loops and events on Micro:bit" },
    { week: "Session 2", topic: "Conditionals & Logic", activity: "If-else programs with sensor inputs" },
    { week: "Session 3", topic: "Interactive Games", activity: "Build a button-controlled game on Micro:bit" },
    { week: "Session 4", topic: "Team Project", activity: "Collaborate to build a sensor-based team project" },
  ],
}

const learningOutcomes: Record<string, string[]> = {
  "rj-l1": ["Understand basic robot structure and mechanisms", "Give simple programming commands", "Develop problem-solving with hands-on challenges", "Build confidence in STEM exploration"],
  "rj-l2": ["Apply analytical thinking to robot challenges", "Program robots to meet specific criteria", "Work independently on structured missions", "Develop resilience through iterative testing"],
  "rj-l3": ["Program with Lego Spike Prime intermediate level", "Use diverse sensors for autonomous navigation", "Design and optimize mechanical attachments", "Complete simulated robotics missions"],
  "rj-l4": ["Build complex mechanisms like grabber arms", "Write precision code for accurate robot movement", "Design robust robot structures for demanding tasks", "Execute multi-step autonomous strategies"],
  "rj-l5": ["Understand IoT networking fundamentals", "Connect and control smart devices remotely", "Build functional web dashboards", "Create automated smart home scenarios"],
  "rj-l6": ["Train basic AI models for object classification", "Integrate computer vision with mechanical systems", "Optimize model accuracy for real-world use", "Build a fully autonomous sorting device"],
  "rj-l7": ["Understand biomechanics and servo control", "Implement gesture recognition with ML", "Assemble and calibrate a robotic hand", "Merge hardware and AI into a working system"],
  "rj-l8": ["Apply computer vision for precision tasks", "Program industrial-style robotic arm movements", "Optimize pick-and-place sequences", "Simulate real factory automation scenarios"],
  "3d-l1": ["Understand 2D and 3D spatial concepts", "Design original models in Onshape", "Operate a 3D printer safely", "Apply creative thinking to physical design"],
  "3d-l2": ["Use Vernier calipers for precise measurement", "Design functional 3D objects", "Balance aesthetic and practical considerations", "Master print settings for quality output"],
  "3d-l3": ["Create multi-part assemblies in Onshape", "Use engineering hand tools safely", "Build working mechanical devices", "Master advanced 3D print configurations"],
  "rg-s1": ["Think spatially in 3D with Tinkercad", "Design and print original creations", "Understand the full design-to-print workflow", "Develop creative and iterative design skills"],
  "rg-s2": ["Understand basic electrical circuits", "Wire components on a breadboard correctly", "Apply logic gate principles", "Troubleshoot real circuit problems"],
  "rg-s3": ["Program with block-based coding", "Apply loops, events, and conditionals", "Build interactive Micro:bit projects", "Collaborate on a team coding challenge"],
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

        {/* Hero Image — course cover */}
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{
            height: 180,
            borderRadius: "24px 24px 0 0",
            background: `linear-gradient(135deg, ${t.colorMid}99 0%, ${t.colorLight} 100%)`,
          }}
        >
          <img
            src={`/images/courses/${node.id}.png`}
            alt={node.title}
            className="w-full h-full object-cover absolute inset-0"
            onError={(e) => { e.currentTarget.style.display = "none" }}
          />
          {/* Gradient overlay so text is readable */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />

          {/* Drag handle on top of image */}
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

          {/* Badge + age overlay at bottom-left */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white" style={{ background: t.color }}>
              {node.badge}
            </span>
            <span className="text-[11px] font-medium text-white opacity-90">{node.age}</span>
          </div>

          {/* Emoji badge at bottom-right */}
          <div className="absolute bottom-3 right-4 w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
            {node.emoji}
          </div>
        </div>

        {/* Title + price info below image */}
        <div className="px-5 pt-4 pb-3 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#111827] leading-tight">{node.title}</h2>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-[11px] text-[#9CA3AF]">{node.sessions}</span>
            <span className="text-base font-bold" style={{ color: t.color }}>{node.price}</span>
            {node.priceNote && <span className="text-[10px] text-[#9CA3AF]">{node.priceNote}</span>}
          </div>
        </div>

        {/* Tools chips */}
        <div className="flex gap-1.5 px-5 pb-3 flex-wrap flex-shrink-0">
          {node.tools.split(" · ").map((tool) => (
            <span key={tool} className="text-[10px] px-2.5 py-1 rounded-full border font-medium" style={{ borderColor: t.colorMid, color: t.color, background: t.colorLight }}>
              {tool}
            </span>
          ))}
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
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl" style={{ background: t.colorMid + "55" }}>
          {node.emoji}
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
                { from: "3D Inventors L3", fromC: "#0D9488", fromBg: "#F0FDFA", to: "Robogenesis S2", toC: "#6366F1", toBg: "#EEF2FF", note: "Apply 3D into circuits" },
                { from: "3D Inventors L3", fromC: "#0D9488", fromBg: "#F0FDFA", to: "RoboJourney L5–8", toC: "#C2410C", toBg: "#FFF1EB", note: "Skip to AI & IoT" },
                { from: "Robogenesis S3", fromC: "#6366F1", fromBg: "#EEF2FF", to: "RoboJourney L5–8", toC: "#C2410C", toBg: "#FFF1EB", note: "3D + Code → Advanced AI" },
                { from: "RoboJourney L4", fromC: "#E5690D", fromBg: "#FFF7F0", to: "RoboJourney L5–8", toC: "#C2410C", toBg: "#FFF1EB", note: "Natural Track 1 flow" },
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
              <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7F0] p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-[#111827]">🇬🇧 English Instruction</p>
                  <p className="text-sm font-bold text-[#E5690D]">+3,499 THB</p>
                </div>
                <p className="text-xs text-[#9CA3AF]">IELTS 4.5+ / TOEIC 550+ · <span className="font-medium text-[#E5690D]">Track 1</span></p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-[#111827]">👤 Private Class</p>
                  <p className="text-sm font-bold text-[#374151]">+790 THB</p>
                </div>
                <p className="text-xs text-[#9CA3AF]">One-on-one tutoring · <span className="font-medium" style={{ color: "#0D9488" }}>Track 2</span> · <span className="font-medium" style={{ color: "#6366F1" }}>Track 3</span></p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-[#111827]">🇬🇧 English Instruction</p>
                  <p className="text-sm font-bold text-[#374151]">+2,499 THB</p>
                </div>
                <p className="text-xs text-[#9CA3AF]">IELTS 4.5+ / TOEIC 550+ · <span className="font-medium" style={{ color: "#0D9488" }}>Track 2</span> · <span className="font-medium" style={{ color: "#6366F1" }}>Track 3</span></p>
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
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xl" style={{ background: t.colorMid + "55" }}>
          {node.emoji}
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
              { from: "3D Inventors L3", fromC: "#0D9488", fromBg: "#F0FDFA", to: "Robogenesis S2", toC: "#6366F1", toBg: "#EEF2FF", note: "Apply 3D into circuits" },
              { from: "3D Inventors L3", fromC: "#0D9488", fromBg: "#F0FDFA", to: "RoboJourney L5–8", toC: "#C2410C", toBg: "#FFF1EB", note: "Skip to AI & IoT" },
              { from: "Robogenesis S3", fromC: "#6366F1", fromBg: "#EEF2FF", to: "RoboJourney L5–8", toC: "#C2410C", toBg: "#FFF1EB", note: "3D + Code → Advanced AI" },
              { from: "RoboJourney L4", fromC: "#E5690D", fromBg: "#FFF7F0", to: "RoboJourney L5–8", toC: "#C2410C", toBg: "#FFF1EB", note: "Natural Track 1 flow" },
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
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7F0] px-3 py-2.5 flex flex-col gap-1.0">
              <span className="text-lg">🇬🇧</span>
              <div><p className="text-[11px] font-bold text-[#111827] whitespace-nowrap">English Instruction</p><p className="text-[9px] text-[#9CA3AF] mt-0.5 whitespace-nowrap">IELTS 4.5+ / TOEIC 550+</p></div>
              <p className="text-[11px] font-bold text-[#E5690D] mt-auto">+3,499 THB</p>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full self-start whitespace-nowrap" style={{ color: "#E5690D", background: "#FED7AA55" }}>Track 1</span>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2.5 flex flex-col gap-1.0">
              <span className="text-lg">👤</span>
              <div><p className="text-[11px] font-bold text-[#111827] whitespace-nowrap">Private Class</p><p className="text-[9px] text-[#9CA3AF] mt-0.5 whitespace-nowrap">One-on-one tutoring</p></div>
              <p className="text-[11px] font-bold text-[#374151] mt-auto">+790 THB</p>
              <div className="flex gap-1 flex-wrap">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color: "#0D9488", background: "#F0FDFA" }}>Track 2</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color: "#6366F1", background: "#EEF2FF" }}>Track 3</span>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2.5 flex flex-col gap-1.0">
              <span className="text-lg">🇬🇧</span>
              <div><p className="text-[11px] font-bold text-[#111827] whitespace-nowrap">English Instruction</p><p className="text-[9px] text-[#9CA3AF] mt-0.5 whitespace-nowrap">IELTS 4.5+ / TOEIC 550+</p></div>
              <p className="text-[11px] font-bold text-[#374151] mt-auto">+2,499 THB</p>
              <div className="flex gap-1 flex-wrap">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color: "#0D9488", background: "#F0FDFA" }}>Track 2</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color: "#6366F1", background: "#EEF2FF" }}>Track 3</span>
              </div>
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
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: t.colorMid }}>
        <div className="w-full relative flex items-center justify-center" style={{ height: 200, background: `linear-gradient(135deg, ${t.colorMid}88 0%, ${t.colorLight} 100%)` }}>
          <img src={`/images/courses/${node.id}.png`} alt={node.title} className="w-full h-full object-cover absolute inset-0" onError={(e) => { e.currentTarget.style.display = "none" }} />
          <div className="absolute bottom-3 left-4">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ color: "#fff", background: t.color }}>{node.badge} · {node.age}</span>
          </div>
        </div>
        <div className="p-5" style={{ background: t.colorLight }}>
          <h2 className="text-xl font-bold text-[#111827]">{node.title}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-sm text-[#6B7280]">{node.sessions}</span>
            <span className="text-base font-bold" style={{ color: t.color }}>{node.price}</span>
            {node.priceNote && <span className="text-xs text-[#9CA3AF]">{node.priceNote}</span>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {node.tools.split(" · ").map((tool) => (
              <span key={tool} className="text-[10px] px-2 py-0.5 rounded-full border font-medium" style={{ borderColor: t.colorMid, color: t.color, background: "#fff" }}>{tool}</span>
            ))}
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
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function CoursesPage() {
  const [activeCol, setActiveCol] = useState<number | null>(0)
  const [activeNodeId, setActiveNodeId] = useState<string | null>("rj-l1")
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
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
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
                  {activeCol === 1 && (
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className="flex-1 h-px" style={{ background: "#C2410C", opacity: 0.2 }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#C2410C", opacity: 0.5 }}>Beyond the Mission</span>
                      <div className="flex-1 h-px" style={{ background: "#C2410C", opacity: 0.2 }} />
                    </div>
                  )}
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