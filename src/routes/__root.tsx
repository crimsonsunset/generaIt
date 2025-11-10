import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { HeroUIProvider } from '@heroui/system'
import { lazy, Suspense } from 'react'

// Production-safe devtools: only load in development
const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : lazy(() =>
        import('@tanstack/react-router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        }))
      )

function RootComponent() {
  const navigate = useNavigate()

  // Router integration for HeroUI Link components
  // useHref adapter for TanStack Router (returns path as-is)
  const useHref = (to: string) => to

  // Wrap navigate for HeroUI compatibility
  const handleNavigate = (path: string) => {
    navigate({ to: path as any })
  }

  return (
    <HeroUIProvider navigate={handleNavigate} useHref={useHref}>
      <Outlet />
      <Suspense fallback={null}>
        <TanStackRouterDevtools />
      </Suspense>
    </HeroUIProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
}) 
