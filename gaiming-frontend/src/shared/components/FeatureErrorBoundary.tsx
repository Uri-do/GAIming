/**
 * Feature-specific Error Boundary
 * Provides specialized error handling for feature modules
 */

import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import type { EnhancedError, RecoveryStrategy } from '../types/errors'

interface FeatureErrorBoundaryProps {
  children: React.ReactNode
  featureName: string
  fallbackComponent?: React.ComponentType<{ error: EnhancedError; retry: () => void }>
  onError?: (error: EnhancedError) => void
  enableRetry?: boolean
  maxRetries?: number
}

export const FeatureErrorBoundary: React.FC<FeatureErrorBoundaryProps> = ({
  children,
  featureName,
  fallbackComponent: FallbackComponent,
  onError,
  enableRetry = true,
  maxRetries = 3,
}) => {
  // Feature-specific recovery strategies
  const recoveryStrategies: RecoveryStrategy[] = [
    ...(enableRetry ? [{ type: 'retry' as const, maxAttempts: maxRetries, backoffMs: 1000 }] : []),
    { type: 'fallback' as const, fallbackData: null },
  ]

  const handleError = (error: EnhancedError) => {
    // Add feature context to error
    const enhancedError = {
      ...error,
      context: {
        ...error.context,
        feature: featureName,
      },
    }

    onError?.(enhancedError)

    // Log feature-specific error
    console.error(`Feature Error [${featureName}]:`, enhancedError)
  }

  const renderFallback = (error: EnhancedError, retry: () => void) => {
    if (FallbackComponent) {
      return <FallbackComponent error={error} retry={retry} />
    }

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 m-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🧩</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {featureName} Feature Unavailable
          </h3>
          <p className="text-gray-600 mb-4">
            This feature is temporarily unavailable. Please try again.
          </p>
          <div className="space-x-3">
            <button
              onClick={retry}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary
      level="feature"
      context={featureName}
      fallback={renderFallback}
      onError={handleError}
      recoveryStrategies={recoveryStrategies}
    >
      {children}
    </ErrorBoundary>
  )
}

export default FeatureErrorBoundary
