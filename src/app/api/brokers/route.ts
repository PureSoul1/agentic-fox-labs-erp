import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET() {
  try {
    const brokers = await db.broker.findMany({
      where: { orgId },
      include: {
        _count: { select: { bookings: true, commissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Add commission totals
    const brokersWithStats = await Promise.all(
      brokers.map(async (broker) => {
        const commissionStats = await db.commission.aggregate({
          where: { brokerId: broker.id, orgId },
          _sum: { amount: true },
          _count: true,
        })
        const paidCommissions = await db.commission.aggregate({
          where: { brokerId: broker.id, orgId, status: 'Paid' },
          _sum: { amount: true },
        })
        const pendingCommissions = await db.commission.aggregate({
          where: { brokerId: broker.id, orgId, status: 'Pending' },
          _sum: { amount: true },
        })

        return {
          ...broker,
          totalCommissions: commissionStats._sum.amount || 0,
          paidCommissions: paidCommissions._sum.amount || 0,
          pendingCommissions: pendingCommissions._sum.amount || 0,
        }
      })
    )

    return NextResponse.json(brokersWithStats)
  } catch (error) {
    console.error('Brokers GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch brokers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const broker = await db.broker.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        type: body.type || 'Individual',
        panNumber: body.panNumber,
        gstNumber: body.gstNumber,
        bankAccount: body.bankAccount,
        ifscCode: body.ifscCode,
        bankName: body.bankName,
        commissionRate: body.commissionRate ?? 0,
        isActive: body.isActive ?? true,
        orgId,
      },
    })

    return NextResponse.json(broker, { status: 201 })
  } catch (error) {
    console.error('Brokers POST error:', error)
    return NextResponse.json({ error: 'Failed to create broker' }, { status: 500 })
  }
}
