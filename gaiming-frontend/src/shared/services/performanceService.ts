/**
 * Performance Monitoring and Optimization Service
 * Advanced performance tracking, caching, and optimization utilities
 */

interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  memoryUsage: number
  renderTime: number
  bundleSize: number
  cacheHitRate: number
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

interface PerformanceConfig {
  enableCaching: boolean
  cacheMaxSize: number
  defaultTTL: number
  enableMetrics: boolean
  enableLazyLoading: boolean
  enablePreloading: boolean
}

class PerformanceService {
  private cache = new Map<string, CacheEntry<any>>()
  private metrics: PerformanceMetrics[] = []
  private config: PerformanceConfig = {
    enableCaching: true,
    cacheMaxSize: 100,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    enableMetrics: true,
    enableLazyLoading: true,
    enablePreloading: true
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    if (this.config.enableMetrics) {
      this.setupPerformanceObserver()
      this.setupMemoryMonitoring()
      this.setupNavigationTiming()
    }
  }

  /**
   * Advanced caching with TTL and LRU eviction
   */
  async getCached<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.config.defaultTTL
  ): Promise<T> {
    if (!this.config.enableCaching) {
      return fetcher()
    }

    const cached = this.cache.get(key)
    const now = Date.now()

    // Check if cached data is still valid
    if (cached && (now - cached.timestamp) < cached.ttl) {
      cached.hits++
      return cached.data
    }

    // Fetch new data
    const startTime = performance.now()
    const data = await fetcher()
    const fetchTime = performance.now() - startTime

    // Store in cache
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      hits: 1
    })

    // Evict old entries if cache is full
    this.evictOldEntries()

    // Track API performance
    this.trackApiPerformance(key, fetchTime)

    return data
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    if (!this.config.enablePreloading) return

    const criticalResources = [
      '/api/games?pageSize=20', // First page of games
      '/api/analytics/dashboard', // Dashboard data
      '/api/recommendations/1001' // User recommendations
    ]

    criticalResources.forEach(resource => {
      this.preloadResource(resource)
    })
  }

  /**
   * Lazy load images with intersection observer
   */
  setupLazyLoading() {
    if (!this.config.enableLazyLoading || !('IntersectionObserver' in window)) {
      return
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.classList.remove('lazy')
            imageObserver.unobserve(img)
          }
        }
      })
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    })

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img)
    })
  }

  /**
   * Optimize bundle loading with dynamic imports
   */
  async loadFeature(featureName: string) {
    const startTime = performance.now()
    
    try {
      let module
      switch (featureName) {
        case 'games':
          module = await import('@/features/games')
          break
        case 'analytics':
          module = await import('@/features/analytics')
          break
        case 'recommendations':
          module = await import('@/features/recommendations')
          break
        default:
          throw new Error(`Unknown feature: ${featureName}`)
      }
      
      const loadTime = performance.now() - startTime
      this.trackBundleLoad(featureName, loadTime)
      
      return module
    } catch (error) {
      console.error(`Failed to load feature ${featureName}:`, error)
      throw error
    }
  }

  /**
   * Memory optimization utilities
   */
  optimizeMemory() {
    // Clear old cache entries
    this.clearExpiredCache()
    
    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc()
    }
    
    // Clear unused event listeners
    this.cleanupEventListeners()
  }

  /**
   * Performance metrics collection
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const memory = (performance as any).memory
    
    return {
      pageLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      apiResponseTime: this.getAverageApiResponseTime(),
      memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0,
      renderTime: this.getAverageRenderTime(),
      bundleSize: this.getBundleSize(),
      cacheHitRate: this.getCacheHitRate()
    }
  }

  /**
   * Performance optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const metrics = this.getPerformanceMetrics()
    const recommendations: string[] = []

    if (metrics.pageLoadTime > 3000) {
      recommendations.push('Consider enabling more aggressive caching')
      recommendations.push('Optimize bundle splitting for faster initial load')
    }

    if (metrics.apiResponseTime > 1000) {
      recommendations.push('Implement request debouncing')
      recommendations.push('Add more aggressive API caching')
    }

    if (metrics.memoryUsage > 100) {
      recommendations.push('Implement virtual scrolling for large lists')
      recommendations.push('Clear unused components from memory')
    }

    if (metrics.cacheHitRate < 0.7) {
      recommendations.push('Increase cache TTL for stable data')
      recommendations.push('Implement predictive caching')
    }

    return recommendations
  }

  /**
   * Real-time performance monitoring
   */
  startRealTimeMonitoring() {
    setInterval(() => {
      const metrics = this.getPerformanceMetrics()
      this.metrics.push(metrics)
      
      // Keep only last 100 metrics
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100)
      }
      
      // Alert on performance issues
      this.checkPerformanceThresholds(metrics)
    }, 30000) // Every 30 seconds
  }

  // Private methods
  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'measure') {
            this.trackCustomMetric(entry.name, entry.duration)
          }
        })
      })
      
      observer.observe({ entryTypes: ['measure', 'navigation'] })
    }
  }

  private setupMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        if (memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
          console.warn('High memory usage detected:', memory.usedJSHeapSize / 1024 / 1024, 'MB')
          this.optimizeMemory()
        }
      }, 60000) // Every minute
    }
  }

  private setupNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart
          console.log('Page load time:', loadTime, 'ms')
          
          if (loadTime > 3000) {
            console.warn('Slow page load detected. Consider optimization.')
          }
        }
      }, 0)
    })
  }

  private evictOldEntries() {
    if (this.cache.size <= this.config.cacheMaxSize) return

    // Sort by last access time and hits (LRU + LFU hybrid)
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => {
        const scoreA = a[1].hits / (Date.now() - a[1].timestamp)
        const scoreB = b[1].hits / (Date.now() - b[1].timestamp)
        return scoreA - scoreB
      })

    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2)
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0])
    }
  }

  private clearExpiredCache() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private cleanupEventListeners() {
    // Remove unused event listeners to prevent memory leaks
    // This would be implemented based on specific app needs
  }

  private preloadResource(url: string) {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)
  }

  private trackApiPerformance(endpoint: string, duration: number) {
    performance.mark(`api-${endpoint}-end`)
    performance.measure(`api-${endpoint}`, `api-${endpoint}-start`, `api-${endpoint}-end`)
  }

  private trackBundleLoad(featureName: string, duration: number) {
    console.log(`Feature ${featureName} loaded in ${duration.toFixed(2)}ms`)
  }

  private trackCustomMetric(name: string, duration: number) {
    console.log(`Custom metric ${name}: ${duration.toFixed(2)}ms`)
  }

  private getAverageApiResponseTime(): number {
    const apiEntries = performance.getEntriesByType('measure')
      .filter(entry => entry.name.startsWith('api-'))
    
    if (apiEntries.length === 0) return 0
    
    const total = apiEntries.reduce((sum, entry) => sum + entry.duration, 0)
    return total / apiEntries.length
  }

  private getAverageRenderTime(): number {
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcp ? fcp.startTime : 0
  }

  private getBundleSize(): number {
    const scripts = document.querySelectorAll('script[src]')
    return scripts.length // Simplified - would need actual size calculation
  }

  private getCacheHitRate(): number {
    if (this.cache.size === 0) return 0
    
    const totalHits = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.hits, 0)
    const totalRequests = Array.from(this.cache.values()).length
    
    return totalHits / totalRequests
  }

  private checkPerformanceThresholds(metrics: PerformanceMetrics) {
    if (metrics.pageLoadTime > 5000) {
      console.warn('Critical: Page load time exceeds 5 seconds')
    }
    
    if (metrics.memoryUsage > 150) {
      console.warn('Critical: Memory usage exceeds 150MB')
    }
    
    if (metrics.apiResponseTime > 2000) {
      console.warn('Warning: API response time is slow')
    }
  }
}

// Export singleton instance
export const performanceService = new PerformanceService()

// Initialize on import
performanceService.init()

// Export class for testing
export { PerformanceService }
