/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

import { API_BASE_URL, envInfo } from './env'

// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: API_BASE_URL,
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Retry configuration
  RETRY: {
    attempts: 3,
    delay: 1000, // milliseconds
  },
  
  // Token refresh configuration
  TOKEN_REFRESH: {
    interval: 15 * 60 * 1000, // 15 minutes
    beforeExpiry: 5 * 60 * 1000, // 5 minutes before expiry
  },
} as const

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  
  // Games
  GAMES: {
    BASE: '/games',
    BY_ID: (id: number) => `/games/${id}`,
    SEARCH: '/games/search',
    PROVIDERS: '/games/providers',
    TYPES: '/games/types',
  },
  
  // Players
  PLAYERS: {
    BASE: '/players',
    BY_ID: (id: number) => `/players/${id}`,
    SEARCH: '/players/search',
    ANALYTICS: (id: number) => `/players/${id}/analytics`,
  },
  
  // Recommendations
  RECOMMENDATIONS: {
    BASE: '/recommendations',
    BY_PLAYER: (playerId: number) => `/recommendations/player/${playerId}`,
    ANALYTICS: '/recommendations/analytics',
    GENERATE: '/recommendations/generate',
    INTERACTION: '/recommendations/interaction',
  },
  
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    PERFORMANCE: '/analytics/performance',
    DIVERSITY: '/analytics/diversity',
    EXPORT: '/analytics/export',
  },
  
  // A/B Testing
  AB_TESTING: {
    BASE: '/ab-testing',
    EXPERIMENTS: '/ab-testing/experiments',
    BY_ID: (id: number) => `/ab-testing/experiments/${id}`,
    RESULTS: (id: number) => `/ab-testing/experiments/${id}/results`,
  },
  
  // ML Models
  MODELS: {
    BASE: '/models',
    BY_ID: (id: number) => `/models/${id}`,
    PERFORMANCE: (id: number) => `/models/${id}/performance`,
    DEPLOY: (id: number) => `/models/${id}/deploy`,
    RETIRE: (id: number) => `/models/${id}/retire`,
  },
  
  // Admin
  ADMIN: {
    USERS: '/admin/users',
    ROLES: '/admin/roles',
    PERMISSIONS: '/admin/permissions',
    ACTIVITY: '/admin/activity',
  },
  
  // Settings
  SETTINGS: {
    BASE: '/settings',
    THEME: '/settings/theme',
    NOTIFICATIONS: '/settings/notifications',
  },
  
  // Health
  HEALTH: {
    BASE: '/health',
    READY: '/health/ready',
    LIVE: '/health/live',
  },
} as const

// Re-export environment info for convenience
export { envInfo as ENV_INFO } from './env'

// Validation function for API configuration
export const validateApiConfig = (): void => {
  try {
    // Test if API base URL is accessible
    const url = new URL(API_CONFIG.BASE_URL)
    console.log('✅ API Configuration validated:', {
      baseUrl: API_CONFIG.BASE_URL,
      protocol: url.protocol,
      host: url.host,
      environment: envInfo.mode,
    })
  } catch (error) {
    console.error('❌ Invalid API base URL:', API_CONFIG.BASE_URL)
    throw new Error(`Invalid API configuration: ${error}`)
  }
}

// Initialize and validate configuration
if (envInfo.isDevelopment) {
  validateApiConfig()
}
