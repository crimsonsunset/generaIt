import axios from 'axios'

/**
 * Detect if we're running on Netlify
 * Netlify deployments use netlify.app domains
 */
const isNetlify = typeof window !== 'undefined' && 
  (window.location.hostname.includes('netlify.app') || 
   window.location.hostname.includes('netlify.com'))

/**
 * API base URL for Ollama LLM API
 * Uses Netlify proxy when deployed on Netlify
 * Falls back to direct API URL for local development
 * 
 * Netlify proxy: /api/llm/* -> api.joesangiorgio.com/llm/*
 */
const API_BASE_URL = isNetlify 
  ? '/api/llm'  // Use Netlify proxy
  : 'https://api.joesangiorgio.com/llm'  // Direct API call for local dev

/**
 * Display string for API endpoint (used in UI components)
 */
export const API_ENDPOINT_DISPLAY = 'api.joesangiorgio.com/llm'

/**
 * Chat completions endpoint path
 */
export const CHAT_COMPLETIONS_ENDPOINT = '/v1/chat/completions'

/**
 * Full URL for chat completions endpoint
 */
export const CHAT_COMPLETIONS_URL = `${API_BASE_URL}${CHAT_COMPLETIONS_ENDPOINT}`

/**
 * Default LLM model name
 */
export const DEFAULT_MODEL = 'qwen2.5:0.5b'

/**
 * Configured axios instance for API calls
 * Uses Netlify proxy when deployed, direct API URL for local dev
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Response interceptor for centralized error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

