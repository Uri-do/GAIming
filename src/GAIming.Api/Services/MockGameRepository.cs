using GAIming.Core.Interfaces;
using GAIming.Core.Entities;
using GAIming.Core.Models;
using System.Linq.Expressions;

namespace GAIming.Api.Services;

/// <summary>
/// Mock implementation of game repository
/// </summary>
public class MockGameRepository : IGameRepository
{
    private readonly ILogger<MockGameRepository> _logger;

    public MockGameRepository(ILogger<MockGameRepository> logger)
    {
        _logger = logger;
    }

    public async Task<Game?> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting game by ID: {Id}", id);
        await Task.Delay(10, cancellationToken);

        if (id is int gameId)
        {
            return new Game
            {
                GameID = gameId,
                GameName = $"Game {gameId}",
                ProviderID = 1,
                GameTypeID = 1,
                IsActive = true,
                IsMobile = true,
                IsDesktop = true,
                MinBetAmount = 0.10m,
                RTPPercentage = 95.5,
                CreatedDate = DateTime.UtcNow,
                Provider = new GameProvider { ProviderID = 1, Name = "Provider 1" },
                GameType = new GameType { GameTypeID = 1, Name = "Slot" },
                VolatilityID = 2,
                PopularityScore = 0.8,
                GrowthRate = 0.15,
                TotalPlayers = 1000,
                ReleaseDate = DateTime.UtcNow.AddDays(-30)
            };
        }

        return null;
    }

    public async Task<IEnumerable<Game>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting all games");
        await Task.Delay(20, cancellationToken);

        var games = new List<Game>();
        for (int i = 1; i <= 50; i++)
        {
            games.Add(new Game
            {
                GameID = i,
                GameName = $"Game {i}",
                ProviderID = (i % 5) + 1,
                GameTypeID = (i % 3) + 1,
                IsActive = true,
                IsMobile = true,
                IsDesktop = true,
                MinBetAmount = 0.10m,
                RTPPercentage = 95.0 + (i % 5),
                CreatedDate = DateTime.UtcNow.AddDays(-i),
                VolatilityID = (i % 3) + 1,
                PopularityScore = 0.5 + (i % 10) * 0.05,
                GrowthRate = 0.1 + (i % 5) * 0.02,
                TotalPlayers = 500 + (i * 10)
            });
        }

        return games;
    }

    public async Task<PaginatedResponse<Game>> SearchGamesAsync(GameSearchRequest request)
    {
        _logger.LogInformation("Searching games with request: {@Request}", request);
        await Task.Delay(30);

        var allGames = await GetAllAsync();
        var filteredGames = allGames.AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            filteredGames = filteredGames.Where(g => g.GameName.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase));
        }

        if (request.ProviderId.HasValue)
        {
            filteredGames = filteredGames.Where(g => g.ProviderID == request.ProviderId.Value);
        }

        if (request.GameTypeId.HasValue)
        {
            filteredGames = filteredGames.Where(g => g.GameTypeID == request.GameTypeId.Value);
        }

        if (request.IsActive.HasValue)
        {
            filteredGames = filteredGames.Where(g => g.IsActive == request.IsActive.Value);
        }

        var totalCount = filteredGames.Count();
        var games = filteredGames.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToList();

        return new PaginatedResponse<Game>
        {
            Items = games,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    public async Task<IEnumerable<Game>> GetGamesByProviderAsync(int providerId)
    {
        _logger.LogInformation("Getting games by provider: {ProviderId}", providerId);
        var allGames = await GetAllAsync();
        return allGames.Where(g => g.ProviderID == providerId);
    }

    public async Task<IEnumerable<Game>> GetGamesByTypeAsync(int gameTypeId)
    {
        _logger.LogInformation("Getting games by type: {GameTypeId}", gameTypeId);
        var allGames = await GetAllAsync();
        return allGames.Where(g => g.GameTypeID == gameTypeId);
    }

    public async Task<IEnumerable<Game>> GetActiveGamesAsync()
    {
        _logger.LogInformation("Getting active games");
        var allGames = await GetAllAsync();
        return allGames.Where(g => g.IsActive);
    }

    public async Task<IEnumerable<Game>> GetFeaturedGamesAsync()
    {
        _logger.LogInformation("Getting featured games");
        var allGames = await GetAllAsync();
        return allGames.Where(g => g.IsActive).Take(10);
    }

    public async Task<Game?> GetGameByNameAsync(string gameName)
    {
        _logger.LogInformation("Getting game by name: {GameName}", gameName);
        var allGames = await GetAllAsync();
        return allGames.FirstOrDefault(g => g.GameName.Equals(gameName, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<IEnumerable<Game>> GetGamesByTagsAsync(List<string> tags)
    {
        _logger.LogInformation("Getting games by tags: {Tags}", string.Join(", ", tags));
        var allGames = await GetAllAsync();
        return allGames.Take(10); // Mock implementation
    }

    public async Task<IEnumerable<Game>> GetTrendingGamesAsync(string timeframe, int count, long? playerId = null)
    {
        _logger.LogInformation("Getting trending games for timeframe: {Timeframe}, count: {Count}, playerId: {PlayerId}", timeframe, count, playerId);
        await Task.Delay(25);

        var allGames = await GetAllAsync();
        return allGames.Where(g => g.IsActive)
                      .OrderByDescending(g => g.PopularityScore)
                      .Take(count);
    }

    // IRepository implementation
    public async Task<IEnumerable<Game>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting paged games: page {Page}, pageSize {PageSize}", page, pageSize);
        var allGames = await GetAllAsync(cancellationToken);
        return allGames.Skip((page - 1) * pageSize).Take(pageSize);
    }

    public async Task<IEnumerable<Game>> FindAsync(Expression<Func<Game, bool>> predicate, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Finding games with predicate");
        var allGames = await GetAllAsync(cancellationToken);
        return allGames.AsQueryable().Where(predicate);
    }

    public async Task<Game?> FirstOrDefaultAsync(Expression<Func<Game, bool>> predicate, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Finding first game with predicate");
        var allGames = await GetAllAsync(cancellationToken);
        return allGames.AsQueryable().FirstOrDefault(predicate);
    }

    public async Task<bool> AnyAsync(Expression<Func<Game, bool>> predicate, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Checking if any game matches predicate");
        var allGames = await GetAllAsync(cancellationToken);
        return allGames.AsQueryable().Any(predicate);
    }

    public async Task<int> CountAsync(Expression<Func<Game, bool>>? predicate = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Counting games");
        var allGames = await GetAllAsync(cancellationToken);
        return predicate == null ? allGames.Count() : allGames.AsQueryable().Count(predicate);
    }

    public async Task<Game> AddAsync(Game entity, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Adding game: {GameName}", entity.GameName);
        await Task.CompletedTask;
        return entity;
    }

    public async Task AddRangeAsync(IEnumerable<Game> entities, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Adding {Count} games", entities.Count());
        await Task.CompletedTask;
    }

    public async Task UpdateAsync(Game entity, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating game: {GameId}", entity.GameID);
        await Task.CompletedTask;
    }

    public async Task UpdateRangeAsync(IEnumerable<Game> entities, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating {Count} games", entities.Count());
        await Task.CompletedTask;
    }

    public async Task RemoveAsync(Game entity, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Removing game: {GameId}", entity.GameID);
        await Task.CompletedTask;
    }

    public async Task RemoveRangeAsync(IEnumerable<Game> entities, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Removing {Count} games", entities.Count());
        await Task.CompletedTask;
    }

    public async Task RemoveByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Removing game by ID: {Id}", id);
        await Task.CompletedTask;
    }

    public async Task<IEnumerable<Game>> GetWithIncludesAsync(params Expression<Func<Game, object>>[] includes)
    {
        _logger.LogInformation("Getting games with includes");
        return await GetAllAsync();
    }

    public async Task<IEnumerable<Game>> FindWithIncludesAsync(Expression<Func<Game, bool>> predicate, params Expression<Func<Game, object>>[] includes)
    {
        _logger.LogInformation("Finding games with includes");
        var allGames = await GetAllAsync();
        return allGames.AsQueryable().Where(predicate);
    }

    public async Task<IEnumerable<Game>> GetOrderedAsync<TKey>(Expression<Func<Game, TKey>> orderBy, bool ascending = true, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting ordered games");
        var allGames = await GetAllAsync(cancellationToken);
        return ascending ? allGames.AsQueryable().OrderBy(orderBy) : allGames.AsQueryable().OrderByDescending(orderBy);
    }

    public async Task<IEnumerable<Game>> GetAsync(
        Expression<Func<Game, bool>>? filter = null,
        Func<IQueryable<Game>, IOrderedQueryable<Game>>? orderBy = null,
        string includeProperties = "",
        int? skip = null,
        int? take = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting games with complex query");
        var allGames = await GetAllAsync(cancellationToken);
        var query = allGames.AsQueryable();

        if (filter != null)
            query = query.Where(filter);

        if (orderBy != null)
            query = orderBy(query);

        if (skip.HasValue)
            query = query.Skip(skip.Value);

        if (take.HasValue)
            query = query.Take(take.Value);

        return query;
    }
}
