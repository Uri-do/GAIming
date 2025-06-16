/**
 * Enhanced API Service
 * Centralized HTTP client with JWT token management, automatic refresh, and security features
 */

import { API_CONFIG } from '@/app/config'
import { createApiError } from '@/shared/types'
import { tokenService } from './tokenService'

interface RequestConfig {
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  cache?: boolean
  requiresAuth?: boolean
  skipTokenRefresh?: boolean
}

interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

// Security configuration
const SECURITY_CONFIG = {
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  CSRF_HEADER: 'X-CSRF-Token',
  REQUEST_ID_HEADER: 'X-Request-ID',
} as const

class ApiService {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>> = []
  private responseInterceptors: Array<(response: ApiResponse) => ApiResponse> = []
  private csrfToken: string | null = null
  private refreshPromise: Promise<void> | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    }
    
    this.setupDefaultInterceptors()
  }

  /**
   * Setup default request/response interceptors
   */
  private setupDefaultInterceptors(): void {
    // Request interceptor for authentication
    this.addRequestInterceptor(async (config) => {
      // Add request ID for tracking
      const requestId = this.generateRequestId()
      config.headers = {
        ...config.headers,
        [SECURITY_CONFIG.REQUEST_ID_HEADER]: requestId,
      }

      // Add CSRF token if available
      if (this.csrfToken) {
        config.headers[SECURITY_CONFIG.CSRF_HEADER] = this.csrfToken
      }

      // Add authentication token if required
      if (config.requiresAuth !== false) {
        await this.ensureValidToken(config.skipTokenRefresh)
        const token = tokenService.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }

      return config
    })

    // Response interceptor for error handling
    this.addResponseInterceptor((response) => {
      // Extract CSRF token from response headers
      const csrfToken = response.headers['x-csrf-token']
      if (csrfToken) {
        this.csrfToken = csrfToken
      }

      return response
    })
  }

  /**
   * Ensure we have a valid token, refresh if necessary
   */
  private async ensureValidToken(skipRefresh = false): Promise<void> {
    if (skipRefresh) return

    const tokenInfo = tokenService.getTokenInfo()
    
    if (!tokenInfo.isValid) {
      return // No valid token, let request proceed (might be login)
    }

    if (tokenInfo.needsRefresh) {
      // Prevent multiple simultaneous refresh attempts
      if (!this.refreshPromise) {
        this.refreshPromise = this.performTokenRefresh()
      }
      await this.refreshPromise
    }
  }

  /**
   * Perform token refresh
   */
  private async performTokenRefresh(): Promise<void> {
    try {
      await tokenService.refreshAccessToken()
      console.log('Token refreshed in API service')
    } catch (error) {
      console.error('Token refresh failed in API service:', error)
      throw error
    } finally {
      this.refreshPromise = null
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: (response: ApiResponse) => ApiResponse): void {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * Execute request with retries and error handling
   */
  private async executeRequest<T>(
    method: string,
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    const timeout = config.timeout || SECURITY_CONFIG.REQUEST_TIMEOUT
    const maxRetries = config.retries || SECURITY_CONFIG.MAX_RETRIES

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Apply request interceptors
        let requestConfig = { ...config }
        for (const interceptor of this.requestInterceptors) {
          requestConfig = await interceptor(requestConfig)
        }

        // Prepare headers
        const headers = {
          ...this.defaultHeaders,
          ...requestConfig.headers,
        }

        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        // Make request
        const response = await fetch(fullUrl, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Create response object
        let apiResponse: ApiResponse<T> = {
          data: null as T,
          status: response.status,
          statusText: response.statusText,
          headers: this.extractHeaders(response.headers),
        }

        // Parse response body
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          apiResponse.data = await response.json()
        } else {
          apiResponse.data = (await response.text()) as T
        }

        // Apply response interceptors
        for (const interceptor of this.responseInterceptors) {
          apiResponse = interceptor(apiResponse)
        }

        // Handle HTTP errors
        if (!response.ok) {
          throw this.createHttpError(apiResponse)
        }

        return apiResponse.data
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error as Error) || attempt === maxRetries) {
          break
        }

        // Wait before retry
        await this.delay(SECURITY_CONFIG.RETRY_DELAY * (attempt + 1))
      }
    }

    throw lastError || new Error('Request failed')
  }

  /**
   * Check if error should not be retried
   */
  private shouldNotRetry(error: Error): boolean {
    // Don't retry authentication errors, client errors, etc.
    if (error.message.includes('401') || error.message.includes('403')) {
      return true
    }
    if (error.message.includes('400') || error.message.includes('422')) {
      return true
    }
    return false
  }

  /**
   * Create HTTP error from response
   */
  private createHttpError(response: ApiResponse): Error {
    const { status, data } = response

    switch (status) {
      case 400:
        return createApiError.validation('Bad Request', data)
      case 401:
        return createApiError.authentication('Unauthorized')
      case 403:
        return createApiError.authorization('Forbidden')
      case 404:
        return createApiError.notFound('Resource not found')
      case 429:
        return createApiError.rateLimit('Too many requests')
      case 500:
        return createApiError.server('Internal server error')
      default:
        return createApiError.network(`HTTP ${status}: ${response.statusText}`)
    }
  }

  /**
   * Extract headers from Response object
   */
  private extractHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {}
    headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // HTTP method implementations
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.executeRequest<T>('GET', url, undefined, config)
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.executeRequest<T>('POST', url, data, config)
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.executeRequest<T>('PUT', url, data, config)
  }

  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.executeRequest<T>('PATCH', url, data, config)
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.executeRequest<T>('DELETE', url, undefined, config)
  }

  /**
   * Set CSRF token manually
   */
  setCsrfToken(token: string): void {
    this.csrfToken = token
  }

  /**
   * Get current CSRF token
   */
  getCsrfToken(): string | null {
    return this.csrfToken
  }
}

// Create and export singleton instance
export const apiService = new ApiService(API_CONFIG.BASE_URL)

// Export class for testing
export { ApiService }
