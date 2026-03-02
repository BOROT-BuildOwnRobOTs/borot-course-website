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
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-10">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes floatCircle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes rotateFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(3deg);
          }
        }
        
        @keyframes rotateDashed {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        
        @keyframes floatCircleSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }
        
        .animate-float {
          animation: floatCircle 3s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: floatCircleSlow 4s ease-in-out infinite;
        }
        
        .animate-rotate-float {
          animation: rotateFloat 4s ease-in-out infinite;
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .hover-scale {
          transition: transform 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: scale(1.05);
        }
        
        .delay-100 {
          animation-delay: 0s;
        }
        
        .delay-200 {
          animation-delay: 0.05s;
        }
        
        .delay-300 {
          animation-delay: 0.1s;
        }
        
        .delay-400 {
          animation-delay: 0.15s;
        }
        
        .delay-500 {
          animation-delay: 0.2s;
        }
        
        .delay-600 {
          animation-delay: 0.25s;
        }

        .delay-700 {
          animation-delay: 0.3s;
        }
        
        .initial-hidden {
          opacity: 0;
        }
        
        .animate-rotate-dashed {
          animation: rotateDashed 20s linear infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse 4s ease-in-out infinite;
        }

        .partner-logo-item {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .partner-logo-item:hover {
          opacity: 1 !important;
          transform: scale(1.05);
        }
      `}</style>
      {/* Background Image */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/hero-background.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom center',
          backgroundSize: 'contain',
          opacity: 0.8
        }}
      />
      {/* Background Gradient Circles */}
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

            {/* Main heading */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight uppercase initial-hidden animate-fade-in-up delay-200"
              style={{
                background: 'linear-gradient(180deg, #FF8C00 0%, #E5690D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'var(--font-geist-sans)',
                filter: 'drop-shadow(0px 2px 4px rgba(229, 105, 13, 0.2))',
              }}
            >
              STEM & Design <br />
              Program Details
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base lg:text-lg font-medium leading-relaxed initial-hidden animate-fade-in-up delay-300"
              style={{ color: '#484848', fontFamily: 'var(--font-geist-sans)' }}>
              Explore the world of STEM through hands-on creation. Our program teaches students how to use technology and engineering principles to build projects that are both functional and visually appealing. Learn to design, code, and fabricate with a focus on professional aesthetics and creative problem-solving.
            </p>

            {/* Learning Path Badge */}
            <button
              onClick={() => setIsFlowModalOpen(true)}
              className="inline-flex items-center justify-center gap-[10px] h-[30px] px-4 py-2 rounded-[100px] cursor-pointer hover-scale initial-hidden animate-fade-in-up delay-400"
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

            {/* CTA Button */}
            <div className="flex items-center initial-hidden animate-fade-in-up delay-500">
              <Link href="/courses">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-6 py-3 text-base font-semibold rounded-lg bg-transparent hover-lift"
                  style={{
                    color: '#E5690D',
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '24px',
                    fontFamily: 'var(--font-geist-sans)',
                    borderColor: '#E5690D'
                  }}
                >
                  View Course Details
                </Button>
              </Link>
            </div>

            {/* Partner Logos */}
            <div className="flex flex-col gap-3 w-full initial-hidden animate-fade-in-up delay-700 mt-2">
              <p
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: '#B0B0B0', fontFamily: 'var(--font-geist-sans)' }}
              >
                Our Partners
              </p>
              <div className="flex items-center gap-5 flex-wrap">
                {/* Partner 1 - KMUTT Smart Kid */}
                <div className="partner-logo-item" style={{ opacity: 0.75 }}>
                  <Image
                    src="/images/partner-kmutt-smartkid.png"
                    alt="KMUTT Smart Kid"
                    width={90}
                    height={40}
                    className="object-contain"
                  />
                </div>

                {/* Partner 2 - KMUTT */}
                <div className="partner-logo-item" style={{ opacity: 0.75 }}>
                  <Image
                    src="/images/partner-kmutt.png"
                    alt="KMUTT"
                    width={70}
                    height={40}
                    className="object-contain"
                  />
                </div>

                {/* Partner 3 - KMUTT Continuing Education Center */}
                <div className="partner-logo-item" style={{ opacity: 0.75 }}>
                  <Image
                    src="/images/partner-kmutt-cec.png"
                    alt="KMUTT Continuing Education Center"
                    width={110}
                    height={40}
                    className="object-contain"
                  />
                </div>

                {/* Partner 4 - KMUTT Works */}
                <div className="partner-logo-item" style={{ opacity: 0.75 }}>
                  <Image
                    src="/images/partner-kmuttworks.png"
                    alt="KMUTT Works"
                    width={100}
                    height={40}
                    className="object-contain"
                  />
                </div>


              </div>
            </div>

          </div>

          {/* Right Image Section - Hidden on mobile */}
          <div className="hidden lg:flex justify-center items-center relative relative mt-20">
            <div className="relative w-[550px] h-[550px]">

              {/* Dashed Border Circle */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  width: '575.534px',
                  height: '575.534px',
                }}
              >
                <div
                  className="w-full h-full rounded-full animate-rotate-dashed"
                  style={{
                    border: '1.019px dashed #B9B9B9',
                  }}
                />
              </div>
              
              {/* Main Circle */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden hover-lift animate-pulse-subtle"
                style={{
                  width: '500px',
                  height: '500px',
                  border: '14px solid #E5690D',
                  boxShadow: '14.261px 42.783px 13.242px 0 rgba(0, 0, 0, 0.00), 9.168px 27.503px 11.205px 0 rgba(0, 0, 0, 0.01), 5.093px 15.28px 10.186px 0 rgba(0, 0, 0, 0.05), 2.037px 7.131px 7.131px 0 rgba(0, 0, 0, 0.09), 1.019px 2.037px 4.075px 0 rgba(0, 0, 0, 0.10)'
                }}
              >
                <Image
                  src="/images/hero-main.png"
                  alt="Students working on robotics"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Top Left Circle */}
              <div 
                className="absolute rounded-full overflow-hidden hover-lift animate-float"
                style={{
                  width: '150px',
                  height: '150px',
                  top: '-10px',
                  left: '-50px',
                  border: '4px solid #E5690D',
                  boxShadow: '14.261px 42.783px 13.242px 0 rgba(0, 0, 0, 0.00), 9.168px 27.503px 11.205px 0 rgba(0, 0, 0, 0.01), 5.093px 15.28px 10.186px 0 rgba(0, 0, 0, 0.05), 2.037px 7.131px 7.131px 0 rgba(0, 0, 0, 0.09), 1.019px 2.037px 4.075px 0 rgba(0, 0, 0, 0.10), 0 4px 4px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                <Image
                  src="/images/hero-top-left.png"
                  alt="Line following robot"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Right Middle Circle */}
              <div 
                className="absolute rounded-full overflow-hidden hover-lift animate-float-slow"
                style={{
                  width: '150px',
                  height: '150px',
                  top: '90px',
                  right: '-80px',
                  border: '4px solid #E5690D',
                  boxShadow: '14.261px 42.783px 13.242px 0 rgba(0, 0, 0, 0.00), 9.168px 27.503px 11.205px 0 rgba(0, 0, 0, 0.01), 5.093px 15.28px 10.186px 0 rgba(0, 0, 0, 0.05), 2.037px 7.131px 7.131px 0 rgba(0, 0, 0, 0.09), 1.019px 2.037px 4.075px 0 rgba(0, 0, 0, 0.10), 0 4px 4px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                <Image
                  src="/images/hero-right-middle.png"
                  alt="Students in meeting"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Bottom Left Circle */}
              <div 
                className="absolute rounded-full overflow-hidden hover-lift animate-float"
                style={{
                  width: '150px',
                  height: '150px',
                  top: '380px',
                  left: '-55px',
                  border: '4px solid #E5690D',
                  boxShadow: '14.261px 42.783px 13.242px 0 rgba(0, 0, 0, 0.00), 9.168px 27.503px 11.205px 0 rgba(0, 0, 0, 0.01), 5.093px 15.28px 10.186px 0 rgba(0, 0, 0, 0.05), 2.037px 7.131px 7.131px 0 rgba(0, 0, 0, 0.09), 1.019px 2.037px 4.075px 0 rgba(0, 0, 0, 0.10), 0 4px 4px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                <Image
                  src="/images/hero-bottom-left.png"
                  alt="Green robot"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Mascot */}
              <div 
                className="absolute animate-rotate-float hover-scale"
                style={{
                  width: '305px',
                  height: '292px',
                  right: '-40px',
                  bottom: '-18px',
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