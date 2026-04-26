import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] relative overflow-hidden px-6">
      {/* Background glow effects */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #E5690D 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #FF8C00 0%, transparent 70%)" }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full">
        {/* Logo */}
        <div className="mb-10">
          <Image
            src="/images/borot-logo.png"
            alt="Borot"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
          <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">
            Under Maintenance
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
          We&apos;re leveling up
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #E5690D 0%, #FF8C00 60%, #FFB347 100%)",
            }}
          >
            Borot Platform
          </span>
        </h1>

        {/* Apology + description */}
        <div className="flex flex-col items-center gap-3 mb-12 max-w-md">
          <span className="text-5xl select-none">🙏</span>
          <p className="text-[#aaa] text-base sm:text-lg leading-relaxed">
            We sincerely apologize for the inconvenience.
          </p>
          <p className="text-[#666] text-sm sm:text-base leading-relaxed">
            Our team is currently working hard to improve the platform and bring you a better learning experience. We&apos;ll be back up shortly — thank you for your patience.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-[#333] to-transparent mb-10" />

        {/* Contact */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-[#555] text-sm">Have questions? Feel free to reach us:</p>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
            <a
              href="tel:0863932415"
              className="flex items-center gap-2 text-[#888] hover:text-orange-400 transition-colors text-sm"
            >
              <span className="text-orange-500">📞</span>
              086-393-2415
            </a>
            <span className="hidden sm:block text-[#333]">·</span>
            <a
              href="mailto:contact.borot@gmail.com"
              className="flex items-center gap-2 text-[#888] hover:text-orange-400 transition-colors text-sm"
            >
              <span className="text-orange-500">✉️</span>
              contact.borot@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <p className="text-[#333] text-xs">© {new Date().getFullYear()} Borot Co., Ltd. All rights reserved.</p>
      </div>
    </main>
  )
}
