import { uniqueId } from 'lodash-es'
import type { ChatMessage } from '@/types/chat.types'

/**
 * Generates a unique message ID
 */
export function generateMessageId(): string {
  return uniqueId('msg_')
}

/**
 * Generates a thread title from messages
 * Uses the first user message content, or "New Chat" if no messages exist
 */
export function generateThreadTitle(messages: ChatMessage[]): string {
  const firstUserMessage = messages.find((msg) => msg.role === 'user')
  if (firstUserMessage && firstUserMessage.content.trim()) {
    // Use first 50 characters of first user message
    const title = firstUserMessage.content.trim().slice(0, 50)
    return title.length < firstUserMessage.content.trim().length
      ? `${title}...`
      : title
  }
  return 'New Chat'
}

/**
 * Formats a date for display (relative format: "2m ago", "1h ago", etc.)
 */
export function formatThreadDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) {
    return 'Just now'
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }
  // For older dates, show formatted date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Formats a timestamp string for "Last Chat" display
 * Returns relative time format or "Never" if timestamp is null
 */
export function formatLastChat(timestamp: string | null): string {
  if (!timestamp) return 'Never'
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

