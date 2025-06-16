import { apiService } from './api';
import {
  GameRecommendation,
  RecommendationInteraction,
  RecommendationMetrics,
  RecommendationAnalytics,
  DiversityMetrics,
  PaginatedResponse,
} from '@/types';

export const recommendationService = {
  // Get recommendations for a player
  async getRecommendations(
    playerId: number,
    params?: {
      count?: number;
      algorithm?: string;
      context?: string;
    }
  ): Promise<GameRecommendation[]> {
    return apiService.get<GameRecommendation[]>(
      `/recommendation/player/${playerId}`,
      { params }
    );
  },

  // Get recommendations by specific algorithm
  async getRecommendationsByAlgorithm(
    playerId: number,
    algorithm: string,
    params?: {
      count?: number;
      context?: string;
    }
  ): Promise<GameRecommendation[]> {
    return apiService.get<GameRecommendation[]>(
      `/recommendation/player/${playerId}/algorithm/${algorithm}`,
      { params }
    );
  },

  // Record recommendation interaction
  async recordInteraction(
    recommendationId: number,
    interaction: RecommendationInteraction
  ): Promise<void> {
    return apiService.post<void>(
      `/recommendation/${recommendationId}/interaction`,
      interaction
    );
  },

  // Trigger batch recommendation generation
  async triggerBatchGeneration(playerId: number): Promise<void> {
    return apiService.post<void>(`/recommendation/batch/player/${playerId}`);
  },

  // Get recommendation metrics
  async getMetrics(params?: {
    startDate?: string;
    endDate?: string;
    algorithm?: string;
  }): Promise<RecommendationMetrics> {
    return apiService.get<RecommendationMetrics>('/recommendation/metrics', { params });
  },

  // Get comprehensive analytics
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<RecommendationAnalytics> {
    return apiService.get<RecommendationAnalytics>('/analytics/comprehensive', { params });
  },

  // Get click-through rates by algorithm
  async getCTRByAlgorithm(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Record<string, number>> {
    return apiService.get<Record<string, number>>('/analytics/ctr-by-algorithm', { params });
  },

  // Get conversion rates by algorithm
  async getConversionByAlgorithm(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Record<string, number>> {
    return apiService.get<Record<string, number>>('/analytics/conversion-by-algorithm', { params });
  },

  // Get diversity metrics
  async getDiversityMetrics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DiversityMetrics> {
    return apiService.get<DiversityMetrics>('/analytics/diversity', { params });
  },

  // Get paginated recommendations with filters
  async getRecommendationsPaginated(params?: {
    page?: number;
    pageSize?: number;
    playerId?: number;
    algorithm?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    minScore?: number;
    maxScore?: number;
  }): Promise<PaginatedResponse<GameRecommendation>> {
    return apiService.getPaginated<GameRecommendation>('/recommendation', params);
  },

  // Get recommendation performance by game
  async getGamePerformance(params?: {
    startDate?: string;
    endDate?: string;
    gameId?: number;
  }): Promise<Record<number, RecommendationMetrics>> {
    return apiService.get<Record<number, RecommendationMetrics>>(
      '/recommendation/analytics/game-performance',
      { params }
    );
  },

  // Get recommendation trends over time
  async getTrends(params?: {
    startDate?: string;
    endDate?: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
    algorithm?: string;
  }): Promise<Array<{
    timestamp: string;
    totalRecommendations: number;
    clickThroughRate: number;
    conversionRate: number;
  }>> {
    return apiService.get('/recommendation/analytics/trends', { params });
  },

  // Get player recommendation history
  async getPlayerHistory(
    playerId: number,
    params?: {
      page?: number;
      pageSize?: number;
      startDate?: string;
      endDate?: string;
      algorithm?: string;
    }
  ): Promise<PaginatedResponse<GameRecommendation>> {
    return apiService.getPaginated<GameRecommendation>(
      `/recommendation/player/${playerId}/history`,
      params
    );
  },

  // Get recommendation effectiveness by player segment
  async getSegmentAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    segmentType?: 'vip' | 'risk' | 'country' | 'age';
  }): Promise<Record<string, RecommendationMetrics>> {
    return apiService.get<Record<string, RecommendationMetrics>>(
      '/recommendation/analytics/segments',
      { params }
    );
  },

  // Export recommendations data
  async exportRecommendations(params?: {
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'excel' | 'json';
    playerId?: number;
    algorithm?: string;
  }): Promise<void> {
    const queryParams = new URLSearchParams(params as Record<string, string>).toString();
    return apiService.download(`/recommendation/export?${queryParams}`, 'recommendations.csv');
  },

  // Get real-time recommendation stats
  async getRealTimeStats(): Promise<{
    activeRecommendations: number;
    todayClicks: number;
    todayConversions: number;
    currentCTR: number;
    currentConversionRate: number;
    topPerformingAlgorithm: string;
  }> {
    return apiService.get('/recommendation/stats/realtime');
  },

  // Get recommendation quality metrics
  async getQualityMetrics(params?: {
    startDate?: string;
    endDate?: string;
    algorithm?: string;
  }): Promise<{
    precision: number;
    recall: number;
    f1Score: number;
    coverage: number;
    diversity: number;
    novelty: number;
    serendipity: number;
  }> {
    return apiService.get('/recommendation/analytics/quality', { params });
  },

  // Refresh recommendations for a player
  async refreshRecommendations(playerId: number): Promise<GameRecommendation[]> {
    return apiService.post<GameRecommendation[]>(`/recommendation/player/${playerId}/refresh`);
  },

  // Get similar players for collaborative filtering insights
  async getSimilarPlayers(
    playerId: number,
    count?: number
  ): Promise<Array<{
    playerId: number;
    similarity: number;
    commonGames: number;
  }>> {
    return apiService.get(`/recommendation/player/${playerId}/similar`, {
      params: { count },
    });
  },

  // Get recommendation explanations
  async getRecommendationExplanation(
    recommendationId: number
  ): Promise<{
    algorithm: string;
    factors: Array<{
      factor: string;
      weight: number;
      description: string;
    }>;
    similarGames: number[];
    playerProfile: Record<string, any>;
  }> {
    return apiService.get(`/recommendation/${recommendationId}/explanation`);
  },
};
