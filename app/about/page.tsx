"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Target } from "lucide-react"
import Image from "next/image"
import { ShowCaseSection } from "@/components/showcase-section"

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <div className="py-12">
          <ShowCaseSection />

          <div className="container mx-auto px-6 space-y-12 mt-12">
            {/* Company Info */}
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-12 text-center">
                <div className="mb-8">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white p-4">
                    <Image
                      src="/images/borot-logo.png"
                      alt="BOROT Logo"
                      width={96}
                      height={96}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">BOROT Company</h2>
                  <Badge variant="outline" className="mb-6">
                    Engineering Education Leader
                  </Badge>
                </div>

                <div className="space-y-10 max-w-3xl mx-auto">
                  {/* About Us Section */}
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">About Us</h3>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Borot was founded by a group of robotics and automation engineering students who share a passion for robotics and artificial intelligence. Our mission is to empower Thai people with knowledge and appreciation for robotics and AI, enhancing the capabilities of individuals in a technology-driven era.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border"></div>

                  {/* Our Goal Section */}
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-secondary" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Our Goal</h3>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Borot aims to develop Thai youth with knowledge and skills in robotics and artificial intelligence, empowering them to drive progress and enhance the potential of society in an era of rapid technological advancement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}