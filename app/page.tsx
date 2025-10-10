import { HeroSection } from "@/components/hero-section"
import { Navbar } from "@/components/navbar"
import { QRCodeWidget } from "@/components/qr-code-widget"
import { LearningPathHero } from "@/components/learning-path-hero"
import ModuleDetailsSection from "@/components/module-details-section"
import { PartnershipSection } from "@/components/partnership-section"
import { ShowCaseSection } from "@/components/showcase-section"
import { YouTubeSection } from "@/components/youtube-section"
import { BorotCompanySection } from "@/components/borot-company-section"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <HeroSection />
        <LearningPathHero />
        <ModuleDetailsSection />
        <PartnershipSection />
        <ShowCaseSection /> 
        <YouTubeSection /> 
        <BorotCompanySection />
        <QRCodeWidget />
      </main>
    </>
  )
}