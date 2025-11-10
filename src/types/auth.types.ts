/**
 * Authentication-related type definitions
 */

export interface User {
  id: string
  username: string
  avatarChar: string
  email?: string
}

export interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => void
  logout: () => void
  checkAuth: () => void
}

