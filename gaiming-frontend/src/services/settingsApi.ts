import { apiService } from './api'

// Settings interfaces matching the backend DTOs
export interface GeneralSettings {
  systemName: string
  systemDescription: string
  defaultLanguage: string
  defaultTimezone: string
  maintenanceMode: boolean
  maintenanceMessage: string
  logLevel: string
  sessionTimeout: number
  maxConcurrentSessions: number
}

export interface RecommendationSettings {
  defaultAlgorithm: string
  maxRecommendations: number
  minConfidenceScore: number
  enableABTesting: boolean
  cacheExpirationMinutes: number
  realTimeUpdates: boolean
  personalizationEnabled: boolean
  diversityWeight: number
  popularityWeight: number
  recencyWeight: number
}

export interface AnalyticsSettings {
  enableTracking: boolean
  dataRetentionDays: number
  realTimeAnalytics: boolean
  exportFormats: string[]
  autoReportGeneration: boolean
  reportSchedule: string
  metricsRefreshInterval: number
  enablePredictiveAnalytics: boolean
}

export interface SecuritySettings {
  requireHttps: boolean
  enableTwoFactor: boolean
  passwordMinLength: number
  passwordRequireUppercase: boolean
  passwordRequireLowercase: boolean
  passwordRequireNumbers: boolean
  passwordRequireSpecialChars: boolean
  maxLoginAttempts: number
  lockoutDurationMinutes: number
  jwtExpirationMinutes: number
  refreshTokenExpirationDays: number
  enableAuditLogging: boolean
  auditLogRetentionDays: number
}

export interface PerformanceSettings {
  enableCaching: boolean
  cacheExpirationMinutes: number
  maxConcurrentRequests: number
  requestTimeoutSeconds: number
  enableCompression: boolean
  enableRateLimiting: boolean
  rateLimitRequests: number
  rateLimitWindowMinutes: number
  databaseConnectionPoolSize: number
  enableQueryOptimization: boolean
}

export interface NotificationSettings {
  enableEmailNotifications: boolean
  enableSmsNotifications: boolean
  enablePushNotifications: boolean
  smtpServer: string
  smtpPort: number
  smtpUsername: string
  smtpUseSsl: boolean
  defaultFromEmail: string
  defaultFromName: string
}

export interface SystemSettings {
  general: GeneralSettings
  recommendation: RecommendationSettings
  analytics: AnalyticsSettings
  security: SecuritySettings
  performance: PerformanceSettings
  notifications: NotificationSettings
}

export const settingsApi = {
  // Get all settings
  async getSettings(): Promise<SystemSettings> {
    const response = await apiService.get<SystemSettings>('/Settings')
    return response
  },

  // Update all settings
  async updateSettings(settings: SystemSettings): Promise<SystemSettings> {
    const response = await apiService.put<SystemSettings>('/Settings', settings)
    return response
  },

  // Get specific category settings
  async getCategorySettings(category: string): Promise<any> {
    const response = await apiService.get<any>(`/Settings/${category}`)
    return response
  },

  // Update specific category settings
  async updateCategorySettings(category: string, settings: any): Promise<any> {
    const response = await apiService.put<any>(`/Settings/${category}`, settings)
    return response
  },

  // Reset settings to defaults
  async resetSettings(category?: string): Promise<{ message: string; resetAt: string }> {
    const url = category ? `/Settings/reset?category=${category}` : '/Settings/reset'
    const response = await apiService.post<{ message: string; resetAt: string }>(url)
    return response
  },

  // Export settings
  async exportSettings(format: 'json' | 'xml' = 'json'): Promise<void> {
    await apiService.download(`/Settings/export?format=${format}`, `gaiming-settings-${new Date().toISOString().split('T')[0]}.${format}`)
  }
}
