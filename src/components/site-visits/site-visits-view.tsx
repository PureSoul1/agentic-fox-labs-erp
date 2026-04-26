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
import { MapPin, Plus, Calendar, Car, CheckCircle2, Star, Clock, Users } from 'lucide-react'
import { formatDateTime, formatDate, getVisitStatusColor } from '@/lib/format'

interface SiteVisit {
  id: string
  scheduledAt: string
  completedAt: string | null
  status: string
  feedback: string | null
  rating: number | null
  travelMode: string | null
  paxCount: number
  notes: string | null
  leadId: string
  projectId: string
  assignedToId: string
  lead: { id: string; name: string; phone: string; email: string | null; priority: string }
  project: { id: string; name: string; location: string; city: string }
  assignedTo: { id: string; name: string; phone: string; avatar: string | null }
  createdAt: string
}

interface Lead {
  id: string
  name: string
  phone: string
}

interface Project {
  id: string
  name: string
  location: string
}

interface User {
  id: string
  name: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export function SiteVisitsView() {
  const queryClient = useQueryClient()
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [selectedVisitId, setSelectedVisitId] = useState('')
  const [newVisit, setNewVisit] = useState({
    leadId: '',
    projectId: '',
    scheduledAt: '',
    travelMode: 'Own Vehicle',
    paxCount: '1',
    notes: '',
  })
  const [completeData, setCompleteData] = useState({
    feedback: '',
    rating: '',
  })

  // Fetch site visits
  const { data: visits = [], isLoading } = useQuery<SiteVisit[]>({
    queryKey: ['site-visits'],
    queryFn: () => fetch('/api/site-visits').then(r => r.json()),
  })

  // Fetch leads for select
  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: () => fetch('/api/leads').then(r => r.json()),
  })

  // Fetch projects for select
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => fetch('/api/projects').then(r => r.json()),
  })

  // Fetch users for assignment
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/seed')
      // We'll use a default user from the seed
      return [{ id: 'user_admin', name: 'Admin User' }]
    },
  })

  // Schedule visit mutation
  const scheduleMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/site-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Site visit scheduled successfully')
      queryClient.invalidateQueries({ queryKey: ['site-visits'] })
      setShowScheduleDialog(false)
      resetScheduleForm()
    },
    onError: () => toast.error('Failed to schedule visit'),
  })

  // Complete visit mutation
  const completeMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/site-visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Visit marked as completed')
      queryClient.invalidateQueries({ queryKey: ['site-visits'] })
      setShowCompleteDialog(false)
      setCompleteData({ feedback: '', rating: '' })
    },
    onError: () => toast.error('Failed to complete visit'),
  })

  function resetScheduleForm() {
    setNewVisit({
      leadId: '',
      projectId: '',
      scheduledAt: '',
      travelMode: 'Own Vehicle',
      paxCount: '1',
      notes: '',
    })
  }

  function handleSchedule() {
    if (!newVisit.leadId) { toast.error('Please select a lead'); return }
    if (!newVisit.projectId) { toast.error('Please select a project'); return }
    if (!newVisit.scheduledAt) { toast.error('Please select date & time'); return }

    scheduleMutation.mutate({
      leadId: newVisit.leadId,
      projectId: newVisit.projectId,
      scheduledAt: newVisit.scheduledAt,
      travelMode: newVisit.travelMode,
      paxCount: Number(newVisit.paxCount) || 1,
      notes: newVisit.notes || null,
      assignedToId: users[0]?.id || 'user_admin',
      status: 'Scheduled',
    })
  }

  function handleComplete() {
    completeMutation.mutate({
      id: selectedVisitId,
      status: 'Completed',
      feedback: completeData.feedback || null,
      rating: completeData.rating ? Number(completeData.rating) : null,
      completedAt: new Date().toISOString(),
    })
  }

  // Stats
  const upcoming = visits.filter(v => v.status === 'Scheduled' || v.status === 'In Progress')
  const completedThisMonth = visits.filter(v => {
    if (v.status !== 'Completed' || !v.completedAt) return false
    const d = new Date(v.completedAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const travelModes = ['Own Vehicle', 'Company Cab', 'Public Transport']

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />)}
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
          <h1 className="text-2xl font-bold text-slate-900">Site Visits</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule and track property site visits</p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setShowScheduleDialog(true)}
        >
          <Plus className="size-4 mr-2" />
          Schedule Visit
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50"><Calendar className="size-4 text-blue-500" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{upcoming.length}</p>
              <p className="text-xs text-slate-500">Upcoming Visits</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50"><MapPin className="size-4 text-emerald-500" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{completedThisMonth.length}</p>
              <p className="text-xs text-slate-500">Completed This Month</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Visits - Prominent Section */}
      {upcoming.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4 text-blue-500" />
                Upcoming Visits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcoming.map((v) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/80 hover:bg-white transition-colors border border-blue-100"
                >
                  <div className="p-2 rounded-lg bg-orange-50">
                    <MapPin className="size-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-slate-900">{v.lead.name}</p>
                      <Badge variant="outline" className={`text-[10px] ${getVisitStatusColor(v.status)}`}>
                        {v.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {v.project.name} &middot; {formatDateTime(v.scheduledAt)}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {v.travelMode && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Car className="size-3" /> {v.travelMode}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Users className="size-3" /> {v.paxCount} pax
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={() => {
                        setSelectedVisitId(v.id)
                        setShowCompleteDialog(true)
                      }}
                    >
                      <CheckCircle2 className="size-3 mr-1" />
                      Complete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* All Visits */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Visits</CardTitle>
          </CardHeader>
          <CardContent>
            {visits.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <MapPin className="size-10 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No site visits scheduled</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {visits.map((v) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-orange-50">
                      <MapPin className="size-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-slate-900">{v.lead.name}</p>
                        <Badge variant="outline" className={`text-[10px] ${getVisitStatusColor(v.status)}`}>
                          {v.status}
                        </Badge>
                        {v.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-500">
                            <Star className="size-3 fill-amber-400" /> {v.rating}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {v.project.name} &middot; {formatDateTime(v.scheduledAt)}
                      </p>
                      {v.feedback && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">&ldquo;{v.feedback}&rdquo;</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {v.travelMode && <Car className="size-3 text-slate-400" />}
                      {(v.status === 'Scheduled' || v.status === 'In Progress') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => {
                            setSelectedVisitId(v.id)
                            setShowCompleteDialog(true)
                          }}
                        >
                          <CheckCircle2 className="size-3 mr-1" />
                          Complete
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

      {/* Schedule Visit Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Visit</DialogTitle>
            <DialogDescription>Schedule a new site visit for a lead</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lead</Label>
              <Select value={newVisit.leadId} onValueChange={(v) => setNewVisit(prev => ({ ...prev, leadId: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name} ({l.phone})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={newVisit.projectId} onValueChange={(v) => setNewVisit(prev => ({ ...prev, projectId: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — {p.location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scheduled Date & Time</Label>
              <Input
                type="datetime-local"
                value={newVisit.scheduledAt}
                onChange={(e) => setNewVisit(prev => ({ ...prev, scheduledAt: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Travel Mode</Label>
                <Select value={newVisit.travelMode} onValueChange={(v) => setNewVisit(prev => ({ ...prev, travelMode: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {travelModes.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>No. of People</Label>
                <Input
                  type="number"
                  min="1"
                  value={newVisit.paxCount}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, paxCount: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes"
                value={newVisit.notes}
                onChange={(e) => setNewVisit(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleSchedule}
              disabled={scheduleMutation.isPending}
            >
              {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Visit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Visit Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Visit</DialogTitle>
            <DialogDescription>Mark this visit as completed and add feedback</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rating (1-5)</Label>
              <Select value={completeData.rating} onValueChange={(v) => setCompleteData(prev => ({ ...prev, rating: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {'★'.repeat(r)}{'☆'.repeat(5 - r)} ({r}/5)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea
                placeholder="Visit feedback and observations"
                value={completeData.feedback}
                onChange={(e) => setCompleteData(prev => ({ ...prev, feedback: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>Cancel</Button>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleComplete}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? 'Completing...' : 'Complete Visit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
