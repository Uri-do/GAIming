import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Brain,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  RefreshCw,
  Plus,
  Download,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import { mlModelsService, type MLModel, type ModelRequest } from '../services/mlModelsService';
import type { ModelPerformanceMetrics } from '../types';

import BarChart from '../components/charts/BarChart';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import AuthGuard, { usePermissions } from '../components/auth/AuthGuard';
import { exportService } from '../services/exportService';

const ModelsContent: React.FC = () => {
  const { canManageModels, canExportModels, canDeployModels } = usePermissions();
  const [models, setModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [modelPerformance, setModelPerformance] = useState<Record<number, ModelPerformanceMetrics>>({});

  // Suppress unused variable warning for future use
  console.log('Selected model:', selectedModel);

  // Filters and pagination
  const [filters, setFilters] = useState<ModelRequest>({
    page: 1,
    pageSize: 20,
    search: '',
    sortBy: 'createdDate',
    sortDirection: 'desc',
  });

  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  useEffect(() => {
    loadModels();
  }, [filters]);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mlModelsService.getModels(filters);
      setModels(response.items);
      setPagination({
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage,
      });

      // Load performance metrics for each model
      const performancePromises = response.items.map(async (model) => {
        try {
          const performance = await mlModelsService.getModelPerformance(model.id);
          return { modelId: model.id, performance };
        } catch (err) {
          console.error(`Failed to load performance for model ${model.id}:`, err);
          return null;
        }
      });

      const performanceResults = await Promise.all(performancePromises);
      const performanceMap: Record<number, ModelPerformanceMetrics> = {};

      performanceResults.forEach((result) => {
        if (result) {
          performanceMap[result.modelId] = result.performance;
        }
      });

      setModelPerformance(performanceMap);
    } catch (err) {
      setError('Failed to load ML models');
      console.error('Error loading models:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleFilterChange = (key: keyof ModelRequest, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'trained':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'training':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'retired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="h-4 w-4" />;
      case 'trained':
        return <Brain className="h-4 w-4" />;
      case 'training':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4" />;
      case 'retired':
        return <Pause className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const handleExportModels = async (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    if (!canExportModels) {
      setError('You do not have permission to export model data');
      return;
    }

    try {
      setLoading(true);

      // Use the export service
      exportService.exportModelsData(
        models,
        format,
        {
          filename: 'ml-models-export',
          includeTimestamp: true,
          customHeaders: { title: 'GAIming ML Models Report' }
        }
      );
    } catch (err) {
      setError('Failed to export model data');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };



  if (loading && !models.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>ML Models Management - GAIming</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ML Models Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage machine learning models and monitor performance
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadModels()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {canExportModels && (
              <div className="relative group">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => handleExportModels('csv')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExportModels('excel')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export Excel
                  </button>
                  <button
                    onClick={() => handleExportModels('pdf')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            )}

            {canManageModels && (
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Model
              </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Models
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pagination.totalCount}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center mt-1">
                  <Brain className="h-3 w-3 mr-1" />
                  Active: {models.filter(m => m.isActive).length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Deployed Models
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {models.filter(m => m.status === 'deployed').length}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Production Ready
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Training Models
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {models.filter(m => m.status === 'training').length}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  In Progress
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Accuracy
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.values(modelPerformance).length > 0
                    ? formatPercentage(
                        Object.values(modelPerformance).reduce((sum, perf) => sum + perf.precision, 0) /
                        Object.values(modelPerformance).length
                      )
                    : 'N/A'}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400 flex items-center mt-1">
                  <Target className="h-3 w-3 mr-1" />
                  Performance
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Performance Overview Chart */}
        {Object.values(modelPerformance).length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Model Performance Comparison
            </h3>
            <BarChart
              data={models.map(model => {
                const perf = modelPerformance[model.id];
                return {
                  name: model.name,
                  precision: perf ? perf.precision * 100 : 0,
                  recall: perf ? perf.recall * 100 : 0,
                  f1Score: perf ? perf.f1Score * 100 : 0,
                };
              })}
              bars={[
                {
                  dataKey: 'precision',
                  fill: '#3B82F6',
                  name: 'Precision (%)',
                },
                {
                  dataKey: 'recall',
                  fill: '#10B981',
                  name: 'Recall (%)',
                },
                {
                  dataKey: 'f1Score',
                  fill: '#8B5CF6',
                  name: 'F1 Score (%)',
                },
              ]}
              height={300}
              formatYAxis={(value) => `${value}%`}
              formatTooltip={(value, name) => [`${value.toFixed(1)}%`, name]}
            />
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Brain className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filters.modelType || ''}
                onChange={(e) => handleFilterChange('modelType', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="collaborative">Collaborative Filtering</option>
                <option value="content-based">Content-Based</option>
                <option value="hybrid">Hybrid</option>
                <option value="deep-learning">Deep Learning</option>
              </select>

              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="training">Training</option>
                <option value="trained">Trained</option>
                <option value="deployed">Deployed</option>
                <option value="retired">Retired</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Models Table */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              ML Models ({pagination.totalCount})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Trained
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Deployed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {models.map((model) => {
                  const performance = modelPerformance[model.id];
                  return (
                    <tr
                      key={model.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <Brain className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {model.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              v{model.version}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary">
                          {model.modelType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(model.status)}>
                          {getStatusIcon(model.status)}
                          <span className="ml-1 capitalize">{model.status}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {performance ? (
                          <div className="text-sm">
                            <div className="text-gray-900 dark:text-white">
                              Precision: {formatPercentage(performance.precision)}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              F1: {formatPercentage(performance.f1Score)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {model.lastTrainedDate ? formatDate(model.lastTrainedDate) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {model.deployedDate ? formatDate(model.deployedDate) : 'Not deployed'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {model.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedModel(model)}
                            title="View Model Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {canDeployModels && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* Handle deploy/train */}}
                              title={model.status === 'deployed' ? 'Pause Model' : 'Deploy/Train Model'}
                            >
                              {model.status === 'deployed' ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          )}

                          {canManageModels && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* Handle more actions */}}
                              title="More Actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          )}

                          {!canDeployModels && !canManageModels && (
                            <span className="text-gray-400 dark:text-gray-500 text-sm">
                              Limited access
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
      </div>
    </>
  );
};

const Models: React.FC = () => (
  <AuthGuard requiredPermissions={['models.view']}>
    <ModelsContent />
  </AuthGuard>
);

export default Models;
