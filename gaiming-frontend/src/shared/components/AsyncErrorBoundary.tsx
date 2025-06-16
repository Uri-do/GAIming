/**
 * Async Error Boundary
 * Handles errors from async operations and promises
 */

import React, { useState, useEffect, useCallback } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import type { AsyncState } from '../types'
import { asyncState } from '../utils'

interface AsyncErrorBoundaryProps {
  children: React.ReactNode
  asyncStates?: AsyncState<any>[]
  onAsyncError?: (error: string) => void
  fallback?: (error: string, retry: () => void) => React.ReactNode
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  asyncStates = [],
  onAsyncError,
  fallback,
}) => {
  const [asyncError, setAsyncError] = useState<string | null>(null)

  // Monitor async states for errors
  useEffect(() => {
    const errors = asyncStates
      .filter(state => asyncState.isError(state))
      .map(state => asyncState.getError(state))
      .filter(Boolean)

    if (errors.length > 0) {
      const combinedError = errors.join('; ')
      setAsyncError(combinedError)
      onAsyncError?.(combinedError)
    } else {
      setAsyncError(null)
    }
  }, [asyncStates, onAsyncError])

  // Global promise rejection handler
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      const errorMessage = event.reason instanceof Error 
        ? event.reason.message 
        : String(event.reason)
      
      setAsyncError(errorMessage)
      onAsyncError?.(errorMessage)
      
      // Prevent default browser behavior
      event.preventDefault()
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [onAsyncError])

  const handleRetry = useCallback(() => {
    setAsyncError(null)
  }, [])

  // Render async error if present
  if (asyncError) {
    if (fallback) {
      return fallback(asyncError, handleRetry)
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-start space-x-3">
          <span className="text-red-500 text-xl">⚠️</span>
          <div className="flex-1">
            <h3 className="font-medium text-red-800 mb-2">
              Async Operation Failed
            </h3>
            <p className="text-red-600 text-sm mb-3">
              {asyncError}
            </p>
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary level="component" context="async-operations">
      {children}
    </ErrorBoundary>
  )
}

export default AsyncErrorBoundary
