/**
 * JWT Token Management Service
 * Handles secure token storage, validation, and automatic renewal
 */

import { jwtDecode } from 'jwt-decode'
import type { User } from '@/app/store/authStore'

// JWT Token interfaces
export interface JWTPayload {
  sub: string // User ID
  email: string
  name: string
  role: string
  permissions: string[]
  iat: number // Issued at
  exp: number // Expires at
  jti: string // JWT ID
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

export interface RefreshResponse {
  accessToken: string
  expiresIn: number
}

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'gaiming_access_token',
  REFRESH_TOKEN: 'gaiming_refresh_token',
  TOKEN_EXPIRY: 'gaiming_token_expiry',
  USER_DATA: 'gaiming_user_data',
} as const

// Security configuration
const SECURITY_CONFIG = {
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh 5 minutes before expiry
  MAX_REFRESH_ATTEMPTS: 3,
  STORAGE_ENCRYPTION: true, // Enable in production
  SECURE_STORAGE: true, // Use secure storage when available
} as const

class TokenService {
  private refreshPromise: Promise<string> | null = null
  private refreshAttempts = 0

  /**
   * Store token pair securely
   */
  storeTokens(tokenPair: TokenPair): void {
    try {
      const { accessToken, refreshToken, expiresIn } = tokenPair
      const expiryTime = Date.now() + (expiresIn * 1000)

      // Decode and validate access token
      const payload = this.decodeToken(accessToken)
      if (!payload) {
        throw new Error('Invalid access token')
      }

      // Store tokens securely
      this.setSecureItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken)
      this.setSecureItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken)
      this.setSecureItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString())
      
      // Store user data for quick access
      const userData: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        permissions: payload.permissions,
      }
      this.setSecureItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData))

      // Reset refresh attempts on successful storage
      this.refreshAttempts = 0

      console.log('Tokens stored successfully', {
        expiresAt: new Date(expiryTime).toISOString(),
        user: userData.email,
      })
    } catch (error) {
      console.error('Failed to store tokens:', error)
      throw new Error('Token storage failed')
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    try {
      const token = this.getSecureItem(TOKEN_KEYS.ACCESS_TOKEN)
      if (!token) return null

      // Validate token is not expired
      if (this.isTokenExpired(token)) {
        console.warn('Access token is expired')
        this.clearTokens()
        return null
      }

      return token
    } catch (error) {
      console.error('Failed to get access token:', error)
      return null
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.getSecureItem(TOKEN_KEYS.REFRESH_TOKEN)
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    try {
      const userData = this.getSecureItem(TOKEN_KEYS.USER_DATA)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Failed to get stored user:', error)
      return null
    }
  }

  /**
   * Check if token needs refresh
   */
  needsRefresh(): boolean {
    const token = this.getSecureItem(TOKEN_KEYS.ACCESS_TOKEN)
    const expiryStr = this.getSecureItem(TOKEN_KEYS.TOKEN_EXPIRY)
    
    if (!token || !expiryStr) return false

    const expiry = parseInt(expiryStr, 10)
    const now = Date.now()
    const timeUntilExpiry = expiry - now

    return timeUntilExpiry <= SECURITY_CONFIG.TOKEN_REFRESH_THRESHOLD
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    // Check refresh attempt limit
    if (this.refreshAttempts >= SECURITY_CONFIG.MAX_REFRESH_ATTEMPTS) {
      throw new Error('Maximum refresh attempts exceeded')
    }

    this.refreshPromise = this.performTokenRefresh()
    
    try {
      const newToken = await this.refreshPromise
      this.refreshAttempts = 0
      return newToken
    } catch (error) {
      this.refreshAttempts++
      throw error
    } finally {
      this.refreshPromise = null
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`)
      }

      const data: RefreshResponse = await response.json()
      
      // Update stored access token
      const expiryTime = Date.now() + (data.expiresIn * 1000)
      this.setSecureItem(TOKEN_KEYS.ACCESS_TOKEN, data.accessToken)
      this.setSecureItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString())

      console.log('Token refreshed successfully')
      return data.accessToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearTokens()
      throw error
    }
  }

  /**
   * Clear all stored tokens
   */
  clearTokens(): void {
    Object.values(TOKEN_KEYS).forEach(key => {
      this.removeSecureItem(key)
    })
    this.refreshAttempts = 0
    console.log('All tokens cleared')
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): JWTPayload | null {
    try {
      return jwtDecode<JWTPayload>(token)
    } catch (error) {
      console.error('Failed to decode token:', error)
      return null
    }
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token)
    if (!payload) return true

    const now = Math.floor(Date.now() / 1000)
    return payload.exp <= now
  }

  /**
   * Secure storage methods
   */
  private setSecureItem(key: string, value: string): void {
    if (SECURITY_CONFIG.SECURE_STORAGE && this.isSecureStorageAvailable()) {
      // Use secure storage when available (e.g., encrypted storage)
      localStorage.setItem(key, this.encryptValue(value))
    } else {
      localStorage.setItem(key, value)
    }
  }

  private getSecureItem(key: string): string | null {
    const value = localStorage.getItem(key)
    if (!value) return null

    if (SECURITY_CONFIG.SECURE_STORAGE && this.isSecureStorageAvailable()) {
      return this.decryptValue(value)
    }
    return value
  }

  private removeSecureItem(key: string): void {
    localStorage.removeItem(key)
  }

  private isSecureStorageAvailable(): boolean {
    // Check if secure storage is available (implementation depends on environment)
    return typeof window !== 'undefined' && 'crypto' in window
  }

  private encryptValue(value: string): string {
    // Simple encryption for demo - use proper encryption in production
    if (!SECURITY_CONFIG.STORAGE_ENCRYPTION) return value
    return btoa(value) // Base64 encoding as placeholder
  }

  private decryptValue(value: string): string {
    // Simple decryption for demo - use proper decryption in production
    if (!SECURITY_CONFIG.STORAGE_ENCRYPTION) return value
    try {
      return atob(value) // Base64 decoding as placeholder
    } catch {
      return value
    }
  }

  /**
   * Get token expiry information
   */
  getTokenInfo(): { isValid: boolean; expiresAt: Date | null; needsRefresh: boolean } {
    const token = this.getSecureItem(TOKEN_KEYS.ACCESS_TOKEN)
    const expiryStr = this.getSecureItem(TOKEN_KEYS.TOKEN_EXPIRY)

    if (!token || !expiryStr) {
      return { isValid: false, expiresAt: null, needsRefresh: false }
    }

    const expiresAt = new Date(parseInt(expiryStr, 10))
    const isValid = !this.isTokenExpired(token)
    const needsRefresh = this.needsRefresh()

    return { isValid, expiresAt, needsRefresh }
  }
}

// Export singleton instance
export const tokenService = new TokenService()

// Export for testing
export { TokenService }
