namespace GAIming.Core.Common;

/// <summary>
/// Application-wide constants
/// </summary>
public static class Constants
{
    /// <summary>
    /// Database-related constants
    /// </summary>
    public static class Database
    {
        public const string ProgressPlayConnectionName = "ProgressPlayDBTest";
        public const string GAImingConnectionName = "GAImingDB";
        public const int DefaultCommandTimeout = 30;
        public const int LongRunningCommandTimeout = 300;
    }

    /// <summary>
    /// Authentication and authorization constants
    /// </summary>
    public static class Auth
    {
        public const string JwtSecretKey = "JWT_SECRET_KEY";
        public const string JwtIssuer = "GAIming";
        public const string JwtAudience = "GAIming-Users";
        public const int AccessTokenExpiryMinutes = 60;
        public const int RefreshTokenExpiryDays = 30;
        public const int MaxFailedLoginAttempts = 5;
        public const int LockoutDurationMinutes = 15;
        public const string DefaultAdminRole = "Administrator";
        public const string DefaultUserRole = "User";
    }

    /// <summary>
    /// Caching constants
    /// </summary>
    public static class Cache
    {
        public const string GamesCacheKey = "games:all";
        public const string GameProvidersCacheKey = "game-providers:all";
        public const string GameTypesCacheKey = "game-types:all";
        public const string PlayerFeaturesCacheKey = "player-features:{0}";
        public const string GameFeaturesCacheKey = "game-features:{0}";
        public const string RecommendationsCacheKey = "recommendations:{0}:{1}";
        public const int DefaultCacheExpiryMinutes = 60;
        public const int GamesCacheExpiryMinutes = 30;
        public const int PlayerFeaturesCacheExpiryMinutes = 15;
        public const int RecommendationsCacheExpiryMinutes = 5;
    }

    /// <summary>
    /// Recommendation system constants
    /// </summary>
    public static class Recommendations
    {
        public const string DefaultAlgorithm = "CollaborativeFiltering";
        public const int DefaultRecommendationCount = 10;
        public const int MaxRecommendationCount = 50;
        public const double MinRecommendationScore = 0.1;
        public const int RecommendationExpiryHours = 24;
        public const string DefaultContext = "lobby";
        
        public static class Algorithms
        {
            public const string CollaborativeFiltering = "CollaborativeFiltering";
            public const string ContentBased = "ContentBased";
            public const string Hybrid = "Hybrid";
            public const string PopularityBased = "PopularityBased";
            public const string MatrixFactorization = "MatrixFactorization";
            public const string DeepLearning = "DeepLearning";
        }

        public static class Contexts
        {
            public const string Lobby = "lobby";
            public const string Profile = "profile";
            public const string PostGame = "post-game";
            public const string Deposit = "deposit";
            public const string Welcome = "welcome";
            public const string Retention = "retention";
            public const string Winback = "winback";
        }
    }

    /// <summary>
    /// Analytics constants
    /// </summary>
    public static class Analytics
    {
        public const int DefaultPageSize = 20;
        public const int MaxPageSize = 100;
        public const int DashboardRefreshIntervalSeconds = 30;
        public const int RealTimeMetricsRetentionHours = 24;
        public const int HistoricalMetricsRetentionDays = 365;
        
        public static class Metrics
        {
            public const string ClickThroughRate = "ctr";
            public const string ConversionRate = "conversion";
            public const string Revenue = "revenue";
            public const string Engagement = "engagement";
            public const string Retention = "retention";
        }
    }

    /// <summary>
    /// File processing constants
    /// </summary>
    public static class Files
    {
        public const int MaxFileSize = 50 * 1024 * 1024; // 50MB
        public const int ImportBatchSize = 1000;
        public const int ExportBatchSize = 10000;
        public const string TempFilePrefix = "gaiming_temp_";
        public const string ExportFilePrefix = "gaiming_export_";
        public const int FileRetentionDays = 30;
        
        public static class Formats
        {
            public const string Csv = "csv";
            public const string Excel = "xlsx";
            public const string Json = "json";
            public const string Xml = "xml";
            public const string Pdf = "pdf";
        }

        public static class ContentTypes
        {
            public const string Csv = "text/csv";
            public const string Excel = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            public const string Json = "application/json";
            public const string Xml = "application/xml";
            public const string Pdf = "application/pdf";
        }
    }

    /// <summary>
    /// Risk assessment constants
    /// </summary>
    public static class RiskAssessment
    {
        public const int LowRiskLevel = 1;
        public const int MediumRiskLevel = 3;
        public const int HighRiskLevel = 4;
        public const int CriticalRiskLevel = 5;
        public const int AssessmentValidityDays = 7;
        public const decimal HighSpendingThreshold = 1000m;
        public const double HighSessionFrequencyThreshold = 10.0;
        public const double LongSessionDurationThreshold = 4.0; // hours
    }

    /// <summary>
    /// System configuration constants
    /// </summary>
    public static class System
    {
        public const string ApplicationName = "GAIming";
        public const string Version = "1.0.0";
        public const string Environment = "ASPNETCORE_ENVIRONMENT";
        public const int HealthCheckTimeoutSeconds = 30;
        public const int BackgroundJobRetryCount = 3;
        public const int ScheduledTaskTimeoutMinutes = 60;
        
        public static class Environments
        {
            public const string Development = "Development";
            public const string Testing = "Testing";
            public const string Staging = "Staging";
            public const string Production = "Production";
        }
    }

    /// <summary>
    /// Notification constants
    /// </summary>
    public static class Notifications
    {
        public const int MaxNotificationLength = 1000;
        public const int NotificationRetentionDays = 90;
        public const int MaxNotificationsPerUser = 100;
        
        public static class Types
        {
            public const string Info = "Info";
            public const string Warning = "Warning";
            public const string Error = "Error";
            public const string Success = "Success";
            public const string System = "System";
            public const string Security = "Security";
        }

        public static class Priorities
        {
            public const string Low = "Low";
            public const string Medium = "Medium";
            public const string High = "High";
            public const string Critical = "Critical";
        }
    }

    /// <summary>
    /// API constants
    /// </summary>
    public static class Api
    {
        public const string Version = "v1";
        public const string BaseRoute = "api/" + Version;
        public const int DefaultRateLimit = 1000;
        public const int RateLimitWindowMinutes = 60;
        public const string CorrelationIdHeader = "X-Correlation-ID";
        public const string ApiKeyHeader = "X-API-Key";
        public const string UserAgentHeader = "User-Agent";
    }

    /// <summary>
    /// Validation constants
    /// </summary>
    public static class Validation
    {
        public const int MinPasswordLength = 8;
        public const int MaxPasswordLength = 128;
        public const int MinUsernameLength = 3;
        public const int MaxUsernameLength = 50;
        public const int MaxEmailLength = 255;
        public const int MaxNameLength = 100;
        public const int MaxDescriptionLength = 1000;
        public const string EmailRegex = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
        public const string UsernameRegex = @"^[a-zA-Z0-9_-]+$";
    }

    /// <summary>
    /// Feature flag constants
    /// </summary>
    public static class FeatureFlags
    {
        public const string RecommendationEngine = "RecommendationEngine";
        public const string RealTimeAnalytics = "RealTimeAnalytics";
        public const string ABTesting = "ABTesting";
        public const string AdvancedReporting = "AdvancedReporting";
        public const string MachineLearning = "MachineLearning";
        public const string RiskAssessment = "RiskAssessment";
        public const string BulkOperations = "BulkOperations";
        public const string DataExport = "DataExport";
    }

    /// <summary>
    /// Error codes
    /// </summary>
    public static class ErrorCodes
    {
        // Authentication errors (1000-1099)
        public const string InvalidCredentials = "AUTH_1001";
        public const string AccountLocked = "AUTH_1002";
        public const string TokenExpired = "AUTH_1003";
        public const string InvalidToken = "AUTH_1004";
        public const string TwoFactorRequired = "AUTH_1005";

        // Authorization errors (1100-1199)
        public const string InsufficientPermissions = "AUTHZ_1101";
        public const string ResourceNotFound = "AUTHZ_1102";
        public const string AccessDenied = "AUTHZ_1103";

        // Validation errors (1200-1299)
        public const string InvalidInput = "VAL_1201";
        public const string RequiredFieldMissing = "VAL_1202";
        public const string InvalidFormat = "VAL_1203";
        public const string ValueOutOfRange = "VAL_1204";

        // Business logic errors (1300-1399)
        public const string DuplicateResource = "BIZ_1301";
        public const string ResourceInUse = "BIZ_1302";
        public const string InvalidOperation = "BIZ_1303";
        public const string BusinessRuleViolation = "BIZ_1304";

        // System errors (1400-1499)
        public const string DatabaseError = "SYS_1401";
        public const string ExternalServiceError = "SYS_1402";
        public const string ConfigurationError = "SYS_1403";
        public const string InternalServerError = "SYS_1404";
    }
}
