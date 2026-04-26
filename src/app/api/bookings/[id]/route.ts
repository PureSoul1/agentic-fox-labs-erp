import { getDB } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDB()

    const booking = await db.booking.findFirst({
      where: { id, orgId },
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true, type: true },
        },
        unit: {
          select: {
            id: true, unitNumber: true, type: true, bhk: true, area: true,
            price: true, wing: true, floor: true,
            project: { select: { id: true, name: true, city: true } },
          },
        },
        broker: {
          select: { id: true, name: true, phone: true, company: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        commissions: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Booking GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const db = getDB()

    const existingBooking = await db.booking.findFirst({ where: { id, orgId } })
    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'status', 'bookingAmount', 'agreementDate', 'possessionDate',
      'discount', 'gstAmount', 'totalAmount', 'notes',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'agreementDate' || field === 'possessionDate') {
          updateData[field] = body[field] ? new Date(body[field]) : null
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const booking = await db.booking.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true } },
        unit: { select: { id: true, unitNumber: true } },
        project: { select: { id: true, name: true } },
      },
    })

    // If booking is confirmed, update unit status to Sold
    if (body.status === 'Confirmed' && existingBooking.status !== 'Confirmed') {
      await db.unit.update({
        where: { id: existingBooking.unitId },
        data: { status: 'Sold' },
      })

      await db.activity.create({
        data: {
          type: 'booking_confirmed',
          title: `Booking Confirmed: ${booking.customer.name}`,
          detail: `Unit ${booking.unit.unitNumber} at ${booking.project.name} - ₹${booking.totalAmount.toLocaleString()}`,
          orgId,
        },
      })
    }

    // If booking is cancelled, update unit status to Available
    if (body.status === 'Cancelled' && existingBooking.status !== 'Cancelled') {
      await db.unit.update({
        where: { id: existingBooking.unitId },
        data: { status: 'Available' },
      })

      await db.activity.create({
        data: {
          type: 'booking_cancelled',
          title: `Booking Cancelled: ${booking.customer.name}`,
          detail: `Unit ${booking.unit.unitNumber} at ${booking.project.name}`,
          orgId,
        },
      })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Booking PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}
