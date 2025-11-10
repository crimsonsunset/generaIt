import { useEffect, useRef, useMemo } from 'react'
import { useThreadStore } from '@/stores/thread.store'
import { Message } from './Message.component'
import { EmptyState } from './EmptyState.component'

interface ChatConversationProps {
  isStreaming?: boolean
}

/**
 * ChatConversation component - Scrollable container displaying all messages from current thread
 * Auto-scrolls to bottom on new messages
 * Shows EmptyState when no thread selected or thread is empty
 * Shows TypingIndicator when streaming
 */
export function ChatConversation({ isStreaming = false }: ChatConversationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const previousThreadIdRef = useRef<string | undefined>(undefined)
  const currentThreadId = useThreadStore((state) => state.currentThreadId)
  const threads = useThreadStore((state) => state.threads)
  const currentThread = threads.find((thread) => thread.id === currentThreadId)
  
  // Deduplicate messages by ID to prevent React key warnings
  const messages = useMemo(() => {
    const rawMessages = currentThread?.messages || []
    const seen = new Set<string>()
    return rawMessages.filter((msg) => {
      if (seen.has(msg.id)) {
        console.warn('[ChatConversation] Duplicate message ID detected:', msg.id)
        return false
      }
      seen.add(msg.id)
      return true
    })
  }, [currentThread?.messages])

  // Scroll to bottom when thread changes (initial load)
  useEffect(() => {
    if (currentThread?.id && currentThread.id !== previousThreadIdRef.current) {
      previousThreadIdRef.current = currentThread.id
      // Scroll last message into view after a brief delay, with 100px offset
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight + 100
        } else {
          lastMessageRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
        }
      }, 0)
    }
  }, [currentThread?.id])

  // Get last message content length to track streaming updates
  const lastMessageContentLength = useMemo(() => {
    return messages.length > 0 ? messages[messages.length - 1]?.content?.length || 0 : 0
  }, [messages])

  // Scroll to bottom when new messages arrive or content updates during streaming
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight + 100
        } else {
          lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
      }, 0)
    }
  }, [messages.length, lastMessageContentLength, isStreaming])

  // No thread selected
  if (!currentThread) {
    const hasNoThreads = threads.length === 0
    return (
      <EmptyState
        title={hasNoThreads ? 'Start a conversation' : 'Select a thread'}
        message={
          hasNoThreads
            ? 'Create your first thread to start chatting!'
            : 'Choose a conversation from the sidebar to start chatting'
        }
        showPrompt={!hasNoThreads}
        showNewThreadButton={hasNoThreads}
      />
    )
  }

  // Thread exists but no messages yet
  if (messages.length === 0) {
    return <EmptyState />
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto pl-4 pr-0 py-6 scrollbar-hide"
      style={{ scrollBehavior: 'smooth' }}
    >
      {messages.map((message, index) => {
        // Check if this is the last message and it's an assistant message with empty content (streaming)
        const isLastMessage = index === messages.length - 1
        const isMessageStreaming =
          isStreaming && isLastMessage && message.role === 'assistant' && message.content === ''

        return (
          <div key={message.id} ref={isLastMessage ? lastMessageRef : undefined}>
            <Message
              message={message}
              isStreaming={isMessageStreaming}
              showTimestamp={false}
            />
          </div>
        )
      })}
    </div>
  )
}

