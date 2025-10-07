"use client"

import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useState } from "react"
import { LearningFlowModal } from "./learning-flow-modal"

export function Footer() {
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false)

  return (
    <>
      <footer className="py-16 bg-foreground text-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo and Company */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-background rounded-full p-2">
                <Image
                  src="/images/borot-logo.png"
                  alt="BOROT Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">BOROT Co., Ltd.</h3>
                <p className="text-background/70">Engineering Excellence</p>
              </div>
            </div>

            {/* Program Info */}
            <div className="text-center md:text-right">
              <button onClick={() => setIsFlowModalOpen(true)}>
                <Badge variant="secondary" className="mb-2 hover:bg-secondary/80 transition-colors cursor-pointer">
                  Learning Path 2025
                </Badge>
              </button>
              <p className="text-background/70">{"Engineering Learning Program"}</p>
              <p className="text-sm text-background/50 mt-1">{"สร้างวิศวกรรุ่นใหม่ เพื่ออนาคตที่ดีกว่า"}</p>
            </div>
          </div>

          <div className="border-t border-background/20 mt-8 pt-8 text-center">
            <p className="text-background/50 text-sm">
              © 2025 BOROT Co., Ltd. All rights reserved. | Engineering Learning Program
            </p>
          </div>
        </div>
      </footer>

      {/* Learning Flow Modal */}
      <LearningFlowModal isOpen={isFlowModalOpen} onClose={() => setIsFlowModalOpen(false)} />
    </>
  )
}
