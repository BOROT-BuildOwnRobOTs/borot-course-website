import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/clerk-users?search=email@example.com
 * Search Clerk users by email address using the Clerk Backend API
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.trim()

    if (!search) {
      return NextResponse.json({ success: false, error: 'search parameter is required' }, { status: 400 })
    }

    const clerkSecretKey = process.env.CLERK_SECRET_KEY
    if (!clerkSecretKey) {
      return NextResponse.json({ success: false, error: 'Clerk secret key not configured' }, { status: 500 })
    }

    // Use Clerk Backend API to search users
    // https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUserList
    const url = new URL('https://api.clerk.com/v1/users')
    url.searchParams.set('email_address', search)
    url.searchParams.set('limit', '10')

    const clerkRes = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!clerkRes.ok) {
      const errText = await clerkRes.text()
      console.error('Clerk API error:', clerkRes.status, errText)
      return NextResponse.json({ success: false, error: 'Failed to fetch from Clerk' }, { status: 500 })
    }

    const clerkUsers = await clerkRes.json()

    // Map to simplified format
    const users = (Array.isArray(clerkUsers) ? clerkUsers : []).map((u: any) => ({
      id: u.id,
      firstName: u.first_name || '',
      lastName: u.last_name || '',
      email: u.email_addresses?.[0]?.email_address || '',
      imageUrl: u.image_url || '',
      createdAt: u.created_at,
    }))

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Error searching Clerk users:', error)
    return NextResponse.json({ success: false, error: 'Failed to search users' }, { status: 500 })
  }
}
