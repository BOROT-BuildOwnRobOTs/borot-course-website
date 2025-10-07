"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { LearningFlowModal } from "./learning-flow-modal"

export function HeroSection() {
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false)

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl float-animation" />
        <div
          className="absolute top-40 right-32 w-24 h-24 bg-secondary/30 rounded-full blur-lg float-animation"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-32 left-1/4 w-20 h-20 bg-accent/25 rounded-full blur-md float-animation"
          style={{ animationDelay: "2s" }}
        />

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <Image
                src="/images/borot-kmutt-logo.png"
                alt="BOROT x KMUTT Partnership"
                width={500}
                height={220}
                className="w-auto h-24 md:h-32 object-contain"
              />
            </div>

            {/* Main heading */}
            <h1 className="text-6xl md:text-7xl font-bold text-balance mb-6">
              <span className="text-foreground">Engineering</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Learning Program
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-balance max-w-3xl mx-auto leading-relaxed">
              {"ปลดล็อกศักยภาพด้านวิศวกรรมของคุณด้วยหลักสูตรที่ครอบคลุม 4 โมดูลหลัก จากพื้นฐานสู่โปรเจกต์จริง"}
            </p>

            {/* Learning Path Badge */}
            <button
              onClick={() => setIsFlowModalOpen(true)}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full font-semibold mb-12 shadow-lg hover:bg-accent/90 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 bg-accent-foreground rounded-full animate-pulse" />
              Learning Path 2025
            </button>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/modules">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  เริ่มต้นเรียนรู้
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-transparent"
                >
                  <Play className="mr-2 h-5 w-5" />
                  เรียนรู้เพิ่มเติม
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Flow Modal */}
      <LearningFlowModal isOpen={isFlowModalOpen} onClose={() => setIsFlowModalOpen(false)} />
    </>
  )
}
