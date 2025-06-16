using GAIming.Core.Common;
using Result = GAIming.Core.Common.Result;
using GAIming.Core.Models;
using GAIming.Core.Interfaces;

namespace GAIming.Core.CQRS;

/// <summary>
/// Query interface
/// </summary>
/// <typeparam name="TResult">Return type</typeparam>
public interface IQuery<TResult>
{
}

/// <summary>
/// Query handler interface
/// </summary>
/// <typeparam name="TQuery">Query type</typeparam>
/// <typeparam name="TResult">Return type</typeparam>
public interface IQueryHandler<in TQuery, TResult> where TQuery : IQuery<TResult>
{
    Task<GAIming.Core.Common.Result<TResult>> HandleAsync(TQuery query, CancellationToken cancellationToken = default);
}

/// <summary>
/// Query dispatcher interface
/// </summary>
public interface IQueryDispatcher
{
    Task<GAIming.Core.Common.Result<TResult>> DispatchAsync<TQuery, TResult>(TQuery query, CancellationToken cancellationToken = default) where TQuery : IQuery<TResult>;
}

/// <summary>
/// Base query class with common properties
/// </summary>
/// <typeparam name="TResult">Return type</typeparam>
public abstract class BaseQuery<TResult> : IQuery<TResult>
{
    protected BaseQuery()
    {
        QueryId = Guid.NewGuid();
        Timestamp = DateTime.UtcNow;
    }

    public Guid QueryId { get; }
    public DateTime Timestamp { get; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Paginated query base class
/// </summary>
/// <typeparam name="TResult">Return type</typeparam>
public abstract class PaginatedQuery<TResult> : BaseQuery<PaginatedResponse<TResult>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; } = "asc";
}

// Game Queries

/// <summary>
/// Get game by ID query
/// </summary>
public class GetGameByIdQuery : BaseQuery<GameDto?>
{
    public int GameId { get; set; }
    public bool IncludeInactive { get; set; } = false;
}

/// <summary>
/// Search games query
/// </summary>
public class SearchGamesQuery : PaginatedQuery<GameDto>
{
    public string? SearchTerm { get; set; }
    public List<int>? ProviderIds { get; set; }
    public List<int>? GameTypeIds { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsMobile { get; set; }
    public bool? IsDesktop { get; set; }
    public bool? HideInLobby { get; set; }
    public decimal? MinBetAmountFrom { get; set; }
    public decimal? MinBetAmountTo { get; set; }
    public double? RtpFrom { get; set; }
    public double? RtpTo { get; set; }
    public DateTime? ReleaseDateFrom { get; set; }
    public DateTime? ReleaseDateTo { get; set; }
    public bool? UkCompliant { get; set; }
    public List<string>? Tags { get; set; }
}

/// <summary>
/// Get featured games query
/// </summary>
public class GetFeaturedGamesQuery : BaseQuery<List<GameDto>>
{
    public int MaxCount { get; set; } = 10;
    public bool MobileOnly { get; set; } = false;
    public string? Platform { get; set; }
}

/// <summary>
/// Get game statistics query
/// </summary>
public class GetGameStatisticsQuery : BaseQuery<List<GameStatisticsDto>>
{
    public List<int> GameIds { get; set; } = new();
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IncludeRecommendationMetrics { get; set; } = true;
}

// Recommendation Queries

/// <summary>
/// Get recommendations query
/// </summary>
public class GetRecommendationsQuery : BaseQuery<List<GameRecommendationDto>>
{
    public long PlayerId { get; set; }
    public int Count { get; set; } = 10;
    public string Context { get; set; } = "lobby";
    public string? Algorithm { get; set; }
    public List<long>? ExcludeGameIds { get; set; }
    public Dictionary<string, object>? Parameters { get; set; }
}

/// <summary>
/// Get recommendation history query
/// </summary>
public class GetRecommendationHistoryQuery : PaginatedQuery<GameRecommendationDto>
{
    public long? PlayerId { get; set; }
    public long? GameId { get; set; }
    public string? Algorithm { get; set; }
    public string? Context { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool? IsClicked { get; set; }
    public bool? IsPlayed { get; set; }
}

/// <summary>
/// Get recommendation performance query
/// </summary>
public class GetRecommendationPerformanceQuery : BaseQuery<List<RecommendationPerformanceDto>>
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<string>? Algorithms { get; set; }
    public List<string>? Contexts { get; set; }
    public List<long>? PlayerIds { get; set; }
    public List<long>? GameIds { get; set; }
    public string? GroupBy { get; set; }
    public string? MetricType { get; set; }
}

// Player Analytics Queries

/// <summary>
/// Get player analytics query
/// </summary>
public class GetPlayerAnalyticsQuery : PaginatedQuery<PlayerAnalyticsDto>
{
    public List<long>? PlayerIds { get; set; }
    public List<string>? Countries { get; set; }
    public List<int>? VipLevels { get; set; }
    public List<int>? RiskLevels { get; set; }
    public decimal? MinDeposit { get; set; }
    public decimal? MaxDeposit { get; set; }
    public bool? IsActive { get; set; }
    public string? Segment { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

/// <summary>
/// Get player by ID query
/// </summary>
public class GetPlayerByIdQuery : BaseQuery<PlayerAnalyticsDto?>
{
    public long PlayerId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IncludeRecommendationMetrics { get; set; } = true;
}

/// <summary>
/// Get player risk assessment query
/// </summary>
public class GetPlayerRiskAssessmentQuery : BaseQuery<PlayerRiskAssessment?>
{
    public long PlayerId { get; set; }
    public bool ForceRecalculation { get; set; } = false;
}

/// <summary>
/// Get high risk players query
/// </summary>
public class GetHighRiskPlayersQuery : PaginatedQuery<PlayerAnalyticsDto>
{
    public int MinRiskLevel { get; set; } = 4;
    public DateTime? AssessmentDateFrom { get; set; }
    public DateTime? AssessmentDateTo { get; set; }
}

// User Management Queries

/// <summary>
/// Get users query
/// </summary>
public class GetUsersQuery : PaginatedQuery<UserManagementDto>
{
    public string? SearchTerm { get; set; }
    public bool? IsActive { get; set; }
    public List<long>? RoleIds { get; set; }
    public DateTime? CreatedFrom { get; set; }
    public DateTime? CreatedTo { get; set; }
    public DateTime? LastLoginFrom { get; set; }
    public DateTime? LastLoginTo { get; set; }
}

/// <summary>
/// Get user by ID query
/// </summary>
public class GetUserByIdQuery : BaseQuery<UserManagementDto?>
{
    public new long UserId { get; set; }
    public bool IncludeRoles { get; set; } = true;
    public bool IncludePermissions { get; set; } = true;
    public bool IncludeRecentSessions { get; set; } = true;
}

/// <summary>
/// Get user sessions query
/// </summary>
public class GetUserSessionsQuery : BaseQuery<List<UserSessionDto>>
{
    public new long UserId { get; set; }
    public bool ActiveOnly { get; set; } = false;
    public int MaxCount { get; set; } = 50;
}

// System Management Queries

/// <summary>
/// Get system configurations query
/// </summary>
public class GetSystemConfigurationsQuery : PaginatedQuery<SystemConfigurationDto>
{
    public string? Category { get; set; }
    public string? SearchTerm { get; set; }
    public bool? IsReadOnly { get; set; }
    public bool? RequiresRestart { get; set; }
}

/// <summary>
/// Get system configuration query
/// </summary>
public class GetSystemConfigurationQuery : BaseQuery<SystemConfigurationDto?>
{
    public string Key { get; set; } = string.Empty;
}

/// <summary>
/// Get system health query
/// </summary>
public class GetSystemHealthQuery : BaseQuery<SystemHealthCheckDto>
{
    public bool IncludeDetailedChecks { get; set; } = true;
    public List<string>? CheckNames { get; set; }
}

/// <summary>
/// Get dashboard summary query
/// </summary>
public class GetDashboardSummaryQuery : BaseQuery<DashboardSummaryDto>
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IncludeTrends { get; set; } = true;
    public bool IncludeAlerts { get; set; } = true;
}

// A/B Testing Queries

/// <summary>
/// Get A/B test experiments query
/// </summary>
public class GetABTestExperimentsQuery : PaginatedQuery<ABTestExperimentDto>
{
    public string? Status { get; set; }
    public DateTime? StartDateFrom { get; set; }
    public DateTime? StartDateTo { get; set; }
    public string? CreatedBy { get; set; }
}

/// <summary>
/// Get A/B test experiment by ID query
/// </summary>
public class GetABTestExperimentByIdQuery : BaseQuery<ABTestExperimentDto?>
{
    public long ExperimentId { get; set; }
    public bool IncludeResults { get; set; } = true;
}

/// <summary>
/// Get A/B test results query
/// </summary>
public class GetABTestResultsQuery : BaseQuery<ABTestVariantResultDto?>
{
    public long ExperimentId { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
