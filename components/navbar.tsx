"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"
import Image from "next/image"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/modules", label: "Modules" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
  ]

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[1240px] max-w-[calc(100%-2rem)]">
      <div className="relative">
        <div className="flex items-center justify-between h-[81px] px-6 bg-white rounded-[100px] shadow-[0_-4px_8px_0_rgba(0,0,0,0.03),0_28px_8px_0_rgba(0,0,0,0),0_18px_7px_0_rgba(0,0,0,0.01),0_10px_6px_0_rgba(0,0,0,0.03),0_4px_4px_0_rgba(0,0,0,0.04),0_1px_2px_0_rgba(0,0,0,0.05)]">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10">
              <Image
                src="/images/borot-kmutt-logo.png"
                alt="BOROT x KMUTT Partnership"
                width={120}
                height={40}
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login">
              <Button
                variant={pathname === "/login" || pathname === "/profile" ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-lg border border-border overflow-hidden">
            <div className="flex flex-col p-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-medium transition-colors hover:text-primary py-3 px-4 rounded-lg hover:bg-accent ${
                    pathname === item.href ? "text-primary bg-accent" : "text-muted-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t border-border">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button
                    variant={pathname === "/login" || pathname === "/profile" ? "default" : "outline"}
                    size="sm"
                    className="gap-2 w-full"
                  >
                    <User className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
