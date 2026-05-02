"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText,
  Image,
  Video,
  Box,
  FolderOpen,
  Sparkles,
  CheckCircle2,
  Star,
  Clock,
  Camera,
  Film,
  Palette,
  BookOpen,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import PortfolioPDF, { PDFData } from "./PortfolioPDF"

// ── Types ──────────────────────────────────────────────────────────────────
interface PortfolioProject {
  courseId: string
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

interface CourseGroup {
  courseId: string
  courseName: string
  projects: PortfolioProject[]
  sessionCount: number
  attendedCount: number
  totalHours: number
  totalImages: number
  totalVideos: number
  totalArtworks: number
}

interface PortfolioSummary {
  totalSessions: number
  attendedSessions: number
  totalImages: number
  totalVideos: number
  totalArtworks: number
  totalHours: number
  courseCount: number
  skills: string[]
  courses: string[]
}

interface PortfolioData {
  studentId: string
  summary: PortfolioSummary
  courses: CourseGroup[]
  projects: PortfolioProject[]
}

const SKILL_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
  "bg-amber-100 text-amber-700",
  "bg-indigo-100 text-indigo-700",
]

function formatDate(isoStr: string) {
  return new Date(isoStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getStars(rating: number | null) {
  if (!rating) return null
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

interface Props {
  studentName?: string
  studentId?: string
}

export default function StudentPortfolio({ studentName, studentId }: Props) {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    setError(null)
    fetch(`/api/parent/portfolio?studentId=${studentId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setData(j.data)
        } else {
          setError(j.error || "Failed to load portfolio")
        }
      })
      .catch(() => setError("Failed to load portfolio"))
      .finally(() => setLoading(false))
  }, [studentId])

  // ── Loading State ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Student Portfolio</h2>
            <p className="text-xs text-muted-foreground">Loading portfolio data...</p>
          </div>
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  // ── Error State ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Student Portfolio</h2>
          </div>
        </div>
        <Card className="border-2 border-red-200 bg-red-50/50">
          <CardContent className="py-8 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-xs text-red-500 mt-1">
              Please try again later or contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Empty State ──────────────────────────────────────────────────────────
  if (!data || data.projects.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Student Portfolio</h2>
            <p className="text-xs text-muted-foreground">Digital Engineering Portfolio</p>
          </div>
        </div>

        <Card className="border-2 border-dashed">
          <CardContent className="py-10 text-center space-y-3">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">No portfolio data yet</p>
            <p className="text-xs text-muted-foreground">
              Portfolio will be generated automatically once {studentName || "the student"} attends sessions and uploads work.
            </p>
          </CardContent>
        </Card>

        {/* Checklist — always show */}
        <PortfolioChecklist />
      </div>
    )
  }

  const { summary, courses } = data

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Student Portfolio</h2>
            <p className="text-xs text-muted-foreground">
              Digital Engineering Portfolio · Auto-generated
            </p>
          </div>
        </div>
        {summary.courseCount > 0 && (
          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
            ✓ {summary.courseCount} course{summary.courseCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-4 left-8 w-24 h-24 rounded-full bg-white/20 blur-xl" />
        </div>
        <div className="relative space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <span className="text-sm font-semibold text-yellow-200">Digital Engineering Portfolio</span>
          </div>
          <h3 className="text-xl font-bold leading-snug">
            {studentName ? `${studentName}'s Portfolio` : "Student Portfolio"}
          </h3>
          <p className="text-sm text-white/80 leading-relaxed max-w-md">
            A complete{" "}
            <span className="text-yellow-200 font-semibold">"Digital Engineering Portfolio"</span>
            {" "}showcasing all projects, photos, videos, and skills across courses.
          </p>
          <div className="flex gap-2 flex-wrap pt-1">
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">📚 School Applications</span>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">🏆 Competitions</span>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">💼 Showcase Work</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4 pb-3 px-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-500" />
              <span className="text-xs font-semibold">Photos</span>
            </div>
            <p className="text-xl font-bold text-blue-700">{summary.totalImages}</p>
            <p className="text-[10px] text-muted-foreground">Project images</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-3 px-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-red-500" />
              <span className="text-xs font-semibold">Videos</span>
            </div>
            <p className="text-xl font-bold text-red-700">{summary.totalVideos}</p>
            <p className="text-[10px] text-muted-foreground">Demo clips</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-4 pb-3 px-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" />
              <span className="text-xs font-semibold">Artworks</span>
            </div>
            <p className="text-xl font-bold text-purple-700">{summary.totalArtworks}</p>
            <p className="text-[10px] text-muted-foreground">Designs created</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4 pb-3 px-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <span className="text-xs font-semibold">Attend.</span>
            </div>
            <p className="text-xl font-bold text-orange-700">
              {summary.attendedSessions}/{summary.totalSessions}
            </p>
            <p className="text-[10px] text-muted-foreground">Sessions attended</p>
          </CardContent>
        </Card>
      </div>

      {/* Skill Tags */}
      {summary.skills.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Skills & Topics Covered
          </p>
          <div className="flex flex-wrap gap-2">
            {summary.skills.map((skill, i) => (
              <span
                key={skill}
                className={`text-xs px-3 py-1.5 rounded-full font-medium ${SKILL_COLORS[i % SKILL_COLORS.length]}`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects grouped by course */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <FolderOpen className="h-4 w-4" /> Projects by Course
        </p>
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.courseId} className="border">
              <button
                onClick={() =>
                  setExpandedCourse(
                    expandedCourse === course.courseId ? null : course.courseId
                  )
                }
                className="w-full"
              >
                <CardHeader className="pb-2 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg">
                        🤖
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-base">{course.courseName}</CardTitle>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.totalHours} hrs
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            {course.totalImages} photos
                          </span>
                          {course.totalVideos > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Film className="h-3 w-3" />
                              {course.totalVideos} videos
                            </span>
                          )}
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                            {course.attendedCount}/{course.sessionCount} sessions
                          </span>
                        </div>
                      </div>
                    </div>
                    {expandedCourse === course.courseId ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </CardHeader>
              </button>

              {expandedCourse === course.courseId && (
                <CardContent className="space-y-3 pt-0">
                  {course.projects.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border p-3 bg-muted/20"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center shrink-0 text-2xl">
                        {p.artworkImageUrl ? (
                          <img
                            src={p.artworkImageUrl}
                            alt={p.artworkName || "Artwork"}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : p.imageUrls.length > 0 ? (
                          <img
                            src={p.imageUrls[0]}
                            alt={p.topic}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          "🤖"
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {p.topic || `Session ${i + 1}`}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                            {course.courseName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(p.date)}
                          </span>
                          {p.attendedHours > 0 && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {p.attendedHours}h
                            </span>
                          )}
                        </div>

                        {/* Rating & Feedback */}
                        {p.rating && (
                          <div className="mt-1">{getStars(p.rating)}</div>
                        )}
                        {p.feedback && (
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 italic">
                            &ldquo;{p.feedback}&rdquo;
                          </p>
                        )}
                        {p.artworkName && (
                          <p className="text-[11px] text-purple-600 mt-1 font-medium">
                            🎨 {p.artworkName}
                            {p.artworkDescription && ` — ${p.artworkDescription}`}
                          </p>
                        )}
                      </div>

                      {/* Media indicators */}
                      <div className="flex gap-1.5 shrink-0">
                        {p.imageUrls.length > 0 && (
                          <span
                            title={`${p.imageUrls.length} photos`}
                            className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center"
                          >
                            <Image className="h-3 w-3 text-blue-500" />
                          </span>
                        )}
                        {p.videoUrl && (
                          <a
                            href={p.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Watch video"
                            className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
                          >
                            <Video className="h-3 w-3 text-red-500" />
                          </a>
                        )}
                        {p.artworkImageUrl && (
                          <a
                            href={p.artworkImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View artwork"
                            className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors"
                          >
                            <Box className="h-3 w-3 text-purple-500" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* PDF Download Section */}
      <PortfolioPDF
        data={
          data
            ? {
                studentName: studentName || "Student",
                summary: {
                  totalSessions: summary.totalSessions,
                  attendedSessions: summary.attendedSessions,
                  totalImages: summary.totalImages,
                  totalVideos: summary.totalVideos,
                  totalArtworks: summary.totalArtworks,
                  totalHours: summary.totalHours,
                  courseCount: summary.courseCount,
                  skills: summary.skills,
                },
                courses: courses.map((c) => ({
                  courseName: c.courseName,
                  totalImages: c.totalImages,
                  totalVideos: c.totalVideos,
                  totalArtworks: c.totalArtworks,
                  totalHours: c.totalHours,
                  attendedCount: c.attendedCount,
                  sessionCount: c.sessionCount,
                  projects: c.projects.map((p) => ({
                    courseName: p.courseName,
                    topic: p.topic,
                    date: p.date,
                    imageUrls: p.imageUrls,
                    videoUrl: p.videoUrl,
                    artworkImageUrl: p.artworkImageUrl,
                    artworkName: p.artworkName,
                    artworkDescription: p.artworkDescription,
                    feedback: p.feedback,
                    rating: p.rating,
                    attendedHours: p.attendedHours,
                  })),
                })),
                allImages: data.projects.flatMap((p) => [
                  ...p.imageUrls,
                  ...(p.artworkImageUrl ? [p.artworkImageUrl] : []),
                ]),
              }
            : null
        }
        loading={loading}
      />

      {/* Checklist */}
      <PortfolioChecklist />
    </div>
  )
}

/** Reusable checklist component */
function PortfolioChecklist() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">✅ What's included in the Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            "Cover page with student name and school",
            "Skill summary Radar Chart",
            "Project list for all modules",
            "Photos and videos of work",
            "3D design files created",
            "Teacher recommendations and feedback",
            "Course completion certificate",
            "QR Code linking to Digital Portfolio",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}