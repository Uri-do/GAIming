import { api } from './api';
import type { ApiResponse, PaginatedResponse } from '../types';

// Player Analytics Types
export interface PlayerAnalytics {
  playerId: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  vipLevel: number;
  riskLevel: number;
  isActive: boolean;
  registrationDate: string;
  lastLoginDate?: string;
  totalSessions: number;
  totalBets: number;
  totalWins: number;
  totalRevenue: number;
  averageSessionDuration: number;
  averageBetSize: number;
  favoriteGameTypes: string[];
  preferredProviders: string[];
  playerSegment: string;
  lifetimeValue: number;
  retentionScore: number;
  engagementScore: number;
  riskScore: number;
}

export interface PlayerBehaviorAnalysis {
  playerId: number;
  analysisDate: string;
  sessionPatterns: SessionPattern[];
  bettingPatterns: BettingPattern[];
  gamePreferences: GamePreference[];
  insights: BehaviorInsight[];
  alerts: BehaviorAlert[];
}

export interface SessionPattern {
  timeOfDay: string;
  dayOfWeek: string;
  averageDuration: number;
  frequency: number;
  pattern: string;
}

export interface BettingPattern {
  averageBetSize: number;
  bettingVelocity: number;
  riskTolerance: string;
  pattern: string;
}

export interface GamePreference {
  gameType: string;
  provider: string;
  preference: number;
  playTime: number;
}

export interface BehaviorInsight {
  category: string;
  insight: string;
  confidence: number;
  impact: string;
}

export interface BehaviorAlert {
  type: string;
  severity: string;
  message: string;
  timestamp: string;
  isActive: boolean;
}

export interface PlayerDashboard {
  playerId: number;
  startDate: string;
  endDate: string;
  overview: PlayerOverview;
  gameStats: PlayerGameStats;
  recommendationStats: PlayerRecommendationStats;
  behaviorSummary: PlayerBehaviorSummary;
  riskAssessment: PlayerRiskAssessment;
  activityTrends: PlayerActivityTrend[];
}

export interface PlayerOverview {
  totalSessions: number;
  totalPlayTime: number;
  totalBets: number;
  totalWins: number;
  netRevenue: number;
  averageSessionDuration: number;
  lastActivity: string;
  vipLevel: number;
  riskLevel: number;
}

export interface PlayerGameStats {
  gamesPlayed: number;
  favoriteGames: string[];
  preferredProviders: string[];
  gameTypeDistribution: Record<string, number>;
  volatilityPreference: string;
  averageRtp: number;
}

export interface PlayerRecommendationStats {
  totalRecommendations: number;
  clickThroughRate: number;
  conversionRate: number;
  topRecommendedGames: string[];
  algorithmPerformance: Record<string, number>;
}

export interface PlayerBehaviorSummary {
  playerSegment: string;
  engagementLevel: string;
  loyaltyScore: number;
  churnRisk: number;
  lifetimeValue: number;
  behaviorTrends: string[];
}

export interface PlayerRiskAssessment {
  overallRiskLevel: number;
  riskFactors: string[];
  spendingVelocity: number;
  sessionFrequency: number;
  averageSessionDuration: number;
  hasGamblingProblemIndicators: boolean;
  lastAssessmentDate: string;
  riskScores: Record<string, number>;
}

export interface PlayerActivityTrend {
  date: string;
  sessions: number;
  playTime: number;
  bets: number;
  wins: number;
  revenue: number;
}

export interface PlayersOverview {
  totalPlayers: number;
  activePlayers: number;
  newPlayers: number;
  churnedPlayers: number;
  averageLifetimeValue: number;
  totalRevenue: number;
  playerSegments: Record<string, number>;
  topCountries: Record<string, number>;
  vipDistribution: Record<string, number>;
  riskDistribution: Record<string, number>;
}

export interface CohortAnalysis {
  cohortType: string;
  periods: number;
  cohorts: CohortData[];
  retentionMatrix: number[][];
  averageRetention: number[];
}

export interface CohortData {
  cohortPeriod: string;
  playersCount: number;
  retentionRates: number[];
}

export interface SegmentationAnalysis {
  segmentName: string;
  playerCount: number;
  percentage: number;
  averageRevenue: number;
  averageSessionDuration: number;
  retentionRate: number;
  characteristics: string[];
}

export interface PlayerAnalyticsRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  segment?: string;
  vipLevel?: number;
  riskLevel?: number;
  country?: string;
  isActive?: boolean;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

class PlayerAnalyticsService {
  private readonly baseUrl = '/PlayerAnalytics';

  async getPlayers(request: PlayerAnalyticsRequest = {}): Promise<PaginatedResponse<PlayerAnalytics>> {
    const params = new URLSearchParams();
    
    if (request.page) params.append('page', request.page.toString());
    if (request.pageSize) params.append('pageSize', request.pageSize.toString());
    if (request.search) params.append('search', request.search);
    if (request.segment) params.append('segment', request.segment);
    if (request.vipLevel) params.append('vipLevel', request.vipLevel.toString());
    if (request.riskLevel) params.append('riskLevel', request.riskLevel.toString());
    if (request.country) params.append('country', request.country);
    if (request.isActive !== undefined) params.append('isActive', request.isActive.toString());
    if (request.registrationDateFrom) params.append('registrationDateFrom', request.registrationDateFrom);
    if (request.registrationDateTo) params.append('registrationDateTo', request.registrationDateTo);
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortDirection) params.append('sortDirection', request.sortDirection);

    const response = await api.get<ApiResponse<PaginatedResponse<PlayerAnalytics>>>(
      `${this.baseUrl}?${params.toString()}`
    );
    return response.data.data;
  }

  async getPlayerDashboard(playerId: number, days: number = 30): Promise<PlayerDashboard> {
    const response = await api.get<ApiResponse<PlayerDashboard>>(
      `${this.baseUrl}/${playerId}/dashboard?days=${days}`
    );
    return response.data.data;
  }

  async getPlayerBehavior(playerId: number, days: number = 30): Promise<PlayerBehaviorAnalysis> {
    const response = await api.get<ApiResponse<PlayerBehaviorAnalysis>>(
      `${this.baseUrl}/${playerId}/behavior?days=${days}`
    );
    return response.data.data;
  }

  async getPlayersOverview(days: number = 30, limit: number = 100): Promise<PlayersOverview> {
    const response = await api.get<ApiResponse<PlayersOverview>>(
      `${this.baseUrl}/overview?days=${days}&limit=${limit}`
    );
    return response.data.data;
  }

  async getCohortAnalysis(cohortType: string = 'monthly', periods: number = 12): Promise<CohortAnalysis> {
    const response = await api.get<ApiResponse<CohortAnalysis>>(
      `${this.baseUrl}/cohort-analysis?cohortType=${cohortType}&periods=${periods}`
    );
    return response.data.data;
  }

  async getSegmentationAnalysis(days: number = 30): Promise<SegmentationAnalysis[]> {
    const response = await api.get<ApiResponse<SegmentationAnalysis[]>>(
      `${this.baseUrl}/segmentation?days=${days}`
    );
    return response.data.data;
  }

  async getPlayerActivity(days: number = 30): Promise<any> {
    const response = await api.get<ApiResponse<any>>(
      `${this.baseUrl}/activity?days=${days}`
    );
    return response.data.data;
  }
}

export const playerAnalyticsService = new PlayerAnalyticsService();
