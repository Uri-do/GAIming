import { apiService } from '@/shared/services/api';
import { mockApiService } from '@/shared/services/mockDataService';
import type {
  Game,
  GameProvider,
  GameType,
  Volatility,
  Theme,
  PaginatedResponse,
} from '../types';

// Use mock data in development
const isDevelopment = process.env.NODE_ENV === 'development';
const api = isDevelopment ? mockApiService : apiService;

export const gameService = {
  // Get all active games
  async getGames(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    provider?: number;
    gameType?: number;
    volatility?: number;
    theme?: number;
    isActive?: boolean;
    isMobile?: boolean;
    isDesktop?: boolean;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Game>> {
    if (isDevelopment) {
      return api.getGames(params);
    }
    return apiService.getPaginated<Game>('/games', params);
  },

  // Get game by ID
  async getGame(gameId: number): Promise<Game> {
    if (isDevelopment) {
      const game = await api.getGame(gameId);
      if (!game) throw new Error('Game not found');
      return game;
    }
    return apiService.get<Game>(`/games/${gameId}`);
  },

  // Get games by provider
  async getGamesByProvider(
    providerId: number,
    params?: {
      page?: number;
      pageSize?: number;
      isActive?: boolean;
    }
  ): Promise<PaginatedResponse<Game>> {
    return apiService.getPaginated<Game>(`/games/provider/${providerId}`, params);
  },

  // Get games by type
  async getGamesByType(
    gameTypeId: number,
    params?: {
      page?: number;
      pageSize?: number;
      isActive?: boolean;
    }
  ): Promise<PaginatedResponse<Game>> {
    return apiService.getPaginated<Game>(`/games/type/${gameTypeId}`, params);
  },

  // Get popular games
  async getPopularGames(params?: {
    count?: number;
    timeframe?: 'day' | 'week' | 'month' | 'year';
  }): Promise<Game[]> {
    return apiService.get<Game[]>('/games/popular', { params });
  },

  // Get new games
  async getNewGames(params?: {
    count?: number;
    daysBack?: number;
  }): Promise<Game[]> {
    return apiService.get<Game[]>('/games/new', { params });
  },

  // Search games
  async searchGames(params: {
    query: string;
    page?: number;
    pageSize?: number;
    filters?: {
      provider?: number;
      gameType?: number;
      volatility?: number;
      theme?: number;
      minBet?: number;
      maxBet?: number;
      isMobile?: boolean;
      isDesktop?: boolean;
    };
  }): Promise<PaginatedResponse<Game>> {
    return apiService.getPaginated<Game>('/games/search', params);
  },

  // Get game providers
  async getProviders(params?: {
    isActive?: boolean;
  }): Promise<GameProvider[]> {
    if (isDevelopment) {
      return api.getProviders();
    }
    return apiService.get<GameProvider[]>('/games/providers', { params });
  },

  // Get game types
  async getGameTypes(): Promise<GameType[]> {
    if (isDevelopment) {
      return api.getGameTypes();
    }
    return apiService.get<GameType[]>('/games/types');
  },

  // Get volatility levels
  async getVolatilities(): Promise<Volatility[]> {
    if (isDevelopment) {
      return api.getVolatilities();
    }
    return apiService.get<Volatility[]>('/games/volatilities');
  },

  // Get themes
  async getThemes(): Promise<Theme[]> {
    if (isDevelopment) {
      return api.getThemes();
    }
    return apiService.get<Theme[]>('/games/themes');
  },

  // Get game statistics
  async getGameStats(gameId: number): Promise<{
    totalPlayers: number;
    activePlayers: number;
    totalSessions: number;
    averageSessionDuration: number;
    totalRevenue: number;
    averageRating: number;
    popularityRank: number;
    retentionRate: number;
    conversionRate: number;
  }> {
    return apiService.get(`/games/${gameId}/stats`);
  },

  // Get game performance metrics
  async getGamePerformance(
    gameId: number,
    params?: {
      startDate?: string;
      endDate?: string;
      granularity?: 'hour' | 'day' | 'week' | 'month';
    }
  ): Promise<Array<{
    timestamp: string;
    players: number;
    sessions: number;
    revenue: number;
    averageSessionDuration: number;
  }>> {
    return apiService.get(`/games/${gameId}/performance`, { params });
  },

  // Get similar games
  async getSimilarGames(
    gameId: number,
    count?: number
  ): Promise<Game[]> {
    return apiService.get<Game[]>(`/games/${gameId}/similar`, {
      params: { count },
    });
  },

  // Get game recommendations for a specific game (content-based)
  async getGameRecommendations(
    gameId: number,
    count?: number
  ): Promise<Game[]> {
    return apiService.get<Game[]>(`/games/${gameId}/recommendations`, {
      params: { count },
    });
  },

  // Get trending games
  async getTrendingGames(params?: {
    count?: number;
    timeframe?: 'hour' | 'day' | 'week';
    category?: 'rising' | 'hot' | 'viral';
  }): Promise<Game[]> {
    return apiService.get<Game[]>('/games/trending', { params });
  },

  // Get games by volatility
  async getGamesByVolatility(
    volatilityId: number,
    params?: {
      page?: number;
      pageSize?: number;
      isActive?: boolean;
    }
  ): Promise<PaginatedResponse<Game>> {
    return apiService.getPaginated<Game>(`/games/volatility/${volatilityId}`, params);
  },

  // Get games by theme
  async getGamesByTheme(
    themeId: number,
    params?: {
      page?: number;
      pageSize?: number;
      isActive?: boolean;
    }
  ): Promise<PaginatedResponse<Game>> {
    return apiService.getPaginated<Game>(`/games/theme/${themeId}`, params);
  },

  // Get game analytics summary
  async getGameAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
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
  }> {
    return apiService.get('/games/analytics', { params });
  },

  // Export games data
  async exportGames(params?: {
    format?: 'csv' | 'excel' | 'json';
    provider?: number;
    gameType?: number;
    isActive?: boolean;
  }): Promise<void> {
    const queryParams = new URLSearchParams(params as Record<string, string>).toString();
    return apiService.download(`/games/export?${queryParams}`, 'games.csv');
  },

  // Get game features for ML
  async getGameFeatures(gameId: number): Promise<{
    gameId: number;
    features: Record<string, number>;
    categories: string[];
    tags: string[];
    metadata: Record<string, any>;
  }> {
    return apiService.get(`/games/${gameId}/features`);
  },

  // Get games with low performance
  async getLowPerformanceGames(params?: {
    threshold?: number;
    timeframe?: 'week' | 'month' | 'quarter';
    metric?: 'players' | 'revenue' | 'sessions' | 'retention';
  }): Promise<Array<{
    game: Game;
    performanceScore: number;
    issues: string[];
    recommendations: string[];
  }>> {
    return apiService.get('/games/low-performance', { params });
  },

  // Get game lifecycle analytics
  async getGameLifecycle(gameId: number): Promise<{
    launchDate: string;
    peakDate: string;
    currentPhase: 'launch' | 'growth' | 'maturity' | 'decline';
    lifetimeRevenue: number;
    lifetimePlayers: number;
    projectedLifetime: number;
    healthScore: number;
  }> {
    return apiService.get(`/games/${gameId}/lifecycle`);
  },

  // Get competitive analysis
  async getCompetitiveAnalysis(gameId: number): Promise<{
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
  }> {
    return apiService.get(`/games/${gameId}/competitive-analysis`);
  },
};
