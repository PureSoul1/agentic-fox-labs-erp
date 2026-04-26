import { getDB } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET(request: Request) {
  try {
    const db = getDB()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')
    const customerId = searchParams.get('customerId')

    const where: Record<string, unknown> = { orgId }
    if (status) where.status = status
    if (projectId) where.projectId = projectId
    if (customerId) where.customerId = customerId

    const bookings = await db.booking.findMany({
      where,
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
        _count: { select: { payments: true, commissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Bookings GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db = getDB()
    const body = await request.json()

    // Generate booking number
    const bookingCount = await db.booking.count({ where: { orgId } })
    const bookingNumber = `AFL-${new Date().getFullYear()}-${String(bookingCount + 1).padStart(3, '0')}`

    const booking = await db.booking.create({
      data: {
        bookingNumber,
        status: body.status || 'Pending',
        bookingAmount: body.bookingAmount ?? 0,
        agreementDate: body.agreementDate ? new Date(body.agreementDate) : null,
        possessionDate: body.possessionDate ? new Date(body.possessionDate) : null,
        discount: body.discount ?? 0,
        gstAmount: body.gstAmount ?? 0,
        totalAmount: body.totalAmount ?? 0,
        notes: body.notes,
        customerId: body.customerId,
        unitId: body.unitId,
        brokerId: body.brokerId,
        createdById: body.createdById,
        projectId: body.projectId,
        orgId,
      },
      include: {
        customer: { select: { id: true, name: true } },
        unit: { select: { id: true, unitNumber: true } },
        project: { select: { id: true, name: true } },
      },
    })

    // Update unit status to Sold/Reserved
    await db.unit.update({
      where: { id: body.unitId },
      data: { status: body.status === 'Confirmed' ? 'Sold' : 'Reserved' },
    })

    // Log activity
    await db.activity.create({
      data: {
        type: 'booking_confirmed',
        title: `Booking: ${booking.customer.name}`,
        detail: `Unit ${booking.unit.unitNumber} at ${booking.project.name} - ₹${booking.totalAmount.toLocaleString()}`,
        orgId,
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Bookings POST error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
