import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  Star,
  Calendar,
  Filter,
  PieChart
} from 'lucide-react';
import GameAnalyticsCharts from './GameAnalyticsCharts';
import { AnalyticsAccess } from '../auth/GamesAccessControl';

const GamesDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);

  // Mock dashboard data
  const dashboardStats = {
    totalGames: 1247,
    activeGames: 1156,
    newGames: 23,
    popularGames: 89,
    underperformingGames: 12,
    totalRevenue: 2456789.50,
    totalPlayers: 45678,
    totalSessions: 123456,
    averageRtp: 96.2,
    averageRetention: 0.73
  };

  const topGamesByRevenue = [
    { gameId: 1, gameName: "Mega Moolah", providerName: "Microgaming", revenue: 156780.90, change: 12.5 },
    { gameId: 2, gameName: "Starburst", providerName: "NetEnt", revenue: 125000.50, change: 8.3 },
    { gameId: 3, gameName: "Book of Dead", providerName: "Play'n GO", revenue: 98750.25, change: -2.1 },
    { gameId: 4, gameName: "Gonzo's Quest", providerName: "NetEnt", revenue: 87650.75, change: 15.7 },
    { gameId: 5, gameName: "Immortal Romance", providerName: "Microgaming", revenue: 76540.30, change: 5.2 }
  ];

  const topGamesByPlayers = [
    { gameId: 1, gameName: "Starburst", providerName: "NetEnt", players: 15420, change: 18.2 },
    { gameId: 2, gameName: "Book of Dead", providerName: "Play'n GO", players: 12890, change: 12.1 },
    { gameId: 3, gameName: "Mega Moolah", providerName: "Microgaming", players: 8950, change: 7.8 },
    { gameId: 4, gameName: "Gonzo's Quest", providerName: "NetEnt", players: 7650, change: 22.3 },
    { gameId: 5, gameName: "Thunderstruck II", providerName: "Microgaming", players: 6540, change: -3.5 }
  ];

  const providerPerformance = [
    { providerId: 1, providerName: "NetEnt", gameCount: 156, revenue: 456789.25, players: 23456, score: 8.7 },
    { providerId: 2, providerName: "Microgaming", gameCount: 234, revenue: 398765.50, players: 19876, score: 8.4 },
    { providerId: 3, providerName: "Play'n GO", gameCount: 189, revenue: 345678.75, players: 18765, score: 8.1 },
    { providerId: 4, providerName: "Pragmatic Play", gameCount: 145, revenue: 298765.30, players: 16543, score: 7.9 },
    { providerId: 5, providerName: "Evolution", gameCount: 67, revenue: 234567.80, players: 12345, score: 8.9 }
  ];

  const alerts = [
    { id: 1, gameId: 123, gameName: "Lucky Leprechaun", type: "Performance", message: "Revenue down 25% this week", severity: "high" },
    { id: 2, gameId: 456, gameName: "Dragon's Fire", type: "Technical", message: "High error rate detected", severity: "medium" },
    { id: 3, gameId: 789, gameName: "Ocean's Treasure", type: "Compliance", message: "RTP variance outside limits", severity: "high" }
  ];

  const recommendations = [
    { id: 1, gameId: 234, gameName: "Mystic Fortune", type: "Promotion", title: "Boost visibility", description: "Consider featuring this game - showing strong growth potential", priority: "high" },
    { id: 2, gameId: 567, gameName: "Wild West Gold", type: "Configuration", title: "Adjust bet limits", description: "Increase max bet to capture high-roller segment", priority: "medium" },
    { id: 3, gameId: 890, gameName: "Fruit Fiesta", type: "Retirement", title: "Consider retirement", description: "Low engagement for 6+ months", priority: "low" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Games Dashboard</h2>
          <p className="text-gray-600">Overview of game performance and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <AnalyticsAccess showFallback={false}>
            <button
              onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                showAdvancedAnalytics
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <PieChart className="w-4 h-4 mr-2" />
              Advanced Analytics
            </button>
          </AnalyticsAccess>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Games</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalGames.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Games</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeGames.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Players</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalPlayers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${dashboardStats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg RTP</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.averageRtp}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Games by Revenue</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topGamesByRevenue.map((game, index) => (
                <div key={game.gameId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{game.gameName}</p>
                      <p className="text-sm text-gray-500">{game.providerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${game.revenue.toLocaleString()}</p>
                    <div className="flex items-center">
                      {game.change > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${game.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {game.change > 0 ? '+' : ''}{game.change}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Games by Players</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topGamesByPlayers.map((game, index) => (
                <div key={game.gameId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{game.gameName}</p>
                      <p className="text-sm text-gray-500">{game.providerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{game.players.toLocaleString()}</p>
                    <div className="flex items-center">
                      {game.change > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${game.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {game.change > 0 ? '+' : ''}{game.change}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Provider Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Provider Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Games
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Players
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {providerPerformance.map((provider) => (
                <tr key={provider.providerId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{provider.providerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {provider.gameCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${provider.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {provider.players.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{provider.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              Alerts
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{alert.gameName}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Management Recommendations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.gameName}</p>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      {showAdvancedAnalytics && (
        <AnalyticsAccess>
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Analytics Dashboard</h3>
              <p className="text-gray-600">Deep dive into game performance, player behavior, and revenue trends</p>
            </div>
            <GameAnalyticsCharts timeRange={timeRange} />
          </div>
        </AnalyticsAccess>
      )}
    </div>
  );
};

export default GamesDashboard;
