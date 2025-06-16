import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Plus,
  Play,
  Pause,
  BarChart3,
  Users,
  Target,
  TrendingUp,
  Calendar,
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface ABTest {
  id: string
  name: string
  description: string
  status: 'draft' | 'running' | 'paused' | 'completed'
  algorithm: string
  trafficSplit: number
  startDate: string
  endDate?: string
  participants: number
  conversions: number
  conversionRate: number
  confidence: number
}

const ABTesting: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock A/B test data
  const abTests: ABTest[] = [
    {
      id: '1',
      name: 'Collaborative Filtering vs Matrix Factorization',
      description: 'Testing collaborative filtering against matrix factorization for game recommendations',
      status: 'running',
      algorithm: 'collaborative-filtering',
      trafficSplit: 50,
      startDate: '2024-01-15',
      participants: 1250,
      conversions: 187,
      conversionRate: 14.96,
      confidence: 95.2
    },
    {
      id: '2',
      name: 'Personalized vs Popular Recommendations',
      description: 'Comparing personalized recommendations with popularity-based suggestions',
      status: 'completed',
      algorithm: 'personalized',
      trafficSplit: 30,
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      participants: 2100,
      conversions: 315,
      conversionRate: 15.0,
      confidence: 98.7
    },
    {
      id: '3',
      name: 'Deep Learning Recommendation Engine',
      description: 'Testing new deep learning model against current recommendation system',
      status: 'draft',
      algorithm: 'deep-learning',
      trafficSplit: 25,
      startDate: '2024-02-01',
      participants: 0,
      conversions: 0,
      conversionRate: 0,
      confidence: 0
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'default'
      case 'completed': return 'secondary'
      case 'paused': return 'error'
      case 'draft': return 'outline'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-3 w-3" />
      case 'completed': return <BarChart3 className="h-3 w-3" />
      case 'paused': return <Pause className="h-3 w-3" />
      case 'draft': return <Edit className="h-3 w-3" />
      default: return null
    }
  }

  const runningTests = abTests.filter(test => test.status === 'running')
  const completedTests = abTests.filter(test => test.status === 'completed')
  const totalParticipants = abTests.reduce((sum, test) => sum + test.participants, 0)
  const avgConversionRate = abTests.length > 0
    ? abTests.reduce((sum, test) => sum + test.conversionRate, 0) / abTests.length
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">A/B Testing</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and analyze A/B tests for recommendation algorithms
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Test
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningTests.length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">All time average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTests.length}</div>
            <p className="text-xs text-muted-foreground">With results</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'running', label: 'Running Tests', icon: Play },
            { id: 'completed', label: 'Completed', icon: Target },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All A/B Tests</CardTitle>
              <CardDescription>Overview of all experiments and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {abTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{test.name}</h3>
                        <Badge variant={getStatusColor(test.status)}>
                          {getStatusIcon(test.status)}
                          <span className="ml-1 capitalize">{test.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{test.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Started {test.startDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {test.participants.toLocaleString()} participants
                        </span>
                        {test.status !== 'draft' && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {test.conversionRate.toFixed(1)}% conversion
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {test.status === 'draft' && (
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'running' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Running Tests</CardTitle>
              <CardDescription>Currently active A/B tests and their real-time performance</CardDescription>
            </CardHeader>
            <CardContent>
              {runningTests.length === 0 ? (
                <div className="text-center py-8">
                  <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Running Tests</h3>
                  <p className="text-gray-600 dark:text-gray-400">Start an A/B test to see real-time results here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {runningTests.map((test) => (
                    <div key={test.id} className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900 dark:text-white">{test.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            <Play className="h-3 w-3 mr-1" />
                            Running
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Participants</p>
                          <p className="text-lg font-semibold">{test.participants.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Conversions</p>
                          <p className="text-lg font-semibold">{test.conversions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                          <p className="text-lg font-semibold">{test.conversionRate.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                          <p className="text-lg font-semibold">{test.confidence.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tests</CardTitle>
              <CardDescription>Historical A/B test results and insights</CardDescription>
            </CardHeader>
            <CardContent>
              {completedTests.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Completed Tests</h3>
                  <p className="text-gray-600 dark:text-gray-400">Complete some A/B tests to see results here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedTests.map((test) => (
                    <div key={test.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900 dark:text-white">{test.name}</h3>
                        <Badge variant="secondary">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                          <p className="text-sm font-medium">{test.startDate} - {test.endDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Participants</p>
                          <p className="text-lg font-semibold">{test.participants.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Conversions</p>
                          <p className="text-lg font-semibold">{test.conversions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                          <p className="text-lg font-semibold text-green-600">{test.conversionRate.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                          <p className="text-lg font-semibold">{test.confidence.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing Configuration</CardTitle>
              <CardDescription>Configure global settings for A/B testing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Settings Panel</h3>
                <p className="text-gray-600 dark:text-gray-400">A/B testing configuration options coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ABTesting
