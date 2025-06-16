import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  BarChart3,
  TrendingUp,
  Eye,
  EyeOff,
  Edit,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Grid,
  List
} from 'lucide-react';
import GameDetailModal from '../components/games/GameDetailModal';
import GamesDashboard from '../components/games/GamesDashboard';
import {
  ViewGamesAccess,
  ManageGamesAccess,
  ExportGamesAccess,
  ImportGamesAccess,
  UserPermissionsSummary
} from '../components/auth/GamesAccessControl';
import { useAuth } from '../hooks/useAuth';
import GameFileManager from '../components/games/GameFileManager';

// Mock data for demonstration
const mockGames = [
  {
    gameId: 1,
    gameName: "Starburst",
    providerName: "NetEnt",
    gameTypeName: "Slot",
    volatilityName: "Low",
    themeName: "Space",
    isActive: true,
    isMobile: true,
    isDesktop: true,
    isNewGame: false,
    hideInLobby: false,
    gameOrder: 1,
    minBetAmount: 0.10,
    maxBetAmount: 100.00,
    rtpPercentage: 96.1,
    releaseDate: "2012-01-01",
    totalPlayers: 15420,
    activePlayer: 892,
    totalRevenue: 125000.50,
    popularityScore: 8.7,
    retentionRate: 0.75,
    recommendationCount: 2340,
    recommendationCtr: 0.15,
    status: "Popular"
  },
  {
    gameId: 2,
    gameName: "Book of Dead",
    providerName: "Play'n GO",
    gameTypeName: "Slot",
    volatilityName: "High",
    themeName: "Adventure",
    isActive: true,
    isMobile: true,
    isDesktop: true,
    isNewGame: false,
    hideInLobby: false,
    gameOrder: 2,
    minBetAmount: 0.01,
    maxBetAmount: 50.00,
    rtpPercentage: 94.25,
    releaseDate: "2016-01-01",
    totalPlayers: 12890,
    activePlayer: 654,
    totalRevenue: 98750.25,
    popularityScore: 8.2,
    retentionRate: 0.68,
    recommendationCount: 1890,
    recommendationCtr: 0.12,
    status: "Active"
  },
  {
    gameId: 3,
    gameName: "Mega Moolah",
    providerName: "Microgaming",
    gameTypeName: "Progressive Slot",
    volatilityName: "Medium",
    themeName: "Safari",
    isActive: true,
    isMobile: true,
    isDesktop: true,
    isNewGame: false,
    hideInLobby: false,
    gameOrder: 3,
    minBetAmount: 0.25,
    maxBetAmount: 6.25,
    rtpPercentage: 88.12,
    releaseDate: "2006-01-01",
    totalPlayers: 8950,
    activePlayer: 423,
    totalRevenue: 156780.90,
    popularityScore: 9.1,
    retentionRate: 0.82,
    recommendationCount: 3450,
    recommendationCtr: 0.18,
    status: "Jackpot"
  }
];

const GamesManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [games, setGames] = useState(mockGames);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('gameName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'list'>('dashboard');
  const [showPermissions, setShowPermissions] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const [fileManagerMode, setFileManagerMode] = useState<'export' | 'import'>('export');

  // Filter games based on search and filters
  const filteredGames = games.filter(game => {
    const matchesSearch = game.gameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = !selectedProvider || game.providerName === selectedProvider;
    const matchesStatus = !selectedStatus || game.status === selectedStatus;
    
    return matchesSearch && matchesProvider && matchesStatus;
  });

  // Get unique providers and statuses for filters
  const providers = [...new Set(games.map(game => game.providerName))];
  const statuses = [...new Set(games.map(game => game.status))];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleSelectGame = (gameId: number) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGames.length === filteredGames.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(filteredGames.map(game => game.gameId));
    }
  };

  const toggleGameStatus = (gameId: number) => {
    setGames(prev => prev.map(game => 
      game.gameId === gameId 
        ? { ...game, isActive: !game.isActive, status: game.isActive ? 'Inactive' : 'Active' }
        : game
    ));
  };

  const toggleLobbyVisibility = (gameId: number) => {
    setGames(prev => prev.map(game =>
      game.gameId === gameId
        ? { ...game, hideInLobby: !game.hideInLobby }
        : game
    ));
  };

  const handleEditGame = (game: any) => {
    setSelectedGame(game);
    setShowGameModal(true);
  };

  const handleSaveGame = (updatedGame: any) => {
    setGames(prev => prev.map(game =>
      game.gameId === updatedGame.gameId ? updatedGame : game
    ));
  };

  return (
    <>
      <Helmet>
        <title>Games Management - GAIming Admin</title>
        <meta name="description" content="Manage game catalog, analytics, and settings" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <ViewGamesAccess>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Games Management</h1>
                <p className="text-gray-600 mt-2">Manage your game catalog, analytics, and settings</p>
              </div>
              <div className="flex space-x-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'dashboard'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid className="w-4 h-4 mr-2" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentView('list')}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'list'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="w-4 h-4 mr-2" />
                    Games List
                  </button>
                </div>

                <ManageGamesAccess showFallback={false}>
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Game
                  </button>
                </ManageGamesAccess>

                <ImportGamesAccess showFallback={false}>
                  <button
                    onClick={() => {
                      setFileManagerMode('import');
                      setShowFileManager(true);
                    }}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </button>
                </ImportGamesAccess>

                <ExportGamesAccess showFallback={false}>
                  <button
                    onClick={() => {
                      setFileManagerMode('export');
                      setShowFileManager(true);
                    }}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </ExportGamesAccess>

                <button
                  onClick={() => setShowPermissions(!showPermissions)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Permissions
                </button>
              </div>
            </div>
          </div>

          {/* Permissions Panel */}
          {showPermissions && (
            <div className="mb-8">
              <UserPermissionsSummary />
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Games</p>
                  <p className="text-2xl font-bold text-gray-900">{games.length}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{games.filter(g => g.isActive).length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Players</p>
                  <p className="text-2xl font-bold text-gray-900">{games.reduce((sum, g) => sum + g.totalPlayers, 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${games.reduce((sum, g) => sum + g.totalRevenue, 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard View */}
          {currentView === 'dashboard' && <GamesDashboard />}

          {/* List View */}
          {currentView === 'list' && (
            <>
              {/* Search and Filters */}
              <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Providers</option>
                      {providers.map(provider => (
                        <option key={provider} value={provider}>{provider}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Statuses</option>
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="gameName">Game Name</option>
                      <option value="providerName">Provider</option>
                      <option value="totalPlayers">Total Players</option>
                      <option value="totalRevenue">Revenue</option>
                      <option value="popularityScore">Popularity</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Games Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedGames.length === filteredGames.length && filteredGames.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('gameName')}
                    >
                      Game Name
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('providerName')}
                    >
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalPlayers')}
                    >
                      Players
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalRevenue')}
                    >
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RTP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGames.map((game) => (
                    <tr key={game.gameId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedGames.includes(game.gameId)}
                          onChange={() => handleSelectGame(game.gameId)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{game.gameName}</div>
                            <div className="text-sm text-gray-500">{game.themeName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {game.providerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {game.gameTypeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          game.status === 'Popular' ? 'bg-green-100 text-green-800' :
                          game.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                          game.status === 'Jackpot' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {game.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {game.totalPlayers.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${game.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {game.rtpPercentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleGameStatus(game.gameId)}
                            className={`p-1 rounded ${game.isActive ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'}`}
                            title={game.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {game.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEditGame(game)}
                            className="p-1 rounded text-blue-600 hover:bg-blue-100"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 rounded text-gray-600 hover:bg-gray-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedGames.length > 0 && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{selectedGames.length} games selected</span>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Bulk Edit
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Activate All
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Deactivate All
                </button>
                <button 
                  onClick={() => setSelectedGames([])}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
            </>
          )}

          {/* Game Detail Modal */}
          <GameDetailModal
            game={selectedGame}
            isOpen={showGameModal}
            onClose={() => setShowGameModal(false)}
            onSave={handleSaveGame}
          />

          {/* File Manager Modal */}
          <GameFileManager
            isOpen={showFileManager}
            onClose={() => setShowFileManager(false)}
            mode={fileManagerMode}
          />
          </ViewGamesAccess>
        </div>
      </div>
    </>
  );
};

export default GamesManagementPage;
