/**
 * Route-level Error Boundary
 * Provides page-level error handling with navigation recovery
 */

import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import type { EnhancedError, RecoveryStrategy } from '../types/errors'

interface RouteErrorBoundaryProps {
  children: React.ReactNode
  routeName: string
  onError?: (error: EnhancedError) => void
}

export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({
  children,
  routeName,
  onError,
}) => {
  // Route-specific recovery strategies
  const recoveryStrategies: RecoveryStrategy[] = [
    { type: 'retry', maxAttempts: 2, backoffMs: 1500 },
    { type: 'redirect', url: '/' }, // Fallback to home page
  ]

  const handleError = (error: EnhancedError) => {
    // Add route context to error
    const enhancedError = {
      ...error,
      context: {
        ...error.context,
        route: routeName,
        url: window.location.href,
      },
    }

    onError?.(enhancedError)

    // Log route-specific error
    console.error(`Route Error [${routeName}]:`, enhancedError)
  }

  const renderFallback = (error: EnhancedError, retry: () => void) => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-6">📄</div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Page Error
          </h1>
          
          <p className="text-gray-600 mb-6">
            Something went wrong while loading this page. This might be a temporary issue.
          </p>

          <div className="space-y-3">
            <button
              onClick={retry}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Home
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-40">
                <div><strong>Route:</strong> {routeName}</div>
                <div><strong>Error:</strong> {error.message}</div>
                <div><strong>ID:</strong> {error.id}</div>
                {error.stackTrace && (
                  <div className="mt-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{error.stackTrace}</pre>
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
      context={routeName}
      fallback={renderFallback}
      onError={handleError}
      recoveryStrategies={recoveryStrategies}
    >
      {children}
    </ErrorBoundary>
  )
}

export default RouteErrorBoundary
