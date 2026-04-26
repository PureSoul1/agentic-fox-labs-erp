'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Percent, CheckCircle2, Banknote, AlertTriangle } from 'lucide-react'
import { formatIndianCurrency, formatRupees, formatDate, getCommissionStatusColor } from '@/lib/format'

interface Commission {
  id: string
  amount: number
  status: string
  paidDate: string | null
  remarks: string | null
  brokerId: string
  bookingId: string
  broker: { id: string; name: string; phone: string; email: string | null; company: string | null; commissionRate: number }
  booking: {
    id: string; bookingNumber: string; totalAmount: number; status: string
    customer: { id: string; name: string }
    unit: { id: string; unitNumber: string; project: { name: string } } | null
  }
  createdAt: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export function CommissionsView() {
  const queryClient = useQueryClient()
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showPayDialog, setShowPayDialog] = useState(false)
  const [selectedCommissionId, setSelectedCommissionId] = useState('')
  const [remarks, setRemarks] = useState('')

  // Fetch commissions
  const { data: commissions = [], isLoading } = useQuery<Commission[]>({
    queryKey: ['commissions'],
    queryFn: () => fetch('/api/commissions').then(r => r.json()),
  })

  // Approve commission mutation
  const approveMutation = useMutation({
    mutationFn: (data: { id: string; status: string; remarks?: string }) =>
      fetch('/api/commissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Commission approved')
      queryClient.invalidateQueries({ queryKey: ['commissions'] })
      setShowApproveDialog(false)
      setRemarks('')
    },
    onError: () => toast.error('Failed to approve commission'),
  })

  // Pay commission mutation
  const payMutation = useMutation({
    mutationFn: (data: { id: string; status: string; paidDate: string; remarks?: string }) =>
      fetch('/api/commissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Commission marked as paid')
      queryClient.invalidateQueries({ queryKey: ['commissions'] })
      setShowPayDialog(false)
      setRemarks('')
    },
    onError: () => toast.error('Failed to mark commission as paid'),
  })

  function handleApprove() {
    approveMutation.mutate({
      id: selectedCommissionId,
      status: 'Approved',
      remarks: remarks || undefined,
    })
  }

  function handlePay() {
    payMutation.mutate({
      id: selectedCommissionId,
      status: 'Paid',
      paidDate: new Date().toISOString(),
      remarks: remarks || undefined,
    })
  }

  // Stats
  const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0)
  const paidCommissions = commissions.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.amount, 0)
  const pendingCommissions = commissions.filter(c => c.status === 'Pending').reduce((sum, c) => sum + c.amount, 0)
  const approvedCommissions = commissions.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.amount, 0)

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
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-slate-900">Commissions</h1>
        <p className="text-sm text-slate-500 mt-1">Track and manage broker commissions</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50"><Percent className="size-4 text-orange-500" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatIndianCurrency(totalCommissions)}</p>
              <p className="text-xs text-slate-500">Total Commissions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50"><AlertTriangle className="size-4 text-amber-500" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatIndianCurrency(pendingCommissions)}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50"><Banknote className="size-4 text-emerald-500" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatIndianCurrency(paidCommissions)}</p>
              <p className="text-xs text-slate-500">Paid</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Commission List */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Percent className="size-10 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No commissions found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {commissions.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-orange-50">
                      <Percent className="size-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-slate-900">
                          {c.broker.company ? `${c.broker.company} (${c.broker.name})` : c.broker.name}
                        </p>
                        <Badge variant="outline" className={`text-[10px] ${getCommissionStatusColor(c.status)}`}>
                          {c.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Booking: {c.booking.bookingNumber}
                        {c.booking.unit && ` — ${c.booking.unit.project.name}`}
                        {' '}&middot; Customer: {c.booking.customer.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        Rate: {c.broker.commissionRate}% &middot; Created: {formatDate(c.createdAt)}
                      </p>
                      {c.remarks && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{c.remarks}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-semibold text-slate-900">
                        {formatRupees(c.amount)}
                      </span>
                      <div className="flex gap-1">
                        {c.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                            onClick={() => {
                              setSelectedCommissionId(c.id)
                              setShowApproveDialog(true)
                            }}
                          >
                            <CheckCircle2 className="size-3 mr-0.5" />
                            Approve
                          </Button>
                        )}
                        {(c.status === 'Pending' || c.status === 'Approved') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2"
                            onClick={() => {
                              setSelectedCommissionId(c.id)
                              setShowPayDialog(true)
                            }}
                          >
                            <Banknote className="size-3 mr-0.5" />
                            Pay
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Commission</DialogTitle>
            <DialogDescription>Approve this commission for payment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Remarks (optional)</Label>
              <Textarea
                placeholder="Add remarks for approval"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
            <DialogDescription>Mark this commission as paid to the broker</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Remarks (optional)</Label>
              <Textarea
                placeholder="Add payment remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayDialog(false)}>Cancel</Button>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handlePay}
              disabled={payMutation.isPending}
            >
              {payMutation.isPending ? 'Processing...' : 'Mark as Paid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
