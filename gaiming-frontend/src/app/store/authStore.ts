import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/shared/services/authService'
import { tokenService } from '@/shared/services/tokenService'

// Simple user interface for testing
export interface User {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  avatar?: string
}

// Auth state
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  checkSession: () => boolean
  updateLastActivity: () => void
  setUser: (user: User) => void
  clearError: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  initialize: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (username: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null })

        try {
          const user = await authService.login({ username, password, rememberMe })

          set({
            user,
            token: tokenService.getAccessToken(),
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })

        try {
          await authService.logout()
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          // Even if logout fails, clear local state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      refreshToken: async () => {
        try {
          const newToken = await authService.refreshToken()
          set({ token: newToken })
        } catch (error) {
          // Token refresh failed, logout user
          get().logout()
          throw error
        }
      },

      checkSession: () => {
        const sessionInfo = authService.getSessionInfo()
        if (!sessionInfo.isValid) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          })
          return false
        }
        return true
      },

      updateLastActivity: () => {
        authService.updateLastActivity()
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      clearError: () => {
        set({ error: null })
      },

      hasPermission: (permission: string) => {
        return authService.hasPermission(permission)
      },

      hasRole: (role: string) => {
        return authService.hasRole(role)
      },

      initialize: () => {
        // Initialize auth service
        authService.initialize()

        // Check for existing session
        const sessionInfo = authService.getSessionInfo()
        if (sessionInfo.isValid && sessionInfo.user) {
          set({
            user: sessionInfo.user,
            token: tokenService.getAccessToken(),
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Export auth selectors for convenience
export const authSelectors = {
  user: (state: AuthStore) => state.user,
  isAuthenticated: (state: AuthStore) => state.isAuthenticated,
  isLoading: (state: AuthStore) => state.isLoading,
  error: (state: AuthStore) => state.error,
  permissions: (state: AuthStore) => state.user?.permissions || [],
  role: (state: AuthStore) => state.user?.role,
}

// Initialize auth store on app start
if (typeof window !== 'undefined') {
  // Initialize the auth store
  useAuthStore.getState().initialize()
}
