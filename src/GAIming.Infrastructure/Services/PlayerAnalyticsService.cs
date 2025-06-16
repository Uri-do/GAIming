using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using GAIming.Core.Interfaces;
using GAIming.Core.Models;
using GAIming.Core.Entities;
using GAIming.Infrastructure.Data;

namespace GAIming.Infrastructure.Services;

/// <summary>
/// Player analytics service implementation
/// </summary>
public class PlayerAnalyticsService : IPlayerAnalyticsService
{
    private readonly IPlayerRepository _playerRepository;
    private readonly IPlayedGameRepository _playedGameRepository;
    private readonly IGameRecommendationRepository _recommendationRepository;
    private readonly IAccountTransactionRepository _transactionRepository;
    private readonly ApplicationDbContext _gaimingContext;
    private readonly ApplicationDbContext _progressPlayContext;
    private readonly ILogger<PlayerAnalyticsService> _logger;

    public PlayerAnalyticsService(
        IPlayerRepository playerRepository,
        IPlayedGameRepository playedGameRepository,
        IGameRecommendationRepository recommendationRepository,
        IAccountTransactionRepository transactionRepository,
        ApplicationDbContext gaimingContext,
        ApplicationDbContext progressPlayContext,
        ILogger<PlayerAnalyticsService> logger)
    {
        _playerRepository = playerRepository;
        _playedGameRepository = playedGameRepository;
        _recommendationRepository = recommendationRepository;
        _transactionRepository = transactionRepository;
        _gaimingContext = gaimingContext;
        _progressPlayContext = progressPlayContext;
        _logger = logger;
    }

    public async Task<PlayerAnalyticsDashboard> GetPlayerDashboardAsync(long playerId, DateTime startDate, DateTime endDate)
    {
        try
        {
            _logger.LogInformation("Getting player dashboard for {PlayerId} from {StartDate} to {EndDate}", 
                playerId, startDate, endDate);

            var player = await _playerRepository.GetByIdAsync(playerId);
            if (player == null)
            {
                return new PlayerAnalyticsDashboard
                {
                    PlayerId = playerId,
                    StartDate = startDate,
                    EndDate = endDate,
                    Overview = new PlayerOverviewStats(),
                    GameStats = new GAIming.Core.Models.PlayerGameStats(),
                    RecommendationStats = new PlayerRecommendationStats(),
                    BehaviorSummary = new PlayerBehaviorSummary(),
                    RiskAssessment = new PlayerRiskAssessment(),
                    ActivityTrends = new List<PlayerActivityTrend>()
                };
            }

            var dashboard = new PlayerAnalyticsDashboard
            {
                PlayerId = playerId,
                StartDate = startDate,
                EndDate = endDate,
                Overview = await GetPlayerOverviewStatsAsync(playerId, startDate, endDate),
                GameStats = await _playedGameRepository.GetPlayerGameStatsAsync(playerId),
                RecommendationStats = await GetPlayerRecommendationStatsAsync(playerId, startDate, endDate),
                BehaviorSummary = await GetPlayerBehaviorSummaryAsync(playerId),
                RiskAssessment = await GetPlayerRiskAssessmentAsync(playerId),
                ActivityTrends = await GetPlayerActivityTrendsAsync(playerId, startDate, endDate)
            };

            return dashboard;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting player dashboard for {PlayerId}", playerId);
            throw;
        }
    }

    public async Task<PlayerBehaviorAnalysis> GetPlayerBehaviorAsync(long playerId, DateTime startDate, DateTime endDate)
    {
        try
        {
            _logger.LogInformation("Getting player behavior analysis for {PlayerId}", playerId);

            var playedGames = await _playedGameRepository.GetByPlayerAsync(playerId);
            var recentGames = playedGames.Where(pg => pg.CreationDate >= startDate && pg.CreationDate <= endDate);

            var analysis = new PlayerBehaviorAnalysis
            {
                PlayerId = playerId,
                AnalysisDate = DateTime.UtcNow,
                SessionPatterns = await AnalyzeSessionPatternsAsync(playerId, recentGames),
                BettingPatterns = await AnalyzeBettingPatternsAsync(playerId, recentGames),
                GamePreferences = await AnalyzeGamePreferencesAsync(playerId, recentGames),
                Insights = await GenerateBehaviorInsightsAsync(playerId, recentGames),
                Alerts = await GenerateBehaviorAlertsAsync(playerId, recentGames)
            };

            return analysis;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting player behavior for {PlayerId}", playerId);
            throw;
        }
    }

    public async Task<PlayerRecommendationPerformance> GetPlayerRecommendationPerformanceAsync(long playerId, DateTime startDate, DateTime endDate)
    {
        try
        {
            _logger.LogInformation("Getting recommendation performance for player {PlayerId}", playerId);

            var recommendations = await _recommendationRepository.GetByPlayerAsync(playerId);
            var periodRecommendations = recommendations.Where(r => r.CreatedDate >= startDate && r.CreatedDate <= endDate);

            var totalRecommendations = periodRecommendations.Count();
            var clickedRecommendations = periodRecommendations.Count(r => r.IsClicked);
            var playedRecommendations = periodRecommendations.Count(r => r.IsPlayed);

            var performance = new PlayerRecommendationPerformance
            {
                PlayerId = playerId,
                StartDate = startDate,
                EndDate = endDate,
                TotalRecommendations = totalRecommendations,
                ClickedRecommendations = clickedRecommendations,
                PlayedRecommendations = playedRecommendations,
                ClickThroughRate = totalRecommendations > 0 ? (double)clickedRecommendations / totalRecommendations : 0,
                ConversionRate = totalRecommendations > 0 ? (double)playedRecommendations / totalRecommendations : 0,
                AlgorithmPerformance = await GetAlgorithmPerformanceAsync(periodRecommendations),
                CategoryPerformance = await GetCategoryPerformanceAsync(periodRecommendations),
                Trends = await GetRecommendationTrendsAsync(playerId, startDate, endDate)
            };

            return performance;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendation performance for {PlayerId}", playerId);
            throw;
        }
    }

    public async Task<PlayerGamePreferences> GetPlayerGamePreferencesAsync(long playerId)
    {
        try
        {
            _logger.LogInformation("Getting game preferences for player {PlayerId}", playerId);

            var playedGames = await _playedGameRepository.GetByPlayerAsync(playerId);
            var gameIds = playedGames.Select(pg => pg.GameID).Distinct().ToList();
            
            var games = await _progressPlayContext.Games
                .Where(g => gameIds.Contains(g.GameID))
                .Include(g => g.Provider)
                .Include(g => g.GameType)
                .ToListAsync();

            var preferences = new PlayerGamePreferences
            {
                PlayerId = playerId,
                GameTypes = CalculateGameTypePreferences(playedGames, games),
                Providers = CalculateProviderPreferences(playedGames, games),
                Volatility = CalculateVolatilityPreference(playedGames, games),
                PreferredFeatures = await IdentifyPreferredFeaturesAsync(playerId, games),
                AvoidedFeatures = await IdentifyAvoidedFeaturesAsync(playerId, games),
                PreferredBetRange = CalculatePreferredBetRange(playedGames),
                PreferredRTPRange = CalculatePreferredRTPRange(games),
                LastUpdated = DateTime.UtcNow
            };

            return preferences;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting game preferences for {PlayerId}", playerId);
            throw;
        }
    }

    public async Task<PlayerRiskAssessment> GetPlayerRiskAssessmentAsync(long playerId)
    {
        try
        {
            _logger.LogInformation("Getting risk assessment for player {PlayerId}", playerId);

            // Check if we have a recent risk assessment in the database
            var existingAssessment = await _gaimingContext.PlayerRiskAssessments
                .FirstOrDefaultAsync(pra => pra.PlayerId == playerId);

            if (existingAssessment != null && existingAssessment.AssessmentDate > DateTime.UtcNow.AddDays(-7))
            {
                return new PlayerRiskAssessment
                {
                    PlayerId = existingAssessment.PlayerId,
                    RiskLevel = existingAssessment.RiskLevel,
                    RiskCategory = existingAssessment.RiskCategory,
                    LastAssessmentDate = existingAssessment.AssessmentDate
                };
            }

            // Generate new basic risk assessment
            var assessment = new PlayerRiskAssessment
            {
                PlayerId = playerId,
                RiskLevel = 1,
                RiskCategory = "Low",
                LastAssessmentDate = DateTime.UtcNow
            };

            return assessment;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting risk assessment for {PlayerId}", playerId);
            throw;
        }
    }

    public async Task<PlayerSegment> GetPlayerSegmentAsync(long playerId)
    {
        try
        {
            _logger.LogInformation("Getting segment info for player {PlayerId}", playerId);

            var playedGames = await _playedGameRepository.GetByPlayerAsync(playerId);

            var segment = new PlayerSegment
            {
                PlayerId = playerId,
                SegmentName = "Regular",
                SegmentType = "Behavioral",
                SegmentScore = 0.8,
                AssignedDate = DateTime.UtcNow,
                Attributes = new Dictionary<string, object>
                {
                    { "ActivityLevel", "Medium" },
                    { "Confidence", 0.8 },
                    { "SecondarySegments", new List<string> { "Casual" } }
                },
                IsActive = true
            };

            return segment;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting segment info for {PlayerId}", playerId);
            throw;
        }
    }

    public async Task<PlayersOverviewDto> GetPlayersOverviewAsync(DateTime startDate, DateTime endDate, int topCount)
    {
        try
        {
            _logger.LogInformation("Getting players overview from {StartDate} to {EndDate}", startDate, endDate);

            var allPlayers = await _playerRepository.GetAllAsync();
            var activePlayers = allPlayers.Where(p => p.UpdatedDate >= startDate);
            var newPlayers = allPlayers.Where(p => p.CreatedDate >= startDate && p.CreatedDate <= endDate);

            var overview = new PlayersOverviewDto
            {
                TotalPlayers = allPlayers.Count(),
                ActivePlayers = activePlayers.Count(),
                NewPlayers = newPlayers.Count(),
                TotalRevenue = 0m, // TODO: Calculate from actual data
                AverageSessionTime = 25.0, // TODO: Calculate from actual data
                SegmentBreakdown = await GetSegmentSummariesAsync(),
                ActivityTrends = new List<PlayerActivityTrend>() // TODO: Calculate from actual data
            };

            return overview;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting players overview");
            throw;
        }
    }

    public async Task<CohortAnalysisDto> GetCohortAnalysisAsync(string cohortType, int periods)
    {
        try
        {
            _logger.LogInformation("Getting cohort analysis: {CohortType} for {Periods} periods", cohortType, periods);

            var cohortData = await GenerateCohortsAsync(cohortType, periods);
            var cohortAnalysis = new CohortAnalysisDto
            {
                CohortId = $"{cohortType}-{periods}",
                CohortStartDate = DateTime.UtcNow.AddMonths(-periods),
                InitialSize = cohortData.FirstOrDefault()?.InitialSize ?? 0,
                Period = cohortType,
                RetentionRates = cohortData.FirstOrDefault()?.RetentionRates ?? new Dictionary<int, double>(),
                RevenuePerPeriod = cohortData.FirstOrDefault()?.PeriodValues?.ToDictionary(kv => kv.Key, kv => (decimal)kv.Value) ?? new Dictionary<int, decimal>()
            };

            return cohortAnalysis;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cohort analysis");
            throw;
        }
    }

    // Private helper methods will be implemented in the next part...
    private Task<PlayerOverviewStats> GetPlayerOverviewStatsAsync(long playerId, DateTime startDate, DateTime endDate)
    {
        return Task.FromResult(new PlayerOverviewStats());
    }

    private Task<PlayerRecommendationStats> GetPlayerRecommendationStatsAsync(long playerId, DateTime startDate, DateTime endDate)
    {
        return Task.FromResult(new PlayerRecommendationStats());
    }

    private Task<PlayerBehaviorSummary> GetPlayerBehaviorSummaryAsync(long playerId)
    {
        return Task.FromResult(new PlayerBehaviorSummary());
    }

    private Task<List<PlayerActivityTrend>> GetPlayerActivityTrendsAsync(long playerId, DateTime startDate, DateTime endDate)
    {
        return Task.FromResult(new List<PlayerActivityTrend>());
    }

    // Helper method implementations
    private async Task<SessionPatterns> AnalyzeSessionPatternsAsync(long playerId, IEnumerable<PlayedGame> recentGames)
    {
        await Task.CompletedTask;
        return new SessionPatterns
        {
            AverageSessionDuration = 30.0,
            PeakHours = new List<int> { 19, 20, 21 },
            PeakDays = new List<string> { "Friday", "Saturday" },
            SessionFrequency = 2.5
        };
    }

    private async Task<BettingPatterns> AnalyzeBettingPatternsAsync(long playerId, IEnumerable<PlayedGame> recentGames)
    {
        await Task.CompletedTask;
        return new BettingPatterns
        {
            AverageBetSize = 10.0m,
            MaxBetSize = 50.0m,
            MinBetSize = 1.0m,
            BetSizeVariability = 0.3,
            RiskTolerance = 0.5
        };
    }

    private async Task<GamePreferences> AnalyzeGamePreferencesAsync(long playerId, IEnumerable<PlayedGame> recentGames)
    {
        await Task.CompletedTask;
        return new GamePreferences
        {
            GameTypePreferences = new List<GameTypePreference>(),
            ProviderPreferences = new List<ProviderPreference>(),
            VolatilityPreference = new VolatilityPreference { PreferredLevel = 3 }
        };
    }

    private async Task<List<BehaviorInsight>> GenerateBehaviorInsightsAsync(long playerId, IEnumerable<PlayedGame> recentGames)
    {
        await Task.CompletedTask;
        return new List<BehaviorInsight>
        {
            new BehaviorInsight
            {
                Type = "PlayPattern",
                Title = "Regular Player",
                Description = "Player shows consistent gaming patterns",
                Severity = "Info",
                DetectedAt = DateTime.UtcNow
            }
        };
    }

    private async Task<List<BehaviorAlert>> GenerateBehaviorAlertsAsync(long playerId, IEnumerable<PlayedGame> recentGames)
    {
        await Task.CompletedTask;
        return new List<BehaviorAlert>();
    }

    private async Task<Dictionary<string, AlgorithmPerformance>> GetAlgorithmPerformanceAsync(IEnumerable<GameRecommendation> recommendations)
    {
        await Task.CompletedTask;
        return new Dictionary<string, AlgorithmPerformance>
        {
            { "hybrid", new AlgorithmPerformance { Algorithm = "hybrid", CTR = 0.15, ConversionRate = 0.08 } }
        };
    }

    private async Task<List<CategoryPerformance>> GetCategoryPerformanceAsync(IEnumerable<GameRecommendation> recommendations)
    {
        await Task.CompletedTask;
        return new List<CategoryPerformance>();
    }

    private async Task<List<RecommendationTrend>> GetRecommendationTrendsAsync(long playerId, DateTime startDate, DateTime endDate)
    {
        await Task.CompletedTask;
        return new List<RecommendationTrend>();
    }

    private List<GameTypePreference> CalculateGameTypePreferences(IEnumerable<PlayedGame> playedGames, List<Game> games)
    {
        return new List<GameTypePreference>();
    }

    private List<ProviderPreference> CalculateProviderPreferences(IEnumerable<PlayedGame> playedGames, List<Game> games)
    {
        return new List<ProviderPreference>();
    }

    private VolatilityPreference CalculateVolatilityPreference(IEnumerable<PlayedGame> playedGames, List<Game> games)
    {
        return new VolatilityPreference { PreferredLevel = 3 };
    }

    private async Task<List<string>> IdentifyPreferredFeaturesAsync(long playerId, List<Game> games)
    {
        await Task.CompletedTask;
        return new List<string> { "Bonus Rounds", "Free Spins" };
    }

    private async Task<List<string>> IdentifyAvoidedFeaturesAsync(long playerId, List<Game> games)
    {
        await Task.CompletedTask;
        return new List<string>();
    }

    private decimal CalculatePreferredBetRange(IEnumerable<PlayedGame> playedGames)
    {
        return 10.0m;
    }

    private double CalculatePreferredRTPRange(List<Game> games)
    {
        return 96.5;
    }

    private async Task<double> CalculateRetentionRateAsync(DateTime startDate, DateTime endDate)
    {
        await Task.CompletedTask;
        return 0.75;
    }

    private async Task<List<PlayerSegmentSummary>> GetSegmentSummariesAsync()
    {
        await Task.CompletedTask;
        return new List<PlayerSegmentSummary>();
    }

    private async Task<List<TopPlayer>> GetTopPlayersAsync(DateTime startDate, DateTime endDate, int limit)
    {
        await Task.CompletedTask;
        return new List<TopPlayer>();
    }

    private async Task<PlayerActivitySummary> GetActivitySummaryAsync(DateTime startDate, DateTime endDate)
    {
        await Task.CompletedTask;
        return new PlayerActivitySummary();
    }

    private async Task<List<CohortData>> GenerateCohortsAsync(string cohortType, int periods)
    {
        await Task.CompletedTask;
        return new List<CohortData>
        {
            new CohortData
            {
                CohortId = "2024-01",
                InitialSize = 100,
                PeriodValues = new Dictionary<int, double> { { 0, 100 }, { 1, 75 }, { 2, 60 } },
                RetentionRates = new Dictionary<int, double> { { 0, 1.0 }, { 1, 0.75 }, { 2, 0.60 } }
            }
        };
    }

    private CohortSummary CalculateCohortSummary(List<CohortData> cohorts)
    {
        return new CohortSummary
        {
            AverageRetentionRate = 0.65,
            AverageLifetimeValue = 150.0m
        };
    }

    /// <inheritdoc />
    public async Task<PaginatedResponse<PlayerAnalyticsDto>> GetPlayerAnalyticsAsync(PlayerAnalyticsRequest request)
    {
        try
        {
            _logger.LogInformation("Getting player analytics with request: {@Request}", request);

            var query = _progressPlayContext.Players.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                query = query.Where(p => p.Username.Contains(request.SearchTerm) ||
                                        p.Email.Contains(request.SearchTerm) ||
                                        p.FirstName.Contains(request.SearchTerm) ||
                                        p.LastName.Contains(request.SearchTerm));
            }

            if (request.CountryCode != null)
                query = query.Where(p => p.Country == request.CountryCode);

            if (request.VipLevel.HasValue)
                query = query.Where(p => p.VIPLevel == request.VipLevel.Value);

            if (request.RiskLevel.HasValue)
                query = query.Where(p => p.RiskLevel == request.RiskLevel.Value);

            if (request.IsActive.HasValue)
                query = query.Where(p => p.IsActive == request.IsActive.Value);

            if (request.RegistrationDateFrom.HasValue)
                query = query.Where(p => p.CreatedDate >= request.RegistrationDateFrom.Value);

            if (request.RegistrationDateTo.HasValue)
                query = query.Where(p => p.CreatedDate <= request.RegistrationDateTo.Value);

            var totalCount = await query.CountAsync();
            var players = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var playerAnalytics = new List<PlayerAnalyticsDto>();
            foreach (var player in players)
            {
                var analytics = await MapToPlayerAnalyticsDto(player);
                playerAnalytics.Add(analytics);
            }

            return new PaginatedResponse<PlayerAnalyticsDto>
            {
                Data = playerAnalytics,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting player analytics");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<PlayerAnalyticsDto?> GetPlayerAnalyticsByIdAsync(long playerId)
    {
        try
        {
            _logger.LogDebug("Getting player analytics by ID: {PlayerId}", playerId);

            var player = await _progressPlayContext.Players
                .FirstOrDefaultAsync(p => p.PlayerID == playerId);

            if (player == null)
                return null;

            return await MapToPlayerAnalyticsDto(player);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting player analytics by ID: {PlayerId}", playerId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<List<SegmentationAnalysisDto>> GetPlayerSegmentationAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            _logger.LogInformation("Getting player segmentation analysis");

            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            // Get all players
            var players = await _progressPlayContext.Players
                .Where(p => p.CreatedDate >= start && p.CreatedDate <= end)
                .ToListAsync();

            var segmentationAnalysis = new List<SegmentationAnalysisDto>
            {
                new SegmentationAnalysisDto
                {
                    SegmentName = "High Value",
                    PlayerCount = players.Count(p => p.VIPLevel >= 4),
                    Percentage = players.Any() ? (double)players.Count(p => p.VIPLevel >= 4) / players.Count * 100 : 0,
                    AverageRevenue = 500.0m,
                    AverageSessionDuration = 45.0,
                    RetentionRate = 0.85,
                    Characteristics = new List<string> { "High VIP Level", "Frequent Player", "High Spending" }
                },
                new SegmentationAnalysisDto
                {
                    SegmentName = "Regular",
                    PlayerCount = players.Count(p => p.VIPLevel >= 2 && p.VIPLevel < 4),
                    Percentage = players.Any() ? (double)players.Count(p => p.VIPLevel >= 2 && p.VIPLevel < 4) / players.Count * 100 : 0,
                    AverageRevenue = 150.0m,
                    AverageSessionDuration = 25.0,
                    RetentionRate = 0.65,
                    Characteristics = new List<string> { "Medium VIP Level", "Regular Player", "Moderate Spending" }
                },
                new SegmentationAnalysisDto
                {
                    SegmentName = "Casual",
                    PlayerCount = players.Count(p => p.VIPLevel < 2),
                    Percentage = players.Any() ? (double)players.Count(p => p.VIPLevel < 2) / players.Count * 100 : 0,
                    AverageRevenue = 50.0m,
                    AverageSessionDuration = 15.0,
                    RetentionRate = 0.45,
                    Characteristics = new List<string> { "Low VIP Level", "Occasional Player", "Low Spending" }
                }
            };

            return segmentationAnalysis;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting player segmentation");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<List<CohortAnalysisDto>> GetCohortAnalysisAsync(DateTime startDate, DateTime endDate, string period = "monthly")
    {
        try
        {
            _logger.LogInformation("Getting cohort analysis from {StartDate} to {EndDate} by {Period}", startDate, endDate, period);

            var cohortAnalysis = new List<CohortAnalysisDto>();

            // Generate sample cohort data
            var currentDate = startDate;
            while (currentDate <= endDate)
            {
                var cohortId = period.ToLower() switch
                {
                    "weekly" => $"{currentDate:yyyy-MM-dd}",
                    "monthly" => $"{currentDate:yyyy-MM}",
                    "quarterly" => $"{currentDate:yyyy}-Q{(currentDate.Month - 1) / 3 + 1}",
                    _ => $"{currentDate:yyyy-MM}"
                };

                var cohort = new CohortAnalysisDto
                {
                    CohortId = cohortId,
                    CohortStartDate = currentDate,
                    InitialSize = Random.Shared.Next(50, 200),
                    Period = period,
                    RetentionRates = new Dictionary<int, double>
                    {
                        { 0, 1.0 },
                        { 1, 0.75 + Random.Shared.NextDouble() * 0.2 - 0.1 },
                        { 2, 0.60 + Random.Shared.NextDouble() * 0.2 - 0.1 },
                        { 3, 0.45 + Random.Shared.NextDouble() * 0.2 - 0.1 },
                        { 6, 0.30 + Random.Shared.NextDouble() * 0.2 - 0.1 },
                        { 12, 0.20 + Random.Shared.NextDouble() * 0.15 - 0.075 }
                    },
                    RevenuePerPeriod = new Dictionary<int, decimal>
                    {
                        { 0, 100m + (decimal)(Random.Shared.NextDouble() * 100) },
                        { 1, 80m + (decimal)(Random.Shared.NextDouble() * 80) },
                        { 2, 60m + (decimal)(Random.Shared.NextDouble() * 60) },
                        { 3, 45m + (decimal)(Random.Shared.NextDouble() * 45) },
                        { 6, 30m + (decimal)(Random.Shared.NextDouble() * 30) },
                        { 12, 20m + (decimal)(Random.Shared.NextDouble() * 20) }
                    }
                };

                cohortAnalysis.Add(cohort);

                currentDate = period.ToLower() switch
                {
                    "weekly" => currentDate.AddDays(7),
                    "monthly" => currentDate.AddMonths(1),
                    "quarterly" => currentDate.AddMonths(3),
                    _ => currentDate.AddMonths(1)
                };
            }

            return cohortAnalysis;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cohort analysis");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<PlayerRiskAssessment> AssessPlayerRiskAsync(long playerId)
    {
        try
        {
            _logger.LogInformation("Assessing player risk for player: {PlayerId}", playerId);

            var player = await _progressPlayContext.Players
                .FirstOrDefaultAsync(p => p.PlayerID == playerId);

            if (player == null)
            {
                throw new ArgumentException($"Player with ID {playerId} not found");
            }

            // Get player's gaming activity
            var playedGames = await _progressPlayContext.PlayedGames
                .Where(pg => pg.PlayerID == playerId && pg.CreationDate >= DateTime.UtcNow.AddDays(-30))
                .ToListAsync();

            var riskAssessment = new PlayerRiskAssessment
            {
                PlayerId = playerId,
                RiskLevel = player.RiskLevel,
                RiskCategory = player.RiskLevel switch
                {
                    1 => "Very Low",
                    2 => "Low",
                    3 => "Medium",
                    4 => "High",
                    5 => "Critical",
                    _ => "Unknown"
                },
                RiskFactors = new List<string>(),
                SpendingVelocity = CalculateSpendingVelocity(playedGames),
                SessionFrequency = CalculateSessionFrequency(playedGames),
                AverageSessionDuration = CalculateAverageSessionDuration(playedGames),
                HasGamblingProblemIndicators = player.RiskLevel >= 4,
                LastAssessmentDate = DateTime.UtcNow,
                RiskScores = new Dictionary<string, double>
                {
                    { "spending_velocity", CalculateSpendingVelocity(playedGames) },
                    { "session_frequency", CalculateSessionFrequency(playedGames) },
                    { "loss_chasing", CalculateLossChasingScore(playedGames) },
                    { "time_spent", CalculateTimeSpentScore(playedGames) }
                }
            };

            // Add risk factors based on analysis
            if (riskAssessment.SpendingVelocity > 5.0)
                riskAssessment.RiskFactors.Add("High spending velocity");

            if (riskAssessment.SessionFrequency > 10.0)
                riskAssessment.RiskFactors.Add("Very frequent sessions");

            if (riskAssessment.AverageSessionDuration > 120.0)
                riskAssessment.RiskFactors.Add("Long session durations");

            return riskAssessment;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assessing player risk for player: {PlayerId}", playerId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<List<PlayerAnalyticsDto>> GetHighRiskPlayersAsync()
    {
        try
        {
            _logger.LogInformation("Getting high risk players");

            var highRiskPlayers = await _progressPlayContext.Players
                .Where(p => p.RiskLevel >= 4 && p.IsActive)
                .OrderByDescending(p => p.RiskLevel)
                .Take(50)
                .ToListAsync();

            var playerAnalytics = new List<PlayerAnalyticsDto>();
            foreach (var player in highRiskPlayers)
            {
                var analytics = await MapToPlayerAnalyticsDto(player);
                playerAnalytics.Add(analytics);
            }

            return playerAnalytics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting high risk players");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<List<PlayerAnalyticsDto>> GetTopPlayersAsync(string metric = "revenue", int count = 10)
    {
        try
        {
            _logger.LogInformation("Getting top {Count} players by {Metric}", count, metric);

            var players = await _progressPlayContext.Players
                .Where(p => p.IsActive)
                .OrderByDescending(p => p.VIPLevel) // Simple ordering by VIP level as proxy for revenue
                .Take(count)
                .ToListAsync();

            var playerAnalytics = new List<PlayerAnalyticsDto>();
            foreach (var player in players)
            {
                var analytics = await MapToPlayerAnalyticsDto(player);
                playerAnalytics.Add(analytics);
            }

            return playerAnalytics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting top players");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<object> GetPlayerActivityAsync(DateTime startDate, DateTime endDate)
    {
        try
        {
            _logger.LogInformation("Getting player activity from {StartDate} to {EndDate}", startDate, endDate);

            var playedGames = await _progressPlayContext.PlayedGames
                .Where(pg => pg.CreationDate >= startDate && pg.CreationDate <= endDate)
                .ToListAsync();

            var activity = new
            {
                TotalSessions = playedGames.Count,
                UniquePlayers = playedGames.Select(pg => pg.PlayerID).Distinct().Count(),
                TotalBets = playedGames.Sum(pg => pg.TotalBet),
                TotalWins = playedGames.Sum(pg => pg.TotalWin),
                TotalRevenue = playedGames.Sum(pg => pg.TotalBet - pg.TotalWin),
                AverageSessionDuration = playedGames.Any()
                    ? playedGames.Average(pg => (pg.UpdatedDate - pg.CreationDate).TotalMinutes)
                    : 0,
                DailyActivity = playedGames
                    .GroupBy(pg => pg.CreationDate.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Sessions = g.Count(),
                        Players = g.Select(pg => pg.PlayerID).Distinct().Count(),
                        Revenue = g.Sum(pg => pg.TotalBet - pg.TotalWin)
                    })
                    .OrderBy(x => x.Date)
                    .ToList()
            };

            return activity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting player activity");
            throw;
        }
    }

    private async Task<PlayerAnalyticsDto> MapToPlayerAnalyticsDto(Player player)
    {
        try
        {
            // Get player's gaming statistics
            var playedGames = await _progressPlayContext.PlayedGames
                .Where(pg => pg.PlayerID == player.PlayerID && pg.CreationDate >= DateTime.UtcNow.AddDays(-30))
                .ToListAsync();

            return new PlayerAnalyticsDto
            {
                PlayerId = player.PlayerID,
                Username = player.Username,
                Email = player.Email,
                FirstName = player.FirstName,
                LastName = player.LastName,
                Country = player.Country,
                VipLevel = player.VIPLevel,
                RiskLevel = player.RiskLevel,
                IsActive = player.IsActive,
                RegistrationDate = player.CreatedDate,
                LastLoginDate = player.UpdatedDate,
                TotalSessions = playedGames.Count,
                TotalBets = playedGames.Sum(pg => pg.TotalBet),
                TotalWins = playedGames.Sum(pg => pg.TotalWin),
                TotalRevenue = playedGames.Sum(pg => pg.TotalBet - pg.TotalWin),
                AverageSessionDuration = playedGames.Any()
                    ? playedGames.Average(pg => (pg.UpdatedDate - pg.CreationDate).TotalMinutes)
                    : 0,
                AverageBetSize = playedGames.Any() ? playedGames.Average(pg => pg.TotalBet) : 0,
                FavoriteGameTypes = new List<string>(),
                PreferredProviders = new List<string>(),
                PlayerSegment = DeterminePlayerSegment(player),
                LifetimeValue = CalculateLifetimeValue(player.PlayerID),
                RetentionScore = CalculateRetentionScore(player),
                EngagementScore = CalculateEngagementScore(playedGames),
                RiskScore = player.RiskLevel * 20.0 // Convert 1-5 scale to 0-100
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error mapping player to analytics DTO: {PlayerId}", player.PlayerID);
            throw;
        }
    }

    private string DeterminePlayerSegment(Player player)
    {
        return player.VIPLevel switch
        {
            >= 4 => "High Value",
            >= 2 => "Regular",
            _ => "Casual"
        };
    }

    private decimal CalculateLifetimeValue(long playerId)
    {
        // Placeholder calculation - would typically sum all historical revenue
        return 150.0m;
    }

    private double CalculateRetentionScore(Player player)
    {
        // Simple retention score based on account age and activity
        var daysSinceRegistration = (DateTime.UtcNow - player.CreatedDate).TotalDays;
        var daysSinceLastActivity = (DateTime.UtcNow - player.UpdatedDate).TotalDays;

        if (daysSinceLastActivity > 30) return 0.2;
        if (daysSinceLastActivity > 7) return 0.5;
        if (daysSinceRegistration > 365) return 0.9;
        return 0.7;
    }

    private double CalculateEngagementScore(List<PlayedGame> playedGames)
    {
        if (!playedGames.Any()) return 0.0;

        var sessionCount = playedGames.Count;
        var avgSessionDuration = playedGames.Average(pg => (pg.UpdatedDate - pg.CreationDate).TotalMinutes);

        // Simple engagement score calculation
        return Math.Min(100.0, (sessionCount * 2) + (avgSessionDuration * 0.5));
    }

    private double CalculateSpendingVelocity(List<PlayedGame> playedGames)
    {
        if (!playedGames.Any()) return 0.0;

        var totalBets = playedGames.Sum(pg => pg.TotalBet);
        var days = Math.Max(1, (DateTime.UtcNow - playedGames.Min(pg => pg.CreationDate)).TotalDays);

        return (double)(totalBets / (decimal)days);
    }

    private double CalculateSessionFrequency(List<PlayedGame> playedGames)
    {
        if (!playedGames.Any()) return 0.0;

        var sessionCount = playedGames.Count;
        var days = Math.Max(1, (DateTime.UtcNow - playedGames.Min(pg => pg.CreationDate)).TotalDays);

        return sessionCount / days;
    }

    private double CalculateAverageSessionDuration(List<PlayedGame> playedGames)
    {
        if (!playedGames.Any()) return 0.0;

        return playedGames.Average(pg => (pg.UpdatedDate - pg.CreationDate).TotalMinutes);
    }

    private double CalculateLossChasingScore(List<PlayedGame> playedGames)
    {
        // Placeholder for loss chasing behavior analysis
        return 2.0;
    }

    private double CalculateTimeSpentScore(List<PlayedGame> playedGames)
    {
        if (!playedGames.Any()) return 0.0;

        var totalMinutes = playedGames.Sum(pg => (pg.UpdatedDate - pg.CreationDate).TotalMinutes);
        var days = Math.Max(1, (DateTime.UtcNow - playedGames.Min(pg => pg.CreationDate)).TotalDays);

        return totalMinutes / days / 60.0; // Hours per day
    }
}
