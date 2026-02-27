// ── Video compression helper ──────────────────────────────────────────────────
export async function compressVideoFile(
  file: File,
  onProgress: (p: number) => void
): Promise<File> {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    const objectUrl = URL.createObjectURL(file)
    video.src = objectUrl
    video.preload = "auto"
    video.muted = true

    video.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file) }

    video.onloadeddata = () => {
      const duration = video.duration
      if (!duration || !isFinite(duration)) { URL.revokeObjectURL(objectUrl); resolve(file); return }

      let stream: MediaStream
      try { stream = (video as any).captureStream(30) }
      catch { URL.revokeObjectURL(objectUrl); resolve(file); return }

      const mimeTypes = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
      let selectedMime = "video/webm"
      for (const mt of mimeTypes) {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mt)) { selectedMime = mt; break }
      }

      let recorder: MediaRecorder
      try {
        recorder = new MediaRecorder(stream, { mimeType: selectedMime, videoBitsPerSecond: 800_000, audioBitsPerSecond: 96_000 })
      } catch { URL.revokeObjectURL(objectUrl); resolve(file); return }

      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

      const progressInterval = setInterval(() => {
        if (video.currentTime && duration) onProgress(Math.min(Math.round((video.currentTime / duration) * 100), 95))
      }, 300)

      recorder.onstop = () => {
        clearInterval(progressInterval)
        URL.revokeObjectURL(objectUrl)
        onProgress(100)
        const blob = new Blob(chunks, { type: selectedMime })
        const ext = selectedMime.includes("mp4") ? "mp4" : "webm"
        resolve(new File([blob], file.name.replace(/\.\w+$/, `.${ext}`), { type: selectedMime }))
      }
      recorder.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file) }

      video.onended = () => recorder.stop()
      recorder.start(250)
      video.play().catch(() => { clearInterval(progressInterval); URL.revokeObjectURL(objectUrl); resolve(file) })
    }
  })
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/upload", { method: "POST", body: formData })
  const j = await res.json()
  if (!j.success) throw new Error(j.error || "Upload failed")
  return j.url
}
