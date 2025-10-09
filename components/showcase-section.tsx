"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function ShowCaseSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  const showcases = [
    {
      id: 1,
      logoSrc: "/images/showcase-logo-1.png",
      images: [
        "/images/showcase-1-1.png",
        "/images/showcase-1-2.png", 
        "/images/showcase-1-3.png"
      ],
      title: "ค่ายอบรมการเขียนโปรแกรม วิทยาการหุ่นยนต์ และปัญญาประดิษฐ์",
      subtitle: "ในระดับมัน ประกมศึกษา และมัธยอมศึกษา",
      footer: "โรงเรียนสารัตติแห่งมหาวิทยาลัยเทคโนโลยีราชสร้างมัทลุมบูรี"
    },
    {
      id: 2,
      logoSrc: "/images/showcase-logo-2.png",
      images: [
        "/images/showcase-2-1.png",
        "/images/showcase-2-2.png",
        "/images/showcase-2-3.png"
      ],
      title: "โครงการพัฒนาทักษะวิศวกรรม",
      subtitle: "สำหรับนักเรียนมัธยมศึกษา",
      footer: "โรงเรียนตัวอย่างที่ 2"
    },
    {
      id: 3,
      logoSrc: "/images/showcase-logo-3.png",
      images: [
        "/images/showcase-3-1.png",
        "/images/showcase-3-2.png",
        "/images/showcase-3-3.png"
      ],
      title: "ค่ายเทคโนโลยีหุ่นยนต์",
      subtitle: "การเรียนรู้เชิงปฏิบัติการ",
      footer: "โรงเรียนตัวอย่างที่ 3"
    },
    {
      id: 4,
      logoSrc: "/images/showcase-logo-4.png",
      images: [
        "/images/showcase-4-1.png",
        "/images/showcase-4-2.png",
        "/images/showcase-4-3.png"
      ],
      title: "โครงการ STEM Education",
      subtitle: "พัฒนานวัตกรรมด้านวิศวกรรม",
      footer: "โรงเรียนตัวอย่างที่ 4"
    },
    {
      id: 5,
      logoSrc: "/images/showcase-logo-5.png",
      images: [
        "/images/showcase-5-1.png",
        "/images/showcase-5-2.png",
        "/images/showcase-5-3.png"
      ],
      title: "ค่ายปัญญาประดิษฐ์เยาวชน",
      subtitle: "เรียนรู้ AI และ Machine Learning",
      footer: "โรงเรียนตัวอย่างที่ 5"
    },
    {
      id: 6,
      logoSrc: "/images/showcase-logo-6.png",
      images: [
        "/images/showcase-6-1.png",
        "/images/showcase-6-2.png",
        "/images/showcase-6-3.png"
      ],
      title: "โครงการ IoT for Students",
      subtitle: "Internet of Things เบื้องต้น",
      footer: "โรงเรียนตัวอย่างที่ 6"
    },
    {
      id: 7,
      logoSrc: "/images/showcase-logo-7.png",
      images: [
        "/images/showcase-7-1.png",
        "/images/showcase-7-2.png",
        "/images/showcase-7-3.png"
      ],
      title: "ค่ายวิศวกรรมหุ่นยนต์ขั้นสูง",
      subtitle: "พัฒนาทักษะการแก้ปัญหา",
      footer: "โรงเรียนตัวอย่างที่ 7"
    }
  ]

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % showcases.length)
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + showcases.length) % showcases.length)
  }

  const getCardStyle = (index: number): React.CSSProperties => {
    const diff = index - activeIndex
    const normalizedDiff = ((diff + showcases.length) % showcases.length)
    
    let position = normalizedDiff
    if (position > showcases.length / 2) {
      position = position - showcases.length
    }

    const isActive = position === 0
    
    // Coverflow - แสดงตรงกลางเต็มๆ ข้างๆเห็นแค่ขอบพื้นหลัง
    const rotateY = position * 50
    const translateX = position * 450
    const translateZ = isActive ? 100 : -300 - Math.abs(position) * 100
    const scale = isActive ? 1 : 0.5
    const opacity = isActive ? 1 : 0.4

    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: opacity,
      zIndex: isActive ? 50 : 20 - Math.abs(position),
      pointerEvents: (isActive ? 'auto' : 'none') as 'auto' | 'none',
    }
  }

  return (
    <section
      className="w-full relative overflow-hidden bg-white"
      style={{
        minHeight: "800px",
        fontFamily: 'var(--font-geist-sans), "IBM Plex Sans Thai", sans-serif',
      }}
    >
      {/* White Header Section with curved bottom */}
      <div 
        className="relative bg-white pt-12 pb-32 z-20"
        style={{
          clipPath: "ellipse(140% 100% at 50% 0%)",
        }}
      >
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span style={{ color: "#101010" }}>Show </span>
            <span style={{ color: "#E5690D" }}>Case</span>
          </h2>
          <p
            className="text-base md:text-lg max-w-3xl mx-auto leading-relaxed"
            style={{ color: "#484848" }}
          >
            ชมตัวอย่างโปรเจกต์ที่สร้างสรรค์จากผู้เข้าร่วมโครงการ ผ่านการเรียนรู้และปฏิบัติจริง
            <br />
            และบทพิสูจน์ว่าถูกคนเล่าการตรจว่างบัตรกรรมที่เก่าทีมได้
          </p>
        </div>
      </div>

      {/* 3D Coverflow Carousel - พื้นหลังสีขาว */}
      <div className="relative z-30 pb-20 bg-white" style={{ marginTop: "-80px" }}>
        <div className="w-full px-4 overflow-hidden">
          
          {/* Carousel Stage */}
          <div 
            className="relative mx-auto"
            style={{ 
              height: "550px",
              perspective: "1500px",
              perspectiveOrigin: "50% 50%",
            }}
          >
            <div 
              className="relative w-full h-full flex items-center justify-center"
              style={{ 
                transformStyle: "preserve-3d",
              }}
            >
              {showcases.map((showcase, index) => {
                const isActive = index === activeIndex
                
                return (
                  <div
                    key={showcase.id}
                    className="absolute transition-all duration-700 ease-out cursor-pointer"
                    style={{
                      ...getCardStyle(index),
                      width: "850px",
                      maxWidth: "85vw",
                      transformStyle: "preserve-3d",
                    }}
                    onClick={() => setActiveIndex(index)}
                  >
                    {/* Orange Background Image - ภาพพื้นหลังสีส้ม */}
                    <div
                      className="absolute inset-0 rounded-3xl overflow-hidden"
                      style={{
                        transform: "translateZ(-20px) scale(1.1)",
                        transformStyle: "preserve-3d",
                        boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
                      }}
                    >
                      {/* ใช้ภาพพื้นหลังเดียวกันทุกการ์ด - เดี๋ยวคุณเอาภาพมาใส่ */}
                      <div 
                        className="w-full h-full"
                        style={{
                          background: "linear-gradient(135deg, #FF9500 0%, #E5690D 50%, #D95D0B 100%)",
                        }}
                      >
                        {/* Pattern overlay */}
                        <div 
                          className="absolute inset-0 opacity-30"
                          style={{
                            backgroundImage: `
                              radial-gradient(circle at 20% 30%, rgba(255, 200, 0, 0.4) 0%, transparent 50%),
                              radial-gradient(circle at 80% 70%, rgba(255, 160, 0, 0.3) 0%, transparent 50%),
                              repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255, 255, 255, 0.06) 35px, rgba(255, 255, 255, 0.06) 70px)
                            `,
                          }}
                        />
                        
                        {/* Rocket circles */}
                        <div 
                          className="absolute"
                          style={{
                            left: "15%",
                            top: "30%",
                            width: "300px",
                            height: "300px",
                            background: "radial-gradient(circle, transparent 30%, rgba(255, 200, 0, 0.15) 30%, rgba(255, 200, 0, 0.15) 35%, transparent 35%)",
                            borderRadius: "50%",
                          }}
                        />
                        <div 
                          className="absolute"
                          style={{
                            right: "10%",
                            top: "40%",
                            width: "250px",
                            height: "250px",
                            background: "radial-gradient(circle, transparent 30%, rgba(255, 160, 0, 0.15) 30%, rgba(255, 160, 0, 0.15) 35%, transparent 35%)",
                            borderRadius: "50%",
                          }}
                        />
                        
                        {/* Glowing dots */}
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300 rounded-full blur-sm animate-pulse" />
                        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-yellow-200 rounded-full blur-sm animate-pulse" style={{ animationDelay: "0.5s" }} />
                        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-orange-200 rounded-full blur-sm animate-pulse" style={{ animationDelay: "1s" }} />
                      </div>
                    </div>

                    {/* White Card - การ์ดสีขาว */}
                    <div 
                      className="relative bg-white rounded-3xl overflow-hidden"
                      style={{
                        boxShadow: isActive 
                          ? "0 50px 100px rgba(0,0,0,0.35), 0 25px 50px rgba(0,0,0,0.25)"
                          : "0 20px 40px rgba(0,0,0,0.15)",
                        transformStyle: "preserve-3d",
                        opacity: isActive ? 1 : 0, // ข้างๆไม่แสดงการ์ดขาว
                        transform: "translateZ(10px)",
                      }}
                    >
                      {/* Logo Badge */}
                      <div className="relative -mb-10 z-10 flex justify-center pt-6">
                        <div
                          className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center p-2"
                          style={{
                            border: "4px solid #E5690D",
                          }}
                        >
                          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500 font-bold">LOGO</span>
                          </div>
                        </div>
                      </div>

                      {/* Three Images */}
                      <div className="flex gap-3 p-6 pt-14">
                        {showcase.images.map((img, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="flex-1 bg-gray-300 rounded-xl overflow-hidden relative"
                            style={{ 
                              height: "200px",
                              minWidth: "200px"
                            }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center text-gray-500">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-12 w-12 mx-auto mb-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <p className="text-xs">รูป {imgIndex + 1}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Content */}
                      <div className="px-6 pb-6 text-center">
                        <h3
                          className="text-base md:text-lg font-bold mb-1 leading-snug"
                          style={{ color: "#E5690D" }}
                        >
                          {showcase.title}
                        </h3>
                        <p
                          className="text-xs md:text-sm mb-2"
                          style={{ color: "#787878" }}
                        >
                          {showcase.subtitle}
                        </p>
                        <p
                          className="text-xs font-medium"
                          style={{ color: "#484848" }}
                        >
                          {showcase.footer}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-6 mt-12">
            <button
              onClick={prevSlide}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 shadow-xl transition-all hover:scale-110 border-2 border-gray-200"
              aria-label="Previous"
            >
              <ChevronLeft className="w-7 h-7" style={{ color: "#E5690D" }} />
            </button>
            
            {/* Dots */}
            <div className="flex gap-2 bg-white px-6 py-3 rounded-full shadow-lg border-2 border-gray-200">
              {showcases.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className="transition-all"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div
                    className="rounded-full transition-all"
                    style={{
                      width: index === activeIndex ? "32px" : "10px",
                      height: "10px",
                      backgroundColor: index === activeIndex ? "#E5690D" : "#D1D5DB",
                    }}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 shadow-xl transition-all hover:scale-110 border-2 border-gray-200"
              aria-label="Next"
            >
              <ChevronRight className="w-7 h-7" style={{ color: "#E5690D" }} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}