using GAIming.Core.CQRS;
using GAIming.Core.Common;
using GAIming.Core.Entities;
using GAIming.Core.Interfaces;
using GAIming.Core.Models;
using GAIming.Core.Specifications;
using GAIming.Core.Strategies;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;

namespace GAIming.Infrastructure.CQRS;

/// <summary>
/// Query dispatcher implementation
/// </summary>
public class QueryDispatcher : IQueryDispatcher
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<QueryDispatcher> _logger;

    public QueryDispatcher(IServiceProvider serviceProvider, ILogger<QueryDispatcher> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task<Result<TResult>> DispatchAsync<TQuery, TResult>(TQuery query, CancellationToken cancellationToken = default) where TQuery : IQuery<TResult>
    {
        try
        {
            var handler = _serviceProvider.GetService(typeof(IQueryHandler<TQuery, TResult>)) as IQueryHandler<TQuery, TResult>;
        if (handler == null)
        {
            _logger.LogError("No handler found for query {QueryType}", typeof(TQuery).Name);
            return Result.Failure<TResult>($"No handler found for query {typeof(TQuery).Name}");
        }
            _logger.LogDebug("Dispatching query {QueryType}", typeof(TQuery).Name);
            
            var result = await handler.HandleAsync(query, cancellationToken);
            
            _logger.LogDebug("Query {QueryType} completed with result: {Success}", 
                typeof(TQuery).Name, result.IsSuccess);
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error dispatching query {QueryType}", typeof(TQuery).Name);
            return Result.Failure<TResult>($"Query dispatch failed: {ex.Message}");
        }
    }
}

/// <summary>
/// Get game by ID query handler
/// </summary>
public class GetGameByIdQueryHandler : IQueryHandler<GetGameByIdQuery, GameDto?>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMemoryCache _cache;
    private readonly ILogger<GetGameByIdQueryHandler> _logger;

    public GetGameByIdQueryHandler(
        IUnitOfWork unitOfWork,
        IMemoryCache cache,
        ILogger<GetGameByIdQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Result<GameDto?>> HandleAsync(GetGameByIdQuery query, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogDebug("Getting game by ID {GameId}", query.GameId);

            // Check cache first
            var cacheKey = $"game:{query.GameId}";
            if (_cache.TryGetValue(cacheKey, out GameDto? cachedGame))
            {
                _logger.LogDebug("Game {GameId} found in cache", query.GameId);
                return Result.Success(cachedGame);
            }

            // Get from database
            var repository = _unitOfWork.GetRepository<IGameRepository>();
            var game = await repository.GetByIdAsync(query.GameId);

            if (game == null)
            {
                _logger.LogDebug("Game {GameId} not found", query.GameId);
                return Result.Success<GameDto?>(null);
            }

            if (!query.IncludeInactive && !game.IsActive)
            {
                _logger.LogDebug("Game {GameId} is inactive and IncludeInactive is false", query.GameId);
                return Result.Success<GameDto?>(null);
            }

            // Map to DTO
            var gameDto = MapToDto(game);

            // Cache the result
            _cache.Set(cacheKey, gameDto, TimeSpan.FromMinutes(30));

            _logger.LogDebug("Game {GameId} retrieved successfully", query.GameId);
            return Result.Success<GameDto?>(gameDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting game by ID {GameId}", query.GameId);
            return Result.Failure<GameDto?>($"Failed to get game: {ex.Message}");
        }
    }

    private GameDto MapToDto(Game game)
    {
        return new GameDto
        {
            GameId = game.GameID,
            GameName = game.GameName,
            GameDescription = game.GameDescription,
            ImageUrl = game.ImageUrl,
            ThumbnailUrl = game.ThumbnailUrl,
            ProviderName = game.Provider?.ProviderName ?? "Unknown",
            GameTypeName = game.GameType?.GameTypeName ?? "Unknown",
            IsActive = game.IsActive,
            IsMobile = game.IsMobile,
            IsDesktop = game.IsDesktop,
            HideInLobby = game.HideInLobby ?? false,
            GameOrder = game.GameOrder,
            MinBetAmount = game.MinBetAmount,
            RtpPercentage = game.RTPPercentage,
            ReleaseDate = game.ReleaseDate,
            UkCompliant = game.UKCompliant,
            JackpotContribution = game.JackpotContribution,
            CreatedDate = game.CreatedDate,
            UpdatedDate = game.UpdatedDate
        };
    }
}

/// <summary>
/// Search games query handler
/// </summary>
public class SearchGamesQueryHandler : IQueryHandler<SearchGamesQuery, PaginatedResponse<GameDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMemoryCache _cache;
    private readonly ILogger<SearchGamesQueryHandler> _logger;

    public SearchGamesQueryHandler(
        IUnitOfWork unitOfWork,
        IMemoryCache cache,
        ILogger<SearchGamesQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Result<PaginatedResponse<GameDto>>> HandleAsync(SearchGamesQuery query, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogDebug("Searching games with criteria: {SearchTerm}", query.SearchTerm);

            // Build cache key
            var cacheKey = $"games:search:{GetSearchCacheKey(query)}";
            
            // Check cache first
            if (_cache.TryGetValue(cacheKey, out PaginatedResponse<GameDto>? cachedResult))
            {
                _logger.LogDebug("Games search result found in cache");
                return Result.Success(cachedResult!);
            }

            // Build specifications
            var spec = BuildGameSearchSpecification(query);

            // Get from database
            var repository = _unitOfWork.GetRepository<IGameRepository>();
            var games = await repository.GetPagedAsync(spec, query.Page, query.PageSize, query.SortBy, query.SortDirection);

            // Map to DTOs
            var gameDtos = games.Items.Select(MapToDto).ToList();

            var result = new PaginatedResponse<GameDto>
            {
                Items = gameDtos,
                TotalCount = games.TotalCount,
                Page = games.Page,
                PageSize = games.PageSize
            };

            // Cache the result
            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(15));

            _logger.LogDebug("Found {Count} games matching search criteria", result.TotalCount);
            return Result.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching games");
            return Result.Failure<PaginatedResponse<GameDto>>($"Failed to search games: {ex.Message}");
        }
    }

    private ISpecification<Game> BuildGameSearchSpecification(SearchGamesQuery query)
    {
        var spec = new GameSpecification();

        if (!string.IsNullOrEmpty(query.SearchTerm))
        {
            spec = spec.And(new GameByNameSpecification(query.SearchTerm));
        }

        if (query.ProviderIds?.Any() == true)
        {
            spec = spec.And(new GameByProviderSpecification(query.ProviderIds));
        }

        if (query.GameTypeIds?.Any() == true)
        {
            spec = spec.And(new GameByTypeSpecification(query.GameTypeIds));
        }

        if (query.IsActive.HasValue)
        {
            spec = spec.And(new ActiveGameSpecification(query.IsActive.Value));
        }

        if (query.IsMobile.HasValue)
        {
            spec = spec.And(new MobileGameSpecification(query.IsMobile.Value));
        }

        if (query.IsDesktop.HasValue)
        {
            spec = spec.And(new DesktopGameSpecification(query.IsDesktop.Value));
        }

        if (query.MinBetAmountFrom.HasValue || query.MinBetAmountTo.HasValue)
        {
            spec = spec.And(new GameByBetRangeSpecification(query.MinBetAmountFrom, query.MinBetAmountTo));
        }

        if (query.RtpFrom.HasValue || query.RtpTo.HasValue)
        {
            spec = spec.And(new GameByRtpRangeSpecification(query.RtpFrom, query.RtpTo));
        }

        if (query.ReleaseDateFrom.HasValue || query.ReleaseDateTo.HasValue)
        {
            spec = spec.And(new GameByReleaseDateSpecification(query.ReleaseDateFrom, query.ReleaseDateTo));
        }

        if (query.UkCompliant.HasValue)
        {
            spec = spec.And(new UkCompliantGameSpecification(query.UkCompliant.Value));
        }

        return spec;
    }

    private string GetSearchCacheKey(SearchGamesQuery query)
    {
        var keyParts = new List<string>
        {
            query.SearchTerm ?? "null",
            string.Join(",", query.ProviderIds ?? new List<int>()),
            string.Join(",", query.GameTypeIds ?? new List<int>()),
            query.IsActive?.ToString() ?? "null",
            query.IsMobile?.ToString() ?? "null",
            query.IsDesktop?.ToString() ?? "null",
            query.MinBetAmountFrom?.ToString() ?? "null",
            query.MinBetAmountTo?.ToString() ?? "null",
            query.RtpFrom?.ToString() ?? "null",
            query.RtpTo?.ToString() ?? "null",
            query.ReleaseDateFrom?.ToString("yyyy-MM-dd") ?? "null",
            query.ReleaseDateTo?.ToString("yyyy-MM-dd") ?? "null",
            query.UkCompliant?.ToString() ?? "null",
            query.Page.ToString(),
            query.PageSize.ToString(),
            query.SortBy ?? "null",
            query.SortDirection ?? "null"
        };

        return string.Join(":", keyParts);
    }

    private GameDto MapToDto(Game game)
    {
        return new GameDto
        {
            GameId = game.GameID,
            GameName = game.GameName,
            GameDescription = game.GameDescription,
            ImageUrl = game.ImageUrl,
            ThumbnailUrl = game.ThumbnailUrl,
            ProviderName = game.Provider?.ProviderName ?? "Unknown",
            GameTypeName = game.GameType?.GameTypeName ?? "Unknown",
            IsActive = game.IsActive,
            IsMobile = game.IsMobile,
            IsDesktop = game.IsDesktop,
            HideInLobby = game.HideInLobby ?? false,
            GameOrder = game.GameOrder,
            MinBetAmount = game.MinBetAmount,
            RtpPercentage = game.RTPPercentage,
            ReleaseDate = game.ReleaseDate,
            UkCompliant = game.UKCompliant,
            JackpotContribution = game.JackpotContribution,
            CreatedDate = game.CreatedDate,
            UpdatedDate = game.UpdatedDate
        };
    }
}

/// <summary>
/// Get recommendations query handler
/// </summary>
public class GetRecommendationsQueryHandler : IQueryHandler<GetRecommendationsQuery, List<GameRecommendationDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRecommendationStrategyFactory _strategyFactory;
    private readonly IMemoryCache _cache;
    private readonly ILogger<GetRecommendationsQueryHandler> _logger;

    public GetRecommendationsQueryHandler(
        IUnitOfWork unitOfWork,
        IRecommendationStrategyFactory strategyFactory,
        IMemoryCache cache,
        ILogger<GetRecommendationsQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _strategyFactory = strategyFactory;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Result<List<GameRecommendationDto>>> HandleAsync(GetRecommendationsQuery query, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogDebug("Getting recommendations for player {PlayerId} using algorithm {Algorithm}", 
                query.PlayerId, query.Algorithm);

            // Check cache first
            var cacheKey = $"recommendations:{query.PlayerId}:{query.Algorithm}:{query.Context}:{query.Count}";
            if (_cache.TryGetValue(cacheKey, out List<GameRecommendationDto>? cachedRecommendations))
            {
                _logger.LogDebug("Recommendations found in cache for player {PlayerId}", query.PlayerId);
                return Result.Success(cachedRecommendations!);
            }

            // Get player features
            var playerFeaturesRepo = _unitOfWork.GetRepository<IPlayerFeatureRepository>();
            var playerFeatureEntity = await playerFeaturesRepo.GetByPlayerIdAsync(query.PlayerId);

            if (playerFeatureEntity == null)
            {
                _logger.LogWarning("Player features not found for player {PlayerId}", query.PlayerId);
                return Result.Success(new List<GameRecommendationDto>());
            }

            // Convert player features entity to model
            var playerFeatures = new PlayerFeatures
            {
                PlayerId = playerFeatureEntity.PlayerId,
                Age = playerFeatureEntity.Age,
                Country = playerFeatureEntity.Country,
                RiskLevel = playerFeatureEntity.RiskLevel,
                VipLevel = playerFeatureEntity.VIPLevel,
                TotalDeposits = playerFeatureEntity.TotalDeposits,
                TotalBets = playerFeatureEntity.TotalBets,
                TotalWins = playerFeatureEntity.TotalWins,
                SessionCount = playerFeatureEntity.SessionCount,
                AverageSessionDuration = playerFeatureEntity.AverageSessionDuration,
                LastPlayDate = playerFeatureEntity.LastPlayDate,
                DaysSinceLastPlay = playerFeatureEntity.DaysSinceLastPlay,
                PreferredGameTypes = System.Text.Json.JsonSerializer.Deserialize<List<int>>(playerFeatureEntity.PreferredGameTypes) ?? new List<int>(),
                PreferredProviders = System.Text.Json.JsonSerializer.Deserialize<List<int>>(playerFeatureEntity.PreferredProviders) ?? new List<int>(),
                PreferredVolatility = playerFeatureEntity.PreferredVolatility,
                PreferredRTP = playerFeatureEntity.PreferredRTP,
                AverageBetSize = playerFeatureEntity.AverageBetSize,
                PlayStyle = playerFeatureEntity.PlayStyle,
                WinRate = playerFeatureEntity.WinRate,
                ConsecutiveLosses = playerFeatureEntity.ConsecutiveLosses,
                IsNewPlayer = playerFeatureEntity.IsNewPlayer,
                CustomFeatures = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, double>>(playerFeatureEntity.CustomFeatures) ?? new Dictionary<string, double>()
            };

            // Get game features
            var gameFeaturesRepo = _unitOfWork.GetRepository<IGameFeatureRepository>();
            var gameFeatureEntities = await gameFeaturesRepo.GetAllAsync();

            // Convert game features entities to models
            var gameFeatures = gameFeatureEntities.Select(gfe => new GameFeatures
            {
                GameId = gfe.GameId,
                GameName = gfe.GameName,
                ProviderId = gfe.ProviderId,
                GameTypeId = gfe.GameTypeId,
                VolatilityId = gfe.VolatilityId,
                AverageRTP = gfe.AverageRTP,
                MinBetAmount = gfe.MinBetAmount,
                MaxBetAmount = gfe.MaxBetAmount,
                PopularityScore = gfe.PopularityScore,
                RevenueScore = gfe.RevenueScore,
                Features = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, double>>(gfe.Features) ?? new Dictionary<string, double>()
            }).ToList();

            // Filter excluded games
            if (query.ExcludeGameIds?.Any() == true)
            {
                gameFeatures = gameFeatures.Where(gf => !query.ExcludeGameIds.Contains((int)gf.GameId)).ToList();
            }

            // Get recommendation strategy
            var algorithm = query.Algorithm ?? "CollaborativeFiltering";
            var strategy = _strategyFactory.CreateStrategy(algorithm);

            // Create recommendation request
            var request = new RecommendationRequest
            {
                PlayerId = query.PlayerId,
                Count = query.Count,
                Context = query.Context,
                Algorithm = algorithm,
                Parameters = query.Parameters ?? new Dictionary<string, object>()
            };

            // Generate recommendations
            var recommendations = await strategy.GenerateRecommendationsAsync(
                request, playerFeatures, gameFeatures, cancellationToken);

            // Cache the result
            _cache.Set(cacheKey, recommendations, TimeSpan.FromMinutes(5));

            _logger.LogDebug("Generated {Count} recommendations for player {PlayerId}", 
                recommendations.Count, query.PlayerId);
            
            return Result.Success(recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendations for player {PlayerId}", query.PlayerId);
            return Result.Failure<List<GameRecommendationDto>>($"Failed to get recommendations: {ex.Message}");
        }
    }
}
