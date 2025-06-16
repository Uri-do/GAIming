namespace GAIming.Core.Enums;


/// <summary>
/// Game status enumeration
/// </summary>
public enum GameStatus
{
    Inactive = 0,
    Active = 1,
    Maintenance = 2,
    ComingSoon = 3,
    Retired = 4
}

/// <summary>
/// Game session status enumeration
/// </summary>
public enum GameSessionStatus
{
    InProgress = 0,
    Completed = 1,
    Cancelled = 2,
    Timeout = 3,
    Error = 4
}

/// <summary>
/// Player risk level enumeration
/// </summary>
public enum RiskLevel
{
    VeryLow = 1,
    Low = 2,
    Medium = 3,
    High = 4,
    Critical = 5
}

/// <summary>
/// Risk category enumeration
/// </summary>
public enum RiskCategory
{
    Low,
    Medium,
    High,
    Critical
}

/// <summary>
/// Transaction type enumeration
/// </summary>
public enum TransactionType
{
    Deposit,
    Withdrawal,
    Bet,
    Win,
    Bonus,
    Refund,
    Adjustment,
    Fee
}

/// <summary>
/// Platform type enumeration
/// </summary>
public enum PlatformType
{
    Web,
    Mobile,
    Desktop,
    Tablet,
    API
}

/// <summary>
/// Recommendation algorithm enumeration
/// </summary>
public enum RecommendationAlgorithm
{
    CollaborativeFiltering,
    ContentBased,
    Hybrid,
    PopularityBased,
    MatrixFactorization,
    DeepLearning,
    RandomForest,
    NeuralNetwork
}

/// <summary>
/// Recommendation context enumeration
/// </summary>
public enum RecommendationContext
{
    Lobby,
    Profile,
    PostGame,
    Deposit,
    Welcome,
    Retention,
    Winback,
    Promotional
}

/// <summary>
/// Interaction type enumeration
/// </summary>
public enum InteractionType
{
    View,
    Click,
    Play,
    Dismiss,
    Like,
    Dislike,
    Share,
    Favorite
}

/// <summary>
/// A/B test status enumeration
/// </summary>
public enum ABTestStatus
{
    Draft = 0,
    Running = 1,
    Paused = 2,
    Completed = 3,
    Cancelled = 4
}

/// <summary>
/// Model status enumeration
/// </summary>
public enum ModelStatus
{
    Training,
    Trained,
    Deployed,
    Active,
    Retired,
    Failed
}

/// <summary>
/// User status enumeration
/// </summary>
public enum UserStatus
{
    Inactive = 0,
    Active = 1,
    Suspended = 2,
    Locked = 3,
    PendingVerification = 4,
    Deleted = 5
}

/// <summary>
/// Security event type enumeration
/// </summary>
public enum SecurityEventType
{
    Login,
    Logout,
    FailedLogin,
    PasswordChange,
    PasswordReset,
    EmailChange,
    TwoFactorEnabled,
    TwoFactorDisabled,
    AccountLocked,
    AccountUnlocked,
    PermissionGranted,
    PermissionRevoked,
    SuspiciousActivity,
    DataAccess,
    DataModification
}

/// <summary>
/// Security event severity enumeration
/// </summary>
public enum SecurityEventSeverity
{
    Info,
    Warning,
    Error,
    Critical
}

/// <summary>
/// Notification type enumeration
/// </summary>
public enum NotificationType
{
    Info,
    Warning,
    Error,
    Success,
    Promotional,
    System,
    Security
}

/// <summary>
/// Notification priority enumeration
/// </summary>
public enum NotificationPriority
{
    Low,
    Medium,
    High,
    Critical
}

/// <summary>
/// Task status enumeration
/// </summary>
public enum TaskStatus
{
    Pending,
    Running,
    Success,
    Failed,
    Cancelled,
    Timeout
}

/// <summary>
/// Data type enumeration for system configuration
/// </summary>
public enum ConfigurationDataType
{
    String,
    Integer,
    Decimal,
    Boolean,
    DateTime,
    JSON,
    Array
}

/// <summary>
/// Environment type enumeration
/// </summary>
public enum EnvironmentType
{
    Development,
    Testing,
    Staging,
    Production,
    All
}

/// <summary>
/// Game volatility enumeration
/// </summary>
public enum GameVolatility
{
    VeryLow = 1,
    Low = 2,
    Medium = 3,
    High = 4,
    VeryHigh = 5
}

/// <summary>
/// Player VIP level enumeration
/// </summary>
public enum VIPLevel
{
    None = 0,
    Bronze = 1,
    Silver = 2,
    Gold = 3,
    Platinum = 4,
    Diamond = 5,
    Elite = 6
}

/// <summary>
/// Play style enumeration
/// </summary>
public enum PlayStyle
{
    Conservative,
    Moderate,
    Aggressive,
    HighRoller,
    Casual,
    Frequent,
    Sporadic
}

/// <summary>
/// Gender enumeration
/// </summary>
public enum Gender
{
    NotSpecified,
    Male,
    Female,
    Other,
    PreferNotToSay
}

/// <summary>
/// File format enumeration
/// </summary>
public enum FileFormat
{
    CSV,
    Excel,
    JSON,
    XML,
    PDF
}

/// <summary>
/// Export type enumeration
/// </summary>
public enum ExportType
{
    Games,
    Players,
    Recommendations,
    Analytics,
    Transactions,
    AuditLogs,
    SystemLogs
}

/// <summary>
/// Import operation enumeration
/// </summary>
public enum ImportOperation
{
    Insert,
    Update,
    Upsert,
    Delete,
    Validate
}

/// <summary>
/// Metric type enumeration
/// </summary>
public enum MetricType
{
    Accuracy,
    Precision,
    Recall,
    F1Score,
    AUC,
    ClickThroughRate,
    ConversionRate,
    Revenue,
    Engagement,
    Retention
}

/// <summary>
/// Time period enumeration
/// </summary>
public enum TimePeriod
{
    Hour,
    Day,
    Week,
    Month,
    Quarter,
    Year,
    Custom
}

/// <summary>
/// Aggregation type enumeration
/// </summary>
public enum AggregationType
{
    Sum,
    Average,
    Count,
    Min,
    Max,
    Median,
    Percentile
}

/// <summary>
/// Recommendation interaction type enumeration
/// </summary>
public enum RecommendationInteractionType
{
    View,
    Click,
    Play,
    Dismiss,
    Like,
    Dislike,
    Share,
    Favorite,
    Purchase,
    Download
}

/// <summary>
/// Background job status enumeration
/// </summary>
public enum BackgroundJobStatus
{
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
    Timeout,
    Retrying
}
