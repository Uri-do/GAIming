using GAIming.Core.Models;
using GAIming.Core.Common;

namespace GAIming.Core.Interfaces;

/// <summary>
/// File service interface for file operations
/// </summary>
public interface IFileService
{
    /// <summary>
    /// Uploads a file
    /// </summary>
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string? contentType = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Downloads a file
    /// </summary>
    Task<Stream> DownloadFileAsync(string fileKey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a file
    /// </summary>
    Task<bool> DeleteFileAsync(string fileKey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets file metadata
    /// </summary>
    Task<FileMetadata?> GetFileMetadataAsync(string fileKey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if file exists
    /// </summary>
    Task<bool> FileExistsAsync(string fileKey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets file URL for direct access
    /// </summary>
    Task<string> GetFileUrlAsync(string fileKey, TimeSpan? expiration = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lists files with pagination
    /// </summary>
    Task<PaginatedResponse<FileMetadata>> ListFilesAsync(int page = 1, int pageSize = 50, string? prefix = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Saves file content
    /// </summary>
    Task<string> SaveFileAsync(string fileName, byte[] content, CancellationToken cancellationToken = default);
}

/// <summary>
/// Interface for game management services
/// </summary>
public interface IGameManagementService
{
    /// <summary>
    /// Gets paginated games for management
    /// </summary>
    Task<PaginatedResponse<GameManagementDto>> GetGamesAsync(GameManagementRequest request);

    /// <summary>
    /// Gets detailed game information for management
    /// </summary>
    Task<GameManagementDetailDto> GetGameDetailAsync(long gameId);

    /// <summary>
    /// Gets game analytics data
    /// </summary>
    Task<GameAnalyticsDto> GetGameAnalyticsAsync(long gameId, int days);

    /// <summary>
    /// Updates game configuration
    /// </summary>
    Task<GameManagementDto> UpdateGameAsync(long gameId, UpdateGameRequest request);

    /// <summary>
    /// Bulk updates multiple games
    /// </summary>
    Task<BulkUpdateResult> BulkUpdateGamesAsync(BulkUpdateGamesRequest request);

    /// <summary>
    /// Compares multiple games performance
    /// </summary>
    Task<GameComparisonResult> CompareGamesAsync(List<long> gameIds, int days);

    /// <summary>
    /// Gets game recommendation settings
    /// </summary>
    Task<GameRecommendationSettings> GetGameRecommendationSettingsAsync(long gameId);

    /// <summary>
    /// Updates game recommendation settings
    /// </summary>
    Task<GameRecommendationSettings> UpdateGameRecommendationSettingsAsync(long gameId, GameRecommendationSettings settings);

    /// <summary>
    /// Refreshes game data and analytics
    /// </summary>
    Task<GameRefreshResult> RefreshGameDataAsync(long gameId);

    /// <summary>
    /// Gets games dashboard overview
    /// </summary>
    Task<GamesDashboardDto> GetGamesDashboardAsync(int days);

    /// <summary>
    /// Exports games data
    /// </summary>
    Task<ExportResult> ExportGamesAsync(ExportGamesRequest request);
}

/// <summary>
/// Interface for player analytics services
/// </summary>
public interface IPlayerAnalyticsService
{
    /// <summary>
    /// Gets comprehensive player analytics dashboard
    /// </summary>
    Task<PlayerAnalyticsDashboard> GetPlayerDashboardAsync(long playerId, DateTime startDate, DateTime endDate);

    /// <summary>
    /// Gets player behavior analysis
    /// </summary>
    Task<PlayerBehaviorAnalysis> GetPlayerBehaviorAsync(long playerId, DateTime startDate, DateTime endDate);

    /// <summary>
    /// Gets player recommendation performance
    /// </summary>
    Task<PlayerRecommendationPerformance> GetPlayerRecommendationPerformanceAsync(long playerId, DateTime startDate, DateTime endDate);

    /// <summary>
    /// Gets player game preferences
    /// </summary>
    Task<PlayerGamePreferences> GetPlayerGamePreferencesAsync(long playerId);

    /// <summary>
    /// Gets player risk assessment
    /// </summary>
    Task<PlayerRiskAssessment> GetPlayerRiskAssessmentAsync(long playerId);

    /// <summary>
    /// Gets player segment information
    /// </summary>
    Task<PlayerSegment> GetPlayerSegmentAsync(long playerId);

    /// <summary>
    /// Gets players overview analytics
    /// </summary>
    Task<PlayersOverviewDto> GetPlayersOverviewAsync(DateTime startDate, DateTime endDate, int topCount);

    /// <summary>
    /// Gets cohort analysis
    /// </summary>
    Task<CohortAnalysisDto> GetCohortAnalysisAsync(string cohortType, int periods);

    /// <summary>
    /// Gets paginated player analytics data
    /// </summary>
    Task<PaginatedResponse<PlayerAnalyticsDto>> GetPlayerAnalyticsAsync(PlayerAnalyticsRequest request);
}
