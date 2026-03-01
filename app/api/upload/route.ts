import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Increase body size limit for this route (needed for large video uploads from mobile)
export const runtime = 'nodejs'

// Helper: infer MIME type from file extension when the browser doesn't provide one
function inferMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    webp: 'image/webp', heic: 'image/heic', heif: 'image/heif',
    bmp: 'image/bmp', tiff: 'image/tiff', tif: 'image/tiff',
    mp4: 'video/mp4', m4v: 'video/x-m4v', mov: 'video/quicktime',
    webm: 'video/webm', avi: 'video/x-msvideo', '3gp': 'video/3gpp',
    '3gpp': 'video/3gpp', mkv: 'video/x-matroska',
  }
  return map[ext] ?? ''
}

// Helper: detect MIME type from file magic bytes (first few bytes of the file buffer)
// Useful when Android sends files with no MIME type AND no recognizable extension
function detectMimeFromBytes(buffer: Buffer): string {
  if (buffer.length < 4) return ''
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg'
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png'
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return 'image/gif'
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (buffer.length >= 12 && buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return 'image/webp'
  // BMP: 42 4D
  if (buffer[0] === 0x42 && buffer[1] === 0x4D) return 'image/bmp'
  // HEIF/HEIC: check for ftyp box (offset 4: 66 74 79 70) then brand heic/heix/mif1
  if (buffer.length >= 12 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    const brand = buffer.slice(8, 12).toString('ascii')
    if (['heic', 'heix', 'mif1', 'hevc'].includes(brand)) return 'image/heic'
  }
  // MP4/MOV: ftyp box at offset 4
  if (buffer.length >= 8 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    return 'video/mp4'
  }
  return ''
}

// POST /api/upload
// Body: FormData with field "file"
// Returns: { success: true, url: "https://res.cloudinary.com/..." }
export async function POST(req: NextRequest) {
  // Configure Cloudinary inside the handler so env vars are always fresh
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Cloudinary credentials missing:', {
      cloudName: !!cloudName,
      apiKey: !!apiKey,
      apiSecret: !!apiSecret,
    })
    return NextResponse.json(
      { success: false, error: 'Cloudinary credentials are not configured on the server.' },
      { status: 500 }
    )
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Supported MIME types — includes mobile-specific formats (HEIC/HEIF from iPhone, 3GPP from Android)
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'image/heic', 'image/heif',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
      'video/3gpp', 'video/3gpp2', 'video/x-m4v',
    ]

    // 200 MB limit
    const MAX_SIZE = 200 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'ไฟล์ใหญ่เกิน 200 MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Mobile browsers (especially Android) sometimes send an empty MIME type or
    // "application/octet-stream" — fall back to file extension, then magic bytes
    let fileType = file.type
    if (!fileType || fileType === 'application/octet-stream') {
      fileType = inferMimeType(file.name)
    }
    if (!fileType || !allowedTypes.includes(fileType)) {
      // Last resort: detect from file magic bytes (handles Android camera files with
      // no proper extension or MIME type)
      const detected = detectMimeFromBytes(buffer)
      if (detected) {
        console.log('Detected MIME from magic bytes:', detected, '(original:', file.type, ', name:', file.name, ')')
        fileType = detected
      }
    }

    if (!fileType || !allowedTypes.includes(fileType)) {
      console.error('Rejected file type:', { originalType: file.type, inferredType: fileType, name: file.name, size: file.size })
      return NextResponse.json(
        {
          success: false,
          error: `ประเภทไฟล์ไม่รองรับ: ${file.type || '(ไม่ทราบประเภท)'} — ชื่อไฟล์: ${file.name} (รองรับ jpg, png, gif, webp, heic, mp4, mov, webm, 3gp)`,
        },
        { status: 400 }
      )
    }

    const isVideo = fileType.startsWith('video/')
    const resourceType = isVideo ? 'video' : 'image'
    const isHeic = fileType === 'image/heic' || fileType === 'image/heif'

    // Use base64 data URI upload — works reliably in serverless environments
    // (avoids stream issues that can occur with upload_stream on Vercel/edge runtimes)
    const base64 = buffer.toString('base64')
    // For HEIC/HEIF: use a generic data URI MIME to avoid Cloudinary parsing issues
    // with the image/heic MIME type, and let Cloudinary detect the format from bytes.
    const dataUriMime = isHeic ? 'application/octet-stream' : fileType
    const dataURI = `data:${dataUriMime};base64,${base64}`

    const uploadOptions: Record<string, unknown> = {
      resource_type: resourceType,
      folder: 'borot-feedback',
    }

    // HEIC/HEIF safety net: force Cloudinary to convert to JPEG.
    // This handles cases where the client couldn't convert (non-Safari browsers).
    // Cloudinary natively supports HEIC decoding and will produce a JPEG output.
    if (isHeic) {
      uploadOptions.format = 'jpg'
    }

    const uploadResult = await cloudinary.uploader.upload(dataURI, uploadOptions)

    return NextResponse.json({ success: true, url: uploadResult.secure_url })
  } catch (error: unknown) {
    // Cloudinary SDK may throw plain objects with .message or .error.message
    let errMsg = 'Unknown upload error'
    if (error instanceof Error) {
      errMsg = error.message
    } else if (error && typeof error === 'object') {
      const e = error as Record<string, unknown>
      if (typeof e.message === 'string') {
        errMsg = e.message
      } else if (e.error && typeof e.error === 'object' && typeof (e.error as Record<string, unknown>).message === 'string') {
        errMsg = (e.error as Record<string, unknown>).message as string
      } else {
        try { errMsg = JSON.stringify(error) } catch { errMsg = String(error) }
      }
    } else {
      errMsg = String(error)
    }
    console.error('Upload error:', errMsg, error)
    return NextResponse.json(
      { success: false, error: `Failed to upload file: ${errMsg}` },
      { status: 500 }
    )
  }
}
