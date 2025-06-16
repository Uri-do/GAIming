/**
 * Feature Enhancement Planner
 * Strategic planning tool for future platform enhancements
 */

import React, { useState, useEffect } from 'react'
import { 
  Lightbulb, Target, TrendingUp, Users, Zap, Globe, 
  Smartphone, Brain, Shield, DollarSign, Star, Clock,
  ChevronRight, Plus, Filter, Search, BarChart3
} from 'lucide-react'
import { FeatureErrorBoundary } from '@/shared/components'
import { useNotificationStore } from '@/app/store/notificationStore'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import EnhancedButton from '@/shared/components/enhanced/EnhancedButton'
import { AnimatedElement, ProgressBar } from '@/shared/components/animations/AnimationSystem'
import EnhancedCard, { CardGrid } from '@/shared/components/enhanced/EnhancedCard'

interface FeatureIdea {
  id: string
  title: string
  description: string
  category: 'player-experience' | 'business-intelligence' | 'operator-tools' | 'technology' | 'compliance'
  priority: 'high' | 'medium' | 'low'
  effort: 'small' | 'medium' | 'large'
  impact: 'high' | 'medium' | 'low'
  phase: 1 | 2 | 3 | 4
  status: 'idea' | 'planned' | 'in-progress' | 'completed'
  businessValue: number
  technicalComplexity: number
  marketDemand: number
  estimatedWeeks: number
  dependencies: string[]
  tags: string[]
}

const FeatureEnhancementPlanner: React.FC = () => {
  const [features, setFeatures] = useState<FeatureIdea[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPhase, setSelectedPhase] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'priority' | 'impact' | 'effort' | 'businessValue'>('priority')
  const [showAddFeature, setShowAddFeature] = useState(false)

  const notifications = useNotificationStore()

  // Initialize with sample feature ideas
  useEffect(() => {
    const sampleFeatures: FeatureIdea[] = [
      {
        id: '1',
        title: 'Advanced Player Analytics',
        description: 'Implement predictive analytics for player lifetime value, churn prediction, and behavioral segmentation',
        category: 'business-intelligence',
        priority: 'high',
        effort: 'large',
        impact: 'high',
        phase: 1,
        status: 'planned',
        businessValue: 95,
        technicalComplexity: 80,
        marketDemand: 90,
        estimatedWeeks: 8,
        dependencies: ['ML Infrastructure', 'Data Pipeline'],
        tags: ['AI', 'Analytics', 'Prediction']
      },
      {
        id: '2',
        title: 'Native Mobile Apps',
        description: 'Develop native iOS and Android applications with offline capabilities and push notifications',
        category: 'player-experience',
        priority: 'high',
        effort: 'large',
        impact: 'high',
        phase: 2,
        status: 'idea',
        businessValue: 88,
        technicalComplexity: 75,
        marketDemand: 95,
        estimatedWeeks: 12,
        dependencies: ['API Optimization', 'Authentication'],
        tags: ['Mobile', 'iOS', 'Android', 'Offline']
      },
      {
        id: '3',
        title: 'Real-time Personalization Engine',
        description: 'Dynamic content adaptation based on real-time player behavior and preferences',
        category: 'player-experience',
        priority: 'high',
        effort: 'medium',
        impact: 'high',
        phase: 1,
        status: 'planned',
        businessValue: 92,
        technicalComplexity: 70,
        marketDemand: 85,
        estimatedWeeks: 6,
        dependencies: ['User Tracking', 'Content Management'],
        tags: ['Personalization', 'Real-time', 'AI']
      },
      {
        id: '4',
        title: 'Multi-language Support',
        description: 'Internationalization with support for 10+ languages and cultural adaptations',
        category: 'operator-tools',
        priority: 'medium',
        effort: 'medium',
        impact: 'high',
        phase: 2,
        status: 'idea',
        businessValue: 78,
        technicalComplexity: 50,
        marketDemand: 80,
        estimatedWeeks: 4,
        dependencies: ['Content Management', 'UI Framework'],
        tags: ['i18n', 'Global', 'Localization']
      },
      {
        id: '5',
        title: 'VR Casino Experience',
        description: 'Virtual reality casino environment with immersive gaming experiences',
        category: 'technology',
        priority: 'low',
        effort: 'large',
        impact: 'medium',
        phase: 4,
        status: 'idea',
        businessValue: 65,
        technicalComplexity: 95,
        marketDemand: 60,
        estimatedWeeks: 16,
        dependencies: ['VR Framework', '3D Engine', 'Hardware Support'],
        tags: ['VR', 'Immersive', 'Innovation']
      },
      {
        id: '6',
        title: 'Automated Compliance Monitoring',
        description: 'AI-powered regulatory compliance monitoring and automated reporting',
        category: 'compliance',
        priority: 'high',
        effort: 'medium',
        impact: 'high',
        phase: 2,
        status: 'idea',
        businessValue: 85,
        technicalComplexity: 65,
        marketDemand: 75,
        estimatedWeeks: 5,
        dependencies: ['Legal Framework', 'Audit System'],
        tags: ['Compliance', 'Automation', 'Legal']
      }
    ]
    setFeatures(sampleFeatures)
  }, [])

  const categories = [
    { id: 'all', label: 'All Categories', icon: Target },
    { id: 'player-experience', label: 'Player Experience', icon: Users },
    { id: 'business-intelligence', label: 'Business Intelligence', icon: BarChart3 },
    { id: 'operator-tools', label: 'Operator Tools', icon: Zap },
    { id: 'technology', label: 'Technology', icon: Brain },
    { id: 'compliance', label: 'Compliance', icon: Shield }
  ]

  const phases = [
    { id: 0, label: 'All Phases', description: 'View all phases' },
    { id: 1, label: 'Phase 1: Market Leadership', description: 'Q1 2025 - Advanced features' },
    { id: 2, label: 'Phase 2: Global Expansion', description: 'Q2 2025 - Localization & compliance' },
    { id: 3, label: 'Phase 3: AI Revolution', description: 'Q3 2025 - Cutting-edge AI' },
    { id: 4, label: 'Phase 4: Next-Gen Gaming', description: 'Q4 2025 - Future technologies' }
  ]

  const getFilteredFeatures = () => {
    return features.filter(feature => {
      const categoryMatch = selectedCategory === 'all' || feature.category === selectedCategory
      const phaseMatch = selectedPhase === 0 || feature.phase === selectedPhase
      const searchMatch = searchTerm === '' || 
        feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      return categoryMatch && phaseMatch && searchMatch
    }).sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'impact':
          const impactOrder = { high: 3, medium: 2, low: 1 }
          return impactOrder[b.impact] - impactOrder[a.impact]
        case 'effort':
          const effortOrder = { small: 1, medium: 2, large: 3 }
          return effortOrder[a.effort] - effortOrder[b.effort]
        case 'businessValue':
          return b.businessValue - a.businessValue
        default:
          return 0
      }
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in-progress': return 'text-blue-600 bg-blue-100'
      case 'planned': return 'text-purple-600 bg-purple-100'
      case 'idea': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    const categoryMap = {
      'player-experience': Users,
      'business-intelligence': BarChart3,
      'operator-tools': Zap,
      'technology': Brain,
      'compliance': Shield
    }
    return categoryMap[category as keyof typeof categoryMap] || Target
  }

  const calculateROIScore = (feature: FeatureIdea) => {
    return Math.round((feature.businessValue * feature.marketDemand) / feature.technicalComplexity)
  }

  const getPhaseProgress = (phase: number) => {
    const phaseFeatures = features.filter(f => f.phase === phase)
    const completedFeatures = phaseFeatures.filter(f => f.status === 'completed').length
    return phaseFeatures.length > 0 ? (completedFeatures / phaseFeatures.length) * 100 : 0
  }

  return (
    <FeatureErrorBoundary featureName="Feature Enhancement Planner">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <AnimatedElement animation="fadeInDown">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Feature Enhancement Planner
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Strategic planning for the future of GAIming platform
            </p>
            <div className="flex justify-center">
              <Lightbulb className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
        </AnimatedElement>

        {/* Phase Overview */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Development Phases Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {phases.slice(1).map((phase) => (
                <div key={phase.id} className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    Phase {phase.id}
                  </div>
                  <div className="text-sm font-medium mb-2">{phase.label.split(':')[1]}</div>
                  <ProgressBar 
                    value={getPhaseProgress(phase.id)} 
                    className="mb-2"
                    color="blue"
                  />
                  <div className="text-xs text-gray-600">
                    {getPhaseProgress(phase.id).toFixed(0)}% Complete
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {phases.map(phase => (
                    <option key={phase.id} value={phase.id}>
                      {phase.label}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="priority">Sort by Priority</option>
                  <option value="impact">Sort by Impact</option>
                  <option value="effort">Sort by Effort</option>
                  <option value="businessValue">Sort by Business Value</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search features..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <EnhancedButton
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowAddFeature(true)}
                >
                  Add Feature
                </EnhancedButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <CardGrid columns={2} staggerDelay={100}>
          {getFilteredFeatures().map((feature) => {
            const IconComponent = getCategoryIcon(feature.category)
            const roiScore = calculateROIScore(feature)
            
            return (
              <EnhancedCard key={feature.id} className="p-6" hover glow>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-6 h-6 text-blue-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Phase {feature.phase} • {feature.estimatedWeeks} weeks
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feature.priority)}`}>
                        {feature.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                        {feature.status}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Business Value</div>
                      <ProgressBar value={feature.businessValue} color="green" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Market Demand</div>
                      <ProgressBar value={feature.marketDemand} color="blue" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Technical Complexity</div>
                      <ProgressBar value={feature.technicalComplexity} color="red" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">ROI Score</div>
                      <div className="text-lg font-bold text-purple-600">{roiScore}</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {feature.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Dependencies */}
                  {feature.dependencies.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Dependencies:</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.dependencies.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>Impact: {feature.impact}</span>
                      <Clock className="w-4 h-4 ml-2" />
                      <span>Effort: {feature.effort}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </EnhancedCard>
            )
          })}
        </CardGrid>

        {/* Summary Statistics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Enhancement Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {features.length}
                </div>
                <div className="text-sm text-gray-600">Total Features</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {features.filter(f => f.priority === 'high').length}
                </div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {features.filter(f => f.status === 'planned').length}
                </div>
                <div className="text-sm text-gray-600">Planned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {features.reduce((sum, f) => sum + f.estimatedWeeks, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Weeks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureErrorBoundary>
  )
}

export default FeatureEnhancementPlanner
