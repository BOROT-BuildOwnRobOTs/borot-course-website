import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-20">
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
        <p className="text-muted-foreground text-sm">เข้าสู่ระบบเพื่อดูความก้าวหน้าและผลงานของคุณ</p>
      </div>

      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg border-2',
          },
        }}
      />

      {/* Privacy / Consent Notice */}
      <div className="mt-6 max-w-md text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          We request access to your email address to create your account and contact you about your activity.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
          เราขอเข้าถึงอีเมลของคุณเพื่อสร้างบัญชีและติดต่อคุณเกี่ยวกับกิจกรรมการเรียนของคุณ
        </p>
      </div>
    </div>
  )
}
