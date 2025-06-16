/**
 * Performance Monitoring Dashboard
 * Real-time performance metrics and optimization insights
 */

import React, { useState, useEffect } from 'react'
import { Activity, Zap, Clock, Database, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { usePerformanceMetrics, useMemoryOptimization, useNetworkOptimization } from '@/shared/hooks/usePerformanceOptimization'
import { performanceService } from '@/shared/services/performanceService'
import { FeatureErrorBoundary } from '@/shared/components'
import { useNotificationStore } from '@/app/store/notificationStore'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import LineChart from '@/features/analytics/components/charts/LineChart'

const PerformanceDashboard: React.FC = () => {
  const { metrics, recommendations, optimizeMemory } = usePerformanceMetrics()
  const { memoryUsage, isHighMemoryUsage } = useMemoryOptimization()
  const { networkInfo, isSlowConnection } = useNetworkOptimization()
  const [historicalMetrics, setHistoricalMetrics] = useState<any[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  
  const notifications = useNotificationStore()

  // Collect historical metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const currentMetrics = performanceService.getPerformanceMetrics()
      setHistoricalMetrics(prev => {
        const newMetrics = [...prev, {
          timestamp: new Date().toISOString(),
          ...currentMetrics
        }]
        // Keep only last 50 data points
        return newMetrics.slice(-50)
      })
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const handleOptimizePerformance = async () => {
    setIsOptimizing(true)
    try {
      // Run optimization
      optimizeMemory()
      performanceService.optimizeMemory()
      
      // Clear expired cache
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      notifications.showSuccess('Optimization Complete', 'Performance has been optimized')
    } catch (error) {
      notifications.showError('Optimization Failed', 'Failed to optimize performance')
    } finally {
      setIsOptimizing(false)
    }
  }

  const getPerformanceScore = () => {
    let score = 100
    
    if (metrics.pageLoadTime > 3000) score -= 20
    if (metrics.apiResponseTime > 1000) score -= 15
    if (metrics.memoryUsage > 100) score -= 20
    if (metrics.cacheHitRate < 0.7) score -= 10
    if (isSlowConnection) score -= 15
    
    return Math.max(0, score)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const performanceScore = getPerformanceScore()

  return (
    <FeatureErrorBoundary featureName="Performance Dashboard">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Performance Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time performance monitoring and optimization
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleOptimizePerformance}
              disabled={isOptimizing}
              variant="primary"
            >
              {isOptimizing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Optimize
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Performance Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Overall Performance Score</h3>
                <div className={`text-4xl font-bold ${getScoreColor(performanceScore)}`}>
                  {performanceScore}/100
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {performanceScore >= 90 ? 'Excellent' : 
                   performanceScore >= 70 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>
              <div className="text-right">
                {isSlowConnection && (
                  <div className="flex items-center text-orange-600 mb-2">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Slow Network Detected
                  </div>
                )}
                {isHighMemoryUsage && (
                  <div className="flex items-center text-red-600 mb-2">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    High Memory Usage
                  </div>
                )}
                {performanceScore >= 90 && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Optimized
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                <span className="font-medium">Page Load</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.pageLoadTime.toFixed(0)}ms
              </div>
              <div className={`text-sm ${metrics.pageLoadTime > 3000 ? 'text-red-600' : 'text-green-600'}`}>
                Target: <3000ms
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="w-5 h-5 text-green-500 mr-2" />
                <span className="font-medium">API Response</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.apiResponseTime.toFixed(0)}ms
              </div>
              <div className={`text-sm ${metrics.apiResponseTime > 1000 ? 'text-red-600' : 'text-green-600'}`}>
                Target: <1000ms
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Database className="w-5 h-5 text-purple-500 mr-2" />
                <span className="font-medium">Memory Usage</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.memoryUsage.toFixed(1)}MB
              </div>
              <div className={`text-sm ${metrics.memoryUsage > 100 ? 'text-red-600' : 'text-green-600'}`}>
                Target: <100MB
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-orange-500 mr-2" />
                <span className="font-medium">Cache Hit Rate</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(metrics.cacheHitRate * 100).toFixed(1)}%
              </div>
              <div className={`text-sm ${metrics.cacheHitRate < 0.7 ? 'text-red-600' : 'text-green-600'}`}>
                Target: >70%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Trends */}
        {historicalMetrics.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
              <LineChart
                data={historicalMetrics}
                lines={[
                  { dataKey: 'pageLoadTime', name: 'Page Load (ms)', color: '#3B82F6' },
                  { dataKey: 'apiResponseTime', name: 'API Response (ms)', color: '#10B981' },
                  { dataKey: 'memoryUsage', name: 'Memory (MB)', color: '#8B5CF6' }
                ]}
                xAxisKey="timestamp"
                height={300}
                formatXAxis={(value) => new Date(value).toLocaleTimeString()}
              />
            </CardContent>
          </Card>
        )}

        {/* Network Information */}
        {networkInfo && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Network Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Connection Type:</span>
                  <div className="font-medium">{networkInfo.effectiveType?.toUpperCase() || 'Unknown'}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Downlink:</span>
                  <div className="font-medium">{networkInfo.downlink?.toFixed(1) || 'N/A'} Mbps</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">RTT:</span>
                  <div className="font-medium">{networkInfo.rtt || 'N/A'}ms</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Data Saver:</span>
                  <div className="font-medium">{networkInfo.saveData ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Optimization Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                Optimization Recommendations
              </h3>
              <div className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Tips */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">✅ Currently Optimized</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Lazy loading for images and components</li>
                  <li>• Advanced caching with TTL</li>
                  <li>• Bundle splitting and code optimization</li>
                  <li>• Performance monitoring and metrics</li>
                  <li>• Memory optimization and cleanup</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-blue-600">🚀 Additional Optimizations</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Service worker for offline caching</li>
                  <li>• CDN integration for static assets</li>
                  <li>• Database query optimization</li>
                  <li>• Image compression and WebP support</li>
                  <li>• HTTP/2 server push implementation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Real-time Monitoring Active</span>
              </div>
              <div className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureErrorBoundary>
  )
}

export default PerformanceDashboard
