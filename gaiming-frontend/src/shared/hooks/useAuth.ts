/**
 * Enhanced Authentication Hook
 * Provides comprehensive authentication state and operations with JWT management
 */

import { useEffect, useCallback } from 'react'
import { useAuthStore } from '@/app/store/authStore'
import { authService } from '@/shared/services/authService'
import { tokenService } from '@/shared/services/tokenService'
import { useNotificationStore } from '@/app/store/notificationStore'

export interface AuthState {
  // User state
  user: any | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Session info
  sessionInfo: {
    isValid: boolean
    expiresAt: Date | null
    needsRefresh: boolean
    sessionId: string | null
  }
  
  // Security info
  tokenInfo: {
    isValid: boolean
    expiresAt: Date | null
    needsRefresh: boolean
  }
}

export interface AuthActions {
  // Authentication
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  
  // Session management
  checkSession: () => boolean
  updateActivity: () => void
  
  // Permissions
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  
  // Utilities
  clearError: () => void
  getAuthHeader: () => Record<string, string>
}

export interface UseAuthReturn extends AuthState, AuthActions {}

/**
 * Enhanced authentication hook with JWT management
 */
export const useAuth = (): UseAuthReturn => {
  const authStore = useAuthStore()
  const notifications = useNotificationStore()

  // Get session and token info
  const sessionInfo = authService.getSessionInfo()
  const tokenInfo = tokenService.getTokenInfo()

  /**
   * Enhanced login with error handling and notifications
   */
  const login = useCallback(async (username: string, password: string, rememberMe = false) => {
    try {
      await authStore.login(username, password, rememberMe)
      notifications.showSuccess('Welcome!', 'You have been logged in successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      notifications.showError('Login Failed', message)
      throw error
    }
  }, [authStore, notifications])

  /**
   * Enhanced logout with cleanup and notifications
   */
  const logout = useCallback(async () => {
    try {
      await authStore.logout()
      notifications.showInfo('Goodbye!', 'You have been logged out successfully.')
    } catch (error) {
      console.error('Logout error:', error)
      // Still show success message as local state is cleared
      notifications.showInfo('Goodbye!', 'You have been logged out.')
    }
  }, [authStore, notifications])

  /**
   * Refresh token with error handling
   */
  const refreshToken = useCallback(async () => {
    try {
      await authStore.refreshToken()
      console.log('Token refreshed successfully')
    } catch (error) {
      console.error('Token refresh failed:', error)
      notifications.showError('Session Expired', 'Please log in again.')
      throw error
    }
  }, [authStore, notifications])

  /**
   * Check session validity
   */
  const checkSession = useCallback(() => {
    return authStore.checkSession()
  }, [authStore])

  /**
   * Update last activity
   */
  const updateActivity = useCallback(() => {
    authStore.updateLastActivity()
  }, [authStore])

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback((permission: string) => {
    return authStore.hasPermission(permission)
  }, [authStore])

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: string) => {
    return authStore.hasRole(role)
  }, [authStore])

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback((roles: string[]) => {
    return roles.some(role => authStore.hasRole(role))
  }, [authStore])

  /**
   * Check if user has all specified permissions
   */
  const hasAllPermissions = useCallback((permissions: string[]) => {
    return permissions.every(permission => authStore.hasPermission(permission))
  }, [authStore])

  /**
   * Clear authentication error
   */
  const clearError = useCallback(() => {
    authStore.clearError()
  }, [authStore])

  /**
   * Get authentication header for API requests
   */
  const getAuthHeader = useCallback(() => {
    return authService.getAuthHeader()
  }, [])

  /**
   * Setup automatic session monitoring
   */
  useEffect(() => {
    let sessionCheckInterval: NodeJS.Timeout

    if (authStore.isAuthenticated) {
      // Check session every minute
      sessionCheckInterval = setInterval(() => {
        if (!checkSession()) {
          notifications.showWarning('Session Expired', 'Your session has expired. Please log in again.')
        }
      }, 60000)
    }

    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval)
      }
    }
  }, [authStore.isAuthenticated, checkSession, notifications])

  /**
   * Setup activity tracking
   */
  useEffect(() => {
    if (!authStore.isAuthenticated) return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      updateActivity()
    }

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [authStore.isAuthenticated, updateActivity])

  /**
   * Setup automatic token refresh
   */
  useEffect(() => {
    if (!authStore.isAuthenticated || !tokenInfo.needsRefresh) return

    const refreshTimeout = setTimeout(async () => {
      try {
        await refreshToken()
      } catch (error) {
        console.error('Automatic token refresh failed:', error)
      }
    }, 1000) // Refresh after 1 second

    return () => clearTimeout(refreshTimeout)
  }, [authStore.isAuthenticated, tokenInfo.needsRefresh, refreshToken])

  return {
    // State
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    sessionInfo,
    tokenInfo,

    // Actions
    login,
    logout,
    refreshToken,
    checkSession,
    updateActivity,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllPermissions,
    clearError,
    getAuthHeader,
  }
}

/**
 * Hook for checking specific permissions
 */
export const usePermission = (permission: string) => {
  const { hasPermission } = useAuth()
  return hasPermission(permission)
}

/**
 * Hook for checking specific roles
 */
export const useRole = (role: string) => {
  const { hasRole } = useAuth()
  return hasRole(role)
}

/**
 * Hook for session information
 */
export const useSession = () => {
  const { sessionInfo, tokenInfo, checkSession, updateActivity } = useAuth()
  
  return {
    sessionInfo,
    tokenInfo,
    checkSession,
    updateActivity,
    isSessionValid: sessionInfo.isValid,
    isTokenValid: tokenInfo.isValid,
    needsRefresh: tokenInfo.needsRefresh,
  }
}
