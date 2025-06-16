import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'sonner'
import { settingsApi, type SystemSettings } from '@/services/settingsApi'
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Download,
  Shield,
  Zap,
  Bell,
  Database,
  Brain,
  BarChart3
} from 'lucide-react'

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general')
  const queryClient = useQueryClient()

  // Fetch settings
  const { data: settings, isLoading, error } = useQuery<SystemSettings>({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  })

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings')
    },
  })

  // Reset settings mutation
  const resetSettingsMutation = useMutation({
    mutationFn: (category?: string) => settingsApi.resetSettings(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings reset successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reset settings')
    },
  })

  const handleSaveSettings = () => {
    if (settings) {
      updateSettingsMutation.mutate(settings)
    }
  }

  const handleResetSettings = (category?: string) => {
    if (confirm(`Are you sure you want to reset ${category || 'all'} settings to defaults?`)) {
      resetSettingsMutation.mutate(category)
    }
  }

  const handleExportSettings = () => {
    settingsApi.exportSettings('json')
    toast.success('Settings exported successfully')
  }

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'recommendation', label: 'Recommendations', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure system settings and preferences</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Failed to load settings. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => handleResetSettings()}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          <Button onClick={handleSaveSettings} disabled={updateSettingsMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-none border-r-2 transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-500'
                          : 'text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeTab === 'general' && (
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Basic system configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">System Name</label>
                        <Input
                          value={settings?.general?.systemName || 'GAIming System'}
                          placeholder="GAIming System"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Default Language</label>
                        <Input
                          value={settings?.general?.defaultLanguage || 'en-US'}
                          placeholder="en-US"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Default Timezone</label>
                        <Input
                          value={settings?.general?.defaultTimezone || 'UTC'}
                          placeholder="UTC"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                        <Input
                          type="number"
                          value={settings?.general?.sessionTimeout || 60}
                          placeholder="60"
                          readOnly
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">System Description</label>
                      <Input
                        value={settings?.general?.systemDescription || 'AI-powered gaming recommendation system'}
                        placeholder="AI-powered gaming recommendation system"
                        readOnly
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={settings?.general?.maintenanceMode ? "destructive" : "default"}>
                        {settings?.general?.maintenanceMode ? "Maintenance Mode ON" : "System Online"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetSettings('general')}
                      >
                        Reset General Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'recommendation' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendation Engine</CardTitle>
                    <CardDescription>Configure AI recommendation algorithms</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Default Algorithm</label>
                        <Input
                          value={settings?.recommendation?.defaultAlgorithm || 'collaborative-filtering'}
                          placeholder="collaborative-filtering"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Max Recommendations</label>
                        <Input
                          type="number"
                          value={settings?.recommendation?.maxRecommendations || 10}
                          placeholder="10"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Min Confidence Score</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={settings?.recommendation?.minConfidenceScore || 0.5}
                          placeholder="0.5"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Cache Expiration (minutes)</label>
                        <Input
                          type="number"
                          value={settings?.recommendation?.cacheExpirationMinutes || 30}
                          placeholder="30"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={settings?.recommendation?.enableABTesting ? "default" : "secondary"}>
                        A/B Testing {settings?.recommendation?.enableABTesting ? "Enabled" : "Disabled"}
                      </Badge>
                      <Badge variant={settings?.recommendation?.realTimeUpdates ? "default" : "secondary"}>
                        Real-time Updates {settings?.recommendation?.realTimeUpdates ? "On" : "Off"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetSettings('recommendation')}
                      >
                        Reset Recommendation Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Other tabs */}
              {activeTab !== 'general' && activeTab !== 'recommendation' && (
                <Card>
                  <CardHeader>
                    <CardTitle>{tabs.find(t => t.id === activeTab)?.label} Settings</CardTitle>
                    <CardDescription>Configuration options for {activeTab}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🚧</div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {tabs.find(t => t.id === activeTab)?.label} settings panel coming soon...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
