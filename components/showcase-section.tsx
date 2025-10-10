"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

export function ShowCaseSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // ตรวจสอบว่าเป็นมือถือหรือไม่
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide()
    }

    if (touchStart - touchEnd < -75) {
      prevSlide()
    }
  }

  const showcases = [
    {
      id: 1,
      logos: [
        "/images/show_case/showcase-logo-1.png",
        "/images/show_case/showcase-logo-1-2.png"
      ],
      images: [
        "/images/show_case/showcase-1-1.png",
        "/images/show_case/showcase-1-2.png", 
        "/images/show_case/showcase-1-3.png"
      ],
      title: "ค่ายอบรมการเขียนโปรแกรม วิทยาการหุ่นยนต์ และปัญญาประดิษฐ์",
      subtitle: "ในระดับมัน ประกมศึกษา และมัธยอมศึกษา",
      footer: "โรงเรียนสารัตติแห่งมหาวิทยาลัยเทคโนโลยีราชสร้างมัทลุมบูรี"
    },
    {
      id: 2,
      logos: ["/images/show_case/showcase-logo-2.png"],
      images: [
        "/images/show_case/showcase-2-1.png",
        "/images/show_case/showcase-2-2.png"
      ],
      title: "โครงการพัฒนาทักษะวิศวกรรม",
      subtitle: "สำหรับนักเรียนมัธยมศึกษา",
      footer: "โรงเรียนตัวอย่างที่ 2"
    },
    {
      id: 3,
      logos: [
        "/images/show_case/showcase-logo-3.png",
        "/images/show_case/showcase-logo-3-2.png",
        "/images/show_case/showcase-logo-3-3.png"
      ],
      images: [
        "/images/show_case/showcase-3-1.png"
      ],
      title: "ค่ายเทคโนโลยีหุ่นยนต์",
      subtitle: "การเรียนรู้เชิงปฏิบัติการ",
      footer: "โรงเรียนตัวอย่างที่ 3"
    },
    {
      id: 4,
      logos: ["/images/show_case/showcase-logo-4.png"],
      images: [
        "/images/show_case/showcase-4-1.png",
        "/images/show_case/showcase-4-2.png",
        "/images/show_case/showcase-4-3.png"
      ],
      title: "โครงการ STEM Education",
      subtitle: "พัฒนานวัตกรรมด้านวิศวกรรม",
      footer: "โรงเรียนตัวอย่างที่ 4"
    },
    {
      id: 5,
      logos: [
        "/images/show_case/showcase-logo-5.png",
        "/images/show_case/showcase-logo-5-2.png"
      ],
      images: [
        "/images/show_case/showcase-5-1.png",
        "/images/show_case/showcase-5-2.png"
      ],
      title: "ค่ายปัญญาประดิษฐ์เยาวชน",
      subtitle: "เรียนรู้ AI และ Machine Learning",
      footer: "โรงเรียนตัวอย่างที่ 5"
    },
    {
      id: 6,
      logos: ["/images/show_case/showcase-logo-6.png"],
      images: [
        "/images/show_case/showcase-6-1.png",
        "/images/show_case/showcase-6-2.png",
        "/images/show_case/showcase-6-3.png"
      ],
      title: "โครงการ IoT for Students",
      subtitle: "Internet of Things เบื้องต้น",
      footer: "โรงเรียนตัวอย่างที่ 6"
    },
    {
      id: 7,
      logos: ["/images/show_case/showcase-logo-7.png"],
      images: [
        "/images/show_case/showcase-7-1.png",
        "/images/show_case/showcase-7-2.png"
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
      {/* Header Section */}
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

      {/* Carousel Section */}
      <div className="relative z-30 pb-20 bg-white" style={{ marginTop: "-80px" }}>
        <div className="w-full px-4 overflow-hidden">
          
          {isMobile ? (
            /* ===== MOBILE VERSION ===== */
            <div 
              className="relative mx-auto max-w-lg" 
              style={{ minHeight: "500px" }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative overflow-hidden px-4">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${activeIndex * 100}%)`,
                  }}
                >
                  {showcases.map((showcase) => (
                    <div
                      key={showcase.id}
                      className="w-full flex-shrink-0 px-2"
                    >
                      {/* Orange Background */}
                      <div
                        className="rounded-3xl overflow-hidden shadow-2xl mb-6 relative"
                        style={{
                          background: "linear-gradient(135deg, #FF9500 0%, #E5690D 50%, #D95D0B 100%)",
                          padding: "20px",
                        }}
                      >
                        <div 
                          className="absolute inset-0 opacity-30 pointer-events-none"
                          style={{
                            backgroundImage: `
                              radial-gradient(circle at 20% 30%, rgba(255, 200, 0, 0.4) 0%, transparent 50%),
                              repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255, 255, 255, 0.06) 35px, rgba(255, 255, 255, 0.06) 70px)
                            `,
                          }}
                        />
                        
                        {/* White Card */}
                        <div className="relative bg-white rounded-2xl overflow-hidden">
                          {/* Logo Badge */}
                          <div className="relative -mb-8 z-10 flex justify-center pt-4">
                            <div
                              className="flex gap-2 items-center"
                              style={{
                                padding: showcase.logos.length === 1 ? "0" : "6px",
                              }}
                            >
                              {showcase.logos.map((logo, logoIndex) => (
                                <div
                                  key={logoIndex}
                                  className="rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden"
                                  style={{
                                    width: showcase.logos.length === 1 ? "60px" : "45px",
                                    height: showcase.logos.length === 1 ? "60px" : "45px",
                                    border: "3px solid #E5690D",
                                  }}
                                >
                                  <Image
                                    src={logo}
                                    alt={`Logo ${logoIndex + 1}`}
                                    width={showcase.logos.length === 1 ? 60 : 45}
                                    height={showcase.logos.length === 1 ? 60 : 45}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Images */}
                          <div 
                            className={`flex gap-2 p-4 ${showcase.images.length === 1 ? 'pt-14' : 'pt-12'}`}
                            style={{
                              flexWrap: showcase.images.length > 2 ? 'wrap' : 'nowrap',
                            }}
                          >
                            {showcase.images.map((img, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="rounded-lg overflow-hidden relative"
                                style={{ 
                                  height: showcase.images.length === 1 ? "200px" : "140px",
                                  flex: showcase.images.length === 1 
                                    ? "1" 
                                    : showcase.images.length === 2 
                                    ? "1" 
                                    : "1",
                                  minWidth: showcase.images.length === 1 
                                    ? "100%" 
                                    : showcase.images.length === 2 
                                    ? "calc(50% - 4px)" 
                                    : "calc(50% - 4px)"
                                }}
                              >
                                <Image
                                  src={img}
                                  alt={`Showcase ${imgIndex + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Content */}
                          <div className="px-4 pb-4 text-center">
                            <h3
                              className="text-sm font-bold mb-1 leading-snug"
                              style={{ color: "#E5690D" }}
                            >
                              {showcase.title}
                            </h3>
                            <p
                              className="text-xs mb-1.5"
                              style={{ color: "#787878" }}
                            >
                              {showcase.subtitle}
                            </p>
                            <p
                              className="text-[10px] font-medium"
                              style={{ color: "#484848" }}
                            >
                              {showcase.footer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ===== DESKTOP VERSION - 3D Coverflow ===== */
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
                      {/* Orange Background */}
                      <div
                        className="absolute inset-0 rounded-3xl overflow-hidden"
                        style={{
                          transform: "translateZ(-20px) scale(1.1)",
                          transformStyle: "preserve-3d",
                          boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
                        }}
                      >
                        <div 
                          className="w-full h-full"
                          style={{
                            background: "linear-gradient(135deg, #FF9500 0%, #E5690D 50%, #D95D0B 100%)",
                          }}
                        >
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
                          
                          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300 rounded-full blur-sm animate-pulse" />
                          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-yellow-200 rounded-full blur-sm animate-pulse" style={{ animationDelay: "0.5s" }} />
                        </div>
                      </div>

                      {/* White Card */}
                      <div 
                        className="relative bg-white rounded-3xl overflow-hidden"
                        style={{
                          boxShadow: isActive 
                            ? "0 50px 100px rgba(0,0,0,0.35), 0 25px 50px rgba(0,0,0,0.25)"
                            : "0 20px 40px rgba(0,0,0,0.15)",
                          transformStyle: "preserve-3d",
                          opacity: isActive ? 1 : 0,
                          transform: "translateZ(10px)",
                        }}
                      >
                        {/* Logo Badge */}
                        <div className="relative -mb-10 z-10 flex justify-center pt-6">
                          <div
                            className="flex gap-2 items-center"
                            style={{
                              padding: showcase.logos.length === 1 ? "0" : "8px",
                            }}
                          >
                            {showcase.logos.map((logo, logoIndex) => (
                              <div
                                key={logoIndex}
                                className="rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden"
                                style={{
                                  width: showcase.logos.length === 1 ? "80px" : "60px",
                                  height: showcase.logos.length === 1 ? "80px" : "60px",
                                  border: "4px solid #E5690D",
                                }}
                              >
                                <Image
                                  src={logo}
                                  alt={`Logo ${logoIndex + 1}`}
                                  width={showcase.logos.length === 1 ? 80 : 60}
                                  height={showcase.logos.length === 1 ? 80 : 60}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Dynamic Image Grid */}
                        <div 
                          className={`flex gap-3 p-6 ${showcase.images.length === 1 ? 'pt-16' : 'pt-14'}`}
                          style={{
                            flexWrap: showcase.images.length > 3 ? 'wrap' : 'nowrap',
                          }}
                        >
                          {showcase.images.map((img, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="rounded-xl overflow-hidden relative"
                              style={{ 
                                height: showcase.images.length === 1 ? "300px" : "200px",
                                flex: showcase.images.length === 1 
                                  ? "1" 
                                  : showcase.images.length === 2 
                                  ? "1" 
                                  : "1",
                                minWidth: showcase.images.length === 1 
                                  ? "100%" 
                                  : showcase.images.length === 2 
                                  ? "calc(50% - 6px)" 
                                  : "calc(33.333% - 8px)"
                              }}
                            >
                              <Image
                                src={img}
                                alt={`Showcase ${imgIndex + 1}`}
                                fill
                                className="object-cover"
                              />
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
          )}

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-4 md:gap-6 mt-8 md:mt-12">
            <button
              onClick={prevSlide}
              className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 shadow-xl transition-all hover:scale-110 border-2 border-gray-200"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" style={{ color: "#E5690D" }} />
            </button>
            
            {/* Dots */}
            <div className="flex gap-1.5 md:gap-2 bg-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg border-2 border-gray-200">
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
                      width: index === activeIndex ? "28px" : "10px",
                      height: "10px",
                      backgroundColor: index === activeIndex ? "#E5690D" : "#D1D5DB",
                    }}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 shadow-xl transition-all hover:scale-110 border-2 border-gray-200"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7" style={{ color: "#E5690D" }} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}