'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { CreditCard, Plus, ArrowUpRight, CheckCircle2, Calendar, IndianRupee } from 'lucide-react'
import { formatIndianCurrency, formatRupees, formatDate, getPaymentStatusColor } from '@/lib/format'

interface Payment {
  id: string
  amount: number
  paymentDate: string
  paymentMode: string
  transactionRef: string | null
  status: string
  milestone: string | null
  dueDate: string | null
  notes: string | null
  customerId: string
  bookingId: string
  customer: { id: string; name: string; phone: string; email: string | null }
  booking: {
    id: string; bookingNumber: string; status: string; totalAmount: number
    unit: { id: string; unitNumber: string; project: { id: string; name: string } }
  }
  createdAt: string
}

interface Booking {
  id: string
  bookingNumber: string
  customer: { id: string; name: string }
  unit: { unitNumber: string; project: { name: string } }
  totalAmount: number
  status: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export function PaymentsView() {
  const queryClient = useQueryClient()
  const [showRecordDialog, setShowRecordDialog] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [newPayment, setNewPayment] = useState({
    amount: '',
    paymentMode: 'Bank Transfer',
    milestone: '',
    transactionRef: '',
    notes: '',
  })

  // Fetch payments
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: () => fetch('/api/payments').then(r => r.json()),
  })

  // Fetch bookings for the select dropdown
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: () => fetch('/api/bookings').then(r => r.json()),
  })

  // Mark payment as cleared
  const markClearedMutation = useMutation({
    mutationFn: (id: string) =>
      fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Cleared' }),
      }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Payment marked as cleared')
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: () => toast.error('Failed to update payment'),
  })

  // Create payment
  const createPaymentMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Payment recorded successfully')
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowRecordDialog(false)
      resetForm()
    },
    onError: () => toast.error('Failed to record payment'),
  })

  function resetForm() {
    setSelectedBookingId('')
    setNewPayment({ amount: '', paymentMode: 'Bank Transfer', milestone: '', transactionRef: '', notes: '' })
  }

  function handleRecordPayment() {
    if (!selectedBookingId) {
      toast.error('Please select a booking')
      return
    }
    if (!newPayment.amount || Number(newPayment.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const selectedBooking = bookings.find(b => b.id === selectedBookingId)
    if (!selectedBooking) return

    createPaymentMutation.mutate({
      amount: Number(newPayment.amount),
      paymentMode: newPayment.paymentMode,
      milestone: newPayment.milestone || null,
      transactionRef: newPayment.transactionRef || null,
      notes: newPayment.notes || null,
      customerId: selectedBooking.customer.id,
      bookingId: selectedBookingId,
      paymentDate: new Date().toISOString(),
      status: 'Pending',
    })
  }

  // Compute stats
  const totalCollected = payments
    .filter(p => p.status === 'Cleared')
    .reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0)
  const thisMonth = payments.filter(p => {
    const d = new Date(p.paymentDate)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((sum, p) => sum + p.amount, 0)

  const paymentModes = ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Card', 'Online']
  const milestones = ['Booking Amount', 'Agreement', 'Slab 1', 'Slab 2', 'Slab 3', 'Final Payment', 'Possession']

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500 mt-1">Track payments, milestones, and collections</p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setShowRecordDialog(true)}
        >
          <Plus className="size-4 mr-2" />
          Record Payment
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50">
              <ArrowUpRight className="size-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatIndianCurrency(totalCollected)}</p>
              <p className="text-xs text-slate-500">Total Collected</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <CreditCard className="size-4 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatIndianCurrency(totalPending)}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50">
              <IndianRupee className="size-4 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatIndianCurrency(thisMonth)}</p>
              <p className="text-xs text-slate-500">This Month</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment History */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CreditCard className="size-10 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No payments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {payments.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-orange-50">
                      <CreditCard className="size-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-slate-900">{p.customer.name}</p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${getPaymentStatusColor(p.status)}`}
                        >
                          {p.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.booking?.unit?.project?.name ?? 'N/A'} &middot; {p.milestone || 'No milestone'} &middot; {p.paymentMode} &middot; {formatDate(p.paymentDate)}
                      </p>
                      {p.transactionRef && (
                        <p className="text-xs text-slate-400">Ref: {p.transactionRef}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                        {formatRupees(p.amount)}
                      </span>
                      {p.status === 'Pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => markClearedMutation.mutate(p.id)}
                          disabled={markClearedMutation.isPending}
                        >
                          <CheckCircle2 className="size-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Record Payment Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Add a new payment for a booking</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Booking</Label>
              <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select booking" />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.bookingNumber} — {b.customer.name} ({b.unit?.project?.name ?? 'N/A'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={newPayment.amount}
                onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select
                  value={newPayment.paymentMode}
                  onValueChange={(v) => setNewPayment(prev => ({ ...prev, paymentMode: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentModes.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Milestone</Label>
                <Select
                  value={newPayment.milestone}
                  onValueChange={(v) => setNewPayment(prev => ({ ...prev, milestone: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    {milestones.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Transaction Reference</Label>
              <Input
                placeholder="Enter transaction reference"
                value={newPayment.transactionRef}
                onChange={(e) => setNewPayment(prev => ({ ...prev, transactionRef: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes"
                value={newPayment.notes}
                onChange={(e) => setNewPayment(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordDialog(false)}>Cancel</Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleRecordPayment}
              disabled={createPaymentMutation.isPending}
            >
              {createPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
