/**
 * Example component demonstrating enhanced Zustand store patterns
 * Shows multi-store architecture, atomic selectors, and discriminated unions
 */

import React, { useEffect, useCallback } from 'react'
import { useGameStore, gameSelectors, useGameOperations } from '../stores/gameStore'
import { useNotificationStore, notificationSelectors } from '@/app/store/notificationStore'
import { useAuthStore, authSelectors } from '@/app/store/authStore'
import { FeatureErrorBoundary, AsyncErrorBoundary, useApiErrorHandler } from '@/shared/components'
import type { Game, GameFilterForm } from '../types'
import { asyncState } from '@/shared/utils'

export const GamesManagement: React.FC = () => {
  // Error handling
  const { handleAsyncError, reportError } = useApiErrorHandler('games-management')

  // Use atomic selectors for optimal performance
  const games = useGameStore(gameSelectors.games)
  const gamesLoading = useGameStore(gameSelectors.gamesLoading)
  const gamesError = useGameStore(gameSelectors.gamesError)
  const totalGames = useGameStore(gameSelectors.totalGames)
  const currentPage = useGameStore(gameSelectors.currentPage)
  const totalPages = useGameStore(gameSelectors.totalPages)
  const filters = useGameStore(gameSelectors.filters)
  const hasFilters = useGameStore(gameSelectors.hasFilters)
  const selectedGameIds = useGameStore(gameSelectors.selectedGameIds)
  const selectedGamesCount = useGameStore(gameSelectors.selectedGamesCount)
  const viewMode = useGameStore(gameSelectors.viewMode)
  const isTogglingStatus = useGameStore(gameSelectors.isTogglingStatus)
  
  // Store actions
  const { 
    setFilters, 
    clearFilters, 
    toggleGameSelection, 
    selectAllGames, 
    clearSelection,
    setViewMode,
    setSorting 
  } = useGameStore()
  
  // Game operations hook
  const gameOperations = useGameOperations()
  
  // Notification store
  const showSuccess = useNotificationStore(state => state.showSuccess)
  const showError = useNotificationStore(state => state.showError)
  const showConfirm = useNotificationStore(state => state.showConfirm)
  
  // Auth store
  const hasPermission = useAuthStore(state => state.hasPermission)
  const user = useAuthStore(authSelectors.user)
  
  // Load games on component mount with error handling
  useEffect(() => {
    handleAsyncError(
      () => gameOperations.loadGames(),
      { context: 'initial-load' }
    )
  }, [handleAsyncError, gameOperations])
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<GameFilterForm>) => {
    setFilters(newFilters)
    showSuccess('Filters Applied', 'Games list updated with new filters')
  }, [setFilters, showSuccess])
  
  // Handle game selection
  const handleGameSelect = useCallback((gameId: number) => {
    toggleGameSelection(gameId)
  }, [toggleGameSelection])
  
  // Handle select all
  const handleSelectAll = useCallback(() => {
    const gameIds = games.map(game => game.gameId)
    selectAllGames(gameIds)
    showSuccess('Selection Updated', `Selected ${gameIds.length} games`)
  }, [games, selectAllGames, showSuccess])
  
  // Handle bulk status toggle
  const handleBulkStatusToggle = useCallback(async (isActive: boolean) => {
    if (selectedGamesCount === 0) {
      showError('No Selection', 'Please select games to modify')
      return
    }
    
    const action = isActive ? 'activate' : 'deactivate'
    const gameIds = Array.from(selectedGameIds)
    
    showConfirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Games`,
      `Are you sure you want to ${action} ${selectedGamesCount} selected games?`,
      async () => {
        try {
          const results = await gameOperations.bulkToggleStatus(gameIds, isActive)
          const successful = results.filter(r => r.status === 'fulfilled').length
          const failed = results.filter(r => r.status === 'rejected').length
          
          if (failed === 0) {
            showSuccess('Bulk Operation Complete', `Successfully ${action}d ${successful} games`)
          } else {
            showError('Partial Success', `${successful} games ${action}d, ${failed} failed`)
          }
          
          clearSelection()
        } catch (error) {
          showError('Operation Failed', `Failed to ${action} games`)
        }
      }
    )
  }, [selectedGamesCount, selectedGameIds, gameOperations, showConfirm, showSuccess, showError, clearSelection])
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    gameOperations.loadGames(page)
  }, [gameOperations])
  
  // Handle sorting
  const handleSort = useCallback((sortBy: string, direction: 'asc' | 'desc') => {
    setSorting(sortBy, direction)
  }, [setSorting])
  
  // Permission checks
  const canManageGames = hasPermission('games:manage')
  const canViewStats = hasPermission('games:stats')
  
  // Loading state
  if (gamesLoading && games.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading games...</span>
      </div>
    )
  }
  
  // Error state
  if (gamesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error Loading Games</h3>
        <p className="text-red-600 mt-1">{gamesError}</p>
        <button
          onClick={() => gameOperations.loadGames()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }
  
  return (
    <FeatureErrorBoundary
      featureName="Games Management"
      onError={(error) => reportError(error, { context: 'games-management-render' })}
    >
      <AsyncErrorBoundary
        asyncStates={[
          { status: gamesLoading ? 'loading' : gamesError ? 'error' : 'success', data: games, error: gamesError, timestamp: Date.now() }
        ]}
        onAsyncError={(error) => reportError(error, { context: 'games-async-operations' })}
      >
        <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Games Management</h1>
          <p className="text-gray-600">
            {totalGames} total games • Page {currentPage} of {totalPages}
            {selectedGamesCount > 0 && ` • ${selectedGamesCount} selected`}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300">
            {(['grid', 'list', 'table'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm font-medium ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Bulk Actions */}
          {canManageGames && selectedGamesCount > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkStatusToggle(true)}
                disabled={isTogglingStatus}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                Activate Selected
              </button>
              <button
                onClick={() => handleBulkStatusToggle(false)}
                disabled={isTogglingStatus}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                Deactivate Selected
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Filters</h3>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search games..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={filters.isActive?.toString() || ''}
            onChange={(e) => handleFilterChange({ 
              isActive: e.target.value === '' ? undefined : e.target.value === 'true' 
            })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          
          <select
            value={filters.sortBy || 'gameName'}
            onChange={(e) => handleSort(e.target.value, filters.sortDirection || 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="gameName">Name</option>
            <option value="provider">Provider</option>
            <option value="rtpPercentage">RTP</option>
            <option value="createdDate">Created Date</option>
          </select>
          
          <button
            onClick={() => handleSort(
              filters.sortBy || 'gameName', 
              filters.sortDirection === 'asc' ? 'desc' : 'asc'
            )}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {filters.sortDirection === 'desc' ? '↓' : '↑'} Sort
          </button>
        </div>
      </div>
      
      {/* Selection Controls */}
      {canManageGames && (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Select All ({games.length})
            </button>
            {selectedGamesCount > 0 && (
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </button>
            )}
          </div>
          
          {selectedGamesCount > 0 && (
            <span className="text-sm text-gray-600">
              {selectedGamesCount} games selected
            </span>
          )}
        </div>
      )}
      
      {/* Games List */}
      <div className={`
        ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : ''}
        ${viewMode === 'list' ? 'space-y-2' : ''}
        ${viewMode === 'table' ? 'overflow-x-auto' : ''}
      `}>
        {games.map((game) => (
          <GameItem
            key={game.gameId}
            game={game}
            viewMode={viewMode}
            selected={selectedGameIds.has(game.gameId)}
            onSelect={() => handleGameSelect(game.gameId)}
            canManage={canManageGames}
            canViewStats={canViewStats}
          />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
          </div>
        )}
        </div>
      </AsyncErrorBoundary>
    </FeatureErrorBoundary>
  )
}

// Game item component (simplified for brevity)
interface GameItemProps {
  game: Game
  viewMode: 'grid' | 'list' | 'table'
  selected: boolean
  onSelect: () => void
  canManage: boolean
  canViewStats: boolean
}

const GameItem: React.FC<GameItemProps> = ({ 
  game, 
  viewMode, 
  selected, 
  onSelect, 
  canManage, 
  canViewStats 
}) => {
  if (viewMode === 'grid') {
    return (
      <div className={`
        bg-white rounded-lg border-2 p-4 cursor-pointer transition-colors
        ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
      `} onClick={onSelect}>
        <h3 className="font-medium text-gray-900">{game.gameName}</h3>
        <p className="text-sm text-gray-600">{game.provider?.providerName}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className={`px-2 py-1 text-xs rounded ${
            game.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {game.isActive ? 'Active' : 'Inactive'}
          </span>
          {game.rtpPercentage && (
            <span className="text-xs text-gray-500">RTP: {game.rtpPercentage}%</span>
          )}
        </div>
      </div>
    )
  }
  
  // Simplified list/table view
  return (
    <div className="bg-white p-3 rounded border hover:bg-gray-50" onClick={onSelect}>
      <span className="font-medium">{game.gameName}</span>
      <span className="ml-2 text-gray-600">({game.provider?.providerName})</span>
    </div>
  )
}

export default GamesManagement
