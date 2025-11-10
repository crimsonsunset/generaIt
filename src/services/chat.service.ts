import { fetchEventSource } from '@microsoft/fetch-event-source'
import { apiClient, CHAT_COMPLETIONS_URL, DEFAULT_MODEL } from '@/config/axios.config'
import type { ChatMessage, ChatCompletionChunk } from '@/types/chat.types'

/**
 * Check if the Ollama Chat API is available and responding
 * @returns Promise<boolean> - true if API is connected, false otherwise
 */
export async function checkChatApiStatus(): Promise<boolean> {
  try {
    const response = await apiClient.get('/api/tags', {
      timeout: 5000,
    })
    return response.status === 200
  } catch {
    // API is down or unreachable
    return false
  }
}

/**
 * Converts chat messages to OpenAI-compatible format
 * @param messages - Array of ChatMessage objects
 * @returns Array of OpenAI format messages ({role, content})
 */
export function convertMessagesToOpenAIFormat(
  messages: ChatMessage[]
): Array<{ role: string; content: string }> {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))
}

/**
 * Streams chat completion from Ollama API using SSE
 * Handles SSE parsing and calls callbacks for chunks, completion, and errors
 *
 * @param messages - Array of OpenAI-format messages ({role, content})
 * @param callbacks - Object containing callback functions
 * @param callbacks.onChunk - Called when a content chunk is received
 * @param callbacks.onComplete - Called when stream completes successfully
 * @param callbacks.onError - Called when an error occurs
 * @returns Object with abort function to cancel the stream
 */
export function streamChatCompletion(
  messages: Array<{ role: string; content: string }>,
  callbacks: {
    onChunk: (content: string) => void
    onComplete: () => void
    onError: (error: Error) => void
  }
): { abort: () => void } {
  const abortController = new AbortController()
  let accumulatedContent = ''

  // Start streaming in background (don't await, let it run)
  fetchEventSource(CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      stream: true,
    }),
    signal: abortController.signal,
    onmessage: (event) => {
      // Handle [DONE] marker
      if (event.data === '[DONE]') {
        return
      }

      try {
        // Parse OpenAI SSE format
        const parsed: ChatCompletionChunk = JSON.parse(event.data)
        const content = parsed.choices?.[0]?.delta?.content

        if (content) {
          // Accumulate content character-by-character
          accumulatedContent += content
          // Call onChunk callback with accumulated content
          callbacks.onChunk(accumulatedContent)
        }
      } catch (parseError) {
        // Handle malformed SSE data gracefully
        // Continue processing other chunks instead of failing completely
      }
    },
    onerror: (err) => {
      // Handle errors - throw to stop retrying
      callbacks.onError(err instanceof Error ? err : new Error(String(err)))
      throw err
    },
    onclose: () => {
      // Stream completed successfully
      callbacks.onComplete()
    },
  }).catch((err) => {
    // Handle errors that weren't caught in onerror
    if (err instanceof Error && err.name !== 'AbortError') {
      callbacks.onError(err)
    }
    // AbortError is expected when user cancels, don't call onError
  })

  return {
    abort: () => {
      abortController.abort()
    },
  }
}

