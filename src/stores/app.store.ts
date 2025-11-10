import { create } from 'zustand'

interface AppStore {
  // UI preferences  
  sidebarCollapsed: boolean
  threadDrawerOpen: boolean
  theme: 'light' | 'dark'
  
  // Dashboard state
  isLoading: boolean
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void
  setThreadDrawerOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  // Initial state
  sidebarCollapsed: false,
  threadDrawerOpen: false,
  theme: (() => {
    if (typeof window === 'undefined') return 'light'
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })(),
  isLoading: false,
  
  // Actions
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setThreadDrawerOpen: (open) => set({ threadDrawerOpen: open }),
  setTheme: (theme) => set({ theme }),
  setLoading: (loading) => set({ isLoading: loading }),
})) 