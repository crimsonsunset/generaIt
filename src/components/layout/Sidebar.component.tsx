import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import { Link, useLocation } from '@tanstack/react-router'
import {
  Drawer,
  DrawerContent,
  DrawerBody,
} from '@heroui/drawer'
import { useAppStore } from '@/stores/app.store'
import { useTheme } from '@/hooks/app.hooks'
import { useResponsiveSidebar } from '@/hooks/app.hooks'
import logoLight from '@/assets/logo-light.png'
import logoDark from '@/assets/logo-dark.png'

interface MenuItem {
  key: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  to: string
}

const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    icon: ChartBarIcon,
    label: 'Dashboard',
    to: '/dashboard',
  },
  {
    key: '/chat',
    icon: ChatBubbleLeftRightIcon,
    label: 'Chat',
    to: '/chat',
  },
]

/**
 * Sidebar component - navigation sidebar with logo and menu items
 * On large screens: Fixed sidebar that collapses to icon-only view
 * On small screens (< 820px): Drawer overlay that can be toggled
 */
export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore()
  const { theme } = useTheme()
  const location = useLocation()
  const { isSmallScreen } = useResponsiveSidebar()
  
  const logoToUse = theme === 'dark' ? logoLight : logoDark

  // Sidebar content component (shared between regular sidebar and drawer)
  const SidebarContent = () => (
    <>
      {/* Logo and Brand */}
      <div className={`p-4 flex items-center border-b border-divider mb-2 ${
        sidebarCollapsed && !isSmallScreen ? 'justify-center' : 'gap-3'
      }`}>
        <img
          src={logoToUse}
          alt="Logo"
          className="h-8 w-8 object-contain"
        />
        {(!sidebarCollapsed || isSmallScreen) && (
          <span className="text-base font-semibold text-foreground">Joe Sangiorgio</span>
        )}
      </div>

      {/* Menu */}
      <ul className="p-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon
          const isActive = location.pathname === item.key

          return (
            <li key={item.key}>
              <Link
                to={item.to}
                onClick={() => {
                  // Close drawer on small screens when navigating
                  if (isSmallScreen) {
                    setSidebarCollapsed(true)
                  }
                }}
                className={`flex items-center p-2 rounded-lg transition-colors ${
                  sidebarCollapsed && !isSmallScreen ? 'justify-center' : 'gap-3'
                } ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-content1'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                {(!sidebarCollapsed || isSmallScreen) && <span>{item.label}</span>}
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )

  // Small screen: Use Drawer overlay
  if (isSmallScreen) {
    return (
      <Drawer
        isOpen={!sidebarCollapsed}
        onOpenChange={(open) => setSidebarCollapsed(!open)}
        placement="left"
        size="sm"
      >
        <DrawerContent>
          <DrawerBody className="p-0">
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    )
  }

  // Large screen: Use fixed sidebar
  return (
    <aside
      className={`bg-content2 transition-all duration-300 fixed left-0 top-0 bottom-0 overflow-auto ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <SidebarContent />
    </aside>
  )
}

