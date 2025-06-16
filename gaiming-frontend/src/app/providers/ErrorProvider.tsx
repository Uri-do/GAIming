/**
 * Global Error Provider
 * Sets up application-wide error handling and monitoring
 */

import React from 'react'
import { ErrorBoundary, useGlobalErrorHandler } from '@/shared/components'
import { useNotificationStore } from '../store/notificationStore'
import type { EnhancedError } from '@/shared/types/errors'

interface ErrorProviderProps {
  children: React.ReactNode
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const showError = useNotificationStore(state => state.showError)
  
  // Set up global error handling
  useGlobalErrorHandler()

  // Handle application-level errors
  const handleAppError = (error: EnhancedError) => {
    // Log to monitoring service
    console.error('Application Error:', error)
    
    // Show user notification for critical errors
    if (error.severity === 'critical') {
      showError(
        'Critical Error',
        'A critical error occurred. Please refresh the page or contact support.'
      )
    }

    // Send to error monitoring service
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error)
      console.warn('Error would be sent to monitoring service:', {
        errorId: error.id,
        message: error.message,
        severity: error.severity,
        category: error.category,
        userId: error.userId,
        sessionId: error.sessionId,
      })
    }
  }

  // Application-level fallback
  const renderAppFallback = (error: EnhancedError, retry: () => void) => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-6xl mb-6">💥</div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Error
          </h1>
          
          <p className="text-gray-600 mb-6">
            Something went wrong with the application. This is usually a temporary issue.
          </p>

          <div className="space-y-4">
            <button
              onClick={retry}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Restart Application
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Refresh Page
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            Error ID: {error.id}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Technical Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-60">
                <div><strong>Message:</strong> {error.message}</div>
                <div><strong>Category:</strong> {error.category}</div>
                <div><strong>Severity:</strong> {error.severity}</div>
                <div><strong>Recoverable:</strong> {error.recoverable ? 'Yes' : 'No'}</div>
                {error.context && (
                  <div><strong>Context:</strong> {JSON.stringify(error.context, null, 2)}</div>
                )}
                {error.stackTrace && (
                  <div className="mt-2">
                    <strong>Stack Trace:</strong>
                    <pre className="whitespace-pre-wrap mt-1">{error.stackTrace}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary
      level="page"
      context="application"
      fallback={renderAppFallback}
      onError={handleAppError}
      recoveryStrategies={[
        { type: 'retry', maxAttempts: 2, backoffMs: 2000 },
        { type: 'refresh' },
      ]}
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorProvider
