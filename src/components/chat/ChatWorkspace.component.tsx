import { useThreadStore } from '@/stores/thread.store'
import { useChatStream } from '@/hooks/chat.hooks'
import { ChatConversation } from './ChatConversation.component'
import { ChatInput } from './ChatInput.component'

/**
 * ChatWorkspace component - Main chat container orchestrating ChatConversation + ChatInput
 * Full-height flex layout with conversation area and input at bottom
 */
export function ChatWorkspace() {
  const currentThread = useThreadStore((state) => state.getCurrentThread())
  const { sendMessage, isStreaming } = useChatStream()

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background">
      {/* Chat Conversation Area - Scrollable */}
      <ChatConversation isStreaming={isStreaming} />

      {/* Chat Input - Sticky at bottom */}
      {currentThread && <ChatInput sendMessage={sendMessage} isStreaming={isStreaming} />}
    </div>
  )
}

