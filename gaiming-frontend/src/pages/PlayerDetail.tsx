import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Star,
  Shield,
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  Gamepad2,
  Award,
  Settings
} from 'lucide-react'
import { playerAnalyticsService, type PlayerAnalytics } from '@/services/playerAnalyticsService'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const PlayerDetail: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>()
  const navigate = useNavigate()
  const [player, setPlayer] = useState<PlayerAnalytics | null>(null)
  const [dashboard, setDashboard] = useState<any>(null)
  const [behavior, setBehavior] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [behaviorLoading, setBehaviorLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (playerId) {
      fetchPlayerData()
      fetchPlayerDashboard()
      fetchPlayerBehavior()
    }
  }, [playerId])

  const fetchPlayerData = async () => {
    try {
      setLoading(true)
      setError(null)
      const playerData = await playerAnalyticsService.getPlayer(Number(playerId))
      setPlayer(playerData)
    } catch (err) {
      console.error('Error fetching player data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch player data')
    } finally {
      setLoading(false)
    }
  }

  const fetchPlayerDashboard = async () => {
    try {
      setDashboardLoading(true)
      const dashboardData = await playerAnalyticsService.getPlayerDashboard(Number(playerId))
      setDashboard(dashboardData)
    } catch (err) {
      console.error('Error fetching player dashboard:', err)
    } finally {
      setDashboardLoading(false)
    }
  }

  const fetchPlayerBehavior = async () => {
    try {
      setBehaviorLoading(true)
      const behaviorData = await playerAnalyticsService.getPlayerBehavior(Number(playerId))
      setBehavior(behaviorData)
    } catch (err) {
      console.error('Error fetching player behavior:', err)
    } finally {
      setBehaviorLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVipLevelColor = (level: number) => {
    if (level >= 5) return 'bg-purple-500 text-white'
    if (level >= 3) return 'bg-yellow-500 text-white'
    if (level >= 1) return 'bg-blue-500 text-white'
    return 'bg-gray-500 text-white'
  }

  const getRiskLevelColor = (level: number) => {
    if (level >= 4) return 'bg-red-500 text-white'
    if (level >= 3) return 'bg-orange-500 text-white'
    if (level >= 2) return 'bg-yellow-500 text-white'
    return 'bg-green-500 text-white'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/players')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Players
          </Button>
        </div>
        <Card variant="gaming" className="text-center">
          <CardContent className="p-8">
            <LoadingSpinner size="xl" variant="gaming" />
            <p className="text-gray-300 mt-4 text-lg">Loading player details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/players')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Players
          </Button>
        </div>
        <Card variant="gaming" className="border-error-500/30">
          <CardHeader variant="gaming">
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-error-400" />
              Error Loading Player
            </CardTitle>
            <CardDescription className="text-gray-400">
              {error || 'Player not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={fetchPlayerData}
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
            onClick={() => navigate('/players')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Players
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {player.username}
            </h1>
            <p className="text-gray-400 mt-1">
              {player.firstName && player.lastName ? `${player.firstName} ${player.lastName}` : player.email}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={<Settings className="w-4 h-4" />}>
            Manage Player
          </Button>
          <Button variant="primary" icon={<BarChart3 className="w-4 h-4" />}>
            View Analytics
          </Button>
        </div>
      </div>

      {/* Player Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Player Profile */}
        <div className="lg:col-span-2">
          <Card variant="gaming" glow>
            <CardHeader variant="gaming">
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-primary-400" />
                Player Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {player.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{player.username}</h3>
                  <p className="text-gray-400">{player.email}</p>
                  {player.firstName && player.lastName && (
                    <p className="text-gray-300">{player.firstName} {player.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Player ID</label>
                  <p className="text-white font-medium">{player.playerId}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={player.isActive ? 'success' : 'error'}>
                      {player.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Country</label>
                  <p className="text-white font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {player.country || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Segment</label>
                  <Badge variant="secondary">{player.playerSegment}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">VIP Level</label>
                  <Badge className={getVipLevelColor(player.vipLevel)}>
                    <Star className="w-3 h-3 mr-1" />
                    VIP {player.vipLevel}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Risk Level</label>
                  <Badge className={getRiskLevelColor(player.riskLevel)}>
                    <Shield className="w-3 h-3 mr-1" />
                    Risk {player.riskLevel}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Registration Date</label>
                <p className="text-white font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(player.registrationDate)}
                </p>
              </div>

              {player.lastLoginDate && (
                <div>
                  <label className="text-sm text-gray-400">Last Login</label>
                  <p className="text-white font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {formatDate(player.lastLoginDate)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gaming Statistics */}
          <Card variant="gaming" glow>
            <CardHeader variant="gaming">
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-400" />
                Gaming Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Sessions</span>
                  </div>
                  <span className="text-white font-medium">{player.totalSessions.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-400">Total Bets</span>
                  </div>
                  <span className="text-white font-medium">{formatCurrency(player.totalBets)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-400">Total Wins</span>
                  </div>
                  <span className="text-white font-medium">{formatCurrency(player.totalWins)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-400">Revenue</span>
                  </div>
                  <span className="text-white font-medium">{formatCurrency(player.totalRevenue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card variant="gaming">
            <CardHeader variant="gaming">
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-400" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-400">Lifetime Value</span>
                  <span className="text-white font-medium">{formatCurrency(player.lifetimeValue)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-400">Avg Session Duration</span>
                  <span className="text-white font-medium">{player.averageSessionDuration.toFixed(1)} min</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-400">Avg Bet Size</span>
                  <span className="text-white font-medium">{formatCurrency(player.averageBetSize)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-400">Retention Score</span>
                  <span className="text-white font-medium">{(player.retentionScore * 100).toFixed(1)}%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-400">Engagement Score</span>
                  <span className="text-white font-medium">{player.engagementScore.toFixed(1)}/100</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-400">Risk Score</span>
                  <span className="text-white font-medium">{player.riskScore.toFixed(1)}/100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Game Preferences and Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Preferences */}
        <Card variant="gaming">
          <CardHeader variant="gaming">
            <CardTitle className="text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-primary-400" />
              Game Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Favorite Game Types</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {player.favoriteGameTypes.map((type, index) => (
                    <Badge key={index} variant="outline">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Preferred Providers</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {player.preferredProviders.map((provider, index) => (
                    <Badge key={index} variant="secondary">
                      {provider}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player Dashboard Data */}
        <Card variant="gaming">
          <CardHeader variant="gaming">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-400" />
              Dashboard Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner variant="gaming" />
                <p className="text-gray-400 mt-2">Loading dashboard...</p>
              </div>
            ) : dashboard ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-400">Dashboard Period</span>
                  <span className="text-white font-medium">
                    {dashboard.startDate ? new Date(dashboard.startDate).toLocaleDateString() : 'N/A'} -
                    {dashboard.endDate ? new Date(dashboard.endDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                {dashboard.overview && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-sm text-gray-400">Total Play Time</span>
                      <span className="text-white font-medium">{dashboard.overview.totalPlayTime || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-sm text-gray-400">Games Played</span>
                      <span className="text-white font-medium">{dashboard.overview.gamesPlayed || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No dashboard data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Behavior Analysis */}
      {behavior && (
        <Card variant="gaming">
          <CardHeader variant="gaming">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-400" />
              Behavior Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {behaviorLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner variant="gaming" />
                <p className="text-gray-400 mt-2">Loading behavior analysis...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{behavior.riskScore?.toFixed(1) || 'N/A'}</div>
                  <div className="text-sm text-gray-400">Risk Score</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{behavior.username || player.username}</div>
                  <div className="text-sm text-gray-400">Player Username</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {behavior.lastAnalyzed ? new Date(behavior.lastAnalyzed).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-400">Last Analyzed</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PlayerDetail
