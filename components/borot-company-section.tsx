"use client"

import Image from "next/image"

export function BorotCompanySection() {
return (
    <section
      className="w-full flex items-center justify-center px-4 md:px-8 lg:px-[100px] py-8 md:py-12 lg:py-[72px] overflow-hidden relative"
      style={{
        fontFamily: 'var(--font-geist-sans), "IBM Plex Sans Thai", sans-serif',
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-background.png"
          alt="Background Pattern"
          fill
          className="object-cover opacity-40"
          priority
        />
      </div>

      <div className="w-full max-w-[1440px] relative z-10">

        {/* Card Container with Responsive Diagonal Cut */}
        <div
          className="relative"
          style={{
            background: "linear-gradient(135deg, #F4A261 0%, #E5690D 100%)",
            boxShadow: "0 20px 60px rgba(229, 105, 13, 0.3)",
            clipPath: window.innerWidth < 768 
              ? "none" 
              : "polygon(0 0, 70% 0, 55% 100%, 0 100%)",
            borderRadius: "16px",
          }}
        >
          <div className="relative p-6 md:p-12 lg:p-16 min-h-[400px] md:min-h-[350px] lg:min-h-[320px]">
            {/* Left Content - Text */}
            <div className="relative z-10 max-w-full md:max-w-[500px]">
              {/* Main Title */}
              <h2
                className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3"
                style={{
                  color: "#FFFFFF",
                  lineHeight: "1.2",
                  textTransform: "uppercase",
                }}
              >
                BOROT COMPANY
              </h2>

              {/* Badge */}
              <div
                className="inline-flex items-center px-3 md:px-4 py-1 md:py-1.5 rounded-full mb-4 md:mb-5"
                style={{
                  background: "rgba(255, 255, 255, 0.25)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <span
                  className="text-xs md:text-sm font-semibold"
                  style={{ color: "#FFFFFF" }}
                >
                  Engineering Education Leader
                </span>
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:space-y-2 max-w-full md:max-w-[480px] pr-0 md:pr-4">
                <p
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: "#FFFFFF", opacity: 0.95 }}
                >
                  BOROT เป็นบริษัทที่มุ่งมั่นในการพัฒนาการศึกษาด้านวิศวกรรมและเทคโนโลยีสู่ผู้เยาชน์
                </p>
                <p
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: "#FFFFFF", opacity: 0.95 }}
                >
                  เราใช้วิธีการเรียนรู้ที่มีประสิทธิภาพด้วยเทคโนโลยีที่ทันสมัย
                </p>
                <p
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: "#FFFFFF", opacity: 0.95 }}
                >
                  ด้วยหลักสูตรที่ออกแบบมาอย่างดีเพื่อพัฒนา เราช่วยให้ผู้เรียนสามารถพัฒนาทักษะ
                </p>
                <p
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: "#FFFFFF", opacity: 0.95 }}
                >
                  จากที่เราคุ้นเคยสู่ยุคใหม่ในสิ่งต่างๆได้อย่างมีประสิทธิภาพ
                </p>
              </div>
            </div>

            {/* Mascot Image - Mobile Positioned at Bottom */}
            <div className="absolute bottom-2 right-2 md:hidden pointer-events-none z-20">
              <div className="relative w-[90px] h-[90px]">
                <Image
                  src="/images/borot-logo.png"
                  alt="BOROT Company Mascot"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Pattern Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(255, 200, 0, 0.1) 0%, transparent 50%)
              `,
            }}
          />
        </div>

        {/* Mascot Image - Desktop & Tablet Only */}
        <div className="hidden md:block absolute top-1/2 right-0 lg:right-[100px] -translate-y-1/2 pointer-events-none z-20">
          <div className="relative w-[350px] h-[350px] lg:w-[550px] lg:h-[550px]">
            <Image
              src="/images/borot-logo.png"
              alt="BOROT Company Mascot"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}