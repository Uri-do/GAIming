using Microsoft.AspNetCore.Mvc;
using GAIming.Core.Models;
using GAIming.Core.Interfaces;

namespace GAIming.Api.Controllers;

/// <summary>
/// Recommendations controller for managing game recommendations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Tags("Recommendations")]
public class RecommendationsController : ControllerBase
{
    private readonly ILogger<RecommendationsController> _logger;

    public RecommendationsController(ILogger<RecommendationsController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Get recommendations for a specific player
    /// </summary>
    /// <param name="playerId">Player ID</param>
    /// <param name="count">Number of recommendations to return</param>
    /// <param name="algorithm">Algorithm to use</param>
    /// <param name="context">Context for recommendations</param>
    /// <returns>List of game recommendations</returns>
    [HttpGet("player/{playerId}")]
    [ProducesResponseType(typeof(ApiResponse<List<GameRecommendationDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<GameRecommendationDto>>>> GetPlayerRecommendations(
        long playerId,
        [FromQuery] int count = 10,
        [FromQuery] string? algorithm = null,
        [FromQuery] string? context = null)
    {
        try
        {
            _logger.LogInformation("Getting recommendations for player {PlayerId}, count: {Count}", playerId, count);

            var recommendations = GetMockRecommendations(playerId)
                .Take(count)
                .ToList();

            var response = new ApiResponse<List<GameRecommendationDto>>
            {
                Data = recommendations,
                Success = true,
                Message = "Recommendations retrieved successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendations for player {PlayerId}", playerId);
            var errorResponse = new ApiResponse<List<GameRecommendationDto>>
            {
                Data = new List<GameRecommendationDto>(),
                Success = false,
                Message = "Error retrieving recommendations",
                Errors = new[] { ex.Message }
            };
            return BadRequest(errorResponse);
        }
    }

    /// <summary>
    /// Record a recommendation click
    /// </summary>
    /// <param name="recommendationId">Recommendation ID</param>
    /// <returns>Success response</returns>
    [HttpPost("{recommendationId}/click")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<object>>> RecordClick(long recommendationId)
    {
        try
        {
            _logger.LogInformation("Recording click for recommendation {RecommendationId}", recommendationId);

            // In a real implementation, this would update the database
            // For now, just return success

            var response = new ApiResponse<object>
            {
                Data = new { recommendationId, clickedAt = DateTime.UtcNow },
                Success = true,
                Message = "Click recorded successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording click for recommendation {RecommendationId}", recommendationId);
            var errorResponse = new ApiResponse<object>
            {
                Data = null!,
                Success = false,
                Message = "Error recording click",
                Errors = new[] { ex.Message }
            };
            return BadRequest(errorResponse);
        }
    }

    /// <summary>
    /// Record a recommendation play
    /// </summary>
    /// <param name="recommendationId">Recommendation ID</param>
    /// <returns>Success response</returns>
    [HttpPost("{recommendationId}/play")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<object>>> RecordPlay(long recommendationId)
    {
        try
        {
            _logger.LogInformation("Recording play for recommendation {RecommendationId}", recommendationId);

            // In a real implementation, this would update the database
            // For now, just return success

            var response = new ApiResponse<object>
            {
                Data = new { recommendationId, playedAt = DateTime.UtcNow },
                Success = true,
                Message = "Play recorded successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording play for recommendation {RecommendationId}", recommendationId);
            var errorResponse = new ApiResponse<object>
            {
                Data = null!,
                Success = false,
                Message = "Error recording play",
                Errors = new[] { ex.Message }
            };
            return BadRequest(errorResponse);
        }
    }

    /// <summary>
    /// Generate personalized recommendations using advanced ML algorithms
    /// </summary>
    /// <param name="playerId">Player ID</param>
    /// <param name="algorithm">Algorithm to use (collaborative, content-based, hybrid, deep-learning)</param>
    /// <param name="context">Context for recommendations (homepage, game-detail, post-game)</param>
    /// <param name="count">Number of recommendations to generate</param>
    /// <returns>Generated recommendations</returns>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(ApiResponse<List<GameRecommendationDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<GameRecommendationDto>>>> GenerateRecommendations(
        [FromQuery] int playerId,
        [FromQuery] string algorithm = "hybrid",
        [FromQuery] string context = "homepage",
        [FromQuery] int count = 10)
    {
        try
        {
            _logger.LogInformation("Generating {Count} recommendations for player {PlayerId} using {Algorithm} algorithm in {Context} context",
                count, playerId, algorithm, context);

            var recommendations = GenerateAdvancedRecommendations(playerId, algorithm, context, count);

            var response = new ApiResponse<List<GameRecommendationDto>>
            {
                Data = recommendations,
                Success = true,
                Message = $"Generated {recommendations.Count} recommendations using {algorithm} algorithm"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating recommendations for player {PlayerId}", playerId);
            return BadRequest(new ApiResponse<List<GameRecommendationDto>>
            {
                Data = new List<GameRecommendationDto>(),
                Success = false,
                Message = "Error generating recommendations",
                Errors = new[] { ex.Message }
            });
        }
    }

    /// <summary>
    /// Get recommendation performance metrics
    /// </summary>
    /// <param name="playerId">Optional player ID filter</param>
    /// <param name="algorithm">Optional algorithm filter</param>
    /// <param name="startDate">Start date for metrics</param>
    /// <param name="endDate">End date for metrics</param>
    /// <returns>Performance metrics</returns>
    [HttpGet("performance")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<object>>> GetPerformanceMetrics(
        [FromQuery] int? playerId = null,
        [FromQuery] string? algorithm = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            _logger.LogInformation("Getting recommendation performance metrics");

            var metrics = new
            {
                summary = new
                {
                    totalRecommendations = 15420,
                    totalClicks = 3624,
                    totalPlays = 2187,
                    clickThroughRate = 23.5,
                    conversionRate = 14.2,
                    averageScore = 0.78
                },
                algorithmPerformance = new[]
                {
                    new { algorithm = "collaborative", ctr = 25.1, conversionRate = 15.8, avgScore = 0.82 },
                    new { algorithm = "content-based", ctr = 19.8, conversionRate = 11.1, avgScore = 0.75 },
                    new { algorithm = "hybrid", ctr = 27.3, conversionRate = 17.2, avgScore = 0.85 },
                    new { algorithm = "deep-learning", ctr = 29.1, conversionRate = 19.4, avgScore = 0.88 }
                },
                timeRange = new
                {
                    start = startDate ?? DateTime.UtcNow.AddDays(-30),
                    end = endDate ?? DateTime.UtcNow
                }
            };

            var response = new ApiResponse<object>
            {
                Data = metrics,
                Success = true,
                Message = "Performance metrics retrieved successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting performance metrics");
            return BadRequest(new ApiResponse<object>
            {
                Data = null!,
                Success = false,
                Message = "Error retrieving performance metrics",
                Errors = new[] { ex.Message }
            });
        }
    }

    /// <summary>
    /// Get recommendation analytics
    /// </summary>
    /// <param name="startDate">Start date</param>
    /// <param name="endDate">End date</param>
    /// <param name="algorithm">Algorithm filter</param>
    /// <returns>Recommendation analytics</returns>
    [HttpGet("analytics")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<object>>> GetAnalytics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? algorithm = null)
    {
        try
        {
            _logger.LogInformation("Getting recommendation analytics");

            var analytics = new
            {
                totalRecommendations = 15420,
                totalClicks = 3240,
                totalPlays = 1850,
                clickThroughRate = 21.0,
                conversionRate = 12.0,
                averageScore = 0.78,
                algorithmPerformance = new[]
                {
                    new { algorithm = "collaborative", ctr = 23.5, conversionRate = 14.2 },
                    new { algorithm = "content-based", ctr = 19.8, conversionRate = 11.1 },
                    new { algorithm = "hybrid", ctr = 25.1, conversionRate = 15.8 }
                },
                topPerformingGames = new[]
                {
                    new { gameId = 1, gameName = "The Legend of Zelda: Breath of the Wild", clicks = 450, plays = 280 },
                    new { gameId = 4, gameName = "Elden Ring", clicks = 380, plays = 245 },
                    new { gameId = 2, gameName = "God of War", clicks = 320, plays = 195 }
                }
            };

            var response = new ApiResponse<object>
            {
                Data = analytics,
                Success = true,
                Message = "Analytics retrieved successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendation analytics");
            var errorResponse = new ApiResponse<object>
            {
                Data = null!,
                Success = false,
                Message = "Error retrieving analytics",
                Errors = new[] { ex.Message }
            };
            return BadRequest(errorResponse);
        }
    }

    /// <summary>
    /// Get all recommendations with pagination and filtering
    /// </summary>
    /// <param name="page">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <param name="playerId">Player ID filter</param>
    /// <param name="algorithm">Algorithm filter</param>
    /// <param name="isActive">Active status filter</param>
    /// <returns>Paginated recommendations</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<GameRecommendationDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<GameRecommendationDto>>>> GetRecommendations(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] long? playerId = null,
        [FromQuery] string? algorithm = null,
        [FromQuery] bool? isActive = null)
    {
        try
        {
            _logger.LogInformation("Getting recommendations with filters - Page: {Page}, PageSize: {PageSize}", page, pageSize);

            // Mock recommendations data
            var allRecommendations = new List<GameRecommendationDto>();
            
            // Generate recommendations for multiple players
            for (long i = 1; i <= 5; i++)
            {
                allRecommendations.AddRange(GetMockRecommendations(i));
            }

            // Apply filters
            var filteredRecommendations = allRecommendations.AsQueryable();

            if (playerId.HasValue)
            {
                filteredRecommendations = filteredRecommendations.Where(r => r.PlayerId == playerId.Value);
            }

            if (!string.IsNullOrEmpty(algorithm))
            {
                filteredRecommendations = filteredRecommendations.Where(r => r.Algorithm.Contains(algorithm, StringComparison.OrdinalIgnoreCase));
            }

            if (isActive.HasValue)
            {
                filteredRecommendations = filteredRecommendations.Where(r => r.IsActive == isActive.Value);
            }

            // Apply pagination
            var totalCount = filteredRecommendations.Count();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
            var items = filteredRecommendations
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var paginatedResponse = new PaginatedResponse<GameRecommendationDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            var response = new ApiResponse<PaginatedResponse<GameRecommendationDto>>
            {
                Data = paginatedResponse,
                Success = true,
                Message = "Recommendations retrieved successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendations");
            var errorResponse = new ApiResponse<PaginatedResponse<GameRecommendationDto>>
            {
                Data = new PaginatedResponse<GameRecommendationDto> { Items = new List<GameRecommendationDto>() },
                Success = false,
                Message = "Error retrieving recommendations",
                Errors = new[] { ex.Message }
            };
            return BadRequest(errorResponse);
        }
    }

    private List<GameRecommendationDto> GetMockRecommendations(long playerId)
    {
        var games = GetMockGames();
        var random = new Random((int)playerId); // Seed with playerId for consistent results

        return new List<GameRecommendationDto>
        {
            new GameRecommendationDto
            {
                Id = playerId * 100 + 1,
                PlayerId = playerId,
                GameId = 1,
                Game = games[0],
                Score = 0.95,
                Algorithm = "collaborative",
                Reason = "Based on your love for open-world games",
                Position = 1,
                Category = "adventure",
                Context = "homepage",
                GeneratedDate = DateTime.UtcNow.AddHours(-2),
                IsActive = true,
                IsClicked = false
            },
            new GameRecommendationDto
            {
                Id = playerId * 100 + 2,
                PlayerId = playerId,
                GameId = 4,
                Game = games[3],
                Score = 0.87,
                Algorithm = "content-based",
                Reason = "Popular among players with similar preferences",
                Position = 2,
                Category = "rpg",
                Context = "homepage",
                GeneratedDate = DateTime.UtcNow.AddHours(-1),
                IsActive = true,
                IsClicked = false
            },
            new GameRecommendationDto
            {
                Id = playerId * 100 + 3,
                PlayerId = playerId,
                GameId = 2,
                Game = games[1],
                Score = 0.82,
                Algorithm = "hybrid",
                Reason = "Trending in action category",
                Position = 3,
                Category = "action",
                Context = "homepage",
                GeneratedDate = DateTime.UtcNow.AddMinutes(-30),
                IsActive = true,
                IsClicked = false
            }
        };
    }

    private List<GameDto> GetMockGames()
    {
        return new List<GameDto>
        {
            new GameDto
            {
                GameId = 1,
                GameName = "The Legend of Zelda: Breath of the Wild",
                ProviderId = 1,
                ProviderName = "Nintendo",
                GameTypeId = 1,
                GameTypeName = "Action-Adventure",
                IsActive = true,
                IsMobile = false,
                IsDesktop = true,
                ReleaseDate = new DateTime(2017, 3, 3),
                RtpPercentage = 95.0
            },
            new GameDto
            {
                GameId = 2,
                GameName = "God of War",
                ProviderId = 2,
                ProviderName = "Sony Interactive Entertainment",
                GameTypeId = 2,
                GameTypeName = "Action",
                IsActive = true,
                IsMobile = false,
                IsDesktop = true,
                ReleaseDate = new DateTime(2018, 4, 20),
                RtpPercentage = 94.5
            },
            new GameDto
            {
                GameId = 3,
                GameName = "Cyberpunk 2077",
                ProviderId = 3,
                ProviderName = "CD Projekt",
                GameTypeId = 3,
                GameTypeName = "RPG",
                IsActive = true,
                IsMobile = true,
                IsDesktop = true,
                ReleaseDate = new DateTime(2020, 12, 10),
                RtpPercentage = 92.0
            },
            new GameDto
            {
                GameId = 4,
                GameName = "Elden Ring",
                ProviderId = 4,
                ProviderName = "FromSoftware",
                GameTypeId = 3,
                GameTypeName = "RPG",
                IsActive = true,
                IsMobile = false,
                IsDesktop = true,
                ReleaseDate = new DateTime(2022, 2, 25),
                RtpPercentage = 96.5
            }
        };
    }

    private List<GameRecommendationDto> GenerateAdvancedRecommendations(int playerId, string algorithm, string context, int count)
    {
        var games = GetMockGames();
        var random = new Random();

        // Simulate different algorithm behaviors
        var selectedGames = algorithm.ToLower() switch
        {
            "collaborative" => games.OrderByDescending(g => g.GameId % 3).Take(count), // Simulate collaborative filtering
            "content-based" => games.OrderBy(g => g.GameTypeName).Take(count), // Simulate content-based filtering
            "deep-learning" => games.OrderByDescending(g => g.RtpPercentage).Take(count), // Simulate deep learning
            "hybrid" => games.OrderBy(g => random.Next()).Take(count), // Simulate hybrid approach
            _ => games.Take(count)
        };

        return selectedGames.Select((game, index) => new GameRecommendationDto
        {
            Id = 200 + index + (playerId * 100),
            PlayerId = playerId,
            GameId = game.GameId,
            Game = game,
            Score = GetAlgorithmScore(algorithm, random),
            Algorithm = algorithm,
            Reason = GetAdvancedRecommendationReason(game, algorithm, context),
            Position = index + 1,
            Category = GetGameCategory(game),
            Context = context,
            GeneratedDate = DateTime.UtcNow,
            IsActive = true,
            IsClicked = false,
            IsPlayed = false
        }).ToList();
    }

    private double GetAlgorithmScore(string algorithm, Random random)
    {
        return algorithm.ToLower() switch
        {
            "collaborative" => Math.Round(0.75 + (random.NextDouble() * 0.25), 2),
            "content-based" => Math.Round(0.65 + (random.NextDouble() * 0.35), 2),
            "deep-learning" => Math.Round(0.80 + (random.NextDouble() * 0.20), 2),
            "hybrid" => Math.Round(0.78 + (random.NextDouble() * 0.22), 2),
            _ => Math.Round(0.60 + (random.NextDouble() * 0.40), 2)
        };
    }

    private string GetAdvancedRecommendationReason(GameDto game, string algorithm, string context)
    {
        var reasons = algorithm.ToLower() switch
        {
            "collaborative" => new[]
            {
                $"Players with similar preferences loved {game.GameName}",
                $"Highly rated by users who played similar games",
                $"Popular among players in your gaming cohort"
            },
            "content-based" => new[]
            {
                $"Matches your preference for {game.GameTypeName} games",
                $"Similar gameplay mechanics to your favorite games",
                $"From {game.ProviderName}, a developer you enjoy"
            },
            "deep-learning" => new[]
            {
                $"AI predicts 95% match based on your gaming patterns",
                $"Neural network identified this as perfect for your playstyle",
                $"Deep learning model suggests high engagement potential"
            },
            "hybrid" => new[]
            {
                $"Combined analysis shows excellent fit for your preferences",
                $"Multi-algorithm consensus recommends this game",
                $"Hybrid model predicts high satisfaction score"
            },
            _ => new[] { $"Recommended based on your gaming history" }
        };

        var contextSuffix = context switch
        {
            "post-game" => " - perfect for your next session",
            "game-detail" => " - you might also enjoy this",
            "homepage" => " - trending in your area",
            _ => ""
        };

        var random = new Random();
        return reasons[random.Next(reasons.Length)] + contextSuffix;
    }

    private string GetModelVersion(string algorithm)
    {
        return algorithm.ToLower() switch
        {
            "collaborative" => "cf-v2.1.3",
            "content-based" => "cb-v1.8.2",
            "deep-learning" => "dl-v3.0.1",
            "hybrid" => "hybrid-v2.5.0",
            _ => "base-v1.0.0"
        };
    }

    private string GetGameCategory(GameDto game)
    {
        return game.GameTypeName?.ToLower() switch
        {
            "action-adventure" => "adventure",
            "action" => "action",
            "rpg" => "rpg",
            "strategy" => "strategy",
            "sports" => "sports",
            _ => "general"
        };
    }
}
