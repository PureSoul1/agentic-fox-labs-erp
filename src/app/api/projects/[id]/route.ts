import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const project = await db.project.findFirst({
      where: { id, orgId },
      include: {
        units: {
          orderBy: [{ wing: 'asc' }, { floor: 'asc' }, { unitNumber: 'asc' }],
        },
        bookings: {
          include: {
            customer: { select: { id: true, name: true, phone: true, email: true } },
            unit: { select: { id: true, unitNumber: true } },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const available = project.units.filter((u) => u.status === 'Available').length
    const sold = project.units.filter((u) => u.status === 'Sold').length
    const blocked = project.units.filter((u) => u.status === 'Blocked').length
    const reserved = project.units.filter((u) => u.status === 'Reserved').length

    return NextResponse.json({
      ...project,
      unitStats: {
        available,
        sold,
        blocked,
        reserved,
        total: project.units.length,
      },
    })
  } catch (error) {
    console.error('Project GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}
