import { useNavigate } from '@tanstack/react-router'
import { Button } from '@heroui/button'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useThreadStore } from '@/stores/thread.store'
import { useAuthStore } from '@/stores/auth.store'

/**
 * NewThreadButton component - Button to create a new thread
 * Located at top of sidebar
 * Creates thread titled "New Chat" and switches to it immediately
 */
export function NewThreadButton() {
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
    <Button
      color="primary"
      variant="flat"
      onPress={handleCreateThread}
      className="w-full"
      startContent={<PlusIcon className="w-4 h-4" />}
    >
      New Thread
    </Button>
  )
}


