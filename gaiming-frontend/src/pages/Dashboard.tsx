import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Gamepad2,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'
import { gameService } from '@/services/gameService'
import { apiService } from '@/services/api'
import { API_ENDPOINTS } from '@/config'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatNumber, formatPercentage, getChangeColor } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<{ className?: string }>
  color?: 'primary' | 'success' | 'warning' | 'error'
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/25',
    success: 'bg-gradient-to-br from-success-500 to-emerald-500 text-white shadow-lg shadow-success-500/25',
    warning: 'bg-gradient-to-br from-warning-500 to-orange-500 text-white shadow-lg shadow-warning-500/25',
    error: 'bg-gradient-to-br from-error-500 to-red-500 text-white shadow-lg shadow-error-500/25',
  }

  return (
    <Card variant="gaming" hover glow className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5" />
      <CardContent className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-white mt-1">
              {typeof value === 'number' ? formatNumber(value) : value}
            </p>
            {change !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${getChangeColor(change)}`}>
                {change > 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {formatPercentage(Math.abs(change) / 100)} from last month
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardOverview {
  totalUsers: number
  activeGames: number
  clickThroughRate: number
  totalRecommendations: number
}

interface DashboardData {
  overview: DashboardOverview
}

interface AlgorithmPerformance {
  algorithm: string
  ctr: number
}

interface RecommendationData {
  algorithmPerformance: AlgorithmPerformance[]
}

const Dashboard: React.FC = () => {
  // Fetch dashboard metrics
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard-metrics'],
    queryFn: () => apiService.get(API_ENDPOINTS.ANALYTICS.DASHBOARD),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch recommendation analytics
  const { data: recommendationData, isLoading: recommendationLoading } = useQuery<RecommendationData>({
    queryKey: ['recommendation-analytics'],
    queryFn: () => apiService.get(API_ENDPOINTS.RECOMMENDATIONS.ANALYTICS),
  })

  // Fetch games data
  const { data: _gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ['games-overview'],
    queryFn: () => gameService.getGames({ page: 1, pageSize: 1 }), // Just get count
  })

  const isLoading = dashboardLoading || recommendationLoading || gamesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" variant="gaming" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome to GAIming - Your AI-powered gaming recommendation system
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={dashboardData?.overview?.totalUsers || 0}
          icon={Users}
          color="primary"
        />
        <MetricCard
          title="Active Games"
          value={dashboardData?.overview?.activeGames || 0}
          change={15.2}
          icon={Gamepad2}
          color="success"
        />
        <MetricCard
          title="Click Through Rate"
          value={`${dashboardData?.overview?.clickThroughRate || 0}%`}
          change={-2.1}
          icon={Target}
          color="warning"
        />
        <MetricCard
          title="Total Recommendations"
          value={dashboardData?.overview?.totalRecommendations || 0}
          icon={BarChart3}
          color="primary"
        />
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Algorithm Performance */}
        <Card variant="gaming" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5" />
          <CardHeader variant="gaming" className="relative z-10">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-400" />
              Algorithm Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            {recommendationData?.algorithmPerformance && recommendationData.algorithmPerformance.length > 0 ? (
              <div className="space-y-4">
                {recommendationData.algorithmPerformance.map((algo: any, index: number) => (
                  <div key={algo.algorithm} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-primary-500/20">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-primary-500' :
                        index === 1 ? 'bg-purple-500' :
                        index === 2 ? 'bg-pink-500' : 'bg-blue-500'
                      } shadow-lg`}></div>
                      <span className="text-sm font-medium text-white capitalize">
                        {algo.algorithm.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary-400">
                        {algo.ctr}%
                      </div>
                      <div className="text-xs text-gray-400">
                        CTR
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">
                  No algorithm data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card variant="gaming" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-success-500/5 to-emerald-500/5" />
          <CardHeader variant="gaming" className="relative z-10">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-success-400" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-success-500/20">
                <span className="text-sm text-gray-300">
                  Recommendation Engine
                </span>
                <Badge variant="gaming" size="sm" pulse>
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-success-500/20">
                <span className="text-sm text-gray-300">
                  ML Models
                </span>
                <Badge variant="success" size="sm">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-success-500/20">
                <span className="text-sm text-gray-300">
                  Data Pipeline
                </span>
                <Badge variant="success" size="sm">
                  Running
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-primary-500/20">
                <span className="text-sm text-gray-300">
                  A/B Tests
                </span>
                <Badge variant="default" size="sm">
                  2 Running
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="gaming" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5" />
        <CardHeader variant="gaming" className="relative z-10">
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="gaming"
              size="lg"
              className="h-auto p-6 flex-col items-start text-left"
              icon={<Target className="w-8 h-8" />}
            >
              <div className="mt-2">
                <h4 className="font-medium text-white mb-1">
                  Generate Recommendations
                </h4>
                <p className="text-sm text-gray-300">
                  Trigger batch recommendation generation
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-auto p-6 flex-col items-start text-left border-primary-500/30 hover:bg-primary-500/10"
              icon={<BarChart3 className="w-8 h-8" />}
            >
              <div className="mt-2">
                <h4 className="font-medium text-white mb-1">
                  View Analytics
                </h4>
                <p className="text-sm text-gray-300">
                  Detailed performance analytics
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-auto p-6 flex-col items-start text-left border-primary-500/30 hover:bg-primary-500/10"
              icon={<Users className="w-8 h-8" />}
            >
              <div className="mt-2">
                <h4 className="font-medium text-white mb-1">
                  Manage Players
                </h4>
                <p className="text-sm text-gray-300">
                  View and manage player data
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
