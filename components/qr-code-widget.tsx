"use client"

import { useState } from "react"
import { Users } from "lucide-react"
import { SlotStatusModal } from "./slot-status-modal"

export function QRCodeWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm font-medium"
          aria-label="Current Student Status"
        >
          <Users className="w-5 h-5" />
          <span>Student Status</span>
        </button>
      </div>

      <SlotStatusModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}