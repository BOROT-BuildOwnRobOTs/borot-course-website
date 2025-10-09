import { HeroSection } from "@/components/hero-section"
import { Navbar } from "@/components/navbar"
import { QRCodeWidget } from "@/components/qr-code-widget"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <HeroSection />
        <QRCodeWidget />
      </main>
    </>
  )
}
