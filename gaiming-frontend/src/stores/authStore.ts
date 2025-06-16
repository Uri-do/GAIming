import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { API_CONFIG, API_ENDPOINTS } from '@/config'

interface User {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  clearError: () => void
  refreshToken: () => Promise<void>
  updateProfile: (updates: Partial<User>) => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
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
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          // Call our backend API
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, rememberMe: false }),
          })

          if (!response.ok) {
            throw new Error('Invalid credentials')
          }

          const data = await response.json()

          // Check if login was successful
          if (!data.isSuccess) {
            throw new Error(data.errorMessage || 'Login failed')
          }

          // Extract user and token from API response
          const user = {
            id: data.user.userId,
            email: data.user.email,
            name: data.user.displayName,
            role: data.user.roles?.[0] || 'User',
            permissions: data.user.permissions || [],
            avatar: undefined
          }

          const token = data.token.accessToken

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          // Store token in localStorage for API requests
          localStorage.setItem('authToken', token)
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
        
        // Clear token from localStorage
        localStorage.removeItem('authToken')
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true })
        localStorage.setItem('authToken', token)
      },

      clearError: () => {
        set({ error: null })
      },

      refreshToken: async () => {
        const { token } = get()

        if (!token) {
          throw new Error('No token available')
        }

        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(token),
          })

          if (!response.ok) {
            throw new Error('Token refresh failed')
          }

          const data = await response.json()

          // Check if refresh was successful
          if (!data.isSuccess) {
            throw new Error(data.errorMessage || 'Token refresh failed')
          }

          const newToken = data.token.accessToken

          set({
            token: newToken,
          })

          localStorage.setItem('authToken', newToken)
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      updateProfile: (updates: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...updates }
          })
        }
      },

      hasPermission: (permission: string) => {
        const user = get().user
        if (!user) return false

        // Admin role has all permissions
        if (user.role === 'Admin') return true

        // Check if user has the specific permission
        return user.permissions.includes(permission)
      },

      hasRole: (role: string) => {
        const user = get().user
        if (!user) return false

        return user.role === role
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

// Auto-refresh token before expiration
const setupTokenRefresh = () => {
  const refreshInterval = API_CONFIG.TOKEN_REFRESH.interval
  
  setInterval(async () => {
    const { isAuthenticated, refreshToken } = useAuthStore.getState()
    
    if (isAuthenticated) {
      try {
        await refreshToken()
      } catch (error) {
        console.error('Token refresh failed:', error)
      }
    }
  }, refreshInterval)
}

// Initialize token refresh
if (typeof window !== 'undefined') {
  setupTokenRefresh()
}

// Check for existing token on app start
const initializeAuth = () => {
  const token = localStorage.getItem('authToken')

  if (token) {
    // Verify token with backend
    fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('Token verification failed')
      })
      .then(data => {
        const user = {
          id: data.userId,
          email: data.email,
          name: data.displayName,
          role: data.roles?.[0] || 'User',
          permissions: data.permissions || [],
          avatar: undefined
        }
        useAuthStore.getState().setUser(user)
        useAuthStore.getState().setToken(token)
      })
      .catch(() => {
        // Token is invalid, remove it
        localStorage.removeItem('authToken')
        useAuthStore.getState().logout()
      })
  }
}

// Initialize auth on app start
if (typeof window !== 'undefined') {
  initializeAuth()
}
