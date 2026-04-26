'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Target,
  Plus,
  Flame,
  Snowflake,
  Thermometer,
  Search,
  Clock,
  Phone,
  Mail,
  DollarSign,
  Building2,
  User,
  Calendar,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'

// ─── Types ───

interface LeadUser {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string | null
}

interface LeadCustomer {
  id: string
  name: string
  phone: string
}

interface Lead {
  id: string
  name: string
  email?: string | null
  phone: string
  alternatePhone?: string | null
  source: string
  status: string
  priority: string
  budget?: number | null
  budgetMin?: number | null
  budgetMax?: number | null
  interestedIn?: string | null
  notes?: string | null
  aiScore?: number | null
  aiInsights?: string | null
  lastContactedAt?: string | null
  nextFollowUp?: string | null
  assignedToId?: string | null
  assignedTo?: LeadUser | null
  customerId?: string | null
  customer?: LeadCustomer | null
  orgId: string
  createdAt: string
  updatedAt: string
  _count?: { visits: number; activities: number }
}

// ─── Constants ───

const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Site Visit', 'Negotiation', 'Booked', 'Lost']
const LEAD_SOURCES = ['Website', 'Referral', 'Walk-in', 'Social Media', 'Broker', 'Advertisement', 'Other']
const PRIORITIES = ['Hot', 'Warm', 'Medium', 'Cold']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// ─── Helpers ───

function PriorityIcon({ priority }: { priority: string }) {
  if (priority === 'Hot') return <Flame className="size-3.5 text-red-500" />
  if (priority === 'Cold') return <Snowflake className="size-3.5 text-blue-400" />
  return <Thermometer className="size-3.5 text-amber-500" />
}

function ScoreBadge({ score }: { score: number | null | undefined }) {
  const s = score ?? 0
  const color =
    s >= 80
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : s >= 60
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-red-50 text-red-700 border-red-200'
  const dotColor =
    s >= 80
      ? 'bg-emerald-500'
      : s >= 60
        ? 'bg-amber-500'
        : 'bg-red-500'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>
      <span className={`size-1.5 rounded-full ${dotColor}`} />
      AI: {s}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    'New': 'bg-slate-100 text-slate-700 border-slate-200',
    'Contacted': 'bg-blue-50 text-blue-700 border-blue-200',
    'Qualified': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Site Visit': 'bg-violet-50 text-violet-700 border-violet-200',
    'Negotiation': 'bg-amber-50 text-amber-700 border-amber-200',
    'Booked': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Lost': 'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${colorMap[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  )
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Loading Skeleton ───

function LeadsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>
      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  )
}

// ─── Create Lead Dialog ───

function CreateLeadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    priority: 'Medium',
    budgetMin: '',
    budgetMax: '',
    interestedIn: '',
    notes: '',
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          budgetMin: data.budgetMin ? parseFloat(data.budgetMin) : undefined,
          budgetMax: data.budgetMax ? parseFloat(data.budgetMax) : undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to create lead')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead created successfully!')
      onOpenChange(false)
      setForm({ name: '', email: '', phone: '', source: 'Website', priority: 'Medium', budgetMin: '', budgetMax: '', interestedIn: '', notes: '' })
    },
    onError: () => {
      toast.error('Failed to create lead')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      toast.error('Name and phone are required')
      return
    }
    createMutation.mutate(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="size-5 text-orange-500" />
            Create New Lead
          </DialogTitle>
          <DialogDescription>Add a new lead to your sales pipeline</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead-name">Name *</Label>
              <Input
                id="lead-name"
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-phone">Phone *</Label>
              <Input
                id="lead-phone"
                placeholder="Phone number"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-email">Email</Label>
            <Input
              id="lead-email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead-budget-min">Budget Min (₹)</Label>
              <Input
                id="lead-budget-min"
                type="number"
                placeholder="e.g. 5000000"
                value={form.budgetMin}
                onChange={e => setForm(f => ({ ...f, budgetMin: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-budget-max">Budget Max (₹)</Label>
              <Input
                id="lead-budget-max"
                type="number"
                placeholder="e.g. 15000000"
                value={form.budgetMax}
                onChange={e => setForm(f => ({ ...f, budgetMax: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-interested">Interested In</Label>
            <Input
              id="lead-interested"
              placeholder="Project or unit preference"
              value={form.interestedIn}
              onChange={e => setForm(f => ({ ...f, interestedIn: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-notes">Notes</Label>
            <Textarea
              id="lead-notes"
              placeholder="Additional notes..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Lead Detail Dialog ───

function LeadDetailDialog({ lead, open, onOpenChange }: { lead: Lead | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  React.useEffect(() => {
    if (lead) {
      setSelectedStatus(lead.status)
    }
  }, [lead])

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead status updated!')
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })

  if (!lead) return null

  const overdue = isOverdue(lead.nextFollowUp)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-bold shrink-0">
              {getInitials(lead.name)}
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate">{lead.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <PriorityIcon priority={lead.priority} />
                {lead.priority} Priority &middot; {lead.source}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* AI Score */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-orange-500" />
              <span className="text-sm font-medium text-slate-700">AI Lead Score</span>
            </div>
            <ScoreBadge score={lead.aiScore} />
          </div>

          {lead.aiInsights && (
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
              <p className="text-xs font-medium text-orange-700 mb-1">AI Insights</p>
              <p className="text-sm text-orange-800">{lead.aiInsights}</p>
            </div>
          )}

          {/* Status Update */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Update Status</Label>
            <div className="flex items-center gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={selectedStatus === lead.status || updateStatusMutation.isPending}
                onClick={() => updateStatusMutation.mutate({ id: lead.id, status: selectedStatus })}
              >
                Update
              </Button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {LEAD_STATUSES.map((s, i) => (
                <React.Fragment key={s}>
                  {i > 0 && <ChevronRight className="size-3 text-slate-300" />}
                  <span className={`text-[10px] ${s === lead.status ? 'font-bold text-orange-600' : 'text-slate-400'}`}>
                    {s}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {lead.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="size-3.5 text-slate-400" />
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="size-3.5 text-slate-400" />
                {lead.phone}
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget</p>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <DollarSign className="size-3.5 text-slate-400" />
              {lead.budgetMin || lead.budgetMax
                ? `${formatCurrency(lead.budgetMin)} — ${formatCurrency(lead.budgetMax)}`
                : lead.budget
                  ? formatCurrency(lead.budget)
                  : 'Not specified'}
            </div>
          </div>

          {/* Interest */}
          {lead.interestedIn && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interested In</p>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Building2 className="size-3.5 text-slate-400" />
                {lead.interestedIn}
              </div>
            </div>
          )}

          {/* Assigned To */}
          {lead.assignedTo && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned To</p>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <User className="size-3.5 text-slate-400" />
                {lead.assignedTo.name}
              </div>
            </div>
          )}

          {/* Follow Up */}
          {lead.nextFollowUp && (
            <div className={`p-3 rounded-lg border ${overdue ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-2">
                {overdue ? (
                  <AlertTriangle className="size-4 text-red-500" />
                ) : (
                  <Calendar className="size-4 text-slate-400" />
                )}
                <div>
                  <p className={`text-xs font-medium ${overdue ? 'text-red-700' : 'text-slate-500'}`}>
                    {overdue ? 'Follow-up Overdue!' : 'Next Follow-up'}
                  </p>
                  <p className={`text-sm ${overdue ? 'text-red-800' : 'text-slate-700'}`}>
                    {formatDate(lead.nextFollowUp)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{lead.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100">
            <span>Created: {formatDate(lead.createdAt)}</span>
            <span>Updated: {formatDate(lead.updatedAt)}</span>
            {lead._count && (
              <>
                <span>Visits: {lead._count.visits}</span>
                <span>Activities: {lead._count.activities}</span>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main View ───

export function LeadsView() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [detailLead, setDetailLead] = useState<Lead | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await fetch('/api/leads')
      if (!res.ok) throw new Error('Failed to fetch leads')
      return res.json()
    },
  })

  // Filtered leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      !searchQuery ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.interestedIn?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter
    return matchesSearch && matchesStatus && matchesPriority && matchesSource
  })

  // Stats
  const hotCount = leads.filter(l => l.priority === 'Hot').length
  const warmCount = leads.filter(l => l.priority === 'Warm').length
  const coldCount = leads.filter(l => l.priority === 'Cold').length
  const mediumCount = leads.filter(l => l.priority === 'Medium').length

  // Follow-ups overdue
  const followUpOverdue = leads.filter(l => isOverdue(l.nextFollowUp))

  if (isLoading) return <LeadsSkeleton />

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
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Track and manage your sales leads with AI scoring</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Lead
        </Button>
      </motion.div>

      {/* Priority Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50"><Flame className="size-4 text-red-500" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{hotCount}</p><p className="text-xs text-slate-500">Hot Leads</p></div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50"><Thermometer className="size-4 text-amber-500" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{warmCount}</p><p className="text-xs text-slate-500">Warm Leads</p></div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-50"><Target className="size-4 text-slate-400" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{mediumCount}</p><p className="text-xs text-slate-500">Medium</p></div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50"><Snowflake className="size-4 text-blue-400" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{coldCount}</p><p className="text-xs text-slate-500">Cold Leads</p></div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Follow-up Due Section */}
      <AnimatePresence>
        {followUpOverdue.length > 0 && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <Clock className="size-4" />
                  Follow-up Overdue ({followUpOverdue.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {followUpOverdue.map(lead => (
                    <div
                      key={lead.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white border border-red-200 cursor-pointer hover:shadow-sm transition-shadow shrink-0 min-w-[260px]"
                      onClick={() => setDetailLead(lead)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold shrink-0">
                        {getInitials(lead.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{lead.name}</p>
                        <p className="text-xs text-red-600">
                          Due: {formatDate(lead.nextFollowUp)}
                        </p>
                      </div>
                      <PriorityIcon priority={lead.priority} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {LEAD_STATUSES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {PRIORITIES.map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {LEAD_SOURCES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Leads List */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">All Leads</CardTitle>
              <span className="text-xs text-slate-400">{filteredLeads.length} of {leads.length} leads</span>
            </div>
          </CardHeader>
          <CardContent>
            {filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Target className="size-10 mb-3" />
                <p className="text-sm font-medium">No leads found</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {filteredLeads.map((lead, i) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => setDetailLead(lead)}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-xs font-bold shrink-0 group-hover:bg-orange-200 transition-colors">
                      {getInitials(lead.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate">{lead.name}</p>
                        <PriorityIcon priority={lead.priority} />
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {lead.interestedIn || 'No preference'} &middot; {lead.source}
                        {lead.assignedTo && <span className="text-slate-400"> &middot; {lead.assignedTo.name}</span>}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <ScoreBadge score={lead.aiScore} />
                      <StatusBadge status={lead.status} />
                    </div>
                    <div className="flex sm:hidden items-center gap-1.5">
                      <span className={`size-2 rounded-full ${
                        (lead.aiScore ?? 0) >= 80 ? 'bg-emerald-500' :
                        (lead.aiScore ?? 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <StatusBadge status={lead.status} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <CreateLeadDialog open={createOpen} onOpenChange={setCreateOpen} />
      <LeadDetailDialog lead={detailLead} open={!!detailLead} onOpenChange={(v) => { if (!v) setDetailLead(null) }} />
    </motion.div>
  )
}
