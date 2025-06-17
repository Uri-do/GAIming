/**
 * AI Innovation Lab
 * Advanced AI technology showcase and experimentation platform
 */

import React, { useState, useEffect } from 'react'
import { 
  Brain, Cpu, Zap, Target, TrendingUp, Eye, Mic, 
  MessageSquare, Image, BarChart3, Activity, Sparkles,
  Settings, Play, Pause, RefreshCw, Download, Upload
} from 'lucide-react'
import { FeatureErrorBoundary } from '@/shared/components'
import { useNotificationStore } from '@/app/store/notificationStore'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import EnhancedButton from '@/shared/components/enhanced/EnhancedButton'
import { AnimatedElement, ProgressBar } from '@/shared/components/animations/AnimationSystem'
import EnhancedCard, { CardGrid } from '@/shared/components/enhanced/EnhancedCard'
import LineChart from '@/features/analytics/components/charts/LineChart'

interface AIModel {
  id: string
  name: string
  type: 'recommendation' | 'prediction' | 'classification' | 'generation' | 'optimization'
  status: 'training' | 'deployed' | 'testing' | 'archived'
  accuracy: number
  performance: number
  lastTrained: string
  dataPoints: number
  version: string
  description: string
}

interface AIExperiment {
  id: string
  name: string
  hypothesis: string
  status: 'running' | 'completed' | 'failed' | 'planned'
  progress: number
  startDate: string
  expectedCompletion: string
  metrics: {
    accuracy: number
    precision: number
    recall: number
    f1Score: number
  }
  businessImpact: string
}

const AIInnovationLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'experiments' | 'insights' | 'innovation'>('models')
  const [models, setModels] = useState<AIModel[]>([])
  const [experiments, setExperiments] = useState<AIExperiment[]>([])
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>({})
  const [isTraining, setIsTraining] = useState(false)

  const notifications = useNotificationStore()

  // Initialize AI models and experiments
  useEffect(() => {
    initializeAIData()
    startRealTimeMetrics()
  }, [])

  const initializeAIData = () => {
    const sampleModels: AIModel[] = [
      {
        id: '1',
        name: 'Player Behavior Predictor',
        type: 'prediction',
        status: 'deployed',
        accuracy: 94.2,
        performance: 98.5,
        lastTrained: '2024-12-15',
        dataPoints: 2500000,
        version: 'v2.1.3',
        description: 'Predicts player churn, lifetime value, and next actions using deep learning'
      },
      {
        id: '2',
        name: 'Game Recommendation Engine',
        type: 'recommendation',
        status: 'deployed',
        accuracy: 91.8,
        performance: 96.3,
        lastTrained: '2024-12-14',
        dataPoints: 1800000,
        version: 'v3.0.1',
        description: 'Collaborative filtering + content-based hybrid recommendation system'
      },
      {
        id: '3',
        name: 'Fraud Detection System',
        type: 'classification',
        status: 'deployed',
        accuracy: 99.1,
        performance: 94.7,
        lastTrained: '2024-12-16',
        dataPoints: 850000,
        version: 'v1.5.2',
        description: 'Real-time fraud detection using ensemble methods and anomaly detection'
      },
      {
        id: '4',
        name: 'Dynamic Pricing Optimizer',
        type: 'optimization',
        status: 'testing',
        accuracy: 87.3,
        performance: 89.1,
        lastTrained: '2024-12-13',
        dataPoints: 650000,
        version: 'v1.0.0-beta',
        description: 'AI-powered dynamic pricing optimization for maximum revenue'
      },
      {
        id: '5',
        name: 'Content Generation AI',
        type: 'generation',
        status: 'training',
        accuracy: 82.5,
        performance: 76.8,
        lastTrained: '2024-12-16',
        dataPoints: 450000,
        version: 'v0.9.1-alpha',
        description: 'GPT-based content generation for game descriptions and marketing copy'
      }
    ]

    const sampleExperiments: AIExperiment[] = [
      {
        id: '1',
        name: 'Multi-Modal Player Sentiment Analysis',
        hypothesis: 'Combining text, voice, and behavioral data will improve sentiment prediction by 15%',
        status: 'running',
        progress: 67,
        startDate: '2024-12-10',
        expectedCompletion: '2024-12-25',
        metrics: { accuracy: 89.3, precision: 87.1, recall: 91.2, f1Score: 89.1 },
        businessImpact: 'Improved player satisfaction prediction and proactive support'
      },
      {
        id: '2',
        name: 'Real-Time Personalization Engine',
        hypothesis: 'Sub-100ms personalization will increase engagement by 25%',
        status: 'running',
        progress: 43,
        startDate: '2024-12-08',
        expectedCompletion: '2024-12-30',
        metrics: { accuracy: 92.7, precision: 90.4, recall: 94.1, f1Score: 92.2 },
        businessImpact: 'Increased session duration and player retention'
      },
      {
        id: '3',
        name: 'Predictive Game Balancing',
        hypothesis: 'AI-driven game balance adjustments will improve player retention by 20%',
        status: 'completed',
        progress: 100,
        startDate: '2024-11-15',
        expectedCompletion: '2024-12-01',
        metrics: { accuracy: 95.8, precision: 94.2, recall: 97.1, f1Score: 95.6 },
        businessImpact: 'Reduced player churn and improved game satisfaction'
      }
    ]

    setModels(sampleModels)
    setExperiments(sampleExperiments)
  }

  const startRealTimeMetrics = () => {
    const interval = setInterval(() => {
      setRealTimeMetrics({
        modelsActive: 5,
        predictionsPerSecond: 1247 + Math.floor(Math.random() * 200),
        accuracyScore: 93.2 + Math.random() * 2,
        dataProcessed: 2.8 + Math.random() * 0.5,
        experimentsRunning: 2,
        timestamp: new Date().toISOString()
      })
    }, 2000)

    return () => clearInterval(interval)
  }

  const handleTrainModel = async (modelId: string) => {
    setIsTraining(true)
    notifications.showInfo('Training Started', 'AI model training initiated')
    
    // Simulate training process
    setTimeout(() => {
      setIsTraining(false)
      notifications.showSuccess('Training Complete', 'Model accuracy improved by 2.3%')
    }, 3000)
  }

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return Target
      case 'prediction': return TrendingUp
      case 'classification': return Eye
      case 'generation': return MessageSquare
      case 'optimization': return Zap
      default: return Brain
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-green-600 bg-green-100'
      case 'training': return 'text-blue-600 bg-blue-100'
      case 'testing': return 'text-yellow-600 bg-yellow-100'
      case 'archived': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const tabs = [
    { id: 'models', label: 'AI Models', icon: Brain },
    { id: 'experiments', label: 'Experiments', icon: Activity },
    { id: 'insights', label: 'AI Insights', icon: Sparkles },
    { id: 'innovation', label: 'Innovation', icon: Cpu }
  ]

  return (
    <FeatureErrorBoundary featureName="AI Innovation Lab">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <AnimatedElement animation="fadeInDown">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              AI Innovation Lab
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Advanced AI technology development and experimentation
            </p>
            <div className="flex justify-center">
              <Brain className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </AnimatedElement>

        {/* Real-time AI Metrics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Real-time AI Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {realTimeMetrics.modelsActive || 5}
                </div>
                <div className="text-sm text-gray-600">Active Models</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {realTimeMetrics.predictionsPerSecond?.toLocaleString() || '1,247'}
                </div>
                <div className="text-sm text-gray-600">Predictions/sec</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {realTimeMetrics.accuracyScore?.toFixed(1) || '93.2'}%
                </div>
                <div className="text-sm text-gray-600">Avg Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {realTimeMetrics.dataProcessed?.toFixed(1) || '2.8'}TB
                </div>
                <div className="text-sm text-gray-600">Data Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {realTimeMetrics.experimentsRunning || 2}
                </div>
                <div className="text-sm text-gray-600">Experiments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* AI Models Tab */}
        {activeTab === 'models' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">AI Models</h2>
              <EnhancedButton
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                gradient
                glow
              >
                Deploy New Model
              </EnhancedButton>
            </div>

            <CardGrid columns={2} staggerDelay={100}>
              {models.map((model) => {
                const IconComponent = getModelTypeIcon(model.type)
                return (
                  <EnhancedCard key={model.id} className="p-6" hover tilt>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="w-6 h-6 text-purple-500" />
                          <div>
                            <h3 className="text-lg font-semibold">{model.name}</h3>
                            <p className="text-sm text-gray-600">v{model.version}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                          {model.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {model.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Accuracy</div>
                          <ProgressBar value={model.accuracy} color="green" />
                          <div className="text-sm font-medium">{model.accuracy}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Performance</div>
                          <ProgressBar value={model.performance} color="blue" />
                          <div className="text-sm font-medium">{model.performance}%</div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Data Points: {model.dataPoints.toLocaleString()}</div>
                        <div>Last Trained: {model.lastTrained}</div>
                      </div>

                      <div className="flex space-x-2">
                        <EnhancedButton
                          size="sm"
                          variant="primary"
                          onClick={() => handleTrainModel(model.id)}
                          disabled={isTraining}
                          icon={isTraining ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        >
                          {isTraining ? 'Training...' : 'Retrain'}
                        </EnhancedButton>
                        <EnhancedButton size="sm" variant="outline" icon={<Settings className="w-3 h-3" />}>
                          Configure
                        </EnhancedButton>
                        <EnhancedButton size="sm" variant="outline" icon={<Download className="w-3 h-3" />}>
                          Export
                        </EnhancedButton>
                      </div>
                    </div>
                  </EnhancedCard>
                )
              })}
            </CardGrid>
          </div>
        )}

        {/* Experiments Tab */}
        {activeTab === 'experiments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">AI Experiments</h2>
              <EnhancedButton
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                gradient
                glow
              >
                New Experiment
              </EnhancedButton>
            </div>

            <div className="space-y-4">
              {experiments.map((experiment) => (
                <EnhancedCard key={experiment.id} className="p-6" hover>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{experiment.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{experiment.hypothesis}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(experiment.status)}`}>
                        {experiment.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Progress</div>
                        <ProgressBar value={experiment.progress} color="blue" showLabel />
                        <div className="text-xs text-gray-500 mt-1">
                          {experiment.startDate} → {experiment.expectedCompletion}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Accuracy:</span>
                          <span className="font-medium ml-1">{experiment.metrics.accuracy}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Precision:</span>
                          <span className="font-medium ml-1">{experiment.metrics.precision}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Recall:</span>
                          <span className="font-medium ml-1">{experiment.metrics.recall}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">F1 Score:</span>
                          <span className="font-medium ml-1">{experiment.metrics.f1Score}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Expected Business Impact:
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        {experiment.businessImpact}
                      </div>
                    </div>
                  </div>
                </EnhancedCard>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">AI-Generated Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Model Performance Trends</h3>
                  <LineChart
                    data={[
                      { date: '2024-12-10', accuracy: 91.2, performance: 94.1 },
                      { date: '2024-12-11', accuracy: 92.1, performance: 95.3 },
                      { date: '2024-12-12', accuracy: 91.8, performance: 94.8 },
                      { date: '2024-12-13', accuracy: 93.2, performance: 96.1 },
                      { date: '2024-12-14', accuracy: 92.9, performance: 95.7 },
                      { date: '2024-12-15', accuracy: 94.1, performance: 97.2 },
                      { date: '2024-12-16', accuracy: 93.8, performance: 96.8 }
                    ]}
                    lines={[
                      { dataKey: 'accuracy', name: 'Accuracy', color: '#10B981' },
                      { dataKey: 'performance', name: 'Performance', color: '#3B82F6' }
                    ]}
                    xAxisKey="date"
                    height={200}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="font-medium text-green-800 dark:text-green-200">
                        🎯 Optimize Recommendation Engine
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        Increase training frequency to improve accuracy by 2.3%
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-medium text-blue-800 dark:text-blue-200">
                        🚀 Deploy New Feature
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        Real-time sentiment analysis ready for production
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="font-medium text-yellow-800 dark:text-yellow-200">
                        ⚠️ Monitor Performance
                      </div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        Fraud detection model showing slight accuracy decline
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Innovation Tab */}
        {activeTab === 'innovation' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Future AI Innovations</h2>
            
            <CardGrid columns={3} staggerDelay={150}>
              <EnhancedCard className="p-6 text-center" hover glow>
                <Mic className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Voice AI</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Natural language queries and voice-controlled gaming
                </p>
                <div className="text-xs text-gray-500">Q2 2025</div>
              </EnhancedCard>

              <EnhancedCard className="p-6 text-center" hover glow>
                <Eye className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Computer Vision</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Image-based game analysis and player emotion detection
                </p>
                <div className="text-xs text-gray-500">Q3 2025</div>
              </EnhancedCard>

              <EnhancedCard className="p-6 text-center" hover glow>
                <Brain className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Neural Networks</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Advanced deep learning for complex pattern recognition
                </p>
                <div className="text-xs text-gray-500">Q4 2025</div>
              </EnhancedCard>
            </CardGrid>
          </div>
        )}
      </div>
    </FeatureErrorBoundary>
  )
}

export default AIInnovationLab
