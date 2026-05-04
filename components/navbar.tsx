"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"
import Image from "next/image"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/about", label: "About" },
  ]

  return (
    <nav className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[1240px] px-3 sm:px-4">
      <div className="relative">
        <div className="flex items-center justify-between h-16 sm:h-[81px] px-4 sm:px-6 bg-white rounded-full sm:rounded-[100px] shadow-[0_-4px_8px_0_rgba(0,0,0,0.03),0_28px_8px_0_rgba(0,0,0,0),0_18px_7px_0_rgba(0,0,0,0.01),0_10px_6px_0_rgba(0,0,0,0.03),0_4px_4px_0_rgba(0,0,0,0.04),0_1px_2px_0_rgba(0,0,0,0.05)]">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 sm:h-10">
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

            {/* Clerk Auth - Signed Out: show Login button */}
            <SignedOut>
              <SignInButton mode="redirect">
                <Button
                  variant={pathname === "/login" ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </SignInButton>
            </SignedOut>

            {/* Clerk Auth - Signed In: show UserButton avatar */}
            <SignedIn>
              <Link href="/profile">
                <Button
                  variant={pathname === "/profile" ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  Profile
                </Button>
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'h-9 w-9',
                  },
                }}
              />
            </SignedIn>
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
                {/* Mobile - Signed Out */}
                <SignedOut>
                  <SignInButton mode="redirect">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Login
                    </Button>
                  </SignInButton>
                </SignedOut>

                {/* Mobile - Signed In */}
                <SignedIn>
                  <div className="flex items-center justify-between gap-3">
                    <Link href="/profile" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button
                        variant={pathname === "/profile" ? "default" : "outline"}
                        size="sm"
                        className="gap-2 w-full"
                      >
                        Profile
                      </Button>
                    </Link>
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: 'h-9 w-9',
                        },
                      }}
                    />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
