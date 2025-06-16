using GAIming.Core.Pipelines;
using GAIming.Core.Common;
using GAIming.Core.Models;
using GAIming.Core.Interfaces;
using GAIming.Core.Strategies;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace GAIming.Infrastructure.Pipelines;

/// <summary>
/// Pipeline implementation
/// </summary>
public class Pipeline<TInput, TOutput> : IPipeline<TInput, TOutput>
{
    private readonly List<IPipelineStep<TInput, TOutput>> _steps;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<Pipeline<TInput, TOutput>> _logger;

    public Pipeline(string name, IServiceProvider serviceProvider, ILogger<Pipeline<TInput, TOutput>> logger)
    {
        Name = name;
        _steps = new List<IPipelineStep<TInput, TOutput>>();
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public string Name { get; }

    public IPipeline<TInput, TOutput> AddStep<TStep>() where TStep : class, IPipelineStep<TInput, TOutput>
    {
        var step = _serviceProvider.GetRequiredService<TStep>();
        return AddStep(step);
    }

    public IPipeline<TInput, TOutput> AddStep(IPipelineStep<TInput, TOutput> step)
    {
        _steps.Add(step);
        _steps.Sort((x, y) => x.Order.CompareTo(y.Order));
        _logger.LogDebug("Added step {StepName} to pipeline {PipelineName}", step.Name, Name);
        return this;
    }

    public async Task<Result<TOutput>> ExecuteAsync(TInput input, CancellationToken cancellationToken = default)
    {
        var context = new PipelineContext();
        return await ExecuteAsync(input, context, cancellationToken);
    }

    public async Task<Result<TOutput>> ExecuteAsync(TInput input, IPipelineContext context, CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Executing pipeline {PipelineName} with {StepCount} steps", Name, _steps.Count);

        var currentInput = input;
        
        foreach (var step in _steps.Where(s => s.IsEnabled))
        {
            try
            {
                _logger.LogDebug("Executing step {StepName} in pipeline {PipelineName}", step.Name, Name);

                var stepResult = await step.ExecuteAsync(currentInput, context, cancellationToken);

                if (!stepResult.IsSuccess)
                {
                    _logger.LogError("Step {StepName} failed in pipeline {PipelineName}: {Error}", 
                        step.Name, Name, stepResult.Error);
                    return Result.Failure<TOutput>(stepResult.Error);
                }

                // For transformation pipelines, update the input for the next step
                if (stepResult.Value is TInput nextInput)
                {
                    currentInput = nextInput;
                }
                else if (stepResult.Value is TOutput output)
                {
                    return Result.Success(output);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in step {StepName} of pipeline {PipelineName}", step.Name, Name);
                
                try
                {
                    var failureResult = await step.HandleFailureAsync(currentInput, context, ex, cancellationToken);
                    if (failureResult.IsSuccess && failureResult.Value is TOutput output)
                    {
                        return Result.Success(output);
                    }
                }
                catch (Exception failureEx)
                {
                    _logger.LogError(failureEx, "Exception in failure handler for step {StepName}", step.Name);
                }

                return Result.Failure<TOutput>($"Pipeline step '{step.Name}' failed: {ex.Message}");
            }
        }

        // If we reach here and currentInput is TOutput, return it
        if (currentInput is TOutput finalOutput)
        {
            return Result.Success(finalOutput);
        }

        return Result.Failure<TOutput>("Pipeline completed but did not produce expected output type");
    }
}

/// <summary>
/// Pipeline builder implementation
/// </summary>
public class PipelineBuilder<TInput, TOutput> : IPipelineBuilder<TInput, TOutput>
{
    private readonly Pipeline<TInput, TOutput> _pipeline;
    private readonly IServiceProvider _serviceProvider;

    public PipelineBuilder(string name, IServiceProvider serviceProvider, ILogger<Pipeline<TInput, TOutput>> logger)
    {
        _pipeline = new Pipeline<TInput, TOutput>(name, serviceProvider, logger);
        _serviceProvider = serviceProvider;
    }

    public IPipelineBuilder<TInput, TOutput> AddStep<TStep>() where TStep : class, IPipelineStep<TInput, TOutput>
    {
        _pipeline.AddStep<TStep>();
        return this;
    }

    public IPipelineBuilder<TInput, TOutput> AddStep<TStep>(Action<TStep> configure) where TStep : class, IPipelineStep<TInput, TOutput>
    {
        var step = _serviceProvider.GetRequiredService<TStep>();
        configure(step);
        _pipeline.AddStep(step);
        return this;
    }

    public IPipelineBuilder<TInput, TOutput> AddStepIf<TStep>(Func<TInput, IPipelineContext, bool> condition) where TStep : class, IPipelineStep<TInput, TOutput>
    {
        var step = _serviceProvider.GetRequiredService<TStep>();
        var conditionalStep = new ConditionalPipelineStep<TInput, TOutput>(step, condition);
        _pipeline.AddStep(conditionalStep);
        return this;
    }

    public IPipeline<TInput, TOutput> Build()
    {
        return _pipeline;
    }
}

/// <summary>
/// Conditional pipeline step wrapper
/// </summary>
public class ConditionalPipelineStep<TInput, TOutput> : IPipelineStep<TInput, TOutput>
{
    private readonly IPipelineStep<TInput, TOutput> _innerStep;
    private readonly Func<TInput, IPipelineContext, bool> _condition;

    public ConditionalPipelineStep(IPipelineStep<TInput, TOutput> innerStep, Func<TInput, IPipelineContext, bool> condition)
    {
        _innerStep = innerStep;
        _condition = condition;
    }

    public string Name => $"Conditional({_innerStep.Name})";
    public int Order => _innerStep.Order;
    public bool IsEnabled => _innerStep.IsEnabled;

    public async Task<Result<TOutput>> ExecuteAsync(TInput input, IPipelineContext context, CancellationToken cancellationToken = default)
    {
        if (_condition(input, context))
        {
            return await _innerStep.ExecuteAsync(input, context, cancellationToken);
        }

        // Skip this step - return input as output if possible
        if (input is TOutput output)
        {
            return Result.Success(output);
        }

        return Result.Failure<TOutput>("Conditional step was skipped but input cannot be converted to output");
    }

    public async Task<Result<TOutput>> HandleFailureAsync(TInput input, IPipelineContext context, Exception exception, CancellationToken cancellationToken = default)
    {
        return await _innerStep.HandleFailureAsync(input, context, exception, cancellationToken);
    }
}

/// <summary>
/// Recommendation pipeline factory
/// </summary>
public class RecommendationPipelineFactory : IPipelineFactory
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RecommendationPipelineFactory> _logger;

    public RecommendationPipelineFactory(IServiceProvider serviceProvider, ILogger<RecommendationPipelineFactory> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public IPipeline<RecommendationRequest, List<GameRecommendationDto>> CreateRecommendationPipeline()
    {
        var logger = _serviceProvider.GetRequiredService<ILogger<Pipeline<RecommendationRequest, List<GameRecommendationDto>>>>();
        var builder = new PipelineBuilder<RecommendationRequest, List<GameRecommendationDto>>("RecommendationPipeline", _serviceProvider, logger);

        return builder
            .AddStep<ValidatePlayerStep>()
            .AddStep<ExtractFeaturesStep>()
            .AddStep<SelectAlgorithmStep>()
            .AddStep<GenerateRecommendationsStep>()
            .AddStep<ApplyBusinessRulesStep>()
            .AddStep<DiversifyRecommendationsStep>()
            .AddStep<CacheRecommendationsStep>()
            .Build();
    }

    public IPipeline<RegisterRequest, RegisterResponse> CreateUserRegistrationPipeline()
    {
        var logger = _serviceProvider.GetRequiredService<ILogger<Pipeline<RegisterRequest, RegisterResponse>>>();
        var builder = new PipelineBuilder<RegisterRequest, RegisterResponse>("UserRegistrationPipeline", _serviceProvider, logger);

        // Placeholder implementation - these steps would be implemented separately
        return builder.Build();
    }

    public IPipeline<AnalyticsRequest, DashboardSummaryDto> CreateAnalyticsPipeline()
    {
        var logger = _serviceProvider.GetRequiredService<ILogger<Pipeline<AnalyticsRequest, DashboardSummaryDto>>>();
        var builder = new PipelineBuilder<AnalyticsRequest, DashboardSummaryDto>("AnalyticsPipeline", _serviceProvider, logger);

        // Placeholder implementation - these steps would be implemented separately
        return builder.Build();
    }
}

/// <summary>
/// Enhanced recommendation pipeline steps
/// </summary>
public class ValidatePlayerStep : BasePipelineStep<RecommendationRequest, RecommendationRequest>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ValidatePlayerStep> _logger;

    public ValidatePlayerStep(IUnitOfWork unitOfWork, ILogger<ValidatePlayerStep> logger) 
        : base("ValidatePlayer", 1)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public override async Task<Result<RecommendationRequest>> ExecuteAsync(RecommendationRequest input, IPipelineContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            if (input.PlayerId <= 0)
            {
                return Result.Failure<RecommendationRequest>("Invalid player ID");
            }

            // Validate player exists and is active
            var playerRepo = _unitOfWork.GetRepository<IPlayerRepository>();
            var player = await playerRepo.GetByIdAsync(input.PlayerId);

            if (player == null)
            {
                return Result.Failure<RecommendationRequest>("Player not found");
            }

            if (!player.IsActive)
            {
                return Result.Failure<RecommendationRequest>("Player account is inactive");
            }

            context.SetProperty("Player", player);
            context.SetProperty("PlayerValidated", true);

            _logger.LogDebug("Player {PlayerId} validated successfully", input.PlayerId);
            return Result.Success(input);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating player {PlayerId}", input.PlayerId);
            return Result.Failure<RecommendationRequest>($"Player validation failed: {ex.Message}");
        }
    }
}

public class ExtractFeaturesStep : BasePipelineStep<RecommendationRequest, RecommendationRequest>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ExtractFeaturesStep> _logger;

    public ExtractFeaturesStep(IUnitOfWork unitOfWork, ILogger<ExtractFeaturesStep> logger) 
        : base("ExtractFeatures", 2)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public override async Task<Result<RecommendationRequest>> ExecuteAsync(RecommendationRequest input, IPipelineContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            // Extract player features
            var playerFeaturesRepo = _unitOfWork.GetRepository<IPlayerFeatureRepository>();
            var playerFeatures = await playerFeaturesRepo.GetByPlayerIdAsync(input.PlayerId);

            if (playerFeatures == null)
            {
                // Create default features for new players
                playerFeatures = new PlayerFeatures
                {
                    PlayerId = input.PlayerId,
                    SessionCount = 0,
                    LastPlayDate = DateTime.UtcNow
                };
            }

            // Extract game features
            var gameFeaturesRepo = _unitOfWork.GetRepository<IGameFeatureRepository>();
            var gameFeatures = await gameFeaturesRepo.GetAllAsync();

            context.SetProperty("PlayerFeatures", playerFeatures);
            context.SetProperty("GameFeatures", gameFeatures.ToList());

            _logger.LogDebug("Extracted features for player {PlayerId}: {GameCount} games available", 
                input.PlayerId, gameFeatures.Count());

            return Result.Success(input);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting features for player {PlayerId}", input.PlayerId);
            return Result.Failure<RecommendationRequest>($"Feature extraction failed: {ex.Message}");
        }
    }
}

public class SelectAlgorithmStep : BasePipelineStep<RecommendationRequest, RecommendationRequest>
{
    private readonly IStrategySelector _strategySelector;
    private readonly ILogger<SelectAlgorithmStep> _logger;

    public SelectAlgorithmStep(IStrategySelector strategySelector, ILogger<SelectAlgorithmStep> logger) 
        : base("SelectAlgorithm", 3)
    {
        _strategySelector = strategySelector;
        _logger = logger;
    }

    public override async Task<Result<RecommendationRequest>> ExecuteAsync(RecommendationRequest input, IPipelineContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            IRecommendationStrategy strategy;

            if (!string.IsNullOrEmpty(input.Algorithm))
            {
                // Use specified algorithm
                var strategyFactory = context.GetProperty<IRecommendationStrategyFactory>("StrategyFactory");
                strategy = strategyFactory?.CreateStrategy(input.Algorithm) ?? 
                          await _strategySelector.SelectStrategyAsync(input.PlayerId, input.Context, cancellationToken);
            }
            else
            {
                // Auto-select best algorithm
                strategy = await _strategySelector.SelectStrategyAsync(input.PlayerId, input.Context, cancellationToken);
            }

            context.SetProperty("SelectedStrategy", strategy);
            context.SetProperty("SelectedAlgorithm", strategy.Name);

            _logger.LogDebug("Selected algorithm {Algorithm} for player {PlayerId} in context {Context}", 
                strategy.Name, input.PlayerId, input.Context);

            return Result.Success(input);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error selecting algorithm for player {PlayerId}", input.PlayerId);
            return Result.Failure<RecommendationRequest>($"Algorithm selection failed: {ex.Message}");
        }
    }
}

public class GenerateRecommendationsStep : BasePipelineStep<RecommendationRequest, List<GameRecommendationDto>>
{
    private readonly ILogger<GenerateRecommendationsStep> _logger;

    public GenerateRecommendationsStep(ILogger<GenerateRecommendationsStep> logger) 
        : base("GenerateRecommendations", 4)
    {
        _logger = logger;
    }

    public override async Task<Result<List<GameRecommendationDto>>> ExecuteAsync(RecommendationRequest input, IPipelineContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var strategy = context.GetProperty<IRecommendationStrategy>("SelectedStrategy");
            var playerFeatures = context.GetProperty<PlayerFeatures>("PlayerFeatures");
            var gameFeatures = context.GetProperty<List<GameFeatures>>("GameFeatures");

            if (strategy == null || playerFeatures == null || gameFeatures == null)
            {
                return Result.Failure<List<GameRecommendationDto>>("Missing required context data for recommendation generation");
            }

            var recommendations = await strategy.GenerateRecommendationsAsync(input, playerFeatures, gameFeatures, cancellationToken);

            _logger.LogDebug("Generated {Count} recommendations for player {PlayerId} using {Algorithm}", 
                recommendations.Count, input.PlayerId, strategy.Name);

            return Result.Success(recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating recommendations for player {PlayerId}", input.PlayerId);
            return Result.Failure<List<GameRecommendationDto>>($"Recommendation generation failed: {ex.Message}");
        }
    }
}
