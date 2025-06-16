using System.Security.Claims;

namespace GAIming.Api.Services;

/// <summary>
/// Implementation of current user service
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    /// <summary>
    /// Initializes a new instance of the CurrentUserService
    /// </summary>
    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    /// <summary>
    /// Gets the current user ID
    /// </summary>
    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                            _httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value ??
                            _httpContextAccessor.HttpContext?.User?.FindFirst("userId")?.Value;

    /// <summary>
    /// Gets the current username
    /// </summary>
    public string? Username => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value ??
                              _httpContextAccessor.HttpContext?.User?.FindFirst("username")?.Value ??
                              _httpContextAccessor.HttpContext?.User?.FindFirst("preferred_username")?.Value;

    /// <summary>
    /// Gets the current user's email
    /// </summary>
    public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value ??
                           _httpContextAccessor.HttpContext?.User?.FindFirst("email")?.Value;

    /// <summary>
    /// Gets the current user's roles
    /// </summary>
    public IEnumerable<string> Roles => _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role)
                                                                              ?.Select(c => c.Value) ?? 
                                        Enumerable.Empty<string>();

    /// <summary>
    /// Checks if the current user is authenticated
    /// </summary>
    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    /// <summary>
    /// Checks if the current user has a specific role
    /// </summary>
    public bool HasRole(string role)
    {
        return _httpContextAccessor.HttpContext?.User?.IsInRole(role) ?? false;
    }

    /// <summary>
    /// Checks if the current user has any of the specified roles
    /// </summary>
    public bool HasAnyRole(params string[] roles)
    {
        return roles.Any(role => HasRole(role));
    }
}
