import { NextResponse } from 'next/server'
import { syncScheduleToSheet } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await syncScheduleToSheet()
    return NextResponse.json({ success: true, message: 'Synced to Google Sheet successfully' })
  } catch (error) {
    console.error('[sheets] manual sync error:', error)
    return NextResponse.json({ success: false, error: 'Failed to sync to Google Sheet' }, { status: 500 })
  }
}
