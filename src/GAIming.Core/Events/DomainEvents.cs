namespace GAIming.Core.Events;

/// <summary>
/// Base domain event interface
/// </summary>
public interface IDomainEvent
{
    DateTime OccurredOn { get; }
    Guid Id { get; }
}

/// <summary>
/// Base domain event implementation
/// </summary>
public abstract class DomainEvent : IDomainEvent
{
    protected DomainEvent()
    {
        Id = Guid.NewGuid();
        OccurredOn = DateTime.UtcNow;
    }

    public DateTime OccurredOn { get; }
    public Guid Id { get; }
}

/// <summary>
/// Domain event handler interface
/// </summary>
/// <typeparam name="T">Domain event type</typeparam>
public interface IDomainEventHandler<in T> where T : IDomainEvent
{
    Task HandleAsync(T domainEvent, CancellationToken cancellationToken = default);
}

/// <summary>
/// Domain event dispatcher interface
/// </summary>
public interface IDomainEventDispatcher
{
    Task DispatchAsync(IDomainEvent domainEvent, CancellationToken cancellationToken = default);
    Task DispatchAsync(IEnumerable<IDomainEvent> domainEvents, CancellationToken cancellationToken = default);
}

/// <summary>
/// Game recommendation generated event
/// </summary>
public class GameRecommendationGeneratedEvent : DomainEvent
{
    public GameRecommendationGeneratedEvent(long playerId, long gameId, string algorithm, double score, string context)
    {
        PlayerId = playerId;
        GameId = gameId;
        Algorithm = algorithm;
        Score = score;
        Context = context;
    }

    public long PlayerId { get; }
    public long GameId { get; }
    public string Algorithm { get; }
    public double Score { get; }
    public string Context { get; }
}

/// <summary>
/// Recommendation clicked event
/// </summary>
public class RecommendationClickedEvent : DomainEvent
{
    public RecommendationClickedEvent(long recommendationId, long playerId, long gameId, string sessionId, string platform)
    {
        RecommendationId = recommendationId;
        PlayerId = playerId;
        GameId = gameId;
        SessionId = sessionId;
        Platform = platform;
    }

    public long RecommendationId { get; }
    public long PlayerId { get; }
    public long GameId { get; }
    public string SessionId { get; }
    public string Platform { get; }
}

/// <summary>
/// Recommendation played event
/// </summary>
public class RecommendationPlayedEvent : DomainEvent
{
    public RecommendationPlayedEvent(long recommendationId, long playerId, long gameId, string sessionId, string platform)
    {
        RecommendationId = recommendationId;
        PlayerId = playerId;
        GameId = gameId;
        SessionId = sessionId;
        Platform = platform;
    }

    public long RecommendationId { get; }
    public long PlayerId { get; }
    public long GameId { get; }
    public string SessionId { get; }
    public string Platform { get; }
}

/// <summary>
/// Player risk level changed event
/// </summary>
public class PlayerRiskLevelChangedEvent : DomainEvent
{
    public PlayerRiskLevelChangedEvent(long playerId, int oldRiskLevel, int newRiskLevel, string reason)
    {
        PlayerId = playerId;
        OldRiskLevel = oldRiskLevel;
        NewRiskLevel = newRiskLevel;
        Reason = reason;
    }

    public long PlayerId { get; }
    public int OldRiskLevel { get; }
    public int NewRiskLevel { get; }
    public string Reason { get; }
}

/// <summary>
/// Model deployed event
/// </summary>
public class ModelDeployedEvent : DomainEvent
{
    public ModelDeployedEvent(string modelName, string version, string algorithm, string deployedBy)
    {
        ModelName = modelName;
        Version = version;
        Algorithm = algorithm;
        DeployedBy = deployedBy;
    }

    public string ModelName { get; }
    public string Version { get; }
    public string Algorithm { get; }
    public string DeployedBy { get; }
}

/// <summary>
/// A/B test started event
/// </summary>
public class ABTestStartedEvent : DomainEvent
{
    public ABTestStartedEvent(long experimentId, string experimentName, DateTime startDate, string startedBy)
    {
        ExperimentId = experimentId;
        ExperimentName = experimentName;
        StartDate = startDate;
        StartedBy = startedBy;
    }

    public long ExperimentId { get; }
    public string ExperimentName { get; }
    public DateTime StartDate { get; }
    public string StartedBy { get; }
}

/// <summary>
/// A/B test completed event
/// </summary>
public class ABTestCompletedEvent : DomainEvent
{
    public ABTestCompletedEvent(long experimentId, string experimentName, string winningVariant, double confidenceLevel, string completedBy)
    {
        ExperimentId = experimentId;
        ExperimentName = experimentName;
        WinningVariant = winningVariant;
        ConfidenceLevel = confidenceLevel;
        CompletedBy = completedBy;
    }

    public long ExperimentId { get; }
    public string ExperimentName { get; }
    public string WinningVariant { get; }
    public double ConfidenceLevel { get; }
    public string CompletedBy { get; }
}

/// <summary>
/// User created event
/// </summary>
public class UserCreatedEvent : DomainEvent
{
    public UserCreatedEvent(long userId, string username, string email, List<string> roles, string createdBy)
    {
        UserId = userId;
        Username = username;
        Email = email;
        Roles = roles;
        CreatedBy = createdBy;
    }

    public long UserId { get; }
    public string Username { get; }
    public string Email { get; }
    public List<string> Roles { get; }
    public string CreatedBy { get; }
}

/// <summary>
/// User role assigned event
/// </summary>
public class UserRoleAssignedEvent : DomainEvent
{
    public UserRoleAssignedEvent(long userId, string username, string roleName, string assignedBy)
    {
        UserId = userId;
        Username = username;
        RoleName = roleName;
        AssignedBy = assignedBy;
    }

    public long UserId { get; }
    public string Username { get; }
    public string RoleName { get; }
    public string AssignedBy { get; }
}

/// <summary>
/// Security event occurred event
/// </summary>
public class SecurityEventOccurredEvent : DomainEvent
{
    public SecurityEventOccurredEvent(string eventType, string severity, long? userId, string? ipAddress, string description)
    {
        EventType = eventType;
        Severity = severity;
        UserId = userId;
        IpAddress = ipAddress;
        Description = description;
    }

    public string EventType { get; }
    public string Severity { get; }
    public long? UserId { get; }
    public string? IpAddress { get; }
    public string Description { get; }
}

/// <summary>
/// Game management settings updated event
/// </summary>
public class GameManagementSettingsUpdatedEvent : DomainEvent
{
    public GameManagementSettingsUpdatedEvent(long gameId, string gameName, Dictionary<string, object> changes, string updatedBy)
    {
        GameId = gameId;
        GameName = gameName;
        Changes = changes;
        UpdatedBy = updatedBy;
    }

    public long GameId { get; }
    public string GameName { get; }
    public Dictionary<string, object> Changes { get; }
    public string UpdatedBy { get; }
}

/// <summary>
/// System configuration changed event
/// </summary>
public class SystemConfigurationChangedEvent : DomainEvent
{
    public SystemConfigurationChangedEvent(string key, string oldValue, string newValue, string category, string changedBy)
    {
        Key = key;
        OldValue = oldValue;
        NewValue = newValue;
        Category = category;
        ChangedBy = changedBy;
    }

    public string Key { get; }
    public string OldValue { get; }
    public string NewValue { get; }
    public string Category { get; }
    public string ChangedBy { get; }
}

/// <summary>
/// Feature flag toggled event
/// </summary>
public class FeatureFlagToggledEvent : DomainEvent
{
    public FeatureFlagToggledEvent(string flagName, bool oldValue, bool newValue, string environment, string toggledBy)
    {
        FlagName = flagName;
        OldValue = oldValue;
        NewValue = newValue;
        Environment = environment;
        ToggledBy = toggledBy;
    }

    public string FlagName { get; }
    public bool OldValue { get; }
    public bool NewValue { get; }
    public string Environment { get; }
    public string ToggledBy { get; }
}
