'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
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
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  FileText,
  DollarSign,
  Briefcase,
  Home,
} from 'lucide-react'

// ─── Types ───

interface CustomerUser {
  id: string
  name: string
  email: string
}

interface Booking {
  id: string
  bookingNumber: string
  status: string
  totalAmount: number
  bookingAmount: number
  project?: { name: string }
  unit?: { unitNumber: string; type: string }
}

interface Payment {
  id: string
  amount: number
  paymentDate: string
  paymentMode: string
  status: string
  milestone?: string | null
}

interface Customer {
  id: string
  name: string
  email?: string | null
  phone: string
  address?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  panNumber?: string | null
  aadhaarNumber?: string | null
  gstNumber?: string | null
  type: string
  companyName?: string | null
  assignedToId?: string | null
  assignedTo?: CustomerUser | null
  orgId: string
  createdAt: string
  updatedAt: string
  _count?: { bookings: number; payments: number; leads: number }
}

interface CustomerDetail extends Customer {
  bookings: Booking[]
  payments: Payment[]
}

// ─── Constants ───

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// ─── Helpers ───

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

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function TypeBadge({ type }: { type: string }) {
  if (type === 'Corporate') {
    return (
      <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 text-[10px]">
        <Building2 className="size-3 mr-1" />
        Corporate
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-[10px]">
      <User className="size-3 mr-1" />
      Individual
    </Badge>
  )
}

// ─── Loading Skeleton ───

function CustomersSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-10 rounded-lg" />
      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  )
}

// ─── Create Customer Dialog ───

function CreateCustomerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Individual',
    companyName: '',
    panNumber: '',
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create customer')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer created successfully!')
      onOpenChange(false)
      setForm({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', type: 'Individual', companyName: '', panNumber: '' })
    },
    onError: () => {
      toast.error('Failed to create customer')
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
            <Users className="size-5 text-orange-500" />
            Create New Customer
          </DialogTitle>
          <DialogDescription>Add a new customer to your database</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cust-name">Name *</Label>
              <Input
                id="cust-name"
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cust-phone">Phone *</Label>
              <Input
                id="cust-phone"
                placeholder="Phone number"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cust-email">Email</Label>
            <Input
              id="cust-email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.type === 'Corporate' && (
              <div className="space-y-2">
                <Label htmlFor="cust-company">Company Name</Label>
                <Input
                  id="cust-company"
                  placeholder="Company name"
                  value={form.companyName}
                  onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cust-address">Address</Label>
            <Textarea
              id="cust-address"
              placeholder="Full address"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cust-city">City</Label>
              <Input
                id="cust-city"
                placeholder="City"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cust-state">State</Label>
              <Input
                id="cust-state"
                placeholder="State"
                value={form.state}
                onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cust-pincode">Pincode</Label>
              <Input
                id="cust-pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cust-pan">PAN Number</Label>
              <Input
                id="cust-pan"
                placeholder="e.g. ABCDE1234F"
                value={form.panNumber}
                onChange={e => setForm(f => ({ ...f, panNumber: e.target.value.toUpperCase() }))}
                className="uppercase"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Customer Detail Dialog ───

function CustomerDetailDialog({ customer, open, onOpenChange }: { customer: Customer | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [detail, setDetail] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (customer && open) {
      setLoading(true)
      fetch(`/api/customers/${customer.id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed')
          return res.json()
        })
        .then(data => setDetail(data))
        .catch(() => setDetail(null))
        .finally(() => setLoading(false))
    } else {
      setDetail(null)
    }
  }, [customer, open])

  if (!customer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-bold shrink-0">
              {customer.type === 'Corporate' ? '🏢' : getInitials(customer.name)}
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate">{customer.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <TypeBadge type={customer.type} />
                {customer.city && <span className="text-slate-400">{customer.city}</span>}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : detail ? (
          <div className="space-y-5">
            {/* Contact Info */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {detail.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{detail.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="size-3.5 text-slate-400 shrink-0" />
                  {detail.phone}
                </div>
                {(detail.address || detail.city) && (
                  <div className="flex items-start gap-2 text-sm text-slate-600 sm:col-span-2">
                    <MapPin className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {[detail.address, detail.city, detail.state, detail.pincode].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Company Info (if Corporate) */}
            {detail.type === 'Corporate' && (detail.companyName || detail.gstNumber) && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detail.companyName && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building2 className="size-3.5 text-slate-400" />
                      {detail.companyName}
                    </div>
                  )}
                  {detail.gstNumber && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FileText className="size-3.5 text-slate-400" />
                      GST: {detail.gstNumber}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ID Info */}
            {(detail.panNumber || detail.aadhaarNumber) && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Identification</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detail.panNumber && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FileText className="size-3.5 text-slate-400" />
                      PAN: {detail.panNumber}
                    </div>
                  )}
                  {detail.aadhaarNumber && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FileText className="size-3.5 text-slate-400" />
                      Aadhaar: {detail.aadhaarNumber}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assigned To */}
            {detail.assignedTo && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Agent</p>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="size-3.5 text-slate-400" />
                  {detail.assignedTo.name}
                </div>
              </div>
            )}

            <Separator />

            {/* Bookings */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="size-3.5" />
                Bookings ({detail.bookings?.length || 0})
              </p>
              {detail.bookings && detail.bookings.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detail.bookings.map(booking => (
                    <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 shrink-0">
                        <Home className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{booking.bookingNumber}</p>
                        <p className="text-xs text-slate-500">
                          {booking.project?.name || 'N/A'} &middot; {booking.unit?.unitNumber || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(booking.totalAmount)}</p>
                        <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'} className="text-[9px]">
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No bookings yet</p>
              )}
            </div>

            {/* Payments */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="size-3.5" />
                Payments ({detail.payments?.length || 0})
              </p>
              {detail.payments && detail.payments.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detail.payments.map(payment => (
                    <div key={payment.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                        <DollarSign className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-slate-500">
                          {payment.milestone || payment.paymentMode} &middot; {formatDate(payment.paymentDate)}
                        </p>
                      </div>
                      <Badge
                        variant={payment.status === 'Cleared' ? 'default' : 'secondary'}
                        className={`text-[9px] ${
                          payment.status === 'Cleared'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : payment.status === 'Pending'
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : ''
                        }`}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No payments yet</p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100">
              <span>Created: {formatDate(detail.createdAt)}</span>
              <span>Updated: {formatDate(detail.updatedAt)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">Failed to load customer details</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Main View ───

export function CustomersView() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers')
      if (!res.ok) throw new Error('Failed to fetch customers')
      return res.json()
    },
  })

  // Filtered customers
  const filteredCustomers = customers.filter(cust => {
    const matchesSearch =
      !searchQuery ||
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      cust.phone.includes(searchQuery) ||
      (cust.city?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (cust.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || cust.type === typeFilter
    return matchesSearch && matchesType
  })

  // Stats
  const totalCustomers = customers.length
  const individualCount = customers.filter(c => c.type === 'Individual').length
  const corporateCount = customers.filter(c => c.type === 'Corporate').length

  if (isLoading) return <CustomersSkeleton />

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
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your customer database and relationships</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Customer
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50"><Users className="size-4 text-orange-500" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{totalCustomers}</p><p className="text-xs text-slate-500">Total Customers</p></div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-50"><User className="size-4 text-slate-500" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{individualCount}</p><p className="text-xs text-slate-500">Individual</p></div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50"><Building2 className="size-4 text-orange-500" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{corporateCount}</p><p className="text-xs text-slate-500">Corporate</p></div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Individual">Individual</SelectItem>
            <SelectItem value="Corporate">Corporate</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center text-sm text-slate-500">
          {filteredCustomers.length} of {customers.length} customers
        </div>
      </motion.div>

      {/* Customer List */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Users className="size-10 mb-3" />
                <p className="text-sm font-medium">No customers found</p>
                <p className="text-xs mt-1">Try adjusting your search</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {filteredCustomers.map((cust, i) => (
                  <motion.div
                    key={cust.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedCustomer(cust)}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-xs font-bold shrink-0 group-hover:bg-orange-200 transition-colors">
                      {cust.type === 'Corporate' ? '🏢' : getInitials(cust.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate">{cust.name}</p>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {cust.email && <span>{cust.email} &middot; </span>}
                        {cust.city || 'No city'} &middot; {cust.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {cust._count && (
                        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
                          <span>{cust._count.bookings} bookings</span>
                          <span>{cust._count.payments} payments</span>
                        </div>
                      )}
                      <TypeBadge type={cust.type} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <CreateCustomerDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CustomerDetailDialog customer={selectedCustomer} open={!!selectedCustomer} onOpenChange={(v) => { if (!v) setSelectedCustomer(null) }} />
    </motion.div>
  )
}
