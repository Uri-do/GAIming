using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using GAIming.Core.Models;
using GAIming.Api.Services;

namespace GAIming.Api.Controllers;

/// <summary>
/// Authentication controller
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly ILogger<AuthController> _logger;
    private readonly IJwtService _jwtService;

    public AuthController(ILogger<AuthController> logger, IJwtService jwtService)
    {
        _logger = logger;
        _jwtService = jwtService;
    }

    /// <summary>
    /// Authenticates a user and returns a JWT token
    /// </summary>
    /// <param name="request">Login request</param>
    /// <returns>Authentication result</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthenticationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthenticationResult>> Login([FromBody] LoginRequest request)
    {
        try
        {
            _logger.LogInformation("Login attempt for user: {Username}", request.Username);

            // Validate input
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Credentials",
                    Detail = "Username and password are required",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            // Get user info based on username
            var userInfo = GetUserInfo(request.Username, request.Password);

            if (userInfo == null)
            {
                _logger.LogWarning("Login failed for user: {Username} - Invalid credentials", request.Username);
                return Unauthorized(new ProblemDetails
                {
                    Title = "Authentication Failed",
                    Detail = "Invalid username or password",
                    Status = StatusCodes.Status401Unauthorized
                });
            }

            // Convert UserInfo to UserDto for JWT generation
            var userDto = new UserDto
            {
                Id = int.Parse(userInfo.UserId),
                UserId = userInfo.UserId,
                Username = userInfo.Username,
                Email = userInfo.Email,
                DisplayName = userInfo.DisplayName,
                FirstName = userInfo.FirstName ?? string.Empty,
                LastName = userInfo.LastName ?? string.Empty,
                IsActive = true,
                EmailConfirmed = true,
                TwoFactorEnabled = false,
                Roles = userInfo.Roles,
                Permissions = userInfo.Permissions
            };

            // Generate real JWT tokens
            var accessToken = _jwtService.GenerateAccessToken(userDto);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var refreshTokenExpiration = DateTime.UtcNow.AddDays(7);

            // Store refresh token
            _jwtService.StoreRefreshToken(userInfo.UserId, refreshToken, refreshTokenExpiration);

            var result = new AuthenticationResult
            {
                IsSuccess = true,
                Token = new JwtToken
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                    RefreshExpiresAt = refreshTokenExpiration,
                    TokenType = "Bearer"
                },
                User = userInfo
            };

            _logger.LogInformation("Login successful for user: {Username} with role: {Role}",
                request.Username, string.Join(", ", userInfo.Roles));
            await Task.CompletedTask;
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for user: {Username}", request.Username);
            return BadRequest(new ProblemDetails
            {
                Title = "Login Error",
                Detail = "An error occurred during login",
                Status = StatusCodes.Status400BadRequest
            });
        }
    }

    /// <summary>
    /// Get user information based on username and password (development implementation)
    /// </summary>
    /// <param name="username">Username</param>
    /// <param name="password">Password</param>
    /// <returns>User information if credentials are valid, null otherwise</returns>
    private UserInfo? GetUserInfo(string username, string password)
    {
        // Development user accounts with different roles and permissions
        var users = new Dictionary<string, (string password, UserInfo userInfo)>
        {
            ["admin"] = ("admin123", new UserInfo
            {
                UserId = "1",
                Username = "admin",
                Email = "admin@gaiming.com",
                DisplayName = "System Administrator",
                FirstName = "Admin",
                LastName = "User",
                Roles = new List<string> { "Admin" },
                Permissions = new List<string>
                {
                    "players.view", "players.manage", "players.export",
                    "analytics.view", "analytics.export",
                    "models.view", "models.manage", "models.deploy", "models.export",
                    "games.view", "games.manage", "games.export",
                    "recommendations.view", "recommendations.manage",
                    "users.read", "users.write", "users.delete", "users.manage",
                    "roles.read", "roles.write", "roles.delete", "roles.manage",
                    "permissions.read", "permissions.write", "permissions.delete", "permissions.manage",
                    "settings.read", "settings.write", "settings.manage",
                    "system.admin"
                }
            }),
            ["manager"] = ("manager", new UserInfo
            {
                UserId = "2",
                Username = "manager",
                Email = "manager@gaiming.com",
                DisplayName = "Gaming Manager",
                FirstName = "Manager",
                LastName = "User",
                Roles = new List<string> { "Manager" },
                Permissions = new List<string>
                {
                    "players.view", "players.export",
                    "analytics.view", "analytics.export",
                    "models.view", "models.export",
                    "games.view", "games.manage",
                    "recommendations.view", "recommendations.manage"
                }
            }),
            ["analyst"] = ("analyst123", new UserInfo
            {
                UserId = "3",
                Username = "analyst",
                Email = "analyst@gaiming.com",
                DisplayName = "Data Analyst",
                FirstName = "Data",
                LastName = "Analyst",
                Roles = new List<string> { "Analyst" },
                Permissions = new List<string>
                {
                    "players.view", "players.export",
                    "analytics.view", "analytics.export",
                    "models.view",
                    "games.view"
                }
            }),
            ["testuser"] = ("testpass123", new UserInfo
            {
                UserId = "4",
                Username = "testuser",
                Email = "testuser@gaiming.com",
                DisplayName = "Test User",
                FirstName = "Test",
                LastName = "User",
                Roles = new List<string> { "User" },
                Permissions = new List<string>
                {
                    "games.view",
                    "recommendations.view"
                }
            })
        };

        if (users.TryGetValue(username.ToLower(), out var user) && user.password == password)
        {
            return user.userInfo;
        }

        return null;
    }

    /// <summary>
    /// Refreshes an access token using a refresh token
    /// </summary>
    /// <param name="request">Refresh token request containing access token and refresh token</param>
    /// <returns>New authentication result</returns>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthenticationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthenticationResult>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            _logger.LogInformation("Token refresh attempt");

            if (string.IsNullOrEmpty(request.RefreshToken) || string.IsNullOrEmpty(request.AccessToken))
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Request",
                    Detail = "Both access token and refresh token are required",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            // Validate the expired access token to get user claims
            var principal = _jwtService.GetPrincipalFromExpiredToken(request.AccessToken);
            if (principal == null)
            {
                return Unauthorized(new ProblemDetails
                {
                    Title = "Invalid Token",
                    Detail = "Invalid access token",
                    Status = StatusCodes.Status401Unauthorized
                });
            }

            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ProblemDetails
                {
                    Title = "Invalid Token",
                    Detail = "Invalid token claims",
                    Status = StatusCodes.Status401Unauthorized
                });
            }

            // Validate refresh token
            if (!_jwtService.ValidateRefreshToken(request.RefreshToken, userId))
            {
                return Unauthorized(new ProblemDetails
                {
                    Title = "Invalid Refresh Token",
                    Detail = "Refresh token is invalid or expired",
                    Status = StatusCodes.Status401Unauthorized
                });
            }

            // Get user info to regenerate token
            var userInfo = GetUserInfoById(userId);
            if (userInfo == null)
            {
                return Unauthorized(new ProblemDetails
                {
                    Title = "User Not Found",
                    Detail = "User associated with token not found",
                    Status = StatusCodes.Status401Unauthorized
                });
            }

            // Convert to UserDto for JWT generation
            var userDto = new UserDto
            {
                Id = int.Parse(userInfo.UserId),
                UserId = userInfo.UserId,
                Username = userInfo.Username,
                Email = userInfo.Email,
                DisplayName = userInfo.DisplayName,
                FirstName = userInfo.FirstName ?? string.Empty,
                LastName = userInfo.LastName ?? string.Empty,
                IsActive = true,
                EmailConfirmed = true,
                TwoFactorEnabled = false,
                Roles = userInfo.Roles,
                Permissions = userInfo.Permissions
            };

            // Generate new tokens
            var newAccessToken = _jwtService.GenerateAccessToken(userDto);
            var newRefreshToken = _jwtService.GenerateRefreshToken();
            var refreshTokenExpiration = DateTime.UtcNow.AddDays(7);

            // Revoke old refresh token and store new one
            _jwtService.RevokeRefreshToken(userId, request.RefreshToken);
            _jwtService.StoreRefreshToken(userId, newRefreshToken, refreshTokenExpiration);

            var result = new AuthenticationResult
            {
                IsSuccess = true,
                Token = new JwtToken
                {
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                    RefreshExpiresAt = refreshTokenExpiration,
                    TokenType = "Bearer"
                },
                User = userInfo
            };

            _logger.LogInformation("Token refresh successful for user: {UserId}", userId);
            await Task.CompletedTask;
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return BadRequest(new ProblemDetails
            {
                Title = "Token Refresh Error",
                Detail = "An error occurred during token refresh",
                Status = StatusCodes.Status400BadRequest
            });
        }
    }

    /// <summary>
    /// Logs out the current user (mock implementation)
    /// </summary>
    /// <returns>Success result</returns>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        try
        {
            _logger.LogInformation("Mock user logout");

            // In production, invalidate the token/session
            await Task.CompletedTask;

            return Ok(new {
                message = "Logged out successfully",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during mock logout");
            return BadRequest(new ProblemDetails
            {
                Title = "Logout Error",
                Detail = "An error occurred during logout",
                Status = StatusCodes.Status400BadRequest
            });
        }
    }

    /// <summary>
    /// Gets the current user information
    /// </summary>
    /// <returns>Current user information</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserInfo), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserInfo>> GetCurrentUser()
    {
        try
        {
            // Extract user ID from JWT token claims
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ProblemDetails
                {
                    Title = "Unauthorized",
                    Detail = "Invalid token claims",
                    Status = StatusCodes.Status401Unauthorized
                });
            }

            var userInfo = GetUserInfoById(userId);
            if (userInfo == null)
            {
                return Unauthorized(new ProblemDetails
                {
                    Title = "Unauthorized",
                    Detail = "User not found",
                    Status = StatusCodes.Status401Unauthorized
                });
            }

            _logger.LogInformation("User info retrieved for user: {Username}", userInfo.Username);
            await Task.CompletedTask;
            return Ok(userInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return BadRequest(new ProblemDetails
            {
                Title = "User Info Error",
                Detail = "An error occurred while getting user information",
                Status = StatusCodes.Status400BadRequest
            });
        }
    }

    /// <summary>
    /// Get user information by user ID
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>User information if found, null otherwise</returns>
    private UserInfo? GetUserInfoById(string userId)
    {
        // Mock user lookup by ID
        var users = new Dictionary<string, UserInfo>
        {
            ["1"] = new UserInfo
            {
                UserId = "1",
                Username = "admin",
                Email = "admin@gaiming.com",
                DisplayName = "System Administrator",
                FirstName = "Admin",
                LastName = "User",
                Roles = new List<string> { "Admin" },
                Permissions = new List<string>
                {
                    "players.view", "players.manage", "players.export",
                    "analytics.view", "analytics.export",
                    "models.view", "models.manage", "models.deploy", "models.export",
                    "games.view", "games.manage", "games.export",
                    "recommendations.view", "recommendations.manage",
                    "users.read", "users.write", "users.delete", "users.manage",
                    "roles.read", "roles.write", "roles.delete", "roles.manage",
                    "permissions.read", "permissions.write", "permissions.delete", "permissions.manage",
                    "settings.read", "settings.write", "settings.manage",
                    "system.admin"
                }
            },
            ["2"] = new UserInfo
            {
                UserId = "2",
                Username = "manager",
                Email = "manager@gaiming.com",
                DisplayName = "Gaming Manager",
                FirstName = "Manager",
                LastName = "User",
                Roles = new List<string> { "Manager" },
                Permissions = new List<string>
                {
                    "players.view", "players.export",
                    "analytics.view", "analytics.export",
                    "models.view", "models.export",
                    "games.view", "games.manage",
                    "recommendations.view", "recommendations.manage"
                }
            },
            ["3"] = new UserInfo
            {
                UserId = "3",
                Username = "analyst",
                Email = "analyst@gaiming.com",
                DisplayName = "Data Analyst",
                FirstName = "Data",
                LastName = "Analyst",
                Roles = new List<string> { "Analyst" },
                Permissions = new List<string>
                {
                    "players.view", "players.export",
                    "analytics.view", "analytics.export",
                    "models.view",
                    "games.view"
                }
            },
            ["4"] = new UserInfo
            {
                UserId = "4",
                Username = "testuser",
                Email = "testuser@gaiming.com",
                DisplayName = "Test User",
                FirstName = "Test",
                LastName = "User",
                Roles = new List<string> { "User" },
                Permissions = new List<string>
                {
                    "games.view",
                    "recommendations.view"
                }
            }
        };

        return users.TryGetValue(userId, out var user) ? user : null;
    }

}
