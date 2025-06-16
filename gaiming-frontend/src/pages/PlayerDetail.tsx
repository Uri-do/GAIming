import React from 'react'
import { useParams } from 'react-router-dom'

const PlayerDetail: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Player Details
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Detailed information for Player ID: {playerId}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Player Profile & Recommendations
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This page will contain detailed player profile and recommendation history.
        </p>
      </div>
    </div>
  )
}

export default PlayerDetail
