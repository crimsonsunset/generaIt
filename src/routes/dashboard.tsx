import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppLayout } from '@/components/layout/app.layout'
import { DashboardPage } from '@/components/pages/dashboard.page'
import { checkAuth } from '@/utils/auth-guard.utils'

function DashboardWithLayout() {
  return (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  )
}

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ location }) => {
    // Redirect to login if not authenticated
    if (!checkAuth()) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: DashboardWithLayout,
})


