/**
 * Example component demonstrating strict TypeScript patterns
 * Uses discriminated unions, proper error handling, and type safety
 */

import React from 'react';
import type { Game } from '../types';
import type { AsyncState, BaseComponentProps } from '@/shared/types';
import { asyncState, stateHooks } from '@/shared/utils';

// Strict component props with discriminated unions
interface GameCardProps extends BaseComponentProps {
  game: Game;
  variant?: 'compact' | 'detailed' | 'featured';
  state?: AsyncState<Game>;
  onGameClick?: (game: Game) => void;
  onGameFavorite?: (gameId: number) => Promise<void>;
  showStats?: boolean;
}

// Internal state using discriminated unions
type GameCardState = 
  | { status: 'idle' }
  | { status: 'favoriting' }
  | { status: 'favorited'; timestamp: number }
  | { status: 'error'; error: string };

// Component with strict typing
export const GameCard: React.FC<GameCardProps> = ({
  game,
  variant = 'compact',
  state,
  onGameClick,
  onGameFavorite,
  showStats = false,
  className = '',
  'data-testid': testId,
  children,
}) => {
  const [favoriteState, setFavoriteState] = React.useState<GameCardState>({ status: 'idle' });

  // Use state utilities for loading states
  const loadingState = state ? stateHooks.useLoadingState(state) : null;

  // Type-safe event handlers
  const handleGameClick = React.useCallback(() => {
    if (onGameClick && game) {
      onGameClick(game);
    }
  }, [onGameClick, game]);

  const handleFavoriteClick = React.useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent game click
    
    if (!onGameFavorite) return;
    
    setFavoriteState({ status: 'favoriting' });
    
    try {
      await onGameFavorite(game.gameId);
      setFavoriteState({ status: 'favorited', timestamp: Date.now() });
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setFavoriteState({ status: 'idle' });
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to favorite game';
      setFavoriteState({ status: 'error', error: errorMessage });
    }
  }, [onGameFavorite, game.gameId]);

  // Type guards for state checking
  const isFavoriting = favoriteState.status === 'favoriting';
  const isFavorited = favoriteState.status === 'favorited';
  const favoriteError = favoriteState.status === 'error' ? favoriteState.error : null;

  // Conditional rendering based on variant
  const renderGameInfo = () => {
    switch (variant) {
      case 'compact':
        return (
          <div className="p-3">
            <h3 className="font-semibold text-sm truncate">{game.gameName}</h3>
            {game.provider && (
              <p className="text-xs text-gray-500 truncate">{game.provider.providerName}</p>
            )}
          </div>
        );
      
      case 'detailed':
        return (
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{game.gameName}</h3>
            {game.provider && (
              <p className="text-sm text-gray-600 mb-2">{game.provider.providerName}</p>
            )}
            {game.description && (
              <p className="text-sm text-gray-700 line-clamp-2">{game.description}</p>
            )}
            {showStats && game.rtpPercentage && (
              <div className="mt-2 text-xs text-gray-500">
                RTP: {game.rtpPercentage}%
              </div>
            )}
          </div>
        );
      
      case 'featured':
        return (
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-xl">{game.gameName}</h3>
              {game.features && game.features.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {game.features[0]}
                </span>
              )}
            </div>
            {game.provider && (
              <p className="text-gray-600 mb-3">{game.provider.providerName}</p>
            )}
            {game.description && (
              <p className="text-gray-700 mb-4">{game.description}</p>
            )}
            {showStats && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {game.rtpPercentage && (
                  <div>
                    <span className="text-gray-500">RTP:</span>
                    <span className="ml-1 font-medium">{game.rtpPercentage}%</span>
                  </div>
                )}
                {game.volatility && (
                  <div>
                    <span className="text-gray-500">Volatility:</span>
                    <span className="ml-1 font-medium">{game.volatility.volatilityName}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      default:
        // TypeScript ensures this is never reached due to exhaustive checking
        const _exhaustiveCheck: never = variant;
        return null;
    }
  };

  // Loading overlay component
  const LoadingOverlay = () => {
    if (!loadingState?.isLoading) return null;
    
    return (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          {loadingState.progress !== undefined && (
            <span className="text-sm text-gray-600">{loadingState.progress}%</span>
          )}
        </div>
      </div>
    );
  };

  // Error display component
  const ErrorDisplay = () => {
    const error = loadingState?.error || favoriteError;
    if (!error) return null;
    
    return (
      <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
        {error}
      </div>
    );
  };

  // Main component render
  return (
    <div
      className={`
        relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer
        ${!game.isActive ? 'opacity-50' : ''}
        ${className}
      `}
      onClick={handleGameClick}
      data-testid={testId}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleGameClick();
        }
      }}
    >
      {/* Game Image */}
      {game.imageUrl && (
        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
          <img
            src={game.imageUrl}
            alt={game.gameName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Game Info */}
      {renderGameInfo()}

      {/* Favorite Button */}
      {onGameFavorite && (
        <button
          className={`
            absolute top-2 right-2 p-2 rounded-full transition-colors
            ${isFavorited ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}
            ${isFavoriting ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={handleFavoriteClick}
          disabled={isFavoriting}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      {/* Loading Overlay */}
      <LoadingOverlay />

      {/* Error Display */}
      <ErrorDisplay />

      {/* Platform Indicators */}
      <div className="absolute bottom-2 left-2 flex space-x-1">
        {game.isMobile && (
          <span className="bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">
            Mobile
          </span>
        )}
        {game.isDesktop && (
          <span className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
            Desktop
          </span>
        )}
      </div>

      {children}
    </div>
  );
};

export default GameCard;
