// Re-export shared types that are used by games feature
export type { PaginatedResponse } from '@/shared/types';

// Game-specific types
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

// Game-specific filter types
export interface GameFilterForm {
  search?: string;
  providers?: number[];
  gameTypes?: number[];
  volatilities?: number[];
  themes?: number[];
  isActive?: boolean;
  isMobile?: boolean;
  isDesktop?: boolean;
  minBet?: number;
  maxBet?: number;
  minRTP?: number;
  maxRTP?: number;
  sortBy?: 'name' | 'provider' | 'rtp' | 'popularity' | 'release_date';
  sortDirection?: 'asc' | 'desc';
}

// Game analytics types
export interface GameStats {
  totalPlayers: number;
  activePlayers: number;
  totalSessions: number;
  averageSessionDuration: number;
  totalRevenue: number;
  averageRating: number;
  popularityRank: number;
  retentionRate: number;
  conversionRate: number;
}

export interface GamePerformanceMetric {
  timestamp: string;
  players: number;
  sessions: number;
  revenue: number;
  averageSessionDuration: number;
}

export interface GameLifecycle {
  launchDate: string;
  peakDate: string;
  currentPhase: 'launch' | 'growth' | 'maturity' | 'decline';
  lifetimeRevenue: number;
  lifetimePlayers: number;
  projectedLifetime: number;
  healthScore: number;
}

export interface GameCompetitiveAnalysis {
  directCompetitors: Game[];
  marketPosition: number;
  strengthsWeaknesses: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  benchmarkMetrics: Record<string, {
    value: number;
    percentile: number;
    benchmark: number;
  }>;
}

export interface GameFeatures {
  gameId: number;
  features: Record<string, number>;
  categories: string[];
  tags: string[];
  metadata: Record<string, any>;
}

export interface LowPerformanceGame {
  game: Game;
  performanceScore: number;
  issues: string[];
  recommendations: string[];
}

// Game analytics summary
export interface GameAnalyticsSummary {
  totalGames: number;
  activeGames: number;
  totalProviders: number;
  averageRTP: number;
  mostPopularProvider: string;
  mostPopularGameType: string;
  gamesByVolatility: Record<string, number>;
  gamesByTheme: Record<string, number>;
  platformDistribution: {
    mobile: number;
    desktop: number;
    both: number;
  };
}

// Game management operations
export interface CreateGameForm {
  gameName: string;
  providerId: number;
  gameTypeId: number;
  volatilityId: number;
  themeId: number;
  minBetAmount: number;
  maxBetAmount: number;
  rtpPercentage: number;
  isMobile: boolean;
  isDesktop: boolean;
  description?: string;
  imageUrl?: string;
  features?: string[];
  tags?: string[];
  gameOrder?: number;
}

export interface UpdateGameForm extends Partial<CreateGameForm> {
  gameId: number;
}

export interface BulkGameOperation {
  gameIds: number[];
  operation: BulkOperationType;
  data?: Record<string, any>;
}

export type BulkOperationType =
  | 'activate'
  | 'deactivate'
  | 'delete'
  | 'updateProvider'
  | 'updateGameType'
  | 'updateVolatility'
  | 'updateTheme'
  | 'updateOrder'
  | 'toggleMobile'
  | 'toggleDesktop'
  | 'hideLobby'
  | 'showLobby';

// Game validation
export interface GameValidationResult {
  isValid: boolean;
  errors: GameValidationError[];
  warnings: GameValidationWarning[];
}

export interface GameValidationError {
  field: string;
  message: string;
  code: string;
}

export interface GameValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Game import/export
export interface GameImportData {
  games: CreateGameForm[];
  providers?: GameProvider[];
  gameTypes?: GameType[];
  volatilities?: Volatility[];
  themes?: Theme[];
}

export interface GameExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeInactive?: boolean;
  includeStats?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  fields?: string[];
}

// Game search and discovery
export interface GameSearchResult {
  games: Game[];
  totalCount: number;
  suggestions: string[];
  filters: {
    providers: Array<{ id: number; name: string; count: number }>;
    gameTypes: Array<{ id: number; name: string; count: number }>;
    volatilities: Array<{ id: number; name: string; count: number }>;
    themes: Array<{ id: number; name: string; count: number }>;
  };
}

export interface GameRecommendation {
  gameId: number;
  score: number;
  reason: string;
  category: 'similar' | 'trending' | 'new' | 'personalized';
}

// Game monitoring
export interface GameHealthCheck {
  gameId: number;
  status: 'healthy' | 'warning' | 'critical';
  issues: GameIssue[];
  lastChecked: string;
  uptime: number;
  performance: {
    loadTime: number;
    errorRate: number;
    playerSatisfaction: number;
  };
}

export interface GameIssue {
  type: 'performance' | 'availability' | 'revenue' | 'player_feedback';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  detectedAt: string;
  resolvedAt?: string;
}
