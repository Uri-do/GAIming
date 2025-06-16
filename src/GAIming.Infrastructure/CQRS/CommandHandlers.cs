using GAIming.Core.CQRS;
using GAIming.Core.Common;
using GAIming.Core.Interfaces;
using GAIming.Core.Factories;
using GAIming.Core.Events;
using GAIming.Core.Entities;
using GAIming.Core.Models;
using Microsoft.Extensions.Logging;

namespace GAIming.Infrastructure.CQRS;

/// <summary>
/// Command dispatcher implementation
/// </summary>
public class CommandDispatcher : ICommandDispatcher
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CommandDispatcher> _logger;

    public CommandDispatcher(IServiceProvider serviceProvider, ILogger<CommandDispatcher> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task<Result> DispatchAsync<TCommand>(TCommand command, CancellationToken cancellationToken = default) where TCommand : ICommand
    {
        try
        {
            var handler = _serviceProvider.GetService(typeof(ICommandHandler<TCommand>)) as ICommandHandler<TCommand>;
        if (handler == null)
        {
            _logger.LogError("No handler found for command {CommandType}", typeof(TCommand).Name);
            return Result.Failure($"No handler found for command {typeof(TCommand).Name}");
        }
            _logger.LogDebug("Dispatching command {CommandType}", typeof(TCommand).Name);
            
            var result = await handler.HandleAsync(command, cancellationToken);
            
            _logger.LogDebug("Command {CommandType} completed with result: {Success}", 
                typeof(TCommand).Name, result.IsSuccess);
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error dispatching command {CommandType}", typeof(TCommand).Name);
            return Result.Failure($"Command dispatch failed: {ex.Message}");
        }
    }

    public async Task<Result<TResult>> DispatchAsync<TCommand, TResult>(TCommand command, CancellationToken cancellationToken = default) where TCommand : ICommand<TResult>
    {
        try
        {
            var handler = _serviceProvider.GetService(typeof(ICommandHandler<TCommand, TResult>)) as ICommandHandler<TCommand, TResult>;
        if (handler == null)
        {
            _logger.LogError("No handler found for command {CommandType}", typeof(TCommand).Name);
            return Result.Failure<TResult>($"No handler found for command {typeof(TCommand).Name}");
        }
            _logger.LogDebug("Dispatching command {CommandType}", typeof(TCommand).Name);
            
            var result = await handler.HandleAsync(command, cancellationToken);
            
            _logger.LogDebug("Command {CommandType} completed with result: {Success}", 
                typeof(TCommand).Name, result.IsSuccess);
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error dispatching command {CommandType}", typeof(TCommand).Name);
            return Result.Failure<TResult>($"Command dispatch failed: {ex.Message}");
        }
    }
}

/// <summary>
/// Create game recommendation command handler
/// </summary>
public class CreateGameRecommendationCommandHandler : ICommandHandler<CreateGameRecommendationCommand, long>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGameRecommendationFactory _factory;
    private readonly ILogger<CreateGameRecommendationCommandHandler> _logger;

    public CreateGameRecommendationCommandHandler(
        IUnitOfWork unitOfWork,
        IGameRecommendationFactory factory,
        ILogger<CreateGameRecommendationCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _factory = factory;
        _logger = logger;
    }

    public async Task<Result<long>> HandleAsync(CreateGameRecommendationCommand command, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogDebug("Creating game recommendation for player {PlayerId}, game {GameId}", 
                command.PlayerId, command.GameId);

            // Create recommendation using factory
            var recommendation = _factory.CreateWithMetadata(
                command.PlayerId,
                command.GameId,
                command.Score,
                command.Position,
                command.Algorithm,
                command.Context,
                command.Metadata);

            // Validate recommendation
            if (!_factory.ValidateEntity(recommendation))
            {
                return Result.Failure<long>("Invalid recommendation data");
            }

            // Save using Unit of Work
            await _unitOfWork.BeginTransactionAsync(cancellationToken);
            
            var repository = _unitOfWork.GetRepository<IGameRecommendationRepository>();
            var savedRecommendation = await repository.AddAsync(recommendation);
            
            var result = await _unitOfWork.SaveChangesAndDispatchEventsAsync(cancellationToken);
            
            if (result > 0)
            {
                await _unitOfWork.CommitTransactionAsync(cancellationToken);
                _logger.LogInformation("Created game recommendation {RecommendationId} for player {PlayerId}", 
                    savedRecommendation.Id, command.PlayerId);
                return Result.Success(savedRecommendation.Id);
            }
            else
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<long>("Failed to save recommendation");
            }
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            _logger.LogError(ex, "Error creating game recommendation for player {PlayerId}", command.PlayerId);
            return Result.Failure<long>($"Failed to create recommendation: {ex.Message}");
        }
    }
}

/// <summary>
/// Update game management settings command handler
/// </summary>
public class UpdateGameManagementSettingsCommandHandler : ICommandHandler<UpdateGameManagementSettingsCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateGameManagementSettingsCommandHandler> _logger;

    public UpdateGameManagementSettingsCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<UpdateGameManagementSettingsCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<bool>> HandleAsync(UpdateGameManagementSettingsCommand command, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogDebug("Updating game management settings for game {GameId}", command.GameId);

            await _unitOfWork.BeginTransactionAsync(cancellationToken);

            var repository = _unitOfWork.GetRepository<IGameManagementSettingsRepository>();
            var settings = await repository.GetByGameIdAsync(command.GameId);

            if (settings == null)
            {
                // Create new settings
                settings = new GameManagementSettings
                {
                    GameId = command.GameId,
                    CreatedDate = DateTime.UtcNow,
                    CreatedBy = command.UserName
                };
            }

            // Update settings
            UpdateSettingsFromCommand(settings, command);
            settings.UpdatedDate = DateTime.UtcNow;
            settings.UpdatedBy = command.UserName;

            if (settings.Id == 0)
            {
                await repository.AddAsync(settings);
            }
            else
            {
                await repository.UpdateAsync(settings);
            }

            var result = await _unitOfWork.SaveChangesAndDispatchEventsAsync(cancellationToken);

            if (result > 0)
            {
                await _unitOfWork.CommitTransactionAsync(cancellationToken);
                _logger.LogInformation("Updated game management settings for game {GameId}", command.GameId);
                return Result.Success(true);
            }
            else
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<bool>("Failed to save game management settings");
            }
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            _logger.LogError(ex, "Error updating game management settings for game {GameId}", command.GameId);
            return Result.Failure<bool>($"Failed to update settings: {ex.Message}");
        }
    }

    private void UpdateSettingsFromCommand(GameManagementSettings settings, UpdateGameManagementSettingsCommand command)
    {
        if (command.IsActiveOverride.HasValue)
            settings.IsActiveOverride = command.IsActiveOverride.Value;
        
        if (command.HideInLobbyOverride.HasValue)
            settings.HideInLobbyOverride = command.HideInLobbyOverride.Value;
        
        if (command.GameOrderOverride.HasValue)
            settings.GameOrderOverride = command.GameOrderOverride.Value;
        
        if (command.MinBetAmountOverride.HasValue)
            settings.MinBetAmountOverride = command.MinBetAmountOverride.Value;
        
        if (command.MaxBetAmountOverride.HasValue)
            settings.MaxBetAmountOverride = command.MaxBetAmountOverride.Value;
        
        if (command.IsMobileOverride.HasValue)
            settings.IsMobileOverride = command.IsMobileOverride.Value;
        
        if (command.IsDesktopOverride.HasValue)
            settings.IsDesktopOverride = command.IsDesktopOverride.Value;
        
        if (command.UkCompliantOverride.HasValue)
            settings.UkCompliantOverride = command.UkCompliantOverride.Value;
        
        if (command.JackpotContributionOverride.HasValue)
            settings.JackpotContributionOverride = command.JackpotContributionOverride.Value;
        
        if (!string.IsNullOrEmpty(command.GameDescriptionOverride))
            settings.GameDescriptionOverride = command.GameDescriptionOverride;
        
        if (!string.IsNullOrEmpty(command.ImageUrlOverride))
            settings.ImageUrlOverride = command.ImageUrlOverride;
        
        if (!string.IsNullOrEmpty(command.ThumbnailUrlOverride))
            settings.ThumbnailUrlOverride = command.ThumbnailUrlOverride;
        
        if (command.TagsOverride?.Any() == true)
            settings.TagsOverride = string.Join(",", command.TagsOverride);
        
        if (!string.IsNullOrEmpty(command.Notes))
            settings.Notes = command.Notes;
        
        settings.IsFeatured = command.IsFeatured;
        settings.FeaturePriority = command.FeaturePriority;
        
        if (command.PromotionSettings != null)
            settings.PromotionSettings = System.Text.Json.JsonSerializer.Serialize(command.PromotionSettings);
        
        if (command.ABTestSettings != null)
            settings.ABTestSettings = System.Text.Json.JsonSerializer.Serialize(command.ABTestSettings);
        
        if (command.ResponsibleGamingSettings != null)
            settings.ResponsibleGamingSettings = System.Text.Json.JsonSerializer.Serialize(command.ResponsibleGamingSettings);
        
        if (command.RegionalSettings != null)
            settings.RegionalSettings = System.Text.Json.JsonSerializer.Serialize(command.RegionalSettings);
        
        if (command.CustomMetadata != null)
            settings.CustomMetadata = System.Text.Json.JsonSerializer.Serialize(command.CustomMetadata);
    }
}

/// <summary>
/// Track recommendation interaction command handler
/// </summary>
public class TrackRecommendationInteractionCommandHandler : ICommandHandler<TrackRecommendationInteractionCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<TrackRecommendationInteractionCommandHandler> _logger;

    public TrackRecommendationInteractionCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<TrackRecommendationInteractionCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<bool>> HandleAsync(TrackRecommendationInteractionCommand command, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogDebug("Tracking recommendation interaction {InteractionType} for recommendation {RecommendationId}", 
                command.InteractionType, command.RecommendationId);

            await _unitOfWork.BeginTransactionAsync(cancellationToken);

            // Update recommendation
            var recommendationRepo = _unitOfWork.GetRepository<IGameRecommendationRepository>();
            var recommendation = await recommendationRepo.GetByIdAsync(command.RecommendationId);

            if (recommendation == null)
            {
                return Result.Failure<bool>("Recommendation not found");
            }

            // Update interaction flags
            switch (command.InteractionType.ToLower())
            {
                case "click":
                    recommendation.IsClicked = true;
                    recommendation.ClickedAt = command.InteractionDate;
                    break;
                case "play":
                    recommendation.IsPlayed = true;
                    recommendation.PlayedAt = command.InteractionDate;
                    break;
            }

            await recommendationRepo.UpdateAsync(recommendation);

            // Create interaction record
            var interactionRepo = _unitOfWork.GetRepository<IRecommendationInteractionRepository>();
            var interaction = new RecommendationInteraction
            {
                RecommendationId = command.RecommendationId,
                PlayerId = command.PlayerId,
                GameId = command.GameId,
                InteractionType = command.InteractionType,
                InteractionDate = command.InteractionDate,
                SessionId = command.SessionId,
                Platform = command.Platform,
                UserAgent = command.UserAgent,
                Metadata = command.Metadata != null ? System.Text.Json.JsonSerializer.Serialize(command.Metadata) : null,
                CreatedDate = DateTime.UtcNow
            };

            await interactionRepo.AddAsync(interaction);

            var result = await _unitOfWork.SaveChangesAndDispatchEventsAsync(cancellationToken);

            if (result > 0)
            {
                await _unitOfWork.CommitTransactionAsync(cancellationToken);
                _logger.LogInformation("Tracked recommendation interaction {InteractionType} for recommendation {RecommendationId}", 
                    command.InteractionType, command.RecommendationId);
                return Result.Success(true);
            }
            else
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<bool>("Failed to save interaction");
            }
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            _logger.LogError(ex, "Error tracking recommendation interaction for recommendation {RecommendationId}", 
                command.RecommendationId);
            return Result.Failure<bool>($"Failed to track interaction: {ex.Message}");
        }
    }
}
