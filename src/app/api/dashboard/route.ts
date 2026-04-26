import { getDB } from '@/lib/db'
import { NextResponse } from 'next/server'

const orgId = 'org_agentic_fox'

export async function GET() {
  try {
    const db = getDB()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // ─── Project Stats ───
    const totalProjects = await db.project.count({ where: { orgId } })
    const unitsAvailable = await db.unit.count({
      where: { status: 'Available', project: { orgId } },
    })
    const unitsSold = await db.unit.count({
      where: { status: 'Sold', project: { orgId } },
    })
    const unitsBlocked = await db.unit.count({
      where: { status: 'Blocked', project: { orgId } },
    })
    const unitsReserved = await db.unit.count({
      where: { status: 'Reserved', project: { orgId } },
    })
    const totalUnits = unitsAvailable + unitsSold + unitsBlocked + unitsReserved

    // ─── Lead Stats ───
    const totalLeads = await db.lead.count({ where: { orgId } })
    const leadsByStatus = await db.lead.groupBy({
      by: ['status'],
      where: { orgId },
      _count: { status: true },
    })
    const hotLeadsCount = await db.lead.count({
      where: { orgId, priority: 'Hot' },
    })

    // Build status map
    const statusMap: Record<string, number> = {}
    leadsByStatus.forEach((item) => {
      statusMap[item.status] = item._count.status
    })

    // ─── Booking Stats ───
    const totalBookings = await db.booking.count({ where: { orgId } })
    const confirmedBookings = await db.booking.count({
      where: { orgId, status: 'Confirmed' },
    })
    const pendingBookings = await db.booking.count({
      where: { orgId, status: 'Pending' },
    })
    const revenueResult = await db.booking.aggregate({
      where: { orgId, status: 'Confirmed' },
      _sum: { totalAmount: true },
    })
    const totalRevenue = revenueResult._sum.totalAmount || 0

    // Bookings this month
    const bookingsThisMonth = await db.booking.count({
      where: {
        orgId,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    })

    // ─── Payment Stats ───
    const collectedResult = await db.payment.aggregate({
      where: { orgId, status: 'Cleared' },
      _sum: { amount: true },
      _count: true,
    })
    const totalCollected = collectedResult._sum.amount || 0
    const totalTransactions = collectedResult._count

    const pendingPaymentsResult = await db.payment.aggregate({
      where: { orgId, status: 'Pending' },
      _sum: { amount: true },
      _count: true,
    })
    const pendingAmount = pendingPaymentsResult._sum.amount || 0
    const pendingPaymentsCount = pendingPaymentsResult._count

    // ─── Recent Activities ───
    const recentActivities = await db.activity.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 8,
    })

    // ─── Monthly Sales Data (last 6 months) ───
    const monthlySales = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const monthName = monthDate.toLocaleString('default', { month: 'short' })

      const monthBookings = await db.booking.aggregate({
        where: {
          orgId,
          status: 'Confirmed',
          createdAt: { gte: monthDate, lte: monthEnd },
        },
        _sum: { totalAmount: true },
        _count: true,
      })

      const monthPayments = await db.payment.aggregate({
        where: {
          orgId,
          status: 'Cleared',
          paymentDate: { gte: monthDate, lte: monthEnd },
        },
        _sum: { amount: true },
      })

      monthlySales.push({
        month: monthName,
        year: monthDate.getFullYear(),
        bookings: monthBookings._count,
        revenue: monthBookings._sum.totalAmount || 0,
        collected: monthPayments._sum.amount || 0,
      })
    }

    // ─── Lead Source Distribution ───
    const leadSourceDistribution = await db.lead.groupBy({
      by: ['source'],
      where: { orgId },
      _count: { source: true },
    })

    // ─── Sales Pipeline Funnel ───
    const pipelineStages = [
      { stage: 'New Leads', count: statusMap['New'] || 0 },
      { stage: 'Contacted', count: statusMap['Contacted'] || 0 },
      { stage: 'Qualified', count: statusMap['Qualified'] || 0 },
      { stage: 'Site Visit', count: statusMap['Site Visit'] || 0 },
      { stage: 'Negotiation', count: statusMap['Negotiation'] || 0 },
      { stage: 'Booked', count: statusMap['Booked'] || 0 },
    ]

    // ─── Top Performing Projects ───
    const projects = await db.project.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        totalUnits: true,
        soldUnits: true,
        status: true,
        _count: { select: { units: true } },
      },
    })

    // ─── Hot Leads (AI Score > 80) ───
    const hotLeads = await db.lead.findMany({
      where: {
        orgId,
        aiScore: { gt: 80 },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        aiScore: true,
        source: true,
        priority: true,
        interestedIn: true,
        nextFollowUp: true,
      },
      orderBy: { aiScore: 'desc' },
      take: 5,
    })

    // ─── Upcoming Site Visits ───
    const upcomingVisits = await db.siteVisit.findMany({
      where: {
        orgId,
        status: 'Scheduled',
        scheduledAt: { gte: now },
      },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        paxCount: true,
        travelMode: true,
        lead: { select: { name: true, phone: true } },
        project: { select: { name: true, location: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    })

    // ─── Site Visits Scheduled Count ───
    const siteVisitsScheduled = await db.siteVisit.count({
      where: {
        orgId,
        status: 'Scheduled',
        scheduledAt: { gte: now },
      },
    })

    // ─── Revenue Trend (compare this month vs last month) ───
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const thisMonthRevenue = await db.payment.aggregate({
      where: {
        orgId,
        status: 'Cleared',
        paymentDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    })

    const lastMonthRevenue = await db.payment.aggregate({
      where: {
        orgId,
        status: 'Cleared',
        paymentDate: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { amount: true },
    })

    const currentMonthRev = thisMonthRevenue._sum.amount || 0
    const previousMonthRev = lastMonthRevenue._sum.amount || 0
    const revenueTrend = previousMonthRev > 0
      ? ((currentMonthRev - previousMonthRev) / previousMonthRev) * 100
      : currentMonthRev > 0 ? 100 : 0

    return NextResponse.json({
      projectStats: {
        total: totalProjects,
        totalUnits,
        soldUnits: unitsSold,
        availableUnits: unitsAvailable,
        blockedUnits: unitsBlocked + unitsReserved,
      },
      leadStats: {
        total: totalLeads,
        new: statusMap['New'] || 0,
        contacted: statusMap['Contacted'] || 0,
        qualified: statusMap['Qualified'] || 0,
        siteVisit: statusMap['Site Visit'] || 0,
        negotiation: statusMap['Negotiation'] || 0,
        booked: statusMap['Booked'] || 0,
        lost: statusMap['Lost'] || 0,
        hot: hotLeadsCount,
      },
      bookingStats: {
        total: totalBookings,
        confirmed: confirmedBookings,
        pending: pendingBookings,
        totalRevenue,
        thisMonth: bookingsThisMonth,
      },
      paymentStats: {
        totalCollected,
        pendingAmount,
        totalTransactions,
        pendingPaymentsCount,
        revenueTrend: Math.round(revenueTrend * 10) / 10,
      },
      recentActivities,
      monthlySales,
      leadSources: leadSourceDistribution.map((item) => ({
        source: item.source,
        count: item._count.source,
      })),
      pipeline: pipelineStages,
      projectWiseSales: projects.map((p) => ({
        id: p.id,
        name: p.name,
        totalUnits: p.totalUnits,
        soldUnits: p.soldUnits,
        actualUnits: p._count.units,
        status: p.status,
      })),
      hotLeads,
      upcomingVisits,
      siteVisitsScheduled,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
