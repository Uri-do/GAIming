using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace GAIming.Api.Filters;

/// <summary>
/// Validation filter for handling model validation
/// </summary>
public class ValidationFilter : IActionFilter
{
    /// <summary>
    /// Called before the action executes
    /// </summary>
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            var errors = context.ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                );

            var problemDetails = new ValidationProblemDetails(errors)
            {
                Title = "One or more validation errors occurred",
                Status = StatusCodes.Status422UnprocessableEntity,
                Instance = context.HttpContext.Request.Path
            };

            problemDetails.Extensions["timestamp"] = DateTime.UtcNow;
            problemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;

            context.Result = new UnprocessableEntityObjectResult(problemDetails);
        }
    }

    /// <summary>
    /// Called after the action executes
    /// </summary>
    public void OnActionExecuted(ActionExecutedContext context)
    {
        // No implementation needed
    }
}
