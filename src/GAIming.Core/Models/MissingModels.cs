namespace GAIming.Core.Models;

/// <summary>
/// Safe gaming limits model
/// </summary>
public class SafeGamingLimits
{
    public long PlayerId { get; set; }
    public decimal? DailyDepositLimit { get; set; }
    public decimal? WeeklyDepositLimit { get; set; }
    public decimal? MonthlyDepositLimit { get; set; }
    public decimal? DailyLossLimit { get; set; }
    public decimal? WeeklyLossLimit { get; set; }
    public decimal? MonthlyLossLimit { get; set; }
    public decimal? DailyBetLimit { get; set; }
    public decimal? WeeklyBetLimit { get; set; }
    public decimal? MonthlyBetLimit { get; set; }
    public TimeSpan? SessionTimeLimit { get; set; }
    public TimeSpan? DailyTimeLimit { get; set; }
    public TimeSpan? DailySessionLimit { get; set; }
    public TimeSpan? WeeklySessionLimit { get; set; }
    public int MaxVolatilityLevel { get; set; }
    public bool ExcludeJackpotGames { get; set; }
    public List<int> ExcludedGameTypes { get; set; } = new();
    public List<int> ExcludedProviders { get; set; } = new();
    public DateTime? CoolingOffPeriod { get; set; }
    public DateTime? SelfExclusionEnd { get; set; }
    public DateTime EffectiveDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

/// <summary>
/// Recommendation feedback model
/// </summary>
public class RecommendationFeedback
{
    public long RecommendationId { get; set; }
    public long PlayerId { get; set; }
    public string FeedbackType { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comments { get; set; }
    public DateTime FeedbackDate { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// A/B test variant model
/// </summary>
public class ABTestVariant
{
    public string Name { get; set; } = string.Empty;
    public string Algorithm { get; set; } = string.Empty;
    public double TrafficPercentage { get; set; }
    public Dictionary<string, object>? Parameters { get; set; }
}

/// <summary>
/// A/B test results model
/// </summary>
public class ABTestResults
{
    public string ExperimentName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<ABTestVariantResult> VariantResults { get; set; } = new();
    public string? WinningVariant { get; set; }
    public double? ConfidenceLevel { get; set; }
}



/// <summary>
/// A/B test variant result model
/// </summary>
public class ABTestVariantResult
{
    public string VariantName { get; set; } = string.Empty;
    public int ParticipantCount { get; set; }
    public double ConversionRate { get; set; }
    public double ClickThroughRate { get; set; }
    public decimal Revenue { get; set; }
    public double ConfidenceInterval { get; set; }
}

/// <summary>
/// Recommendation metrics model
/// </summary>
public class RecommendationMetrics
{
    public string Algorithm { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalRecommendations { get; set; }
    public int ClickedRecommendations { get; set; }
    public int PlayedRecommendations { get; set; }
    public double ClickThroughRate { get; set; }
    public double ConversionRate { get; set; }
    public decimal Revenue { get; set; }
}

/// <summary>
/// Diversity metrics model
/// </summary>
public class DiversityMetrics
{
    public double GameTypeDiversity { get; set; }
    public double ProviderDiversity { get; set; }
    public double VolatilityDiversity { get; set; }
    public double ThemeDiversity { get; set; }
    public double OverallDiversity { get; set; }
}

/// <summary>
/// Recommendation analytics model
/// </summary>
public class RecommendationAnalytics
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<RecommendationMetrics> AlgorithmMetrics { get; set; } = new();
    public DiversityMetrics Diversity { get; set; } = new();
    public List<ABTestResults> ABTestResults { get; set; } = new();
}

/// <summary>
/// Player segment info model
/// </summary>
public class PlayerSegmentInfo
{
    public string SegmentName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PlayerCount { get; set; }
    public decimal AverageRevenue { get; set; }
    public double AverageSessionTime { get; set; }
    public List<string> PreferredGameTypes { get; set; } = new();
}

/// <summary>
/// Players overview analytics model
/// </summary>
public class PlayersOverviewAnalytics
{
    public int TotalPlayers { get; set; }
    public int ActivePlayers { get; set; }
    public int NewPlayers { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AverageSessionTime { get; set; }
    public List<PlayerSegmentInfo> Segments { get; set; } = new();
}

/// <summary>
/// Cohort analysis model
/// </summary>
public class CohortAnalysis
{
    public DateTime CohortDate { get; set; }
    public int InitialSize { get; set; }
    public List<CohortData> RetentionData { get; set; } = new();
}

/// <summary>
/// Cohort data model
/// </summary>
public class CohortData
{
    public int Period { get; set; }
    public int ActivePlayers { get; set; }
    public double RetentionRate { get; set; }
    public decimal Revenue { get; set; }
}

/// <summary>
/// Cohort summary model
/// </summary>
public class CohortSummary
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<CohortData> Cohorts { get; set; } = new();
}

/// <summary>
/// Player overview stats model
/// </summary>
public class PlayerOverviewStats
{
    public long PlayerId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int TotalSessions { get; set; }
    public TimeSpan TotalPlayTime { get; set; }
    public decimal TotalBets { get; set; }
    public decimal TotalWins { get; set; }
    public decimal NetPosition { get; set; }
    public int FavoriteGameId { get; set; }
    public string FavoriteGameName { get; set; } = string.Empty;
}

/// <summary>
/// Player recommendation stats model
/// </summary>
public class PlayerRecommendationStats
{
    public int TotalRecommendations { get; set; }
    public int ClickedRecommendations { get; set; }
    public int PlayedRecommendations { get; set; }
    public double ClickThroughRate { get; set; }
    public double ConversionRate { get; set; }
    public string PreferredAlgorithm { get; set; } = string.Empty;
}

/// <summary>
/// Player behavior summary model
/// </summary>
public class PlayerBehaviorSummary
{
    public long PlayerId { get; set; }
    public string BehaviorType { get; set; } = string.Empty;
    public double Score { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; }
}

/// <summary>
/// Player activity trend model
/// </summary>
public class PlayerActivityTrend
{
    public DateTime Date { get; set; }
    public int ActivePlayers { get; set; }
    public int NewPlayers { get; set; }
    public decimal Revenue { get; set; }
    public double AverageSessionTime { get; set; }
}

/// <summary>
/// Session patterns model
/// </summary>
public class SessionPatterns
{
    public TimeSpan AverageSessionLength { get; set; }
    public int AverageSessionsPerDay { get; set; }
    public List<int> PreferredHours { get; set; } = new();
    public List<string> PreferredDays { get; set; } = new();
}

/// <summary>
/// Betting patterns model
/// </summary>
public class BettingPatterns
{
    public decimal AverageBetSize { get; set; }
    public decimal MaxBetSize { get; set; }
    public decimal MinBetSize { get; set; }
    public string PreferredVolatility { get; set; } = string.Empty;
    public List<string> PreferredGameTypes { get; set; } = new();
}

/// <summary>
/// Game preferences model
/// </summary>
public class GamePreferences
{
    public List<string> PreferredGameTypes { get; set; } = new();
    public List<string> PreferredProviders { get; set; } = new();
    public List<string> PreferredThemes { get; set; } = new();
    public string PreferredVolatility { get; set; } = string.Empty;
    public decimal PreferredBetRange { get; set; }
}

/// <summary>
/// Behavior insight model
/// </summary>
public class BehaviorInsight
{
    public string InsightType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public string Recommendation { get; set; } = string.Empty;
}

/// <summary>
/// Behavior alert model
/// </summary>
public class BehaviorAlert
{
    public string AlertType { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime AlertDate { get; set; }
    public bool IsResolved { get; set; }
}

/// <summary>
/// Algorithm performance model
/// </summary>
public class AlgorithmPerformance
{
    public string Algorithm { get; set; } = string.Empty;
    public double ClickThroughRate { get; set; }
    public double ConversionRate { get; set; }
    public decimal Revenue { get; set; }
    public double Precision { get; set; }
    public double Recall { get; set; }
    public double F1Score { get; set; }
}

/// <summary>
/// Category performance model
/// </summary>
public class CategoryPerformance
{
    public string Category { get; set; } = string.Empty;
    public int RecommendationCount { get; set; }
    public double ClickThroughRate { get; set; }
    public double ConversionRate { get; set; }
    public decimal Revenue { get; set; }
}

/// <summary>
/// Recommendation trend model
/// </summary>
public class RecommendationTrend
{
    public DateTime Date { get; set; }
    public int TotalRecommendations { get; set; }
    public int ClickedRecommendations { get; set; }
    public int PlayedRecommendations { get; set; }
    public decimal Revenue { get; set; }
}

/// <summary>
/// Game type preference model
/// </summary>
public class GameTypePreference
{
    public string GameType { get; set; } = string.Empty;
    public double PreferenceScore { get; set; }
    public int PlayCount { get; set; }
    public TimeSpan TotalPlayTime { get; set; }
}

/// <summary>
/// Provider preference model
/// </summary>
public class ProviderPreference
{
    public string Provider { get; set; } = string.Empty;
    public double PreferenceScore { get; set; }
    public int PlayCount { get; set; }
    public TimeSpan TotalPlayTime { get; set; }
}

/// <summary>
/// Volatility preference model
/// </summary>
public class VolatilityPreference
{
    public string Volatility { get; set; } = string.Empty;
    public double PreferenceScore { get; set; }
    public int PlayCount { get; set; }
    public decimal AverageBet { get; set; }
}

/// <summary>
/// Player segment summary model
/// </summary>
public class PlayerSegmentSummary
{
    public string SegmentName { get; set; } = string.Empty;
    public int PlayerCount { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AverageRevenue { get; set; }
    public double RetentionRate { get; set; }
}

/// <summary>
/// Top player model
/// </summary>
public class TopPlayer
{
    public long PlayerId { get; set; }
    public string Username { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int SessionCount { get; set; }
    public TimeSpan TotalPlayTime { get; set; }
}

/// <summary>
/// Player activity summary model
/// </summary>
public class PlayerActivitySummary
{
    public DateTime Date { get; set; }
    public int ActivePlayers { get; set; }
    public int NewRegistrations { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AverageSessionTime { get; set; }
}













/// <summary>
/// Security event model
/// </summary>
public class SecurityEvent
{
    public string EventType { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Dictionary<string, object>? AdditionalData { get; set; }
}

/// <summary>
/// Security event filter model
/// </summary>
public class SecurityEventFilter
{
    public string? EventType { get; set; }
    public string? UserId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? IpAddress { get; set; }
}





/// <summary>
/// Update game request model
/// </summary>
public class UpdateGameRequest
{
    public string? GameName { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsFeatured { get; set; }
    public int? FeaturePriority { get; set; }
    public decimal? MinBetAmount { get; set; }
    public decimal? MaxBetAmount { get; set; }
    public double? RTPPercentage { get; set; }
    public bool? HideInLobby { get; set; }
    public int? GameOrder { get; set; }
    public string? GameDescription { get; set; }
    public string? ImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public List<string>? Tags { get; set; }
    public string? Notes { get; set; }
}



/// <summary>
/// Game management DTO model
/// </summary>
public class GameManagementDto
{
    public int GameId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public string ProviderName { get; set; } = string.Empty;
    public string GameTypeName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public int FeaturePriority { get; set; }
    public bool IsMobile { get; set; }
    public bool IsDesktop { get; set; }
    public bool? HideInLobby { get; set; }
    public int GameOrder { get; set; }
    public decimal MinBetAmount { get; set; }
    public decimal? MaxBetAmount { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
    public int Status { get; set; }
    public GAIming.Core.Entities.GameManagementSettings? Settings { get; set; }
}



/// <summary>
/// Bulk update games request model
/// </summary>
public class BulkUpdateGamesRequest
{
    public List<int> GameIds { get; set; } = new();
    public Dictionary<string, object> Updates { get; set; } = new();
    public string? Reason { get; set; }
}

/// <summary>
/// Bulk update result model
/// </summary>
public class BulkUpdateResult
{
    public int TotalRequested { get; set; }
    public int SuccessfulUpdates { get; set; }
    public int FailedUpdates { get; set; }
    public List<string> Errors { get; set; } = new();
}

/// <summary>
/// Game comparison result model
/// </summary>
public class GameComparisonResult
{
    public int GameId1 { get; set; }
    public int GameId2 { get; set; }
    public double SimilarityScore { get; set; }
    public List<string> CommonFeatures { get; set; } = new();
    public List<string> Differences { get; set; } = new();
}

/// <summary>
/// Game recommendation settings model
/// </summary>
public class GameRecommendationSettings
{
    public int GameId { get; set; }
    public bool IsRecommendable { get; set; } = true;
    public double RecommendationWeight { get; set; } = 1.0;
    public List<string> TargetSegments { get; set; } = new();
    public Dictionary<string, object>? CustomRules { get; set; }
}

/// <summary>
/// Game refresh result model
/// </summary>
public class GameRefreshResult
{
    public int TotalGames { get; set; }
    public int UpdatedGames { get; set; }
    public int NewGames { get; set; }
    public int RemovedGames { get; set; }
    public DateTime RefreshDate { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Trending game model
/// </summary>
public class TrendingGame
{
    public int GameId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public int PlayCount { get; set; }
    public decimal Revenue { get; set; }
    public double TrendScore { get; set; }
    public DateTime CalculatedDate { get; set; }
}

/// <summary>
/// Games dashboard DTO model
/// </summary>
public class GamesDashboardDto
{
    public int TotalGames { get; set; }
    public int ActiveGames { get; set; }
    public int FeaturedGames { get; set; }
    public List<TrendingGame> TrendingGames { get; set; } = new();
    public List<GameMetricTrend> RecentTrends { get; set; } = new();
}

/// <summary>
/// Game configuration item model
/// </summary>
public class GameConfigurationItem
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string DataType { get; set; } = string.Empty;
    public string? Description { get; set; }
}

/// <summary>
/// Game audit log entry model
/// </summary>
public class GameAuditLogEntry
{
    public long Id { get; set; }
    public int GameId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Game metric trend model
/// </summary>
public class GameMetricTrend
{
    public int GameId { get; set; }
    public string MetricName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public double Value { get; set; }
    public double Change { get; set; }
    public string Trend { get; set; } = string.Empty;
}

/// <summary>
/// Game benchmark data model
/// </summary>
public class GameBenchmarkData
{
    public int GameId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public double AverageRTP { get; set; }
    public decimal AverageRevenue { get; set; }
    public int AveragePlayCount { get; set; }
    public double PopularityScore { get; set; }
}

/// <summary>
/// A/B testing service interface
/// </summary>
public interface IABTestingService
{
    Task<ABTestVariant?> GetPlayerVariantAsync(long playerId, string experimentName);
    Task<bool> AssignPlayerToVariantAsync(long playerId, string experimentName, string variantName);
    Task<ABTestResults> GetExperimentResultsAsync(string experimentName);
}

/// <summary>
/// Interaction features model
/// </summary>
public class InteractionFeatures
{
    public long PlayerId { get; set; }
    public int GameId { get; set; }
    public int InteractionCount { get; set; }
    public TimeSpan TotalPlayTime { get; set; }
    public decimal TotalBets { get; set; }
    public decimal TotalWins { get; set; }
    public DateTime LastInteraction { get; set; }
    public double AverageSessionLength { get; set; }
    public string PreferredTimeOfDay { get; set; } = string.Empty;
    public Dictionary<string, object>? CustomFeatures { get; set; }
}

/// <summary>
/// Player analytics dashboard model
/// </summary>
public class PlayerAnalyticsDashboard
{
    public long PlayerId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public PlayerOverviewStats Overview { get; set; } = new();
    public GAIming.Core.Models.PlayerGameStats GameStats { get; set; } = new();
    public PlayerRecommendationStats RecommendationStats { get; set; } = new();
    public PlayerBehaviorSummary BehaviorSummary { get; set; } = new();
    public PlayerRiskAssessment RiskAssessment { get; set; } = new();
    public List<PlayerActivityTrend> ActivityTrends { get; set; } = new();

    // Legacy properties for backward compatibility
    public int TotalPlayers { get; set; }
    public int ActivePlayers { get; set; }
    public int NewPlayers { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AverageSessionTime { get; set; }
    public List<PlayerSegmentInfo> TopSegments { get; set; } = new();
    public List<TopPlayer> TopPlayers { get; set; } = new();
}

/// <summary>
/// Player behavior analysis model
/// </summary>
public class PlayerBehaviorAnalysis
{
    public long PlayerId { get; set; }
    public string Username { get; set; } = string.Empty;
    public SessionPatterns SessionPatterns { get; set; } = new();
    public BettingPatterns BettingPatterns { get; set; } = new();
    public GamePreferences GamePreferences { get; set; } = new();
    public List<BehaviorInsight> Insights { get; set; } = new();
    public List<BehaviorAlert> Alerts { get; set; } = new();
    public double RiskScore { get; set; }
    public DateTime LastAnalyzed { get; set; }
}

/// <summary>
/// Player recommendation performance model
/// </summary>
public class PlayerRecommendationPerformance
{
    public long PlayerId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int TotalRecommendations { get; set; }
    public int ClickedRecommendations { get; set; }
    public int PlayedRecommendations { get; set; }
    public double ClickThroughRate { get; set; }
    public double ConversionRate { get; set; }
    public decimal RevenueGenerated { get; set; }
    public string PreferredAlgorithm { get; set; } = string.Empty;
    public Dictionary<string, double> AlgorithmPerformance { get; set; } = new();
}

/// <summary>
/// Player game preferences model
/// </summary>
public class PlayerGamePreferences
{
    public long PlayerId { get; set; }
    public List<GameTypePreference> GameTypePreferences { get; set; } = new();
    public List<ProviderPreference> ProviderPreferences { get; set; } = new();
    public List<VolatilityPreference> VolatilityPreferences { get; set; } = new();
    public decimal PreferredMinBet { get; set; }
    public decimal PreferredMaxBet { get; set; }
    public List<string> PreferredThemes { get; set; } = new();
    public DateTime LastUpdated { get; set; }
}









/// <summary>
/// Game popularity statistics model
/// </summary>
public class GamePopularityStats
{
    public int GameId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public int TotalPlays { get; set; }
    public int UniquePlayers { get; set; }
    public decimal TotalBets { get; set; }
    public decimal TotalWins { get; set; }
    public double AverageSessionTime { get; set; }
    public double PopularityScore { get; set; }
    public DateTime LastPlayed { get; set; }
    public int Rank { get; set; }
}

/// <summary>
/// Suspicious activity model
/// </summary>
public class SuspiciousActivity
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string ActivityType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double RiskScore { get; set; }
    public DateTime DetectedAt { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    public bool IsResolved { get; set; }
    public string? Resolution { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolvedBy { get; set; }
}

/// <summary>
/// Player segment model
/// </summary>
public class PlayerSegment
{
    public long PlayerId { get; set; }
    public string SegmentName { get; set; } = string.Empty;
    public string SegmentType { get; set; } = string.Empty;
    public double SegmentScore { get; set; }
    public DateTime AssignedDate { get; set; }
    public Dictionary<string, object>? Attributes { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Players overview DTO
/// </summary>
public class PlayersOverviewDto
{
    public int TotalPlayers { get; set; }
    public int ActivePlayers { get; set; }
    public int NewPlayers { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AverageSessionTime { get; set; }
    public List<PlayerSegmentSummary> SegmentBreakdown { get; set; } = new();
    public List<PlayerActivityTrend> ActivityTrends { get; set; } = new();
}



/// <summary>
/// Failed login attempt model
/// </summary>
public class FailedLoginAttempt
{
    public long Id { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string? UserAgent { get; set; }
    public string FailureReason { get; set; } = string.Empty;
    public DateTime AttemptedAt { get; set; }
    public bool IsBlocked { get; set; }
    public DateTime? BlockedUntil { get; set; }
}

/// <summary>
/// Player game statistics model
/// </summary>
public class PlayerGameStats
{
    public long PlayerId { get; set; }
    public int GameId { get; set; }
    public int TotalSessions { get; set; }
    public TimeSpan TotalPlayTime { get; set; }
    public decimal TotalBets { get; set; }
    public decimal TotalWins { get; set; }
    public decimal NetResult { get; set; }
    public double AverageSessionTime { get; set; }
    public DateTime FirstPlayed { get; set; }
    public DateTime LastPlayed { get; set; }
    public int ConsecutiveDays { get; set; }
    public double WinRate { get; set; }
}

/// <summary>
/// ML Model entity
/// </summary>
public class MLModel
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ModelType { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? FilePath { get; set; }
    public Dictionary<string, object>? Configuration { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? LastTrainedDate { get; set; }
    public DateTime? DeployedDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

/// <summary>
/// Create ML model request
/// </summary>
public class CreateMLModelRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ModelType { get; set; } = string.Empty;
    public Dictionary<string, object>? Configuration { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Update ML model request
/// </summary>
public class UpdateMLModelRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Version { get; set; }
    public Dictionary<string, object>? Configuration { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    public bool? IsActive { get; set; }
}



/// <summary>
/// Training configuration
/// </summary>
public class TrainingConfiguration
{
    public Dictionary<string, object> Parameters { get; set; } = new();
    public string? DatasetPath { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? MaxEpochs { get; set; }
    public double? LearningRate { get; set; }
    public int? BatchSize { get; set; }
}

/// <summary>
/// Model training status
/// </summary>
public class ModelTrainingStatus
{
    public long ModelId { get; set; }
    public string Status { get; set; } = string.Empty;
    public double Progress { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? ErrorMessage { get; set; }
    public Dictionary<string, object>? Metrics { get; set; }
    public int CurrentEpoch { get; set; }
    public int TotalEpochs { get; set; }
}

/// <summary>
/// Model performance metrics DTO
/// </summary>
public class ModelPerformanceMetrics
{
    public string ModelName { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string EvaluationDate { get; set; } = string.Empty;
    public double Precision { get; set; }
    public double Recall { get; set; }
    public double F1Score { get; set; }
    public double Auc { get; set; }
    public double Ndcg { get; set; }
    public double Map { get; set; }
    public double Coverage { get; set; }
    public double Diversity { get; set; }
    public double Novelty { get; set; }
    public Dictionary<string, double> CustomMetrics { get; set; } = new();
}

/// <summary>
/// Training request for ML models
/// </summary>
public class TrainingRequest
{
    public long ModelId { get; set; }
    public Dictionary<string, object>? Hyperparameters { get; set; }
    public Dictionary<string, object>? DatasetConfig { get; set; }
    public Dictionary<string, object>? TrainingConfig { get; set; }
}

/// <summary>
/// Deployment request for ML models
/// </summary>
public class DeploymentRequest
{
    public long ModelId { get; set; }
    public string Environment { get; set; } = string.Empty;
    public DeploymentConfiguration Configuration { get; set; } = new();
}

/// <summary>
/// Deployment configuration
/// </summary>
public class DeploymentConfiguration
{
    public int Replicas { get; set; }
    public string CpuLimit { get; set; } = string.Empty;
    public string MemoryLimit { get; set; } = string.Empty;
    public bool AutoScaling { get; set; }
    public int MinReplicas { get; set; }
    public int MaxReplicas { get; set; }
    public int TargetCpuUtilization { get; set; }
}

/// <summary>
/// Model training job
/// </summary>
public class ModelTrainingJob
{
    public long Id { get; set; }
    public long ModelId { get; set; }
    public string ModelName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public double Progress { get; set; }
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public int? Duration { get; set; }
    public TrainingDataInfo TrainingData { get; set; } = new();
    public Dictionary<string, object> Hyperparameters { get; set; } = new();
    public ModelPerformanceMetrics? Metrics { get; set; }
    public List<string> Logs { get; set; } = new();
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Training data information
/// </summary>
public class TrainingDataInfo
{
    public int DatasetSize { get; set; }
    public int TrainingSize { get; set; }
    public int ValidationSize { get; set; }
    public int TestSize { get; set; }
    public List<string> Features { get; set; } = new();
    public string TargetVariable { get; set; } = string.Empty;
    public DataQualityMetrics DataQuality { get; set; } = new();
}

/// <summary>
/// Data quality metrics
/// </summary>
public class DataQualityMetrics
{
    public double Completeness { get; set; }
    public double Consistency { get; set; }
    public double Accuracy { get; set; }
    public double Validity { get; set; }
    public double Uniqueness { get; set; }
    public int MissingValues { get; set; }
    public int Outliers { get; set; }
}

/// <summary>
/// Model deployment information
/// </summary>
public class ModelDeployment
{
    public long Id { get; set; }
    public long ModelId { get; set; }
    public string ModelName { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string DeployedDate { get; set; } = string.Empty;
    public string DeployedBy { get; set; } = string.Empty;
    public DeploymentConfiguration Configuration { get; set; } = new();
    public HealthCheckResult HealthCheck { get; set; } = new();
    public DeploymentMetrics Metrics { get; set; } = new();
}

/// <summary>
/// Health check result
/// </summary>
public class HealthCheckResult
{
    public string Status { get; set; } = string.Empty;
    public string LastCheck { get; set; } = string.Empty;
    public double ResponseTime { get; set; }
    public double ErrorRate { get; set; }
    public double Uptime { get; set; }
}

/// <summary>
/// Deployment metrics
/// </summary>
public class DeploymentMetrics
{
    public double RequestsPerSecond { get; set; }
    public double AverageResponseTime { get; set; }
    public double ErrorRate { get; set; }
    public double CpuUsage { get; set; }
    public double MemoryUsage { get; set; }
    public double Throughput { get; set; }
}

/// <summary>
/// Enhanced recommendation response
/// </summary>
public class EnhancedRecommendationResponse
{
    public long PlayerId { get; set; }
    public string Algorithm { get; set; } = string.Empty;
    public string? Context { get; set; }
    public double ProcessingTimeMs { get; set; }
    public int TotalRecommendations { get; set; }
    public List<EnhancedGameRecommendationDto> Recommendations { get; set; } = new();
}

/// <summary>
/// Enhanced game recommendation DTO
/// </summary>
public class EnhancedGameRecommendationDto
{
    public long GameId { get; set; }
    public double Score { get; set; }
    public int Position { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public Dictionary<string, object>? Features { get; set; }
    public GameMetadata? GameMetadata { get; set; }
}

/// <summary>
/// Game metadata for recommendations
/// </summary>
public class GameMetadata
{
    public string Name { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string GameType { get; set; } = string.Empty;
    public int Volatility { get; set; }
    public double RTP { get; set; }
    public bool IsMobile { get; set; }
    public bool IsDesktop { get; set; }
    public decimal MinBetAmount { get; set; }
    public DateTime? ReleaseDate { get; set; }
}

/// <summary>
/// Similar games response
/// </summary>
public class SimilarGamesResponse
{
    public long BaseGameId { get; set; }
    public List<SimilarGameDto> SimilarGames { get; set; } = new();
}

/// <summary>
/// Similar game DTO
/// </summary>
public class SimilarGameDto
{
    public long GameId { get; set; }
    public double SimilarityScore { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Trending games response
/// </summary>
public class TrendingGamesResponse
{
    public string Timeframe { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public List<TrendingGameDto> TrendingGames { get; set; } = new();
}

/// <summary>
/// Trending game DTO
/// </summary>
public class TrendingGameDto
{
    public long GameId { get; set; }
    public double TrendScore { get; set; }
    public int PlayCount { get; set; }
    public double GrowthRate { get; set; }
}

/// <summary>
/// Recommendation interaction request
/// </summary>
public class RecommendationInteractionRequest
{
    public long RecommendationId { get; set; }
    public string InteractionType { get; set; } = string.Empty;
    public long? PlayerId { get; set; }
    public DateTime? Timestamp { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Batch recommendation response
/// </summary>
public class BatchRecommendationResponse
{
    public long PlayerId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int RecommendationsGenerated { get; set; }
    public double ProcessingTimeMs { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Recommendation interaction type enum
/// </summary>
public enum RecommendationInteractionType
{
    Click,
    Play,
    Dismiss,
    Like,
    Dislike
}



// Settings Models

/// <summary>
/// System settings DTO
/// </summary>
public class SystemSettingsDto
{
    public GeneralSettingsDto General { get; set; } = new();
    public RecommendationSettingsDto Recommendation { get; set; } = new();
    public AnalyticsSettingsDto Analytics { get; set; } = new();
    public SecuritySettingsDto Security { get; set; } = new();
    public PerformanceSettingsDto Performance { get; set; } = new();
    public NotificationSettingsDto Notifications { get; set; } = new();
}

/// <summary>
/// General settings DTO
/// </summary>
public class GeneralSettingsDto
{
    public string SystemName { get; set; } = string.Empty;
    public string SystemDescription { get; set; } = string.Empty;
    public string DefaultLanguage { get; set; } = string.Empty;
    public string DefaultTimezone { get; set; } = string.Empty;
    public bool MaintenanceMode { get; set; }
    public string MaintenanceMessage { get; set; } = string.Empty;
    public string LogLevel { get; set; } = string.Empty;
    public int SessionTimeout { get; set; }
    public int MaxConcurrentSessions { get; set; }
}

/// <summary>
/// Recommendation settings DTO
/// </summary>
public class RecommendationSettingsDto
{
    public string DefaultAlgorithm { get; set; } = string.Empty;
    public int MaxRecommendations { get; set; }
    public double MinConfidenceScore { get; set; }
    public bool EnableABTesting { get; set; }
    public int CacheExpirationMinutes { get; set; }
    public bool RealTimeUpdates { get; set; }
    public bool PersonalizationEnabled { get; set; }
    public double DiversityWeight { get; set; }
    public double PopularityWeight { get; set; }
    public double RecencyWeight { get; set; }
}

/// <summary>
/// Analytics settings DTO
/// </summary>
public class AnalyticsSettingsDto
{
    public bool EnableTracking { get; set; }
    public int DataRetentionDays { get; set; }
    public bool RealTimeAnalytics { get; set; }
    public string[] ExportFormats { get; set; } = Array.Empty<string>();
    public bool AutoReportGeneration { get; set; }
    public string ReportSchedule { get; set; } = string.Empty;
    public int MetricsRefreshInterval { get; set; }
    public bool EnablePredictiveAnalytics { get; set; }
}

/// <summary>
/// Security settings DTO
/// </summary>
public class SecuritySettingsDto
{
    public bool RequireHttps { get; set; }
    public bool EnableTwoFactor { get; set; }
    public int PasswordMinLength { get; set; }
    public bool PasswordRequireUppercase { get; set; }
    public bool PasswordRequireLowercase { get; set; }
    public bool PasswordRequireNumbers { get; set; }
    public bool PasswordRequireSpecialChars { get; set; }
    public int MaxLoginAttempts { get; set; }
    public int LockoutDurationMinutes { get; set; }
    public int JwtExpirationMinutes { get; set; }
    public int RefreshTokenExpirationDays { get; set; }
    public bool EnableAuditLogging { get; set; }
    public int AuditLogRetentionDays { get; set; }
}

/// <summary>
/// Performance settings DTO
/// </summary>
public class PerformanceSettingsDto
{
    public bool EnableCaching { get; set; }
    public int CacheExpirationMinutes { get; set; }
    public int MaxConcurrentRequests { get; set; }
    public int RequestTimeoutSeconds { get; set; }
    public bool EnableCompression { get; set; }
    public bool EnableRateLimiting { get; set; }
    public int RateLimitRequests { get; set; }
    public int RateLimitWindowMinutes { get; set; }
    public int DatabaseConnectionPoolSize { get; set; }
    public bool EnableQueryOptimization { get; set; }
}

/// <summary>
/// Notification settings DTO
/// </summary>
public class NotificationSettingsDto
{
    public bool EnableEmailNotifications { get; set; }
    public bool EnableSmsNotifications { get; set; }
    public bool EnablePushNotifications { get; set; }
    public string SmtpServer { get; set; } = string.Empty;
    public int SmtpPort { get; set; }
    public string SmtpUsername { get; set; } = string.Empty;
    public bool SmtpUseSsl { get; set; }
    public string DefaultFromEmail { get; set; } = string.Empty;
    public string DefaultFromName { get; set; } = string.Empty;
}

// Authentication Request/Response Models

/// <summary>
/// Refresh token request
/// </summary>
public class RefreshTokenRequest
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}

/// <summary>
/// Token response
/// </summary>
public class TokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string TokenType { get; set; } = "Bearer";
}



/// <summary>
/// Logout request
/// </summary>
public class LogoutRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}



/// <summary>
/// Game management detail DTO
/// </summary>
public class GameManagementDetailDto
{
    public int GameId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public int FeaturedOrder { get; set; }
    public decimal MinBet { get; set; }
    public decimal MaxBet { get; set; }
    public decimal RTP { get; set; }
    public string? ImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public List<string> Tags { get; set; } = new();
    public Dictionary<string, object> Settings { get; set; } = new();
    public DateTime CreatedDate { get; set; }
    public DateTime? LastModifiedDate { get; set; }
    public string? LastModifiedBy { get; set; }
    public GameStatistics? Statistics { get; set; }
}

/// <summary>
/// Game statistics model
/// </summary>
public class GameStatistics
{
    public int GameId { get; set; }
    public int TotalPlays { get; set; }
    public int UniquePlayers { get; set; }
    public decimal TotalBets { get; set; }
    public decimal TotalWins { get; set; }
    public decimal NetRevenue { get; set; }
    public double AverageSessionTime { get; set; }
    public double ReturnToPlayer { get; set; }
    public int ActiveSessions { get; set; }
    public DateTime LastPlayed { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}

/// <summary>
/// Player risk assessment model
/// </summary>
public class PlayerRiskAssessment
{
    public long PlayerId { get; set; }
    public int RiskLevel { get; set; } // 1-5 scale
    public string RiskCategory { get; set; } = string.Empty; // Low, Medium, High, Critical
    public List<string> RiskFactors { get; set; } = new();
    public decimal SpendingVelocity { get; set; }
    public double SessionFrequency { get; set; }
    public double AverageSessionDuration { get; set; }
    public bool HasGamblingProblemIndicators { get; set; }
    public DateTime LastAssessmentDate { get; set; }
    public DateTime? NextAssessmentDate { get; set; }
    public Dictionary<string, double> RiskScores { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Player features for ML algorithms
/// </summary>
public class PlayerFeatures
{
    public long PlayerId { get; set; }
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public int RiskLevel { get; set; }
    public int VIPLevel { get; set; }
    public int VipLevel { get; set; }
    public decimal TotalDeposits { get; set; }
    public int TotalGamesPlayed { get; set; }
    public int SessionsCount { get; set; }
    public decimal TotalBets { get; set; }
    public decimal TotalWins { get; set; }
    public int SessionCount { get; set; }
    public double AverageSessionDuration { get; set; }
    public DateTime LastPlayDate { get; set; }
    public int DaysSinceLastPlay { get; set; }
    public List<string> PreferredGameTypes { get; set; } = new();
    public List<string> PreferredProviders { get; set; } = new();
    public double PreferredVolatility { get; set; }
    public double PreferredRTP { get; set; }
    public decimal AverageBetSize { get; set; }
    public string PlayStyle { get; set; } = string.Empty;
    public double WinRate { get; set; }
    public int ConsecutiveLosses { get; set; }
    public bool IsNewPlayer { get; set; }
    public Dictionary<string, object> CustomFeatures { get; set; } = new();
}

/// <summary>
/// Game features for ML algorithms
/// </summary>
public class GameFeatures
{
    public long GameId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public int ProviderId { get; set; }
    public int GameTypeId { get; set; }
    public int VolatilityId { get; set; }
    public double AverageRTP { get; set; }
    public decimal MinBetAmount { get; set; }
    public decimal MaxBetAmount { get; set; }
    public bool IsMobile { get; set; }
    public Dictionary<string, object> Features { get; set; } = new();
    public bool IsDesktop { get; set; }
    public int ThemeId { get; set; }
    public double PopularityScore { get; set; }
    public double RevenueScore { get; set; }
    public int TotalPlayers { get; set; }
    public int ActivePlayers { get; set; }
    public double AverageSessionDuration { get; set; }
    public double RetentionRate { get; set; }
    public List<string> Tags { get; set; } = new();
    public DateTime ReleaseDate { get; set; }
    public bool IsNewGame { get; set; }
    public Dictionary<string, object> CustomFeatures { get; set; } = new();
}
