using System.Linq.Expressions;

namespace GAIming.Core.Specifications;

/// <summary>
/// Specification pattern interface
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public interface ISpecification<T>
{
    Expression<Func<T, bool>> Criteria { get; }
    List<Expression<Func<T, object>>> Includes { get; }
    List<string> IncludeStrings { get; }
    Expression<Func<T, object>>? OrderBy { get; }
    Expression<Func<T, object>>? OrderByDescending { get; }
    Expression<Func<T, object>>? GroupBy { get; }
    int Take { get; }
    int Skip { get; }
    bool IsPagingEnabled { get; }
    bool IsSatisfiedBy(T entity);
}

/// <summary>
/// Base specification implementation
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public abstract class BaseSpecification<T> : ISpecification<T>
{
    protected BaseSpecification(Expression<Func<T, bool>>? criteria = null)
    {
        Criteria = criteria ?? (x => true);
    }

    public Expression<Func<T, bool>> Criteria { get; }
    public List<Expression<Func<T, object>>> Includes { get; } = new();
    public List<string> IncludeStrings { get; } = new();
    public Expression<Func<T, object>>? OrderBy { get; private set; }
    public Expression<Func<T, object>>? OrderByDescending { get; private set; }
    public Expression<Func<T, object>>? GroupBy { get; private set; }
    public int Take { get; private set; }
    public int Skip { get; private set; }
    public bool IsPagingEnabled { get; private set; }

    protected virtual void AddInclude(Expression<Func<T, object>> includeExpression)
    {
        Includes.Add(includeExpression);
    }

    protected virtual void AddInclude(string includeString)
    {
        IncludeStrings.Add(includeString);
    }

    protected virtual void ApplyPaging(int skip, int take)
    {
        Skip = skip;
        Take = take;
        IsPagingEnabled = true;
    }

    protected virtual void ApplyOrderBy(Expression<Func<T, object>> orderByExpression)
    {
        OrderBy = orderByExpression;
    }

    protected virtual void ApplyOrderByDescending(Expression<Func<T, object>> orderByDescendingExpression)
    {
        OrderByDescending = orderByDescendingExpression;
    }

    protected virtual void ApplyGroupBy(Expression<Func<T, object>> groupByExpression)
    {
        GroupBy = groupByExpression;
    }

    public virtual bool IsSatisfiedBy(T entity)
    {
        return Criteria.Compile()(entity);
    }
}

/// <summary>
/// Specification extensions for combining specifications
/// </summary>
public static class SpecificationExtensions
{
    public static ISpecification<T> And<T>(this ISpecification<T> left, ISpecification<T> right)
    {
        return new AndSpecification<T>(left, right);
    }

    public static ISpecification<T> Or<T>(this ISpecification<T> left, ISpecification<T> right)
    {
        return new OrSpecification<T>(left, right);
    }

    public static ISpecification<T> Not<T>(this ISpecification<T> specification)
    {
        return new NotSpecification<T>(specification);
    }
}

/// <summary>
/// AND specification combiner
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public class AndSpecification<T> : BaseSpecification<T>
{
    public AndSpecification(ISpecification<T> left, ISpecification<T> right)
        : base(CombineExpressions(left.Criteria, right.Criteria, Expression.AndAlso))
    {
    }

    private static Expression<Func<T, bool>> CombineExpressions(
        Expression<Func<T, bool>> left,
        Expression<Func<T, bool>> right,
        Func<Expression, Expression, BinaryExpression> combiner)
    {
        var parameter = Expression.Parameter(typeof(T));
        var leftVisitor = new ReplaceExpressionVisitor(left.Parameters[0], parameter);
        var rightVisitor = new ReplaceExpressionVisitor(right.Parameters[0], parameter);

        var leftBody = leftVisitor.Visit(left.Body);
        var rightBody = rightVisitor.Visit(right.Body);

        return Expression.Lambda<Func<T, bool>>(combiner(leftBody!, rightBody!), parameter);
    }
}

/// <summary>
/// OR specification combiner
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public class OrSpecification<T> : BaseSpecification<T>
{
    public OrSpecification(ISpecification<T> left, ISpecification<T> right)
        : base(CombineExpressions(left.Criteria, right.Criteria, Expression.OrElse))
    {
    }

    private static Expression<Func<T, bool>> CombineExpressions(
        Expression<Func<T, bool>> left,
        Expression<Func<T, bool>> right,
        Func<Expression, Expression, BinaryExpression> combiner)
    {
        var parameter = Expression.Parameter(typeof(T));
        var leftVisitor = new ReplaceExpressionVisitor(left.Parameters[0], parameter);
        var rightVisitor = new ReplaceExpressionVisitor(right.Parameters[0], parameter);

        var leftBody = leftVisitor.Visit(left.Body);
        var rightBody = rightVisitor.Visit(right.Body);

        return Expression.Lambda<Func<T, bool>>(combiner(leftBody!, rightBody!), parameter);
    }
}

/// <summary>
/// NOT specification combiner
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public class NotSpecification<T> : BaseSpecification<T>
{
    public NotSpecification(ISpecification<T> specification)
        : base(Expression.Lambda<Func<T, bool>>(
            Expression.Not(specification.Criteria.Body),
            specification.Criteria.Parameters))
    {
    }
}

/// <summary>
/// Expression visitor for replacing parameters
/// </summary>
internal class ReplaceExpressionVisitor : ExpressionVisitor
{
    private readonly Expression _oldValue;
    private readonly Expression _newValue;

    public ReplaceExpressionVisitor(Expression oldValue, Expression newValue)
    {
        _oldValue = oldValue;
        _newValue = newValue;
    }

    public override Expression? Visit(Expression? node)
    {
        return node == _oldValue ? _newValue : base.Visit(node);
    }
}

/// <summary>
/// Empty specification that matches all entities
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public class EmptySpecification<T> : BaseSpecification<T>
{
    public EmptySpecification() : base(x => true)
    {
    }
}

/// <summary>
/// Specification that matches entities by ID
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public class ByIdSpecification<T> : BaseSpecification<T> where T : class
{
    public ByIdSpecification(long id) : base(CreateCriteria(id))
    {
    }

    private static Expression<Func<T, bool>> CreateCriteria(long id)
    {
        var parameter = Expression.Parameter(typeof(T));
        var property = Expression.Property(parameter, "Id");
        var constant = Expression.Constant(id);
        var equal = Expression.Equal(property, constant);
        return Expression.Lambda<Func<T, bool>>(equal, parameter);
    }
}

/// <summary>
/// Specification that matches active entities
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public class ActiveSpecification<T> : BaseSpecification<T> where T : class
{
    public ActiveSpecification() : base(CreateCriteria())
    {
    }

    private static Expression<Func<T, bool>> CreateCriteria()
    {
        var parameter = Expression.Parameter(typeof(T));
        var property = Expression.Property(parameter, "IsActive");
        var constant = Expression.Constant(true);
        var equal = Expression.Equal(property, constant);
        return Expression.Lambda<Func<T, bool>>(equal, parameter);
    }
}
