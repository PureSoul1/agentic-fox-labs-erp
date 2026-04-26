'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Tooltip,
} from 'recharts'
import {
  Download,
  TrendingUp,
  IndianRupee,
  Users,
  Building2,
  BarChart3,
  ArrowUpRight,
  Target,
} from 'lucide-react'
import { formatIndianCurrency, formatRupees } from '@/lib/format'

// ─── Types ───

interface SalesByProject {
  projectId: string
  projectName: string
  city: string
  type: string
  status: string
  totalUnits: number
  available: number
  sold: number
  confirmedBookings: number
  totalRevenue: number
  totalDiscount: number
  totalGST: number
  inventoryValue: number
  soldValue: number
  absorptionRate: string
}

interface RevenueByMonth {
  month: string
  year: number
  bookings: number
  bookingAmount: number
  discount: number
  collected: number
}

interface LeadFunnelItem {
  status: string
  count: number
  conversionRate: string | null
}

interface BrokerPerformance {
  brokerId: string
  brokerName: string
  company: string | null
  commissionRate: number
  totalBookings: number
  totalRevenue: number
  totalCommission: number
  paidCommission: number
  pendingCommission: number
}

interface PaymentCollectionStatus {
  total: { amount: number; count: number }
  cleared: { amount: number; count: number }
  pending: { amount: number; count: number }
  bounced: { amount: number; count: number }
  failed: { amount: number; count: number }
  collectionRate: string
  byMilestone: { milestone: string; amount: number; count: number }[]
}

interface ReportsData {
  salesByProject: SalesByProject[]
  revenueByMonth: RevenueByMonth[]
  leadConversionFunnel: {
    funnel: LeadFunnelItem[]
    totalLeads: number
    bookedLeads: number
    overallConversionRate: string
  }
  brokerPerformance: BrokerPerformance[]
  paymentCollectionStatus: PaymentCollectionStatus
}

// ─── Chart Configs ───

const salesChartConfig: ChartConfig = {
  sold: { label: 'Sold', color: '#F97316' },
  available: { label: 'Available', color: '#94a3b8' },
}

const revenueChartConfig: ChartConfig = {
  bookingAmount: { label: 'Bookings', color: '#F97316' },
  collected: { label: 'Collected', color: '#10b981' },
}

const funnelChartConfig: ChartConfig = {
  count: { label: 'Leads', color: '#F97316' },
}

const brokerChartConfig: ChartConfig = {
  totalRevenue: { label: 'Revenue', color: '#F97316' },
  totalCommission: { label: 'Commission', color: '#f59e0b' },
}

const pieChartConfig: ChartConfig = {
  New: { label: 'New', color: '#F97316' },
  Contacted: { label: 'Contacted', color: '#f59e0b' },
  Qualified: { label: 'Qualified', color: '#10b981' },
  'Site Visit': { label: 'Site Visit', color: '#3b82f6' },
  Negotiation: { label: 'Negotiation', color: '#8b5cf6' },
  Booked: { label: 'Booked', color: '#06b6d4' },
  Lost: { label: 'Lost', color: '#ef4444' },
}

const paymentPieConfig: ChartConfig = {
  Cleared: { label: 'Cleared', color: '#10b981' },
  Pending: { label: 'Pending', color: '#f59e0b' },
  Bounced: { label: 'Bounced', color: '#ef4444' },
  Failed: { label: 'Failed', color: '#dc2626' },
}

const milestoneChartConfig: ChartConfig = {
  amount: { label: 'Amount', color: '#F97316' },
}

const PIE_COLORS = ['#F97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#ef4444']

// ─── Animation Variants ───

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// ─── Component ───

export function ReportsView() {
  const { data: reports, isLoading } = useQuery<ReportsData>({
    queryKey: ['reports'],
    queryFn: () => fetch('/api/reports').then(r => r.json()),
  })

  if (isLoading || !reports) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
        <div className="h-64 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  const { salesByProject, revenueByMonth, leadConversionFunnel, brokerPerformance, paymentCollectionStatus } = reports

  // Compute summary stats
  const totalRevenue = salesByProject.reduce((sum, p) => sum + p.totalRevenue, 0)
  const totalSold = salesByProject.reduce((sum, p) => sum + p.sold, 0)
  const totalUnits = salesByProject.reduce((sum, p) => sum + p.totalUnits, 0)

  // Lead source data for pie chart
  const funnelData = leadConversionFunnel.funnel.filter(f => f.status !== 'Lost')

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time business intelligence dashboards</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="size-4 mr-2" />
          Export Report
        </Button>
      </motion.div>

      {/* KPI Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50"><IndianRupee className="size-4 text-emerald-500" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatIndianCurrency(totalRevenue)}</p>
              <p className="text-xs text-slate-500">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50"><Building2 className="size-4 text-orange-500" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalSold}/{totalUnits}</p>
              <p className="text-xs text-slate-500">Units Sold</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50"><Target className="size-4 text-blue-500" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{leadConversionFunnel.overallConversionRate}%</p>
              <p className="text-xs text-slate-500">Lead Conversion</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50"><ArrowUpRight className="size-4 text-amber-500" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{paymentCollectionStatus.collectionRate}%</p>
              <p className="text-xs text-slate-500">Collection Rate</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabbed Report Views */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList className="w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="sales" className="flex items-center gap-1.5">
              <BarChart3 className="size-3.5" /> Sales
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-1.5">
              <Users className="size-3.5" /> Leads
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-1.5">
              <IndianRupee className="size-3.5" /> Financial
            </TabsTrigger>
            <TabsTrigger value="brokers" className="flex items-center gap-1.5">
              <TrendingUp className="size-3.5" /> Brokers
            </TabsTrigger>
          </TabsList>

          {/* ─── SALES OVERVIEW TAB ─── */}
          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Sales by Project - Bar Chart */}
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sales by Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={salesChartConfig} className="h-[280px] w-full">
                    <BarChart data={salesByProject} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="projectName"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => v.length > 12 ? v.substring(0, 12) + '…' : v}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="sold" fill="var(--color-sold)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="available" fill="var(--color-available)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Revenue by Month - Area Chart */}
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={revenueChartConfig} className="h-[280px] w-full">
                    <AreaChart data={revenueByMonth} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => v >= 10000000 ? `${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v / 100000).toFixed(0)}L` : String(v)}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => formatRupees(Number(value))}
                          />
                        }
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Area
                        type="monotone"
                        dataKey="bookingAmount"
                        stroke="var(--color-bookingAmount)"
                        fill="var(--color-bookingAmount)"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="collected"
                        stroke="var(--color-collected)"
                        fill="var(--color-collected)"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Sales Data Table */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Project Sales Detail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Units</TableHead>
                        <TableHead className="text-right">Sold</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Absorption</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesByProject.map((p) => (
                        <TableRow key={p.projectId}>
                          <TableCell className="font-medium">{p.projectName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{p.type}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{p.totalUnits}</TableCell>
                          <TableCell className="text-right">{p.sold}</TableCell>
                          <TableCell className="text-right font-medium">{formatIndianCurrency(p.totalRevenue)}</TableCell>
                          <TableCell className="text-right">{p.absorptionRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── LEAD ANALYTICS TAB ─── */}
          <TabsContent value="leads" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Lead Source Pie Chart */}
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Lead Pipeline Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={pieChartConfig} className="h-[280px] w-full">
                    <PieChart>
                      <Pie
                        data={leadConversionFunnel.funnel}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={2}
                        label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {leadConversionFunnel.funnel.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Lead Funnel - Bar Chart */}
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Lead Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={funnelChartConfig} className="h-[280px] w-full">
                    <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="status"
                        tick={{ fontSize: 11 }}
                        width={75}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Funnel Data Table */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Lead Pipeline Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stage</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Conversion Rate</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leadConversionFunnel.funnel.map((item) => (
                        <TableRow key={item.status}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: PIE_COLORS[leadConversionFunnel.funnel.indexOf(item) % PIE_COLORS.length] }}
                              />
                              <span className="font-medium">{item.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{item.count}</TableCell>
                          <TableCell className="text-right">
                            {item.conversionRate ? `${item.conversionRate}%` : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            {leadConversionFunnel.totalLeads > 0
                              ? `${((item.count / leadConversionFunnel.totalLeads) * 100).toFixed(1)}%`
                              : '0%'}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold bg-slate-50">
                        <TableCell>Total Leads</TableCell>
                        <TableCell className="text-right">{leadConversionFunnel.totalLeads}</TableCell>
                        <TableCell className="text-right" colSpan={2}>
                          Overall Conversion: {leadConversionFunnel.overallConversionRate}%
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── FINANCIAL SUMMARY TAB ─── */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Payment Collection Status Pie */}
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Payment Collection Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={paymentPieConfig} className="h-[280px] w-full">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Cleared', value: paymentCollectionStatus.cleared.amount },
                          { name: 'Pending', value: paymentCollectionStatus.pending.amount },
                          { name: 'Bounced', value: paymentCollectionStatus.bounced.amount },
                          { name: 'Failed', value: paymentCollectionStatus.failed.amount },
                        ].filter(d => d.value > 0)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={2}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        <Cell fill="var(--color-Cleared)" />
                        <Cell fill="var(--color-Pending)" />
                        <Cell fill="var(--color-Bounced)" />
                        <Cell fill="var(--color-Failed)" />
                      </Pie>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => formatRupees(Number(value))}
                          />
                        }
                      />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Milestone-wise Collection */}
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Collection by Milestone</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={milestoneChartConfig} className="h-[280px] w-full">
                    <BarChart
                      data={paymentCollectionStatus.byMilestone}
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="milestone"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v) => v.length > 10 ? v.substring(0, 10) + '…' : v}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => v >= 10000000 ? `${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v / 100000).toFixed(0)}L` : String(v)}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => formatRupees(Number(value))}
                          />
                        }
                      />
                      <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Financial Summary Table */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  {[
                    { label: 'Total', amount: paymentCollectionStatus.total.amount, count: paymentCollectionStatus.total.count, color: 'text-slate-900', bg: 'bg-slate-50' },
                    { label: 'Cleared', amount: paymentCollectionStatus.cleared.amount, count: paymentCollectionStatus.cleared.count, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Pending', amount: paymentCollectionStatus.pending.amount, count: paymentCollectionStatus.pending.count, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Bounced', amount: paymentCollectionStatus.bounced.amount, count: paymentCollectionStatus.bounced.count, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Failed', amount: paymentCollectionStatus.failed.amount, count: paymentCollectionStatus.failed.count, color: 'text-red-700', bg: 'bg-red-50' },
                  ].map((item) => (
                    <div key={item.label} className={`${item.bg} rounded-lg p-3`}>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className={`text-lg font-bold ${item.color}`}>{formatIndianCurrency(item.amount)}</p>
                      <p className="text-xs text-slate-400">{item.count} payments</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Milestone</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Payments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentCollectionStatus.byMilestone.map((m) => (
                        <TableRow key={m.milestone}>
                          <TableCell className="font-medium">{m.milestone}</TableCell>
                          <TableCell className="text-right">{formatRupees(m.amount)}</TableCell>
                          <TableCell className="text-right">{m.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── BROKER PERFORMANCE TAB ─── */}
          <TabsContent value="brokers" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Broker Revenue Comparison */}
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Broker Revenue Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={brokerChartConfig} className="h-[280px] w-full">
                    <BarChart data={brokerPerformance} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="brokerName"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => v.length > 12 ? v.substring(0, 12) + '…' : v}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => v >= 10000000 ? `${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v / 100000).toFixed(0)}L` : String(v)}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => formatRupees(Number(value))}
                          />
                        }
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="totalRevenue" fill="var(--color-totalRevenue)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="totalCommission" fill="var(--color-totalCommission)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Commission Status */}
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Commission Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      paidCommission: { label: 'Paid', color: '#10b981' },
                      pendingCommission: { label: 'Pending', color: '#f59e0b' },
                    }}
                    className="h-[280px] w-full"
                  >
                    <BarChart data={brokerPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => v >= 100000 ? `${(v / 100000).toFixed(0)}L` : String(v)}
                      />
                      <YAxis
                        type="category"
                        dataKey="brokerName"
                        tick={{ fontSize: 11 }}
                        width={75}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => formatRupees(Number(value))}
                          />
                        }
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="paidCommission" stackId="a" fill="var(--color-paidCommission)" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="pendingCommission" stackId="a" fill="var(--color-pendingCommission)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Broker Performance Table */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Broker Performance Detail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Broker</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Bookings</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Pending</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brokerPerformance.map((b) => (
                        <TableRow key={b.brokerId}>
                          <TableCell className="font-medium">{b.brokerName}</TableCell>
                          <TableCell className="text-slate-500">{b.company || '—'}</TableCell>
                          <TableCell className="text-right">{b.commissionRate}%</TableCell>
                          <TableCell className="text-right">{b.totalBookings}</TableCell>
                          <TableCell className="text-right font-medium">{formatIndianCurrency(b.totalRevenue)}</TableCell>
                          <TableCell className="text-right">{formatIndianCurrency(b.totalCommission)}</TableCell>
                          <TableCell className="text-right text-emerald-600">{formatIndianCurrency(b.paidCommission)}</TableCell>
                          <TableCell className="text-right text-amber-600">{formatIndianCurrency(b.pendingCommission)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
