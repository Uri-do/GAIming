using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GAIming.Core.Models;
using System.Text.Json;
using GAIming.Api.Authorization;

namespace GAIming.Api.Controllers;

/// <summary>
/// Controller for system settings management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] // Require Admin role for settings management
public class SettingsController : ControllerBase
{
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(ILogger<SettingsController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Gets all system settings
    /// </summary>
    /// <returns>System settings</returns>
    [HttpGet]
    [RequirePermission("settings.read")]
    [ProducesResponseType(typeof(SystemSettingsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SystemSettingsDto>> GetSettings()
    {
        try
        {
            _logger.LogInformation("Getting system settings");

            await Task.Delay(50);

            var settings = new SystemSettingsDto
            {
                General = new GeneralSettingsDto
                {
                    SystemName = "GAIming Recommendation System",
                    SystemDescription = "AI-powered game recommendation platform",
                    DefaultLanguage = "en-US",
                    DefaultTimezone = "UTC",
                    MaintenanceMode = false,
                    MaintenanceMessage = "",
                    LogLevel = "Information",
                    SessionTimeout = 480, // 8 hours
                    MaxConcurrentSessions = 3
                },
                Recommendation = new RecommendationSettingsDto
                {
                    DefaultAlgorithm = "hybrid",
                    MaxRecommendations = 10,
                    MinConfidenceScore = 0.5,
                    EnableABTesting = true,
                    CacheExpirationMinutes = 30,
                    RealTimeUpdates = true,
                    PersonalizationEnabled = true,
                    DiversityWeight = 0.3,
                    PopularityWeight = 0.2,
                    RecencyWeight = 0.1
                },
                Analytics = new AnalyticsSettingsDto
                {
                    EnableTracking = true,
                    DataRetentionDays = 365,
                    RealTimeAnalytics = true,
                    ExportFormats = new[] { "CSV", "Excel", "JSON" },
                    AutoReportGeneration = true,
                    ReportSchedule = "daily",
                    MetricsRefreshInterval = 300, // 5 minutes
                    EnablePredictiveAnalytics = true
                },
                Security = new SecuritySettingsDto
                {
                    RequireHttps = true,
                    EnableTwoFactor = false,
                    PasswordMinLength = 8,
                    PasswordRequireUppercase = true,
                    PasswordRequireLowercase = true,
                    PasswordRequireNumbers = true,
                    PasswordRequireSpecialChars = true,
                    MaxLoginAttempts = 5,
                    LockoutDurationMinutes = 15,
                    JwtExpirationMinutes = 60,
                    RefreshTokenExpirationDays = 7,
                    EnableAuditLogging = true,
                    AuditLogRetentionDays = 90
                },
                Performance = new PerformanceSettingsDto
                {
                    EnableCaching = true,
                    CacheExpirationMinutes = 60,
                    MaxConcurrentRequests = 1000,
                    RequestTimeoutSeconds = 30,
                    EnableCompression = true,
                    EnableRateLimiting = true,
                    RateLimitRequests = 1000,
                    RateLimitWindowMinutes = 60,
                    DatabaseConnectionPoolSize = 100,
                    EnableQueryOptimization = true
                },
                Notifications = new NotificationSettingsDto
                {
                    EnableEmailNotifications = true,
                    EnableSmsNotifications = false,
                    EnablePushNotifications = true,
                    SmtpServer = "smtp.gaiming.com",
                    SmtpPort = 587,
                    SmtpUsername = "notifications@gaiming.com",
                    SmtpUseSsl = true,
                    DefaultFromEmail = "noreply@gaiming.com",
                    DefaultFromName = "GAIming System"
                }
            };

            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system settings");
            return StatusCode(500, "An error occurred while getting system settings");
        }
    }

    /// <summary>
    /// Updates system settings
    /// </summary>
    /// <param name="settings">Updated settings</param>
    /// <returns>Updated settings</returns>
    [HttpPut]
    [RequirePermission("settings.write")]
    [ProducesResponseType(typeof(SystemSettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SystemSettingsDto>> UpdateSettings([FromBody] SystemSettingsDto settings)
    {
        try
        {
            _logger.LogInformation("Updating system settings");

            if (settings == null)
            {
                return BadRequest("Settings are required");
            }

            await Task.Delay(100);

            // Mock update - in real implementation, this would save to database
            _logger.LogInformation("Settings updated successfully");

            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating system settings");
            return StatusCode(500, "An error occurred while updating system settings");
        }
    }

    /// <summary>
    /// Gets specific setting category
    /// </summary>
    /// <param name="category">Setting category (general, recommendation, analytics, security, performance, notifications)</param>
    /// <returns>Category settings</returns>
    [HttpGet("{category}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<object>> GetSettingCategory(string category)
    {
        try
        {
            _logger.LogInformation("Getting settings for category: {Category}", category);

            await Task.Delay(25);

            var allSettings = await GetSettings();
            if (allSettings.Result is OkObjectResult okResult && okResult.Value is SystemSettingsDto systemSettings)
            {
                object? categorySettings = category.ToLower() switch
                {
                    "general" => systemSettings.General,
                    "recommendation" => systemSettings.Recommendation,
                    "analytics" => systemSettings.Analytics,
                    "security" => systemSettings.Security,
                    "performance" => systemSettings.Performance,
                    "notifications" => systemSettings.Notifications,
                    _ => null
                };

                if (categorySettings == null)
                {
                    return NotFound($"Settings category '{category}' not found");
                }

                return Ok(categorySettings);
            }

            return StatusCode(500, "Error retrieving settings");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting settings for category: {Category}", category);
            return StatusCode(500, "An error occurred while getting category settings");
        }
    }

    /// <summary>
    /// Updates specific setting category
    /// </summary>
    /// <param name="category">Setting category</param>
    /// <param name="settings">Category settings</param>
    /// <returns>Updated category settings</returns>
    [HttpPut("{category}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<object>> UpdateSettingCategory(string category, [FromBody] object settings)
    {
        try
        {
            _logger.LogInformation("Updating settings for category: {Category}", category);

            if (settings == null)
            {
                return BadRequest("Settings are required");
            }

            var validCategories = new[] { "general", "recommendation", "analytics", "security", "performance", "notifications" };
            if (!validCategories.Contains(category.ToLower()))
            {
                return NotFound($"Settings category '{category}' not found");
            }

            await Task.Delay(75);

            // Mock update
            _logger.LogInformation("Category settings updated successfully: {Category}", category);

            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating settings for category: {Category}", category);
            return StatusCode(500, "An error occurred while updating category settings");
        }
    }

    /// <summary>
    /// Resets settings to default values
    /// </summary>
    /// <param name="category">Optional category to reset (if not provided, resets all)</param>
    /// <returns>Reset confirmation</returns>
    [HttpPost("reset")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult<object>> ResetSettings([FromQuery] string? category = null)
    {
        try
        {
            _logger.LogInformation("Resetting settings - Category: {Category}", category ?? "all");

            await Task.Delay(100);

            var message = string.IsNullOrEmpty(category) 
                ? "All settings have been reset to default values"
                : $"Settings for category '{category}' have been reset to default values";

            return Ok(new { message, resetAt = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting settings");
            return StatusCode(500, "An error occurred while resetting settings");
        }
    }

    /// <summary>
    /// Exports current settings
    /// </summary>
    /// <param name="format">Export format (json, xml)</param>
    /// <returns>Settings export file</returns>
    [HttpGet("export")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportSettings([FromQuery] string format = "json")
    {
        try
        {
            _logger.LogInformation("Exporting settings in format: {Format}", format);

            var settingsResult = await GetSettings();
            if (settingsResult.Result is OkObjectResult okResult && okResult.Value is SystemSettingsDto settings)
            {
                var fileName = $"gaiming-settings-{DateTime.UtcNow:yyyyMMdd-HHmmss}";
                var contentType = "application/json";
                var content = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = true });

                if (format.ToLower() == "xml")
                {
                    contentType = "application/xml";
                    fileName += ".xml";
                    // In a real implementation, you would convert to XML here
                }
                else
                {
                    fileName += ".json";
                }

                var bytes = System.Text.Encoding.UTF8.GetBytes(content);
                return File(bytes, contentType, fileName);
            }

            return StatusCode(500, "Error retrieving settings for export");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting settings");
            return StatusCode(500, "An error occurred while exporting settings");
        }
    }
}
