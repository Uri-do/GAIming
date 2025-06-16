using GAIming.Core.Entities;
using GAIming.Core.Interfaces;
using GAIming.Core.Models;
using GAIming.Core.Strategies;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace GAIming.Infrastructure.Strategies;

/// <summary>
/// Recommendation strategy factory implementation
/// </summary>
public class RecommendationStrategyFactory : IRecommendationStrategyFactory
{
    private readonly IServiceProvider _serviceProvider;
    private readonly Dictionary<string, Type> _strategies;
    private readonly ILogger<RecommendationStrategyFactory> _logger;

    public RecommendationStrategyFactory(IServiceProvider serviceProvider, ILogger<RecommendationStrategyFactory> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _strategies = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase);
        
        // Register default strategies
        RegisterDefaultStrategies();
    }

    public IRecommendationStrategy CreateStrategy(string strategyName)
    {
        try
        {
            if (!_strategies.TryGetValue(strategyName, out var strategyType))
            {
                _logger.LogWarning("Strategy {StrategyName} not found, falling back to CollaborativeFiltering", strategyName);
                strategyType = _strategies["CollaborativeFiltering"];
            }

            var strategy = (IRecommendationStrategy)_serviceProvider.GetRequiredService(strategyType);
            _logger.LogDebug("Created strategy {StrategyName}", strategy.Name);
            
            return strategy;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating strategy {StrategyName}", strategyName);
            throw new InvalidOperationException($"Failed to create strategy '{strategyName}': {ex.Message}", ex);
        }
    }

    public IEnumerable<IRecommendationStrategy> GetAllStrategies()
    {
        var strategies = new List<IRecommendationStrategy>();
        
        foreach (var strategyType in _strategies.Values.Distinct())
        {
            try
            {
                var strategy = (IRecommendationStrategy)_serviceProvider.GetRequiredService(strategyType);
                strategies.Add(strategy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating strategy of type {StrategyType}", strategyType.Name);
            }
        }
        
        return strategies;
    }

    public T GetStrategy<T>() where T : class, IRecommendationStrategy
    {
        try
        {
            return _serviceProvider.GetRequiredService<T>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting strategy of type {StrategyType}", typeof(T).Name);
            throw new InvalidOperationException($"Failed to get strategy of type '{typeof(T).Name}': {ex.Message}", ex);
        }
    }

    public void RegisterStrategy<T>(T strategy) where T : class, IRecommendationStrategy
    {
        if (strategy == null)
            throw new ArgumentNullException(nameof(strategy));

        _strategies[strategy.Name] = typeof(T);
        _logger.LogInformation("Registered strategy {StrategyName} of type {StrategyType}", strategy.Name, typeof(T).Name);
    }

    private void RegisterDefaultStrategies()
    {
        _strategies["CollaborativeFiltering"] = typeof(CollaborativeFilteringStrategy);
        _strategies["ContentBased"] = typeof(ContentBasedStrategy);
        _strategies["Hybrid"] = typeof(HybridStrategy);
        _strategies["PopularityBased"] = typeof(PopularityBasedStrategy);
        _strategies["Bandit"] = typeof(BanditStrategy);
        _strategies["DeepLearning"] = typeof(DeepLearningStrategy);
        
        _logger.LogInformation("Registered {Count} default strategies", _strategies.Count);
    }
}

/// <summary>
/// Strategy selector implementation
/// </summary>
public class StrategySelector : IStrategySelector
{
    private readonly IRecommendationStrategyFactory _strategyFactory;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<StrategySelector> _logger;

    public StrategySelector(
        IRecommendationStrategyFactory strategyFactory,
        IServiceProvider serviceProvider,
        ILogger<StrategySelector> logger)
    {
        _strategyFactory = strategyFactory;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task<IRecommendationStrategy> SelectStrategyAsync(long playerId, string context, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogDebug("Selecting strategy for player {PlayerId} in context {Context}", playerId, context);

            // Get player features to determine best strategy
            using var scope = _serviceProvider.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var playerFeaturesRepo = unitOfWork.GetRepository<IPlayerFeatureRepository>();
            var playerFeatureEntity = await playerFeaturesRepo.GetByPlayerIdAsync(playerId);

            if (playerFeatureEntity == null)
            {
                _logger.LogDebug("No player features found for player {PlayerId}, using default strategy", playerId);
                return _strategyFactory.CreateStrategy("CollaborativeFiltering");
            }

            // Convert entity to model
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

            // Strategy selection logic based on player characteristics
            var strategy = SelectStrategyBasedOnPlayerProfile(playerFeatures, context);
            
            _logger.LogDebug("Selected strategy {StrategyName} for player {PlayerId}", strategy.Name, playerId);
            return strategy;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error selecting strategy for player {PlayerId}", playerId);
            // Fallback to default strategy
            return _strategyFactory.CreateStrategy("CollaborativeFiltering");
        }
    }

    public async Task<IRecommendationStrategy> SelectStrategyForABTestAsync(long playerId, string experimentName, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogDebug("Selecting strategy for A/B test {ExperimentName} for player {PlayerId}", experimentName, playerId);

            using var scope = _serviceProvider.CreateScope();
            var abTestService = scope.ServiceProvider.GetRequiredService<IABTestingService>();
            
            // Get A/B test variant for player
            var variant = await abTestService.GetPlayerVariantAsync(playerId, experimentName);
            
            if (variant != null && !string.IsNullOrEmpty(variant.Algorithm))
            {
                var strategy = _strategyFactory.CreateStrategy(variant.Algorithm);
                _logger.LogDebug("Selected A/B test strategy {StrategyName} for player {PlayerId}", strategy.Name, playerId);
                return strategy;
            }

            // Fallback to regular strategy selection
            return await SelectStrategyAsync(playerId, "abtest", cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error selecting A/B test strategy for player {PlayerId}", playerId);
            // Fallback to default strategy
            return _strategyFactory.CreateStrategy("CollaborativeFiltering");
        }
    }

    public async Task<List<StrategyRanking>> GetStrategyRankingAsync(DateTime startDate, DateTime endDate, string? context = null, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogDebug("Getting strategy ranking from {StartDate} to {EndDate}", startDate, endDate);

            var rankings = new List<StrategyRanking>();
            var strategies = _strategyFactory.GetAllStrategies();

            foreach (var strategy in strategies)
            {
                try
                {
                    var metrics = await strategy.GetPerformanceMetricsAsync(startDate, endDate, cancellationToken);
                    
                    var ranking = new StrategyRanking
                    {
                        StrategyName = strategy.Name,
                        OverallScore = CalculateOverallScore(metrics),
                        PerformanceScore = CalculatePerformanceScore(metrics),
                        EfficiencyScore = CalculateEfficiencyScore(metrics),
                        ReliabilityScore = CalculateReliabilityScore(metrics),
                        Context = context,
                        RankingDate = DateTime.UtcNow
                    };

                    rankings.Add(ranking);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error getting performance metrics for strategy {StrategyName}", strategy.Name);
                }
            }

            // Sort by overall score and assign ranks
            rankings = rankings.OrderByDescending(r => r.OverallScore).ToList();
            for (int i = 0; i < rankings.Count; i++)
            {
                rankings[i].Rank = i + 1;
            }

            _logger.LogDebug("Generated ranking for {Count} strategies", rankings.Count);
            return rankings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting strategy ranking");
            return new List<StrategyRanking>();
        }
    }

    private IRecommendationStrategy SelectStrategyBasedOnPlayerProfile(PlayerFeatures playerFeatures, string context)
    {
        // New players (cold start) - use content-based or popularity
        if (playerFeatures.TotalGamesPlayed < 5)
        {
            return _strategyFactory.CreateStrategy("ContentBased");
        }

        // High-activity players - use collaborative filtering
        if (playerFeatures.TotalGamesPlayed > 50 && playerFeatures.SessionsCount > 20)
        {
            return _strategyFactory.CreateStrategy("CollaborativeFiltering");
        }

        // Players with diverse preferences - use hybrid
        if (playerFeatures.PreferredGameTypes?.Split(',').Length > 3)
        {
            return _strategyFactory.CreateStrategy("Hybrid");
        }

        // Context-specific selection
        return context.ToLower() switch
        {
            "lobby" => _strategyFactory.CreateStrategy("Hybrid"),
            "game_end" => _strategyFactory.CreateStrategy("ContentBased"),
            "promotion" => _strategyFactory.CreateStrategy("PopularityBased"),
            _ => _strategyFactory.CreateStrategy("CollaborativeFiltering")
        };
    }

    private double CalculateOverallScore(StrategyPerformanceMetrics metrics)
    {
        // Weighted combination of different metrics
        var conversionWeight = 0.4;
        var ctrWeight = 0.3;
        var revenueWeight = 0.2;
        var diversityWeight = 0.1;

        return (metrics.ConversionRate * conversionWeight) +
               (metrics.ClickThroughRate * ctrWeight) +
               (Math.Min(metrics.RevenuePerRecommendation / 10, 1) * revenueWeight) +
               (metrics.Diversity * diversityWeight);
    }

    private double CalculatePerformanceScore(StrategyPerformanceMetrics metrics)
    {
        return (metrics.ConversionRate + metrics.ClickThroughRate + metrics.F1Score) / 3;
    }

    private double CalculateEfficiencyScore(StrategyPerformanceMetrics metrics)
    {
        // Lower response time is better
        var responseTimeScore = Math.Max(0, 1 - (metrics.AverageResponseTime.TotalMilliseconds / 1000));
        return (responseTimeScore + metrics.Coverage) / 2;
    }

    private double CalculateReliabilityScore(StrategyPerformanceMetrics metrics)
    {
        // Based on consistency and error rates
        var successRate = metrics.TotalRecommendations > 0 ? 
            (double)metrics.ClickedRecommendations / metrics.TotalRecommendations : 0;
        
        return (successRate + metrics.Precision + metrics.Recall) / 3;
    }
}

// Strategy implementations will be added in separate files
public class CollaborativeFilteringStrategy : ICollaborativeFilteringStrategy
{
    public string Name => "CollaborativeFiltering";
    public string Description => "Collaborative filtering based on user-item interactions";
    public string Version => "1.0";
    public bool SupportsRealTime => true;
    public bool RequiresTraining => true;

    // Implementation methods will be added
    public Task<List<GameRecommendationDto>> GenerateRecommendationsAsync(RecommendationRequest request, PlayerFeatures playerFeatures, List<GameFeatures> gameFeatures, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<double> CalculateScoreAsync(long playerId, int gameId, PlayerFeatures playerFeatures, GameFeatures gameFeatures, Dictionary<string, object>? context = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<bool> ValidateConfigurationAsync(Dictionary<string, object>? configuration = null)
    {
        return Task.FromResult(true);
    }

    public Task<StrategyPerformanceMetrics> GetPerformanceMetricsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<List<SimilarPlayer>> FindSimilarPlayersAsync(long playerId, int count = 10, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<double> CalculatePlayerSimilarityAsync(long playerId1, long playerId2, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<Dictionary<long, Dictionary<int, double>>> GetInteractionMatrixAsync(List<long> playerIds, List<int> gameIds, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}

// Additional strategy implementations would follow similar pattern
public class ContentBasedStrategy : IContentBasedStrategy
{
    public string Name => "ContentBased";
    public string Description => "Content-based filtering using game features";
    public string Version => "1.0";
    public bool SupportsRealTime => true;
    public bool RequiresTraining => false;

    // Implementation methods will be added
    public Task<List<GameRecommendationDto>> GenerateRecommendationsAsync(RecommendationRequest request, PlayerFeatures playerFeatures, List<GameFeatures> gameFeatures, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<double> CalculateScoreAsync(long playerId, int gameId, PlayerFeatures playerFeatures, GameFeatures gameFeatures, Dictionary<string, object>? context = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<bool> ValidateConfigurationAsync(Dictionary<string, object>? configuration = null)
    {
        return Task.FromResult(true);
    }

    public Task<StrategyPerformanceMetrics> GetPerformanceMetricsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<List<SimilarGame>> FindSimilarGamesAsync(int gameId, int count = 10, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<double> CalculateGameSimilarityAsync(int gameId1, int gameId2, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<PlayerProfile> BuildPlayerProfileAsync(long playerId, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}

// Placeholder implementations for other strategies
public class HybridStrategy : IHybridStrategy
{
    public string Name => "Hybrid";
    public string Description => "Hybrid approach combining multiple strategies";
    public string Version => "1.0";
    public bool SupportsRealTime => true;
    public bool RequiresTraining => true;
    public Dictionary<IRecommendationStrategy, double> ComponentStrategies { get; } = new();

    public Task<List<GameRecommendationDto>> GenerateRecommendationsAsync(RecommendationRequest request, PlayerFeatures playerFeatures, List<GameFeatures> gameFeatures, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<double> CalculateScoreAsync(long playerId, int gameId, PlayerFeatures playerFeatures, GameFeatures gameFeatures, Dictionary<string, object>? context = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<bool> ValidateConfigurationAsync(Dictionary<string, object>? configuration = null)
    {
        return Task.FromResult(true);
    }

    public Task<StrategyPerformanceMetrics> GetPerformanceMetricsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<List<GameRecommendationDto>> CombineRecommendationsAsync(Dictionary<IRecommendationStrategy, List<GameRecommendationDto>> strategyResults, RecommendationRequest request, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task OptimizeWeightsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}

public class PopularityBasedStrategy : IRecommendationStrategy
{
    public string Name => "PopularityBased";
    public string Description => "Popularity-based recommendations";
    public string Version => "1.0";
    public bool SupportsRealTime => true;
    public bool RequiresTraining => false;

    public Task<List<GameRecommendationDto>> GenerateRecommendationsAsync(RecommendationRequest request, PlayerFeatures playerFeatures, List<GameFeatures> gameFeatures, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<double> CalculateScoreAsync(long playerId, int gameId, PlayerFeatures playerFeatures, GameFeatures gameFeatures, Dictionary<string, object>? context = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<bool> ValidateConfigurationAsync(Dictionary<string, object>? configuration = null)
    {
        return Task.FromResult(true);
    }

    public Task<StrategyPerformanceMetrics> GetPerformanceMetricsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}

public class BanditStrategy : IBanditStrategy
{
    public string Name => "Bandit";
    public string Description => "Multi-armed bandit algorithm";
    public string Version => "1.0";
    public bool SupportsRealTime => true;
    public bool RequiresTraining => true;

    public Task<List<GameRecommendationDto>> GenerateRecommendationsAsync(RecommendationRequest request, PlayerFeatures playerFeatures, List<GameFeatures> gameFeatures, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<double> CalculateScoreAsync(long playerId, int gameId, PlayerFeatures playerFeatures, GameFeatures gameFeatures, Dictionary<string, object>? context = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<bool> ValidateConfigurationAsync(Dictionary<string, object>? configuration = null)
    {
        return Task.FromResult(true);
    }

    public Task<StrategyPerformanceMetrics> GetPerformanceMetricsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task UpdateModelAsync(long playerId, int gameId, double reward, Dictionary<string, object>? context = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public double GetExplorationRate(long playerId)
    {
        return 0.1; // Default exploration rate
    }

    public Task<int> SelectArmAsync(long playerId, List<int> availableGameIds, Dictionary<string, object>? context = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}

public class DeepLearningStrategy : IDeepLearningStrategy
{
    public string Name => "DeepLearning";
    public string Description => "Deep learning neural network recommendations";
    public string Version => "1.0";
    public bool SupportsRealTime => false;
    public bool RequiresTraining => true;
    public string ModelPath => "models/recommendation_model.pb";

    public Task<List<GameRecommendationDto>> GenerateRecommendationsAsync(RecommendationRequest request, PlayerFeatures playerFeatures, List<GameFeatures> gameFeatures, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<double> CalculateScoreAsync(long playerId, int gameId, PlayerFeatures playerFeatures, GameFeatures gameFeatures, Dictionary<string, object>? context = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<bool> ValidateConfigurationAsync(Dictionary<string, object>? configuration = null)
    {
        return Task.FromResult(true);
    }

    public Task<StrategyPerformanceMetrics> GetPerformanceMetricsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<double[]> PredictAsync(double[] features, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<double[][]> BatchPredictAsync(double[][] features, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task LoadModelAsync(string modelPath, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task WarmUpModelAsync(CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}
