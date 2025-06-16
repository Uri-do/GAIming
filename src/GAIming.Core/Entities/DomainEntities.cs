using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GAIming.Core.Events;

namespace GAIming.Core.Entities;

/// <summary>
/// Base domain entity with common properties and domain events
/// </summary>
public abstract class BaseDomainEntity
{
    private readonly List<IDomainEvent> _domainEvents = new();

    [Key]
    public long Id { get; set; }

    [Required]
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedDate { get; set; }

    [StringLength(100)]
    public string? CreatedBy { get; set; }

    [StringLength(100)]
    public string? UpdatedBy { get; set; }

    [NotMapped]
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    protected virtual void OnCreated()
    {
        // Override in derived classes to add creation events
    }

    protected virtual void OnUpdated()
    {
        UpdatedDate = DateTime.UtcNow;
        // Override in derived classes to add update events
    }
}

/// <summary>
/// Game entity from ProgressPlay database (read-only)
/// </summary>
[Table("Games")]
public class Game
{
    [Key]
    public int GameID { get; set; }

    [Required]
    [StringLength(255)]
    public string GameName { get; set; } = string.Empty;

    public int ProviderID { get; set; }
    public int GameTypeID { get; set; }
    public bool IsActive { get; set; }
    public bool IsMobile { get; set; }
    public bool IsDesktop { get; set; }
    public bool? HideInLobby { get; set; }
    public int GameOrder { get; set; }
    public decimal MinBetAmount { get; set; }
    public decimal? MaxBetAmount { get; set; }
    public double? RTPPercentage { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public bool UKCompliant { get; set; }
    public decimal? JackpotContribution { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }

    [StringLength(1000)]
    public string? GameDescription { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(500)]
    public string? ThumbnailUrl { get; set; }

    [StringLength(500)]
    public string? ProviderTitle { get; set; }

    // Navigation properties
    public virtual GameProvider? Provider { get; set; }
    public virtual GameType? GameType { get; set; }

    // Additional properties for recommendations
    public int VolatilityID { get; set; }
    public double PopularityScore { get; set; }
    public double GrowthRate { get; set; }
    public int TotalPlayers { get; set; }
    public Dictionary<string, object>? Features { get; set; }

    /// <summary>
    /// Gets the average RTP for the game
    /// </summary>
    public double GetAverageRTP()
    {
        return RTPPercentage ?? 95.0; // Default RTP if not set
    }
}

/// <summary>
/// Game provider entity from ProgressPlay database (read-only)
/// </summary>
[Table("GameProviders")]
public class GameProvider
{
    [Key]
    public int ProviderID { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(100)]
    public string ProviderName { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }

    // Navigation properties
    public virtual ICollection<Game> Games { get; set; } = new List<Game>();
}

/// <summary>
/// Game type entity from ProgressPlay database (read-only)
/// </summary>
[Table("GameTypes")]
public class GameType
{
    [Key]
    public int GameTypeID { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(100)]
    public string GameTypeName { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }

    // Navigation properties
    public virtual ICollection<Game> Games { get; set; } = new List<Game>();
}

/// <summary>
/// Player entity from ProgressPlay database (read-only)
/// </summary>
[Table("Players")]
public class Player
{
    [Key]
    public long PlayerID { get; set; }

    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [StringLength(10)]
    public string? Gender { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }

    [StringLength(10)]
    public string? Currency { get; set; }

    public bool IsActive { get; set; }
    public bool IsVerified { get; set; }
    public DateTime RegistrationDate { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public int VIPLevel { get; set; }
    public int RiskLevel { get; set; }
    public bool IsEligibleForGaming { get; set; } = true;
    public decimal TotalDeposits { get; set; }
    public decimal TotalWithdrawals { get; set; }
    public decimal CurrentBalance { get; set; }
    public DateTime? CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }

    // Navigation properties
    public virtual ICollection<PlayedGame> PlayedGames { get; set; } = new List<PlayedGame>();
    public virtual ICollection<AccountTransaction> AccountTransactions { get; set; } = new List<AccountTransaction>();
}

/// <summary>
/// Played game session entity from ProgressPlay database (read-only)
/// </summary>
[Table("PlayedGames")]
public class PlayedGame
{
    [Key]
    public long Id { get; set; }

    [Required]
    public long PlayerID { get; set; }

    [Required]
    public int GameID { get; set; }

    public decimal TotalBet { get; set; }
    public decimal TotalWin { get; set; }
    public int GameStatus { get; set; } // 0=InProgress, 1=Completed, 2=Cancelled
    public DateTime CreationDate { get; set; }
    public DateTime UpdatedDate { get; set; }

    [StringLength(100)]
    public string? SessionId { get; set; }

    [StringLength(20)]
    public string? Platform { get; set; } // Mobile, Desktop, Tablet

    public int SpinCount { get; set; }
    public TimeSpan SessionDuration { get; set; }

    // Navigation properties
    public virtual Player? Player { get; set; }
    public virtual Game? Game { get; set; }
}

/// <summary>
/// Account transaction entity from ProgressPlay database (read-only)
/// </summary>
[Table("AccountTransactions")]
public class AccountTransaction
{
    [Key]
    public long TransactionID { get; set; }

    [Required]
    public long PlayerID { get; set; }

    [Required]
    [StringLength(20)]
    public string TransactionType { get; set; } = string.Empty; // Deposit, Withdrawal, Bet, Win, Bonus

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public decimal BalanceAfter { get; set; }

    [Required]
    public DateTime TransactionDate { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(100)]
    public string? ReferenceId { get; set; }

    public bool IsProcessed { get; set; }

    // Navigation properties
    public virtual Player? Player { get; set; }
}

/// <summary>
/// Domain entity for categorization
/// </summary>
[Table("DomainEntities")]
public class DomainEntity
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(100)]
    public string? Category { get; set; }

    public int Status { get; set; }
    public int Priority { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }

    [StringLength(100)]
    public string? CreatedBy { get; set; }

    [StringLength(100)]
    public string? ModifiedBy { get; set; }

    [StringLength(500)]
    public string? Tags { get; set; } // JSON array

    [StringLength(100)]
    public string? ExternalId { get; set; }

    public string? Metadata { get; set; } // JSON

    // Navigation properties
    public virtual ICollection<DomainEntityItem> Items { get; set; } = new List<DomainEntityItem>();
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}

/// <summary>
/// Domain entity item for categorization
/// </summary>
[Table("DomainEntityItems")]
public class DomainEntityItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int DomainEntityId { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public decimal? Value { get; set; }
    public int? Quantity { get; set; }

    [StringLength(50)]
    public string? Unit { get; set; }

    public int Status { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }

    [StringLength(100)]
    public string? CreatedBy { get; set; }

    [StringLength(100)]
    public string? ModifiedBy { get; set; }

    public string? Metadata { get; set; } // JSON

    // Navigation properties
    public virtual DomainEntity? DomainEntity { get; set; }
}

/// <summary>
/// Audit log entity for tracking changes
/// </summary>
[Table("AuditLogs")]
public class AuditLog
{
    [Key]
    public long Id { get; set; }

    [Required]
    [StringLength(100)]
    public string EntityName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string EntityId { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Action { get; set; } = string.Empty; // Create, Update, Delete

    [StringLength(500)]
    public string? ActionDescription { get; set; }

    public string? OldValues { get; set; } // JSON
    public string? NewValues { get; set; } // JSON

    [Required]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [StringLength(100)]
    public string? UserId { get; set; }

    [StringLength(100)]
    public string? UserName { get; set; }

    [StringLength(100)]
    public string? Username { get; set; }

    [StringLength(45)]
    public string? IpAddress { get; set; }

    [StringLength(500)]
    public string? UserAgent { get; set; }

    public string? Metadata { get; set; } // JSON

    [StringLength(100)]
    public string? CorrelationId { get; set; }

    [StringLength(100)]
    public string? SessionId { get; set; }

    [StringLength(50)]
    public string? Source { get; set; }

    [StringLength(20)]
    public string? Severity { get; set; }

    [StringLength(100)]
    public string? DomainEntityId { get; set; }

    // Navigation properties
    public virtual DomainEntity? DomainEntity { get; set; }
}

/// <summary>
/// Game sub-provider entity (ProgressPlay DB)
/// </summary>
public class GameSubProvider
{
    public string SubProviderName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ProviderId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; set; }

    // Navigation properties
    public virtual GameProvider Provider { get; set; } = null!;
}

/// <summary>
/// User entity for authentication and authorization
/// </summary>
[Table("Users")]
public class User : BaseDomainEntity
{
    [StringLength(50)]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(255)]
    public string DisplayName { get; set; } = string.Empty;

    [Required]
    [StringLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    [StringLength(255)]
    public string? PasswordSalt { get; set; }

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [StringLength(100)]
    public string? Department { get; set; }

    [StringLength(100)]
    public string? Title { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsEmailConfirmed { get; set; } = false;
    public bool EmailConfirmed { get; set; } = false;
    public bool IsTwoFactorEnabled { get; set; } = false;
    public bool TwoFactorEnabled { get; set; } = false;
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LastLoginDate { get; set; }
    public DateTime? LastLogin { get; set; }
    public DateTime? LockoutEndDate { get; set; }
    public DateTime? LockoutEnd { get; set; }
    public DateTime? LastPasswordChange { get; set; }
    public DateTime? ModifiedDate { get; set; }

    [StringLength(100)]
    public string? ModifiedBy { get; set; }

    [StringLength(255)]
    public string? SecurityStamp { get; set; }

    [StringLength(255)]
    public string? TwoFactorSecret { get; set; }

    public bool MustChangePassword { get; set; } = false;

    [StringLength(255)]
    public string? PasswordResetToken { get; set; }

    public DateTime? PasswordResetTokenExpiry { get; set; }

    [StringLength(255)]
    public string? EmailConfirmationToken { get; set; }

    // Navigation properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public virtual ICollection<UserPassword> UserPasswords { get; set; } = new List<UserPassword>();
    public virtual ICollection<UserPassword> PasswordHistory { get; set; } = new List<UserPassword>();
}

/// <summary>
/// Role entity for authorization
/// </summary>
[Table("Roles")]
public class Role : BaseDomainEntity
{
    [StringLength(50)]
    public string RoleId { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsSystemRole { get; set; } = false;
    public DateTime? ModifiedDate { get; set; }

    [StringLength(100)]
    public string? ModifiedBy { get; set; }

    // Navigation properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

/// <summary>
/// Permission entity for fine-grained authorization
/// </summary>
[Table("Permissions")]
public class Permission : BaseDomainEntity
{
    [StringLength(50)]
    public string PermissionId { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [Required]
    [StringLength(100)]
    public string Category { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Resource { get; set; }

    [StringLength(50)]
    public string? Action { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsSystemPermission { get; set; } = false;
    public DateTime? ModifiedDate { get; set; }

    // Navigation properties
    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

/// <summary>
/// User-Role relationship entity
/// </summary>
[Table("UserRoles")]
public class UserRole : BaseDomainEntity
{
    [Required]
    public long UserId { get; set; }

    [Required]
    public long RoleId { get; set; }

    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiryDate { get; set; }

    [StringLength(100)]
    public string? AssignedBy { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Role Role { get; set; } = null!;
}

/// <summary>
/// Role-Permission relationship entity
/// </summary>
[Table("RolePermissions")]
public class RolePermission : BaseDomainEntity
{
    [Required]
    public long RoleId { get; set; }

    [Required]
    public long PermissionId { get; set; }

    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;

    [StringLength(100)]
    public string? AssignedBy { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual Role Role { get; set; } = null!;
    public virtual Permission Permission { get; set; } = null!;
}

/// <summary>
/// Refresh token entity for JWT token management
/// </summary>
[Table("RefreshTokens")]
public class RefreshToken : BaseDomainEntity
{
    [Required]
    public long UserId { get; set; }

    [Required]
    [StringLength(255)]
    public string Token { get; set; } = string.Empty;

    [Required]
    public DateTime ExpiryDate { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsRevoked { get; set; } = false;

    [StringLength(45)]
    public string? CreatedByIp { get; set; }

    [StringLength(45)]
    public string? IpAddress { get; set; }

    [StringLength(500)]
    public string? UserAgent { get; set; }

    public DateTime? RevokedDate { get; set; }
    public DateTime? RevokedAt { get; set; }

    [StringLength(45)]
    public string? RevokedByIp { get; set; }

    [StringLength(100)]
    public string? RevokedBy { get; set; }

    [StringLength(255)]
    public string? ReplacedByToken { get; set; }

    [StringLength(500)]
    public string? ReasonRevoked { get; set; }

    [StringLength(500)]
    public string? RevokedReason { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;

    [NotMapped]
    public bool IsExpired => DateTime.UtcNow >= ExpiryDate;

    [NotMapped]
    public bool IsActive => !IsRevoked && !IsExpired;
}

/// <summary>
/// User password history entity for password policy enforcement
/// </summary>
[Table("UserPasswords")]
public class UserPassword : BaseDomainEntity
{
    [Required]
    public long UserId { get; set; }

    [Required]
    [StringLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    [StringLength(255)]
    public string? PasswordSalt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual User User { get; set; } = null!;
}

/// <summary>
/// Audit action enumeration
/// </summary>
public enum AuditAction
{
    Create,
    Update,
    Delete,
    Login,
    Logout,
    PasswordChange,
    PermissionChange,
    ConfigurationChange,
    SystemEvent
}
