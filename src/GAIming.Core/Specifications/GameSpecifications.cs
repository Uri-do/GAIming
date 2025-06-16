using GAIming.Core.Entities;
using GAIming.Core.Models;

namespace GAIming.Core.Specifications;

/// <summary>
/// Specification for active games
/// </summary>
public class ActiveGamesSpecification : BaseSpecification<Game>
{
    public ActiveGamesSpecification() : base(g => g.IsActive)
    {
        AddInclude(g => g.Provider!);
        AddInclude(g => g.GameType!);
        ApplyOrderBy(g => g.GameName);
    }
}

/// <summary>
/// Specification for games by provider
/// </summary>
public class GamesByProviderSpecification : BaseSpecification<Game>
{
    public GamesByProviderSpecification(int providerId) 
        : base(g => g.ProviderID == providerId)
    {
        AddInclude(g => g.Provider!);
        AddInclude(g => g.GameType!);
        ApplyOrderBy(g => g.GameName);
    }
}

/// <summary>
/// Specification for games by type
/// </summary>
public class GamesByTypeSpecification : BaseSpecification<Game>
{
    public GamesByTypeSpecification(int gameTypeId) 
        : base(g => g.GameTypeID == gameTypeId)
    {
        AddInclude(g => g.Provider!);
        AddInclude(g => g.GameType!);
        ApplyOrderBy(g => g.GameName);
    }
}

/// <summary>
/// Specification for mobile-compatible games
/// </summary>
public class MobileGamesSpecification : BaseSpecification<Game>
{
    public MobileGamesSpecification() : base(g => g.IsMobile && g.IsActive)
    {
        AddInclude(g => g.Provider!);
        AddInclude(g => g.GameType!);
        ApplyOrderBy(g => g.GameOrder);
    }
}

/// <summary>
/// Specification for games with high RTP
/// </summary>
public class HighRTPGamesSpecification : BaseSpecification<Game>
{
    public HighRTPGamesSpecification(double minRtp = 96.0) 
        : base(g => g.RTPPercentage.HasValue && g.RTPPercentage >= minRtp && g.IsActive)
    {
        AddInclude(g => g.Provider!);
        AddInclude(g => g.GameType!);
        ApplyOrderByDescending(g => g.RTPPercentage!);
    }
}

/// <summary>
/// Specification for games by bet range
/// </summary>
public class GamesByBetRangeSpecification : BaseSpecification<Game>
{
    public GamesByBetRangeSpecification(decimal minBet, decimal maxBet) 
        : base(g => g.MinBetAmount >= minBet && g.MinBetAmount <= maxBet && g.IsActive)
    {
        AddInclude(g => g.Provider!);
        AddInclude(g => g.GameType!);
        ApplyOrderBy(g => g.MinBetAmount);
    }
}

/// <summary>
/// Specification for recently released games
/// </summary>
public class RecentGamesSpecification : BaseSpecification<Game>
{
    public RecentGamesSpecification(int daysBack = 30) 
        : base(g => g.ReleaseDate.HasValue && 
                   g.ReleaseDate >= DateTime.UtcNow.AddDays(-daysBack) && 
                   g.IsActive)
    {
        AddInclude(g => g.Provider!);
        AddInclude(g => g.GameType!);
        ApplyOrderByDescending(g => g.ReleaseDate!);
    }
}

/// <summary>
/// Specification for UK compliant games
/// </summary>
public class UKCompliantGamesSpecification : BaseSpecification<Game>
{
    public UKCompliantGamesSpecification() : base(g => g.UKCompliant && g.IsActive)
    {
        AddInclude(g => g.Provider!);
        AddInclude(g => g.GameType!);
        ApplyOrderBy(g => g.GameName);
    }
}

/// <summary>
/// Specification for games with jackpot contribution
/// </summary>
public class JackpotGamesSpecification : BaseSpecification<Game>
{
    public JackpotGamesSpecification() 
        : base(g => g.JackpotContribution.HasValue && g.JackpotContribution > 0 && g.IsActive)
    {
        AddInclude(g => g.Provider!);
        AddInclude(g => g.GameType!);
        ApplyOrderByDescending(g => g.JackpotContribution!);
    }
}

/// <summary>
/// Specification for games not hidden in lobby
/// </summary>
public class LobbyVisibleGamesSpecification : BaseSpecification<Game>
{
    public LobbyVisibleGamesSpecification() 
        : base(g => g.IsActive && (!g.HideInLobby.HasValue || !g.HideInLobby.Value))
    {
        AddInclude(g => g.Provider!);
        AddInclude(g => g.GameType!);
        ApplyOrderBy(g => g.GameOrder);
    }
}

/// <summary>
/// Complex specification for game search
/// </summary>
public class GameSearchSpecification : BaseSpecification<Game>
{
    public GameSearchSpecification(GameSearchRequest request) 
        : base(BuildCriteria(request))
    {
        AddInclude(g => g.Provider!);
        AddInclude(g => g.GameType!);

        // Apply sorting
        if (!string.IsNullOrEmpty(request.SortBy))
        {
            switch (request.SortBy.ToLowerInvariant())
            {
                case "gamename":
                    if (request.SortDirection?.ToLowerInvariant() == "desc")
                        ApplyOrderByDescending(g => g.GameName);
                    else
                        ApplyOrderBy(g => g.GameName);
                    break;
                case "provider":
                    if (request.SortDirection?.ToLowerInvariant() == "desc")
                        ApplyOrderByDescending(g => g.Provider!.Name);
                    else
                        ApplyOrderBy(g => g.Provider!.Name);
                    break;
                case "rtp":
                    if (request.SortDirection?.ToLowerInvariant() == "desc")
                        ApplyOrderByDescending(g => g.RTPPercentage ?? 0);
                    else
                        ApplyOrderBy(g => g.RTPPercentage ?? 0);
                    break;
                case "releasedate":
                    if (request.SortDirection?.ToLowerInvariant() == "desc")
                        ApplyOrderByDescending(g => g.ReleaseDate ?? DateTime.MinValue);
                    else
                        ApplyOrderBy(g => g.ReleaseDate ?? DateTime.MinValue);
                    break;
                default:
                    ApplyOrderBy(g => g.GameName);
                    break;
            }
        }
        else
        {
            ApplyOrderBy(g => g.GameName);
        }

        // Apply paging
        if (request.Page > 0 && request.PageSize > 0)
        {
            ApplyPaging((request.Page - 1) * request.PageSize, request.PageSize);
        }
    }

    private static System.Linq.Expressions.Expression<Func<Game, bool>> BuildCriteria(GameSearchRequest request)
    {
        var parameter = System.Linq.Expressions.Expression.Parameter(typeof(Game), "g");
        System.Linq.Expressions.Expression? expression = null;

        // Search term
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLowerInvariant();
            var nameProperty = System.Linq.Expressions.Expression.Property(parameter, nameof(Game.GameName));
            var toLowerMethod = typeof(string).GetMethod("ToLowerInvariant")!;
            var nameToLower = System.Linq.Expressions.Expression.Call(nameProperty, toLowerMethod);
            var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) })!;
            var searchExpression = System.Linq.Expressions.Expression.Call(nameToLower, containsMethod, System.Linq.Expressions.Expression.Constant(searchTerm));
            expression = searchExpression;
        }

        // Provider filter
        if (request.ProviderIds?.Any() == true)
        {
            var providerProperty = System.Linq.Expressions.Expression.Property(parameter, nameof(Game.ProviderID));
            var providerExpression = BuildInExpression(providerProperty, request.ProviderIds);
            expression = expression == null ? providerExpression : System.Linq.Expressions.Expression.AndAlso(expression, providerExpression);
        }

        // Game type filter
        if (request.GameTypeIds?.Any() == true)
        {
            var gameTypeProperty = System.Linq.Expressions.Expression.Property(parameter, nameof(Game.GameTypeID));
            var gameTypeExpression = BuildInExpression(gameTypeProperty, request.GameTypeIds);
            expression = expression == null ? gameTypeExpression : System.Linq.Expressions.Expression.AndAlso(expression, gameTypeExpression);
        }

        // Active filter
        if (request.IsActive.HasValue)
        {
            var activeProperty = System.Linq.Expressions.Expression.Property(parameter, nameof(Game.IsActive));
            var activeExpression = System.Linq.Expressions.Expression.Equal(activeProperty, System.Linq.Expressions.Expression.Constant(request.IsActive.Value));
            expression = expression == null ? activeExpression : System.Linq.Expressions.Expression.AndAlso(expression, activeExpression);
        }

        // Mobile filter
        if (request.IsMobile.HasValue)
        {
            var mobileProperty = System.Linq.Expressions.Expression.Property(parameter, nameof(Game.IsMobile));
            var mobileExpression = System.Linq.Expressions.Expression.Equal(mobileProperty, System.Linq.Expressions.Expression.Constant(request.IsMobile.Value));
            expression = expression == null ? mobileExpression : System.Linq.Expressions.Expression.AndAlso(expression, mobileExpression);
        }

        // RTP range filter
        if (request.RtpFrom.HasValue || request.RtpTo.HasValue)
        {
            var rtpProperty = System.Linq.Expressions.Expression.Property(parameter, nameof(Game.RTPPercentage));
            
            if (request.RtpFrom.HasValue)
            {
                var rtpFromExpression = System.Linq.Expressions.Expression.GreaterThanOrEqual(rtpProperty, System.Linq.Expressions.Expression.Constant(request.RtpFrom.Value, typeof(double?)));
                expression = expression == null ? rtpFromExpression : System.Linq.Expressions.Expression.AndAlso(expression, rtpFromExpression);
            }

            if (request.RtpTo.HasValue)
            {
                var rtpToExpression = System.Linq.Expressions.Expression.LessThanOrEqual(rtpProperty, System.Linq.Expressions.Expression.Constant(request.RtpTo.Value, typeof(double?)));
                expression = expression == null ? rtpToExpression : System.Linq.Expressions.Expression.AndAlso(expression, rtpToExpression);
            }
        }

        // Default to true if no criteria
        expression ??= System.Linq.Expressions.Expression.Constant(true);

        return System.Linq.Expressions.Expression.Lambda<Func<Game, bool>>(expression, parameter);
    }

    private static System.Linq.Expressions.Expression BuildInExpression(System.Linq.Expressions.MemberExpression property, IEnumerable<int> values)
    {
        var valuesList = values.ToList();
        if (!valuesList.Any())
            return System.Linq.Expressions.Expression.Constant(true);

        var containsMethod = typeof(List<int>).GetMethod("Contains")!;
        var valuesConstant = System.Linq.Expressions.Expression.Constant(valuesList);
        return System.Linq.Expressions.Expression.Call(valuesConstant, containsMethod, property);
    }
}
