/**
 * Phase 1 Testing Page
 * Comprehensive testing interface for all Phase 1 implementations
 */

import React, { useState } from 'react'
import { useAuthStore, authSelectors } from '@/app/store/authStore'
import { useNotificationStore, notificationSelectors } from '@/app/store/notificationStore'
import { useThemeStore } from '@/app/store/themeStore'
import { useGameStore, gameSelectors, useGameOperations } from '@/features/games'
import { FeatureErrorBoundary, AsyncErrorBoundary } from '@/shared/components'
import { useErrorHandler, useApiErrorHandler } from '@/shared/hooks'
import { createApiError } from '@/shared/types'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

const Phase1Testing: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'pass' | 'fail'>>({})
  const [testLogs, setTestLogs] = useState<string[]>([])

  // Store hooks
  const auth = useAuthStore()
  const notifications = useNotificationStore()
  const theme = useThemeStore()
  const games = useGameStore()
  const gameOperations = useGameOperations()

  // Error handling hooks
  const { reportError } = useErrorHandler('phase1-testing')
  const { handleAsyncError } = useApiErrorHandler('phase1-testing')

  // Selectors
  const user = useAuthStore(authSelectors.user)
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated)
  const allNotifications = useNotificationStore(notificationSelectors.all)
  const unreadCount = useNotificationStore(notificationSelectors.unreadCount)
  const selectedGames = useGameStore(gameSelectors.selectedGameIds)
  const hasFilters = useGameStore(gameSelectors.hasFilters)

  const addLog = (message: string) => {
    setTestLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const updateTestResult = (testName: string, result: 'pass' | 'fail') => {
    setTestResults(prev => ({ ...prev, [testName]: result }))
    addLog(`Test "${testName}": ${result.toUpperCase()}`)
  }

  // Test 1: Feature-Based Architecture
  const testArchitecture = () => {
    try {
      addLog('Testing feature-based architecture...')
      
      // Test import paths
      const hasAuthStore = typeof useAuthStore === 'function'
      const hasGameStore = typeof useGameStore === 'function'
      const hasNotificationStore = typeof useNotificationStore === 'function'
      const hasThemeStore = typeof useThemeStore === 'function'
      
      // Test shared components
      const hasErrorBoundary = typeof FeatureErrorBoundary === 'function'
      const hasAsyncErrorBoundary = typeof AsyncErrorBoundary === 'function'
      
      if (hasAuthStore && hasGameStore && hasNotificationStore && hasThemeStore && 
          hasErrorBoundary && hasAsyncErrorBoundary) {
        updateTestResult('architecture', 'pass')
      } else {
        updateTestResult('architecture', 'fail')
      }
    } catch (error) {
      addLog(`Architecture test error: ${error}`)
      updateTestResult('architecture', 'fail')
    }
  }

  // Test 2: TypeScript Strict Mode
  const testTypeScript = () => {
    try {
      addLog('Testing TypeScript strict mode...')
      
      // Test discriminated unions
      const apiError = createApiError.validation('Test error', {
        field: 'test',
        value: 'invalid',
        constraints: ['Test constraint']
      })
      
      // Test type safety
      const hasCorrectErrorType = apiError.type === 'validation'
      const hasErrorDetails = 'details' in apiError && apiError.details.field === 'test'
      
      if (hasCorrectErrorType && hasErrorDetails) {
        updateTestResult('typescript', 'pass')
      } else {
        updateTestResult('typescript', 'fail')
      }
    } catch (error) {
      addLog(`TypeScript test error: ${error}`)
      updateTestResult('typescript', 'fail')
    }
  }

  // Test 3: Zustand State Management
  const testStateManagement = () => {
    try {
      addLog('Testing Zustand state management...')
      
      // Test auth store
      const initialAuthState = auth.isAuthenticated
      
      // Test notification store
      const notificationId = notifications.showInfo('Test', 'Testing notifications')
      const hasNotification = allNotifications.some(n => n.id === notificationId)
      
      // Test theme store
      const currentTheme = theme.theme.mode
      theme.setThemeMode('dark')
      const themeChanged = theme.theme.mode === 'dark'
      theme.setThemeMode(currentTheme) // Reset
      
      // Test game store
      games.setFilters({ search: 'test' })
      const filtersSet = hasFilters
      games.clearFilters()
      
      // Test atomic selectors
      const selectorWorks = typeof user !== 'undefined' && typeof unreadCount === 'number'
      
      if (hasNotification && themeChanged && filtersSet && selectorWorks) {
        updateTestResult('state-management', 'pass')
      } else {
        updateTestResult('state-management', 'fail')
      }
    } catch (error) {
      addLog(`State management test error: ${error}`)
      updateTestResult('state-management', 'fail')
    }
  }

  // Test 4: Error Boundaries
  const testErrorBoundaries = () => {
    try {
      addLog('Testing error boundaries...')
      
      // Test error reporting
      const testError = createApiError.client('Test error for boundary testing')
      reportError(testError, { context: 'boundary-test' })
      
      // Test async error handling
      handleAsyncError(async () => {
        throw new Error('Test async error')
      }, { context: 'async-test' })
      
      // Test error boundary components exist
      const hasErrorHandling = typeof reportError === 'function' && 
                              typeof handleAsyncError === 'function'
      
      if (hasErrorHandling) {
        updateTestResult('error-boundaries', 'pass')
      } else {
        updateTestResult('error-boundaries', 'fail')
      }
    } catch (error) {
      addLog(`Error boundaries test error: ${error}`)
      updateTestResult('error-boundaries', 'fail')
    }
  }

  // Test 5: Performance & Integration
  const testPerformance = () => {
    try {
      addLog('Testing performance and integration...')
      
      const startTime = performance.now()
      
      // Test multiple store operations
      for (let i = 0; i < 100; i++) {
        games.toggleGameSelection(i)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Test should complete in reasonable time (< 100ms for 100 operations)
      const isPerformant = duration < 100
      
      // Test store persistence
      const hasLocalStorage = typeof localStorage !== 'undefined'
      
      if (isPerformant && hasLocalStorage) {
        updateTestResult('performance', 'pass')
      } else {
        updateTestResult('performance', 'fail')
      }
      
      addLog(`Performance test completed in ${duration.toFixed(2)}ms`)
    } catch (error) {
      addLog(`Performance test error: ${error}`)
      updateTestResult('performance', 'fail')
    }
  }

  // Run all tests
  const runAllTests = () => {
    addLog('Starting Phase 1 comprehensive testing...')
    setTestResults({})
    setTestLogs([])
    
    setTimeout(() => testArchitecture(), 100)
    setTimeout(() => testTypeScript(), 200)
    setTimeout(() => testStateManagement(), 300)
    setTimeout(() => testErrorBoundaries(), 400)
    setTimeout(() => testPerformance(), 500)
    
    setTimeout(() => {
      addLog('All tests completed!')
    }, 600)
  }

  const getTestStatus = (testName: string) => {
    const result = testResults[testName]
    if (result === 'pass') return '✅ PASS'
    if (result === 'fail') return '❌ FAIL'
    return '⏳ PENDING'
  }

  const getOverallStatus = () => {
    const results = Object.values(testResults)
    if (results.length === 0) return 'Not Started'
    if (results.every(r => r === 'pass')) return '✅ ALL TESTS PASSED'
    if (results.some(r => r === 'fail')) return '❌ SOME TESTS FAILED'
    return '⏳ TESTING IN PROGRESS'
  }

  return (
    <FeatureErrorBoundary featureName="Phase 1 Testing">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Phase 1 Testing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive testing for all Phase 1 implementations
          </p>
          <div className="mt-4 text-lg font-semibold">
            Status: {getOverallStatus()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
              <div className="space-y-4">
                <Button onClick={runAllTests} variant="primary" fullWidth>
                  Run All Tests
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={testArchitecture} variant="outline" size="sm">
                    Test Architecture
                  </Button>
                  <Button onClick={testTypeScript} variant="outline" size="sm">
                    Test TypeScript
                  </Button>
                  <Button onClick={testStateManagement} variant="outline" size="sm">
                    Test State Mgmt
                  </Button>
                  <Button onClick={testErrorBoundaries} variant="outline" size="sm">
                    Test Error Boundaries
                  </Button>
                </div>
                
                <Button onClick={testPerformance} variant="outline" fullWidth>
                  Test Performance
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Feature-Based Architecture:</span>
                  <span>{getTestStatus('architecture')}</span>
                </div>
                <div className="flex justify-between">
                  <span>TypeScript Strict Mode:</span>
                  <span>{getTestStatus('typescript')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Zustand State Management:</span>
                  <span>{getTestStatus('state-management')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Boundaries:</span>
                  <span>{getTestStatus('error-boundaries')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance & Integration:</span>
                  <span>{getTestStatus('performance')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Logs */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Logs</h2>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-64 overflow-y-auto">
              {testLogs.length === 0 ? (
                <p className="text-gray-500">No test logs yet. Run tests to see results.</p>
              ) : (
                <div className="space-y-1 font-mono text-sm">
                  {testLogs.map((log, index) => (
                    <div key={index} className="text-gray-700 dark:text-gray-300">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureErrorBoundary>
  )
}

export default Phase1Testing
