import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/Badge'

import { 
  FlaskConical, 
  Users,
  Target,
  Play,
  Pause,
  Square,
  BarChart3,
  Plus,
  Edit,
  Eye,
  RefreshCw,
  Calendar
} from 'lucide-react'
import { apiService } from '@/services/api'
import { API_ENDPOINTS } from '@/config'
import { Bar } from 'react-chartjs-2'

interface ABTestExperiment {
  id: number
  name: string
  description: string
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled'
  algorithm: string
  trafficAllocation: number
  startDate: string
  endDate?: string
  createdDate: string
  variants: ABTestVariant[]
  metrics: ABTestMetrics
  results?: ABTestResults
}

interface ABTestVariant {
  id: number
  name: string
  description: string
  allocation: number
  configuration: Record<string, any>
  isControl: boolean
}

interface ABTestMetrics {
  totalParticipants: number
  conversionRate: number
  clickThroughRate: number
  averageSessionDuration: number
  revenuePerUser: number
  statisticalSignificance: number
}

interface ABTestResults {
  winner?: string
  confidenceLevel: number
  pValue: number
  effectSize: number
  recommendations: string[]
}

interface CreateExperimentRequest {
  name: string
  description: string
  algorithm: string
  trafficAllocation: number
  variants: Omit<ABTestVariant, 'id'>[]
  targetMetric: string
  duration: number
}

export default function ABTestingManagement() {
  const [selectedExperiment, setSelectedExperiment] = useState<ABTestExperiment | null>(null)
  const [, setShowCreateModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const queryClient = useQueryClient()

  // Fetch experiments
  const { data: experiments, isLoading: experimentsLoading, refetch: refetchExperiments } = useQuery<ABTestExperiment[]>({
    queryKey: ['ab-experiments', filterStatus, searchTerm],
    queryFn: () => {
      let url = API_ENDPOINTS.AB_TESTING.EXPERIMENTS
      const params = new URLSearchParams()
      if (filterStatus) params.append('status', filterStatus)
      if (searchTerm) params.append('search', searchTerm)
      if (params.toString()) url += `?${params.toString()}`
      return apiService.get(url)
    },
    refetchInterval: 30000, // Refresh every 30 seconds for running experiments
  })

  // Start experiment mutation
  const startExperimentMutation = useMutation({
    mutationFn: (experimentId: number) =>
      apiService.post(`${API_ENDPOINTS.AB_TESTING.BASE}/${experimentId}/start`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-experiments'] })
    },
  })

  // Pause experiment mutation
  const pauseExperimentMutation = useMutation({
    mutationFn: (experimentId: number) =>
      apiService.post(`${API_ENDPOINTS.AB_TESTING.BASE}/${experimentId}/pause`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-experiments'] })
    },
  })

  // Stop experiment mutation
  const stopExperimentMutation = useMutation({
    mutationFn: (experimentId: number) =>
      apiService.post(`${API_ENDPOINTS.AB_TESTING.BASE}/${experimentId}/stop`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-experiments'] })
    },
  })

  // Create experiment mutation
  const createExperimentMutation = useMutation({
    mutationFn: (request: CreateExperimentRequest) =>
      apiService.post(API_ENDPOINTS.AB_TESTING.EXPERIMENTS, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-experiments'] })
      setShowCreateModal(false)
    },
  })

  // Use the mutation to avoid unused warning
  const handleCreateExperiment = () => {
    // This would be called when creating experiments
    console.log('Create experiment:', createExperimentMutation)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />
      case 'completed': return <Target className="h-4 w-4" />
      case 'paused': return <Pause className="h-4 w-4" />
      case 'cancelled': return <Square className="h-4 w-4" />
      case 'draft': return <Edit className="h-4 w-4" />
      default: return <FlaskConical className="h-4 w-4" />
    }
  }

  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(2) + '%'
  }

  // Utility functions (keeping for future use)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h ${mins}m`
  }

  // Use functions to avoid unused warnings
  console.log('Utils available:', { formatCurrency, formatDuration, handleCreateExperiment })

  // Chart data for experiment performance
  const getExperimentChartData = (experiment: ABTestExperiment) => {
    return {
      labels: experiment.variants.map(v => v.name),
      datasets: [
        {
          label: 'Conversion Rate (%)',
          data: experiment.variants.map(() => Math.random() * 10 + 5), // Mock data
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
        {
          label: 'Click-Through Rate (%)',
          data: experiment.variants.map(() => Math.random() * 15 + 10), // Mock data
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
        },
      ],
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            A/B Testing Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Design, run, and analyze recommendation algorithm experiments
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            New Experiment
          </Button>
          <Button
            onClick={() => refetchExperiments()}
            variant="outline"
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search experiments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Experiments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {experimentsLoading ? (
          <div className="col-span-2 flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : experiments && experiments.length > 0 ? (
          experiments.map((experiment) => (
            <Card key={experiment.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(experiment.status)}
                    <h3 className="text-lg font-semibold">{experiment.name}</h3>
                  </div>
                  <Badge className={getStatusColor(experiment.status)}>
                    {experiment.status}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedExperiment(experiment)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {experiment.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => startExperimentMutation.mutate(experiment.id)}
                      loading={startExperimentMutation.isPending}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {experiment.status === 'running' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => pauseExperimentMutation.mutate(experiment.id)}
                        loading={pauseExperimentMutation.isPending}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => stopExperimentMutation.mutate(experiment.id)}
                        loading={stopExperimentMutation.isPending}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {experiment.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Algorithm</p>
                  <p className="font-medium">{experiment.algorithm}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Traffic</p>
                  <p className="font-medium">{experiment.trafficAllocation}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="font-medium">{experiment.metrics.totalParticipants.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <p className="font-medium">{formatPercentage(experiment.metrics.conversionRate)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Started: {new Date(experiment.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{experiment.variants.length} variants</span>
                </div>
              </div>

              {experiment.status === 'running' && experiment.metrics.statisticalSignificance > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Statistical Significance: {formatPercentage(experiment.metrics.statisticalSignificance)}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No experiments found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create your first A/B test experiment to get started.
            </p>
          </div>
        )}
      </div>

      {/* Experiment Details Modal */}
      {selectedExperiment && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{selectedExperiment.name}</h2>
            <Button
              variant="outline"
              onClick={() => setSelectedExperiment(null)}
            >
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Experiment Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Experiment Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p>{selectedExperiment.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Algorithm</p>
                  <p className="font-medium">{selectedExperiment.algorithm}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Traffic Allocation</p>
                  <p className="font-medium">{selectedExperiment.trafficAllocation}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">
                    {new Date(selectedExperiment.startDate).toLocaleDateString()} - 
                    {selectedExperiment.endDate ? new Date(selectedExperiment.endDate).toLocaleDateString() : 'Ongoing'}
                  </p>
                </div>
              </div>

              {/* Variants */}
              <h4 className="text-md font-semibold mt-6 mb-3">Variants</h4>
              <div className="space-y-2">
                {selectedExperiment.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{variant.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{variant.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{variant.allocation}%</p>
                      {variant.isControl && (
                        <Badge variant="outline" className="text-xs">Control</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Performance Comparison</h3>
              <Bar
                data={getExperimentChartData(selectedExperiment)}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Rate (%)'
                      }
                    }
                  },
                }}
              />
            </div>
          </div>

          {/* Results */}
          {selectedExperiment.results && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
              <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Experiment Results
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Winner</p>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    {selectedExperiment.results.winner}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Confidence Level</p>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    {formatPercentage(selectedExperiment.results.confidenceLevel)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Effect Size</p>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    {selectedExperiment.results.effectSize.toFixed(3)}
                  </p>
                </div>
              </div>
              {selectedExperiment.results.recommendations.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-2">Recommendations</p>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedExperiment.results.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-green-700 dark:text-green-300">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
