import React from 'react'
import { useParams } from 'react-router-dom'

const GameDetail: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Game Details
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Detailed information for Game ID: {gameId}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Game Analytics
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This page will contain detailed game analytics and performance metrics.
        </p>
      </div>
    </div>
  )
}

export default GameDetail
