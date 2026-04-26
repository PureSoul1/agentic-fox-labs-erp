import { getDB } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET() {
  try {
    const db = getDB()
    const projects = await db.project.findMany({
      where: { orgId },
      include: {
        _count: { select: { units: true, bookings: true } },
        units: {
          select: {
            status: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const projectsWithStats = projects.map((project) => {
      const available = project.units.filter((u) => u.status === 'Available').length
      const sold = project.units.filter((u) => u.status === 'Sold').length
      const blocked = project.units.filter((u) => u.status === 'Blocked').length
      const reserved = project.units.filter((u) => u.status === 'Reserved').length
      const totalValue = project.units.reduce((sum, u) => sum + u.price, 0)
      const soldValue = project.units
        .filter((u) => u.status === 'Sold')
        .reduce((sum, u) => sum + u.price, 0)

      return {
        ...project,
        unitStats: { available, sold, blocked, reserved, total: project.units.length },
        totalValue,
        soldValue,
      }
    })

    return NextResponse.json(projectsWithStats)
  } catch (error) {
    console.error('Projects GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db = getDB()
    const body = await request.json()

    const project = await db.project.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: body.description,
        location: body.location,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        latitude: body.latitude,
        longitude: body.longitude,
        type: body.type || 'Residential',
        status: body.status || 'Pre-Launch',
        totalUnits: body.totalUnits || 0,
        soldUnits: body.soldUnits || 0,
        reraId: body.reraId,
        amenities: body.amenities ? JSON.stringify(body.amenities) : null,
        imageUrls: body.imageUrls ? JSON.stringify(body.imageUrls) : null,
        brochureUrl: body.brochureUrl,
        orgId,
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        type: 'project_created',
        title: `New Project: ${project.name}`,
        detail: `Project created at ${project.location}`,
        orgId,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Projects POST error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
