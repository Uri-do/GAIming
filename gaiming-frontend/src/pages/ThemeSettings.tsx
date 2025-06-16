import React from 'react'
import { Sun, Moon, Monitor, Palette, Type, CornerRadius } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { ThemeMode } from '@/types'
import { cn } from '@/lib/utils'

const ThemeSettings: React.FC = () => {
  const { 
    theme, 
    setThemeMode, 
    setPrimaryColor, 
    setBorderRadius, 
    setFontFamily,
    resetTheme 
  } = useThemeStore()

  const themeOptions: Array<{ value: ThemeMode; label: string; description: string; icon: React.ComponentType<any> }> = [
    { 
      value: 'light', 
      label: 'Light', 
      description: 'Clean and bright interface',
      icon: Sun 
    },
    { 
      value: 'dark', 
      label: 'Dark', 
      description: 'Easy on the eyes in low light',
      icon: Moon 
    },
    { 
      value: 'system', 
      label: 'System', 
      description: 'Follows your device settings',
      icon: Monitor 
    },
  ]

  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Teal', value: '#14b8a6' },
  ]

  const fontOptions = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Open Sans', value: 'Open Sans' },
    { name: 'Poppins', value: 'Poppins' },
    { name: 'Lato', value: 'Lato' },
  ]

  const radiusOptions = [
    { name: 'None', value: 0 },
    { name: 'Small', value: 4 },
    { name: 'Medium', value: 8 },
    { name: 'Large', value: 12 },
    { name: 'Extra Large', value: 16 },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Theme Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Customize the appearance and feel of your application
        </p>
      </div>

      {/* Theme Mode */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => setThemeMode(option.value)}
                className={cn(
                  'relative p-4 rounded-lg border-2 transition-all text-left',
                  theme.mode === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn(
                    'w-5 h-5',
                    theme.mode === option.value 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  )} />
                  <div>
                    <div className={cn(
                      'font-medium',
                      theme.mode === option.value 
                        ? 'text-primary-900 dark:text-primary-100' 
                        : 'text-gray-900 dark:text-gray-100'
                    )}>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                </div>
                {theme.mode === option.value && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Primary Color */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Palette className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Primary Color</h2>
        </div>
        
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => setPrimaryColor(color.value)}
              className={cn(
                'relative w-12 h-12 rounded-lg border-2 transition-all',
                theme.primaryColor === color.value
                  ? 'border-gray-400 dark:border-gray-300 scale-110'
                  : 'border-gray-200 dark:border-gray-700 hover:scale-105'
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {theme.primaryColor === color.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Font Family */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Type className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Font Family</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {fontOptions.map((font) => (
            <button
              key={font.value}
              onClick={() => setFontFamily(font.value)}
              className={cn(
                'p-3 rounded-lg border-2 transition-all text-left',
                theme.fontFamily === font.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              style={{ fontFamily: font.value }}
            >
              <div className={cn(
                'font-medium',
                theme.fontFamily === font.value 
                  ? 'text-primary-900 dark:text-primary-100' 
                  : 'text-gray-900 dark:text-gray-100'
              )}>
                {font.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                The quick brown fox jumps
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CornerRadius className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Border Radius</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {radiusOptions.map((radius) => (
            <button
              key={radius.value}
              onClick={() => setBorderRadius(radius.value)}
              className={cn(
                'p-4 border-2 transition-all text-center',
                theme.borderRadius === radius.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              style={{ borderRadius: `${radius.value}px` }}
            >
              <div className={cn(
                'font-medium text-sm',
                theme.borderRadius === radius.value 
                  ? 'text-primary-900 dark:text-primary-100' 
                  : 'text-gray-900 dark:text-gray-100'
              )}>
                {radius.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {radius.value}px
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <button
          onClick={resetTheme}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}

export default ThemeSettings
