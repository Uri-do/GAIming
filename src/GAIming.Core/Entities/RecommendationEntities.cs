using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GAIming.Core.Entities;

/// <summary>
/// Game recommendation entity in GAImingDB
/// </summary>
[Table("GameRecommendations")]
public class GameRecommendation : BaseDomainEntity
{
    [Required]
    public long PlayerId { get; set; }

    [Required]
    public long GameId { get; set; }

    [Required]
    [StringLength(50)]
    public string Algorithm { get; set; } = string.Empty;

    [Required]
    public double Score { get; set; }

    public int Position { get; set; }

    [StringLength(100)]
    public string Context { get; set; } = string.Empty; // lobby, profile, post-game, etc.

    public bool IsClicked { get; set; } = false;
    public bool IsPlayed { get; set; } = false;

    public DateTime? ClickedAt { get; set; }
    public DateTime? PlayedAt { get; set; }

    [StringLength(100)]
    public string? SessionId { get; set; }

    [StringLength(20)]
    public string? Platform { get; set; } // Mobile, Desktop, Tablet

    public string? Metadata { get; set; } // JSON for additional data

    // Additional properties for enhanced recommendations
    [StringLength(200)]
    public string Reason { get; set; } = string.Empty; // Reason for recommendation

    [StringLength(50)]
    public string Category { get; set; } = string.Empty; // Category of recommendation

    public double Confidence { get; set; } = 0.0; // Confidence score

    public string? Features { get; set; } // JSON for ML features

    // Navigation properties
    public virtual Player? Player { get; set; }
    public virtual Game? Game { get; set; }
    public virtual ICollection<RecommendationInteraction> Interactions { get; set; } = new List<RecommendationInteraction>();
}

/// <summary>
/// Player features entity for ML storage in GAImingDB
/// </summary>
[Table("PlayerFeatures")]
public class PlayerFeatureEntity : BaseDomainEntity
{
    [Required]
    public long PlayerId { get; set; }

    public int Age { get; set; }

    [StringLength(50)]
    public string Country { get; set; } = string.Empty;

    public int RiskLevel { get; set; }
    public int VIPLevel { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalDeposits { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalBets { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalWins { get; set; }

    public int SessionCount { get; set; }
    public double AverageSessionDuration { get; set; }
    public DateTime LastPlayDate { get; set; }
    public int DaysSinceLastPlay { get; set; }

    [StringLength(500)]
    public string PreferredGameTypes { get; set; } = string.Empty; // JSON array

    [StringLength(500)]
    public string PreferredProviders { get; set; } = string.Empty; // JSON array

    public double PreferredVolatility { get; set; }
    public double PreferredRTP { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal AverageBetSize { get; set; }

    [StringLength(20)]
    public string PlayStyle { get; set; } = string.Empty;

    public double WinRate { get; set; }
    public int ConsecutiveLosses { get; set; }
    public bool IsNewPlayer { get; set; }

    public string CustomFeatures { get; set; } = string.Empty; // JSON

    // Navigation properties
    public virtual Player? Player { get; set; }
}

/// <summary>
/// Game features entity for ML storage in GAImingDB
/// </summary>
[Table("GameFeatures")]
public class GameFeatureEntity : BaseDomainEntity
{
    [Required]
    public long GameId { get; set; }

    [StringLength(100)]
    public string GameName { get; set; } = string.Empty;

    public int ProviderId { get; set; }
    public int GameTypeId { get; set; }
    public int VolatilityId { get; set; }
    public double AverageRTP { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal MinBetAmount { get; set; }

    public bool IsMobile { get; set; }
    public bool IsDesktop { get; set; }
    public int ThemeId { get; set; }
    public double PopularityScore { get; set; }
    public double RevenueScore { get; set; }
    public int TotalPlayers { get; set; }
    public int ActivePlayers { get; set; }
    public double AverageSessionDuration { get; set; }
    public double RetentionRate { get; set; }

    [StringLength(500)]
    public string Tags { get; set; } = string.Empty; // JSON array

    public DateTime ReleaseDate { get; set; }
    public bool IsNewGame { get; set; }

    public string CustomFeatures { get; set; } = string.Empty; // JSON

    // Navigation properties
    public virtual Game? Game { get; set; }
}

/// <summary>
/// Recommendation model metadata in GAImingDB
/// </summary>
[Table("RecommendationModels")]
public class RecommendationModel : BaseDomainEntity
{
    [Required]
    [StringLength(100)]
    public string ModelName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Version { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Algorithm { get; set; } = string.Empty;

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    public string ModelPath { get; set; } = string.Empty;
    public string Configuration { get; set; } = string.Empty; // JSON
    public string Hyperparameters { get; set; } = string.Empty; // JSON
    public string Metrics { get; set; } = string.Empty; // JSON

    public bool IsActive { get; set; } = false;
    public bool IsDefault { get; set; } = false;

    [Required]
    public DateTime TrainedDate { get; set; }

    public DateTime? DeployedDate { get; set; }
    public DateTime? RetiredDate { get; set; }

    // Navigation properties
    public virtual ICollection<ModelPerformanceMetric> PerformanceMetrics { get; set; } = new List<ModelPerformanceMetric>();
}

/// <summary>
/// A/B testing experiments in GAImingDB
/// </summary>
[Table("ABTestExperiments")]
public class ABTestExperiment : BaseDomainEntity
{
    [Required]
    [StringLength(100)]
    public string ExperimentName { get; set; } = string.Empty;

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    [Required]
    public int Status { get; set; } // 0=Draft, 1=Running, 2=Paused, 3=Completed, 4=Cancelled

    public string Configuration { get; set; } = string.Empty; // JSON
    public string Variants { get; set; } = string.Empty; // JSON
    public string Results { get; set; } = string.Empty; // JSON

    [StringLength(100)]
    public string WinningVariant { get; set; } = string.Empty;

    public double ConfidenceLevel { get; set; }
    public bool IsStatisticallySignificant { get; set; }
}

/// <summary>
/// Recommendation interaction tracking in GAImingDB
/// </summary>
[Table("RecommendationInteractions")]
public class RecommendationInteraction : BaseDomainEntity
{
    [Required]
    public long RecommendationId { get; set; }

    [Required]
    public long PlayerId { get; set; }

    [Required]
    public long GameId { get; set; }

    [Required]
    [StringLength(20)]
    public string InteractionType { get; set; } = string.Empty; // View, Click, Play, Dismiss, Like, Dislike

    [Required]
    public DateTime InteractionDate { get; set; } = DateTime.UtcNow;

    [StringLength(100)]
    public string SessionId { get; set; } = string.Empty;

    [StringLength(20)]
    public string Platform { get; set; } = string.Empty; // Mobile, Desktop, Tablet

    [StringLength(50)]
    public string UserAgent { get; set; } = string.Empty;

    public string Metadata { get; set; } = string.Empty; // JSON

    // Navigation properties
    public virtual GameRecommendation? Recommendation { get; set; }
    public virtual Player? Player { get; set; }
    public virtual Game? Game { get; set; }
}

/// <summary>
/// Model performance tracking in GAImingDB
/// </summary>
[Table("ModelPerformanceMetrics")]
public class ModelPerformanceMetric : BaseDomainEntity
{
    [Required]
    public long ModelId { get; set; }

    [Required]
    [StringLength(50)]
    public string MetricName { get; set; } = string.Empty;

    [Required]
    public double MetricValue { get; set; }

    [Required]
    public DateTime MeasurementDate { get; set; } = DateTime.UtcNow;

    [StringLength(100)]
    public string MeasurementPeriod { get; set; } = string.Empty; // Daily, Weekly, Monthly

    public string Metadata { get; set; } = string.Empty; // JSON

    // Navigation properties
    public virtual RecommendationModel? Model { get; set; }
}

/// <summary>
/// Player risk assessments in GAImingDB
/// </summary>
[Table("PlayerRiskAssessments")]
public class PlayerRiskAssessmentEntity : BaseDomainEntity
{
    [Required]
    public long PlayerId { get; set; }

    [Required]
    public int RiskLevel { get; set; } // 1-5 scale

    [Required]
    [StringLength(20)]
    public string RiskCategory { get; set; } = string.Empty; // Low, Medium, High, Critical

    public string RiskFactors { get; set; } = string.Empty; // JSON array

    [Column(TypeName = "decimal(18,2)")]
    public decimal SpendingVelocity { get; set; }

    public double SessionFrequency { get; set; }
    public double AverageSessionDuration { get; set; }
    public bool HasGamblingProblemIndicators { get; set; }

    public string RiskScores { get; set; } = string.Empty; // JSON

    [Required]
    public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;

    public DateTime? ExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual Player? Player { get; set; }
}
