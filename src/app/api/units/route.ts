import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {
      project: { orgId },
    }

    if (projectId) where.projectId = projectId
    if (status) where.status = status
    if (type) where.type = type

    const units = await db.unit.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            status: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            customer: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [{ wing: 'asc' }, { floor: 'asc' }, { unitNumber: 'asc' }],
    })

    return NextResponse.json(units)
  } catch (error) {
    console.error('Units GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const unit = await db.unit.create({
      data: {
        unitNumber: body.unitNumber,
        floor: body.floor ?? 0,
        wing: body.wing,
        type: body.type || 'Apartment',
        bhk: body.bhk ?? 1,
        area: body.area ?? 0,
        areaUnit: body.areaUnit || 'sqft',
        price: body.price ?? 0,
        pricePerSqft: body.pricePerSqft ?? 0,
        facing: body.facing,
        status: body.status || 'Available',
        possession: body.possession,
        features: body.features ? JSON.stringify(body.features) : null,
        projectId: body.projectId,
      },
      include: {
        project: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('Units POST error:', error)
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}
