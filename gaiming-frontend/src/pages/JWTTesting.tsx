/**
 * JWT Authentication Testing Page
 * Comprehensive testing interface for JWT authentication system
 */

import React, { useState, useEffect } from 'react'
import { useAuth, useSession } from '@/shared/hooks/useAuth'
import { tokenService } from '@/shared/services/tokenService'
import { authService } from '@/shared/services/authService'
import { FeatureErrorBoundary } from '@/shared/components'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

const JWTTesting: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'pass' | 'fail'>>({})
  const [testLogs, setTestLogs] = useState<string[]>([])
  const [loginForm, setLoginForm] = useState({ username: 'testuser', password: 'testpass' })

  // Auth hooks
  const auth = useAuth()
  const session = useSession()

  const addLog = (message: string) => {
    setTestLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const updateTestResult = (testName: string, result: 'pass' | 'fail') => {
    setTestResults(prev => ({ ...prev, [testName]: result }))
    addLog(`Test "${testName}": ${result.toUpperCase()}`)
  }

  // Test 1: Token Service
  const testTokenService = () => {
    try {
      addLog('Testing token service...')
      
      // Test token info
      const tokenInfo = tokenService.getTokenInfo()
      const hasTokenMethods = typeof tokenService.getAccessToken === 'function' &&
                             typeof tokenService.getRefreshToken === 'function' &&
                             typeof tokenService.clearTokens === 'function'
      
      if (hasTokenMethods) {
        updateTestResult('token-service', 'pass')
      } else {
        updateTestResult('token-service', 'fail')
      }
    } catch (error) {
      addLog(`Token service test error: ${error}`)
      updateTestResult('token-service', 'fail')
    }
  }

  // Test 2: Auth Service
  const testAuthService = () => {
    try {
      addLog('Testing auth service...')
      
      const sessionInfo = authService.getSessionInfo()
      const hasAuthMethods = typeof authService.login === 'function' &&
                            typeof authService.logout === 'function' &&
                            typeof authService.hasPermission === 'function' &&
                            typeof authService.hasRole === 'function'
      
      const hasSessionInfo = typeof sessionInfo === 'object' &&
                            'isValid' in sessionInfo &&
                            'user' in sessionInfo
      
      if (hasAuthMethods && hasSessionInfo) {
        updateTestResult('auth-service', 'pass')
      } else {
        updateTestResult('auth-service', 'fail')
      }
    } catch (error) {
      addLog(`Auth service test error: ${error}`)
      updateTestResult('auth-service', 'fail')
    }
  }

  // Test 3: Auth Hook
  const testAuthHook = () => {
    try {
      addLog('Testing auth hook...')
      
      const hasAuthState = typeof auth.isAuthenticated === 'boolean' &&
                           typeof auth.isLoading === 'boolean' &&
                           typeof auth.login === 'function' &&
                           typeof auth.logout === 'function'
      
      const hasPermissionMethods = typeof auth.hasPermission === 'function' &&
                                  typeof auth.hasRole === 'function' &&
                                  typeof auth.hasAnyRole === 'function' &&
                                  typeof auth.hasAllPermissions === 'function'
      
      if (hasAuthState && hasPermissionMethods) {
        updateTestResult('auth-hook', 'pass')
      } else {
        updateTestResult('auth-hook', 'fail')
      }
    } catch (error) {
      addLog(`Auth hook test error: ${error}`)
      updateTestResult('auth-hook', 'fail')
    }
  }

  // Test 4: Session Management
  const testSessionManagement = () => {
    try {
      addLog('Testing session management...')
      
      const hasSessionState = typeof session.isSessionValid === 'boolean' &&
                             typeof session.isTokenValid === 'boolean' &&
                             typeof session.needsRefresh === 'boolean'
      
      const hasSessionMethods = typeof session.checkSession === 'function' &&
                               typeof session.updateActivity === 'function'
      
      if (hasSessionState && hasSessionMethods) {
        updateTestResult('session-management', 'pass')
      } else {
        updateTestResult('session-management', 'fail')
      }
    } catch (error) {
      addLog(`Session management test error: ${error}`)
      updateTestResult('session-management', 'fail')
    }
  }

  // Test 5: Permission System
  const testPermissionSystem = () => {
    try {
      addLog('Testing permission system...')
      
      // Test permission methods
      const canManageGames = auth.hasPermission('games:manage')
      const isAdmin = auth.hasRole('Admin')
      const hasAnyAdminRole = auth.hasAnyRole(['Admin', 'SuperAdmin'])
      const hasAllBasicPerms = auth.hasAllPermissions(['read', 'write'])
      
      const permissionTestsPassed = typeof canManageGames === 'boolean' &&
                                   typeof isAdmin === 'boolean' &&
                                   typeof hasAnyAdminRole === 'boolean' &&
                                   typeof hasAllBasicPerms === 'boolean'
      
      if (permissionTestsPassed) {
        updateTestResult('permission-system', 'pass')
      } else {
        updateTestResult('permission-system', 'fail')
      }
    } catch (error) {
      addLog(`Permission system test error: ${error}`)
      updateTestResult('permission-system', 'fail')
    }
  }

  // Test Login Flow
  const testLoginFlow = async () => {
    try {
      addLog('Testing login flow...')
      
      if (auth.isAuthenticated) {
        addLog('Already authenticated, testing logout first...')
        await auth.logout()
      }
      
      addLog('Attempting login...')
      await auth.login(loginForm.username, loginForm.password, true)
      
      if (auth.isAuthenticated && auth.user) {
        updateTestResult('login-flow', 'pass')
        addLog(`Login successful for user: ${auth.user.email}`)
      } else {
        updateTestResult('login-flow', 'fail')
      }
    } catch (error) {
      addLog(`Login flow test error: ${error}`)
      updateTestResult('login-flow', 'fail')
    }
  }

  // Test Logout Flow
  const testLogoutFlow = async () => {
    try {
      addLog('Testing logout flow...')
      
      if (!auth.isAuthenticated) {
        addLog('Not authenticated, testing login first...')
        await auth.login(loginForm.username, loginForm.password)
      }
      
      addLog('Attempting logout...')
      await auth.logout()
      
      if (!auth.isAuthenticated && !auth.user) {
        updateTestResult('logout-flow', 'pass')
        addLog('Logout successful')
      } else {
        updateTestResult('logout-flow', 'fail')
      }
    } catch (error) {
      addLog(`Logout flow test error: ${error}`)
      updateTestResult('logout-flow', 'fail')
    }
  }

  // Run all tests
  const runAllTests = async () => {
    addLog('Starting JWT authentication testing...')
    setTestResults({})
    setTestLogs([])
    
    // Run synchronous tests
    setTimeout(() => testTokenService(), 100)
    setTimeout(() => testAuthService(), 200)
    setTimeout(() => testAuthHook(), 300)
    setTimeout(() => testSessionManagement(), 400)
    setTimeout(() => testPermissionSystem(), 500)
    
    setTimeout(() => {
      addLog('Synchronous tests completed!')
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

  // Auto-update session info
  useEffect(() => {
    const interval = setInterval(() => {
      // This will trigger re-render with updated session info
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <FeatureErrorBoundary featureName="JWT Testing">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            JWT Authentication Testing
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive testing for JWT authentication system
          </p>
          <div className="mt-4 text-lg font-semibold">
            Status: {getOverallStatus()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Auth State */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Current Authentication State</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Authenticated:</span>
                  <span className={auth.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                    {auth.isAuthenticated ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Loading:</span>
                  <span>{auth.isLoading ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>User:</span>
                  <span>{auth.user?.email || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span>{auth.user?.role || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Session Valid:</span>
                  <span className={session.isSessionValid ? 'text-green-600' : 'text-red-600'}>
                    {session.isSessionValid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Token Valid:</span>
                  <span className={session.isTokenValid ? 'text-green-600' : 'text-red-600'}>
                    {session.isTokenValid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Needs Refresh:</span>
                  <span className={session.needsRefresh ? 'text-yellow-600' : 'text-green-600'}>
                    {session.needsRefresh ? 'Yes' : 'No'}
                  </span>
                </div>
                {session.tokenInfo.expiresAt && (
                  <div className="flex justify-between">
                    <span>Token Expires:</span>
                    <span className="text-xs">
                      {session.tokenInfo.expiresAt.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Controls */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
              <div className="space-y-4">
                <Button onClick={runAllTests} variant="primary" fullWidth>
                  Run All Tests
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={testTokenService} variant="outline" size="sm">
                    Token Service
                  </Button>
                  <Button onClick={testAuthService} variant="outline" size="sm">
                    Auth Service
                  </Button>
                  <Button onClick={testAuthHook} variant="outline" size="sm">
                    Auth Hook
                  </Button>
                  <Button onClick={testSessionManagement} variant="outline" size="sm">
                    Session Mgmt
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                      className="px-3 py-2 border rounded text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className="px-3 py-2 border rounded text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={testLoginFlow} variant="outline" size="sm">
                      Test Login
                    </Button>
                    <Button onClick={testLogoutFlow} variant="outline" size="sm">
                      Test Logout
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Token Service:</span>
                  <span>{getTestStatus('token-service')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auth Service:</span>
                  <span>{getTestStatus('auth-service')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auth Hook:</span>
                  <span>{getTestStatus('auth-hook')}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Session Management:</span>
                  <span>{getTestStatus('session-management')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Permission System:</span>
                  <span>{getTestStatus('permission-system')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Login Flow:</span>
                  <span>{getTestStatus('login-flow')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Logout Flow:</span>
                  <span>{getTestStatus('logout-flow')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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

export default JWTTesting
