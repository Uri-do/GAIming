/**
 * Error handling hook for functional components
 * Provides error reporting and recovery capabilities
 */

import { useState, useCallback, useEffect } from 'react'
import { useNotificationStore } from '@/app/store/notificationStore'
import type { AppError, EnhancedError, ErrorSeverity } from '../types/errors'
import { createApiError, isApiError, isNetworkError, isValidationError } from '../types/errors'

interface ErrorHandlerOptions {
  showNotification?: boolean
  logToConsole?: boolean
  reportToService?: boolean
  context?: string
}

interface ErrorHandlerResult {
  error: EnhancedError | null
  hasError: boolean
  clearError: () => void
  reportError: (error: Error | AppError | string, options?: ErrorHandlerOptions) => void
  handleAsyncError: <T>(
    asyncFn: () => Promise<T>,
    options?: ErrorHandlerOptions
  ) => Promise<T | null>
}

export const useErrorHandler = (
  defaultOptions: ErrorHandlerOptions = {}
): ErrorHandlerResult => {
  const [error, setError] = useState<EnhancedError | null>(null)
  const showError = useNotificationStore(state => state.showError)
  const showWarning = useNotificationStore(state => state.showWarning)

  // Default options
  const options = {
    showNotification: true,
    logToConsole: true,
    reportToService: false,
    ...defaultOptions,
  }

  // Clear error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Convert various error types to enhanced error
  const enhanceError = useCallback((
    inputError: Error | AppError | string,
    context?: string
  ): EnhancedError => {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const timestamp = Date.now()

    // Handle string errors
    if (typeof inputError === 'string') {
      return {
        id,
        code: 'GENERIC_ERROR',
        message: inputError,
        timestamp,
        context: context ? { context } : undefined,
        severity: 'medium' as ErrorSeverity,
        category: 'client' as const,
        recoverable: true,
        userMessage: inputError,
        technicalDetails: createApiError.network(inputError),
      }
    }

    // Handle Error objects
    if (inputError instanceof Error) {
      let severity: ErrorSeverity = 'medium'
      let category: AppError['type'] = 'client'
      let userMessage = 'An unexpected error occurred'

      // Analyze error type
      if (inputError.name === 'NetworkError' || inputError.message.includes('fetch')) {
        category = 'network'
        severity = 'low'
        userMessage = 'Network connection issue. Please try again.'
      } else if (inputError.name === 'ValidationError') {
        category = 'validation'
        severity = 'medium'
        userMessage = 'Please check your input and try again.'
      } else if (inputError.name === 'TypeError') {
        category = 'client'
        severity = 'high'
        userMessage = 'Application error. Please refresh the page.'
      }

      return {
        id,
        code: `${category.toUpperCase()}_ERROR`,
        message: inputError.message,
        timestamp,
        context: context ? { context } : undefined,
        severity,
        category,
        recoverable: true, // All errors are recoverable in this simplified version
        userMessage,
        technicalDetails: createApiError.network(inputError.message),
        stackTrace: inputError.stack,
      }
    }

    // Handle AppError objects
    if (isApiError(inputError)) {
      let severity: ErrorSeverity = 'medium'
      let userMessage = 'An error occurred'

      if (isNetworkError(inputError)) {
        severity = 'low'
        userMessage = 'Network connection issue. Please try again.'
      } else if (isValidationError(inputError)) {
        severity = 'medium'
        userMessage = 'Please check your input and try again.'
      } else if (inputError.status >= 500) {
        severity = 'high'
        userMessage = 'Server error. Please try again later.'
      }

      return {
        id,
        code: inputError.code,
        message: inputError.message,
        timestamp,
        context: context ? { context } : undefined,
        severity,
        category: inputError.type,
        recoverable: inputError.status !== 500,
        userMessage,
        technicalDetails: inputError,
      }
    }

    // Fallback for unknown error types
    return {
      id,
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      timestamp,
      context: context ? { context } : undefined,
      severity: 'medium' as ErrorSeverity,
      category: 'client' as const,
      recoverable: true,
      userMessage: 'An unexpected error occurred',
      technicalDetails: createApiError.network('Unknown error'),
    }
  }, [])

  // Report error with various options
  const reportError = useCallback((
    inputError: Error | AppError | string,
    reportOptions: ErrorHandlerOptions = {}
  ) => {
    const finalOptions = { ...options, ...reportOptions }
    const enhancedError = enhanceError(inputError, finalOptions.context)

    // Set error state
    setError(enhancedError)

    // Show notification if enabled
    if (finalOptions.showNotification) {
      if (enhancedError.severity === 'critical' || enhancedError.severity === 'high') {
        showError('Error', enhancedError.userMessage)
      } else {
        showWarning('Warning', enhancedError.userMessage)
      }
    }

    // Log to console if enabled
    if (finalOptions.logToConsole) {
      console.error('Error reported:', enhancedError)
    }

    // Report to monitoring service if enabled
    if (finalOptions.reportToService) {
      // Example: Send to Sentry, LogRocket, etc.
      console.warn('Error would be reported to monitoring service:', enhancedError)
    }
  }, [options, enhanceError, showError, showWarning])

  // Handle async operations with error catching
  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    asyncOptions: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      const result = await asyncFn()
      // Clear any previous errors on success
      clearError()
      return result
    } catch (error) {
      reportError(error as Error, asyncOptions)
      return null
    }
  }, [reportError, clearError])

  // Auto-clear errors after a timeout
  useEffect(() => {
    if (error && error.severity === 'low') {
      const timeout = setTimeout(() => {
        clearError()
      }, 5000) // Clear low-severity errors after 5 seconds

      return () => clearTimeout(timeout)
    }

    return undefined
  }, [error, clearError])

  return {
    error,
    hasError: error !== null,
    clearError,
    reportError,
    handleAsyncError,
  }
}

// Specialized hooks for common scenarios
export const useApiErrorHandler = (context?: string) => {
  return useErrorHandler({
    showNotification: true,
    logToConsole: true,
    reportToService: true,
    context: context || 'api',
  })
}

export const useFormErrorHandler = (context?: string) => {
  return useErrorHandler({
    showNotification: false, // Forms usually handle their own error display
    logToConsole: true,
    reportToService: false,
    context: context || 'form',
  })
}

export const useComponentErrorHandler = (componentName: string) => {
  return useErrorHandler({
    showNotification: true,
    logToConsole: true,
    reportToService: true,
    context: `component:${componentName}`,
  })
}

// Global error handler for unhandled errors
export const useGlobalErrorHandler = () => {
  const { reportError } = useErrorHandler({
    showNotification: true,
    logToConsole: true,
    reportToService: true,
    context: 'global',
  })

  useEffect(() => {
    // Handle unhandled JavaScript errors
    const handleError = (event: ErrorEvent) => {
      reportError(event.error || event.message, {
        context: 'global:javascript',
      })
    }

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(event.reason, {
        context: 'global:promise',
      })
      event.preventDefault() // Prevent default browser behavior
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [reportError])
}

export default useErrorHandler
