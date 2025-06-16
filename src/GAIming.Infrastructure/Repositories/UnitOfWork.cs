using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using GAIming.Core.Interfaces;
using GAIming.Core.Events;
using GAIming.Core.Entities;
using GAIming.Infrastructure.Data;

namespace GAIming.Infrastructure.Repositories;

/// <summary>
/// Unit of Work implementation for managing transactions and repositories
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private readonly Dictionary<Type, object> _repositories;
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    /// <summary>
    /// Initializes a new instance of the UnitOfWork class
    /// </summary>
    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _repositories = new Dictionary<Type, object>();
    }

    /// <inheritdoc />
    public IRepository<T> Repository<T>() where T : class
    {
        var type = typeof(T);

        if (_repositories.ContainsKey(type))
        {
            return (IRepository<T>)_repositories[type];
        }

        // Create specific repository implementations for known types
        var repository = CreateRepository<T>();
        _repositories[type] = repository;

        return repository;
    }

    /// <summary>
    /// Creates a repository instance for the specified type
    /// </summary>
    private IRepository<T> CreateRepository<T>() where T : class
    {
        var type = typeof(T);

        // Return specific repository implementations for known types
        if (type == typeof(GAIming.Core.Entities.DomainEntity))
        {
            return (IRepository<T>)new DomainEntityRepository(_context);
        }

        if (type == typeof(GAIming.Core.Entities.AuditLog))
        {
            return (IRepository<T>)new AuditRepository(_context);
        }

        // Return generic repository for other types
        return new Repository<T>(_context);
    }

    /// <inheritdoc />
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            // Handle concurrency conflicts
            throw new InvalidOperationException("A concurrency conflict occurred while saving changes.", ex);
        }
        catch (DbUpdateException ex)
        {
            // Handle database update errors
            throw new InvalidOperationException("An error occurred while saving changes to the database.", ex);
        }
    }

    /// <inheritdoc />
    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            throw new InvalidOperationException("A transaction is already in progress.");
        }

        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction == null)
        {
            throw new InvalidOperationException("No transaction is in progress.");
        }

        try
        {
            await _transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await _transaction.RollbackAsync(cancellationToken);
            throw;
        }
        finally
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    /// <inheritdoc />
    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction == null)
        {
            throw new InvalidOperationException("No transaction is in progress.");
        }

        try
        {
            await _transaction.RollbackAsync(cancellationToken);
        }
        finally
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    /// <inheritdoc />
    public async Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation, CancellationToken cancellationToken = default)
    {
        if (operation == null)
            throw new ArgumentNullException(nameof(operation));

        var wasTransactionStarted = _transaction == null;

        if (wasTransactionStarted)
        {
            await BeginTransactionAsync(cancellationToken);
        }

        try
        {
            var result = await operation();

            if (wasTransactionStarted)
            {
                await CommitTransactionAsync(cancellationToken);
            }

            return result;
        }
        catch
        {
            if (wasTransactionStarted && _transaction != null)
            {
                await RollbackTransactionAsync(cancellationToken);
            }
            throw;
        }
    }

    /// <inheritdoc />
    public async Task ExecuteInTransactionAsync(Func<Task> operation, CancellationToken cancellationToken = default)
    {
        if (operation == null)
            throw new ArgumentNullException(nameof(operation));

        await ExecuteInTransactionAsync(async () =>
        {
            await operation();
            return true; // Dummy return value
        }, cancellationToken);
    }

    /// <summary>
    /// Executes multiple operations in a single transaction
    /// </summary>
    public async Task ExecuteBatchAsync(IEnumerable<Func<Task>> operations, CancellationToken cancellationToken = default)
    {
        if (operations == null)
            throw new ArgumentNullException(nameof(operations));

        await ExecuteInTransactionAsync(async () =>
        {
            foreach (var operation in operations)
            {
                await operation();
            }
        }, cancellationToken);
    }

    /// <summary>
    /// Gets the current transaction
    /// </summary>
    public IDbContextTransaction? CurrentTransaction => _transaction;

    /// <summary>
    /// Indicates if a transaction is currently active
    /// </summary>
    public bool HasActiveTransaction => _transaction != null;

    /// <inheritdoc />
    public async Task<int> SaveChangesAndDispatchEventsAsync(CancellationToken cancellationToken = default)
    {
        // Get domain events before saving
        var domainEvents = GetDomainEvents().ToList();

        // Save changes
        var result = await SaveChangesAsync(cancellationToken);

        // Dispatch domain events after successful save
        // TODO: Implement domain event dispatcher
        // foreach (var domainEvent in domainEvents)
        // {
        //     await _eventDispatcher.DispatchAsync(domainEvent, cancellationToken);
        // }

        // Clear domain events after dispatching
        ClearDomainEvents();

        return result;
    }

    /// <inheritdoc />
    public TRepository GetRepository<TRepository>() where TRepository : class
    {
        var type = typeof(TRepository);

        if (_repositories.ContainsKey(type))
        {
            return (TRepository)_repositories[type];
        }

        // Create repository instance
        var repository = CreateSpecificRepository<TRepository>();
        _repositories[type] = repository;

        return repository;
    }

    /// <summary>
    /// Creates a specific repository instance
    /// </summary>
    private TRepository CreateSpecificRepository<TRepository>() where TRepository : class
    {
        var type = typeof(TRepository);

        // Map interface types to implementation types
        if (type == typeof(IDomainEntityRepository))
        {
            return (TRepository)(object)new DomainEntityRepository(_context);
        }

        if (type == typeof(IAuditRepository) || type == typeof(IAuditLogRepository))
        {
            return (TRepository)(object)new AuditRepository(_context);
        }

        // For other repository types, try to create generic repository
        throw new NotSupportedException($"Repository type {type.Name} is not supported");
    }

    /// <inheritdoc />
    public IEnumerable<IDomainEvent> GetDomainEvents()
    {
        var domainEvents = new List<IDomainEvent>();

        var entities = _context.ChangeTracker.Entries()
            .Where(e => e.Entity is BaseDomainEntity)
            .Select(e => e.Entity as BaseDomainEntity)
            .Where(e => e != null && e.DomainEvents.Any());

        foreach (var entity in entities)
        {
            domainEvents.AddRange(entity!.DomainEvents);
        }

        return domainEvents;
    }

    /// <inheritdoc />
    public void ClearDomainEvents()
    {
        var entities = _context.ChangeTracker.Entries()
            .Where(e => e.Entity is BaseDomainEntity)
            .Select(e => e.Entity as BaseDomainEntity)
            .Where(e => e != null && e.DomainEvents.Any());

        foreach (var entity in entities)
        {
            entity!.ClearDomainEvents();
        }
    }

    /// <summary>
    /// Resets the context state (useful for testing)
    /// </summary>
    public void ResetState()
    {
        _context.ChangeTracker.Clear();
        _repositories.Clear();
    }

    /// <summary>
    /// Gets the underlying DbContext
    /// </summary>
    public ApplicationDbContext Context => _context;

    /// <summary>
    /// Detaches an entity from the context
    /// </summary>
    public void Detach<T>(T entity) where T : class
    {
        _context.Entry(entity).State = EntityState.Detached;
    }

    /// <summary>
    /// Attaches an entity to the context
    /// </summary>
    public void Attach<T>(T entity) where T : class
    {
        _context.Set<T>().Attach(entity);
    }

    /// <summary>
    /// Gets the state of an entity
    /// </summary>
    public EntityState GetEntityState<T>(T entity) where T : class
    {
        return _context.Entry(entity).State;
    }

    /// <summary>
    /// Sets the state of an entity
    /// </summary>
    public void SetEntityState<T>(T entity, EntityState state) where T : class
    {
        _context.Entry(entity).State = state;
    }

    /// <summary>
    /// Reloads an entity from the database
    /// </summary>
    public async Task ReloadAsync<T>(T entity, CancellationToken cancellationToken = default) where T : class
    {
        await _context.Entry(entity).ReloadAsync(cancellationToken);
    }

    /// <summary>
    /// Disposes the Unit of Work
    /// </summary>
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Protected dispose method
    /// </summary>
    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _transaction?.Dispose();
            _context.Dispose();
            _repositories.Clear();
            _disposed = true;
        }
    }

    /// <summary>
    /// Finalizer
    /// </summary>
    ~UnitOfWork()
    {
        Dispose(false);
    }
}
