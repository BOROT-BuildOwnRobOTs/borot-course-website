import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TrialRegistration from '@/models/TrialRegistration'
import { TRIAL_SLOTS, MAX_PER_TRIAL_SLOT } from '@/lib/slots'

export const dynamic = 'force-dynamic'

// POST /api/trial-register
// Register a student for a trial class slot
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { studentName, age, phone, slotId, courseName, slipUrl, trialDate } = body

    // Validate required fields
    if (!studentName || !age || !phone || !slotId || !courseName || !slipUrl || !trialDate) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields.' },
        { status: 400 }
      )
    }

    // Validate trialDate format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trialDate)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format.' },
        { status: 400 }
      )
    }

    // Validate slot exists
    const slot = TRIAL_SLOTS.find((s) => s.id === slotId)
    if (!slot) {
      return NextResponse.json(
        { success: false, error: 'Selected slot not found.' },
        { status: 400 }
      )
    }

    // Validate age
    const ageNum = Number(age)
    if (isNaN(ageNum) || ageNum < 3 || ageNum > 18) {
      return NextResponse.json(
        { success: false, error: 'Age must be between 3 and 18 years.' },
        { status: 400 }
      )
    }

    // Validate phone (Thai format)
    const phoneStr = phone.replace(/\D/g, '')
    if (phoneStr.length < 9 || phoneStr.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid phone number.' },
        { status: 400 }
      )
    }

    // Check slot capacity — scoped to the specific date
    const currentCount = await TrialRegistration.countDocuments({
      slotId,
      trialDate,
      status: { $in: ['pending', 'confirmed'] },
    })

    if (currentCount >= MAX_PER_TRIAL_SLOT) {
      return NextResponse.json(
        { success: false, error: 'This slot is full. Please choose another slot.' },
        { status: 409 }
      )
    }

    // Create registration
    const registration = await TrialRegistration.create({
      studentName: studentName.trim(),
      age: ageNum,
      phone: phoneStr,
      courseName: courseName.trim(),
      slipUrl: slipUrl || '',
      slotId,
      slotTime: slot.time,
      trialDate,
      status: 'pending',
    })

    return NextResponse.json({
      success: true,
      data: {
        id: registration._id,
        studentName: registration.studentName,
        slotTime: registration.slotTime,
      },
      message: 'Trial Class registration successful!',
    })
  } catch (error) {
    console.error('Trial registration error:', error)
      return NextResponse.json(
        { success: false, error: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
  }
}
