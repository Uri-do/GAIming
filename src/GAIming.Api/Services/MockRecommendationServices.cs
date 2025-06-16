using GAIming.Core.Interfaces;
using GAIming.Core.Entities;
using GAIming.Core.Models;
using System.Text.Json;

namespace GAIming.Api.Services;

/// <summary>
/// Mock implementation of real-time recommendation service
/// </summary>
public class MockRealTimeRecommendationService : IRealTimeRecommendationService
{
    private readonly ILogger<MockRealTimeRecommendationService> _logger;

    public MockRealTimeRecommendationService(ILogger<MockRealTimeRecommendationService> logger)
    {
        _logger = logger;
    }

    public async Task<List<GameRecommendation>> GetRecommendationsAsync(long playerId, int count, string? context = null)
    {
        _logger.LogInformation("Getting {Count} real-time recommendations for player {PlayerId}", count, playerId);

        await Task.Delay(50); // Simulate processing time

        var recommendations = new List<GameRecommendation>();
        for (int i = 1; i <= count; i++)
        {
            recommendations.Add(new GameRecommendation
            {
                Id = i,
                PlayerId = playerId,
                GameId = i,
                Algorithm = "real-time",
                Score = 0.9 - (i * 0.05),
                Position = i,
                Context = context ?? "homepage",
                IsClicked = false,
                IsPlayed = false,
                CreatedDate = DateTime.UtcNow,
                Features = JsonSerializer.Serialize(new Dictionary<string, object>
                {
                    { "confidence", 0.85 },
                    { "reason", "Popular game" }
                })
            });
        }

        return recommendations;
    }

    public async Task RecordInteractionAsync(long recommendationId, RecommendationInteractionType interactionType)
    {
        _logger.LogInformation("Recording {InteractionType} for recommendation {RecommendationId}", interactionType, recommendationId);
        await Task.CompletedTask;
    }
}

/// <summary>
/// Mock implementation of batch recommendation service
/// </summary>
public class MockBatchRecommendationService : IBatchRecommendationService
{
    private readonly ILogger<MockBatchRecommendationService> _logger;

    public MockBatchRecommendationService(ILogger<MockBatchRecommendationService> logger)
    {
        _logger = logger;
    }

    public async Task GeneratePlayerRecommendationsAsync(long playerId)
    {
        _logger.LogInformation("Generating batch recommendations for player {PlayerId}", playerId);
        await Task.Delay(100); // Simulate processing time
    }

    public async Task<List<GameRecommendation>> GetBatchRecommendationsAsync(long playerId)
    {
        _logger.LogInformation("Getting batch recommendations for player {PlayerId}", playerId);
        await Task.Delay(50);

        return new List<GameRecommendation>
        {
            new GameRecommendation
            {
                Id = 1,
                PlayerId = playerId,
                GameId = 1,
                Algorithm = "batch",
                Score = 0.95,
                Position = 1,
                Context = "batch",
                CreatedDate = DateTime.UtcNow
            }
        };
    }
}

/// <summary>
/// Mock implementation of collaborative filtering service
/// </summary>
public class MockCollaborativeFilteringService : ICollaborativeFilteringService
{
    private readonly ILogger<MockCollaborativeFilteringService> _logger;

    public MockCollaborativeFilteringService(ILogger<MockCollaborativeFilteringService> logger)
    {
        _logger = logger;
    }

    public async Task<List<GameRecommendation>> GetCollaborativeRecommendationsAsync(long playerId, int count)
    {
        _logger.LogInformation("Getting {Count} collaborative filtering recommendations for player {PlayerId}", count, playerId);
        await Task.Delay(75);

        var recommendations = new List<GameRecommendation>();
        for (int i = 1; i <= count; i++)
        {
            recommendations.Add(new GameRecommendation
            {
                Id = i,
                PlayerId = playerId,
                GameId = i + 10,
                Algorithm = "collaborative",
                Score = 0.88 - (i * 0.03),
                Position = i,
                Context = "collaborative",
                CreatedDate = DateTime.UtcNow
            });
        }

        return recommendations;
    }
}

/// <summary>
/// Mock implementation of content-based filtering service
/// </summary>
public class MockContentBasedFilteringService : IContentBasedFilteringService
{
    private readonly ILogger<MockContentBasedFilteringService> _logger;

    public MockContentBasedFilteringService(ILogger<MockContentBasedFilteringService> logger)
    {
        _logger = logger;
    }

    public async Task<List<GameRecommendation>> GetContentBasedRecommendationsAsync(long playerId, int count)
    {
        _logger.LogInformation("Getting {Count} content-based recommendations for player {PlayerId}", count, playerId);
        await Task.Delay(60);

        var recommendations = new List<GameRecommendation>();
        for (int i = 1; i <= count; i++)
        {
            recommendations.Add(new GameRecommendation
            {
                Id = i,
                PlayerId = playerId,
                GameId = i + 20,
                Algorithm = "content-based",
                Score = 0.82 - (i * 0.04),
                Position = i,
                Context = "content-based",
                CreatedDate = DateTime.UtcNow
            });
        }

        return recommendations;
    }

    public async Task<List<Game>> GetSimilarGamesAsync(long gameId, int count)
    {
        _logger.LogInformation("Getting {Count} similar games for game {GameId}", count, gameId);
        await Task.Delay(40);

        var games = new List<Game>();
        for (int i = 1; i <= count; i++)
        {
            games.Add(new Game
            {
                GameID = (int)(gameId + i),
                GameName = $"Similar Game {i}",
                ProviderID = 1,
                GameTypeID = 1,
                IsActive = true,
                IsMobile = true,
                IsDesktop = true,
                MinBetAmount = 0.10m,
                RTPPercentage = 95.5,
                CreatedDate = DateTime.UtcNow
            });
        }

        return games;
    }
}

/// <summary>
/// Mock implementation of hybrid recommendation service
/// </summary>
public class MockHybridRecommendationService : IHybridRecommendationService
{
    private readonly ILogger<MockHybridRecommendationService> _logger;

    public MockHybridRecommendationService(ILogger<MockHybridRecommendationService> logger)
    {
        _logger = logger;
    }

    public async Task<List<GameRecommendation>> GetHybridRecommendationsAsync(long playerId, int count)
    {
        _logger.LogInformation("Getting {Count} hybrid recommendations for player {PlayerId}", count, playerId);
        await Task.Delay(90);

        var recommendations = new List<GameRecommendation>();
        for (int i = 1; i <= count; i++)
        {
            recommendations.Add(new GameRecommendation
            {
                Id = i,
                PlayerId = playerId,
                GameId = i + 30,
                Algorithm = "hybrid",
                Score = 0.92 - (i * 0.02),
                Position = i,
                Context = "hybrid",
                CreatedDate = DateTime.UtcNow
            });
        }

        return recommendations;
    }
}

/// <summary>
/// Mock implementation of bandit recommendation service
/// </summary>
public class MockBanditRecommendationService : IBanditRecommendationService
{
    private readonly ILogger<MockBanditRecommendationService> _logger;

    public MockBanditRecommendationService(ILogger<MockBanditRecommendationService> logger)
    {
        _logger = logger;
    }

    public async Task<List<GameRecommendation>> GetBanditRecommendationsAsync(long playerId, int count)
    {
        _logger.LogInformation("Getting {Count} bandit recommendations for player {PlayerId}", count, playerId);
        await Task.Delay(70);

        var recommendations = new List<GameRecommendation>();
        for (int i = 1; i <= count; i++)
        {
            recommendations.Add(new GameRecommendation
            {
                Id = i,
                PlayerId = playerId,
                GameId = i + 40,
                Algorithm = "bandit",
                Score = 0.85 - (i * 0.03),
                Position = i,
                Context = "bandit",
                CreatedDate = DateTime.UtcNow
            });
        }

        return recommendations;
    }
}
