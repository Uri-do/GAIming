namespace GAIming.Api.Services;

/// <summary>
/// Service for accessing current user information
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the current user ID
    /// </summary>
    string? UserId { get; }

    /// <summary>
    /// Gets the current username
    /// </summary>
    string? Username { get; }

    /// <summary>
    /// Gets the current user's email
    /// </summary>
    string? Email { get; }

    /// <summary>
    /// Gets the current user's roles
    /// </summary>
    IEnumerable<string> Roles { get; }

    /// <summary>
    /// Checks if the current user is authenticated
    /// </summary>
    bool IsAuthenticated { get; }

    /// <summary>
    /// Checks if the current user has a specific role
    /// </summary>
    bool HasRole(string role);

    /// <summary>
    /// Checks if the current user has any of the specified roles
    /// </summary>
    bool HasAnyRole(params string[] roles);
}
