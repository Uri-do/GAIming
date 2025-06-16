import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/Badge'

import { 
  Target, 
  TrendingUp, 

  RefreshCw,
  Play,
  Eye,
  Clock,
  Star,

  Download
} from 'lucide-react'
import { apiService } from '@/services/api'
import { API_ENDPOINTS } from '@/config'

interface GameRecommendation {
  id: number
  playerId: number
  gameId: number
  game: {
    gameId: number
    gameName: string
    gameTypeName: string
    providerName: string
    imageUrl?: string
  }
  score: number
  algorithm: string
  reason: string
  position: number
  category: string
  context: string
  isClicked: boolean
  isPlayed: boolean
  generatedDate: string
  variant?: string
}

interface RecommendationStats {
  totalRecommendations: number
  totalClicks: number
  totalPlays: number
  clickThroughRate: number
  conversionRate: number
  averageScore: number
  activeAlgorithms: string[]
  topPerformingGames: Array<{
    gameId: number
    gameName: string
    clicks: number
    plays: number
    ctr: number
  }>
}

interface GenerateRecommendationsRequest {
  playerId: number
  algorithm: string
  count: number
  context: string
  category?: string
}

export default function RecommendationsDashboard() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(1)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('hybrid')
  const [recommendationCount, setRecommendationCount] = useState<number>(10)
  const [selectedContext, setSelectedContext] = useState<string>('lobby')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterAlgorithm, setFilterAlgorithm] = useState<string>('')

  const queryClient = useQueryClient()

  // Fetch recommendation statistics
  const { data: stats, isLoading: _ } = useQuery<RecommendationStats>({
    queryKey: ['recommendation-stats'],
    queryFn: () => apiService.get(API_ENDPOINTS.RECOMMENDATIONS.ANALYTICS),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch recent recommendations
  const { data: recommendations, isLoading: recommendationsLoading, refetch: refetchRecommendations } = useQuery<GameRecommendation[]>({
    queryKey: ['recommendations', selectedPlayerId, filterAlgorithm, searchTerm],
    queryFn: () => {
      let url = `${API_ENDPOINTS.RECOMMENDATIONS.BASE}?playerId=${selectedPlayerId}`
      if (filterAlgorithm) url += `&algorithm=${filterAlgorithm}`
      if (searchTerm) url += `&search=${searchTerm}`
      return apiService.get(url)
    },
  })

  // Generate new recommendations mutation
  const generateRecommendationsMutation = useMutation({
    mutationFn: (request: GenerateRecommendationsRequest) =>
      apiService.post(API_ENDPOINTS.RECOMMENDATIONS.GENERATE, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      queryClient.invalidateQueries({ queryKey: ['recommendation-stats'] })
    },
  })

  // Record interaction mutation
  const recordInteractionMutation = useMutation({
    mutationFn: ({ recommendationId, interactionType }: { recommendationId: number, interactionType: 'click' | 'play' }) =>
      apiService.post(API_ENDPOINTS.RECOMMENDATIONS.INTERACTION, {
        recommendationId,
        interactionType,
        timestamp: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      queryClient.invalidateQueries({ queryKey: ['recommendation-stats'] })
    },
  })

  const handleGenerateRecommendations = () => {
    generateRecommendationsMutation.mutate({
      playerId: selectedPlayerId,
      algorithm: selectedAlgorithm,
      count: recommendationCount,
      context: selectedContext,
    })
  }

  const handleInteraction = (recommendationId: number, type: 'click' | 'play') => {
    recordInteractionMutation.mutate({ recommendationId, interactionType: type })
  }

  const getAlgorithmColor = (algorithm: string) => {
    const colors: Record<string, string> = {
      'collaborative': 'bg-blue-100 text-blue-800',
      'content-based': 'bg-green-100 text-green-800',
      'hybrid': 'bg-purple-100 text-purple-800',
      'bandit': 'bg-orange-100 text-orange-800',
      'popularity': 'bg-gray-100 text-gray-800',
    }
    return colors[algorithm] || 'bg-gray-100 text-gray-800'
  }

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1) + '%'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Game Recommendations Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time recommendation engine management and analytics
          </p>
        </div>
        <Button
          onClick={() => {
            refetchRecommendations()
            queryClient.invalidateQueries({ queryKey: ['recommendation-stats'] })
          }}
          variant="outline"
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Recommendations
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalRecommendations.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Click-Through Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatScore(stats.clickThroughRate)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatScore(stats.conversionRate)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Score
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatScore(stats.averageScore)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Generation Controls */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Generate New Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Player ID
            </label>
            <Input
              type="number"
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
              placeholder="Enter player ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Algorithm
            </label>
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="hybrid">Hybrid</option>
              <option value="collaborative">Collaborative Filtering</option>
              <option value="content-based">Content-Based</option>
              <option value="bandit">Multi-Armed Bandit</option>
              <option value="popularity">Popularity-Based</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Count
            </label>
            <Input
              type="number"
              value={recommendationCount}
              onChange={(e) => setRecommendationCount(Number(e.target.value))}
              min={1}
              max={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Context
            </label>
            <select
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="lobby">Lobby</option>
              <option value="post-game">Post-Game</option>
              <option value="profile">Profile</option>
              <option value="homepage">Homepage</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleGenerateRecommendations}
              loading={generateRecommendationsMutation.isPending}
              className="w-full"
            >
              Generate
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={filterAlgorithm}
              onChange={(e) => setFilterAlgorithm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Algorithms</option>
              <option value="hybrid">Hybrid</option>
              <option value="collaborative">Collaborative</option>
              <option value="content-based">Content-Based</option>
              <option value="bandit">Bandit</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Recommendations List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Recommendations</h2>
          <Button variant="outline" icon={<Download className="h-4 w-4" />}>
            Export Data
          </Button>
        </div>

        {recommendationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {rec.game.imageUrl && (
                      <img
                        src={rec.game.imageUrl}
                        alt={rec.game.gameName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{rec.game.gameName}</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {rec.game.gameTypeName} • {rec.game.providerName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{rec.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                      <p className="font-semibold">{formatScore(rec.score)}</p>
                    </div>
                    
                    <Badge className={getAlgorithmColor(rec.algorithm)}>
                      {rec.algorithm}
                    </Badge>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={rec.isClicked ? "default" : "outline"}
                        onClick={() => handleInteraction(rec.id, 'click')}
                        disabled={rec.isClicked}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={rec.isPlayed ? "default" : "outline"}
                        onClick={() => handleInteraction(rec.id, 'play')}
                        disabled={rec.isPlayed}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Position: #{rec.position}</span>
                    <span>Context: {rec.context}</span>
                    <span>Category: {rec.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(rec.generatedDate).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recommendations found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Generate some recommendations to get started.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
