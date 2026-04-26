import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const customer = await db.customer.findFirst({
      where: { id, orgId },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        bookings: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            totalAmount: true,
            bookingAmount: true,
            project: { select: { name: true } },
            unit: { select: { unitNumber: true, type: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentDate: true,
            paymentMode: true,
            status: true,
            milestone: true,
          },
          orderBy: { paymentDate: 'desc' },
        },
        _count: { select: { bookings: true, payments: true, leads: true } },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Customer detail GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}
