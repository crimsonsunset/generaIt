import { createFileRoute, redirect } from '@tanstack/react-router'
import { Login } from '@/components/auth/Login.component'
import { checkAuth } from '@/utils/auth-guard.utils'

function LoginPage() {
  return <Login />
}

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    // Redirect to dashboard if already authenticated
    if (checkAuth()) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: LoginPage,
})

