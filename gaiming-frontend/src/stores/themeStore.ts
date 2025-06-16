import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ThemeConfig, ThemeMode } from '@/types'

interface ThemeState {
  theme: ThemeConfig
  sidebarCollapsed: boolean
  notifications: {
    enabled: boolean
    sound: boolean
    desktop: boolean
  }
}

interface ThemeActions {
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
  setPrimaryColor: (color: string) => void
  setBorderRadius: (radius: number) => void
  setFontFamily: (family: string) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  updateNotificationSettings: (settings: Partial<ThemeState['notifications']>) => void
  resetTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

const defaultTheme: ThemeConfig = {
  mode: 'system',
  primaryColor: '#3b82f6',
  borderRadius: 8,
  fontFamily: 'Inter',
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, _get) => ({
      // Initial state
      theme: defaultTheme,
      sidebarCollapsed: false,
      notifications: {
        enabled: true,
        sound: true,
        desktop: true,
      },

      // Actions
      setThemeMode: (mode) => {
        set((state) => ({
          theme: { ...state.theme, mode }
        }))
        applyTheme()
      },

      toggleTheme: () => {
        set((state) => {
          const currentMode = state.theme.mode
          let newMode: ThemeMode

          if (currentMode === 'light') {
            newMode = 'dark'
          } else if (currentMode === 'dark') {
            newMode = 'light'
          } else {
            // If system, toggle to opposite of current system preference
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            newMode = systemPrefersDark ? 'light' : 'dark'
          }

          return {
            theme: { ...state.theme, mode: newMode }
          }
        })
        applyTheme()
      },

      setPrimaryColor: (primaryColor) => {
        set((state) => ({
          theme: { ...state.theme, primaryColor }
        }))

        // Update CSS custom properties
        document.documentElement.style.setProperty('--primary-color', primaryColor)
      },

      setBorderRadius: (borderRadius) => {
        set((state) => ({
          theme: { ...state.theme, borderRadius }
        }))
        
        // Update CSS custom properties
        document.documentElement.style.setProperty('--border-radius', `${borderRadius}px`)
      },

      setFontFamily: (fontFamily) => {
        set((state) => ({
          theme: { ...state.theme, fontFamily }
        }))
        
        // Update CSS custom properties
        document.documentElement.style.setProperty('--font-family', fontFamily)
      },

      toggleSidebar: () => {
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed
        }))
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed })
      },

      updateNotificationSettings: (settings) => {
        set((state) => ({
          notifications: { ...state.notifications, ...settings }
        }))
      },

      resetTheme: () => {
        set({
          theme: defaultTheme,
          sidebarCollapsed: false,
          notifications: {
            enabled: true,
            sound: true,
            desktop: true,
          }
        })
        
        // Reset CSS custom properties
        document.documentElement.style.removeProperty('--primary-color')
        document.documentElement.style.removeProperty('--border-radius')
        document.documentElement.style.removeProperty('--font-family')
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)

// Helper function to get the effective theme mode
const getEffectiveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

// Apply theme on store initialization
const applyTheme = () => {
  const { theme } = useThemeStore.getState()

  // Apply CSS custom properties
  document.documentElement.style.setProperty('--primary-color', theme.primaryColor)
  document.documentElement.style.setProperty('--border-radius', `${theme.borderRadius}px`)
  document.documentElement.style.setProperty('--font-family', theme.fontFamily)

  // Apply theme mode
  const effectiveTheme = getEffectiveTheme(theme.mode)
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(effectiveTheme)
}

// Initialize theme on app start
if (typeof window !== 'undefined') {
  applyTheme()

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleSystemThemeChange = () => {
    const { theme } = useThemeStore.getState()
    if (theme.mode === 'system') {
      applyTheme()
    }
  }

  mediaQuery.addEventListener('change', handleSystemThemeChange)
}
