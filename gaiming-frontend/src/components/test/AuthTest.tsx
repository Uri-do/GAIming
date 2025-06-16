import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'

export function AuthTest() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('Admin123!')
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { login, logout, user, isAuthenticated, error } = useAuthStore()

  const handleTestLogin = async () => {
    setIsLoading(true)
    setTestResult(null)
    
    try {
      await login(username, password)
      setTestResult('✅ Login successful!')
    } catch (err) {
      setTestResult(`❌ Login failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestLogout = () => {
    logout()
    setTestResult('✅ Logout successful!')
  }

  const testApiConnection = async () => {
    setIsLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('http://localhost:65073/api/health')
      if (response.ok) {
        setTestResult('✅ API connection successful!')
      } else {
        setTestResult(`❌ API connection failed: ${response.status} ${response.statusText}`)
      }
    } catch (err) {
      setTestResult(`❌ API connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Authentication Test</h2>
        
        {/* API Connection Test */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">API Connection Test</h3>
          <Button 
            onClick={testApiConnection}
            loading={isLoading}
            variant="outline"
          >
            Test API Connection
          </Button>
        </div>

        {/* Authentication Status */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Current Status</h3>
          <div className="space-y-2">
            <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            {user && (
              <div>
                <p><strong>User:</strong> {user.name} ({user.email})</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Permissions:</strong> {user.permissions.join(', ') || 'None'}</p>
              </div>
            )}
            {error && (
              <Alert variant="error" title="Authentication Error">
                {error}
              </Alert>
            )}
          </div>
        </div>

        {/* Login Form */}
        {!isAuthenticated && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Login Test</h3>
            <div className="space-y-4">
              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <Button 
                onClick={handleTestLogin}
                loading={isLoading}
                disabled={!username || !password}
              >
                Test Login
              </Button>
            </div>
          </div>
        )}

        {/* Logout */}
        {isAuthenticated && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Logout Test</h3>
            <Button 
              onClick={handleTestLogout}
              variant="outline"
            >
              Test Logout
            </Button>
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Test Result</h3>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
              <pre className="text-sm">{testResult}</pre>
            </div>
          </div>
        )}

        {/* Default Credentials */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Default Test Credentials</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Username:</strong> admin<br />
            <strong>Password:</strong> Admin123!
          </p>
        </div>
      </Card>
    </div>
  )
}

export default AuthTest
