import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Sarabun, Prompt, Playfair_Display, Bebas_Neue } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { BorotFooter } from "@/components/borot-footer"

// Thai-friendly typefaces. Sarabun = body / paragraphs, Prompt = display.
const sarabun = Sarabun({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sarabun',
  display: 'swap',
})
const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-prompt',
  display: 'swap',
})
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})
const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.borot.co.th'),
  title: 'Borot',
  description: 'BOROT Robotics Learning Platform',

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
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
    <ClerkProvider>
      <html lang="en">
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${sarabun.variable} ${prompt.variable} ${playfair.variable} ${bebas.variable}`}>
          {children}
          <Analytics />
          <BorotFooter />
        </body>
      </html>
    </ClerkProvider>
  )
}
