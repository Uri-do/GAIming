using GAIming.Core.Common;

namespace GAIming.Core.CQRS;

/// <summary>
/// Marker interface for commands
/// </summary>
public interface ICommand
{
}

/// <summary>
/// Command with return value
/// </summary>
/// <typeparam name="TResult">Return type</typeparam>
public interface ICommand<TResult> : ICommand
{
}

/// <summary>
/// Command handler interface
/// </summary>
/// <typeparam name="TCommand">Command type</typeparam>
public interface ICommandHandler<in TCommand> where TCommand : ICommand
{
    Task<Result> HandleAsync(TCommand command, CancellationToken cancellationToken = default);
}

/// <summary>
/// Command handler with return value
/// </summary>
/// <typeparam name="TCommand">Command type</typeparam>
/// <typeparam name="TResult">Return type</typeparam>
public interface ICommandHandler<in TCommand, TResult> where TCommand : ICommand<TResult>
{
    Task<Result<TResult>> HandleAsync(TCommand command, CancellationToken cancellationToken = default);
}

/// <summary>
/// Command dispatcher interface
/// </summary>
public interface ICommandDispatcher
{
    Task<Result> DispatchAsync<TCommand>(TCommand command, CancellationToken cancellationToken = default) where TCommand : ICommand;
    Task<Result<TResult>> DispatchAsync<TCommand, TResult>(TCommand command, CancellationToken cancellationToken = default) where TCommand : ICommand<TResult>;
}

/// <summary>
/// Base command class with audit information
/// </summary>
public abstract class BaseCommand : ICommand
{
    protected BaseCommand()
    {
        CommandId = Guid.NewGuid();
        Timestamp = DateTime.UtcNow;
    }

    public Guid CommandId { get; }
    public DateTime Timestamp { get; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Base command with return value
/// </summary>
/// <typeparam name="TResult">Return type</typeparam>
public abstract class BaseCommand<TResult> : BaseCommand, ICommand<TResult>
{
}

// Game Management Commands

/// <summary>
/// Create game recommendation command
/// </summary>
public class CreateGameRecommendationCommand : BaseCommand<long>
{
    public long PlayerId { get; set; }
    public long GameId { get; set; }
    public string Algorithm { get; set; } = string.Empty;
    public double Score { get; set; }
    public int Position { get; set; }
    public string Context { get; set; } = string.Empty;
    public string? SessionId { get; set; }
    public string? Platform { get; set; }
    public new Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Update game management settings command
/// </summary>
public class UpdateGameManagementSettingsCommand : BaseCommand<bool>
{
    public long GameId { get; set; }
    public bool? IsActiveOverride { get; set; }
    public bool? HideInLobbyOverride { get; set; }
    public int? GameOrderOverride { get; set; }
    public decimal? MinBetAmountOverride { get; set; }
    public decimal? MaxBetAmountOverride { get; set; }
    public bool? IsMobileOverride { get; set; }
    public bool? IsDesktopOverride { get; set; }
    public bool? UkCompliantOverride { get; set; }
    public decimal? JackpotContributionOverride { get; set; }
    public string? GameDescriptionOverride { get; set; }
    public string? ImageUrlOverride { get; set; }
    public string? ThumbnailUrlOverride { get; set; }
    public List<string>? TagsOverride { get; set; }
    public string? Notes { get; set; }
    public bool IsFeatured { get; set; }
    public int FeaturePriority { get; set; }
    public Dictionary<string, object>? PromotionSettings { get; set; }
    public Dictionary<string, object>? ABTestSettings { get; set; }
    public Dictionary<string, object>? ResponsibleGamingSettings { get; set; }
    public Dictionary<string, object>? RegionalSettings { get; set; }
    public Dictionary<string, object>? CustomMetadata { get; set; }
}

/// <summary>
/// Track recommendation interaction command
/// </summary>
public class TrackRecommendationInteractionCommand : BaseCommand<bool>
{
    public long RecommendationId { get; set; }
    public long PlayerId { get; set; }
    public long GameId { get; set; }
    public string InteractionType { get; set; } = string.Empty;
    public DateTime InteractionDate { get; set; } = DateTime.UtcNow;
    public string? SessionId { get; set; }
    public string? Platform { get; set; }
    public new string? UserAgent { get; set; }
    public new Dictionary<string, object>? Metadata { get; set; }
}

// User Management Commands

/// <summary>
/// Create user command
/// </summary>
public class CreateUserCommand : BaseCommand<long>
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool IsActive { get; set; } = true;
    public List<long> RoleIds { get; set; } = new();
}

/// <summary>
/// Update user command
/// </summary>
public class UpdateUserCommand : BaseCommand<bool>
{
    public new long UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool IsActive { get; set; }
    public List<long> RoleIds { get; set; } = new();
}

/// <summary>
/// Assign user role command
/// </summary>
public class AssignUserRoleCommand : BaseCommand<bool>
{
    public new long UserId { get; set; }
    public long RoleId { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

/// <summary>
/// Change password command
/// </summary>
public class ChangePasswordCommand : BaseCommand<bool>
{
    public new long UserId { get; set; }
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

// System Management Commands

/// <summary>
/// Update system configuration command
/// </summary>
public class UpdateSystemConfigurationCommand : BaseCommand<bool>
{
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
}

/// <summary>
/// Create system notification command
/// </summary>
public class CreateSystemNotificationCommand : BaseCommand<long>
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public bool IsGlobal { get; set; }
    public new long? UserId { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionText { get; set; }
    public new Dictionary<string, object>? Metadata { get; set; }
}

// A/B Testing Commands

/// <summary>
/// Create A/B test experiment command
/// </summary>
public class CreateABTestExperimentCommand : BaseCommand<long>
{
    public string ExperimentName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<CreateABTestVariantCommand> Variants { get; set; } = new();
}

/// <summary>
/// Create A/B test variant command
/// </summary>
public class CreateABTestVariantCommand
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public double TrafficPercentage { get; set; }
    public string Algorithm { get; set; } = string.Empty;
    public Dictionary<string, object>? Parameters { get; set; }
}

/// <summary>
/// Start A/B test experiment command
/// </summary>
public class StartABTestExperimentCommand : BaseCommand<bool>
{
    public long ExperimentId { get; set; }
}

/// <summary>
/// Stop A/B test experiment command
/// </summary>
public class StopABTestExperimentCommand : BaseCommand<bool>
{
    public long ExperimentId { get; set; }
    public string? WinningVariant { get; set; }
    public double? ConfidenceLevel { get; set; }
}

// Model Management Commands

/// <summary>
/// Deploy model command
/// </summary>
public class DeployModelCommand : BaseCommand<bool>
{
    public string ModelName { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Algorithm { get; set; } = string.Empty;
    public string ModelPath { get; set; } = string.Empty;
    public Dictionary<string, object>? Configuration { get; set; }
    public Dictionary<string, object>? Hyperparameters { get; set; }
    public bool IsDefault { get; set; }
}

/// <summary>
/// Retire model command
/// </summary>
public class RetireModelCommand : BaseCommand<bool>
{
    public long ModelId { get; set; }
    public string Reason { get; set; } = string.Empty;
}
