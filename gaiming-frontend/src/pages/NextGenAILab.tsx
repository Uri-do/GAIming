/**
 * Next-Generation AI Innovation Lab
 * Cutting-edge AI research and development platform
 */

import React, { useState, useEffect } from 'react'
import {
  Atom, Zap, Brain, Eye, Mic, Cpu, Sparkles, Rocket,
  Activity, TrendingUp, Target, Settings, Play, Pause,
  RefreshCw, Download, Upload, BarChart3, Globe, Shield
} from 'lucide-react'
import { FeatureErrorBoundary } from '@/shared/components'
import { useNotificationStore } from '@/app/store/notificationStore'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import EnhancedButton from '@/shared/components/enhanced/EnhancedButton'
import { AnimatedElement, ProgressBar } from '@/shared/components/animations/AnimationSystem'
import EnhancedCard, { CardGrid } from '@/shared/components/enhanced/EnhancedCard'
import LineChart from '@/features/analytics/components/charts/LineChart'

interface NextGenAIProject {
  id: string
  name: string
  category: 'quantum-ml' | 'neural-architecture' | 'federated-learning' | 'edge-ai' | 'brain-computer' | 'autonomous-systems'
  status: 'research' | 'prototype' | 'testing' | 'production' | 'breakthrough'
  progress: number
  breakthrough: boolean
  timeline: string
  description: string
  technicalDetails: string
  businessImpact: string
  researchTeam: string[]
  publications: number
  patents: number
  accuracy: number
  efficiency: number
  innovation: number
}

interface AIBreakthrough {
  id: string
  title: string
  date: string
  category: string
  impact: 'revolutionary' | 'significant' | 'incremental'
  description: string
  metrics: {
    performanceGain: number
    efficiencyImprovement: number
    accuracyIncrease: number
  }
}

const NextGenAILab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'breakthroughs' | 'research' | 'quantum'>('projects')
  const [projects, setProjects] = useState<NextGenAIProject[]>([])
  const [breakthroughs, setBreakthroughs] = useState<AIBreakthrough[]>([])
  const [researchMetrics, setResearchMetrics] = useState<any>({})
  const [isSimulating, setIsSimulating] = useState(false)

  const notifications = useNotificationStore()

  useEffect(() => {
    initializeNextGenData()
    startResearchMetrics()
  }, [])

  const initializeNextGenData = () => {
    const nextGenProjects: NextGenAIProject[] = [
      {
        id: '1',
        name: 'Quantum Machine Learning Engine',
        category: 'quantum-ml',
        status: 'research',
        progress: 35,
        breakthrough: true,
        timeline: 'Q3 2025',
        description: 'Quantum-enhanced machine learning for exponentially faster pattern recognition',
        technicalDetails: 'Variational Quantum Eigensolver (VQE) with quantum neural networks',
        businessImpact: '1000x faster recommendation processing, real-time global optimization',
        researchTeam: ['Dr. Sarah Chen', 'Prof. Michael Quantum', 'Dr. Lisa Wang'],
        publications: 3,
        patents: 2,
        accuracy: 98.7,
        efficiency: 1000,
        innovation: 95
      },
      {
        id: '2',
        name: 'Neural Architecture Search 2.0',
        category: 'neural-architecture',
        status: 'prototype',
        progress: 67,
        breakthrough: false,
        timeline: 'Q2 2025',
        description: 'Self-designing AI models that automatically optimize their own architecture',
        technicalDetails: 'Evolutionary algorithms with reinforcement learning for architecture optimization',
        businessImpact: 'Autonomous AI improvement, 50% better model performance',
        researchTeam: ['Dr. Alex Neural', 'Dr. Emma Architecture', 'Prof. David Evolution'],
        publications: 5,
        patents: 3,
        accuracy: 94.2,
        efficiency: 150,
        innovation: 88
      },
      {
        id: '3',
        name: 'Federated Learning Network',
        category: 'federated-learning',
        status: 'testing',
        progress: 82,
        breakthrough: false,
        timeline: 'Q1 2025',
        description: 'Privacy-preserving AI training across distributed gaming platforms',
        technicalDetails: 'Differential privacy with secure aggregation protocols',
        businessImpact: 'Global AI training without data sharing, enhanced privacy compliance',
        researchTeam: ['Dr. Privacy Guard', 'Prof. Secure Learning', 'Dr. Distributed AI'],
        publications: 4,
        patents: 1,
        accuracy: 91.5,
        efficiency: 120,
        innovation: 82
      },
      {
        id: '4',
        name: 'Edge AI Optimization',
        category: 'edge-ai',
        status: 'production',
        progress: 95,
        breakthrough: false,
        timeline: 'Q4 2024',
        description: 'Ultra-low latency AI inference at the edge for mobile gaming',
        technicalDetails: 'Model quantization and pruning with hardware-specific optimization',
        businessImpact: 'Sub-10ms AI responses, 90% reduced bandwidth usage',
        researchTeam: ['Dr. Edge Computing', 'Prof. Mobile AI', 'Dr. Optimization'],
        publications: 6,
        patents: 4,
        accuracy: 89.3,
        efficiency: 200,
        innovation: 75
      },
      {
        id: '5',
        name: 'Brain-Computer Gaming Interface',
        category: 'brain-computer',
        status: 'research',
        progress: 15,
        breakthrough: true,
        timeline: 'Q4 2025',
        description: 'Direct neural control of gaming interfaces using EEG and fMRI',
        technicalDetails: 'Deep learning on neural signals with real-time brain state classification',
        businessImpact: 'Revolutionary gaming experience, accessibility for disabled players',
        researchTeam: ['Dr. Neuro Gaming', 'Prof. Brain Interface', 'Dr. Neural Signals'],
        publications: 2,
        patents: 1,
        accuracy: 76.8,
        efficiency: 50,
        innovation: 99
      },
      {
        id: '6',
        name: 'Autonomous Gaming Ecosystem',
        category: 'autonomous-systems',
        status: 'prototype',
        progress: 45,
        breakthrough: true,
        timeline: 'Q3 2025',
        description: 'Self-managing gaming platform that optimizes itself without human intervention',
        technicalDetails: 'Multi-agent reinforcement learning with hierarchical decision making',
        businessImpact: 'Fully autonomous operations, 80% operational cost reduction',
        researchTeam: ['Dr. Autonomous AI', 'Prof. Self-Management', 'Dr. Multi-Agent'],
        publications: 3,
        patents: 2,
        accuracy: 87.1,
        efficiency: 300,
        innovation: 92
      }
    ]

    const aiBreakthroughs: AIBreakthrough[] = [
      {
        id: '1',
        title: 'Quantum Advantage in Game Recommendations',
        date: '2024-12-15',
        category: 'Quantum ML',
        impact: 'revolutionary',
        description: 'First demonstration of quantum speedup in real-world gaming recommendation system',
        metrics: {
          performanceGain: 1000,
          efficiencyImprovement: 500,
          accuracyIncrease: 15
        }
      },
      {
        id: '2',
        title: 'Self-Evolving Neural Architecture',
        date: '2024-12-10',
        category: 'Neural Architecture',
        impact: 'significant',
        description: 'AI model that redesigns its own architecture for optimal performance',
        metrics: {
          performanceGain: 150,
          efficiencyImprovement: 80,
          accuracyIncrease: 12
        }
      },
      {
        id: '3',
        title: 'Brain-State Gaming Prediction',
        date: '2024-12-05',
        category: 'Brain-Computer Interface',
        impact: 'revolutionary',
        description: 'First successful prediction of gaming preferences from brain signals',
        metrics: {
          performanceGain: 200,
          efficiencyImprovement: 300,
          accuracyIncrease: 25
        }
      }
    ]

    setProjects(nextGenProjects)
    setBreakthroughs(aiBreakthroughs)
  }

  const startResearchMetrics = () => {
    const interval = setInterval(() => {
      setResearchMetrics({
        activeProjects: 6,
        researchPapers: 23 + Math.floor(Math.random() * 3),
        patents: 13 + Math.floor(Math.random() * 2),
        breakthroughs: 3,
        computeHours: 45230 + Math.floor(Math.random() * 1000),
        collaborations: 8,
        timestamp: new Date().toISOString()
      })
    }, 5000)

    return () => clearInterval(interval)
  }

  const handleQuantumSimulation = async () => {
    setIsSimulating(true)
    notifications.showInfo('Quantum Simulation', 'Starting quantum ML simulation...')

    setTimeout(() => {
      setIsSimulating(false)
      notifications.showSuccess('Breakthrough!', 'Quantum advantage demonstrated: 1000x speedup achieved!')
    }, 4000)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quantum-ml': return Atom
      case 'neural-architecture': return Brain
      case 'federated-learning': return Globe
      case 'edge-ai': return Zap
      case 'brain-computer': return Eye
      case 'autonomous-systems': return Cpu
      default: return Sparkles
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'production': return 'text-green-600 bg-green-100'
      case 'testing': return 'text-blue-600 bg-blue-100'
      case 'prototype': return 'text-purple-600 bg-purple-100'
      case 'research': return 'text-orange-600 bg-orange-100'
      case 'breakthrough': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'revolutionary': return 'text-red-600 bg-red-100'
      case 'significant': return 'text-blue-600 bg-blue-100'
      case 'incremental': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const tabs = [
    { id: 'projects', label: 'Next-Gen Projects', icon: Rocket },
    { id: 'breakthroughs', label: 'Breakthroughs', icon: Sparkles },
    { id: 'research', label: 'Research Metrics', icon: BarChart3 },
    { id: 'quantum', label: 'Quantum Lab', icon: Atom }
  ]

  return (
    <FeatureErrorBoundary featureName="Next-Gen AI Lab">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <AnimatedElement animation="fadeInDown">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Next-Generation AI Innovation Lab
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Pioneering the future of AI-powered gaming technology
            </p>
            <div className="flex justify-center">
              <Rocket className="w-12 h-12 text-purple-500 animate-pulse" />
            </div>
          </div>
        </AnimatedElement>

        {/* Research Metrics */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Research & Development Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {researchMetrics.activeProjects || 6}
                </div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {researchMetrics.researchPapers || 23}
                </div>
                <div className="text-sm text-gray-600">Research Papers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {researchMetrics.patents || 13}
                </div>
                <div className="text-sm text-gray-600">Patents Filed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {researchMetrics.breakthroughs || 3}
                </div>
                <div className="text-sm text-gray-600">Breakthroughs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {researchMetrics.computeHours?.toLocaleString() || '45,230'}
                </div>
                <div className="text-sm text-gray-600">Compute Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">
                  {researchMetrics.collaborations || 8}
                </div>
                <div className="text-sm text-gray-600">Collaborations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Next-Gen Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Next-Generation AI Projects</h2>
              <EnhancedButton
                variant="primary"
                icon={<Rocket className="w-4 h-4" />}
                gradient
                glow
              >
                Launch New Project
              </EnhancedButton>
            </div>

            <CardGrid columns={2} staggerDelay={150}>
              {projects.map((project) => {
                const IconComponent = getCategoryIcon(project.category)
                return (
                  <EnhancedCard key={project.id} className="p-6" hover tilt glow={project.breakthrough}>
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="w-6 h-6 text-purple-500" />
                          <div>
                            <h3 className="text-lg font-semibold">{project.name}</h3>
                            <p className="text-sm text-gray-600">{project.timeline}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {project.breakthrough && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 animate-pulse">
                              BREAKTHROUGH
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {project.description}
                      </p>

                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Research Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <ProgressBar value={project.progress} color="purple" />
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-green-600">{project.accuracy}%</div>
                          <div className="text-xs text-gray-600">Accuracy</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">{project.efficiency}x</div>
                          <div className="text-xs text-gray-600">Efficiency</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600">{project.innovation}</div>
                          <div className="text-xs text-gray-600">Innovation</div>
                        </div>
                      </div>

                      {/* Technical Details */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-1">Technical Approach:</div>
                        <div className="text-xs text-gray-600">{project.technicalDetails}</div>
                      </div>

                      {/* Business Impact */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Business Impact:
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                          {project.businessImpact}
                        </div>
                      </div>

                      {/* Research Team & Publications */}
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <div>
                          Team: {project.researchTeam.length} researchers
                        </div>
                        <div className="flex space-x-3">
                          <span>📄 {project.publications} papers</span>
                          <span>🔬 {project.patents} patents</span>
                        </div>
                      </div>
                    </div>
                  </EnhancedCard>
                )
              })}
            </CardGrid>
          </div>
        )}

        {/* Breakthroughs Tab */}
        {activeTab === 'breakthroughs' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Recent AI Breakthroughs</h2>

            <div className="space-y-4">
              {breakthroughs.map((breakthrough) => (
                <EnhancedCard key={breakthrough.id} className="p-6" hover glow>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-purple-600">{breakthrough.title}</h3>
                        <p className="text-sm text-gray-600">{breakthrough.date} • {breakthrough.category}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(breakthrough.impact)}`}>
                        {breakthrough.impact.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300">{breakthrough.description}</p>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {breakthrough.metrics.performanceGain}x
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          Performance Gain
                        </div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {breakthrough.metrics.efficiencyImprovement}%
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          Efficiency Improvement
                        </div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          +{breakthrough.metrics.accuracyIncrease}%
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">
                          Accuracy Increase
                        </div>
                      </div>
                    </div>
                  </div>
                </EnhancedCard>
              ))}
            </div>
          </div>
        )}

        {/* Research Metrics Tab */}
        {activeTab === 'research' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Research Performance Metrics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Innovation Pipeline</h3>
                  <LineChart
                    data={[
                      { month: 'Jan', projects: 3, breakthroughs: 0, patents: 1 },
                      { month: 'Feb', projects: 4, breakthroughs: 1, patents: 2 },
                      { month: 'Mar', projects: 4, breakthroughs: 1, patents: 3 },
                      { month: 'Apr', projects: 5, breakthroughs: 1, patents: 5 },
                      { month: 'May', projects: 5, breakthroughs: 2, patents: 7 },
                      { month: 'Jun', projects: 6, breakthroughs: 2, patents: 9 },
                      { month: 'Jul', projects: 6, breakthroughs: 3, patents: 11 },
                      { month: 'Aug', projects: 6, breakthroughs: 3, patents: 13 }
                    ]}
                    lines={[
                      { dataKey: 'projects', name: 'Active Projects', color: '#8B5CF6' },
                      { dataKey: 'breakthroughs', name: 'Breakthroughs', color: '#EF4444' },
                      { dataKey: 'patents', name: 'Patents', color: '#10B981' }
                    ]}
                    xAxisKey="month"
                    height={250}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Research Impact</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className="font-medium">H-Index Score</span>
                      <span className="text-2xl font-bold text-purple-600">47</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="font-medium">Citation Count</span>
                      <span className="text-2xl font-bold text-blue-600">1,247</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="font-medium">Industry Collaborations</span>
                      <span className="text-2xl font-bold text-green-600">8</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <span className="font-medium">Awards & Recognition</span>
                      <span className="text-2xl font-bold text-red-600">5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Quantum Lab Tab */}
        {activeTab === 'quantum' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Quantum Computing Lab</h2>
              <EnhancedButton
                onClick={handleQuantumSimulation}
                disabled={isSimulating}
                variant="primary"
                gradient
                glow
                icon={isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Atom className="w-4 h-4" />}
              >
                {isSimulating ? 'Simulating...' : 'Run Quantum Simulation'}
              </EnhancedButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <EnhancedCard className="p-6 text-center" hover glow>
                <Atom className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold mb-2">Quantum Advantage</h3>
                <div className="text-3xl font-bold text-purple-600 mb-2">1000x</div>
                <p className="text-sm text-gray-600">
                  Speedup in recommendation processing using quantum ML algorithms
                </p>
              </EnhancedCard>

              <EnhancedCard className="p-6 text-center" hover glow>
                <Zap className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quantum Circuits</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">127</div>
                <p className="text-sm text-gray-600">
                  Active quantum circuits for various ML optimization tasks
                </p>
              </EnhancedCard>

              <EnhancedCard className="p-6 text-center" hover glow>
                <Target className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quantum Fidelity</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">98.7%</div>
                <p className="text-sm text-gray-600">
                  Quantum state fidelity in our quantum ML implementations
                </p>
              </EnhancedCard>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quantum ML Applications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div>
                      <div className="font-medium">Quantum Recommendation Engine</div>
                      <div className="text-sm text-gray-600">Exponentially faster collaborative filtering</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">Active</div>
                      <div className="text-sm text-gray-600">1000x speedup</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <div className="font-medium">Quantum Optimization</div>
                      <div className="text-sm text-gray-600">Global optimization for game balancing</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">Testing</div>
                      <div className="text-sm text-gray-600">500x speedup</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <div className="font-medium">Quantum Cryptography</div>
                      <div className="text-sm text-gray-600">Unbreakable security for player data</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">Research</div>
                      <div className="text-sm text-gray-600">Theoretical</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </FeatureErrorBoundary>
  )
}

export default NextGenAILab