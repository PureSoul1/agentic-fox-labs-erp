import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { leadId } = body

    if (!leadId || typeof leadId !== 'string') {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    // Fetch lead data with related info
    const lead = await db.lead.findFirst({
      where: { id: leadId, orgId },
      include: {
        assignedTo: { select: { name: true, email: true } },
        customer: { select: { name: true, type: true } },
        visits: { select: { status: true, rating: true, feedback: true, scheduledAt: true }, orderBy: { scheduledAt: 'desc' }, take: 3 } ,
        activities: { select: { type: true, title: true, detail: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 },
        _count: { select: { visits: true, activities: true } },
      },
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    const leadData = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      priority: lead.priority,
      budget: lead.budget,
      budgetMin: lead.budgetMin,
      budgetMax: lead.budgetMax,
      interestedIn: lead.interestedIn,
      notes: lead.notes,
      lastContactedAt: lead.lastContactedAt,
      nextFollowUp: lead.nextFollowUp,
      assignedTo: lead.assignedTo?.name || 'Unassigned',
      customerType: lead.customer?.type,
      totalVisits: lead._count.visits,
      recentVisits: lead.visits.map(v => ({
        status: v.status,
        rating: v.rating,
        feedback: v.feedback,
        date: v.scheduledAt,
      })),
      recentActivities: lead.activities.map(a => `${a.type}: ${a.title}${a.detail ? ` - ${a.detail}` : ''}`),
    }

    const zai = await ZAI.create()

    const result = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a real estate sales communication expert for Agentic Fox Labs. Generate a professional follow-up message/email for the lead based on their data.

Context about our business:
- Company: Agentic Fox Labs - Real Estate Intelligence Platform
- Projects: Skyline Towers (Mumbai), Green Valley Villas (Pune), Metro Business Hub (Gurgaon), Sunset Park Residences (Bangalore)
- Current stats: 4 projects, 460 units, 200 sold, 10 active leads, 4 bookings

Guidelines:
- Match the tone to the lead's priority (Hot = urgent & personalized, Warm = friendly & informative, Cold = gentle re-engagement)
- Reference their specific interests and past interactions
- Include a clear call-to-action
- Be professional but warm
- Keep it concise but impactful
- If they've done site visits, reference their feedback
- If their budget matches a project, highlight that

Return your response in this EXACT format:
SUBJECT: [email subject line]
MESSAGE: [the follow-up email/message body]`,
        },
        {
          role: 'user',
          content: `Generate a follow-up message for this lead:\n\n${JSON.stringify(leadData, null, 2)}`,
        },
      ],
      temperature: 0.7,
    })

    const aiResponse = result.choices?.[0]?.message?.content || ''

    // Parse subject and message from AI response
    const subjectMatch = aiResponse.match(/SUBJECT:\s*(.+)/i)
    const messageMatch = aiResponse.match(/MESSAGE:\s*([\s\S]*)/i)

    const subject = subjectMatch ? subjectMatch[1].trim() : `Following up - Agentic Fox Labs`
    const message = messageMatch ? messageMatch[1].trim() : aiResponse

    return NextResponse.json({ message, subject })
  } catch (error) {
    console.error('Follow-up API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate follow-up message' },
      { status: 500 }
    )
  }
}
