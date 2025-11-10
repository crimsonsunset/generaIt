import {useMedia, useMount} from 'react-use'
import {useTheme as useHeroUITheme} from '@heroui/use-theme'
import {useEffect} from 'react'
import {useAppStore} from '@/stores/app.store'

/**
 * Custom hook that provides reactive theme state via Zustand
 * Syncs theme changes to HeroUI's theme system
 *
 * Usage:
 *   const { theme, setTheme } = useTheme()
 *   // theme is reactive via Zustand, automatically synced with HeroUI
 */
export function useTheme() {
    const {theme: storeTheme, setTheme: setStoreTheme} = useAppStore()
    const {setTheme: setHeroUITheme} = useHeroUITheme()

    // Initialize HeroUI theme from store on mount
    useMount(() => {
        setHeroUITheme(storeTheme)
    })

    return {
        theme: storeTheme,
        setTheme: (theme: 'light' | 'dark') => {
            setStoreTheme(theme)
            setHeroUITheme(theme)
        },
    }
}

/**
 * Hook that tracks screen size and provides responsive sidebar state
 * Returns whether we're on a small screen (< 820px)
 * Automatically closes drawer on small screens when screen size changes
 */
export function useResponsiveSidebar() {
    const {setSidebarCollapsed} = useAppStore()
    const isSmallScreen = useMedia('(max-width: 820px)', false)

    // Close drawer when switching to small screen
    useEffect(() => {
        if (isSmallScreen) {
            setSidebarCollapsed(true)
        }
    }, [isSmallScreen, setSidebarCollapsed])

    return {isSmallScreen}
}

