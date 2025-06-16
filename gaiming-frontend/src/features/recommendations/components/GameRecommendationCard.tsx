/**
 * Game Recommendation Card Component
 * Displays individual game recommendations with scoring and reasons
 */

import React, { useState } from 'react'
import { Star, Heart, Play, Info, TrendingUp, Users, Clock, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { GameRecommendation } from '../types'

interface GameRecommendationCardProps {
  recommendation: GameRecommendation
  onPlay?: (gameId: number) => void
  onLike?: (gameId: number) => void
  onDislike?: (gameId: number) => void
  onViewDetails?: (gameId: number) => void
  showReasons?: boolean
  compact?: boolean
}

const GameRecommendationCard: React.FC<GameRecommendationCardProps> = ({
  recommendation,
  onPlay,
  onLike,
  onDislike,
  onViewDetails,
  showReasons = true,
  compact = false
}) => {
  const [isLiked, setIsLiked] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    if (onLike) {
      onLike(recommendation.gameId)
    }
  }

  const handlePlay = () => {
    if (onPlay) {
      onPlay(recommendation.gameId)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getAlgorithmBadge = (algorithm: string) => {
    const badges = {
      collaborative_filtering: { label: 'Similar Players', variant: 'secondary' as const },
      content_based: { label: 'Your Taste', variant: 'success' as const },
      hybrid: { label: 'AI Powered', variant: 'default' as const },
      trending: { label: 'Trending', variant: 'warning' as const },
      new_releases: { label: 'New', variant: 'error' as const }
    }
    
    const badge = badges[algorithm as keyof typeof badges] || { label: 'Recommended', variant: 'default' as const }
    return <Badge variant={badge.variant}>{badge.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  if (compact) {
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            {recommendation.imageUrl && (
              <img
                src={recommendation.imageUrl}
                alt={recommendation.gameName}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-white truncate">
                {recommendation.gameName}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {recommendation.providerName}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(recommendation.score)}`}>
                {recommendation.score.toFixed(0)}%
              </div>
              <Button size="sm" variant="primary" onClick={handlePlay}>
                <Play className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Game Image */}
        <div className="relative">
          {recommendation.imageUrl ? (
            <img
              src={recommendation.imageUrl}
              alt={recommendation.gameName}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Score Badge */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-sm font-bold ${getScoreColor(recommendation.score)}`}>
            {recommendation.score.toFixed(0)}%
          </div>
          
          {/* Algorithm Badge */}
          <div className="absolute top-2 left-2">
            {getAlgorithmBadge(recommendation.algorithm)}
          </div>
        </div>

        {/* Game Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {recommendation.gameName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {recommendation.providerName} • {recommendation.gameTypeName}
              </p>
            </div>
            <button
              onClick={handleLike}
              className={`ml-2 p-1 rounded-full transition-colors ${
                isLiked 
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Personalized Features */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="flex items-center space-x-1 text-gray-600">
              <DollarSign className="w-3 h-3" />
              <span>Bet: {formatCurrency(recommendation.personalizedFeatures.recommendedBetSize)}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock className="w-3 h-3" />
              <span>{recommendation.metadata.expectedPlayTime}m</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <TrendingUp className="w-3 h-3" />
              <span>Win: {(recommendation.personalizedFeatures.expectedWinRate * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <Users className="w-3 h-3" />
              <span>Match: {(recommendation.personalizedFeatures.similarityToFavorites * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Recommendation Reasons */}
          {showReasons && recommendation.reasons.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Why recommended:</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {recommendation.reasons[0].description}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="primary"
              onClick={handlePlay}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Play Now
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>

          {/* Detailed Information */}
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Expected Revenue:</span>
                  <span className="font-medium">{formatCurrency(recommendation.metadata.expectedRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Risk Level:</span>
                  <span className={`font-medium capitalize ${
                    recommendation.metadata.riskLevel === 'low' ? 'text-green-600' :
                    recommendation.metadata.riskLevel === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {recommendation.metadata.riskLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Novelty Score:</span>
                  <span className="font-medium">
                    {(recommendation.metadata.noveltyScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Trending Score:</span>
                  <span className="font-medium">
                    {(recommendation.personalizedFeatures.trendingScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* All Reasons */}
              {recommendation.reasons.length > 1 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">All reasons:</div>
                  <div className="space-y-1">
                    {recommendation.reasons.map((reason, index) => (
                      <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                        • {reason.description} ({(reason.confidence * 100).toFixed(0)}% confidence)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default GameRecommendationCard
