/**
 * Environment Configuration and Validation
 * Centralized environment variable management with validation
 */

// Environment variable schema
interface EnvSchema {
  // API Configuration
  VITE_API_BASE_URL: string
  
  // Application Configuration
  VITE_APP_NAME?: string
  VITE_APP_VERSION?: string
  
  // Feature Flags
  VITE_ENABLE_ANALYTICS?: string
  VITE_ENABLE_AB_TESTING?: string
  VITE_ENABLE_REAL_TIME_UPDATES?: string
  VITE_ENABLE_DEVTOOLS?: string
  
  // Development Settings
  VITE_LOG_LEVEL?: string
  
  // External Services
  VITE_SENTRY_DSN?: string
  VITE_GOOGLE_ANALYTICS_ID?: string
}

// Type-safe environment variables
export const env: EnvSchema = {
  // API Configuration (required)
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:65073/api',
  
  // Application Configuration
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'GAIming',
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Feature Flags
  VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS || 'true',
  VITE_ENABLE_AB_TESTING: import.meta.env.VITE_ENABLE_AB_TESTING || 'true',
  VITE_ENABLE_REAL_TIME_UPDATES: import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES || 'true',
  VITE_ENABLE_DEVTOOLS: import.meta.env.VITE_ENABLE_DEVTOOLS || 'true',
  
  // Development Settings
  VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // External Services
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
}

// Helper functions for boolean environment variables
export const isFeatureEnabled = (feature: keyof Pick<EnvSchema, 
  'VITE_ENABLE_ANALYTICS' | 
  'VITE_ENABLE_AB_TESTING' | 
  'VITE_ENABLE_REAL_TIME_UPDATES' | 
  'VITE_ENABLE_DEVTOOLS'
>): boolean => {
  const value = env[feature]
  return value === 'true' || value === '1' || value === 'yes'
}

// Environment information
export const envInfo = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL,
} as const

// Validation functions
const validateUrl = (url: string, name: string): void => {
  try {
    new URL(url)
  } catch {
    throw new Error(`Invalid URL for ${name}: ${url}`)
  }
}

const validateRequired = (value: string | undefined, name: string): void => {
  if (!value || value.trim() === '') {
    throw new Error(`Required environment variable ${name} is missing or empty`)
  }
}

// Environment validation
export const validateEnvironment = (): void => {
  const errors: string[] = []

  try {
    // Validate required variables
    validateRequired(env.VITE_API_BASE_URL, 'VITE_API_BASE_URL')
    
    // Validate URLs
    validateUrl(env.VITE_API_BASE_URL, 'VITE_API_BASE_URL')
    
    if (env.VITE_SENTRY_DSN) {
      validateUrl(env.VITE_SENTRY_DSN, 'VITE_SENTRY_DSN')
    }

    // Validate log level
    const validLogLevels = ['debug', 'info', 'warn', 'error']
    if (env.VITE_LOG_LEVEL && !validLogLevels.includes(env.VITE_LOG_LEVEL)) {
      errors.push(`Invalid log level: ${env.VITE_LOG_LEVEL}. Must be one of: ${validLogLevels.join(', ')}`)
    }

  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:')
    errors.forEach(error => console.error(`  - ${error}`))
    throw new Error(`Environment validation failed: ${errors.join(', ')}`)
  }

  if (envInfo.isDevelopment) {
    console.log('✅ Environment validation passed:', {
      mode: envInfo.mode,
      apiUrl: env.VITE_API_BASE_URL,
      features: {
        analytics: isFeatureEnabled('VITE_ENABLE_ANALYTICS'),
        abTesting: isFeatureEnabled('VITE_ENABLE_AB_TESTING'),
        realTimeUpdates: isFeatureEnabled('VITE_ENABLE_REAL_TIME_UPDATES'),
        devtools: isFeatureEnabled('VITE_ENABLE_DEVTOOLS'),
      },
    })
  }
}

// Initialize validation
if (typeof window !== 'undefined') {
  validateEnvironment()
}

// Export commonly used values
export const {
  VITE_API_BASE_URL: API_BASE_URL,
  VITE_APP_NAME: APP_NAME,
  VITE_APP_VERSION: APP_VERSION,
} = env
