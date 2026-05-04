"use client"

import { useState } from "react"
import { HeroSection } from "@/components/hero-section"
import { Navbar } from "@/components/navbar"
import { QRCodeWidget } from "@/components/qr-code-widget"
import { PretestModal } from "@/components/pretest-modal"
// import { LearningPathHero } from "@/components/learning-path-hero"
// import ModuleDetailsSection from "@/components/module-details-section"
// import { PartnershipSection } from "@/components/partnership-section"
// import { ShowCaseSection } from "@/components/showcase-section"
import { YouTubeSection } from "@/components/youtube-section"
// import { BorotCompanySection } from "@/components/borot-company-section"
// import { BorotFooter } from "@/components/borot-footer"

export default function Home() {
  const [isPretestOpen, setIsPretestOpen] = useState(false)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <HeroSection />
        {/* <LearningPathHero /> */}
        {/* <ModuleDetailsSection /> */}
        {/* <PartnershipSection /> */}
        {/* <ShowCaseSection />  */}
        <YouTubeSection /> 
        {/* <BorotCompanySection /> */}
         {/* <BorotFooter /> */}
        <QRCodeWidget />
      </main>

      {/* Floating Pretest Button */}
      <button
        onClick={() => setIsPretestOpen(true)}
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 group"
        aria-label="ทำแบบทดสอบเลือกคอร์ส"
      >
        <style>{`
          @keyframes pretestBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes pretestGlow {
            0%, 100% { box-shadow: 0 4px 20px rgba(229, 105, 13, 0.3); }
            50% { box-shadow: 0 4px 28px rgba(229, 105, 13, 0.5); }
          }
          .pretest-float-btn {
            animation: pretestBounce 3s ease-in-out infinite, pretestGlow 3s ease-in-out infinite;
          }
          .pretest-float-btn:hover {
            animation: none;
            transform: scale(1.05);
            box-shadow: 0 6px 30px rgba(229, 105, 13, 0.45);
          }
          .pretest-tooltip {
            opacity: 0;
            transform: translateX(-8px);
            transition: all 0.25s ease;
            pointer-events: none;
          }
          .group:hover .pretest-tooltip {
            opacity: 1;
            transform: translateX(0);
          }
        `}</style>
        <div className="flex items-center gap-3">
          <div
            className="pretest-float-btn flex items-center gap-2 sm:gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-white font-bold text-sm cursor-pointer transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #E5690D 0%, #FF8C00 100%)",
            }}
          >
            <span className="text-base sm:text-lg">✨</span>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[12px] sm:text-[13px] font-bold">Pretest</span>
              <span className="text-[9px] sm:text-[10px] font-medium opacity-80 whitespace-nowrap">ค้นหาคอร์สที่ใช่</span>
            </div>
          </div>
        </div>
      </button>

      {/* Pretest Modal */}
      <PretestModal isOpen={isPretestOpen} onClose={() => setIsPretestOpen(false)} />
    </>
  )
}
