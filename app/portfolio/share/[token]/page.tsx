"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, Loader2 } from "lucide-react"
import StudentPortfolio from "@/app/profile/components/StudentPortfolio"

/**
 * Public portfolio share page.
 * Anyone with the URL can view — no login required.
 * The token in the URL is itself the credential.
 */
export default function PublicPortfolioPage() {
  const params = useParams<{ token: string }>()
  const token = params?.token

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      {/* Floating brand bar — sits over the portfolio so the showcase fills the page */}
      <div className="fixed top-0 inset-x-0 z-30 bg-white/85 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 relative shrink-0">
              <Image src="/images/borot-logo.png" alt="BOROT" fill className="object-contain" />
            </div>
            <span className="font-bold text-sm">BOROT</span>
          </Link>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-medium">
            <Eye className="h-3 w-3" />
            Shared Portfolio
          </div>
        </div>
      </div>

      {/* Push content below the floating bar */}
      <div className="pt-12">
        <StudentPortfolio
          studentId={token}
          fetchUrl={`/api/portfolio/public/${token}`}
          embedded
        />
      </div>
    </>
  )
}
