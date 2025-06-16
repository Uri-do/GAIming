using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using GAIming.Core.Models;

namespace GAIming.Api.Services;

public interface IJwtService
{
    string GenerateAccessToken(UserDto user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    bool ValidateRefreshToken(string refreshToken, string userId);
    void StoreRefreshToken(string userId, string refreshToken, DateTime expiration);
    void RevokeRefreshToken(string userId, string refreshToken);
}

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<JwtService> _logger;
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expirationMinutes;
    private readonly int _refreshTokenExpirationDays;

    // In-memory storage for refresh tokens (use Redis or database in production)
    private static readonly Dictionary<string, List<RefreshTokenInfo>> _refreshTokens = new();

    public JwtService(IConfiguration configuration, ILogger<JwtService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        
        var jwtSettings = _configuration.GetSection("JwtSettings");
        _secretKey = jwtSettings["SecretKey"] ?? "GAIming-Super-Secret-Key-For-Development-Only-2024!";
        _issuer = jwtSettings["Issuer"] ?? "GAIming.Api";
        _audience = jwtSettings["Audience"] ?? "GAIming.Client";
        _expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "60");
        _refreshTokenExpirationDays = int.Parse(jwtSettings["RefreshTokenExpirationDays"] ?? "7");
    }

    public string GenerateAccessToken(UserDto user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_secretKey);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserId),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new("display_name", user.DisplayName),
            new("user_id", user.UserId),
            new("email_confirmed", user.EmailConfirmed.ToString()),
            new("two_factor_enabled", user.TwoFactorEnabled.ToString())
        };

        // Add roles
        foreach (var role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        // Add permissions
        foreach (var permission in user.Permissions)
        {
            claims.Add(new Claim("permission", permission));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_expirationMinutes),
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey)),
            ValidateLifetime = false // Don't validate lifetime for expired tokens
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
            
            if (securityToken is not JwtSecurityToken jwtSecurityToken || 
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token");
            }

            return principal;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to validate expired token");
            return null;
        }
    }

    public bool ValidateRefreshToken(string refreshToken, string userId)
    {
        if (!_refreshTokens.ContainsKey(userId))
            return false;

        var userTokens = _refreshTokens[userId];
        var tokenInfo = userTokens.FirstOrDefault(t => t.Token == refreshToken);

        if (tokenInfo == null || tokenInfo.Expiration < DateTime.UtcNow)
        {
            // Remove expired token
            if (tokenInfo != null)
            {
                userTokens.Remove(tokenInfo);
            }
            return false;
        }

        return true;
    }

    public void StoreRefreshToken(string userId, string refreshToken, DateTime expiration)
    {
        if (!_refreshTokens.ContainsKey(userId))
        {
            _refreshTokens[userId] = new List<RefreshTokenInfo>();
        }

        var userTokens = _refreshTokens[userId];
        
        // Remove expired tokens
        userTokens.RemoveAll(t => t.Expiration < DateTime.UtcNow);
        
        // Add new token
        userTokens.Add(new RefreshTokenInfo
        {
            Token = refreshToken,
            Expiration = expiration,
            CreatedAt = DateTime.UtcNow
        });

        _logger.LogInformation("Stored refresh token for user {UserId}", userId);
    }

    public void RevokeRefreshToken(string userId, string refreshToken)
    {
        if (_refreshTokens.ContainsKey(userId))
        {
            var userTokens = _refreshTokens[userId];
            userTokens.RemoveAll(t => t.Token == refreshToken);
            
            if (!userTokens.Any())
            {
                _refreshTokens.Remove(userId);
            }
            
            _logger.LogInformation("Revoked refresh token for user {UserId}", userId);
        }
    }

    private class RefreshTokenInfo
    {
        public string Token { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
