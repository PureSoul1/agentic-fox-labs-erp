'use client'

import React from 'react'
import { useAppStore, type AppModule } from '@/lib/store'
import {
  LayoutDashboard,
  Building2,
  Target,
  Users,
  MapPin,
  FileCheck,
  CreditCard,
  Handshake,
  Percent,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface NavItem {
  id: AppModule
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  special?: boolean
  group?: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { id: 'properties', label: 'Properties', icon: Building2, group: 'Management' },
  { id: 'leads', label: 'Leads', icon: Target, badge: '5', group: 'Management' },
  { id: 'customers', label: 'Customers', icon: Users, group: 'Management' },
  { id: 'site-visits', label: 'Site Visits', icon: MapPin, badge: '2', group: 'Management' },
  { id: 'bookings', label: 'Bookings', icon: FileCheck, group: 'Sales' },
  { id: 'payments', label: 'Payments', icon: CreditCard, group: 'Sales' },
  { id: 'brokers', label: 'Brokers', icon: Handshake, group: 'Sales' },
  { id: 'commissions', label: 'Commissions', icon: Percent, group: 'Sales' },
  { id: 'reports', label: 'Reports', icon: BarChart3, group: 'Insights' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, special: true, group: 'Insights' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'System' },
]

export function AppSidebar() {
  const { activeModule, setActiveModule } = useAppStore()

  const groupedNavItems = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const group = item.group || 'Other'
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})

  return (
    <Sidebar
      className="border-r-0 bg-slate-900 text-white"
      style={
        {
          '--sidebar-width': '16rem',
          '--sidebar-width-icon': '3rem',
        } as React.CSSProperties
      }
    >
      {/* Header with Branding */}
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-lg shadow-lg shadow-orange-500/30">
            🦊
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight">
              Agentic Fox Labs
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              Real Estate Intelligence Platform
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="bg-slate-700/50" />

      <SidebarContent className="px-2 py-2">
        {Object.entries(groupedNavItems).map(([group, items]) => (
          <SidebarGroup key={group} className="px-0 py-1">
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-0.5">
              {group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const isActive = activeModule === item.id
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => setActiveModule(item.id)}
                        tooltip={item.label}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 hover:bg-orange-600'
                            : item.special
                              ? 'text-amber-300 hover:bg-slate-800 hover:text-amber-200'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                          isActive && 'data-[active=true]:bg-orange-500 data-[active=true]:text-white'
                        )}
                      >
                        <Icon
                          className={cn(
                            'size-4 shrink-0 transition-colors',
                            isActive
                              ? 'text-white'
                              : item.special
                                ? 'text-amber-400'
                                : 'text-slate-400 group-hover:text-white'
                          )}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <Badge
                            className={cn(
                              'h-5 min-w-[20px] px-1.5 text-[10px] font-semibold rounded-full border-0',
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-orange-500/20 text-orange-400'
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {item.special && !isActive && (
                          <span className="ml-auto flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator className="bg-slate-700/50" />

      {/* Footer with User Info */}
      <SidebarFooter className="px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-3 py-2.5">
          <Avatar className="h-8 w-8 border border-slate-600">
            <AvatarFallback className="bg-orange-500 text-white text-xs font-semibold">
              RS
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Rahul Sharma</p>
            <p className="text-[10px] text-slate-400">Admin &middot; Agentic Fox Labs</p>
          </div>
          <button className="text-slate-500 hover:text-white transition-colors" aria-label="Log out">
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>

      <SidebarRail className="bg-slate-700/30" />
    </Sidebar>
  )
}
