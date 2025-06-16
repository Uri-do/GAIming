import React, { useState, useEffect } from 'react'
import { apiService } from '@/services/api'
import { GameRecommendation } from '@/types'

const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(1)

  const fetchRecommendations = async (playerId: number) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Fetching recommendations for player ${playerId}...`)
      const response = await apiService.get<GameRecommendation[]>(`/recommendations/player/${playerId}`)

      console.log('Recommendations response:', response)

      // Handle nested response structure
      const data = response.data || response
      const recommendations = Array.isArray(data) ? data : []

      setRecommendations(recommendations)
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations(selectedPlayerId)
  }, [selectedPlayerId])

  const handlePlayerChange = (playerId: number) => {
    setSelectedPlayerId(playerId)
  }

  const handleRecordClick = async (recommendationId: number) => {
    try {
      await apiService.post(`/recommendations/${recommendationId}/click`)
      console.log(`Recorded click for recommendation ${recommendationId}`)
      // Update the recommendation in the list
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === recommendationId
            ? { ...rec, isClicked: true, clickedAt: new Date().toISOString() }
            : rec
        )
      )
    } catch (err) {
      console.error('Error recording click:', err)
    }
  }

  const handleRecordPlay = async (recommendationId: number) => {
    try {
      await apiService.post(`/recommendations/${recommendationId}/play`)
      console.log(`Recorded play for recommendation ${recommendationId}`)
      // Update the recommendation in the list
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === recommendationId
            ? { ...rec, isPlayed: true, playedAt: new Date().toISOString() }
            : rec
        )
      )
    } catch (err) {
      console.error('Error recording play:', err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recommendations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage AI-powered game recommendations</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading recommendations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recommendations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage AI-powered game recommendations</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error Loading Recommendations</h3>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => fetchRecommendations(selectedPlayerId)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recommendations</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor and manage AI-powered game recommendations ({recommendations.length} recommendations)
        </p>
      </div>

      {/* Player Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Player:
        </label>
        <select
          value={selectedPlayerId}
          onChange={(e) => handlePlayerChange(Number(e.target.value))}
          className="block w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={1}>Player 1</option>
          <option value={2}>Player 2</option>
          <option value={3}>Player 3</option>
          <option value={4}>Player 4</option>
          <option value={5}>Player 5</option>
        </select>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations && recommendations.length > 0 ? recommendations.map((recommendation) => (
          <div key={recommendation.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {recommendation.game?.gameName || `Game ${recommendation.gameId}`}
                  </h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm font-medium">
                    Score: {(recommendation.score * 100).toFixed(1)}%
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded-full text-sm">
                    {recommendation.algorithm}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {recommendation.reason}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Position: {recommendation.position}</span>
                  <span>Category: {recommendation.category}</span>
                  <span>Context: {recommendation.context}</span>
                  <span>Generated: {new Date(recommendation.generatedDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-4 mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    recommendation.isClicked
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {recommendation.isClicked ? 'Clicked' : 'Not Clicked'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    recommendation.isPlayed
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {recommendation.isPlayed ? 'Played' : 'Not Played'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => handleRecordClick(recommendation.id)}
                  disabled={recommendation.isClicked}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Record Click
                </button>
                <button
                  onClick={() => handleRecordPlay(recommendation.id)}
                  disabled={recommendation.isPlayed}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Record Play
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Recommendations Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No recommendations available for Player {selectedPlayerId}.
            </p>
          </div>
        )}
      </div>


    </div>
  )
}

export default Recommendations
