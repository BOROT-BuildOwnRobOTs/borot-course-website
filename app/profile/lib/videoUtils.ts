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

// ── Helper: infer resource type for Cloudinary ────────────────────────────────
function isVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  return ["mp4", "m4v", "mov", "webm", "avi", "3gp", "3gpp", "mkv"].includes(ext)
}

// ── Direct Cloudinary upload (bypasses Next.js server body size limit) ────────
// This uploads the file directly from the browser to Cloudinary's API
// using a server-generated signature, so large videos never hit the
// Next.js server's body parser limit.
async function uploadDirectToCloudinary(file: File): Promise<string> {
  // 1. Get a signed upload signature from our server
  const sigRes = await fetch("/api/upload/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: "borot-feedback" }),
  })

  if (!sigRes.ok) {
    const text = await sigRes.text()
    let errorMsg = `Failed to get upload signature: ${sigRes.status}`
    try {
      const j = JSON.parse(text)
      if (j.error) errorMsg = j.error
    } catch {
      // response was not JSON
    }
    throw new Error(errorMsg)
  }

  const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json()

  // 2. Upload directly to Cloudinary
  const resourceType = isVideoFile(file) ? "video" : "image"
  const formData = new FormData()
  formData.append("file", file)
  formData.append("signature", signature)
  formData.append("timestamp", timestamp.toString())
  formData.append("api_key", apiKey)
  formData.append("folder", folder)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  )

  if (!uploadRes.ok) {
    const text = await uploadRes.text()
    let errorMsg = `Cloudinary upload failed: ${uploadRes.status}`
    try {
      const j = JSON.parse(text)
      if (j.error?.message) errorMsg = j.error.message
    } catch {
      errorMsg = text || errorMsg
    }
    throw new Error(errorMsg)
  }

  const data = await uploadRes.json()
  if (data.error) {
    throw new Error(data.error.message || "Upload to Cloudinary failed")
  }

  return data.secure_url
}

// ── Server-side upload (small files only, via /api/upload) ────────────────────
async function uploadViaServer(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/upload", { method: "POST", body: formData })

  // Handle non-JSON responses (e.g. "Request Entity Too Large" from server)
  const text = await res.text()
  let json: any
  try {
    json = JSON.parse(text)
  } catch {
    // Server returned non-JSON (likely an error page or plain text error)
    throw new Error(
      `อัพโหลดไม่สำเร็จ (${res.status}): ${text.substring(0, 100)}`
    )
  }

  if (!json.success) throw new Error(json.error || "Upload failed")
  return json.url
}

// ── Main upload function ──────────────────────────────────────────────────────
// For files > 4MB (especially videos), upload directly to Cloudinary to avoid
// Next.js server body size limits. For small files, use the server route which
// handles HEIC conversion etc.
const DIRECT_UPLOAD_THRESHOLD = 4 * 1024 * 1024 // 4 MB

export async function uploadFile(file: File): Promise<string> {
  if (file.size > DIRECT_UPLOAD_THRESHOLD || isVideoFile(file)) {
    return uploadDirectToCloudinary(file)
  }
  return uploadViaServer(file)
}
