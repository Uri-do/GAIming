using System.ComponentModel.DataAnnotations;

namespace GAIming.Core.Models;

/// <summary>
/// Analytics request base model
/// </summary>
public class AnalyticsRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? GroupBy { get; set; } // day, week, month, game, player, provider
    public string? TimeZone { get; set; } = "UTC";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Player analytics request
/// </summary>
public class PlayerAnalyticsRequest : AnalyticsRequest
{
    public List<long>? PlayerIds { get; set; }
    public List<string>? Countries { get; set; }
    public List<int>? VipLevels { get; set; }
    public List<int>? RiskLevels { get; set; }
    public decimal? MinDeposit { get; set; }
    public decimal? MaxDeposit { get; set; }
    public bool? IsActive { get; set; }
    public string? Segment { get; set; } // new, returning, vip, high_risk, etc.

    // Additional properties for filtering and searching
    public string? SearchTerm { get; set; }
    public string? CountryCode { get; set; }
    public int? VipLevel { get; set; }
    public int? RiskLevel { get; set; }
    public DateTime? RegistrationDateFrom { get; set; }
    public DateTime? RegistrationDateTo { get; set; }
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; }
}

/// <summary>
/// Game analytics request
/// </summary>
public class GameAnalyticsRequest : AnalyticsRequest
{
    public List<int>? GameIds { get; set; }
    public List<int>? ProviderIds { get; set; }
    public List<int>? GameTypeIds { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsMobile { get; set; }
    public string? Platform { get; set; }
}

/// <summary>
/// Player analytics response
/// </summary>
public class PlayerAnalyticsDto
{
    public long PlayerId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Country { get; set; }
    public int VipLevel { get; set; }
    public bool IsActive { get; set; }
    public DateTime RegistrationDate { get; set; }
    public int RiskLevel { get; set; }
    public string RiskCategory { get; set; } = string.Empty;
    
    // Financial metrics
    public decimal TotalDeposits { get; set; }
    public decimal TotalWithdrawals { get; set; }
    public decimal TotalBets { get; set; }
    public decimal TotalWins { get; set; }
    public decimal NetRevenue { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal CurrentBalance { get; set; }
    public decimal AverageBetSize { get; set; }
    public List<string> FavoriteGameTypes { get; set; } = new();
    public string PlayerSegment { get; set; } = string.Empty;
    public decimal LifetimeValue { get; set; }
    public double RetentionScore { get; set; }
    public double RiskScore { get; set; }
    
    // Activity metrics
    public int TotalSessions { get; set; }
    public double AverageSessionDuration { get; set; }
    public int GamesPlayed { get; set; }
    public int UniqueGamesPlayed { get; set; }
    public DateTime LastLoginDate { get; set; }
    public DateTime LastPlayDate { get; set; }
    public int DaysSinceLastPlay { get; set; }
    
    // Engagement metrics
    public double EngagementScore { get; set; }
    public double RetentionRate { get; set; }
    public string PlayStyle { get; set; } = string.Empty;
    public List<string> PreferredGameTypes { get; set; } = new();
    public List<string> PreferredProviders { get; set; } = new();
    
    // Recommendation metrics
    public int RecommendationsReceived { get; set; }
    public int RecommendationsClicked { get; set; }
    public int RecommendationsPlayed { get; set; }
    public double RecommendationEngagement { get; set; }
}

/// <summary>
/// Game analytics response
/// </summary>
public class GameAnalyticsDto
{
    public int GameId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public string ProviderName { get; set; } = string.Empty;
    public string GameTypeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    // Player metrics
    public int TotalPlayers { get; set; }
    public int ActivePlayers { get; set; }
    public int NewPlayers { get; set; }
    public int ReturningPlayers { get; set; }
    
    // Session metrics
    public int TotalSessions { get; set; }
    public double AverageSessionDuration { get; set; }
    public double AverageSessionsPerPlayer { get; set; }
    
    // Financial metrics
    public decimal TotalBets { get; set; }
    public decimal TotalWins { get; set; }
    public decimal Revenue { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AverageBetSize { get; set; }
    public decimal RevenuePerPlayer { get; set; }
    public double HoldPercentage { get; set; }
    public double ActualRtp { get; set; }
    public double HouseEdge { get; set; }
    public double PlayerRetentionRate { get; set; }
    
    // Performance metrics
    public double PopularityScore { get; set; }
    public double RetentionRate { get; set; }
    public double ConversionRate { get; set; }
    public int Rank { get; set; }
    
    // Recommendation metrics
    public int RecommendationCount { get; set; }
    public int RecommendationImpressions { get; set; }
    public int RecommendationClicks { get; set; }
    public int RecommendationPlays { get; set; }
    public double RecommendationCtr { get; set; }
    public double RecommendationConversionRate { get; set; }

    // Trend data
    public List<object> PlayerTrends { get; set; } = new();
    public List<object> RevenueTrends { get; set; } = new();
    public List<object> SessionTrends { get; set; } = new();
    public Dictionary<string, object> Benchmarks { get; set; } = new();
    
    // Platform breakdown
    public Dictionary<string, int> PlatformDistribution { get; set; } = new();
    public Dictionary<string, decimal> PlatformRevenue { get; set; } = new();
}

/// <summary>
/// Revenue analytics response
/// </summary>
public class RevenueAnalyticsDto
{
    public DateTime Date { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal GameRevenue { get; set; }
    public decimal BonusRevenue { get; set; }
    public decimal TotalBets { get; set; }
    public decimal TotalWins { get; set; }
    public double HoldPercentage { get; set; }
    public int ActivePlayers { get; set; }
    public decimal RevenuePerPlayer { get; set; }
    public decimal AverageBetSize { get; set; }
    
    // Breakdown by segments
    public Dictionary<string, decimal> RevenueByGameType { get; set; } = new();
    public Dictionary<string, decimal> RevenueByProvider { get; set; } = new();
    public Dictionary<string, decimal> RevenueByVipLevel { get; set; } = new();
    public Dictionary<string, decimal> RevenueByCountry { get; set; } = new();
}

/// <summary>
/// Dashboard summary data
/// </summary>
public class DashboardSummaryDto
{
    public DateTime LastUpdated { get; set; }
    
    // Key metrics
    public int TotalActivePlayers { get; set; }
    public int NewPlayersToday { get; set; }
    public decimal TotalRevenueToday { get; set; }
    public decimal TotalRevenue7Days { get; set; }
    public decimal TotalRevenue30Days { get; set; }
    
    // Growth metrics
    public double PlayerGrowthRate { get; set; }
    public double RevenueGrowthRate { get; set; }
    public double RetentionRate { get; set; }
    
    // Top performers
    public List<GameAnalyticsDto> TopGamesByRevenue { get; set; } = new();
    public List<GameAnalyticsDto> TopGamesByPlayers { get; set; } = new();
    public List<PlayerAnalyticsDto> TopPlayersByRevenue { get; set; } = new();
    
    // Trends
    public List<TimeSeriesDataPoint> RevenueTrend { get; set; } = new();
    public List<TimeSeriesDataPoint> PlayerTrend { get; set; } = new();
    public List<TimeSeriesDataPoint> EngagementTrend { get; set; } = new();
    
    // Alerts
    public List<AnalyticsAlert> Alerts { get; set; } = new();
}

/// <summary>
/// Analytics alert
/// </summary>
public class AnalyticsAlert
{
    public string Type { get; set; } = string.Empty; // warning, error, info
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string? ActionUrl { get; set; }
}

/// <summary>
/// Time series data point
/// </summary>
public class TimeSeriesDataPoint
{
    public DateTime Timestamp { get; set; }
    public double Value { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Real-time dashboard data
/// </summary>
public class RealTimeDashboardData
{
    public DateTime Timestamp { get; set; }
    public int ActivePlayers { get; set; }
    public int ActiveSessions { get; set; }
    public int TotalRecommendations { get; set; }
    public double RecommendationCtr { get; set; }
    public List<TopGameMetric> TopGames { get; set; } = new();
    public List<RecentRecommendation> RecentRecommendations { get; set; } = new();
    public SystemHealthMetrics SystemHealth { get; set; } = new();
    public PerformanceMetrics PerformanceMetrics { get; set; } = new();
}

/// <summary>
/// Top game metric for dashboard
/// </summary>
public class TopGameMetric
{
    public int GameId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public int PlayerCount { get; set; }
    public int SessionCount { get; set; }
    public decimal Revenue { get; set; }
    public double PopularityScore { get; set; }
}

/// <summary>
/// Recent recommendation for dashboard
/// </summary>
public class RecentRecommendation
{
    public long PlayerId { get; set; }
    public long GameId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public string Algorithm { get; set; } = string.Empty;
    public double Score { get; set; }
    public bool IsClicked { get; set; }
    public bool IsPlayed { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status => IsPlayed ? "Played" : IsClicked ? "Clicked" : "Shown";
}

/// <summary>
/// System health metrics
/// </summary>
public class SystemHealthMetrics
{
    public double CpuUsage { get; set; }
    public double MemoryUsage { get; set; }
    public int DatabaseConnections { get; set; }
    public double CacheHitRate { get; set; }
    public double ApiResponseTime { get; set; }
    public string Status => GetHealthStatus();
    
    private string GetHealthStatus()
    {
        if (CpuUsage > 80 || MemoryUsage > 85 || ApiResponseTime > 1000)
            return "Critical";
        if (CpuUsage > 60 || MemoryUsage > 70 || ApiResponseTime > 500)
            return "Warning";
        return "Healthy";
    }
}

/// <summary>
/// Performance metrics
/// </summary>
public class PerformanceMetrics
{
    public int RecommendationsPerHour { get; set; }
    public double ClickThroughRate { get; set; }
    public double AverageResponseTime { get; set; }
    public double ErrorRate { get; set; }
    public double ThroughputRpm { get; set; }
    public double SuccessRate => 1.0 - ErrorRate;
}

/// <summary>
/// Cohort analysis response
/// </summary>
public class CohortAnalysisDto
{
    public string CohortId { get; set; } = string.Empty;
    public DateTime CohortDate { get; set; }
    public DateTime CohortStartDate { get; set; }
    public int CohortSize { get; set; }
    public int InitialSize { get; set; }
    public string Period { get; set; } = string.Empty;
    public Dictionary<int, double> RetentionRates { get; set; } = new();
    public Dictionary<int, decimal> RevenueRates { get; set; } = new();
    public Dictionary<int, decimal> RevenuePerPeriod { get; set; } = new();
    public Dictionary<int, int> ActiveUsers { get; set; } = new();
}

/// <summary>
/// Funnel analysis response
/// </summary>
public class FunnelAnalysisDto
{
    public string FunnelName { get; set; } = string.Empty;
    public List<FunnelStepDto> Steps { get; set; } = new();
    public double OverallConversionRate { get; set; }
    public DateTime AnalysisDate { get; set; }
}

/// <summary>
/// Funnel step data
/// </summary>
public class FunnelStepDto
{
    public int StepNumber { get; set; }
    public string StepName { get; set; } = string.Empty;
    public int Users { get; set; }
    public double ConversionRate { get; set; }
    public double DropOffRate { get; set; }
}

/// <summary>
/// Segmentation analysis response
/// </summary>
public class SegmentationAnalysisDto
{
    public string SegmentName { get; set; } = string.Empty;
    public string SegmentDescription { get; set; } = string.Empty;
    public int PlayerCount { get; set; }
    public double Percentage { get; set; }
    public decimal AverageRevenue { get; set; }
    public double AverageSessionDuration { get; set; }
    public double RetentionRate { get; set; }
    public List<string> Characteristics { get; set; } = new();
}

/// <summary>
/// Create A/B test experiment request
/// </summary>
public class CreateABTestRequest
{
    /// <summary>
    /// Experiment name
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Experiment description
    /// </summary>
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Start date
    /// </summary>
    [Required]
    public DateTime StartDate { get; set; }

    /// <summary>
    /// End date (optional)
    /// </summary>
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// Traffic allocation percentage (0-100)
    /// </summary>
    [Range(0, 100)]
    public double TrafficAllocation { get; set; } = 100;

    /// <summary>
    /// Test variants
    /// </summary>
    public List<CreateABTestVariantRequest> Variants { get; set; } = new();

    /// <summary>
    /// Target audience criteria
    /// </summary>
    public Dictionary<string, object>? TargetCriteria { get; set; }
}

/// <summary>
/// Create A/B test variant request
/// </summary>
public class CreateABTestVariantRequest
{
    /// <summary>
    /// Variant name
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Algorithm to use for this variant
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Algorithm { get; set; } = string.Empty;

    /// <summary>
    /// Traffic percentage for this variant
    /// </summary>
    [Range(0, 100)]
    public double TrafficPercentage { get; set; }

    /// <summary>
    /// Variant configuration
    /// </summary>
    public Dictionary<string, object>? Configuration { get; set; }
}

/// <summary>
/// Recommendation performance metrics
/// </summary>
public class RecommendationPerformanceDto
{
    public string Algorithm { get; set; } = string.Empty;
    public string Context { get; set; } = string.Empty;
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
    public double Coverage { get; set; }
    public double Diversity { get; set; }
    public TimeSpan AverageResponseTime { get; set; }
    public Dictionary<string, double> CustomMetrics { get; set; } = new();
}

/// <summary>
/// Recommendation analytics request
/// </summary>
public class RecommendationAnalyticsRequest : AnalyticsRequest
{
    /// <summary>
    /// Algorithm to analyze (optional)
    /// </summary>
    public string? Algorithm { get; set; }

    /// <summary>
    /// Context to analyze (optional)
    /// </summary>
    public string? Context { get; set; }

    /// <summary>
    /// Player ID to analyze (optional)
    /// </summary>
    public long? PlayerId { get; set; }

    /// <summary>
    /// Game ID to analyze (optional)
    /// </summary>
    public long? GameId { get; set; }

    /// <summary>
    /// Include performance metrics
    /// </summary>
    public bool IncludePerformanceMetrics { get; set; } = true;

    /// <summary>
    /// Include interaction data
    /// </summary>
    public bool IncludeInteractionData { get; set; } = true;

    /// <summary>
    /// Include A/B test data
    /// </summary>
    public bool IncludeABTestData { get; set; } = false;
}

/// <summary>
/// A/B test experiment model
/// </summary>
public class ABTestExperimentDto
{
    public long Id { get; set; }
    public string ExperimentName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Status { get; set; } // 0=Draft, 1=Running, 2=Paused, 3=Completed, 4=Cancelled
    public string StatusName { get; set; } = string.Empty;
    public string Configuration { get; set; } = string.Empty;
    public List<ABTestVariantDto> Variants { get; set; } = new();
    public ABTestVariantResultDto? Results { get; set; }
    public string? WinningVariant { get; set; }
    public double ConfidenceLevel { get; set; }
    public bool IsStatisticallySignificant { get; set; }
    public DateTime CreatedDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedDate { get; set; }
    public string? UpdatedBy { get; set; }
}

/// <summary>
/// A/B test variant model
/// </summary>
public class ABTestVariantDto
{
    public string Name { get; set; } = string.Empty;
    public string Algorithm { get; set; } = string.Empty;
    public double TrafficPercentage { get; set; }
    public Dictionary<string, object>? Configuration { get; set; }
    public int ParticipantCount { get; set; }
    public double ConversionRate { get; set; }
    public decimal Revenue { get; set; }
    public double ClickThroughRate { get; set; }
}

/// <summary>
/// A/B test variant results
/// </summary>
public class ABTestVariantResultDto
{
    public string VariantName { get; set; } = string.Empty;
    public int TotalParticipants { get; set; }
    public int Conversions { get; set; }
    public double ConversionRate { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal RevenuePerParticipant { get; set; }
    public int Clicks { get; set; }
    public double ClickThroughRate { get; set; }
    public double ConfidenceInterval { get; set; }
    public bool IsStatisticallySignificant { get; set; }
    public Dictionary<string, object> CustomMetrics { get; set; } = new();
}
