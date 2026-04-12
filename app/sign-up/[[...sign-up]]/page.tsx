import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

export default function SignUpPage() {
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
        <p className="text-muted-foreground text-sm">สมัครสมาชิกเพื่อเริ่มต้นเรียนรู้กับ BOROT</p>
      </div>

      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg border-2',
          },
        }}
      />
    </div>
  )
}
