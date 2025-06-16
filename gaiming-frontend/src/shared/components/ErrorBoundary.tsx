/**
 * Comprehensive Error Boundary System
 * Provides graceful error handling with recovery strategies and user feedback
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import type { 
  AppError, 
  EnhancedError, 
  ErrorSeverity, 
  RecoveryStrategy,
  ErrorHandlingResult 
} from '../types/errors'
import { createApiError } from '../types/errors'

// Error boundary props
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: EnhancedError, retry: () => void) => ReactNode
  onError?: (error: EnhancedError, errorInfo: ErrorInfo) => void
  isolate?: boolean // Prevent error propagation to parent boundaries
  level?: 'page' | 'feature' | 'component'
  context?: string // Additional context for error reporting
  recoveryStrategies?: RecoveryStrategy[]
}

// Error boundary state using discriminated unions
type ErrorBoundaryState = 
  | { hasError: false }
  | { 
      hasError: true
      error: EnhancedError
      errorInfo: ErrorInfo
      retryCount: number
      isRecovering: boolean
    }

// Enhanced error boundary class
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null
  private maxRetries = 3
  // private retryDelay = 1000 // Unused for now

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Convert error to enhanced error format
    const enhancedError = ErrorBoundary.enhanceError(error)
    
    return {
      hasError: true,
      error: enhancedError,
      retryCount: 0,
      isRecovering: false,
    } as ErrorBoundaryState
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const enhancedError = ErrorBoundary.enhanceError(error, this.props.context)
    
    this.setState({
      hasError: true,
      error: enhancedError,
      errorInfo,
      retryCount: 0,
      isRecovering: false,
    })

    // Call error handler if provided
    this.props.onError?.(enhancedError, errorInfo)

    // Log error for monitoring
    this.logError(enhancedError, errorInfo)

    // Attempt automatic recovery if strategies are provided
    this.attemptRecovery(enhancedError)
  }

  // Convert regular error to enhanced error
  private static enhanceError(error: Error, context?: string): EnhancedError {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Determine error category and severity
    let category: AppError['type'] = 'network'
    let severity: ErrorSeverity = 'medium'
    let recoverable = true
    let userMessage = 'An unexpected error occurred'

    // Analyze error to determine category and severity
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      category = 'network'
      severity = 'low'
      userMessage = 'Failed to load application resources. Please refresh the page.'
    } else if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      category = 'network'
      severity = 'medium'
      userMessage = 'Network connection issue. Please check your internet connection.'
    } else if (error.name === 'TypeError' && error.message.includes('Cannot read prop')) {
      category = 'client'
      severity = 'high'
      userMessage = 'Application data is corrupted. Please refresh the page.'
    } else if (error.stack?.includes('React') || error.message.includes('React')) {
      category = 'client'
      severity = 'high'
      recoverable = false
      userMessage = 'Application component failed. Please refresh the page.'
    }

    // Create technical details
    const technicalDetails = createApiError.network(error.message)

    return {
      id,
      code: `${category.toUpperCase()}_ERROR`,
      message: error.message,
      timestamp: Date.now(),
      context: context ? { context } : undefined,
      severity,
      category,
      recoverable,
      userMessage,
      technicalDetails,
      stackTrace: error.stack,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
    }
  }

  // Get current user ID for error tracking
  private static getCurrentUserId(): string | undefined {
    try {
      // Try to get user ID from auth store or localStorage
      const authData = localStorage.getItem('auth-storage')
      if (authData) {
        const parsed = JSON.parse(authData)
        return parsed.state?.user?.id
      }
    } catch {
      // Ignore errors when getting user ID
    }
    return undefined
  }

  // Get session ID for error tracking
  private static getSessionId(): string | undefined {
    try {
      let sessionId = sessionStorage.getItem('sessionId')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('sessionId', sessionId)
      }
      return sessionId
    } catch {
      return undefined
    }
  }

  // Log error for monitoring and analytics
  private logError(error: EnhancedError, errorInfo?: ErrorInfo) {
    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary: ${error.category}`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Stack Trace:', error.stackTrace)
      console.groupEnd()
    }

    // Send to error monitoring service (e.g., Sentry)
    try {
      // Example: Sentry.captureException(error)
      // For now, we'll just log to console
      console.warn('Error would be sent to monitoring service:', {
        errorId: error.id,
        category: error.category,
        severity: error.severity,
        userId: error.userId,
        sessionId: error.sessionId,
      })
    } catch (loggingError) {
      console.error('Failed to log error to monitoring service:', loggingError)
    }
  }

  // Attempt automatic recovery based on error type
  private attemptRecovery(error: EnhancedError) {
    if (!error.recoverable) return

    const strategies = this.props.recoveryStrategies || this.getDefaultRecoveryStrategies(error)
    
    for (const strategy of strategies) {
      const result = this.executeRecoveryStrategy(strategy, error)
      if (result.handled) {
        break
      }
    }
  }

  // Get default recovery strategies based on error type
  private getDefaultRecoveryStrategies(error: EnhancedError): RecoveryStrategy[] {
    switch (error.category) {
      case 'network':
        return [
          { type: 'retry', maxAttempts: 3, backoffMs: 1000 },
          { type: 'fallback', fallbackData: null },
        ]
      case 'client':
        return [
          { type: 'refresh', component: this.props.context },
          { type: 'fallback', fallbackData: null },
        ]
      default:
        return [{ type: 'fallback', fallbackData: null }]
    }
  }

  // Execute recovery strategy
  private executeRecoveryStrategy(strategy: RecoveryStrategy, _error: EnhancedError): ErrorHandlingResult {
    try {
      switch (strategy.type) {
        case 'retry':
          if (this.state.hasError && this.state.retryCount < strategy.maxAttempts) {
            this.scheduleRetry(strategy.backoffMs)
            return { handled: true, strategy, userNotified: false }
          }
          break

        case 'refresh':
          if (strategy.component) {
            // Component-level refresh
            this.handleRetry()
          } else {
            // Page-level refresh
            window.location.reload()
          }
          return { handled: true, strategy, userNotified: true }

        case 'fallback':
          // Fallback is handled in render method
          return { handled: true, strategy, userNotified: true }

        case 'redirect':
          window.location.href = strategy.url
          return { handled: true, strategy, userNotified: true }

        case 'logout':
          // Clear auth and redirect to login
          localStorage.removeItem('auth-storage')
          window.location.href = '/login'
          return { handled: true, strategy, userNotified: true }

        default:
          return { handled: false, reason: 'Unknown strategy type' }
      }
    } catch (recoveryError) {
      console.error('Recovery strategy failed:', recoveryError)
      return { handled: false, reason: 'Recovery strategy execution failed' }
    }

    return { handled: false, reason: 'Strategy conditions not met' }
  }

  // Schedule retry with backoff
  private scheduleRetry(delay: number) {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }

    this.setState({ isRecovering: true } as ErrorBoundaryState)

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry()
    }, delay)
  }

  // Handle retry attempt
  private handleRetry = () => {
    if (this.state.hasError) {
      const newRetryCount = this.state.retryCount + 1
      
      if (newRetryCount <= this.maxRetries) {
        this.setState({
          hasError: false,
          retryCount: newRetryCount,
          isRecovering: false,
        } as ErrorBoundaryState)
      } else {
        this.setState({
          isRecovering: false,
        } as ErrorBoundaryState)
      }
    }
  }

  // Handle manual retry from UI
  private handleManualRetry = () => {
    this.setState({ hasError: false } as ErrorBoundaryState)
  }

  override componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  override render() {
    if (this.state.hasError) {
      const { error, isRecovering } = this.state

      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(error, this.handleManualRetry)
      }

      // Default error UI based on error level
      return (
        <ErrorFallback
          error={error}
          isRecovering={isRecovering}
          onRetry={this.handleManualRetry}
          level={this.props.level || 'component'}
        />
      )
    }

    return this.props.children
  }
}

// Default error fallback component
interface ErrorFallbackProps {
  error: EnhancedError
  isRecovering: boolean
  onRetry: () => void
  level: 'page' | 'feature' | 'component'
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  isRecovering, 
  onRetry, 
  level 
}) => {
  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'critical': return 'text-red-800 bg-red-100 border-red-300'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'page': return '📄'
      case 'feature': return '🧩'
      case 'component': return '⚙️'
      default: return '❌'
    }
  }

  return (
    <div className={`
      rounded-lg border-2 p-6 m-4 
      ${getSeverityColor(error.severity)}
    `}>
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{getLevelIcon(level)}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">
            {error.userMessage}
          </h3>
          
          <p className="text-sm opacity-75 mb-4">
            Error ID: {error.id}
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="mb-4">
              <summary className="cursor-pointer text-sm font-medium">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs bg-black bg-opacity-10 p-2 rounded overflow-auto">
                {error.message}
                {error.stackTrace && `\n\n${error.stackTrace}`}
              </pre>
            </details>
          )}

          <div className="flex items-center space-x-3">
            <button
              onClick={onRetry}
              disabled={isRecovering}
              className="px-4 py-2 bg-white border border-current rounded hover:bg-opacity-10 disabled:opacity-50"
            >
              {isRecovering ? 'Retrying...' : 'Try Again'}
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm text-current opacity-75 hover:opacity-100"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
