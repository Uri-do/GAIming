/**
 * Game Recommendation Service
 * ML-powered recommendation engine with multiple algorithms
 */

import { apiService } from '@/shared/services/api'
import { mockGames } from '@/shared/services/mockDataService'
import type {
  RecommendationRequest,
  RecommendationResponse,
  GameRecommendation,
  PlayerProfile,
  RecommendationAnalytics,
  RecommendationModel,
  RecommendationFeedback,
  RecommendationSettings,
  RecommendationDashboard,
  RecommendationCategory,
  RecommendationAlgorithm
} from '../types'

// Development mode check
const isDevelopment = process.env.NODE_ENV === 'development'

// Mock player profiles for development
const generateMockPlayerProfile = (playerId: number): PlayerProfile => ({
  playerId,
  preferences: {
    favoriteCategories: ['Video Slots', 'Live Casino'].slice(0, Math.floor(Math.random() * 2) + 1),
    favoriteProviders: ['NetEnt', 'Microgaming', 'Play\'n GO'].slice(0, Math.floor(Math.random() * 2) + 1),
    preferredVolatility: ['Medium', 'High'].slice(0, Math.floor(Math.random() * 2) + 1),
    preferredThemes: ['Adventure', 'Ancient Egypt', 'Fantasy'].slice(0, Math.floor(Math.random() * 2) + 1),
    preferredRTPRange: { min: 94, max: 98 },
    preferredBetRange: { min: 0.1, max: 10 },
    devicePreference: Math.random() > 0.5 ? 'mobile' : 'desktop',
    sessionTimePreference: ['short', 'medium', 'long'][Math.floor(Math.random() * 3)] as any
  },
  behavior: {
    totalSessions: Math.floor(Math.random() * 500) + 50,
    totalPlayTime: Math.floor(Math.random() * 10000) + 1000,
    averageSessionDuration: Math.floor(Math.random() * 30) + 15,
    averageBetSize: Math.random() * 5 + 1,
    favoritePlayingTimes: [18, 19, 20, 21, 22],
    weekdayVsWeekend: { weekday: 60, weekend: 40 },
    gameCompletionRate: Math.random() * 40 + 60,
    bonusFeatureUsage: Math.random() * 50 + 30,
    socialEngagement: Math.random() * 30 + 10
  },
  demographics: {
    ageGroup: ['18-25', '26-35', '36-45', '46-55', '55+'][Math.floor(Math.random() * 5)],
    country: ['US', 'UK', 'DE', 'CA', 'AU'][Math.floor(Math.random() * 5)],
    registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    vipLevel: ['Bronze', 'Silver', 'Gold', 'Platinum'][Math.floor(Math.random() * 4)],
    totalDeposits: Math.floor(Math.random() * 10000) + 500,
    lifetimeValue: Math.floor(Math.random() * 5000) + 200
  },
  recentActivity: {
    lastLoginDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    recentGames: Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1),
    recentSessions: Array.from({ length: 3 }, () => ({
      gameId: Math.floor(Math.random() * 50) + 1,
      duration: Math.floor(Math.random() * 60) + 10,
      betAmount: Math.random() * 10 + 1,
      outcome: Math.random() > 0.5 ? 'win' : 'loss' as any,
      enjoymentScore: Math.random() * 3 + 3
    }))
  }
})

// Mock recommendation algorithms
class RecommendationAlgorithms {
  /**
   * Collaborative Filtering - based on similar players
   */
  static collaborativeFiltering(playerProfile: PlayerProfile, allGames: any[]): GameRecommendation[] {
    return allGames
      .filter(game => !playerProfile.recentActivity.recentGames.includes(game.gameId))
      .slice(0, 10)
      .map(game => ({
        gameId: game.gameId,
        gameName: game.gameName,
        providerName: game.providerName,
        gameTypeName: game.gameTypeName,
        imageUrl: game.imageUrl,
        score: Math.random() * 30 + 70, // 70-100
        reasons: [
          {
            type: 'similarity',
            description: 'Players with similar preferences enjoyed this game',
            confidence: 0.85,
            weight: 0.6
          }
        ],
        algorithm: 'collaborative_filtering' as RecommendationAlgorithm,
        category: 'for_you' as RecommendationCategory,
        metadata: {
          expectedPlayTime: Math.floor(Math.random() * 30) + 15,
          expectedEngagement: Math.random() * 0.3 + 0.7,
          expectedRevenue: Math.random() * 50 + 20,
          riskLevel: 'medium' as any,
          noveltyScore: Math.random() * 0.5 + 0.3
        },
        personalizedFeatures: {
          recommendedBetSize: playerProfile.behavior.averageBetSize * (0.8 + Math.random() * 0.4),
          expectedWinRate: Math.random() * 0.2 + 0.4,
          similarityToFavorites: Math.random() * 0.4 + 0.6,
          trendingScore: Math.random() * 0.3 + 0.4
        }
      }))
  }

  /**
   * Content-Based Filtering - based on game features
   */
  static contentBased(playerProfile: PlayerProfile, allGames: any[]): GameRecommendation[] {
    return allGames
      .filter(game => {
        // Filter by preferences
        const matchesCategory = playerProfile.preferences.favoriteCategories.includes(game.gameTypeName)
        const matchesProvider = playerProfile.preferences.favoriteProviders.includes(game.providerName)
        const matchesRTP = game.rtpPercentage >= playerProfile.preferences.preferredRTPRange.min
        
        return (matchesCategory || matchesProvider || matchesRTP) && 
               !playerProfile.recentActivity.recentGames.includes(game.gameId)
      })
      .slice(0, 8)
      .map(game => ({
        gameId: game.gameId,
        gameName: game.gameName,
        providerName: game.providerName,
        gameTypeName: game.gameTypeName,
        imageUrl: game.imageUrl,
        score: Math.random() * 25 + 75, // 75-100
        reasons: [
          {
            type: 'preference',
            description: 'Matches your favorite game categories and providers',
            confidence: 0.9,
            weight: 0.8
          }
        ],
        algorithm: 'content_based' as RecommendationAlgorithm,
        category: 'for_you' as RecommendationCategory,
        metadata: {
          expectedPlayTime: Math.floor(Math.random() * 25) + 20,
          expectedEngagement: Math.random() * 0.2 + 0.8,
          expectedRevenue: Math.random() * 40 + 30,
          riskLevel: 'low' as any,
          noveltyScore: Math.random() * 0.3 + 0.2
        },
        personalizedFeatures: {
          recommendedBetSize: playerProfile.behavior.averageBetSize,
          expectedWinRate: Math.random() * 0.15 + 0.45,
          similarityToFavorites: Math.random() * 0.2 + 0.8,
          trendingScore: Math.random() * 0.4 + 0.3
        }
      }))
  }

  /**
   * Trending Games - currently popular
   */
  static trending(allGames: any[]): GameRecommendation[] {
    return allGames
      .sort(() => Math.random() - 0.5) // Random shuffle for demo
      .slice(0, 6)
      .map(game => ({
        gameId: game.gameId,
        gameName: game.gameName,
        providerName: game.providerName,
        gameTypeName: game.gameTypeName,
        imageUrl: game.imageUrl,
        score: Math.random() * 20 + 80, // 80-100
        reasons: [
          {
            type: 'trending',
            description: 'Currently trending among all players',
            confidence: 0.95,
            weight: 0.7
          }
        ],
        algorithm: 'trending' as RecommendationAlgorithm,
        category: 'trending' as RecommendationCategory,
        metadata: {
          expectedPlayTime: Math.floor(Math.random() * 20) + 15,
          expectedEngagement: Math.random() * 0.3 + 0.6,
          expectedRevenue: Math.random() * 60 + 25,
          riskLevel: 'medium' as any,
          noveltyScore: Math.random() * 0.6 + 0.4
        },
        personalizedFeatures: {
          recommendedBetSize: Math.random() * 3 + 1,
          expectedWinRate: Math.random() * 0.2 + 0.4,
          similarityToFavorites: Math.random() * 0.5 + 0.3,
          trendingScore: Math.random() * 0.3 + 0.7
        }
      }))
  }

  /**
   * New Releases - recently added games
   */
  static newReleases(allGames: any[]): GameRecommendation[] {
    return allGames
      .filter(game => {
        const releaseDate = new Date(game.releaseDate || game.createdDate)
        const daysSinceRelease = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceRelease <= 30 // Last 30 days
      })
      .slice(0, 5)
      .map(game => ({
        gameId: game.gameId,
        gameName: game.gameName,
        providerName: game.providerName,
        gameTypeName: game.gameTypeName,
        imageUrl: game.imageUrl,
        score: Math.random() * 25 + 65, // 65-90
        reasons: [
          {
            type: 'trending',
            description: 'New release - be among the first to try it!',
            confidence: 0.8,
            weight: 0.5
          }
        ],
        algorithm: 'new_releases' as RecommendationAlgorithm,
        category: 'new_releases' as RecommendationCategory,
        metadata: {
          expectedPlayTime: Math.floor(Math.random() * 35) + 10,
          expectedEngagement: Math.random() * 0.4 + 0.5,
          expectedRevenue: Math.random() * 45 + 15,
          riskLevel: 'high' as any,
          noveltyScore: Math.random() * 0.3 + 0.7
        },
        personalizedFeatures: {
          recommendedBetSize: Math.random() * 4 + 0.5,
          expectedWinRate: Math.random() * 0.25 + 0.35,
          similarityToFavorites: Math.random() * 0.6 + 0.2,
          trendingScore: Math.random() * 0.4 + 0.6
        }
      }))
  }
}

class RecommendationService {
  /**
   * Get personalized game recommendations
   */
  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    if (isDevelopment) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const playerProfile = generateMockPlayerProfile(request.playerId)
      const allGames = mockGames.slice(0, 50) // Use subset for performance
      
      const categories = [
        {
          category: 'for_you' as RecommendationCategory,
          title: 'Recommended for You',
          description: 'Personalized picks based on your playing style',
          recommendations: [
            ...RecommendationAlgorithms.collaborativeFiltering(playerProfile, allGames).slice(0, 4),
            ...RecommendationAlgorithms.contentBased(playerProfile, allGames).slice(0, 4)
          ].slice(0, 6),
          algorithm: 'hybrid' as RecommendationAlgorithm,
          refreshRate: 60
        },
        {
          category: 'trending' as RecommendationCategory,
          title: 'Trending Now',
          description: 'Popular games among all players',
          recommendations: RecommendationAlgorithms.trending(allGames),
          algorithm: 'trending' as RecommendationAlgorithm,
          refreshRate: 30
        },
        {
          category: 'new_releases' as RecommendationCategory,
          title: 'New Releases',
          description: 'Latest games added to our collection',
          recommendations: RecommendationAlgorithms.newReleases(allGames),
          algorithm: 'new_releases' as RecommendationAlgorithm,
          refreshRate: 1440 // Daily
        }
      ]

      return {
        playerId: request.playerId,
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        totalRecommendations: categories.reduce((sum, cat) => sum + cat.recommendations.length, 0),
        categories,
        metadata: {
          processingTime: Math.random() * 200 + 100,
          algorithmsUsed: ['collaborative_filtering', 'content_based', 'trending', 'new_releases'],
          dataFreshness: new Date().toISOString(),
          modelVersion: 'v2.1.0',
          abTestVariant: 'control'
        }
      }
    }

    // Production API call
    return apiService.post<RecommendationResponse>('/recommendations', request)
  }

  /**
   * Get recommendation analytics
   */
  async getAnalytics(period: string): Promise<RecommendationAnalytics> {
    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      return {
        period,
        totalRecommendations: Math.floor(Math.random() * 100000) + 50000,
        uniqueUsers: Math.floor(Math.random() * 10000) + 5000,
        clickThroughRate: Math.random() * 0.1 + 0.15, // 15-25%
        conversionRate: Math.random() * 0.05 + 0.08, // 8-13%
        averageEngagementTime: Math.random() * 10 + 15, // 15-25 minutes
        revenueGenerated: Math.floor(Math.random() * 500000) + 200000,
        topPerformingAlgorithms: [
          { algorithm: 'hybrid', performance: 0.92, usage: 0.45 },
          { algorithm: 'collaborative_filtering', performance: 0.88, usage: 0.25 },
          { algorithm: 'content_based', performance: 0.85, usage: 0.20 },
          { algorithm: 'trending', performance: 0.78, usage: 0.10 }
        ],
        categoryPerformance: [
          { category: 'for_you', impressions: 45000, clicks: 9000, conversions: 1350, revenue: 67500 },
          { category: 'trending', impressions: 30000, clicks: 7500, conversions: 1125, revenue: 56250 },
          { category: 'new_releases', impressions: 15000, clicks: 3000, conversions: 450, revenue: 22500 }
        ],
        playerSegmentPerformance: [
          { segment: 'High Value', effectiveness: 0.95, engagement: 0.88 },
          { segment: 'Regular', effectiveness: 0.82, engagement: 0.75 },
          { segment: 'New Players', effectiveness: 0.68, engagement: 0.65 }
        ]
      }
    }

    return apiService.get<RecommendationAnalytics>(`/recommendations/analytics?period=${period}`)
  }

  /**
   * Submit recommendation feedback
   */
  async submitFeedback(feedback: Omit<RecommendationFeedback, 'feedbackId' | 'timestamp'>): Promise<void> {
    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 200))
      console.log('Recommendation feedback submitted:', feedback)
      return
    }

    return apiService.post('/recommendations/feedback', feedback)
  }

  /**
   * Get recommendation dashboard data
   */
  async getDashboard(): Promise<RecommendationDashboard> {
    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      return {
        overview: {
          totalActiveUsers: Math.floor(Math.random() * 50000) + 25000,
          recommendationsServed: Math.floor(Math.random() * 1000000) + 500000,
          clickThroughRate: Math.random() * 0.1 + 0.15,
          conversionRate: Math.random() * 0.05 + 0.08,
          revenueImpact: Math.floor(Math.random() * 2000000) + 1000000
        },
        algorithms: [
          { algorithm: 'hybrid', usage: 45, performance: 92, accuracy: 88 },
          { algorithm: 'collaborative_filtering', usage: 25, performance: 88, accuracy: 85 },
          { algorithm: 'content_based', usage: 20, performance: 85, accuracy: 82 },
          { algorithm: 'trending', usage: 10, performance: 78, accuracy: 75 }
        ],
        categories: [
          { category: 'for_you', popularity: 45, effectiveness: 92, revenue: 450000 },
          { category: 'trending', popularity: 30, effectiveness: 85, revenue: 300000 },
          { category: 'new_releases', popularity: 15, effectiveness: 75, revenue: 150000 },
          { category: 'similar_to_played', popularity: 10, effectiveness: 88, revenue: 100000 }
        ],
        trends: {
          daily: Array.from({ length: 30 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (29 - i))
            return {
              date: date.toISOString().split('T')[0],
              recommendations: Math.floor(Math.random() * 10000) + 15000,
              clicks: Math.floor(Math.random() * 2000) + 3000,
              conversions: Math.floor(Math.random() * 300) + 400
            }
          }),
          hourly: Array.from({ length: 24 }, (_, hour) => ({
            hour,
            activity: Math.floor(Math.random() * 1000) + 500 + (hour >= 18 && hour <= 23 ? 500 : 0)
          }))
        },
        topGames: mockGames.slice(0, 10).map(game => ({
          gameId: game.gameId,
          gameName: game.gameName,
          recommendationCount: Math.floor(Math.random() * 5000) + 1000,
          clickRate: Math.random() * 0.15 + 0.10,
          conversionRate: Math.random() * 0.08 + 0.05,
          revenue: Math.floor(Math.random() * 50000) + 10000
        }))
      }
    }

    return apiService.get<RecommendationDashboard>('/recommendations/dashboard')
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService()

// Export class for testing
export { RecommendationService }
