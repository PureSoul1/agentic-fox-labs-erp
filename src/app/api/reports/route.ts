import { getDB } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET() {
  try {
    const db = getDB()
    // 1. Sales by Project
    const projects = await db.project.findMany({
      where: { orgId },
      include: {
        bookings: {
          where: { status: 'Confirmed' },
          select: { totalAmount: true, discount: true, gstAmount: true },
        },
        units: {
          select: { status: true, price: true, type: true },
        },
      },
    })

    const salesByProject = projects.map((project) => {
      const confirmedBookings = project.bookings.length
      const totalRevenue = project.bookings.reduce((sum, b) => sum + b.totalAmount, 0)
      const totalDiscount = project.bookings.reduce((sum, b) => sum + b.discount, 0)
      const totalGST = project.bookings.reduce((sum, b) => sum + b.gstAmount, 0)
      const available = project.units.filter((u) => u.status === 'Available').length
      const sold = project.units.filter((u) => u.status === 'Sold').length
      const totalUnits = project.units.length
      const inventoryValue = project.units.reduce((sum, u) => sum + u.price, 0)
      const soldValue = project.units.filter((u) => u.status === 'Sold').reduce((sum, u) => sum + u.price, 0)

      return {
        projectId: project.id,
        projectName: project.name,
        city: project.city,
        type: project.type,
        status: project.status,
        totalUnits,
        available,
        sold,
        confirmedBookings,
        totalRevenue,
        totalDiscount,
        totalGST,
        inventoryValue,
        soldValue,
        absorptionRate: totalUnits > 0 ? ((sold / totalUnits) * 100).toFixed(1) : '0',
      }
    })

    // 2. Revenue by Month (last 12 months)
    const now = new Date()
    const revenueByMonth = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const monthName = monthStart.toLocaleString('default', { month: 'short' })

      const bookings = await db.booking.aggregate({
        where: { orgId, status: 'Confirmed', createdAt: { gte: monthStart, lte: monthEnd } },
        _sum: { totalAmount: true, discount: true },
        _count: true,
      })

      const payments = await db.payment.aggregate({
        where: { orgId, status: 'Cleared', paymentDate: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      })

      revenueByMonth.push({
        month: monthName,
        year: monthStart.getFullYear(),
        bookings: bookings._count,
        bookingAmount: bookings._sum.totalAmount || 0,
        discount: bookings._sum.discount || 0,
        collected: payments._sum.amount || 0,
      })
    }

    // 3. Lead Conversion Funnel
    const leadStatuses = ['New', 'Contacted', 'Qualified', 'Site Visit', 'Negotiation', 'Booked', 'Lost']
    const leadConversionFunnel = []
    let previousCount: number | null = null

    for (const status of leadStatuses) {
      const count = await db.lead.count({ where: { orgId, status } })
      leadConversionFunnel.push({
        status,
        count,
        conversionRate: previousCount !== null && previousCount > 0
          ? ((count / previousCount) * 100).toFixed(1)
          : null,
      })
      if (status !== 'Lost') {
        previousCount = count
      }
    }

    const totalLeads = await db.lead.count({ where: { orgId } })
    const bookedLeads = await db.lead.count({ where: { orgId, status: 'Booked' } })
    const overallConversionRate = totalLeads > 0 ? ((bookedLeads / totalLeads) * 100).toFixed(1) : '0'

    // 4. Broker Performance
    const brokers = await db.broker.findMany({
      where: { orgId, isActive: true },
      include: {
        bookings: {
          where: { status: 'Confirmed' },
          select: { totalAmount: true, createdAt: true },
        },
        commissions: {
          select: { amount: true, status: true },
        },
      },
    })

    const brokerPerformance = brokers.map((broker) => {
      const totalBookings = broker.bookings.length
      const totalRevenue = broker.bookings.reduce((sum, b) => sum + b.totalAmount, 0)
      const totalCommission = broker.commissions.reduce((sum, c) => sum + c.amount, 0)
      const paidCommission = broker.commissions
        .filter((c) => c.status === 'Paid')
        .reduce((sum, c) => sum + c.amount, 0)
      const pendingCommission = broker.commissions
        .filter((c) => c.status === 'Pending')
        .reduce((sum, c) => sum + c.amount, 0)

      return {
        brokerId: broker.id,
        brokerName: broker.name,
        company: broker.company,
        commissionRate: broker.commissionRate,
        totalBookings,
        totalRevenue,
        totalCommission,
        paidCommission,
        pendingCommission,
      }
    })

    // 5. Payment Collection Status
    const totalPaymentsAmount = await db.payment.aggregate({
      where: { orgId },
      _sum: { amount: true },
    })

    const clearedPayments = await db.payment.aggregate({
      where: { orgId, status: 'Cleared' },
      _sum: { amount: true },
      _count: true,
    })

    const pendingPayments = await db.payment.aggregate({
      where: { orgId, status: 'Pending' },
      _sum: { amount: true },
      _count: true,
    })

    const bouncedPayments = await db.payment.aggregate({
      where: { orgId, status: 'Bounced' },
      _sum: { amount: true },
      _count: true,
    })

    const failedPayments = await db.payment.aggregate({
      where: { orgId, status: 'Failed' },
      _sum: { amount: true },
      _count: true,
    })

    // Payment collection by milestone
    const milestones = await db.payment.groupBy({
      by: ['milestone'],
      where: { orgId },
      _sum: { amount: true },
      _count: true,
    })

    const paymentCollectionStatus = {
      total: {
        amount: totalPaymentsAmount._sum.amount || 0,
        count: await db.payment.count({ where: { orgId } }),
      },
      cleared: {
        amount: clearedPayments._sum.amount || 0,
        count: clearedPayments._count,
      },
      pending: {
        amount: pendingPayments._sum.amount || 0,
        count: pendingPayments._count,
      },
      bounced: {
        amount: bouncedPayments._sum.amount || 0,
        count: bouncedPayments._count,
      },
      failed: {
        amount: failedPayments._sum.amount || 0,
        count: failedPayments._count,
      },
      collectionRate: totalPaymentsAmount._sum.amount
        ? (((clearedPayments._sum.amount || 0) / totalPaymentsAmount._sum.amount) * 100).toFixed(1)
        : '0',
      byMilestone: milestones.map((m) => ({
        milestone: m.milestone || 'Unspecified',
        amount: m._sum.amount || 0,
        count: m._count,
      })),
    }

    return NextResponse.json({
      salesByProject,
      revenueByMonth,
      leadConversionFunnel: {
        funnel: leadConversionFunnel,
        totalLeads,
        bookedLeads,
        overallConversionRate,
      },
      brokerPerformance,
      paymentCollectionStatus,
    })
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 })
  }
}
