'use client'

import React, { useEffect, useState } from 'react'
import { useAppStore, type AppModule } from '@/lib/store'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { AppFooter } from '@/components/layout/app-footer'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { PropertiesView } from '@/components/properties/properties-view'
import { LeadsView } from '@/components/leads/leads-view'
import { CustomersView } from '@/components/customers/customers-view'
import { SiteVisitsView } from '@/components/site-visits/site-visits-view'
import { BookingsView } from '@/components/bookings/bookings-view'
import { PaymentsView } from '@/components/payments/payments-view'
import { BrokersView } from '@/components/brokers/brokers-view'
import { CommissionsView } from '@/components/commissions/commissions-view'
import { ReportsView } from '@/components/reports/reports-view'
import { AIAssistantView } from '@/components/ai/ai-assistant-view'
import { SettingsView } from '@/components/settings/settings-view'
import { Skeleton } from '@/components/ui/skeleton'

const moduleComponents: Record<AppModule, React.ComponentType> = {
  dashboard: DashboardView,
  properties: PropertiesView,
  leads: LeadsView,
  customers: CustomersView,
  'site-visits': SiteVisitsView,
  bookings: BookingsView,
  payments: PaymentsView,
  brokers: BrokersView,
  commissions: CommissionsView,
  reports: ReportsView,
  'ai-assistant': AIAssistantView,
  settings: SettingsView,
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white text-3xl shadow-lg shadow-orange-500/30 animate-pulse">
        🦊
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-900">Agentic Fox Labs</h2>
        <p className="text-sm text-slate-500 mt-1">Initializing your workspace...</p>
      </div>
      <div className="w-48 space-y-2 mt-2">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-2 w-3/4 rounded-full" />
      </div>
    </div>
  )
}

function ModuleRenderer() {
  const { activeModule } = useAppStore()
  const Component = moduleComponents[activeModule]
  return <Component />
}

export default function Home() {
  const [seeding, setSeeding] = useState(true)
  const [seedError, setSeedError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function seedDatabase() {
      try {
        const res = await fetch('/api/seed')
        const data = await res.json()
        if (mounted) {
          console.log('Seed result:', data.message)
          setSeeding(false)
        }
      } catch (err) {
        console.error('Seed error:', err)
        if (mounted) {
          setSeedError(String(err))
          setSeeding(false)
        }
      }
    }
    seedDatabase()
    return () => { mounted = false }
  }, [])

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <main className="flex-1">
            {seeding ? (
              <LoadingScreen />
            ) : seedError ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-500 text-3xl">
                  ⚠️
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-slate-900">Initialization Error</h2>
                  <p className="text-sm text-slate-500 mt-1">{seedError}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <ModuleRenderer />
            )}
          </main>
          <AppFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
