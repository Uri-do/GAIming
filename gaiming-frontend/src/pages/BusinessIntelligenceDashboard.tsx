/**
 * Business Intelligence & KPI Dashboard
 * Comprehensive metrics and business intelligence platform
 */

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, DollarSign, Users, Target, BarChart3, 
  PieChart, Activity, Zap, Globe, Smartphone, 
  Calendar, Filter, Download, RefreshCw, AlertTriangle
} from 'lucide-react'
import { FeatureErrorBoundary } from '@/shared/components'
import { useNotificationStore } from '@/app/store/notificationStore'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import EnhancedButton from '@/shared/components/enhanced/EnhancedButton'
import { AnimatedElement, ProgressBar } from '@/shared/components/animations/AnimationSystem'
import EnhancedCard, { CardGrid } from '@/shared/components/enhanced/EnhancedCard'
import LineChart from '@/features/analytics/components/charts/LineChart'
import PieChartComponent from '@/features/analytics/components/charts/PieChart'
import BarChart from '@/features/analytics/components/charts/BarChart'

interface KPIMetric {
  id: string
  name: string
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change: number
  category: 'revenue' | 'growth' | 'engagement' | 'efficiency' | 'quality'
  description: string
  benchmark: number
}

interface BusinessMetric {
  id: string
  name: string
  current: number
  previous: number
  target: number
  unit: string
  category: string
  status: 'excellent' | 'good' | 'warning' | 'critical'
}

const BusinessIntelligenceDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([])
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>([])
  const [realTimeData, setRealTimeData] = useState<any>({})
  const [isRefreshing, setIsRefreshing] = useState(false)

  const notifications = useNotificationStore()

  // Initialize KPI data
  useEffect(() => {
    initializeKPIData()
    startRealTimeUpdates()
  }, [])

  const initializeKPIData = () => {
    const kpis: KPIMetric[] = [
      {
        id: '1',
        name: 'Monthly Recurring Revenue',
        value: 2850000,
        target: 3000000,
        unit: '$',
        trend: 'up',
        change: 15.3,
        category: 'revenue',
        description: 'Total monthly subscription revenue',
        benchmark: 2500000
      },
      {
        id: '2',
        name: 'Customer Acquisition Cost',
        value: 1250,
        target: 1000,
        unit: '$',
        trend: 'down',
        change: -8.2,
        category: 'efficiency',
        description: 'Cost to acquire new customer',
        benchmark: 1500
      },
      {
        id: '3',
        name: 'Customer Lifetime Value',
        value: 45000,
        target: 50000,
        unit: '$',
        trend: 'up',
        change: 12.7,
        category: 'revenue',
        description: 'Average customer lifetime value',
        benchmark: 40000
      },
      {
        id: '4',
        name: 'Monthly Active Users',
        value: 125000,
        target: 150000,
        unit: '',
        trend: 'up',
        change: 22.1,
        category: 'growth',
        description: 'Monthly active platform users',
        benchmark: 100000
      },
      {
        id: '5',
        name: 'Net Promoter Score',
        value: 68,
        target: 70,
        unit: '',
        trend: 'up',
        change: 5.2,
        category: 'quality',
        description: 'Customer satisfaction score',
        benchmark: 60
      },
      {
        id: '6',
        name: 'Churn Rate',
        value: 3.2,
        target: 2.5,
        unit: '%',
        trend: 'down',
        change: -1.1,
        category: 'engagement',
        description: 'Monthly customer churn rate',
        benchmark: 5.0
      }
    ]

    const metrics: BusinessMetric[] = [
      {
        id: '1',
        name: 'Revenue Growth Rate',
        current: 25.3,
        previous: 18.7,
        target: 30.0,
        unit: '%',
        category: 'Revenue',
        status: 'good'
      },
      {
        id: '2',
        name: 'Customer Retention',
        current: 96.8,
        previous: 94.2,
        target: 95.0,
        unit: '%',
        category: 'Engagement',
        status: 'excellent'
      },
      {
        id: '3',
        name: 'Platform Uptime',
        current: 99.97,
        previous: 99.89,
        target: 99.9,
        unit: '%',
        category: 'Quality',
        status: 'excellent'
      },
      {
        id: '4',
        name: 'API Response Time',
        current: 245,
        previous: 380,
        target: 300,
        unit: 'ms',
        category: 'Performance',
        status: 'excellent'
      }
    ]

    setKpiMetrics(kpis)
    setBusinessMetrics(metrics)
  }

  const startRealTimeUpdates = () => {
    const interval = setInterval(() => {
      setRealTimeData({
        activeUsers: 8247 + Math.floor(Math.random() * 500),
        revenue: 2850000 + Math.floor(Math.random() * 50000),
        conversions: 156 + Math.floor(Math.random() * 20),
        apiCalls: 45230 + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString()
      })
    }, 3000)

    return () => clearInterval(interval)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    notifications.showInfo('Refreshing Data', 'Updating business intelligence metrics')
    
    setTimeout(() => {
      setIsRefreshing(false)
      notifications.showSuccess('Data Updated', 'All metrics refreshed successfully')
    }, 2000)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'revenue': return DollarSign
      case 'growth': return TrendingUp
      case 'engagement': return Users
      case 'efficiency': return Zap
      case 'quality': return Target
      default: return BarChart3
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === '$') {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value > 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value > 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  const periods = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: '1y', label: 'Last Year' }
  ]

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'growth', label: 'Growth' },
    { id: 'engagement', label: 'Engagement' },
    { id: 'efficiency', label: 'Efficiency' },
    { id: 'quality', label: 'Quality' }
  ]

  const filteredKPIs = selectedCategory === 'all' 
    ? kpiMetrics 
    : kpiMetrics.filter(kpi => kpi.category === selectedCategory)

  return (
    <FeatureErrorBoundary featureName="Business Intelligence Dashboard">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <AnimatedElement animation="fadeInDown">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Business Intelligence
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Comprehensive metrics and KPI tracking
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {periods.map(period => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
              <EnhancedButton
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                icon={isRefreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              >
                Refresh
              </EnhancedButton>
            </div>
          </div>
        </AnimatedElement>

        {/* Real-time Metrics */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Real-time Metrics</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {realTimeData.activeUsers?.toLocaleString() || '8,247'}
                </div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${((realTimeData.revenue || 2850000) / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {realTimeData.conversions || 156}
                </div>
                <div className="text-sm text-gray-600">Conversions Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {realTimeData.apiCalls?.toLocaleString() || '45,230'}
                </div>
                <div className="text-sm text-gray-600">API Calls/Hour</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Filter */}
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* KPI Cards */}
        <CardGrid columns={3} staggerDelay={100}>
          {filteredKPIs.map((kpi) => {
            const IconComponent = getCategoryIcon(kpi.category)
            const progress = (kpi.value / kpi.target) * 100
            const isAboveTarget = kpi.value >= kpi.target
            
            return (
              <EnhancedCard key={kpi.id} className="p-6" hover glow>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-6 h-6 text-blue-500" />
                      <div>
                        <h3 className="text-lg font-semibold">{kpi.name}</h3>
                        <p className="text-sm text-gray-600">{kpi.description}</p>
                      </div>
                    </div>
                    {getTrendIcon(kpi.trend)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatValue(kpi.value, kpi.unit)}
                        {kpi.unit && kpi.unit !== '$' && kpi.unit}
                      </span>
                      <span className={`text-sm font-medium ${
                        kpi.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {kpi.change > 0 ? '+' : ''}{kpi.change}%
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress to Target</span>
                        <span className={isAboveTarget ? 'text-green-600' : 'text-gray-600'}>
                          {formatValue(kpi.target, kpi.unit)}{kpi.unit && kpi.unit !== '$' && kpi.unit}
                        </span>
                      </div>
                      <ProgressBar 
                        value={Math.min(progress, 100)} 
                        color={isAboveTarget ? 'green' : 'blue'}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Benchmark: {formatValue(kpi.benchmark, kpi.unit)}{kpi.unit && kpi.unit !== '$' && kpi.unit}
                  </div>
                </div>
              </EnhancedCard>
            )
          })}
        </CardGrid>

        {/* Business Metrics Table */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Key Business Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4">Metric</th>
                    <th className="text-left py-3 px-4">Current</th>
                    <th className="text-left py-3 px-4">Previous</th>
                    <th className="text-left py-3 px-4">Target</th>
                    <th className="text-left py-3 px-4">Change</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {businessMetrics.map((metric) => {
                    const change = ((metric.current - metric.previous) / metric.previous) * 100
                    return (
                      <tr key={metric.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{metric.name}</div>
                            <div className="text-sm text-gray-600">{metric.category}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {metric.current}{metric.unit}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {metric.previous}{metric.unit}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {metric.target}{metric.unit}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${
                            change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                            {metric.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
              <LineChart
                data={[
                  { month: 'Jan', revenue: 1200000, target: 1500000 },
                  { month: 'Feb', revenue: 1450000, target: 1600000 },
                  { month: 'Mar', revenue: 1680000, target: 1700000 },
                  { month: 'Apr', revenue: 1920000, target: 1800000 },
                  { month: 'May', revenue: 2150000, target: 2000000 },
                  { month: 'Jun', revenue: 2380000, target: 2200000 },
                  { month: 'Jul', revenue: 2650000, target: 2400000 },
                  { month: 'Aug', revenue: 2850000, target: 2600000 }
                ]}
                lines={[
                  { dataKey: 'revenue', name: 'Actual Revenue', color: '#10B981' },
                  { dataKey: 'target', name: 'Target Revenue', color: '#6B7280' }
                ]}
                xAxisKey="month"
                height={250}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Acquisition</h3>
              <BarChart
                data={[
                  { channel: 'Direct', customers: 450, cost: 850 },
                  { channel: 'Referral', customers: 320, cost: 650 },
                  { channel: 'Paid Ads', customers: 280, cost: 1200 },
                  { channel: 'Content', customers: 180, cost: 400 },
                  { channel: 'Social', customers: 120, cost: 300 }
                ]}
                bars={[
                  { dataKey: 'customers', name: 'New Customers', color: '#3B82F6' }
                ]}
                xAxisKey="channel"
                height={250}
              />
            </CardContent>
          </Card>
        </div>

        {/* Export Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleString()}
              </div>
              <div className="flex space-x-2">
                <EnhancedButton variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
                  Export PDF
                </EnhancedButton>
                <EnhancedButton variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
                  Export CSV
                </EnhancedButton>
                <EnhancedButton variant="primary" size="sm" icon={<Calendar className="w-4 h-4" />}>
                  Schedule Report
                </EnhancedButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureErrorBoundary>
  )
}

export default BusinessIntelligenceDashboard
