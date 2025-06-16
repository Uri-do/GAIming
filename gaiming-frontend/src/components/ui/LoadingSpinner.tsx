import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'primary' | 'secondary' | 'white' | 'success' | 'warning' | 'error'
  variant?: 'default' | 'gaming' | 'pulse' | 'dots'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

const colorClasses = {
  primary: 'text-primary-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  success: 'text-success-600',
  warning: 'text-warning-600',
  error: 'text-error-600',
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  color = 'primary',
  variant = 'default',
}) => {
  if (variant === 'gaming') {
    return (
      <div className={cn('relative', sizeClasses[size], className)} role="status" aria-label="Loading">
        <div className={cn(
          'absolute inset-0 rounded-full border-2 border-transparent',
          'bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500',
          'animate-spin'
        )} />
        <div className={cn(
          'absolute inset-1 rounded-full bg-white dark:bg-gray-900'
        )} />
        <div className={cn(
          'absolute inset-2 rounded-full',
          'bg-gradient-to-r from-primary-400 to-purple-400',
          'animate-pulse'
        )} />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div
        className={cn(
          'rounded-full animate-pulse',
          sizeClasses[size],
          colorClasses[color].replace('text-', 'bg-'),
          className
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)} role="status" aria-label="Loading">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full animate-bounce',
              size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
              colorClasses[color].replace('text-', 'bg-')
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default LoadingSpinner
