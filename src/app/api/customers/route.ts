import { getDB } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET(request: Request) {
  try {
    const db = getDB()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = { orgId }
    if (type) where.type = type
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
        { companyName: { contains: search } },
      ]
    }

    const customers = await db.customer.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        _count: { select: { bookings: true, payments: true, leads: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Customers GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db = getDB()
    const body = await request.json()

    const customer = await db.customer.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        panNumber: body.panNumber,
        aadhaarNumber: body.aadhaarNumber,
        gstNumber: body.gstNumber,
        type: body.type || 'Individual',
        companyName: body.companyName,
        assignedToId: body.assignedToId,
        orgId,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Customers POST error:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const db = getDB()
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    const existingCustomer = await db.customer.findFirst({ where: { id, orgId } })
    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'name', 'email', 'phone', 'address', 'city', 'state', 'pincode',
      'panNumber', 'aadhaarNumber', 'gstNumber', 'type', 'companyName', 'assignedToId',
    ]

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    const customer = await db.customer.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Customers PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}
