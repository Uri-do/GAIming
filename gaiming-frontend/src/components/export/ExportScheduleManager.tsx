import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Download,

  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import {
  exportSchedulingService,
  type ExportSchedule,
  type ScheduleListRequest,
  type ScheduleFrequency,
  type ExportType,
} from '../../services/exportSchedulingService';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import LoadingSpinner from '../UI/LoadingSpinner';

interface ExportScheduleManagerProps {
  className?: string;
}

const ExportScheduleManager: React.FC<ExportScheduleManagerProps> = ({ className = '' }) => {
  const [schedules, setSchedules] = useState<ExportSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Suppress unused variable warning for future use
  console.log('Show create dialog:', showCreateDialog);
  
  const [filters, setFilters] = useState<ScheduleListRequest>({
    page: 1,
    pageSize: 20,
    sortBy: 'nextRunDate',
    sortDirection: 'asc',
  });
  
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  useEffect(() => {
    loadSchedules();
  }, [filters]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await exportSchedulingService.getSchedules(filters);
      setSchedules(response.items);
      setPagination({
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage,
      });
    } catch (err) {
      setError('Failed to load export schedules');
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSchedule = async (schedule: ExportSchedule) => {
    try {
      await exportSchedulingService.toggleSchedule(schedule.id, !schedule.isActive);
      await loadSchedules();
    } catch (err) {
      setError(`Failed to ${schedule.isActive ? 'disable' : 'enable'} schedule`);
      console.error('Error toggling schedule:', err);
    }
  };

  const handleExecuteNow = async (schedule: ExportSchedule) => {
    try {
      await exportSchedulingService.executeScheduleNow(schedule.id);
      // Show success message or redirect to execution details
    } catch (err) {
      setError('Failed to execute schedule');
      console.error('Error executing schedule:', err);
    }
  };

  const handleDeleteSchedule = async (schedule: ExportSchedule) => {
    if (!confirm(`Are you sure you want to delete the schedule "${schedule.name}"?`)) {
      return;
    }

    try {
      await exportSchedulingService.deleteSchedule(schedule.id);
      await loadSchedules();
    } catch (err) {
      setError('Failed to delete schedule');
      console.error('Error deleting schedule:', err);
    }
  };

  const getFrequencyBadgeColor = (frequency: ScheduleFrequency) => {
    switch (frequency) {
      case 'daily':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'weekly':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'monthly':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'quarterly':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getExportTypeBadgeColor = (exportType: ExportType) => {
    switch (exportType) {
      case 'players':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'analytics':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'models':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'comprehensive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeliveryMethods = (schedule: ExportSchedule) => {
    const methods = [];
    if (schedule.deliveryConfig.emailDelivery?.enabled) methods.push('Email');
    if (schedule.deliveryConfig.fileStorage?.enabled) methods.push('Storage');
    if (schedule.deliveryConfig.webhook?.enabled) methods.push('Webhook');
    return methods;
  };

  if (loading && schedules.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Export Schedules
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage automated export schedules and delivery
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadSchedules()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search schedules..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.exportType || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, exportType: e.target.value as ExportType || undefined, page: 1 }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="players">Players</option>
              <option value="analytics">Analytics</option>
              <option value="models">Models</option>
              <option value="comprehensive">Comprehensive</option>
            </select>

            <select
              value={filters.frequency || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, frequency: e.target.value as ScheduleFrequency || undefined, page: 1 }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Frequencies</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>

            <select
              value={filters.isActive?.toString() || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value === '' ? undefined : e.target.value === 'true', page: 1 }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Schedules List */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {schedule.name}
                  </h3>
                  <Badge variant={schedule.isActive ? 'success' : 'secondary'}>
                    {schedule.isActive ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
                
                {schedule.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {schedule.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={getExportTypeBadgeColor(schedule.exportType)}>
                    {schedule.exportType}
                  </Badge>
                  <Badge className={getFrequencyBadgeColor(schedule.frequency)}>
                    <Clock className="h-3 w-3 mr-1" />
                    {schedule.frequency}
                  </Badge>
                  <Badge variant="outline">
                    {schedule.format.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Next Run:</span>{' '}
                    {formatDate(schedule.nextRunDate)}
                  </div>
                  <div>
                    <span className="font-medium">Last Run:</span>{' '}
                    {schedule.lastRunDate ? formatDate(schedule.lastRunDate) : 'Never'}
                  </div>
                  <div>
                    <span className="font-medium">Created By:</span>{' '}
                    {schedule.createdBy}
                  </div>
                  <div>
                    <span className="font-medium">Delivery:</span>{' '}
                    {getDeliveryMethods(schedule).join(', ') || 'None'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleSchedule(schedule)}
                  title={schedule.isActive ? 'Disable Schedule' : 'Enable Schedule'}
                >
                  {schedule.isActive ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExecuteNow(schedule)}
                  title="Execute Now"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* Handle edit */}}
                  title="Edit Schedule"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSchedule(schedule)}
                  title="Delete Schedule"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((filters.page || 1) - 1) * (filters.pageSize || 20) + 1} to{' '}
            {Math.min((filters.page || 1) * (filters.pageSize || 20), pagination.totalCount)} of{' '}
            {pagination.totalCount} schedules
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
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
              onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {schedules.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Export Schedules
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first automated export schedule to get started.
          </p>
          <Button
            variant="primary"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ExportScheduleManager;
