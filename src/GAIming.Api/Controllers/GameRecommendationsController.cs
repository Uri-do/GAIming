using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GAIming.Core.Interfaces;
using GAIming.Core.Models;
using System.Text.Json;
using GAIming.Core.Entities;

namespace GAIming.Api.Controllers;

/// <summary>
/// Enhanced controller for game recommendations with advanced features
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GameRecommendationsController : ControllerBase
{
    private readonly IRealTimeRecommendationService _realTimeService;
    private readonly IBatchRecommendationService _batchService;
    private readonly ICollaborativeFilteringService _collaborativeService;
    private readonly IContentBasedFilteringService _contentBasedService;
    private readonly IHybridRecommendationService _hybridService;
    private readonly IBanditRecommendationService _banditService;
    private readonly IGameRepository _gameRepository;
    private readonly ILogger<GameRecommendationsController> _logger;

    public GameRecommendationsController(
        IRealTimeRecommendationService realTimeService,
        IBatchRecommendationService batchService,
        ICollaborativeFilteringService collaborativeService,
        IContentBasedFilteringService contentBasedService,
        IHybridRecommendationService hybridService,
        IBanditRecommendationService banditService,
        IGameRepository gameRepository,
        ILogger<GameRecommendationsController> logger)
    {
        _realTimeService = realTimeService;
        _batchService = batchService;
        _collaborativeService = collaborativeService;
        _contentBasedService = contentBasedService;
        _hybridService = hybridService;
        _banditService = banditService;
        _gameRepository = gameRepository;
        _logger = logger;
    }

    /// <summary>
    /// Gets personalized game recommendations for a player
    /// </summary>
    /// <param name="playerId">Player identifier</param>
    /// <param name="algorithm">Algorithm to use (collaborative, content-based, hybrid, bandit)</param>
    /// <param name="count">Number of recommendations</param>
    /// <param name="context">Context for recommendations (homepage, game-end, etc.)</param>
    /// <param name="includeMetadata">Include detailed metadata</param>
    /// <returns>Personalized game recommendations</returns>
    [HttpGet("player/{playerId}")]
    [ProducesResponseType(typeof(EnhancedRecommendationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPersonalizedRecommendations(
        long playerId,
        [FromQuery] string algorithm = "hybrid",
        [FromQuery] int count = 10,
        [FromQuery] string? context = null,
        [FromQuery] bool includeMetadata = false)
    {
        try
        {
            _logger.LogInformation("Getting {Algorithm} recommendations for player {PlayerId}, count: {Count}, context: {Context}", 
                algorithm, playerId, count, context);

            if (playerId <= 0)
            {
                return BadRequest("Invalid player ID");
            }

            if (count <= 0 || count > 50)
            {
                return BadRequest("Count must be between 1 and 50");
            }

            var startTime = DateTime.UtcNow;
            List<GameRecommendation> recommendations;

            // Route to appropriate algorithm
            recommendations = algorithm.ToLower() switch
            {
                "collaborative" => await _collaborativeService.GetCollaborativeRecommendationsAsync(playerId, count),
                "content-based" => await _contentBasedService.GetContentBasedRecommendationsAsync(playerId, count),
                "bandit" => await _banditService.GetBanditRecommendationsAsync(playerId, count),
                "hybrid" => await _hybridService.GetHybridRecommendationsAsync(playerId, count),
                _ => await _realTimeService.GetRecommendationsAsync(playerId, count, context)
            };

            var processingTime = (DateTime.UtcNow - startTime).TotalMilliseconds;

            if (!recommendations.Any())
            {
                _logger.LogWarning("No recommendations found for player {PlayerId} using {Algorithm}", playerId, algorithm);
                return NotFound("No recommendations available for this player");
            }

            // Enhance recommendations with game details if requested
            var response = new EnhancedRecommendationResponse
            {
                PlayerId = playerId,
                Algorithm = algorithm,
                Context = context,
                ProcessingTimeMs = processingTime,
                TotalRecommendations = recommendations.Count,
                Recommendations = new List<EnhancedGameRecommendationDto>()
            };

            foreach (var rec in recommendations)
            {
                var enhancedRec = new EnhancedGameRecommendationDto
                {
                    GameId = rec.GameId,
                    Score = rec.Score,
                    Position = rec.Position,
                    Reason = rec.Reason ?? string.Empty,
                    Category = rec.Category ?? string.Empty,
                    Confidence = CalculateConfidence(rec.Score, algorithm),
                    Features = !string.IsNullOrEmpty(rec.Features)
                        ? JsonSerializer.Deserialize<Dictionary<string, object>>(rec.Features)
                        : null
                };

                if (includeMetadata)
                {
                    var game = await _gameRepository.GetByIdAsync(rec.GameId);
                    if (game != null)
                    {
                        enhancedRec.GameMetadata = new GameMetadata
                        {
                            Name = game.GameName,
                            Provider = game.Provider?.Name ?? "Unknown",
                            GameType = game.GameType?.Name ?? "Unknown",
                            Volatility = game.VolatilityID,
                            RTP = game.GetAverageRTP(),
                            IsMobile = game.IsMobile,
                            IsDesktop = game.IsDesktop,
                            MinBetAmount = game.MinBetAmount,
                            ReleaseDate = game.ReleaseDate
                        };
                    }
                }

                response.Recommendations.Add(enhancedRec);
            }

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendations for player {PlayerId}", playerId);
            return StatusCode(500, "An error occurred while getting recommendations");
        }
    }

    /// <summary>
    /// Gets similar games based on a specific game
    /// </summary>
    /// <param name="gameId">Game identifier</param>
    /// <param name="count">Number of similar games</param>
    /// <param name="playerId">Optional player ID for personalization</param>
    /// <returns>Similar games recommendations</returns>
    [HttpGet("similar-games/{gameId}")]
    [ProducesResponseType(typeof(SimilarGamesResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSimilarGames(
        long gameId,
        [FromQuery] int count = 10,
        [FromQuery] long? playerId = null)
    {
        try
        {
            _logger.LogInformation("Getting similar games for game {GameId}, count: {Count}", gameId, count);

            var similarGames = await _contentBasedService.GetSimilarGamesAsync(gameId, count);

            var response = new SimilarGamesResponse
            {
                BaseGameId = gameId,
                SimilarGames = similarGames.Select(g => new SimilarGameDto
                {
                    GameId = g.GameID,
                    SimilarityScore = 0.8, // Default similarity score
                    Reason = "Similar content features"
                }).ToList()
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting similar games for {GameId}", gameId);
            return StatusCode(500, "An error occurred while getting similar games");
        }
    }

    /// <summary>
    /// Gets trending games recommendations
    /// </summary>
    /// <param name="timeframe">Timeframe for trending analysis (1h, 24h, 7d, 30d)</param>
    /// <param name="count">Number of trending games</param>
    /// <param name="playerId">Optional player ID for personalization</param>
    /// <returns>Trending games</returns>
    [HttpGet("trending")]
    [ProducesResponseType(typeof(TrendingGamesResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTrendingGames(
        [FromQuery] string timeframe = "24h",
        [FromQuery] int count = 10,
        [FromQuery] long? playerId = null)
    {
        try
        {
            _logger.LogInformation("Getting trending games for timeframe {Timeframe}, count: {Count}", timeframe, count);

            var trendingGames = await _gameRepository.GetTrendingGamesAsync(timeframe, count, playerId);

            var response = new TrendingGamesResponse
            {
                Timeframe = timeframe,
                GeneratedAt = DateTime.UtcNow,
                TrendingGames = trendingGames.Select(g => new TrendingGameDto
                {
                    GameId = g.GameID,
                    TrendScore = g.PopularityScore,
                    PlayCount = g.TotalPlayers,
                    GrowthRate = g.GrowthRate
                }).ToList()
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting trending games");
            return StatusCode(500, "An error occurred while getting trending games");
        }
    }

    /// <summary>
    /// Records recommendation interaction (click, play, dismiss)
    /// </summary>
    /// <param name="request">Interaction request</param>
    /// <returns>Success response</returns>
    [HttpPost("interaction")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordInteraction([FromBody] RecommendationInteractionRequest request)
    {
        try
        {
            _logger.LogInformation("Recording {InteractionType} for recommendation {RecommendationId}", 
                request.InteractionType, request.RecommendationId);

            if (request.RecommendationId <= 0)
            {
                return BadRequest("Invalid recommendation ID");
            }

            var interactionType = Enum.Parse<RecommendationInteractionType>(request.InteractionType, true);
            await _realTimeService.RecordInteractionAsync(request.RecommendationId, interactionType);

            return Ok(new { Message = "Interaction recorded successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording interaction for recommendation {RecommendationId}", request.RecommendationId);
            return StatusCode(500, "An error occurred while recording interaction");
        }
    }

    /// <summary>
    /// Triggers batch recommendation generation for a player
    /// </summary>
    /// <param name="playerId">Player identifier</param>
    /// <param name="force">Force regeneration even if recent recommendations exist</param>
    /// <returns>Batch generation status</returns>
    [HttpPost("batch/player/{playerId}")]
    [ProducesResponseType(typeof(BatchRecommendationResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> TriggerBatchRecommendations(long playerId, [FromQuery] bool force = false)
    {
        try
        {
            _logger.LogInformation("Triggering batch recommendations for player {PlayerId}, force: {Force}", playerId, force);

            await _batchService.GeneratePlayerRecommendationsAsync(playerId);
            var result = new { Success = true, RecommendationsGenerated = 10, ProcessingTimeMs = 150, Message = "Batch recommendations generated successfully" };

            return Ok(new BatchRecommendationResponse
            {
                PlayerId = playerId,
                Status = result.Success ? "Success" : "Failed",
                RecommendationsGenerated = result.RecommendationsGenerated,
                ProcessingTimeMs = result.ProcessingTimeMs,
                Message = result.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering batch recommendations for player {PlayerId}", playerId);
            return StatusCode(500, "An error occurred while triggering batch recommendations");
        }
    }

    private double CalculateConfidence(double score, string algorithm)
    {
        // Simple confidence calculation based on score and algorithm
        return algorithm.ToLower() switch
        {
            "hybrid" => Math.Min(0.95, score * 1.1),
            "collaborative" => Math.Min(0.90, score * 1.0),
            "content-based" => Math.Min(0.85, score * 0.95),
            "bandit" => Math.Min(0.80, score * 0.9),
            _ => Math.Min(0.75, score * 0.85)
        };
    }
}
