using GAIming.Core.Models;
using GAIming.Core.Entities;

namespace GAIming.Core.Strategies;

/// <summary>
/// Base recommendation strategy interface
/// </summary>
public interface IRecommendationStrategy
{
    /// <summary>
    /// Strategy name/identifier
    /// </summary>
    string Name { get; }

    /// <summary>
    /// Strategy description
    /// </summary>
    string Description { get; }

    /// <summary>
    /// Strategy version
    /// </summary>
    string Version { get; }

    /// <summary>
    /// Whether strategy supports real-time recommendations
    /// </summary>
    bool SupportsRealTime { get; }

    /// <summary>
    /// Whether strategy requires training
    /// </summary>
    bool RequiresTraining { get; }

    /// <summary>
    /// Generate recommendations for a player
    /// </summary>
    Task<List<GameRecommendationDto>> GenerateRecommendationsAsync(
        RecommendationRequest request,
        PlayerFeatures playerFeatures,
        List<GameFeatures> gameFeatures,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculate recommendation score for a specific game
    /// </summary>
    Task<double> CalculateScoreAsync(
        long playerId,
        int gameId,
        PlayerFeatures playerFeatures,
        GameFeatures gameFeatures,
        Dictionary<string, object>? context = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validate strategy configuration
    /// </summary>
    Task<bool> ValidateConfigurationAsync(Dictionary<string, object>? configuration = null);

    /// <summary>
    /// Get strategy performance metrics
    /// </summary>
    Task<StrategyPerformanceMetrics> GetPerformanceMetricsAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Collaborative filtering strategy interface
/// </summary>
public interface ICollaborativeFilteringStrategy : IRecommendationStrategy
{
    /// <summary>
    /// Find similar players
    /// </summary>
    Task<List<SimilarPlayer>> FindSimilarPlayersAsync(
        long playerId,
        int count = 10,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculate player similarity score
    /// </summary>
    Task<double> CalculatePlayerSimilarityAsync(
        long playerId1,
        long playerId2,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get player-item interaction matrix
    /// </summary>
    Task<Dictionary<long, Dictionary<int, double>>> GetInteractionMatrixAsync(
        List<long> playerIds,
        List<int> gameIds,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Content-based filtering strategy interface
/// </summary>
public interface IContentBasedStrategy : IRecommendationStrategy
{
    /// <summary>
    /// Find similar games
    /// </summary>
    Task<List<SimilarGame>> FindSimilarGamesAsync(
        int gameId,
        int count = 10,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculate game similarity score
    /// </summary>
    Task<double> CalculateGameSimilarityAsync(
        int gameId1,
        int gameId2,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Build player profile from interaction history
    /// </summary>
    Task<PlayerProfile> BuildPlayerProfileAsync(
        long playerId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Hybrid strategy interface combining multiple approaches
/// </summary>
public interface IHybridStrategy : IRecommendationStrategy
{
    /// <summary>
    /// Component strategies with weights
    /// </summary>
    Dictionary<IRecommendationStrategy, double> ComponentStrategies { get; }

    /// <summary>
    /// Combine recommendations from multiple strategies
    /// </summary>
    Task<List<GameRecommendationDto>> CombineRecommendationsAsync(
        Dictionary<IRecommendationStrategy, List<GameRecommendationDto>> strategyResults,
        RecommendationRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Optimize strategy weights based on performance
    /// </summary>
    Task OptimizeWeightsAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Bandit algorithm strategy interface
/// </summary>
public interface IBanditStrategy : IRecommendationStrategy
{
    /// <summary>
    /// Update bandit model with feedback
    /// </summary>
    Task UpdateModelAsync(
        long playerId,
        int gameId,
        double reward,
        Dictionary<string, object>? context = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get exploration rate
    /// </summary>
    double GetExplorationRate(long playerId);

    /// <summary>
    /// Select arm (game) using bandit algorithm
    /// </summary>
    Task<int> SelectArmAsync(
        long playerId,
        List<int> availableGameIds,
        Dictionary<string, object>? context = null,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Deep learning strategy interface
/// </summary>
public interface IDeepLearningStrategy : IRecommendationStrategy
{
    /// <summary>
    /// Model path or identifier
    /// </summary>
    string ModelPath { get; }

    /// <summary>
    /// Predict using neural network model
    /// </summary>
    Task<double[]> PredictAsync(
        double[] features,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Batch predict for multiple inputs
    /// </summary>
    Task<double[][]> BatchPredictAsync(
        double[][] features,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Load model from storage
    /// </summary>
    Task LoadModelAsync(string modelPath, CancellationToken cancellationToken = default);

    /// <summary>
    /// Warm up model for faster inference
    /// </summary>
    Task WarmUpModelAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Strategy factory interface
/// </summary>
public interface IRecommendationStrategyFactory
{
    /// <summary>
    /// Create strategy by name
    /// </summary>
    IRecommendationStrategy CreateStrategy(string strategyName);

    /// <summary>
    /// Get all available strategies
    /// </summary>
    IEnumerable<IRecommendationStrategy> GetAllStrategies();

    /// <summary>
    /// Get strategy by type
    /// </summary>
    T GetStrategy<T>() where T : class, IRecommendationStrategy;

    /// <summary>
    /// Register strategy
    /// </summary>
    void RegisterStrategy<T>(T strategy) where T : class, IRecommendationStrategy;
}

/// <summary>
/// Strategy selector interface for choosing optimal strategy
/// </summary>
public interface IStrategySelector
{
    /// <summary>
    /// Select best strategy for a player
    /// </summary>
    Task<IRecommendationStrategy> SelectStrategyAsync(
        long playerId,
        string context,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Select strategy based on A/B test
    /// </summary>
    Task<IRecommendationStrategy> SelectStrategyForABTestAsync(
        long playerId,
        string experimentName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get strategy performance ranking
    /// </summary>
    Task<List<StrategyRanking>> GetStrategyRankingAsync(
        DateTime startDate,
        DateTime endDate,
        string? context = null,
        CancellationToken cancellationToken = default);
}

// Supporting models

/// <summary>
/// Similar player model
/// </summary>
public class SimilarPlayer
{
    public long PlayerId { get; set; }
    public double SimilarityScore { get; set; }
    public List<string> CommonInterests { get; set; } = new();
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Similar game model
/// </summary>
public class SimilarGame
{
    public int GameId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public double SimilarityScore { get; set; }
    public List<string> CommonFeatures { get; set; } = new();
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Player profile model
/// </summary>
public class PlayerProfile
{
    public long PlayerId { get; set; }
    public Dictionary<string, double> GameTypePreferences { get; set; } = new();
    public Dictionary<string, double> ProviderPreferences { get; set; } = new();
    public Dictionary<string, double> FeaturePreferences { get; set; } = new();
    public double PreferredVolatility { get; set; }
    public double PreferredRTP { get; set; }
    public decimal PreferredBetSize { get; set; }
    public List<string> PreferredTags { get; set; } = new();
    public DateTime LastUpdated { get; set; }
}

/// <summary>
/// Strategy performance metrics
/// </summary>
public class StrategyPerformanceMetrics
{
    public string StrategyName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalRecommendations { get; set; }
    public int ClickedRecommendations { get; set; }
    public int PlayedRecommendations { get; set; }
    public double ClickThroughRate { get; set; }
    public double ConversionRate { get; set; }
    public double AverageScore { get; set; }
    public decimal Revenue { get; set; }
    public decimal RevenuePerRecommendation { get; set; }
    public double Precision { get; set; }
    public double Recall { get; set; }
    public double F1Score { get; set; }
    public double NDCG { get; set; }
    public double Coverage { get; set; }
    public double Diversity { get; set; }
    public double Novelty { get; set; }
    public TimeSpan AverageResponseTime { get; set; }
    public Dictionary<string, double> CustomMetrics { get; set; } = new();
}

/// <summary>
/// Strategy ranking model
/// </summary>
public class StrategyRanking
{
    public string StrategyName { get; set; } = string.Empty;
    public int Rank { get; set; }
    public double OverallScore { get; set; }
    public double PerformanceScore { get; set; }
    public double EfficiencyScore { get; set; }
    public double ReliabilityScore { get; set; }
    public string? Context { get; set; }
    public DateTime RankingDate { get; set; }
}

/// <summary>
/// Strategy configuration model
/// </summary>
public class StrategyConfiguration
{
    public string StrategyName { get; set; } = string.Empty;
    public Dictionary<string, object> Parameters { get; set; } = new();
    public Dictionary<string, object> Hyperparameters { get; set; } = new();
    public bool IsEnabled { get; set; } = true;
    public double Weight { get; set; } = 1.0;
    public int Priority { get; set; } = 0;
    public List<string> SupportedContexts { get; set; } = new();
    public Dictionary<string, object> Constraints { get; set; } = new();
}
