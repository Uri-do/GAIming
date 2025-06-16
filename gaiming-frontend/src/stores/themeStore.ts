import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ThemeConfig } from '@/types'

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
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void
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

// Apply theme on store initialization
const applyTheme = () => {
  const { theme } = useThemeStore.getState()
  
  // Apply CSS custom properties
  document.documentElement.style.setProperty('--primary-color', theme.primaryColor)
  document.documentElement.style.setProperty('--border-radius', `${theme.borderRadius}px`)
  document.documentElement.style.setProperty('--font-family', theme.fontFamily)
}

// Initialize theme on app start
if (typeof window !== 'undefined') {
  applyTheme()
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    const { theme } = useThemeStore.getState()
    
    if (theme.mode === 'system') {
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(e.matches ? 'dark' : 'light')
    }
  }
  
  mediaQuery.addEventListener('change', handleSystemThemeChange)
  
  // Apply initial system theme if needed
  const { theme } = useThemeStore.getState()
  if (theme.mode === 'system') {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(mediaQuery.matches ? 'dark' : 'light')
  }
}
