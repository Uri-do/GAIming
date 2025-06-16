/**
 * Game Recommendations Page
 * ML-powered personalized game recommendations
 */

import React, { useState, useEffect } from 'react'
import { RefreshCw, Settings, Heart, TrendingUp, Sparkles, Clock, Filter } from 'lucide-react'
import { recommendationService } from '@/features/recommendations/services/recommendationService'
import type { RecommendationResponse, RecommendationRequest } from '@/features/recommendations/types'
import { FeatureErrorBoundary } from '@/shared/components'
import { useNotificationStore } from '@/app/store/notificationStore'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GameRecommendationCard from '@/features/recommendations/components/GameRecommendationCard'

const GameRecommendations: React.FC = () => {
  // State management
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Mock player ID - in real app this would come from auth
  const playerId = 1001

  const notifications = useNotificationStore()

  // Load recommendations on mount
  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const request: RecommendationRequest = {
        playerId,
        limit: 50,
        includeReasons: true,
        contextualFactors: {
          timeOfDay: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
        }
      }
      
      const response = await recommendationService.getRecommendations(request)
      setRecommendations(response)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
      setError('Failed to load recommendations')
      notifications.showError('Error', 'Failed to load game recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadRecommendations()
      notifications.showSuccess('Success', 'Recommendations refreshed')
    } catch (error) {
      notifications.showError('Error', 'Failed to refresh recommendations')
    } finally {
      setRefreshing(false)
    }
  }

  const handleGamePlay = (gameId: number) => {
    // In a real app, this would navigate to the game or open game modal
    notifications.showInfo('Game Launch', `Launching game ${gameId}...`)
  }

  const handleGameLike = async (gameId: number) => {
    try {
      await recommendationService.submitFeedback({
        playerId,
        gameId,
        recommendationId: `rec_${gameId}_${Date.now()}`,
        rating: 5,
        feedback: 'love_it'
      })
      notifications.showSuccess('Thanks!', 'Your feedback helps improve recommendations')
    } catch (error) {
      notifications.showError('Error', 'Failed to submit feedback')
    }
  }

  const handleGameDislike = async (gameId: number) => {
    try {
      await recommendationService.submitFeedback({
        playerId,
        gameId,
        recommendationId: `rec_${gameId}_${Date.now()}`,
        rating: 2,
        feedback: 'dislike_it'
      })
      notifications.showSuccess('Thanks!', 'We\'ll improve your recommendations')
    } catch (error) {
      notifications.showError('Error', 'Failed to submit feedback')
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      for_you: Sparkles,
      trending: TrendingUp,
      new_releases: Clock,
      similar_to_played: Heart,
      high_rtp: TrendingUp,
      jackpot: TrendingUp
    }
    return icons[category as keyof typeof icons] || Sparkles
  }

  const getFilteredRecommendations = () => {
    if (!recommendations) return []
    
    if (selectedCategory === 'all') {
      return recommendations.categories
    }
    
    return recommendations.categories.filter(cat => cat.category === selectedCategory)
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

  if (error || !recommendations) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Recommendations</h1>
          <p className="text-gray-600 mb-4">{error || 'Recommendations could not be loaded.'}</p>
          <Button onClick={loadRecommendations} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FeatureErrorBoundary featureName="Game Recommendations">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Game Recommendations
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Personalized game suggestions powered by AI
            </p>
            <p className="text-sm text-gray-500">
              {recommendations.totalRecommendations} games recommended • Updated {new Date(recommendations.timestamp).toLocaleTimeString()}
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
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {recommendations.categories.map((category) => (
                    <option key={category.category} value={category.category}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View:</span>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation Categories */}
        {getFilteredRecommendations().map((category) => {
          const IconComponent = getCategoryIcon(category.category)
          
          return (
            <div key={category.category} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-6 h-6 text-blue-500" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {category.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description} • {category.recommendations.length} games
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Updates every {category.refreshRate} min
                </div>
              </div>

              {/* Games Grid/List */}
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-2'
              }>
                {category.recommendations.map((recommendation) => (
                  <GameRecommendationCard
                    key={recommendation.gameId}
                    recommendation={recommendation}
                    onPlay={handleGamePlay}
                    onLike={handleGameLike}
                    onDislike={handleGameDislike}
                    compact={viewMode === 'list'}
                    showReasons={viewMode === 'grid'}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* Recommendation Metadata */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Recommendation Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Processing Time:</span>
                <div className="font-medium">{recommendations.metadata.processingTime.toFixed(0)}ms</div>
              </div>
              <div>
                <span className="text-gray-600">Model Version:</span>
                <div className="font-medium">{recommendations.metadata.modelVersion}</div>
              </div>
              <div>
                <span className="text-gray-600">Algorithms Used:</span>
                <div className="font-medium">{recommendations.metadata.algorithmsUsed.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Data Freshness:</span>
                <div className="font-medium">
                  {new Date(recommendations.metadata.dataFreshness).toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              Algorithms: {recommendations.metadata.algorithmsUsed.join(', ')}
              {recommendations.metadata.abTestVariant && (
                <span> • A/B Test: {recommendations.metadata.abTestVariant}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {getFilteredRecommendations().length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recommendations found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or refresh the recommendations.
            </p>
            <Button onClick={handleRefresh} variant="primary">
              Refresh Recommendations
            </Button>
          </div>
        )}
      </div>
    </FeatureErrorBoundary>
  )
}

export default GameRecommendations
