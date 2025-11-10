import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useThreadStore } from '@/stores/thread.store'
import { useAuthStore } from '@/stores/auth.store'
import type { ChatMessage } from '@/types/chat.types'
import { generateMessageId } from '@/utils/thread.utils'
import {
  convertMessagesToOpenAIFormat,
  streamChatCompletion,
} from '@/services/chat.service'

/**
 * Hook to initialize threads and handle thread selection based on URL
 * Handles loading threads from localStorage, validating URL threadId, and syncing URL when thread changes
 *
 * @param userId - Current user ID (from auth store)
 * @param threadId - Thread ID from URL search params (optional)
 */
export function useThreadInitialization(userId: string | undefined, threadId?: string) {
  const navigate = useNavigate()
  const { threads, currentThreadId, loadThreads, setCurrentThread, getThread } =
    useThreadStore()

  const initializedRef = useRef(false)
  const lastThreadIdRef = useRef<string | undefined>(threadId)

  // Load threads from localStorage when userId changes
  useEffect(() => {
    if (!userId) return

    loadThreads(userId)
    initializedRef.current = false // Reset initialization flag when reloading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]) // loadThreads is stable (Zustand store function), no need to include in deps

  // Handle thread selection after threads are loaded or when threadId changes
  useEffect(() => {
    if (!userId || threads.length === 0) {
      // Wait for threads to load
      if (threads.length === 0 && initializedRef.current) {
        // Threads were cleared, reset initialization
        initializedRef.current = false
      }
      return
    }

    // Only process if threadId changed or we haven't initialized yet
    if (threadId === lastThreadIdRef.current && initializedRef.current) {
      return
    }

    lastThreadIdRef.current = threadId
    initializedRef.current = true

    // If threadId in URL, validate and set it
    if (threadId) {
      const thread = getThread(threadId)
      if (thread) {
        setCurrentThread(threadId)
      } else {
        // Invalid threadId - clear it from URL if no threads exist, otherwise use most recent
        if (threads.length === 0) {
          navigate({
            to: '/chat',
            replace: true,
          })
        } else {
          const mostRecentThread = threads[0]
          navigate({
            to: '/chat',
            search: { threadId: mostRecentThread.id },
            replace: true,
          })
        }
      }
      return
    }

    // No threadId in URL, use most recent thread if available
    if (threads.length > 0) {
      const mostRecentThread = threads[0]
      navigate({
        to: '/chat',
        search: { threadId: mostRecentThread.id },
        replace: true,
      })
    } else {
      // No threads exist - clear current thread and let UI show empty state
      // Don't set currentThreadId - just let it be null naturally
    }
  }, [userId, threadId, threads.length, navigate, setCurrentThread, getThread])

  // Sync URL when current thread changes (for deep linking)
  // Only sync if the change didn't come from URL (to avoid loops)
  useEffect(() => {
    // Skip if we're already processing URL changes (threadId matches)
    if (currentThreadId === threadId) return

    if (currentThreadId) {
      navigate({
        to: '/chat',
        search: { threadId: currentThreadId },
        replace: true,
      })
    } else if (!currentThreadId && threadId) {
      // Current thread was cleared (e.g., last thread deleted), clear URL
      navigate({
        to: '/chat',
        replace: true,
      })
    }
  }, [currentThreadId, threadId, navigate])
}

/**
 * Hook for streaming chat messages using SSE
 * Handles sending messages and receiving streaming responses from Ollama API
 * Uses chat service layer for all API communication
 *
 * @returns Object containing sendMessage function, streaming state, error state, and abort function
 */
export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortRef = useRef<(() => void) | null>(null)
  const currentMessageIdRef = useRef<string | null>(null)

  const { currentThreadId, addMessage, updateMessage, saveThreads, getCurrentThread } =
    useThreadStore()
  const user = useAuthStore((state) => state.user)

  /**
   * Sends a message and handles streaming response
   * Adds user message immediately, creates assistant placeholder, streams response character-by-character
   *
   * @param content - The message content to send
   */
  const sendMessage = useCallback(
    async (content: string) => {
      // Validation checks
      if (!content.trim()) {
        setError(new Error('Message content cannot be empty'))
        return
      }

      if (!currentThreadId || !user) {
        setError(new Error('No active thread or user'))
        return
      }

      if (isStreaming) {
        setError(new Error('Already streaming a response'))
        return
      }

      const currentThread = getCurrentThread()
      if (!currentThread) {
        setError(new Error('Thread not found'))
        return
      }

      try {
        setError(null)
        setIsStreaming(true)

        // Add user message to thread immediately (optimistic update)
        const userMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
          role: 'user',
          content: content.trim(),
        }
        addMessage(currentThreadId, userMessage)

        // Create assistant message placeholder with empty content
        const assistantMessageId = generateMessageId()
        currentMessageIdRef.current = assistantMessageId
        const assistantMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
          role: 'assistant',
          content: '',
        }
        addMessage(currentThreadId, assistantMessage, assistantMessageId)

        // Get updated thread with new user message to prepare API request
        const updatedThread = getCurrentThread()
        if (!updatedThread) {
          throw new Error('Thread not found after adding message')
        }

        // Prepare messages for API (convert to OpenAI format)
        // Filter out empty assistant messages (placeholders) before sending to API
        const messagesForAPI = updatedThread.messages.filter(
          (msg) => msg.role !== 'assistant' || msg.content.trim() !== ''
        )
        const apiMessages = convertMessagesToOpenAIFormat(messagesForAPI)

        // Use service layer for streaming
        const { abort } = streamChatCompletion(apiMessages, {
          onChunk: (accumulatedContent) => {
            // Update message in thread store as chunks arrive
            updateMessage(currentThreadId, assistantMessageId, accumulatedContent)
          },
          onComplete: () => {
            // Stream completed - save to localStorage
            saveThreads(user.id)
            setIsStreaming(false)
            currentMessageIdRef.current = null
            abortRef.current = null
          },
          onError: (err) => {
            // Handle errors
            if (err.name === 'AbortError') {
              // User cancelled - don't set error state, just clean up
              setIsStreaming(false)
              currentMessageIdRef.current = null
              abortRef.current = null
            } else {
              setError(err)
              setIsStreaming(false)
              currentMessageIdRef.current = null
              abortRef.current = null
            }
          },
        })

        // Store abort function for cancellation
        abortRef.current = abort
      } catch (err) {
        // Handle unexpected errors
        if (err instanceof Error) {
          setError(err)
        } else {
          setError(new Error('Unknown error occurred'))
        }
        setIsStreaming(false)
        currentMessageIdRef.current = null
        abortRef.current = null
      }
    },
    [
      currentThreadId,
      user,
      isStreaming,
      getCurrentThread,
      addMessage,
      updateMessage,
      saveThreads,
    ]
  )

  /**
   * Cancels the current streaming operation
   * Uses abort function from service layer
   */
  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current()
      abortRef.current = null
      setIsStreaming(false)
      currentMessageIdRef.current = null
    }
  }, [])

  // Cleanup on unmount - abort any in-flight requests
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current()
      }
    }
  }, [])

  return {
    sendMessage,
    abort,
    isStreaming,
    error,
  }
}

