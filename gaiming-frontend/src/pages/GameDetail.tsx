import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  BarChart3,
  Users,
  TrendingUp,
  Star,
  Monitor,
  Smartphone,
  Calendar,
  DollarSign,
  Activity,
  Target,
  Gamepad2
} from 'lucide-react'
import { gameService } from '@/services/gameService'
import { Game } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const GameDetail: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (gameId) {
      fetchGameDetails()
      fetchGameStats()
    }
  }, [gameId])

  const fetchGameDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const gameData = await gameService.getGame(Number(gameId))
      setGame(gameData)
    } catch (err) {
      console.error('Error fetching game details:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch game details')
    } finally {
      setLoading(false)
    }
  }

  const fetchGameStats = async () => {
    try {
      setStatsLoading(true)
      const statsData = await gameService.getGameStats(Number(gameId))
      setStats(statsData)
    } catch (err) {
      console.error('Error fetching game stats:', err)
      // Don't set error for stats, just log it
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/games')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Games
          </Button>
        </div>
        <Card variant="gaming" className="text-center">
          <CardContent className="p-8">
            <LoadingSpinner size="xl" variant="gaming" />
            <p className="text-gray-300 mt-4 text-lg">Loading game details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/games')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Games
          </Button>
        </div>
        <Card variant="gaming" className="border-error-500/30">
          <CardHeader variant="gaming">
            <CardTitle className="text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-error-400" />
              Error Loading Game
            </CardTitle>
            <CardDescription className="text-gray-400">
              {error || 'Game not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={fetchGameDetails}
              icon={<TrendingUp />}
            >
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/games')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Games
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {game.gameName}
            </h1>
            <p className="text-gray-400 mt-1">
              {game.providerName || game.provider?.providerName} • {game.gameTypeName || game.gameType?.gameTypeName}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={<Edit className="w-4 h-4" />}>
            Edit Game
          </Button>
          <Button variant="primary" icon={<BarChart3 className="w-4 h-4" />}>
            View Analytics
          </Button>
        </div>
      </div>

      {/* Game Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game Info */}
        <div className="lg:col-span-2">
          <Card variant="gaming" glow>
            <CardHeader variant="gaming">
              <CardTitle className="text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-primary-400" />
                Game Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Game ID</label>
                  <p className="text-white font-medium">{game.gameId}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={game.isActive ? 'success' : 'error'}>
                      {game.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {game.hideInLobby && (
                      <Badge variant="warning">Hidden</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Platform Support</label>
                  <div className="flex items-center gap-2 mt-1">
                    {game.isDesktop && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Monitor className="w-3 h-3" />
                        Desktop
                      </Badge>
                    )}
                    {game.isMobile && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        Mobile
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">RTP</label>
                  <p className="text-white font-medium">
                    {game.rtpPercentage ? `${game.rtpPercentage}%` : 'N/A'}
                  </p>
                </div>
              </div>

              {game.description && (
                <div>
                  <label className="text-sm text-gray-400">Description</label>
                  <p className="text-gray-300 mt-1">{game.description}</p>
                </div>
              )}

              {game.features && game.features.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400">Features</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {game.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {game.tags && game.tags.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {game.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Game Statistics */}
        <div>
          <Card variant="gaming" glow>
            <CardHeader variant="gaming">
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-400" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner variant="gaming" />
                  <p className="text-gray-400 mt-2">Loading stats...</p>
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-400">Total Players</span>
                      </div>
                      <span className="text-white font-medium">{stats.totalPlayers?.toLocaleString() || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-400">Active Players</span>
                      </div>
                      <span className="text-white font-medium">{stats.activePlayers?.toLocaleString() || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-400">Total Sessions</span>
                      </div>
                      <span className="text-white font-medium">{stats.totalSessions?.toLocaleString() || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-400">Revenue</span>
                      </div>
                      <span className="text-white font-medium">
                        {stats.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-gray-400">Avg Rating</span>
                      </div>
                      <span className="text-white font-medium">
                        {stats.averageRating ? `${stats.averageRating.toFixed(1)}/5` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">No statistics available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Betting Limits */}
        <Card variant="gaming">
          <CardHeader variant="gaming">
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-400" />
              Betting Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Minimum Bet</label>
                <p className="text-white font-medium text-lg">
                  {game.minBetAmount ? `$${game.minBetAmount}` : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Maximum Bet</label>
                <p className="text-white font-medium text-lg">
                  {game.maxBetAmount ? `$${game.maxBetAmount}` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Metadata */}
        <Card variant="gaming">
          <CardHeader variant="gaming">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-400" />
              Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Release Date</label>
                <p className="text-white font-medium">
                  {game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Created</label>
                <p className="text-white font-medium">
                  {new Date(game.createdDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Last Updated</label>
                <p className="text-white font-medium">
                  {new Date(game.updatedDate).toLocaleDateString()}
                </p>
              </div>
              {game.gameOrder && (
                <div>
                  <label className="text-sm text-gray-400">Display Order</label>
                  <p className="text-white font-medium">{game.gameOrder}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default GameDetail
