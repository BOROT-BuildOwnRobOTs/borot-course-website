"use client"

import { useState } from "react"
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
  { col: 3, trackNum: "Track 3", label: "Robogenesis Series", sub: "Integrated Innovation", color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" },
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

/* ─── Node Card ────────────────────────────────────────────────── */
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

/* ─── Compact Info Card ────────────────────────────────────────── */
function InfoCard() {
  const [tab, setTab] = useState<"cross" | "addons" | "contact">("contact")

  const tabs = [
    { key: "cross" as const, icon: "↔", label: "Pathways" },
    { key: "addons" as const, icon: "✦", label: "Add-ons" },
    { key: "contact" as const, icon: "📬", label: "Contact" },
  ]

  return (
    <div
      className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden"
      style={{ width: 600, boxShadow: "0 2px 12px 0 #00000009" }}
    >
      {/* Tab strip */}
      <div className="flex border-b border-[#F3F4F6] bg-[#FAFAFA]">
        {tabs.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all"
              style={{
                background: active ? "#fff" : "transparent",
                borderBottom: active ? "2px solid #E5690D" : "2px solid transparent",
              }}
            >
              <span className="text-sm leading-none">{t.icon}</span>
              <span
                className="text-[9px] font-bold uppercase tracking-wider leading-none"
                style={{ color: active ? "#E5690D" : "#B0B7C3" }}
              >
                {t.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Panel body */}
      <div className="p-4">

        {/* ── Cross-Track Pathways ── */}
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

        {/* ── Add-ons ── */}
        {tab === "addons" && (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7F0] px-3 py-2.5 flex flex-col gap-1.5">
              <span className="text-lg">🇬🇧</span>
              <div>
                <p className="text-[11px] font-bold text-[#111827] whitespace-nowrap">English Instruction</p>
                <p className="text-[9px] text-[#9CA3AF] mt-0.5 whitespace-nowrap">IELTS 4.5+ / TOEIC 550+</p>
              </div>
              <p className="text-[11px] font-bold text-[#E5690D] mt-auto">+3,499 THB</p>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full self-start whitespace-nowrap" style={{ color: "#E5690D", background: "#FED7AA55" }}>Track 1</span>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2.5 flex flex-col gap-1.5">
              <span className="text-lg">👤</span>
              <div>
                <p className="text-[11px] font-bold text-[#111827] whitespace-nowrap">Private Class</p>
                <p className="text-[9px] text-[#9CA3AF] mt-0.5 whitespace-nowrap">One-on-one tutoring</p>
              </div>
              <p className="text-[11px] font-bold text-[#374151] mt-auto">+790 THB</p>
              <div className="flex gap-1 flex-wrap">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color: "#0D9488", background: "#F0FDFA" }}>Track 2</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color: "#6366F1", background: "#EEF2FF" }}>Track 3</span>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2.5 flex flex-col gap-1.5">
              <span className="text-lg">🇬🇧</span>
              <div>
                <p className="text-[11px] font-bold text-[#111827] whitespace-nowrap">English Instruction</p>
                <p className="text-[9px] text-[#9CA3AF] mt-0.5 whitespace-nowrap">IELTS 4.5+ / TOEIC 550+</p>
              </div>
              <p className="text-[11px] font-bold text-[#374151] mt-auto">+2,499 THB</p>
              <div className="flex gap-1 flex-wrap">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color: "#0D9488", background: "#F0FDFA" }}>Track 2</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color: "#6366F1", background: "#EEF2FF" }}>Track 3</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Contact ── */}
        {tab === "contact" && (
          <div className="flex gap-4 overflow-hidden">
            {/* Col 1: Phones — fixed width to prevent clipping */}
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
                    <a href={`tel:${p.number.replace(/\s/g, "")}`} className="text-[10px] font-bold text-[#374151] hover:text-[#E5690D] transition-colors tabular-nums whitespace-nowrap">
                      {p.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-px bg-[#F3F4F6] flex-shrink-0" />

            {/* Col 2: Location */}
            <div className="flex-shrink-0" style={{ width: 140 }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">📍 Location</p>
              <div className="rounded-xl bg-[#FFF7F0] border border-[#FED7AA44] px-2.5 py-2">
                <p className="text-[11px] font-bold text-[#111827] whitespace-nowrap">KMUTT Smart Kid</p>
                <p className="text-[10px] text-[#6B7280] mt-0.5 leading-snug">2nd Fl, EMJOY Zone · EmQuartier</p>
              </div>
            </div>

            <div className="w-px bg-[#F3F4F6] flex-shrink-0" />

            {/* Col 3: Social */}
            <div className="flex-shrink-0 flex flex-col gap-2" style={{ width: 150 }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">💬 Social</p>
              <a href="https://line.me/R/ti/p/@679vxwsy" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#06C755] transition-all group">
                <span className="w-6 h-6 rounded-lg bg-[#06C755] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">L</span>
                <div>
                  <p className="text-[10px] font-bold text-[#111827] group-hover:text-[#06C755] transition-colors whitespace-nowrap">@679vxwsy</p>
                  <p className="text-[9px] text-[#9CA3AF]">LINE</p>
                </div>
              </a>
              <a href="https://facebook.com/KMUTTWORKS" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#1877F2] transition-all group">
                <span className="w-6 h-6 rounded-lg bg-[#1877F2] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">f</span>
                <div>
                  <p className="text-[10px] font-bold text-[#111827] group-hover:text-[#1877F2] transition-colors whitespace-nowrap">KMUTTWORKS</p>
                  <p className="text-[9px] text-[#9CA3AF]">Facebook</p>
                </div>
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

/* ─── Course Detail Panel ───────────────────────────────────────── */
function CourseDetailPanel({ node }: { node: Node }) {
  const t = tracks[node.track]
  const weekly = weeklyMockup[node.id] ?? []
  const outcomes = learningOutcomes[node.id] ?? []

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: t.colorMid }}>
        <div
          className="w-full relative flex items-center justify-center"
          style={{ height: 200, background: `linear-gradient(135deg, ${t.colorMid}88 0%, ${t.colorLight} 100%)` }}
        >
          <img
            src={`/images/courses/${node.id}.png`}
            alt={node.title}
            className="w-full h-full object-cover absolute inset-0"
            onError={(e) => { e.currentTarget.style.display = "none" }}
          />
          <div className="relative z-10 text-center px-6">
            <span style={{ fontSize: 56 }}>{node.emoji}</span>
          </div>
          <div className="absolute bottom-3 left-4">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ color: "#fff", background: t.color }}>
              {node.badge} · {node.age}
            </span>
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
              <span key={tool} className="text-[10px] px-2 py-0.5 rounded-full border font-medium" style={{ borderColor: t.colorMid, color: t.color, background: "#fff" }}>
                {tool}
              </span>
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
                <div className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg text-center min-w-[72px]" style={{ background: t.colorMid + "55", color: t.color }}>
                  {w.week}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#111827]">{w.topic}</p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">{w.activity}</p>
                </div>
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
                <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5" style={{ background: t.color }}>
                  {i + 1}
                </span>
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

        {/* ── Header ── */}
        <div className="pt-28 pb-8 px-6 container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Left: title + description + inline legend */}
            <div className="flex-1">
              <p className="text-xs font-bold tracking-[0.22em] uppercase text-[#E5690D] mb-2">Learning Pathways</p>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F0F0F] leading-tight">Course Roadmap</h1>
              <p className="mt-3 text-[#6B7280] text-base max-w-lg leading-relaxed">
                Three interconnected tracks — follow one path or combine them.<br />
                Select a track to explore courses, then click a course to see full details.
              </p>

            </div>
            {/* Right: compact tabbed info card */}
            <div className="flex-shrink-0 lg:mt-1">
              <InfoCard />
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="px-6 container mx-auto max-w-7xl pb-20">

          {/* Track tab headers */}
          <div
            className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6 z-20 bg-transparent"
            style={{ position: "sticky", top: 80 }}
          >
            {columns.map((col) => {
              const isSelected = activeCol === col.col
              return (
                <button
                  key={col.col}
                  onClick={() => selectCol(col.col)}
                  className="rounded-2xl px-4 py-3 text-center border-2 transition-all duration-200 cursor-pointer w-full"
                  style={{
                    background: isSelected ? col.color : col.bg,
                    borderColor: isSelected ? col.color : col.border,
                    borderBottomWidth: 3,
                    borderBottomColor: col.color,
                    boxShadow: isSelected ? `0 4px 20px -4px ${col.color}55` : "0 1px 4px 0 #00000008",
                  }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.75)" : col.color }}>
                    {col.trackNum}
                  </p>
                  <p className="text-base font-bold leading-tight" style={{ color: isSelected ? "#fff" : "#111827" }}>
                    {col.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.65)" : "#6B7280" }}>
                    {col.sub}
                  </p>
                </button>
              )
            })}
          </div>

          {/* No track selected */}
          {activeCol === null && (
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-[#E5E7EB]">
              <span className="text-5xl mb-4">👆</span>
              <p className="text-[#9CA3AF] font-medium text-base">Select a track above to explore courses</p>
              <p className="text-[#C4C4C4] text-sm mt-1">Click any track tab to see its course roadmap</p>
            </div>
          )}

          {/* Course list + Detail panel */}
          {activeCol !== null && (
            <div className="flex gap-5" style={{ alignItems: "flex-start" }}>
              {/* LEFT: Course list */}
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

              {/* RIGHT: Detail panel */}
              {activeNode && (
                <div className="flex-1 min-w-0" style={{ position: "sticky", top: 200, maxHeight: "calc(100vh - 210px)", overflowY: "auto" }}>
                  <CourseDetailPanel node={activeNode} />
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  )
}