import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'gaming' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  icon?: React.ReactNode
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', pulse = false, icon, children, ...props }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center rounded-full font-medium transition-all duration-200',
      pulse && 'animate-pulse'
    )

    const variants = {
      default: cn(
        'bg-primary-100 text-primary-800 border border-primary-200',
        'dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800'
      ),
      secondary: cn(
        'bg-gray-100 text-gray-800 border border-gray-200',
        'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
      ),
      success: cn(
        'bg-success-100 text-success-800 border border-success-200',
        'dark:bg-success-900/20 dark:text-success-400 dark:border-success-800'
      ),
      warning: cn(
        'bg-warning-100 text-warning-800 border border-warning-200',
        'dark:bg-warning-900/20 dark:text-warning-400 dark:border-warning-800'
      ),
      error: cn(
        'bg-error-100 text-error-800 border border-error-200',
        'dark:bg-error-900/20 dark:text-error-400 dark:border-error-800'
      ),
      gaming: cn(
        'bg-gradient-to-r from-primary-500 to-purple-500 text-white border-0',
        'shadow-lg shadow-primary-500/25',
        'hover:shadow-xl hover:shadow-primary-500/40',
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500'
      ),
      outline: cn(
        'border border-gray-300 bg-transparent text-gray-700',
        'dark:border-gray-600 dark:text-gray-300',
        'hover:bg-gray-50 dark:hover:bg-gray-800'
      ),
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-0.5 text-sm gap-1.5',
      lg: 'px-3 py-1 text-base gap-2',
    }

    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {icon && (
          <span className={iconSizes[size]}>
            {icon}
          </span>
        )}
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
