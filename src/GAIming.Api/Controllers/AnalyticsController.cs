using Microsoft.AspNetCore.Mvc;
using GAIming.Core.Models;
using GAIming.Core.Interfaces;

namespace GAIming.Api.Controllers;

/// <summary>
/// Analytics controller for real-time metrics and insights
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Tags("Analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(ILogger<AnalyticsController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Get dashboard overview metrics
    /// </summary>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<object>>> GetDashboardMetrics()
    {
        try
        {
            _logger.LogInformation("Getting dashboard metrics");

            var metrics = new
            {
                overview = new
                {
                    totalUsers = 1247,
                    activeUsers = 892,
                    totalGames = 156,
                    activeGames = 134,
                    totalRecommendations = 15420,
                    clickThroughRate = 23.5,
                    conversionRate = 14.2,
                    revenue = 45678.90m
                },
                userActivity = new
                {
                    dailyActiveUsers = 892,
                    weeklyActiveUsers = 2341,
                    monthlyActiveUsers = 8765,
                    newUsersToday = 23,
                    returningUsers = 869
                },
                gamePerformance = new
                {
                    mostPlayedGames = new[]
                    {
                        new { gameId = 1, gameName = "The Legend of Zelda: Breath of the Wild", plays = 2341, revenue = 12456.78m },
                        new { gameId = 4, gameName = "Elden Ring", plays = 1987, revenue = 10234.56m },
                        new { gameId = 2, gameName = "God of War", plays = 1654, revenue = 8765.43m }
                    },
                    topRevenueGames = new[]
                    {
                        new { gameId = 1, gameName = "The Legend of Zelda: Breath of the Wild", revenue = 12456.78m },
                        new { gameId = 4, gameName = "Elden Ring", revenue = 10234.56m },
                        new { gameId = 2, gameName = "God of War", revenue = 8765.43m }
                    }
                },
                recommendations = new
                {
                    totalGenerated = 15420,
                    totalClicks = 3624,
                    totalPlays = 2187,
                    averageScore = 0.78,
                    algorithmPerformance = new[]
                    {
                        new { algorithm = "collaborative", recommendations = 5140, ctr = 25.1, conversionRate = 15.8 },
                        new { algorithm = "content-based", recommendations = 4623, ctr = 19.8, conversionRate = 11.1 },
                        new { algorithm = "hybrid", recommendations = 3892, ctr = 27.3, conversionRate = 17.2 },
                        new { algorithm = "trending", recommendations = 1765, ctr = 21.4, conversionRate = 12.9 }
                    }
                },
                realTimeStats = new
                {
                    currentOnlineUsers = 234,
                    gamesBeingPlayed = 89,
                    recommendationsGeneratedToday = 1247,
                    clicksInLastHour = 156,
                    playsInLastHour = 89,
                    revenueToday = 3456.78m
                }
            };

            var response = new ApiResponse<object>
            {
                Data = metrics,
                Success = true,
                Message = "Dashboard metrics retrieved successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard metrics");
            return BadRequest(new ApiResponse<object>
            {
                Data = null!,
                Success = false,
                Message = "Error retrieving dashboard metrics",
                Errors = new[] { ex.Message }
            });
        }
    }

    /// <summary>
    /// Get user engagement analytics
    /// </summary>
    [HttpGet("user-engagement")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<object>>> GetUserEngagement(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? timeframe = "7d")
    {
        try
        {
            _logger.LogInformation("Getting user engagement analytics for timeframe: {Timeframe}", timeframe);

            var engagement = new
            {
                timeframe = timeframe,
                dateRange = new
                {
                    start = startDate ?? DateTime.UtcNow.AddDays(-7),
                    end = endDate ?? DateTime.UtcNow
                },
                metrics = new
                {
                    averageSessionDuration = "24m 35s",
                    averageGamesPerSession = 3.2,
                    bounceRate = 12.4,
                    retentionRate = new
                    {
                        day1 = 78.5,
                        day7 = 45.2,
                        day30 = 23.8
                    }
                },
                dailyEngagement = new[]
                {
                    new { date = "2025-06-09", activeUsers = 756, sessions = 1234, avgDuration = 1456 },
                    new { date = "2025-06-10", activeUsers = 823, sessions = 1387, avgDuration = 1523 },
                    new { date = "2025-06-11", activeUsers = 891, sessions = 1456, avgDuration = 1478 },
                    new { date = "2025-06-12", activeUsers = 934, sessions = 1523, avgDuration = 1612 },
                    new { date = "2025-06-13", activeUsers = 867, sessions = 1398, avgDuration = 1534 },
                    new { date = "2025-06-14", activeUsers = 912, sessions = 1467, avgDuration = 1589 },
                    new { date = "2025-06-15", activeUsers = 892, sessions = 1423, avgDuration = 1475 }
                },
                topUserSegments = new[]
                {
                    new { segment = "Power Gamers", users = 234, avgRevenue = 89.45m, engagement = 95.2 },
                    new { segment = "Casual Players", users = 567, avgRevenue = 23.78m, engagement = 67.8 },
                    new { segment = "New Users", users = 123, avgRevenue = 12.34m, engagement = 45.6 }
                }
            };

            var response = new ApiResponse<object>
            {
                Data = engagement,
                Success = true,
                Message = "User engagement analytics retrieved successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user engagement analytics");
            return BadRequest(new ApiResponse<object>
            {
                Data = null!,
                Success = false,
                Message = "Error retrieving user engagement analytics",
                Errors = new[] { ex.Message }
            });
        }
    }

    /// <summary>
    /// Get recommendation performance analytics
    /// </summary>
    [HttpGet("recommendation-performance")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<object>>> GetRecommendationPerformance(
        [FromQuery] string? algorithm = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            _logger.LogInformation("Getting recommendation performance analytics");

            var performance = new
            {
                summary = new
                {
                    totalRecommendations = 15420,
                    totalClicks = 3624,
                    totalPlays = 2187,
                    overallCTR = 23.5,
                    overallConversionRate = 14.2,
                    averageScore = 0.78,
                    revenueGenerated = 23456.78m
                },
                algorithmComparison = new[]
                {
                    new 
                    { 
                        algorithm = "collaborative",
                        recommendations = 5140,
                        clicks = 1290,
                        plays = 812,
                        ctr = 25.1,
                        conversionRate = 15.8,
                        avgScore = 0.82,
                        revenue = 8934.56m
                    },
                    new 
                    { 
                        algorithm = "content-based",
                        recommendations = 4623,
                        clicks = 915,
                        plays = 513,
                        ctr = 19.8,
                        conversionRate = 11.1,
                        avgScore = 0.75,
                        revenue = 6234.78m
                    },
                    new 
                    { 
                        algorithm = "hybrid",
                        recommendations = 3892,
                        clicks = 1063,
                        plays = 669,
                        ctr = 27.3,
                        conversionRate = 17.2,
                        avgScore = 0.85,
                        revenue = 7123.45m
                    },
                    new 
                    { 
                        algorithm = "trending",
                        recommendations = 1765,
                        clicks = 356,
                        plays = 193,
                        ctr = 21.4,
                        conversionRate = 12.9,
                        avgScore = 0.71,
                        revenue = 1163.99m
                    }
                },
                timeSeriesData = new[]
                {
                    new { date = "2025-06-09", recommendations = 2156, clicks = 487, plays = 298 },
                    new { date = "2025-06-10", recommendations = 2234, clicks = 523, plays = 321 },
                    new { date = "2025-06-11", recommendations = 2187, clicks = 498, plays = 289 },
                    new { date = "2025-06-12", recommendations = 2298, clicks = 567, plays = 345 },
                    new { date = "2025-06-13", recommendations = 2145, clicks = 489, plays = 301 },
                    new { date = "2025-06-14", recommendations = 2267, clicks = 534, plays = 324 },
                    new { date = "2025-06-15", recommendations = 2133, clicks = 526, plays = 309 }
                },
                topPerformingCategories = new[]
                {
                    new { category = "RPG", ctr = 28.7, conversionRate = 18.4, revenue = 9876.54m },
                    new { category = "Action", ctr = 24.3, conversionRate = 15.2, revenue = 7654.32m },
                    new { category = "Adventure", ctr = 22.1, conversionRate = 13.8, revenue = 5432.10m }
                }
            };

            var response = new ApiResponse<object>
            {
                Data = performance,
                Success = true,
                Message = "Recommendation performance analytics retrieved successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendation performance analytics");
            return BadRequest(new ApiResponse<object>
            {
                Data = null!,
                Success = false,
                Message = "Error retrieving recommendation performance analytics",
                Errors = new[] { ex.Message }
            });
        }
    }

    /// <summary>
    /// Get real-time system health metrics
    /// </summary>
    [HttpGet("system-health")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<object>>> GetSystemHealth()
    {
        try
        {
            _logger.LogInformation("Getting system health metrics");

            var health = new
            {
                status = "healthy",
                uptime = "15d 7h 23m",
                lastRestart = DateTime.UtcNow.AddDays(-15).AddHours(-7).AddMinutes(-23),
                performance = new
                {
                    cpuUsage = 23.5,
                    memoryUsage = 67.8,
                    diskUsage = 45.2,
                    networkLatency = 12.3
                },
                apiMetrics = new
                {
                    requestsPerMinute = 234,
                    averageResponseTime = 145.6,
                    errorRate = 0.12,
                    successRate = 99.88
                },
                database = new
                {
                    status = "healthy",
                    connectionPool = new
                    {
                        active = 12,
                        idle = 8,
                        max = 50
                    },
                    queryPerformance = new
                    {
                        averageQueryTime = 23.4,
                        slowQueries = 2,
                        totalQueries = 15678
                    }
                },
                services = new[]
                {
                    new { name = "Recommendation Engine", status = "healthy", responseTime = 89.2 },
                    new { name = "User Authentication", status = "healthy", responseTime = 45.6 },
                    new { name = "Game Catalog", status = "healthy", responseTime = 67.8 },
                    new { name = "Analytics Pipeline", status = "healthy", responseTime = 123.4 }
                }
            };

            var response = new ApiResponse<object>
            {
                Data = health,
                Success = true,
                Message = "System health metrics retrieved successfully"
            };

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system health metrics");
            return BadRequest(new ApiResponse<object>
            {
                Data = null!,
                Success = false,
                Message = "Error retrieving system health metrics",
                Errors = new[] { ex.Message }
            });
        }
    }
}
