import { useState, useCallback } from 'react'
import { Input } from '@heroui/input'
import { Button } from '@heroui/button'
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { TypingIndicator } from './TypingIndicator.component'
import { useAppStore } from '@/stores/app.store'
import { useResponsiveSidebar } from '@/hooks/app.hooks'

interface ChatInputProps {
  sendMessage: (content: string) => Promise<void>
  isStreaming: boolean
}

/**
 * ChatInput component - Input field + send button for sending messages
 * Disabled during streaming, Enter key to send, Shift+Enter for newline
 */
export function ChatInput({ sendMessage, isStreaming }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const { setThreadDrawerOpen } = useAppStore()
  const { isSmallScreen } = useResponsiveSidebar()

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

