import { createFileRoute, redirect } from '@tanstack/react-router'
import { checkAuth } from '@/utils/auth-guard.utils'

function IndexPage() {
  // This component won't render due to beforeLoad redirect
  return null
}

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Redirect based on authentication status
    const isAuthenticated = checkAuth()
    throw redirect({
      to: isAuthenticated ? '/dashboard' : '/login',
    })
  },
  component: IndexPage,
})

