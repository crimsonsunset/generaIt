import { useState, useCallback, useRef, useEffect } from 'react'
import { Input } from '@heroui/input'
import { Button } from '@heroui/button'
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { TypingIndicator } from './TypingIndicator.component'
import { useAppStore } from '@/stores/app.store'
import { useResponsiveSidebar } from '@/hooks/app.hooks'
import { useThreadStore } from '@/stores/thread.store'

interface ChatInputProps {
  sendMessage: (content: string) => Promise<void>
  isStreaming: boolean
}

/**
 * ChatInput component - Input field + send button for sending messages
 * Disabled during streaming, Enter key to send, Shift+Enter for newline
 * Auto-focuses when a new thread is created
 */
export function ChatInput({ sendMessage, isStreaming }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const { setThreadDrawerOpen } = useAppStore()
  const { isSmallScreen } = useResponsiveSidebar()
  const inputRef = useRef<HTMLInputElement>(null)
  const currentThread = useThreadStore((state) => state.getCurrentThread())
  const currentThreadId = useThreadStore((state) => state.currentThreadId)
  const previousThreadIdRef = useRef<string | null>(null)

  // Auto-focus input when a new thread is created (thread changes and has no messages)
  useEffect(() => {
    if (
      currentThreadId &&
      currentThreadId !== previousThreadIdRef.current &&
      currentThread &&
      currentThread.messages.length === 0 &&
      !isStreaming
    ) {
      // Small delay to ensure input is rendered
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
    previousThreadIdRef.current = currentThreadId
  }, [currentThreadId, currentThread, isStreaming])

  const handleSend = useCallback(() => {
    const trimmedValue = inputValue.trim()
    if (!trimmedValue || isStreaming) {
      return
    }

    sendMessage(trimmedValue)
    setInputValue('')
  }, [inputValue, isStreaming, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Typing indicator above the divider */}
      {isStreaming && (
        <div className="flex justify-center pb-2">
          <TypingIndicator />
        </div>
      )}
      
      <div className={`flex items-center gap-2 p-4 border-t border-divider bg-background transition-opacity ${
        isStreaming ? 'opacity-50 cursor-not-allowed' : ''
      }`}>
        {/* Thread button - only on small screens */}
        {isSmallScreen && (
          <Button
            color="primary"
            isIconOnly
            onPress={() => setThreadDrawerOpen(true)}
            disabled={isStreaming}
            aria-label="Open threads"
            size="lg"
            radius="lg"
            className={isStreaming ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
          </Button>
        )}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'Waiting for response...' : 'Type your message...'}
          disabled={isStreaming}
          className="flex-1"
          size="lg"
          radius="lg"
        />
        <Button
          color="primary"
          isIconOnly
          onPress={handleSend}
          disabled={isStreaming}
          aria-label="Send message"
          size="lg"
          radius="lg"
          className={isStreaming ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </Button>
      </div>
    </>
  )
}

