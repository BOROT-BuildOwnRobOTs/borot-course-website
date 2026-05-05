import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export const runtime = 'nodejs'

// Magic-byte fingerprints for STL (binary header is 80 bytes of arbitrary data
// followed by uint32 triangle count, so it's not reliably detectable; ASCII STL
// starts with "solid"). For OBJ there's no magic — we trust the extension.
function looksLikeAsciiStl(buf: Buffer): boolean {
  if (buf.length < 5) return false
  return buf.slice(0, 5).toString('ascii').toLowerCase() === 'solid'
}

function extOf(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

const MAX_SIZE = 100 * 1024 * 1024 // 100 MB — STLs can get large but rarely past this
const ALLOWED_EXTS = new Set(['stl', 'obj'])

/**
 * POST /api/print/upload
 *
 * Accepts a 3D model file (.stl or .obj) and uploads it to Cloudinary as a
 * raw asset (binary blob, no transformations).
 *
 * Body: FormData with field "file"
 * Returns: { success: true, url, publicId, fileName, fileFormat, sizeBytes }
 *
 * Note: STL/OBJ have no standard MIME type — browsers typically send
 * "application/octet-stream" or empty. We gate by file extension.
 */
export async function POST(req: NextRequest) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { success: false, error: 'Cloudinary credentials are not configured on the server.' },
      { status: 500 }
    )
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'ไฟล์ใหญ่เกิน 100 MB' },
        { status: 400 }
      )
    }

    const ext = extOf(file.name)
    if (!ALLOWED_EXTS.has(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `ประเภทไฟล์ไม่รองรับ: ${file.name} (รองรับ .stl, .obj)`,
        },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Loose sanity check for STL — binary STL is undetectable by header, but
    // an ASCII STL must start with "solid". OBJ has no fingerprint.
    if (ext === 'stl') {
      const ascii = looksLikeAsciiStl(buffer)
      const couldBeBinary = buffer.length >= 84 // 80B header + 4B triangle count
      if (!ascii && !couldBeBinary) {
        return NextResponse.json(
          { success: false, error: 'ไฟล์ STL ดูเหมือนจะเสียหาย' },
          { status: 400 }
        )
      }
    }

    // Upload as raw asset — Cloudinary won't try to transform binary geometry
    const base64 = buffer.toString('base64')
    const dataURI = `data:application/octet-stream;base64,${base64}`

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'raw',
      folder: 'print-models',
      use_filename: true,
      unique_filename: true,
      // Preserve the original extension so downstream viewers can pick the loader
      filename_override: file.name,
    })

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileName: file.name,
      fileFormat: ext as 'stl' | 'obj',
      sizeBytes: file.size,
    })
  } catch (error: unknown) {
    let errMsg = 'Unknown upload error'
    if (error instanceof Error) {
      errMsg = error.message
    } else if (error && typeof error === 'object') {
      const e = error as Record<string, unknown>
      if (typeof e.message === 'string') errMsg = e.message
      else {
        try { errMsg = JSON.stringify(error) } catch { errMsg = String(error) }
      }
    } else {
      errMsg = String(error)
    }
    console.error('[print upload] error:', errMsg, error)
    return NextResponse.json(
      { success: false, error: `Failed to upload model: ${errMsg}` },
      { status: 500 }
    )
  }
}
