import Link from "next/link"
import Image from "next/image"

export function LearningPathHero() {
  const modules = [
    {
      id: 1,
      iconSrc: "/images/module-icon-1.png",
      titleEn: "Explore & Build Basics",
      titleTh: "สำรวจและสร้างพื้นฐาน",
    },
    {
      id: 2,
      iconSrc: "/images/module-icon-2.png",
      titleEn: "Control & Navigation",
      titleTh: "การควบคุมและนำทาง",
    },
    {
      id: 3,
      iconSrc: "/images/module-icon-3.png",
      titleEn: "Perception & AI",
      titleTh: "การรับรู้และปัญญาประดิษฐ์",
    },
    {
      id: 4,
      iconSrc: "/images/module-icon-4.png",
      titleEn: "Integration Project",
      titleTh: "โปรเจกต์บูรณาการ",
    },
  ]

  return (
    <section
      className="w-full flex flex-col items-center gap-6 md:gap-10 px-4 md:px-8 lg:px-[100px] py-12 md:py-[72px]"
      style={{
        background: "#F0F0F0",
        fontFamily: 'var(--font-geist-sans), "IBM Plex Sans Thai", sans-serif',
      }}
    >
      {/* Header with Title and Button */}
      <div className="w-full max-w-[1440px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left Side - Title and Description */}
        <div className="flex flex-col gap-3 md:gap-4 max-w-[900px]">
          <h2 className="text-center md:text-left">
            <span
              className="font-bold text-3xl md:text-4xl lg:text-5xl"
              style={{
                color: "#101010",
                lineHeight: "1.2",
              }}
            >
              Learning{" "}
            </span>
            <span
              className="font-bold text-3xl md:text-4xl lg:text-5xl"
              style={{
                color: "#E5690D",
                lineHeight: "1.2",
              }}
            >
              Path
            </span>
          </h2>

          <p
            className="text-center md:text-left text-base md:text-lg lg:text-xl"
            style={{
              color: "#484848",
              fontWeight: 400,
              lineHeight: "1.4",
            }}
          >
            เรียนรู้ทีละขั้นตอนด้วย 4 โมดูลหลัก ที่ออกแบบมาเพื่อพัฒนาทักษะด้านวิศวกรรมอย่างครบถ้วน
          </p>
        </div>

        {/* Right Side - View All Button */}
        <Link href="/modules" className="w-full md:w-auto">
          <button
            className="w-full md:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-[10px] transition-all hover:opacity-90"
            style={{
              background: "#E5690D",
            }}
          >
            <span
              className="font-semibold whitespace-nowrap text-base md:text-lg"
              style={{
                color: "#FFF",
                lineHeight: "24px",
              }}
            >
              ดูโมดูล
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 12.0001C17.9951 11.474 17.7832 10.971 17.41 10.6001L13.12 6.30007C12.9326 6.11382 12.6792 6.00928 12.415 6.00928C12.1508 6.00928 11.8974 6.11382 11.71 6.30007C11.6163 6.39303 11.5419 6.50363 11.4911 6.62549C11.4403 6.74735 11.4142 6.87806 11.4142 7.01007C11.4142 7.14208 11.4403 7.27279 11.4911 7.39465C11.5419 7.5165 11.6163 7.62711 11.71 7.72007L15 11.0001H5C4.73478 11.0001 4.48043 11.1054 4.29289 11.293C4.10536 11.4805 4 11.7348 4 12.0001C4 12.2653 4.10536 12.5196 4.29289 12.7072C4.48043 12.8947 4.73478 13.0001 5 13.0001H15L11.71 16.2901C11.5217 16.477 11.4154 16.7312 11.4144 16.9965C11.4135 17.2619 11.518 17.5168 11.705 17.7051C11.892 17.8934 12.1461 17.9997 12.4115 18.0006C12.6768 18.0016 12.9317 17.897 13.12 17.7101L17.41 13.4101C17.7856 13.0367 17.9978 12.5296 18 12.0001Z"
                fill="white"
              />
            </svg>
          </button>
        </Link>
      </div>

      <div className="w-full max-w-[1440px] mx-auto">
        {/* Mobile Layout - Vertical Stack */}
        <div className="flex flex-col gap-8 md:hidden">
          {modules.map((module) => (
            <div key={module.id} className="flex flex-col items-center text-center gap-4">
              <div
                className="rounded-full flex items-center justify-center transition-transform hover:scale-105"
                style={{
                  width: "140px",
                  height: "140px",
                  background: "linear-gradient(135deg, #EE9B5D 0%, #E5690D 100%)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                }}
              >
                <Image
                  src={module.iconSrc || "/placeholder.svg"}
                  alt={module.titleEn}
                  width={70}
                  height={70}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: "#101010", lineHeight: "1.3" }}>
                  {module.titleEn}
                </h3>
                <p className="text-base" style={{ color: "#484848", lineHeight: "1.4" }}>
                  {module.titleTh}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Layout - Curved Path with Dynamic Positioning */}
        <div className="hidden md:block">
          <div className="relative w-full flex justify-center items-center" style={{ minHeight: "300px" }}>
            {/* เส้นโค้งพื้นหลัง */}
            <Image
              src="/images/learning-path-curves.png"
              alt="Learning Path"
              width={1200}
              height={300}
              className="w-full h-auto max-w-[1200px]"
              priority
            />

            {/* วางโมดูลแต่ละอันทับบนเส้นโค้ง - ใช้ responsive positioning */}
            {modules.map((module, index) => {
              const positions = [
                { left: "20%", top: "30%", align: "bottom" }, // Explore & Build Basics
                { left: "40%", top: "-5%", align: "top" }, // Control & Navigation
                { left: "60%", top: "30%", align: "bottom" }, // Perception & AI
                { left: "80%", top: "-5%", align: "top" }, // Integration Project
              ]
              const pos = positions[index]

              return (
                <div
                  key={module.id}
                  className="absolute"
                  style={{
                    left: pos.left,
                    top: pos.top,
                    transform: "translate(-50%, 0)",
                  }}
                >
                  <div className="relative flex flex-col items-center text-center">
                    {pos.align === "top" && (
                      <div className="mb-4 lg:mb-6">
                        <h3
                          className="text-base lg:text-xl xl:text-2xl font-bold whitespace-nowrap"
                          style={{ color: "#101010", lineHeight: "1.3" }}
                        >
                          {module.titleEn}
                        </h3>
                        <p className="text-sm lg:text-base xl:text-lg" style={{ color: "#484848", lineHeight: "1.5" }}>
                          {module.titleTh}
                        </p>
                      </div>
                    )}

                    <div
                      className="rounded-full flex items-center justify-center transition-transform hover:-translate-y-2"
                      style={{
                        width: "clamp(120px, 15vw, 180px)",
                        height: "clamp(120px, 15vw, 180px)",
                        background: "linear-gradient(135deg, #EE9B5D 0%, #E5690D 100%)",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Image
                        src={module.iconSrc || "/placeholder.svg"}
                        alt={module.titleEn}
                        width={90}
                        height={90}
                        className="object-contain"
                        style={{
                          width: "clamp(60px, 7.5vw, 90px)",
                          height: "clamp(60px, 7.5vw, 90px)",
                        }}
                      />
                    </div>

                    {pos.align === "bottom" && (
                      <div className="mt-4 lg:mt-6">
                        <h3
                          className="text-base lg:text-xl xl:text-2xl font-bold"
                          style={{ color: "#101010", lineHeight: "1.3" }}
                        >
                          {module.titleEn}
                        </h3>
                        <p className="text-sm lg:text-base xl:text-lg" style={{ color: "#484848", lineHeight: "1.4" }}>
                          {module.titleTh}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
