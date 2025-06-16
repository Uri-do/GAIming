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
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Game Types
export interface Game {
  gameId: number;
  gameName: string;
  providerId: number;
  providerName?: string;
  gameTypeId?: number;
  gameTypeName?: string;
  provider?: GameProvider;
  gameType?: GameType;
  volatilityId?: number;
  volatility?: Volatility;
  themeId?: number;
  theme?: Theme;
  minBetAmount?: number;
  maxBetAmount?: number;
  rtpPercentage?: number;
  isMobile: boolean;
  isDesktop: boolean;
  isActive: boolean;
  hideInLobby?: boolean;
  gameOrder?: number;
  releaseDate?: string;
  createdDate: string;
  updatedDate: string;
  imageUrl?: string;
  description?: string;
  features?: string[];
  tags?: string[];
}

export interface GameProvider {
  providerId: number;
  providerName: string;
  isActive: boolean;
  logoUrl?: string;
}

export interface GameType {
  gameTypeId: number;
  gameTypeName: string;
  description?: string;
}

export interface Volatility {
  volatilityID: number;
  volatilityName: string;
  description?: string;
  level: number;
}

export interface Theme {
  themeID: number;
  themeName: string;
  description?: string;
}

// Player Types
export interface Player {
  playerID: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  country?: string;
  currency: string;
  vipLevel: number;
  riskLevel: number;
  isActive: boolean;
  registrationDate: string;
  lastLoginDate?: string;
  totalDeposits: number;
  totalWithdrawals: number;
  currentBalance: number;
  preferredLanguage?: string;
  timeZone?: string;
}

// Recommendation Types
export interface GameRecommendation {
  id: number;
  playerId: number;
  gameId: number;
  game?: Game;
  gameTypeName?: string;
  score: number;
  algorithm: string;
  reason: string;
  position: number;
  category: string;
  context?: string;
  variant?: string;
  generatedDate: string;
  expiryDate?: string;
  isActive: boolean;
  isClicked: boolean;
  isPlayed: boolean;
  clickedAt?: string;
  playedAt?: string;
  modelVersion?: string;
  sessionId?: string;
  platform?: string;
  features?: any;
  // Backward compatibility
  wasClicked?: boolean;
  wasPlayed?: boolean;
  clickedDate?: string;
  playedDate?: string;
}

export interface RecommendationRequest {
  playerId: number;
  count?: number;
  algorithm?: string;
  context?: string;
}

export interface RecommendationInteraction {
  recommendationId: number;
  interactionType: 'view' | 'click' | 'play' | 'dismiss' | 'like' | 'dislike';
  timestamp?: string;
  metadata?: Record<string, any>;
}

// Analytics Types
export interface RecommendationMetrics {
  totalRecommendations: number;
  totalClicks: number;
  totalPlays: number;
  clickThroughRate: number;
  conversionRate: number;
  averageScore: number;
  algorithm: string;
  periodStart: string;
  periodEnd: string;
}

export interface RecommendationAnalytics {
  startDate: string;
  endDate: string;
  totalRecommendations: number;
  totalClicks: number;
  totalPlays: number;
  clickThroughRate: number;
  conversionRate: number;
  algorithmCTR: Record<string, number>;
  algorithmConversionRate: Record<string, number>;
  algorithmUsage: Record<string, number>;
  recommendationRevenue: number;
  revenuePerRecommendation: number;
  gameRecommendationCounts: Record<number, number>;
  gameConversionRates: Record<number, number>;
  playerSegmentMetrics: Record<string, RecommendationMetrics>;
}

export interface DiversityMetrics {
  intraListDiversity: number;
  catalogCoverage: number;
  noveltyScore: number;
  serendipityScore: number;
  providerDistribution: Record<string, number>;
  gameTypeDistribution: Record<string, number>;
  volatilityDistribution: Record<string, number>;
}

// A/B Testing Types
export interface ABTestExperiment {
  id: number;
  experimentName: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: number;
  configuration: string;
  variants: string;
  results: string;
  winningVariant: string;
  confidenceLevel: number;
  isStatisticallySignificant: boolean;
  createdDate: string;
  createdBy: string;
}

export interface ABTestVariant {
  name: string;
  userCount: number;
  clickThroughRate: number;
  conversionRate: number;
  revenue: number;
  engagementScore: number;
}

export interface ABTestResults {
  testName: string;
  startDate: string;
  endDate: string;
  variants: Record<string, ABTestVariant>;
  winningVariant: string;
  confidenceLevel: number;
  isStatisticallySignificant: boolean;
}

// Model Management Types
export interface ModelPerformanceMetrics {
  modelName: string;
  version: string;
  evaluationDate: string;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  ndcg: number;
  map: number;
  coverage: number;
  diversity: number;
  novelty: number;
  customMetrics: Record<string, number>;
}

export interface RecommendationModel {
  id: number;
  modelName: string;
  version: string;
  algorithm: string;
  description: string;
  modelPath: string;
  configuration: string;
  hyperparameters: string;
  metrics: string;
  isActive: boolean;
  isDefault: boolean;
  trainedDate: string;
  deployedDate?: string;
  retiredDate?: string;
  createdDate: string;
  createdBy: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface FilterState {
  search?: string;
  provider?: number;
  gameType?: number;
  volatility?: number;
  theme?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  algorithm?: string;
  status?: string;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
}

// Chart Data Types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  category?: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface GameFilterForm {
  search?: string;
  providers?: number[];
  gameTypes?: number[];
  volatilities?: number[];
  themes?: number[];
  isActive?: boolean;
  isMobile?: boolean;
  isDesktop?: boolean;
}

export interface RecommendationFilterForm {
  playerId?: number;
  algorithms?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string;
  minScore?: number;
  maxScore?: number;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
  badge?: string | number;
  isActive?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
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
    defaultView: string;
    refreshInterval: number;
    chartsPerRow: number;
  };
}
