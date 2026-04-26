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
        visits: { select: { status: true, rating: true, scheduledAt: true } },
        activities: { select: { type: true, title: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 },
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
      completedVisits: lead.visits.filter(v => v.status === 'Completed').length,
      avgVisitRating: lead.visits.filter(v => v.rating).length > 0
        ? lead.visits.filter(v => v.rating).reduce((sum, v) => sum + (v.rating || 0), 0) / lead.visits.filter(v => v.rating).length
        : null,
      recentActivities: lead.activities.map(a => `${a.type}: ${a.title}`),
    }

    const zai = await ZAI.create()

    const result = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a real estate lead scoring AI for Agentic Fox Labs. Analyze the lead data and provide:
1. A numerical score from 0-100 (where 100 is most likely to convert)
2. Detailed insights about the lead's potential

Scoring criteria:
- Source quality (Walk-in/Referral > Website > Social Media)
- Budget alignment with projects (Skyline Towers Mumbai, Green Valley Villas Pune, Metro Business Hub Gurgaon, Sunset Park Residences Bangalore)
- Engagement level (visits, activities, contact frequency)
- Status progression (New < Contacted < Qualified < Site Visit < Negotiation < Booked)
- Priority level (Hot > Warm > Medium > Cold)
- Visit completion and ratings
- Follow-up consistency

Return your response in this EXACT format:
SCORE: [number between 0-100]
INSIGHTS: [Your detailed analysis with bullet points, recommendations, and risk factors]`,
        },
        {
          role: 'user',
          content: `Please score this lead:\n\n${JSON.stringify(leadData, null, 2)}`,
        },
      ],
      temperature: 0.5,
    })

    const aiResponse = result.choices?.[0]?.message?.content || ''

    // Parse score and insights from AI response
    const scoreMatch = aiResponse.match(/SCORE:\s*(\d+)/i)
    const insightsMatch = aiResponse.match(/INSIGHTS:\s*([\s\S]*)/i)

    const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 50
    const insights = insightsMatch ? insightsMatch[1].trim() : aiResponse

    // Update lead with AI score and insights
    await db.lead.update({
      where: { id: leadId },
      data: {
        aiScore: score,
        aiInsights: insights,
      },
    })

    return NextResponse.json({ score, insights })
  } catch (error) {
    console.error('Lead Score API error:', error)
    return NextResponse.json(
      { error: 'Failed to score lead' },
      { status: 500 }
    )
  }
}
