import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { gameService } from '../services';
import type { Game, GameFilterForm, PaginatedResponse } from '../types';
import type { AsyncState } from '@/shared/types';
import { asyncState } from '@/shared/utils';

// Query keys for games
export const gameKeys = {
  all: ['games'] as const,
  lists: () => [...gameKeys.all, 'list'] as const,
  list: (filters: Partial<GameFilterForm>) => [...gameKeys.lists(), { filters }] as const,
  details: () => [...gameKeys.all, 'detail'] as const,
  detail: (id: number) => [...gameKeys.details(), id] as const,
  stats: (id: number) => [...gameKeys.detail(id), 'stats'] as const,
  performance: (id: number, params?: any) => [...gameKeys.detail(id), 'performance', params] as const,
  providers: () => [...gameKeys.all, 'providers'] as const,
  types: () => [...gameKeys.all, 'types'] as const,
  volatilities: () => [...gameKeys.all, 'volatilities'] as const,
  themes: () => [...gameKeys.all, 'themes'] as const,
  popular: (params?: any) => [...gameKeys.all, 'popular', params] as const,
  trending: (params?: any) => [...gameKeys.all, 'trending', params] as const,
  new: (params?: any) => [...gameKeys.all, 'new', params] as const,
  similar: (id: number, count?: number) => [...gameKeys.detail(id), 'similar', count] as const,
  analytics: (params?: any) => [...gameKeys.all, 'analytics', params] as const,
};

// Hook for fetching paginated games
export const useGames = (filters?: Partial<GameFilterForm>) => {
  return useQuery({
    queryKey: gameKeys.list(filters || {}),
    queryFn: () => gameService.getGames(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data: PaginatedResponse<Game>) => ({
      ...data,
      items: data.items.map(game => ({
        ...game,
        // Ensure consistent data structure
        provider: game.provider || { 
          providerId: game.providerId, 
          providerName: game.providerName || 'Unknown',
          isActive: true 
        },
      }))
    })
  });
};

// Hook for fetching a single game
export const useGame = (gameId: number, enabled = true) => {
  return useQuery({
    queryKey: gameKeys.detail(gameId),
    queryFn: () => gameService.getGame(gameId),
    enabled: enabled && gameId > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for game statistics
export const useGameStats = (gameId: number, enabled = true) => {
  return useQuery({
    queryKey: gameKeys.stats(gameId),
    queryFn: () => gameService.getGameStats(gameId),
    enabled: enabled && gameId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for game performance metrics
export const useGamePerformance = (
  gameId: number, 
  params?: {
    startDate?: string;
    endDate?: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
  },
  enabled = true
) => {
  return useQuery({
    queryKey: gameKeys.performance(gameId, params),
    queryFn: () => gameService.getGamePerformance(gameId, params),
    enabled: enabled && gameId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for game providers
export const useGameProviders = (params?: { isActive?: boolean }) => {
  return useQuery({
    queryKey: gameKeys.providers(),
    queryFn: () => gameService.getProviders(params),
    staleTime: 30 * 60 * 1000, // 30 minutes - providers don't change often
  });
};

// Hook for game types
export const useGameTypes = () => {
  return useQuery({
    queryKey: gameKeys.types(),
    queryFn: () => gameService.getGameTypes(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for volatility levels
export const useVolatilities = () => {
  return useQuery({
    queryKey: gameKeys.volatilities(),
    queryFn: () => gameService.getVolatilities(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for themes
export const useThemes = () => {
  return useQuery({
    queryKey: gameKeys.themes(),
    queryFn: () => gameService.getThemes(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for popular games
export const usePopularGames = (params?: {
  count?: number;
  timeframe?: 'day' | 'week' | 'month' | 'year';
}) => {
  return useQuery({
    queryKey: gameKeys.popular(params),
    queryFn: () => gameService.getPopularGames(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for trending games
export const useTrendingGames = (params?: {
  count?: number;
  timeframe?: 'hour' | 'day' | 'week';
  category?: 'rising' | 'hot' | 'viral';
}) => {
  return useQuery({
    queryKey: gameKeys.trending(params),
    queryFn: () => gameService.getTrendingGames(params),
    staleTime: 5 * 60 * 1000, // 5 minutes - trending changes quickly
  });
};

// Hook for new games
export const useNewGames = (params?: {
  count?: number;
  daysBack?: number;
}) => {
  return useQuery({
    queryKey: gameKeys.new(params),
    queryFn: () => gameService.getNewGames(params),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for similar games
export const useSimilarGames = (gameId: number, count?: number, enabled = true) => {
  return useQuery({
    queryKey: gameKeys.similar(gameId, count),
    queryFn: () => gameService.getSimilarGames(gameId, count),
    enabled: enabled && gameId > 0,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for game analytics
export const useGameAnalytics = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: gameKeys.analytics(params),
    queryFn: () => gameService.getGameAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for game search
export const useGameSearch = (searchParams: {
  query: string;
  page?: number;
  pageSize?: number;
  filters?: any;
}, enabled = true) => {
  return useQuery({
    queryKey: [...gameKeys.all, 'search', searchParams],
    queryFn: () => gameService.searchGames(searchParams),
    enabled: enabled && searchParams.query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Mutation hook for exporting games
export const useExportGames = () => {
  return useMutation({
    mutationFn: (params?: {
      format?: 'csv' | 'excel' | 'json';
      provider?: number;
      gameType?: number;
      isActive?: boolean;
    }) => gameService.exportGames(params),
  });
};

// Advanced hook using discriminated unions for complex game operations
export const useGameOperation = (gameId: number) => {
  const [operationState, setOperationState] = useState<AsyncState<Game>>(
    asyncState.idle()
  );

  const executeOperation = useCallback(async (operation: 'activate' | 'deactivate' | 'refresh') => {
    setOperationState(asyncState.loading());

    try {
      let result: Game;

      switch (operation) {
        case 'activate':
          // Simulated API call
          result = await gameService.getGame(gameId);
          break;
        case 'deactivate':
          result = await gameService.getGame(gameId);
          break;
        case 'refresh':
          result = await gameService.getGame(gameId);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      setOperationState(asyncState.success(result));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      setOperationState(asyncState.error(errorMessage));
      throw error;
    }
  }, [gameId]);

  const reset = useCallback(() => {
    setOperationState(asyncState.idle());
  }, []);

  return {
    state: operationState,
    executeOperation,
    reset,
    // Derived state using type guards
    isIdle: asyncState.isIdle(operationState),
    isLoading: asyncState.isLoading(operationState),
    isSuccess: asyncState.isSuccess(operationState),
    isError: asyncState.isError(operationState),
    data: asyncState.isSuccess(operationState) ? operationState.data : null,
    error: asyncState.getError(operationState),
  };
};
