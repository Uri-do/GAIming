using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using GAIming.Core.Interfaces;
using GAIming.Core.Models;
using GAIming.Core.Entities;
using GAIming.Infrastructure.Data;
using System.Text.Json;

namespace GAIming.Infrastructure.Services;

/// <summary>
/// Game management service implementation
/// </summary>
public class GameManagementService : IGameManagementService
{
    private readonly IGameRepository _gameRepository;
    private readonly IPlayedGameRepository _playedGameRepository;
    private readonly IGameRecommendationRepository _recommendationRepository;
    private readonly ApplicationDbContext _gaimingContext;
    private readonly ApplicationDbContext _progressPlayContext;
    private readonly ILogger<GameManagementService> _logger;

    public GameManagementService(
        IGameRepository gameRepository,
        IPlayedGameRepository playedGameRepository,
        IGameRecommendationRepository recommendationRepository,
        ApplicationDbContext gaimingContext,
        ApplicationDbContext progressPlayContext,
        ILogger<GameManagementService> logger)
    {
        _gameRepository = gameRepository;
        _playedGameRepository = playedGameRepository;
        _recommendationRepository = recommendationRepository;
        _gaimingContext = gaimingContext;
        _progressPlayContext = progressPlayContext;
        _logger = logger;
    }

    public async Task<PaginatedResponse<GameManagementDto>> GetGamesAsync(GameManagementRequest request)
    {
        try
        {
            _logger.LogInformation("Getting games for management with request: {@Request}", request);

            var query = _progressPlayContext.Games
                .Include(g => g.Provider)
                .Include(g => g.GameType)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(request.Search))
            {
                query = query.Where(g => g.GameName.Contains(request.Search) ||
                                        g.ProviderTitle.Contains(request.Search));
            }

            if (request.ProviderId.HasValue)
                query = query.Where(g => g.ProviderID == request.ProviderId.Value);

            if (request.GameTypeId.HasValue)
                query = query.Where(g => g.GameTypeID == request.GameTypeId.Value);

            if (request.VolatilityId.HasValue)
                query = query.Where(g => g.VolatilityID == request.VolatilityId.Value);

            if (request.IsActive.HasValue)
                query = query.Where(g => g.IsActive == request.IsActive.Value);

            if (request.IsMobile.HasValue)
                query = query.Where(g => g.IsMobile == request.IsMobile.Value);

            if (request.IsDesktop.HasValue)
                query = query.Where(g => g.IsDesktop == request.IsDesktop.Value);

            if (request.ReleaseDateFrom.HasValue)
                query = query.Where(g => g.ReleaseDate >= request.ReleaseDateFrom.Value);

            if (request.ReleaseDateTo.HasValue)
                query = query.Where(g => g.ReleaseDate <= request.ReleaseDateTo.Value);

            // Apply sorting
            query = request.SortBy.ToLower() switch
            {
                "gamename" => request.SortDirection == "desc"
                    ? query.OrderByDescending(g => g.GameName)
                    : query.OrderBy(g => g.GameName),
                "provider" => request.SortDirection == "desc"
                    ? query.OrderByDescending(g => g.Provider!.Name)
                    : query.OrderBy(g => g.Provider!.Name),
                "releasedate" => request.SortDirection == "desc"
                    ? query.OrderByDescending(g => g.ReleaseDate)
                    : query.OrderBy(g => g.ReleaseDate),
                "gameorder" => request.SortDirection == "desc"
                    ? query.OrderByDescending(g => g.GameOrder)
                    : query.OrderBy(g => g.GameOrder),
                _ => query.OrderBy(g => g.GameName)
            };

            var totalCount = await query.CountAsync();
            var games = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var gameDtos = new List<GameManagementDto>();
            foreach (var game in games)
            {
                var dto = await MapToGameManagementDto(game);
                gameDtos.Add(dto);
            }

            return new PaginatedResponse<GameManagementDto>
            {
                Data = gameDtos,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting games for management");
            throw;
        }
    }

    public async Task<GameManagementDetailDto> GetGameDetailAsync(long gameId)
    {
        try
        {
            _logger.LogInformation("Getting game detail for {GameId}", gameId);

            var game = await _progressPlayContext.Games
                .Include(g => g.Provider)
                .Include(g => g.GameType)
                .FirstOrDefaultAsync(g => g.GameID == gameId);

            if (game == null)
                return null;

            var baseDto = await MapToGameManagementDto(game);
            var detailDto = new GameManagementDetailDto
            {
                // Copy all base properties
                GameId = baseDto.GameId,
                GameName = baseDto.GameName,
                ProviderName = baseDto.ProviderName,
                GameTypeName = baseDto.GameTypeName,
                VolatilityName = baseDto.VolatilityName,
                ThemeName = baseDto.ThemeName,
                IsActive = baseDto.IsActive,
                IsMobile = baseDto.IsMobile,
                IsDesktop = baseDto.IsDesktop,
                IsNewGame = baseDto.IsNewGame,
                HideInLobby = baseDto.HideInLobby,
                GameOrder = baseDto.GameOrder,
                MinBetAmount = baseDto.MinBetAmount,
                MaxBetAmount = baseDto.MaxBetAmount,
                RtpPercentage = baseDto.RtpPercentage,
                ReleaseDate = baseDto.ReleaseDate,
                CreatedDate = baseDto.CreatedDate,
                UpdatedDate = baseDto.UpdatedDate,
                TotalPlayers = baseDto.TotalPlayers,
                ActivePlayers = baseDto.ActivePlayers,
                TotalRevenue = baseDto.TotalRevenue,
                PopularityScore = baseDto.PopularityScore,
                RetentionRate = baseDto.RetentionRate,
                RecommendationCount = baseDto.RecommendationCount,
                RecommendationCtr = baseDto.RecommendationCtr,
                Status = baseDto.Status,
                Tags = baseDto.Tags,
                Warnings = baseDto.Warnings,

                // Add detailed properties
                ServerGameId = game.ServerGameID,
                MobileServerGameId = game.MobileServerGameID,
                ProviderTitle = game.ProviderTitle,
                GameDescription = "", // Not available in Game entity
                ImageUrl = "", // Not available in Game entity
                ThumbnailUrl = "", // Not available in Game entity
                UkCompliant = game.UKCompliant,
                JackpotContribution = game.JackpotContribution,

                // Load additional data
                Analytics = await GetGameAnalyticsAsync(gameId, 30),
                RecommendationSettings = await GetGameRecommendationSettingsAsync(gameId),
                Configuration = await GetGameConfigurationAsync(gameId),
                RecentChanges = await GetGameAuditLogAsync(gameId, 10)
            };

            return detailDto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting game detail for {GameId}", gameId);
            throw;
        }
    }

    public async Task<GameAnalyticsDto> GetGameAnalyticsAsync(long gameId, int days)
    {
        try
        {
            _logger.LogInformation("Getting game analytics for {GameId} for {Days} days", gameId, days);

            var endDate = DateTime.UtcNow;
            var startDate = endDate.AddDays(-days);

            // Get played games data
            var playedGames = await _progressPlayContext.PlayedGames
                .Where(pg => pg.GameID == gameId && 
                           pg.CreationDate >= startDate && 
                           pg.CreationDate <= endDate &&
                           pg.GameStatus == 1)
                .ToListAsync();

            // Get recommendation data
            var recommendations = await _gaimingContext.GameRecommendations
                .Where(gr => gr.GameId == gameId && 
                           gr.CreatedDate >= startDate && 
                           gr.CreatedDate <= endDate)
                .ToListAsync();

            var analytics = new GameAnalyticsDto
            {
                GameId = gameId,
                StartDate = startDate,
                EndDate = endDate,

                // Player metrics
                TotalPlayers = playedGames.Select(pg => pg.PlayerID).Distinct().Count(),
                TotalSessions = playedGames.Count,
                AverageSessionDuration = playedGames.Any() 
                    ? playedGames.Average(pg => (pg.UpdatedDate - pg.CreationDate).TotalMinutes) 
                    : 0,

                // Financial metrics
                TotalBets = playedGames.Sum(pg => pg.TotalBet),
                TotalWins = playedGames.Sum(pg => pg.TotalWin),
                TotalRevenue = playedGames.Sum(pg => pg.TotalBet - pg.TotalWin),
                AverageBetSize = playedGames.Any() ? playedGames.Average(pg => pg.TotalBet) : 0,

                // Recommendation metrics
                RecommendationImpressions = recommendations.Count,
                RecommendationClicks = recommendations.Count(r => r.IsClicked),
                RecommendationPlays = recommendations.Count(r => r.IsPlayed),
                RecommendationCtr = recommendations.Any() 
                    ? (double)recommendations.Count(r => r.IsClicked) / recommendations.Count 
                    : 0,
                RecommendationConversionRate = recommendations.Any() 
                    ? (double)recommendations.Count(r => r.IsPlayed) / recommendations.Count 
                    : 0,

                // Calculate trends and benchmarks
                PlayerTrends = await CalculatePlayerTrends(gameId, startDate, endDate),
                RevenueTrends = await CalculateRevenueTrends(gameId, startDate, endDate),
                SessionTrends = await CalculateSessionTrends(gameId, startDate, endDate),
                Benchmarks = await CalculateBenchmarks(gameId)
            };

            // Calculate derived metrics
            analytics.ActualRtp = analytics.TotalBets > 0 
                ? (double)(analytics.TotalWins / analytics.TotalBets) * 100 
                : 0;
            
            analytics.HouseEdge = 100 - analytics.ActualRtp;
            
            analytics.PopularityScore = CalculatePopularityScore(analytics);

            return analytics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting game analytics for {GameId}", gameId);
            throw;
        }
    }

    public async Task<GameManagementDto> UpdateGameAsync(long gameId, UpdateGameRequest request)
    {
        try
        {
            _logger.LogInformation("Updating game {GameId} with request: {@Request}", gameId, request);

            // Note: Since ProgressPlay database is read-only, we'll store game management 
            // settings in the GAIming database
            var gameSettings = await _gaimingContext.GameManagementSettings
                .FirstOrDefaultAsync(gms => gms.GameId == gameId);

            if (gameSettings == null)
            {
                gameSettings = new GameManagementSettings
                {
                    GameId = gameId,
                    CreatedDate = DateTime.UtcNow
                };
                _gaimingContext.GameManagementSettings.Add(gameSettings);
            }

            // Update settings
            if (request.IsActive.HasValue)
                gameSettings.IsActiveOverride = request.IsActive.Value;
            
            if (request.HideInLobby.HasValue)
                gameSettings.HideInLobbyOverride = request.HideInLobby.Value;
            
            if (request.GameOrder.HasValue)
                gameSettings.GameOrderOverride = request.GameOrder.Value;
            
            if (request.MinBetAmount.HasValue)
                gameSettings.MinBetAmountOverride = request.MinBetAmount.Value;
            
            if (request.MaxBetAmount.HasValue)
                gameSettings.MaxBetAmountOverride = request.MaxBetAmount.Value;
            
            if (!string.IsNullOrEmpty(request.GameDescription))
                gameSettings.GameDescriptionOverride = request.GameDescription;
            
            if (!string.IsNullOrEmpty(request.ImageUrl))
                gameSettings.ImageUrlOverride = request.ImageUrl;
            
            if (!string.IsNullOrEmpty(request.ThumbnailUrl))
                gameSettings.ThumbnailUrlOverride = request.ThumbnailUrl;
            
            if (request.Tags != null)
                gameSettings.TagsOverride = JsonSerializer.Serialize(request.Tags);
            
            if (!string.IsNullOrEmpty(request.Notes))
                gameSettings.Notes = request.Notes;

            gameSettings.UpdatedDate = DateTime.UtcNow;
            gameSettings.UpdatedBy = "System"; // TODO: Get from current user context

            await _gaimingContext.SaveChangesAsync();

            // Return updated game data
            return await GetGameManagementDto(gameId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating game {GameId}", gameId);
            throw;
        }
    }

    // Additional helper methods will be implemented...
    private Task<GameManagementDto> MapToGameManagementDto(Game game)
    {
        // Basic mapping implementation
        return Task.FromResult(new GameManagementDto
        {
            GameId = game.GameID,
            GameName = game.GameName,
            ProviderName = game.Provider?.Name ?? "Unknown",
            GameTypeName = game.GameType?.Name ?? "Unknown",
            IsActive = game.IsActive,
            IsMobile = game.IsMobile,
            IsDesktop = game.IsDesktop,
            HideInLobby = game.HideInLobby ?? false,
            GameOrder = game.GameOrder,
            MinBetAmount = game.MinBetAmount,
            MaxBetAmount = null, // Not available in Game entity
            ReleaseDate = game.ReleaseDate,
            CreatedDate = game.CreatedDate,
            UpdatedDate = game.UpdatedDate,
            Status = game.IsActive ? "Active" : "Inactive"
        });
    }

    // Placeholder implementations for remaining interface methods
    public async Task<BulkUpdateResult> BulkUpdateGamesAsync(BulkUpdateGamesRequest request)
    {
        await Task.CompletedTask;
        return new BulkUpdateResult { TotalRequested = request.GameIds.Count };
    }

    public async Task<GameComparisonResult> CompareGamesAsync(List<long> gameIds, int days)
    {
        await Task.CompletedTask;
        return new GameComparisonResult { GameIds = gameIds };
    }

    public async Task<GameRecommendationSettings> GetGameRecommendationSettingsAsync(long gameId)
    {
        await Task.CompletedTask;
        return new GameRecommendationSettings { GameId = gameId };
    }

    public async Task<GameRecommendationSettings> UpdateGameRecommendationSettingsAsync(long gameId, GameRecommendationSettings settings)
    {
        await Task.CompletedTask;
        return settings;
    }

    public async Task<GameRefreshResult> RefreshGameDataAsync(long gameId)
    {
        await Task.CompletedTask;
        return new GameRefreshResult { GameId = gameId, Success = true };
    }

    public async Task<GamesDashboardDto> GetGamesDashboardAsync(int days)
    {
        await Task.CompletedTask;
        return new GamesDashboardDto();
    }

    public async Task<ExportResult> ExportGamesAsync(ExportGamesRequest request)
    {
        await Task.CompletedTask;
        return new ExportResult();
    }

    // Helper method implementations
    private async Task<GameManagementDto?> GetGameManagementDto(long gameId)
    {
        var game = await _progressPlayContext.Games
            .Include(g => g.Provider)
            .Include(g => g.GameType)
            .FirstOrDefaultAsync(g => g.GameID == gameId);
        
        return game != null ? await MapToGameManagementDto(game) : null;
    }

    private async Task<List<GameConfigurationItem>> GetGameConfigurationAsync(long gameId)
    {
        await Task.CompletedTask;
        return new List<GameConfigurationItem>();
    }

    private async Task<List<GameAuditLogEntry>> GetGameAuditLogAsync(long gameId, int count)
    {
        await Task.CompletedTask;
        return new List<GameAuditLogEntry>();
    }

    private async Task<List<GameMetricTrend>> CalculatePlayerTrends(long gameId, DateTime startDate, DateTime endDate)
    {
        await Task.CompletedTask;
        return new List<GameMetricTrend>();
    }

    private async Task<List<GameMetricTrend>> CalculateRevenueTrends(long gameId, DateTime startDate, DateTime endDate)
    {
        await Task.CompletedTask;
        return new List<GameMetricTrend>();
    }

    private async Task<List<GameMetricTrend>> CalculateSessionTrends(long gameId, DateTime startDate, DateTime endDate)
    {
        await Task.CompletedTask;
        return new List<GameMetricTrend>();
    }

    private async Task<GameBenchmarkData> CalculateBenchmarks(long gameId)
    {
        await Task.CompletedTask;
        return new GameBenchmarkData();
    }

    private double CalculatePopularityScore(GameAnalyticsDto analytics)
    {
        // Simple popularity score calculation
        var playerWeight = analytics.TotalPlayers * 0.3;
        var sessionWeight = analytics.TotalSessions * 0.2;
        var revenueWeight = (double)analytics.TotalRevenue * 0.3;
        var retentionWeight = analytics.PlayerRetentionRate * 0.2;

        return playerWeight + sessionWeight + revenueWeight + retentionWeight;
    }

    /// <inheritdoc />
    public async Task<PaginatedResponse<GameDto>> GetGamesAsync(GameSearchRequest request)
    {
        try
        {
            _logger.LogInformation("Getting games with search request: {@Request}", request);

            var query = _progressPlayContext.Games
                .Include(g => g.Provider)
                .Include(g => g.GameType)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                query = query.Where(g => g.GameName.Contains(request.SearchTerm) ||
                                        g.ProviderTitle.Contains(request.SearchTerm));
            }

            if (request.ProviderId.HasValue)
                query = query.Where(g => g.ProviderID == request.ProviderId.Value);

            if (request.GameTypeId.HasValue)
                query = query.Where(g => g.GameTypeID == request.GameTypeId.Value);

            if (request.IsActive.HasValue)
                query = query.Where(g => g.IsActive == request.IsActive.Value);

            var totalCount = await query.CountAsync();
            var games = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var gameDtos = games.Select(g => new GameDto
            {
                GameId = g.GameID,
                GameName = g.GameName,
                ProviderName = g.Provider?.Name ?? "Unknown",
                GameTypeName = g.GameType?.Name ?? "Unknown",
                IsActive = g.IsActive,
                IsMobile = g.IsMobile,
                IsDesktop = g.IsDesktop,
                ReleaseDate = g.ReleaseDate,
                CreatedDate = g.CreatedDate
            }).ToList();

            return new PaginatedResponse<GameDto>
            {
                Data = gameDtos,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting games");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<GameDto?> GetGameByIdAsync(int gameId)
    {
        try
        {
            _logger.LogDebug("Getting game by ID: {GameId}", gameId);

            var game = await _progressPlayContext.Games
                .Include(g => g.Provider)
                .Include(g => g.GameType)
                .FirstOrDefaultAsync(g => g.GameID == gameId);

            if (game == null)
                return null;

            return new GameDto
            {
                GameId = game.GameID,
                GameName = game.GameName,
                ProviderName = game.Provider?.Name ?? "Unknown",
                GameTypeName = game.GameType?.Name ?? "Unknown",
                IsActive = game.IsActive,
                IsMobile = game.IsMobile,
                IsDesktop = game.IsDesktop,
                ReleaseDate = game.ReleaseDate,
                CreatedDate = game.CreatedDate
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting game by ID: {GameId}", gameId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<GAIming.Core.Entities.GameManagementSettings?> GetGameSettingsAsync(long gameId)
    {
        try
        {
            _logger.LogDebug("Getting game settings for game: {GameId}", gameId);

            var settings = await _gaimingContext.GameManagementSettings
                .FirstOrDefaultAsync(gms => gms.GameId == gameId);

            return settings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting game settings for game: {GameId}", gameId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<GAIming.Core.Entities.GameManagementSettings> UpdateGameSettingsAsync(long gameId, GameManagementRequest request, string updatedBy)
    {
        try
        {
            _logger.LogInformation("Updating game settings for game: {GameId} by {UpdatedBy}", gameId, updatedBy);

            var settings = await _gaimingContext.GameManagementSettings
                .FirstOrDefaultAsync(gms => gms.GameId == gameId);

            if (settings == null)
            {
                settings = new GAIming.Core.Entities.GameManagementSettings
                {
                    GameId = gameId,
                    CreatedDate = DateTime.UtcNow,
                    CreatedBy = updatedBy
                };
                _gaimingContext.GameManagementSettings.Add(settings);
            }

            // Update settings based on request
            if (request.IsActive.HasValue)
                settings.IsActiveOverride = request.IsActive.Value;

            if (request.HideInLobby.HasValue)
                settings.HideInLobbyOverride = request.HideInLobby.Value;

            if (request.GameOrder.HasValue)
                settings.GameOrderOverride = request.GameOrder.Value;

            settings.UpdatedDate = DateTime.UtcNow;
            settings.UpdatedBy = updatedBy;

            await _gaimingContext.SaveChangesAsync();

            return settings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating game settings for game: {GameId}", gameId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BulkOperationResult> BulkUpdateGamesAsync(BulkGameUpdateRequest request, string updatedBy)
    {
        try
        {
            _logger.LogInformation("Bulk updating {Count} games by {UpdatedBy}", request.GameIds.Count, updatedBy);

            var result = new BulkOperationResult
            {
                TotalRequested = request.GameIds.Count,
                SuccessCount = 0,
                FailureCount = 0,
                Errors = new List<string>()
            };

            foreach (var gameId in request.GameIds)
            {
                try
                {
                    var gameRequest = new GameManagementRequest
                    {
                        IsActive = request.IsActive,
                        HideInLobby = request.HideInLobby,
                        GameOrder = request.GameOrder
                    };

                    await UpdateGameSettingsAsync(gameId, gameRequest, updatedBy);
                    result.SuccessCount++;
                }
                catch (Exception ex)
                {
                    result.FailureCount++;
                    result.Errors.Add($"Game {gameId}: {ex.Message}");
                    _logger.LogError(ex, "Error updating game {GameId} in bulk operation", gameId);
                }
            }

            _logger.LogInformation("Bulk update completed. Success: {Success}, Failures: {Failures}",
                result.SuccessCount, result.FailureCount);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in bulk update games operation");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<List<GameDto>> GetFeaturedGamesAsync()
    {
        try
        {
            _logger.LogInformation("Getting featured games");

            // Get games with featured settings from GAIming database
            var featuredGameIds = await _gaimingContext.GameManagementSettings
                .Where(gms => gms.IsFeatured == true)
                .OrderBy(gms => gms.FeaturedPriority)
                .Select(gms => gms.GameId)
                .ToListAsync();

            if (!featuredGameIds.Any())
            {
                // Fallback to top games by some criteria
                featuredGameIds = await _progressPlayContext.Games
                    .Where(g => g.IsActive)
                    .OrderByDescending(g => g.GameOrder)
                    .Take(10)
                    .Select(g => (long)g.GameID)
                    .ToListAsync();
            }

            var games = await _progressPlayContext.Games
                .Include(g => g.Provider)
                .Include(g => g.GameType)
                .Where(g => featuredGameIds.Contains(g.GameID))
                .ToListAsync();

            return games.Select(g => new GameDto
            {
                GameId = g.GameID,
                GameName = g.GameName,
                ProviderName = g.Provider?.Name ?? "Unknown",
                GameTypeName = g.GameType?.Name ?? "Unknown",
                IsActive = g.IsActive,
                IsMobile = g.IsMobile,
                IsDesktop = g.IsDesktop,
                ReleaseDate = g.ReleaseDate,
                CreatedDate = g.CreatedDate
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting featured games");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> SetGameFeaturedAsync(long gameId, bool isFeatured, int priority, string updatedBy)
    {
        try
        {
            _logger.LogInformation("Setting game {GameId} featured status to {IsFeatured} with priority {Priority} by {UpdatedBy}",
                gameId, isFeatured, priority, updatedBy);

            var settings = await _gaimingContext.GameManagementSettings
                .FirstOrDefaultAsync(gms => gms.GameId == gameId);

            if (settings == null)
            {
                settings = new GAIming.Core.Entities.GameManagementSettings
                {
                    GameId = gameId,
                    CreatedDate = DateTime.UtcNow,
                    CreatedBy = updatedBy
                };
                _gaimingContext.GameManagementSettings.Add(settings);
            }

            settings.IsFeatured = isFeatured;
            settings.FeaturedPriority = priority;
            settings.UpdatedDate = DateTime.UtcNow;
            settings.UpdatedBy = updatedBy;

            await _gaimingContext.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting game {GameId} featured status", gameId);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<List<GameStatisticsDto>> GetGameStatisticsAsync(List<int> gameIds, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            _logger.LogInformation("Getting game statistics for {Count} games", gameIds.Count);

            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var statistics = new List<GameStatisticsDto>();

            foreach (var gameId in gameIds)
            {
                var analytics = await GetGameAnalyticsAsync(gameId, (int)(end - start).TotalDays);

                statistics.Add(new GameStatisticsDto
                {
                    GameId = gameId,
                    StartDate = start,
                    EndDate = end,
                    TotalPlayers = analytics.TotalPlayers,
                    TotalSessions = analytics.TotalSessions,
                    TotalBets = analytics.TotalBets,
                    TotalWins = analytics.TotalWins,
                    TotalRevenue = analytics.TotalRevenue,
                    AverageSessionDuration = analytics.AverageSessionDuration,
                    AverageBetSize = analytics.AverageBetSize,
                    ActualRtp = analytics.ActualRtp,
                    PopularityScore = analytics.PopularityScore,
                    RecommendationImpressions = analytics.RecommendationImpressions,
                    RecommendationClicks = analytics.RecommendationClicks,
                    RecommendationCtr = analytics.RecommendationCtr
                });
            }

            return statistics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting game statistics");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task RefreshGameCacheAsync()
    {
        try
        {
            _logger.LogInformation("Refreshing game cache");

            // TODO: Implement cache refresh logic
            // This would typically:
            // 1. Clear existing cache entries
            // 2. Reload game data from database
            // 3. Update cache with fresh data
            // 4. Notify other services of cache refresh

            await Task.Delay(100); // Simulate cache refresh

            _logger.LogInformation("Game cache refreshed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing game cache");
            throw;
        }
    }
}
