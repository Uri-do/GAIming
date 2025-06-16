import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, Gamepad2, Monitor, Smartphone, Star, TrendingUp, Eye } from 'lucide-react'
import { gameService } from '@/services/gameService'
import { Game, PaginatedResponse } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const Games: React.FC = () => {
  const navigate = useNavigate()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  })

  const fetchGames = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching games from API...')
      const response: PaginatedResponse<Game> = await gameService.getGames({
        page,
        pageSize: pagination.pageSize
      })

      console.log('Games response:', response)

      // Handle nested response structure
      const data = response.data || response
      const items = data.items || data.data || []

      setGames(items)
      setPagination({
        page: data.page || 1,
        pageSize: data.pageSize || 20,
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 0
      })
    } catch (err) {
      console.error('Error fetching games:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch games')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [])

  const handlePageChange = (newPage: number) => {
    fetchGames(newPage)
  }

  const handleViewDetails = (gameId: number) => {
    navigate(`/games/${gameId}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg -m-4" />
          <div className="relative z-10 p-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Games
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Manage and analyze your game catalog</p>
          </div>
        </div>
        <Card variant="gaming" className="text-center">
          <CardContent className="p-8">
            <LoadingSpinner size="xl" variant="gaming" />
            <p className="text-gray-300 mt-4 text-lg">Loading games...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg -m-4" />
          <div className="relative z-10 p-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Games
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Manage and analyze your game catalog</p>
          </div>
        </div>
        <Card variant="gaming" className="border-error-500/30">
          <CardHeader variant="gaming">
            <CardTitle className="text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-error-400" />
              Error Loading Games
            </CardTitle>
            <CardDescription className="text-gray-400">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => fetchGames()}
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
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg -m-4" />
        <div className="relative z-10 p-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Games
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Manage and analyze your game catalog ({pagination.totalCount} games)
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card variant="gaming" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5" />
        <CardContent className="relative z-10 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-primary-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" icon={<Filter />} className="border-primary-500/30 hover:bg-primary-500/10">
                Filter
              </Button>
              <Button variant="gaming" icon={<Plus />}>
                Add Game
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games && games.length > 0 ? games.map((game) => (
          <Card key={game.gameId} variant="gaming" hover glow className="relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 group-hover:from-primary-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2 truncate text-lg group-hover:text-primary-400 transition-colors">
                    {game.gameName}
                  </h3>
                  <p className="text-sm text-gray-400 mb-1">
                    <span className="text-primary-400">Provider:</span> {game.providerName || game.provider?.providerName || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-400 mb-1">
                    <span className="text-primary-400">Type:</span> {game.gameTypeName || game.gameType?.gameTypeName || 'Unknown'}
                  </p>
                  {game.rtpPercentage && (
                    <p className="text-sm text-gray-400 mb-3">
                      <span className="text-primary-400">RTP:</span> {game.rtpPercentage}%
                    </p>
                  )}
                </div>
                <Gamepad2 className="w-6 h-6 text-primary-400 opacity-50" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={game.isActive ? 'success' : 'error'}
                    size="sm"
                    icon={game.isActive ? <Star className="w-3 h-3" /> : undefined}
                  >
                    {game.isActive ? 'Active' : 'Inactive'}
                  </Badge>

                  <div className="flex gap-1">
                    {game.isMobile && (
                      <Badge variant="outline" size="sm" icon={<Smartphone className="w-3 h-3" />}>
                        Mobile
                      </Badge>
                    )}
                    {game.isDesktop && (
                      <Badge variant="outline" size="sm" icon={<Monitor className="w-3 h-3" />}>
                        Desktop
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  className="hover:bg-primary-500/20 hover:text-primary-300 transition-all duration-200"
                  onClick={() => handleViewDetails(game.gameId)}
                  icon={<Eye className="w-4 h-4" />}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full">
            <Card variant="gaming" className="text-center">
              <CardContent className="p-8">
                <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Games Found</h3>
                <p className="text-gray-400">No games match your current filters.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card variant="gaming" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5" />
          <CardContent className="relative z-10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-300">
                  Showing page <span className="text-primary-400 font-medium">{pagination.page}</span> of{' '}
                  <span className="text-primary-400 font-medium">{pagination.totalPages}</span> ({pagination.totalCount} total games)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="border-primary-500/30 hover:bg-primary-500/10"
                >
                  Previous
                </Button>
                <Badge variant="gaming" size="md">
                  {pagination.page}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="border-primary-500/30 hover:bg-primary-500/10"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Games
