using System.ComponentModel.DataAnnotations;

namespace GAIming.Core.Options;

/// <summary>
/// Base options class with validation
/// </summary>
public abstract class BaseOptions
{
    /// <summary>
    /// Validate options configuration
    /// </summary>
    public virtual IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(this, validationContext, results, true);
        return results;
    }

    /// <summary>
    /// Check if options are valid
    /// </summary>
    public virtual bool IsValid()
    {
        var context = new ValidationContext(this);
        return !Validate(context).Any();
    }
}

/// <summary>
/// Database connection options
/// </summary>
public class DatabaseOptions : BaseOptions
{
    public const string SectionName = "Database";

    [Required]
    public string ProgressPlayConnectionString { get; set; } = string.Empty;

    [Required]
    public string GAImingConnectionString { get; set; } = string.Empty;

    [Range(1, 300)]
    public int CommandTimeout { get; set; } = 30;

    [Range(1, 3600)]
    public int LongRunningCommandTimeout { get; set; } = 300;

    public bool EnableSensitiveDataLogging { get; set; } = false;

    public bool EnableDetailedErrors { get; set; } = false;

    [Range(1, 1000)]
    public int MaxRetryCount { get; set; } = 3;

    [Range(1, 60)]
    public int MaxRetryDelay { get; set; } = 30;

    public bool EnableConnectionPooling { get; set; } = true;

    [Range(1, 1000)]
    public int MaxPoolSize { get; set; } = 100;

    [Range(1, 60)]
    public int ConnectionLifetime { get; set; } = 30;
}

/// <summary>
/// Authentication options
/// </summary>
public class AuthenticationOptions : BaseOptions
{
    public const string SectionName = "Authentication";

    [Required]
    [MinLength(32)]
    public string JwtSecretKey { get; set; } = string.Empty;

    [Required]
    public string JwtIssuer { get; set; } = "GAIming";

    [Required]
    public string JwtAudience { get; set; } = "GAIming-Users";

    [Range(1, 1440)]
    public int AccessTokenExpiryMinutes { get; set; } = 60;

    [Range(1, 365)]
    public int RefreshTokenExpiryDays { get; set; } = 30;

    [Range(1, 20)]
    public int MaxFailedLoginAttempts { get; set; } = 5;

    [Range(1, 1440)]
    public int LockoutDurationMinutes { get; set; } = 15;

    public bool RequireEmailConfirmation { get; set; } = true;

    public bool RequireTwoFactor { get; set; } = false;

    [Range(1, 60)]
    public int PasswordResetTokenExpiryMinutes { get; set; } = 15;

    [Range(1, 60)]
    public int EmailConfirmationTokenExpiryMinutes { get; set; } = 30;

    public bool EnableRememberMe { get; set; } = true;

    [Range(1, 365)]
    public int RememberMeDurationDays { get; set; } = 30;
}

/// <summary>
/// Caching options
/// </summary>
public class CachingOptions : BaseOptions
{
    public const string SectionName = "Caching";

    [Required]
    public string ConnectionString { get; set; } = string.Empty;

    [Range(0, 15)]
    public int Database { get; set; } = 0;

    [Range(1, 3600)]
    public int DefaultExpiryMinutes { get; set; } = 60;

    [Range(1, 1440)]
    public int GamesCacheExpiryMinutes { get; set; } = 30;

    [Range(1, 60)]
    public int PlayerFeaturesCacheExpiryMinutes { get; set; } = 15;

    [Range(1, 30)]
    public int RecommendationsCacheExpiryMinutes { get; set; } = 5;

    public bool EnableCompression { get; set; } = true;

    public string KeyPrefix { get; set; } = "gaiming:";

    [Range(1, 10)]
    public int MaxRetryAttempts { get; set; } = 3;

    [Range(100, 10000)]
    public int RetryDelayMilliseconds { get; set; } = 1000;

    public bool EnableDistributedLocking { get; set; } = true;

    [Range(1, 300)]
    public int LockTimeoutSeconds { get; set; } = 30;
}

/// <summary>
/// Recommendation engine options
/// </summary>
public class RecommendationOptions : BaseOptions
{
    public const string SectionName = "Recommendations";

    [Required]
    public string DefaultAlgorithm { get; set; } = "CollaborativeFiltering";

    [Range(1, 100)]
    public int DefaultRecommendationCount { get; set; } = 10;

    [Range(1, 100)]
    public int MaxRecommendationCount { get; set; } = 50;

    [Range(0.0, 1.0)]
    public double MinRecommendationScore { get; set; } = 0.1;

    [Range(1, 168)]
    public int RecommendationExpiryHours { get; set; } = 24;

    public bool EnableRealTimeRecommendations { get; set; } = true;

    public bool EnableABTesting { get; set; } = true;

    [Range(0.0, 1.0)]
    public double ExplorationRate { get; set; } = 0.1;

    public bool EnableDiversification { get; set; } = true;

    [Range(0.0, 1.0)]
    public double DiversificationWeight { get; set; } = 0.3;

    public bool EnableBusinessRules { get; set; } = true;

    public bool EnableResponsibleGaming { get; set; } = true;

    [Range(1, 10)]
    public int MaxRecommendationsPerGameType { get; set; } = 3;

    public List<string> EnabledAlgorithms { get; set; } = new()
    {
        "CollaborativeFiltering",
        "ContentBased",
        "Hybrid",
        "PopularityBased"
    };

    public Dictionary<string, double> AlgorithmWeights { get; set; } = new()
    {
        { "CollaborativeFiltering", 0.4 },
        { "ContentBased", 0.3 },
        { "PopularityBased", 0.2 },
        { "Hybrid", 0.1 }
    };
}

/// <summary>
/// Analytics options
/// </summary>
public class AnalyticsOptions : BaseOptions
{
    public const string SectionName = "Analytics";

    [Range(1, 100)]
    public int DefaultPageSize { get; set; } = 20;

    [Range(1, 1000)]
    public int MaxPageSize { get; set; } = 100;

    [Range(1, 300)]
    public int DashboardRefreshIntervalSeconds { get; set; } = 30;

    [Range(1, 168)]
    public int RealTimeMetricsRetentionHours { get; set; } = 24;

    [Range(1, 3650)]
    public int HistoricalMetricsRetentionDays { get; set; } = 365;

    public bool EnableRealTimeAnalytics { get; set; } = true;

    public bool EnablePlayerSegmentation { get; set; } = true;

    public bool EnableCohortAnalysis { get; set; } = true;

    public bool EnableFunnelAnalysis { get; set; } = true;

    [Range(1, 100)]
    public int MaxConcurrentAnalyticsJobs { get; set; } = 10;

    [Range(1, 1440)]
    public int AnalyticsJobTimeoutMinutes { get; set; } = 60;

    public List<string> EnabledMetrics { get; set; } = new()
    {
        "ClickThroughRate",
        "ConversionRate",
        "Revenue",
        "Engagement",
        "Retention"
    };
}

/// <summary>
/// File processing options
/// </summary>
public class FileProcessingOptions : BaseOptions
{
    public const string SectionName = "FileProcessing";

    [Range(1024, 104857600)] // 1KB to 100MB
    public int MaxFileSize { get; set; } = 50 * 1024 * 1024; // 50MB

    [Range(1, 10000)]
    public int ImportBatchSize { get; set; } = 1000;

    [Range(1, 100000)]
    public int ExportBatchSize { get; set; } = 10000;

    [Range(1, 365)]
    public int FileRetentionDays { get; set; } = 30;

    public string TempDirectory { get; set; } = Path.GetTempPath();

    public string ExportDirectory { get; set; } = "exports";

    public List<string> AllowedFileExtensions { get; set; } = new()
    {
        ".csv", ".xlsx", ".json", ".xml"
    };

    public List<string> AllowedMimeTypes { get; set; } = new()
    {
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/json",
        "application/xml"
    };

    public bool EnableVirusScanning { get; set; } = false;

    public bool EnableEncryption { get; set; } = true;

    [Range(1, 10)]
    public int MaxConcurrentProcessingJobs { get; set; } = 3;
}

/// <summary>
/// Security options
/// </summary>
public class SecurityOptions : BaseOptions
{
    public const string SectionName = "Security";

    [Range(8, 128)]
    public int MinPasswordLength { get; set; } = 8;

    [Range(8, 256)]
    public int MaxPasswordLength { get; set; } = 128;

    public bool RequireUppercase { get; set; } = true;

    public bool RequireLowercase { get; set; } = true;

    public bool RequireDigit { get; set; } = true;

    public bool RequireSpecialCharacter { get; set; } = true;

    [Range(1, 24)]
    public int PasswordHistoryCount { get; set; } = 5;

    [Range(1, 365)]
    public int PasswordExpiryDays { get; set; } = 90;

    public bool EnablePasswordExpiry { get; set; } = false;

    [Range(1, 1440)]
    public int SessionTimeoutMinutes { get; set; } = 60;

    public bool EnableConcurrentSessionLimit { get; set; } = true;

    [Range(1, 10)]
    public int MaxConcurrentSessions { get; set; } = 3;

    public bool EnableIpWhitelisting { get; set; } = false;

    public List<string> WhitelistedIpAddresses { get; set; } = new();

    public bool EnableRateLimiting { get; set; } = true;

    [Range(1, 10000)]
    public int RateLimitRequests { get; set; } = 1000;

    [Range(1, 1440)]
    public int RateLimitWindowMinutes { get; set; } = 60;

    public bool EnableAuditLogging { get; set; } = true;

    [Range(1, 3650)]
    public int AuditLogRetentionDays { get; set; } = 365;
}

/// <summary>
/// Email options
/// </summary>
public class EmailOptions : BaseOptions
{
    public const string SectionName = "Email";

    [Required]
    public string SmtpHost { get; set; } = string.Empty;

    [Range(1, 65535)]
    public int SmtpPort { get; set; } = 587;

    public bool EnableSsl { get; set; } = true;

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string FromAddress { get; set; } = string.Empty;

    [Required]
    public string FromName { get; set; } = string.Empty;

    [Range(1, 300)]
    public int TimeoutSeconds { get; set; } = 30;

    [Range(1, 10)]
    public int MaxRetryAttempts { get; set; } = 3;

    public bool EnableTemplating { get; set; } = true;

    public string TemplateDirectory { get; set; } = "templates";

    [Range(1, 1000)]
    public int MaxRecipientsPerEmail { get; set; } = 100;

    public bool EnableEmailQueue { get; set; } = true;

    [Range(1, 3650)]
    public int EmailLogRetentionDays { get; set; } = 30;
}

/// <summary>
/// Logging options
/// </summary>
public class LoggingOptions : BaseOptions
{
    public const string SectionName = "Logging";

    public string LogLevel { get; set; } = "Information";

    public bool EnableConsoleLogging { get; set; } = true;

    public bool EnableFileLogging { get; set; } = true;

    public string LogDirectory { get; set; } = "logs";

    public string LogFilePattern { get; set; } = "gaiming-{Date}.log";

    [Range(1, 1000)]
    public int MaxLogFileSizeMB { get; set; } = 100;

    [Range(1, 365)]
    public int LogRetentionDays { get; set; } = 30;

    public bool EnableStructuredLogging { get; set; } = true;

    public bool EnablePerformanceLogging { get; set; } = true;

    public bool EnableSecurityLogging { get; set; } = true;

    [Range(1, 10000)]
    public int MaxLogEntriesPerMinute { get; set; } = 1000;

    public List<string> SensitiveProperties { get; set; } = new()
    {
        "password", "token", "secret", "key", "connectionstring"
    };
}

/// <summary>
/// Health check options
/// </summary>
public class HealthCheckOptions : BaseOptions
{
    public const string SectionName = "HealthCheck";

    [Range(1, 300)]
    public int TimeoutSeconds { get; set; } = 30;

    [Range(1, 3600)]
    public int CacheDurationSeconds { get; set; } = 60;

    public bool EnableDetailedChecks { get; set; } = true;

    public bool EnableDatabaseCheck { get; set; } = true;

    public bool EnableCacheCheck { get; set; } = true;

    public bool EnableExternalServiceChecks { get; set; } = true;

    public List<string> ExternalServices { get; set; } = new();

    [Range(1, 60)]
    public int CheckIntervalMinutes { get; set; } = 5;

    public bool EnableHealthCheckEndpoint { get; set; } = true;

    public string HealthCheckPath { get; set; } = "/health";
}
