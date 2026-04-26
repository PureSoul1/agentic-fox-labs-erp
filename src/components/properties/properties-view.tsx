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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Building2, Plus, Filter, Search, MapPin, ArrowLeft, Home,
  CircleDot, Eye, Ruler, IndianRupee, Compass, Layers,
  ChevronRight, X, CheckCircle2, XCircle, Clock, Bookmark,
  LayoutGrid, List,
} from 'lucide-react'

// ─── Types ───

interface UnitStats {
  available: number
  sold: number
  blocked: number
  reserved: number
  total: number
}

interface Project {
  id: string
  name: string
  slug: string
  description: string | null
  location: string
  city: string
  state: string | null
  pincode: string | null
  type: string
  status: string
  totalUnits: number
  soldUnits: number
  reraId: string | null
  amenities: string | null
  createdAt: string
  updatedAt: string
  unitStats: UnitStats
  totalValue: number
  soldValue: number
  units: { status: string; price: number }[]
  _count: { units: number; bookings: number }
}

interface Unit {
  id: string
  unitNumber: string
  floor: number
  wing: string | null
  type: string
  bhk: number
  area: number
  areaUnit: string
  price: number
  pricePerSqft: number
  facing: string | null
  status: string
  possession: string | null
  features: string | null
  projectId: string
  project: { id: string; name: string; slug: string; city: string; status: string }
  booking: { id: string; bookingNumber: string; status: string; customer: { id: string; name: string } } | null
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

function getStatusColor(status: string) {
  switch (status) {
    case 'Available': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'Sold': return 'bg-red-100 text-red-700 border-red-200'
    case 'Blocked': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Reserved': return 'bg-blue-100 text-blue-700 border-blue-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

function getProjectStatusBadge(status: string) {
  switch (status) {
    case 'Ready to Move': return 'default'
    case 'Pre-Launch': return 'secondary'
    case 'Under Construction': return 'outline'
    case 'Completed': return 'default'
    default: return 'outline'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Available': return <CheckCircle2 className="size-3" />
    case 'Sold': return <XCircle className="size-3" />
    case 'Blocked': return <Clock className="size-3" />
    case 'Reserved': return <Bookmark className="size-3" />
    default: return <CircleDot className="size-3" />
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

// ─── Create Project Dialog ───

function CreateProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '', location: '', city: '', state: '', type: 'Residential',
    status: 'Pre-Launch', totalUnits: '', reraId: '', description: '',
    amenities: '',
  })

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const amenitiesArr = data.amenities ? String(data.amenities).split(',').map(a => a.trim()).filter(Boolean) : []
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, totalUnits: Number(data.totalUnits) || 0, amenities: amenitiesArr }),
      })
      if (!res.ok) throw new Error('Failed to create project')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully!')
      onOpenChange(false)
      setForm({ name: '', location: '', city: '', state: '', type: 'Residential', status: 'Pre-Launch', totalUnits: '', reraId: '', description: '', amenities: '' })
    },
    onError: () => toast.error('Failed to create project'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.location || !form.city) {
      toast.error('Please fill in required fields')
      return
    }
    createMutation.mutate(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Add a new real estate project to your portfolio</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Skyline Towers" className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="location">Location *</Label>
              <Input id="location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. BKC, Mumbai" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input id="city" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="Maharashtra" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pre-Launch">Pre-Launch</SelectItem>
                  <SelectItem value="Under Construction">Under Construction</SelectItem>
                  <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="totalUnits">Total Units</Label>
              <Input id="totalUnits" type="number" value={form.totalUnits} onChange={e => setForm({ ...form, totalUnits: e.target.value })} placeholder="100" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="reraId">RERA ID</Label>
              <Input id="reraId" value={form.reraId} onChange={e => setForm({ ...form, reraId: e.target.value })} placeholder="P52000012345" className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="amenities">Amenities (comma-separated)</Label>
            <Input id="amenities" value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="Swimming Pool, Gym, Clubhouse" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the project..." className="mt-1" rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Project Detail View ───

function ProjectDetailView({ project, onBack }: { project: Project; onBack: () => void }) {
  const [unitFilter, setUnitFilter] = useState<string>('all')
  const [unitView, setUnitView] = useState<'grid' | 'list'>('grid')

  const { data: projectDetail, isLoading } = useQuery({
    queryKey: ['project', project.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${project.id}`)
      if (!res.ok) throw new Error('Failed to fetch project')
      return res.json()
    },
  })

  const amenities: string[] = project.amenities ? JSON.parse(project.amenities) : []
  const units: Unit[] = projectDetail?.units || []
  const filteredUnits = unitFilter === 'all' ? units : units.filter((u: Unit) => u.status === unitFilter)

  const stats = projectDetail?.unitStats || project.unitStats

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 p-6"
    >
      {/* Back button and header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="size-4" /> Back
        </Button>
      </div>

      {/* Project Info Card */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-orange-50 shrink-0">
                <Building2 className="size-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{project.name}</h2>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                  <MapPin className="size-3.5" />
                  <span>{project.location}, {project.city}{project.state ? `, ${project.state}` : ''}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={getProjectStatusBadge(project.status)} className="text-xs">{project.status}</Badge>
                  <Badge variant="outline" className="text-xs">{project.type}</Badge>
                  {project.reraId && (
                    <Badge variant="outline" className="text-xs text-slate-500">RERA: {project.reraId}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {project.description && (
            <p className="text-sm text-slate-600 mt-4">{project.description}</p>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500 mb-2">Amenities</p>
              <div className="flex flex-wrap gap-1.5">
                {amenities.map((a) => (
                  <Badge key={a} variant="secondary" className="text-[10px] bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500">Total Units</p>
              <p className="text-lg font-bold text-slate-900">{stats?.total || 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Available</p>
              <p className="text-lg font-bold text-emerald-600">{stats?.available || 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Sold</p>
              <p className="text-lg font-bold text-red-600">{stats?.sold || 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Project Value</p>
              <p className="text-lg font-bold text-orange-600">{formatIndianCurrency(project.totalValue)}</p>
            </div>
          </div>

          {/* Sales Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Sales Progress</span>
              <span className="font-medium">{stats?.total ? Math.round(((stats.sold || 0) / stats.total) * 100) : 0}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats?.total ? Math.round(((stats.sold || 0) / stats.total) * 100) : 0}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-orange-500 rounded-full"
              />
            </div>
          </div>

          {/* Revenue Info */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-emerald-600">Revenue from Sales</p>
                <p className="text-base font-bold text-emerald-700">{formatIndianCurrency(project.soldValue)}</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-100">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-orange-600">Potential Revenue</p>
                <p className="text-base font-bold text-orange-700">{formatIndianCurrency(project.totalValue - project.soldValue)}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Unit Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Available', count: stats?.available || 0, color: 'emerald', icon: <CheckCircle2 className="size-4" /> },
          { label: 'Sold', count: stats?.sold || 0, color: 'red', icon: <XCircle className="size-4" /> },
          { label: 'Blocked', count: stats?.blocked || 0, color: 'amber', icon: <Clock className="size-4" /> },
          { label: 'Reserved', count: stats?.reserved || 0, color: 'blue', icon: <Bookmark className="size-4" /> },
        ].map(s => (
          <Card key={s.label} className="border-slate-200 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setUnitFilter(unitFilter === s.label.toLowerCase() ? 'all' : s.label.toLowerCase())}>
            <CardContent className="p-3 flex items-center gap-2">
              <div className={`p-1.5 rounded-md bg-${s.color}-50 text-${s.color}-500`}>
                {s.icon}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{s.count}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Unit Filter & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-slate-400" />
          <span className="text-sm text-slate-500">Filter:</span>
          <div className="flex gap-1">
            {['all', 'Available', 'Sold', 'Blocked', 'Reserved'].map(f => (
              <Button
                key={f}
                variant={unitFilter === f.toLowerCase() ? 'default' : 'outline'}
                size="sm"
                className={unitFilter === f.toLowerCase() ? 'bg-orange-500 hover:bg-orange-600 text-white text-xs h-7' : 'text-xs h-7'}
                onClick={() => setUnitFilter(f.toLowerCase())}
              >
                {f === 'all' ? 'All' : f}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant={unitView === 'grid' ? 'default' : 'ghost'} size="sm" className={unitView === 'grid' ? 'bg-slate-100 text-slate-700 h-8 w-8 p-0' : 'h-8 w-8 p-0'} onClick={() => setUnitView('grid')}>
            <LayoutGrid className="size-4" />
          </Button>
          <Button variant={unitView === 'list' ? 'default' : 'ghost'} size="sm" className={unitView === 'list' ? 'bg-slate-100 text-slate-700 h-8 w-8 p-0' : 'h-8 w-8 p-0'} onClick={() => setUnitView('list')}>
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {/* Units List/Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Home className="size-8 mx-auto mb-2" />
          <p className="text-sm">No units found</p>
        </div>
      ) : unitView === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredUnits.map((unit: Unit) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`border cursor-pointer hover:shadow-md transition-all ${unit.status === 'Sold' ? 'opacity-70' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-900">{unit.unitNumber}</span>
                    <Badge className={`text-[9px] px-1.5 py-0 ${getStatusColor(unit.status)}`}>
                      <span className="flex items-center gap-0.5">{getStatusIcon(unit.status)} {unit.status}</span>
                    </Badge>
                  </div>
                  <div className="space-y-0.5 text-[11px] text-slate-500">
                    <p>{unit.type} • {unit.bhk} BHK</p>
                    <p>{unit.area} {unit.areaUnit}</p>
                    <p className="font-medium text-slate-700">{formatIndianCurrency(unit.price)}</p>
                  </div>
                  {unit.wing && (
                    <p className="text-[10px] text-slate-400 mt-1">Wing {unit.wing} • Floor {unit.floor}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-slate-200">
          <CardContent className="p-0">
            <ScrollArea className="max-h-96">
              <div className="divide-y">
                {filteredUnits.map((unit: Unit) => (
                  <div key={unit.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 shrink-0">
                      <Home className="size-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{unit.unitNumber}</p>
                        <Badge className={`text-[9px] px-1.5 py-0 ${getStatusColor(unit.status)}`}>
                          <span className="flex items-center gap-0.5">{getStatusIcon(unit.status)} {unit.status}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{unit.type} • {unit.bhk} BHK • {unit.area} {unit.areaUnit} {unit.wing ? `• Wing ${unit.wing}` : ''} • Floor {unit.floor}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{formatIndianCurrency(unit.price)}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

// ─── Main Properties View ───

export function PropertiesView() {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState('projects')

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects')
      if (!res.ok) throw new Error('Failed to fetch projects')
      return res.json() as Promise<Project[]>
    },
  })

  const { data: units, isLoading: unitsLoading } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await fetch('/api/units')
      if (!res.ok) throw new Error('Failed to fetch units')
      return res.json() as Promise<Unit[]>
    },
  })

  const filteredProjects = projects?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  ) || []

  const filteredUnits = units?.filter(u =>
    u.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
    u.project.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  // If a project is selected, show detail view
  if (selectedProject) {
    return <ProjectDetailView project={selectedProject} onBack={() => setSelectedProject(null)} />
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
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your real estate projects and units</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 mr-2" />
          Create Project
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <Input placeholder="Search projects, units, locations..." className="pl-8 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="projects" className="gap-1.5">
              <Building2 className="size-3.5" /> Projects
            </TabsTrigger>
            <TabsTrigger value="units" className="gap-1.5">
              <Home className="size-3.5" /> Units
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-4">
            {projectsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border-slate-200">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                      <Skeleton className="h-2 w-full" />
                      <div className="grid grid-cols-3 gap-3">
                        <Skeleton className="h-8" />
                        <Skeleton className="h-8" />
                        <Skeleton className="h-8" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Building2 className="size-10 mx-auto mb-3" />
                <p className="text-sm font-medium">No projects found</p>
                <p className="text-xs mt-1">Create a new project to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredProjects.map((project, idx) => {
                    const amenities: string[] = project.amenities ? JSON.parse(project.amenities) : []
                    const progress = project.unitStats?.total ? Math.round((project.unitStats.sold / project.unitStats.total) * 100) : 0

                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                      >
                        <Card
                          className="border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => setSelectedProject(project)}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-50 group-hover:bg-orange-100 transition-colors">
                                  <Building2 className="size-5 text-orange-500" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">{project.name}</h3>
                                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                    <MapPin className="size-3" />
                                    <span>{project.location}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Badge variant={getProjectStatusBadge(project.status)} className="text-[10px]">
                                  {project.status}
                                </Badge>
                                <ChevronRight className="size-4 text-slate-300 group-hover:text-orange-400 transition-colors" />
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-3">
                              <div>
                                <p className="text-xs text-slate-500">Type</p>
                                <p className="text-sm font-medium text-slate-900">{project.type}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Units</p>
                                <p className="text-sm font-medium text-slate-900">{project.unitStats?.total || 0}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Sold</p>
                                <p className="text-sm font-medium text-orange-600">{project.unitStats?.sold || 0}</p>
                              </div>
                            </div>

                            {/* Sales Progress */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                <span>Sales Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                                  className="h-full bg-orange-500 rounded-full"
                                />
                              </div>
                            </div>

                            {/* Unit Status Indicators */}
                            <div className="mt-3 flex items-center gap-3 text-[10px]">
                              {project.unitStats?.available > 0 && (
                                <span className="flex items-center gap-0.5 text-emerald-600"><CheckCircle2 className="size-2.5" /> {project.unitStats.available} Available</span>
                              )}
                              {project.unitStats?.sold > 0 && (
                                <span className="flex items-center gap-0.5 text-red-600"><XCircle className="size-2.5" /> {project.unitStats.sold} Sold</span>
                              )}
                              {project.unitStats?.blocked > 0 && (
                                <span className="flex items-center gap-0.5 text-amber-600"><Clock className="size-2.5" /> {project.unitStats.blocked} Blocked</span>
                              )}
                              {project.unitStats?.reserved > 0 && (
                                <span className="flex items-center gap-0.5 text-blue-600"><Bookmark className="size-2.5" /> {project.unitStats.reserved} Reserved</span>
                              )}
                            </div>

                            {/* Amenity Badges */}
                            {amenities.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1">
                                {amenities.slice(0, 4).map((a) => (
                                  <Badge key={a} variant="secondary" className="text-[9px] bg-slate-50 text-slate-600 border-slate-100">
                                    {a}
                                  </Badge>
                                ))}
                                {amenities.length > 4 && (
                                  <Badge variant="secondary" className="text-[9px] bg-orange-50 text-orange-600 border-orange-100">
                                    +{amenities.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Project Value */}
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-xs text-slate-500">Project Value</span>
                              <span className="text-sm font-semibold text-orange-600">{formatIndianCurrency(project.totalValue)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Units Tab */}
          <TabsContent value="units" className="mt-4">
            {unitsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Home className="size-10 mx-auto mb-3" />
                <p className="text-sm font-medium">No units found</p>
              </div>
            ) : (
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">All Units ({filteredUnits.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[500px]">
                    <div className="divide-y">
                      {filteredUnits.map((unit) => (
                        <motion.div
                          key={unit.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 shrink-0">
                            <Home className="size-4 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900">{unit.unitNumber}</p>
                              <Badge className={`text-[9px] px-1.5 py-0 ${getStatusColor(unit.status)}`}>
                                <span className="flex items-center gap-0.5">{getStatusIcon(unit.status)} {unit.status}</span>
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {unit.project.name} • {unit.type} • {unit.bhk} BHK • {unit.area} {unit.areaUnit}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-slate-900">{formatIndianCurrency(unit.price)}</p>
                            <p className="text-[10px] text-slate-400">{formatFullCurrency(unit.pricePerSqft)}/sqft</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Create Project Dialog */}
      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </motion.div>
  )
}
