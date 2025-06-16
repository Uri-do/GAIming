/**
 * Enhanced Authentication Service
 * Handles login, logout, token management, and session security
 */

import { tokenService, type TokenPair } from './tokenService'
import { apiService } from './apiService'
import type { User } from '@/app/store/authStore'

// Authentication interfaces
export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
  captcha?: string
}

export interface LoginResponse {
  isSuccess: boolean
  user: {
    userId: string
    email: string
    displayName: string
    roles: string[]
    permissions: string[]
    avatar?: string
    lastLoginAt: string
    createdAt: string
  }
  token: TokenPair
  errorMessage?: string
  requiresTwoFactor?: boolean
  twoFactorToken?: string
}

export interface SessionInfo {
  isValid: boolean
  user: User | null
  expiresAt: Date | null
  needsRefresh: boolean
  sessionId: string | null
}

// Security configuration
const AUTH_CONFIG = {
  SESSION_CHECK_INTERVAL: 60 * 1000, // Check session every minute
  IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes idle timeout
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes lockout
} as const

class AuthService {
  private sessionCheckInterval: NodeJS.Timeout | null = null
  private lastActivity: number = Date.now()
  private loginAttempts: number = 0
  private lockoutUntil: number = 0

  /**
   * Initialize authentication service
   */
  initialize(): void {
    this.updateLastActivity()
    this.startSessionMonitoring()
    this.setupActivityListeners()
    
    // Check for existing session
    const tokenInfo = tokenService.getTokenInfo()
    if (tokenInfo.isValid) {
      console.log('Existing session found', {
        expiresAt: tokenInfo.expiresAt?.toISOString(),
        needsRefresh: tokenInfo.needsRefresh,
      })
    }
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<User> {
    // Check if account is locked
    if (this.isAccountLocked()) {
      const remainingTime = Math.ceil((this.lockoutUntil - Date.now()) / 1000 / 60)
      throw new Error(`Account locked. Try again in ${remainingTime} minutes.`)
    }

    try {
      const response = await apiService.post<LoginResponse>('/auth/login', credentials)

      if (!response.isSuccess) {
        this.handleFailedLogin()
        throw new Error(response.errorMessage || 'Login failed')
      }

      // Handle two-factor authentication if required
      if (response.requiresTwoFactor) {
        throw new Error('Two-factor authentication required')
      }

      // Store tokens securely
      tokenService.storeTokens(response.token)

      // Create user object
      const user: User = {
        id: response.user.userId,
        email: response.user.email,
        name: response.user.displayName,
        role: response.user.roles[0] || 'User',
        permissions: response.user.permissions,
        avatar: response.user.avatar,
      }

      // Reset login attempts on successful login
      this.loginAttempts = 0
      this.lockoutUntil = 0
      this.updateLastActivity()

      console.log('Login successful', {
        user: user.email,
        role: user.role,
        permissions: user.permissions.length,
      })

      return user
    } catch (error) {
      this.handleFailedLogin()
      throw error
    }
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = tokenService.getRefreshToken()
      
      if (refreshToken) {
        // Notify server about logout
        await apiService.post('/auth/logout', { refreshToken })
      }
    } catch (error) {
      console.warn('Server logout failed:', error)
    } finally {
      // Always clear local tokens
      tokenService.clearTokens()
      this.stopSessionMonitoring()
      this.lastActivity = 0
      
      console.log('Logout completed')
    }
  }

  /**
   * Get current session information
   */
  getSessionInfo(): SessionInfo {
    const tokenInfo = tokenService.getTokenInfo()
    const user = tokenService.getStoredUser()
    
    return {
      isValid: tokenInfo.isValid,
      user,
      expiresAt: tokenInfo.expiresAt,
      needsRefresh: tokenInfo.needsRefresh,
      sessionId: this.generateSessionId(),
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string> {
    try {
      const newToken = await tokenService.refreshAccessToken()
      this.updateLastActivity()
      return newToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Clear tokens on refresh failure
      tokenService.clearTokens()
      throw error
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    const user = tokenService.getStoredUser()
    if (!user) return false
    
    // Admin has all permissions
    if (user.role === 'Admin') return true
    
    return user.permissions.includes(permission)
  }

  /**
   * Check if user has role
   */
  hasRole(role: string): boolean {
    const user = tokenService.getStoredUser()
    return user?.role === role || false
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity(): void {
    this.lastActivity = Date.now()
  }

  /**
   * Check if session is idle
   */
  isSessionIdle(): boolean {
    const idleTime = Date.now() - this.lastActivity
    return idleTime > AUTH_CONFIG.IDLE_TIMEOUT
  }

  /**
   * Get authentication header for API requests
   */
  getAuthHeader(): Record<string, string> {
    const token = tokenService.getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  /**
   * Handle failed login attempt
   */
  private handleFailedLogin(): void {
    this.loginAttempts++
    
    if (this.loginAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
      this.lockoutUntil = Date.now() + AUTH_CONFIG.LOCKOUT_DURATION
      console.warn('Account locked due to too many failed attempts')
    }
  }

  /**
   * Check if account is locked
   */
  private isAccountLocked(): boolean {
    return Date.now() < this.lockoutUntil
  }

  /**
   * Start session monitoring
   */
  private startSessionMonitoring(): void {
    if (this.sessionCheckInterval) return

    this.sessionCheckInterval = setInterval(() => {
      this.checkSession()
    }, AUTH_CONFIG.SESSION_CHECK_INTERVAL)
  }

  /**
   * Stop session monitoring
   */
  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
      this.sessionCheckInterval = null
    }
  }

  /**
   * Check session validity and handle refresh
   */
  private async checkSession(): Promise<void> {
    const tokenInfo = tokenService.getTokenInfo()
    
    // Check if session is idle
    if (this.isSessionIdle()) {
      console.warn('Session expired due to inactivity')
      await this.logout()
      return
    }

    // Check if token needs refresh
    if (tokenInfo.needsRefresh && tokenInfo.isValid) {
      try {
        await this.refreshToken()
        console.log('Token refreshed automatically')
      } catch (error) {
        console.error('Automatic token refresh failed:', error)
        await this.logout()
      }
    }
  }

  /**
   * Setup activity listeners
   */
  private setupActivityListeners(): void {
    if (typeof window === 'undefined') return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const activityHandler = () => {
      this.updateLastActivity()
    }

    events.forEach(event => {
      document.addEventListener(event, activityHandler, { passive: true })
    })

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateLastActivity()
      }
    })
  }

  /**
   * Generate session ID for tracking
   */
  private generateSessionId(): string | null {
    const user = tokenService.getStoredUser()
    if (!user) return null
    
    return `${user.id}_${Date.now()}`
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopSessionMonitoring()
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export for testing
export { AuthService }
