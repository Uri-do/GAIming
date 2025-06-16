import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { ThemeMode } from '@/types'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'switch'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ThemeToggle({ 
  variant = 'button', 
  size = 'md',
  className 
}: ThemeToggleProps) {
  const { theme, setThemeMode, toggleTheme } = useThemeStore()
  const [isOpen, setIsOpen] = React.useState(false)

  const themeOptions: Array<{ value: ThemeMode; label: string; icon: React.ComponentType<any> }> = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  const currentTheme = themeOptions.find(option => option.value === theme.mode)
  const CurrentIcon = currentTheme?.icon || Sun

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  }

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'relative inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100',
          buttonSizeClasses[size],
          className
        )}
        title={`Switch to ${theme.mode === 'light' ? 'dark' : 'light'} mode`}
      >
        <CurrentIcon className={sizeClasses[size]} />
      </button>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'relative inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100',
            buttonSizeClasses[size],
            className
          )}
          title="Change theme"
        >
          <CurrentIcon className={sizeClasses[size]} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
              {themeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setThemeMode(option.value)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center px-4 py-2 text-sm transition-colors',
                      theme.mode === option.value
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {option.label}
                    {option.value === 'system' && (
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        Auto
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    )
  }

  // Default button variant
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100',
        buttonSizeClasses[size],
        className
      )}
      title={`Current theme: ${currentTheme?.label}. Click to toggle.`}
    >
      <CurrentIcon className={sizeClasses[size]} />
    </button>
  )
}

export default ThemeToggle
