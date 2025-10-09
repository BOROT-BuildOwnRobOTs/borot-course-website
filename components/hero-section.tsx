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
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20 pt-10">
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl float-animation" />
      <div className="absolute top-40 right-32 w-24 h-24 bg-secondary/30 rounded-full blur-lg float-animation" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-accent/25 rounded-full blur-md float-animation" style={{ animationDelay: "2s" }} />

      {/* Background Gradient Circles ฝั่งซ้าย */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: '791px',
          height: '791px',
          left: '-200px',
          background: 'linear-gradient(180deg, rgba(229, 105, 13, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%)'
        }}
      />
      
      <div 
        className="absolute top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: '1049px',
          height: '1049px',
          left: '-350px',
          background: 'linear-gradient(180deg, rgba(229, 105, 13, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%)'
        }}
      />
      
      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Content */}
          <div className="flex flex-col items-start gap-4 w-full max-w-[608px]">
            
            {/* Logo */}
            <div className="w-full">
              <Image
                src="/images/borot-kmutt-logo.png"
                alt="BOROT x KMUTT Partnership"
                width={387}
                height={149}
                className="w-full max-w-[280px] h-auto"
                style={{ aspectRatio: '387/149' }}
              />
            </div>

            {/* Main heading */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight uppercase"
              style={{
                background: 'linear-gradient(180deg, #E5690D 0%, #A34B09 212.15%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'var(--font-geist-sans)',
              }}
            >
              Engineering <br />
              Learning Program
            </h1>


            {/* Subtitle */}
            <p className="text-sm md:text-base lg:text-lg font-medium leading-relaxed"
              style={{ color: '#484848', fontFamily: 'var(--font-geist-sans)' }}>
              ปลดล็อกศักยภาพด้านวิศวกรรมของคุณด้วยหลักสูตร 4 โมดูล ที่ปูพื้นฐานอย่างเป็นระบบ พัฒนาทักษะผ่านทั้งทฤษฎี และการลงมือทำจริง พร้อมโปรเจกต์ที่จับต้องได้ เหมาะสำหรับนักเรียนมัธยมที่เตรียมตัว สู่รั้วมหาวิทยาลัยในสายวิศวกรรม
            </p>

            {/* Learning Path Badge */}
            <button
              onClick={() => setIsFlowModalOpen(true)}
              className="inline-flex items-center justify-center gap-[10px] h-[30px] px-4 py-2 rounded-[100px] cursor-pointer"
              style={{
                backgroundColor: 'rgba(13, 178, 27, 0.10)',
                color: '#4CAF50',
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: '20px',
                fontFamily: 'var(--font-geist-sans)'
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#4CAF50' }} />
              Learning Path 2025
            </button>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link href="/modules">
                <Button
                  size="lg"
                  className="px-6 py-3 text-base font-semibold rounded-lg"
                  style={{
                    backgroundColor: '#E5690D',
                    color: '#FFF',
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '24px',
                    fontFamily: 'var(--font-geist-sans)'
                  }}
                >
                  สมัครเข้าร่วมโครงการ
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-6 py-3 text-base font-semibold rounded-lg bg-transparent"
                  style={{
                    color: '#E5690D',
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '24px',
                    fontFamily: 'var(--font-geist-sans)',
                    borderColor: '#E5690D'
                  }}
                >
                  รายละเอียดเพิ่มเติม
                </Button>
              </Link>
            </div>

          </div>

          {/* Right Image Section - Hidden on mobile */}
          <div className="hidden lg:flex justify-center items-center relative relative mt-20">
            <div className="relative w-[550px] h-[550px]">

              {/* Dashed Border Circle - เส้นขอบประ */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  width: '575.534px',
                  height: '575.534px',
                  border: '1.019px dashed #B9B9B9',
                  borderRadius: '575.534px'
                }}
              />
              
              {/* Main Circle - วงกลมใหญ่ตรงกลาง */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden"
                style={{
                  width: '414px',
                  height: '414px',
                  border: '14px solid #E5690D',
                  boxShadow: '14.261px 42.783px 13.242px 0 rgba(0, 0, 0, 0.00), 9.168px 27.503px 11.205px 0 rgba(0, 0, 0, 0.01), 5.093px 15.28px 10.186px 0 rgba(0, 0, 0, 0.05), 2.037px 7.131px 7.131px 0 rgba(0, 0, 0, 0.09), 1.019px 2.037px 4.075px 0 rgba(0, 0, 0, 0.10)'
                }}
              >
                <Image
                  src="/images/hero-main.jpg"
                  alt="Students working on robotics"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Top Left Circle - วงกลมบนซ้าย */}
              <div 
                className="absolute rounded-full overflow-hidden"
                style={{
                  width: '120px',
                  height: '120px',
                  top: '45px',
                  left: '70px',
                  border: '4px solid #E5690D',
                  boxShadow: '14.261px 42.783px 13.242px 0 rgba(0, 0, 0, 0.00), 9.168px 27.503px 11.205px 0 rgba(0, 0, 0, 0.01), 5.093px 15.28px 10.186px 0 rgba(0, 0, 0, 0.05), 2.037px 7.131px 7.131px 0 rgba(0, 0, 0, 0.09), 1.019px 2.037px 4.075px 0 rgba(0, 0, 0, 0.10), 0 4px 4px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                <Image
                  src="/images/hero-top-left.jpg"
                  alt="Line following robot"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Right Middle Circle - วงกลมขวากลาง */}
              <div 
                className="absolute rounded-full overflow-hidden"
                style={{
                  width: '120px',
                  height: '120px',
                  top: '160px',
                  right: '45px',
                  border: '4px solid #E5690D',
                  boxShadow: '14.261px 42.783px 13.242px 0 rgba(0, 0, 0, 0.00), 9.168px 27.503px 11.205px 0 rgba(0, 0, 0, 0.01), 5.093px 15.28px 10.186px 0 rgba(0, 0, 0, 0.05), 2.037px 7.131px 7.131px 0 rgba(0, 0, 0, 0.09), 1.019px 2.037px 4.075px 0 rgba(0, 0, 0, 0.10), 0 4px 4px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                <Image
                  src="/images/hero-right-middle.jpg"
                  alt="Students in meeting"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Bottom Left Circle - วงกลมล่างซ้าย */}
              <div 
                className="absolute rounded-full overflow-hidden"
                style={{
                  width: '120px',
                  height: '120px',
                  bottom: '90px',
                  left: '55px',
                  border: '4px solid #E5690D',
                  boxShadow: '14.261px 42.783px 13.242px 0 rgba(0, 0, 0, 0.00), 9.168px 27.503px 11.205px 0 rgba(0, 0, 0, 0.01), 5.093px 15.28px 10.186px 0 rgba(0, 0, 0, 0.05), 2.037px 7.131px 7.131px 0 rgba(0, 0, 0, 0.09), 1.019px 2.037px 4.075px 0 rgba(0, 0, 0, 0.10), 0 4px 4px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                <Image
                  src="/images/hero-bottom-left.jpg"
                  alt="Green robot"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Mascot - ตัวมาสคอตสิงโต */}
              <div 
                className="absolute"
                style={{
                  width: '255px',
                  height: '242px',
                  bottom: '18px',
                  right: '18px',
                  aspectRatio: '283.18/268.92'
                }}
              >
                <Image
                  src="/images/borot-mascot.png"
                  alt="BOROT Mascot"
                  fill
                  className="object-contain"
                />
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </section>

      {/* Learning Flow Modal */}
      <LearningFlowModal isOpen={isFlowModalOpen} onClose={() => setIsFlowModalOpen(false)} />
    </>
  )
}