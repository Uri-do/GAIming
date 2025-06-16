using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using GAIming.Core.Interfaces;
using GAIming.Infrastructure.Data;
using GAIming.Infrastructure.Repositories;
using GAIming.Infrastructure.Services;

namespace GAIming.Infrastructure;

/// <summary>
/// Minimal Infrastructure dependency injection configuration
/// </summary>
public static class MinimalDependencyInjection
{
    /// <summary>
    /// Adds minimal Infrastructure services to the service collection
    /// </summary>
    public static IServiceCollection AddMinimalInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Add database context
        services.AddDbContext(configuration);

        // Add repositories
        services.AddRepositories();

        // Add caching
        services.AddCaching();

        return services;
    }

    /// <summary>
    /// Adds database context
    /// </summary>
    private static IServiceCollection AddDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("GAImingConnection");
        
        if (!string.IsNullOrEmpty(connectionString))
        {
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null);
                    sqlOptions.CommandTimeout(30);
                });

                // Enable sensitive data logging in development
                if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
                {
                    options.EnableSensitiveDataLogging();
                    options.EnableDetailedErrors();
                }
            });
        }

        return services;
    }

    /// <summary>
    /// Adds repository services
    /// </summary>
    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        // Register Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Register generic repository
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        // Register specific repositories
        services.AddScoped<IDomainEntityRepository, DomainEntityRepository>();
        services.AddScoped<IAuditRepository, AuditRepository>();

        return services;
    }

    /// <summary>
    /// Adds caching services
    /// </summary>
    private static IServiceCollection AddCaching(this IServiceCollection services)
    {
        // Add memory cache
        services.AddMemoryCache();
        
        // Add cache service implementation
        services.AddScoped<ICacheService, MemoryCacheService>();

        return services;
    }
}
