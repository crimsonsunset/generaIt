import { create } from 'zustand'
import { uniqueId } from 'lodash-es'
import type { ChatThread, ChatMessage } from '@/types/chat.types'
import { generateMessageId, generateThreadTitle } from '@/utils/thread.utils'

/**
 * Thread store state interface
 */
interface ThreadStore {
  threads: ChatThread[]
  currentThreadId: string | null

  // Thread management actions
  createThread: (title?: string) => string
  getThread: (id: string) => ChatThread | undefined
  getCurrentThread: () => ChatThread | undefined
  setCurrentThread: (id: string) => void
  addMessage: (threadId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>, messageId?: string) => void
  updateMessage: (threadId: string, messageId: string, content: string) => void
  renameThread: (threadId: string, newTitle: string) => void
  deleteThread: (threadId: string) => void

  // Persistence actions
  loadThreads: (userId: string) => void
  saveThreads: (userId: string) => void
  clearThreads: () => void
}

/**
 * localStorage key generator for user-specific threads
 */
function getThreadsStorageKey(userId: string): string {
  return `chat_threads_${userId}`
}

/**
 * Thread store implementation
 */
export const useThreadStore = create<ThreadStore>((set, get) => ({
  // Initial state
  threads: [],
  currentThreadId: null,

  /**
   * Creates a new thread and sets it as current
   */
  createThread: (title?: string) => {
    const threadId = uniqueId('thread_')
    const now = new Date()

    const newThread: ChatThread = {
      id: threadId,
      title: title || 'New Chat',
      messages: [],
      createdAt: now,
      updatedAt: now,
    }

    set((state) => ({
      threads: [newThread, ...state.threads], // Add to beginning (most recent first)
      currentThreadId: threadId,
    }))

    return threadId
  },

  /**
   * Gets a thread by ID
   */
  getThread: (id: string) => {
    return get().threads.find((thread) => thread.id === id)
  },

  /**
   * Gets the current active thread
   */
  getCurrentThread: () => {
    const { currentThreadId, threads } = get()
    if (!currentThreadId) return undefined
    return threads.find((thread) => thread.id === currentThreadId)
  },

  /**
   * Sets the current thread (will update URL via route component)
   */
  setCurrentThread: (id: string) => {
    set({ currentThreadId: id })
  },

  /**
   * Adds a message to a thread and updates the thread's updatedAt timestamp
   */
  addMessage: (threadId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>, messageId?: string) => {
    const newMessage: ChatMessage = {
      ...message,
      id: messageId || generateMessageId(),
      timestamp: new Date(),
    }

    set((state) => ({
      threads: state.threads.map((thread) => {
        if (thread.id === threadId) {
          // Check if message with this ID already exists to prevent duplicates
          const messageExists = thread.messages.some((msg) => msg.id === newMessage.id)
          if (messageExists) {
            return thread
          }

          const updatedThread: ChatThread = {
            ...thread,
            messages: [...thread.messages, newMessage],
            updatedAt: new Date(),
          }

          // Auto-generate title from first user message if title is "New Chat"
          if (thread.title === 'New Chat' && message.role === 'user') {
            updatedThread.title = generateThreadTitle(updatedThread.messages)
          }

          return updatedThread
        }
        return thread
      }),
    }))
  },

  /**
   * Updates message content (used for streaming)
   */
  updateMessage: (threadId: string, messageId: string, content: string) => {
    set((state) => ({
      threads: state.threads.map((thread) => {
        if (thread.id === threadId) {
          return {
            ...thread,
            messages: thread.messages.map((msg) =>
              msg.id === messageId ? { ...msg, content } : msg
            ),
            updatedAt: new Date(),
          }
        }
        return thread
      }),
    }))
  },

  /**
   * Renames a thread
   */
  renameThread: (threadId: string, newTitle: string) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, title: newTitle.trim() || 'New Chat' } : thread
      ),
    }))
  },

  /**
   * Deletes a thread and handles current thread switching
   */
  deleteThread: (threadId: string) => {
    set((state) => {
      const remainingThreads = state.threads.filter((thread) => thread.id !== threadId)
      let newCurrentThreadId = state.currentThreadId

      // If deleting current thread, switch to most recent remaining thread
      if (state.currentThreadId === threadId) {
        newCurrentThreadId = remainingThreads.length > 0 ? remainingThreads[0].id : null
      }

      return {
        threads: remainingThreads,
        currentThreadId: newCurrentThreadId,
      }
    })
  },

  /**
   * Loads threads from localStorage for a user
   */
  loadThreads: (userId: string) => {
    try {
      const storageKey = getThreadsStorageKey(userId)
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects and deduplicate messages
        const threads: ChatThread[] = parsed.map((thread: any) => {
          // Deduplicate messages by ID (keep first occurrence)
          const seenMessageIds = new Set<string>()
          const deduplicatedMessages = thread.messages
            .map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
            .filter((msg: ChatMessage) => {
              if (seenMessageIds.has(msg.id)) {
                return false
              }
              seenMessageIds.add(msg.id)
              return true
            })

          return {
            ...thread,
            createdAt: new Date(thread.createdAt),
            updatedAt: new Date(thread.updatedAt),
            messages: deduplicatedMessages,
          }
        })
        // Sort by updatedAt descending (most recent first)
        threads.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        set({ threads })
      }
    } catch (error) {
      // Failed to load threads from localStorage
    }
  },

  /**
   * Saves threads to localStorage for a user
   */
  saveThreads: (userId: string) => {
    try {
      const storageKey = getThreadsStorageKey(userId)
      const { threads } = get()
      
      // Deduplicate messages within each thread before saving
      const deduplicatedThreads = threads.map((thread) => {
        const seenMessageIds = new Set<string>()
        const deduplicatedMessages = thread.messages.filter((msg) => {
          if (seenMessageIds.has(msg.id)) {
            return false
          }
          seenMessageIds.add(msg.id)
          return true
        })

        return {
          ...thread,
          messages: deduplicatedMessages,
        }
      })
      
      // Sort by updatedAt descending before saving
      const sortedThreads = [...deduplicatedThreads].sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      )
      localStorage.setItem(storageKey, JSON.stringify(sortedThreads))
    } catch (error) {
      // Failed to save threads to localStorage
    }
  },

  /**
   * Clears all threads from memory (used on logout)
   */
  clearThreads: () => {
    set({
      threads: [],
      currentThreadId: null,
    })
  },
}))

