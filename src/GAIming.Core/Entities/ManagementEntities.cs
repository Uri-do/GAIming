using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GAIming.Core.Entities;

/// <summary>
/// Game management settings entity in GAImingDB
/// Since ProgressPlay database is read-only, we store management overrides here
/// </summary>
[Table("GameManagementSettings")]
public class GameManagementSettings : BaseDomainEntity
{
    [Required]
    public long GameId { get; set; }

    // Override settings for ProgressPlay games
    public bool? IsActiveOverride { get; set; }
    public bool? HideInLobbyOverride { get; set; }
    public int? GameOrderOverride { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MinBetAmountOverride { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MaxBetAmountOverride { get; set; }

    public bool? IsMobileOverride { get; set; }
    public bool? IsDesktopOverride { get; set; }
    public bool? UkCompliantOverride { get; set; }
    public decimal? JackpotContributionOverride { get; set; }

    [StringLength(1000)]
    public string? GameDescriptionOverride { get; set; }

    [StringLength(500)]
    public string? ImageUrlOverride { get; set; }

    [StringLength(500)]
    public string? ThumbnailUrlOverride { get; set; }

    [StringLength(1000)]
    public string? TagsOverride { get; set; } // JSON array

    [StringLength(2000)]
    public string? Notes { get; set; }

    // Management features
    public bool IsFeatured { get; set; } = false;
    public int FeaturePriority { get; set; } = 0;

    public string? PromotionSettings { get; set; } // JSON
    public string? ABTestSettings { get; set; } // JSON
    public string? ResponsibleGamingSettings { get; set; } // JSON
    public string? RegionalSettings { get; set; } // JSON
    public string? CustomMetadata { get; set; } // JSON

    // Navigation properties
    public virtual Game? Game { get; set; }
}

/// <summary>
/// File export history tracking entity
/// </summary>
[Table("GameExportHistory")]
public class GameExportHistory : BaseDomainEntity
{
    [Required]
    [StringLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [StringLength(10)]
    public string Format { get; set; } = string.Empty;

    public int RecordCount { get; set; }
    public long FileSizeBytes { get; set; }

    [Required]
    public DateTime ExportedAt { get; set; } = DateTime.UtcNow;

    [StringLength(100)]
    public string? ExportedBy { get; set; }

    public bool IncludedAnalytics { get; set; }
    public bool IncludedPlayerData { get; set; }
    public bool IncludedRecommendations { get; set; }

    public string? FilterCriteria { get; set; } // JSON

    public int DownloadCount { get; set; } = 0;
    public DateTime? LastDownloadedAt { get; set; }
    public bool IsAvailable { get; set; } = true;

    [StringLength(500)]
    public string? FilePath { get; set; }

    public DateTime? ExpiresAt { get; set; }
}

/// <summary>
/// File import history tracking entity
/// </summary>
[Table("GameImportHistory")]
public class GameImportHistory : BaseDomainEntity
{
    [Required]
    [StringLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [StringLength(10)]
    public string Format { get; set; } = string.Empty;

    public int TotalRecords { get; set; }
    public int ProcessedRecords { get; set; }
    public int CreatedRecords { get; set; }
    public int UpdatedRecords { get; set; }
    public int SkippedRecords { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }

    public bool Success { get; set; }

    [Required]
    public DateTime ImportedAt { get; set; } = DateTime.UtcNow;

    [StringLength(100)]
    public string? ImportedBy { get; set; }

    public TimeSpan ProcessingDuration { get; set; }
    public long FileSizeBytes { get; set; }

    public bool UpdatedExisting { get; set; }
    public bool SkippedDuplicates { get; set; }

    public string? ErrorSummary { get; set; }
    public string? WarningSummary { get; set; }
    public string? ImportOptions { get; set; } // JSON
}

/// <summary>
/// System configuration entity
/// </summary>
[Table("SystemConfigurations")]
public class SystemConfiguration : BaseDomainEntity
{
    [Required]
    [StringLength(100)]
    public string Key { get; set; } = string.Empty;

    [Required]
    public string Value { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [Required]
    [StringLength(50)]
    public string Category { get; set; } = string.Empty; // Recommendation, Analytics, Security, etc.

    [Required]
    [StringLength(20)]
    public string DataType { get; set; } = string.Empty; // String, Integer, Boolean, JSON

    public bool IsEncrypted { get; set; } = false;
    public bool IsReadOnly { get; set; } = false;
    public bool RequiresRestart { get; set; } = false;

    [StringLength(1000)]
    public string? ValidationRules { get; set; } // JSON

    public string? DefaultValue { get; set; }
    public DateTime? LastModifiedDate { get; set; }

    [StringLength(100)]
    public string? LastModifiedBy { get; set; }
}

/// <summary>
/// Scheduled task entity for background jobs
/// </summary>
[Table("ScheduledTasks")]
public class ScheduledTask : BaseDomainEntity
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [Required]
    [StringLength(100)]
    public string TaskType { get; set; } = string.Empty; // ModelTraining, DataSync, Cleanup, etc.

    [Required]
    [StringLength(100)]
    public string CronExpression { get; set; } = string.Empty;

    public bool IsEnabled { get; set; } = true;
    public bool IsRunning { get; set; } = false;

    public DateTime? LastRunDate { get; set; }
    public DateTime? NextRunDate { get; set; }

    [StringLength(20)]
    public string? LastRunStatus { get; set; } // Success, Failed, Cancelled

    public string? LastRunResult { get; set; } // JSON
    public string? Configuration { get; set; } // JSON

    public int MaxRetries { get; set; } = 3;
    public int CurrentRetries { get; set; } = 0;

    public TimeSpan? TimeoutDuration { get; set; }
}

/// <summary>
/// Task execution log entity
/// </summary>
[Table("TaskExecutionLogs")]
public class TaskExecutionLog : BaseDomainEntity
{
    [Required]
    public long TaskId { get; set; }

    [Required]
    public DateTime StartTime { get; set; } = DateTime.UtcNow;

    public DateTime? EndTime { get; set; }

    [Required]
    [StringLength(20)]
    public string Status { get; set; } = string.Empty; // Running, Success, Failed, Cancelled

    public string? Result { get; set; } // JSON
    public string? ErrorMessage { get; set; }
    public string? StackTrace { get; set; }

    public TimeSpan? Duration { get; set; }

    [StringLength(100)]
    public string? ExecutedBy { get; set; } // System, User, or Service name

    // Navigation properties
    public virtual ScheduledTask? Task { get; set; }
}

/// <summary>
/// System notification entity
/// </summary>
[Table("SystemNotifications")]
public class SystemNotification : BaseDomainEntity
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Type { get; set; } = string.Empty; // Info, Warning, Error, Success

    [Required]
    [StringLength(20)]
    public string Priority { get; set; } = string.Empty; // Low, Medium, High, Critical

    public bool IsRead { get; set; } = false;
    public bool IsGlobal { get; set; } = false; // If true, shown to all users

    public long? UserId { get; set; } // If null and IsGlobal=true, shown to all users

    public DateTime? ExpiryDate { get; set; }
    public DateTime? ReadDate { get; set; }

    [StringLength(500)]
    public string? ActionUrl { get; set; }

    [StringLength(100)]
    public string? ActionText { get; set; }

    public string? Metadata { get; set; } // JSON

    // Navigation properties
    public virtual User? User { get; set; }
}

/// <summary>
/// Feature flag entity for controlling feature rollouts
/// </summary>
[Table("FeatureFlags")]
public class FeatureFlag : BaseDomainEntity
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsEnabled { get; set; } = false;

    [StringLength(20)]
    public string Environment { get; set; } = string.Empty; // Development, Staging, Production, All

    public double RolloutPercentage { get; set; } = 0; // 0-100

    public string? TargetUsers { get; set; } // JSON array of user IDs
    public string? TargetRoles { get; set; } // JSON array of role names
    public string? Conditions { get; set; } // JSON for complex conditions

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
