'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Handshake, Plus, Phone, Mail, Building2, Percent, IndianRupee } from 'lucide-react'
import { formatIndianCurrency, formatRupees } from '@/lib/format'

interface Broker {
  id: string
  name: string
  email: string | null
  phone: string
  company: string | null
  type: string
  panNumber: string | null
  commissionRate: number
  isActive: boolean
  _count: { bookings: number; commissions: number }
  totalCommissions: number
  paidCommissions: number
  pendingCommissions: number
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

export function BrokersView() {
  const queryClient = useQueryClient()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newBroker, setNewBroker] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    type: 'Individual',
    panNumber: '',
    commissionRate: '',
  })

  // Fetch brokers
  const { data: brokers = [], isLoading } = useQuery<Broker[]>({
    queryKey: ['brokers'],
    queryFn: () => fetch('/api/brokers').then(r => r.json()),
  })

  // Create broker
  const createBrokerMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/brokers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Broker added successfully')
      queryClient.invalidateQueries({ queryKey: ['brokers'] })
      setShowAddDialog(false)
      resetForm()
    },
    onError: () => toast.error('Failed to add broker'),
  })

  function resetForm() {
    setNewBroker({
      name: '',
      email: '',
      phone: '',
      company: '',
      type: 'Individual',
      panNumber: '',
      commissionRate: '',
    })
  }

  function handleAddBroker() {
    if (!newBroker.name.trim()) { toast.error('Please enter broker name'); return }
    if (!newBroker.phone.trim()) { toast.error('Please enter phone number'); return }

    createBrokerMutation.mutate({
      name: newBroker.name,
      email: newBroker.email || null,
      phone: newBroker.phone,
      company: newBroker.company || null,
      type: newBroker.type,
      panNumber: newBroker.panNumber || null,
      commissionRate: Number(newBroker.commissionRate) || 0,
    })
  }

  // Stats
  const totalCommission = brokers.reduce((sum, b) => sum + b.totalCommissions, 0)
  const totalPaid = brokers.reduce((sum, b) => sum + b.paidCommissions, 0)
  const totalPending = brokers.reduce((sum, b) => sum + b.pendingCommissions, 0)

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-lg animate-pulse" />)}
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
          <h1 className="text-2xl font-bold text-slate-900">Brokers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage broker partnerships and channel sales</p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="size-4 mr-2" />
          Add Broker
        </Button>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50"><IndianRupee className="size-4 text-orange-500" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatIndianCurrency(totalCommission)}</p>
              <p className="text-xs text-slate-500">Total Commissions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50"><Percent className="size-4 text-emerald-500" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatIndianCurrency(totalPaid)}</p>
              <p className="text-xs text-slate-500">Paid</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50"><Percent className="size-4 text-amber-500" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatIndianCurrency(totalPending)}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Broker Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brokers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center py-12 text-center">
            <Handshake className="size-12 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No brokers added yet</p>
          </div>
        ) : (
          brokers.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-bold">
                      {b.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{b.name}</h3>
                      <p className="text-xs text-slate-500">{b.company || 'No company'}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {b.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <p className="text-xs text-slate-500">Commission Rate</p>
                      <p className="font-semibold text-orange-600">{b.commissionRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Bookings</p>
                      <p className="font-semibold text-slate-900">{b._count.bookings}</p>
                    </div>
                  </div>

                  {/* Commission Info */}
                  <div className="border-t border-slate-100 pt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Total Commission</span>
                      <span className="font-medium text-slate-900">{formatRupees(b.totalCommissions)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-emerald-600">Paid</span>
                      <span className="font-medium text-emerald-600">{formatRupees(b.paidCommissions)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-amber-600">Pending</span>
                      <span className="font-medium text-amber-600">{formatRupees(b.pendingCommissions)}</span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Phone className="size-3" /> {b.phone}
                    </span>
                    {b.email && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 truncate">
                        <Mail className="size-3" /> {b.email}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Add Broker Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Broker</DialogTitle>
            <DialogDescription>Add a new broker or channel partner</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="Broker name"
                  value={newBroker.name}
                  onChange={(e) => setNewBroker(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  placeholder="Phone number"
                  value={newBroker.phone}
                  onChange={(e) => setNewBroker(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  placeholder="Email address"
                  type="email"
                  value={newBroker.email}
                  onChange={(e) => setNewBroker(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  placeholder="Company name"
                  value={newBroker.company}
                  onChange={(e) => setNewBroker(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newBroker.type} onValueChange={(v) => setNewBroker(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Agency">Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Commission Rate (%)</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 2.5"
                  value={newBroker.commissionRate}
                  onChange={(e) => setNewBroker(prev => ({ ...prev, commissionRate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>PAN Number</Label>
              <Input
                placeholder="PAN number"
                value={newBroker.panNumber}
                onChange={(e) => setNewBroker(prev => ({ ...prev, panNumber: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleAddBroker}
              disabled={createBrokerMutation.isPending}
            >
              {createBrokerMutation.isPending ? 'Adding...' : 'Add Broker'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
