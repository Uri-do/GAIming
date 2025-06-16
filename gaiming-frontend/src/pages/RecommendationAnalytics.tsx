/**
 * Recommendation Analytics Dashboard
 * Analytics and insights for the recommendation engine
 */

import React, { useState, useEffect } from 'react'
import { TrendingUp, Users, MousePointer, DollarSign, Brain, Target, RefreshCw } from 'lucide-react'
import { recommendationService } from '@/features/recommendations/services/recommendationService'
import type { RecommendationDashboard, RecommendationAnalytics } from '@/features/recommendations/types'
import { FeatureErrorBoundary } from '@/shared/components'
import { useNotificationStore } from '@/app/store/notificationStore'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import LineChart from '@/features/analytics/components/charts/LineChart'
import BarChart from '@/features/analytics/components/charts/BarChart'
import PieChart from '@/features/analytics/components/charts/PieChart'

const RecommendationAnalytics: React.FC = () => {
  // State management
  const [dashboard, setDashboard] = useState<RecommendationDashboard | null>(null)
  const [analytics, setAnalytics] = useState<RecommendationAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('last30days')

  const notifications = useNotificationStore()

  // Load data on mount and period change
  useEffect(() => {
    loadData()
  }, [selectedPeriod])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [dashboardData, analyticsData] = await Promise.all([
        recommendationService.getDashboard(),
        recommendationService.getAnalytics(selectedPeriod)
      ])
      
      setDashboard(dashboardData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load recommendation analytics:', error)
      setError('Failed to load analytics data')
      notifications.showError('Error', 'Failed to load recommendation analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadData()
      notifications.showSuccess('Success', 'Analytics data refreshed')
    } catch (error) {
      notifications.showError('Error', 'Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error || !dashboard || !analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Analytics</h1>
          <p className="text-gray-600 mb-4">{error || 'Analytics data could not be loaded.'}</p>
          <Button onClick={loadData} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FeatureErrorBoundary featureName="Recommendation Analytics">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Recommendation Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Performance insights for the AI recommendation engine
            </p>
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
            </select>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(dashboard.overview.totalActiveUsers)}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
                <Users className="w-4 h-4 mr-1" />
                Active Users
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(dashboard.overview.recommendationsServed)}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
                <Target className="w-4 h-4 mr-1" />
                Recommendations
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(dashboard.overview.clickThroughRate)}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
                <MousePointer className="w-4 h-4 mr-1" />
                Click Rate
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatPercentage(dashboard.overview.conversionRate)}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                Conversion
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(dashboard.overview.revenueImpact)}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
                <DollarSign className="w-4 h-4 mr-1" />
                Revenue Impact
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendation Trends */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                Recommendation Performance Trends
              </h3>
              <LineChart
                data={dashboard.trends.daily}
                lines={[
                  { dataKey: 'recommendations', name: 'Recommendations', color: '#3B82F6' },
                  { dataKey: 'clicks', name: 'Clicks', color: '#10B981' },
                  { dataKey: 'conversions', name: 'Conversions', color: '#F59E0B' }
                ]}
                xAxisKey="date"
                height={300}
                formatTooltip={(value, name) => [formatNumber(value), name]}
              />
            </CardContent>
          </Card>

          {/* Algorithm Performance */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-500" />
                Algorithm Performance
              </h3>
              <BarChart
                data={dashboard.algorithms.map(alg => ({
                  name: alg.algorithm.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  performance: alg.performance,
                  usage: alg.usage,
                  accuracy: alg.accuracy
                }))}
                bars={[
                  { dataKey: 'performance', name: 'Performance', color: '#8B5CF6' },
                  { dataKey: 'accuracy', name: 'Accuracy', color: '#06B6D4' }
                ]}
                xAxisKey="name"
                height={300}
                formatTooltip={(value, name) => [`${value}%`, name]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Performance */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
              <PieChart
                data={dashboard.categories.map(cat => ({
                  name: cat.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  value: cat.effectiveness
                }))}
                height={250}
                colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
              />
            </CardContent>
          </Card>

          {/* Hourly Activity */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Hourly Activity</h3>
              <BarChart
                data={dashboard.trends.hourly}
                bars={[{ dataKey: 'activity', name: 'Activity', color: '#10B981' }]}
                xAxisKey="hour"
                height={250}
                showLegend={false}
                formatTooltip={(value) => [formatNumber(value), 'Recommendations']}
                formatXAxis={(value) => `${value}:00`}
              />
            </CardContent>
          </Card>

          {/* Top Performing Games */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Recommended Games</h3>
              <div className="space-y-3">
                {dashboard.topGames.slice(0, 6).map((game, index) => (
                  <div key={game.gameId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium truncate">{game.gameName}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatPercentage(game.clickRate)}</div>
                      <div className="text-xs text-gray-500">{formatNumber(game.recommendationCount)} recs</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Algorithm Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Algorithm Breakdown</h3>
              <div className="space-y-4">
                {analytics.topPerformingAlgorithms.map((algorithm) => (
                  <div key={algorithm.algorithm} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium capitalize">
                        {algorithm.algorithm.replace('_', ' ')}
                      </h4>
                      <div className="text-sm text-gray-500">
                        {formatPercentage(algorithm.usage)} usage
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Performance:</span>
                        <div className="font-medium">{formatPercentage(algorithm.performance)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Usage:</span>
                        <div className="font-medium">{formatPercentage(algorithm.usage)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Analytics */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Category Analytics</h3>
              <div className="space-y-4">
                {analytics.categoryPerformance.map((category) => (
                  <div key={category.category} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium capitalize">
                        {category.category.replace('_', ' ')}
                      </h4>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(category.revenue)}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Impressions:</span>
                        <div className="font-medium">{formatNumber(category.impressions)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Clicks:</span>
                        <div className="font-medium">{formatNumber(category.clicks)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Conversions:</span>
                        <div className="font-medium">{formatNumber(category.conversions)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Recommendations:</span>
                <div className="text-xl font-bold text-blue-600">
                  {formatNumber(analytics.totalRecommendations)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Unique Users:</span>
                <div className="text-xl font-bold text-green-600">
                  {formatNumber(analytics.uniqueUsers)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Avg Engagement:</span>
                <div className="text-xl font-bold text-purple-600">
                  {analytics.averageEngagementTime.toFixed(1)}m
                </div>
              </div>
              <div>
                <span className="text-gray-600">Revenue Generated:</span>
                <div className="text-xl font-bold text-red-600">
                  {formatCurrency(analytics.revenueGenerated)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureErrorBoundary>
  )
}

export default RecommendationAnalytics
