"use client"

import { Navbar } from "@/components/navbar"
import { YouTubeSection } from "@/components/youtube-section"
import { ShowCaseSection } from "@/components/showcase-section"
import Image from "next/image"
import Link from "next/link"

const partners = [
  { src: "/images/partner-kmutt-smartkid.png", alt: "KMUTT Smart Kid", width: 110 },
  { src: "/images/partner-kmutt.png", alt: "KMUTT", width: 80 },
  { src: "/images/partner-kmutt-cec.png", alt: "KMUTT CEC", width: 130 },
  { src: "/images/partner-kmuttworks.png", alt: "KMUTT Works", width: 120 },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* Hero — clean, confident, no clutter */}
        <section className="pt-28 pb-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "#E5690D" }}>
              About BOROT
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ color: "#101010" }}>
              Teaching Thailand's Youth<br />
              <span style={{
                background: "linear-gradient(90deg, #FF8C00 0%, #E5690D 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                to Build with Technology
              </span>
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: "#6B6B6B" }}>
              Founded in 2023, BOROT was started by robotics and automation engineering students
              who believe hands-on learning is the best way to prepare young people for a
              technology-driven world.
            </p>
          </div>
        </section>

        {/* Two pillars — Who we are / What we do */}
        <section className="pb-20 px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-8 flex flex-col gap-4"
              style={{ background: "#FFF7F2", border: "1px solid rgba(229,105,13,0.12)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "rgba(229,105,13,0.12)" }}>
                👋
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#101010" }}>Who We Are</h2>
              <p className="leading-relaxed text-[15px]" style={{ color: "#555" }}>
                A team of engineers and educators passionate about making STEM accessible.
                We design programs and workshops that bring robotics, coding, and AI to
                students from primary school through university level.
              </p>
            </div>

            <div className="rounded-2xl p-8 flex flex-col gap-4"
              style={{ background: "linear-gradient(135deg, #E5690D 0%, #FF8C00 100%)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white/20">
                🎯
              </div>
              <h2 className="text-xl font-bold text-white">Our Mission</h2>
              <p className="leading-relaxed text-[15px] text-white/90">
                To develop Thai youth with the knowledge and skills in robotics and AI — so
                they can drive progress and raise the potential of their communities in an era
                of rapid technological change.
              </p>
            </div>
          </div>
        </section>

        {/* Partners — simple, honest */}
        <section className="py-14 px-6" style={{ background: "#F8F8F8" }}>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: "#B0B0B0" }}>
              Our Partners
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
              {partners.map((p, i) => (
                <div key={i}
                  className="transition-all duration-300 hover:opacity-100 hover:scale-105"
                  style={{ opacity: 0.6 }}>
                  <Image src={p.src} alt={p.alt} width={p.width} height={44} className="object-contain" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* YouTube */}
        <YouTubeSection />

        {/* Work showcase */}
        <ShowCaseSection />

        {/* CTA */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#101010" }}>
              Ready to start learning?
            </h2>
            <p className="mb-8 text-lg" style={{ color: "#6B6B6B" }}>
              Explore our courses and find the right program for you.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.03] shadow-md"
              style={{ background: "linear-gradient(135deg, #E5690D 0%, #FF8C00 100%)" }}
            >
              View All Courses
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

      </main>
    </>
  )
}
