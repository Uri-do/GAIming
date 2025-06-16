/**
 * Analytics Service
 * Handles all player analytics and insights data
 */

import { apiService } from '@/shared/services/api'
import type {
  AnalyticsDashboard,
  AnalyticsFilters,
  PlayerDemographics,
  PlayerBehavior,
  RevenueAnalytics,
  PlayerEngagement,
  GamePerformance,
  RealTimeMetrics,
  TrendAnalysis,
  KPI,
  CohortAnalysis,
  ABTestResult,
  AnalyticsExportOptions
} from '../types'

// Development mode check
const isDevelopment = process.env.NODE_ENV === 'development'

// Mock data generators
const generateMockDemographics = (): PlayerDemographics => ({
  totalPlayers: 45678,
  newPlayers: 1234,
  returningPlayers: 44444,
  activePlayersToday: 8765,
  activePlayersWeek: 23456,
  activePlayersMonth: 34567,
  averageAge: 32.5,
  genderDistribution: {
    male: 58.3,
    female: 39.2,
    other: 1.8,
    notSpecified: 0.7
  },
  geographicDistribution: [
    { country: 'United States', playerCount: 12345, percentage: 27.0 },
    { country: 'United Kingdom', playerCount: 8901, percentage: 19.5 },
    { country: 'Germany', playerCount: 6789, percentage: 14.9 },
    { country: 'Canada', playerCount: 4567, percentage: 10.0 },
    { country: 'Australia', playerCount: 3456, percentage: 7.6 },
    { country: 'Others', playerCount: 9620, percentage: 21.0 }
  ],
  deviceDistribution: {
    mobile: 68.5,
    desktop: 28.3,
    tablet: 3.2
  }
})

const generateMockBehavior = (): PlayerBehavior => ({
  averageSessionDuration: 23.5,
  sessionsPerPlayer: 4.2,
  averageGamesPerSession: 2.8,
  mostPopularGames: [
    { gameId: 1, gameName: 'Starburst', playerCount: 15678, sessionCount: 45234 },
    { gameId: 2, gameName: 'Book of Dead', playerCount: 12345, sessionCount: 38901 },
    { gameId: 3, gameName: 'Gonzo\'s Quest', playerCount: 11234, sessionCount: 34567 },
    { gameId: 4, gameName: 'Sweet Bonanza', playerCount: 9876, sessionCount: 28901 },
    { gameId: 5, gameName: 'Gates of Olympus', playerCount: 8765, sessionCount: 25678 }
  ],
  peakPlayingHours: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    playerCount: Math.floor(Math.random() * 5000) + 1000 + (hour >= 18 && hour <= 23 ? 2000 : 0)
  })),
  retentionRates: {
    day1: 78.5,
    day7: 45.2,
    day30: 23.8,
    day90: 12.4
  },
  churnRate: 15.3,
  bounceRate: 8.7
})

const generateMockRevenue = (): RevenueAnalytics => ({
  totalRevenue: 2456789.50,
  revenuePerPlayer: 53.78,
  revenuePerSession: 12.85,
  averageBetSize: 2.45,
  totalBetsPlaced: 1234567,
  totalWinnings: 2198765.30,
  houseEdge: 4.2,
  revenueByGame: [
    { gameId: 1, gameName: 'Starburst', revenue: 345678.90, percentage: 14.1 },
    { gameId: 2, gameName: 'Book of Dead', revenue: 298765.40, percentage: 12.2 },
    { gameId: 3, gameName: 'Gonzo\'s Quest', revenue: 234567.80, percentage: 9.5 },
    { gameId: 4, gameName: 'Sweet Bonanza', revenue: 198765.30, percentage: 8.1 },
    { gameId: 5, gameName: 'Gates of Olympus', revenue: 176543.20, percentage: 7.2 }
  ],
  revenueByProvider: [
    { providerId: 1, providerName: 'NetEnt', revenue: 567890.12, percentage: 23.1 },
    { providerId: 2, providerName: 'Microgaming', revenue: 456789.01, percentage: 18.6 },
    { providerId: 3, providerName: 'Play\'n GO', revenue: 345678.90, percentage: 14.1 },
    { providerId: 4, providerName: 'Pragmatic Play', revenue: 298765.43, percentage: 12.2 }
  ],
  revenueGrowth: {
    daily: 2.3,
    weekly: 8.7,
    monthly: 15.4,
    yearly: 23.8
  },
  topSpenders: [
    { playerId: 1001, playerName: 'Player***1001', totalSpent: 15678.90, averageBet: 45.67, sessionsCount: 234 },
    { playerId: 1002, playerName: 'Player***1002', totalSpent: 12345.67, averageBet: 38.92, sessionsCount: 189 },
    { playerId: 1003, playerName: 'Player***1003', totalSpent: 9876.54, averageBet: 32.15, sessionsCount: 156 }
  ]
})

const generateMockEngagement = (): PlayerEngagement => ({
  dailyActiveUsers: 8765,
  weeklyActiveUsers: 23456,
  monthlyActiveUsers: 34567,
  averagePlayTime: 23.5,
  totalSessions: 123456,
  averageSessionsPerUser: 4.2,
  gameCompletionRate: 67.8,
  featureUsageRates: {
    bonusGames: 45.6,
    autoPlay: 32.1,
    maxBet: 12.8,
    quickSpin: 78.9
  },
  socialEngagement: {
    chatUsage: 23.4,
    friendInvites: 8.7,
    achievements: 56.3
  }
})

const generateMockGamePerformance = (): GamePerformance => ({
  mostPlayedGames: [
    { gameId: 1, gameName: 'Starburst', providerName: 'NetEnt', sessionCount: 45234, uniquePlayers: 15678, averageSessionTime: 18.5, revenue: 345678.90, rtp: 96.1 },
    { gameId: 2, gameName: 'Book of Dead', providerName: 'Play\'n GO', sessionCount: 38901, uniquePlayers: 12345, averageSessionTime: 22.3, revenue: 298765.40, rtp: 94.2 },
    { gameId: 3, gameName: 'Gonzo\'s Quest', providerName: 'NetEnt', sessionCount: 34567, uniquePlayers: 11234, averageSessionTime: 25.7, revenue: 234567.80, rtp: 95.9 }
  ],
  gamesByCategory: [
    { category: 'Video Slots', gameCount: 89, playerCount: 34567, revenue: 1234567.89 },
    { category: 'Live Casino', gameCount: 23, playerCount: 12345, revenue: 567890.12 },
    { category: 'Table Games', gameCount: 15, playerCount: 8901, revenue: 345678.90 }
  ],
  newGamePerformance: [
    { gameId: 101, gameName: 'New Slot Adventure', releaseDate: '2024-01-15', adoptionRate: 23.5, playerFeedback: 4.2 },
    { gameId: 102, gameName: 'Mega Fortune Dreams', releaseDate: '2024-01-10', adoptionRate: 18.7, playerFeedback: 4.5 }
  ],
  underperformingGames: [
    { gameId: 201, gameName: 'Old Classic Slot', issues: ['Low RTP', 'Poor graphics'], recommendations: ['Update graphics', 'Increase bonus frequency'] }
  ]
})

const generateMockRealTime = (): RealTimeMetrics => ({
  currentOnlinePlayers: Math.floor(Math.random() * 2000) + 3000,
  activeGames: Math.floor(Math.random() * 50) + 80,
  currentRevenue: Math.floor(Math.random() * 10000) + 50000,
  recentActivity: Array.from({ length: 10 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
    playerId: Math.floor(Math.random() * 10000) + 1000,
    gameId: Math.floor(Math.random() * 100) + 1,
    action: ['login', 'game_start', 'bet_placed', 'win', 'logout'][Math.floor(Math.random() * 5)] as any,
    amount: Math.random() * 1000
  })),
  systemHealth: {
    serverLoad: Math.random() * 100,
    responseTime: Math.random() * 500 + 100,
    errorRate: Math.random() * 5,
    uptime: 99.8
  }
})

const generateMockTrends = (): TrendAnalysis => {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split('T')[0]
  })

  return {
    playerGrowthTrend: last30Days.map(date => ({
      date,
      newPlayers: Math.floor(Math.random() * 200) + 50,
      totalPlayers: Math.floor(Math.random() * 1000) + 45000,
      activeUsers: Math.floor(Math.random() * 5000) + 8000
    })),
    revenueTrend: last30Days.map(date => ({
      date,
      revenue: Math.floor(Math.random() * 50000) + 80000,
      betsPlaced: Math.floor(Math.random() * 10000) + 40000,
      averageBet: Math.random() * 5 + 2
    })),
    engagementTrend: last30Days.map(date => ({
      date,
      averageSessionTime: Math.random() * 10 + 20,
      sessionsPerUser: Math.random() * 2 + 3,
      retentionRate: Math.random() * 20 + 70
    })),
    seasonalPatterns: [
      { period: 'Weekdays', playerActivity: 75.2, revenue: 234567.89, popularGames: ['Starburst', 'Book of Dead'] },
      { period: 'Weekends', playerActivity: 89.7, revenue: 345678.90, popularGames: ['Live Blackjack', 'Roulette'] },
      { period: 'Holidays', playerActivity: 95.3, revenue: 456789.01, popularGames: ['Mega Moolah', 'Divine Fortune'] }
    ]
  }
}

class AnalyticsService {
  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardData(filters: AnalyticsFilters): Promise<AnalyticsDashboard> {
    if (isDevelopment) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      return {
        period: filters.period,
        lastUpdated: new Date().toISOString(),
        demographics: generateMockDemographics(),
        behavior: generateMockBehavior(),
        revenue: generateMockRevenue(),
        engagement: generateMockEngagement(),
        gamePerformance: generateMockGamePerformance(),
        realTime: generateMockRealTime(),
        trends: generateMockTrends()
      }
    }

    const params = new URLSearchParams({
      period: filters.period,
      ...(filters.customDateRange && {
        startDate: filters.customDateRange.startDate,
        endDate: filters.customDateRange.endDate
      }),
      ...(filters.playerSegment && { segment: filters.playerSegment }),
      ...(filters.gameCategory && { categories: filters.gameCategory.join(',') }),
      ...(filters.provider && { providers: filters.provider.join(',') }),
      ...(filters.country && { countries: filters.country.join(',') }),
      ...(filters.device && filters.device !== 'all' && { device: filters.device }),
      ...(filters.currency && { currency: filters.currency })
    })

    return apiService.get<AnalyticsDashboard>(`/analytics/dashboard?${params}`)
  }

  /**
   * Get real-time metrics (updates frequently)
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return generateMockRealTime()
    }

    return apiService.get<RealTimeMetrics>('/analytics/realtime')
  }

  /**
   * Get key performance indicators
   */
  async getKPIs(period: string): Promise<KPI[]> {
    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      return [
        { id: 'revenue', name: 'Total Revenue', description: 'Total revenue generated', value: 2456789.50, target: 2500000, unit: '$', trend: 'up', trendPercentage: 8.5, category: 'revenue', priority: 'high' },
        { id: 'players', name: 'Active Players', description: 'Monthly active players', value: 34567, target: 35000, unit: 'players', trend: 'up', trendPercentage: 5.2, category: 'engagement', priority: 'high' },
        { id: 'retention', name: 'Player Retention', description: '30-day retention rate', value: 23.8, target: 25.0, unit: '%', trend: 'down', trendPercentage: -2.1, category: 'retention', priority: 'medium' },
        { id: 'acquisition', name: 'New Players', description: 'New player acquisitions', value: 1234, target: 1500, unit: 'players', trend: 'stable', trendPercentage: 0.8, category: 'acquisition', priority: 'medium' }
      ]
    }

    return apiService.get<KPI[]>(`/analytics/kpis?period=${period}`)
  }

  /**
   * Export analytics data
   */
  async exportData(options: AnalyticsExportOptions): Promise<Blob> {
    if (isDevelopment) {
      // Create a mock CSV for demonstration
      const csvContent = `Date,Revenue,Players,Sessions\n${Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return `${date.toISOString().split('T')[0]},${Math.floor(Math.random() * 50000) + 80000},${Math.floor(Math.random() * 5000) + 8000},${Math.floor(Math.random() * 10000) + 40000}`
      }).join('\n')}`
      
      return new Blob([csvContent], { type: 'text/csv' })
    }

    const response = await fetch('/api/analytics/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    })

    return response.blob()
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()

// Export class for testing
export { AnalyticsService }
