"use client"

import Image from "next/image"
import { Phone, Mail, Facebook, Youtube, MapPin } from "lucide-react"
import { FaTiktok } from "react-icons/fa"

export function BorotFooter() {
  return (
    <footer
      style={{
        background: "#242424",
        fontFamily: 'var(--font-geist-sans), "IBM Plex Sans Thai", sans-serif',
      }}
    >
      {/* ── Main footer grid ── */}
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1px_1fr_1fr] gap-10 lg:gap-8 items-start">

          {/* ── Col 1: Borot Brand ── */}
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <div className="relative w-[140px] h-[40px]">
              <Image src="/images/botor.png" alt="BOROT Logo" fill className="object-contain object-left" />
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-2">
              {["Home", "Module", "Pricing", "About"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm transition-colors w-fit"
                  style={{ color: "#9CA3AF" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#F97316")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Borot social icons */}
            <div className="flex items-center gap-2.5">
              {[
                { href: "https://www.facebook.com/Borot.Official", icon: <Facebook className="w-4 h-4 text-white" /> },
                { href: "https://www.tiktok.com/@borot.official", icon: <FaTiktok className="w-4 h-4 text-white" /> },
                { href: "https://www.youtube.com/@borot.Official/videos", icon: <Youtube className="w-4 h-4 text-white" /> },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "#F97316" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#EA6C0A")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#F97316")}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Borot contact */}
            <div className="flex flex-col gap-2">
              <a href="tel:095-901-7395" className="flex items-center gap-2 text-sm transition-colors" style={{ color: "#9CA3AF" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#F97316")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
              >
                <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F97316" }} />
                095-901-7395
              </a>
              <a href="mailto:contact.borot@gmail.com" className="flex items-center gap-2 text-sm transition-colors" style={{ color: "#9CA3AF" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#F97316")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F97316" }} />
                contact.borot@gmail.com
              </a>
            </div>
          </div>

          {/* ── Vertical divider ── */}
          <div
            className="hidden lg:block self-stretch"
            style={{ width: 1, background: "linear-gradient(to bottom, transparent, #3A3A3A 20%, #3A3A3A 80%, transparent)" }}
          />

          {/* ── Col 2: Course Phones ── */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "#E5690D" }}>
                KMUTT Smart Kid
              </p>
              <p className="text-[10px] uppercase tracking-widest font-semibold mt-0.5" style={{ color: "#6B7280" }}>
                📞 Course Hotline
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              {[
                { label: "Main", number: "02 003 6619", href: "020036619" },
                { label: "Jib", number: "062 445 3659", href: "0624453659" },
                { label: "Sine", number: "089 885 8860", href: "0898858860" },
                { label: "Da", number: "095 241 5393", href: "0952415393" },
                { label: "Plaifah", number: "095 739 3384", href: "0957393384" },
              ].map((p) => (
                <a
                  key={p.label}
                  href={`tel:${p.href}`}
                  className="flex items-center justify-between gap-4 px-3 py-2 rounded-lg group transition-all"
                  style={{ background: "#2D2D2D" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#E5690D0D" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#2D2D2D" }}
                >
                  <span className="text-xs" style={{ color: "#6B7280" }}>{p.label}</span>
                  <span className="text-xs font-bold tabular-nums transition-colors group-hover:text-[#E5690D]" style={{ color: "#D1D5DB" }}>
                    {p.number}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 3: Course Social + Location ── */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "#E5690D" }}>
                KMUTT Smart Kid
              </p>
              <p className="text-[10px] uppercase tracking-widest font-semibold mt-0.5" style={{ color: "#6B7280" }}>
                💬 Message Us
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* LINE */}
              <a
                href="https://line.me/R/ti/p/@679vxwsy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl group transition-all"
                style={{
                  background: "linear-gradient(135deg, #06C755, #04B34A)",
                  boxShadow: "0 4px 16px -4px #06C75540",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 22px -4px #06C75560"
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px -4px #06C75540"
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <span className="text-white font-black text-base" style={{ fontFamily: "Georgia, serif", lineHeight: 1 }}>L</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm leading-none">@679vxwsy</p>
                  <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>LINE Official</p>
                </div>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                  <path d="M3 8h10M9 4.5l3.5 3.5L9 11.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/KMUTTWORKS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl group transition-all"
                style={{ background: "#2D2D2D", border: "1px solid #3A3A3A" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1877F250"
                  ;(e.currentTarget as HTMLAnchorElement).style.background = "#1877F208"
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "#3A3A3A"
                  ;(e.currentTarget as HTMLAnchorElement).style.background = "#2D2D2D"
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#1877F2" }}>
                  <Facebook className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold leading-none transition-colors group-hover:text-[#5B9BF5]" style={{ color: "#D1D5DB" }}>KMUTTWORKS</p>
                  <p className="text-[11px] mt-1" style={{ color: "#6B7280" }}>Facebook Page</p>
                </div>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 opacity-20 group-hover:opacity-50 transition-opacity">
                  <path d="M3 8h10M9 4.5l3.5 3.5L9 11.5" stroke="#D1D5DB" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>

              {/* Location */}
              <div
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl"
                style={{ background: "#2D2D2D", border: "1px solid #3A3A3A" }}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#E5690D" }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: "#D1D5DB" }}>2nd Fl, EMJOY Zone · EmQuartier</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>KMUTT Smart Kid</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Copyright bar ── */}
      <div style={{ borderTop: "1px solid #333" }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "#4B5563" }}>© Copyright by Borot Co., Ltd. 2025</p>
          <p className="text-xs" style={{ color: "#4B5563" }}>KMUTT Smart Kid · 2nd Fl, EMJOY Zone, EmQuartier</p>
        </div>
      </div>
    </footer>
  )
}