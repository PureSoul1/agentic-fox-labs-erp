import { create } from 'zustand'

export type AppModule =
  | 'dashboard'
  | 'properties'
  | 'leads'
  | 'customers'
  | 'site-visits'
  | 'bookings'
  | 'payments'
  | 'brokers'
  | 'commissions'
  | 'reports'
  | 'ai-assistant'
  | 'settings'

interface AppState {
  activeModule: AppModule
  setActiveModule: (module: AppModule) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  orgId: string
  setOrgId: (id: string) => void
  userName: string
  setUserName: (name: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  setActiveModule: (module) => set({ activeModule: module }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  orgId: 'org_agentic_fox',
  setOrgId: (id) => set({ orgId: id }),
  userName: 'Admin',
  setUserName: (name) => set({ userName: name }),
}))
