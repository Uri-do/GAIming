using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GAIming.Core.Interfaces;
using GAIming.Core.Models;
using GAIming.Core.Entities;

namespace GAIming.Api.Controllers;

/// <summary>
/// Controller for games management and administration
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,GameManager")]
public class GamesManagementController : ControllerBase
{
    private readonly IGameRepository _gameRepository;
    private readonly IGameManagementService _gameManagementService;
    // private readonly IFeatureEngineeringService _featureEngineeringService; // Temporarily disabled
    private readonly IPlayedGameRepository _playedGameRepository;
    // private readonly IGameFileImportExportService _fileService; // Temporarily disabled
    private readonly ILogger<GamesManagementController> _logger;

    public GamesManagementController(
        IGameRepository gameRepository,
        IGameManagementService gameManagementService,
        // IFeatureEngineeringService featureEngineeringService, // Temporarily disabled
        IPlayedGameRepository playedGameRepository,
        // IGameFileImportExportService fileService, // Temporarily disabled
        ILogger<GamesManagementController> logger)
    {
        _gameRepository = gameRepository;
        _gameManagementService = gameManagementService;
        // _featureEngineeringService = featureEngineeringService; // Temporarily disabled
        _playedGameRepository = playedGameRepository;
        // _fileService = fileService; // Temporarily disabled
        _logger = logger;
    }

    /// <summary>
    /// Gets paginated list of games with management information
    /// </summary>
    /// <param name="request">Pagination and filter request</param>
    /// <returns>Paginated games list</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<GameManagementDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGames([FromQuery] GameManagementRequest request)
    {
        try
        {
            _logger.LogInformation("Getting games for management with filters: {@Request}", request);

            var result = await _gameManagementService.GetGamesAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting games for management");
            return StatusCode(500, "An error occurred while getting games");
        }
    }

    /// <summary>
    /// Gets detailed game information for management
    /// </summary>
    /// <param name="gameId">Game identifier</param>
    /// <returns>Detailed game management information</returns>
    [HttpGet("{gameId}")]
    [ProducesResponseType(typeof(GameManagementDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetGameDetail(long gameId)
    {
        try
        {
            _logger.LogInformation("Getting game detail for management: {GameId}", gameId);

            var gameDetail = await _gameManagementService.GetGameDetailAsync(gameId);
            if (gameDetail == null)
            {
                return NotFound("Game not found");
            }

            return Ok(gameDetail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting game detail for {GameId}", gameId);
            return StatusCode(500, "An error occurred while getting game detail");
        }
    }

    /// <summary>
    /// Gets game analytics and performance metrics
    /// </summary>
    /// <param name="gameId">Game identifier</param>
    /// <param name="days">Number of days to analyze (default: 30)</param>
    /// <returns>Game analytics data</returns>
    [HttpGet("{gameId}/analytics")]
    [ProducesResponseType(typeof(GameAnalyticsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGameAnalytics(long gameId, [FromQuery] int days = 30)
    {
        try
        {
            _logger.LogInformation("Getting game analytics for {GameId} for {Days} days", gameId, days);

            var analytics = await _gameManagementService.GetGameAnalyticsAsync(gameId, days);
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting game analytics for {GameId}", gameId);
            return StatusCode(500, "An error occurred while getting game analytics");
        }
    }

    /// <summary>
    /// Updates game configuration and settings
    /// </summary>
    /// <param name="gameId">Game identifier</param>
    /// <param name="request">Game update request</param>
    /// <returns>Updated game information</returns>
    [HttpPut("{gameId}")]
    [ProducesResponseType(typeof(GameManagementDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateGame(long gameId, [FromBody] UpdateGameRequest request)
    {
        try
        {
            _logger.LogInformation("Updating game {GameId} with request: {@Request}", gameId, request);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedGame = await _gameManagementService.UpdateGameAsync(gameId, request);
            if (updatedGame == null)
            {
                return NotFound("Game not found");
            }

            return Ok(updatedGame);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating game {GameId}", gameId);
            return StatusCode(500, "An error occurred while updating game");
        }
    }

    /// <summary>
    /// Bulk updates multiple games
    /// </summary>
    /// <param name="request">Bulk update request</param>
    /// <returns>Bulk update result</returns>
    [HttpPut("bulk")]
    [ProducesResponseType(typeof(BulkUpdateResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BulkUpdateGames([FromBody] BulkUpdateGamesRequest request)
    {
        try
        {
            _logger.LogInformation("Bulk updating {Count} games", request.GameIds.Count);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _gameManagementService.BulkUpdateGamesAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk updating games");
            return StatusCode(500, "An error occurred while bulk updating games");
        }
    }

    /// <summary>
    /// Gets game performance comparison
    /// </summary>
    /// <param name="gameIds">List of game IDs to compare</param>
    /// <param name="days">Number of days to analyze</param>
    /// <returns>Game performance comparison</returns>
    [HttpPost("compare")]
    [ProducesResponseType(typeof(GameComparisonResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> CompareGames([FromBody] List<long> gameIds, [FromQuery] int days = 30)
    {
        try
        {
            _logger.LogInformation("Comparing {Count} games for {Days} days", gameIds.Count, days);

            if (gameIds.Count < 2 || gameIds.Count > 10)
            {
                return BadRequest("Can compare between 2 and 10 games");
            }

            var comparison = await _gameManagementService.CompareGamesAsync(gameIds, days);
            return Ok(comparison);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error comparing games");
            return StatusCode(500, "An error occurred while comparing games");
        }
    }

    /// <summary>
    /// Gets game recommendation settings
    /// </summary>
    /// <param name="gameId">Game identifier</param>
    /// <returns>Game recommendation settings</returns>
    [HttpGet("{gameId}/recommendation-settings")]
    [ProducesResponseType(typeof(GameRecommendationSettings), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGameRecommendationSettings(long gameId)
    {
        try
        {
            _logger.LogInformation("Getting recommendation settings for game {GameId}", gameId);

            var settings = await _gameManagementService.GetGameRecommendationSettingsAsync(gameId);
            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendation settings for {GameId}", gameId);
            return StatusCode(500, "An error occurred while getting recommendation settings");
        }
    }

    /// <summary>
    /// Updates game recommendation settings
    /// </summary>
    /// <param name="gameId">Game identifier</param>
    /// <param name="settings">Recommendation settings</param>
    /// <returns>Updated settings</returns>
    [HttpPut("{gameId}/recommendation-settings")]
    [ProducesResponseType(typeof(GameRecommendationSettings), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateGameRecommendationSettings(long gameId, [FromBody] GameRecommendationSettings settings)
    {
        try
        {
            _logger.LogInformation("Updating recommendation settings for game {GameId}", gameId);

            var updatedSettings = await _gameManagementService.UpdateGameRecommendationSettingsAsync(gameId, settings);
            return Ok(updatedSettings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating recommendation settings for {GameId}", gameId);
            return StatusCode(500, "An error occurred while updating recommendation settings");
        }
    }

    /// <summary>
    /// Refreshes game features and analytics data
    /// </summary>
    /// <param name="gameId">Game identifier</param>
    /// <returns>Refresh result</returns>
    [HttpPost("{gameId}/refresh")]
    [ProducesResponseType(typeof(GameRefreshResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> RefreshGameData(long gameId)
    {
        try
        {
            _logger.LogInformation("Refreshing data for game {GameId}", gameId);

            var result = await _gameManagementService.RefreshGameDataAsync(gameId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing data for game {GameId}", gameId);
            return StatusCode(500, "An error occurred while refreshing game data");
        }
    }

    /// <summary>
    /// Gets games dashboard overview
    /// </summary>
    /// <param name="days">Number of days to analyze</param>
    /// <returns>Games dashboard data</returns>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(GamesDashboardDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGamesDashboard([FromQuery] int days = 30)
    {
        try
        {
            _logger.LogInformation("Getting games dashboard for {Days} days", days);

            var dashboard = await _gameManagementService.GetGamesDashboardAsync(days);
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting games dashboard");
            return StatusCode(500, "An error occurred while getting games dashboard");
        }
    }

    /// <summary>
    /// Exports games data
    /// </summary>
    /// <param name="request">Export request</param>
    /// <returns>Exported data file</returns>
    [HttpPost("export")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public Task<IActionResult> ExportGames([FromBody] ExportGamesRequest request)
    {
        try
        {
            _logger.LogInformation("Exporting games data in {Format} format", request.Format);

            // var exportResult = await _fileService.ExportGamesAsync(request); // Temporarily disabled
            return Task.FromResult<IActionResult>(StatusCode(501, "Export functionality temporarily disabled"));

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting games data");
            return Task.FromResult<IActionResult>(StatusCode(500, "An error occurred while exporting games data"));
        }
    }

    /*
    /// <summary>
    /// Imports games data from file - TEMPORARILY DISABLED
    /// </summary>
    [HttpPost("import")]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public async Task<IActionResult> ImportGames()
    {
        return StatusCode(501, "Import functionality temporarily disabled");
    }
    */

    /*
    /// <summary>
    /// File import/export functionality temporarily disabled
    /// </summary>
    */
}
