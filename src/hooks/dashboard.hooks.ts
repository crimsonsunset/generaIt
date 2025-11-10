import { useEffect, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useThreadStore } from '@/stores/thread.store'
import { useAuthStore } from '@/stores/auth.store'
import { formatLastChat } from '@/utils/thread.utils'

/**
 * Hook to load threads when user is available
 * Side effect hook - returns nothing
 */
export function useDashboardThreads() {
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.id) {
      useThreadStore.getState().loadThreads(user.id)
    }
  }, [user?.id])
}

/**
 * Hook to calculate dashboard statistics from threads
 * Returns total messages, active conversations, last chat timestamp, and last chat thread ID
 */
export function useDashboardStats() {
  const { threads } = useThreadStore()

  return useMemo(() => {
    const totalMessages = threads.reduce((sum, thread) => sum + thread.messages.length, 0)
    const activeConversations = threads.length

    // Find the most recently updated thread (only threads with messages)
    const threadsWithMessages = threads.filter((thread) => thread.messages.length > 0)
    let lastChatTimestamp: Date | null = null
    let lastChatThreadId: string | null = null

    if (threadsWithMessages.length > 0) {
      const mostRecentThread = threadsWithMessages.reduce((latest, thread) => {
        return thread.updatedAt > latest.updatedAt ? thread : latest
      }, threadsWithMessages[0])

      lastChatTimestamp = mostRecentThread.updatedAt
      lastChatThreadId = mostRecentThread.id
    }

    return {
      totalMessages,
      activeConversations,
      lastChatTimestamp: lastChatTimestamp ? lastChatTimestamp.toISOString() : null,
      lastChatThreadId,
      formattedLastChat: formatLastChat(lastChatTimestamp ? lastChatTimestamp.toISOString() : null),
    }
  }, [threads])
}

/**
 * Hook to generate chart data for last 7 days from message timestamps
 * Returns array of { date: string, messages: number } for chart display
 */
export function useDashboardChart() {
  const { threads } = useThreadStore()

  return useMemo(() => {
    const now = new Date()
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // Create array for last 7 days with their day names
    const last7Days: Array<{ date: string; dayIndex: number; dateObj: Date }> = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0) // Normalize to start of day
      last7Days.push({
        date: days[date.getDay()],
        dayIndex: date.getDay(),
        dateObj: date,
      })
    }

    // Initialize counts for each day
    const dayCounts = new Map<string, number>()
    last7Days.forEach((day) => {
      dayCounts.set(day.dateObj.toISOString().split('T')[0], 0)
    })

    // Count messages per day
    threads.forEach((thread) => {
      thread.messages.forEach((message) => {
        const messageDate = new Date(message.timestamp)
        messageDate.setHours(0, 0, 0, 0) // Normalize to start of day
        const dateKey = messageDate.toISOString().split('T')[0]

        // Only count messages from last 7 days
        const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff >= 0 && daysDiff < 7 && dayCounts.has(dateKey)) {
          dayCounts.set(dateKey, (dayCounts.get(dateKey) || 0) + 1)
        }
      })
    })

    // Convert to array format with day names, maintaining chronological order
    return last7Days.map((day) => ({
      date: day.date,
      messages: dayCounts.get(day.dateObj.toISOString().split('T')[0]) || 0,
    }))
  }, [threads])
}

/**
 * Hook to provide navigation handlers for dashboard actions
 * Returns handler for navigating to chat page with optional thread ID
 */
export function useDashboardNavigation() {
  const navigate = useNavigate()

  const handleGoToChat = (threadId?: string | null) => {
    if (threadId) {
      navigate({
        to: '/chat',
        search: { threadId },
      })
    } else {
      navigate({ to: '/chat' })
    }
  }

  return {
    handleGoToChat,
  }
}

