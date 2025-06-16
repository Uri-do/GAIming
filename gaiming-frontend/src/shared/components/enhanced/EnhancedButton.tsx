/**
 * Enhanced Button Component
 * Advanced button with micro-interactions and animations
 */

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface RippleEffect {
  x: number
  y: number
  size: number
  id: number
}

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  ripple?: boolean
  glow?: boolean
  gradient?: boolean
  pulse?: boolean
  bounce?: boolean
  morphOnHover?: boolean
  soundEffect?: boolean
  hapticFeedback?: boolean
  children: React.ReactNode
}

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  ripple = true,
  glow = false,
  gradient = false,
  pulse = false,
  bounce = false,
  morphOnHover = false,
  soundEffect = false,
  hapticFeedback = false,
  className,
  children,
  onClick,
  disabled,
  ...props
}) => {
  const [ripples, setRipples] = useState<RippleEffect[]>([])
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleIdRef = useRef(0)

  // Variant styles
  const variantStyles = {
    primary: gradient 
      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
      : 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white',
    ghost: 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white'
  }

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }

  // Handle ripple effect
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!ripple || !buttonRef.current) return

    const button = buttonRef.current
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    const newRipple: RippleEffect = {
      x,
      y,
      size,
      id: rippleIdRef.current++
    }

    setRipples(prev => [...prev, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)
  }

  // Handle click with effects
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return

    createRipple(event)
    
    // Haptic feedback
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }

    // Sound effect
    if (soundEffect) {
      playClickSound()
    }

    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)

    onClick?.(event)
  }

  // Play click sound
  const playClickSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  // Loading spinner
  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  )

  return (
    <button
      ref={buttonRef}
      className={cn(
        // Base styles
        'relative overflow-hidden font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transform-gpu', // Enable hardware acceleration
        
        // Variant and size
        variantStyles[variant],
        sizeStyles[size],
        
        // Interactive effects
        !disabled && !loading && [
          'active:scale-95',
          bounce && 'hover:animate-bounce',
          pulse && 'animate-pulse',
          glow && 'hover:shadow-lg hover:shadow-blue-500/25',
          morphOnHover && 'hover:rounded-full',
          isPressed && 'scale-95',
          isHovered && 'scale-105'
        ],
        
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            animationDuration: '600ms'
          }}
        />
      ))}

      {/* Button content */}
      <span className="relative flex items-center justify-center space-x-2">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className={cn(
                'transition-transform duration-200',
                isHovered && 'scale-110'
              )}>
                {icon}
              </span>
            )}
            
            <span className={cn(
              'transition-all duration-200',
              loading && 'opacity-0'
            )}>
              {children}
            </span>
            
            {icon && iconPosition === 'right' && (
              <span className={cn(
                'transition-transform duration-200',
                isHovered && 'scale-110'
              )}>
                {icon}
              </span>
            )}
          </>
        )}
      </span>

      {/* Glow effect */}
      {glow && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 hover:opacity-20 transition-opacity duration-300 -z-10 blur-xl" />
      )}
    </button>
  )
}

export default EnhancedButton

// Preset button variants
export const PrimaryButton: React.FC<Omit<EnhancedButtonProps, 'variant'>> = (props) => (
  <EnhancedButton variant="primary" gradient glow {...props} />
)

export const SecondaryButton: React.FC<Omit<EnhancedButtonProps, 'variant'>> = (props) => (
  <EnhancedButton variant="secondary" {...props} />
)

export const OutlineButton: React.FC<Omit<EnhancedButtonProps, 'variant'>> = (props) => (
  <EnhancedButton variant="outline" morphOnHover {...props} />
)

export const GhostButton: React.FC<Omit<EnhancedButtonProps, 'variant'>> = (props) => (
  <EnhancedButton variant="ghost" {...props} />
)

export const DangerButton: React.FC<Omit<EnhancedButtonProps, 'variant'>> = (props) => (
  <EnhancedButton variant="danger" {...props} />
)

export const SuccessButton: React.FC<Omit<EnhancedButtonProps, 'variant'>> = (props) => (
  <EnhancedButton variant="success" {...props} />
)

// Floating Action Button with enhanced animations
export const FloatingActionButton: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  className?: string
}> = ({ children, onClick, className }) => (
  <EnhancedButton
    variant="primary"
    size="lg"
    gradient
    glow
    bounce
    soundEffect
    hapticFeedback
    className={cn(
      'fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 p-0',
      'shadow-lg hover:shadow-xl',
      className
    )}
    onClick={onClick}
  >
    {children}
  </EnhancedButton>
)

// Button group with staggered animations
export const ButtonGroup: React.FC<{
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
}> = ({ children, className, staggerDelay = 100 }) => (
  <div className={cn('flex space-x-2', className)}>
    {React.Children.map(children, (child, index) => (
      <div
        key={index}
        className="animate-fade-in-up"
        style={{ animationDelay: `${index * staggerDelay}ms` }}
      >
        {child}
      </div>
    ))}
  </div>
)
