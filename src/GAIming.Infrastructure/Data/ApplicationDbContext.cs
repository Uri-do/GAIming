using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using GAIming.Core.Entities;
using System.Reflection;

namespace GAIming.Infrastructure.Data;

/// <summary>
/// Main application database context
/// </summary>
public class ApplicationDbContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of the ApplicationDbContext
    /// </summary>
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Domain entities
    /// <summary>
    /// DomainEntities table
    /// </summary>
    public DbSet<DomainEntity> DomainEntities { get; set; } = null!;

    /// <summary>
    /// DomainEntity items table
    /// </summary>
    public DbSet<DomainEntityItem> DomainEntityItems { get; set; } = null!;

    /// <summary>
    /// Audit logs table
    /// </summary>
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;

    // Authentication entities
    /// <summary>
    /// Users table
    /// </summary>
    public DbSet<User> Users { get; set; } = null!;

    /// <summary>
    /// Roles table
    /// </summary>
    public DbSet<Role> Roles { get; set; } = null!;

    /// <summary>
    /// Permissions table
    /// </summary>
    public DbSet<Permission> Permissions { get; set; } = null!;

    /// <summary>
    /// User roles junction table
    /// </summary>
    public DbSet<UserRole> UserRoles { get; set; } = null!;

    /// <summary>
    /// Role permissions junction table
    /// </summary>
    public DbSet<RolePermission> RolePermissions { get; set; } = null!;

    /// <summary>
    /// Refresh tokens table
    /// </summary>
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    /// <summary>
    /// User password history table
    /// </summary>
    public DbSet<UserPassword> UserPasswords { get; set; } = null!;

    // ProgressPlay entities (from existing database)
    /// <summary>
    /// Players table (from ProgressPlay DB)
    /// </summary>
    public DbSet<Player> Players { get; set; } = null!;

    /// <summary>
    /// Games table (from ProgressPlay DB)
    /// </summary>
    public DbSet<Game> Games { get; set; } = null!;

    /// <summary>
    /// Played games table (from ProgressPlay DB)
    /// </summary>
    public DbSet<PlayedGame> PlayedGames { get; set; } = null!;

    /// <summary>
    /// Game providers table (from ProgressPlay DB)
    /// </summary>
    public DbSet<GameProvider> GameProviders { get; set; } = null!;

    /// <summary>
    /// Game types table (from ProgressPlay DB)
    /// </summary>
    public DbSet<GameType> GameTypes { get; set; } = null!;

    // GAIming specific entities
    /// <summary>
    /// Game recommendations table
    /// </summary>
    public DbSet<GameRecommendation> GameRecommendations { get; set; } = null!;

    /// <summary>
    /// Player features table
    /// </summary>
    public DbSet<PlayerFeatureEntity> PlayerFeatures { get; set; } = null!;

    /// <summary>
    /// Game features table
    /// </summary>
    public DbSet<GameFeatureEntity> GameFeatures { get; set; } = null!;

    /// <summary>
    /// Recommendation models table
    /// </summary>
    public DbSet<RecommendationModel> RecommendationModels { get; set; } = null!;

    /// <summary>
    /// A/B test experiments table
    /// </summary>
    public DbSet<ABTestExperiment> ABTestExperiments { get; set; } = null!;

    /// <summary>
    /// Recommendation interactions table
    /// </summary>
    public DbSet<RecommendationInteraction> RecommendationInteractions { get; set; } = null!;

    /// <summary>
    /// Model performance metrics table
    /// </summary>
    public DbSet<ModelPerformanceMetric> ModelPerformanceMetrics { get; set; } = null!;

    /// <summary>
    /// Player risk assessments table
    /// </summary>
    public DbSet<PlayerRiskAssessmentEntity> PlayerRiskAssessments { get; set; } = null!;

    /// <summary>
    /// Game management settings table
    /// </summary>
    public DbSet<GameManagementSettings> GameManagementSettings { get; set; } = null!;

    /// <summary>
    /// System configurations table
    /// </summary>
    public DbSet<SystemConfiguration> SystemConfigurations { get; set; } = null!;

    /// <summary>
    /// Scheduled tasks table
    /// </summary>
    public DbSet<ScheduledTask> ScheduledTasks { get; set; } = null!;

    /// <summary>
    /// System notifications table
    /// </summary>
    public DbSet<SystemNotification> SystemNotifications { get; set; } = null!;

    /// <summary>
    /// Configures the model
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from the current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Configure entity relationships and constraints
        ConfigureEntityRelationships(modelBuilder);

        // Configure indexes
        ConfigureIndexes(modelBuilder);

        // Configure default values
        ConfigureDefaults(modelBuilder);
    }

    /// <summary>
    /// Configures entity relationships
    /// </summary>
    private static void ConfigureEntityRelationships(ModelBuilder modelBuilder)
    {
        // DomainEntity -> DomainEntityItems (One-to-Many)
        modelBuilder.Entity<DomainEntity>()
            .HasMany(e => e.Items)
            .WithOne(i => i.DomainEntity)
            .HasForeignKey(i => i.DomainEntityId)
            .OnDelete(DeleteBehavior.Cascade);

        // User -> UserRoles (One-to-Many)
        modelBuilder.Entity<User>()
            .HasMany(u => u.UserRoles)
            .WithOne(ur => ur.User)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Role -> UserRoles (One-to-Many)
        modelBuilder.Entity<Role>()
            .HasMany(r => r.UserRoles)
            .WithOne(ur => ur.Role)
            .HasForeignKey(ur => ur.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        // Role -> RolePermissions (One-to-Many)
        modelBuilder.Entity<Role>()
            .HasMany(r => r.RolePermissions)
            .WithOne(rp => rp.Role)
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        // Permission -> RolePermissions (One-to-Many)
        modelBuilder.Entity<Permission>()
            .HasMany(p => p.RolePermissions)
            .WithOne(rp => rp.Permission)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        // User -> RefreshTokens (One-to-Many)
        modelBuilder.Entity<User>()
            .HasMany(u => u.RefreshTokens)
            .WithOne(rt => rt.User)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure composite keys
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        modelBuilder.Entity<RolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });
    }

    /// <summary>
    /// Configures database indexes
    /// </summary>
    private static void ConfigureIndexes(ModelBuilder modelBuilder)
    {
        // DomainEntity indexes
        modelBuilder.Entity<DomainEntity>()
            .HasIndex(e => e.Name)
            .HasDatabaseName("IX_DomainEntities_Name");

        modelBuilder.Entity<DomainEntity>()
            .HasIndex(e => e.IsActive)
            .HasDatabaseName("IX_DomainEntities_IsActive");

        // User indexes
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique()
            .HasDatabaseName("IX_Users_Username");

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("IX_Users_Email");

        // Role indexes
        modelBuilder.Entity<Role>()
            .HasIndex(r => r.Name)
            .IsUnique()
            .HasDatabaseName("IX_Roles_Name");

        // Permission indexes
        modelBuilder.Entity<Permission>()
            .HasIndex(p => p.Name)
            .IsUnique()
            .HasDatabaseName("IX_Permissions_Name");

        // RefreshToken indexes
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.Token)
            .IsUnique()
            .HasDatabaseName("IX_RefreshTokens_Token");

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.UserId)
            .HasDatabaseName("IX_RefreshTokens_UserId");
    }

    /// <summary>
    /// Configures default values
    /// </summary>
    private static void ConfigureDefaults(ModelBuilder modelBuilder)
    {
        // DomainEntity defaults
        modelBuilder.Entity<DomainEntity>()
            .Property(e => e.CreatedDate)
            .HasDefaultValueSql("SYSUTCDATETIME()");

        modelBuilder.Entity<DomainEntity>()
            .Property(e => e.IsActive)
            .HasDefaultValue(true);

        // User defaults
        modelBuilder.Entity<User>()
            .Property(u => u.CreatedDate)
            .HasDefaultValueSql("SYSUTCDATETIME()");

        modelBuilder.Entity<User>()
            .Property(u => u.IsActive)
            .HasDefaultValue(true);

        modelBuilder.Entity<User>()
            .Property(u => u.EmailConfirmed)
            .HasDefaultValue(false);

        // Role defaults
        modelBuilder.Entity<Role>()
            .Property(r => r.CreatedDate)
            .HasDefaultValueSql("SYSUTCDATETIME()");

        modelBuilder.Entity<Role>()
            .Property(r => r.IsActive)
            .HasDefaultValue(true);

        // Permission defaults
        modelBuilder.Entity<Permission>()
            .Property(p => p.CreatedDate)
            .HasDefaultValueSql("SYSUTCDATETIME()");

        modelBuilder.Entity<Permission>()
            .Property(p => p.IsActive)
            .HasDefaultValue(true);

        // RefreshToken defaults
        modelBuilder.Entity<RefreshToken>()
            .Property(rt => rt.CreatedDate)
            .HasDefaultValueSql("SYSUTCDATETIME()");
    }

    /// <summary>
    /// Saves changes with automatic audit logging
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Update timestamps before saving
        UpdateTimestamps();

        var result = await base.SaveChangesAsync(cancellationToken);

        return result;
    }

    /// <summary>
    /// Updates timestamps for entities
    /// </summary>
    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Entity is DomainEntity entity)
            {
                if (entry.State == EntityState.Added)
                {
                    entity.CreatedDate = DateTime.UtcNow;
                }
                entity.ModifiedDate = DateTime.UtcNow;
            }
            else if (entry.Entity is User user)
            {
                if (entry.State == EntityState.Added)
                {
                    user.CreatedDate = DateTime.UtcNow;
                }
                user.ModifiedDate = DateTime.UtcNow;
            }
        }
    }
}
