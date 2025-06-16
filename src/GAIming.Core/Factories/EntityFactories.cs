using GAIming.Core.Entities;
using GAIming.Core.Models;
using GAIming.Core.ValueObjects;
using GAIming.Core.Events;
using System.Text.Json;

namespace GAIming.Core.Factories;

/// <summary>
/// Base entity factory interface
/// </summary>
/// <typeparam name="TEntity">Entity type</typeparam>
public interface IEntityFactory<TEntity> where TEntity : class
{
    /// <summary>
    /// Create new entity instance
    /// </summary>
    TEntity Create();

    /// <summary>
    /// Create entity from model
    /// </summary>
    TEntity CreateFromModel(object model);

    /// <summary>
    /// Validate entity before creation
    /// </summary>
    bool ValidateEntity(TEntity entity);
}

/// <summary>
/// Game recommendation factory interface
/// </summary>
public interface IGameRecommendationFactory : IEntityFactory<GameRecommendation>
{
    /// <summary>
    /// Create recommendation from request
    /// </summary>
    GameRecommendation CreateFromRequest(
        RecommendationRequest request,
        long gameId,
        double score,
        int position,
        string algorithm);

    /// <summary>
    /// Create batch recommendations
    /// </summary>
    List<GameRecommendation> CreateBatch(
        long playerId,
        List<(long gameId, double score)> gameScores,
        string algorithm,
        string context);

    /// <summary>
    /// Create recommendation with metadata
    /// </summary>
    GameRecommendation CreateWithMetadata(
        long playerId,
        long gameId,
        double score,
        int position,
        string algorithm,
        string context,
        Dictionary<string, object>? metadata = null);
}

/// <summary>
/// User factory interface
/// </summary>
public interface IUserFactory : IEntityFactory<User>
{
    /// <summary>
    /// Create user from registration request
    /// </summary>
    User CreateFromRegistration(RegisterRequest request, string passwordHash);

    /// <summary>
    /// Create admin user
    /// </summary>
    User CreateAdminUser(string username, string email, string passwordHash);

    /// <summary>
    /// Create system user
    /// </summary>
    User CreateSystemUser(string username, string purpose);
}

/// <summary>
/// A/B test experiment factory interface
/// </summary>
public interface IABTestExperimentFactory : IEntityFactory<ABTestExperiment>
{
    /// <summary>
    /// Create experiment from request
    /// </summary>
    ABTestExperiment CreateFromRequest(CreateABTestRequest request, string createdBy);

    /// <summary>
    /// Create simple A/B test
    /// </summary>
    ABTestExperiment CreateSimpleABTest(
        string name,
        string description,
        string algorithmA,
        string algorithmB,
        DateTime startDate,
        DateTime? endDate = null);

    /// <summary>
    /// Create multi-variant test
    /// </summary>
    ABTestExperiment CreateMultiVariantTest(
        string name,
        string description,
        List<(string name, string algorithm, double traffic)> variants,
        DateTime startDate,
        DateTime? endDate = null);
}

/// <summary>
/// System notification factory interface
/// </summary>
public interface ISystemNotificationFactory : IEntityFactory<SystemNotification>
{
    /// <summary>
    /// Create notification from request
    /// </summary>
    SystemNotification CreateFromRequest(SystemNotificationRequest request, string createdBy);

    /// <summary>
    /// Create system alert
    /// </summary>
    SystemNotification CreateSystemAlert(
        string title,
        string message,
        string severity,
        string? actionUrl = null);

    /// <summary>
    /// Create user notification
    /// </summary>
    SystemNotification CreateUserNotification(
        long userId,
        string title,
        string message,
        string type = "Info",
        DateTime? expiryDate = null);

    /// <summary>
    /// Create broadcast notification
    /// </summary>
    SystemNotification CreateBroadcastNotification(
        string title,
        string message,
        string type = "Info",
        DateTime? expiryDate = null);
}

/// <summary>
/// Audit log factory interface
/// </summary>
public interface IAuditLogFactory : IEntityFactory<AuditLog>
{
    /// <summary>
    /// Create audit log entry
    /// </summary>
    AuditLog CreateAuditLog(
        string entityName,
        string entityId,
        string action,
        object? oldValues,
        object? newValues,
        string? userId,
        string? userName,
        string? ipAddress,
        string? userAgent);

    /// <summary>
    /// Create login audit log
    /// </summary>
    AuditLog CreateLoginAuditLog(
        long userId,
        string username,
        bool success,
        string ipAddress,
        string userAgent,
        string? failureReason = null);

    /// <summary>
    /// Create security audit log
    /// </summary>
    AuditLog CreateSecurityAuditLog(
        string eventType,
        string description,
        string severity,
        long? userId = null,
        string? ipAddress = null);
}

// Concrete factory implementations

/// <summary>
/// Game recommendation factory implementation
/// </summary>
public class GameRecommendationFactory : IGameRecommendationFactory
{
    public GameRecommendation Create()
    {
        return new GameRecommendation
        {
            CreatedDate = DateTime.UtcNow,
            IsClicked = false,
            IsPlayed = false
        };
    }

    public GameRecommendation CreateFromModel(object model)
    {
        if (model is not RecommendationRequest request)
            throw new ArgumentException("Invalid model type", nameof(model));

        return new GameRecommendation
        {
            PlayerId = request.PlayerId,
            Context = request.Context,
            CreatedDate = DateTime.UtcNow,
            IsClicked = false,
            IsPlayed = false
        };
    }

    public GameRecommendation CreateFromRequest(
        RecommendationRequest request,
        long gameId,
        double score,
        int position,
        string algorithm)
    {
        var recommendation = Create();
        recommendation.PlayerId = request.PlayerId;
        recommendation.GameId = gameId;
        recommendation.Algorithm = algorithm;
        recommendation.Score = score;
        recommendation.Position = position;
        recommendation.Context = request.Context;

        // Add domain event
        recommendation.AddDomainEvent(new GameRecommendationGeneratedEvent(
            request.PlayerId, gameId, algorithm, score, request.Context));

        return recommendation;
    }

    public List<GameRecommendation> CreateBatch(
        long playerId,
        List<(long gameId, double score)> gameScores,
        string algorithm,
        string context)
    {
        var recommendations = new List<GameRecommendation>();
        
        for (int i = 0; i < gameScores.Count; i++)
        {
            var (gameId, score) = gameScores[i];
            var recommendation = Create();
            recommendation.PlayerId = playerId;
            recommendation.GameId = gameId;
            recommendation.Algorithm = algorithm;
            recommendation.Score = score;
            recommendation.Position = i + 1;
            recommendation.Context = context;

            recommendation.AddDomainEvent(new GameRecommendationGeneratedEvent(
                playerId, gameId, algorithm, score, context));

            recommendations.Add(recommendation);
        }

        return recommendations;
    }

    public GameRecommendation CreateWithMetadata(
        long playerId,
        long gameId,
        double score,
        int position,
        string algorithm,
        string context,
        Dictionary<string, object>? metadata = null)
    {
        var recommendation = Create();
        recommendation.PlayerId = playerId;
        recommendation.GameId = gameId;
        recommendation.Algorithm = algorithm;
        recommendation.Score = score;
        recommendation.Position = position;
        recommendation.Context = context;

        if (metadata != null)
        {
            recommendation.Metadata = JsonSerializer.Serialize(metadata);
        }

        recommendation.AddDomainEvent(new GameRecommendationGeneratedEvent(
            playerId, gameId, algorithm, score, context));

        return recommendation;
    }

    public bool ValidateEntity(GameRecommendation entity)
    {
        return entity.PlayerId > 0 &&
               entity.GameId > 0 &&
               !string.IsNullOrEmpty(entity.Algorithm) &&
               entity.Score >= 0 && entity.Score <= 1 &&
               entity.Position > 0 &&
               !string.IsNullOrEmpty(entity.Context);
    }
}

/// <summary>
/// User factory implementation
/// </summary>
public class UserFactory : IUserFactory
{
    public User Create()
    {
        return new User
        {
            CreatedDate = DateTime.UtcNow,
            IsActive = true,
            IsEmailConfirmed = false,
            IsTwoFactorEnabled = false,
            FailedLoginAttempts = 0
        };
    }

    public User CreateFromModel(object model)
    {
        if (model is not RegisterRequest request)
            throw new ArgumentException("Invalid model type", nameof(model));

        return new User
        {
            Username = request.Username,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedDate = DateTime.UtcNow,
            IsActive = true,
            IsEmailConfirmed = false,
            IsTwoFactorEnabled = false,
            FailedLoginAttempts = 0
        };
    }

    public User CreateFromRegistration(RegisterRequest request, string passwordHash)
    {
        var user = CreateFromModel(request);
        user.PasswordHash = passwordHash;

        user.AddDomainEvent(new UserCreatedEvent(
            user.Id, user.Username, user.Email, new List<string>(), "System"));

        return user;
    }

    public User CreateAdminUser(string username, string email, string passwordHash)
    {
        var user = Create();
        user.Username = username;
        user.Email = email;
        user.PasswordHash = passwordHash;
        user.IsEmailConfirmed = true;
        user.FirstName = "Admin";
        user.LastName = "User";

        user.AddDomainEvent(new UserCreatedEvent(
            user.Id, user.Username, user.Email, new List<string> { "Administrator" }, "System"));

        return user;
    }

    public User CreateSystemUser(string username, string purpose)
    {
        var user = Create();
        user.Username = username;
        user.Email = $"{username}@system.gaiming.com";
        user.FirstName = "System";
        user.LastName = purpose;
        user.IsEmailConfirmed = true;
        user.IsActive = true;

        return user;
    }

    public bool ValidateEntity(User entity)
    {
        return !string.IsNullOrEmpty(entity.Username) &&
               !string.IsNullOrEmpty(entity.Email) &&
               !string.IsNullOrEmpty(entity.PasswordHash);
    }
}

/// <summary>
/// Entity factory provider interface
/// </summary>
public interface IEntityFactoryProvider
{
    /// <summary>
    /// Get factory for specific entity type
    /// </summary>
    IEntityFactory<TEntity> GetFactory<TEntity>() where TEntity : class;

    /// <summary>
    /// Register factory for entity type
    /// </summary>
    void RegisterFactory<TEntity>(IEntityFactory<TEntity> factory) where TEntity : class;
}

/// <summary>
/// Builder pattern base class
/// </summary>
/// <typeparam name="TEntity">Entity type</typeparam>
/// <typeparam name="TBuilder">Builder type</typeparam>
public abstract class EntityBuilder<TEntity, TBuilder> 
    where TEntity : class, new()
    where TBuilder : EntityBuilder<TEntity, TBuilder>
{
    protected TEntity _entity = new();

    /// <summary>
    /// Build the entity
    /// </summary>
    public virtual TEntity Build()
    {
        ValidateEntity();
        return _entity;
    }

    /// <summary>
    /// Reset builder to create new entity
    /// </summary>
    public virtual TBuilder Reset()
    {
        _entity = new TEntity();
        return (TBuilder)this;
    }

    /// <summary>
    /// Validate entity before building
    /// </summary>
    protected virtual void ValidateEntity()
    {
        // Override in derived classes
    }
}

/// <summary>
/// Game recommendation builder
/// </summary>
public class GameRecommendationBuilder : EntityBuilder<GameRecommendation, GameRecommendationBuilder>
{
    public GameRecommendationBuilder ForPlayer(long playerId)
    {
        _entity.PlayerId = playerId;
        return this;
    }

    public GameRecommendationBuilder ForGame(long gameId)
    {
        _entity.GameId = gameId;
        return this;
    }

    public GameRecommendationBuilder WithAlgorithm(string algorithm)
    {
        _entity.Algorithm = algorithm;
        return this;
    }

    public GameRecommendationBuilder WithScore(double score)
    {
        _entity.Score = score;
        return this;
    }

    public GameRecommendationBuilder AtPosition(int position)
    {
        _entity.Position = position;
        return this;
    }

    public GameRecommendationBuilder InContext(string context)
    {
        _entity.Context = context;
        return this;
    }

    public GameRecommendationBuilder WithMetadata(Dictionary<string, object> metadata)
    {
        _entity.Metadata = JsonSerializer.Serialize(metadata);
        return this;
    }

    protected override void ValidateEntity()
    {
        if (_entity.PlayerId <= 0)
            throw new InvalidOperationException("PlayerId must be set");
        if (_entity.GameId <= 0)
            throw new InvalidOperationException("GameId must be set");
        if (string.IsNullOrEmpty(_entity.Algorithm))
            throw new InvalidOperationException("Algorithm must be set");
        if (_entity.Score < 0 || _entity.Score > 1)
            throw new InvalidOperationException("Score must be between 0 and 1");
    }
}
