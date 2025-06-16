using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GAIming.Core.Models;

/// <summary>
/// Game DTO for API responses
/// </summary>
public class GameDto
{
    public int GameId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public int ProviderId { get; set; }
    public string ProviderName { get; set; } = string.Empty;
    public int GameTypeId { get; set; }
    public string GameTypeName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsMobile { get; set; }
    public bool IsDesktop { get; set; }
    public bool HideInLobby { get; set; }
    public int GameOrder { get; set; }
    public decimal MinBetAmount { get; set; }
    public decimal? MaxBetAmount { get; set; }

    [JsonPropertyName("rtpPercentage")]
    public double? RtpPercentage { get; set; }

    public DateTime? ReleaseDate { get; set; }

    [JsonPropertyName("ukCompliant")]
    public bool UkCompliant { get; set; }

    public decimal? JackpotContribution { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }

    // Additional properties
    public string? GameDescription { get; set; }
    public string? ImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }

    // Management overrides
    public bool? IsActiveOverride { get; set; }
    public bool? HideInLobbyOverride { get; set; }
    public int? GameOrderOverride { get; set; }
    public decimal? MinBetAmountOverride { get; set; }
    public decimal? MaxBetAmountOverride { get; set; }
    public string? GameDescriptionOverride { get; set; }
    public string? ImageUrlOverride { get; set; }
    public string? ThumbnailUrlOverride { get; set; }
    public List<string> TagsOverride { get; set; } = new();
    public string? Notes { get; set; }

    // Computed properties
    public bool EffectiveIsActive => IsActiveOverride ?? IsActive;
    public bool EffectiveHideInLobby => HideInLobbyOverride ?? HideInLobby;
    public int EffectiveGameOrder => GameOrderOverride ?? GameOrder;
    public decimal EffectiveMinBetAmount => MinBetAmountOverride ?? MinBetAmount;
}

/// <summary>
/// Game provider DTO
/// </summary>
public class GameProviderDto
{
    public int ProviderId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public int GameCount { get; set; }
}

/// <summary>
/// Game type DTO
/// </summary>
public class GameTypeDto
{
    public int GameTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public int GameCount { get; set; }
}

/// <summary>
/// Create game request
/// </summary>
public class CreateGameRequest
{
    [Required]
    [StringLength(100)]
    public string GameName { get; set; } = string.Empty;

    [Required]
    public int ProviderID { get; set; }

    [Required]
    public int GameTypeID { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsMobile { get; set; } = true;
    public bool IsDesktop { get; set; } = true;
    public bool? HideInLobby { get; set; }
    public int GameOrder { get; set; } = 0;

    [Range(0.01, 1000)]
    public decimal MinBetAmount { get; set; } = 0.01m;

    [Range(0.01, 10000)]
    public decimal? MaxBetAmount { get; set; }

    [Range(80, 100)]
    public double? RTPPercentage { get; set; }

    public DateTime? ReleaseDate { get; set; }
    public bool UKCompliant { get; set; } = true;

    [Range(0, 1)]
    public decimal? JackpotContribution { get; set; }

    [StringLength(1000)]
    public string? GameDescription { get; set; }

    [StringLength(500)]
    [Url]
    public string? ImageUrl { get; set; }

    [StringLength(500)]
    [Url]
    public string? ThumbnailUrl { get; set; }

    public List<string>? Tags { get; set; }
}

/// <summary>
/// Game search request
/// </summary>
public class GameSearchRequest
{
    public string? SearchTerm { get; set; }
    public List<int>? ProviderIds { get; set; }
    public List<int>? GameTypeIds { get; set; }
    public int? ProviderId { get; set; }
    public int? GameTypeId { get; set; }
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
    
    // Pagination
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    
    // Sorting
    public string? SortBy { get; set; } = "GameName";
    public string? SortDirection { get; set; } = "asc";
}

/// <summary>
/// Game management settings request
/// </summary>
public class GameManagementRequest
{
    [Required]
    public long GameId { get; set; }

    public bool? IsActive { get; set; }
    public bool? IsActiveOverride { get; set; }
    public bool? HideInLobby { get; set; }
    public bool? HideInLobbyOverride { get; set; }
    public int? GameOrder { get; set; }
    public int? GameOrderOverride { get; set; }

    [Range(0.01, 10000)]
    public decimal? MinBetAmountOverride { get; set; }

    [Range(0.01, 100000)]
    public decimal? MaxBetAmountOverride { get; set; }

    public bool? IsMobileOverride { get; set; }
    public bool? IsDesktopOverride { get; set; }
    public bool? UkCompliantOverride { get; set; }

    [Range(0, 1)]
    public decimal? JackpotContributionOverride { get; set; }

    [StringLength(1000)]
    public string? GameDescriptionOverride { get; set; }

    [StringLength(500)]
    [Url]
    public string? ImageUrlOverride { get; set; }

    [StringLength(500)]
    [Url]
    public string? ThumbnailUrlOverride { get; set; }

    public List<string>? TagsOverride { get; set; }

    [StringLength(2000)]
    public string? Notes { get; set; }

    public bool IsFeatured { get; set; } = false;

    [Range(0, 100)]
    public int FeaturePriority { get; set; } = 0;

    public Dictionary<string, object>? PromotionSettings { get; set; }
    public Dictionary<string, object>? ABTestSettings { get; set; }
    public Dictionary<string, object>? ResponsibleGamingSettings { get; set; }
    public Dictionary<string, object>? RegionalSettings { get; set; }
    public Dictionary<string, object>? CustomMetadata { get; set; }
}

/// <summary>
/// Bulk game update request
/// </summary>
public class BulkGameUpdateRequest
{
    [Required]
    public List<long> GameIds { get; set; } = new();

    public bool? IsActive { get; set; }
    public bool? IsActiveOverride { get; set; }
    public bool? HideInLobby { get; set; }
    public bool? HideInLobbyOverride { get; set; }
    public int? GameOrder { get; set; }
    public bool? IsMobileOverride { get; set; }
    public bool? IsDesktopOverride { get; set; }
    public bool? UkCompliantOverride { get; set; }
    public List<string>? AddTags { get; set; }
    public List<string>? RemoveTags { get; set; }
    public bool? IsFeatured { get; set; }
    public Dictionary<string, object>? CustomMetadata { get; set; }
}

/// <summary>
/// Game export request
/// </summary>
public class ExportGamesRequest
{
    [Required]
    public string Format { get; set; } = "xlsx"; // csv, xlsx, json

    public List<int>? GameIds { get; set; }
    public List<int>? ProviderIds { get; set; }
    public List<int>? GameTypeIds { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public bool IncludeAnalytics { get; set; } = false;
    public bool IncludePlayerData { get; set; } = false;
    public bool IncludeRecommendations { get; set; } = false;
    public string DateRange { get; set; } = "30d"; // 7d, 30d, 90d, 1y
}

/// <summary>
/// Game export result
/// </summary>
public class ExportResult
{
    public byte[] Data { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public int RecordCount { get; set; }
    public bool Success { get; set; }
    public DateTime ExportedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Game import options
/// </summary>
public class ImportGamesOptions
{
    public bool UpdateExisting { get; set; } = false;
    public bool SkipDuplicates { get; set; } = true;
    public bool ValidateOnly { get; set; } = false;
    public int BatchSize { get; set; } = 100;
}

/// <summary>
/// Game import result
/// </summary>
public class ImportResult
{
    public int TotalRecords { get; set; }
    public int ProcessedRecords { get; set; }
    public int CreatedRecords { get; set; }
    public int UpdatedRecords { get; set; }
    public int SkippedRecords { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public bool Success { get; set; }
    public DateTime ImportedAt { get; set; } = DateTime.UtcNow;
    public TimeSpan ProcessingDuration { get; set; }
}

/// <summary>
/// File validation result
/// </summary>
public class FileValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public List<object> PreviewData { get; set; } = new();
    public int TotalRows { get; set; }
    public bool HasCriticalErrors => Errors.Any();
}

/// <summary>
/// Game export DTO
/// </summary>
public class GameExportDto
{
    public int GameId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public string ProviderName { get; set; } = string.Empty;
    public string GameTypeName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsMobile { get; set; }
    public bool IsDesktop { get; set; }
    public bool HideInLobby { get; set; }
    public int GameOrder { get; set; }
    public decimal MinBetAmount { get; set; }
    public decimal? MaxBetAmount { get; set; }
    public double? RtpPercentage { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public bool UkCompliant { get; set; }
    public decimal? JackpotContribution { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }

    // Analytics data (optional)
    public int? TotalPlayers { get; set; }
    public int? TotalSessions { get; set; }
    public decimal? TotalRevenue { get; set; }
    public double? PopularityScore { get; set; }

    // Recommendation data (optional)
    public int? RecommendationCount { get; set; }
    public double? RecommendationCtr { get; set; }
    public double? RecommendationConversionRate { get; set; }
}

/// <summary>
/// Game import DTO
/// </summary>
public class GameImportDto
{
    [Required]
    public string GameName { get; set; } = string.Empty;

    [Required]
    public string ProviderName { get; set; } = string.Empty;

    [Required]
    public string GameTypeName { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    public bool IsMobile { get; set; } = true;
    public bool IsDesktop { get; set; } = true;
    public bool HideInLobby { get; set; } = false;
    public int GameOrder { get; set; } = 0;

    [Range(0.01, 1000)]
    public decimal MinBetAmount { get; set; } = 0.01m;

    [Range(0.01, 10000)]
    public decimal? MaxBetAmount { get; set; }

    [Range(80, 100)]
    public double? RtpPercentage { get; set; }

    public DateTime? ReleaseDate { get; set; }
    public bool UkCompliant { get; set; } = true;

    [Range(0, 1)]
    public decimal? JackpotContribution { get; set; }

    public string? GameDescription { get; set; }
    public string? ImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public List<string>? Tags { get; set; }
}

/// <summary>
/// Game statistics DTO
/// </summary>
public class GameStatisticsDto
{
    public int GameId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalPlayers { get; set; }
    public int ActivePlayers { get; set; }
    public int TotalSessions { get; set; }
    public decimal TotalBets { get; set; }
    public decimal TotalWins { get; set; }
    public decimal Revenue { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AverageSessionDuration { get; set; }
    public decimal AverageBetSize { get; set; }
    public double ActualRtp { get; set; }
    public double RetentionRate { get; set; }
    public double PopularityScore { get; set; }
    public int RecommendationCount { get; set; }
    public int RecommendationImpressions { get; set; }
    public int RecommendationClicks { get; set; }
    public double RecommendationCtr { get; set; }
    public DateTime LastUpdated { get; set; }
}

/// <summary>
/// Request model for generating game recommendations
/// </summary>
public class RecommendationRequest
{
    public long PlayerId { get; set; }
    public int Count { get; set; } = 10;
    public string? Algorithm { get; set; }
    public string Context { get; set; } = string.Empty;
    public string? SessionId { get; set; }
    public string? Platform { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    public Dictionary<string, object>? Parameters { get; set; }
}

/// <summary>
/// Game recommendation response model
/// </summary>
public class GameRecommendationDto
{
    public long Id { get; set; }
    public long PlayerId { get; set; }
    public long GameId { get; set; }
    public GameDto? Game { get; set; }
    public string GameTypeName { get; set; } = string.Empty;
    public double Score { get; set; }
    public string Algorithm { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public int Position { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Context { get; set; } = string.Empty;
    public string? Variant { get; set; }
    public DateTime GeneratedDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsActive { get; set; }
    public bool IsClicked { get; set; }
    public bool IsPlayed { get; set; }
    public DateTime? ClickedAt { get; set; }
    public DateTime? PlayedAt { get; set; }
    public string? ModelVersion { get; set; }
    public string? SessionId { get; set; }
    public string? Platform { get; set; }
    public Dictionary<string, object>? Features { get; set; }
}
