"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Star, MessageSquare, Loader2, Upload, ImageIcon, X, FileVideo, Trash2,
  UserCheck, UserX,
} from "lucide-react"
import type { AttendanceEntry, SessionData } from "../types"

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/upload", { method: "POST", body: formData })
  const j = await res.json()
  if (!j.success) throw new Error(j.error || "Upload failed")
  return j.url
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
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const isCheckedIn = attendee?.checkedIn === true

  // Pre-populate form with existing feedback whenever dialog opens or attendee changes.
  // We use useEffect instead of onOpenChange because Radix UI's Dialog does NOT call
  // onOpenChange when the parent opens the dialog via the `open` prop programmatically.
  useEffect(() => {
    if (open) {
      setRating(attendee?.rating ?? 0)
      setFeedback(attendee?.feedback ?? "")
      setImages(attendee?.imageUrls ?? [])
      setVideoUrl(attendee?.videoUrl ?? "")
    }
  }, [open, attendee])

  // Only handle closing (guard against closing while uploading/saving)
  const handleOpenChange = (o: boolean) => {
    if (!savingFeedback && !uploadingImage && !uploadingVideo) {
      onOpenChange(o)
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

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploadingImage(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue
        const url = await uploadFile(file)
        urls.push(url)
      }
      setImages((prev) => [...prev, ...urls])
    } catch (err) {
      console.error("Image upload error:", err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleVideoUpload = async (file: File | null) => {
    if (!file) return
    setUploadingVideo(true)
    try {
      const url = await uploadFile(file)
      setVideoUrl(url)
    } catch (err) {
      console.error("Video upload error:", err)
    } finally {
      setUploadingVideo(false)
    }
  }

  const handleSaveFeedback = async () => {
    if (!session) return
    setSavingFeedback(true)
    try {
      await onFeedbackSaved(session._id, studentId, feedback, rating, videoUrl, images)
      onOpenChange(false)
    } finally {
      setSavingFeedback(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
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

            {/* Image upload */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4" />รูปภาพ
              </Label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div key={i} className="relative group w-20 h-20">
                    <img src={url} alt="" onClick={() => setLightboxImg(url)} className="w-full h-full object-cover rounded-lg border cursor-zoom-in" />
                    <button
                      onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                >
                  {uploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ImageIcon className="h-5 w-5" /><span className="text-[10px]">เพิ่มรูป</span></>}
                </button>
              </div>
            </div>

            {/* Video upload */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <FileVideo className="h-4 w-4" />วิดีโอการเรียน
              </Label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleVideoUpload(e.target.files?.[0] ?? null)}
              />
              {videoUrl ? (
                <div className="mt-2 space-y-2">
                  <video src={videoUrl} controls className="w-full rounded-lg border max-h-48" />
                  <button
                    onClick={() => setVideoUrl("")}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />ลบวิดีโอ
                  </button>
                </div>
              ) : (
                <div className="mt-2">
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingVideo}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                  >
                    {uploadingVideo ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6" />
                        <span className="text-sm">คลิกเพื่อเลือกวิดีโอ</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={savingFeedback || uploadingVideo || uploadingImage}>
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

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="" className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
          <button onClick={() => setLightboxImg(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  )
}
