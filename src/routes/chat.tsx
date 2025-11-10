import { createFileRoute, redirect, useSearch } from '@tanstack/react-router'
import { AppLayout } from '@/components/layout/app.layout'
import { ChatPanel } from '@/components/chat/ChatPanel.component'
import { checkAuth } from '@/utils/auth-guard.utils'
import { useAuthStore } from '@/stores/auth.store'
import { useThreadInitialization } from '@/hooks/chat.hooks'

/**
 * Chat route search params
 */
export interface ChatSearch {
  threadId?: string
}

/**
 * Chat page component with thread management
 */
function ChatPage() {
  const search = useSearch({ from: '/chat' })
  const user = useAuthStore((state) => state.user)

  // Initialize threads and handle thread selection
  useThreadInitialization(user?.id, search.threadId)

  return (
    <AppLayout>
      <ChatPanel />
    </AppLayout>
  )
}

export const Route = createFileRoute('/chat')({
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
  validateSearch: (search: Record<string, unknown>): ChatSearch => {
    return {
      threadId: typeof search.threadId === 'string' ? search.threadId : undefined,
    }
  },
  component: ChatPage,
})

