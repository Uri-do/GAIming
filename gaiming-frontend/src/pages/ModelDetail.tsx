import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Brain,
  Settings,
  Play,
  Pause,
  Download,

  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Activity,
  Edit,
  Save,
  X,
  RefreshCw,
  Zap,
  Database,
  Code,
  Monitor,
  TrendingUp
} from 'lucide-react'
import { mlModelsService, type MLModel } from '@/services/mlModelsService'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ModelPerformanceMetrics {
  precision: number
  recall: number
  f1Score: number
  accuracy: number
}

const ModelDetail: React.FC = () => {
  console.log('🔍 ModelDetail component rendering...');
  const { modelId } = useParams<{ modelId: string }>()
  console.log('📍 ModelDetail modelId:', modelId);
  const navigate = useNavigate()
  const [model, setModel] = useState<MLModel | null>(null)
  const [performance, setPerformance] = useState<ModelPerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [performanceLoading, setPerformanceLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedModel, setEditedModel] = useState<Partial<MLModel>>({})

  useEffect(() => {
    if (modelId) {
      fetchModelData()
      fetchModelPerformance()
    }
  }, [modelId])

  const fetchModelData = async () => {
    try {
      setLoading(true)
      setError(null)
      const modelData = await mlModelsService.getModel(Number(modelId))
      setModel(modelData)
      setEditedModel(modelData)
    } catch (err) {
      console.error('Error fetching model data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch model data')
    } finally {
      setLoading(false)
    }
  }

  const fetchModelPerformance = async () => {
    try {
      setPerformanceLoading(true)
      const performanceData = await mlModelsService.getModelPerformance(Number(modelId))
      // Map the external type to our local type
      const mappedData: ModelPerformanceMetrics = {
        precision: performanceData.precision,
        recall: performanceData.recall,
        f1Score: performanceData.f1Score,
        accuracy: performanceData.auc || 0 // Use auc as accuracy fallback
      }
      setPerformance(mappedData)
    } catch (err) {
      console.error('Error fetching model performance:', err)
    } finally {
      setPerformanceLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!model || !editedModel) return

    try {
      const updatedModel = await mlModelsService.updateModel(model.id, editedModel)
      setModel(updatedModel)
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating model:', err)
      setError(err instanceof Error ? err.message : 'Failed to update model')
    }
  }

  const handleCancelEdit = () => {
    setEditedModel(model || {})
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-500 text-white'
      case 'trained': return 'bg-blue-500 text-white'
      case 'training': return 'bg-yellow-500 text-white'
      case 'failed': return 'bg-red-500 text-white'
      case 'retired': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="w-3 h-3" />
      case 'trained': return <Brain className="w-3 h-3" />
      case 'training': return <Clock className="w-3 h-3" />
      case 'failed': return <AlertTriangle className="w-3 h-3" />
      case 'retired': return <X className="w-3 h-3" />
      default: return <Brain className="w-3 h-3" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/models')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Models
          </Button>
        </div>
        <Card variant="gaming" className="text-center">
          <CardContent className="p-8">
            <LoadingSpinner size="xl" variant="gaming" />
            <p className="text-gray-300 mt-4 text-lg">Loading model details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/models')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Models
          </Button>
        </div>
        <Card variant="gaming" className="border-error-500/30">
          <CardHeader variant="gaming">
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-error-400" />
              Error Loading Model
            </CardTitle>
            <CardDescription className="text-gray-400">
              {error || 'Model not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={fetchModelData}
              icon={<RefreshCw />}
            >
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/models')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Models
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {model.name}
            </h1>
            <p className="text-gray-400 mt-1">
              {model.modelType} • Version {model.version}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                icon={<X className="w-4 h-4" />}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveChanges}
                icon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                icon={<Edit className="w-4 h-4" />}
              >
                Edit Model
              </Button>
              <Button 
                variant="primary" 
                icon={<BarChart3 className="w-4 h-4" />}
              >
                View Analytics
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Model Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Model Info */}
        <div className="lg:col-span-2">
          <Card variant="gaming" glow>
            <CardHeader variant="gaming">
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary-400" />
                Model Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Model ID</label>
                  <p className="text-white font-medium">{model.id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <Badge className={getStatusColor(model.status)}>
                    {getStatusIcon(model.status)}
                    <span className="ml-1 capitalize">{model.status}</span>
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Model Type</label>
                  <Badge variant="secondary">{model.modelType}</Badge>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Version</label>
                  <p className="text-white font-medium">v{model.version}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Description</label>
                {isEditing ? (
                  <textarea
                    value={editedModel.description || ''}
                    onChange={(e) => setEditedModel(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-300 mt-1">{model.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Created Date</label>
                  <p className="text-white font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {formatDate(model.createdDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Created By</label>
                  <p className="text-white font-medium">{model.createdBy}</p>
                </div>
              </div>

              {model.lastTrainedDate && (
                <div>
                  <label className="text-sm text-gray-400">Last Trained</label>
                  <p className="text-white font-medium flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    {formatDate(model.lastTrainedDate)}
                  </p>
                </div>
              )}

              {model.deployedDate && (
                <div>
                  <label className="text-sm text-gray-400">Deployed Date</label>
                  <p className="text-white font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    {formatDate(model.deployedDate)}
                  </p>
                </div>
              )}

              {model.filePath && (
                <div>
                  <label className="text-sm text-gray-400">File Path</label>
                  <p className="text-gray-300 font-mono text-sm bg-gray-800 p-2 rounded">
                    {model.filePath}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div>
          <Card variant="gaming" glow>
            <CardHeader variant="gaming">
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-400" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner variant="gaming" />
                  <p className="text-gray-400 mt-2">Loading performance...</p>
                </div>
              ) : performance ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-400">Precision</span>
                      </div>
                      <span className="text-white font-medium">
                        {(performance.precision * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-400">Recall</span>
                      </div>
                      <span className="text-white font-medium">
                        {(performance.recall * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-400">F1 Score</span>
                      </div>
                      <span className="text-white font-medium">
                        {(performance.f1Score * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-gray-400">Accuracy</span>
                      </div>
                      <span className="text-white font-medium">
                        {(performance.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">No performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Configuration and Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Configuration */}
        <Card variant="gaming">
          <CardHeader variant="gaming">
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-400" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {model.configuration && Object.keys(model.configuration).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(model.configuration).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-white font-medium font-mono text-sm">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Code className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No configuration data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Metadata */}
        <Card variant="gaming">
          <CardHeader variant="gaming">
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-primary-400" />
              Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            {model.metadata && Object.keys(model.metadata).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(model.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-white font-medium">
                      {typeof value === 'number' && key.includes('accuracy')
                        ? `${(value * 100).toFixed(1)}%`
                        : String(value)
                      }
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No metadata available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Model Actions */}
      <Card variant="gaming">
        <CardHeader variant="gaming">
          <CardTitle className="text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary-400" />
            Model Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 p-4 h-auto"
              onClick={() => {/* Handle training */}}
            >
              <Zap className="w-5 h-5 text-yellow-400" />
              <div className="text-left">
                <div className="font-medium">Train Model</div>
                <div className="text-sm text-gray-400">Start new training job</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 p-4 h-auto"
              onClick={() => {/* Handle deployment */}}
            >
              {model.status === 'deployed' ? (
                <Pause className="w-5 h-5 text-red-400" />
              ) : (
                <Play className="w-5 h-5 text-green-400" />
              )}
              <div className="text-left">
                <div className="font-medium">
                  {model.status === 'deployed' ? 'Undeploy' : 'Deploy'} Model
                </div>
                <div className="text-sm text-gray-400">
                  {model.status === 'deployed' ? 'Remove from production' : 'Deploy to production'}
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 p-4 h-auto"
              onClick={() => {/* Handle export */}}
            >
              <Download className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <div className="font-medium">Export Model</div>
                <div className="text-sm text-gray-400">Download model file</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ModelDetail
