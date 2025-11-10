import { get } from 'lodash-es'
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  Cog6ToothIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline'
import { useNavigate } from '@tanstack/react-router'
import { Avatar } from '@heroui/avatar'
import { Button } from '@heroui/button'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown'
import { useAppStore } from '@/stores/app.store'
import { useAuthStore } from '@/stores/auth.store'
import { useTheme } from '@/hooks/app.hooks'

/**
 * Header component - top navigation bar with sidebar toggle, theme toggle, and user menu
 */
export function Header() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore()
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <header className="bg-background border-b border-divider px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="light"
          size="sm"
          radius="lg"
          isIconOnly
          onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="light"
          size="sm"
          radius="lg"
          isIconOnly
          onPress={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <MoonIcon className="h-5 w-5" />
          ) : (
            <SunIcon className="h-5 w-5" />
          )}
        </Button>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              variant="light"
              size="sm"
              radius="lg"
              isIconOnly
              className="min-w-0"
              aria-label="User menu"
            >
              <Avatar
                size="sm"
                name={get(user, 'avatarChar', '?')}
                color="primary"
                radius="lg"
              />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User menu" variant="flat">
            <DropdownItem
              key="name"
              textValue={get(user, 'username', 'User')}
              className="h-auto py-2"
              isReadOnly
            >
              <div className="font-semibold text-foreground">
                {get(user, 'username', 'User')}
              </div>
            </DropdownItem>
            <DropdownItem key="divider" isReadOnly className="h-0 p-0">
              <div className="h-px bg-divider my-1" />
            </DropdownItem>
            <DropdownItem
              key="settings"
              startContent={<Cog6ToothIcon className="h-4 w-4" />}
              onPress={() => {
                // Noop for now
              }}
            >
              Settings
            </DropdownItem>
            <DropdownItem
              key="logout"
              startContent={<ArrowRightStartOnRectangleIcon className="h-4 w-4" />}
              onPress={handleLogout}
              color="danger"
            >
              Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  )
}

