/**
 * Advanced Animation System
 * Comprehensive animation utilities and components for exceptional UX
 */

import React, { useState, useEffect, useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Animation types
export type AnimationType = 
  | 'fadeIn' | 'fadeOut' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight'
  | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight'
  | 'scaleIn' | 'scaleOut' | 'bounce' | 'pulse' | 'shake' | 'flip'
  | 'zoomIn' | 'zoomOut' | 'rotateIn' | 'rotateOut'

export type AnimationDuration = 'fast' | 'normal' | 'slow' | 'slower'
export type AnimationEasing = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'

interface AnimationProps {
  children: ReactNode
  animation: AnimationType
  duration?: AnimationDuration
  delay?: number
  easing?: AnimationEasing
  repeat?: number | 'infinite'
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  trigger?: 'immediate' | 'hover' | 'click' | 'scroll'
  threshold?: number
  onAnimationStart?: () => void
  onAnimationEnd?: () => void
  className?: string
}

// Animation keyframes
const animationKeyframes = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  fadeInUp: 'animate-fade-in-up',
  fadeInDown: 'animate-fade-in-down',
  fadeInLeft: 'animate-fade-in-left',
  fadeInRight: 'animate-fade-in-right',
  slideInUp: 'animate-slide-in-up',
  slideInDown: 'animate-slide-in-down',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  shake: 'animate-shake',
  flip: 'animate-flip',
  zoomIn: 'animate-zoom-in',
  zoomOut: 'animate-zoom-out',
  rotateIn: 'animate-rotate-in',
  rotateOut: 'animate-rotate-out'
}

// Duration classes
const durationClasses = {
  fast: 'duration-150',
  normal: 'duration-300',
  slow: 'duration-500',
  slower: 'duration-700'
}

// Easing classes
const easingClasses = {
  ease: 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  linear: 'linear'
}

/**
 * Main Animation Component
 */
export const AnimatedElement: React.FC<AnimationProps> = ({
  children,
  animation,
  duration = 'normal',
  delay = 0,
  easing = 'ease-out',
  repeat = 1,
  direction = 'normal',
  fillMode = 'both',
  trigger = 'immediate',
  threshold = 0.1,
  onAnimationStart,
  onAnimationEnd,
  className
}) => {
  const [isVisible, setIsVisible] = useState(trigger === 'immediate')
  const [isAnimating, setIsAnimating] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for scroll trigger
  useEffect(() => {
    if (trigger !== 'scroll') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [trigger, threshold])

  // Handle animation events
  const handleAnimationStart = () => {
    setIsAnimating(true)
    onAnimationStart?.()
  }

  const handleAnimationEnd = () => {
    setIsAnimating(false)
    onAnimationEnd?.()
  }

  // Handle trigger events
  const handleMouseEnter = () => {
    if (trigger === 'hover') setIsVisible(true)
  }

  const handleMouseLeave = () => {
    if (trigger === 'hover') setIsVisible(false)
  }

  const handleClick = () => {
    if (trigger === 'click') setIsVisible(!isVisible)
  }

  const animationClass = animationKeyframes[animation]
  const durationClass = durationClasses[duration]
  const easingClass = easingClasses[easing]

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all',
        durationClass,
        easingClass,
        isVisible && animationClass,
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationIterationCount: repeat,
        animationDirection: direction,
        animationFillMode: fillMode
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onAnimationStart={handleAnimationStart}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  )
}

/**
 * Stagger Animation Component
 */
interface StaggerProps {
  children: ReactNode[]
  animation: AnimationType
  staggerDelay?: number
  duration?: AnimationDuration
  className?: string
}

export const StaggeredAnimation: React.FC<StaggerProps> = ({
  children,
  animation,
  staggerDelay = 100,
  duration = 'normal',
  className
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <AnimatedElement
          animation={animation}
          duration={duration}
          delay={index * staggerDelay}
          trigger="scroll"
        >
          {child}
        </AnimatedElement>
      ))}
    </div>
  )
}

/**
 * Parallax Component
 */
interface ParallaxProps {
  children: ReactNode
  speed?: number
  className?: string
}

export const ParallaxElement: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  className
}) => {
  const [offset, setOffset] = useState(0)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return
      
      const rect = elementRef.current.getBoundingClientRect()
      const scrolled = window.pageYOffset
      const rate = scrolled * -speed
      
      setOffset(rate)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        transform: `translateY(${offset}px)`
      }}
    >
      {children}
    </div>
  )
}

/**
 * Morphing Button Component
 */
interface MorphingButtonProps {
  children: ReactNode
  morphTo?: ReactNode
  trigger?: 'hover' | 'click'
  className?: string
  onClick?: () => void
}

export const MorphingButton: React.FC<MorphingButtonProps> = ({
  children,
  morphTo,
  trigger = 'hover',
  className,
  onClick
}) => {
  const [isMorphed, setIsMorphed] = useState(false)

  const handleInteraction = () => {
    if (trigger === 'click') {
      setIsMorphed(!isMorphed)
      onClick?.()
    }
  }

  const handleMouseEnter = () => {
    if (trigger === 'hover') setIsMorphed(true)
  }

  const handleMouseLeave = () => {
    if (trigger === 'hover') setIsMorphed(false)
  }

  return (
    <button
      className={cn(
        'relative overflow-hidden transition-all duration-300 ease-out',
        className
      )}
      onClick={handleInteraction}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          'transition-all duration-300 ease-out',
          isMorphed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        )}
      >
        {children}
      </div>
      {morphTo && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'transition-all duration-300 ease-out',
            isMorphed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}
        >
          {morphTo}
        </div>
      )}
    </button>
  )
}

/**
 * Floating Action Button with animations
 */
interface FloatingActionButtonProps {
  children: ReactNode
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  className?: string
  onClick?: () => void
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  children,
  position = 'bottom-right',
  className,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  return (
    <button
      className={cn(
        'fixed z-50 w-14 h-14 rounded-full shadow-lg',
        'bg-gradient-to-r from-blue-500 to-purple-600',
        'text-white flex items-center justify-center',
        'transition-all duration-300 ease-out',
        'hover:shadow-xl hover:scale-110',
        'active:scale-95',
        positionClasses[position],
        isHovered && 'animate-pulse',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        'transition-transform duration-300',
        isHovered && 'scale-110'
      )}>
        {children}
      </div>
    </button>
  )
}

/**
 * Loading Skeleton with shimmer effect
 */
interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className,
  variant = 'rectangular'
}) => {
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
        'dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
        'animate-shimmer bg-[length:200%_100%]',
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
    />
  )
}

/**
 * Progress Bar with smooth animations
 */
interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  animated?: boolean
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  showLabel = false,
  animated = true,
  color = 'blue'
}) => {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {value} / {max} ({percentage.toFixed(1)}%)
        </div>
      )}
    </div>
  )
}

/**
 * Notification Toast with animations
 */
interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for exit animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  }

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg',
        'transition-all duration-300 ease-out',
        typeClasses[type],
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 translate-x-full'
      )}
    >
      {message}
    </div>
  )
}
