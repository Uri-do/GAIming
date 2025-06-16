import React from 'react'
import { Sun, Moon, Monitor, Palette, Settings, Bell, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useThemeStore } from '@/stores/themeStore'

const DarkModeDemo: React.FC = () => {
  const { theme } = useThemeStore()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            🌙 Dark Mode Implementation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Clean, modern dark mode with system preference support
          </p>
          
          {/* Theme Toggle Controls */}
          <div className="flex items-center justify-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Current mode:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
              {theme.mode}
            </span>
            <ThemeToggle variant="dropdown" />
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Theme Modes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Monitor className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Theme Modes
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Light Mode</span>
              </div>
              <div className="flex items-center space-x-2">
                <Moon className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Dark Mode</span>
              </div>
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">System Auto</span>
              </div>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Palette className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Color Scheme
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Primary</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-500 dark:bg-gray-400 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Secondary</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Success</span>
              </div>
            </div>
          </div>

          {/* Components */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Components
              </h3>
            </div>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Primary Button
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Secondary Button
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Elements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Interactive Elements
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Elements */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Form Elements</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  placeholder="Enter your message"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Cards and Lists */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Cards & Lists</h4>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Notification Item
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      This is a sample notification
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      User Profile
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Manage your account settings
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Toggle Variants */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Theme Toggle Variants
          </h3>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Button:</span>
              <ThemeToggle variant="button" size="sm" />
              <ThemeToggle variant="button" size="md" />
              <ThemeToggle variant="button" size="lg" />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Switch:</span>
              <ThemeToggle variant="switch" size="sm" />
              <ThemeToggle variant="switch" size="md" />
              <ThemeToggle variant="switch" size="lg" />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Dropdown:</span>
              <ThemeToggle variant="dropdown" size="md" />
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ✨ Implementation Features
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>• Clean separation of light and dark mode styles</li>
            <li>• System preference detection and auto-switching</li>
            <li>• Persistent theme storage with Zustand</li>
            <li>• Smooth transitions between themes</li>
            <li>• Customizable theme toggle components</li>
            <li>• CSS custom properties for consistent theming</li>
            <li>• Tailwind CSS dark mode support</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DarkModeDemo
