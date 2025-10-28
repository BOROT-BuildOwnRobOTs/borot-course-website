import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { BorotFooter } from "@/components/borot-footer"

export const metadata: Metadata = {
  metadataBase: new URL('https://www.borot.co.th'),
  title: 'Borot',
  description: 'BOROT Robotics Learning Platform',

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' }, // ← ใช้รูปสิงโต.ico ที่คุณเปลี่ยนชื่อไว้
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },

  openGraph: {
    title: 'Borot',
    description: 'BOROT Robotics Learning Platform',
    url: 'https://www.borot.co.th',
    siteName: 'Borot',
    images: [
      { url: '/og.png', width: 1200, height: 630, alt: 'Borot Robotics Learning Platform' },
    ],
  },

  alternates: {
    canonical: 'https://www.borot.co.th',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
        <BorotFooter />
      </body>
    </html>
  )
}
