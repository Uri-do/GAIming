using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using GAIming.Core.Interfaces;
using GAIming.Infrastructure.Data;
using GAIming.Infrastructure.Repositories;

namespace GAIming.Infrastructure;

/// <summary>
/// Infrastructure dependency injection configuration
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Infrastructure services to the service collection
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Add database context
        services.AddDbContext(configuration);

        // Add repositories
        services.AddRepositories();

        // Add caching
        services.AddCaching(configuration);

        // Add working services only
        services.AddWorkingServices();

        return services;
    }

    /// <summary>
    /// Adds database context
    /// </summary>
    private static IServiceCollection AddDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("GAImingConnection");
        
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

        return services;
    }

    /// <summary>
    /// Adds caching services
    /// </summary>
    private static IServiceCollection AddCaching(this IServiceCollection services, IConfiguration configuration)
    {
        // Add memory cache
        services.AddMemoryCache();

        // Add cache service implementation
        services.AddScoped<ICacheService, Services.MemoryCacheService>();

        return services;
    }

    /// <summary>
    /// Adds working services (excluding problematic ones)
    /// </summary>
    private static IServiceCollection AddWorkingServices(this IServiceCollection services)
    {
        // Add only the services that compile successfully
        // TODO: Add other services as they are fixed

        return services;
    }
}
