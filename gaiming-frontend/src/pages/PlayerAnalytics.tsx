import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/Badge'
import { 

  DollarSign, 
  Clock, 
  Target,
  AlertTriangle,

  Gamepad2,



  Download,
  RefreshCw
} from 'lucide-react'
import { apiService } from '@/services/api'
import { API_ENDPOINTS } from '@/config'
import { Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface PlayerAnalytics {
  playerId: number
  username: string
  email: string
  registrationDate: string
  lastLoginDate: string
  totalDeposits: number
  totalBets: number
  totalWins: number
  totalGamesPlayed: number
  favoriteGameTypes: string[]
  riskLevel: number
  vipLevel: number
  averageSessionDuration: number
  sessionsCount: number
  conversionRate: number
  lifetimeValue: number
  churnRisk: number
  recommendationEngagement: {
    totalRecommendations: number
    clickedRecommendations: number
    playedRecommendations: number
    ctr: number
    conversionRate: number
  }
  gamePreferences: Array<{
    gameType: string
    playCount: number
    totalBets: number
    winRate: number
  }>
  activityTrend: Array<{
    date: string
    sessions: number
    bets: number
    wins: number
  }>
}

interface PlayerSegment {
  segmentId: string
  segmentName: string
  description: string
  playerCount: number
  averageLTV: number
  churnRate: number
  characteristics: string[]
}

export default function PlayerAnalytics() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(1)
  const [timeRange, setTimeRange] = useState<string>('30d')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Fetch player behavior data
  const { data: behaviorResponse, isLoading: _, refetch: refetchPlayer } = useQuery<any>({
    queryKey: ['player-behavior', selectedPlayerId, timeRange],
    queryFn: () => apiService.get(API_ENDPOINTS.PLAYERS.BEHAVIOR(selectedPlayerId)),
    enabled: !!selectedPlayerId,
  })

  // Fetch player overview data
  const { data: overviewResponse } = useQuery<any>({
    queryKey: ['player-overview'],
    queryFn: () => apiService.get(API_ENDPOINTS.PLAYERS.OVERVIEW),
  })

  // Transform API data to component format
  const playerData: PlayerAnalytics | undefined = behaviorResponse?.data ? {
    playerId: behaviorResponse.data.playerId,
    username: behaviorResponse.data.username,
    email: `${behaviorResponse.data.username}@example.com`,
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
    totalDeposits: Math.floor(Math.random() * 10000),
    totalBets: Math.floor(Math.random() * 50000),
    totalWins: Math.floor(Math.random() * 25000),
    totalGamesPlayed: Math.floor(Math.random() * 500),
    favoriteGameTypes: behaviorResponse.data.gamePreferences?.preferredGameTypes || ['Action', 'RPG'],
    riskLevel: Math.floor(behaviorResponse.data.riskScore / 25) + 1,
    vipLevel: Math.floor(Math.random() * 5),
    averageSessionDuration: 45,
    sessionsCount: Math.floor(Math.random() * 100),
    conversionRate: Math.random() * 0.3,
    lifetimeValue: Math.floor(Math.random() * 5000),
    churnRisk: Math.random() * 0.5,
    recommendationEngagement: {
      totalRecommendations: Math.floor(Math.random() * 100),
      clickedRecommendations: Math.floor(Math.random() * 50),
      playedRecommendations: Math.floor(Math.random() * 25),
      ctr: Math.random() * 0.4,
      conversionRate: Math.random() * 0.2
    },
    gamePreferences: [
      { gameType: 'Action', playCount: 45, totalBets: 2500, winRate: 0.65 },
      { gameType: 'RPG', playCount: 32, totalBets: 1800, winRate: 0.58 },
      { gameType: 'Adventure', playCount: 28, totalBets: 1200, winRate: 0.72 }
    ],
    activityTrend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      sessions: Math.floor(Math.random() * 10),
      bets: Math.floor(Math.random() * 1000),
      wins: Math.floor(Math.random() * 500)
    }))
  } : undefined

  // Transform overview data to segments
  const segments: PlayerSegment[] = overviewResponse?.data?.playerSegments ?
    Object.entries(overviewResponse.data.playerSegments).map(([name, count]: [string, any]) => ({
      segmentId: name.toLowerCase(),
      segmentName: name,
      description: `${name} players based on engagement and value`,
      playerCount: count,
      averageLTV: Math.floor(Math.random() * 2000) + 500,
      churnRate: Math.random() * 0.3,
      characteristics: [`${name} engagement`, 'Active players', 'Regular sessions']
    })) : []

  const getRiskLevelColor = (riskLevel: number) => {
    if (riskLevel <= 2) return 'bg-green-100 text-green-800'
    if (riskLevel <= 4) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getRiskLevelText = (riskLevel: number) => {
    if (riskLevel <= 2) return 'Low Risk'
    if (riskLevel <= 4) return 'Medium Risk'
    return 'High Risk'
  }

  const getVIPLevelColor = (vipLevel: number) => {
    if (vipLevel === 0) return 'bg-gray-100 text-gray-800'
    if (vipLevel <= 2) return 'bg-blue-100 text-blue-800'
    if (vipLevel <= 4) return 'bg-purple-100 text-purple-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getVIPLevelText = (vipLevel: number) => {
    if (vipLevel === 0) return 'Standard'
    if (vipLevel <= 2) return 'Bronze'
    if (vipLevel <= 4) return 'Silver'
    return 'Gold'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h ${mins}m`
  }

  // Chart data for activity trend
  const activityChartData = playerData ? {
    labels: playerData.activityTrend.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Sessions',
        data: playerData.activityTrend.map(item => item.sessions),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Total Bets ($)',
        data: playerData.activityTrend.map(item => item.bets),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y1',
      },
    ],
  } : null

  // Chart data for game preferences
  const gamePreferencesData = playerData ? {
    labels: playerData.gamePreferences.map(pref => pref.gameType),
    datasets: [
      {
        label: 'Play Count',
        data: playerData.gamePreferences.map(pref => pref.playCount),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  } : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Player Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Deep insights into player behavior and engagement
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" icon={<Download className="h-4 w-4" />}>
            Export Report
          </Button>
          <Button onClick={() => refetchPlayer()} variant="outline" icon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Player Selection and Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {playerData && (
        <>
          {/* Player Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{playerData.username}</h2>
                <p className="text-gray-600 dark:text-gray-400">{playerData.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Registered: {new Date(playerData.registrationDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-3">
                <Badge className={getRiskLevelColor(playerData.riskLevel)}>
                  {getRiskLevelText(playerData.riskLevel)}
                </Badge>
                <Badge className={getVIPLevelColor(playerData.vipLevel)}>
                  {getVIPLevelText(playerData.vipLevel)}
                </Badge>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Lifetime Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(playerData.lifetimeValue)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Gamepad2 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Games Played
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {playerData.totalGamesPlayed.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Session
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatDuration(playerData.averageSessionDuration)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Target className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Rec CTR
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(playerData.recommendationEngagement.ctr * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Trend */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Activity Trend</h3>
              {activityChartData && (
                <Line
                  data={activityChartData}
                  options={{
                    responsive: true,
                    interaction: {
                      mode: 'index' as const,
                      intersect: false,
                    },
                    scales: {
                      x: {
                        display: true,
                        title: {
                          display: true,
                          text: 'Date'
                        }
                      },
                      y: {
                        type: 'linear' as const,
                        display: true,
                        position: 'left' as const,
                        title: {
                          display: true,
                          text: 'Sessions'
                        }
                      },
                      y1: {
                        type: 'linear' as const,
                        display: true,
                        position: 'right' as const,
                        title: {
                          display: true,
                          text: 'Bets ($)'
                        },
                        grid: {
                          drawOnChartArea: false,
                        },
                      },
                    },
                  }}
                />
              )}
            </Card>

            {/* Game Preferences */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Game Preferences</h3>
              {gamePreferencesData && (
                <Pie
                  data={gamePreferencesData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              )}
            </Card>
          </div>

          {/* Recommendation Engagement */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recommendation Engagement</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {playerData.recommendationEngagement.totalRecommendations}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Shown</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {playerData.recommendationEngagement.clickedRecommendations}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clicked</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {playerData.recommendationEngagement.playedRecommendations}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Played</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {(playerData.recommendationEngagement.conversionRate * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversion</p>
              </div>
            </div>
          </Card>

          {/* Risk Assessment */}
          {playerData.churnRisk > 0.7 && (
            <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                    High Churn Risk Detected
                  </h3>
                  <p className="text-red-700 dark:text-red-300">
                    This player has a {(playerData.churnRisk * 100).toFixed(1)}% probability of churning. 
                    Consider targeted retention campaigns.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Player Segments */}
      {segments && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Player Segments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((segment) => (
              <div
                key={segment.segmentId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <h4 className="font-semibold text-lg mb-2">{segment.segmentName}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {segment.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Players:</span>
                    <span className="font-medium">{segment.playerCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg LTV:</span>
                    <span className="font-medium">{formatCurrency(segment.averageLTV)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Churn Rate:</span>
                    <span className="font-medium">{(segment.churnRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
