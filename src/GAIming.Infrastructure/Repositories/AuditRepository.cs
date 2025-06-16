using Microsoft.EntityFrameworkCore;
using GAIming.Core.Entities;
using GAIming.Core.Enums;
using GAIming.Core.Interfaces;
using GAIming.Core.Models;
using GAIming.Infrastructure.Data;

namespace GAIming.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for AuditLog
/// </summary>
public class AuditRepository : Repository<AuditLog>, IAuditRepository
{
    /// <summary>
    /// Initializes a new instance of the AuditRepository class
    /// </summary>
    public AuditRepository(ApplicationDbContext context) : base(context)
    {
    }

    /// <inheritdoc />
    public async Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityName, string entityId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.EntityName == entityName && a.EntityId == entityId)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<AuditLog>> GetByUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<AuditLog>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.Timestamp >= startDate && a.Timestamp <= endDate)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<AuditLog>> GetByActionAsync(GAIming.Core.Enums.AuditAction action, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.Action == action)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets audit logs with pagination and filtering
    /// </summary>
    public async Task<(IEnumerable<AuditLog> Items, int TotalCount)> GetPagedWithFilterAsync(
        int page,
        int pageSize,
        string? entityName = null,
        string? entityId = null,
        string? userId = null,
        GAIming.Core.Enums.AuditAction? action = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        string? severity = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(entityName))
        {
            query = query.Where(a => a.EntityName == entityName);
        }

        if (!string.IsNullOrEmpty(entityId))
        {
            query = query.Where(a => a.EntityId == entityId);
        }

        if (!string.IsNullOrEmpty(userId))
        {
            query = query.Where(a => a.UserId == userId);
        }

        if (action.HasValue)
        {
            query = query.Where(a => a.Action == action.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(a => a.Timestamp >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(a => a.Timestamp <= endDate.Value);
        }

        if (!string.IsNullOrEmpty(severity))
        {
            query = query.Where(a => a.Severity == severity);
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination and ordering
        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    /// <summary>
    /// Gets audit logs by correlation ID
    /// </summary>
    public async Task<IEnumerable<AuditLog>> GetByCorrelationIdAsync(string correlationId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.CorrelationId == correlationId)
            .OrderBy(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets audit logs by session ID
    /// </summary>
    public async Task<IEnumerable<AuditLog>> GetBySessionIdAsync(string sessionId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.SessionId == sessionId)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets audit logs by IP address
    /// </summary>
    public async Task<IEnumerable<AuditLog>> GetByIpAddressAsync(string ipAddress, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.IpAddress == ipAddress)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets audit logs by severity level
    /// </summary>
    public async Task<IEnumerable<AuditLog>> GetBySeverityAsync(string severity, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.Severity == severity)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets audit statistics
    /// </summary>
    public async Task<AuditStatistics> GetStatisticsAsync(DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.AsQueryable();

        if (startDate.HasValue)
        {
            query = query.Where(a => a.Timestamp >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(a => a.Timestamp <= endDate.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Action counts
        var actionCounts = await query
            .GroupBy(a => a.Action)
            .Select(g => new { Action = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Action, x => x.Count, cancellationToken);

        // Entity counts
        var entityCounts = await query
            .GroupBy(a => a.EntityName)
            .Select(g => new { EntityName = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.EntityName, x => x.Count, cancellationToken);

        // User activity counts
        var userCounts = await query
            .GroupBy(a => a.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToDictionaryAsync(x => x.UserId, x => x.Count, cancellationToken);

        // Severity counts
        var severityCounts = await query
            .GroupBy(a => a.Severity)
            .Select(g => new { Severity = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Severity, x => x.Count, cancellationToken);

        // Daily activity (last 30 days)
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var dailyActivity = await query
            .Where(a => a.Timestamp >= thirtyDaysAgo)
            .GroupBy(a => a.Timestamp.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .OrderBy(x => x.Date)
            .ToDictionaryAsync(x => x.Date, x => x.Count, cancellationToken);

        return new AuditStatistics
        {
            TotalCount = totalCount,
            ActionCounts = actionCounts,
            EntityCounts = entityCounts,
            TopUserActivity = userCounts,
            SeverityCounts = severityCounts,
            DailyActivity = dailyActivity,
            DateRange = new DateRange
            {
                StartDate = startDate,
                EndDate = endDate
            }
        };
    }

    /// <summary>
    /// Gets recent audit activity
    /// </summary>
    public async Task<IEnumerable<AuditLog>> GetRecentActivityAsync(int count = 50, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .OrderByDescending(a => a.Timestamp)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Cleans up old audit logs
    /// </summary>
    public async Task<int> CleanupOldLogsAsync(DateTime cutoffDate, CancellationToken cancellationToken = default)
    {
        var oldLogs = await _dbSet
            .Where(a => a.Timestamp < cutoffDate)
            .ToListAsync(cancellationToken);

        _dbSet.RemoveRange(oldLogs);
        return oldLogs.Count;
    }

    /// <summary>
    /// Gets unique entity names from audit logs
    /// </summary>
    public async Task<IEnumerable<string>> GetEntityNamesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Select(a => a.EntityName)
            .Distinct()
            .OrderBy(name => name)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets unique user IDs from audit logs
    /// </summary>
    public async Task<IEnumerable<string>> GetUserIdsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Select(a => a.UserId)
            .Distinct()
            .OrderBy(userId => userId)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<PaginatedResponse<AuditLog>> SearchAuditLogsAsync(AuditLogSearchRequest request)
    {
        var query = _dbSet.AsQueryable();

        // Apply filters
        if (request.StartDate.HasValue)
            query = query.Where(a => a.Timestamp >= request.StartDate.Value);

        if (request.EndDate.HasValue)
            query = query.Where(a => a.Timestamp <= request.EndDate.Value);

        if (!string.IsNullOrEmpty(request.EntityName))
            query = query.Where(a => a.EntityName == request.EntityName);

        if (!string.IsNullOrEmpty(request.EntityId))
            query = query.Where(a => a.EntityId == request.EntityId);

        if (!string.IsNullOrEmpty(request.Action))
            query = query.Where(a => a.ActionDescription != null && a.ActionDescription.Contains(request.Action));

        if (!string.IsNullOrEmpty(request.UserId))
            query = query.Where(a => a.UserId == request.UserId);

        if (!string.IsNullOrEmpty(request.UserName))
            query = query.Where(a => a.UserName != null && a.UserName.Contains(request.UserName));

        if (!string.IsNullOrEmpty(request.IpAddress))
            query = query.Where(a => a.IpAddress == request.IpAddress);

        // Get total count
        var totalCount = await query.CountAsync();

        // Apply sorting
        if (!string.IsNullOrEmpty(request.SortBy))
        {
            switch (request.SortBy.ToLower())
            {
                case "timestamp":
                    query = request.SortDirection?.ToLower() == "asc"
                        ? query.OrderBy(a => a.Timestamp)
                        : query.OrderByDescending(a => a.Timestamp);
                    break;
                case "entityname":
                    query = request.SortDirection?.ToLower() == "asc"
                        ? query.OrderBy(a => a.EntityName)
                        : query.OrderByDescending(a => a.EntityName);
                    break;
                default:
                    query = query.OrderByDescending(a => a.Timestamp);
                    break;
            }
        }
        else
        {
            query = query.OrderByDescending(a => a.Timestamp);
        }

        // Apply pagination
        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return new PaginatedResponse<AuditLog>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    /// <inheritdoc />
    public async Task<IEnumerable<AuditLog>> GetEntityAuditLogsAsync(string entityName, string entityId)
    {
        return await GetByEntityAsync(entityName, entityId);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<AuditLog>> GetUserAuditLogsAsync(string userId)
    {
        return await GetByUserAsync(userId);
    }

    /// <inheritdoc />
    public async Task LogAsync(string entityName, string entityId, string action, object? oldValues, object? newValues, string? userId, string? userName, string? ipAddress, string? userAgent)
    {
        var auditLog = new AuditLog
        {
            EntityName = entityName,
            EntityId = entityId,
            ActionDescription = action,
            OldValues = oldValues?.ToString(),
            NewValues = newValues?.ToString(),
            UserId = userId,
            UserName = userName,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Timestamp = DateTime.UtcNow,
            Action = GAIming.Core.Enums.AuditAction.Custom
        };

        await AddAsync(auditLog);
    }
}


