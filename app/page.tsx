import { HeroSection } from "@/components/hero-section"
import { Navbar } from "@/components/navbar"
import { QRCodeWidget } from "@/components/qr-code-widget"
import { LearningPathHero } from "@/components/learning-path-hero"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <HeroSection />
        <LearningPathHero />
        <QRCodeWidget />
      </main>
    </>
  )
}
