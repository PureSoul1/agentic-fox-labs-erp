import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')
    const leadId = searchParams.get('leadId')

    const where: Record<string, unknown> = { orgId }
    if (status) where.status = status
    if (projectId) where.projectId = projectId
    if (leadId) where.leadId = leadId

    const visits = await db.siteVisit.findMany({
      where,
      include: {
        lead: {
          select: { id: true, name: true, phone: true, email: true, priority: true },
        },
        project: {
          select: { id: true, name: true, location: true, city: true },
        },
        assignedTo: {
          select: { id: true, name: true, phone: true, avatar: true },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    })

    return NextResponse.json(visits)
  } catch (error) {
    console.error('Site Visits GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch site visits' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const visit = await db.siteVisit.create({
      data: {
        scheduledAt: new Date(body.scheduledAt),
        completedAt: body.completedAt ? new Date(body.completedAt) : null,
        status: body.status || 'Scheduled',
        feedback: body.feedback,
        rating: body.rating,
        travelMode: body.travelMode,
        paxCount: body.paxCount ?? 1,
        notes: body.notes,
        leadId: body.leadId,
        projectId: body.projectId,
        assignedToId: body.assignedToId,
        orgId,
      },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        type: 'visit_scheduled',
        title: `Site Visit Scheduled: ${visit.lead.name}`,
        detail: `Visit to ${visit.project.name} on ${new Date(body.scheduledAt).toLocaleDateString()}`,
        leadId: visit.leadId,
        orgId,
      },
    })

    return NextResponse.json(visit, { status: 201 })
  } catch (error) {
    console.error('Site Visits POST error:', error)
    return NextResponse.json({ error: 'Failed to create site visit' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Site visit ID is required' }, { status: 400 })
    }

    const existingVisit = await db.siteVisit.findFirst({ where: { id, orgId } })
    if (!existingVisit) {
      return NextResponse.json({ error: 'Site visit not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'scheduledAt', 'completedAt', 'status', 'feedback', 'rating',
      'travelMode', 'paxCount', 'notes', 'assignedToId',
    ]

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'scheduledAt' || field === 'completedAt') {
          updateData[field] = data[field] ? new Date(data[field]) : null
        } else {
          updateData[field] = data[field]
        }
      }
    }

    const visit = await db.siteVisit.update({
      where: { id },
      data: updateData,
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    })

    // Log activity if completed
    if (data.status === 'Completed' && existingVisit.status !== 'Completed') {
      await db.activity.create({
        data: {
          type: 'visit_completed',
          title: `Site Visit Completed: ${visit.lead.name}`,
          detail: `Visited ${visit.project.name}${data.rating ? ` - Rating: ${data.rating}/5` : ''}`,
          leadId: visit.leadId,
          orgId,
        },
      })
    }

    return NextResponse.json(visit)
  } catch (error) {
    console.error('Site Visits PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update site visit' }, { status: 500 })
  }
}
