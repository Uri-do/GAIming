using System.ComponentModel.DataAnnotations;

namespace GAIming.Core.Models;

/// <summary>
/// Login request model
/// </summary>
public class LoginRequest
{
    /// <summary>
    /// Username or email
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Password
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Remember me flag
    /// </summary>
    public bool RememberMe { get; set; }

    /// <summary>
    /// Two-factor authentication code
    /// </summary>
    public string? TwoFactorCode { get; set; }
}

/// <summary>
/// Registration request model
/// </summary>
public class RegisterRequest
{
    /// <summary>
    /// Username
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Email address
    /// </summary>
    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Password
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Confirm password
    /// </summary>
    [Required]
    [Compare(nameof(Password))]
    public string ConfirmPassword { get; set; } = string.Empty;

    /// <summary>
    /// First name
    /// </summary>
    [StringLength(100)]
    public string? FirstName { get; set; }

    /// <summary>
    /// Last name
    /// </summary>
    [StringLength(100)]
    public string? LastName { get; set; }

    /// <summary>
    /// Accept terms and conditions
    /// </summary>
    [Required]
    public bool AcceptTerms { get; set; }
}

/// <summary>
/// Registration response model
/// </summary>
public class RegisterResponse
{
    /// <summary>
    /// Registration success status
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Response message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Registered user information
    /// </summary>
    public UserDto? User { get; set; }

    /// <summary>
    /// Whether email confirmation is required
    /// </summary>
    public bool RequiresEmailConfirmation { get; set; }

    /// <summary>
    /// Authentication tokens (if registration is complete)
    /// </summary>
    public AuthTokens? Tokens { get; set; }
}

/// <summary>
/// User session information
/// </summary>
public class UserSessionDto
{
    /// <summary>
    /// Session ID
    /// </summary>
    public string SessionId { get; set; } = string.Empty;

    /// <summary>
    /// User ID
    /// </summary>
    public long UserId { get; set; }

    /// <summary>
    /// Device name/type
    /// </summary>
    public string DeviceName { get; set; } = string.Empty;

    /// <summary>
    /// IP address
    /// </summary>
    public string IpAddress { get; set; } = string.Empty;

    /// <summary>
    /// User agent string
    /// </summary>
    public string UserAgent { get; set; } = string.Empty;

    /// <summary>
    /// Session start time
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// Last activity time
    /// </summary>
    public DateTime LastActivity { get; set; }

    /// <summary>
    /// Whether this is the current session
    /// </summary>
    public bool IsCurrent { get; set; }

    /// <summary>
    /// Whether the session is active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Session expiry time
    /// </summary>
    public DateTime? ExpiryTime { get; set; }

    /// <summary>
    /// Location information (if available)
    /// </summary>
    public string? Location { get; set; }
}

/// <summary>
/// User DTO for API responses
/// </summary>
public class UserDto
{
    public long Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Title { get; set; }
    public bool IsActive { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public DateTime? LastLogin { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}

/// <summary>
/// Role DTO for API responses
/// </summary>
public class RoleDto
{
    public long Id { get; set; }
    public string RoleId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystemRole { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }
    public List<PermissionDto> Permissions { get; set; } = new();
}

/// <summary>
/// Permission DTO for API responses
/// </summary>
public class PermissionDto
{
    public long Id { get; set; }
    public string PermissionId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Resource { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
}

/// <summary>
/// Authentication tokens model
/// </summary>
public class AuthTokens
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public long ExpiresAt { get; set; }
    public string TokenType { get; set; } = "Bearer";
}

/// <summary>
/// Authentication result
/// </summary>
public class AuthenticationResult
{
    /// <summary>
    /// Indicates if authentication was successful
    /// </summary>
    public bool IsSuccess { get; set; }

    /// <summary>
    /// Error message if authentication failed
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// JWT token if authentication was successful
    /// </summary>
    public JwtToken? Token { get; set; }

    /// <summary>
    /// User information
    /// </summary>
    public UserInfo? User { get; set; }

    /// <summary>
    /// Indicates if two-factor authentication is required
    /// </summary>
    public bool RequiresTwoFactor { get; set; }

    /// <summary>
    /// Indicates if password change is required
    /// </summary>
    public bool RequiresPasswordChange { get; set; }
}

/// <summary>
/// JWT token model
/// </summary>
public class JwtToken
{
    /// <summary>
    /// Access token
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Refresh token
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// Token expiration time
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Refresh token expiration time
    /// </summary>
    public DateTime RefreshExpiresAt { get; set; }

    /// <summary>
    /// Token type (usually "Bearer")
    /// </summary>
    public string TokenType { get; set; } = "Bearer";

    /// <summary>
    /// Token scopes
    /// </summary>
    public List<string> Scopes { get; set; } = new();
}

/// <summary>
/// User information model
/// </summary>
public class UserInfo
{
    /// <summary>
    /// User ID
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Username
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Email address
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Display name
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// First name
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// Last name
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// User roles
    /// </summary>
    public List<string> Roles { get; set; } = new();

    /// <summary>
    /// User permissions
    /// </summary>
    public List<string> Permissions { get; set; } = new();

    /// <summary>
    /// Indicates if the user is active
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Last login time
    /// </summary>
    public DateTime? LastLogin { get; set; }
}

/// <summary>
/// Change password request
/// </summary>
public class ChangePasswordRequest
{
    /// <summary>
    /// Current password
    /// </summary>
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    /// <summary>
    /// New password
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string NewPassword { get; set; } = string.Empty;

    /// <summary>
    /// Confirm new password
    /// </summary>
    [Required]
    [Compare(nameof(NewPassword))]
    public string ConfirmPassword { get; set; } = string.Empty;
}

/// <summary>
/// Reset password request
/// </summary>
public class ResetPasswordRequest
{
    /// <summary>
    /// Email address
    /// </summary>
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Reset token
    /// </summary>
    [Required]
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// New password
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string NewPassword { get; set; } = string.Empty;

    /// <summary>
    /// Confirm new password
    /// </summary>
    [Required]
    [Compare(nameof(NewPassword))]
    public string ConfirmPassword { get; set; } = string.Empty;
}

/// <summary>
/// Token information model
/// </summary>
public class TokenInfo
{
    /// <summary>
    /// Access token
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Refresh token
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// Token type (usually "Bearer")
    /// </summary>
    public string TokenType { get; set; } = "Bearer";

    /// <summary>
    /// Access token expiration time
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Refresh token expiration time
    /// </summary>
    public DateTime RefreshExpiresAt { get; set; }
}

/// <summary>
/// Login response model
/// </summary>
public class LoginResponse
{
    /// <summary>
    /// Login success status
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Access token
    /// </summary>
    public string? AccessToken { get; set; }

    /// <summary>
    /// Refresh token
    /// </summary>
    public string? RefreshToken { get; set; }

    /// <summary>
    /// Token expiration time
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// User information
    /// </summary>
    public UserDto? User { get; set; }

    /// <summary>
    /// User roles
    /// </summary>
    public List<string> Roles { get; set; } = new();

    /// <summary>
    /// User permissions
    /// </summary>
    public List<string> Permissions { get; set; } = new();

    /// <summary>
    /// Response message
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// Whether two-factor authentication is required
    /// </summary>
    public bool RequiresTwoFactor { get; set; }
}

/// <summary>
/// Password reset confirmation request
/// </summary>
public class PasswordResetConfirmRequest
{
    /// <summary>
    /// Reset token
    /// </summary>
    [Required]
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// New password
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string NewPassword { get; set; } = string.Empty;

    /// <summary>
    /// Confirm new password
    /// </summary>
    [Required]
    [Compare(nameof(NewPassword))]
    public string ConfirmPassword { get; set; } = string.Empty;
}

/// <summary>
/// Create user request
/// </summary>
public class CreateUserRequest
{
    /// <summary>
    /// Username
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Email address
    /// </summary>
    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Display name
    /// </summary>
    [Required]
    [StringLength(255)]
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// First name
    /// </summary>
    [StringLength(100)]
    public string? FirstName { get; set; }

    /// <summary>
    /// Last name
    /// </summary>
    [StringLength(100)]
    public string? LastName { get; set; }

    /// <summary>
    /// Department
    /// </summary>
    [StringLength(100)]
    public string? Department { get; set; }

    /// <summary>
    /// Job title
    /// </summary>
    [StringLength(100)]
    public string? Title { get; set; }

    /// <summary>
    /// Password
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Role IDs to assign
    /// </summary>
    public List<string> RoleIds { get; set; } = new();

    /// <summary>
    /// Send welcome email
    /// </summary>
    public bool SendWelcomeEmail { get; set; } = true;
}

/// <summary>
/// Update user request
/// </summary>
public class UpdateUserRequest
{
    /// <summary>
    /// Email address
    /// </summary>
    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Display name
    /// </summary>
    [Required]
    [StringLength(255)]
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// First name
    /// </summary>
    [StringLength(100)]
    public string? FirstName { get; set; }

    /// <summary>
    /// Last name
    /// </summary>
    [StringLength(100)]
    public string? LastName { get; set; }

    /// <summary>
    /// Department
    /// </summary>
    [StringLength(100)]
    public string? Department { get; set; }

    /// <summary>
    /// Job title
    /// </summary>
    [StringLength(100)]
    public string? Title { get; set; }

    /// <summary>
    /// Indicates if the user is active
    /// </summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Create role request
/// </summary>
public class CreateRoleRequest
{
    /// <summary>
    /// Role name
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Role description
    /// </summary>
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Permission IDs to assign
    /// </summary>
    public List<string> PermissionIds { get; set; } = new();
}

/// <summary>
/// Update role request
/// </summary>
public class UpdateRoleRequest
{
    /// <summary>
    /// Role name
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Role description
    /// </summary>
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Indicates if the role is active
    /// </summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Password validation result
/// </summary>
public class PasswordValidationResult
{
    /// <summary>
    /// Indicates if the password is valid
    /// </summary>
    public bool IsValid { get; set; }

    /// <summary>
    /// Validation errors
    /// </summary>
    public List<string> Errors { get; set; } = new();

    /// <summary>
    /// Password strength score (0-100)
    /// </summary>
    public int StrengthScore { get; set; }

    /// <summary>
    /// Password strength level
    /// </summary>
    public PasswordStrength Strength { get; set; }
}

/// <summary>
/// Password strength levels
/// </summary>
public enum PasswordStrength
{
    /// <summary>
    /// Very weak password
    /// </summary>
    VeryWeak = 0,

    /// <summary>
    /// Weak password
    /// </summary>
    Weak = 1,

    /// <summary>
    /// Fair password
    /// </summary>
    Fair = 2,

    /// <summary>
    /// Good password
    /// </summary>
    Good = 3,

    /// <summary>
    /// Strong password
    /// </summary>
    Strong = 4,

    /// <summary>
    /// Very strong password
    /// </summary>
    VeryStrong = 5
}

/// <summary>
/// Password reset request
/// </summary>
public class PasswordResetRequest
{
    /// <summary>
    /// Email address
    /// </summary>
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Callback URL for password reset
    /// </summary>
    public string? CallbackUrl { get; set; }
}

/// <summary>
/// Email confirmation request
/// </summary>
public class EmailConfirmationRequest
{
    /// <summary>
    /// Email address
    /// </summary>
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Confirmation token
    /// </summary>
    [Required]
    public string Token { get; set; } = string.Empty;
}

/// <summary>
/// Two-factor setup request
/// </summary>
public class TwoFactorSetupRequest
{
    /// <summary>
    /// User ID
    /// </summary>
    [Required]
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Enable or disable two-factor authentication
    /// </summary>
    public bool Enable { get; set; }

    /// <summary>
    /// Authenticator code for verification
    /// </summary>
    public string? AuthenticatorCode { get; set; }
}

/// <summary>
/// Two-factor setup response
/// </summary>
public class TwoFactorSetupResponse
{
    /// <summary>
    /// Indicates if two-factor authentication is enabled
    /// </summary>
    public bool IsEnabled { get; set; }

    /// <summary>
    /// QR code URI for authenticator apps
    /// </summary>
    public string? QrCodeUri { get; set; }

    /// <summary>
    /// Manual entry key for authenticator apps
    /// </summary>
    public string? ManualEntryKey { get; set; }

    /// <summary>
    /// Recovery codes for backup access
    /// </summary>
    public List<string> RecoveryCodes { get; set; } = new();
}
