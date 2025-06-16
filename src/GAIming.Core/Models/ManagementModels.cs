using System.ComponentModel.DataAnnotations;

namespace GAIming.Core.Models;

/// <summary>
/// User management request
/// </summary>
public class UserManagementRequest
{
    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    public bool IsActive { get; set; } = true;
    public List<long> RoleIds { get; set; } = new();
}

/// <summary>
/// User management response
/// </summary>
public class UserManagementDto
{
    public long Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string FullName => $"{FirstName} {LastName}".Trim();
    public bool IsActive { get; set; }
    public bool IsEmailConfirmed { get; set; }
    public bool IsTwoFactorEnabled { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public List<RoleDto> Roles { get; set; } = new();
    public List<UserSessionDto> RecentSessions { get; set; } = new();
}

/// <summary>
/// Role management request
/// </summary>
public class RoleManagementRequest
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;
    public List<long> PermissionIds { get; set; } = new();
}

/// <summary>
/// System configuration request
/// </summary>
public class SystemConfigurationRequest
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
    public string Category { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string DataType { get; set; } = string.Empty;

    public bool IsEncrypted { get; set; } = false;
    public bool IsReadOnly { get; set; } = false;
    public bool RequiresRestart { get; set; } = false;
    public string? ValidationRules { get; set; }
    public string? DefaultValue { get; set; }
}

/// <summary>
/// System configuration response
/// </summary>
public class SystemConfigurationDto
{
    public long Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string DataType { get; set; } = string.Empty;
    public bool IsEncrypted { get; set; }
    public bool IsReadOnly { get; set; }
    public bool RequiresRestart { get; set; }
    public string? ValidationRules { get; set; }
    public string? DefaultValue { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? LastModifiedDate { get; set; }
    public string? LastModifiedBy { get; set; }
}

/// <summary>
/// Scheduled task request
/// </summary>
public class ScheduledTaskRequest
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [Required]
    [StringLength(100)]
    public string TaskType { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string CronExpression { get; set; } = string.Empty;

    public bool IsEnabled { get; set; } = true;
    public Dictionary<string, object>? Configuration { get; set; }
    public int MaxRetries { get; set; } = 3;
    public TimeSpan? TimeoutDuration { get; set; }
}

/// <summary>
/// Scheduled task response
/// </summary>
public class ScheduledTaskDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string TaskType { get; set; } = string.Empty;
    public string CronExpression { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public bool IsRunning { get; set; }
    public DateTime? LastRunDate { get; set; }
    public DateTime? NextRunDate { get; set; }
    public string? LastRunStatus { get; set; }
    public string? LastRunResult { get; set; }
    public Dictionary<string, object>? Configuration { get; set; }
    public int MaxRetries { get; set; }
    public int CurrentRetries { get; set; }
    public TimeSpan? TimeoutDuration { get; set; }
    public DateTime CreatedDate { get; set; }
    public List<TaskExecutionLogDto> RecentExecutions { get; set; } = new();
}

/// <summary>
/// Task execution log response
/// </summary>
public class TaskExecutionLogDto
{
    public long Id { get; set; }
    public long TaskId { get; set; }
    public string TaskName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Result { get; set; }
    public string? ErrorMessage { get; set; }
    public TimeSpan? Duration { get; set; }
    public string? ExecutedBy { get; set; }
}

/// <summary>
/// System notification request
/// </summary>
public class SystemNotificationRequest
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Priority { get; set; } = string.Empty;

    public bool IsGlobal { get; set; } = false;
    public long? UserId { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionText { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// System notification response
/// </summary>
public class SystemNotificationDto
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public bool IsGlobal { get; set; }
    public long? UserId { get; set; }
    public string? Username { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public DateTime? ReadDate { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionText { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    public DateTime CreatedDate { get; set; }
}

/// <summary>
/// Feature flag request
/// </summary>
public class FeatureFlagRequest
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsEnabled { get; set; } = false;

    [StringLength(20)]
    public string Environment { get; set; } = "All";

    [Range(0, 100)]
    public double RolloutPercentage { get; set; } = 0;

    public List<long>? TargetUsers { get; set; }
    public List<string>? TargetRoles { get; set; }
    public Dictionary<string, object>? Conditions { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

/// <summary>
/// Feature flag response
/// </summary>
public class FeatureFlagDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsEnabled { get; set; }
    public string Environment { get; set; } = string.Empty;
    public double RolloutPercentage { get; set; }
    public List<long> TargetUsers { get; set; } = new();
    public List<string> TargetRoles { get; set; } = new();
    public Dictionary<string, object>? Conditions { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}

/// <summary>
/// Audit log search request
/// </summary>
public class AuditLogSearchRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? EntityName { get; set; }
    public string? EntityId { get; set; }
    public string? Action { get; set; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public string? IpAddress { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; } = "Timestamp";
    public string? SortDirection { get; set; } = "desc";
}

/// <summary>
/// Audit log response
/// </summary>
public class AuditLogDto
{
    public long Id { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public DateTime Timestamp { get; set; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}

/// <summary>
/// System health check response
/// </summary>
public class SystemHealthCheckDto
{
    public string Status { get; set; } = string.Empty; // Healthy, Warning, Critical
    public DateTime CheckTime { get; set; } = DateTime.UtcNow;
    public List<HealthCheckItemDto> Checks { get; set; } = new();
    public Dictionary<string, object> SystemInfo { get; set; } = new();
}

/// <summary>
/// Individual health check item
/// </summary>
public class HealthCheckItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TimeSpan Duration { get; set; }
    public Dictionary<string, object>? Data { get; set; }
}

/// <summary>
/// Bulk operation request
/// </summary>
public class BulkOperationRequest<T>
{
    [Required]
    public string Operation { get; set; } = string.Empty; // create, update, delete

    [Required]
    public List<T> Items { get; set; } = new();

    public bool ContinueOnError { get; set; } = false;
    public int BatchSize { get; set; } = 100;
}



/// <summary>
/// Export history item for audit trail
/// </summary>
public class ExportHistoryItem
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public int RecordCount { get; set; }
    public long FileSizeBytes { get; set; }
    public DateTime ExportedAt { get; set; }
    public string ExportedBy { get; set; } = string.Empty;
    public bool IncludedAnalytics { get; set; }
    public bool IncludedPlayerData { get; set; }
    public bool IncludedRecommendations { get; set; }
    public string? FilterCriteria { get; set; }
    public int DownloadCount { get; set; }
    public DateTime? LastDownloadedAt { get; set; }
    public bool IsAvailable { get; set; }
}

/// <summary>
/// Import history item for audit trail
/// </summary>
public class ImportHistoryItem
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public int TotalRecords { get; set; }
    public int ProcessedRecords { get; set; }
    public int CreatedRecords { get; set; }
    public int UpdatedRecords { get; set; }
    public int SkippedRecords { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
    public bool Success { get; set; }
    public DateTime ImportedAt { get; set; }
    public string ImportedBy { get; set; } = string.Empty;
    public TimeSpan ProcessingDuration { get; set; }
    public long FileSizeBytes { get; set; }
    public bool UpdatedExisting { get; set; }
    public bool SkippedDuplicates { get; set; }
    public string? ErrorSummary { get; set; }
}
