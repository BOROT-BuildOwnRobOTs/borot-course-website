"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CheckCircle2, ImageIcon, MessageSquare, Star, TrendingUp, Video, X } from "lucide-react"
import { AttendanceEntry } from "../types"

interface Props {
  open: boolean
  onClose: () => void
  entry: AttendanceEntry | null
  sessionInfo: { topic: string; date: string } | null
}

// ── Shared skill constants (must match TeacherStampDialog) ─────────────────
const SKILLS = [
  { key: "Logical Thinking",  emoji: "🧠", label: "Logical Thinking" },
  { key: "Creativity",        emoji: "💡", label: "Creativity" },
  { key: "Engineering Skill", emoji: "🔧", label: "Engineering Skill" },
  { key: "Teamwork",          emoji: "🤝", label: "Teamwork" },
  { key: "Problem Solving",   emoji: "🧩", label: "Problem Solving" },
  { key: "Persistence",       emoji: "🔥", label: "Persistence" },
]

const SKILL_LEVELS: Record<number, { label: string; bar: string; badge: string }> = {
  1: { label: "ต้องพัฒนา", bar: "bg-orange-400", badge: "bg-orange-100 text-orange-600 border-orange-200" },
  2: { label: "ดี",         bar: "bg-blue-400",   badge: "bg-blue-100 text-blue-600 border-blue-200"       },
  3: { label: "ดีมาก",      bar: "bg-green-400",  badge: "bg-green-100 text-green-600 border-green-200"    },
}

export default function FeedbackDialog({ open, onClose, entry, sessionInfo }: Props) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  // Determine if there are any skill scores to display
  const skillEntries = entry?.skillScores
    ? SKILLS.filter((s) => (entry.skillScores![s.key] ?? 0) > 0)
    : []
  const hasSkillScores = skillEntries.length > 0

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดการเรียน</DialogTitle>
          </DialogHeader>
          {entry && (
            <div className="space-y-4">
              {/* Session info */}
              {sessionInfo && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm font-medium">{sessionInfo.topic || "ไม่ระบุหัวข้อ"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sessionInfo.date}</p>
                </div>
              )}

              {/* Check-in status */}
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <div>
                  <span className="font-medium">เข้าเรียนแล้ว</span>
                  {entry.checkedInAt && (
                    <span className="text-xs text-green-500 ml-2">
                      เวลา {new Date(entry.checkedInAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                    </span>
                  )}
                </div>
              </div>

              {/* Rating */}
              {entry.rating && entry.rating > 0 ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">คะแนนจากครู</p>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < (entry.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                    ))}
                    <span className="text-sm font-semibold ml-1 text-yellow-600">{entry.rating}/5</span>
                  </div>
                </div>
              ) : null}

              {/* Feedback text */}
              {entry.feedback ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ความคิดเห็นจากครู</p>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-gray-700">
                    {entry.feedback}
                  </div>
                </div>
              ) : null}

              {/* ── Learning Progress Skill Scores ──────────────────────────────── */}
              {hasSkillScores && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-purple-600 font-medium">Learning Progress</span>
                  </p>
                  <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-3 space-y-2.5">
                    {skillEntries.map(({ key, emoji, label }) => {
                      const score = entry.skillScores![key]
                      const lvl = SKILL_LEVELS[score]
                      if (!lvl) return null
                      const barPct = score === 1 ? 33 : score === 2 ? 66 : 100
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{emoji}</span>
                              <span className="text-xs font-medium">{label}</span>
                            </div>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${lvl.badge}`}>
                              {lvl.label}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-purple-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${lvl.bar}`}
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Images */}
              {entry.imageUrls && entry.imageUrls.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5" />รูปภาพ
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {entry.imageUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        onClick={() => setLightboxImg(url)}
                        className="w-20 h-20 object-cover rounded-lg border cursor-zoom-in hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Video */}
              {entry.videoUrl && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Video className="h-3.5 w-3.5" />วิดีโอการเรียน
                  </p>
                  <video src={entry.videoUrl} controls className="w-full rounded-lg border max-h-48" />
                </div>
              )}

              {/* No feedback message */}
              {!entry.feedback && !entry.videoUrl && !(entry.imageUrls && entry.imageUrls.length > 0) && !(entry.rating && entry.rating > 0) && !hasSkillScores && (
                <div className="text-center py-4 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">ยังไม่มี feedback จากครู</p>
                  <p className="text-xs mt-1 opacity-70">ครูจะเพิ่ม feedback ภายหลัง</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={onClose}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt=""
            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  )
}
