using Microsoft.AspNetCore.Mvc;
using GAIming.Core.Common;

namespace GAIming.Api.Services;

/// <summary>
/// Implementation of API response service
/// </summary>
public class ApiResponseService : IApiResponseService
{
    /// <summary>
    /// Creates a success response
    /// </summary>
    public ActionResult<T> Success<T>(T data)
    {
        return new OkObjectResult(data);
    }

    /// <summary>
    /// Creates a success response with message
    /// </summary>
    public ActionResult<T> Success<T>(T data, string message)
    {
        var response = new
        {
            Data = data,
            Message = message,
            Success = true
        };
        return new OkObjectResult(response);
    }

    /// <summary>
    /// Creates an error response
    /// </summary>
    public ActionResult Error(Error error)
    {
        var statusCode = error.ToHttpStatusCode();
        return Error(error, statusCode);
    }

    /// <summary>
    /// Creates an error response with custom status code
    /// </summary>
    public ActionResult Error(Error error, int statusCode)
    {
        var problemDetails = new ProblemDetails
        {
            Title = GetErrorTitle(error.Type),
            Detail = error.Message,
            Status = statusCode,
            Type = GetErrorType(error.Type)
        };

        problemDetails.Extensions["errorCode"] = error.Code;
        problemDetails.Extensions["timestamp"] = DateTime.UtcNow;

        return new ObjectResult(problemDetails) { StatusCode = statusCode };
    }

    /// <summary>
    /// Creates a validation error response
    /// </summary>
    public ActionResult ValidationError(Dictionary<string, string[]> errors)
    {
        var problemDetails = new ValidationProblemDetails(errors)
        {
            Title = "One or more validation errors occurred",
            Status = StatusCodes.Status422UnprocessableEntity
        };

        problemDetails.Extensions["timestamp"] = DateTime.UtcNow;

        return new UnprocessableEntityObjectResult(problemDetails);
    }

    /// <summary>
    /// Creates a not found response
    /// </summary>
    public ActionResult NotFound(string message = "Resource not found")
    {
        var problemDetails = new ProblemDetails
        {
            Title = "Not Found",
            Detail = message,
            Status = StatusCodes.Status404NotFound
        };

        return new NotFoundObjectResult(problemDetails);
    }

    /// <summary>
    /// Creates an unauthorized response
    /// </summary>
    public ActionResult Unauthorized(string message = "Unauthorized access")
    {
        var problemDetails = new ProblemDetails
        {
            Title = "Unauthorized",
            Detail = message,
            Status = StatusCodes.Status401Unauthorized
        };

        return new UnauthorizedObjectResult(problemDetails);
    }

    /// <summary>
    /// Creates a forbidden response
    /// </summary>
    public ActionResult Forbidden(string message = "Access forbidden")
    {
        var problemDetails = new ProblemDetails
        {
            Title = "Forbidden",
            Detail = message,
            Status = StatusCodes.Status403Forbidden
        };

        return new ObjectResult(problemDetails) { StatusCode = StatusCodes.Status403Forbidden };
    }

    private static string GetErrorTitle(ErrorType errorType)
    {
        return errorType switch
        {
            ErrorType.Validation => "Validation Error",
            ErrorType.NotFound => "Resource Not Found",
            ErrorType.Conflict => "Conflict",
            ErrorType.Unauthorized => "Unauthorized",
            ErrorType.Forbidden => "Forbidden",
            ErrorType.BusinessRule => "Business Rule Violation",
            ErrorType.External => "External Service Error",
            ErrorType.Critical => "Critical Error",
            _ => "An Error Occurred"
        };
    }

    private static string GetErrorType(ErrorType errorType)
    {
        return errorType switch
        {
            ErrorType.Validation => "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            ErrorType.NotFound => "https://tools.ietf.org/html/rfc7231#section-6.5.4",
            ErrorType.Conflict => "https://tools.ietf.org/html/rfc7231#section-6.5.8",
            ErrorType.Unauthorized => "https://tools.ietf.org/html/rfc7235#section-3.1",
            ErrorType.Forbidden => "https://tools.ietf.org/html/rfc7231#section-6.5.3",
            ErrorType.BusinessRule => "https://tools.ietf.org/html/rfc4918#section-11.2",
            _ => "https://tools.ietf.org/html/rfc7231#section-6.6.1"
        };
    }
}
