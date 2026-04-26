'use client'

import React from 'react'
import { useAppStore, type AppModule } from '@/lib/store'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Search, User, Settings, LogOut, HelpCircle } from 'lucide-react'

const moduleLabels: Record<AppModule, string> = {
  dashboard: 'Dashboard',
  properties: 'Properties',
  leads: 'Leads',
  customers: 'Customers',
  'site-visits': 'Site Visits',
  bookings: 'Bookings',
  payments: 'Payments',
  brokers: 'Brokers',
  commissions: 'Commissions',
  reports: 'Reports',
  'ai-assistant': 'AI Assistant',
  settings: 'Settings',
}

export function AppHeader() {
  const { activeModule } = useAppStore()
  const currentLabel = moduleLabels[activeModule]

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 size-7 hover:bg-slate-100" />
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#" onClick={(e) => e.preventDefault()}>
                Agentic Fox Labs
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-slate-900">
                {currentLabel}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Search Bar */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <Input
            placeholder="Search anything..."
            className="w-56 h-8 pl-8 text-sm bg-slate-50 border-slate-200 focus:border-orange-300 focus:ring-orange-200/30"
          />
        </div>

        {/* Mobile search button */}
        <Button variant="ghost" size="icon" className="md:hidden size-8 text-slate-500">
          <Search className="size-4" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-8 text-slate-500 hover:text-slate-700">
              <Bell className="size-4" />
              <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 text-[9px] font-bold bg-orange-500 text-white border-0 rounded-full">
                5
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="secondary" className="text-[10px]">5 new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="text-sm font-medium">New Lead Alert</span>
              <span className="text-xs text-muted-foreground">Hot lead Ravi Malhotra from Website - AI Score: 87</span>
              <span className="text-[10px] text-orange-500">2 min ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="text-sm font-medium">Payment Pending</span>
              <span className="text-xs text-muted-foreground">Booking amount pending for TechCorp Solutions</span>
              <span className="text-[10px] text-orange-500">1 hour ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="text-sm font-medium">Booking Confirmed!</span>
              <span className="text-xs text-muted-foreground">Sneha Kapoor booked Villa V-01 at Green Valley</span>
              <span className="text-[10px] text-orange-500">3 hours ago</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-orange-500 text-sm justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-orange-500 text-white text-xs font-semibold">
                  RS
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Rahul Sharma</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@agenticfox.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 size-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
