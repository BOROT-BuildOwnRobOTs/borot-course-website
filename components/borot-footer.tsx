"use client"

import Image from "next/image"
import { Phone, Mail, Facebook, Youtube } from "lucide-react"
import { FaTiktok } from "react-icons/fa"

export function BorotFooter() {
  return (
    <footer
      className="w-full px-4 md:px-8 lg:px-[100px] py-12"
      style={{
        background: "#2D2D2D",
        fontFamily: 'var(--font-geist-sans), "IBM Plex Sans Thai", sans-serif',
      }}
    >
      <div className="w-full max-w-[1440px] mx-auto">
        <div className="flex flex-col items-center space-y-8">
          {/* Logo */}
          <div className="relative w-[180px] h-[50px]">
            <Image
              src="/images/botor.png"
              alt="BOROT Logo"
              fill
              className="object-contain"
            />
          </div>

          {/* Navigation Menu */}
          <nav className="flex items-center gap-8">
            <a
              href="#home"
              className="text-white hover:text-orange-500 transition-colors text-base font-medium"
            >
              Home
            </a>
            <a
              href="#module"
              className="text-white hover:text-orange-500 transition-colors text-base font-medium"
            >
              Module
            </a>
            <a
              href="#pricing"
              className="text-white hover:text-orange-500 transition-colors text-base font-medium"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-white hover:text-orange-500 transition-colors text-base font-medium"
            >
              About
            </a>
          </nav>

          {/* Social Media Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/Borot.Official"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
            >
              <Facebook className="w-5 h-5 text-white" />
            </a>
            <a
              href="https://www.tiktok.com/@borot.official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
                >
              <FaTiktok className="w-5 h-5 text-white" />
            </a>
            <a
              href="https://www.youtube.com/@borot.Official/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
            >
              <Youtube className="w-5 h-5 text-white" />
            </a>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <a
              href="tel:095-901-7395"
              className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors"
            >
              <Phone className="w-5 h-5 text-orange-500" />
              <span className="text-base">095-901-7395</span>
            </a>
            <a
              href="mailto:contact.borot@gmail.com"
              className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors"
            >
              <Mail className="w-5 h-5 text-orange-500" />
              <span className="text-base">contact.borot@gmail.com</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-2 text-gray-400 text-sm pt-4 border-t border-gray-600 w-full justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
              <span className="text-xs">©</span>
            </div>
            <span>Copyright by Borot Co., Ltd. 2025</span>
          </div>
        </div>
      </div>
    </footer>
  )
}