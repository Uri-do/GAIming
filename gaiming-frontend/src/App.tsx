import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store/authStore'
import { useThemeStore } from '@/app/store/themeStore'
import Layout from '@/components/Layout/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('@/pages/Dashboard'))
const Games = React.lazy(() => import('@/pages/Games'))
const GameDetail = React.lazy(() => import('@/pages/GameDetail'))
const Players = React.lazy(() => import('@/pages/Players'))
const PlayerDetail = React.lazy(() => import('@/pages/PlayerDetail'))
const Recommendations = React.lazy(() => import('@/pages/Recommendations'))
const RecommendationsDashboard = React.lazy(() => import('@/pages/RecommendationsDashboard'))
const PlayerAnalytics = React.lazy(() => import('@/pages/PlayerAnalytics'))
const ABTestingManagement = React.lazy(() => import('@/pages/ABTestingManagement'))
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
const AuthTest = React.lazy(() => import('@/components/test/AuthTest'))
const Phase1Testing = React.lazy(() => import('@/pages/Phase1Testing'))
const JWTTesting = React.lazy(() => import('@/pages/JWTTesting'))
const GamesManagement = React.lazy(() => import('@/pages/GamesManagement'))
const GamesTestingSuite = React.lazy(() => import('@/pages/GamesTestingSuite'))
const AnalyticsDashboard = React.lazy(() => import('@/pages/AnalyticsDashboard'))
const GameRecommendations = React.lazy(() => import('@/pages/GameRecommendations'))
const RecommendationAnalytics = React.lazy(() => import('@/pages/RecommendationAnalytics'))
const SystemTestingSuite = React.lazy(() => import('@/pages/SystemTestingSuite'))
const PerformanceDashboard = React.lazy(() => import('@/pages/PerformanceDashboard'))
const FinalTestingSuite = React.lazy(() => import('@/pages/FinalTestingSuite'))
const FeatureEnhancementPlanner = React.lazy(() => import('@/pages/FeatureEnhancementPlanner'))
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
            <Route path="games-management" element={<GamesManagement />} />
            <Route path="games-testing" element={<GamesTestingSuite />} />

            {/* Players */}
            <Route path="players" element={<Players />} />
            <Route path="players/:playerId" element={<PlayerDetail />} />
            <Route path="players/analytics" element={<PlayerAnalytics />} />

            {/* Recommendations */}
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="recommendations/dashboard" element={<RecommendationsDashboard />} />

            {/* Analytics */}
            <Route path="analytics" element={<Analytics />} />
            <Route path="analytics-dashboard" element={<AnalyticsDashboard />} />

            {/* Recommendations */}
            <Route path="recommendations" element={<GameRecommendations />} />
            <Route path="recommendation-analytics" element={<RecommendationAnalytics />} />

            {/* A/B Testing */}
            <Route path="ab-testing" element={<ABTesting />} />
            <Route path="ab-testing/management" element={<ABTestingManagement />} />

            {/* Models */}
            <Route path="models" element={<Models />} />
            <Route path="models/:modelId" element={<ModelDetail />} />

            {/* Settings */}
            <Route path="settings" element={<Settings />} />

            {/* UI Showcase */}
            <Route path="ui-showcase" element={<UIShowcase />} />

            {/* Auth Test */}
            <Route path="auth-test" element={<AuthTest />} />

            {/* Phase 1 Testing */}
            <Route path="phase1-testing" element={<Phase1Testing />} />

            {/* JWT Testing */}
            <Route path="jwt-testing" element={<JWTTesting />} />

            {/* System Testing */}
            <Route path="system-testing" element={<SystemTestingSuite />} />

            {/* Performance Dashboard */}
            <Route path="performance" element={<PerformanceDashboard />} />

            {/* Final Testing Suite */}
            <Route path="final-testing" element={<FinalTestingSuite />} />

            {/* Feature Enhancement Planner */}
            <Route path="feature-planner" element={<FeatureEnhancementPlanner />} />

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
