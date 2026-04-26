import ZAI from 'z-ai-web-dev-sdk'
import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are an AI assistant for Agentic Fox Labs, a Real Estate Intelligence Platform. You help real estate professionals with insights, recommendations, and analysis.

Company: Agentic Fox Labs - Real Estate Intelligence Platform

Current Projects:
1. Skyline Towers (Mumbai) - Premium high-rise residential complex
2. Green Valley Villas (Pune) - Luxury villa community
3. Metro Business Hub (Gurgaon) - Commercial office spaces
4. Sunset Park Residences (Bangalore) - Modern apartments

Current Business Stats:
- 4 active projects
- 460 total units across all projects
- 200 units sold
- 10 active leads in pipeline
- 4 confirmed bookings this month

You are knowledgeable about:
- Real estate market trends and analysis
- Lead qualification and scoring
- Sales pipeline management
- Property recommendations based on customer preferences
- Follow-up strategies for leads
- Sales forecasting and pipeline analysis
- Payment milestone planning
- Broker commission structures

Always provide specific, actionable advice tailored to the real estate context. When giving recommendations, reference the actual projects and data available. Be professional yet friendly. Use data-driven insights when possible.

Format your responses with clear sections, bullet points, and numbers where appropriate for readability.`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, context } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]

    if (context) {
      messages.push({
        role: 'user',
        content: `Context for this conversation: ${context}`,
      })
      messages.push({
        role: 'assistant',
        content: 'Understood. I have the context and will use it to provide relevant responses about your real estate business.',
      })
    }

    messages.push({ role: 'user', content: message })

    const result = await zai.chat.completions.create({
      messages,
      temperature: 0.7,
    })

    const response = result.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.'

    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}
