import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

// POST /api/upload
// Body: FormData with field "file"
// Returns: { success: true, url: "/uploads/filename.ext" }
export async function POST(req: NextRequest) {
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

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Generate unique filename keeping original extension
    const originalExt = path.extname(file.name).toLowerCase() || '.bin'
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${originalExt}`
    const filePath = path.join(uploadsDir, safeName)

    fs.writeFileSync(filePath, buffer)

    return NextResponse.json({ success: true, url: `/uploads/${safeName}` })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 })
  }
}

// Increase Next.js body size limit for this route
export const config = {
  api: {
    bodyParser: false,
  },
}
