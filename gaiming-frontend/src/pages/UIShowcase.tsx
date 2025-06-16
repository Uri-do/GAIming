import React from 'react'
import { 
  Gamepad2, 
  Target, 
  BarChart3, 
  Users, 
  Settings, 
  Star,
  Trophy,
  Zap,
  Heart,
  Shield
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/UI/Card'
import Button from '@/components/UI/Button'
import Badge from '@/components/UI/Badge'
import LoadingSpinner from '@/components/UI/LoadingSpinner'

const UIShowcase: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          GAIming UI Showcase
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Experience the next generation of gaming UI with our enhanced components featuring 
          modern aesthetics, smooth animations, and gaming-inspired design elements.
        </p>
      </div>

      {/* Buttons Section */}
      <Card variant="gaming" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5" />
        <CardHeader variant="gaming" className="relative z-10">
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-400" />
            Button Variants
          </CardTitle>
          <CardDescription className="text-gray-400">
            Interactive buttons with gaming aesthetics and smooth animations
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-primary-400">Gaming Style</h4>
              <Button variant="gaming" size="sm" icon={<Gamepad2 />}>
                Small Gaming
              </Button>
              <Button variant="gaming" size="md" icon={<Target />}>
                Medium Gaming
              </Button>
              <Button variant="gaming" size="lg" icon={<Trophy />}>
                Large Gaming
              </Button>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-primary-400">Standard Variants</h4>
              <Button variant="default" size="md" icon={<Settings />}>
                Default
              </Button>
              <Button variant="outline" size="md" icon={<Users />}>
                Outline
              </Button>
              <Button variant="ghost" size="md" icon={<BarChart3 />}>
                Ghost
              </Button>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-primary-400">Special Effects</h4>
              <Button variant="glow" size="md" icon={<Zap />}>
                Glow Effect
              </Button>
              <Button variant="gaming" size="md" loading>
                Loading State
              </Button>
              <Button variant="destructive" size="md" icon={<Shield />}>
                Destructive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Section */}
      <Card variant="gaming" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-success-500/5 to-emerald-500/5" />
        <CardHeader variant="gaming" className="relative z-10">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-success-400" />
            Card Variants
          </CardTitle>
          <CardDescription className="text-gray-400">
            Different card styles for various use cases
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default" padding="md">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Default Card</CardTitle>
                <CardDescription>Standard card with clean design</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This is a default card with standard styling and clean aesthetics.
                </p>
              </CardContent>
            </Card>

            <Card variant="gaming" padding="md" hover glow>
              <CardHeader variant="gaming">
                <CardTitle className="text-white">Gaming Card</CardTitle>
                <CardDescription className="text-gray-400">Enhanced gaming aesthetics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300">
                  Gaming-themed card with gradients and special effects.
                </p>
              </CardContent>
            </Card>

            <Card variant="glass" padding="md" hover>
              <CardHeader>
                <CardTitle className="text-white">Glass Card</CardTitle>
                <CardDescription className="text-gray-300">Glassmorphism effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300">
                  Modern glass effect with backdrop blur and transparency.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card variant="gaming" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-warning-500/5 to-orange-500/5" />
        <CardHeader variant="gaming" className="relative z-10">
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-warning-400" />
            Badge Variants
          </CardTitle>
          <CardDescription className="text-gray-400">
            Status indicators and labels with various styles
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-primary-400">Standard</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-primary-400">Status</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success" icon={<Heart className="w-3 h-3" />}>Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-primary-400">Gaming</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="gaming" icon={<Trophy className="w-3 h-3" />}>Gaming</Badge>
                <Badge variant="gaming" pulse>Live</Badge>
                <Badge variant="gaming" size="lg">Large</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-primary-400">Sizes</h4>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Spinners Section */}
      <Card variant="gaming" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
        <CardHeader variant="gaming" className="relative z-10">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Loading Spinners
          </CardTitle>
          <CardDescription className="text-gray-400">
            Various loading indicators with different styles and animations
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <h4 className="text-sm font-medium text-primary-400">Default</h4>
              <div className="flex justify-center items-center h-16">
                <LoadingSpinner size="lg" />
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h4 className="text-sm font-medium text-primary-400">Gaming</h4>
              <div className="flex justify-center items-center h-16">
                <LoadingSpinner size="lg" variant="gaming" />
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h4 className="text-sm font-medium text-primary-400">Pulse</h4>
              <div className="flex justify-center items-center h-16">
                <LoadingSpinner size="lg" variant="pulse" color="success" />
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h4 className="text-sm font-medium text-primary-400">Dots</h4>
              <div className="flex justify-center items-center h-16">
                <LoadingSpinner size="lg" variant="dots" color="warning" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Card variant="gaming" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5" />
        <CardHeader variant="gaming" className="relative z-10">
          <CardTitle className="text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary-400" />
            Interactive Demo
          </CardTitle>
          <CardDescription className="text-gray-400">
            Try out the interactive elements and animations
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Quick Actions</h4>
              <div className="space-y-3">
                <Button variant="gaming" fullWidth icon={<Target />}>
                  Generate Recommendations
                </Button>
                <Button variant="outline" fullWidth icon={<BarChart3 />} className="border-primary-500/30 hover:bg-primary-500/10">
                  View Analytics
                </Button>
                <Button variant="ghost" fullWidth icon={<Users />}>
                  Manage Players
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">System Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-success-500/20">
                  <span className="text-sm text-gray-300">Recommendation Engine</span>
                  <Badge variant="gaming" size="sm" pulse>Online</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-success-500/20">
                  <span className="text-sm text-gray-300">ML Models</span>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-warning-500/20">
                  <span className="text-sm text-gray-300">Data Pipeline</span>
                  <Badge variant="warning" size="sm">Processing</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UIShowcase
