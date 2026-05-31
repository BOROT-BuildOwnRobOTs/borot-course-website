"use client"

import type { jsPDF } from 'jspdf'
import {
  flattenWorks, flattenSessions, flattenComments, optimizeMediaUrl, abbrFor,
  type PortfolioData, type PortfolioWork, type PortfolioSessionWork, type PortfolioComment,
} from './portfolio-types'

/**
 * Generate a portfolio PDF natively with jsPDF.
 *
 * The layout mirrors the on-screen <StudentPortfolio /> A4 pages so the web
 * view and the PDF tell the same story. Important properties:
 *
 *   - Sarabun + Prompt are embedded so Thai characters render correctly.
 *   - Images are placed with addImage at their natural aspect ratio (no
 *     vertical squashing — that bug came from html2canvas screenshotting and
 *     resizing).
 *   - Each section corresponds to one A4 page, paginating as needed.
 */

// ── A4 geometry (mm) ────────────────────────────────────────────────────────
const A4_W = 210
const A4_H = 297
const MARGIN = 18

// ── Brand palette ───────────────────────────────────────────────────────────
const BRAND: [number, number, number] = [229, 105, 13]      // #E5690D
const BRAND_LIGHT: [number, number, number] = [255, 140, 0] // #FF8C00
const TEXT: [number, number, number] = [26, 26, 26]
const GREY: [number, number, number] = [107, 114, 128]
const LIGHT: [number, number, number] = [156, 163, 175]
const SOFT: [number, number, number] = [255, 247, 237]
const SOFT_BORDER: [number, number, number] = [240, 227, 211]

// ── Embedded fonts ──────────────────────────────────────────────────────────
// Loaded once and cached. We fetch from /public/fonts so the PDF can include
// Thai glyphs (jsPDF's built-in fonts only ship Latin).
let fontCache: { sarabun: string; sarabunBold: string; prompt: string } | null = null

async function loadFonts(): Promise<typeof fontCache> {
  if (fontCache) return fontCache
  const fetchAsBase64 = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to load font: ${url}`)
    const blob = await res.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const r = reader.result
        if (typeof r !== 'string') return reject(new Error('font read failed'))
        // Strip data URL prefix — jsPDF wants raw base64
        resolve(r.split(',')[1] || '')
      }
      reader.onerror = () => reject(new Error('font reader error'))
      reader.readAsDataURL(blob)
    })
  }
  const [sarabun, sarabunBold, prompt] = await Promise.all([
    fetchAsBase64('/fonts/Sarabun-Regular.ttf'),
    fetchAsBase64('/fonts/Sarabun-Bold.ttf'),
    fetchAsBase64('/fonts/Prompt-Black.ttf'),
  ])
  fontCache = { sarabun, sarabunBold, prompt }
  return fontCache
}

function registerFonts(pdf: jsPDF, fonts: NonNullable<typeof fontCache>) {
  pdf.addFileToVFS('Sarabun-Regular.ttf', fonts.sarabun)
  pdf.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal')
  pdf.addFileToVFS('Sarabun-Bold.ttf', fonts.sarabunBold)
  pdf.addFont('Sarabun-Bold.ttf', 'Sarabun', 'bold')
  pdf.addFileToVFS('Prompt-Black.ttf', fonts.prompt)
  pdf.addFont('Prompt-Black.ttf', 'Prompt', 'bold')
}

// ── Image loading ───────────────────────────────────────────────────────────
interface LoadedImage {
  dataUrl: string
  width: number
  height: number
}

async function loadImage(src: string, timeoutMs = 12000): Promise<LoadedImage | null> {
  if (!src) return null
  const url = optimizeMediaUrl(src)
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { mode: 'cors', signal: controller.signal })
    if (!res.ok) return null
    const blob = await res.blob()
    if (!blob.type.startsWith('image/')) return null
    const dataUrl = await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
    if (!dataUrl) return null
    const dims = await new Promise<{ w: number; h: number } | null>((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
      img.onerror = () => resolve(null)
      img.src = dataUrl
    })
    if (!dims || dims.w === 0) return null
    return { dataUrl, width: dims.w, height: dims.h }
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

function imageFormat(dataUrl: string): 'JPEG' | 'PNG' {
  return dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
}

/** Draw an image inside a rectangle, centred, never cropped (object-fit: contain). */
function fitImage(
  pdf: jsPDF,
  img: LoadedImage,
  boxX: number, boxY: number, boxW: number, boxH: number,
  background: [number, number, number] = [240, 240, 240]
) {
  pdf.setFillColor(...background)
  pdf.roundedRect(boxX, boxY, boxW, boxH, 2.5, 2.5, 'F')
  const ratio = Math.min(boxW / img.width, boxH / img.height)
  const drawW = img.width * ratio
  const drawH = img.height * ratio
  const x = boxX + (boxW - drawW) / 2
  const y = boxY + (boxH - drawH) / 2
  pdf.addImage(img.dataUrl, imageFormat(img.dataUrl), x, y, drawW, drawH, undefined, 'FAST')
}

// ── Text helpers ────────────────────────────────────────────────────────────
function setSarabun(pdf: jsPDF, weight: 'normal' | 'bold' = 'normal') {
  pdf.setFont('Sarabun', weight)
}
function setPrompt(pdf: jsPDF) {
  pdf.setFont('Prompt', 'bold')
}
function fmtDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
function wrap(pdf: jsPDF, text: string, maxW: number): string[] {
  if (!text) return []
  return pdf.splitTextToSize(text, maxW) as string[]
}

// ── Section header (matches the on-screen design) ───────────────────────────
function drawSectionHeader(pdf: jsPDF, label: string, right?: string): number {
  // First letter on a coloured chip, rest in dark
  const first = label.charAt(0)
  const rest = label.slice(1)
  const y = 32

  setPrompt(pdf)
  pdf.setFontSize(28)
  const firstW = pdf.getTextWidth(first) + 6
  const chipH = 14
  // Chip background
  pdf.setFillColor(...BRAND)
  pdf.roundedRect(MARGIN, y - chipH + 2, firstW, chipH, 2.5, 2.5, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.text(first, MARGIN + 3, y - 1)
  pdf.setTextColor(...TEXT)
  pdf.text(rest, MARGIN + firstW + 1, y - 1)

  if (right) {
    setSarabun(pdf, 'bold')
    pdf.setFontSize(8)
    pdf.setTextColor(...LIGHT)
    pdf.text(right, A4_W - MARGIN, y - 4, { align: 'right' })
  }

  // Underline
  pdf.setDrawColor(...BRAND)
  pdf.setLineWidth(1.4)
  pdf.line(MARGIN, y + 5, A4_W - MARGIN, y + 5)
  return y + 18
}

function drawPageFooter(pdf: jsPDF, pageNum: number) {
  setSarabun(pdf, 'bold')
  pdf.setFontSize(7)
  pdf.setTextColor(...LIGHT)
  pdf.setCharSpace(0.4)
  pdf.text('BOROT  ·  DIGITAL ENGINEERING PORTFOLIO', MARGIN, A4_H - 10)
  pdf.text(String(pageNum).padStart(2, '0'), A4_W - MARGIN, A4_H - 10, { align: 'right' })
  pdf.setCharSpace(0)
}

// ── Pages ───────────────────────────────────────────────────────────────────

function renderCoverPage(pdf: jsPDF, data: PortfolioData) {
  // Top brand bar
  pdf.setFillColor(...BRAND)
  pdf.rect(0, 0, A4_W, 4, 'F')
  pdf.setFillColor(...BRAND_LIGHT)
  pdf.rect(A4_W * 0.4, 0, A4_W * 0.6, 4, 'F')

  // Eyebrow
  setSarabun(pdf, 'bold')
  pdf.setFontSize(9)
  pdf.setTextColor(...GREY)
  pdf.setCharSpace(0.6)
  pdf.text('A COLLECTION OF WORKS', A4_W / 2, 30, { align: 'center' })
  pdf.setCharSpace(0)

  // Big PORTFOLIO wordmark
  setPrompt(pdf)
  pdf.setFontSize(72)
  pdf.setTextColor(...BRAND)
  pdf.text('PORTFOLIO', A4_W / 2, 60, { align: 'center' })

  // Subtitle: name (Sarabun bold, supports Thai)
  setSarabun(pdf, 'bold')
  pdf.setFontSize(24)
  pdf.setTextColor(...BRAND_LIGHT)
  pdf.text(data.student.nickname || data.student.name, A4_W / 2, 73, { align: 'center' })

  // Decorative blobs
  pdf.setFillColor(255, 220, 180)
  pdf.circle(40, 150, 22, 'F')
  pdf.setFillColor(255, 200, 130)
  pdf.circle(170, 200, 18, 'F')
  pdf.setFillColor(255, 220, 180)
  pdf.circle(180, 105, 7, 'F')

  // Hero circle with initial
  const cx = A4_W / 2
  const cy = 165
  const r = 38
  // Outer ring shadow effect
  pdf.setFillColor(255, 200, 150)
  pdf.circle(cx, cy + 1, r + 1, 'F')
  pdf.setFillColor(...BRAND)
  pdf.circle(cx, cy, r, 'F')
  // Orbit
  pdf.setFillColor(...BRAND_LIGHT)
  pdf.circle(cx + 30, cy - 28, 7, 'F')
  pdf.setFillColor(255, 220, 180)
  pdf.circle(cx - 36, cy + 30, 5, 'F')

  // Initial
  setPrompt(pdf)
  const initial = (data.student.nickname?.[0] || data.student.name?.[0] || 'B').toUpperCase()
  pdf.setFontSize(80)
  pdf.setTextColor(255, 255, 255)
  pdf.text(initial, cx, cy + 14, { align: 'center' })

  // Stats row
  const totalWorks = data.stats.photoCount + data.stats.artworkCount + data.stats.videoCount
  const stats: { v: string; l: string }[] = [
    { v: String(totalWorks), l: 'WORKS' },
    { v: String(data.stats.totalAttendedHours), l: 'HOURS' },
    { v: String(data.stats.totalCourses), l: 'COURSES' },
  ]
  const sy = 240
  const sx0 = A4_W / 2
  const gap = 38
  stats.forEach((s, i) => {
    const x = sx0 + (i - 1) * gap
    setPrompt(pdf)
    pdf.setFontSize(28)
    pdf.setTextColor(...BRAND)
    pdf.text(s.v, x, sy, { align: 'center' })
    setSarabun(pdf, 'bold')
    pdf.setFontSize(7)
    pdf.setTextColor(...GREY)
    pdf.setCharSpace(0.4)
    pdf.text(s.l, x, sy + 6, { align: 'center' })
    pdf.setCharSpace(0)
  })
  // Dividers
  pdf.setDrawColor(229, 231, 235)
  pdf.setLineWidth(0.3)
  pdf.line(sx0 - gap / 2, sy - 5, sx0 - gap / 2, sy + 1)
  pdf.line(sx0 + gap / 2, sy - 5, sx0 + gap / 2, sy + 1)

  // Footer band
  pdf.setDrawColor(...BRAND)
  pdf.setLineWidth(2)
  pdf.line(MARGIN, A4_H - 24, A4_W - MARGIN, A4_H - 24)
  setPrompt(pdf)
  pdf.setFontSize(14)
  pdf.setTextColor(...BRAND)
  pdf.text('BOROT', MARGIN, A4_H - 16)
  setSarabun(pdf, 'bold')
  pdf.setFontSize(7)
  pdf.setTextColor(...LIGHT)
  pdf.setCharSpace(0.4)
  pdf.text('ROBOTICS · ENGINEERING · 3D DESIGN', MARGIN, A4_H - 10)
  pdf.text('www.borot.co.th', A4_W - MARGIN, A4_H - 10, { align: 'right' })
  pdf.setCharSpace(0)
}

function renderAboutPage(pdf: jsPDF, data: PortfolioData, pageNum: number) {
  drawSectionHeader(pdf, 'ABOUT ME')

  const leftW = 60
  const rightX = MARGIN + leftW + 12
  const rightW = A4_W - rightX - MARGIN
  let y = 56

  // Avatar block (left column)
  pdf.setFillColor(...BRAND)
  pdf.roundedRect(MARGIN, y, leftW, 70, 5, 5, 'F')
  setPrompt(pdf)
  pdf.setFontSize(64)
  pdf.setTextColor(255, 255, 255)
  const initial = (data.student.nickname?.[0] || data.student.name?.[0] || '?').toUpperCase()
  pdf.text(initial, MARGIN + leftW / 2, y + 50, { align: 'center' })

  // Meta rows under avatar
  let metaY = y + 78
  const meta: { label: string; value: string }[] = [
    { label: 'NAME', value: data.student.name || '—' },
    ...(data.student.nickname ? [{ label: 'NICKNAME', value: data.student.nickname }] : []),
    ...(data.student.age != null ? [{ label: 'AGE', value: `${data.student.age} years` }] : []),
    { label: 'STUDIO', value: `${data.stats.totalAttendedHours} hours` },
  ]
  meta.forEach((m) => {
    setSarabun(pdf, 'bold')
    pdf.setFontSize(7)
    pdf.setTextColor(...LIGHT)
    pdf.setCharSpace(0.3)
    pdf.text(m.label, MARGIN, metaY)
    pdf.setCharSpace(0)
    setSarabun(pdf, 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(...TEXT)
    const lines = wrap(pdf, m.value, leftW)
    pdf.text(lines.slice(0, 2), MARGIN, metaY + 5)
    metaY += 5 + Math.min(2, lines.length) * 5 + 2
  })

  // Right column — bio, stats cards, skills, languages
  // BIO
  setPrompt(pdf)
  pdf.setFontSize(11)
  pdf.setTextColor(...BRAND)
  pdf.setCharSpace(0.5)
  pdf.text('★ ABOUT', rightX, y)
  pdf.setCharSpace(0)
  y += 7

  const name = data.student.nickname || data.student.name || 'This student'
  const works = data.stats.photoCount + data.stats.artworkCount + data.stats.videoCount
  const bio =
    `${name} is a young engineer at BOROT Academy. Across ${data.stats.totalCourses} ` +
    `${data.stats.totalCourses === 1 ? 'course' : 'courses'}, they have attended ${data.stats.attendedSessions} sessions ` +
    `and produced ${works} pieces of work — exploring robotics, programming, and 3D design through hands-on building.`
  setSarabun(pdf, 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(...TEXT)
  const bioLines = wrap(pdf, bio, rightW)
  bioLines.forEach((line, i) => pdf.text(line, rightX, y + i * 5.2))
  y += bioLines.length * 5.2 + 8

  // AT A GLANCE — 4 stat cards
  setPrompt(pdf)
  pdf.setFontSize(11)
  pdf.setTextColor(...BRAND)
  pdf.setCharSpace(0.5)
  pdf.text('★ AT A GLANCE', rightX, y)
  pdf.setCharSpace(0)
  y += 6
  const cardGap = 3
  const cardW = (rightW - cardGap * 3) / 4
  const cardH = 24
  const cardCfg: { value: string; label: string }[] = [
    { value: String(data.stats.artworkCount), label: 'PROJECTS' },
    { value: String(data.stats.photoCount), label: 'PHOTOS' },
    { value: String(data.stats.videoCount), label: 'VIDEOS' },
    { value: `${data.stats.totalAttendedHours}h`, label: 'STUDIO' },
  ]
  cardCfg.forEach((c, i) => {
    const x = rightX + i * (cardW + cardGap)
    pdf.setFillColor(...SOFT)
    pdf.roundedRect(x, y, cardW, cardH, 3, 3, 'F')
    pdf.setDrawColor(...SOFT_BORDER)
    pdf.setLineWidth(0.4)
    pdf.roundedRect(x, y, cardW, cardH, 3, 3, 'S')
    setPrompt(pdf)
    pdf.setFontSize(18)
    pdf.setTextColor(...BRAND)
    pdf.text(c.value, x + cardW / 2, y + 13, { align: 'center' })
    setSarabun(pdf, 'bold')
    pdf.setFontSize(6.5)
    pdf.setTextColor(...GREY)
    pdf.setCharSpace(0.3)
    pdf.text(c.label, x + cardW / 2, y + 19, { align: 'center' })
    pdf.setCharSpace(0)
  })
  y += cardH + 9

  // COURSES & SKILLS
  setPrompt(pdf)
  pdf.setFontSize(11)
  pdf.setTextColor(...BRAND)
  pdf.setCharSpace(0.5)
  pdf.text('★ COURSES & SKILLS', rightX, y)
  pdf.setCharSpace(0)
  y += 6

  for (const c of data.courses) {
    if (y > A4_H - 40) break
    setSarabun(pdf, 'bold')
    pdf.setFontSize(10)
    pdf.setTextColor(...TEXT)
    pdf.text(c.courseName, rightX, y)
    setSarabun(pdf, 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(...GREY)
    pdf.text(`${c.attendedHours} / ${c.totalHours} hrs`, rightX + rightW, y, { align: 'right' })
    y += 2
    const pct = c.totalHours > 0 ? Math.min(1, c.attendedHours / c.totalHours) : 0
    pdf.setFillColor(243, 244, 246)
    pdf.roundedRect(rightX, y, rightW, 2, 1, 1, 'F')
    if (pct > 0) {
      pdf.setFillColor(...BRAND)
      pdf.roundedRect(rightX, y, rightW * pct, 2, 1, 1, 'F')
    }
    y += 8
  }

  drawPageFooter(pdf, pageNum)
}

async function renderGalleryPages(
  pdf: jsPDF,
  sessions: PortfolioSessionWork[],
  startPageNum: number,
  imageMap: Map<string, LoadedImage>,
): Promise<number> {
  // Each card needs at least its hero image to render visually.
  const renderable = sessions.filter(
    (s) => s.hero && (s.hero.isVideo || imageMap.has(s.hero.url))
  )
  if (renderable.length === 0) return startPageNum

  const PER_PAGE = 2
  const totalPages = Math.ceil(renderable.length / PER_PAGE)
  let pageNum = startPageNum

  for (let p = 0; p < totalPages; p++) {
    pdf.addPage()
    drawSectionHeader(pdf, 'WORKS', `${p + 1} / ${totalPages}`)

    const headerY = 56
    const gap = 8
    const gridH = A4_H - headerY - 24
    const cardH = (gridH - gap) / 2

    const slice = renderable.slice(p * PER_PAGE, (p + 1) * PER_PAGE)
    slice.forEach((session, i) => {
      const y = headerY + i * (cardH + gap)
      drawSessionCard(pdf, session, MARGIN, y, A4_W - MARGIN * 2, cardH, imageMap)
    })

    drawPageFooter(pdf, pageNum)
    pageNum++
  }

  return pageNum
}

function drawSessionCard(
  pdf: jsPDF,
  session: PortfolioSessionWork,
  x: number, y: number, w: number, h: number,
  imageMap: Map<string, LoadedImage>,
) {
  const hasText = !!(session.description || session.feedback)

  // ── Media-forward card (no teacher comment) — full-bleed image + caption ──
  if (!hasText) {
    drawMediaCard(pdf, session, x, y, w, h, imageMap)
    return
  }

  // Card frame
  pdf.setFillColor(255, 255, 255)
  pdf.setDrawColor(...SOFT_BORDER)
  pdf.setLineWidth(0.3)
  pdf.roundedRect(x, y, w, h, 3.5, 3.5, 'FD')

  // Hero image takes the left 38%
  const heroW = w * 0.38
  const bodyX = x + heroW + 6
  const bodyW = w - heroW - 12

  // Hero box (dark background, contain)
  if (session.hero) {
    if (!session.hero.isVideo && imageMap.has(session.hero.url)) {
      const img = imageMap.get(session.hero.url)!
      // Inner padding to leave the rounded corner visible
      pdf.setFillColor(26, 26, 26)
      pdf.roundedRect(x + 3, y + 3, heroW - 3, h - 6, 2.5, 2.5, 'F')
      const ratio = Math.min((heroW - 7) / img.width, (h - 10) / img.height)
      const drawW = img.width * ratio
      const drawH = img.height * ratio
      const ix = x + 3 + (heroW - 3 - drawW) / 2
      const iy = y + 3 + (h - 6 - drawH) / 2
      pdf.addImage(img.dataUrl, imageFormat(img.dataUrl), ix, iy, drawW, drawH, undefined, 'FAST')
    } else {
      // Video placeholder
      pdf.setFillColor(26, 26, 26)
      pdf.roundedRect(x + 3, y + 3, heroW - 3, h - 6, 2.5, 2.5, 'F')
      pdf.setFillColor(255, 255, 255)
      pdf.circle(x + 3 + (heroW - 3) / 2, y + h / 2, 7, 'F')
      setPrompt(pdf)
      pdf.setFontSize(14)
      pdf.setTextColor(...BRAND)
      pdf.text('▶', x + 3 + (heroW - 3) / 2 + 0.5, y + h / 2 + 1.5, { align: 'center' })
    }

    // Project badge
    if (session.hasArtwork) {
      pdf.setFillColor(...BRAND)
      pdf.roundedRect(x + 7, y + 7, 22, 5.5, 1.2, 1.2, 'F')
      setSarabun(pdf, 'bold')
      pdf.setFontSize(6)
      pdf.setTextColor(255, 255, 255)
      pdf.setCharSpace(0.4)
      pdf.text('PROJECT', x + 18, y + 10.7, { align: 'center' })
      pdf.setCharSpace(0)
    }
  }

  // ── Body content ──
  let by = y + 8

  // Title row + stars
  setPrompt(pdf)
  pdf.setFontSize(13)
  pdf.setTextColor(...TEXT)
  const starsW = (session.rating ?? 0) > 0 ? 18 : 0
  const titleLines = wrap(pdf, session.title || 'Untitled', bodyW - starsW)
  pdf.text(titleLines.slice(0, 2), bodyX, by + 4)

  if ((session.rating ?? 0) > 0) {
    pdf.setFontSize(9)
    pdf.setTextColor(255, 180, 0)
    const stars = '★'.repeat(session.rating!) + '☆'.repeat(5 - session.rating!)
    pdf.text(stars, x + w - 5, by + 4, { align: 'right' })
  }

  by += Math.min(2, titleLines.length) * 5 + 3

  // Description
  if (session.description) {
    setSarabun(pdf, 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(...GREY)
    const lines = wrap(pdf, session.description, bodyW)
    pdf.text(lines.slice(0, 2), bodyX, by + 3)
    by += Math.min(2, lines.length) * 4.5 + 4
  }

  // Feedback (italic in soft box) — only if room
  if (session.feedback && by < y + h - 30) {
    const innerW = bodyW - 5
    setSarabun(pdf, 'normal')
    pdf.setFontSize(9)
    const fbLines = wrap(pdf, `"${session.feedback}"`, innerW)
    const fbVisible = fbLines.slice(0, 3)
    const fbH = fbVisible.length * 4.4 + 6

    pdf.setFillColor(...SOFT)
    pdf.roundedRect(bodyX, by, bodyW, fbH, 2, 2, 'F')
    pdf.setFillColor(...BRAND)
    pdf.rect(bodyX, by, 1.2, fbH, 'F')

    setSarabun(pdf, 'normal')
    pdf.setTextColor(...TEXT)
    pdf.text(fbVisible, bodyX + 4, by + 5)

    by += fbH + 4
  }

  // Thumbnails strip
  const thumbCount = Math.min(4, session.thumbnails.length)
  if (thumbCount > 0 && by < y + h - 24) {
    setSarabun(pdf, 'bold')
    pdf.setFontSize(7)
    pdf.setTextColor(...LIGHT)
    pdf.setCharSpace(0.4)
    pdf.text('MORE FROM THIS SESSION', bodyX, by + 2)
    pdf.setCharSpace(0)

    const thumbY = by + 4
    const thumbSize = 12
    const thumbGap = 2
    for (let i = 0; i < thumbCount; i++) {
      const t = session.thumbnails[i]
      const tx = bodyX + i * (thumbSize + thumbGap)
      pdf.setFillColor(26, 26, 26)
      pdf.roundedRect(tx, thumbY, thumbSize, thumbSize, 1.5, 1.5, 'F')
      if (!t.isVideo && imageMap.has(t.url)) {
        const img = imageMap.get(t.url)!
        const ratio = Math.min(thumbSize / img.width, thumbSize / img.height)
        const dw = img.width * ratio
        const dh = img.height * ratio
        pdf.addImage(
          img.dataUrl, imageFormat(img.dataUrl),
          tx + (thumbSize - dw) / 2, thumbY + (thumbSize - dh) / 2,
          dw, dh, undefined, 'FAST'
        )
      }
    }
    if (session.thumbnails.length > thumbCount) {
      const ox = bodyX + thumbCount * (thumbSize + thumbGap)
      pdf.setFillColor(...SOFT)
      pdf.roundedRect(ox, thumbY, thumbSize, thumbSize, 1.5, 1.5, 'F')
      setPrompt(pdf)
      pdf.setFontSize(8)
      pdf.setTextColor(...BRAND)
      pdf.text(
        `+${session.thumbnails.length - thumbCount}`,
        ox + thumbSize / 2, thumbY + thumbSize / 2 + 1.5,
        { align: 'center' }
      )
    }
  }

  // Meta line at the bottom of the card
  setSarabun(pdf, 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(...LIGHT)
  const meta = `${fmtDate(session.date)}  ·  ${session.courseName}` +
    (session.teacherName ? `  ·  with ${session.teacherName}` : '')
  pdf.text(meta, bodyX, y + h - 5)
}

/** Image-forward card for sessions with no teacher comment. Photos fill the
 *  card (hero + up to a small tile rail) with a dark caption strip at bottom —
 *  mirrors the web `.session-card--media` so there's no empty text column. */
function drawMediaCard(
  pdf: jsPDF,
  session: PortfolioSessionWork,
  x: number, y: number, w: number, h: number,
  imageMap: Map<string, LoadedImage>,
) {
  const r = 3.5
  // Build the tile list (hero + thumbnails), capped.
  const all = [session.hero, ...session.thumbnails].filter(Boolean) as { url: string; isVideo: boolean }[]
  const tiles = all.slice(0, 4)
  const overflow = all.length - tiles.length

  // Dark base
  pdf.setFillColor(26, 26, 26)
  pdf.roundedRect(x, y, w, h, r, r, 'F')

  const gap = 1.5
  // Layout: 1 tile → full; 2 → split; 3+ → big hero (left ~62%) + side rail.
  const rects: { tx: number; ty: number; tw: number; th: number; tile: typeof tiles[number] }[] = []
  if (tiles.length === 1) {
    rects.push({ tx: x, ty: y, tw: w, th: h, tile: tiles[0] })
  } else if (tiles.length === 2) {
    const cw = (w - gap) / 2
    rects.push({ tx: x, ty: y, tw: cw, th: h, tile: tiles[0] })
    rects.push({ tx: x + cw + gap, ty: y, tw: cw, th: h, tile: tiles[1] })
  } else {
    const heroW = w * 0.62
    const railX = x + heroW + gap
    const railW = w - heroW - gap
    rects.push({ tx: x, ty: y, tw: heroW, th: h, tile: tiles[0] })
    const rest = tiles.slice(1)
    const rh = (h - gap * (rest.length - 1)) / rest.length
    rest.forEach((t, i) => {
      rects.push({ tx: railX, ty: y + i * (rh + gap), tw: railW, th: rh, tile: t })
    })
  }

  // Draw each tile. Use contain (fitImage) on a dark background — jsPDF has no
  // easy clip, so cover-overscale would bleed into neighbouring tiles.
  rects.forEach((rc, idx) => {
    if (!rc.tile.isVideo && imageMap.has(rc.tile.url)) {
      const img = imageMap.get(rc.tile.url)!
      fitImage(pdf, img, rc.tx, rc.ty, rc.tw, rc.th, [26, 26, 26])
    } else if (rc.tile.isVideo) {
      pdf.setFillColor(15, 15, 15)
      pdf.rect(rc.tx, rc.ty, rc.tw, rc.th, 'F')
      pdf.setFillColor(255, 255, 255)
      pdf.circle(rc.tx + rc.tw / 2, rc.ty + rc.th / 2, 5, 'F')
      setPrompt(pdf)
      pdf.setFontSize(11)
      pdf.setTextColor(...BRAND)
      pdf.text('▶', rc.tx + rc.tw / 2 + 0.4, rc.ty + rc.th / 2 + 1.2, { align: 'center' })
    }
    // Overflow badge on the last tile
    if (idx === rects.length - 1 && overflow > 0) {
      pdf.setFillColor(0, 0, 0)
      pdf.setGState(pdf.GState({ opacity: 0.55 }))
      pdf.rect(rc.tx, rc.ty, rc.tw, rc.th, 'F')
      pdf.setGState(pdf.GState({ opacity: 1 }))
      setPrompt(pdf)
      pdf.setFontSize(14)
      pdf.setTextColor(255, 255, 255)
      pdf.text(`+${overflow}`, rc.tx + rc.tw / 2, rc.ty + rc.th / 2 + 2, { align: 'center' })
    }
  })

  // Caption gradient bar (approximated with a solid translucent band)
  const capH = 20
  pdf.setFillColor(0, 0, 0)
  pdf.setGState(pdf.GState({ opacity: 0.55 }))
  pdf.rect(x, y + h - capH, w, capH, 'F')
  pdf.setGState(pdf.GState({ opacity: 1 }))

  let cy = y + h - capH + 7
  if (session.hasArtwork) {
    pdf.setFillColor(...BRAND)
    pdf.roundedRect(x + 5, y + h - capH + 3, 22, 5.5, 1.2, 1.2, 'F')
    setSarabun(pdf, 'bold')
    pdf.setFontSize(6)
    pdf.setTextColor(255, 255, 255)
    pdf.setCharSpace(0.4)
    pdf.text('PROJECT', x + 16, y + h - capH + 6.7, { align: 'center' })
    pdf.setCharSpace(0)
    cy = y + h - capH + 13
  }

  // Title
  setPrompt(pdf)
  pdf.setFontSize(12)
  pdf.setTextColor(255, 255, 255)
  const title = wrap(pdf, session.title || 'Untitled', w - 12)[0] || ''
  pdf.text(title, x + 5, cy)

  // Stars (right)
  if ((session.rating ?? 0) > 0) {
    pdf.setFontSize(9)
    pdf.setTextColor(255, 180, 0)
    const stars = '★'.repeat(session.rating!) + '☆'.repeat(5 - session.rating!)
    pdf.text(stars, x + w - 5, cy, { align: 'right' })
  }

  // Meta line
  setSarabun(pdf, 'normal')
  pdf.setFontSize(7.5)
  pdf.setTextColor(220, 220, 220)
  const meta = `${fmtDate(session.date)}  ·  ${session.courseName}` +
    (session.teacherName ? `  ·  with ${session.teacherName}` : '')
  pdf.text(meta, x + 5, y + h - 4)
}

function renderCommentsPages(
  pdf: jsPDF,
  comments: PortfolioComment[],
  startPageNum: number,
): number {
  if (comments.length === 0) return startPageNum

  let pageNum = startPageNum
  pdf.addPage()
  drawSectionHeader(pdf, 'VOICES', 'TEACHER NOTES')

  setSarabun(pdf, 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(...GREY)
  let y = 54
  const intro = wrap(
    pdf,
    `Notes and observations from teachers across every session.`,
    A4_W - MARGIN * 2
  )
  intro.forEach((line, i) => pdf.text(line, MARGIN, y + i * 5))
  y += intro.length * 5 + 6

  // 2-column layout
  const colGap = 6
  const colW = (A4_W - MARGIN * 2 - colGap) / 2
  const cols: number[] = [y, y]  // current Y for each column
  let currentColIdx = 0

  for (const c of comments) {
    setSarabun(pdf, 'normal')
    pdf.setFontSize(10)
    const innerW = colW - 14
    const lines = c.text
      ? wrap(pdf, `"${c.text}"`, innerW)
      : ['(rated this session highly)']
    const linesH = lines.length * 5.2
    const cardH = 12 + (c.rating ? 6 : 0) + linesH + 14

    // Pick the column with smaller Y
    const idx = cols[0] <= cols[1] ? 0 : 1
    if (cols[idx] + cardH > A4_H - 22) {
      // Need new page
      drawPageFooter(pdf, pageNum)
      pageNum++
      pdf.addPage()
      drawSectionHeader(pdf, 'VOICES', 'TEACHER NOTES (cont.)')
      cols[0] = 54
      cols[1] = 54
    }

    const colIdx = cols[0] <= cols[1] ? 0 : 1
    const cx = MARGIN + colIdx * (colW + colGap)
    const cy = cols[colIdx]

    // Card body
    pdf.setFillColor(...SOFT)
    pdf.roundedRect(cx, cy, colW, cardH, 4, 4, 'F')
    pdf.setFillColor(...BRAND)
    pdf.rect(cx, cy, 1.5, cardH, 'F')

    let inner = cy + 8
    // Stars
    if (c.rating && c.rating > 0) {
      pdf.setFontSize(10)
      pdf.setTextColor(255, 180, 0)
      pdf.text('★'.repeat(c.rating) + '☆'.repeat(5 - c.rating), cx + 7, inner)
      inner += 6
    }
    // Text
    setSarabun(pdf, 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(...TEXT)
    lines.forEach((line, i) => pdf.text(line, cx + 7, inner + i * 5.2))
    inner += linesH + 4

    // Byline
    setSarabun(pdf, 'bold')
    pdf.setFontSize(8)
    pdf.setTextColor(...BRAND)
    const byline = `— ${c.teacherName || 'Teacher'}${c.topic ? `  ·  ${c.topic}` : ''}`
    pdf.text(byline, cx + 7, inner)
    setSarabun(pdf, 'normal')
    pdf.setTextColor(...LIGHT)
    pdf.text(fmtDate(c.date), cx + colW - 4, inner, { align: 'right' })

    cols[colIdx] = cy + cardH + 5
    currentColIdx = colIdx
  }

  drawPageFooter(pdf, pageNum)
  return pageNum + 1
}

function renderClosingPage(pdf: jsPDF, data: PortfolioData, pageNum: number) {
  pdf.addPage()
  drawSectionHeader(pdf, 'THANK YOU')

  const cx = A4_W / 2
  const cy = 130

  // Sparkle badge
  pdf.setFillColor(...BRAND)
  pdf.roundedRect(cx - 18, cy - 18, 36, 36, 8, 8, 'F')
  setPrompt(pdf)
  pdf.setFontSize(38)
  pdf.setTextColor(255, 255, 255)
  pdf.text('★', cx, cy + 8, { align: 'center' })

  const name = data.student.nickname || data.student.name
  setPrompt(pdf)
  pdf.setFontSize(28)
  pdf.setTextColor(...TEXT)
  pdf.text(`Keep building, ${name}!`, cx, cy + 36, { align: 'center' })

  setSarabun(pdf, 'normal')
  pdf.setFontSize(11)
  pdf.setTextColor(...GREY)
  const closing = wrap(
    pdf,
    `This portfolio is a living record of your journey at BOROT Academy. New work is added automatically as you attend more classes — come back to see how far you've come.`,
    A4_W - MARGIN * 4
  )
  closing.forEach((line, i) => pdf.text(line, cx, cy + 50 + i * 6, { align: 'center' }))

  setSarabun(pdf, 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(...BRAND)
  pdf.text('www.borot.co.th   ·   hello@borot.co.th', cx, cy + 80, { align: 'center' })

  // Closing footer band
  pdf.setDrawColor(...BRAND)
  pdf.setLineWidth(2)
  pdf.line(MARGIN, A4_H - 24, A4_W - MARGIN, A4_H - 24)
  setPrompt(pdf)
  pdf.setFontSize(14)
  pdf.setTextColor(...BRAND)
  pdf.text('BOROT', MARGIN, A4_H - 16)
  setSarabun(pdf, 'bold')
  pdf.setFontSize(7)
  pdf.setTextColor(...LIGHT)
  pdf.setCharSpace(0.4)
  pdf.text('ROBOTICS LEARNING PLATFORM', MARGIN, A4_H - 10)
  pdf.text('© BOROT Academy', A4_W - MARGIN, A4_H - 10, { align: 'right' })
  pdf.setCharSpace(0)
}

// ── Assessment pages (mirror the web ASSESSMENT + SKILLS pages) ──────────────

/** Draw a radar/spider chart of the skills, centred at (cx,cy) with radius R. */
function drawSkillRadar(
  pdf: jsPDF,
  skills: { name: string; score: number }[],
  cx: number, cy: number, R: number,
) {
  const n = skills.length
  if (n < 3) return
  const angleAt = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180)
  const ptAt = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angleAt(i)),
    y: cy + radius * Math.sin(angleAt(i)),
  })

  // Concentric grid rings (20/40/60/80/100)
  pdf.setDrawColor(229, 213, 194)
  pdf.setLineWidth(0.2)
  for (let ring = 1; ring <= 5; ring++) {
    const rr = (R * ring) / 5
    for (let i = 0; i < n; i++) {
      const a = ptAt(i, rr)
      const b = ptAt((i + 1) % n, rr)
      pdf.line(a.x, a.y, b.x, b.y)
    }
  }
  // Spokes
  for (let i = 0; i < n; i++) {
    const p = ptAt(i, R)
    pdf.line(cx, cy, p.x, p.y)
  }

  // Data polygon
  const pts = skills.map((s, i) => ptAt(i, (Math.max(0, Math.min(100, s.score)) / 100) * R))
  pdf.setFillColor(...BRAND)
  pdf.setDrawColor(...BRAND)
  pdf.setLineWidth(0.8)
  try {
    pdf.setGState(pdf.GState({ opacity: 0.35 }))
    // Build a closed path via lines() with relative deltas
    const deltas: [number, number][] = []
    for (let i = 1; i < pts.length; i++) {
      deltas.push([pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y])
    }
    deltas.push([pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y])
    pdf.lines(deltas, pts[0].x, pts[0].y, [1, 1], 'F', true)
    pdf.setGState(pdf.GState({ opacity: 1 }))
    pdf.lines(deltas, pts[0].x, pts[0].y, [1, 1], 'S', true)
  } catch {
    pdf.setGState(pdf.GState({ opacity: 1 }))
  }
  // Vertex dots
  pdf.setFillColor(...BRAND)
  pts.forEach((p) => pdf.circle(p.x, p.y, 0.9, 'F'))

  // Axis labels
  setSarabun(pdf, 'bold')
  pdf.setFontSize(8)
  pdf.setTextColor(...TEXT)
  skills.forEach((s, i) => {
    const lp = ptAt(i, R + 8)
    const a = angleAt(i)
    const align = Math.cos(a) > 0.25 ? 'left' : Math.cos(a) < -0.25 ? 'right' : 'center'
    pdf.text(s.name, lp.x, lp.y + 1, { align: align as any })
  })
}

/** Single A4 SUMMARY page: student-info header, AI summary, radar (left, abbr
 *  axes) + skill bars "Name (ABBR)" with short reasons (right), strengths/growth
 *  + recommendation at the bottom. */
function renderSummaryPage(pdf: jsPDF, data: PortfolioData, pageNum: number): number {
  const a = data.assessment
  if (!a) return pageNum
  pdf.addPage()
  let y = drawSectionHeader(pdf, 'SUMMARY', 'STUDENT PROFILE & ASSESSMENT')
  const fullW = A4_W - MARGIN * 2

  // ── Student info header band ──
  {
    const s = data.student
    const initial = (s.nickname?.[0] || s.name?.[0] || '?').toUpperCase()
    const works = data.stats.photoCount + data.stats.artworkCount + data.stats.videoCount
    const courseNames: string[] = []
    for (const c of data.courses) if (!courseNames.includes(c.courseName)) courseNames.push(c.courseName)

    const bandH = 22
    pdf.setFillColor(...SOFT)
    pdf.roundedRect(MARGIN, y, fullW, bandH, 3, 3, 'F')
    // Avatar
    pdf.setFillColor(...BRAND)
    pdf.roundedRect(MARGIN + 3, y + 3, 16, 16, 2.5, 2.5, 'F')
    setPrompt(pdf)
    pdf.setFontSize(14)
    pdf.setTextColor(255, 255, 255)
    pdf.text(initial, MARGIN + 11, y + 13.5, { align: 'center' })
    // Name + nickname
    const idX = MARGIN + 23
    setPrompt(pdf)
    pdf.setFontSize(13)
    pdf.setTextColor(...TEXT)
    const nameStr = (s.name || 'Unnamed') + (s.nickname ? `  (${s.nickname})` : '')
    pdf.text(nameStr, idX, y + 9)
    // Course names line
    setSarabun(pdf, 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(...GREY)
    const coursesStr = courseNames.length ? courseNames.join('  ·  ') : 'No courses yet'
    pdf.text(wrap(pdf, coursesStr, fullW * 0.5).slice(0, 1), idX, y + 15.5)
    // Stats trio on the right
    const stat = (v: string, l: string, cx: number) => {
      setPrompt(pdf); pdf.setFontSize(13); pdf.setTextColor(...BRAND)
      pdf.text(v, cx, y + 10, { align: 'center' })
      setSarabun(pdf, 'bold'); pdf.setFontSize(6); pdf.setTextColor(...GREY)
      pdf.setCharSpace(0.3); pdf.text(l, cx, y + 15, { align: 'center' }); pdf.setCharSpace(0)
    }
    stat(String(data.stats.totalAttendedHours), 'HOURS', A4_W - MARGIN - 42)
    stat(String(data.stats.attendedSessions), 'SESSIONS', A4_W - MARGIN - 24)
    stat(String(works), 'WORKS', A4_W - MARGIN - 8)
    y += bandH + 6
  }

  // Summary box (compact — 3 lines max)
  if (a.summary) {
    setSarabun(pdf, 'normal')
    pdf.setFontSize(9.5)
    const lines = wrap(pdf, a.summary, fullW - 12).slice(0, 3)
    const boxH = lines.length * 4.6 + 8
    pdf.setFillColor(...SOFT)
    pdf.roundedRect(MARGIN, y, fullW, boxH, 2.5, 2.5, 'F')
    pdf.setFillColor(...BRAND)
    pdf.rect(MARGIN, y, 1.4, boxH, 'F')
    pdf.setTextColor(...TEXT)
    pdf.text(lines, MARGIN + 6, y + 6)
    y += boxH + 7
  }

  // ── Left radar / right skill bars ──
  const colGap = 8
  const leftW = fullW * 0.42
  const rightX = MARGIN + leftW + colGap
  const rightW = fullW - leftW - colGap
  const blockTop = y
  const blockH = 100

  // Radar centred in the left column — abbreviated axis labels
  const radarR = Math.min(leftW, blockH) / 2 - 12
  drawSkillRadar(
    pdf,
    a.skills.map((s) => ({ name: abbrFor(s.key), score: s.score })),
    MARGIN + leftW / 2,
    blockTop + blockH / 2,
    radarR,
  )

  // Skill bars + 2-line reason on the right ("Name (ABBR)")
  let ry = blockTop + 2
  const rowH = blockH / a.skills.length
  for (const s of a.skills) {
    const score = Math.max(0, Math.min(100, s.score))
    setPrompt(pdf)
    pdf.setFontSize(9)
    pdf.setTextColor(...TEXT)
    pdf.text(`${s.name} (${abbrFor(s.key)})`, rightX, ry)
    pdf.setFontSize(9.5)
    pdf.setTextColor(...BRAND)
    pdf.text(`${score}/100`, rightX + rightW, ry, { align: 'right' })
    // Track + fill
    const trackY = ry + 1.6
    pdf.setFillColor(243, 244, 246)
    pdf.roundedRect(rightX, trackY, rightW, 2, 1, 1, 'F')
    pdf.setFillColor(...BRAND)
    pdf.roundedRect(rightX, trackY, (rightW * score) / 100, 2, 1, 1, 'F')
    // Reason (max 2 lines)
    if (s.reason) {
      setSarabun(pdf, 'normal')
      pdf.setFontSize(7.5)
      pdf.setTextColor(...GREY)
      const ls = wrap(pdf, s.reason, rightW).slice(0, 2)
      pdf.text(ls, rightX, trackY + 4.5)
    }
    ry += rowH
  }
  y = blockTop + blockH + 6

  // Strengths / Growth columns
  const colW = (fullW - 10) / 2
  const drawList = (title: string, items: string[], x: number) => {
    setPrompt(pdf)
    pdf.setFontSize(10)
    pdf.setTextColor(...BRAND)
    pdf.text(title, x, y)
    setSarabun(pdf, 'normal')
    pdf.setFontSize(8.5)
    pdf.setTextColor(...TEXT)
    let ly = y + 5
    items.slice(0, 3).forEach((t) => {
      const ls = wrap(pdf, `•  ${t}`, colW)
      pdf.text(ls, x, ly)
      ly += ls.length * 4 + 1.5
    })
    return ly
  }
  if (a.strengths.length || a.growthAreas.length) {
    const ay = y
    const y1 = drawList('STRENGTHS', a.strengths, MARGIN)
    y = ay
    const y2 = drawList('GROWTH AREAS', a.growthAreas, MARGIN + colW + 10)
    y = Math.max(y1, y2) + 5
  }

  // Recommendation
  if (a.recommendation) {
    setSarabun(pdf, 'normal')
    pdf.setFontSize(9.5)
    const lines = wrap(pdf, a.recommendation, fullW - 12)
    const boxH = lines.length * 4.6 + 11
    pdf.setFillColor(255, 244, 232)
    pdf.roundedRect(MARGIN, y, fullW, boxH, 2.5, 2.5, 'F')
    setSarabun(pdf, 'bold')
    pdf.setFontSize(7)
    pdf.setTextColor(...BRAND)
    pdf.setCharSpace(0.4)
    pdf.text('RECOMMENDED NEXT STEP', MARGIN + 6, y + 6)
    pdf.setCharSpace(0)
    setSarabun(pdf, 'normal')
    pdf.setFontSize(9.5)
    pdf.setTextColor(...TEXT)
    pdf.text(lines, MARGIN + 6, y + 10.5)
  }

  drawPageFooter(pdf, pageNum)
  return pageNum + 1
}

// ── Public entry ────────────────────────────────────────────────────────────

export async function generatePortfolioPdf(data: PortfolioData): Promise<string> {
  const { default: jsPDFCtor } = await import('jspdf')
  const pdf: jsPDF = new jsPDFCtor({ unit: 'mm', format: 'a4', orientation: 'portrait' })

  const fonts = await loadFonts()
  if (fonts) registerFonts(pdf, fonts)
  // Default font for the whole document
  setSarabun(pdf, 'normal')

  const sessions = flattenSessions(data)
  const comments = flattenComments(data)

  // Collect every distinct image URL we'll need (hero + thumbs across sessions)
  const urls = new Set<string>()
  for (const s of sessions) {
    if (s.hero && !s.hero.isVideo) urls.add(s.hero.url)
    for (const t of s.thumbnails) {
      if (!t.isVideo) urls.add(t.url)
    }
  }
  const loaded = await Promise.all(
    Array.from(urls).map(async (url) => [url, await loadImage(url)] as const)
  )
  const imageMap = new Map<string, LoadedImage>()
  for (const [url, img] of loaded) if (img) imageMap.set(url, img)

  // Pages
  renderCoverPage(pdf, data)

  // SUMMARY page (student info + assessment) replaces ABOUT when an assessment
  // exists; otherwise fall back to the ABOUT page.
  if (data.assessment) {
    renderSummaryPage(pdf, data, 2)
  } else {
    pdf.addPage()
    renderAboutPage(pdf, data, 2)
  }

  let nextPage = 3
  nextPage = await renderGalleryPages(pdf, sessions, nextPage, imageMap)
  nextPage = renderCommentsPages(pdf, comments, nextPage)
  renderClosingPage(pdf, data, nextPage)

  const safeName = (data.student.name || 'student')
    .replace(/[^a-zA-Z0-9ก-๙ _-]+/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 40) || 'student'
  const dateStr = new Date().toISOString().slice(0, 10)
  const fileName = `${safeName}_portfolio_${dateStr}.pdf`
  pdf.save(fileName)
  return fileName
}
