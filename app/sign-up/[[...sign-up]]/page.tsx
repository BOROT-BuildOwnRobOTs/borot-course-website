"use client"

import { SignUp } from "@clerk/nextjs"
import { GraduationCap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="h-12">
              <Image
                src="/images/borot-kmutt-logo.png"
                alt="BOROT x KMUTT"
                width={140}
                height={48}
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <GraduationCap className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Learning Portal</h1>
          </div>
          <p className="text-muted-foreground text-sm">สร้างบัญชีเพื่อเข้าใช้งานระบบ</p>
        </div>

        {/* Clerk SignUp Component */}
        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-lg border-2 rounded-xl w-full",
                headerTitle: "text-2xl font-bold",
                headerSubtitle: "text-muted-foreground",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base font-semibold",
                formFieldInput: "h-11",
                footerAction: "text-primary",
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/login"
            forceRedirectUrl="/onboarding"
          />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          การสมัครสมาชิกแสดงว่าคุณยอมรับ{" "}
          <a href="#" className="text-primary hover:underline">
            เงื่อนไขการใช้งาน
          </a>{" "}
          และ{" "}
          <a href="#" className="text-primary hover:underline">
            นโยบายความเป็นส่วนตัว
          </a>
        </p>
      </div>
    </div>
  )
}
