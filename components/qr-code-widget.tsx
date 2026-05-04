"use client"

import { useState } from "react"
import { Users } from "lucide-react"
import { SlotStatusModal } from "./slot-status-modal"

export function QRCodeWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
          aria-label="Current Student Status"
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="whitespace-nowrap">Student Status</span>
        </button>
      </div>

      <SlotStatusModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}