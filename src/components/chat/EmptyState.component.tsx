import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useNavigate } from '@tanstack/react-router'
import { useThreadStore } from '@/stores/thread.store'
import { useAuthStore } from '@/stores/auth.store'

interface EmptyStateProps {
  title?: string
  message?: string
  showPrompt?: boolean
  showNewThreadButton?: boolean
}

/**
 * EmptyState component - Welcome message shown when thread is empty or no threads exist
 * Displays friendly message encouraging user to start conversation
 * Shows "New Thread" button when no threads exist (for mobile when sidebar is hidden)
 */
export function EmptyState({
  title = 'Start a conversation',
  message = 'No messages yet. Send a message to begin chatting!',
  showPrompt = true,
  showNewThreadButton = false,
}: EmptyStateProps) {
  const navigate = useNavigate()
  const { createThread } = useThreadStore()
  const user = useAuthStore((state) => state.user)

  const handleCreateThread = () => {
    const threadId = createThread('New Chat')
    
    // Save threads to localStorage
    if (user?.id) {
      useThreadStore.getState().saveThreads(user.id)
    }

    // Navigate to new thread
    navigate({
      to: '/chat',
      search: { threadId },
      replace: true,
    })
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="max-w-md" shadow="sm" radius="lg">
        <CardBody className="p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-foreground-500 mb-4">{message}</p>
          {showNewThreadButton && (
            <Button
              color="primary"
              variant="solid"
              onPress={handleCreateThread}
              className="w-full mb-4"
              startContent={<PlusIcon className="w-4 h-4" />}
            >
              New Thread
            </Button>
          )}
          {showPrompt && (
            <p className="text-xs text-foreground-400 italic">
              Type your message below to get started
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

