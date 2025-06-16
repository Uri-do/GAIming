import React from 'react'
import { cn } from '@/lib/utils'
import LoadingSpinner from './LoadingSpinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'gaming' | 'ghost' | 'outline' | 'destructive' | 'glow'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'active:scale-95 transform',
      fullWidth && 'w-full'
    )

    const variants = {
      default: cn(
        'bg-gray-100 text-gray-900 shadow-sm',
        'hover:bg-gray-200 hover:shadow-md',
        'focus-visible:ring-gray-500'
      ),
      primary: cn(
        'bg-primary-600 text-white shadow-sm',
        'hover:bg-primary-700 hover:shadow-md',
        'focus-visible:ring-primary-500'
      ),
      gaming: cn(
        'bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600',
        'text-white shadow-lg shadow-primary-500/25',
        'hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105',
        'focus-visible:ring-primary-500',
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700'
      ),
      ghost: cn(
        'text-gray-700',
        'hover:bg-gray-100',
        'focus-visible:ring-gray-500'
      ),
      outline: cn(
        'border border-gray-300 bg-transparent',
        'text-gray-700',
        'hover:bg-gray-50',
        'focus-visible:ring-gray-500'
      ),
      destructive: cn(
        'bg-error-600 text-white shadow-sm',
        'hover:bg-error-700 hover:shadow-md',
        'focus-visible:ring-error-500'
      ),
      glow: cn(
        'bg-primary-600 text-white shadow-lg',
        'hover:shadow-2xl hover:shadow-primary-500/50',
        'focus-visible:ring-primary-500',
        'animate-pulse-slow'
      ),
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      xl: 'h-14 px-8 text-lg gap-3',
    }

    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6',
    }

    const renderContent = () => {
      if (loading) {
        return (
          <>
            <LoadingSpinner 
              size={size === 'sm' ? 'sm' : 'md'} 
              color="white" 
              className="mr-2" 
            />
            {children}
          </>
        )
      }

      if (icon && iconPosition === 'left') {
        return (
          <>
            <span className={iconSizes[size]}>{icon}</span>
            {children}
          </>
        )
      }

      if (icon && iconPosition === 'right') {
        return (
          <>
            {children}
            <span className={iconSizes[size]}>{icon}</span>
          </>
        )
      }

      return children
    }

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {renderContent()}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export default Button
