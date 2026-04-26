import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const source = searchParams.get('source')

    const where: Record<string, unknown> = { orgId }
    if (status) where.status = status
    if (priority) where.priority = priority
    if (source) where.source = source

    const leads = await db.lead.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
        customer: {
          select: { id: true, name: true, phone: true },
        },
        _count: { select: { visits: true, activities: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Leads GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const lead = await db.lead.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        alternatePhone: body.alternatePhone,
        source: body.source || 'Website',
        status: body.status || 'New',
        priority: body.priority || 'Medium',
        budget: body.budget,
        budgetMin: body.budgetMin,
        budgetMax: body.budgetMax,
        interestedIn: body.interestedIn,
        notes: body.notes,
        aiScore: body.aiScore,
        aiInsights: body.aiInsights,
        nextFollowUp: body.nextFollowUp ? new Date(body.nextFollowUp) : null,
        assignedToId: body.assignedToId,
        customerId: body.customerId,
        orgId,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        type: 'lead_created',
        title: `New Lead: ${lead.name}`,
        detail: `Lead from ${lead.source}, interested in ${lead.interestedIn || 'N/A'}`,
        leadId: lead.id,
        orgId,
      },
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Leads POST error:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
    }

    const existingLead = await db.lead.findFirst({ where: { id, orgId } })
    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'name', 'email', 'phone', 'alternatePhone', 'source', 'status',
      'priority', 'budget', 'budgetMin', 'budgetMax', 'interestedIn',
      'notes', 'aiScore', 'aiInsights', 'lastContactedAt', 'nextFollowUp',
      'assignedToId', 'customerId',
    ]

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'lastContactedAt' || field === 'nextFollowUp') {
          updateData[field] = data[field] ? new Date(data[field]) : null
        } else {
          updateData[field] = data[field]
        }
      }
    }

    const lead = await db.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    })

    // Log activity if status changed
    if (data.status && data.status !== existingLead.status) {
      await db.activity.create({
        data: {
          type: 'lead_status_changed',
          title: `Lead Status: ${existingLead.name}`,
          detail: `Status changed from ${existingLead.status} to ${data.status}`,
          leadId: lead.id,
          orgId,
        },
      })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Leads PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}
