'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  FileCheck, Plus, IndianRupee, User, Building2, Home,
  Calendar, Phone, Mail, ArrowRight, AlertTriangle, CheckCircle2,
  XCircle, Clock, CreditCard, TrendingUp, Users, Search,
} from 'lucide-react'

// ─── Types ───

interface BookingCustomer {
  id: string
  name: string
  phone: string
  email: string | null
  type: string
}

interface BookingUnit {
  id: string
  unitNumber: string
  type: string
  bhk: number
  area: number
  price: number
  wing: string | null
  floor: number
  project: { id: string; name: string; city: string }
}

interface BookingBroker {
  id: string
  name: string
  phone: string
  company: string | null
}

interface BookingPayment {
  id: string
  amount: number
  paymentDate: string
  paymentMode: string
  status: string
  milestone: string | null
  dueDate: string | null
}

interface Booking {
  id: string
  bookingNumber: string
  status: string
  bookingAmount: number
  agreementDate: string | null
  possessionDate: string | null
  discount: number
  gstAmount: number
  totalAmount: number
  notes: string | null
  createdAt: string
  customerId: string
  unitId: string
  brokerId: string | null
  projectId: string
  createdById: string
  customer: BookingCustomer
  unit: BookingUnit
  broker: BookingBroker | null
  createdBy: { id: string; name: string }
  project: { id: string; name: string }
  _count: { payments: number; commissions: number }
}

interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  type: string
}

interface AvailableUnit {
  id: string
  unitNumber: string
  type: string
  bhk: number
  area: number
  price: number
  project: { id: string; name: string }
}

interface Broker {
  id: string
  name: string
  phone: string
  company: string | null
  commissionRate: number
}

// ─── Helpers ───

function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)} K`
  return `₹${amount.toLocaleString('en-IN')}`
}

function formatFullCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

function getBookingStatusColor(status: string) {
  switch (status) {
    case 'Confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200'
    case 'Refunded': return 'bg-blue-100 text-blue-700 border-blue-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'Cleared': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Bounced': return 'bg-red-50 text-red-700 border-red-200'
    case 'Failed': return 'bg-red-50 text-red-700 border-red-200'
    default: return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

function getBookingStatusIcon(status: string) {
  switch (status) {
    case 'Confirmed': return <CheckCircle2 className="size-3.5" />
    case 'Pending': return <Clock className="size-3.5" />
    case 'Cancelled': return <XCircle className="size-3.5" />
    case 'Refunded': return <CreditCard className="size-3.5" />
    default: return <FileCheck className="size-3.5" />
  }
}

// ─── Animation Variants ───

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// ─── New Booking Dialog ───

function NewBookingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    customerId: '', unitId: '', brokerId: '', bookingAmount: '', discount: '0', notes: '',
  })

  const { data: customers } = useQuery({
    queryKey: ['customers-for-booking'],
    queryFn: async () => {
      const res = await fetch('/api/customers')
      if (!res.ok) throw new Error('Failed to fetch customers')
      return res.json() as Promise<Customer[]>
    },
    enabled: open,
  })

  const { data: availableUnits } = useQuery({
    queryKey: ['available-units'],
    queryFn: async () => {
      const res = await fetch('/api/units?status=Available')
      if (!res.ok) throw new Error('Failed to fetch available units')
      return res.json() as Promise<AvailableUnit[]>
    },
    enabled: open,
  })

  const { data: brokers } = useQuery({
    queryKey: ['brokers-for-booking'],
    queryFn: async () => {
      const res = await fetch('/api/brokers')
      if (!res.ok) throw new Error('Failed to fetch brokers')
      return res.json() as Promise<Broker[]>
    },
    enabled: open,
  })

  const selectedUnit = availableUnits?.find(u => u.id === form.unitId)

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const unit = availableUnits?.find(u => u.id === data.unitId)
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          bookingAmount: Number(data.bookingAmount) || 0,
          discount: Number(data.discount) || 0,
          totalAmount: unit ? unit.price - (Number(data.discount) || 0) : 0,
          gstAmount: unit ? (unit.price - (Number(data.discount) || 0)) * 0.18 : 0,
          projectId: unit?.project?.id,
          createdById: 'user_admin',
          status: 'Pending',
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create booking')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['units'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Booking created successfully!')
      onOpenChange(false)
      setForm({ customerId: '', unitId: '', brokerId: '', bookingAmount: '', discount: '0', notes: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create booking'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerId || !form.unitId) {
      toast.error('Please select a customer and unit')
      return
    }
    createMutation.mutate(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>Create a new property booking</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Customer *</Label>
            <Select value={form.customerId} onValueChange={v => setForm({ ...form, customerId: v })}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.type === 'Corporate' ? `(${c.type})` : ''} - {c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Unit *</Label>
            <Select value={form.unitId} onValueChange={v => setForm({ ...form, unitId: v, bookingAmount: String(Math.round((availableUnits?.find(u => u.id === v)?.price || 0) * 0.1)) })}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select available unit" />
              </SelectTrigger>
              <SelectContent>
                {availableUnits?.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.unitNumber} - {u.project.name} ({u.bhk} BHK, {formatIndianCurrency(u.price)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUnit && (
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-500">Type:</span> <span className="font-medium">{selectedUnit.type} - {selectedUnit.bhk} BHK</span></div>
                  <div><span className="text-slate-500">Area:</span> <span className="font-medium">{selectedUnit.area} sqft</span></div>
                  <div><span className="text-slate-500">Project:</span> <span className="font-medium">{selectedUnit.project.name}</span></div>
                  <div><span className="text-slate-500">Price:</span> <span className="font-medium text-orange-600">{formatFullCurrency(selectedUnit.price)}</span></div>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label>Broker</Label>
            <Select value={form.brokerId} onValueChange={v => setForm({ ...form, brokerId: v })}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select broker (optional)" />
              </SelectTrigger>
              <SelectContent>
                {brokers?.map(b => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} {b.company ? `(${b.company})` : ''} - {b.commissionRate}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Booking Amount (₹)</Label>
              <Input type="number" value={form.bookingAmount} onChange={e => setForm({ ...form, bookingAmount: e.target.value })} placeholder="Booking amount" className="mt-1" />
            </div>
            <div>
              <Label>Discount (₹)</Label>
              <Input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} placeholder="0" className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." className="mt-1" rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Booking Details Dialog ───

function BookingDetailsDialog({ booking, open, onOpenChange }: { booking: Booking | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()

  const { data: bookingDetail, isLoading } = useQuery({
    queryKey: ['booking-detail', booking?.id],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${booking!.id}`)
      if (!res.ok) throw new Error('Failed to fetch booking details')
      return res.json()
    },
    enabled: open && !!booking?.id,
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update booking status')
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['units'] })
      const action = variables.status === 'Confirmed' ? 'confirmed' : variables.status === 'Cancelled' ? 'cancelled' : 'updated'
      toast.success(`Booking ${action} successfully!`)
      onOpenChange(false)
    },
    onError: () => toast.error('Failed to update booking status'),
  })

  if (!booking) return null

  const payments: BookingPayment[] = bookingDetail?.payments || []
  const totalPaid = payments.filter(p => p.status === 'Cleared').reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{booking.bookingNumber}</span>
            <Badge className={`text-xs ${getBookingStatusColor(booking.status)}`}>
              <span className="flex items-center gap-1">{getBookingStatusIcon(booking.status)} {booking.status}</span>
            </Badge>
          </DialogTitle>
          <DialogDescription>Booking details and payment schedule</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Customer & Unit Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1"><User className="size-3" /> Customer</p>
                  <p className="text-sm font-semibold text-slate-900">{booking.customer.name}</p>
                  <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                    <p className="flex items-center gap-1"><Phone className="size-2.5" /> {booking.customer.phone}</p>
                    {booking.customer.email && <p className="flex items-center gap-1"><Mail className="size-2.5" /> {booking.customer.email}</p>}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1"><Home className="size-3" /> Unit</p>
                  <p className="text-sm font-semibold text-slate-900">{booking.unit.unitNumber}</p>
                  <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                    <p>{booking.unit.project.name} - {booking.unit.bhk} BHK, {booking.unit.area} sqft</p>
                    <p className="font-medium text-orange-600">{formatFullCurrency(booking.unit.price)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Broker Info */}
            {booking.broker && (
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Users className="size-3" /> Broker</p>
                  <p className="text-sm font-semibold text-slate-900">{booking.broker.name} {booking.broker.company ? `(${booking.broker.company})` : ''}</p>
                </CardContent>
              </Card>
            )}

            {/* Financial Summary */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-orange-600 mb-3 flex items-center gap-1"><IndianRupee className="size-3" /> Financial Summary</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Total Amount</p>
                    <p className="text-sm font-bold text-slate-900">{formatFullCurrency(booking.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Booking Amount</p>
                    <p className="text-sm font-bold text-slate-900">{formatFullCurrency(booking.bookingAmount)}</p>
                  </div>
                  {booking.discount > 0 && (
                    <div>
                      <p className="text-xs text-slate-500">Discount</p>
                      <p className="text-sm font-bold text-emerald-600">-{formatFullCurrency(booking.discount)}</p>
                    </div>
                  )}
                  {booking.gstAmount > 0 && (
                    <div>
                      <p className="text-xs text-slate-500">GST</p>
                      <p className="text-sm font-bold text-slate-900">{formatFullCurrency(booking.gstAmount)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Progress */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Payment Progress</span>
                <span className="font-medium">{booking.totalAmount > 0 ? Math.round((totalPaid / booking.totalAmount) * 100) : 0}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${booking.totalAmount > 0 ? Math.round((totalPaid / booking.totalAmount) * 100) : 0}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>Paid: {formatIndianCurrency(totalPaid)}</span>
                <span>Pending: {formatIndianCurrency(totalPending)}</span>
              </div>
            </div>

            {/* Payment Schedule */}
            {payments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1"><CreditCard className="size-3" /> Payment Schedule</p>
                <div className="space-y-2">
                  {payments.map((p: BookingPayment) => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                      <Badge className={`text-[9px] px-1.5 py-0 ${getPaymentStatusColor(p.status)}`}>{p.status}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900">{p.milestone || 'Payment'}</p>
                        <p className="text-[10px] text-slate-400">{p.paymentMode} • {new Date(p.paymentDate).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-900">{formatIndianCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded">{booking.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            {booking.status === 'Pending' && (
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'Cancelled' })}
                  disabled={updateStatusMutation.isPending}
                >
                  <XCircle className="size-4 mr-1" /> Cancel Booking
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'Confirmed' })}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle2 className="size-4 mr-1" /> Confirm Booking
                </Button>
              </DialogFooter>
            )}
            {booking.status === 'Confirmed' && (
              <DialogFooter>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'Cancelled' })}
                  disabled={updateStatusMutation.isPending}
                >
                  <XCircle className="size-4 mr-1" /> Cancel Booking
                </Button>
              </DialogFooter>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Bookings View ───

export function BookingsView() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await fetch('/api/bookings')
      if (!res.ok) throw new Error('Failed to fetch bookings')
      return res.json() as Promise<Booking[]>
    },
  })

  const filteredBookings = bookings?.filter(b =>
    b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    b.project.name.toLowerCase().includes(search.toLowerCase()) ||
    b.unit.unitNumber.toLowerCase().includes(search.toLowerCase())
  ) || []

  // Stats
  const confirmed = bookings?.filter(b => b.status === 'Confirmed') || []
  const pending = bookings?.filter(b => b.status === 'Pending') || []
  const totalRevenue = confirmed.reduce((sum, b) => sum + b.totalAmount, 0)
  const pendingValue = pending.reduce((sum, b) => sum + b.totalAmount, 0)

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setDetailOpen(true)
  }

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
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage property bookings and agreements</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 mr-2" />
          New Booking
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <Input placeholder="Search bookings, customers, projects..." className="pl-8 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50"><CheckCircle2 className="size-4 text-emerald-500" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{confirmed.length}</p><p className="text-xs text-slate-500">Confirmed</p></div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50"><Clock className="size-4 text-amber-500" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{pending.length}</p><p className="text-xs text-slate-500">Pending</p></div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50"><IndianRupee className="size-4 text-orange-500" /></div>
            <div><p className="text-xl font-bold text-slate-900">{formatIndianCurrency(totalRevenue)}</p><p className="text-xs text-slate-500">Confirmed Value</p></div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50"><TrendingUp className="size-4 text-blue-500" /></div>
            <div><p className="text-xl font-bold text-slate-900">{formatIndianCurrency(pendingValue)}</p><p className="text-xs text-slate-500">Pipeline Value</p></div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bookings List */}
      <motion.div variants={itemVariants}>
        {isLoading ? (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileCheck className="size-10 mx-auto mb-3" />
            <p className="text-sm font-medium">No bookings found</p>
            <p className="text-xs mt-1">Create a new booking to get started</p>
          </div>
        ) : (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">All Bookings ({filteredBookings.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <div className="divide-y">
                  <AnimatePresence>
                    {filteredBookings.map((booking, idx) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.25 }}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => handleBookingClick(booking)}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 shrink-0">
                          <FileCheck className="size-4 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-slate-900">{booking.bookingNumber}</p>
                            <Badge className={`text-[10px] px-1.5 py-0 ${getBookingStatusColor(booking.status)}`}>
                              <span className="flex items-center gap-0.5">{getBookingStatusIcon(booking.status)} {booking.status}</span>
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            <span className="font-medium">{booking.customer.name}</span>
                            {' · '}
                            {booking.project.name} - {booking.unit.unitNumber}
                            {' · '}
                            {booking.unit.bhk} BHK, {booking.unit.area} sqft
                          </p>
                          {booking.broker && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Broker: {booking.broker.name} {booking.broker.company ? `(${booking.broker.company})` : ''}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-slate-900">{formatIndianCurrency(booking.totalAmount)}</p>
                          {booking.discount > 0 && (
                            <p className="text-[10px] text-emerald-600">-{formatIndianCurrency(booking.discount)} disc.</p>
                          )}
                        </div>
                        <ArrowRight className="size-4 text-slate-300 shrink-0" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* New Booking Dialog */}
      <NewBookingDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Booking Details Dialog */}
      <BookingDetailsDialog booking={selectedBooking} open={detailOpen} onOpenChange={setDetailOpen} />
    </motion.div>
  )
}
