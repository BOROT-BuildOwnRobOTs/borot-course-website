"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CheckCircle2, ImageIcon, MessageSquare, Palette, Star, Video, X } from "lucide-react"
import { AttendanceEntry } from "../types"

interface Props {
  open: boolean
  onClose: () => void
  entry: AttendanceEntry | null
  sessionInfo: { topic: string; date: string } | null
}

export default function FeedbackDialog({ open, onClose, entry, sessionInfo }: Props) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          {entry && (
            <div className="space-y-4">
              {/* Session info */}
              {sessionInfo && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm font-medium">{sessionInfo.topic || "No topic specified"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sessionInfo.date}</p>
                </div>
              )}

              {/* Check-in status */}
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <div>
                  <span className="font-medium">Attended</span>
                  {entry.checkedInAt && (
                    <span className="text-xs text-green-500 ml-2">
                      at {new Date(entry.checkedInAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              </div>

              {/* Rating */}
              {entry.rating && entry.rating > 0 ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Teacher's Rating</p>
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
                  <p className="text-xs text-muted-foreground mb-1">Teacher's Feedback</p>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-gray-700">
                    {entry.feedback}
                  </div>
                </div>
              ) : null}

              {/* Images */}
              {entry.imageUrls && entry.imageUrls.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5" />Photos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {entry.imageUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        onClick={() => setLightboxImg(url)}
                        onError={(e) => {
                          // Hide broken images (e.g. old local /uploads/ paths that no longer exist)
                          e.currentTarget.style.display = 'none'
                        }}
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
                    <Video className="h-3.5 w-3.5" />Session Video
                  </p>
                  <video src={entry.videoUrl} controls className="w-full rounded-lg border max-h-48" />
                </div>
              )}

              {/* Artwork / Project */}
              {(entry.artworkName || entry.artworkDescription || entry.artworkImageUrl) && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Palette className="h-3.5 w-3.5" />Student Artwork / Project
                  </p>
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 space-y-2">
                    {entry.artworkName && (
                      <p className="text-sm font-semibold text-purple-800">{entry.artworkName}</p>
                    )}
                    {entry.artworkDescription && (
                      <p className="text-sm text-gray-700">{entry.artworkDescription}</p>
                    )}
                    {entry.artworkImageUrl && (
                      <img
                        src={entry.artworkImageUrl}
                        alt={entry.artworkName || "Artwork"}
                        onClick={() => setLightboxImg(entry.artworkImageUrl!)}
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                        className="w-full max-h-60 object-contain rounded-lg border cursor-zoom-in hover:opacity-90 transition-opacity"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* No feedback message */}
              {!entry.feedback && !entry.videoUrl && !(entry.imageUrls && entry.imageUrls.length > 0) && !(entry.rating && entry.rating > 0) && !entry.artworkName && !entry.artworkImageUrl && (
                <div className="text-center py-4 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No feedback from teacher yet</p>
                  <p className="text-xs mt-1 opacity-70">The teacher will add feedback later.</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
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