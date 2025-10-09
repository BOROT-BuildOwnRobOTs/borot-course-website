import { HeroSection } from "@/components/hero-section"
import { Navbar } from "@/components/navbar"
import { QRCodeWidget } from "@/components/qr-code-widget"
import { LearningPathHero } from "@/components/learning-path-hero"
import ModuleDetailsSection from "@/components/module-details-section"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <HeroSection />
        <LearningPathHero />
        <ModuleDetailsSection />
        <QRCodeWidget />
      </main>
    </>
  )
}
