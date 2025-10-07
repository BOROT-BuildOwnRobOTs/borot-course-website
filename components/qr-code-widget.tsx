"use client"

import { FileText } from "lucide-react"

export function QRCodeWidget() {
  const formUrl = "https://forms.gle/m6ozi98ytyP7VKyBA"

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={formUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm font-medium"
        aria-label="แบบสอบถาม"
      >
        <FileText className="w-5 h-5" />
        <span>แบบสอบถาม</span>
      </a>
    </div>
  )
}
