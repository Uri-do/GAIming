/**
 * Game Recommendations Types
 * Comprehensive types for ML-powered game recommendation system
 */

// Recommendation algorithms
export type RecommendationAlgorithm = 
  | 'collaborative_filtering'
  | 'content_based'
  | 'hybrid'
  | 'popularity_based'
  | 'trending'
  | 'new_releases'
  | 'similar_players'
  | 'seasonal'
  | 'time_based'
  | 'ml_ensemble'

// Player preferences and behavior
export interface PlayerProfile {
  playerId: number
  preferences: {
    favoriteCategories: string[]
    favoriteProviders: string[]
    preferredVolatility: string[]
    preferredThemes: string[]
    preferredRTPRange: { min: number; max: number }
    preferredBetRange: { min: number; max: number }
    devicePreference: 'mobile' | 'desktop' | 'both'
    sessionTimePreference: 'short' | 'medium' | 'long'
  }
  behavior: {
    totalSessions: number
    totalPlayTime: number
    averageSessionDuration: number
    averageBetSize: number
    favoritePlayingTimes: number[] // hours of day
    weekdayVsWeekend: { weekday: number; weekend: number }
    gameCompletionRate: number
    bonusFeatureUsage: number
    socialEngagement: number
  }
  demographics: {
    ageGroup: string
    country: string
    registrationDate: string
    vipLevel: string
    totalDeposits: number
    lifetimeValue: number
  }
  recentActivity: {
    lastLoginDate: string
    recentGames: number[]
    recentSessions: Array<{
      gameId: number
      duration: number
      betAmount: number
      outcome: 'win' | 'loss'
      enjoymentScore: number
    }>
  }
}

// Game recommendation with scoring
export interface GameRecommendation {
  gameId: number
  gameName: string
  providerName: string
  gameTypeName: string
  imageUrl?: string
  score: number // 0-100 confidence score
  reasons: RecommendationReason[]
  algorithm: RecommendationAlgorithm
  category: RecommendationCategory
  metadata: {
    expectedPlayTime: number
    expectedEngagement: number
    expectedRevenue: number
    riskLevel: 'low' | 'medium' | 'high'
    noveltyScore: number // how new/different this is for the player
  }
  personalizedFeatures: {
    recommendedBetSize: number
    expectedWinRate: number
    similarityToFavorites: number
    trendingScore: number
  }
}

// Recommendation reasons
export interface RecommendationReason {
  type: 'preference' | 'behavior' | 'similarity' | 'trending' | 'seasonal' | 'social'
  description: string
  confidence: number
  weight: number
}

// Recommendation categories
export type RecommendationCategory = 
  | 'for_you'           // Personalized recommendations
  | 'trending'          // Currently popular games
  | 'new_releases'      // Recently added games
  | 'similar_to_played' // Based on recent activity
  | 'high_rtp'          // High return to player
  | 'jackpot'           // Progressive jackpots
  | 'quick_play'        // Short session games
  | 'immersive'         // Long session games
  | 'social'            // Multiplayer/social games
  | 'seasonal'          // Holiday/seasonal themes

// Recommendation request
export interface RecommendationRequest {
  playerId: number
  categories?: RecommendationCategory[]
  algorithms?: RecommendationAlgorithm[]
  limit?: number
  excludeRecentlyPlayed?: boolean
  includeReasons?: boolean
  contextualFactors?: {
    timeOfDay?: number
    dayOfWeek?: number
    sessionType?: 'quick' | 'extended'
    deviceType?: 'mobile' | 'desktop'
    mood?: 'casual' | 'competitive' | 'exploratory'
  }
  filters?: {
    minRTP?: number
    maxRTP?: number
    minBetAmount?: number
    maxBetAmount?: number
    providers?: string[]
    categories?: string[]
    volatility?: string[]
    excludeGames?: number[]
  }
}

// Recommendation response
export interface RecommendationResponse {
  playerId: number
  requestId: string
  timestamp: string
  totalRecommendations: number
  categories: Array<{
    category: RecommendationCategory
    title: string
    description: string
    recommendations: GameRecommendation[]
    algorithm: RecommendationAlgorithm
    refreshRate: number // minutes
  }>
  metadata: {
    processingTime: number
    algorithmsUsed: RecommendationAlgorithm[]
    dataFreshness: string
    modelVersion: string
    abTestVariant?: string
  }
}

// ML Model information
export interface RecommendationModel {
  modelId: string
  name: string
  algorithm: RecommendationAlgorithm
  version: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  trainingDate: string
  lastUpdated: string
  status: 'active' | 'training' | 'deprecated'
  hyperparameters: Record<string, any>
  features: string[]
  performance: {
    clickThroughRate: number
    conversionRate: number
    engagementLift: number
    revenueImpact: number
  }
}

// A/B Testing for recommendations
export interface RecommendationABTest {
  testId: string
  name: string
  description: string
  status: 'draft' | 'running' | 'completed' | 'paused'
  startDate: string
  endDate?: string
  variants: Array<{
    variantId: string
    name: string
    algorithm: RecommendationAlgorithm
    parameters: Record<string, any>
    trafficPercentage: number
    performance: {
      impressions: number
      clicks: number
      conversions: number
      revenue: number
      engagementTime: number
    }
  }>
  targetMetrics: string[]
  significance: number
  winner?: string
}

// Recommendation analytics
export interface RecommendationAnalytics {
  period: string
  totalRecommendations: number
  uniqueUsers: number
  clickThroughRate: number
  conversionRate: number
  averageEngagementTime: number
  revenueGenerated: number
  topPerformingAlgorithms: Array<{
    algorithm: RecommendationAlgorithm
    performance: number
    usage: number
  }>
  categoryPerformance: Array<{
    category: RecommendationCategory
    impressions: number
    clicks: number
    conversions: number
    revenue: number
  }>
  playerSegmentPerformance: Array<{
    segment: string
    effectiveness: number
    engagement: number
  }>
}

// Real-time recommendation events
export interface RecommendationEvent {
  eventId: string
  playerId: number
  gameId: number
  eventType: 'impression' | 'click' | 'play' | 'like' | 'dislike' | 'share'
  timestamp: string
  context: {
    category: RecommendationCategory
    algorithm: RecommendationAlgorithm
    position: number
    score: number
    sessionId: string
    deviceType: string
  }
  outcome?: {
    playDuration: number
    betAmount: number
    winAmount: number
    enjoymentRating: number
  }
}

// Recommendation feedback
export interface RecommendationFeedback {
  feedbackId: string
  playerId: number
  gameId: number
  recommendationId: string
  rating: number // 1-5 stars
  feedback: 'love_it' | 'like_it' | 'neutral' | 'dislike_it' | 'hate_it'
  reasons?: string[]
  comment?: string
  timestamp: string
}

// Recommendation settings
export interface RecommendationSettings {
  playerId: number
  enabled: boolean
  preferences: {
    maxRecommendationsPerCategory: number
    refreshFrequency: number // minutes
    enablePushNotifications: boolean
    enableEmailRecommendations: boolean
    privacyLevel: 'full' | 'limited' | 'minimal'
  }
  algorithms: {
    collaborative: { enabled: boolean; weight: number }
    contentBased: { enabled: boolean; weight: number }
    trending: { enabled: boolean; weight: number }
    social: { enabled: boolean; weight: number }
  }
  filters: {
    excludeCategories: string[]
    excludeProviders: string[]
    minRTP: number
    maxVolatility: string
    onlyNewGames: boolean
    respectPlayingHistory: boolean
  }
}

// Recommendation dashboard data
export interface RecommendationDashboard {
  overview: {
    totalActiveUsers: number
    recommendationsServed: number
    clickThroughRate: number
    conversionRate: number
    revenueImpact: number
  }
  algorithms: Array<{
    algorithm: RecommendationAlgorithm
    usage: number
    performance: number
    accuracy: number
  }>
  categories: Array<{
    category: RecommendationCategory
    popularity: number
    effectiveness: number
    revenue: number
  }>
  trends: {
    daily: Array<{ date: string; recommendations: number; clicks: number; conversions: number }>
    hourly: Array<{ hour: number; activity: number }>
  }
  topGames: Array<{
    gameId: number
    gameName: string
    recommendationCount: number
    clickRate: number
    conversionRate: number
    revenue: number
  }>
}

// Export all types
export type {
  PlayerProfile,
  GameRecommendation,
  RecommendationReason,
  RecommendationRequest,
  RecommendationResponse,
  RecommendationModel,
  RecommendationABTest,
  RecommendationAnalytics,
  RecommendationEvent,
  RecommendationFeedback,
  RecommendationSettings,
  RecommendationDashboard
}
