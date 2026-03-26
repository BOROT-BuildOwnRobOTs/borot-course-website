import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TrialRegistration from '@/models/TrialRegistration'

export const dynamic = 'force-dynamic'

// GET /api/admin/trial-registrations/[id]
// Fetch a single trial registration
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const registration = await TrialRegistration.findById(params.id).lean()

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Trial registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: registration })
  } catch (error) {
    console.error('Failed to fetch trial registration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trial registration' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/trial-registrations/[id]
// Update a trial registration (edit info or change status)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const body = await req.json()
    const { studentName, age, phone, courseName, slotId, slotTime, status } = body

    const updateData: Record<string, unknown> = {}
    if (studentName !== undefined) updateData.studentName = studentName
    if (age !== undefined) updateData.age = Number(age)
    if (phone !== undefined) updateData.phone = phone
    if (courseName !== undefined) updateData.courseName = courseName
    if (slotId !== undefined) updateData.slotId = slotId
    if (slotTime !== undefined) updateData.slotTime = slotTime
    if (status !== undefined) updateData.status = status

    const registration = await TrialRegistration.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean()

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Trial registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: registration })
  } catch (error) {
    console.error('Failed to update trial registration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update trial registration' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/trial-registrations/[id]
// Delete a single trial registration
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const registration = await TrialRegistration.findByIdAndDelete(params.id)

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Trial registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Trial registration deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete trial registration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete trial registration' },
      { status: 500 }
    )
  }
}
