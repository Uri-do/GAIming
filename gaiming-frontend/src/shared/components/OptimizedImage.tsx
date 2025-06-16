/**
 * Optimized Image Component
 * Advanced lazy loading with performance optimizations
 */

import React, { useState, useRef, useEffect } from 'react'
import { useOptimizedImage, useIntersectionObserver } from '@/shared/hooks/usePerformanceOptimization'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  placeholder?: string
  className?: string
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpg' | 'png'
  sizes?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
  fallback?: string
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  placeholder,
  className,
  width,
  height,
  quality = 85,
  format = 'webp',
  sizes,
  loading = 'lazy',
  priority = false,
  onLoad,
  onError,
  fallback
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(placeholder || '')
  const imgRef = useRef<HTMLImageElement>(null)
  
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  })

  // Generate optimized image URLs
  const generateOptimizedSrc = (originalSrc: string, w?: number, h?: number) => {
    if (!originalSrc) return ''
    
    // In a real app, this would integrate with an image optimization service
    // like Cloudinary, ImageKit, or Next.js Image Optimization
    const params = new URLSearchParams()
    
    if (w) params.append('w', w.toString())
    if (h) params.append('h', h.toString())
    params.append('q', quality.toString())
    params.append('f', format)
    
    // For demo purposes, return original src
    // In production: return `${CDN_URL}/${originalSrc}?${params.toString()}`
    return originalSrc
  }

  // Generate responsive srcSet
  const generateSrcSet = (originalSrc: string) => {
    if (!width) return undefined
    
    const breakpoints = [0.5, 1, 1.5, 2] // Different pixel densities
    return breakpoints
      .map(multiplier => {
        const w = Math.round(width * multiplier)
        const optimizedSrc = generateOptimizedSrc(originalSrc, w, height)
        return `${optimizedSrc} ${multiplier}x`
      })
      .join(', ')
  }

  // Load image when in viewport or priority
  useEffect(() => {
    if (!src || imageLoaded || imageError) return
    if (loading === 'lazy' && !isIntersecting && !priority) return

    const img = new Image()
    
    img.onload = () => {
      setCurrentSrc(src)
      setImageLoaded(true)
      onLoad?.()
    }
    
    img.onerror = () => {
      setImageError(true)
      if (fallback) {
        setCurrentSrc(fallback)
      }
      onError?.()
    }

    // Set up responsive loading
    const optimizedSrc = generateOptimizedSrc(src, width, height)
    const srcSet = generateSrcSet(src)
    
    if (srcSet) {
      img.srcset = srcSet
    }
    img.src = optimizedSrc
    
    if (sizes) {
      img.sizes = sizes
    }
  }, [src, isIntersecting, priority, loading, width, height, imageLoaded, imageError, fallback, onLoad, onError, quality, format, sizes])

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = generateOptimizedSrc(src, width, height)
      
      const srcSet = generateSrcSet(src)
      if (srcSet) {
        link.setAttribute('imagesrcset', srcSet)
      }
      
      if (sizes) {
        link.setAttribute('imagesizes', sizes)
      }
      
      document.head.appendChild(link)
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link)
        }
      }
    }
  }, [priority, src, width, height, sizes])

  // Combine refs
  const setRefs = (element: HTMLImageElement | null) => {
    imgRef.current = element
    if (typeof elementRef === 'function') {
      elementRef(element)
    } else if (elementRef) {
      elementRef.current = element
    }
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder/Loading state */}
      {!imageLoaded && !imageError && (
        <div 
          className={cn(
            'absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse',
            'flex items-center justify-center'
          )}
          style={{ width, height }}
        >
          {placeholder ? (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="w-8 h-8 text-gray-400">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Main image */}
      <img
        ref={setRefs}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={cn(
          'transition-opacity duration-300',
          imageLoaded ? 'opacity-100' : 'opacity-0',
          imageError && 'opacity-50',
          className
        )}
        style={{
          width: width || 'auto',
          height: height || 'auto'
        }}
        loading={loading}
        decoding="async"
      />

      {/* Error state */}
      {imageError && !fallback && (
        <div 
          className={cn(
            'absolute inset-0 bg-gray-100 dark:bg-gray-800',
            'flex items-center justify-center text-gray-400'
          )}
          style={{ width, height }}
        >
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z"/>
              </svg>
            </div>
            <div className="text-xs">Failed to load</div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!imageLoaded && !imageError && isIntersecting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

export default OptimizedImage

// Higher-order component for automatic optimization
export const withImageOptimization = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    return <Component {...props} ref={ref} />
  })
}

// Utility function for generating responsive image props
export const generateResponsiveImageProps = (
  src: string,
  breakpoints: { width: number; size: string }[]
) => {
  const sizes = breakpoints
    .map(bp => `(max-width: ${bp.width}px) ${bp.size}`)
    .join(', ')

  return {
    src,
    sizes,
    loading: 'lazy' as const
  }
}

// Image optimization utilities
export const imageOptimizationUtils = {
  // Calculate optimal image dimensions
  calculateOptimalDimensions: (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ) => {
    const aspectRatio = originalWidth / originalHeight
    
    let width = originalWidth
    let height = originalHeight
    
    if (width > maxWidth) {
      width = maxWidth
      height = width / aspectRatio
    }
    
    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }
    
    return { width: Math.round(width), height: Math.round(height) }
  },

  // Generate blur placeholder
  generateBlurPlaceholder: (width: number, height: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    
    // Create a simple gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f3f4f6')
    gradient.addColorStop(1, '#e5e7eb')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    return canvas.toDataURL('image/jpeg', 0.1)
  },

  // Check if WebP is supported
  supportsWebP: () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  },

  // Check if AVIF is supported
  supportsAVIF: () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    try {
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
    } catch {
      return false
    }
  }
}
