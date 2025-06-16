using GAIming.Core.Entities;
using GAIming.Core.Models;
using GAIming.Core.Specifications;

namespace GAIming.Core.Interfaces;



/// <summary>
/// Repository interface for Game entities (ProgressPlay DB - Read Only)
/// </summary>
public interface IGameRepository : IRepository<Game>
{
    Task<PaginatedResponse<Game>> SearchGamesAsync(GameSearchRequest request);
    Task<IEnumerable<Game>> GetGamesByProviderAsync(int providerId);
    Task<IEnumerable<Game>> GetGamesByTypeAsync(int gameTypeId);
    Task<IEnumerable<Game>> GetActiveGamesAsync();
    Task<IEnumerable<Game>> GetFeaturedGamesAsync();
    Task<Game?> GetGameByNameAsync(string gameName);
    Task<IEnumerable<Game>> GetGamesByTagsAsync(List<string> tags);
    Task<IEnumerable<Game>> GetTrendingGamesAsync(string timeframe, int count, long? playerId = null);
}

/// <summary>
/// Repository interface for GameProvider entities (ProgressPlay DB - Read Only)
/// </summary>
public interface IGameProviderRepository : IRepository<GameProvider>
{
    Task<IEnumerable<GameProvider>> GetActiveProvidersAsync();
    Task<GameProvider?> GetProviderByNameAsync(string name);
    Task<IEnumerable<GameProvider>> GetProvidersWithGamesAsync();
}

/// <summary>
/// Repository interface for GameType entities (ProgressPlay DB - Read Only)
/// </summary>
public interface IGameTypeRepository : IRepository<GameType>
{
    Task<IEnumerable<GameType>> GetActiveGameTypesAsync();
    Task<GameType?> GetGameTypeByNameAsync(string name);
    Task<IEnumerable<GameType>> GetGameTypesWithGamesAsync();
}

/// <summary>
/// Repository interface for Player entities (ProgressPlay DB - Read Only)
/// </summary>
public interface IPlayerRepository : IRepository<Player>
{
    Task<Player?> GetPlayerByUsernameAsync(string username);
    Task<Player?> GetPlayerByEmailAsync(string email);
    Task<IEnumerable<Player>> GetActivePlayersAsync();
    Task<IEnumerable<Player>> GetPlayersByCountryAsync(string country);
    Task<IEnumerable<Player>> GetPlayersByVipLevelAsync(int vipLevel);
    Task<IEnumerable<Player>> GetPlayersByRiskLevelAsync(int riskLevel);
    Task<PaginatedResponse<Player>> SearchPlayersAsync(PlayerAnalyticsRequest request);
}

/// <summary>
/// Repository interface for PlayedGame entities (ProgressPlay DB - Read Only)
/// </summary>
public interface IPlayedGameRepository : IRepository<PlayedGame>
{
    Task<IEnumerable<PlayedGame>> GetPlayerSessionsAsync(long playerId, DateTime? startDate = null, DateTime? endDate = null);
    Task<IEnumerable<PlayedGame>> GetGameSessionsAsync(int gameId, DateTime? startDate = null, DateTime? endDate = null);
    Task<IEnumerable<PlayedGame>> GetActiveSessionsAsync();
    Task<IEnumerable<PlayedGame>> GetCompletedSessionsAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<decimal> GetPlayerTotalBetsAsync(long playerId, DateTime? startDate = null, DateTime? endDate = null);
    Task<decimal> GetPlayerTotalWinsAsync(long playerId, DateTime? startDate = null, DateTime? endDate = null);
    Task<int> GetPlayerSessionCountAsync(long playerId, DateTime? startDate = null, DateTime? endDate = null);
}

/// <summary>
/// Repository interface for AccountTransaction entities (ProgressPlay DB - Read Only)
/// </summary>
public interface IAccountTransactionRepository : IRepository<AccountTransaction>
{
    Task<IEnumerable<AccountTransaction>> GetPlayerTransactionsAsync(long playerId, DateTime? startDate = null, DateTime? endDate = null);
    Task<IEnumerable<AccountTransaction>> GetTransactionsByTypeAsync(string transactionType, DateTime? startDate = null, DateTime? endDate = null);
    Task<decimal> GetPlayerTotalDepositsAsync(long playerId);
    Task<decimal> GetPlayerTotalWithdrawalsAsync(long playerId);
    Task<decimal> GetPlayerCurrentBalanceAsync(long playerId);
}

/// <summary>
/// Repository interface for GameRecommendation entities (GAIming DB)
/// </summary>
public interface IGameRecommendationRepository : IRepository<GameRecommendation>
{
    Task<IEnumerable<GameRecommendation>> GetPlayerRecommendationsAsync(long playerId, string? context = null);
    Task<IEnumerable<GameRecommendation>> GetGameRecommendationsAsync(long gameId);
    Task<IEnumerable<GameRecommendation>> GetRecommendationsByAlgorithmAsync(string algorithm);
    Task<PaginatedResponse<GameRecommendation>> GetRecommendationAnalyticsAsync(RecommendationAnalyticsRequest request);
    Task MarkRecommendationClickedAsync(long recommendationId);
    Task MarkRecommendationPlayedAsync(long recommendationId);
    Task<double> GetAlgorithmPerformanceAsync(string algorithm, DateTime startDate, DateTime endDate);
}

/// <summary>
/// Repository interface for PlayerFeatureEntity entities (GAIming DB)
/// </summary>
public interface IPlayerFeatureRepository : IRepository<PlayerFeatureEntity>
{
    Task<PlayerFeatureEntity?> GetByPlayerIdAsync(long playerId);
    Task UpdatePlayerFeaturesAsync(PlayerFeatureEntity features);
    Task<IEnumerable<PlayerFeatureEntity>> GetFeaturesForTrainingAsync();
    Task<IEnumerable<PlayerFeatureEntity>> GetSimilarPlayersAsync(long playerId, int count = 10);
}

/// <summary>
/// Repository interface for GameFeatureEntity entities (GAIming DB)
/// </summary>
public interface IGameFeatureRepository : IRepository<GameFeatureEntity>
{
    Task<GameFeatureEntity?> GetByGameIdAsync(long gameId);
    Task UpdateGameFeaturesAsync(GameFeatureEntity features);
    Task<IEnumerable<GameFeatureEntity>> GetFeaturesForTrainingAsync();
    Task<IEnumerable<GameFeatureEntity>> GetSimilarGamesAsync(long gameId, int count = 10);
}

/// <summary>
/// Repository interface for RecommendationModel entities (GAIming DB)
/// </summary>
public interface IRecommendationModelRepository : IRepository<RecommendationModel>
{
    Task<RecommendationModel?> GetActiveModelAsync(string algorithm);
    Task<IEnumerable<RecommendationModel>> GetModelsByAlgorithmAsync(string algorithm);
    Task SetModelActiveAsync(long modelId);
    Task RetireModelAsync(long modelId);
}

/// <summary>
/// Repository interface for ABTestExperiment entities (GAIming DB)
/// </summary>
public interface IABTestExperimentRepository : IRepository<ABTestExperiment>
{
    Task<IEnumerable<ABTestExperiment>> GetActiveExperimentsAsync();
    Task<ABTestExperiment?> GetExperimentByNameAsync(string name);
    Task<IEnumerable<ABTestExperiment>> GetCompletedExperimentsAsync();
    Task StartExperimentAsync(long experimentId);
    Task StopExperimentAsync(long experimentId);
    Task SetWinningVariantAsync(long experimentId, string variantName);
}

/// <summary>
/// Repository interface for RecommendationInteraction entities (GAIming DB)
/// </summary>
public interface IRecommendationInteractionRepository : IRepository<RecommendationInteraction>
{
    Task<IEnumerable<RecommendationInteraction>> GetPlayerInteractionsAsync(long playerId);
    Task<IEnumerable<RecommendationInteraction>> GetRecommendationInteractionsAsync(long recommendationId);
    Task<IEnumerable<RecommendationInteraction>> GetInteractionsByTypeAsync(string interactionType);
    Task TrackInteractionAsync(RecommendationInteraction interaction);
}

/// <summary>
/// Repository interface for ModelPerformanceMetric entities (GAIming DB)
/// </summary>
public interface IModelPerformanceMetricRepository : IRepository<ModelPerformanceMetric>
{
    Task<IEnumerable<ModelPerformanceMetric>> GetModelMetricsAsync(long modelId);
    Task<IEnumerable<ModelPerformanceMetric>> GetMetricsByNameAsync(string metricName);
    Task<ModelPerformanceMetric?> GetLatestMetricAsync(long modelId, string metricName);
    Task RecordMetricAsync(ModelPerformanceMetric metric);
}

/// <summary>
/// Repository interface for PlayerRiskAssessmentEntity entities (GAIming DB)
/// </summary>
public interface IPlayerRiskAssessmentRepository : IRepository<PlayerRiskAssessmentEntity>
{
    Task<PlayerRiskAssessmentEntity?> GetLatestAssessmentAsync(long playerId);
    Task<IEnumerable<PlayerRiskAssessmentEntity>> GetAssessmentHistoryAsync(long playerId);
    Task<IEnumerable<PlayerRiskAssessmentEntity>> GetPlayersByRiskLevelAsync(int riskLevel);
    Task<IEnumerable<PlayerRiskAssessmentEntity>> GetExpiredAssessmentsAsync();
    Task UpdateRiskAssessmentAsync(PlayerRiskAssessmentEntity assessment);
}

/// <summary>
/// Repository interface for User entities (GAIming DB)
/// </summary>
public interface IUserRepository : IRepository<User>
{
    Task<User?> GetUserByUsernameAsync(string username);
    Task<User?> GetUserByEmailAsync(string email);
    Task<IEnumerable<User>> GetActiveUsersAsync();
    Task<IEnumerable<User>> GetUsersByRoleAsync(string roleName);
    Task<bool> ValidatePasswordAsync(long userId, string password);
    Task UpdatePasswordAsync(long userId, string passwordHash);
    Task UpdateLastLoginAsync(long userId, string ipAddress);
}

/// <summary>
/// Repository interface for Role entities (GAIming DB)
/// </summary>
public interface IRoleRepository : IRepository<Role>
{
    Task<Role?> GetRoleByNameAsync(string name);
    Task<IEnumerable<Role>> GetActiveRolesAsync();
    Task<IEnumerable<Role>> GetUserRolesAsync(long userId);
    Task<IEnumerable<Role>> GetSystemRolesAsync();
}

/// <summary>
/// Repository interface for Permission entities (GAIming DB)
/// </summary>
public interface IPermissionRepository : IRepository<Permission>
{
    Task<Permission?> GetPermissionByNameAsync(string name);
    Task<IEnumerable<Permission>> GetActivePermissionsAsync();
    Task<IEnumerable<Permission>> GetRolePermissionsAsync(long roleId);
    Task<IEnumerable<Permission>> GetUserPermissionsAsync(long userId);
    Task<IEnumerable<Permission>> GetPermissionsByResourceAsync(string resource);
}

/// <summary>
/// Repository interface for RefreshToken entities (GAIming DB)
/// </summary>
public interface IRefreshTokenRepository : IRepository<RefreshToken>
{
    Task<RefreshToken?> GetValidTokenAsync(string token);
    Task<IEnumerable<RefreshToken>> GetUserTokensAsync(long userId);
    Task RevokeTokenAsync(string token, string revokedByIp, string reason);
    Task RevokeAllUserTokensAsync(long userId, string revokedByIp, string reason);
    Task CleanupExpiredTokensAsync();
}

/// <summary>
/// Repository interface for GameManagementSettings entities (GAIming DB)
/// </summary>
public interface IGameManagementSettingsRepository : IRepository<GAIming.Core.Entities.GameManagementSettings>
{
    Task<GAIming.Core.Entities.GameManagementSettings?> GetByGameIdAsync(long gameId);
    Task<IEnumerable<GAIming.Core.Entities.GameManagementSettings>> GetFeaturedGamesAsync();
    Task<IEnumerable<GAIming.Core.Entities.GameManagementSettings>> GetGamesByTagAsync(string tag);
    Task UpdateGameSettingsAsync(GAIming.Core.Entities.GameManagementSettings settings);
}

/// <summary>
/// Repository interface for AuditLog entities (GAIming DB)
/// </summary>
public interface IAuditLogRepository : IRepository<AuditLog>
{
    Task<PaginatedResponse<AuditLog>> SearchAuditLogsAsync(AuditLogSearchRequest request);
    Task<IEnumerable<AuditLog>> GetEntityAuditLogsAsync(string entityName, string entityId);
    Task<IEnumerable<AuditLog>> GetUserAuditLogsAsync(string userId);
    Task LogAsync(string entityName, string entityId, string action, object? oldValues, object? newValues, string? userId, string? userName, string? ipAddress, string? userAgent);
}

/// <summary>
/// Repository interface for SystemConfiguration entities (GAIming DB)
/// </summary>
public interface ISystemConfigurationRepository : IRepository<SystemConfiguration>
{
    Task<SystemConfiguration?> GetConfigurationAsync(string key);
    Task<IEnumerable<SystemConfiguration>> GetConfigurationsByCategoryAsync(string category);
    Task<string?> GetConfigurationValueAsync(string key);
    Task SetConfigurationValueAsync(string key, string value, string? updatedBy = null);
}

/// <summary>
/// Repository interface for ScheduledTask entities (GAIming DB)
/// </summary>
public interface IScheduledTaskRepository : IRepository<ScheduledTask>
{
    Task<IEnumerable<ScheduledTask>> GetEnabledTasksAsync();
    Task<IEnumerable<ScheduledTask>> GetTasksDueForExecutionAsync();
    Task<ScheduledTask?> GetTaskByNameAsync(string name);
    Task UpdateTaskStatusAsync(long taskId, bool isRunning, DateTime? lastRunDate = null, string? lastRunStatus = null);
}

/// <summary>
/// Repository interface for SystemNotification entities (GAIming DB)
/// </summary>
public interface ISystemNotificationRepository : IRepository<SystemNotification>
{
    Task<IEnumerable<SystemNotification>> GetUserNotificationsAsync(long userId, bool unreadOnly = false);
    Task<IEnumerable<SystemNotification>> GetGlobalNotificationsAsync(bool unreadOnly = false);
    Task MarkNotificationReadAsync(long notificationId, long userId);
    Task MarkAllNotificationsReadAsync(long userId);
    Task<int> GetUnreadNotificationCountAsync(long userId);
}

/// <summary>
/// Repository interface for domain entities (GAIming DB)
/// </summary>
public interface IDomainEntityRepository : IRepository<DomainEntity>
{
    Task<PaginatedResponse<DomainEntity>> SearchEntitiesAsync(string? searchTerm, int page = 1, int pageSize = 20);
    Task<DomainEntityStatistics> GetStatisticsAsync();
    Task<IEnumerable<DomainEntity>> GetEntitiesByTypeAsync(string entityType);
}

/// <summary>
/// Alias for IAuditLogRepository to match Infrastructure usage
/// </summary>
public interface IAuditRepository : IAuditLogRepository
{
}
