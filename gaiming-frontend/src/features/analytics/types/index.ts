/**
 * Player Analytics Types
 * Comprehensive types for casino player analytics and insights
 */

// Time periods for analytics
export type AnalyticsPeriod = 
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'last90days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear'
  | 'custom'

// Player demographics
export interface PlayerDemographics {
  totalPlayers: number
  newPlayers: number
  returningPlayers: number
  activePlayersToday: number
  activePlayersWeek: number
  activePlayersMonth: number
  averageAge: number
  genderDistribution: {
    male: number
    female: number
    other: number
    notSpecified: number
  }
  geographicDistribution: Array<{
    country: string
    playerCount: number
    percentage: number
  }>
  deviceDistribution: {
    mobile: number
    desktop: number
    tablet: number
  }
}

// Player behavior metrics
export interface PlayerBehavior {
  averageSessionDuration: number // minutes
  sessionsPerPlayer: number
  averageGamesPerSession: number
  mostPopularGames: Array<{
    gameId: number
    gameName: string
    playerCount: number
    sessionCount: number
  }>
  peakPlayingHours: Array<{
    hour: number
    playerCount: number
  }>
  retentionRates: {
    day1: number
    day7: number
    day30: number
    day90: number
  }
  churnRate: number
  bounceRate: number
}

// Revenue analytics
export interface RevenueAnalytics {
  totalRevenue: number
  revenuePerPlayer: number
  revenuePerSession: number
  averageBetSize: number
  totalBetsPlaced: number
  totalWinnings: number
  houseEdge: number
  revenueByGame: Array<{
    gameId: number
    gameName: string
    revenue: number
    percentage: number
  }>
  revenueByProvider: Array<{
    providerId: number
    providerName: string
    revenue: number
    percentage: number
  }>
  revenueGrowth: {
    daily: number
    weekly: number
    monthly: number
    yearly: number
  }
  topSpenders: Array<{
    playerId: number
    playerName: string
    totalSpent: number
    averageBet: number
    sessionsCount: number
  }>
}

// Player engagement metrics
export interface PlayerEngagement {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  averagePlayTime: number
  totalSessions: number
  averageSessionsPerUser: number
  gameCompletionRate: number
  featureUsageRates: {
    bonusGames: number
    autoPlay: number
    maxBet: number
    quickSpin: number
  }
  socialEngagement: {
    chatUsage: number
    friendInvites: number
    achievements: number
  }
}

// Game performance analytics
export interface GamePerformance {
  mostPlayedGames: Array<{
    gameId: number
    gameName: string
    providerName: string
    sessionCount: number
    uniquePlayers: number
    averageSessionTime: number
    revenue: number
    rtp: number
  }>
  gamesByCategory: Array<{
    category: string
    gameCount: number
    playerCount: number
    revenue: number
  }>
  newGamePerformance: Array<{
    gameId: number
    gameName: string
    releaseDate: string
    adoptionRate: number
    playerFeedback: number
  }>
  underperformingGames: Array<{
    gameId: number
    gameName: string
    issues: string[]
    recommendations: string[]
  }>
}

// Real-time metrics
export interface RealTimeMetrics {
  currentOnlinePlayers: number
  activeGames: number
  currentRevenue: number
  recentActivity: Array<{
    timestamp: string
    playerId: number
    gameId: number
    action: 'login' | 'game_start' | 'bet_placed' | 'win' | 'logout'
    amount?: number
  }>
  systemHealth: {
    serverLoad: number
    responseTime: number
    errorRate: number
    uptime: number
  }
}

// Trend analysis
export interface TrendAnalysis {
  playerGrowthTrend: Array<{
    date: string
    newPlayers: number
    totalPlayers: number
    activeUsers: number
  }>
  revenueTrend: Array<{
    date: string
    revenue: number
    betsPlaced: number
    averageBet: number
  }>
  engagementTrend: Array<{
    date: string
    averageSessionTime: number
    sessionsPerUser: number
    retentionRate: number
  }>
  seasonalPatterns: Array<{
    period: string
    playerActivity: number
    revenue: number
    popularGames: string[]
  }>
}

// Comprehensive analytics dashboard data
export interface AnalyticsDashboard {
  period: AnalyticsPeriod
  lastUpdated: string
  demographics: PlayerDemographics
  behavior: PlayerBehavior
  revenue: RevenueAnalytics
  engagement: PlayerEngagement
  gamePerformance: GamePerformance
  realTime: RealTimeMetrics
  trends: TrendAnalysis
}

// Analytics filters
export interface AnalyticsFilters {
  period: AnalyticsPeriod
  customDateRange?: {
    startDate: string
    endDate: string
  }
  playerSegment?: 'all' | 'new' | 'returning' | 'vip' | 'casual'
  gameCategory?: string[]
  provider?: string[]
  country?: string[]
  device?: 'all' | 'mobile' | 'desktop' | 'tablet'
  currency?: string
}

// Chart data interfaces
export interface ChartDataPoint {
  label: string
  value: number
  percentage?: number
  color?: string
}

export interface TimeSeriesDataPoint {
  timestamp: string
  value: number
  label?: string
}

export interface MultiSeriesDataPoint {
  timestamp: string
  [key: string]: string | number
}

// Analytics export options
export interface AnalyticsExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json'
  sections: Array<'demographics' | 'behavior' | 'revenue' | 'engagement' | 'games'>
  period: AnalyticsPeriod
  includeCharts: boolean
  includeRawData: boolean
}

// Alert and notification types
export interface AnalyticsAlert {
  id: string
  type: 'warning' | 'critical' | 'info'
  title: string
  message: string
  metric: string
  threshold: number
  currentValue: number
  timestamp: string
  acknowledged: boolean
}

// KPI (Key Performance Indicator) definitions
export interface KPI {
  id: string
  name: string
  description: string
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  category: 'revenue' | 'engagement' | 'retention' | 'acquisition'
  priority: 'high' | 'medium' | 'low'
}

// Cohort analysis
export interface CohortAnalysis {
  cohortPeriod: 'daily' | 'weekly' | 'monthly'
  cohorts: Array<{
    cohortDate: string
    cohortSize: number
    retentionRates: number[] // retention for each period
  }>
  averageRetention: number[]
  cohortRevenue: Array<{
    cohortDate: string
    revenueByPeriod: number[]
  }>
}

// A/B testing results
export interface ABTestResult {
  testId: string
  testName: string
  startDate: string
  endDate: string
  status: 'running' | 'completed' | 'paused'
  variants: Array<{
    name: string
    playerCount: number
    conversionRate: number
    revenue: number
    significance: number
  }>
  winner?: string
  confidence: number
}
