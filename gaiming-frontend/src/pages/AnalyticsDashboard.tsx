/**
 * Comprehensive Analytics Dashboard
 * Real-time insights and analytics for casino operations
 */

import React, { useState, useEffect } from 'react'
import { Calendar, Download, RefreshCw, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import { analyticsService } from '@/features/analytics/services/analyticsService'
import type { AnalyticsDashboard, AnalyticsFilters, KPI } from '@/features/analytics/types'
import { FeatureErrorBoundary } from '@/shared/components'
import { useNotificationStore } from '@/app/store/notificationStore'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import KPICard from '@/features/analytics/components/KPICard'
import LineChart from '@/features/analytics/components/charts/LineChart'
import BarChart from '@/features/analytics/components/charts/BarChart'
import PieChart from '@/features/analytics/components/charts/PieChart'

const AnalyticsDashboard: React.FC = () => {
  // State management
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboard | null>(null)
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [filters, setFilters] = useState<AnalyticsFilters>({
    period: 'last30days',
    playerSegment: 'all',
    device: 'all'
  })

  const notifications = useNotificationStore()

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
    loadKPIs()
  }, [filters])

  // Auto-refresh real-time data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (dashboardData) {
        refreshRealTimeData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [dashboardData])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await analyticsService.getDashboardData(filters)
      setDashboardData(data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load analytics data')
      notifications.showError('Error', 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const loadKPIs = async () => {
    try {
      const kpiData = await analyticsService.getKPIs(filters.period)
      setKpis(kpiData)
    } catch (error) {
      console.error('Failed to load KPIs:', error)
    }
  }

  const refreshRealTimeData = async () => {
    if (!dashboardData) return
    
    try {
      const realTimeData = await analyticsService.getRealTimeMetrics()
      setDashboardData(prev => prev ? { ...prev, realTime: realTimeData } : null)
    } catch (error) {
      console.error('Failed to refresh real-time data:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadDashboardData()
      await loadKPIs()
      notifications.showSuccess('Success', 'Analytics data refreshed')
    } catch (error) {
      notifications.showError('Error', 'Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const handlePeriodChange = (period: string) => {
    setFilters(prev => ({ ...prev, period: period as any }))
  }

  const handleExport = async () => {
    try {
      const blob = await analyticsService.exportData({
        format: 'csv',
        sections: ['demographics', 'behavior', 'revenue', 'engagement'],
        period: filters.period,
        includeCharts: false,
        includeRawData: true
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${filters.period}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      notifications.showSuccess('Success', 'Analytics data exported')
    } catch (error) {
      notifications.showError('Error', 'Failed to export data')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Analytics</h1>
          <p className="text-gray-600 mb-4">{error || 'Analytics data could not be loaded.'}</p>
          <Button onClick={loadDashboardData} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FeatureErrorBoundary featureName="Analytics Dashboard">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time insights and performance metrics
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Period Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Time Period:</span>
                <select
                  value={filters.period}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 90 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisYear">This Year</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    {formatNumber(dashboardData.realTime.currentOnlinePlayers)} online now
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(dashboardData.realTime.currentOnlinePlayers)}
              </div>
              <div className="text-sm text-gray-600">Players Online</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData.realTime.currentRevenue)}
              </div>
              <div className="text-sm text-gray-600">Today's Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {dashboardData.realTime.activeGames}
              </div>
              <div className="text-sm text-gray-600">Active Games</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.realTime.systemHealth.uptime.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">System Uptime</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                Revenue Trend
              </h3>
              <LineChart
                data={dashboardData.trends.revenueTrend}
                lines={[
                  { dataKey: 'revenue', name: 'Revenue', color: '#10B981' },
                  { dataKey: 'betsPlaced', name: 'Bets Placed', color: '#3B82F6' }
                ]}
                xAxisKey="date"
                height={300}
                formatTooltip={(value, name) => [
                  name === 'Revenue' ? formatCurrency(value) : formatNumber(value),
                  name
                ]}
              />
            </CardContent>
          </Card>

          {/* Player Growth */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Player Growth
              </h3>
              <LineChart
                data={dashboardData.trends.playerGrowthTrend}
                lines={[
                  { dataKey: 'newPlayers', name: 'New Players', color: '#3B82F6' },
                  { dataKey: 'activeUsers', name: 'Active Users', color: '#8B5CF6' }
                ]}
                xAxisKey="date"
                height={300}
                formatTooltip={(value, name) => [formatNumber(value), name]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Distribution */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Device Distribution</h3>
              <PieChart
                data={[
                  { name: 'Mobile', value: dashboardData.demographics.deviceDistribution.mobile },
                  { name: 'Desktop', value: dashboardData.demographics.deviceDistribution.desktop },
                  { name: 'Tablet', value: dashboardData.demographics.deviceDistribution.tablet }
                ]}
                height={250}
                colors={['#3B82F6', '#10B981', '#F59E0B']}
              />
            </CardContent>
          </Card>

          {/* Top Games by Revenue */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Games by Revenue</h3>
              <BarChart
                data={dashboardData.revenue.revenueByGame.slice(0, 5)}
                bars={[{ dataKey: 'revenue', name: 'Revenue', color: '#10B981' }]}
                xAxisKey="gameName"
                height={250}
                showLegend={false}
                formatTooltip={(value) => [formatCurrency(value), 'Revenue']}
              />
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
              <div className="space-y-3">
                {dashboardData.demographics.geographicDistribution.slice(0, 6).map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{country.country}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {country.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Player Behavior Metrics */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Player Behavior</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData.behavior.averageSessionDuration.toFixed(1)}m
                  </div>
                  <div className="text-sm text-gray-600">Avg Session</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData.behavior.sessionsPerPlayer.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Sessions/Player</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData.behavior.retentionRates.day7.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">7-Day Retention</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {dashboardData.behavior.churnRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Churn Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Metrics */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(dashboardData.revenue.revenuePerPlayer)}
                  </div>
                  <div className="text-sm text-gray-600">Revenue/Player</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(dashboardData.revenue.averageBetSize)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Bet Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData.revenue.houseEdge.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">House Edge</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {dashboardData.revenue.revenueGrowth.monthly.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Monthly Growth</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FeatureErrorBoundary>
  )
}

export default AnalyticsDashboard
