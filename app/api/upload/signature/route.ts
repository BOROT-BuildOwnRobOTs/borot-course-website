import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// POST /api/upload/signature
// Generates a Cloudinary signature for direct client-side uploads.
// This allows the browser to upload files directly to Cloudinary,
// bypassing the Next.js server body size limit entirely.
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

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })

  try {
    // Read optional parameters from request body
    let folder = 'borot-feedback'
    let resourceType = 'auto'
    try {
      const body = await req.json()
      if (body.folder) folder = body.folder
      if (body.resourceType) resourceType = body.resourceType
    } catch {
      // no body or invalid JSON — use defaults
    }

    const timestamp = Math.round(Date.now() / 1000)

    // Parameters that will be signed (must match what the client sends)
    const paramsToSign: Record<string, string | number> = {
      folder,
      timestamp,
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('Signature generation error:', errMsg)
    return NextResponse.json(
      { success: false, error: `Failed to generate upload signature: ${errMsg}` },
      { status: 500 }
    )
  }
}
