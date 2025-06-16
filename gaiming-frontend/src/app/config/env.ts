/**
 * Environment Configuration and Validation
 * Centralized environment variable management with validation
 */

// Strict environment variable schema with discriminated unions
interface EnvSchema {
  // API Configuration (required)
  readonly VITE_API_BASE_URL: string

  // Application Configuration
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string

  // Feature Flags (typed as booleans)
  readonly VITE_ENABLE_ANALYTICS: boolean
  readonly VITE_ENABLE_AB_TESTING: boolean
  readonly VITE_ENABLE_REAL_TIME_UPDATES: boolean
  readonly VITE_ENABLE_DEVTOOLS: boolean

  // Development Settings (strict union types)
  readonly VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'

  // External Services (optional but validated when present)
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_GOOGLE_ANALYTICS_ID?: string
}

// Environment validation result using discriminated union
type EnvValidationResult =
  | { success: true; env: EnvSchema }
  | { success: false; errors: string[] };

// Helper to parse boolean environment variables
const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) return defaultValue;
  return value === 'true' || value === '1' || value === 'yes';
};

// Helper to parse log level with validation
const parseLogLevel = (value: string | undefined): 'debug' | 'info' | 'warn' | 'error' => {
  const validLevels = ['debug', 'info', 'warn', 'error'] as const;
  if (!value) return 'info';
  if (validLevels.includes(value as any)) {
    return value as 'debug' | 'info' | 'warn' | 'error';
  }
  console.warn(`Invalid log level "${value}", defaulting to "info"`);
  return 'info';
};

// Validate and parse environment variables
const validateEnvironmentVariables = (): EnvValidationResult => {
  const errors: string[] = [];

  // Required API URL
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiUrl) {
    errors.push('VITE_API_BASE_URL is required');
  } else {
    try {
      new URL(apiUrl);
    } catch {
      errors.push(`VITE_API_BASE_URL is not a valid URL: ${apiUrl}`);
    }
  }

  // Validate optional Sentry DSN
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  if (sentryDsn) {
    try {
      new URL(sentryDsn);
    } catch {
      errors.push(`VITE_SENTRY_DSN is not a valid URL: ${sentryDsn}`);
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Parse and return validated environment
  const validatedEnv: EnvSchema = {
    VITE_API_BASE_URL: apiUrl || 'http://localhost:65073/api',
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'GAIming',
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    VITE_ENABLE_ANALYTICS: parseBoolean(import.meta.env.VITE_ENABLE_ANALYTICS, true),
    VITE_ENABLE_AB_TESTING: parseBoolean(import.meta.env.VITE_ENABLE_AB_TESTING, true),
    VITE_ENABLE_REAL_TIME_UPDATES: parseBoolean(import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES, true),
    VITE_ENABLE_DEVTOOLS: parseBoolean(import.meta.env.VITE_ENABLE_DEVTOOLS, true),
    VITE_LOG_LEVEL: parseLogLevel(import.meta.env.VITE_LOG_LEVEL),
    VITE_SENTRY_DSN: sentryDsn,
    VITE_GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  };

  return { success: true, env: validatedEnv };
};

// Get validated environment or throw
const getValidatedEnv = (): EnvSchema => {
  const result = validateEnvironmentVariables();

  if (!result.success) {
    const errorMessage = `Environment validation failed:\n${result.errors.map(e => `  - ${e}`).join('\n')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return result.env;
};

// Type-safe environment variables
export const env: EnvSchema = getValidatedEnv();

// Type-safe feature flag checker
export const isFeatureEnabled = (feature: keyof Pick<EnvSchema,
  'VITE_ENABLE_ANALYTICS' |
  'VITE_ENABLE_AB_TESTING' |
  'VITE_ENABLE_REAL_TIME_UPDATES' |
  'VITE_ENABLE_DEVTOOLS'
>): boolean => {
  return env[feature]; // Now returns boolean directly
}

// Environment information
export const envInfo = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL,
} as const



// Enhanced environment validation with detailed reporting
export const validateEnvironment = (): void => {
  const result = validateEnvironmentVariables();

  if (!result.success) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach(error => console.error(`  - ${error}`));
    throw new Error(`Environment validation failed: ${result.errors.join(', ')}`);
  }

  if (envInfo.isDevelopment) {
    console.log('✅ Environment validation passed:', {
      mode: envInfo.mode,
      apiUrl: env.VITE_API_BASE_URL,
      appName: env.VITE_APP_NAME,
      version: env.VITE_APP_VERSION,
      logLevel: env.VITE_LOG_LEVEL,
      features: {
        analytics: env.VITE_ENABLE_ANALYTICS,
        abTesting: env.VITE_ENABLE_AB_TESTING,
        realTimeUpdates: env.VITE_ENABLE_REAL_TIME_UPDATES,
        devtools: env.VITE_ENABLE_DEVTOOLS,
      },
      externalServices: {
        sentry: !!env.VITE_SENTRY_DSN,
        googleAnalytics: !!env.VITE_GOOGLE_ANALYTICS_ID,
      },
    });
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
