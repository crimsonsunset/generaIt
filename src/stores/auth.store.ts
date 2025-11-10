import {create} from 'zustand'
import {isEmpty, trim, uniqueId} from 'lodash-es'
import type {AuthStore, User} from '@/types/auth.types'
import {getUserFromStorage, saveUserToStorage,} from '@/utils/auth-guard.utils'
import {getAvatarChar} from '@/utils/avatar.utils'
import {useThreadStore} from './thread.store'

/**
 * Generates a unique user ID
 */
function generateUserId(): string {
    return uniqueId('user_')
}

export const useAuthStore = create<AuthStore>((set) => ({
    // Initial state
    user: null,
    isAuthenticated: false,

    // Check authentication on store init
    checkAuth: () => {
        const user = getUserFromStorage()
        if (user) {
            set({user, isAuthenticated: true})
        } else {
            set({user: null, isAuthenticated: false})
        }
    },

    // Login - accepts any username/password (no password for now since its not used yet)
    login: (username: string) => {
        // Generate user object with avatar char
        // Always generate a new user ID - logout clears everything, so each login is fresh
        const cleanUsername = isEmpty(trim(username)) ? 'User' : trim(username)
        const user: User = {
            id: generateUserId(),
            username: cleanUsername,
            avatarChar: getAvatarChar(cleanUsername),
            email: undefined,
        }

        // Save to localStorage
        saveUserToStorage(user)

        // Update store
        set({user, isAuthenticated: true})
    },

    // Logout - clears all localStorage data
    logout: () => {
        // Clear all localStorage data (user, threads, and any other data)
        localStorage.clear()

        // Clear thread store state
        useThreadStore.getState().clearThreads()

        // Update store
        set({user: null, isAuthenticated: false})
    },
}))

// Check auth on store creation
if (typeof window !== 'undefined') {
    useAuthStore.getState().checkAuth()
}

