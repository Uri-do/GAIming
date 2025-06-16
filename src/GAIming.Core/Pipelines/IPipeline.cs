using GAIming.Core.Common;

namespace GAIming.Core.Pipelines;

/// <summary>
/// Pipeline context interface
/// </summary>
public interface IPipelineContext
{
    /// <summary>
    /// Unique context identifier
    /// </summary>
    Guid ContextId { get; }

    /// <summary>
    /// Context creation timestamp
    /// </summary>
    DateTime CreatedAt { get; }

    /// <summary>
    /// User identifier
    /// </summary>
    string? UserId { get; set; }

    /// <summary>
    /// Correlation identifier for tracing
    /// </summary>
    string? CorrelationId { get; set; }

    /// <summary>
    /// Context properties
    /// </summary>
    Dictionary<string, object> Properties { get; }

    /// <summary>
    /// Get property value
    /// </summary>
    T? GetProperty<T>(string key);

    /// <summary>
    /// Set property value
    /// </summary>
    void SetProperty<T>(string key, T value);

    /// <summary>
    /// Check if property exists
    /// </summary>
    bool HasProperty(string key);

    /// <summary>
    /// Remove property
    /// </summary>
    bool RemoveProperty(string key);
}

/// <summary>
/// Pipeline step interface
/// </summary>
/// <typeparam name="TInput">Input type</typeparam>
/// <typeparam name="TOutput">Output type</typeparam>
public interface IPipelineStep<TInput, TOutput>
{
    /// <summary>
    /// Step name
    /// </summary>
    string Name { get; }

    /// <summary>
    /// Step order/priority
    /// </summary>
    int Order { get; }

    /// <summary>
    /// Whether step is enabled
    /// </summary>
    bool IsEnabled { get; }

    /// <summary>
    /// Execute the pipeline step
    /// </summary>
    Task<Result<TOutput>> ExecuteAsync(TInput input, IPipelineContext context, CancellationToken cancellationToken = default);

    /// <summary>
    /// Handle step failure
    /// </summary>
    Task<Result<TOutput>> HandleFailureAsync(TInput input, IPipelineContext context, Exception exception, CancellationToken cancellationToken = default);
}

/// <summary>
/// Pipeline interface
/// </summary>
/// <typeparam name="TInput">Input type</typeparam>
/// <typeparam name="TOutput">Output type</typeparam>
public interface IPipeline<TInput, TOutput>
{
    /// <summary>
    /// Pipeline name
    /// </summary>
    string Name { get; }

    /// <summary>
    /// Add step to pipeline
    /// </summary>
    IPipeline<TInput, TOutput> AddStep<TStep>() where TStep : class, IPipelineStep<TInput, TOutput>;

    /// <summary>
    /// Add step instance to pipeline
    /// </summary>
    IPipeline<TInput, TOutput> AddStep(IPipelineStep<TInput, TOutput> step);

    /// <summary>
    /// Execute pipeline
    /// </summary>
    Task<Result<TOutput>> ExecuteAsync(TInput input, CancellationToken cancellationToken = default);

    /// <summary>
    /// Execute pipeline with context
    /// </summary>
    Task<Result<TOutput>> ExecuteAsync(TInput input, IPipelineContext context, CancellationToken cancellationToken = default);
}

/// <summary>
/// Pipeline builder interface
/// </summary>
/// <typeparam name="TInput">Input type</typeparam>
/// <typeparam name="TOutput">Output type</typeparam>
public interface IPipelineBuilder<TInput, TOutput>
{
    /// <summary>
    /// Add step to pipeline
    /// </summary>
    IPipelineBuilder<TInput, TOutput> AddStep<TStep>() where TStep : class, IPipelineStep<TInput, TOutput>;

    /// <summary>
    /// Add step with configuration
    /// </summary>
    IPipelineBuilder<TInput, TOutput> AddStep<TStep>(Action<TStep> configure) where TStep : class, IPipelineStep<TInput, TOutput>;

    /// <summary>
    /// Add conditional step
    /// </summary>
    IPipelineBuilder<TInput, TOutput> AddStepIf<TStep>(Func<TInput, IPipelineContext, bool> condition) where TStep : class, IPipelineStep<TInput, TOutput>;

    /// <summary>
    /// Build the pipeline
    /// </summary>
    IPipeline<TInput, TOutput> Build();
}

/// <summary>
/// Base pipeline step implementation
/// </summary>
/// <typeparam name="TInput">Input type</typeparam>
/// <typeparam name="TOutput">Output type</typeparam>
public abstract class BasePipelineStep<TInput, TOutput> : IPipelineStep<TInput, TOutput>
{
    protected BasePipelineStep(string name, int order = 0)
    {
        Name = name;
        Order = order;
        IsEnabled = true;
    }

    public string Name { get; }
    public int Order { get; }
    public bool IsEnabled { get; protected set; }

    public abstract Task<Result<TOutput>> ExecuteAsync(TInput input, IPipelineContext context, CancellationToken cancellationToken = default);

    public virtual Task<Result<TOutput>> HandleFailureAsync(TInput input, IPipelineContext context, Exception exception, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Result.Failure<TOutput>($"Step '{Name}' failed: {exception.Message}"));
    }

    protected void SetEnabled(bool enabled)
    {
        IsEnabled = enabled;
    }
}

/// <summary>
/// Pipeline context implementation
/// </summary>
public class PipelineContext : IPipelineContext
{
    public PipelineContext()
    {
        ContextId = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        Properties = new Dictionary<string, object>();
    }

    public Guid ContextId { get; }
    public DateTime CreatedAt { get; }
    public string? UserId { get; set; }
    public string? CorrelationId { get; set; }
    public Dictionary<string, object> Properties { get; }

    public T? GetProperty<T>(string key)
    {
        return Properties.TryGetValue(key, out var value) && value is T typedValue ? typedValue : default;
    }

    public void SetProperty<T>(string key, T value)
    {
        if (value != null)
            Properties[key] = value;
    }

    public bool HasProperty(string key)
    {
        return Properties.ContainsKey(key);
    }

    public bool RemoveProperty(string key)
    {
        return Properties.Remove(key);
    }
}

// Recommendation Pipeline Steps

/// <summary>
/// Player validation step
/// </summary>
public class ValidatePlayerStep : BasePipelineStep<Models.RecommendationRequest, Models.RecommendationRequest>
{
    public ValidatePlayerStep() : base("ValidatePlayer", 1) { }

    public override async Task<Result<Models.RecommendationRequest>> ExecuteAsync(
        Models.RecommendationRequest input, 
        IPipelineContext context, 
        CancellationToken cancellationToken = default)
    {
        // Validate player exists and is active
        if (input.PlayerId <= 0)
            return Result.Failure<Models.RecommendationRequest>("Invalid player ID");

        // Add player validation logic here
        context.SetProperty("PlayerValidated", true);

        await Task.CompletedTask;
        return Result.Success(input);
    }
}

/// <summary>
/// Feature extraction step
/// </summary>
public class ExtractFeaturesStep : BasePipelineStep<Models.RecommendationRequest, Models.RecommendationRequest>
{
    public ExtractFeaturesStep() : base("ExtractFeatures", 2) { }

    public override async Task<Result<Models.RecommendationRequest>> ExecuteAsync(
        Models.RecommendationRequest input, 
        IPipelineContext context, 
        CancellationToken cancellationToken = default)
    {
        // Extract player and game features
        context.SetProperty("PlayerFeatures", new Models.PlayerFeatures { PlayerId = input.PlayerId });
        context.SetProperty("GameFeatures", new List<Models.GameFeatures>());

        await Task.CompletedTask;
        return Result.Success(input);
    }
}

/// <summary>
/// Algorithm selection step
/// </summary>
public class SelectAlgorithmStep : BasePipelineStep<Models.RecommendationRequest, Models.RecommendationRequest>
{
    public SelectAlgorithmStep() : base("SelectAlgorithm", 3) { }

    public override async Task<Result<Models.RecommendationRequest>> ExecuteAsync(
        Models.RecommendationRequest input, 
        IPipelineContext context, 
        CancellationToken cancellationToken = default)
    {
        // Select best algorithm for this player/context
        var algorithm = input.Algorithm ?? "CollaborativeFiltering";
        context.SetProperty("SelectedAlgorithm", algorithm);

        await Task.CompletedTask;
        return Result.Success(input);
    }
}

/// <summary>
/// Generate recommendations step
/// </summary>
public class GenerateRecommendationsStep : BasePipelineStep<Models.RecommendationRequest, List<Models.GameRecommendationDto>>
{
    public GenerateRecommendationsStep() : base("GenerateRecommendations", 4) { }

    public override async Task<Result<List<Models.GameRecommendationDto>>> ExecuteAsync(
        Models.RecommendationRequest input, 
        IPipelineContext context, 
        CancellationToken cancellationToken = default)
    {
        // Generate recommendations using selected algorithm
        var recommendations = new List<Models.GameRecommendationDto>();

        // Add recommendation generation logic here

        await Task.CompletedTask;
        return Result.Success(recommendations);
    }
}

/// <summary>
/// Apply business rules step
/// </summary>
public class ApplyBusinessRulesStep : BasePipelineStep<List<Models.GameRecommendationDto>, List<Models.GameRecommendationDto>>
{
    public ApplyBusinessRulesStep() : base("ApplyBusinessRules", 5) { }

    public override async Task<Result<List<Models.GameRecommendationDto>>> ExecuteAsync(
        List<Models.GameRecommendationDto> input, 
        IPipelineContext context, 
        CancellationToken cancellationToken = default)
    {
        // Apply business rules (e.g., responsible gaming, regional restrictions)
        var filteredRecommendations = input.Where(r => r.Score > 0.1).ToList();

        await Task.CompletedTask;
        return Result.Success(filteredRecommendations);
    }
}

/// <summary>
/// Diversification step
/// </summary>
public class DiversifyRecommendationsStep : BasePipelineStep<List<Models.GameRecommendationDto>, List<Models.GameRecommendationDto>>
{
    public DiversifyRecommendationsStep() : base("DiversifyRecommendations", 6) { }

    public override async Task<Result<List<Models.GameRecommendationDto>>> ExecuteAsync(
        List<Models.GameRecommendationDto> input, 
        IPipelineContext context, 
        CancellationToken cancellationToken = default)
    {
        // Ensure diversity in recommendations
        var diversifiedRecommendations = input
            .GroupBy(r => r.GameTypeName)
            .SelectMany(g => g.Take(3)) // Max 3 per game type
            .ToList();

        await Task.CompletedTask;
        return Result.Success(diversifiedRecommendations);
    }
}

/// <summary>
/// Cache recommendations step
/// </summary>
public class CacheRecommendationsStep : BasePipelineStep<List<Models.GameRecommendationDto>, List<Models.GameRecommendationDto>>
{
    public CacheRecommendationsStep() : base("CacheRecommendations", 7) { }

    public override async Task<Result<List<Models.GameRecommendationDto>>> ExecuteAsync(
        List<Models.GameRecommendationDto> input, 
        IPipelineContext context, 
        CancellationToken cancellationToken = default)
    {
        // Cache recommendations for future use
        var playerId = context.GetProperty<long>("PlayerId");
        var cacheKey = $"recommendations:{playerId}";

        // Add caching logic here

        await Task.CompletedTask;
        return Result.Success(input);
    }
}

/// <summary>
/// Pipeline factory interface
/// </summary>
public interface IPipelineFactory
{
    /// <summary>
    /// Create recommendation pipeline
    /// </summary>
    IPipeline<Models.RecommendationRequest, List<Models.GameRecommendationDto>> CreateRecommendationPipeline();

    /// <summary>
    /// Create user registration pipeline
    /// </summary>
    IPipeline<Models.RegisterRequest, Models.RegisterResponse> CreateUserRegistrationPipeline();

    /// <summary>
    /// Create analytics pipeline
    /// </summary>
    IPipeline<Models.AnalyticsRequest, Models.DashboardSummaryDto> CreateAnalyticsPipeline();
}

/// <summary>
/// Pipeline metrics interface
/// </summary>
public interface IPipelineMetrics
{
    /// <summary>
    /// Record pipeline execution
    /// </summary>
    void RecordExecution(string pipelineName, TimeSpan duration, bool success);

    /// <summary>
    /// Record step execution
    /// </summary>
    void RecordStepExecution(string pipelineName, string stepName, TimeSpan duration, bool success);

    /// <summary>
    /// Get pipeline performance metrics
    /// </summary>
    Task<PipelinePerformanceMetrics> GetPerformanceMetricsAsync(string pipelineName, DateTime startDate, DateTime endDate);
}

/// <summary>
/// Pipeline performance metrics
/// </summary>
public class PipelinePerformanceMetrics
{
    public string PipelineName { get; set; } = string.Empty;
    public int TotalExecutions { get; set; }
    public int SuccessfulExecutions { get; set; }
    public int FailedExecutions { get; set; }
    public double SuccessRate { get; set; }
    public TimeSpan AverageExecutionTime { get; set; }
    public TimeSpan MinExecutionTime { get; set; }
    public TimeSpan MaxExecutionTime { get; set; }
    public Dictionary<string, StepPerformanceMetrics> StepMetrics { get; set; } = new();
}

/// <summary>
/// Step performance metrics
/// </summary>
public class StepPerformanceMetrics
{
    public string StepName { get; set; } = string.Empty;
    public int TotalExecutions { get; set; }
    public int SuccessfulExecutions { get; set; }
    public int FailedExecutions { get; set; }
    public double SuccessRate { get; set; }
    public TimeSpan AverageExecutionTime { get; set; }
    public TimeSpan MinExecutionTime { get; set; }
    public TimeSpan MaxExecutionTime { get; set; }
}
