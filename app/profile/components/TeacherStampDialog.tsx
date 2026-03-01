"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Star, MessageSquare, Loader2, Upload, ImageIcon, X, FileVideo, Trash2,
  UserCheck, UserX, AlertCircle,
} from "lucide-react"
import type { AttendanceEntry, SessionData } from "../types"

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

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  // Add a generous timeout (90 s) so mobile uploads don't hang forever
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 90_000)

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })
    const j = await res.json()
    if (!j.success) throw new Error(j.error || "Upload failed")
    return j.url
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("อัพโหลดหมดเวลา — ลองอีกครั้งหรือเลือกรูปที่เล็กกว่า")
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
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
  onFeedbackSaved: (sessionId: string, studentId: string, feedback: string, rating: number, videoUrl: string, imageUrls: string[]) => Promise<void>
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
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // ── ANDROID FIX: Use a ref-based "busy lock" ──────────────────────────────
  // React state updates are batched / async — by the time Radix fires its
  // onOpenChange after the user returns from camera/gallery, the state might
  // already be stale.  A ref is always synchronously up-to-date.
  //
  // The lock stays engaged for a short cooldown (1 s) AFTER the async
  // operation finishes, which absorbs any delayed focus / pointer / escape
  // events that Android Chrome queues while the native file-picker was open.
  const busyRef = useRef(false)
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lockDialog = useCallback(() => {
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    busyRef.current = true
  }, [])

  const unlockDialog = useCallback(() => {
    // Keep the lock for 2 seconds after the operation finishes
    // to absorb queued Android interaction events (1 s was not enough on some devices)
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

  // Pre-populate form with existing feedback whenever dialog opens or attendee changes.
  useEffect(() => {
    if (open) {
      setRating(attendee?.rating ?? 0)
      setFeedback(attendee?.feedback ?? "")
      setImages(attendee?.imageUrls ?? [])
      setVideoUrl(attendee?.videoUrl ?? "")
      setUploadError(null)
      busyRef.current = false
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    }
  }, [open, attendee])

  // ── Guard: NEVER allow Radix-initiated close ──────────────────────────────
  // On Android Chrome, returning from the native file picker (camera/gallery)
  // fires delayed focus/pointer/interaction events that Radix interprets as
  // "close the dialog."  Even with onPointerDownOutside / onInteractOutside /
  // onFocusOutside all prevented, some Android browsers still slip through.
  //
  // The safest fix is to NEVER let Radix auto-close the dialog.  The user can
  // only close it via our explicit "ยกเลิก" / "บันทึก" buttons.
  const handleOpenChange = (o: boolean) => {
    // Allow opening always
    if (o) { onOpenChange(o); return }
    // Block ALL automatic close requests — only our explicit buttons close
    // (handleExplicitClose / handleSaveFeedback call onOpenChange directly)
    return
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

  // ── Lock the dialog as soon as the file picker is about to open ───────────
  const handleFilePickerOpen = useCallback(() => {
    lockDialog()
  }, [lockDialog])

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      // User cancelled the file picker — release the lock (with cooldown)
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
        // On Android, file.type is often "application/octet-stream" or empty for camera photos.
        // Only reject files that are clearly NOT images (e.g. video/* or audio/*).
        // Let the server handle final validation via file extension with inferMimeType.
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
        // Compress large images client-side before uploading.
        // This dramatically speeds up upload on mobile networks and prevents timeouts.
        const compressed = await compressImage(file)
        const url = await uploadFile(compressed)
        urls.push(url)
      }
      if (urls.length === 0 && skippedCount > 0) {
        setUploadError("ไม่พบไฟล์รูปภาพที่รองรับ กรุณาลองเลือกใหม่")
      } else {
        setImages((prev) => [...prev, ...urls])
      }
    } catch (err: any) {
      const msg = err?.message || "อัพโหลดรูปภาพไม่สำเร็จ"
      console.error("Image upload error:", msg, err)
      setUploadError(msg)
    } finally {
      setUploadingImage(false)
      unlockDialog()
      // Reset file input so the same file can be re-selected
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
      const msg = err?.message || "อัพโหลดวิดีโอไม่สำเร็จ"
      console.error("Video upload error:", msg, err)
      setUploadError(msg)
    } finally {
      setUploadingVideo(false)
      unlockDialog()
      // Reset file input so the same file can be re-selected
      if (videoInputRef.current) videoInputRef.current.value = ""
    }
  }

  const handleSaveFeedback = async () => {
    if (!session) return
    lockDialog()
    setSavingFeedback(true)
    try {
      await onFeedbackSaved(session._id, studentId, feedback, rating, videoUrl, images)
      // Explicitly close after successful save
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
          /* Hide the default X close button — we have explicit ยกเลิก/บันทึก buttons.
             This prevents accidental taps on the X when returning from file picker on Android. */
          showCloseButton={false}
          /* CRITICAL for mobile file upload:
             When the native file picker (camera/gallery) opens on iOS/Android,
             Radix UI treats it as an "interact outside" event and closes the dialog.
             Preventing this keeps the dialog open while the user picks a file.
             We ALWAYS prevent ALL of these — closing is only via our explicit buttons. */
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onFocusOutside={(e) => e.preventDefault()}
          /* Always prevent ESC from closing — Android back button / swipe gesture
             sends ESC and can close the dialog unexpectedly mid-upload.
             Users close via the ยกเลิก/ปิด button instead. */
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              ครั้งที่ {stampNumber} — {studentName}
            </DialogTitle>
            {stampDate && (
              <p className="text-sm text-muted-foreground">
                {stampDate.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
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
                    {isCheckedIn ? "✅ เช็คอินแล้ว" : "❌ ยังไม่ได้เช็คอิน"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCheckin(!isCheckedIn)}
                disabled={checkinLoading}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
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
                {isCheckedIn ? "เช็คอินแล้ว" : "เช็คอิน"}
              </button>
            </div>

            {/* Star rating */}
            <div>
              <Label className="text-sm font-medium">คะแนนการเรียน</Label>
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
              <Label htmlFor="stamp-feedback" className="text-sm font-medium">ความคิดเห็น / บันทึก</Label>
              <Textarea
                id="stamp-feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="เช่น วันนี้นักเรียนทำได้ดีมาก เข้าใจเรื่อง loop ค่อนข้างเร็ว..."
                className="mt-1.5 min-h-[100px] resize-none"
              />
            </div>

            {/* Upload error message */}
            {uploadError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">อัพโหลดไม่สำเร็จ</p>
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
                <ImageIcon className="h-4 w-4" />รูปภาพ
              </Label>
              {/* 
                Use <label htmlFor> to trigger file input — this is the most reliable method
                for mobile browsers (iOS Safari / Android Chrome). Programmatic .click() on 
                hidden inputs can be silently blocked inside Dialog portals on mobile.
              */}
              <input
                ref={imageInputRef}
                id="stamp-image-upload"
                type="file"
                /* Simplified accept for Android compatibility.
                   Redundant MIME types alongside image/* confused some Android file pickers
                   causing them to return files with wrong types or fail silently. */
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
                {/* Use <label> instead of <button onClick=click()> for reliable mobile file picker */}
                {uploadingImage ? (
                  <div className="w-20 h-20 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg flex flex-col items-center justify-center gap-1 text-blue-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-[9px] font-medium">อัพโหลด...</span>
                  </div>
                ) : (
                  <label
                    htmlFor="stamp-image-upload"
                    onClick={handleFilePickerOpen}
                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer active:bg-blue-50"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-[10px]">เพิ่มรูป</span>
                  </label>
                )}
              </div>
            </div>

            {/* Video upload */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <FileVideo className="h-4 w-4" />วิดีโอการเรียน
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
                    <Trash2 className="h-3.5 w-3.5" />ลบวิดีโอ
                  </button>
                </div>
              ) : (
                <div className="mt-2">
                  {uploadingVideo ? (
                    <div className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-sm">กำลังอัพโหลด...</span>
                    </div>
                  ) : (
                    <label
                      htmlFor="stamp-video-upload"
                      onClick={handleFilePickerOpen}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer active:bg-blue-50"
                    >
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">แตะเพื่อเลือกวิดีโอ</span>
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleExplicitClose} disabled={savingFeedback || uploadingVideo || uploadingImage}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleSaveFeedback}
              disabled={savingFeedback || uploadingVideo || uploadingImage || !session}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {savingFeedback ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />กำลังบันทึก...</> : "บันทึก Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox — uses a nested Radix Dialog so it properly stacks
          above the parent modal dialog on mobile.  A plain div or createPortal
          gets blocked by the parent dialog's `inert` attribute that Radix sets
          on all sibling elements, making close buttons non-interactive. */}
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
              aria-label="ปิดรูปภาพ"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
