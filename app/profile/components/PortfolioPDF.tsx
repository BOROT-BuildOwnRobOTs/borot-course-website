"use client"

import { useCallback, useState } from "react"
import jsPDF from "jspdf"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────
export interface PDFProject {
  courseName: string
  topic: string
  date: string
  imageUrls: string[]
  videoUrl: string | null
  artworkImageUrl: string | null
  artworkName: string | null
  artworkDescription: string | null
  feedback: string | null
  rating: number | null
  attendedHours: number
}

export interface PDFCourseGroup {
  courseName: string
  totalImages: number
  totalVideos: number
  totalArtworks: number
  totalHours: number
  attendedCount: number
  sessionCount: number
  projects: PDFProject[]
}

export interface PDFData {
  studentName: string
  studentNickname?: string
  studentAge?: number
  summary: {
    totalSessions: number
    attendedSessions: number
    totalImages: number
    totalVideos: number
    totalArtworks: number
    totalHours: number
    courseCount: number
    skills: string[]
  }
  courses: PDFCourseGroup[]
  allImages: string[]
}

interface Props {
  data: PDFData | null
  loading: boolean
}

// ── A4 dimensions in mm ───────────────────────────────────────────────────
const PW = 210
const PH = 297
const M = 16
const CW = PW - M * 2

// ── Colors ─────────────────────────────────────────────────────────────────
const C = {
  primary: [124, 58, 237] as [number, number, number],
  primaryLight: [237, 233, 254] as [number, number, number],
  primaryDark: [76, 29, 149] as [number, number, number],
  accent: [245, 158, 11] as [number, number, number],
  gray50: [249, 250, 251] as [number, number, number],
  gray100: [243, 244, 246] as [number, number, number],
  gray200: [229, 231, 235] as [number, number, number],
  gray400: [156, 163, 175] as [number, number, number],
  gray600: [75, 85, 99] as [number, number, number],
  gray700: [55, 65, 81] as [number, number, number],
  gray800: [31, 41, 55] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
}

function rgb(c: [number, number, number]): [number, number, number] { return c }

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

// ── Thai text rendering via Canvas ────────────────────────────────────────
// jsPDF v4.x helvetica has no Thai glyphs and v4 doesn't support VFS cmap
// embedding easily.  Workaround: render Thai text blocks into a <canvas>
// (browser fonts handle Thai natively), then paste them as images into PDF.

const THAI_RE = /[\u0E00-\u0E7F]/

/**
 * Render a line of text to a canvas data URL.
 * @param text   single line (no \n)
 * @param fontSize  px
 * @param color  [r,g,b] 0-255
 * @param fontWeight  "normal" | "bold"
 */
function renderTextLine(
  text: string,
  fontSize: number,
  color: [number, number, number],
  fontWeight: "normal" | "bold",
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  const font = `${fontWeight} ${fontSize}px "Noto Sans Thai", "Noto Sans", "Sarabun", "Tahoma", sans-serif`
  ctx.font = font

  const metrics = ctx.measureText(text)
  const textH = fontSize * 1.4
  const textW = metrics.width + 4

  // Scale 2x for sharp rendering in PDF
  const scale = 2
  canvas.width = Math.ceil(textW * scale)
  canvas.height = Math.ceil(textH * scale)
  ctx.scale(scale, scale)

  ctx.font = font
  ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`
  ctx.textBaseline = "top"
  ctx.fillText(text, 2, 0)

  return canvas
}

interface ThaiBlock {
  canvas: HTMLCanvasElement
  /** mm width in PDF */
  mmW: number
  /** mm height in PDF */
  mmH: number
}

/** Render multi-line text. Returns array of canvases (one per line). */
function renderTextBlock(
  lines: string[],
  fontSizePt: number,
  color: [number, number, number],
  fontWeight: "normal" | "bold",
  maxWidthMm?: number,
): ThaiBlock[] {
  // Convert pt to px (approximate: 1pt ≈ 1.333px at 96dpi)
  const px = Math.round(fontSizePt * 1.333)
  const scale = 2 // from renderTextLine

  return lines.map((line) => {
    const canvas = renderTextLine(line, px, color, fontWeight)
    const mmW = (canvas.width / scale) * 0.2646 // px → mm at 96dpi
    const mmH = (canvas.height / scale) * 0.2646
    return { canvas, mmW: Math.min(mmW, maxWidthMm || Infinity), mmH }
  })
}

function addImageBlock(
  pdf: jsPDF,
  block: ThaiBlock,
  x: number,
  y: number,
  opts?: { align?: "left" | "center"; maxW?: number },
) {
  let dx = x
  if (opts?.align === "center") {
    const w = Math.min(block.mmW, opts?.maxW || block.mmW)
    dx = x - w / 2
  }
  pdf.addImage(block.canvas, "PNG", dx, y - block.mmH * 0.8, block.mmW, block.mmH)
}

// ── Component ──────────────────────────────────────────────────────────────
export default function PortfolioPDF({ data, loading }: Props) {
  const [generating, setGenerating] = useState(false)

  const generatePDF = useCallback(async () => {
    if (!data) return
    setGenerating(true)
    try {
      await buildPDF(data)
    } catch (err) {
      console.error("PDF generation failed:", err)
    } finally {
      setGenerating(false)
    }
  }, [data])

  if (!data && !loading) return null

  return (
    <div className="text-center space-y-2">
      <Button
        onClick={generatePDF}
        disabled={!data || generating || loading}
        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
        size="lg"
      >
        {generating || loading ? (
          <> <Loader2 className="h-5 w-5 animate-spin" /> {generating ? "Generating PDF..." : "Loading..."} </>
        ) : (
          <> <Download className="h-5 w-5" /> Download Portfolio PDF </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Download as a beautifully formatted PDF to share with schools and competitions.
      </p>
    </div>
  )
}

// ── PDF-safe text: if Thai → render as image; else → use pdf.text() ────
function safeText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: [number, number, number],
  fontWeight: "normal" | "bold" = "normal",
  opts?: { maxWidth?: number; align?: "left" | "center" },
) {
  if (THAI_RE.test(text)) {
    // Render as image block
    const block = renderTextBlock([text], fontSize, color, fontWeight)[0]
    addImageBlock(pdf, block, x, y, opts)
    return block.mmH
  } else {
    pdf.setFont("helvetica", fontWeight)
    pdf.setFontSize(fontSize)
    pdf.setTextColor(...rgb(color))
    pdf.text(text, x, y, { maxWidth: opts?.maxWidth, align: opts?.align || "left" })
    return fontSize * 0.4 // approximate line height
  }
}

function safeTextLines(
  pdf: jsPDF,
  lines: string[],
  x: number,
  y: number,
  fontSize: number,
  color: [number, number, number],
  fontWeight: "normal" | "bold" = "normal",
  lineSpacing?: number,
) {
  const gap = lineSpacing || fontSize * 0.55
  let cy = y
  for (const line of lines) {
    safeText(pdf, line, x, cy, fontSize, color, fontWeight)
    cy += gap
  }
  return cy - y
}

// ── PDF Builder ───────────────────────────────────────────────────────────
async function buildPDF(data: PDFData) {
  const pdf = new jsPDF("p", "mm", "a4")
  const { courses } = data
  const works = courses.flatMap((c) =>
    c.projects.filter((p) => p.imageUrls.length > 0 || p.artworkImageUrl),
  )
  const logoImg = await loadImage("/images/borot-logo.png")

  drawCover(pdf, data, logoImg)

  if (works.length > 0) {
    const imageMap = new Map<string, HTMLImageElement>()
    const urls = new Set(
      works.flatMap((w) => [...w.imageUrls, ...(w.artworkImageUrl ? [w.artworkImageUrl] : [])]),
    )
    await Promise.all(
      Array.from(urls).map(async (url) => {
        const img = await loadImage(url)
        if (img) imageMap.set(url, img)
      }),
    )

    for (let ci = 0; ci < courses.length; ci++) {
      const c = courses[ci]
      const cWorks = c.projects.filter((p) => p.imageUrls.length > 0 || p.artworkImageUrl)
      if (cWorks.length === 0) continue

      pdf.addPage()
      drawCourseHeader(pdf, c.courseName, ci + 1)
      let y = 42

      // Stats
      const stats = [
        { v: String(cWorks.length), l: "Works" },
        { v: `${c.attendedCount}/${c.sessionCount}`, l: "Sessions" },
        { v: `${c.totalHours}h`, l: "Hours" },
      ]
      const sw = (CW - 8) / 3
      stats.forEach((s, i) => {
        const sx = M + i * (sw + 4)
        pdf.setFillColor(...rgb(C.primaryLight))
        pdf.roundedRect(sx, y, sw, 16, 3, 3, "F")
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(13)
        pdf.setTextColor(...rgb(C.primaryDark))
        pdf.text(s.v, sx + sw / 2, y + 7, { align: "center" })
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(7)
        pdf.setTextColor(...rgb(C.gray600))
        pdf.text(s.l, sx + sw / 2, y + 13, { align: "center" })
      })
      y += 24

      safeText(pdf, "Portfolio Works", M, y, 14, C.gray800, "bold")
      y += 10

      const colW = (CW - 6) / 2
      let col = 0
      let rowY = y

      for (const w of cWorks) {
        const cx = M + col * (colW + 6)
        const imgUrl = w.artworkImageUrl || w.imageUrls[0]
        const img = imgUrl ? imageMap.get(imgUrl) : null
        const cardH = 72
        const imgH = 50

        pdf.setFillColor(...rgb(C.gray50))
        pdf.setDrawColor(...rgb(C.gray200))
        pdf.setLineWidth(0.3)
        pdf.roundedRect(cx, rowY, colW, cardH, 4, 4, "FD")

        if (img) {
          const ratio = img.naturalWidth / img.naturalHeight
          let drawW = colW - 4
          let drawH = drawW / ratio
          if (drawH > imgH - 2) { drawH = imgH - 2; drawW = drawH * ratio }
          pdf.addImage(img, "PNG", cx + (colW - drawW) / 2, rowY + 1, drawW, drawH)
        } else {
          pdf.setFillColor(...rgb(C.gray100))
          pdf.roundedRect(cx + 1, rowY + 1, colW - 2, imgH - 2, 2, 2, "F")
          pdf.setFontSize(18)
          pdf.setTextColor(...rgb(C.gray400))
          pdf.text("No Image", cx + colW / 2, rowY + imgH / 2 + 2, { align: "center" })
        }

        const name = w.artworkName || w.topic || "Project"
        const desc = (w.artworkDescription || w.feedback || "").slice(0, 80)
        let ty = rowY + imgH + 4
        ty += safeText(pdf, name, cx + 2, ty, 9, C.gray800, "bold", { maxWidth: colW - 4 })

        if (desc) {
          const needsThai = THAI_RE.test(desc)
          if (needsThai) {
            // For Thai text, render each line separately as image
            const words = desc.split(" ")
            const lines: string[] = []
            let cur = ""
            for (const wd of words) {
              const test = cur ? cur + " " + wd : wd
              if (pdf.getTextWidth(test) > colW - 4 && cur) {
                lines.push(cur)
                cur = wd
              } else {
                cur = test
              }
            }
            if (cur) lines.push(cur)
            safeTextLines(pdf, lines.slice(0, 2), cx + 2, ty, 7, C.gray600, "normal", 4)
          } else {
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(7)
            pdf.setTextColor(...rgb(C.gray600))
            const wrapLines = pdf.splitTextToSize(desc, colW - 4) as string[]
            wrapLines.slice(0, 2).forEach((line: string) => {
              pdf.text(line, cx + 2, ty)
              ty += 3.5
            })
          }
        }

        col++
        if (col >= 2) { col = 0; rowY += cardH + 6 }
      }
      if (col === 1) rowY += 78

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(7)
      pdf.setTextColor(...rgb(C.gray400))
      pdf.text("BOROT · Build Own Robots · KMUTT", PW / 2, PH - 14, { align: "center" })
    }
  }

  pdf.addPage()
  drawCertificate(pdf, data, logoImg)
  pdf.save(`${data.studentName.replace(/\s+/g, "_")}_Portfolio.pdf`)
}

// ── Cover Page ─────────────────────────────────────────────────────────────
function drawCover(pdf: jsPDF, data: PDFData, logoImg: HTMLImageElement | null) {
  pdf.setFillColor(...rgb(C.primaryLight))
  pdf.rect(0, 0, PW, PH, "F")
  pdf.setFillColor(...rgb(C.primary))
  pdf.rect(0, 0, PW, 8, "F")
  if (logoImg) pdf.addImage(logoImg, "PNG", M, 20, 28, 28)

  const titleY = 80
  safeText(pdf, "DIGITAL ENGINEERING PORTFOLIO", PW / 2, titleY - 10, 9, C.primaryDark, "normal", { align: "center" })
  safeText(pdf, data.studentName, PW / 2, titleY + 12, 32, C.gray800, "bold", { align: "center" })

  if (data.studentNickname) {
    safeText(pdf, `"${data.studentNickname}"`, PW / 2, titleY + 26, 14, C.gray600, "normal", { align: "center" })
  }

  const lineY = titleY + (data.studentNickname ? 38 : 28)
  pdf.setDrawColor(...rgb(C.primary))
  pdf.setLineWidth(1)
  pdf.line(PW / 2 - 40, lineY, PW / 2 + 40, lineY)
  pdf.setFillColor(...rgb(C.primary))
  pdf.circle(PW / 2, lineY, 2, "F")

  const cardY = lineY + 20
  const cardW = (CW - 12) / 4
  const cards = [
    { v: String(data.summary.courseCount), l: "Courses", icon: "📚" },
    { v: `${data.summary.attendedSessions}/${data.summary.totalSessions}`, l: "Sessions", icon: "📅" },
    { v: String(data.summary.totalHours), l: "Hours", icon: "⏱️" },
    { v: String(data.summary.totalImages + data.summary.totalArtworks), l: "Works", icon: "🎨" },
  ]
  cards.forEach((c, i) => {
    const x = M + i * (cardW + 4)
    pdf.setFillColor(...rgb(C.white))
    pdf.roundedRect(x, cardY, cardW, 32, 6, 6, "F")
    pdf.setFontSize(16)
    pdf.setTextColor(...rgb(C.primaryDark))
    pdf.text(c.icon, x + cardW / 2, cardY + 10, { align: "center" })
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)
    pdf.setTextColor(...rgb(C.primaryDark))
    pdf.text(formatCount(c.v), x + cardW / 2, cardY + 22, { align: "center" })
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(7)
    pdf.setTextColor(...rgb(C.gray600))
    pdf.text(c.l, x + cardW / 2, cardY + 29, { align: "center" })
  })

  const sumY = cardY + 50
  pdf.setFillColor(...rgb(C.white))
  pdf.roundedRect(M, sumY, CW, 36, 6, 6, "F")
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(9)
  pdf.setTextColor(...rgb(C.gray700))
  const summary = [
    "This Digital Engineering Portfolio showcases the robotics and engineering journey of",
    `${data.studentName} through the BOROT program at KMUTT.`,
    data.summary.courseCount > 0
      ? `Completed ${data.summary.courseCount} course(s), ${data.summary.attendedSessions} sessions, ${data.summary.totalHours} hours of hands-on experience.`
      : "",
  ].filter(Boolean).join(" ")
  const sumLines = pdf.splitTextToSize(summary, CW - 8) as string[]
  sumLines.forEach((line, i) => safeText(pdf, line, M + 4, sumY + 10 + i * 5, 9, C.gray700))

  if (data.summary.skills.length > 0) {
    const skillY = sumY + 44
    safeText(pdf, "Skills & Topics", M, skillY, 11, C.gray800, "bold")

    const skillColors = [
      [237, 233, 254], [252, 231, 243], [219, 234, 254],
      [209, 250, 229], [254, 243, 199], [224, 231, 255],
    ] as [number, number, number][]
    const skillTextColors = [
      [109, 40, 217], [190, 24, 93], [29, 78, 216],
      [4, 120, 87], [180, 83, 9], [67, 56, 202],
    ] as [number, number, number][]

    let sx = M; let sy = skillY + 6
    data.summary.skills.forEach((skill, i) => {
      const w = pdf.getTextWidth(skill) + 10
      if (sx + w > M + CW) { sx = M; sy += 9 }
      pdf.setFillColor(...skillColors[i % 6])
      pdf.roundedRect(sx, sy - 4, w, 7, 10, 10, "F")
      safeText(pdf, skill, sx + w / 2, sy, 8, skillTextColors[i % 6], "normal", { align: "center" })
      sx += w + 3
    })
  }

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(7)
  pdf.setTextColor(...rgb(C.gray400))
  pdf.text(`BOROT · Build Own Robots · KMUTT  ·  ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}`, PW / 2, PH - 12, { align: "center" })
}

// ── Course Header ──────────────────────────────────────────────────────────
function drawCourseHeader(pdf: jsPDF, courseName: string, idx: number) {
  pdf.setFillColor(...rgb(C.primary))
  pdf.rect(0, 0, PW, 3, "F")
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(8)
  pdf.setTextColor(...rgb(C.primaryDark))
  pdf.text(`COURSE ${idx}`, M, 18)
  safeText(pdf, courseName, M, 28, 20, C.gray800, "bold")
  pdf.setFillColor(...rgb(C.primary))
  pdf.roundedRect(M, 33, 40, 1.5, 1, 1, "F")
}

// ── Certificate Page ───────────────────────────────────────────────────────
function drawCertificate(pdf: jsPDF, data: PDFData, logoImg: HTMLImageElement | null) {
  pdf.setFillColor(...rgb(C.primaryLight))
  pdf.rect(0, 0, PW, PH, "F")
  pdf.setFillColor(...rgb(C.primary))
  pdf.rect(0, 0, PW, 8, "F")
  pdf.setDrawColor(...rgb(C.primary))
  pdf.setLineWidth(1.5)
  pdf.roundedRect(10, 16, PW - 20, PH - 32, 6, 6, "D")

  const cy = PH / 2 - 25
  pdf.setFontSize(40)
  pdf.text("🤖", PW / 2, cy - 30, { align: "center" })
  safeText(pdf, "Certificate of Completion", PW / 2, cy - 10, 22, C.gray800, "bold", { align: "center" })
  safeText(pdf, "This portfolio certifies that", PW / 2, cy + 14, 12, C.gray600, "normal", { align: "center" })
  safeText(pdf, data.studentName, PW / 2, cy + 34, 28, C.primaryDark, "bold", { align: "center" })

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(10)
  pdf.setTextColor(...rgb(C.gray700))
  const certText = pdf.splitTextToSize(
    `has completed ${data.summary.courseCount} course(s) in the BOROT Digital Engineering Program at King Mongkut's University of Technology Thonburi, demonstrating proficiency in robotics, programming, and creative problem-solving.`,
    CW + 20,
  ) as string[]
  certText.forEach((line, i) => pdf.text(line, PW / 2, cy + 56 + i * 6, { align: "center" }))

  const sigY = cy + 56 + certText.length * 6 + 24
  pdf.setDrawColor(...rgb(C.gray400))
  pdf.setLineWidth(0.5)
  pdf.line(PW / 2 - 50, sigY, PW / 2 - 10, sigY)
  pdf.line(PW / 2 + 10, sigY, PW / 2 + 50, sigY)
  pdf.setFontSize(8)
  pdf.setTextColor(...rgb(C.gray400))
  pdf.text("Date", PW / 2 - 30, sigY + 6, { align: "center" })
  pdf.text("Instructor", PW / 2 + 30, sigY + 6, { align: "center" })

  if (logoImg) pdf.addImage(logoImg, "PNG", PW / 2 - 30, PH - 42, 24, 24)
  pdf.setFontSize(8)
  pdf.setTextColor(...rgb(C.gray400))
  pdf.text("BOROT · Build Own Robots · KMUTT", PW / 2, PH - 14, { align: "center" })
}

function formatCount(v: string): string {
  const n = Number(v)
  if (!isNaN(n) && n > 999) return `${(n / 1000).toFixed(1)}k`
  return v
}