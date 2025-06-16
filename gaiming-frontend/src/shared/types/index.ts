// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Advanced Discriminated Union Types for State Management
export type AsyncState<T, E = string> =
  | { status: 'idle' }
  | { status: 'loading'; progress?: number }
  | { status: 'success'; data: T; timestamp: number }
  | { status: 'error'; error: E; timestamp: number; retryCount?: number };

// Resource state with optimistic updates
export type ResourceState<T, E = string> =
  | { status: 'idle' }
  | { status: 'loading'; optimisticData?: T }
  | { status: 'success'; data: T; lastFetch: number; stale: boolean }
  | { status: 'error'; error: E; lastAttempt: number; canRetry: boolean };

// Mutation state for CRUD operations
export type MutationState<T, E = string> =
  | { status: 'idle' }
  | { status: 'pending'; optimisticData?: T }
  | { status: 'success'; data: T; timestamp: number }
  | { status: 'error'; error: E; originalData?: T };

// Network state with retry logic
export type NetworkState<T, E = string> =
  | { status: 'offline' }
  | { status: 'connecting'; attempt: number }
  | { status: 'connected'; data: T; latency?: number }
  | { status: 'failed'; error: E; nextRetry: number };

// Form state with validation
export type FormState<T, V = Record<string, string>> =
  | { status: 'pristine'; initialData: T }
  | { status: 'editing'; data: T; isDirty: boolean }
  | { status: 'validating'; data: T; validationErrors?: V }
  | { status: 'valid'; data: T; validationErrors: null }
  | { status: 'invalid'; data: T; validationErrors: V }
  | { status: 'submitting'; data: T }
  | { status: 'submitted'; data: T; result: 'success' | 'error' };

// Legacy interface for backward compatibility
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Filter and Sort Types
export interface FilterState {
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface SortOption {
  value: string;
  label: string;
  direction?: 'asc' | 'desc';
}

// Chart Data Types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

// Metric Types
export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: NavigationItem[];
  badge?: {
    text: string;
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
  permissions?: string[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type?: 'primary' | 'secondary';
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  borderRadius: number;
  fontFamily: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

// User Preferences
export interface UserPreferences {
  theme: ThemeConfig;
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    density: 'compact' | 'comfortable' | 'spacious';
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

// Export/Import Types
export interface ExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  columns?: string[];
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

// Generic CRUD operations
export interface CrudOperations<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  create: (data: TCreate) => Promise<T>;
  read: (id: string | number) => Promise<T>;
  update: (id: string | number, data: TUpdate) => Promise<T>;
  delete: (id: string | number) => Promise<void>;
  list: (params?: any) => Promise<PaginatedResponse<T>>;
}

// Date range presets
export type DateRangePreset = 
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'last90days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
  preset?: DateRangePreset;
}

// Component props helpers
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface PolymorphicProps<T extends React.ElementType = 'div'> {
  as?: T;
}

// Enhanced error types (re-export from errors module)
export * from './errors';

// Legacy error types for backward compatibility
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Permission types
export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

// Audit types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}
