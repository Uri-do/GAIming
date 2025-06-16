using Microsoft.AspNetCore.Mvc;
using GAIming.Core.Models;
using GAIming.Core.Interfaces;

namespace GAIming.Api.Controllers;

/// <summary>
/// Games controller for managing game data and operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Tags("Games")]
public class GamesController : ControllerBase
{
    private readonly ILogger<GamesController> _logger;

    public GamesController(ILogger<GamesController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Get all games with pagination and filtering
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 20)</param>
    /// <param name="search">Search query</param>
    /// <param name="provider">Provider ID filter</param>
    /// <param name="gameType">Game type ID filter</param>
    /// <param name="isActive">Active status filter</param>
    /// <param name="isMobile">Mobile support filter</param>
    /// <param name="isDesktop">Desktop support filter</param>
    /// <param name="sortBy">Sort field</param>
    /// <param name="sortDirection">Sort direction (asc/desc)</param>
    /// <returns>Paginated list of games</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<GameDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<GameDto>>>> GetGames(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] int? provider = null,
        [FromQuery] int? gameType = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? isMobile = null,
        [FromQuery] bool? isDesktop = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortDirection = "asc")
    {
        try
        {
            _logger.LogInformation("Getting games with filters - Page: {Page}, PageSize: {PageSize}, Search: {Search}", 
                page, pageSize, search);

            // Mock games data that matches frontend expectations
            var allGames = GetMockGames();

            // Apply filters
            var filteredGames = allGames.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                filteredGames = filteredGames.Where(g => 
                    g.GameName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    g.ProviderName.Contains(search, StringComparison.OrdinalIgnoreCase));
            }

            if (provider.HasValue)
            {
                filteredGames = filteredGames.Where(g => g.ProviderId == provider.Value);
            }

            if (gameType.HasValue)
            {
                filteredGames = filteredGames.Where(g => g.GameTypeId == gameType.Value);
            }

            if (isActive.HasValue)
            {
                filteredGames = filteredGames.Where(g => g.IsActive == isActive.Value);
            }

            if (isMobile.HasValue)
            {
                filteredGames = filteredGames.Where(g => g.IsMobile == isMobile.Value);
            }

            if (isDesktop.HasValue)
            {
                filteredGames = filteredGames.Where(g => g.IsDesktop == isDesktop.Value);
            }

            // Apply sorting
            if (!string.IsNullOrEmpty(sortBy))
            {
                var isDescending = sortDirection?.ToLower() == "desc";
                filteredGames = sortBy.ToLower() switch
                {
                    "gamename" => isDescending ? filteredGames.OrderByDescending(g => g.GameName) : filteredGames.OrderBy(g => g.GameName),
                    "providername" => isDescending ? filteredGames.OrderByDescending(g => g.ProviderName) : filteredGames.OrderBy(g => g.ProviderName),
                    "releasedate" => isDescending ? filteredGames.OrderByDescending(g => g.ReleaseDate) : filteredGames.OrderBy(g => g.ReleaseDate),
                    _ => filteredGames.OrderBy(g => g.GameId)
                };
            }

            // Apply pagination
            var totalCount = filteredGames.Count();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
            var items = filteredGames
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var paginatedResponse = new PaginatedResponse<GameDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            var response = new ApiResponse<PaginatedResponse<GameDto>>
            {
                Data = paginatedResponse,
                Success = true,
                Message = "Games retrieved successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting games");
            var errorResponse = new ApiResponse<PaginatedResponse<GameDto>>
            {
                Data = new PaginatedResponse<GameDto> { Items = new List<GameDto>() },
                Success = false,
                Message = "Error retrieving games",
                Errors = new[] { ex.Message }
            };
            return BadRequest(errorResponse);
        }
    }

    /// <summary>
    /// Get game by ID
    /// </summary>
    /// <param name="gameId">Game ID</param>
    /// <returns>Game details</returns>
    [HttpGet("{gameId}")]
    [ProducesResponseType(typeof(ApiResponse<GameDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<GameDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<GameDto>>> GetGame(int gameId)
    {
        try
        {
            _logger.LogInformation("Getting game with ID: {GameId}", gameId);

            var games = GetMockGames();
            var game = games.FirstOrDefault(g => g.GameId == gameId);

            if (game == null)
            {
                var notFoundResponse = new ApiResponse<GameDto>
                {
                    Data = null!,
                    Success = false,
                    Message = $"Game with ID {gameId} not found"
                };
                return NotFound(notFoundResponse);
            }

            var response = new ApiResponse<GameDto>
            {
                Data = game,
                Success = true,
                Message = "Game retrieved successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting game {GameId}", gameId);
            var errorResponse = new ApiResponse<GameDto>
            {
                Data = null!,
                Success = false,
                Message = "Error retrieving game",
                Errors = new[] { ex.Message }
            };
            return BadRequest(errorResponse);
        }
    }

    /// <summary>
    /// Search games
    /// </summary>
    /// <param name="query">Search query</param>
    /// <param name="page">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Search results</returns>
    [HttpGet("search")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<GameDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<GameDto>>>> SearchGames(
        [FromQuery] string query,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        return await GetGames(page, pageSize, search: query);
    }

    /// <summary>
    /// Get popular games
    /// </summary>
    /// <param name="count">Number of games to return</param>
    /// <returns>Popular games</returns>
    [HttpGet("popular")]
    [ProducesResponseType(typeof(ApiResponse<List<GameDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<GameDto>>>> GetPopularGames([FromQuery] int count = 10)
    {
        try
        {
            _logger.LogInformation("Getting {Count} popular games", count);

            var games = GetMockGames()
                .Where(g => g.IsActive)
                .OrderByDescending(g => g.RtpPercentage)
                .Take(count)
                .ToList();

            var response = new ApiResponse<List<GameDto>>
            {
                Data = games,
                Success = true,
                Message = "Popular games retrieved successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting popular games");
            var errorResponse = new ApiResponse<List<GameDto>>
            {
                Data = new List<GameDto>(),
                Success = false,
                Message = "Error retrieving popular games",
                Errors = new[] { ex.Message }
            };
            return BadRequest(errorResponse);
        }
    }

    /// <summary>
    /// Get trending games
    /// </summary>
    /// <param name="count">Number of games to return</param>
    /// <returns>Trending games</returns>
    [HttpGet("trending")]
    [ProducesResponseType(typeof(ApiResponse<List<GameDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<GameDto>>>> GetTrendingGames([FromQuery] int count = 10)
    {
        try
        {
            _logger.LogInformation("Getting {Count} trending games", count);

            var games = GetMockGames()
                .Where(g => g.IsActive)
                .OrderBy(g => Guid.NewGuid()) // Random for demo
                .Take(count)
                .ToList();

            var response = new ApiResponse<List<GameDto>>
            {
                Data = games,
                Success = true,
                Message = "Trending games retrieved successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting trending games");
            var errorResponse = new ApiResponse<List<GameDto>>
            {
                Data = new List<GameDto>(),
                Success = false,
                Message = "Error retrieving trending games",
                Errors = new[] { ex.Message }
            };
            return BadRequest(errorResponse);
        }
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
                RtpPercentage = 95.0,
                MinBetAmount = 0.10m,
                CreatedDate = DateTime.UtcNow.AddDays(-100),
                UpdatedDate = DateTime.UtcNow.AddDays(-10)
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
                RtpPercentage = 94.5,
                MinBetAmount = 0.20m,
                CreatedDate = DateTime.UtcNow.AddDays(-90),
                UpdatedDate = DateTime.UtcNow.AddDays(-5)
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
                RtpPercentage = 92.0,
                MinBetAmount = 0.50m,
                CreatedDate = DateTime.UtcNow.AddDays(-80),
                UpdatedDate = DateTime.UtcNow.AddDays(-2)
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
                RtpPercentage = 96.5,
                MinBetAmount = 0.25m,
                CreatedDate = DateTime.UtcNow.AddDays(-70),
                UpdatedDate = DateTime.UtcNow.AddDays(-1)
            },
            new GameDto
            {
                GameId = 5,
                GameName = "Spider-Man: Miles Morales",
                ProviderId = 2,
                ProviderName = "Sony Interactive Entertainment",
                GameTypeId = 1,
                GameTypeName = "Action-Adventure",
                IsActive = true,
                IsMobile = true,
                IsDesktop = true,
                ReleaseDate = new DateTime(2020, 11, 12),
                RtpPercentage = 93.8,
                MinBetAmount = 0.15m,
                CreatedDate = DateTime.UtcNow.AddDays(-60),
                UpdatedDate = DateTime.UtcNow
            }
        };
    }
}
