using Microsoft.AspNetCore.Mvc;
using GAIming.Core.Common;

namespace GAIming.Api.Services;

/// <summary>
/// Service for creating standardized API responses
/// </summary>
public interface IApiResponseService
{
    /// <summary>
    /// Creates a success response
    /// </summary>
    ActionResult<T> Success<T>(T data);

    /// <summary>
    /// Creates a success response with message
    /// </summary>
    ActionResult<T> Success<T>(T data, string message);

    /// <summary>
    /// Creates an error response
    /// </summary>
    ActionResult Error(Error error);

    /// <summary>
    /// Creates an error response with custom status code
    /// </summary>
    ActionResult Error(Error error, int statusCode);

    /// <summary>
    /// Creates a validation error response
    /// </summary>
    ActionResult ValidationError(Dictionary<string, string[]> errors);

    /// <summary>
    /// Creates a not found response
    /// </summary>
    ActionResult NotFound(string message = "Resource not found");

    /// <summary>
    /// Creates an unauthorized response
    /// </summary>
    ActionResult Unauthorized(string message = "Unauthorized access");

    /// <summary>
    /// Creates a forbidden response
    /// </summary>
    ActionResult Forbidden(string message = "Access forbidden");
}
