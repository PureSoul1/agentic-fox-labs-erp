'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  IndianRupee,
  Users,
  Building2,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  TrendingUp,
  Calendar,
  Flame,
  MapPin,
  Phone,
  Brain,
  ChevronRight,
  BarChart3,
  Filter,
} from 'lucide-react'

// ─── Types ───

interface DashboardData {
  projectStats: {
    total: number
    totalUnits: number
    soldUnits: number
    availableUnits: number
    blockedUnits: number
  }
  leadStats: {
    total: number
    new: number
    contacted: number
    qualified: number
    siteVisit: number
    negotiation: number
    booked: number
    lost: number
    hot: number
  }
  bookingStats: {
    total: number
    confirmed: number
    pending: number
    totalRevenue: number
    thisMonth: number
  }
  paymentStats: {
    totalCollected: number
    pendingAmount: number
    totalTransactions: number
    pendingPaymentsCount: number
    revenueTrend: number
  }
  recentActivities: Array<{
    id: string
    type: string
    title: string
    detail: string | null
    createdAt: string
  }>
  monthlySales: Array<{
    month: string
    year: number
    bookings: number
    revenue: number
    collected: number
  }>
  leadSources: Array<{
    source: string
    count: number
  }>
  pipeline: Array<{
    stage: string
    count: number
  }>
  projectWiseSales: Array<{
    id: string
    name: string
    totalUnits: number
    soldUnits: number
    actualUnits: number
    status: string
  }>
  hotLeads: Array<{
    id: string
    name: string
    phone: string
    aiScore: number | null
    source: string
    priority: string
    interestedIn: string | null
    nextFollowUp: string | null
  }>
  upcomingVisits: Array<{
    id: string
    scheduledAt: string
    status: string
    paxCount: number
    travelMode: string | null
    lead: { name: string; phone: string }
    project: { name: string; location: string }
    assignedTo: { name: string }
  }>
  siteVisitsScheduled: number
}

// ─── Helpers ───

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

function formatCurrencyFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

// ─── Chart Colors ───

const ORANGE = '#F97316'
const ORANGE_LIGHT = '#FED7AA'
const EMERALD = '#10B981'
const SLATE = '#64748B'
const CHART_COLORS = ['#F97316', '#10B981', '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6', '#F59E0B', '#EF4444']
const PIPELINE_COLORS = ['#94A3B8', '#CBD5E1', '#F97316', '#FB923C', '#10B981', '#059669']

// ─── Animation Variants ───

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ─── Custom Tooltip ───

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-slate-500">{item.name}:</span>
          <span className="font-medium text-slate-900">{item.name === 'Revenue' ? formatCurrency(item.value) : item.value}</span>
        </div>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <div className="flex items-center gap-2 text-xs">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
        <span className="font-medium text-slate-900">{payload[0].name}</span>
        <span className="text-slate-500">({payload[0].value})</span>
      </div>
    </div>
  )
}

// ─── Skeleton Loaders ───

function StatCardSkeleton() {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
          </div>
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-3 w-24 mt-3" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-56 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Activity Icon Helper ───

function getActivityIcon(type: string) {
  switch (type) {
    case 'lead_created':
      return <Target className="size-3.5 text-orange-500" />
    case 'booking_confirmed':
      return <Building2 className="size-3.5 text-emerald-500" />
    case 'payment_received':
      return <IndianRupee className="size-3.5 text-blue-500" />
    case 'visit_completed':
      return <MapPin className="size-3.5 text-violet-500" />
    default:
      return <Clock className="size-3.5 text-orange-500" />
  }
}

function getActivityBg(type: string) {
  switch (type) {
    case 'lead_created':
      return 'bg-orange-50'
    case 'booking_confirmed':
      return 'bg-emerald-50'
    case 'payment_received':
      return 'bg-blue-50'
    case 'visit_completed':
      return 'bg-violet-50'
    default:
      return 'bg-slate-50'
  }
}

// ─── Pipeline Funnel Component ───

function PipelineFunnel({ pipeline }: { pipeline: DashboardData['pipeline'] }) {
  const maxCount = Math.max(...pipeline.map((s) => s.count), 1)

  return (
    <div className="space-y-2.5">
      {pipeline.map((stage, i) => {
        const widthPercent = Math.max((stage.count / maxCount) * 100, 8)
        const isLast = i === pipeline.length - 1
        return (
          <div key={stage.stage} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-600">{stage.stage}</span>
              <span className="text-xs font-bold text-slate-900">{stage.count}</span>
            </div>
            <div className="relative h-7 bg-slate-100 rounded-md overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 rounded-md flex items-center justify-end pr-2"
                style={{ backgroundColor: isLast ? EMERALD : PIPELINE_COLORS[i] || ORANGE }}
              >
                <span className="text-[10px] font-semibold text-white drop-shadow-sm">
                  {stage.count > 0 ? stage.count : ''}
                </span>
              </motion.div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Dashboard Component ───

export function DashboardView() {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      return res.json()
    },
    refetchInterval: 60000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-1">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ListSkeleton />
          <ListSkeleton rows={5} />
          <ListSkeleton rows={5} />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-500 text-3xl">
          ⚠️
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">Failed to Load Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">There was an error fetching dashboard data.</p>
        </div>
      </div>
    )
  }

  const {
    projectStats,
    leadStats,
    bookingStats,
    paymentStats,
    recentActivities,
    monthlySales,
    leadSources,
    pipeline,
    projectWiseSales,
    hotLeads,
    upcomingVisits,
    siteVisitsScheduled,
  } = data

  // Quick stats configuration
  const quickStats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(bookingStats.totalRevenue),
      change: `${paymentStats.revenueTrend > 0 ? '+' : ''}${paymentStats.revenueTrend}%`,
      up: paymentStats.revenueTrend >= 0,
      icon: IndianRupee,
      color: 'text-emerald-600 bg-emerald-50',
      sub: `Collected: ${formatCurrency(paymentStats.totalCollected)}`,
    },
    {
      title: 'Active Leads',
      value: leadStats.total.toString(),
      change: `${leadStats.hot} hot leads`,
      up: true,
      icon: Target,
      color: 'text-orange-600 bg-orange-50',
      sub: `${leadStats.new} new this period`,
    },
    {
      title: 'Units Sold',
      value: `${projectStats.soldUnits} / ${projectStats.totalUnits}`,
      change: `${Math.round((projectStats.soldUnits / Math.max(projectStats.totalUnits, 1)) * 100)}% sold`,
      up: true,
      icon: Building2,
      color: 'text-violet-600 bg-violet-50',
      sub: `${projectStats.availableUnits} available`,
    },
    {
      title: 'Bookings This Month',
      value: bookingStats.thisMonth.toString(),
      change: `${bookingStats.confirmed} confirmed`,
      up: true,
      icon: BarChart3,
      color: 'text-blue-600 bg-blue-50',
      sub: `${bookingStats.pending} pending`,
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(paymentStats.pendingAmount),
      change: `${paymentStats.pendingPaymentsCount} pending`,
      up: false,
      icon: IndianRupee,
      color: 'text-amber-600 bg-amber-50',
      sub: `${paymentStats.totalTransactions} total transactions`,
    },
    {
      title: 'Site Visits',
      value: siteVisitsScheduled.toString(),
      change: 'Scheduled',
      up: true,
      icon: Calendar,
      color: 'text-teal-600 bg-teal-50',
      sub: 'Upcoming visits',
    },
  ]

  // Monthly revenue chart data - format for readability
  const monthlyChartData = monthlySales.map((m) => ({
    ...m,
    revenueLabel: formatCurrency(m.revenue),
    collectedLabel: formatCurrency(m.collected),
  }))

  // Pie chart data
  const pieData = leadSources.map((s) => ({
    name: s.source,
    value: s.count,
  }))

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6"
    >
      {/* ─── Header ─── */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, Rahul! Here&apos;s what&apos;s happening with your properties.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
              <TrendingUp className="size-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* ─── Quick Stats Grid ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className="text-xl font-bold text-slate-900 leading-tight">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="size-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  {stat.up ? (
                    <ArrowUpRight className="size-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="size-3 text-amber-500" />
                  )}
                  <span className={`text-[11px] font-medium ${stat.up ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{stat.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* ─── Charts Row ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Revenue Chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="size-4 text-orange-500" />
                Monthly Revenue
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                Last 6 months
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => formatCurrency(val)}
                    width={55}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" fill={ORANGE} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="collected" name="Collected" fill={EMERALD} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: ORANGE }} />
                <span className="text-[11px] text-slate-500">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: EMERALD }} />
                <span className="text-[11px] text-slate-500">Collected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Source Distribution */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Filter className="size-4 text-orange-500" />
                Lead Source Distribution
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {leadStats.total} total leads
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px' }}
                    formatter={(value: string) => (
                      <span className="text-slate-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Pipeline + Projects Row ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Pipeline Funnel */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Target className="size-4 text-orange-500" />
              Sales Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PipelineFunnel pipeline={pipeline} />
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Conversion Rate</span>
                <span className="font-semibold text-emerald-600">
                  {leadStats.total > 0
                    ? `${Math.round((leadStats.booked / leadStats.total) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Projects */}
        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="size-4 text-orange-500" />
                Top Performing Projects
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {projectStats.total} projects
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectWiseSales.map((project) => {
                const soldPercent = project.totalUnits > 0
                  ? Math.round((project.soldUnits / project.totalUnits) * 100)
                  : 0
                return (
                  <div key={project.id} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{project.name}</span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${
                            project.status === 'Ready to Move'
                              ? 'bg-emerald-50 text-emerald-700'
                              : project.status === 'Under Construction'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">
                        {project.soldUnits}/{project.totalUnits} units
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={soldPercent} className="h-2 flex-1" />
                      <span className="text-xs font-semibold text-orange-600 w-10 text-right">{soldPercent}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Bottom Row: Activity + Hot Leads + Upcoming Visits ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="size-4 text-orange-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div className={`p-1.5 rounded-md ${getActivityBg(activity.type)} mt-0.5 shrink-0`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 leading-tight">{activity.title}</p>
                    {activity.detail && (
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{activity.detail}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[9px] shrink-0">
                    {timeAgo(activity.createdAt)}
                  </Badge>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="size-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hot Leads */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Flame className="size-4 text-orange-500" />
                Hot Leads
              </CardTitle>
              <Badge className="text-[10px] bg-orange-500 text-white hover:bg-orange-600">
                AI Score {'>'} 80
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              {hotLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-orange-50/50 transition-colors group border border-transparent hover:border-orange-100"
                >
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xs font-bold shrink-0 shadow-sm">
                    {lead.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-slate-900 truncate">{lead.name}</p>
                      <div className="flex items-center gap-0.5" title="AI Score">
                        <Brain className="size-3 text-orange-500" />
                        <span className="text-[10px] font-bold text-orange-600">
                          {Math.round(lead.aiScore || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Phone className="size-2.5" />
                        {lead.phone}
                      </span>
                      {lead.interestedIn && (
                        <span className="text-[10px] text-slate-400 truncate">
                          {lead.interestedIn}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-300 group-hover:text-orange-400 transition-colors shrink-0" />
                </div>
              ))}
              {hotLeads.length === 0 && (
                <div className="text-center py-8">
                  <Flame className="size-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No hot leads found</p>
                  <p className="text-[10px] text-slate-300 mt-1">Leads with AI Score {'>'} 80 appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Site Visits */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="size-4 text-orange-500" />
                Upcoming Site Visits
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {siteVisitsScheduled} scheduled
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              {upcomingVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="p-3 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-slate-900">{visit.lead.name}</p>
                    <Badge
                      variant="secondary"
                      className="text-[9px] bg-emerald-50 text-emerald-700"
                    >
                      Scheduled
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Calendar className="size-3 text-orange-400" />
                      <span>{formatDate(visit.scheduledAt)} · {formatTime(visit.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Building2 className="size-3 text-orange-400" />
                      <span>{visit.project.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Users className="size-3" />
                      <span>{visit.assignedTo.name} · {visit.paxCount} pax</span>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingVisits.length === 0 && (
                <div className="text-center py-8">
                  <MapPin className="size-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No upcoming visits</p>
                  <p className="text-[10px] text-slate-300 mt-1">Scheduled visits will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
