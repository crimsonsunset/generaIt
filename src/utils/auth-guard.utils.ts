/**
 * Authentication guard utilities for route protection
 * Used in TanStack Router beforeLoad hooks
 */

import { get } from 'lodash-es'
import type { User } from '@/types/auth.types'

const USER_STORAGE_KEY = 'chat_user'

/**
 * Checks if user exists in localStorage
 * @returns true if user is authenticated, false otherwise
 */
export function checkAuth(): boolean {
  const userStr = localStorage.getItem(USER_STORAGE_KEY)
  if (!userStr) return false
  
  try {
    const user = JSON.parse(userStr) as User
    return !!get(user, 'id') && !!get(user, 'username')
  } catch {
    return false
  }
}

/**
 * Gets user from localStorage
 * @returns User object if found, null otherwise
 */
export function getUserFromStorage(): User | null {
  const userStr = localStorage.getItem(USER_STORAGE_KEY)
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

/**
 * Saves user to localStorage
 * @param user - User object to save
 */
export function saveUserToStorage(user: User): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

/**
 * Removes user from localStorage
 */
export function removeUserFromStorage(): void {
  localStorage.removeItem(USER_STORAGE_KEY)
}

