import { api } from './api';
import type { ApiResponse, RecommendationAnalytics, DiversityMetrics } from '../types';

// Analytics Types
export interface ComprehensiveAnalytics {
  overview: AnalyticsOverview;
  recommendations: RecommendationAnalytics;
  games: GameAnalytics;
  players: PlayerAnalytics;
  revenue: RevenueAnalytics;
  performance: PerformanceAnalytics;
  trends: TrendAnalytics;
}

export interface AnalyticsOverview {
  totalPlayers: number;
  activePlayers: number;
  totalGames: number;
  activeGames: number;
  totalRecommendations: number;
  totalRevenue: number;
  averageCTR: number;
  averageConversionRate: number;
  systemHealth: number;
  lastUpdated: string;
}

export interface GameAnalytics {
  totalGames: number;
  activeGames: number;
  newGames: number;
  topPerformingGames: GamePerformance[];
  gameTypeDistribution: Record<string, number>;
  providerDistribution: Record<string, number>;
  volatilityDistribution: Record<string, number>;
  averageRTP: number;
  gameEngagement: GameEngagement[];
}

export interface GamePerformance {
  gameId: number;
  gameName: string;
  provider: string;
  sessions: number;
  revenue: number;
  rtp: number;
  popularity: number;
  recommendationScore: number;
}

export interface GameEngagement {
  gameId: number;
  gameName: string;
  averageSessionDuration: number;
  returnPlayerRate: number;
  engagementScore: number;
}

export interface PlayerAnalytics {
  totalPlayers: number;
  activePlayers: number;
  newPlayers: number;
  churnedPlayers: number;
  playerSegments: Record<string, number>;
  vipDistribution: Record<string, number>;
  riskDistribution: Record<string, number>;
  countryDistribution: Record<string, number>;
  retentionRates: RetentionRate[];
  lifetimeValueDistribution: Record<string, number>;
}

export interface RetentionRate {
  period: string;
  rate: number;
  cohortSize: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  revenueGrowth: number;
  revenueByGame: Record<string, number>;
  revenueByProvider: Record<string, number>;
  revenueByPlayerSegment: Record<string, number>;
  revenueByCountry: Record<string, number>;
  averageRevenuePerPlayer: number;
  averageRevenuePerSession: number;
  revenueTrends: RevenueTrend[];
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  players: number;
  sessions: number;
  averageRevenuePerPlayer: number;
}

export interface PerformanceAnalytics {
  systemMetrics: SystemMetrics;
  algorithmPerformance: AlgorithmPerformance[];
  apiPerformance: ApiPerformance;
  databasePerformance: DatabasePerformance;
  cachePerformance: CachePerformance;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  uptime: number;
  errorRate: number;
}

export interface AlgorithmPerformance {
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  ndcg: number;
  coverage: number;
  diversity: number;
  responseTime: number;
}

export interface ApiPerformance {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  endpointMetrics: EndpointMetric[];
}

export interface EndpointMetric {
  endpoint: string;
  requests: number;
  averageResponseTime: number;
  errorRate: number;
  p95ResponseTime: number;
}

export interface DatabasePerformance {
  connectionPoolSize: number;
  activeConnections: number;
  averageQueryTime: number;
  slowQueries: number;
  deadlocks: number;
  cacheHitRate: number;
}

export interface CachePerformance {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  memoryUsage: number;
  keyCount: number;
  averageResponseTime: number;
}

export interface TrendAnalytics {
  playerTrends: TrendData[];
  revenueTrends: TrendData[];
  engagementTrends: TrendData[];
  recommendationTrends: TrendData[];
  gamePopularityTrends: GameTrend[];
}

export interface TrendData {
  date: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface GameTrend {
  gameId: number;
  gameName: string;
  trend: TrendData[];
  currentRank: number;
  previousRank: number;
}

export interface AnalyticsRequest {
  startDate?: string;
  endDate?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
  playerSegment?: string;
  gameType?: string;
  provider?: string;
  country?: string;
  algorithm?: string;
}

export interface ExportRequest {
  type: 'csv' | 'excel' | 'pdf';
  data: string;
  filters?: AnalyticsRequest;
  includeCharts?: boolean;
}

class AnalyticsService {
  private readonly baseUrl = '/api/Analytics';

  async getComprehensiveAnalytics(request: AnalyticsRequest = {}): Promise<ComprehensiveAnalytics> {
    const params = new URLSearchParams();
    
    if (request.startDate) params.append('startDate', request.startDate);
    if (request.endDate) params.append('endDate', request.endDate);
    if (request.granularity) params.append('granularity', request.granularity);
    if (request.playerSegment) params.append('playerSegment', request.playerSegment);
    if (request.gameType) params.append('gameType', request.gameType);
    if (request.provider) params.append('provider', request.provider);
    if (request.country) params.append('country', request.country);
    if (request.algorithm) params.append('algorithm', request.algorithm);

    const response = await api.get<ApiResponse<ComprehensiveAnalytics>>(
      `${this.baseUrl}/comprehensive?${params.toString()}`
    );
    return response.data.data;
  }

  async getRecommendationAnalytics(request: AnalyticsRequest = {}): Promise<RecommendationAnalytics> {
    const params = new URLSearchParams();
    
    if (request.startDate) params.append('startDate', request.startDate);
    if (request.endDate) params.append('endDate', request.endDate);
    if (request.algorithm) params.append('algorithm', request.algorithm);

    const response = await api.get<ApiResponse<RecommendationAnalytics>>(
      `${this.baseUrl}/recommendations?${params.toString()}`
    );
    return response.data.data;
  }

  async getDiversityMetrics(request: AnalyticsRequest = {}): Promise<DiversityMetrics> {
    const params = new URLSearchParams();
    
    if (request.startDate) params.append('startDate', request.startDate);
    if (request.endDate) params.append('endDate', request.endDate);
    if (request.algorithm) params.append('algorithm', request.algorithm);

    const response = await api.get<ApiResponse<DiversityMetrics>>(
      `${this.baseUrl}/diversity?${params.toString()}`
    );
    return response.data.data;
  }

  async getPerformanceMetrics(): Promise<PerformanceAnalytics> {
    const response = await api.get<ApiResponse<PerformanceAnalytics>>(
      `${this.baseUrl}/performance`
    );
    return response.data.data;
  }

  async getTrendAnalytics(request: AnalyticsRequest = {}): Promise<TrendAnalytics> {
    const params = new URLSearchParams();
    
    if (request.startDate) params.append('startDate', request.startDate);
    if (request.endDate) params.append('endDate', request.endDate);
    if (request.granularity) params.append('granularity', request.granularity);

    const response = await api.get<ApiResponse<TrendAnalytics>>(
      `${this.baseUrl}/trends?${params.toString()}`
    );
    return response.data.data;
  }

  async exportAnalytics(request: ExportRequest): Promise<Blob> {
    const response = await api.post<Blob>(
      `${this.baseUrl}/export`,
      request,
      { responseType: 'blob' }
    );
    return response.data;
  }

  async getRealtimeMetrics(): Promise<any> {
    const response = await api.get<ApiResponse<any>>(
      `${this.baseUrl}/realtime`
    );
    return response.data.data;
  }
}

export const analyticsService = new AnalyticsService();
