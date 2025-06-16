using GAIming.Core.Entities;
using GAIming.Core.Enums;
using GAIming.Core.Models;

namespace GAIming.Core.Interfaces;

/// <summary>
/// Domain service interface for DomainEntity business logic
/// </summary>
public interface IDomainEntityService
{
    /// <summary>
    /// Creates a new DomainEntity
    /// </summary>
    Task<DomainEntity> CreateAsync(CreateDomainEntityRequest request, string createdBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing DomainEntity
    /// </summary>
    Task<DomainEntity> UpdateAsync(int id, UpdateDomainEntityRequest request, string modifiedBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a DomainEntity (soft delete)
    /// </summary>
    Task DeleteAsync(int id, string deletedBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Activates a DomainEntity
    /// </summary>
    Task<DomainEntity> ActivateAsync(int id, string activatedBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deactivates a DomainEntity
    /// </summary>
    Task<DomainEntity> DeactivateAsync(int id, string deactivatedBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets DomainEntity statistics
    /// </summary>
    Task<DomainEntityStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates a DomainEntity for business rules
    /// </summary>
    Task<ValidationResult> ValidateAsync(DomainEntity entity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes bulk operations on DomainEntities
    /// </summary>
    Task<BulkOperationResult> ProcessBulkOperationAsync(BulkOperationRequest request, string processedBy, CancellationToken cancellationToken = default);
}

/// <summary>
/// Audit service interface for tracking changes
/// </summary>
public interface IAuditService
{
    /// <summary>
    /// Logs an audit event
    /// </summary>
    Task LogAsync(AuditLog auditLog, CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs an audit event for entity creation
    /// </summary>
    Task LogCreationAsync(string entityName, string entityId, string userId, string? username = null, string? ipAddress = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs an audit event for entity update
    /// </summary>
    Task LogUpdateAsync(string entityName, string entityId, string userId, object? oldValues = null, object? newValues = null, string? username = null, string? ipAddress = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs an audit event for entity deletion
    /// </summary>
    Task LogDeletionAsync(string entityName, string entityId, string userId, string? username = null, string? ipAddress = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a custom audit event
    /// </summary>
    Task LogCustomAsync(string entityName, string entityId, string actionDescription, string userId, string? username = null, string? ipAddress = null, string severity = "Information", CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets audit trail for an entity
    /// </summary>
    Task<IEnumerable<AuditLog>> GetAuditTrailAsync(string entityName, string entityId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets audit logs with filtering
    /// </summary>
    Task<IEnumerable<AuditLog>> GetAuditLogsAsync(AuditLogFilter filter, CancellationToken cancellationToken = default);
}



/// <summary>
/// Notification service interface
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Sends a notification
    /// </summary>
    Task<bool> SendNotificationAsync(NotificationRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notifications to multiple recipients
    /// </summary>
    Task<NotificationResult> SendBulkNotificationAsync(BulkNotificationRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets notification templates
    /// </summary>
    Task<IEnumerable<NotificationTemplate>> GetTemplatesAsync(CancellationToken cancellationToken = default);
}






