/**
 * Comprehensive error type system using discriminated unions
 * Provides type-safe error handling across the application
 */

// Base error interface
export interface BaseError {
  readonly code: string;
  readonly message: string;
  readonly timestamp: number;
  readonly context?: Record<string, unknown>;
}

// API Error types using discriminated unions
export type ApiError = 
  | {
      type: 'network';
      code: 'NETWORK_ERROR';
      message: string;
      status?: never;
      details?: never;
    }
  | {
      type: 'http';
      code: 'HTTP_ERROR';
      message: string;
      status: number;
      details?: Record<string, unknown>;
    }
  | {
      type: 'validation';
      code: 'VALIDATION_ERROR';
      message: string;
      status: 400;
      details: ValidationErrorDetails;
    }
  | {
      type: 'authentication';
      code: 'AUTH_ERROR';
      message: string;
      status: 401;
      details?: never;
    }
  | {
      type: 'authorization';
      code: 'FORBIDDEN_ERROR';
      message: string;
      status: 403;
      details?: { requiredPermissions?: string[] };
    }
  | {
      type: 'not_found';
      code: 'NOT_FOUND_ERROR';
      message: string;
      status: 404;
      details?: { resource?: string; id?: string | number };
    }
  | {
      type: 'conflict';
      code: 'CONFLICT_ERROR';
      message: string;
      status: 409;
      details?: { conflictingResource?: string };
    }
  | {
      type: 'rate_limit';
      code: 'RATE_LIMIT_ERROR';
      message: string;
      status: 429;
      details: { retryAfter: number; limit: number };
    }
  | {
      type: 'server';
      code: 'SERVER_ERROR';
      message: string;
      status: 500;
      details?: { errorId?: string };
    };

// Validation error details
export interface ValidationErrorDetails {
  field: string;
  value: unknown;
  constraints: string[];
  children?: ValidationErrorDetails[];
}

// Business logic errors
export type BusinessError = 
  | {
      type: 'game_not_available';
      code: 'GAME_NOT_AVAILABLE';
      message: string;
      gameId: number;
      reason: 'maintenance' | 'region_restricted' | 'provider_down';
    }
  | {
      type: 'player_restricted';
      code: 'PLAYER_RESTRICTED';
      message: string;
      playerId: number;
      restrictions: string[];
    }
  | {
      type: 'recommendation_failed';
      code: 'RECOMMENDATION_FAILED';
      message: string;
      algorithm: string;
      fallbackUsed: boolean;
    }
  | {
      type: 'model_unavailable';
      code: 'MODEL_UNAVAILABLE';
      message: string;
      modelId: string;
      reason: 'training' | 'deployment_failed' | 'deprecated';
    };

// Client-side errors
export type ClientError = 
  | {
      type: 'storage';
      code: 'STORAGE_ERROR';
      message: string;
      operation: 'read' | 'write' | 'delete';
      key: string;
    }
  | {
      type: 'permission';
      code: 'PERMISSION_DENIED';
      message: string;
      permission: string;
      resource?: string;
    }
  | {
      type: 'feature_disabled';
      code: 'FEATURE_DISABLED';
      message: string;
      feature: string;
    }
  | {
      type: 'browser_unsupported';
      code: 'BROWSER_UNSUPPORTED';
      message: string;
      requiredFeatures: string[];
    }
  | {
      type: 'client';
      code: 'CLIENT_ERROR';
      message: string;
    };

// Union of all error types
export type AppError = ApiError | BusinessError | ClientError;

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Enhanced error with metadata
export interface EnhancedError extends BaseError {
  readonly id: string;
  readonly severity: ErrorSeverity;
  readonly category: AppError['type'];
  readonly recoverable: boolean;
  readonly userMessage: string;
  readonly technicalDetails: AppError;
  readonly stackTrace?: string;
  readonly userId?: string;
  readonly sessionId?: string;
}

// Error recovery strategies
export type RecoveryStrategy = 
  | { type: 'retry'; maxAttempts: number; backoffMs: number }
  | { type: 'fallback'; fallbackData: unknown }
  | { type: 'redirect'; url: string }
  | { type: 'refresh'; component?: string }
  | { type: 'logout' }
  | { type: 'none' };

// Error handling result
export type ErrorHandlingResult = 
  | { handled: true; strategy: RecoveryStrategy; userNotified: boolean }
  | { handled: false; reason: string };

// Type guards for error discrimination
export const isApiError = (error: AppError): error is ApiError => {
  return ['network', 'http', 'validation', 'authentication', 'authorization', 
          'not_found', 'conflict', 'rate_limit', 'server'].includes(error.type);
};

export const isBusinessError = (error: AppError): error is BusinessError => {
  return ['game_not_available', 'player_restricted', 'recommendation_failed', 
          'model_unavailable'].includes(error.type);
};

export const isClientError = (error: AppError): error is ClientError => {
  return ['storage', 'permission', 'feature_disabled',
          'browser_unsupported', 'client'].includes(error.type);
};

// Specific error type guards
export const isNetworkError = (error: AppError): error is Extract<ApiError, { type: 'network' }> => 
  error.type === 'network';

export const isValidationError = (error: AppError): error is Extract<ApiError, { type: 'validation' }> => 
  error.type === 'validation';

export const isAuthError = (error: AppError): error is Extract<ApiError, { type: 'authentication' }> => 
  error.type === 'authentication';

export const isNotFoundError = (error: AppError): error is Extract<ApiError, { type: 'not_found' }> => 
  error.type === 'not_found';

export const isRateLimitError = (error: AppError): error is Extract<ApiError, { type: 'rate_limit' }> => 
  error.type === 'rate_limit';

// Error factory functions
export const createApiError = {
  network: (message: string): Extract<ApiError, { type: 'network' }> => ({
    type: 'network',
    code: 'NETWORK_ERROR',
    message,
  }),

  http: (message: string, status: number, details?: Record<string, unknown>): Extract<ApiError, { type: 'http' }> => ({
    type: 'http',
    code: 'HTTP_ERROR',
    message,
    status,
    details,
  }),

  validation: (message: string, details: ValidationErrorDetails): Extract<ApiError, { type: 'validation' }> => ({
    type: 'validation',
    code: 'VALIDATION_ERROR',
    message,
    status: 400,
    details,
  }),

  auth: (message: string): Extract<ApiError, { type: 'authentication' }> => ({
    type: 'authentication',
    code: 'AUTH_ERROR',
    message,
    status: 401,
  }),

  forbidden: (message: string, requiredPermissions?: string[]): Extract<ApiError, { type: 'authorization' }> => ({
    type: 'authorization',
    code: 'FORBIDDEN_ERROR',
    message,
    status: 403,
    details: requiredPermissions ? { requiredPermissions } : undefined,
  }),

  notFound: (message: string, resource?: string, id?: string | number): Extract<ApiError, { type: 'not_found' }> => ({
    type: 'not_found',
    code: 'NOT_FOUND_ERROR',
    message,
    status: 404,
    details: { resource, id },
  }),

  rateLimit: (message: string, retryAfter: number, limit: number): Extract<ApiError, { type: 'rate_limit' }> => ({
    type: 'rate_limit',
    code: 'RATE_LIMIT_ERROR',
    message,
    status: 429,
    details: { retryAfter, limit },
  }),

  server: (message: string, errorId?: string): Extract<ApiError, { type: 'server' }> => ({
    type: 'server',
    code: 'SERVER_ERROR',
    message,
    status: 500,
    details: errorId ? { errorId } : undefined,
  }),

  client: (message: string): Extract<ApiError, { type: 'client' }> => ({
    type: 'client',
    code: 'CLIENT_ERROR',
    message,
  }),
};

// Business error factory functions
export const createBusinessError = {
  gameNotAvailable: (
    gameId: number, 
    reason: 'maintenance' | 'region_restricted' | 'provider_down'
  ): Extract<BusinessError, { type: 'game_not_available' }> => ({
    type: 'game_not_available',
    code: 'GAME_NOT_AVAILABLE',
    message: `Game ${gameId} is not available: ${reason}`,
    gameId,
    reason,
  }),

  playerRestricted: (playerId: number, restrictions: string[]): Extract<BusinessError, { type: 'player_restricted' }> => ({
    type: 'player_restricted',
    code: 'PLAYER_RESTRICTED',
    message: `Player ${playerId} has restrictions: ${restrictions.join(', ')}`,
    playerId,
    restrictions,
  }),

  recommendationFailed: (algorithm: string, fallbackUsed: boolean): Extract<BusinessError, { type: 'recommendation_failed' }> => ({
    type: 'recommendation_failed',
    code: 'RECOMMENDATION_FAILED',
    message: `Recommendation algorithm ${algorithm} failed${fallbackUsed ? ', fallback used' : ''}`,
    algorithm,
    fallbackUsed,
  }),
};
