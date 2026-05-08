import { NextResponse } from 'next/server'
import { syncFromSheetToDb } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST() {
  try {
    const result = await syncFromSheetToDb()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[sheets] sync-from-sheet error:', error)
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to sync from Google Sheet' },
      { status: 500 },
    )
  }
}
