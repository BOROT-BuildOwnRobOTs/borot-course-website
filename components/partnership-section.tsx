import Image from "next/image"

export function PartnershipSection() {
  const benefits = [
    {
      id: 1,
      title: "โควตาพิเศษ",
      description: "ผู้เรียนครบ 4 โมดูลและสอบผ่าน จะได้รับโควตาเข้าศึกษาต่อที่ มจธ. บอร. วิทยาเขตราชบุรี"
    },
    {
      id: 2,
      title: "คุณการศึกษา",
      description: "ได้รับการพัฒนาการเพื่อเพิ่มพิสดีพัฒนาการศึกษาและโอกาสในการเข้าศึกษาต่อ"
    },
    {
      id: 3,
      title: "หลักสูตรมาตรฐาน",
      description: "หลักสูตรที่ได้รับการรับรองและพัฒนาความรู้พื้นฐานด้านวิชาการและปฏิบัติ"
    },
    {
      id: 4,
      title: "เครือข่ายวิชาการ",
      description: "เข้าถึงเครือข่ายวิชาการและโอกาสในการทำงานร่วมกับสถาบันศึกษาดังตลอดสหรรม"
    }
  ]

  return (
    <section
      className="w-full flex flex-col items-center gap-8 px-4 md:px-8 lg:px-[100px] py-12 md:py-[72px]"
      style={{
        background: "#FFFFFF",
        fontFamily: 'var(--font-geist-sans), "IBM Plex Sans Thai", sans-serif',
      }}
    >
      {/* Header */}
      <div className="w-full max-w-[1440px] text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: "#101010", lineHeight: "1.2" }}>
          ความร่วมมือกับ
        </h2>
        <h3
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6"
          style={{
            background: "linear-gradient(180deg, #E5690D 0%, #A34B09 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: "1.3",
          }}
        >
          มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี
          <br />
          วิทยาเขตราชบุรี
        </h3>
      </div>

      {/* Content Container */}
      <div className="w-full max-w-[1440px] flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side - Images with Custom Layout */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 relative">

        {/* <div
            className="absolute left-[80px] top-[20px] z-0"
            style={{
                width: "422px",
                height: "533px",
                flexShrink: 0,
                borderRadius: "24px",
                background: "linear-gradient(180deg, rgba(229, 105, 13, 0.10) 0%, rgba(255, 149, 0, 0.00) 100%)",
            }}
        ></div> */}
        {/* <div
            className="absolute left-[180px] top-[230px] z-0"
            style={{
                width: "6px",
                height: "146px",
                background: "var(--Border-primary, #E5690D)",
                borderRadius: "3px",
            }}
        ></div> */}
          {/* Top Image - Sky (Full Width) */}
          <div className="w-full rounded-2xl z-1 overflow-hidden" style={{ height: "180px" }}>
            <Image
              src="/images/partnership-top.png"
              alt="KMUTT Campus Sky View"
              width={600}
              height={180}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bottom Row - Building and Parking with Offset */}
          <div className="w-full flex gap-4 z-2 -mt-10">
            {/* Building Image - Shifted Right */}
            <div className="w-1/3"></div>
            <div className="w-2/3 rounded-2xl overflow-hidden" style={{ height: "280px" }}>
              <Image
                src="/images/partnership-building.png"
                alt="KMUTT Building"
                width={400}
                height={280}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Parking Image - Aligned Left, Overlapping */}
          <div className="w-full flex gap-4  z-1 -mt-10">
            <div className="w-2/3 rounded-2xl overflow-hidden" style={{ height: "200px" }}>
              <Image
                src="/images/partnership-parking.png"
                alt="KMUTT Parking"
                width={400}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-1/3"></div>
          </div>
        </div>

        {/* Right Side - Benefits List (Vertical Stack) */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="flex items-start gap-4 p-6 rounded-2xl"
              style={{ background: "#F5F5F5" }}
            >
              {/* Icon Circle - Placeholder */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#E5690D" }}
              >
                {/* Icon will be added here */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <g clip-path="url(#clip0_58_81)">
                    <path d="M29.6 2.88396C28.8504 2.2572 27.9721 1.80315 27.0273 1.55405C26.0825 1.30495 25.0945 1.26691 24.1333 1.44263L19.0373 2.36796C17.8608 2.58402 16.7911 3.18933 16 4.08663C15.2069 3.18778 14.1341 2.58233 12.9547 2.36796L7.86667 1.44263C6.90554 1.26675 5.91751 1.3043 4.9725 1.5526C4.0275 1.8009 3.14862 2.25389 2.39809 2.8795C1.64756 3.50511 1.04371 4.28806 0.62931 5.17291C0.214904 6.05776 6.50833e-05 7.02288 0 7.99996L0 22.3906C7.66078e-05 23.9517 0.547969 25.4632 1.54818 26.6618C2.54839 27.8603 3.93748 28.6699 5.47333 28.9493L13.8547 30.4733C15.2733 30.7311 16.7267 30.7311 18.1453 30.4733L26.5333 28.9493C28.068 28.6685 29.4555 27.8583 30.4544 26.6599C31.4533 25.4615 32.0002 23.9507 32 22.3906V7.99996C32.0006 7.02322 31.7859 6.05836 31.371 5.17409C30.9562 4.28981 30.3515 3.50788 29.6 2.88396ZM14.6667 27.904C14.5547 27.888 14.4427 27.8693 14.3307 27.8493L5.95067 26.3266C5.02902 26.1589 4.19546 25.6731 3.59532 24.9538C2.99518 24.2345 2.66653 23.3274 2.66667 22.3906V7.99996C2.66667 6.9391 3.08809 5.92168 3.83824 5.17154C4.58839 4.42139 5.6058 3.99996 6.66667 3.99996C6.90812 4.00054 7.14905 4.0224 7.38667 4.0653L12.48 4.99863C13.0928 5.11077 13.647 5.43392 14.0465 5.91202C14.4459 6.39012 14.6653 6.99297 14.6667 7.61596V27.904ZM29.3333 22.3906C29.3335 23.3274 29.0048 24.2345 28.4047 24.9538C27.8045 25.6731 26.971 26.1589 26.0493 26.3266L17.6693 27.8493C17.5573 27.8693 17.4453 27.888 17.3333 27.904V7.61596C17.3332 6.99145 17.5523 6.3867 17.9524 5.90717C18.3525 5.42765 18.9082 5.10375 19.5227 4.99196L24.6173 4.05863C25.1943 3.95366 25.7873 3.97683 26.3543 4.12651C26.9213 4.27619 27.4485 4.54871 27.8984 4.92477C28.3484 5.30083 28.7102 5.77123 28.9582 6.30266C29.2061 6.83408 29.3342 7.41353 29.3333 7.99996V22.3906Z" fill="white"/>
                </g>
                <defs>
                    <clipPath id="clip0_58_81">
                    <rect width="32" height="32" fill="white"/>
                    </clipPath>
                </defs>
                </svg>
              </div>

              {/* Text Content */}
              <div className="flex flex-col gap-2 flex-1">
                <h4
                  className="text-xl font-bold"
                  style={{
                    color: "#E5690D",
                    fontFamily: '"IBM Plex Sans Thai", sans-serif',
                  }}
                >
                  {benefit.title}
                </h4>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: "#484848",
                    fontFamily: '"IBM Plex Sans Thai", sans-serif',
                  }}
                >
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}