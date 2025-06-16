using System.Linq.Expressions;
using GAIming.Core.Models;
using GAIming.Core.Entities;

namespace GAIming.Core.Interfaces;

/// <summary>
/// Cache service interface
/// </summary>
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default);
    Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> getItem, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default);
    Task<bool> PingAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Email service interface
/// </summary>
public interface IEmailService
{
    Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true, CancellationToken cancellationToken = default);
    Task<bool> SendEmailAsync(IEnumerable<string> to, string subject, string body, bool isHtml = true, CancellationToken cancellationToken = default);
    Task<bool> SendEmailWithAttachmentsAsync(string to, string subject, string body, IEnumerable<EmailAttachment> attachments, bool isHtml = true, CancellationToken cancellationToken = default);
    Task<bool> SendTemplatedEmailAsync(string to, string templateName, object model, CancellationToken cancellationToken = default);
    Task<bool> SendDataExportEmailAsync(string to, string fileName, string filePath, int recordCount, CancellationToken cancellationToken = default);
    Task<bool> SendDataExportErrorEmailAsync(string to, string errorMessage, CancellationToken cancellationToken = default);
}

/// <summary>
/// File storage service interface
/// </summary>
public interface IFileStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string? contentType = null, CancellationToken cancellationToken = default);
    Task<Stream> DownloadFileAsync(string fileKey, CancellationToken cancellationToken = default);
    Task<bool> DeleteFileAsync(string fileKey, CancellationToken cancellationToken = default);
    Task<FileMetadata?> GetFileMetadataAsync(string fileKey, CancellationToken cancellationToken = default);
    Task<bool> FileExistsAsync(string fileKey, CancellationToken cancellationToken = default);
    Task<string> GetDownloadUrlAsync(string fileKey, TimeSpan expiration, CancellationToken cancellationToken = default);
    Task<PaginatedResponse<FileMetadata>> ListFilesAsync(int page = 1, int pageSize = 50, string? prefix = null, CancellationToken cancellationToken = default);
    Task<string> SaveFileAsync(string fileName, byte[] content, CancellationToken cancellationToken = default);
}

/// <summary>
/// Background job service interface
/// </summary>
public interface IBackgroundJobService
{
    Task<string> EnqueueAsync<T>(Expression<Func<T, Task>> methodCall);
    Task<string> ScheduleAsync<T>(Expression<Func<T, Task>> methodCall, TimeSpan delay);
    Task<string> RecurringAsync<T>(string jobId, Expression<Func<T, Task>> methodCall, string cronExpression);
    Task<bool> DeleteAsync(string jobId);
    Task<JobStatus?> GetJobStatusAsync(string jobId);
}

/// <summary>
/// Metrics service interface for monitoring and telemetry
/// </summary>
public interface IMetricsService
{
    void IncrementCounter(string name, string[]? labels = null);
    void RecordHistogram(string name, double value, string[]? labels = null);
    void SetGauge(string name, double value, string[]? labels = null);
    void RecordTimer(string name, TimeSpan duration, string[]? labels = null);
    void RecordMeter(string name, long value, string[]? labels = null);
}

/// <summary>
/// JWT token service interface for token management
/// </summary>
public interface IJwtTokenService
{
    string GenerateToken(string userId, string username, IEnumerable<string> roles, IEnumerable<string>? permissions = null);
    bool ValidateToken(string token);
    string? GetUserIdFromToken(string token);
    string? GetUsernameFromToken(string token);
    IEnumerable<string> GetRolesFromToken(string token);
    IEnumerable<string> GetPermissionsFromToken(string token);
    DateTime? GetTokenExpiration(string token);
    string? GetClaimFromToken(string token, string claimType);
}

/// <summary>
/// Refresh token service interface for token refresh management
/// </summary>
public interface IRefreshTokenService
{
    Task<string> GenerateRefreshTokenAsync(string userId, string ipAddress);
    Task<bool> ValidateRefreshTokenAsync(string refreshToken, string userId);
    Task RevokeRefreshTokenAsync(string refreshToken, string revokedByIp, string reason);
    Task RevokeAllRefreshTokensAsync(string userId, string revokedByIp, string reason);
    Task<string?> GetUserIdFromRefreshTokenAsync(string refreshToken);
    Task CleanupExpiredTokensAsync();
}

/// <summary>
/// Configuration service interface
/// </summary>
public interface IConfigurationService
{
    T GetValue<T>(string key, T defaultValue = default!);
    string GetConnectionString(string name);
    bool IsFeatureEnabled(string featureName);
    void ReloadConfiguration();
    IEnumerable<KeyValuePair<string, string>> GetSection(string sectionName);
}

/// <summary>
/// Logging service interface
/// </summary>
public interface ILoggingService
{
    void LogInformation(string message, params object[] args);
    void LogWarning(string message, params object[] args);
    void LogError(string message, Exception? exception = null, params object[] args);
    void LogDebug(string message, params object[] args);
    void LogCritical(string message, Exception? exception = null, params object[] args);
    void LogTrace(string message, params object[] args);
}

/// <summary>
/// Health check service interface
/// </summary>
public interface IHealthCheckService
{
    Task<HealthCheckResult> CheckHealthAsync(CancellationToken cancellationToken = default);
    Task<HealthCheckResult> CheckDatabaseHealthAsync(CancellationToken cancellationToken = default);
    Task<HealthCheckResult> CheckCacheHealthAsync(CancellationToken cancellationToken = default);
    Task<HealthCheckResult> CheckExternalServiceHealthAsync(string serviceName, CancellationToken cancellationToken = default);
    Task<Dictionary<string, HealthCheckResult>> CheckAllHealthAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Validation service interface
/// </summary>
public interface IValidationService
{
    Task<ValidationResult> ValidateAsync<T>(T model, CancellationToken cancellationToken = default);
    Task<ValidationResult> ValidatePropertyAsync<T>(T model, string propertyName, CancellationToken cancellationToken = default);
    Task<ValidationResult> ValidateBusinessRulesAsync<T>(T model, CancellationToken cancellationToken = default);
    bool IsValid<T>(T model);
}

/// <summary>
/// Encryption service interface
/// </summary>
public interface IEncryptionService
{
    string Encrypt(string plainText);
    string Decrypt(string cipherText);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hashedPassword);
    string GenerateSecureToken(int length = 32);
    string GenerateApiKey();
}

/// <summary>
/// Date time service interface for testability
/// </summary>
public interface IDateTimeService
{
    DateTime Now { get; }
    DateTime UtcNow { get; }
    DateTime Today { get; }
    DateTimeOffset OffsetNow { get; }
    DateTimeOffset OffsetUtcNow { get; }
}

/// <summary>
/// Common data models
/// </summary>




public class JobStatus
{
    public string Id { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Result { get; set; }
    public string? ErrorMessage { get; set; }
    public int RetryCount { get; set; }
}

public class HealthCheckResult
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // Healthy, Degraded, Unhealthy
    public string? Description { get; set; }
    public TimeSpan Duration { get; set; }
    public Dictionary<string, object> Data { get; set; } = new();
    public Exception? Exception { get; set; }
}



public class ValidationError
{
    public string PropertyName { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
    public string ErrorCode { get; set; } = string.Empty;
    public object? AttemptedValue { get; set; }
}

public class ValidationWarning
{
    public string PropertyName { get; set; } = string.Empty;
    public string WarningMessage { get; set; } = string.Empty;
    public string WarningCode { get; set; } = string.Empty;
}

public class PaginatedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}

// Recommendation Service Interfaces

/// <summary>
/// Real-time recommendation service interface
/// </summary>
public interface IRealTimeRecommendationService
{
    Task<List<GameRecommendation>> GetRecommendationsAsync(long playerId, int count, string? context = null);
    Task RecordInteractionAsync(long recommendationId, RecommendationInteractionType interactionType);
}

/// <summary>
/// Batch recommendation service interface
/// </summary>
public interface IBatchRecommendationService
{
    Task GeneratePlayerRecommendationsAsync(long playerId);
    Task<List<GameRecommendation>> GetBatchRecommendationsAsync(long playerId);
}

/// <summary>
/// Collaborative filtering service interface
/// </summary>
public interface ICollaborativeFilteringService
{
    Task<List<GameRecommendation>> GetCollaborativeRecommendationsAsync(long playerId, int count);
}

/// <summary>
/// Content-based filtering service interface
/// </summary>
public interface IContentBasedFilteringService
{
    Task<List<GameRecommendation>> GetContentBasedRecommendationsAsync(long playerId, int count);
    Task<List<Game>> GetSimilarGamesAsync(long gameId, int count);
}

/// <summary>
/// Hybrid recommendation service interface
/// </summary>
public interface IHybridRecommendationService
{
    Task<List<GameRecommendation>> GetHybridRecommendationsAsync(long playerId, int count);
}

/// <summary>
/// Bandit recommendation service interface
/// </summary>
public interface IBanditRecommendationService
{
    Task<List<GameRecommendation>> GetBanditRecommendationsAsync(long playerId, int count);
}
