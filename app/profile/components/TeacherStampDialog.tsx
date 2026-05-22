"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Star, MessageSquare, Loader2, Upload, ImageIcon, X, FileVideo, Trash2,
  UserCheck, UserX, AlertCircle, RefreshCw,
} from "lucide-react"
import type { AttendanceEntry, SessionData } from "../types"
import { uploadFile } from "../lib/videoUtils"

/**
 * Check if a file is HEIC/HEIF format (common on iOS).
 * These need special handling because:
 * - Most browsers (except Safari) can't decode them in <img>/<canvas>
 * - Uploading raw HEIC as data URI can fail on some services
 */
function isHeicFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const t = file.type?.toLowerCase() || ''
  return (
    ext === 'heic' || ext === 'heif' ||
    t === 'image/heic' || t === 'image/heif'
  )
}

/**
 * Compress image client-side before uploading.
 * Reduces large Android/iOS camera photos (5-15 MB) to a reasonable size (~0.5-1.5 MB).
 * Falls back to the original file if compression fails (e.g. HEIC on browsers that can't decode it).
 *
 * Special handling for HEIC/HEIF (iOS):
 * - Always attempts conversion to JPEG regardless of file size
 * - Prefers the JPEG output even if it's larger than the HEIC original,
 *   because HEIC data URIs are unreliable for upload services
 */
async function compressImage(file: File, maxDim = 1920, quality = 0.82): Promise<File> {
  const heic = isHeicFile(file)

  // Skip small non-HEIC files (< 1.5 MB) — they don't need compression.
  // HEIC files ALWAYS need conversion to JPEG for compatibility.
  if (!heic && file.size < 1.5 * 1024 * 1024) return file

  return new Promise<File>((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    const cleanup = () => { try { URL.revokeObjectURL(objectUrl) } catch {} }

    // Safety timeout: if neither onload nor onerror fires within 15 s
    // (can happen on some iOS versions with large HEIC), resolve with original
    const safetyTimer = setTimeout(() => {
      cleanup()
      resolve(file)
    }, 15_000)

    img.onload = () => {
      clearTimeout(safetyTimer)
      cleanup()
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) { resolve(file); return }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // canvas.toBlob returned null (can happen on iOS with very large images)
            resolve(file)
            return
          }

          if (heic) {
            // HEIC: ALWAYS use the JPEG output, even if larger.
            // HEIC data URIs are unreliable — JPEG is universally supported.
            const name = file.name.replace(/\.[^.]+$/, "") + ".jpg"
            resolve(new File([blob], name, { type: "image/jpeg" }))
          } else if (blob.size < file.size) {
            // Non-HEIC: only use compressed version if it's actually smaller
            const name = file.name.replace(/\.[^.]+$/, "") + ".jpg"
            resolve(new File([blob], name, { type: "image/jpeg" }))
          } else {
            resolve(file) // compressed is bigger → use original
          }
        },
        "image/jpeg",
        quality,
      )
    }

    img.onerror = () => {
      clearTimeout(safetyTimer)
      cleanup()
      resolve(file) // can't decode (HEIC on Chrome, etc.) → send original to server
    }

    img.src = objectUrl
  })
}


interface TeacherStampDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: SessionData | null
  attendee: AttendanceEntry | null
  stampDate: Date | null
  stampNumber: number
  courseId: string
  courseName: string
  teacherId: string
  studentId: string
  studentName: string
  onCheckinToggle: (sessionId: string, studentId: string, checkedIn: boolean) => Promise<void>
  onCheckinRetroactive: (courseId: string, courseName: string, studentId: string, scheduledAt: string, checkedIn: boolean) => Promise<SessionData | null>
  onFeedbackSaved: (sessionId: string, studentId: string, feedback: string, rating: number, videoUrl: string, imageUrls: string[], artworkImageUrl: string, artworkName: string, artworkDescription: string, attendedHours: number) => Promise<void>
  onReschedule?: () => void
}

export default function TeacherStampDialog({
  open,
  onOpenChange,
  session,
  attendee,
  stampDate,
  stampNumber,
  courseId,
  courseName,
  teacherId,
  studentId,
  studentName,
  onCheckinToggle,
  onCheckinRetroactive,
  onFeedbackSaved,
  onReschedule,
}: TeacherStampDialogProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState("")
  const [savingFeedback, setSavingFeedback] = useState(false)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const [artworkImageUrl, setArtworkImageUrl] = useState("")
  const [artworkName, setArtworkName] = useState("")
  const [artworkDescription, setArtworkDescription] = useState("")
  const [attendedHours, setAttendedHours] = useState<number>(0)
  const [uploadingArtwork, setUploadingArtwork] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const artworkInputRef = useRef<HTMLInputElement>(null)

  // ── ANDROID FIX: Use a ref-based "busy lock" ──────────────────────────────
  const busyRef = useRef(false)
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lockDialog = useCallback(() => {
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    busyRef.current = true
  }, [])

  const unlockDialog = useCallback(() => {
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    cooldownTimer.current = setTimeout(() => {
      busyRef.current = false
    }, 2000)
  }, [])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    }
  }, [])

  const isCheckedIn = attendee?.checkedIn === true
  const hoursValid = attendedHours > 0

  // Pre-populate form with existing feedback whenever dialog opens or attendee changes.
  useEffect(() => {
    if (open) {
      setRating(attendee?.rating ?? 0)
      setFeedback(attendee?.feedback ?? "")
      setImages(attendee?.imageUrls ?? [])
      setVideoUrl(attendee?.videoUrl ?? "")
      setArtworkImageUrl(attendee?.artworkImageUrl ?? "")
      setArtworkName(attendee?.artworkName ?? "")
      setArtworkDescription(attendee?.artworkDescription ?? "")
      setAttendedHours(attendee?.attendedHours ?? 0)
      setUploadError(null)
      busyRef.current = false
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    }
  }, [open, attendee])

  // ── Guard: only block Radix-initiated close while busy ─────────────────────
  const handleOpenChange = (o: boolean) => {
    if (o) { onOpenChange(o); return }
    // Allow close unless busy (uploading / saving)
    if (!busyRef.current && !savingFeedback && !uploadingImage && !uploadingVideo && !uploadingArtwork) {
      handleExplicitClose()
    }
  }

  const handleCheckin = async (checkedIn: boolean) => {
    setCheckinLoading(true)
    try {
      if (session) {
        await onCheckinToggle(session._id, studentId, checkedIn)
      } else if (stampDate) {
        await onCheckinRetroactive(courseId, courseName, studentId, stampDate.toISOString(), checkedIn)
      }
    } finally {
      setCheckinLoading(false)
    }
  }

  const handleFilePickerOpen = useCallback(() => {
    lockDialog()
  }, [lockDialog])

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      unlockDialog()
      return
    }
    lockDialog()
    setUploadingImage(true)
    setUploadError(null)
    try {
      const urls: string[] = []
      let skippedCount = 0
      for (const file of Array.from(files)) {
        const t = file.type?.toLowerCase() || ""
        const isLikelyNotImage =
          t !== "" &&
          t !== "application/octet-stream" &&
          !t.startsWith("image/")
        if (isLikelyNotImage) {
          console.warn("Skipping non-image file:", file.name, file.type)
          skippedCount++
          continue
        }
        const compressed = await compressImage(file)
        const url = await uploadFile(compressed)
        urls.push(url)
      }
      if (urls.length === 0 && skippedCount > 0) {
        setUploadError("No supported image files found. Please try selecting again.")
      } else {
        setImages((prev) => [...prev, ...urls])
      }
    } catch (err: any) {
      const msg = err?.message || "Image upload failed"
      console.error("Image upload error:", msg, err)
      setUploadError(msg)
    } finally {
      setUploadingImage(false)
      unlockDialog()
      if (imageInputRef.current) imageInputRef.current.value = ""
    }
  }

  const handleVideoUpload = async (file: File | null) => {
    if (!file) {
      unlockDialog()
      return
    }
    lockDialog()
    setUploadingVideo(true)
    setUploadError(null)
    try {
      const url = await uploadFile(file)
      setVideoUrl(url)
    } catch (err: any) {
      const msg = err?.message || "Video upload failed"
      console.error("Video upload error:", msg, err)
      setUploadError(msg)
    } finally {
      setUploadingVideo(false)
      unlockDialog()
      if (videoInputRef.current) videoInputRef.current.value = ""
    }
  }

  const handleArtworkImageUpload = async (file: File | null) => {
    if (!file) {
      unlockDialog()
      return
    }
    lockDialog()
    setUploadingArtwork(true)
    setUploadError(null)
    try {
      const compressed = await compressImage(file)
      const url = await uploadFile(compressed)
      setArtworkImageUrl(url)
    } catch (err: any) {
      const msg = err?.message || "Artwork image upload failed"
      console.error("Artwork upload error:", msg, err)
      setUploadError(msg)
    } finally {
      setUploadingArtwork(false)
      unlockDialog()
      if (artworkInputRef.current) artworkInputRef.current.value = ""
    }
  }

  const handleSaveFeedback = async () => {
    if (!session) return
    if (attendedHours <= 0) return
    lockDialog()
    setSavingFeedback(true)
    try {
      await onFeedbackSaved(session._id, studentId, feedback, rating, videoUrl, images, artworkImageUrl, artworkName, artworkDescription, attendedHours)
      busyRef.current = false
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
      onOpenChange(false)
    } finally {
      setSavingFeedback(false)
      unlockDialog()
    }
  }

  // Explicit close via our buttons (bypasses the guard)
  const handleExplicitClose = () => {
    if (savingFeedback || uploadingImage || uploadingVideo) return
    busyRef.current = false
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="sm:max-w-lg max-h-[92vh] overflow-y-auto"
          showCloseButton={false}
          onPointerDownOutside={(e) => { if (busyRef.current || savingFeedback || uploadingImage || uploadingVideo || uploadingArtwork) e.preventDefault() }}
          onInteractOutside={(e) => { if (busyRef.current || savingFeedback || uploadingImage || uploadingVideo || uploadingArtwork) e.preventDefault() }}
          onFocusOutside={(e) => { if (busyRef.current || savingFeedback || uploadingImage || uploadingVideo || uploadingArtwork) e.preventDefault() }}
          onEscapeKeyDown={(e) => { if (busyRef.current || savingFeedback || uploadingImage || uploadingVideo || uploadingArtwork) e.preventDefault() }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Session {stampNumber} — {studentName}
            </DialogTitle>
            {stampDate && (
              <p className="text-sm text-muted-foreground">
                {stampDate.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-5">
            {/* Check-in section */}
            <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isCheckedIn ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"}`}>
                  {studentName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{studentName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {isCheckedIn ? "✅ Checked in" : "❌ Not checked in"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onReschedule && (
                  <button
                    onClick={() => {
                      handleExplicitClose()
                      setTimeout(() => onReschedule(), 150)
                    }}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-400"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reschedule
                  </button>
                )}
                <button
                  onClick={() => handleCheckin(!isCheckedIn)}
                  disabled={checkinLoading || (!isCheckedIn && !hoursValid)}
                  title={!isCheckedIn && !hoursValid ? "กรุณาใส่ชั่วโมงเรียนก่อน Check In" : undefined}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCheckedIn
                      ? "bg-green-500 text-white border-green-500 hover:bg-red-500 hover:border-red-500"
                      : "bg-white text-gray-500 border-gray-300 hover:bg-green-50 hover:border-green-400 hover:text-green-600"
                  }`}
                >
                  {checkinLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isCheckedIn ? (
                    <UserCheck className="h-3.5 w-3.5" />
                  ) : (
                    <UserX className="h-3.5 w-3.5" />
                  )}
                  {isCheckedIn ? "Checked In" : "Check In"}
                </button>
              </div>
            </div>

            {/* Star rating */}
            <div>
              <Label className="text-sm font-medium">Session Rating</Label>
              <div className="flex gap-1.5 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1 === rating ? 0 : i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={`h-8 w-8 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"}`} />
                  </button>
                ))}
                {rating > 0 && <span className="text-sm text-muted-foreground ml-2 self-center">{rating}/5</span>}
              </div>
            </div>

            {/* Feedback text */}
            <div>
              <Label htmlFor="stamp-feedback" className="text-sm font-medium">Comments / Notes</Label>
              <Textarea
                id="stamp-feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g. The student did very well today, understood loops quite quickly..."
                className="mt-1.5 min-h-[100px] resize-none"
              />
            </div>

            {/* Upload error message */}
            {uploadError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Upload failed</p>
                  <p className="text-xs mt-0.5 opacity-80">{uploadError}</p>
                </div>
                <button onClick={() => setUploadError(null)} className="ml-auto shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Image upload */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4" />Photos
              </Label>
              <input
                ref={imageInputRef}
                id="stamp-image-upload"
                type="file"
                accept="image/*"
                multiple
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', pointerEvents: 'none' }}
                tabIndex={-1}
                onChange={(e) => { handleImageUpload(e.target.files); }}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div key={i} className="relative group w-20 h-20">
                    <img
                      src={url}
                      alt=""
                      onClick={() => setLightboxImg(url)}
                      onError={(e) => {
                        e.currentTarget.closest<HTMLDivElement>('.group')!.style.display = 'none'
                      }}
                      className="w-full h-full object-cover rounded-lg border cursor-zoom-in"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); setImages((p) => p.filter((_, j) => j !== i)) }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow sm:hidden sm:group-hover:flex"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {uploadingImage ? (
                  <div className="w-20 h-20 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg flex flex-col items-center justify-center gap-1 text-blue-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-[9px] font-medium">Uploading...</span>
                  </div>
                ) : (
                  <label
                    htmlFor="stamp-image-upload"
                    onClick={handleFilePickerOpen}
                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer active:bg-blue-50"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-[10px]">Add Photo</span>
                  </label>
                )}
              </div>
            </div>

            {/* Video upload */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <FileVideo className="h-4 w-4" />Session Video
              </Label>
              <input
                ref={videoInputRef}
                id="stamp-video-upload"
                type="file"
                accept="video/*,.mov,.mp4,.3gp"
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', pointerEvents: 'none' }}
                tabIndex={-1}
                onChange={(e) => { handleVideoUpload(e.target.files?.[0] ?? null); }}
              />
              {videoUrl ? (
                <div className="mt-2 space-y-2">
                  <video src={videoUrl} controls playsInline className="w-full rounded-lg border max-h-48" />
                  <button
                    onClick={() => setVideoUrl("")}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />Remove video
                  </button>
                </div>
              ) : (
                <div className="mt-2">
                  {uploadingVideo ? (
                    <div className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  ) : (
                    <label
                      htmlFor="stamp-video-upload"
                      onClick={handleFilePickerOpen}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer active:bg-blue-50"
                    >
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">Tap to select video</span>
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* ── Hours attended this session ──────────────────────────────────── */}
            <div>
              <Label htmlFor="attended-hours" className="text-sm font-medium">
                Hours Attended This Session <span className="text-red-500">*</span>
              </Label>
              <Input
                id="attended-hours"
                type="number"
                min={0}
                max={24}
                step={0.5}
                required
                value={attendedHours || ""}
                onChange={(e) => setAttendedHours(e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="e.g. 1.5"
                className={`mt-1.5 w-28 ${!hoursValid ? "border-red-400 focus-visible:ring-red-300" : ""}`}
              />
              <p className="text-[10px] text-muted-foreground mt-1">ชั่วโมงที่เข้าเรียนในวันนี้</p>
              {!hoursValid && (
                <p className="text-[10px] text-red-500 mt-0.5">* จำเป็นต้องกรอกชั่วโมงเรียน</p>
              )}
            </div>

            {/* ── Artwork / Project Section ──────────────────────────────────── */}
            <div className="border-t pt-5">
              <Label className="text-sm font-semibold flex items-center gap-1.5 mb-3">
                🎨 Student Artwork / Project
              </Label>

              {/* Artwork name */}
              <div className="mb-3">
                <Label htmlFor="artwork-name" className="text-xs text-muted-foreground">Artwork Name</Label>
                <Input
                  id="artwork-name"
                  value={artworkName}
                  onChange={(e) => setArtworkName(e.target.value)}
                  placeholder="e.g. My Robot Car, LED Blink Project..."
                  className="mt-1"
                />
              </div>

              {/* Artwork description */}
              <div className="mb-3">
                <Label htmlFor="artwork-desc" className="text-xs text-muted-foreground">Artwork Description</Label>
                <Textarea
                  id="artwork-desc"
                  value={artworkDescription}
                  onChange={(e) => setArtworkDescription(e.target.value)}
                  placeholder="Describe what the student built or created in this session..."
                  className="mt-1 min-h-[70px] resize-none"
                />
              </div>

              {/* Artwork image */}
              <div>
                <Label className="text-xs text-muted-foreground">Artwork Photo</Label>
                <input
                  ref={artworkInputRef}
                  id="artwork-image-upload"
                  type="file"
                  accept="image/*"
                  style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', pointerEvents: 'none' }}
                  tabIndex={-1}
                  onChange={(e) => { handleArtworkImageUpload(e.target.files?.[0] ?? null); }}
                />
                <div className="mt-1.5">
                  {artworkImageUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={artworkImageUrl}
                        alt="Artwork"
                        onClick={() => setLightboxImg(artworkImageUrl)}
                        className="w-32 h-32 object-cover rounded-lg border cursor-zoom-in"
                      />
                      <button
                        onClick={() => setArtworkImageUrl("")}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : uploadingArtwork ? (
                    <div className="w-32 h-32 border-2 border-dashed border-purple-300 bg-purple-50 rounded-lg flex flex-col items-center justify-center gap-1 text-purple-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-[9px] font-medium">Uploading...</span>
                    </div>
                  ) : (
                    <label
                      htmlFor="artwork-image-upload"
                      onClick={handleFilePickerOpen}
                      className="w-32 h-32 border-2 border-dashed border-purple-300 rounded-lg flex flex-col items-center justify-center gap-1 text-purple-400 hover:border-purple-500 hover:text-purple-600 transition-colors cursor-pointer active:bg-purple-50"
                    >
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-[10px] text-center px-1">Add Artwork Photo</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleExplicitClose} disabled={savingFeedback || uploadingVideo || uploadingImage || uploadingArtwork}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveFeedback}
              disabled={savingFeedback || uploadingVideo || uploadingImage || uploadingArtwork || !session || !hoursValid}
              title={!hoursValid ? "กรุณาใส่ชั่วโมงเรียนก่อนบันทึก" : undefined}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {savingFeedback ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Save Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      <Dialog open={!!lightboxImg} onOpenChange={(o) => { if (!o) setLightboxImg(null) }}>
        <DialogContent
          className="bg-transparent border-none shadow-none p-0 max-w-[95vw] gap-0 [&>button]:hidden"
          showCloseButton={false}
          aria-describedby={undefined}
        >
          <div className="relative flex items-center justify-center">
            <img
              src={lightboxImg || ""}
              alt="Preview"
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              className="absolute top-2 right-2 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
              aria-label="Close image"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}