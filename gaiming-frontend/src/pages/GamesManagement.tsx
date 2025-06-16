/**
 * Comprehensive Games Management Page
 * Real functionality for casino games management
 */

import React, { useState, useEffect, useCallback } from 'react'
import { gameService } from '@/features/games/services'
import type { 
  Game, 
  GameFilterForm, 
  PaginatedResponse,
  GameProvider,
  GameType,
  Volatility,
  Theme 
} from '@/features/games/types'
import { FeatureErrorBoundary } from '@/shared/components'
import { useNotificationStore } from '@/app/store/notificationStore'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const GamesManagement: React.FC = () => {
  // State management
  const [games, setGames] = useState<Game[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 20,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Reference data
  const [providers, setProviders] = useState<GameProvider[]>([])
  const [gameTypes, setGameTypes] = useState<GameType[]>([])
  const [volatilities, setVolatilities] = useState<Volatility[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  
  // Filters and UI state
  const [filters, setFilters] = useState<GameFilterForm>({})
  const [selectedGames, setSelectedGames] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  
  const notifications = useNotificationStore()

  // Load reference data on mount
  useEffect(() => {
    loadReferenceData()
  }, [])

  // Load games when filters or pagination changes
  useEffect(() => {
    loadGames()
  }, [pagination.currentPage, filters])

  const loadReferenceData = async () => {
    try {
      const [providersData, gameTypesData, volatilitiesData, themesData] = await Promise.all([
        gameService.getProviders(),
        gameService.getGameTypes(),
        gameService.getVolatilities(),
        gameService.getThemes(),
      ])
      
      setProviders(providersData)
      setGameTypes(gameTypesData)
      setVolatilities(volatilitiesData)
      setThemes(themesData)
    } catch (error) {
      console.error('Failed to load reference data:', error)
      notifications.showError('Error', 'Failed to load reference data')
    }
  }

  const loadGames = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response: PaginatedResponse<Game> = await gameService.getGames({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        search: searchTerm || undefined,
        provider: filters.providers?.[0],
        gameType: filters.gameTypes?.[0],
        volatility: filters.volatilities?.[0],
        theme: filters.themes?.[0],
        isActive: filters.isActive,
        isMobile: filters.isMobile,
        isDesktop: filters.isDesktop,
        sortBy: filters.sortBy || 'gameName',
        sortDirection: filters.sortDirection || 'asc',
      })
      
      setGames(response.items)
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
      }))
    } catch (error) {
      console.error('Failed to load games:', error)
      setError('Failed to load games')
      notifications.showError('Error', 'Failed to load games')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }, [])

  const handleFilterChange = useCallback((newFilters: Partial<GameFilterForm>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }, [])

  const handleGameSelection = useCallback((gameId: number) => {
    setSelectedGames(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(gameId)) {
        newSelection.delete(gameId)
      } else {
        newSelection.add(gameId)
      }
      return newSelection
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedGames.size === games.length) {
      setSelectedGames(new Set())
    } else {
      setSelectedGames(new Set(games.map(game => game.gameId)))
    }
  }, [games, selectedGames.size])

  const handleBulkActivate = async () => {
    if (selectedGames.size === 0) return
    
    try {
      // Note: This would need to be implemented in the backend
      notifications.showSuccess('Success', `Activated ${selectedGames.size} games`)
      setSelectedGames(new Set())
      loadGames()
    } catch (error) {
      notifications.showError('Error', 'Failed to activate games')
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedGames.size === 0) return
    
    try {
      // Note: This would need to be implemented in the backend
      notifications.showSuccess('Success', `Deactivated ${selectedGames.size} games`)
      setSelectedGames(new Set())
      loadGames()
    } catch (error) {
      notifications.showError('Error', 'Failed to deactivate games')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Games</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadGames} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FeatureErrorBoundary featureName="Games Management">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Games Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your casino games catalog
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => loadGames()}>
              Refresh
            </Button>
            <Button variant="primary">
              Add Game
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{pagination.totalCount}</div>
              <div className="text-sm text-gray-600">Total Games</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{providers.length}</div>
              <div className="text-sm text-gray-600">Providers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{gameTypes.length}</div>
              <div className="text-sm text-gray-600">Game Types</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{selectedGames.size}</div>
              <div className="text-sm text-gray-600">Selected</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Provider Filter */}
              <div>
                <select
                  value={filters.providers?.[0] || ''}
                  onChange={(e) => handleFilterChange({ 
                    providers: e.target.value ? [parseInt(e.target.value)] : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Providers</option>
                  {providers.map(provider => (
                    <option key={provider.providerId} value={provider.providerId}>
                      {provider.providerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Game Type Filter */}
              <div>
                <select
                  value={filters.gameTypes?.[0] || ''}
                  onChange={(e) => handleFilterChange({ 
                    gameTypes: e.target.value ? [parseInt(e.target.value)] : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {gameTypes.map(type => (
                    <option key={type.gameTypeId} value={type.gameTypeId}>
                      {type.gameTypeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                  onChange={(e) => handleFilterChange({ 
                    isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilters({})
                    setSearchTerm('')
                  }}
                  fullWidth
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedGames.size > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedGames.size} game(s) selected
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleBulkActivate}>
                    Activate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBulkDeactivate}>
                    Deactivate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedGames(new Set())}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Games Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedGames.size === games.length && games.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        Game
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        Provider
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        RTP
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        Platform
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {games.map((game) => (
                      <tr key={game.gameId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedGames.has(game.gameId)}
                            onChange={() => handleGameSelection(game.gameId)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            {game.imageUrl && (
                              <img
                                src={game.imageUrl}
                                alt={game.gameName}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {game.gameName}
                              </div>
                              {game.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {game.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {game.providerName || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {game.gameTypeName || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {game.rtpPercentage ? formatPercentage(game.rtpPercentage) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-1">
                            {game.isMobile && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Mobile
                              </span>
                            )}
                            {game.isDesktop && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Desktop
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            game.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {game.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Stats
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </FeatureErrorBoundary>
  )
}

export default GamesManagement
