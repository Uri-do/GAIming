/**
 * Performance Optimization Hooks
 * React hooks for advanced performance optimization
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { performanceService } from '@/shared/services/performanceService'

/**
 * Advanced caching hook with automatic invalidation
 */
export function useAdvancedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    enabled?: boolean
    refetchOnWindowFocus?: boolean
    staleWhileRevalidate?: boolean
  } = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    enabled = true,
    refetchOnWindowFocus = false,
    staleWhileRevalidate = true
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return

    const now = Date.now()
    const isStale = now - lastFetch > ttl

    if (!forceRefresh && !isStale && data) {
      return data
    }

    try {
      setLoading(true)
      setError(null)

      const result = await performanceService.getCached(key, fetcher, ttl)
      setData(result)
      setLastFetch(now)
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl, enabled, lastFetch, data])

  // Initial fetch
  useEffect(() => {
    if (enabled && !data && !loading) {
      fetchData()
    }
  }, [enabled, data, loading, fetchData])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      const now = Date.now()
      if (now - lastFetch > ttl / 2) { // Refetch if half TTL has passed
        fetchData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, lastFetch, ttl, fetchData])

  const refetch = useCallback(() => fetchData(true), [fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    isStale: Date.now() - lastFetch > ttl
  }
}

/**
 * Debounced value hook for performance optimization
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttled callback hook
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    }
  }, [items, itemHeight, containerHeight, scrollTop])

  const handleScroll = useThrottle((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, 16) // ~60fps

  return {
    visibleItems,
    handleScroll,
    totalHeight: visibleItems.totalHeight,
    offsetY: visibleItems.offsetY
  }
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        setEntry(entry)
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [options])

  return {
    elementRef,
    isIntersecting,
    entry
  }
}

/**
 * Performance metrics hook
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState(performanceService.getPerformanceMetrics())

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceService.getPerformanceMetrics())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const recommendations = useMemo(() => {
    return performanceService.getOptimizationRecommendations()
  }, [metrics])

  return {
    metrics,
    recommendations,
    optimizeMemory: performanceService.optimizeMemory.bind(performanceService)
  }
}

/**
 * Preload hook for critical resources
 */
export function usePreload(resources: string[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    resources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = resource
      document.head.appendChild(link)
    })

    return () => {
      // Cleanup prefetch links
      resources.forEach(resource => {
        const link = document.querySelector(`link[href="${resource}"]`)
        if (link) {
          document.head.removeChild(link)
        }
      })
    }
  }, [resources, enabled])
}

/**
 * Optimized image loading hook
 */
export function useOptimizedImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { elementRef, isIntersecting } = useIntersectionObserver()

  useEffect(() => {
    if (!isIntersecting || !src) return

    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setLoading(false)
    }
    img.onerror = () => {
      setError(true)
      setLoading(false)
    }
    img.src = src
  }, [src, isIntersecting])

  return {
    elementRef,
    imageSrc,
    loading,
    error,
    isIntersecting
  }
}

/**
 * Bundle splitting hook for dynamic imports
 */
export function useDynamicImport<T>(
  importFunc: () => Promise<{ default: T }>,
  deps: any[] = []
) {
  const [component, setComponent] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadComponent = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const module = await importFunc()
        
        if (!cancelled) {
          setComponent(module.default)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Import failed'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadComponent()

    return () => {
      cancelled = true
    }
  }, deps)

  return { component, loading, error }
}

/**
 * Memory optimization hook
 */
export function useMemoryOptimization() {
  const [memoryUsage, setMemoryUsage] = useState(0)

  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryUsage(memory.usedJSHeapSize / 1024 / 1024) // MB
      }
    }

    updateMemoryUsage()
    const interval = setInterval(updateMemoryUsage, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const optimizeMemory = useCallback(() => {
    performanceService.optimizeMemory()
  }, [])

  return {
    memoryUsage,
    optimizeMemory,
    isHighMemoryUsage: memoryUsage > 100
  }
}

/**
 * Network optimization hook
 */
export function useNetworkOptimization() {
  const [networkInfo, setNetworkInfo] = useState<any>(null)

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setNetworkInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      })

      const updateConnection = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        })
      }

      connection.addEventListener('change', updateConnection)
      return () => connection.removeEventListener('change', updateConnection)
    }
  }, [])

  const isSlowConnection = useMemo(() => {
    if (!networkInfo) return false
    return networkInfo.effectiveType === 'slow-2g' || 
           networkInfo.effectiveType === '2g' ||
           networkInfo.saveData
  }, [networkInfo])

  return {
    networkInfo,
    isSlowConnection,
    shouldOptimizeForSlowNetwork: isSlowConnection
  }
}
