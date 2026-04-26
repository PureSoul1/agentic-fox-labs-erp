import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const bookingId = searchParams.get('bookingId')
    const customerId = searchParams.get('customerId')

    const where: Record<string, unknown> = { orgId }
    if (status) where.status = status
    if (bookingId) where.bookingId = bookingId
    if (customerId) where.customerId = customerId

    const payments = await db.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            totalAmount: true,
            unit: {
              select: { id: true, unitNumber: true, project: { select: { id: true, name: true } } },
            },
          },
        },
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
      orderBy: { paymentDate: 'desc' },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Payments GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const payment = await db.payment.create({
      data: {
        amount: body.amount,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
        paymentMode: body.paymentMode || 'Bank Transfer',
        transactionRef: body.transactionRef,
        status: body.status || 'Pending',
        milestone: body.milestone,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        notes: body.notes,
        receiptUrl: body.receiptUrl,
        customerId: body.customerId,
        bookingId: body.bookingId,
        orgId,
      },
      include: {
        booking: { select: { id: true, bookingNumber: true } },
        customer: { select: { id: true, name: true } },
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        type: 'payment_received',
        title: `Payment: ₹${body.amount.toLocaleString()}`,
        detail: `From ${payment.customer.name} for ${payment.booking.bookingNumber}`,
        orgId,
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Payments POST error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    const existingPayment = await db.payment.findFirst({ where: { id, orgId } })
    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'amount', 'paymentDate', 'paymentMode', 'transactionRef',
      'status', 'milestone', 'dueDate', 'notes', 'receiptUrl',
    ]

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'paymentDate' || field === 'dueDate') {
          updateData[field] = data[field] ? new Date(data[field]) : null
        } else {
          updateData[field] = data[field]
        }
      }
    }

    const payment = await db.payment.update({
      where: { id },
      data: updateData,
      include: {
        booking: { select: { id: true, bookingNumber: true } },
        customer: { select: { id: true, name: true } },
      },
    })

    // Log activity if payment cleared
    if (data.status === 'Cleared' && existingPayment.status !== 'Cleared') {
      await db.activity.create({
        data: {
          type: 'payment_cleared',
          title: `Payment Cleared: ₹${existingPayment.amount.toLocaleString()}`,
          detail: `From ${payment.customer.name} for ${payment.booking.bookingNumber}`,
          orgId,
        },
      })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Payments PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}
