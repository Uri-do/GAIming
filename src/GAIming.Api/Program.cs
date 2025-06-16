using Serilog;
using GAIming.Core.Interfaces;
using GAIming.Api.Services;
using GAIming.Api.Authorization;
using Microsoft.AspNetCore.Authorization;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .Enrich.FromLogContext()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting GAIming API (Standalone Mode)");

    var builder = WebApplication.CreateBuilder(args);

    // Add Serilog
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day));

    // Add services to the container
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "GAIming API",
            Version = "v1",
            Description = "Game AI Recommendation System API - Standalone Mode"
        });
    });

    // Add CORS for development
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "https://localhost:3000", "https://localhost:3001")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    });

    // Register mock recommendation services
    builder.Services.AddScoped<IRealTimeRecommendationService, MockRealTimeRecommendationService>();
    builder.Services.AddScoped<IBatchRecommendationService, MockBatchRecommendationService>();
    builder.Services.AddScoped<ICollaborativeFilteringService, MockCollaborativeFilteringService>();
    builder.Services.AddScoped<IContentBasedFilteringService, MockContentBasedFilteringService>();
    builder.Services.AddScoped<IHybridRecommendationService, MockHybridRecommendationService>();
    builder.Services.AddScoped<IBanditRecommendationService, MockBanditRecommendationService>();

    // Register mock repositories and services
    builder.Services.AddScoped<IGameRepository, MockGameRepository>();

    // Register JWT service
    builder.Services.AddScoped<IJwtService, JwtService>();

    // Add authentication and authorization services
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    var secretKey = jwtSettings["SecretKey"] ?? "GAIming-Super-Secret-Key-For-Development-Only-2024!";
    var issuer = jwtSettings["Issuer"] ?? "GAIming.Api";
    var audience = jwtSettings["Audience"] ?? "GAIming.Client";

    builder.Services.AddAuthentication("Bearer")
        .AddJwtBearer("Bearer", options =>
        {
            options.RequireHttpsMetadata = false; // Set to true in production
            options.SaveToken = true;
            options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                    System.Text.Encoding.UTF8.GetBytes(secretKey)),
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = audience,
                ValidateLifetime = true,
                RequireExpirationTime = true,
                ClockSkew = TimeSpan.FromMinutes(5)
            };
        });

    // Add authorization with permission policies
    builder.Services.AddAuthorization(options =>
    {
        // Define permission-based policies
        var permissions = new[]
        {
            "users.read", "users.write", "users.delete", "users.manage",
            "roles.read", "roles.write", "roles.delete", "roles.manage",
            "permissions.read", "permissions.write", "permissions.delete", "permissions.manage",
            "settings.read", "settings.write", "settings.manage",
            "players.view", "players.manage", "players.export",
            "analytics.view", "analytics.export",
            "models.view", "models.manage", "models.deploy", "models.export",
            "games.view", "games.manage", "games.export",
            "recommendations.view", "recommendations.manage",
            "system.admin"
        };

        foreach (var permission in permissions)
        {
            options.AddPolicy($"Permission.{permission}", policy =>
                policy.Requirements.Add(new PermissionRequirement(permission)));
        }
    });

    // Register authorization handler
    builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

    // Database context temporarily disabled until Infrastructure is fixed
    // var connectionString = builder.Configuration.GetConnectionString("GAImingConnection");

    var app = builder.Build();

    // Configure the HTTP request pipeline
    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "GAIming API V1");
            c.RoutePrefix = "swagger";
        });
    }

    // Disable HTTPS redirection for development to avoid CORS preflight issues
    // app.UseHttpsRedirection();
    app.UseCors("AllowAll");
    app.UseRouting();

    // Add authentication and authorization middleware
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    // Add a simple test endpoint
    app.MapGet("/", () => new
    {
        Message = "🎮 GAIming API is running!",
        Status = "Healthy",
        Timestamp = DateTime.UtcNow,
        Version = "1.0.0",
        Mode = "Standalone"
    });

    Log.Information("GAIming API started successfully in standalone mode");
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "GAIming API terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
