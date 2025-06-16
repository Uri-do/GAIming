using GAIming.Core.Interfaces;
using GAIming.Core.Models;
using GAIming.Core.Common;
using GAIming.Core.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GAIming.Infrastructure.Data;
using BCrypt.Net;

namespace GAIming.Infrastructure.Security;

/// <summary>
/// Authentication service implementation
/// </summary>
public class AuthenticationService : IAuthenticationService
{
    private readonly ILogger<AuthenticationService> _logger;
    private readonly ApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordService _passwordService;

    public AuthenticationService(
        ILogger<AuthenticationService> logger,
        ApplicationDbContext context,
        IJwtTokenService jwtTokenService,
        IPasswordService passwordService)
    {
        _logger = logger;
        _context = context;
        _jwtTokenService = jwtTokenService;
        _passwordService = passwordService;
    }

    public async Task<AuthenticationResult> AuthenticateAsync(LoginRequest request, string ipAddress, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Authentication attempt for user: {Username}", request.Username);

        try
        {
            // Find user by username or email
            var user = await _context.Set<User>()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u =>
                    (u.Username == request.Username || u.Email == request.Username) &&
                    u.IsActive,
                    cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User not found: {Username}", request.Username);
                return new AuthenticationResult
                {
                    IsSuccess = false,
                    ErrorMessage = "Invalid username or password",
                    Token = null,
                    User = null
                };
            }

            // Check if account is locked
            if (user.IsLockedOut())
            {
                _logger.LogWarning("Account locked for user: {Username}", request.Username);
                return new AuthenticationResult
                {
                    IsSuccess = false,
                    ErrorMessage = "Account is locked. Please try again later.",
                    Token = null,
                    User = null
                };
            }

            // Verify password
            if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash, user.PasswordSalt))
            {
                _logger.LogWarning("Invalid password for user: {Username}", request.Username);

                // Increment failed login attempts
                user.FailedLoginAttempts++;

                // Lock account after 5 failed attempts
                if (user.FailedLoginAttempts >= 5)
                {
                    user.LockoutEnd = DateTime.UtcNow.AddMinutes(30); // Lock for 30 minutes
                    _logger.LogWarning("Account locked due to failed login attempts: {Username}", request.Username);
                }

                await _context.SaveChangesAsync(cancellationToken);

                return new AuthenticationResult
                {
                    IsSuccess = false,
                    ErrorMessage = "Invalid username or password",
                    Token = null,
                    User = null
                };
            }

            // Reset failed login attempts on successful login
            user.FailedLoginAttempts = 0;
            user.LockoutEnd = null;
            user.LastLogin = DateTime.UtcNow;

            // Create refresh token (temporarily disabled due to EF OUTPUT clause issues)
            var refreshTokenString = Guid.NewGuid().ToString();

            // TODO: Fix RefreshToken entity EF configuration issues and re-enable
            // The issue is EF trying to output IsActive in INSERT statement even though it's ignored
            // For now, we'll create a simple refresh token without saving to DB
            await _context.SaveChangesAsync(cancellationToken);

            // Generate JWT token
            var userInfo = MapToUserInfo(user);
            var jwtTokenString = _jwtTokenService.GenerateToken(userInfo.UserId, userInfo.Username, userInfo.Roles);

            var jwtToken = new JwtToken
            {
                AccessToken = jwtTokenString,
                RefreshToken = refreshTokenString,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                RefreshExpiresAt = DateTime.UtcNow.AddDays(7),
                TokenType = "Bearer",
                Scopes = new List<string> { "api" }
            };

            _logger.LogInformation("Authentication successful for user: {Username}", request.Username);

            return new AuthenticationResult
            {
                IsSuccess = true,
                Token = jwtToken,
                User = userInfo,
                ErrorMessage = null,
                RequiresTwoFactor = user.TwoFactorEnabled,
                RequiresPasswordChange = user.MustChangePassword
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during authentication for user: {Username}", request.Username);
            return new AuthenticationResult
            {
                IsSuccess = false,
                ErrorMessage = "An error occurred during authentication",
                Token = null,
                User = null
            };
        }
    }

    public async Task<AuthenticationResult> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Token refresh attempt");

        try
        {
            var token = await _context.Set<RefreshToken>()
                .Include(rt => rt.User)
                    .ThenInclude(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                            .ThenInclude(r => r.RolePermissions)
                                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow, cancellationToken);

            if (token == null)
            {
                _logger.LogWarning("Invalid refresh token");
                return new AuthenticationResult
                {
                    IsSuccess = false,
                    ErrorMessage = "Invalid refresh token",
                    Token = null,
                    User = null
                };
            }

            // Generate new JWT token
            var userInfo = MapToUserInfo(token.User);
            var jwtTokenString = _jwtTokenService.GenerateToken(userInfo.UserId, userInfo.Username, userInfo.Roles);

            var jwtToken = new JwtToken
            {
                AccessToken = jwtTokenString,
                RefreshToken = token.Token,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                RefreshExpiresAt = token.ExpiresAt,
                TokenType = "Bearer",
                Scopes = new List<string> { "api" }
            };

            // Optionally rotate refresh token
            token.ExpiresAt = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync(cancellationToken);

            return new AuthenticationResult
            {
                IsSuccess = true,
                Token = jwtToken,
                User = userInfo,
                ErrorMessage = null
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during refresh token");
            return new AuthenticationResult
            {
                IsSuccess = false,
                ErrorMessage = "An error occurred during token refresh",
                Token = null,
                User = null
            };
        }
    }

    public async Task<User?> GetUserFromTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting user from token");

        // TODO: Implement user extraction from token
        await Task.Delay(1, cancellationToken);

        return null;
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Revoking token");

        // TODO: Implement token revocation
        await Task.Delay(1, cancellationToken);

        return false;
    }

    public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Password change attempt for user: {UserId}", userId);

        // TODO: Implement password change logic
        await Task.Delay(1, cancellationToken);

        return false;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Password reset attempt for email: {Email}", request.Email);

        // TODO: Implement password reset logic
        await Task.Delay(1, cancellationToken);

        return false;
    }

    public async Task<bool> LogoutAsync(string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Logout attempt for user: {UserId}", userId);

        // TODO: Implement logout logic
        await Task.Delay(1, cancellationToken);

        return true;
    }

    public async Task<bool> ValidateTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        try
        {
            await Task.CompletedTask; // Make method async
            return _jwtTokenService.ValidateToken(token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating token");
            return false;
        }
    }

    private static UserInfo MapToUserInfo(User user)
    {
        var roles = user.UserRoles.Where(ur => ur.IsActive).Select(ur => ur.Role.Name).ToList();
        var permissions = user.UserRoles
            .Where(ur => ur.IsActive)
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

        return new UserInfo
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            DisplayName = user.DisplayName,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Roles = roles,
            Permissions = permissions,
            IsActive = user.IsActive,
            LastLogin = user.LastLogin
        };
    }

    /// <inheritdoc />
    public async Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress, string userAgent)
    {
        var result = await AuthenticateAsync(request, ipAddress);

        return new LoginResponse
        {
            Success = result.IsSuccess,
            AccessToken = result.Token?.AccessToken,
            RefreshToken = result.Token?.RefreshToken,
            ExpiresAt = result.Token?.ExpiresAt,
            User = result.User != null ? new UserDto
            {
                UserId = result.User.UserId,
                Username = result.User.Username,
                Email = result.User.Email,
                DisplayName = result.User.DisplayName,
                FirstName = result.User.FirstName,
                LastName = result.User.LastName,
                IsActive = result.User.IsActive,
                LastLogin = result.User.LastLogin
            } : null,
            Roles = result.User?.Roles ?? new List<string>(),
            Permissions = result.User?.Permissions ?? new List<string>(),
            Message = result.ErrorMessage,
            RequiresTwoFactor = result.RequiresTwoFactor
        };
    }

    /// <inheritdoc />
    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
    {
        try
        {
            _logger.LogInformation("Registration attempt for user: {Username}", request.Username);

            // Check if username or email already exists
            var existingUser = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.Username == request.Username || u.Email == request.Email);

            if (existingUser != null)
            {
                _logger.LogWarning("User already exists: {Username}", request.Username);
                return new RegisterResponse
                {
                    Success = false,
                    Message = "Username or email already exists",
                    User = null,
                    RequiresEmailConfirmation = false
                };
            }

            // Validate password strength
            if (!_passwordService.IsPasswordStrong(request.Password))
            {
                return new RegisterResponse
                {
                    Success = false,
                    Message = "Password does not meet strength requirements",
                    User = null,
                    RequiresEmailConfirmation = false
                };
            }

            // Hash password
            var passwordHash = _passwordService.HashPassword(request.Password);

            // Create new user
            var user = new User
            {
                UserId = Guid.NewGuid().ToString(),
                Username = request.Username,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                DisplayName = $"{request.FirstName} {request.LastName}",
                PasswordHash = passwordHash,
                PasswordSalt = string.Empty, // BCrypt includes salt in hash
                IsActive = true,
                EmailConfirmed = false,
                TwoFactorEnabled = false,
                MustChangePassword = false,
                FailedLoginAttempts = 0,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = "System"
            };

            _context.Set<User>().Add(user);
            await _context.SaveChangesAsync();

            // Assign default role
            var defaultRole = await _context.Set<Role>()
                .FirstOrDefaultAsync(r => r.Name == "User");

            if (defaultRole != null)
            {
                var userRole = new UserRole
                {
                    UserId = user.UserId,
                    RoleId = defaultRole.RoleId,
                    IsActive = true,
                    AssignedBy = "System",
                    AssignedDate = DateTime.UtcNow
                };

                _context.Set<UserRole>().Add(userRole);
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("User registered successfully: {Username}", request.Username);

            // Generate JWT token for immediate login
            var userInfo = MapToUserInfo(user);
            var jwtTokenString = _jwtTokenService.GenerateToken(userInfo.UserId, userInfo.Username, userInfo.Roles);

            var jwtToken = new JwtToken
            {
                AccessToken = jwtTokenString,
                RefreshToken = Guid.NewGuid().ToString(),
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                RefreshExpiresAt = DateTime.UtcNow.AddDays(7),
                TokenType = "Bearer",
                Scopes = new List<string> { "api" }
            };

            return new RegisterResponse
            {
                Success = true,
                Message = "User registered successfully",
                User = new UserDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    DisplayName = user.DisplayName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    IsActive = user.IsActive,
                    LastLogin = user.LastLogin
                },
                RequiresEmailConfirmation = !user.EmailConfirmed
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for user: {Username}", request.Username);
            return new RegisterResponse
            {
                Success = false,
                Message = "An error occurred during registration",
                User = null,
                RequiresEmailConfirmation = false
            };
        }
    }

    /// <inheritdoc />
    public async Task<TokenInfo> RefreshTokenAsync(string refreshToken, string ipAddress)
    {
        var result = await RefreshTokenAsync(refreshToken);

        if (result.IsSuccess && result.Token != null)
        {
            return new TokenInfo
            {
                AccessToken = result.Token.AccessToken,
                RefreshToken = result.Token.RefreshToken,
                ExpiresAt = result.Token.ExpiresAt,
                RefreshExpiresAt = result.Token.RefreshExpiresAt,
                TokenType = result.Token.TokenType
            };
        }

        throw new UnauthorizedAccessException(result.ErrorMessage ?? "Token refresh failed");
    }

    /// <inheritdoc />
    public async Task RevokeTokenAsync(string refreshToken, string ipAddress)
    {
        try
        {
            _logger.LogInformation("Revoking refresh token from IP: {IpAddress}", ipAddress);

            var token = await _context.Set<RefreshToken>()
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken && !rt.IsRevoked);

            if (token == null)
            {
                _logger.LogWarning("Refresh token not found or already revoked");
                return;
            }

            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = ipAddress;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Refresh token revoked successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking refresh token");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ChangePasswordAsync(long userId, ChangePasswordRequest request)
    {
        try
        {
            _logger.LogInformation("Password change attempt for user: {UserId}", userId);

            var user = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.UserId == userId.ToString());

            if (user == null)
            {
                _logger.LogWarning("User not found: {UserId}", userId);
                return false;
            }

            // Verify current password
            if (!_passwordService.VerifyPassword(request.CurrentPassword, user.PasswordHash, user.PasswordSalt))
            {
                _logger.LogWarning("Invalid current password for user: {UserId}", userId);
                return false;
            }

            // Validate new password strength
            if (!_passwordService.IsPasswordStrong(request.NewPassword))
            {
                _logger.LogWarning("New password does not meet strength requirements for user: {UserId}", userId);
                return false;
            }

            // Hash new password
            user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
            user.MustChangePassword = false;
            user.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Password changed successfully for user: {UserId}", userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user: {UserId}", userId);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request)
    {
        try
        {
            _logger.LogInformation("Password reset attempt for email: {Email}", request.Email);

            var user = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                _logger.LogWarning("User not found for password reset: {Email}", request.Email);
                // Return true to prevent email enumeration
                return true;
            }

            // Generate password reset token
            var resetToken = Guid.NewGuid().ToString();
            user.PasswordResetToken = resetToken;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);

            await _context.SaveChangesAsync();

            // TODO: Send password reset email
            _logger.LogInformation("Password reset token generated for user: {Email}", request.Email);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password reset for email: {Email}", request.Email);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ConfirmPasswordResetAsync(PasswordResetConfirmRequest request)
    {
        try
        {
            _logger.LogInformation("Password reset confirmation attempt");

            var user = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token &&
                                         u.PasswordResetTokenExpiry > DateTime.UtcNow);

            if (user == null)
            {
                _logger.LogWarning("Invalid or expired password reset token");
                return false;
            }

            // Validate new password strength
            if (!_passwordService.IsPasswordStrong(request.NewPassword))
            {
                _logger.LogWarning("New password does not meet strength requirements");
                return false;
            }

            // Hash new password
            user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            user.MustChangePassword = false;
            user.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Password reset completed successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password reset confirmation");
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ConfirmEmailAsync(EmailConfirmationRequest request)
    {
        try
        {
            _logger.LogInformation("Email confirmation attempt");

            var user = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.EmailConfirmationToken == request.Token);

            if (user == null)
            {
                _logger.LogWarning("Invalid email confirmation token");
                return false;
            }

            user.EmailConfirmed = true;
            user.EmailConfirmationToken = null;
            user.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Email confirmed successfully for user: {UserId}", user.UserId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during email confirmation");
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<TwoFactorSetupResponse> SetupTwoFactorAsync(long userId, TwoFactorSetupRequest request)
    {
        try
        {
            _logger.LogInformation("Two-factor setup attempt for user: {UserId}", userId);

            var user = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.UserId == userId.ToString());

            if (user == null)
            {
                _logger.LogWarning("User not found: {UserId}", userId);
                return new TwoFactorSetupResponse
                {
                    Success = false,
                    Message = "User not found"
                };
            }

            user.TwoFactorEnabled = true;
            user.TwoFactorSecret = request.Secret;
            user.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Two-factor authentication enabled for user: {UserId}", userId);

            // Generate QR code URL and recovery codes
            var qrCodeUrl = $"otpauth://totp/GAIming:{user.Email}?secret={request.Secret}&issuer=GAIming";
            var recoveryCodes = new List<string>();
            for (int i = 0; i < 10; i++)
            {
                recoveryCodes.Add(Guid.NewGuid().ToString("N")[..8].ToUpper());
            }

            return new TwoFactorSetupResponse
            {
                Success = true,
                QrCodeUrl = qrCodeUrl,
                ManualEntryKey = request.Secret,
                RecoveryCodes = recoveryCodes,
                Message = "Two-factor authentication enabled successfully"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting up two-factor for user: {UserId}", userId);
            return new TwoFactorSetupResponse
            {
                Success = false,
                Message = "An error occurred while setting up two-factor authentication"
            };
        }
    }

    /// <inheritdoc />
    public async Task<bool> DisableTwoFactorAsync(long userId, string verificationCode)
    {
        try
        {
            _logger.LogInformation("Two-factor disable attempt for user: {UserId}", userId);

            var user = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.UserId == userId.ToString());

            if (user == null)
            {
                _logger.LogWarning("User not found: {UserId}", userId);
                return false;
            }

            // TODO: Verify the verification code
            // For now, just disable two-factor
            user.TwoFactorEnabled = false;
            user.TwoFactorSecret = null;
            user.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Two-factor authentication disabled for user: {UserId}", userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disabling two-factor for user: {UserId}", userId);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task LogoutAsync(long userId, string refreshToken)
    {
        try
        {
            _logger.LogInformation("Logout attempt for user: {UserId}", userId);

            // Revoke the refresh token
            var token = await _context.Set<RefreshToken>()
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.UserId == userId.ToString());

            if (token != null)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("User logged out successfully: {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout for user: {UserId}", userId);
            throw;
        }
    }
}

/// <summary>
/// Authorization service implementation
/// </summary>
public class AuthorizationService : IAuthorizationService
{
    private readonly ILogger<AuthorizationService> _logger;
    private readonly ApplicationDbContext _context;

    public AuthorizationService(ILogger<AuthorizationService> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task<bool> HasPermissionAsync(string userId, string permission, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Checking permission {Permission} for user {UserId}", permission, userId);

        var hasPermission = await _context.Set<User>()
            .Where(u => u.UserId == userId && u.IsActive)
            .SelectMany(u => u.UserRoles)
            .Where(ur => ur.IsActive)
            .SelectMany(ur => ur.Role.RolePermissions)
            .AnyAsync(rp => rp.Permission.Name == permission, cancellationToken);

        _logger.LogInformation("User {UserId} {HasPermission} permission {Permission}",
            userId, hasPermission ? "has" : "does not have", permission);

        return hasPermission;
    }

    public async Task<bool> HasRoleAsync(string userId, string role, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Checking role {Role} for user {UserId}", role, userId);

        var hasRole = await _context.Set<User>()
            .Where(u => u.UserId == userId && u.IsActive)
            .SelectMany(u => u.UserRoles)
            .Where(ur => ur.IsActive)
            .AnyAsync(ur => ur.Role.Name == role, cancellationToken);

        _logger.LogInformation("User {UserId} {HasRole} role {Role}",
            userId, hasRole ? "has" : "does not have", role);

        return hasRole;
    }

    public async Task<IEnumerable<string>> GetUserPermissionsAsync(string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting permissions for user {UserId}", userId);

        var permissions = await _context.Set<User>()
            .Where(u => u.UserId == userId && u.IsActive)
            .SelectMany(u => u.UserRoles)
            .Where(ur => ur.IsActive)
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToListAsync(cancellationToken);

        return permissions;
    }

    public async Task<IEnumerable<string>> GetUserRolesAsync(string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting roles for user {UserId}", userId);

        var roles = await _context.Set<User>()
            .Where(u => u.UserId == userId && u.IsActive)
            .SelectMany(u => u.UserRoles)
            .Where(ur => ur.IsActive)
            .Select(ur => ur.Role.Name)
            .ToListAsync(cancellationToken);

        return roles;
    }

    public async Task<bool> AssignRoleAsync(string userId, string role, string assignedBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Assigning role {Role} to user {UserId} by {AssignedBy}", role, userId, assignedBy);

        var user = await _context.Set<User>()
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found for role assignment", userId);
            return false;
        }

        var roleEntity = await _context.Set<Role>()
            .FirstOrDefaultAsync(r => r.Name == role, cancellationToken);

        if (roleEntity == null)
        {
            _logger.LogWarning("Role {Role} not found", role);
            return false;
        }

        // Check if user already has this role
        var existingUserRole = user.UserRoles.FirstOrDefault(ur => ur.RoleId == roleEntity.RoleId);
        if (existingUserRole != null)
        {
            if (existingUserRole.IsActive)
            {
                _logger.LogInformation("User {UserId} already has role {Role}", userId, role);
                return true;
            }
            else
            {
                // Reactivate the role
                existingUserRole.IsActive = true;
                existingUserRole.AssignedBy = assignedBy;
                existingUserRole.AssignedDate = DateTime.UtcNow;
            }
        }
        else
        {
            // Create new user role
            var userRole = new UserRole
            {
                UserId = userId,
                RoleId = roleEntity.RoleId,
                IsActive = true,
                AssignedBy = assignedBy,
                AssignedDate = DateTime.UtcNow
            };

            _context.Set<UserRole>().Add(userRole);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Role {Role} assigned to user {UserId} successfully", role, userId);
        return true;
    }

    public async Task<bool> RemoveRoleAsync(string userId, string role, string removedBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Removing role {Role} from user {UserId} by {RemovedBy}", role, userId, removedBy);

        var userRole = await _context.Set<UserRole>()
            .Include(ur => ur.Role)
            .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.Role.Name == role && ur.IsActive, cancellationToken);

        if (userRole == null)
        {
            _logger.LogWarning("User {UserId} does not have active role {Role}", userId, role);
            return false;
        }

        userRole.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Role {Role} removed from user {UserId} successfully", role, userId);
        return true;
    }

    /// <inheritdoc />
    public async Task<bool> HasPermissionAsync(long userId, string permission)
    {
        return await HasPermissionAsync(userId.ToString(), permission);
    }

    /// <inheritdoc />
    public async Task<bool> HasRoleAsync(long userId, string role)
    {
        return await HasRoleAsync(userId.ToString(), role);
    }

    /// <inheritdoc />
    public async Task<List<string>> GetUserPermissionsAsync(long userId)
    {
        var permissions = await GetUserPermissionsAsync(userId.ToString());
        return permissions.ToList();
    }

    /// <inheritdoc />
    public async Task<List<string>> GetUserRolesAsync(long userId)
    {
        var roles = await GetUserRolesAsync(userId.ToString());
        return roles.ToList();
    }
}

/// <summary>
/// User service implementation
/// </summary>
public class UserService : IUserService
{
    private readonly ILogger<UserService> _logger;
    private readonly ApplicationDbContext _context;
    private readonly IPasswordService _passwordService;

    public UserService(
        ILogger<UserService> logger,
        ApplicationDbContext context,
        IPasswordService passwordService)
    {
        _logger = logger;
        _context = context;
        _passwordService = passwordService;
    }

    public async Task<User> CreateUserAsync(CreateUserRequest request, string createdBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating user {Username} by {CreatedBy}", request.Username, createdBy);

        // Check if username already exists
        var existingUser = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.Username == request.Username || u.Email == request.Email, cancellationToken);

        if (existingUser != null)
        {
            throw new InvalidOperationException(
                existingUser.Username == request.Username
                    ? "Username already exists"
                    : "Email already exists");
        }

        // Hash password
        var hash = _passwordService.HashPassword(request.Password);

        // Create user
        var user = new User
        {
            UserId = Guid.NewGuid().ToString(),
            Username = request.Username,
            Email = request.Email,
            DisplayName = request.DisplayName,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Department = request.Department,
            Title = request.Title,
            PasswordHash = hash,
            PasswordSalt = null, // BCrypt includes salt in hash
            IsActive = true,
            EmailConfirmed = false,
            TwoFactorEnabled = false,
            FailedLoginAttempts = 0,
            CreatedBy = createdBy,
            CreatedDate = DateTime.UtcNow,
            ModifiedBy = createdBy,
            ModifiedDate = DateTime.UtcNow
        };

        _context.Set<User>().Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {Username} created successfully with ID {UserId}", request.Username, user.UserId);
        return user;
    }

    public async Task<User> UpdateUserAsync(string userId, UpdateUserRequest request, string modifiedBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating user {UserId} by {UpdatedBy}", userId, modifiedBy);

        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);

        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Check if email is being changed and if it already exists
        if (user.Email != request.Email)
        {
            var existingUser = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.UserId != userId, cancellationToken);

            if (existingUser != null)
            {
                throw new InvalidOperationException("Email already exists");
            }
        }

        // Update user properties
        user.Email = request.Email;
        user.DisplayName = request.DisplayName;
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Department = request.Department;
        user.Title = request.Title;
        user.IsActive = request.IsActive;
        user.EmailConfirmed = request.EmailConfirmed;
        user.TwoFactorEnabled = request.TwoFactorEnabled;
        user.ModifiedBy = modifiedBy;
        user.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} updated successfully", userId);
        return user;
    }

    public async Task<bool> DeleteUserAsync(string userId, string deletedBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting user {UserId} by {DeletedBy}", userId, deletedBy);

        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found for deletion", userId);
            return false;
        }

        // Soft delete - just deactivate the user
        user.IsActive = false;
        user.ModifiedBy = deletedBy;
        user.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} deleted (deactivated) successfully", userId);
        return true;
    }

    public async Task<User?> GetUserByIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting user by ID: {UserId}", userId);

        return await _context.Set<User>()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);
    }

    public async Task<User?> GetUserByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting user by username: {Username}", username);

        return await _context.Set<User>()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Username == username, cancellationToken);
    }

    public async Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting user by email: {Email}", email);

        return await _context.Set<User>()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<PagedResult<User>> GetUsersAsync(int page, int pageSize, string? search = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting users page {Page}, size {PageSize}, search: {Search}", page, pageSize, search);

        var query = _context.Set<User>()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .AsQueryable();

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u =>
                u.Username.Contains(search) ||
                u.Email.Contains(search) ||
                u.DisplayName.Contains(search) ||
                (u.FirstName != null && u.FirstName.Contains(search)) ||
                (u.LastName != null && u.LastName.Contains(search)));
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var users = await query
            .OrderBy(u => u.DisplayName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<User>(users, page, pageSize, totalCount);
    }

    public async Task<bool> ActivateUserAsync(string userId, string activatedBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Activating user {UserId} by {ActivatedBy}", userId, activatedBy);

        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found for activation", userId);
            return false;
        }

        user.IsActive = true;
        user.LockoutEnd = null; // Clear any lockout
        user.FailedLoginAttempts = 0; // Reset failed attempts
        user.ModifiedBy = activatedBy;
        user.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} activated successfully", userId);
        return true;
    }

    public async Task<bool> DeactivateUserAsync(string userId, string deactivatedBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deactivating user {UserId} by {DeactivatedBy}", userId, deactivatedBy);

        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found for deactivation", userId);
            return false;
        }

        user.IsActive = false;
        user.ModifiedBy = deactivatedBy;
        user.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} deactivated successfully", userId);
        return true;
    }

    public async Task<bool> LockUserAsync(string userId, TimeSpan lockDuration, string lockedBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Locking user {UserId} for {Duration} by {LockedBy}", userId, lockDuration, lockedBy);

        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found for locking", userId);
            return false;
        }

        user.LockoutEnd = DateTime.UtcNow.Add(lockDuration);
        user.ModifiedBy = lockedBy;
        user.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} locked until {LockoutEnd}", userId, user.LockoutEnd);
        return true;
    }

    public async Task<bool> UnlockUserAsync(string userId, string unlockedBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Unlocking user {UserId} by {UnlockedBy}", userId, unlockedBy);

        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found for unlocking", userId);
            return false;
        }

        user.LockoutEnd = null;
        user.FailedLoginAttempts = 0;
        user.ModifiedBy = unlockedBy;
        user.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} unlocked successfully", userId);
        return true;
    }

    /// <inheritdoc />
    public async Task<User?> GetUserByIdAsync(long userId)
    {
        return await GetUserByIdAsync(userId.ToString());
    }

    /// <inheritdoc />
    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        return await GetUserByUsernameAsync(username, CancellationToken.None);
    }

    /// <inheritdoc />
    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await GetUserByEmailAsync(email, CancellationToken.None);
    }

    /// <inheritdoc />
    public async Task<User> CreateUserAsync(CreateUserRequest request)
    {
        return await CreateUserAsync(request, "System");
    }

    /// <inheritdoc />
    public async Task<bool> UpdateUserAsync(long userId, User user)
    {
        try
        {
            _logger.LogInformation("Updating user {UserId}", userId);

            var existingUser = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.UserId == userId.ToString());

            if (existingUser == null)
            {
                _logger.LogWarning("User {UserId} not found for update", userId);
                return false;
            }

            // Update user properties
            existingUser.Email = user.Email;
            existingUser.DisplayName = user.DisplayName;
            existingUser.FirstName = user.FirstName;
            existingUser.LastName = user.LastName;
            existingUser.Department = user.Department;
            existingUser.Title = user.Title;
            existingUser.IsActive = user.IsActive;
            existingUser.EmailConfirmed = user.EmailConfirmed;
            existingUser.TwoFactorEnabled = user.TwoFactorEnabled;
            existingUser.ModifiedBy = "System";
            existingUser.ModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} updated successfully", userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", userId);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> DeleteUserAsync(long userId)
    {
        return await DeleteUserAsync(userId.ToString(), "System");
    }

    /// <inheritdoc />
    public async Task<bool> ActivateUserAsync(long userId)
    {
        return await ActivateUserAsync(userId.ToString(), "System");
    }

    /// <inheritdoc />
    public async Task<bool> DeactivateUserAsync(long userId)
    {
        return await DeactivateUserAsync(userId.ToString(), "System");
    }
}

/// <summary>
/// Role service implementation
/// </summary>
public class RoleService : IRoleService
{
    private readonly ILogger<RoleService> _logger;
    private readonly ApplicationDbContext _context;

    public RoleService(ILogger<RoleService> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task<Role> CreateRoleAsync(CreateRoleRequest request, string createdBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating role {RoleName} by {CreatedBy}", request.Name, createdBy);

        // TODO: Implement role creation logic
        await Task.Delay(1, cancellationToken);

        return new Role { RoleId = Guid.NewGuid().ToString(), Name = request.Name, Description = request.Description };
    }

    public async Task<Role> UpdateRoleAsync(string roleId, UpdateRoleRequest request, string modifiedBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating role {RoleId} by {UpdatedBy}", roleId, modifiedBy);

        // TODO: Implement role update logic
        await Task.Delay(1, cancellationToken);

        return new Role { RoleId = roleId, Name = request.Name, Description = request.Description };
    }

    public async Task<bool> DeleteRoleAsync(string roleId, string deletedBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting role {RoleId} by {DeletedBy}", roleId, deletedBy);

        // TODO: Implement role deletion logic
        await Task.Delay(1, cancellationToken);

        return false;
    }

    public async Task<Role?> GetRoleByIdAsync(string roleId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting role by ID: {RoleId}", roleId);

        // TODO: Implement role retrieval logic
        await Task.Delay(1, cancellationToken);

        return null;
    }

    public async Task<Role?> GetRoleByNameAsync(string roleName, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting role by name: {RoleName}", roleName);

        // TODO: Implement role retrieval logic
        await Task.Delay(1, cancellationToken);

        return null;
    }

    public async Task<IEnumerable<Role>> GetRolesAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting all roles");

        // TODO: Implement role listing logic
        await Task.Delay(1, cancellationToken);

        return new List<Role>();
    }

    public async Task<bool> AssignPermissionAsync(string roleId, string permission, string assignedBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Assigning permission {Permission} to role {RoleId} by {AssignedBy}", permission, roleId, assignedBy);

        // TODO: Implement permission assignment logic
        await Task.Delay(1, cancellationToken);

        return false;
    }

    public async Task<bool> RemovePermissionAsync(string roleId, string permission, string removedBy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Removing permission {Permission} from role {RoleId} by {RemovedBy}", permission, roleId, removedBy);

        // TODO: Implement permission removal logic
        await Task.Delay(1, cancellationToken);

        return false;
    }

    public async Task<IEnumerable<Permission>> GetRolePermissionsAsync(string roleId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting permissions for role {RoleId}", roleId);

        // TODO: Implement role permission retrieval logic
        await Task.Delay(1, cancellationToken);

        return new List<Permission>();
    }

    /// <inheritdoc />
    public async Task<List<Role>> GetRolesAsync()
    {
        try
        {
            _logger.LogInformation("Getting all roles");

            var roles = await _context.Set<Role>()
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .ToListAsync();

            return roles;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting roles");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<Role?> GetRoleByIdAsync(long roleId)
    {
        try
        {
            _logger.LogInformation("Getting role by ID: {RoleId}", roleId);

            var role = await _context.Set<Role>()
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(r => r.RoleId == roleId.ToString());

            return role;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting role by ID: {RoleId}", roleId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<Role> CreateRoleAsync(CreateRoleRequest request)
    {
        try
        {
            _logger.LogInformation("Creating role: {RoleName}", request.Name);

            // Check if role already exists
            var existingRole = await _context.Set<Role>()
                .FirstOrDefaultAsync(r => r.Name == request.Name);

            if (existingRole != null)
            {
                throw new InvalidOperationException("Role already exists");
            }

            var role = new Role
            {
                RoleId = Guid.NewGuid().ToString(),
                Name = request.Name,
                Description = request.Description,
                IsActive = true,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = "System"
            };

            _context.Set<Role>().Add(role);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Role created successfully: {RoleName} with ID: {RoleId}", request.Name, role.RoleId);
            return role;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role: {RoleName}", request.Name);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<Role> UpdateRoleAsync(long roleId, UpdateRoleRequest request)
    {
        try
        {
            _logger.LogInformation("Updating role: {RoleId}", roleId);

            var role = await _context.Set<Role>()
                .FirstOrDefaultAsync(r => r.RoleId == roleId.ToString());

            if (role == null)
            {
                throw new InvalidOperationException("Role not found");
            }

            role.Name = request.Name;
            role.Description = request.Description;
            role.UpdatedDate = DateTime.UtcNow;
            role.UpdatedBy = "System";

            await _context.SaveChangesAsync();

            _logger.LogInformation("Role updated successfully: {RoleId}", roleId);
            return role;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating role: {RoleId}", roleId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> DeleteRoleAsync(long roleId)
    {
        try
        {
            _logger.LogInformation("Deleting role: {RoleId}", roleId);

            var role = await _context.Set<Role>()
                .FirstOrDefaultAsync(r => r.RoleId == roleId.ToString());

            if (role == null)
            {
                _logger.LogWarning("Role not found: {RoleId}", roleId);
                return false;
            }

            // Soft delete - just deactivate the role
            role.IsActive = false;
            role.UpdatedDate = DateTime.UtcNow;
            role.UpdatedBy = "System";

            await _context.SaveChangesAsync();

            _logger.LogInformation("Role deleted (deactivated) successfully: {RoleId}", roleId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting role: {RoleId}", roleId);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> AssignPermissionAsync(long roleId, long permissionId)
    {
        try
        {
            _logger.LogInformation("Assigning permission {PermissionId} to role {RoleId}", permissionId, roleId);

            var role = await _context.Set<Role>()
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.RoleId == roleId.ToString());

            if (role == null)
            {
                _logger.LogWarning("Role not found: {RoleId}", roleId);
                return false;
            }

            var permission = await _context.Set<Permission>()
                .FirstOrDefaultAsync(p => p.PermissionId == permissionId.ToString());

            if (permission == null)
            {
                _logger.LogWarning("Permission not found: {PermissionId}", permissionId);
                return false;
            }

            // Check if permission is already assigned
            var existingRolePermission = role.RolePermissions
                .FirstOrDefault(rp => rp.PermissionId == permissionId.ToString());

            if (existingRolePermission != null)
            {
                _logger.LogInformation("Permission {PermissionId} already assigned to role {RoleId}", permissionId, roleId);
                return true;
            }

            var rolePermission = new RolePermission
            {
                RoleId = roleId.ToString(),
                PermissionId = permissionId.ToString(),
                AssignedDate = DateTime.UtcNow,
                AssignedBy = "System"
            };

            _context.Set<RolePermission>().Add(rolePermission);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Permission {PermissionId} assigned to role {RoleId} successfully", permissionId, roleId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning permission {PermissionId} to role {RoleId}", permissionId, roleId);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> RemovePermissionAsync(long roleId, long permissionId)
    {
        try
        {
            _logger.LogInformation("Removing permission {PermissionId} from role {RoleId}", permissionId, roleId);

            var rolePermission = await _context.Set<RolePermission>()
                .FirstOrDefaultAsync(rp => rp.RoleId == roleId.ToString() && rp.PermissionId == permissionId.ToString());

            if (rolePermission == null)
            {
                _logger.LogWarning("Role permission not found: Role {RoleId}, Permission {PermissionId}", roleId, permissionId);
                return false;
            }

            _context.Set<RolePermission>().Remove(rolePermission);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Permission {PermissionId} removed from role {RoleId} successfully", permissionId, roleId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing permission {PermissionId} from role {RoleId}", permissionId, roleId);
            return false;
        }
    }
}

/// <summary>
/// Password service implementation
/// </summary>
public class PasswordService : IPasswordService
{
    private readonly ILogger<PasswordService> _logger;

    public PasswordService(ILogger<PasswordService> logger)
    {
        _logger = logger;
    }

    public string HashPassword(string password, string? salt = null)
    {
        _logger.LogInformation("Hashing password");

        // Use BCrypt for secure password hashing
        // BCrypt generates its own salt, so we ignore the salt parameter
        return BCrypt.Net.BCrypt.HashPassword(password, 12);
    }

    public bool VerifyPassword(string password, string hash, string? salt = null)
    {
        _logger.LogInformation("Verifying password");

        try
        {
            // For BCrypt, we verify against the hash directly
            // The salt is embedded in the hash, so we don't use the salt parameter
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying password");
            return false;
        }
    }

    public string GenerateSalt()
    {
        _logger.LogInformation("Generating salt");

        // TODO: Implement salt generation logic
        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(Guid.NewGuid().ToString()));
    }

    public string GeneratePassword(int length = 12, bool includeSpecialChars = true)
    {
        _logger.LogInformation("Generating password of length {Length}", length);

        // TODO: Implement password generation logic
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const string specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

        var availableChars = includeSpecialChars ? chars + specialChars : chars;
        var random = new Random();

        return new string(Enumerable.Repeat(availableChars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    public PasswordValidationResult ValidatePassword(string password)
    {
        _logger.LogInformation("Validating password");

        // TODO: Implement password validation logic
        var isValid = !string.IsNullOrEmpty(password) && password.Length >= 8;
        return new PasswordValidationResult
        {
            IsValid = isValid,
            Errors = isValid ? new List<string>() : new List<string> { "Password must be at least 8 characters long" }
        };
    }

    public async Task<bool> IsPasswordReusedAsync(string userId, string password, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Checking password reuse for user {UserId}", userId);

        // TODO: Implement password reuse checking logic
        await Task.Delay(1, cancellationToken);

        return false;
    }

    /// <inheritdoc />
    public string HashPassword(string password)
    {
        return HashPassword(password, null);
    }

    /// <inheritdoc />
    public bool VerifyPassword(string password, string hash)
    {
        return VerifyPassword(password, hash, null);
    }

    /// <inheritdoc />
    public bool IsPasswordStrong(string password)
    {
        var result = ValidatePassword(password);
        return result.IsValid;
    }

    /// <inheritdoc />
    public string GenerateRandomPassword(int length = 12)
    {
        return GeneratePassword(length, true);
    }
}

/// <summary>
/// Security event service implementation
/// </summary>
public class SecurityEventService : ISecurityEventService
{
    private readonly ILogger<SecurityEventService> _logger;

    public SecurityEventService(ILogger<SecurityEventService> logger)
    {
        _logger = logger;
    }

    public async Task LogSecurityEventAsync(SecurityEvent securityEvent, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Logging security event: {EventType}", securityEvent.EventType);

        // TODO: Implement security event logging logic
        await Task.Delay(1, cancellationToken);
    }

    public async Task<IEnumerable<SecurityEvent>> GetSecurityEventsAsync(SecurityEventFilter filter, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting security events with filter");

        // TODO: Implement security event retrieval logic
        await Task.Delay(1, cancellationToken);

        return new List<SecurityEvent>();
    }

    public async Task<List<SecurityEvent>> GetUserSecurityEventsAsync(string userId, int count = 10)
    {
        _logger.LogInformation("Getting security events for user {UserId}, count {Count}", userId, count);

        // TODO: Implement user security events retrieval logic
        await Task.Delay(1);

        return new List<SecurityEvent>();
    }

    public async Task<bool> IsUserSuspiciousAsync(string userId)
    {
        _logger.LogInformation("Checking if user {UserId} is suspicious", userId);

        // TODO: Implement suspicious user detection logic
        await Task.Delay(1);

        return false;
    }

    public async Task<IEnumerable<SuspiciousActivity>> DetectSuspiciousActivityAsync(string userId, TimeSpan timeWindow, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Detecting suspicious activity for user {UserId} in time window {TimeWindow}", userId, timeWindow);

        // TODO: Implement suspicious activity detection logic
        await Task.Delay(1, cancellationToken);

        return new List<SuspiciousActivity>();
    }

    public async Task<IEnumerable<FailedLoginAttempt>> GetFailedLoginAttemptsAsync(string? userId = null, string? ipAddress = null, TimeSpan? timeWindow = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting failed login attempts for user {UserId} from IP {IpAddress}", userId, ipAddress);

        // TODO: Implement failed login attempts retrieval logic
        await Task.Delay(1, cancellationToken);

        return new List<FailedLoginAttempt>();
    }
}

/// <summary>
/// JWT token service implementation
/// </summary>
public class JwtTokenService : IJwtTokenService
{
    private readonly ILogger<JwtTokenService> _logger;
    private readonly IConfiguration _configuration;

    public JwtTokenService(ILogger<JwtTokenService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public string GenerateToken(string userId, string username, IEnumerable<string> roles, IEnumerable<string>? permissions = null)
    {
        _logger.LogInformation("Generating JWT token for user {UserId}", userId);

        var secretKey = _configuration["JwtSettings:SecretKey"] ?? "your-super-secret-key-that-is-at-least-32-characters-long";
        var issuer = _configuration["JwtSettings:Issuer"] ?? "GAIming";
        var audience = _configuration["JwtSettings:Audience"] ?? "GAIming-Users";
        var expiryMinutes = int.Parse(_configuration["JwtSettings:ExpiryMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Name, username),
            new("userId", userId),
            new("username", username)
        };

        // Add role claims
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        // Add permission claims
        if (permissions != null)
        {
            foreach (var permission in permissions)
            {
                claims.Add(new Claim("permission", permission));
            }
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public bool ValidateToken(string token)
    {
        _logger.LogInformation("Validating JWT token");

        try
        {
            var secretKey = _configuration["JwtSettings:SecretKey"] ?? "your-super-secret-key-that-is-at-least-32-characters-long";
            var issuer = _configuration["JwtSettings:Issuer"] ?? "GAIming";
            var audience = _configuration["JwtSettings:Audience"] ?? "GAIming-Users";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var tokenHandler = new JwtSecurityTokenHandler();

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = issuer,
                ValidAudience = audience,
                IssuerSigningKey = key,
                ClockSkew = TimeSpan.FromMinutes(5)
            };

            tokenHandler.ValidateToken(token, validationParameters, out _);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Token validation failed");
            return false;
        }
    }

    public string? GetUserIdFromToken(string token)
    {
        _logger.LogInformation("Getting user ID from token");

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            return jwtToken.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract user ID from token");
            return null;
        }
    }

    public string? GetUsernameFromToken(string token)
    {
        _logger.LogInformation("Getting username from token");

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            return jwtToken.Claims.FirstOrDefault(c => c.Type == "username")?.Value;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract username from token");
            return null;
        }
    }

    public IEnumerable<string> GetRolesFromToken(string token)
    {
        _logger.LogInformation("Getting roles from token");

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            return jwtToken.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract roles from token");
            return new List<string>();
        }
    }

    public IEnumerable<string> GetPermissionsFromToken(string token)
    {
        _logger.LogInformation("Getting permissions from token");

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            return jwtToken.Claims.Where(c => c.Type == "permission").Select(c => c.Value);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract permissions from token");
            return new List<string>();
        }
    }

    public string? GetClaimFromToken(string token, string claimType)
    {
        _logger.LogInformation("Getting claim {ClaimType} from token", claimType);

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            return jwtToken.Claims.FirstOrDefault(c => c.Type == claimType)?.Value;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract claim {ClaimType} from token", claimType);
            return null;
        }
    }

    public DateTime? GetTokenExpiration(string token)
    {
        _logger.LogInformation("Getting token expiration");

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            return jwtToken.ValidTo;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract expiration from token");
            return null;
        }
    }
}

/// <summary>
/// Refresh token service implementation
/// </summary>
public class RefreshTokenService : IRefreshTokenService
{
    private readonly ILogger<RefreshTokenService> _logger;

    public RefreshTokenService(ILogger<RefreshTokenService> logger)
    {
        _logger = logger;
    }

    public async Task<string> GenerateRefreshTokenAsync(string userId, string ipAddress)
    {
        _logger.LogInformation("Generating refresh token for user {UserId} from IP {IpAddress}", userId, ipAddress);

        // TODO: Implement refresh token generation logic
        await Task.Delay(1);

        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{userId}:{Guid.NewGuid()}:{DateTime.UtcNow:O}:{ipAddress}"));
    }

    public async Task<bool> ValidateRefreshTokenAsync(string refreshToken, string userId)
    {
        _logger.LogInformation("Validating refresh token for user {UserId}", userId);

        // TODO: Implement refresh token validation logic
        await Task.Delay(1);

        try
        {
            var decoded = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(refreshToken));
            var parts = decoded.Split(':');
            return parts.Length > 0 && parts[0] == userId;
        }
        catch
        {
            return false;
        }
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken, string revokedByIp, string reason)
    {
        _logger.LogInformation("Revoking refresh token from IP {IpAddress} for reason: {Reason}", revokedByIp, reason);

        // TODO: Implement refresh token revocation logic
        await Task.Delay(1);
    }

    public async Task RevokeAllRefreshTokensAsync(string userId, string revokedByIp, string reason)
    {
        _logger.LogInformation("Revoking all refresh tokens for user {UserId} from IP {IpAddress} for reason: {Reason}", userId, revokedByIp, reason);

        // TODO: Implement all refresh tokens revocation logic
        await Task.Delay(1);
    }

    public async Task CleanupExpiredTokensAsync()
    {
        _logger.LogInformation("Cleaning up expired refresh tokens");

        // TODO: Implement expired tokens cleanup logic
        await Task.Delay(1);
    }

    public async Task<string?> GetUserIdFromRefreshTokenAsync(string refreshToken)
    {
        _logger.LogInformation("Getting user ID from refresh token");

        // TODO: Implement user ID extraction from refresh token logic
        await Task.Delay(1);

        try
        {
            var decoded = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(refreshToken));
            return decoded.Split(':')[0];
        }
        catch
        {
            return null;
        }
    }
}
