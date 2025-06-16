using GAIming.Core.Events;

namespace GAIming.Core.Interfaces;

/// <summary>
/// Unit of Work pattern interface for transaction management
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>
    /// Begin a new transaction
    /// </summary>
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Commit the current transaction
    /// </summary>
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Rollback the current transaction
    /// </summary>
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Save all changes to the database
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Save changes and dispatch domain events
    /// </summary>
    Task<int> SaveChangesAndDispatchEventsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get repository for specific entity type
    /// </summary>
    TRepository GetRepository<TRepository>() where TRepository : class;

    /// <summary>
    /// Check if there's an active transaction
    /// </summary>
    bool HasActiveTransaction { get; }

    /// <summary>
    /// Get all domain events from tracked entities
    /// </summary>
    IEnumerable<IDomainEvent> GetDomainEvents();

    /// <summary>
    /// Clear all domain events from tracked entities
    /// </summary>
    void ClearDomainEvents();

    /// <summary>
    /// Execute operation within a transaction
    /// </summary>
    Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation, CancellationToken cancellationToken = default);

    /// <summary>
    /// Execute operation within a transaction without return value
    /// </summary>
    Task ExecuteInTransactionAsync(Func<Task> operation, CancellationToken cancellationToken = default);
}

/// <summary>
/// Extended Unit of Work with repository access
/// </summary>
public interface IUnitOfWorkWithRepositories : IUnitOfWork
{
    // Gaming repositories (ProgressPlay DB - Read Only)
    IGameRepository Games { get; }
    IGameProviderRepository GameProviders { get; }
    IGameTypeRepository GameTypes { get; }
    IPlayerRepository Players { get; }
    IPlayedGameRepository PlayedGames { get; }
    IAccountTransactionRepository AccountTransactions { get; }

    // GAIming repositories (GAIming DB - Read/Write)
    IGameRecommendationRepository GameRecommendations { get; }
    IPlayerFeatureRepository PlayerFeatures { get; }
    IGameFeatureRepository GameFeatures { get; }
    IRecommendationModelRepository RecommendationModels { get; }
    IABTestExperimentRepository ABTestExperiments { get; }
    IRecommendationInteractionRepository RecommendationInteractions { get; }
    IModelPerformanceMetricRepository ModelPerformanceMetrics { get; }
    IPlayerRiskAssessmentRepository PlayerRiskAssessments { get; }

    // Security repositories
    IUserRepository Users { get; }
    IRoleRepository Roles { get; }
    IPermissionRepository Permissions { get; }
    IRefreshTokenRepository RefreshTokens { get; }

    // Management repositories
    IGameManagementSettingsRepository GameManagementSettings { get; }
    IAuditLogRepository AuditLogs { get; }
    ISystemConfigurationRepository SystemConfigurations { get; }
    IScheduledTaskRepository ScheduledTasks { get; }
    ISystemNotificationRepository SystemNotifications { get; }
}

/// <summary>
/// Transaction scope options
/// </summary>
public class TransactionOptions
{
    public TimeSpan? Timeout { get; set; }
    public bool ReadOnly { get; set; } = false;
    public IsolationLevel IsolationLevel { get; set; } = IsolationLevel.ReadCommitted;
}

/// <summary>
/// Isolation levels for transactions
/// </summary>
public enum IsolationLevel
{
    ReadUncommitted,
    ReadCommitted,
    RepeatableRead,
    Serializable,
    Snapshot
}

/// <summary>
/// Unit of Work factory interface
/// </summary>
public interface IUnitOfWorkFactory
{
    /// <summary>
    /// Create a new Unit of Work instance
    /// </summary>
    IUnitOfWork Create();

    /// <summary>
    /// Create a new Unit of Work instance with repositories
    /// </summary>
    IUnitOfWorkWithRepositories CreateWithRepositories();

    /// <summary>
    /// Create a new Unit of Work instance with specific options
    /// </summary>
    IUnitOfWork Create(TransactionOptions options);
}

/// <summary>
/// Repository factory interface
/// </summary>
public interface IRepositoryFactory
{
    /// <summary>
    /// Create repository instance
    /// </summary>
    TRepository Create<TRepository>() where TRepository : class;

    /// <summary>
    /// Create repository instance with specific context
    /// </summary>
    TRepository Create<TRepository>(object context) where TRepository : class;
}

/// <summary>
/// Database context provider interface
/// </summary>
public interface IDbContextProvider
{
    /// <summary>
    /// Get ProgressPlay database context (read-only)
    /// </summary>
    object GetProgressPlayContext();

    /// <summary>
    /// Get GAIming database context (read/write)
    /// </summary>
    object GetGAImingContext();
}

/// <summary>
/// Transaction manager interface
/// </summary>
public interface ITransactionManager
{
    /// <summary>
    /// Begin a new transaction scope
    /// </summary>
    Task<ITransactionScope> BeginTransactionAsync(TransactionOptions? options = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Execute operation within a transaction
    /// </summary>
    Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation, TransactionOptions? options = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Execute operation within a transaction without return value
    /// </summary>
    Task ExecuteInTransactionAsync(Func<Task> operation, TransactionOptions? options = null, CancellationToken cancellationToken = default);
}

/// <summary>
/// Transaction scope interface
/// </summary>
public interface ITransactionScope : IDisposable
{
    /// <summary>
    /// Commit the transaction
    /// </summary>
    Task CommitAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Rollback the transaction
    /// </summary>
    Task RollbackAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if transaction is active
    /// </summary>
    bool IsActive { get; }

    /// <summary>
    /// Transaction ID
    /// </summary>
    Guid TransactionId { get; }

    /// <summary>
    /// Transaction start time
    /// </summary>
    DateTime StartTime { get; }
}

/// <summary>
/// Change tracker interface for auditing
/// </summary>
public interface IChangeTracker
{
    /// <summary>
    /// Get all entity changes
    /// </summary>
    IEnumerable<EntityChange> GetChanges();

    /// <summary>
    /// Get changes for specific entity type
    /// </summary>
    IEnumerable<EntityChange> GetChanges<TEntity>() where TEntity : class;

    /// <summary>
    /// Track entity changes
    /// </summary>
    void TrackChanges(object entity, ChangeType changeType);
}

/// <summary>
/// Entity change information
/// </summary>
public class EntityChange
{
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public ChangeType ChangeType { get; set; }
    public Dictionary<string, object?> OldValues { get; set; } = new();
    public Dictionary<string, object?> NewValues { get; set; } = new();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? UserId { get; set; }
    public string? UserName { get; set; }
}

/// <summary>
/// Change type enumeration
/// </summary>
public enum ChangeType
{
    Added,
    Modified,
    Deleted
}

/// <summary>
/// Bulk operations interface
/// </summary>
public interface IBulkOperations
{
    /// <summary>
    /// Bulk insert entities
    /// </summary>
    Task BulkInsertAsync<TEntity>(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default) where TEntity : class;

    /// <summary>
    /// Bulk update entities
    /// </summary>
    Task BulkUpdateAsync<TEntity>(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default) where TEntity : class;

    /// <summary>
    /// Bulk delete entities
    /// </summary>
    Task BulkDeleteAsync<TEntity>(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default) where TEntity : class;

    /// <summary>
    /// Bulk upsert entities
    /// </summary>
    Task BulkUpsertAsync<TEntity>(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default) where TEntity : class;
}

/// <summary>
/// Connection manager interface
/// </summary>
public interface IConnectionManager
{
    /// <summary>
    /// Get connection string for specific database
    /// </summary>
    string GetConnectionString(string databaseName);

    /// <summary>
    /// Test database connection
    /// </summary>
    Task<bool> TestConnectionAsync(string databaseName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get connection health status
    /// </summary>
    Task<ConnectionHealth> GetConnectionHealthAsync(string databaseName, CancellationToken cancellationToken = default);
}

/// <summary>
/// Connection health information
/// </summary>
public class ConnectionHealth
{
    public string DatabaseName { get; set; } = string.Empty;
    public bool IsHealthy { get; set; }
    public TimeSpan ResponseTime { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CheckTime { get; set; } = DateTime.UtcNow;
    public Dictionary<string, object> Metadata { get; set; } = new();
}
