import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import Layout from '@/components/Layout/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('@/pages/Dashboard'))
const Games = React.lazy(() => import('@/pages/Games'))
const GameDetail = React.lazy(() => import('@/pages/GameDetail'))
const Players = React.lazy(() => import('@/pages/Players'))
const PlayerDetail = React.lazy(() => import('@/pages/PlayerDetail'))
const Recommendations = React.lazy(() => import('@/pages/Recommendations'))
const Analytics = React.lazy(() => import('@/pages/Analytics'))
const ABTesting = React.lazy(() => import('@/pages/ABTesting'))
const Models = React.lazy(() => import('@/pages/Models'))
const ModelDetail = React.lazy(() => import('@/pages/ModelDetail'))
const Settings = React.lazy(() => import('@/pages/Settings'))
// Admin routes
const UserManagement = React.lazy(() => import('@/pages/admin/UserManagement'))
const RoleManagement = React.lazy(() => import('@/pages/admin/RoleManagement'))
const PermissionManagement = React.lazy(() => import('@/pages/admin/PermissionManagement'))
const UserActivity = React.lazy(() => import('@/pages/admin/UserActivity'))
const UIShowcase = React.lazy(() => import('@/pages/UIShowcase'))
const Login = React.lazy(() => import('@/pages/Login'))
const NotFound = React.lazy(() => import('@/pages/NotFound'))

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
)

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Public route wrapper (redirects to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function App() {
  const { theme } = useThemeStore()

  // Apply theme class to document
  React.useEffect(() => {
    const getEffectiveTheme = (mode: string): 'light' | 'dark' => {
      if (mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return mode as 'light' | 'dark'
    }

    const effectiveTheme = getEffectiveTheme(theme.mode)
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(effectiveTheme)
  }, [theme.mode])

  return (
    <div className="App">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected routes with layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Games */}
            <Route path="games" element={<Games />} />
            <Route path="games/:gameId" element={<GameDetail />} />

            {/* Players */}
            <Route path="players" element={<Players />} />
            <Route path="players/:playerId" element={<PlayerDetail />} />

            {/* Recommendations */}
            <Route path="recommendations" element={<Recommendations />} />

            {/* Analytics */}
            <Route path="analytics" element={<Analytics />} />

            {/* A/B Testing */}
            <Route path="ab-testing" element={<ABTesting />} />

            {/* Models */}
            <Route path="models" element={<Models />} />
            <Route path="models/:modelId" element={<ModelDetail />} />

            {/* Settings */}
            <Route path="settings" element={<Settings />} />

            {/* UI Showcase */}
            <Route path="ui-showcase" element={<UIShowcase />} />

            {/* Admin Routes */}
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/roles" element={<RoleManagement />} />
            <Route path="admin/permissions" element={<PermissionManagement />} />
            <Route path="admin/activity" element={<UserActivity />} />
          </Route>

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
