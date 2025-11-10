/**
 * Chat-related type definitions
 */

/**
 * Chat message role
 */
export type ChatMessageRole = 'user' | 'assistant' | 'system'

/**
 * Chat message interface
 */
export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string
  timestamp: Date
}

/**
 * Chat thread interface
 */
export interface ChatThread {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Streaming state type
 */
export interface StreamingState {
  isStreaming: boolean
  currentContent: string
  threadId: string | null
}

/**
 * OpenAI-compatible chat completion delta (for streaming)
 */
export interface ChatCompletionDelta {
  role?: 'assistant'
  content?: string
}

/**
 * OpenAI-compatible chat completion chunk (SSE format)
 */
export interface ChatCompletionChunk {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: Array<{
    index: number
    delta: ChatCompletionDelta
    finish_reason: string | null
  }>
}

/**
 * OpenAI-compatible chat request format
 */
export interface ChatRequest {
  model: string
  messages: Array<{
    role: string
    content: string
  }>
  stream?: boolean
  temperature?: number
  max_tokens?: number
}

