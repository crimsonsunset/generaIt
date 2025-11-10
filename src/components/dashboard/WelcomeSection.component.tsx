import { get } from 'lodash-es'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { useAuthStore } from '@/stores/auth.store'

/**
 * WelcomeSection component - personalized greeting with username
 * Shows generic welcome if no user is available
 */
export function WelcomeSection() {
  const user = useAuthStore((state) => state.user)
  const username = get(user, 'username', null)
  
  // Check if user has any chat history (for first-time detection)
  const hasChatHistory = typeof window !== 'undefined' && 
    localStorage.getItem(`chat_threads_${get(user, 'id', '')}`) !== null

  return (
    <Card className="w-full bg-secondary-100" shadow="sm" radius="lg">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">Welcome</h3>
      </CardHeader>
      <CardBody className="pt-0">
        {username ? (
          <p className="text-foreground-600">
            {hasChatHistory ? (
              <>
                Welcome back, <span className="font-semibold text-foreground">{username}</span>! Ready to start chatting?
              </>
            ) : (
              <>
                Welcome, <span className="font-semibold text-foreground">{username}</span>! Ready to start chatting?
              </>
            )}
          </p>
        ) : (
          <p className="text-foreground-600">
            Welcome! Get started by creating your first chat conversation.
          </p>
        )}
      </CardBody>
    </Card>
  )
}

