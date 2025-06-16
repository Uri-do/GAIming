using System.ComponentModel.DataAnnotations;

namespace GAIming.Core.ValueObjects;

/// <summary>
/// Base value object class
/// </summary>
public abstract class ValueObject
{
    protected static bool EqualOperator(ValueObject left, ValueObject right)
    {
        if (ReferenceEquals(left, null) ^ ReferenceEquals(right, null))
            return false;
        return ReferenceEquals(left, null) || left.Equals(right);
    }

    protected static bool NotEqualOperator(ValueObject left, ValueObject right)
    {
        return !(EqualOperator(left, right));
    }

    protected abstract IEnumerable<object> GetEqualityComponents();

    public override bool Equals(object? obj)
    {
        if (obj == null || obj.GetType() != GetType())
            return false;

        var other = (ValueObject)obj;
        return GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
    }

    public override int GetHashCode()
    {
        return GetEqualityComponents()
            .Select(x => x?.GetHashCode() ?? 0)
            .Aggregate((x, y) => x ^ y);
    }

    public static bool operator ==(ValueObject one, ValueObject two)
    {
        return EqualOperator(one, two);
    }

    public static bool operator !=(ValueObject one, ValueObject two)
    {
        return NotEqualOperator(one, two);
    }
}

/// <summary>
/// Email value object with validation
/// </summary>
public class Email : ValueObject
{
    public string Value { get; }

    public Email(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Email cannot be empty", nameof(value));

        if (!IsValidEmail(value))
            throw new ArgumentException("Invalid email format", nameof(value));

        Value = value.ToLowerInvariant();
    }

    private static bool IsValidEmail(string email)
    {
        var emailAttribute = new EmailAddressAttribute();
        return emailAttribute.IsValid(email);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public static implicit operator string(Email email) => email.Value;
    public static implicit operator Email(string email) => new(email);

    public override string ToString() => Value;
}

/// <summary>
/// Money value object for financial calculations
/// </summary>
public class Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency = "USD")
    {
        if (amount < 0)
            throw new ArgumentException("Amount cannot be negative", nameof(amount));

        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentException("Currency cannot be empty", nameof(currency));

        Amount = Math.Round(amount, 2);
        Currency = currency.ToUpperInvariant();
    }

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException("Cannot add money with different currencies");

        return new Money(Amount + other.Amount, Currency);
    }

    public Money Subtract(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException("Cannot subtract money with different currencies");

        return new Money(Amount - other.Amount, Currency);
    }

    public Money Multiply(decimal factor)
    {
        return new Money(Amount * factor, Currency);
    }

    public Money Divide(decimal divisor)
    {
        if (divisor == 0)
            throw new DivideByZeroException("Cannot divide by zero");

        return new Money(Amount / divisor, Currency);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }

    public static Money operator +(Money left, Money right) => left.Add(right);
    public static Money operator -(Money left, Money right) => left.Subtract(right);
    public static Money operator *(Money money, decimal factor) => money.Multiply(factor);
    public static Money operator /(Money money, decimal divisor) => money.Divide(divisor);

    public override string ToString() => $"{Amount:C} {Currency}";
}

/// <summary>
/// Percentage value object
/// </summary>
public class Percentage : ValueObject
{
    public double Value { get; }

    public Percentage(double value)
    {
        if (value < 0 || value > 100)
            throw new ArgumentException("Percentage must be between 0 and 100", nameof(value));

        Value = Math.Round(value, 4);
    }

    public decimal AsDecimal => (decimal)(Value / 100);
    public double AsRatio => Value / 100;

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public static implicit operator double(Percentage percentage) => percentage.Value;
    public static implicit operator Percentage(double value) => new(value);

    public override string ToString() => $"{Value:F2}%";
}

/// <summary>
/// Game RTP (Return to Player) value object
/// </summary>
public class RTP : ValueObject
{
    public double Value { get; }

    public RTP(double value)
    {
        if (value < 80 || value > 100)
            throw new ArgumentException("RTP must be between 80% and 100%", nameof(value));

        Value = Math.Round(value, 2);
    }

    public Percentage AsPercentage => new(Value);
    public decimal AsDecimal => (decimal)(Value / 100);

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public static implicit operator double(RTP rtp) => rtp.Value;
    public static implicit operator RTP(double value) => new(value);

    public override string ToString() => $"{Value:F2}%";
}

/// <summary>
/// Username value object with validation
/// </summary>
public class Username : ValueObject
{
    public string Value { get; }

    public Username(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Username cannot be empty", nameof(value));

        if (value.Length < 3 || value.Length > 50)
            throw new ArgumentException("Username must be between 3 and 50 characters", nameof(value));

        if (!IsValidUsername(value))
            throw new ArgumentException("Username can only contain letters, numbers, underscores, and hyphens", nameof(value));

        Value = value.ToLowerInvariant();
    }

    private static bool IsValidUsername(string username)
    {
        return username.All(c => char.IsLetterOrDigit(c) || c == '_' || c == '-');
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public static implicit operator string(Username username) => username.Value;
    public static implicit operator Username(string username) => new(username);

    public override string ToString() => Value;
}

/// <summary>
/// Score value object for recommendations
/// </summary>
public class Score : ValueObject
{
    public double Value { get; }

    public Score(double value)
    {
        if (value < 0 || value > 1)
            throw new ArgumentException("Score must be between 0 and 1", nameof(value));

        Value = Math.Round(value, 6);
    }

    public Percentage AsPercentage => new(Value * 100);
    public bool IsHigh => Value >= 0.7;
    public bool IsMedium => Value >= 0.4 && Value < 0.7;
    public bool IsLow => Value < 0.4;

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public static implicit operator double(Score score) => score.Value;
    public static implicit operator Score(double value) => new(value);

    public override string ToString() => $"{Value:F4}";
}

/// <summary>
/// Date range value object
/// </summary>
public class DateRange : ValueObject
{
    public DateTime StartDate { get; }
    public DateTime EndDate { get; }

    public DateRange(DateTime startDate, DateTime endDate)
    {
        if (startDate > endDate)
            throw new ArgumentException("Start date cannot be after end date");

        StartDate = startDate;
        EndDate = endDate;
    }

    public TimeSpan Duration => EndDate - StartDate;
    public int DaysCount => (int)Duration.TotalDays;
    public bool Contains(DateTime date) => date >= StartDate && date <= EndDate;
    public bool Overlaps(DateRange other) => StartDate <= other.EndDate && EndDate >= other.StartDate;

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return StartDate;
        yield return EndDate;
    }

    public override string ToString() => $"{StartDate:yyyy-MM-dd} to {EndDate:yyyy-MM-dd}";
}

/// <summary>
/// IP Address value object
/// </summary>
public class IPAddress : ValueObject
{
    public string Value { get; }

    public IPAddress(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("IP Address cannot be empty", nameof(value));

        if (!System.Net.IPAddress.TryParse(value, out _))
            throw new ArgumentException("Invalid IP Address format", nameof(value));

        Value = value;
    }

    public bool IsPrivate => IsPrivateIP(Value);

    private static bool IsPrivateIP(string ip)
    {
        if (!System.Net.IPAddress.TryParse(ip, out var address))
            return false;

        var bytes = address.GetAddressBytes();
        return bytes[0] == 10 ||
               (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) ||
               (bytes[0] == 192 && bytes[1] == 168);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public static implicit operator string(IPAddress ipAddress) => ipAddress.Value;
    public static implicit operator IPAddress(string ipAddress) => new(ipAddress);

    public override string ToString() => Value;
}
