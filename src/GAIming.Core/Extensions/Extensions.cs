using GAIming.Core.Entities;
using GAIming.Core.Models;
using GAIming.Core.ValueObjects;
using GAIming.Core.Enums;
using GAIming.Core.Interfaces;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace GAIming.Core.Extensions;

/// <summary>
/// Extension methods for entities
/// </summary>
public static class EntityExtensions
{
    /// <summary>
    /// Check if game is suitable for player based on risk level
    /// </summary>
    public static bool IsSuitableForPlayer(this Game game, Player player)
    {
        // High risk players should avoid high volatility games
        if (player.VIPLevel >= 4 && game.RTPPercentage < 95)
            return false;

        // New players should start with lower bet games
        if (player.RegistrationDate > DateTime.UtcNow.AddDays(-30) && game.MinBetAmount > 1.0m)
            return false;

        return game.IsActive && (!game.HideInLobby.HasValue || !game.HideInLobby.Value);
    }

    /// <summary>
    /// Get effective game settings considering overrides
    /// </summary>
    public static GameDto ToEffectiveGameDto(this Game game, GAIming.Core.Entities.GameManagementSettings? settings = null)
    {
        return new GameDto
        {
            GameId = game.GameID,
            GameName = game.GameName,
            ProviderId = game.ProviderID,
            ProviderName = game.Provider?.Name ?? "",
            GameTypeId = game.GameTypeID,
            GameTypeName = game.GameType?.Name ?? "",
            IsActive = settings?.IsActiveOverride ?? game.IsActive,
            IsMobile = settings?.IsMobileOverride ?? game.IsMobile,
            IsDesktop = settings?.IsDesktopOverride ?? game.IsDesktop,
            HideInLobby = settings?.HideInLobbyOverride ?? game.HideInLobby ?? false,
            GameOrder = settings?.GameOrderOverride ?? game.GameOrder,
            MinBetAmount = settings?.MinBetAmountOverride ?? game.MinBetAmount,
            RtpPercentage = game.RTPPercentage,
            ReleaseDate = game.ReleaseDate,
            UkCompliant = settings?.UkCompliantOverride ?? game.UKCompliant,
            JackpotContribution = settings?.JackpotContributionOverride ?? game.JackpotContribution,
            CreatedDate = game.CreatedDate,
            UpdatedDate = game.UpdatedDate,
            GameDescriptionOverride = settings?.GameDescriptionOverride,
            ImageUrlOverride = settings?.ImageUrlOverride,
            ThumbnailUrlOverride = settings?.ThumbnailUrlOverride,
            Notes = settings?.Notes
        };
    }

    /// <summary>
    /// Calculate player lifetime value
    /// </summary>
    public static decimal CalculateLifetimeValue(this Player player)
    {
        return player.TotalDeposits - player.TotalWithdrawals;
    }

    /// <summary>
    /// Get player risk category
    /// </summary>
    public static RiskCategory GetRiskCategory(this Player player)
    {
        var ltv = player.CalculateLifetimeValue();
        var daysSinceRegistration = (DateTime.UtcNow - player.RegistrationDate).TotalDays;
        var avgDailySpend = daysSinceRegistration > 0 ? (double)(ltv / (decimal)daysSinceRegistration) : 0;

        return avgDailySpend switch
        {
            > 100 => RiskCategory.Critical,
            > 50 => RiskCategory.High,
            > 20 => RiskCategory.Medium,
            _ => RiskCategory.Low
        };
    }

    /// <summary>
    /// Check if player is new
    /// </summary>
    public static bool IsNewPlayer(this Player player, int daysThreshold = 30)
    {
        return player.RegistrationDate > DateTime.UtcNow.AddDays(-daysThreshold);
    }

    /// <summary>
    /// Check if player is active
    /// </summary>
    public static bool IsActivePlayer(this Player player, int daysThreshold = 30)
    {
        return player.LastLoginDate.HasValue && 
               player.LastLoginDate > DateTime.UtcNow.AddDays(-daysThreshold);
    }

    /// <summary>
    /// Get recommendation performance grade
    /// </summary>
    public static string GetPerformanceGrade(this GameRecommendation recommendation)
    {
        if (recommendation.IsPlayed) return "A+";
        if (recommendation.IsClicked) return "A";
        if (recommendation.Score > 0.8) return "B+";
        if (recommendation.Score > 0.6) return "B";
        if (recommendation.Score > 0.4) return "C";
        return "D";
    }
}

/// <summary>
/// Extension methods for collections
/// </summary>
public static class CollectionExtensions
{
    /// <summary>
    /// Convert to paginated response
    /// </summary>
    public static PaginatedResponse<T> ToPaginatedResponse<T>(this IEnumerable<T> source, int page, int pageSize, int totalCount)
    {
        return new PaginatedResponse<T>
        {
            Items = source.ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    /// <summary>
    /// Shuffle collection randomly
    /// </summary>
    public static IEnumerable<T> Shuffle<T>(this IEnumerable<T> source)
    {
        var random = new Random();
        return source.OrderBy(x => random.Next());
    }

    /// <summary>
    /// Get top N items by score
    /// </summary>
    public static IEnumerable<T> TopByScore<T>(this IEnumerable<T> source, Func<T, double> scoreSelector, int count)
    {
        return source.OrderByDescending(scoreSelector).Take(count);
    }

    /// <summary>
    /// Calculate diversity score for recommendations
    /// </summary>
    public static double CalculateDiversityScore<T>(this IEnumerable<T> recommendations, Func<T, int> categorySelector)
    {
        var items = recommendations.ToList();
        if (!items.Any()) return 0;

        var categories = items.Select(categorySelector).Distinct().Count();
        var totalItems = items.Count;

        return (double)categories / totalItems;
    }

    /// <summary>
    /// Batch items into chunks
    /// </summary>
    public static IEnumerable<IEnumerable<T>> Batch<T>(this IEnumerable<T> source, int batchSize)
    {
        var batch = new List<T>(batchSize);
        foreach (var item in source)
        {
            batch.Add(item);
            if (batch.Count == batchSize)
            {
                yield return batch;
                batch = new List<T>(batchSize);
            }
        }
        if (batch.Any())
            yield return batch;
    }
}

/// <summary>
/// Extension methods for strings
/// </summary>
public static class StringExtensions
{
    /// <summary>
    /// Convert to title case
    /// </summary>
    public static string ToTitleCase(this string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        var words = input.Split(' ');
        for (int i = 0; i < words.Length; i++)
        {
            if (words[i].Length > 0)
            {
                words[i] = char.ToUpper(words[i][0]) + words[i][1..].ToLower();
            }
        }
        return string.Join(' ', words);
    }

    /// <summary>
    /// Truncate string to specified length
    /// </summary>
    public static string Truncate(this string input, int maxLength, string suffix = "...")
    {
        if (string.IsNullOrEmpty(input) || input.Length <= maxLength)
            return input;

        return input[..(maxLength - suffix.Length)] + suffix;
    }

    /// <summary>
    /// Generate hash for string
    /// </summary>
    public static string ToSHA256Hash(this string input)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    /// <summary>
    /// Check if string is valid JSON
    /// </summary>
    public static bool IsValidJson(this string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return false;

        try
        {
            JsonDocument.Parse(input);
            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Convert to slug (URL-friendly string)
    /// </summary>
    public static string ToSlug(this string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return input.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("_", "-")
            .Where(c => char.IsLetterOrDigit(c) || c == '-')
            .Aggregate(new StringBuilder(), (sb, c) => sb.Append(c))
            .ToString()
            .Trim('-');
    }
}

/// <summary>
/// Extension methods for DateTime
/// </summary>
public static class DateTimeExtensions
{
    /// <summary>
    /// Get start of day
    /// </summary>
    public static DateTime StartOfDay(this DateTime date)
    {
        return date.Date;
    }

    /// <summary>
    /// Get end of day
    /// </summary>
    public static DateTime EndOfDay(this DateTime date)
    {
        return date.Date.AddDays(1).AddTicks(-1);
    }

    /// <summary>
    /// Get start of week
    /// </summary>
    public static DateTime StartOfWeek(this DateTime date, DayOfWeek startOfWeek = DayOfWeek.Monday)
    {
        var diff = (7 + (date.DayOfWeek - startOfWeek)) % 7;
        return date.AddDays(-1 * diff).Date;
    }

    /// <summary>
    /// Get start of month
    /// </summary>
    public static DateTime StartOfMonth(this DateTime date)
    {
        return new DateTime(date.Year, date.Month, 1);
    }

    /// <summary>
    /// Get end of month
    /// </summary>
    public static DateTime EndOfMonth(this DateTime date)
    {
        return date.StartOfMonth().AddMonths(1).AddTicks(-1);
    }

    /// <summary>
    /// Check if date is in range
    /// </summary>
    public static bool IsInRange(this DateTime date, DateTime start, DateTime end)
    {
        return date >= start && date <= end;
    }

    /// <summary>
    /// Get age from birth date
    /// </summary>
    public static int GetAge(this DateTime birthDate)
    {
        var today = DateTime.Today;
        var age = today.Year - birthDate.Year;
        if (birthDate.Date > today.AddYears(-age))
            age--;
        return age;
    }

    /// <summary>
    /// Convert to Unix timestamp
    /// </summary>
    public static long ToUnixTimestamp(this DateTime date)
    {
        return ((DateTimeOffset)date).ToUnixTimeSeconds();
    }

    /// <summary>
    /// Get relative time string
    /// </summary>
    public static string ToRelativeTimeString(this DateTime date)
    {
        var timeSpan = DateTime.UtcNow - date;

        return timeSpan.TotalDays switch
        {
            > 365 => $"{(int)(timeSpan.TotalDays / 365)} year(s) ago",
            > 30 => $"{(int)(timeSpan.TotalDays / 30)} month(s) ago",
            > 7 => $"{(int)(timeSpan.TotalDays / 7)} week(s) ago",
            > 1 => $"{(int)timeSpan.TotalDays} day(s) ago",
            _ => timeSpan.TotalHours switch
            {
                > 1 => $"{(int)timeSpan.TotalHours} hour(s) ago",
                _ => timeSpan.TotalMinutes switch
                {
                    > 1 => $"{(int)timeSpan.TotalMinutes} minute(s) ago",
                    _ => "Just now"
                }
            }
        };
    }
}

/// <summary>
/// Extension methods for decimal/money calculations
/// </summary>
public static class DecimalExtensions
{
    /// <summary>
    /// Round to currency precision
    /// </summary>
    public static decimal ToCurrency(this decimal value)
    {
        return Math.Round(value, 2);
    }

    /// <summary>
    /// Calculate percentage
    /// </summary>
    public static decimal PercentageOf(this decimal value, decimal total)
    {
        return total == 0 ? 0 : (value / total) * 100;
    }

    /// <summary>
    /// Apply percentage
    /// </summary>
    public static decimal ApplyPercentage(this decimal value, decimal percentage)
    {
        return value * (percentage / 100);
    }

    /// <summary>
    /// Format as currency string
    /// </summary>
    public static string ToCurrencyString(this decimal value, string currency = "USD")
    {
        return $"{value:C} {currency}";
    }
}
