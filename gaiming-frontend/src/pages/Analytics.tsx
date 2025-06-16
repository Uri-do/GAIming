import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Activity,
  Clock,
  RefreshCw,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { analyticsService, type ComprehensiveAnalytics, type AnalyticsRequest } from '../services/analyticsService';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

import LoadingSpinner from '../components/UI/LoadingSpinner';
import AuthGuard, { usePermissions } from '../components/auth/AuthGuard';
import { exportService } from '../services/exportService';

const AnalyticsContent: React.FC = () => {
  const { canExportAnalytics, user } = usePermissions();
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  const [filters, setFilters] = useState<AnalyticsRequest>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    granularity: 'day',
  });

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await analyticsService.getComprehensiveAnalytics(filters);
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    const endDate = new Date();
    let startDate = new Date();

    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  const handleExportReport = async (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    if (!canExportAnalytics) {
      setError('You do not have permission to export reports');
      return;
    }

    if (!analytics) {
      setError('No analytics data available to export');
      return;
    }

    try {
      setLoading(true);

      // Use the export service
      exportService.exportAnalyticsReport(
        analytics,
        format,
        {
          filename: 'analytics-report',
          includeTimestamp: true,
          customHeaders: {
            title: 'GAIming Analytics Report',
            timeRange: selectedTimeRange,
            generatedBy: user?.name || 'Unknown'
          }
        }
      );
    } catch (err) {
      setError('Failed to export analytics report');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };



  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analytics Dashboard - GAIming</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive analytics and performance insights
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <Button
                  key={range}
                  variant={selectedTimeRange === range ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeChange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAnalytics()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {canExportAnalytics && (
              <div className="relative group">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => handleExportReport('csv')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExportReport('excel')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export Excel
                  </button>
                  <button
                    onClick={() => handleExportReport('pdf')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Players
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(analytics.overview.totalPlayers)}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Active: {formatNumber(analytics.overview.activePlayers)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(analytics.overview.totalRevenue)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Last updated: {new Date(analytics.overview.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Recommendations
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(analytics.overview.totalRecommendations)}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center mt-1">
                      <Target className="h-3 w-3 mr-1" />
                      CTR: {formatPercentage(analytics.overview.averageCTR)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      System Health
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPercentage(analytics.overview.systemHealth)}
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                      <Activity className="h-3 w-3 mr-1" />
                      Conversion: {formatPercentage(analytics.overview.averageConversionRate)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-emerald-500" />
                </div>
              </Card>
            </div>

            {/* Revenue and Player Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Revenue Trends
                </h3>
                <LineChart
                  data={analytics.revenue.revenueTrends.map(trend => ({
                    name: new Date(trend.date).toLocaleDateString(),
                    revenue: trend.revenue,
                    players: trend.players,
                  }))}
                  lines={[
                    {
                      dataKey: 'revenue',
                      stroke: '#10B981',
                      name: 'Revenue',
                    },
                  ]}
                  height={300}
                  formatYAxis={(value) => formatCurrency(value)}
                  formatTooltip={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                    name === 'revenue' ? 'Revenue' : 'Players'
                  ]}
                />
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Player Activity
                </h3>
                <LineChart
                  data={analytics.revenue.revenueTrends.map(trend => ({
                    name: new Date(trend.date).toLocaleDateString(),
                    players: trend.players,
                    sessions: trend.sessions,
                  }))}
                  lines={[
                    {
                      dataKey: 'players',
                      stroke: '#3B82F6',
                      name: 'Players',
                    },
                    {
                      dataKey: 'sessions',
                      stroke: '#8B5CF6',
                      name: 'Sessions',
                    },
                  ]}
                  height={300}
                  formatYAxis={(value) => formatNumber(value)}
                  formatTooltip={(value, name) => [formatNumber(value), name]}
                />
              </Card>
            </div>

            {/* Game Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Game Type Distribution
                </h3>
                <PieChart
                  data={Object.entries(analytics.games.gameTypeDistribution).map(([name, value]) => ({
                    name,
                    value,
                  }))}
                  height={250}
                  formatTooltip={(value, name) => [`${value} games`, name]}
                />
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Provider Distribution
                </h3>
                <PieChart
                  data={Object.entries(analytics.games.providerDistribution).map(([name, value]) => ({
                    name,
                    value,
                  }))}
                  height={250}
                  formatTooltip={(value, name) => [`${value} games`, name]}
                />
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Performing Games
                </h3>
                <div className="space-y-3">
                  {analytics.games.topPerformingGames.slice(0, 5).map((game, index) => (
                    <div key={game.gameId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                            {index + 1}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {game.gameName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {game.provider}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(game.revenue)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatNumber(game.sessions)} sessions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Recommendation Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Algorithm Performance
                </h3>
                <BarChart
                  data={Object.entries(analytics.recommendations.algorithmCTR).map(([algorithm, ctr]) => ({
                    name: algorithm,
                    ctr: ctr,
                    conversion: analytics.recommendations.algorithmConversionRate[algorithm] || 0,
                  }))}
                  bars={[
                    {
                      dataKey: 'ctr',
                      fill: '#3B82F6',
                      name: 'Click-through Rate (%)',
                    },
                    {
                      dataKey: 'conversion',
                      fill: '#10B981',
                      name: 'Conversion Rate (%)',
                    },
                  ]}
                  height={300}
                  formatYAxis={(value) => `${value}%`}
                  formatTooltip={(value, name) => [`${value}%`, name]}
                />
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Player Segments
                </h3>
                <PieChart
                  data={Object.entries(analytics.players.playerSegments).map(([name, value]) => ({
                    name,
                    value,
                  }))}
                  height={300}
                  formatTooltip={(value, name) => [`${value} players`, name]}
                />
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                System Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        CPU Usage
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatPercentage(analytics.performance.systemMetrics.cpuUsage)}
                      </p>
                    </div>
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Memory Usage
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatPercentage(analytics.performance.systemMetrics.memoryUsage)}
                      </p>
                    </div>
                    <BarChart3 className="h-6 w-6 text-green-500" />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        API Response Time
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {analytics.performance.apiPerformance.averageResponseTime}ms
                      </p>
                    </div>
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Error Rate
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatPercentage(analytics.performance.apiPerformance.errorRate)}
                      </p>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
};

const Analytics: React.FC = () => (
  <AuthGuard requiredPermissions={['analytics.view']}>
    <AnalyticsContent />
  </AuthGuard>
);

export default Analytics;
