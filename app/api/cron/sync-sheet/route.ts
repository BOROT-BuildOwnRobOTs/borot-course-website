import { NextRequest, NextResponse } from 'next/server'
import { syncScheduleToSheet } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await syncScheduleToSheet()
    return NextResponse.json({ success: true, message: 'Sheet synced', time: new Date().toISOString() })
  } catch (error) {
    console.error('[cron/sync-sheet]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
