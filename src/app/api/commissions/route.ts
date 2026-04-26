import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const brokerId = searchParams.get('brokerId')

    const where: Record<string, unknown> = { orgId }
    if (status) where.status = status
    if (brokerId) where.brokerId = brokerId

    const commissions = await db.commission.findMany({
      where,
      include: {
        broker: {
          select: { id: true, name: true, phone: true, email: true, company: true, commissionRate: true },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            totalAmount: true,
            status: true,
            customer: { select: { id: true, name: true } },
            unit: { select: { id: true, unitNumber: true, project: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(commissions)
  } catch (error) {
    console.error('Commissions GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const commission = await db.commission.create({
      data: {
        amount: body.amount,
        status: body.status || 'Pending',
        paidDate: body.paidDate ? new Date(body.paidDate) : null,
        remarks: body.remarks,
        brokerId: body.brokerId,
        bookingId: body.bookingId,
        orgId,
      },
      include: {
        broker: { select: { id: true, name: true } },
        booking: { select: { id: true, bookingNumber: true } },
      },
    })

    return NextResponse.json(commission, { status: 201 })
  } catch (error) {
    console.error('Commissions POST error:', error)
    return NextResponse.json({ error: 'Failed to create commission' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Commission ID is required' }, { status: 400 })
    }

    const existingCommission = await db.commission.findFirst({ where: { id, orgId } })
    if (!existingCommission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['amount', 'status', 'paidDate', 'remarks']

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'paidDate') {
          updateData[field] = data[field] ? new Date(data[field]) : null
        } else {
          updateData[field] = data[field]
        }
      }
    }

    const commission = await db.commission.update({
      where: { id },
      data: updateData,
      include: {
        broker: { select: { id: true, name: true } },
        booking: { select: { id: true, bookingNumber: true } },
      },
    })

    // Log activity if commission paid
    if (data.status === 'Paid' && existingCommission.status !== 'Paid') {
      await db.activity.create({
        data: {
          type: 'commission_paid',
          title: `Commission Paid: ₹${existingCommission.amount.toLocaleString()}`,
          detail: `To ${commission.broker.name} for ${commission.booking.bookingNumber}`,
          orgId,
        },
      })
    }

    return NextResponse.json(commission)
  } catch (error) {
    console.error('Commissions PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 })
  }
}
