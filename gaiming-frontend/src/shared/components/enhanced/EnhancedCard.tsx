/**
 * Enhanced Card Component
 * Advanced card with hover effects, animations, and micro-interactions
 */

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface EnhancedCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  tilt?: boolean
  lift?: boolean
  borderGradient?: boolean
  glassmorphism?: boolean
  parallax?: boolean
  magnetic?: boolean
  onClick?: () => void
  onHover?: (isHovered: boolean) => void
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  className,
  hover = true,
  glow = false,
  tilt = false,
  lift = true,
  borderGradient = false,
  glassmorphism = false,
  parallax = false,
  magnetic = false,
  onClick,
  onHover
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [tiltStyle, setTiltStyle] = useState({})
  const cardRef = useRef<HTMLDivElement>(null)

  // Handle mouse movement for tilt and magnetic effects
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = event.clientX - centerX
    const mouseY = event.clientY - centerY

    setMousePosition({ x: mouseX, y: mouseY })

    // Tilt effect
    if (tilt) {
      const tiltX = (mouseY / rect.height) * 20
      const tiltY = (mouseX / rect.width) * -20
      
      setTiltStyle({
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.05, 1.05, 1.05)`
      })
    }

    // Magnetic effect
    if (magnetic) {
      const magnetStrength = 0.3
      const magnetX = mouseX * magnetStrength
      const magnetY = mouseY * magnetStrength
      
      setTiltStyle(prev => ({
        ...prev,
        transform: `${prev.transform || ''} translate3d(${magnetX}px, ${magnetY}px, 0)`
      }))
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    onHover?.(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTiltStyle({})
    onHover?.(false)
  }

  // Parallax effect
  useEffect(() => {
    if (!parallax) return

    const handleScroll = () => {
      if (!cardRef.current) return
      
      const rect = cardRef.current.getBoundingClientRect()
      const scrolled = window.pageYOffset
      const rate = scrolled * -0.5
      
      cardRef.current.style.transform = `translate3d(0, ${rate}px, 0)`
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [parallax])

  return (
    <div
      ref={cardRef}
      className={cn(
        // Base styles
        'relative rounded-xl transition-all duration-300 ease-out',
        'transform-gpu', // Hardware acceleration
        
        // Background and border
        glassmorphism 
          ? 'bg-white/10 dark:bg-gray-900/10 backdrop-blur-lg border border-white/20'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        
        // Hover effects
        hover && [
          'cursor-pointer',
          lift && 'hover:shadow-xl hover:-translate-y-2',
          glow && 'hover:shadow-2xl hover:shadow-blue-500/25',
          !tilt && !magnetic && 'hover:scale-105'
        ],
        
        // Border gradient
        borderGradient && 'border-gradient-to-r from-blue-500 to-purple-600',
        
        className
      )}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Glow effect background */}
      {glow && isHovered && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-500/20 blur-xl -z-10" />
      )}

      {/* Border gradient overlay */}
      {borderGradient && (
        <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="w-full h-full rounded-xl bg-white dark:bg-gray-800" />
        </div>
      )}

      {/* Spotlight effect */}
      {isHovered && (
        <div
          className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x + 50}% ${mousePosition.y + 50}%, rgba(255,255,255,0.3) 0%, transparent 50%)`
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default EnhancedCard

// Preset card variants
export const GlassCard: React.FC<Omit<EnhancedCardProps, 'glassmorphism'>> = (props) => (
  <EnhancedCard glassmorphism glow {...props} />
)

export const TiltCard: React.FC<Omit<EnhancedCardProps, 'tilt'>> = (props) => (
  <EnhancedCard tilt glow lift={false} {...props} />
)

export const MagneticCard: React.FC<Omit<EnhancedCardProps, 'magnetic'>> = (props) => (
  <EnhancedCard magnetic glow {...props} />
)

export const GradientCard: React.FC<Omit<EnhancedCardProps, 'borderGradient'>> = (props) => (
  <EnhancedCard borderGradient glow {...props} />
)

// Card with animated content
export const AnimatedContentCard: React.FC<{
  title: string
  description: string
  image?: string
  className?: string
  onClick?: () => void
}> = ({ title, description, image, className, onClick }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <EnhancedCard
      className={cn('p-6 overflow-hidden', className)}
      onHover={setIsHovered}
      onClick={onClick}
      tilt
      glow
    >
      {image && (
        <div className="relative mb-4 overflow-hidden rounded-lg">
          <img
            src={image}
            alt={title}
            className={cn(
              'w-full h-48 object-cover transition-transform duration-500',
              isHovered && 'scale-110'
            )}
          />
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/50 to-transparent',
            'transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )} />
        </div>
      )}
      
      <div className={cn(
        'transition-transform duration-300',
        isHovered && 'translate-y-[-4px]'
      )}>
        <h3 className={cn(
          'text-xl font-semibold mb-2 transition-colors duration-300',
          isHovered && 'text-blue-500'
        )}>
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
    </EnhancedCard>
  )
}

// Card grid with staggered animations
export const CardGrid: React.FC<{
  children: React.ReactNode[]
  columns?: number
  gap?: number
  staggerDelay?: number
  className?: string
}> = ({ children, columns = 3, gap = 6, staggerDelay = 100, className }) => (
  <div 
    className={cn(
      `grid gap-${gap}`,
      `grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`,
      className
    )}
  >
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

// Expandable card
export const ExpandableCard: React.FC<{
  title: string
  preview: string
  content: React.ReactNode
  className?: string
}> = ({ title, preview, content, className }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <EnhancedCard
      className={cn(
        'p-6 transition-all duration-500',
        isExpanded ? 'row-span-2' : '',
        className
      )}
      onClick={() => setIsExpanded(!isExpanded)}
      lift
      glow
    >
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        
        <div className={cn(
          'transition-all duration-500 overflow-hidden',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-20 opacity-70'
        )}>
          {isExpanded ? content : <p>{preview}</p>}
        </div>
        
        <div className="flex justify-end">
          <button className={cn(
            'text-blue-500 text-sm font-medium transition-transform duration-300',
            isExpanded && 'rotate-180'
          )}>
            {isExpanded ? '↑ Less' : '↓ More'}
          </button>
        </div>
      </div>
    </EnhancedCard>
  )
}

// Flip card
export const FlipCard: React.FC<{
  front: React.ReactNode
  back: React.ReactNode
  className?: string
}> = ({ front, back, className }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div 
      className={cn('relative w-full h-64 perspective-1000', className)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={cn(
        'relative w-full h-full transition-transform duration-700 transform-style-preserve-3d',
        isFlipped && 'rotate-y-180'
      )}>
        {/* Front */}
        <div className="absolute inset-0 backface-hidden">
          <EnhancedCard className="w-full h-full p-6" hover={false}>
            {front}
          </EnhancedCard>
        </div>
        
        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <EnhancedCard className="w-full h-full p-6" hover={false}>
            {back}
          </EnhancedCard>
        </div>
      </div>
    </div>
  )
}
