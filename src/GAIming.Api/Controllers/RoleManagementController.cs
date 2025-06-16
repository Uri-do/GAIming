using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GAIming.Core.Models;
using GAIming.Api.Authorization;

namespace GAIming.Api.Controllers;

/// <summary>
/// Role management controller for admin operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] // Require Admin role for role management
public class RoleManagementController : ControllerBase
{
    private readonly ILogger<RoleManagementController> _logger;

    public RoleManagementController(ILogger<RoleManagementController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Get all roles
    /// </summary>
    [HttpGet]
    [RequirePermission("roles.read")]
    public async Task<ActionResult<List<RoleDto>>> GetRoles(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Getting all roles");

            await Task.Delay(25, cancellationToken);

            var roles = new List<RoleDto>
            {
                new RoleDto
                {
                    Id = 1,
                    RoleId = "role-1",
                    Name = "Admin",
                    Description = "System administrator with full access",
                    IsSystemRole = true,
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow.AddDays(-90),
                    Permissions = new List<PermissionDto>
                    {
                        new PermissionDto { Id = 1, PermissionId = "perm-1", Name = "users.read", Description = "Read users", Resource = "users", Action = "read" },
                        new PermissionDto { Id = 2, PermissionId = "perm-2", Name = "users.write", Description = "Write users", Resource = "users", Action = "write" },
                        new PermissionDto { Id = 3, PermissionId = "perm-3", Name = "users.delete", Description = "Delete users", Resource = "users", Action = "delete" },
                        new PermissionDto { Id = 4, PermissionId = "perm-4", Name = "roles.manage", Description = "Manage roles", Resource = "roles", Action = "manage" }
                    }
                },
                new RoleDto
                {
                    Id = 2,
                    RoleId = "role-2",
                    Name = "DataScientist",
                    Description = "Data scientist with ML model access",
                    IsSystemRole = false,
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow.AddDays(-60),
                    Permissions = new List<PermissionDto>
                    {
                        new PermissionDto { Id = 5, PermissionId = "perm-5", Name = "models.read", Description = "Read ML models", Resource = "models", Action = "read" },
                        new PermissionDto { Id = 6, PermissionId = "perm-6", Name = "models.write", Description = "Write ML models", Resource = "models", Action = "write" },
                        new PermissionDto { Id = 7, PermissionId = "perm-7", Name = "analytics.read", Description = "Read analytics", Resource = "analytics", Action = "read" }
                    }
                },
                new RoleDto
                {
                    Id = 3,
                    RoleId = "role-3",
                    Name = "User",
                    Description = "Standard user with basic access",
                    IsSystemRole = true,
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow.AddDays(-90),
                    Permissions = new List<PermissionDto>
                    {
                        new PermissionDto { Id = 9, PermissionId = "perm-9", Name = "dashboard.read", Description = "Read dashboard", Resource = "dashboard", Action = "read" }
                    }
                }
            };

            return Ok(roles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving roles");
            return StatusCode(500, new { message = "An error occurred while retrieving roles" });
        }
    }

    /// <summary>
    /// Get role by ID
    /// </summary>
    [HttpGet("{roleId}")]
    public async Task<ActionResult<RoleDto>> GetRole(string roleId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Getting role {RoleId}", roleId);

            if (string.IsNullOrEmpty(roleId))
            {
                return BadRequest("Invalid role ID");
            }

            await Task.Delay(25, cancellationToken);

            var role = new RoleDto
            {
                Id = new Random().Next(1000, 9999),
                RoleId = roleId,
                Name = $"Role {roleId}",
                Description = $"Description for role {roleId}",
                IsSystemRole = false,
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-30),
                Permissions = new List<PermissionDto>
                {
                    new PermissionDto { Id = 1, PermissionId = "perm-1", Name = "dashboard.read", Description = "Read dashboard", Resource = "dashboard", Action = "read" }
                }
            };

            return Ok(role);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving role {RoleId}", roleId);
            return StatusCode(500, new { message = "An error occurred while retrieving the role" });
        }
    }

    /// <summary>
    /// Get all permissions
    /// </summary>
    [HttpGet("permissions")]
    [RequirePermission("permissions.read")]
    public async Task<ActionResult<List<PermissionDto>>> GetPermissions(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Getting all permissions");

            await Task.Delay(25, cancellationToken);

            var permissions = new List<PermissionDto>
            {
                new PermissionDto { Id = 1, PermissionId = "perm-1", Name = "users.read", Description = "Read users", Resource = "users", Action = "read" },
                new PermissionDto { Id = 2, PermissionId = "perm-2", Name = "users.write", Description = "Write users", Resource = "users", Action = "write" },
                new PermissionDto { Id = 3, PermissionId = "perm-3", Name = "users.delete", Description = "Delete users", Resource = "users", Action = "delete" },
                new PermissionDto { Id = 4, PermissionId = "perm-4", Name = "roles.manage", Description = "Manage roles", Resource = "roles", Action = "manage" },
                new PermissionDto { Id = 5, PermissionId = "perm-5", Name = "models.read", Description = "Read ML models", Resource = "models", Action = "read" },
                new PermissionDto { Id = 6, PermissionId = "perm-6", Name = "models.write", Description = "Write ML models", Resource = "models", Action = "write" },
                new PermissionDto { Id = 7, PermissionId = "perm-7", Name = "analytics.read", Description = "Read analytics", Resource = "analytics", Action = "read" },
                new PermissionDto { Id = 8, PermissionId = "perm-8", Name = "reports.read", Description = "Read reports", Resource = "reports", Action = "read" },
                new PermissionDto { Id = 9, PermissionId = "perm-9", Name = "dashboard.read", Description = "Read dashboard", Resource = "dashboard", Action = "read" }
            };

            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving permissions");
            return StatusCode(500, new { message = "An error occurred while retrieving permissions" });
        }
    }
}
