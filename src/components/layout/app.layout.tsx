import { Sidebar } from '@/components/layout/Sidebar.component'
import { Header } from '@/components/layout/Header.component'
import { useAppStore } from '@/stores/app.store'
import { useResponsiveSidebar } from '@/hooks/app.hooks'

interface AppLayoutProps {
  children: React.ReactNode
}

/**
 * AppLayout component - main application layout with sidebar and header
 * Provides consistent layout structure across all authenticated pages
 */
export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed } = useAppStore()
  const { isSmallScreen } = useResponsiveSidebar()

  return (
    <div className="h-screen flex">
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 flex flex-col ${
        isSmallScreen 
          ? 'ml-0' 
          : sidebarCollapsed 
            ? 'ml-20' 
            : 'ml-64'
      }`}>
        <Header />

        {/* Content */}
        <main className="flex-1 m-6 p-6 flex flex-col min-h-0 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}

