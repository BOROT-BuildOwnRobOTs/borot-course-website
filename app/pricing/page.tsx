"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Info, Sparkles } from "lucide-react"

export default function PricingPage() {
  const modules = [
    {
      number: "1",
      title: "Explore & Build Basics",
      price: "18,000",
      sessions: "5 Sessions",
    },
    {
      number: "2",
      title: "Control & Navigation",
      price: "20,000",
      sessions: "5 Sessions",
    },
    {
      number: "3",
      title: "Perception & AI",
      price: "22,000",
      sessions: "5 Sessions",
    },
    {
      number: "4",
      title: "Integration Project",
      price: "24,000",
      sessions: "5 Sessions",
    },
  ]

  const features = [
    "7 ชั่วโมง/วัน (9:00-16:00)",
    "รวมค่าสอบและค่าธรรมเนียม",
    "Premium Instructor",
    "ใบประกาศนียบัตร",
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-16 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              Course Pricing
            </h1>
            <p className="text-xl text-muted-foreground">
              Individual Premium Track
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {modules.map((module) => (
              <Card
                key={module.number}
                className="border hover:border-foreground/20 transition-all duration-300 bg-card"
              >
                <CardHeader className="pb-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Module {module.number}
                  </div>
                  <CardTitle className="text-lg font-semibold mb-4">
                    {module.title}
                  </CardTitle>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold">
                      ฿{module.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {module.sessions}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Bundle Offer */}
          <Card className="border-2 border-foreground mb-16 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                  <Badge variant="secondary" className="mb-4">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Bundle Discount
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    Complete 4 Modules
                  </h2>
                  <p className="text-muted-foreground">
                    Save 15% when you purchase all modules together
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2 line-through">
                    ฿84,000
                  </div>
                  <div className="text-5xl md:text-6xl font-bold mb-2">
                    ฿71,400
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Save ฿12,600
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-6">What's Included</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 mt-0.5 text-foreground" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6">Premium Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 text-foreground" />
                  <span className="text-muted-foreground">
                    Feedback รายบุคคล
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 text-foreground" />
                  <span className="text-muted-foreground">
                    สิทธิ์สอบโควต้า มจธ (วิทยาเขตราชบุรี).
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 text-foreground" />
                  <span className="text-muted-foreground">
                    Portfolio แข็งแกร่ง
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <Card className="border bg-muted/50">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <Info className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold">Payment Options</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    สามารถแบ่งจ่าย 3 งวดได้ ชำระผ่านบัตรเครดิตหรือโอนธนาคาร
                    สำหรับผู้ที่สอบผ่านครบ 4 Module จะได้รับสิทธิ์สอบโควต้าเข้า มจธ.ราชบุรี
                    (จำกัด 8 ที่นั่ง/ปี)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mt-16">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
