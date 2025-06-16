using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using GAIming.Core.Common;

namespace GAIming.Api.Filters;

/// <summary>
/// Global exception filter for handling unhandled exceptions
/// </summary>
public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;

    /// <summary>
    /// Initializes a new instance of the GlobalExceptionFilter
    /// </summary>
    public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Called when an exception occurs
    /// </summary>
    public void OnException(ExceptionContext context)
    {
        _logger.LogError(context.Exception, "Unhandled exception occurred");

        var problemDetails = new ProblemDetails
        {
            Title = "An error occurred",
            Detail = "An unexpected error occurred while processing your request",
            Status = StatusCodes.Status500InternalServerError,
            Instance = context.HttpContext.Request.Path
        };

        problemDetails.Extensions["timestamp"] = DateTime.UtcNow;
        problemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;

        context.Result = new ObjectResult(problemDetails)
        {
            StatusCode = StatusCodes.Status500InternalServerError
        };

        context.ExceptionHandled = true;
    }
}
