import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  RefreshCw,
  Users,
  TrendingUp,
  AlertTriangle,
  Eye,
  UserCheck,
  Shield,
  Star,
  DollarSign,
} from 'lucide-react';
import { playerAnalyticsService, type PlayerAnalytics, type PlayerAnalyticsRequest, type PlayersOverview } from '../services/playerAnalyticsService';

import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AuthGuard, { usePermissions } from '../components/auth/AuthGuard';
import ExportProgressDialog from '../components/export/ExportProgressDialog';
import { useExport } from '../hooks/useExport';

const PlayersContent: React.FC = () => {
  const navigate = useNavigate();
  const { canExportPlayers, user } = usePermissions();
  const [players, setPlayers] = useState<PlayerAnalytics[]>([]);
  const [overview, setOverview] = useState<PlayersOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer] = useState<PlayerAnalytics | null>(null);
  const [showExportProgress, setShowExportProgress] = useState(false);

  // Export hook with progress tracking
  const {
    isExporting,
    progress: exportProgress,
    exportPlayers: exportPlayersData,
    cancelExport,
    clearError: clearExportError,
  } = useExport({
    onSuccess: () => {
      setShowExportProgress(false);
    },
    onError: (err) => {
      setError(`Export failed: ${err.message}`);
      setShowExportProgress(false);
    },
  });

  // Suppress unused variable warnings for future use
  console.log('Selected player:', selectedPlayer);

  // Filters and pagination
  const [filters, setFilters] = useState<PlayerAnalyticsRequest>({
    page: 1,
    pageSize: 20,
    search: '',
    sortBy: 'registrationDate',
    sortDirection: 'desc',
  });

  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [playersResponse, overviewData] = await Promise.all([
        playerAnalyticsService.getPlayers(filters),
        playerAnalyticsService.getPlayersOverview(30, 100),
      ]);

      setPlayers(playersResponse.items);
      setPagination({
        totalCount: playersResponse.totalCount,
        totalPages: playersResponse.totalPages,
        hasNextPage: playersResponse.hasNextPage,
        hasPreviousPage: playersResponse.hasPreviousPage,
      });
      setOverview(overviewData);
    } catch (err) {
      setError('Failed to load player data');
      console.error('Error loading players:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleFilterChange = (key: keyof PlayerAnalyticsRequest, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handlePlayerClick = (player: PlayerAnalytics) => {
    navigate(`/players/${player.playerId}`);
  };

  const handleViewPlayerDetails = (player: PlayerAnalytics, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    navigate(`/players/${player.playerId}`);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    if (!canExportPlayers) {
      setError('You do not have permission to export data');
      return;
    }

    if (isExporting) {
      return; // Prevent multiple exports
    }

    try {
      clearExportError();
      setShowExportProgress(true);

      await exportPlayersData(
        players,
        format,
        user?.role === 'Admin' // Include sensitive data only for admins
      );
    } catch (err) {
      setError('Failed to start export');
      console.error('Export error:', err);
      setShowExportProgress(false);
    }
  };

  const getVipLevelColor = (level: number) => {
    if (level >= 4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (level >= 2) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getRiskLevelColor = (level: number) => {
    if (level >= 4) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (level >= 3) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    if (level >= 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };



  if (loading && !players.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Players Management - GAIming</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Players Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage player data and analyze behavior patterns
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {canExportPlayers && (
              <div className="relative group">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export Excel
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Players
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overview.totalPlayers.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Players
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overview.activePlayers.toLocaleString()}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    New Players
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overview.newPlayers.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(overview.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        {overview && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Player Segments
              </h3>
              <PieChart
                data={Object.entries(overview.playerSegments).map(([name, value]) => ({
                  name,
                  value,
                }))}
                height={250}
                formatTooltip={(value, name) => [`${value} players`, name]}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                VIP Level Distribution
              </h3>
              <BarChart
                data={Object.entries(overview.vipDistribution).map(([name, value]) => ({
                  name: `VIP ${name}`,
                  players: value,
                }))}
                bars={[
                  {
                    dataKey: 'players',
                    fill: '#3B82F6',
                    name: 'Players',
                  },
                ]}
                height={250}
                formatTooltip={(value, name) => [`${value} players`, name]}
              />
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filters.vipLevel || ''}
                onChange={(e) => handleFilterChange('vipLevel', e.target.value ? parseInt(e.target.value) : undefined)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All VIP Levels</option>
                <option value="1">VIP 1</option>
                <option value="2">VIP 2</option>
                <option value="3">VIP 3</option>
                <option value="4">VIP 4</option>
                <option value="5">VIP 5</option>
              </select>

              <select
                value={filters.segment || ''}
                onChange={(e) => handleFilterChange('segment', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Segments</option>
                <option value="High Value">High Value</option>
                <option value="Regular">Regular</option>
                <option value="Casual">Casual</option>
              </select>

              <select
                value={filters.isActive?.toString() || ''}
                onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Players Table */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Players ({pagination.totalCount.toLocaleString()})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Segment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    VIP Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {players.map((player) => (
                  <tr
                    key={player.playerId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => handlePlayerClick(player)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {player.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {player.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {player.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary">
                        {player.playerSegment}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getVipLevelColor(player.vipLevel)}>
                        <Star className="h-3 w-3 mr-1" />
                        VIP {player.vipLevel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getRiskLevelColor(player.riskLevel)}>
                        <Shield className="h-3 w-3 mr-1" />
                        Risk {player.riskLevel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(player.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {player.totalSessions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {player.lastLoginDate ? formatDate(player.lastLoginDate) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={player.isActive ? 'success' : 'error'}>
                        {player.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleViewPlayerDetails(player, e)}
                        title="View Player Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((filters.page || 1) - 1) * (filters.pageSize || 20) + 1} to{' '}
                  {Math.min((filters.page || 1) * (filters.pageSize || 20), pagination.totalCount)} of{' '}
                  {pagination.totalCount} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                    disabled={!pagination.hasPreviousPage}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {filters.page || 1} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Export Progress Dialog */}
        <ExportProgressDialog
          isOpen={showExportProgress}
          onClose={() => setShowExportProgress(false)}
          progress={exportProgress}
          onCancel={cancelExport}
        />
      </div>
    </>
  );
};

const Players: React.FC = () => (
  <AuthGuard requiredPermissions={['players.view']}>
    <PlayersContent />
  </AuthGuard>
);

export default Players;
