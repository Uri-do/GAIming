import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gaming' | 'glass' | 'elevated' | 'bordered'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  glow?: boolean
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gaming'
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hover = false, glow = false, ...props }, ref) => {
    const baseClasses = cn(
      'rounded-lg transition-all duration-200',
      hover && 'hover:scale-[1.02] cursor-pointer',
      glow && 'shadow-lg hover:shadow-xl'
    )

    const variants = {
      default: cn(
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
      ),
      gaming: cn(
        'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        'border border-primary-500/20 shadow-lg shadow-primary-500/10',
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary-500/5 before:to-transparent'
      ),
      glass: cn(
        'backdrop-blur-md bg-white/10 dark:bg-gray-900/10',
        'border border-white/20 dark:border-gray-700/20',
        'shadow-xl'
      ),
      elevated: cn(
        'bg-white dark:bg-gray-800 shadow-xl shadow-gray-900/10',
        'border border-gray-100 dark:border-gray-700'
      ),
      bordered: cn(
        'bg-white dark:bg-gray-800 border-2 border-primary-200 dark:border-primary-800'
      ),
    }

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      />
    )
  }
)

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'flex flex-col space-y-1.5 pb-4',
      gaming: cn(
        'flex flex-col space-y-1.5 pb-4 relative',
        'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px',
        'after:bg-gradient-to-r after:from-transparent after:via-primary-500 after:to-transparent'
      ),
    }

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    )
  }
)

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-white',
        className
      )}
      {...props}
    />
  )
)

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600 dark:text-gray-400', className)}
      {...props}
    />
  )
)

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    />
  )
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardTitle.displayName = 'CardTitle'
CardDescription.displayName = 'CardDescription'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
export default Card
