'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Settings, Bell, Shield, Building2, CreditCard, Users, Globe, Palette,
  Key, Smartphone, Mail, Save, Check, ChevronRight, Zap
} from 'lucide-react'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export function SettingsView() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    leadAlerts: true,
    paymentReminders: true,
    visitReminders: true,
    weeklyDigest: true,
  })

  const handleSave = () => {
    toast.success('Settings saved successfully!')
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
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account, organization, and application preferences</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Organization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-orange-50">
                  <Settings className="size-4 text-orange-500" />
                </div>
                Profile Settings
              </CardTitle>
              <CardDescription className="text-xs">Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-orange-100 text-orange-600 text-lg font-bold">RS</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-900">Rahul Sharma</h3>
                  <p className="text-sm text-slate-500">Organization Admin</p>
                  <Badge className="mt-1 bg-orange-100 text-orange-700 border-orange-200 text-[10px]">
                    <Zap className="size-3 mr-1" /> Pro Plan
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-medium text-slate-600">Full Name</Label>
                  <Input id="name" defaultValue="Rahul Sharma" className="h-9" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-600">Email Address</Label>
                  <Input id="email" defaultValue="admin@agenticfox.com" className="h-9" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-medium text-slate-600">Phone Number</Label>
                  <Input id="phone" defaultValue="+91 98765 43210" className="h-9" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs font-medium text-slate-600">Role</Label>
                  <Input id="role" defaultValue="Organization Admin" disabled className="h-9 bg-slate-50" />
                </div>
              </div>
              <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white h-9">
                <Save className="size-4 mr-2" /> Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-50">
                  <Building2 className="size-4 text-emerald-500" />
                </div>
                Organization Settings
              </CardTitle>
              <CardDescription className="text-xs">Manage your organization details and subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">Organization Name</Label>
                  <Input defaultValue="Agentic Fox Labs" className="h-9" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">Industry</Label>
                  <Input defaultValue="Real Estate" className="h-9" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">Website</Label>
                  <Input defaultValue="https://agenticfox.com" className="h-9" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">GST Number</Label>
                  <Input placeholder="Enter GST number" className="h-9" />
                </div>
              </div>

              <Separator />

              {/* Subscription Info */}
              <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-slate-900">Pro Plan</h4>
                      <Badge className="bg-orange-500 text-white text-[10px]">Active</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Up to 20 projects, 50 users, AI features included</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">₹4,999</p>
                    <p className="text-xs text-slate-500">/month</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-white rounded-md border">
                    <p className="text-lg font-bold text-orange-600">4/20</p>
                    <p className="text-[10px] text-slate-500">Projects</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-md border">
                    <p className="text-lg font-bold text-orange-600">4/50</p>
                    <p className="text-[10px] text-slate-500">Users</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-md border">
                    <p className="text-lg font-bold text-emerald-600">
                      <Check className="size-4 mx-auto" />
                    </p>
                    <p className="text-[10px] text-slate-500">AI Features</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="h-9 text-sm">
                <CreditCard className="size-4 mr-2" /> Manage Subscription
              </Button>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-violet-50">
                  <Users className="size-4 text-violet-500" />
                </div>
                Team Members
              </CardTitle>
              <CardDescription className="text-xs">Manage team access and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Rahul Sharma', email: 'admin@agenticfox.com', role: 'Org Admin', avatar: 'RS', color: 'bg-orange-100 text-orange-600' },
                  { name: 'Priya Patel', email: 'priya@agenticfox.com', role: 'Manager', avatar: 'PP', color: 'bg-emerald-100 text-emerald-600' },
                  { name: 'Vikram Singh', email: 'vikram@agenticfox.com', role: 'Agent', avatar: 'VS', color: 'bg-blue-100 text-blue-600' },
                  { name: 'Anita Desai', email: 'anita@agenticfox.com', role: 'Agent', avatar: 'AD', color: 'bg-violet-100 text-violet-600' },
                ].map((member) => (
                  <div key={member.email} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className={`text-xs font-bold ${member.color}`}>{member.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{member.role}</Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 h-9 text-sm">
                <Users className="size-4 mr-2" /> Invite Team Member
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Notifications & Security */}
        <div className="space-y-4">
          {/* Notifications */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-50">
                  <Bell className="size-4 text-amber-500" />
                </div>
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-slate-400" />
                  <span className="text-sm text-slate-700">Email alerts</span>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(v) => setNotifications(p => ({ ...p, email: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="size-3.5 text-slate-400" />
                  <span className="text-sm text-slate-700">Push notifications</span>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(v) => setNotifications(p => ({ ...p, push: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="size-3.5 text-slate-400" />
                  <span className="text-sm text-slate-700">SMS alerts</span>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(v) => setNotifications(p => ({ ...p, sms: v }))}
                />
              </div>
              <Separator />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Smart Alerts</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Hot lead alerts</span>
                <Switch
                  checked={notifications.leadAlerts}
                  onCheckedChange={(v) => setNotifications(p => ({ ...p, leadAlerts: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Payment reminders</span>
                <Switch
                  checked={notifications.paymentReminders}
                  onCheckedChange={(v) => setNotifications(p => ({ ...p, paymentReminders: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Visit reminders</span>
                <Switch
                  checked={notifications.visitReminders}
                  onCheckedChange={(v) => setNotifications(p => ({ ...p, visitReminders: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Weekly digest</span>
                <Switch
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(v) => setNotifications(p => ({ ...p, weeklyDigest: v }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-red-50">
                  <Shield className="size-4 text-red-500" />
                </div>
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full text-sm justify-start h-9">
                <Key className="size-4 mr-2" /> Change Password
              </Button>
              <Button variant="outline" size="sm" className="w-full text-sm justify-start h-9">
                <Smartphone className="size-4 mr-2" /> Two-Factor Authentication
              </Button>
              <Button variant="outline" size="sm" className="w-full text-sm justify-start h-9">
                <Globe className="size-4 mr-2" /> Active Sessions
              </Button>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-slate-100">
                  <Palette className="size-4 text-slate-500" />
                </div>
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button className="p-3 rounded-lg border-2 border-orange-500 bg-white text-center">
                  <div className="w-6 h-6 rounded-full bg-white border mx-auto mb-1" />
                  <span className="text-xs font-medium text-slate-700">Light</span>
                </button>
                <button className="p-3 rounded-lg border border-slate-200 bg-white text-center hover:border-slate-300">
                  <div className="w-6 h-6 rounded-full bg-slate-900 mx-auto mb-1" />
                  <span className="text-xs font-medium text-slate-700">Dark</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* API & Integrations */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-50">
                  <Globe className="size-4 text-blue-500" />
                </div>
                Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'WhatsApp Business', status: 'Connected', connected: true },
                { name: 'Google Calendar', status: 'Connect', connected: false },
                { name: 'Zoho CRM', status: 'Connect', connected: false },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{integration.name}</span>
                  <Button
                    variant={integration.connected ? 'secondary' : 'outline'}
                    size="sm"
                    className="text-xs h-7"
                  >
                    {integration.connected && <Check className="size-3 mr-1" />}
                    {integration.status}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  )
}
