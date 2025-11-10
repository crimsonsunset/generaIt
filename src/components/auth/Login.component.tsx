import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Form } from '@heroui/form'
import { Input } from '@heroui/input'
import { Button } from '@heroui/button'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Divider } from '@heroui/divider'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Login form component
 * Accepts any username/password and stores user in localStorage
 * Uses HeroUI Form component with built-in validation
 */
export function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!username?.trim()) {
      return
    }

    setIsLoading(true)

    // Fake login - any username/password works
    login(username, password)

    // Small delay to simulate network request
    await new Promise((resolve) => setTimeout(resolve, 300))

    setIsLoading(false)

    // Always redirect to dashboard after login
    navigate({ to: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card 
          className="w-full" 
          shadow="lg"
          radius="lg"
        >
          <CardHeader className="flex flex-col gap-1 items-center pb-4 pt-6">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-sm text-foreground-500">Sign in to continue</p>
          </CardHeader>
          <Divider />
          <CardBody className="px-6 py-6">
            <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                isRequired
                name="username"
                label="Username"
                placeholder="Enter your username"
                labelPlacement="outside-top"
                errorMessage="Please enter a username"
                autoFocus
                radius="lg"
                variant="bordered"
                disabled={isLoading}
                autoComplete="username"
                classNames={{
                  input: 'text-base',
                  label: 'font-medium',
                }}
              />

              <Input
                isRequired
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                labelPlacement="outside-top"
                errorMessage="Please enter a password"
                radius="lg"
                variant="bordered"
                disabled={isLoading}
                autoComplete="current-password"
                classNames={{
                  input: 'text-base',
                  label: 'font-medium',
                }}
              />

              <Button
                type="submit"
                color="primary"
                variant="solid"
                size="lg"
                radius="lg"
                className="w-full mt-2 font-semibold"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <p className="text-xs text-center text-foreground-400 mt-2">
                Demo: Enter any username and password
              </p>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
