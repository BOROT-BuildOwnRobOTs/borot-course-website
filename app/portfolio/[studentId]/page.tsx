"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import StudentPortfolio from "@/app/profile/components/StudentPortfolio"

/**
 * Portfolio page for a single student.
 * Accessible from:
 *   - Parent profile (parent must own the student)
 *   - Admin Parent View Simulator
 */
export default function PortfolioPage() {
  const params = useParams<{ studentId: string }>()
  const router = useRouter()
  const studentId = params?.studentId

  useEffect(() => {
    if (!studentId) router.replace("/profile")
  }, [studentId, router])

  if (!studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      {/* Floating top bar with back link — overlays the showcase */}
      <div className="fixed top-0 inset-x-0 z-30 bg-white/85 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-between gap-3">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
        </div>
      </div>

      <div className="pt-12">
        <StudentPortfolio studentId={studentId} canManageShare />
      </div>
    </>
  )
}
