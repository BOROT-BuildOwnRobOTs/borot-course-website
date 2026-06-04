"use client"

import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Loader2, Star, Download, Share2, Link2, Copy, Check, X, Trash2,
  Quote, Sparkles, User, Calendar, Trophy, Palette,
  Image as ImageIcon, Video as VideoIcon, Play, Mail, Globe,
  Brain, TrendingUp, Lightbulb, Compass,
} from "lucide-react"
import {
  flattenWorks,
  flattenSessions,
  flattenComments,
  listCourseNames,
  abbrFor,
  type PortfolioData,
  type PortfolioWork,
  type PortfolioSessionWork,
  type PortfolioComment,
  type PortfolioAssessment,
} from "@/lib/portfolio-types"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"

interface Props {
  studentId: string
  fetchUrl?: string
  canManageShare?: boolean
  embedded?: boolean
}

const BRAND = "#E5690D"
const BRAND_LIGHT = "#FF8C00"

function formatDate(iso: string): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export default function StudentPortfolio({
  studentId,
  fetchUrl,
  canManageShare = false,
}: Props) {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<PortfolioWork | null>(null)

  // Share / PDF state
  const [shareOpen, setShareOpen] = useState(false)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [shareLoading, setShareLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  // Assessment generation state
  const [assessError, setAssessError] = useState<string | null>(null)
  const [assessHint, setAssessHint] = useState<string | null>(null)

  const url = fetchUrl ?? `/api/portfolio?studentId=${studentId}`

  // Load the portfolio. For the owner/admin we ALSO (re)generate the assessment
  // up front and only reveal the portfolio once it's done, so the assessment
  // page is always present on first render. The public/share view skips this —
  // it renders immediately with whatever assessment is cached, never calling the
  // GPU.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const pRes = await fetch(url)
        const pJson = await pRes.json()
        if (cancelled) return
        if (!pJson.success) {
          setError(pJson.error || "Failed to load portfolio")
          return
        }
        let portfolio = pJson.data

        if (canManageShare) {
          // Generate fresh from the just-collected data before revealing.
          try {
            const aRes = await fetch("/api/portfolio/assessment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ studentId }),
            })
            const aJson = await aRes.json()
            if (!cancelled) {
              if (aJson.success && aJson.data) {
                portfolio = { ...portfolio, assessment: aJson.data }
              } else if (aJson.notEnoughData) {
                setAssessHint(aJson.error || "Add 1 photo or project and 1 teacher comment to unlock the assessment.")
              } else {
                setAssessError(aJson.error || "Could not generate assessment")
              }
            }
          } catch (e: any) {
            if (!cancelled) setAssessError(e?.message || "Assessment network error")
          }
        }

        if (!cancelled) setData(portfolio)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Network error")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [url, canManageShare, studentId])

  useEffect(() => {
    if (!shareOpen || !canManageShare) return
    fetch(`/api/portfolio/share?studentId=${studentId}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setShareToken(j.token) })
  }, [shareOpen, canManageShare, studentId])

  const works = useMemo(() => (data ? flattenWorks(data) : []), [data])
  const sessionWorks = useMemo(() => (data ? flattenSessions(data) : []), [data])
  const comments = useMemo(() => (data ? flattenComments(data) : []), [data])
  const courseNames = useMemo(() => (data ? listCourseNames(data) : []), [data])

  // 2 sessions per page works better for the new richer card layout
  const galleryPages = useMemo(() => chunkArray(sessionWorks, 2), [sessionWorks])
  const commentsPages = useMemo(() => chunkArray(comments, 4), [comments])

  const shareUrl = useMemo(() => {
    if (!shareToken || typeof window === "undefined") return ""
    return `${window.location.origin}/portfolio/share/${shareToken}`
  }, [shareToken])

  const handleCreateShare = async () => {
    setShareLoading(true)
    try {
      const res = await fetch("/api/portfolio/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action: "create" }),
      })
      const j = await res.json()
      if (j.success) setShareToken(j.token)
    } finally { setShareLoading(false) }
  }
  const handleRevokeShare = async () => {
    if (!confirm("Revoke this share link? Anyone holding it will lose access.")) return
    setShareLoading(true)
    try {
      const res = await fetch("/api/portfolio/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action: "revoke" }),
      })
      const j = await res.json()
      if (j.success) setShareToken(null)
    } finally { setShareLoading(false) }
  }
  const handleCopy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  const handleDownloadPdf = async () => {
    if (!data) return
    setGeneratingPdf(true)
    try {
      const { generatePortfolioPdf } = await import("@/lib/portfolio-pdf")
      await generatePortfolioPdf(data)
    } catch (e) {
      console.error(e)
      alert("Could not generate PDF — please try again.")
    } finally {
      setGeneratingPdf(false)
    }
  }

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">
          {canManageShare ? "Preparing portfolio & assessment…" : "Loading portfolio…"}
        </p>
        {canManageShare && (
          <p className="text-xs text-gray-400">Analyzing learning data — this can take up to 2 minutes.</p>
        )}
      </div>
    )
  }
  if (error) {
    return (
      <div className="py-16 text-center">
        <X className="h-10 w-10 mx-auto mb-2 text-red-400" />
        <p className="text-sm font-semibold text-red-500">Could not load portfolio</p>
        <p className="text-xs mt-1 text-muted-foreground">{error}</p>
      </div>
    )
  }
  if (!data) return null

  const { student, stats } = data

  // Build the page list. Each entry corresponds to one .a4 page rendered both
  // on the web and in the PDF.
  const pages: { kind: 'cover' | 'about' | 'summary' | 'gallery' | 'comments' | 'closing'; payload?: any }[] = [
    { kind: 'cover' },
    // When an assessment exists, the SUMMARY page merges student info + skills
    // and replaces the standalone ABOUT page. Otherwise fall back to ABOUT so the
    // portfolio still has an intro page.
    data.assessment ? { kind: 'summary', payload: data.assessment } : { kind: 'about' },
    ...galleryPages.map((works) => ({ kind: 'gallery' as const, payload: works })),
    ...commentsPages.map((cs) => ({ kind: 'comments' as const, payload: cs })),
    { kind: 'closing' },
  ]

  return (
    <div className="portfolio-shell">
      {/* Sticky action bar — desktop floats top right, mobile sticks below header */}
      <div className="action-bar" data-pdf-hide>
        <div className="action-bar-inner">
          <div className="action-bar-meta">
            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
              {student.name}'s Portfolio
            </p>
            <p className="text-[10px] text-gray-400">{pages.length} pages · A4</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              size="sm"
              className="gap-1.5 text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})` }}
            >
              {generatingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{generatingPdf ? "Preparing…" : "Download PDF"}</span>
            </Button>
            {canManageShare && (
              <Button onClick={() => setShareOpen(true)} size="sm" variant="outline" className="gap-1.5">
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            )}
          </div>
        </div>
        {assessError && (
          <div className="action-bar-error" data-pdf-hide>
            {assessError}
          </div>
        )}
        {assessHint && !assessError && (
          <div className="action-bar-hint" data-pdf-hide>
            {assessHint}
          </div>
        )}
      </div>

      {/* The book — a column of A4 pages */}
      <div className="book">
        {pages.map((page, idx) => {
          const pageNum = idx + 1
          if (page.kind === 'cover') {
            return <CoverPage key={idx} student={student} stats={stats} />
          }
          if (page.kind === 'about') {
            return <AboutPage key={idx} student={student} stats={stats} courses={courseNames} courseStats={data.courses} pageNum={pageNum} />
          }
          if (page.kind === 'summary') {
            return <SummaryPage key={idx} assessment={page.payload as PortfolioAssessment} student={student} stats={stats} courses={courseNames} pageNum={pageNum} />
          }
          if (page.kind === 'gallery') {
            return (
              <GalleryPage
                key={idx}
                sessions={page.payload as PortfolioSessionWork[]}
                pageNum={pageNum}
                onMediaClick={(media, session) => setLightbox({
                  id: media.url,
                  kind: media.isVideo ? "video" : "photo",
                  url: media.url,
                  title: session.title,
                  description: session.description,
                  date: session.date,
                  courseName: session.courseName,
                  teacherName: session.teacherName,
                  rating: session.rating,
                })}
              />
            )
          }
          if (page.kind === 'comments') {
            return (
              <CommentsPage
                key={idx}
                comments={page.payload as PortfolioComment[]}
                pageNum={pageNum}
              />
            )
          }
          return <ClosingPage key={idx} student={student} pageNum={pageNum} />
        })}
      </div>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o) => { if (!o) setLightbox(null) }}>
        <DialogContent
          className="bg-transparent border-none shadow-none p-0 max-w-[95vw] gap-0 [&>button]:hidden"
          showCloseButton={false}
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">{lightbox?.title || "Preview"}</DialogTitle>
          {lightbox && (
            <div className="relative">
              <div className="bg-black rounded-2xl overflow-hidden flex items-center justify-center" style={{ minHeight: "60vh" }}>
                {lightbox.kind === "video" ? (
                  <video src={lightbox.url} controls autoPlay className="max-w-[95vw] max-h-[80vh]" />
                ) : (
                  <img src={lightbox.url} alt={lightbox.title} className="max-w-[95vw] max-h-[80vh] object-contain" />
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 to-transparent rounded-b-2xl">
                <p className="text-white text-lg font-bold">{lightbox.title}</p>
                <p className="text-white/70 text-sm mt-1">
                  {formatDate(lightbox.date)} · {lightbox.courseName}
                  {lightbox.teacherName && ` · with ${lightbox.teacherName}`}
                </p>
                {lightbox.description && (
                  <p className="text-white/90 text-sm mt-2 leading-relaxed max-w-2xl">
                    {lightbox.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white shadow-lg"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" style={{ color: BRAND }} />
              Share {student.nickname || student.name}'s Portfolio
            </DialogTitle>
            <DialogDescription>
              Anyone with this link can view the portfolio without logging in.
            </DialogDescription>
          </DialogHeader>
          {shareToken ? (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">Share link</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent text-xs font-mono truncate outline-none"
                    onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 shrink-0">
                    {copied ? <><Check className="h-3.5 w-3.5 text-green-600" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline flex items-center gap-1" style={{ color: BRAND }}>
                  <Link2 className="h-3 w-3" />
                  Open in new tab
                </a>
                <Button type="button" size="sm" variant="ghost" onClick={handleRevokeShare} disabled={shareLoading} className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" />
                  Revoke link
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No share link exists yet. Generate one to share publicly.
              </p>
              <Button
                onClick={handleCreateShare}
                disabled={shareLoading}
                className="w-full gap-2 text-white"
                style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)` }}
              >
                {shareLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Generate share link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PortfolioStyles />
    </div>
  )
}

// ─── Pages ───────────────────────────────────────────────────────────────────

function CoverPage({
  student,
  stats,
}: {
  student: PortfolioData["student"]
  stats: PortfolioData["stats"]
}) {
  const initial = (student.nickname?.[0] || student.name?.[0] || "B").toUpperCase()
  const totalWorks = stats.photoCount + stats.artworkCount + stats.videoCount
  return (
    <article className="a4 cover-page">
      <div className="cover-bar" />

      <div className="cover-stack">
        <p className="cover-eyebrow">A collection of <em>works</em></p>
        <h1 className="cover-title">PORTFOLIO</h1>
        <p className="cover-subtitle">{student.nickname || student.name}</p>
      </div>

      <div className="cover-hero">
        <div className="cover-hero-blob cover-hero-blob--peach" />
        <div className="cover-hero-blob cover-hero-blob--orange" />
        <div className="cover-hero-circle">
          {initial}
          <span className="cover-hero-orbit cover-hero-orbit--big" />
          <span className="cover-hero-orbit cover-hero-orbit--small" />
        </div>
      </div>

      <div className="cover-stats">
        <CoverStat value={totalWorks} label="WORKS" />
        <span className="cover-stats-divider" />
        <CoverStat value={stats.totalAttendedHours} label="HOURS" />
        <span className="cover-stats-divider" />
        <CoverStat value={stats.totalCourses} label="COURSES" />
      </div>

      <footer className="cover-footer">
        <div>
          <p className="cover-brand">BOROT</p>
          <p className="cover-brand-sub">ROBOTICS · ENGINEERING · 3D DESIGN</p>
        </div>
        <p className="cover-website">www.borot.co.th</p>
      </footer>
    </article>
  )
}

function CoverStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="cover-stat">
      <p className="cover-stat-value">{value}</p>
      <p className="cover-stat-label">{label}</p>
    </div>
  )
}

function AboutPage({
  student,
  stats,
  courses,
  courseStats,
  pageNum,
}: {
  student: PortfolioData["student"]
  stats: PortfolioData["stats"]
  courses: string[]
  courseStats: PortfolioData["courses"]
  pageNum: number
}) {
  const initial = (student.nickname?.[0] || student.name?.[0] || "?").toUpperCase()
  const name = student.nickname || student.name || "This student"
  const works = stats.photoCount + stats.artworkCount + stats.videoCount
  // Display bio uses an italic accent for the headline phrase. Plain text is
  // generated from the same template for the PDF on the server.

  return (
    <article className="a4 inner-page">
      <SectionHeader label="ABOUT ME" />

      <div className="about-grid">
        <div className="about-left">
          <div className="about-avatar">{initial}</div>
          <div className="about-meta">
            <MetaRow icon={<User />} label="Name" value={student.name || "—"} />
            {student.nickname && <MetaRow icon={<Sparkles />} label="Nickname" value={student.nickname} />}
            {student.age != null && <MetaRow icon={<Calendar />} label="Age" value={`${student.age} years`} />}
            <MetaRow icon={<Trophy />} label="Studio" value={`${stats.totalAttendedHours} hours`} />
          </div>
        </div>

        <div className="about-right">
          <div>
            <h3 className="about-h3">★ ABOUT</h3>
            <p className="about-bio">
              {name} is a <strong>young engineer</strong> at BOROT Academy.
              Across {stats.totalCourses} {stats.totalCourses === 1 ? "course" : "courses"},
              they have attended {stats.attendedSessions} sessions and produced {works}{" "}
              pieces of work — exploring robotics, programming, and 3D design through hands-on building.
            </p>
          </div>

          <div>
            <h3 className="about-h3">★ AT A GLANCE</h3>
            <div className="about-cards">
              <AboutCard icon="🎨" value={stats.artworkCount} label="Projects" />
              <AboutCard icon="📷" value={stats.photoCount} label="Photos" />
              <AboutCard icon="🎬" value={stats.videoCount} label="Videos" />
              <AboutCard icon="⏱" value={`${stats.totalAttendedHours}h`} label="Studio time" />
            </div>
          </div>

          <div>
            <h3 className="about-h3">★ COURSES & SKILLS</h3>
            <div className="about-skills">
              {courseStats.map((c) => {
                const pct = c.totalHours > 0
                  ? Math.min(100, Math.round((c.attendedHours / c.totalHours) * 100))
                  : 0
                return (
                  <div className="skill-row" key={`${c.courseId}-${c.startDate}`}>
                    <div className="skill-row-head">
                      <span className="skill-name">{c.courseName}</span>
                      <span className="skill-hours">{c.attendedHours} / {c.totalHours} hrs</span>
                    </div>
                    <div className="skill-track">
                      <div className="skill-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="about-h3">★ LANGUAGES</h3>
            <div className="languages">
              <span className="lang-chip">🇹🇭 Thai</span>
              <span className="lang-chip">🇬🇧 English</span>
            </div>
          </div>
        </div>
      </div>

      <PageFooter pageNum={pageNum} />
    </article>
  )
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="meta-row">
      <div className="meta-icon">{icon}</div>
      <div className="meta-text">
        <p className="meta-label">{label}</p>
        <p className="meta-value">{value}</p>
      </div>
    </div>
  )
}

function AboutCard({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <div className="about-card">
      <p className="about-card-icon">{icon}</p>
      <p className="about-card-value">{value}</p>
      <p className="about-card-label">{label}</p>
    </div>
  )
}

function SummaryPage({
  assessment,
  student,
  stats,
  courses,
  pageNum,
}: {
  assessment: PortfolioAssessment
  student: PortfolioData["student"]
  stats: PortfolioData["stats"]
  courses: string[]
  pageNum: number
}) {
  const initial = (student.nickname?.[0] || student.name?.[0] || "?").toUpperCase()
  const works = stats.photoCount + stats.artworkCount + stats.videoCount
  const radarData = assessment.skills.map((s) => ({
    skill: abbrFor(s.key),
    score: Math.max(0, Math.min(100, s.score)),
  }))
  return (
    <article className="a4 inner-page assessment-page">
      <SectionHeader label="SUMMARY" right="STUDENT PROFILE & ASSESSMENT" />

      {/* Student info header band */}
      <div className="sum-header">
        <div className="sum-avatar">{initial}</div>
        <div className="sum-id">
          <h2 className="sum-name">
            {student.name || "Unnamed"}
            {student.nickname && <span className="sum-nick"> ({student.nickname})</span>}
          </h2>
          <div className="sum-courses">
            {courses.length > 0
              ? courses.map((c) => <span key={c} className="sum-course-chip">{c}</span>)
              : <span className="sum-course-empty">No courses yet</span>}
          </div>
        </div>
        <div className="sum-stats">
          <div className="sum-stat"><span className="sum-stat-v">{stats.totalAttendedHours}</span><span className="sum-stat-l">HOURS</span></div>
          <div className="sum-stat"><span className="sum-stat-v">{stats.attendedSessions}</span><span className="sum-stat-l">SESSIONS</span></div>
          <div className="sum-stat"><span className="sum-stat-v">{works}</span><span className="sum-stat-l">WORKS</span></div>
        </div>
      </div>

      {assessment.summary && (
        <div className="assess-summary">
          <Brain className="assess-summary-icon" />
          <p>{assessment.summary}</p>
        </div>
      )}

      {/* Left: radar (abbr axes) · Right: skill bars "Name (ABBR)" + short reason */}
      <div className="assess-main">
        <div className="assess-radar">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e5d5c2" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 700 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={5} tick={{ fontSize: 7, fill: "#c0a890" }} />
              <Radar name="Skills" dataKey="score" stroke={BRAND} fill={BRAND} fillOpacity={0.35} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="assess-skills">
          {assessment.skills.map((s) => (
            <div className="assess-skill" key={s.key}>
              <div className="skill-row-head">
                <span className="skill-name">{s.name} <span className="skill-abbr">({abbrFor(s.key)})</span></span>
                <span className="assess-score">{s.score}<span className="assess-score-max">/100</span></span>
              </div>
              <div className="skill-track">
                <div className="skill-fill" style={{ width: `${Math.max(0, Math.min(100, s.score))}%` }} />
              </div>
              {s.reason && <p className="assess-reason">{s.reason}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="assess-cols">
        {assessment.strengths.length > 0 && (
          <div className="assess-col">
            <h3 className="about-h3"><Lightbulb className="assess-col-icon" /> STRENGTHS</h3>
            <ul className="assess-list">
              {assessment.strengths.slice(0, 3).map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}
        {assessment.growthAreas.length > 0 && (
          <div className="assess-col">
            <h3 className="about-h3"><TrendingUp className="assess-col-icon" /> GROWTH AREAS</h3>
            <ul className="assess-list">
              {assessment.growthAreas.slice(0, 3).map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}
      </div>

      {assessment.recommendation && (
        <div className="assess-reco">
          <Compass className="assess-reco-icon" />
          <div>
            <p className="assess-reco-label">RECOMMENDED NEXT STEP</p>
            <p className="assess-reco-text">{assessment.recommendation}</p>
          </div>
        </div>
      )}

      <PageFooter pageNum={pageNum} />
    </article>
  )
}

function GalleryPage({
  sessions,
  pageNum,
  onMediaClick,
}: {
  sessions: PortfolioSessionWork[]
  pageNum: number
  onMediaClick: (media: { url: string; isVideo: boolean }, session: PortfolioSessionWork) => void
}) {
  return (
    <article className="a4 inner-page">
      <SectionHeader label="WORKS" />
      <div className="gallery-stack">
        {sessions.map((s) => (
          <SessionCard key={s.id} session={s} onMediaClick={onMediaClick} />
        ))}
        {sessions.length === 1 && <div className="gallery-pad" />}
      </div>
      <PageFooter pageNum={pageNum} />
    </article>
  )
}

function SessionStars({ rating, light }: { rating: number; light?: boolean }) {
  return (
    <div className="session-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : light
              ? "text-white/40"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  )
}

function SessionMeta({ session }: { session: PortfolioSessionWork }) {
  return (
    <div className="session-meta">
      <span>{formatDate(session.date)}</span>
      <span className="session-meta-sep">·</span>
      <span>{session.courseName}</span>
      {session.teacherName && (
        <>
          <span className="session-meta-sep">·</span>
          <span>with {session.teacherName}</span>
        </>
      )}
    </div>
  )
}

function SessionCard({
  session,
  onMediaClick,
}: {
  session: PortfolioSessionWork
  onMediaClick: (media: { url: string; isVideo: boolean }, session: PortfolioSessionWork) => void
}) {
  if (!session.hero) return null
  const hasText = !!(session.description || session.feedback)

  // ── Media-forward card (no teacher comment / description) ─────────────────
  // Photos take the whole card with a slim caption overlay so there's no empty
  // text column where the comment would otherwise go.
  if (!hasText) {
    const MAX = 5
    const tiles = [session.hero, ...session.thumbnails].slice(0, MAX)
    const overflow = 1 + session.thumbnails.length - tiles.length
    return (
      <div className={`session-card session-card--media tiles-${tiles.length}`}>
        <div className="media-grid">
          {tiles.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onMediaClick(m!, session)}
              className="media-tile"
            >
              {m!.isVideo ? (
                <>
                  <video src={m!.url} preload="metadata" muted />
                  <span className="session-hero-play"><Play className="h-5 w-5 ml-0.5" fill="white" /></span>
                </>
              ) : (
                <img
                  src={m!.url}
                  alt={session.title}
                  crossOrigin="anonymous"
                  onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.visibility = "hidden" }}
                />
              )}
              {i === tiles.length - 1 && overflow > 0 && (
                <span className="media-tile-overflow">+{overflow}</span>
              )}
            </button>
          ))}
        </div>
        <div className="media-caption">
          {session.hasArtwork && (
            <span className="media-caption-badge"><Palette className="h-2.5 w-2.5" /> PROJECT</span>
          )}
          <div className="media-caption-titlerow">
            <h3 className="media-caption-title">{session.title}</h3>
            {(session.rating ?? 0) > 0 && <SessionStars rating={session.rating ?? 0} light />}
          </div>
          <SessionMeta session={session} />
        </div>
      </div>
    )
  }

  // ── Text card (has comment / description) ─────────────────────────────────
  const MAX_THUMBS = 4
  const visibleThumbs = session.thumbnails.slice(0, MAX_THUMBS)
  const overflow = session.thumbnails.length - visibleThumbs.length

  return (
    <div className="session-card">
      {/* Hero media */}
      <button
        type="button"
        onClick={() => onMediaClick(session.hero!, session)}
        className="session-hero"
      >
        {session.hero.isVideo ? (
          <>
            <video src={session.hero.url} preload="metadata" muted />
            <span className="session-hero-play">
              <Play className="h-6 w-6 ml-0.5" fill="white" />
            </span>
          </>
        ) : (
          <img
            src={session.hero.url}
            alt={session.title}
            crossOrigin="anonymous"
            onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none" }}
          />
        )}
        {session.hasArtwork && (
          <span className="session-hero-badge">
            <Palette className="h-2.5 w-2.5" />
            PROJECT
          </span>
        )}
      </button>

      {/* Body */}
      <div className="session-body">
        <div className="session-titlerow">
          <h3 className="session-title">{session.title}</h3>
          {(session.rating ?? 0) > 0 && <SessionStars rating={session.rating ?? 0} />}
        </div>

        {session.description && (
          <p className="session-desc">{session.description}</p>
        )}

        {session.feedback && (
          <div className="session-feedback">
            <Quote className="session-feedback-icon" />
            <p>"{session.feedback}"</p>
          </div>
        )}

        {/* Thumbnail strip */}
        {visibleThumbs.length > 0 && (
          <div className="session-thumbs">
            <p className="session-thumbs-label">More from this session</p>
            <div className="session-thumbs-row">
              {visibleThumbs.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onMediaClick(m, session)}
                  className="session-thumb"
                >
                  {m.isVideo ? (
                    <>
                      <video src={m.url} preload="metadata" muted />
                      <span className="session-thumb-play"><Play className="h-3 w-3" fill="white" /></span>
                    </>
                  ) : (
                    <img
                      src={m.url}
                      alt=""
                      crossOrigin="anonymous"
                      onError={(e) => { e.currentTarget.style.display = "none" }}
                    />
                  )}
                </button>
              ))}
              {overflow > 0 && (
                <div className="session-thumb session-thumb-overflow">
                  +{overflow}
                </div>
              )}
            </div>
          </div>
        )}

        <SessionMeta session={session} />
      </div>
    </div>
  )
}

function CommentsPage({
  comments,
  pageNum,
}: {
  comments: PortfolioComment[]
  pageNum: number
}) {
  return (
    <article className="a4 inner-page">
      <SectionHeader label="VOICES" right="TEACHER NOTES" />
      <p className="comments-intro">
        Notes and observations from teachers across {comments.length === 1 ? "this session" : "every session"}.
      </p>
      <div className="comments-grid">
        {comments.map((c) => (
          <CommentCard key={c.id} comment={c} />
        ))}
      </div>
      <PageFooter pageNum={pageNum} />
    </article>
  )
}

function CommentCard({ comment }: { comment: PortfolioComment }) {
  return (
    <div className="comment-card">
      <Quote className="comment-quote" />
      {(comment.rating ?? 0) > 0 && (
        <div className="comment-stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < (comment.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
            />
          ))}
        </div>
      )}
      {comment.text ? (
        <p className="comment-text">"{comment.text}"</p>
      ) : (
        <p className="comment-text comment-text--empty">⭐ Rated this session highly</p>
      )}
      <div className="comment-byline">
        <span>— {comment.teacherName || "Teacher"}{comment.topic ? ` · ${comment.topic}` : ""}</span>
        <span className="comment-date">{formatDate(comment.date)}</span>
      </div>
    </div>
  )
}

function ClosingPage({
  student,
  pageNum,
}: {
  student: PortfolioData["student"]
  pageNum: number
}) {
  const name = student.nickname || student.name
  return (
    <article className="a4 inner-page closing-page">
      <SectionHeader label="THANK YOU" />
      <div className="closing-stack">
        <div className="closing-logo">
          <img src="/images/borot-logo.png" alt="BOROT" crossOrigin="anonymous" />
        </div>
        <h2 className="closing-title">Keep <em>building</em>, {name}!</h2>
        <p className="closing-body">
          This portfolio is a living record of your journey at BOROT Academy.
          New work is added automatically as you attend more classes — come back to see how far you've come.
        </p>
        <div className="closing-contact">
          <span><Globe className="h-3.5 w-3.5" /> www.borot.co.th</span>
          <span><Mail className="h-3.5 w-3.5" /> hello@borot.co.th</span>
        </div>
      </div>
      <footer className="closing-footer">
        <div>
          <p className="cover-brand">BOROT</p>
          <p className="cover-brand-sub">ROBOTICS LEARNING PLATFORM</p>
        </div>
        <p className="cover-website">© BOROT Academy</p>
      </footer>
    </article>
  )
}

function SectionHeader({ label, right }: { label: string; right?: string }) {
  const first = label.charAt(0)
  const rest = label.slice(1)
  return (
    <header className="section-header">
      <h2>
        <span className="section-header-first">{first}</span>
        <span className="section-header-rest">{rest}</span>
      </h2>
      {right && <span className="section-header-right">{right}</span>}
    </header>
  )
}

function PageFooter({ pageNum }: { pageNum: number }) {
  return (
    <footer className="page-footer">
      <span>BOROT · DIGITAL ENGINEERING PORTFOLIO</span>
      <span>{String(pageNum).padStart(2, "0")}</span>
    </footer>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// ─── Styles (single source of truth, scoped to .portfolio-shell) ────────────

function PortfolioStyles() {
  return (
    <style jsx global>{`
      :root {
        --portfolio-brand: ${BRAND};
        --portfolio-brand-light: ${BRAND_LIGHT};
        --portfolio-bg-soft: #fff7ed;
        --portfolio-text: #1a1a1a;
        --portfolio-grey: #6b7280;
        --portfolio-light: #9ca3af;
        --portfolio-border: #f0e3d3;
      }

      .portfolio-shell {
        font-family: var(--font-sarabun), 'Sarabun', system-ui, sans-serif;
        background: linear-gradient(180deg, #fff7ed 0%, #fff 30%, #fff 100%);
        min-height: 100vh;
        padding: 96px 16px 64px;
      }
      @media (min-width: 768px) {
        .portfolio-shell { padding: 112px 24px 80px; }
      }

      /* Action bar */
      .action-bar {
        position: fixed;
        top: 56px;
        right: 16px;
        z-index: 25;
      }
      @media (min-width: 768px) {
        .action-bar { top: 64px; right: 32px; }
      }
      .action-bar-inner {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 999px;
        padding: 6px 6px 6px 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      }
      .action-bar-meta {
        display: none;
      }
      @media (min-width: 640px) {
        .action-bar-meta { display: block; line-height: 1.1; }
      }

      /* The book — column of A4 pages */
      .book {
        max-width: 794px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      /* A4 page — fixed aspect ratio so web == PDF */
      .a4 {
        width: 100%;
        aspect-ratio: 794 / 1123;
        background: #fff;
        border-radius: 6px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
        overflow: hidden;
        position: relative;
        color: var(--portfolio-text);
        font-feature-settings: 'kern' 1, 'liga' 1;
      }
      .a4 h1, .a4 h2, .a4 h3 {
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        margin: 0;
      }

      /* Inner pages share a common padding */
      .inner-page {
        padding: 56px 56px 60px;
      }

      /* ── Section header ── */
      .section-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 16px;
        border-bottom: 4px solid var(--portfolio-brand);
        padding-bottom: 12px;
        margin-bottom: 28px;
      }
      .section-header h2 {
        font-family: var(--font-bebas), var(--font-prompt), system-ui, sans-serif;
        display: flex;
        align-items: stretch;
        gap: 4px;
        font-weight: 400;
        font-size: 54px;
        letter-spacing: 0.02em;
        line-height: 1;
      }
      .section-header-first {
        background: linear-gradient(135deg, var(--portfolio-brand), var(--portfolio-brand-light));
        color: white;
        padding: 2px 14px 6px;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        line-height: 1;
      }
      .section-header-rest {
        color: var(--portfolio-text);
        display: inline-flex;
        align-items: center;
      }
      .section-header-right {
        font-family: var(--font-bebas), var(--font-prompt), system-ui, sans-serif;
        font-size: 16px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--portfolio-light);
      }

      /* ── Cover page ── */
      .cover-page {
        padding: 0;
      }
      .cover-bar {
        height: 6px;
        background: linear-gradient(90deg, var(--portfolio-brand), var(--portfolio-brand-light));
      }
      .cover-stack {
        text-align: center;
        padding: 46px 56px 0;
      }
      .cover-eyebrow {
        font-size: 11px;
        letter-spacing: 0.4em;
        text-transform: uppercase;
        color: var(--portfolio-grey);
        font-weight: 600;
      }
      .cover-eyebrow em {
        font-family: var(--font-playfair), 'Georgia', serif;
        font-style: italic;
        font-weight: 500;
        text-transform: none;
        letter-spacing: normal;
        font-size: 16px;
        color: var(--portfolio-brand);
        vertical-align: -2px;
        margin: 0 2px;
      }
      .cover-title {
        font-family: var(--font-bebas), var(--font-prompt), system-ui, sans-serif;
        font-size: 130px;
        font-weight: 400;       /* Bebas comes with one weight */
        color: var(--portfolio-brand);
        letter-spacing: 0.02em;
        line-height: 1;
        margin-top: 8px;
      }
      .cover-subtitle {
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        font-size: 32px;
        font-weight: 600;
        color: var(--portfolio-brand-light);
        margin-top: 0;
        letter-spacing: -0.01em;
      }
      .cover-hero {
        position: relative;
        flex: 1;
        height: 520px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cover-hero-blob {
        position: absolute;
        border-radius: 9999px;
        filter: blur(0px);
      }
      .cover-hero-blob--peach {
        top: 40px;
        left: 60px;
        width: 200px;
        height: 200px;
        background: #ffe5cc;
      }
      .cover-hero-blob--orange {
        bottom: 40px;
        right: 80px;
        width: 240px;
        height: 240px;
        background: #ffd9b8;
      }
      .cover-hero-circle {
        position: relative;
        width: 280px;
        height: 280px;
        border-radius: 9999px;
        background: linear-gradient(135deg, var(--portfolio-brand), var(--portfolio-brand-light));
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        font-size: 160px;
        font-weight: 900;
        box-shadow: 0 30px 60px rgba(229, 105, 13, 0.3);
      }
      .cover-hero-orbit {
        position: absolute;
        border-radius: 9999px;
        background: var(--portfolio-brand-light);
      }
      .cover-hero-orbit--big {
        top: -20px;
        right: -10px;
        width: 50px;
        height: 50px;
      }
      .cover-hero-orbit--small {
        bottom: 30px;
        left: -30px;
        width: 30px;
        height: 30px;
        background: #ffd9b8;
      }
      .cover-stats {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 36px;
        margin: 24px 0 32px;
      }
      .cover-stat {
        text-align: center;
      }
      .cover-stat-value {
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        font-size: 36px;
        font-weight: 900;
        color: var(--portfolio-brand);
        line-height: 1;
      }
      .cover-stat-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.2em;
        color: var(--portfolio-grey);
        margin-top: 6px;
      }
      .cover-stats-divider {
        width: 1px;
        height: 32px;
        background: #e5e7eb;
      }
      .cover-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 4px solid var(--portfolio-brand);
        padding: 16px 56px;
      }
      .cover-brand {
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        font-weight: 800;
        font-size: 18px;
        color: var(--portfolio-brand);
        line-height: 1;
      }
      .cover-brand-sub {
        font-size: 9px;
        font-weight: 600;
        letter-spacing: 0.2em;
        color: var(--portfolio-light);
        margin-top: 4px;
      }
      .cover-website {
        font-size: 10px;
        color: var(--portfolio-light);
        font-weight: 500;
      }

      /* ── About page ── */
      .about-grid {
        display: grid;
        grid-template-columns: 200px 1fr;
        gap: 32px;
        align-items: start;
      }
      .about-avatar {
        width: 200px;
        height: 240px;
        border-radius: 16px;
        background: linear-gradient(135deg, var(--portfolio-brand), var(--portfolio-brand-light));
        color: white;
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        font-size: 110px;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 12px 30px rgba(229, 105, 13, 0.25);
      }
      .about-meta {
        margin-top: 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .meta-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .meta-icon {
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        background: rgba(229, 105, 13, 0.1);
        color: var(--portfolio-brand);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .meta-icon svg { width: 14px; height: 14px; }
      .meta-text { min-width: 0; }
      .meta-label {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.15em;
        color: var(--portfolio-light);
        text-transform: uppercase;
      }
      .meta-value {
        font-size: 13px;
        font-weight: 600;
        color: var(--portfolio-text);
      }
      .about-right {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .about-h3 {
        font-family: var(--font-bebas), var(--font-prompt), system-ui, sans-serif;
        font-size: 18px;
        font-weight: 400;
        letter-spacing: 0.18em;
        color: var(--portfolio-brand);
        text-transform: uppercase;
        margin-bottom: 10px;
      }
      .about-bio {
        font-size: 14px;
        line-height: 1.75;
        color: var(--portfolio-text);
      }
      .about-bio strong {
        font-family: var(--font-playfair), 'Georgia', serif;
        font-style: italic;
        font-weight: 500;
        color: var(--portfolio-brand);
      }
      .about-cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
      }
      .about-card {
        background: var(--portfolio-bg-soft);
        border: 1.5px solid var(--portfolio-border);
        border-radius: 12px;
        padding: 14px 10px;
        text-align: center;
      }
      .about-card-icon {
        font-size: 22px;
        line-height: 1;
      }
      .about-card-value {
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        font-size: 22px;
        font-weight: 800;
        color: var(--portfolio-brand);
        line-height: 1;
        margin-top: 6px;
      }
      .about-card-label {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: var(--portfolio-grey);
        text-transform: uppercase;
        margin-top: 6px;
      }
      .about-skills {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .skill-row-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 4px;
      }
      .skill-name {
        font-size: 13px;
        font-weight: 600;
      }
      .skill-hours {
        font-size: 11px;
        color: var(--portfolio-grey);
      }
      .skill-track {
        height: 6px;
        background: #f3f4f6;
        border-radius: 3px;
        overflow: hidden;
      }
      .skill-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--portfolio-brand), var(--portfolio-brand-light));
        border-radius: 3px;
      }
      .languages {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .lang-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 9999px;
        background: rgba(229, 105, 13, 0.06);
        border: 1px solid rgba(229, 105, 13, 0.25);
        font-size: 12px;
        font-weight: 600;
        color: var(--portfolio-text);
      }

      /* ── Action bar error toast ── */
      .action-bar-error {
        margin-top: 8px;
        max-width: 320px;
        margin-left: auto;
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #b91c1c;
        border-radius: 12px;
        padding: 8px 12px;
        font-size: 11px;
        line-height: 1.4;
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      }
      .action-bar-hint {
        margin-top: 8px;
        max-width: 320px;
        margin-left: auto;
        background: #fff7ed;
        border: 1px solid var(--portfolio-border);
        color: var(--portfolio-grey);
        border-radius: 12px;
        padding: 8px 12px;
        font-size: 11px;
        line-height: 1.4;
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      }
      .assess-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0 10px;
        height: 32px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        color: var(--portfolio-brand);
        background: rgba(229, 105, 13, 0.08);
        border: 1px solid rgba(229, 105, 13, 0.2);
      }

      /* ── Assessment page ── */
      .assess-summary {
        position: relative;
        background: var(--portfolio-bg-soft);
        border: 1px solid var(--portfolio-border);
        border-left: 4px solid var(--portfolio-brand);
        border-radius: 12px;
        padding: 16px 18px 16px 46px;
      }
      .assess-summary-icon {
        position: absolute;
        top: 16px;
        left: 14px;
        width: 22px;
        height: 22px;
        color: var(--portfolio-brand);
      }
      .assess-summary p {
        font-family: var(--font-playfair), var(--font-sarabun), 'Georgia', serif;
        font-style: italic;
        font-size: 14px;
        line-height: 1.65;
        color: var(--portfolio-text);
        margin: 0;
      }
      /* Summary header band (student info) */
      .sum-header {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 14px;
        background: var(--portfolio-bg-soft);
        border: 1px solid var(--portfolio-border);
        border-radius: 14px;
        margin-bottom: 12px;
      }
      .sum-avatar {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--portfolio-brand), var(--portfolio-brand-light));
        color: white;
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        font-size: 28px;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .sum-id { flex: 1; min-width: 0; }
      .sum-name {
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        font-size: 19px;
        font-weight: 800;
        color: var(--portfolio-text);
        line-height: 1.1;
        margin: 0 0 5px;
      }
      .sum-nick { color: var(--portfolio-brand); font-weight: 600; }
      .sum-courses { display: flex; flex-wrap: wrap; gap: 5px; }
      .sum-course-chip {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 9px;
        border-radius: 9999px;
        background: rgba(229, 105, 13, 0.08);
        border: 1px solid rgba(229, 105, 13, 0.25);
        color: var(--portfolio-text);
      }
      .sum-course-empty { font-size: 11px; color: var(--portfolio-light); }
      .sum-stats { display: flex; gap: 16px; flex-shrink: 0; }
      .sum-stat { text-align: center; }
      .sum-stat-v {
        display: block;
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        font-size: 22px;
        font-weight: 900;
        color: var(--portfolio-brand);
        line-height: 1;
      }
      .sum-stat-l {
        display: block;
        font-size: 8px;
        font-weight: 700;
        letter-spacing: 0.14em;
        color: var(--portfolio-grey);
        margin-top: 3px;
      }
      .skill-abbr { color: var(--portfolio-light); font-weight: 600; font-size: 11px; }

      /* One-page assessment: tighten the summary so everything fits */
      .assessment-page .assess-summary {
        padding: 10px 14px 10px 40px;
        margin-bottom: 10px;
      }
      .assessment-page .assess-summary p { font-size: 12.5px; line-height: 1.55; }
      .assessment-page .assess-summary-icon { top: 13px; }

      /* Left radar / right skills */
      .assess-main {
        display: grid;
        grid-template-columns: 42% 1fr;
        gap: 20px;
        align-items: center;
        margin-bottom: 14px;
      }
      .assess-radar {
        width: 100%;
        height: 280px;
      }
      .assess-skills {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .assess-skill .skill-name { font-size: 12px; }
      .assess-skill { }
      .assess-score {
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        font-size: 14px;
        font-weight: 800;
        color: var(--portfolio-brand);
        line-height: 1;
      }
      .assess-score-max {
        font-size: 10px;
        font-weight: 600;
        color: var(--portfolio-light);
        margin-left: 1px;
      }
      .assess-reason {
        font-size: 10.5px;
        line-height: 1.45;
        color: var(--portfolio-grey);
        margin-top: 4px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .assess-cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 14px;
      }
      .assess-col-icon {
        width: 14px;
        height: 14px;
        display: inline-block;
        vertical-align: -2px;
        margin-right: 4px;
      }
      .assess-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .assess-list li {
        position: relative;
        padding-left: 16px;
        font-size: 12.5px;
        line-height: 1.5;
        color: var(--portfolio-text);
      }
      .assess-list li::before {
        content: '';
        position: absolute;
        left: 0;
        top: 7px;
        width: 6px;
        height: 6px;
        border-radius: 9999px;
        background: var(--portfolio-brand);
      }
      .assess-reco {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: linear-gradient(135deg, rgba(229,105,13,0.08), rgba(255,140,0,0.06));
        border: 1px solid var(--portfolio-border);
        border-radius: 12px;
        padding: 14px 16px;
      }
      .assess-reco-icon {
        width: 22px;
        height: 22px;
        color: var(--portfolio-brand);
        flex-shrink: 0;
        margin-top: 2px;
      }
      .assess-reco-label {
        font-family: var(--font-bebas), sans-serif;
        font-size: 11px;
        letter-spacing: 0.18em;
        color: var(--portfolio-brand);
        margin-bottom: 3px;
      }
      .assess-reco-text {
        font-size: 13px;
        line-height: 1.55;
        color: var(--portfolio-text);
        font-weight: 500;
      }

      /* ── Gallery page (session-based cards) ── */
      .gallery-stack {
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: calc(100% - 110px);
      }
      .session-card {
        flex: 1;
        background: white;
        border: 1px solid var(--portfolio-border);
        border-radius: 14px;
        overflow: hidden;
        display: grid;
        grid-template-columns: 38% 1fr;
        min-height: 0;
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .session-card:hover {
        box-shadow: 0 12px 28px rgba(229, 105, 13, 0.15);
        transform: translateY(-2px);
      }
      .session-hero {
        all: unset;
        cursor: pointer;
        position: relative;
        background: #1a1a1a;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        min-height: 0;
      }
      .session-hero img,
      .session-hero video {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
      }
      .session-hero-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 9px;
        border-radius: 9999px;
        background: var(--portfolio-brand);
        color: white;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.1em;
        font-family: var(--font-bebas), sans-serif;
        font-weight: 400;
      }
      .session-hero-play {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .session-hero-play::before {
        content: '';
        width: 56px;
        height: 56px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 9999px;
        position: absolute;
      }
      .session-hero-play svg {
        position: relative;
        color: var(--portfolio-brand);
      }
      .session-body {
        padding: 18px 20px 18px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 0;
        overflow: hidden;
      }
      .session-titlerow {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
      }
      .session-title {
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        font-size: 17px;
        font-weight: 700;
        line-height: 1.25;
        color: var(--portfolio-text);
        letter-spacing: -0.01em;
        margin: 0;
      }
      .session-stars {
        display: flex;
        gap: 1px;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .session-desc {
        font-size: 12.5px;
        color: var(--portfolio-grey);
        line-height: 1.55;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .session-feedback {
        position: relative;
        background: var(--portfolio-bg-soft);
        border-left: 3px solid var(--portfolio-brand);
        padding: 10px 14px 10px 14px;
        border-radius: 0 8px 8px 0;
      }
      .session-feedback p {
        font-family: var(--font-playfair), 'Georgia', serif;
        font-style: italic;
        font-size: 12.5px;
        line-height: 1.55;
        color: var(--portfolio-text);
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .session-feedback-icon {
        position: absolute;
        top: 6px;
        right: 8px;
        width: 16px;
        height: 16px;
        opacity: 0.18;
        color: var(--portfolio-brand);
      }
      .session-thumbs {
        margin-top: auto;
      }
      .session-thumbs-label {
        font-family: var(--font-bebas), sans-serif;
        font-size: 10px;
        letter-spacing: 0.18em;
        color: var(--portfolio-light);
        margin-bottom: 6px;
      }
      .session-thumbs-row {
        display: flex;
        gap: 6px;
      }
      .session-thumb {
        all: unset;
        cursor: pointer;
        width: 52px;
        height: 52px;
        border-radius: 8px;
        overflow: hidden;
        background: #1a1a1a;
        position: relative;
        flex-shrink: 0;
        border: 1px solid var(--portfolio-border);
      }
      .session-thumb img,
      .session-thumb video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .session-thumb-play {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      .session-thumb-overflow {
        background: var(--portfolio-bg-soft);
        color: var(--portfolio-brand);
        font-weight: 800;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-prompt), sans-serif;
      }
      .session-meta {
        font-size: 10.5px;
        color: var(--portfolio-light);
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .session-meta-sep { opacity: 0.6; }
      .gallery-pad {
        flex: 1;
        background: #fafafa;
        border: 1px dashed #e5e7eb;
        border-radius: 14px;
      }

      /* ── Media-forward card (no teacher comment) ── */
      .session-card--media {
        display: block;
        position: relative;
        background: #1a1a1a;
      }
      .session-card--media .media-grid {
        position: absolute;
        inset: 0;
        display: grid;
        gap: 2px;
      }
      /* 1 photo → full bleed; 2 → side by side; 3+ → big hero + side rail */
      .session-card--media.tiles-1 .media-grid { grid-template-columns: 1fr; }
      .session-card--media.tiles-2 .media-grid { grid-template-columns: 1fr 1fr; }
      .session-card--media.tiles-3 .media-grid {
        grid-template-columns: 2fr 1fr;
        grid-template-rows: 1fr 1fr;
      }
      .session-card--media.tiles-3 .media-tile:first-child { grid-row: 1 / span 2; }
      .session-card--media.tiles-4 .media-grid,
      .session-card--media.tiles-5 .media-grid {
        grid-template-columns: 2fr 1fr 1fr;
        grid-template-rows: 1fr 1fr;
      }
      .session-card--media.tiles-4 .media-tile:first-child,
      .session-card--media.tiles-5 .media-tile:first-child {
        grid-row: 1 / span 2;
      }
      .media-tile {
        all: unset;
        cursor: pointer;
        position: relative;
        background: #0f0f0f;
        overflow: hidden;
      }
      .media-tile img,
      .media-tile video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .media-tile-overflow {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.55);
        color: white;
        font-family: var(--font-prompt), sans-serif;
        font-weight: 800;
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .media-caption {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 28px 18px 14px;
        background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 55%, transparent 100%);
        color: white;
        z-index: 2;
        pointer-events: none;
      }
      .media-caption-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 9px;
        margin-bottom: 6px;
        border-radius: 9999px;
        background: var(--portfolio-brand);
        color: white;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.1em;
        font-family: var(--font-bebas), sans-serif;
      }
      .media-caption-titlerow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .media-caption-title {
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        font-size: 17px;
        font-weight: 700;
        line-height: 1.25;
        color: white;
        margin: 0;
        letter-spacing: -0.01em;
      }
      .media-caption .session-meta {
        color: rgba(255,255,255,0.75);
        margin-top: 4px;
      }

      /* ── Comments page ── */
      .comments-intro {
        font-size: 13px;
        color: var(--portfolio-grey);
        margin-bottom: 18px;
      }
      .comments-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .comment-card {
        position: relative;
        background: var(--portfolio-bg-soft);
        border: 1px solid var(--portfolio-border);
        border-left: 4px solid var(--portfolio-brand);
        border-radius: 10px;
        padding: 16px 18px;
      }
      .comment-quote {
        position: absolute;
        top: 12px;
        right: 14px;
        width: 24px;
        height: 24px;
        opacity: 0.15;
        color: var(--portfolio-brand);
      }
      .comment-stars {
        display: flex;
        gap: 1px;
        margin-bottom: 8px;
      }
      .comment-text {
        font-family: var(--font-playfair), var(--font-sarabun), 'Georgia', serif;
        font-size: 14px;
        line-height: 1.6;
        color: var(--portfolio-text);
        font-style: italic;
        font-weight: 400;
      }
      .comment-text--empty {
        font-style: normal;
        color: var(--portfolio-grey);
      }
      .comment-byline {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 8px;
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px solid rgba(229, 105, 13, 0.15);
        font-size: 11px;
        font-weight: 700;
        color: var(--portfolio-brand);
      }
      .comment-date {
        color: var(--portfolio-light);
        font-weight: 500;
      }

      /* ── Closing page ── */
      .closing-page {
        display: flex;
        flex-direction: column;
      }
      .closing-stack {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 16px;
        padding: 0 40px;
      }
      .closing-logo {
        width: 140px;
        height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .closing-logo img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .closing-title {
        font-family: var(--font-prompt), var(--font-sarabun), system-ui, sans-serif;
        font-size: 38px;
        font-weight: 800;
        color: var(--portfolio-text);
        letter-spacing: -0.01em;
      }
      .closing-title em {
        font-family: var(--font-playfair), 'Georgia', serif;
        font-style: italic;
        font-weight: 500;
        color: var(--portfolio-brand);
      }
      .closing-body {
        font-size: 15px;
        line-height: 1.7;
        color: var(--portfolio-grey);
        max-width: 480px;
      }
      .closing-contact {
        display: flex;
        gap: 24px;
        font-size: 12px;
        color: var(--portfolio-brand);
        margin-top: 12px;
      }
      .closing-contact span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .closing-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 4px solid var(--portfolio-brand);
        padding: 16px 56px;
      }

      /* ── Page footer (small page-num strip) ── */
      .page-footer {
        position: absolute;
        left: 56px;
        right: 56px;
        bottom: 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.15em;
        color: var(--portfolio-light);
      }
    `}</style>
  )
}
