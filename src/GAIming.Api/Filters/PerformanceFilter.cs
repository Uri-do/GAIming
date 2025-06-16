using Microsoft.AspNetCore.Mvc.Filters;
using System.Diagnostics;

namespace GAIming.Api.Filters;

/// <summary>
/// Performance filter for monitoring action execution time
/// </summary>
public class PerformanceFilter : IActionFilter
{
    private readonly ILogger<PerformanceFilter> _logger;
    private const int SlowRequestThresholdMs = 1000;

    /// <summary>
    /// Initializes a new instance of the PerformanceFilter
    /// </summary>
    public PerformanceFilter(ILogger<PerformanceFilter> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Called before the action executes
    /// </summary>
    public void OnActionExecuting(ActionExecutingContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        context.HttpContext.Items["Stopwatch"] = stopwatch;
    }

    /// <summary>
    /// Called after the action executes
    /// </summary>
    public void OnActionExecuted(ActionExecutedContext context)
    {
        if (context.HttpContext.Items["Stopwatch"] is Stopwatch stopwatch)
        {
            stopwatch.Stop();
            var elapsedMs = stopwatch.ElapsedMilliseconds;

            if (elapsedMs > SlowRequestThresholdMs)
            {
                _logger.LogWarning("Slow request detected: {Action} took {ElapsedMs}ms", 
                    context.ActionDescriptor.DisplayName, elapsedMs);
            }

            _logger.LogDebug("Action {Action} completed in {ElapsedMs}ms", 
                context.ActionDescriptor.DisplayName, elapsedMs);
        }
    }
}
