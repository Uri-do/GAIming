using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GAIming.Core.Interfaces;
using GAIming.Core.Models;
using GAIming.Core.Entities;

namespace GAIming.Api.Controllers;

/// <summary>
/// Controller for player analytics and insights
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PlayerAnalyticsController : ControllerBase
{
    private readonly ILogger<PlayerAnalyticsController> _logger;

    public PlayerAnalyticsController(ILogger<PlayerAnalyticsController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Gets paginated list of players with analytics data
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 20)</param>
    /// <param name="search">Search term for username, email, first name, or last name</param>
    /// <param name="segment">Player segment filter</param>
    /// <param name="vipLevel">VIP level filter</param>
    /// <param name="riskLevel">Risk level filter</param>
    /// <param name="country">Country filter</param>
    /// <param name="isActive">Active status filter</param>
    /// <param name="registrationDateFrom">Registration date from filter</param>
    /// <param name="registrationDateTo">Registration date to filter</param>
    /// <param name="sortBy">Sort field (default: registrationDate)</param>
    /// <param name="sortDirection">Sort direction (asc/desc, default: desc)</param>
    /// <returns>Paginated list of player analytics</returns>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PaginatedResponse<PlayerAnalyticsDto>), StatusCodes.Status200OK)]
    public IActionResult GetPlayers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? segment = null,
        [FromQuery] int? vipLevel = null,
        [FromQuery] int? riskLevel = null,
        [FromQuery] string? country = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] DateTime? registrationDateFrom = null,
        [FromQuery] DateTime? registrationDateTo = null,
        [FromQuery] string sortBy = "registrationDate",
        [FromQuery] string sortDirection = "desc")
    {
        try
        {
            _logger.LogInformation("Getting players - Page: {Page}, PageSize: {PageSize}, Search: {Search}",
                page, pageSize, search);

            var request = new PlayerAnalyticsRequest
            {
                Page = page,
                PageSize = pageSize,
                SearchTerm = search,
                Segment = segment,
                VipLevel = vipLevel,
                RiskLevel = riskLevel,
                CountryCode = country,
                IsActive = isActive,
                RegistrationDateFrom = registrationDateFrom,
                RegistrationDateTo = registrationDateTo,
                SortBy = sortBy,
                SortDirection = sortDirection.ToLower() == "desc" ? "desc" : "asc"
            };

            // Temporary implementation - return mock data that matches frontend interface
            var mockPlayers = new List<object>
            {
                new
                {
                    playerId = 1,
                    username = "player1",
                    email = "player1@example.com",
                    firstName = "John",
                    lastName = "Doe",
                    country = "US",
                    vipLevel = 2,
                    riskLevel = 1,
                    isActive = true,
                    registrationDate = DateTime.UtcNow.AddDays(-30).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    lastLoginDate = DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    totalSessions = 25,
                    totalBets = 1500.00,
                    totalWins = 1200.00,
                    totalRevenue = 300.00,
                    averageSessionDuration = 45.5,
                    averageBetSize = 60.00,
                    favoriteGameTypes = new[] { "Slots", "Blackjack" },
                    preferredProviders = new[] { "NetEnt", "Microgaming" },
                    playerSegment = "Regular",
                    lifetimeValue = 500.00,
                    retentionScore = 0.75,
                    engagementScore = 85.0,
                    riskScore = 20.0
                },
                new
                {
                    playerId = 2,
                    username = "player2",
                    email = "player2@example.com",
                    firstName = "Jane",
                    lastName = "Smith",
                    country = "UK",
                    vipLevel = 4,
                    riskLevel = 2,
                    isActive = true,
                    registrationDate = DateTime.UtcNow.AddDays(-60).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    lastLoginDate = DateTime.UtcNow.AddHours(-2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    totalSessions = 50,
                    totalBets = 5000.00,
                    totalWins = 4200.00,
                    totalRevenue = 800.00,
                    averageSessionDuration = 65.0,
                    averageBetSize = 100.00,
                    favoriteGameTypes = new[] { "Roulette", "Poker" },
                    preferredProviders = new[] { "Evolution", "Pragmatic Play" },
                    playerSegment = "High Value",
                    lifetimeValue = 1500.00,
                    retentionScore = 0.90,
                    engagementScore = 95.0,
                    riskScore = 40.0
                }
            };

            // For simplicity, just return the mock data without complex filtering for now
            var totalCount = mockPlayers.Count;
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            var paginatedData = new
            {
                items = mockPlayers,
                totalCount = totalCount,
                page = page,
                pageSize = pageSize,
                totalPages = totalPages,
                hasNextPage = page < totalPages,
                hasPreviousPage = page > 1
            };

            var response = new
            {
                data = paginatedData,
                success = true,
                message = "Players retrieved successfully"
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting players");
            return StatusCode(500, "An error occurred while getting players");
        }
    }

    /// <summary>
    /// Gets comprehensive player analytics dashboard
    /// </summary>
    /// <param name="playerId">Player identifier</param>
    /// <param name="days">Number of days to analyze (default: 30)</param>
    /// <returns>Player analytics dashboard data</returns>
    [HttpGet("{playerId}/dashboard")]
    [ProducesResponseType(typeof(PlayerAnalyticsDashboard), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetPlayerDashboard(long playerId, [FromQuery] int days = 30)
    {
        try
        {
            _logger.LogInformation("Getting player dashboard for {PlayerId} for {Days} days", playerId, days);

            if (playerId <= 0)
            {
                return BadRequest("Invalid player ID");
            }

            if (days <= 0 || days > 365)
            {
                return BadRequest("Days must be between 1 and 365");
            }

            var endDate = DateTime.UtcNow;
            var startDate = endDate.AddDays(-days);

            // Mock dashboard data
            var dashboard = new PlayerAnalyticsDashboard
            {
                PlayerId = playerId,
                StartDate = startDate,
                EndDate = endDate,
                Overview = new PlayerOverviewStats
                {
                    PlayerId = playerId,
                    Username = $"player{playerId}",
                    TotalSessions = 25,
                    TotalPlayTime = TimeSpan.FromMinutes(1200),
                    TotalBets = 1500.00m,
                    TotalWins = 1200.00m,
                    NetPosition = 300.00m,
                    FavoriteGameId = 1,
                    FavoriteGameName = "Starburst"
                }
            };

            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting player dashboard for {PlayerId}", playerId);
            return StatusCode(500, "An error occurred while getting player dashboard");
        }
    }

    /// <summary>
    /// Gets player behavior patterns
    /// </summary>
    /// <param name="playerId">Player identifier</param>
    /// <param name="days">Number of days to analyze</param>
    /// <returns>Player behavior patterns</returns>
    [HttpGet("{playerId}/behavior")]
    [ProducesResponseType(typeof(PlayerBehaviorAnalysis), StatusCodes.Status200OK)]
    public IActionResult GetPlayerBehavior(long playerId, [FromQuery] int days = 30)
    {
        try
        {
            _logger.LogInformation("Getting player behavior for {PlayerId}", playerId);

            var endDate = DateTime.UtcNow;
            var startDate = endDate.AddDays(-days);

            // Mock behavior data
            var behavior = new PlayerBehaviorAnalysis
            {
                PlayerId = playerId,
                Username = $"player{playerId}",
                SessionPatterns = new SessionPatterns(),
                BettingPatterns = new BettingPatterns(),
                GamePreferences = new GamePreferences(),
                Insights = new List<BehaviorInsight>(),
                Alerts = new List<BehaviorAlert>(),
                RiskScore = 25.0,
                LastAnalyzed = DateTime.UtcNow
            };
            return Ok(behavior);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting player behavior for {PlayerId}", playerId);
            return StatusCode(500, "An error occurred while getting player behavior");
        }
    }

    /// <summary>
    /// Gets player recommendation performance
    /// </summary>
    /// <param name="playerId">Player identifier</param>
    /// <param name="days">Number of days to analyze</param>
    /// <returns>Recommendation performance for the player</returns>
    [HttpGet("{playerId}/recommendations/performance")]
    [ProducesResponseType(typeof(PlayerRecommendationPerformance), StatusCodes.Status200OK)]
    public IActionResult GetPlayerRecommendationPerformance(long playerId, [FromQuery] int days = 30)
    {
        try
        {
            _logger.LogInformation("Getting recommendation performance for player {PlayerId}", playerId);

            // Mock recommendation performance data
            var performance = new PlayerRecommendationPerformance
            {
                PlayerId = playerId,
                Username = $"player{playerId}",
                TotalRecommendations = 50,
                ClickedRecommendations = 15,
                PlayedRecommendations = 8,
                ClickThroughRate = 0.30,
                ConversionRate = 0.16,
                RevenueGenerated = 250.00m,
                PreferredAlgorithm = "Collaborative Filtering",
                AlgorithmPerformance = new Dictionary<string, double>
                {
                    { "Collaborative Filtering", 0.85 },
                    { "Content Based", 0.72 }
                }
            };
            return Ok(performance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendation performance for {PlayerId}", playerId);
            return StatusCode(500, "An error occurred while getting recommendation performance");
        }
    }

    /// <summary>
    /// Gets player game preferences
    /// </summary>
    /// <param name="playerId">Player identifier</param>
    /// <returns>Player game preferences and categories</returns>
    [HttpGet("{playerId}/preferences")]
    [ProducesResponseType(typeof(PlayerGamePreferences), StatusCodes.Status200OK)]
    public IActionResult GetPlayerPreferences(long playerId)
    {
        try
        {
            _logger.LogInformation("Getting game preferences for player {PlayerId}", playerId);

            // Mock preferences data
            var preferences = new PlayerGamePreferences
            {
                PlayerId = playerId,
                GameTypePreferences = new List<GameTypePreference>(),
                ProviderPreferences = new List<ProviderPreference>(),
                VolatilityPreferences = new List<VolatilityPreference>(),
                PreferredMinBet = 1.00m,
                PreferredMaxBet = 50.00m,
                PreferredThemes = new List<string> { "Adventure", "Classic" },
                LastUpdated = DateTime.UtcNow
            };
            return Ok(preferences);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting player preferences for {PlayerId}", playerId);
            return StatusCode(500, "An error occurred while getting player preferences");
        }
    }

    /// <summary>
    /// Gets player risk assessment
    /// </summary>
    /// <param name="playerId">Player identifier</param>
    /// <returns>Player risk assessment data</returns>
    [HttpGet("{playerId}/risk-assessment")]
    [ProducesResponseType(typeof(PlayerRiskAssessment), StatusCodes.Status200OK)]
    public IActionResult GetPlayerRiskAssessment(long playerId)
    {
        try
        {
            _logger.LogInformation("Getting risk assessment for player {PlayerId}", playerId);

            // Mock risk assessment data
            var riskAssessment = new PlayerRiskAssessment
            {
                PlayerId = playerId,
                RiskLevel = 1,
                RiskCategory = "Low",
                RiskFactors = new List<string> { "Consistent betting patterns", "Regular play schedule" },
                SpendingVelocity = 25.50m,
                SessionFrequency = 3.5,
                AverageSessionDuration = 45.0,
                HasGamblingProblemIndicators = false,
                LastAssessmentDate = DateTime.UtcNow,
                RiskScores = new Dictionary<string, double> { { "Overall", 25.0 }, { "Spending", 20.0 } },
                Recommendations = new List<string> { "Continue monitoring", "Standard limits apply" }
            };
            return Ok(riskAssessment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting risk assessment for {PlayerId}", playerId);
            return StatusCode(500, "An error occurred while getting risk assessment");
        }
    }

    /// <summary>
    /// Gets player segment analysis
    /// </summary>
    /// <param name="playerId">Player identifier</param>
    /// <returns>Player segment information</returns>
    [HttpGet("{playerId}/segment")]
    [ProducesResponseType(typeof(PlayerSegment), StatusCodes.Status200OK)]
    public IActionResult GetPlayerSegment(long playerId)
    {
        try
        {
            _logger.LogInformation("Getting segment info for player {PlayerId}", playerId);

            // Mock segment info data
            var segmentInfo = new PlayerSegment
            {
                PlayerId = playerId,
                SegmentName = "Regular",
                SegmentType = "Behavioral",
                SegmentScore = 75.0,
                AssignedDate = DateTime.UtcNow,
                Attributes = new Dictionary<string, object> { { "ActivityLevel", "Medium" } },
                IsActive = true
            };
            return Ok(segmentInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting segment info for {PlayerId}", playerId);
            return StatusCode(500, "An error occurred while getting segment info");
        }
    }

    /// <summary>
    /// Gets players overview analytics
    /// </summary>
    /// <param name="days">Number of days to analyze</param>
    /// <param name="limit">Maximum number of players to return</param>
    /// <returns>Overview of player analytics</returns>
    [HttpGet("overview")]
    [ProducesResponseType(typeof(PlayersOverviewDto), StatusCodes.Status200OK)]
    public IActionResult GetPlayersOverview([FromQuery] int days = 30, [FromQuery] int limit = 100)
    {
        try
        {
            _logger.LogInformation("Getting players overview for {Days} days", days);

            // Mock overview data that matches frontend interface
            var overviewData = new
            {
                totalPlayers = 1250,
                activePlayers = 850,
                newPlayers = 45,
                churnedPlayers = 25,
                averageLifetimeValue = 750.00m,
                totalRevenue = 125000.00m,
                playerSegments = new Dictionary<string, int>
                {
                    { "Regular", 750 },
                    { "High Value", 300 },
                    { "Casual", 200 }
                },
                topCountries = new Dictionary<string, int>
                {
                    { "US", 500 },
                    { "UK", 300 },
                    { "CA", 250 },
                    { "Other", 200 }
                },
                vipDistribution = new Dictionary<string, int>
                {
                    { "1", 600 },
                    { "2", 350 },
                    { "3", 200 },
                    { "4", 80 },
                    { "5", 20 }
                },
                riskDistribution = new Dictionary<string, int>
                {
                    { "1", 1000 },
                    { "2", 200 },
                    { "3", 40 },
                    { "4", 10 }
                }
            };

            var response = new
            {
                data = overviewData,
                success = true,
                message = "Overview retrieved successfully"
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting players overview");
            return StatusCode(500, "An error occurred while getting players overview");
        }
    }

    /// <summary>
    /// Gets player cohort analysis
    /// </summary>
    /// <param name="cohortType">Type of cohort analysis (weekly, monthly)</param>
    /// <param name="periods">Number of periods to analyze</param>
    /// <returns>Cohort analysis data</returns>
    [HttpGet("cohort-analysis")]
    [ProducesResponseType(typeof(CohortAnalysisDto), StatusCodes.Status200OK)]
    public IActionResult GetCohortAnalysis([FromQuery] string cohortType = "monthly", [FromQuery] int periods = 12)
    {
        try
        {
            _logger.LogInformation("Getting cohort analysis: {CohortType} for {Periods} periods", cohortType, periods);

            // Mock cohort analysis data
            var cohortAnalysis = new CohortAnalysisDto
            {
                CohortId = $"{cohortType}-{DateTime.UtcNow:yyyy-MM}",
                CohortDate = DateTime.UtcNow,
                CohortStartDate = DateTime.UtcNow.AddMonths(-periods),
                CohortSize = 100,
                InitialSize = 100,
                Period = cohortType,
                RetentionRates = new Dictionary<int, double>
                {
                    { 0, 1.0 }, { 1, 0.75 }, { 2, 0.60 }, { 3, 0.45 },
                    { 4, 0.35 }, { 5, 0.28 }, { 6, 0.22 }
                },
                RevenueRates = new Dictionary<int, decimal>(),
                RevenuePerPeriod = new Dictionary<int, decimal>(),
                ActiveUsers = new Dictionary<int, int>()
            };
            return Ok(cohortAnalysis);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cohort analysis");
            return StatusCode(500, "An error occurred while getting cohort analysis");
        }
    }
}
