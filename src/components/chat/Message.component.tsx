import { Card, CardBody } from '@heroui/card'
import type { ChatMessage } from '@/types/chat.types'
import { formatThreadDate } from '@/utils/thread.utils'

interface MessageProps {
  message: ChatMessage
  isStreaming?: boolean
  showTimestamp?: boolean
}

/**
 * Message component - Individual message bubble
 * User messages: right-aligned, primary color styling
 * Assistant messages: left-aligned, default color styling
 * Shows streaming content for in-progress messages
 */
export function Message({ message, isStreaming = false, showTimestamp = false }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <Card
          className={`${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-default-100 text-foreground'
          }`}
          shadow="sm"
          radius="lg"
        >
          <CardBody className="px-4 py-3 min-h-[2.5rem]">
            {message.content ? (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            ) : isStreaming ? (
              <span className="inline-block w-2 h-4 bg-foreground animate-pulse"></span>
            ) : (
              <p className="text-sm text-foreground-400 italic">Empty message</p>
            )}
          </CardBody>
        </Card>
        {showTimestamp && (
          <span className="text-xs text-foreground-500 mt-1 px-2">
            {formatThreadDate(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  )
}

