import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

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

    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'ประเภทไฟล์ไม่รองรับ (รองรับ jpg, png, gif, webp, mp4, webm)' },
        { status: 400 }
      )
    }

    // 200 MB limit
    const MAX_SIZE = 200 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'ไฟล์ใหญ่เกิน 200 MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const isVideo = file.type.startsWith('video/')
    const resourceType = isVideo ? 'video' : 'image'

    // Use base64 data URI upload — works reliably in serverless environments
    // (avoids stream issues that can occur with upload_stream on Vercel/edge runtimes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      resource_type: resourceType,
      folder: 'borot-feedback',
    })

    return NextResponse.json({ success: true, url: uploadResult.secure_url })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('Upload error:', errMsg)
    return NextResponse.json(
      { success: false, error: `Failed to upload file: ${errMsg}` },
      { status: 500 }
    )
  }
}
