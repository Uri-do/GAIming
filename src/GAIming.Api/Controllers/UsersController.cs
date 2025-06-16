using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GAIming.Core.Models;
using GAIming.Core.Interfaces;
using GAIming.Api.Authorization;

namespace GAIming.Api.Controllers;

/// <summary>
/// Users controller for user management operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Tags("Users")]
[Authorize(Roles = "Admin")] // Require Admin role for user management
public class UsersController : ControllerBase
{
    private readonly ILogger<UsersController> _logger;

    public UsersController(ILogger<UsersController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Get all users with pagination and filtering
    /// </summary>
    [HttpGet]
    [RequirePermission("users.read")]
    [ProducesResponseType(typeof(PagedResult<UserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<UserDto>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? role = null)
    {
        try
        {
            _logger.LogInformation("Getting users - Page: {Page}, Search: {Search}", page, search);

            var allUsers = GetMockUsers();
            var filteredUsers = allUsers.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                filteredUsers = filteredUsers.Where(u =>
                    u.Username.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    u.Email.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    u.DisplayName.Contains(search, StringComparison.OrdinalIgnoreCase));
            }

            if (isActive.HasValue)
            {
                filteredUsers = filteredUsers.Where(u => u.IsActive == isActive.Value);
            }

            if (!string.IsNullOrEmpty(role))
            {
                filteredUsers = filteredUsers.Where(u => u.Roles.Contains(role));
            }

            var totalCount = filteredUsers.Count();
            var items = filteredUsers.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var response = PagedResult<UserDto>.Create(items, page, pageSize, totalCount);

            await Task.CompletedTask;
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            return StatusCode(500, "An error occurred while getting users");
        }
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{userId}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> GetUser(string userId)
    {
        try
        {
            var users = GetMockUsers();
            var user = users.FirstOrDefault(u => u.UserId == userId);

            if (user == null)
            {
                return NotFound($"User with ID {userId} not found");
            }

            await Task.CompletedTask;
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user {UserId}", userId);
            return StatusCode(500, "An error occurred while getting the user");
        }
    }

    /// <summary>
    /// Creates a new user
    /// </summary>
    [HttpPost]
    [RequirePermission("users.write")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            _logger.LogInformation("Creating user: {Username}", request.Username);

            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Email))
            {
                return BadRequest("Username and email are required");
            }

            await Task.Delay(100);

            var user = new UserDto
            {
                Id = new Random().Next(1000, 9999),
                UserId = Guid.NewGuid().ToString(),
                Username = request.Username,
                Email = request.Email,
                DisplayName = request.DisplayName ?? $"{request.FirstName} {request.LastName}".Trim(),
                FirstName = request.FirstName ?? string.Empty,
                LastName = request.LastName ?? string.Empty,
                Department = request.Department,
                Title = request.Title,
                IsActive = true,
                EmailConfirmed = false,
                TwoFactorEnabled = false,
                CreatedDate = DateTime.UtcNow,
                Roles = request.RoleIds ?? new List<string> { "User" },
                Permissions = new List<string> { "dashboard.read" }
            };

            return CreatedAtAction(nameof(GetUser), new { userId = user.UserId }, user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, "An error occurred while creating the user");
        }
    }

    /// <summary>
    /// Updates an existing user
    /// </summary>
    [HttpPut("{userId}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> UpdateUser(string userId, [FromBody] UpdateUserRequest request)
    {
        try
        {
            _logger.LogInformation("Updating user {UserId}", userId);

            await Task.Delay(75);

            var user = new UserDto
            {
                Id = new Random().Next(1000, 9999),
                UserId = userId,
                Username = $"user_{userId}",
                Email = request.Email,
                DisplayName = request.DisplayName,
                FirstName = request.FirstName ?? string.Empty,
                LastName = request.LastName ?? string.Empty,
                Department = request.Department,
                Title = request.Title,
                IsActive = request.IsActive,
                EmailConfirmed = true,
                TwoFactorEnabled = false,
                ModifiedDate = DateTime.UtcNow,
                Roles = new List<string> { "User" },
                Permissions = new List<string> { "dashboard.read" }
            };

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", userId);
            return StatusCode(500, "An error occurred while updating the user");
        }
    }

    /// <summary>
    /// Deletes a user
    /// </summary>
    [HttpDelete("{userId}")]
    [RequirePermission("users.delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        try
        {
            _logger.LogInformation("Deleting user {UserId}", userId);

            await Task.Delay(50);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", userId);
            return StatusCode(500, "An error occurred while deleting the user");
        }
    }

    private List<UserDto> GetMockUsers()
    {
        return new List<UserDto>
        {
            new UserDto
            {
                Id = 1,
                UserId = "user-1",
                Username = "admin",
                Email = "admin@gaiming.com",
                DisplayName = "System Administrator",
                FirstName = "Admin",
                LastName = "User",
                Department = "IT",
                Title = "System Administrator",
                IsActive = true,
                EmailConfirmed = true,
                TwoFactorEnabled = true,
                LastLogin = DateTime.UtcNow.AddHours(-2),
                CreatedDate = DateTime.UtcNow.AddDays(-90),
                ModifiedDate = DateTime.UtcNow.AddDays(-1),
                Roles = new List<string> { "Admin", "User" },
                Permissions = new List<string> { "users.read", "users.write", "users.delete", "roles.manage" }
            },
            new UserDto
            {
                Id = 2,
                UserId = "user-2",
                Username = "data.scientist",
                Email = "data.scientist@gaiming.com",
                DisplayName = "Data Scientist",
                FirstName = "Jane",
                LastName = "Smith",
                Department = "Analytics",
                Title = "Senior Data Scientist",
                IsActive = true,
                EmailConfirmed = true,
                TwoFactorEnabled = false,
                LastLogin = DateTime.UtcNow.AddDays(-1),
                CreatedDate = DateTime.UtcNow.AddDays(-60),
                ModifiedDate = DateTime.UtcNow.AddDays(-5),
                Roles = new List<string> { "DataScientist", "User" },
                Permissions = new List<string> { "models.read", "models.write", "analytics.read" }
            },
            new UserDto
            {
                Id = 3,
                UserId = "user-3",
                Username = "analyst",
                Email = "analyst@gaiming.com",
                DisplayName = "Business Analyst",
                FirstName = "John",
                LastName = "Doe",
                Department = "Business",
                Title = "Business Analyst",
                IsActive = true,
                EmailConfirmed = true,
                TwoFactorEnabled = false,
                LastLogin = DateTime.UtcNow.AddHours(-6),
                CreatedDate = DateTime.UtcNow.AddDays(-30),
                ModifiedDate = null,
                Roles = new List<string> { "Analyst", "User" },
                Permissions = new List<string> { "analytics.read", "reports.read" }
            },
            new UserDto
            {
                Id = 4,
                UserId = "user-4",
                Username = "viewer",
                Email = "viewer@gaiming.com",
                DisplayName = "Read Only User",
                FirstName = "Bob",
                LastName = "Wilson",
                Department = "Operations",
                Title = "Operations Manager",
                IsActive = false,
                EmailConfirmed = true,
                TwoFactorEnabled = false,
                LastLogin = DateTime.UtcNow.AddDays(-30),
                CreatedDate = DateTime.UtcNow.AddDays(-120),
                ModifiedDate = DateTime.UtcNow.AddDays(-30),
                Roles = new List<string> { "Viewer" },
                Permissions = new List<string> { "dashboard.read" }
            }
        };
    }
}
