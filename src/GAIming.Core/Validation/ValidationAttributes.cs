using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using GAIming.Core.Common;

namespace GAIming.Core.Validation;

/// <summary>
/// Validates that a string is valid JSON
/// </summary>
public class ValidJsonAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        if (value == null || value is not string jsonString)
            return true; // Let Required attribute handle null validation

        if (string.IsNullOrWhiteSpace(jsonString))
            return true;

        try
        {
            JsonDocument.Parse(jsonString);
            return true;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    public override string FormatErrorMessage(string name)
    {
        return $"The {name} field must contain valid JSON.";
    }
}

/// <summary>
/// Validates that a decimal value is a valid currency amount
/// </summary>
public class CurrencyAttribute : ValidationAttribute
{
    public decimal MinValue { get; set; } = 0;
    public decimal MaxValue { get; set; } = decimal.MaxValue;
    public int DecimalPlaces { get; set; } = 2;

    public override bool IsValid(object? value)
    {
        if (value == null)
            return true; // Let Required attribute handle null validation

        if (value is not decimal decimalValue)
            return false;

        // Check range
        if (decimalValue < MinValue || decimalValue > MaxValue)
            return false;

        // Check decimal places
        var decimalPlacesCount = BitConverter.GetBytes(decimal.GetBits(decimalValue)[3])[2];
        return decimalPlacesCount <= DecimalPlaces;
    }

    public override string FormatErrorMessage(string name)
    {
        return $"The {name} field must be a valid currency amount between {MinValue:C} and {MaxValue:C} with at most {DecimalPlaces} decimal places.";
    }
}

/// <summary>
/// Validates that a percentage value is between 0 and 100
/// </summary>
public class PercentageAttribute : ValidationAttribute
{
    public double MinValue { get; set; } = 0;
    public double MaxValue { get; set; } = 100;

    public override bool IsValid(object? value)
    {
        if (value == null)
            return true; // Let Required attribute handle null validation

        if (value is not double doubleValue)
            return false;

        return doubleValue >= MinValue && doubleValue <= MaxValue;
    }

    public override string FormatErrorMessage(string name)
    {
        return $"The {name} field must be a percentage between {MinValue}% and {MaxValue}%.";
    }
}

/// <summary>
/// Validates that an RTP value is between 80% and 100%
/// </summary>
public class RTPAttribute : PercentageAttribute
{
    public RTPAttribute()
    {
        MinValue = 80;
        MaxValue = 100;
    }

    public override string FormatErrorMessage(string name)
    {
        return $"The {name} field must be a valid RTP percentage between 80% and 100%.";
    }
}

/// <summary>
/// Validates that a username follows the correct format
/// </summary>
public class UsernameAttribute : ValidationAttribute
{
    public int MinLength { get; set; } = Constants.Validation.MinUsernameLength;
    public int MaxLength { get; set; } = Constants.Validation.MaxUsernameLength;

    public override bool IsValid(object? value)
    {
        if (value == null)
            return true; // Let Required attribute handle null validation

        if (value is not string username)
            return false;

        if (username.Length < MinLength || username.Length > MaxLength)
            return false;

        // Check format using regex from constants
        return System.Text.RegularExpressions.Regex.IsMatch(username, Constants.Validation.UsernameRegex);
    }

    public override string FormatErrorMessage(string name)
    {
        return $"The {name} field must be between {MinLength} and {MaxLength} characters and contain only letters, numbers, underscores, and hyphens.";
    }
}

/// <summary>
/// Validates that a password meets security requirements
/// </summary>
public class StrongPasswordAttribute : ValidationAttribute
{
    public int MinLength { get; set; } = Constants.Validation.MinPasswordLength;
    public int MaxLength { get; set; } = Constants.Validation.MaxPasswordLength;
    public bool RequireUppercase { get; set; } = true;
    public bool RequireLowercase { get; set; } = true;
    public bool RequireDigit { get; set; } = true;
    public bool RequireSpecialCharacter { get; set; } = true;

    public override bool IsValid(object? value)
    {
        if (value == null)
            return true; // Let Required attribute handle null validation

        if (value is not string password)
            return false;

        if (password.Length < MinLength || password.Length > MaxLength)
            return false;

        if (RequireUppercase && !password.Any(char.IsUpper))
            return false;

        if (RequireLowercase && !password.Any(char.IsLower))
            return false;

        if (RequireDigit && !password.Any(char.IsDigit))
            return false;

        if (RequireSpecialCharacter && !password.Any(c => !char.IsLetterOrDigit(c)))
            return false;

        return true;
    }

    public override string FormatErrorMessage(string name)
    {
        var requirements = new List<string>
        {
            $"be between {MinLength} and {MaxLength} characters"
        };

        if (RequireUppercase) requirements.Add("contain at least one uppercase letter");
        if (RequireLowercase) requirements.Add("contain at least one lowercase letter");
        if (RequireDigit) requirements.Add("contain at least one digit");
        if (RequireSpecialCharacter) requirements.Add("contain at least one special character");

        return $"The {name} field must {string.Join(", ", requirements)}.";
    }
}

/// <summary>
/// Validates that a cron expression is valid
/// </summary>
public class CronExpressionAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        if (value == null)
            return true; // Let Required attribute handle null validation

        if (value is not string cronExpression)
            return false;

        if (string.IsNullOrWhiteSpace(cronExpression))
            return false;

        // Basic cron validation - should have 5 or 6 parts
        var parts = cronExpression.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length is 5 or 6;
    }

    public override string FormatErrorMessage(string name)
    {
        return $"The {name} field must be a valid cron expression.";
    }
}

/// <summary>
/// Validates that a collection has a minimum and maximum number of items
/// </summary>
public class CollectionSizeAttribute : ValidationAttribute
{
    public int MinItems { get; set; } = 0;
    public int MaxItems { get; set; } = int.MaxValue;

    public override bool IsValid(object? value)
    {
        if (value == null)
            return MinItems == 0; // Allow null if MinItems is 0

        if (value is not System.Collections.ICollection collection)
            return false;

        return collection.Count >= MinItems && collection.Count <= MaxItems;
    }

    public override string FormatErrorMessage(string name)
    {
        if (MinItems == MaxItems)
            return $"The {name} field must contain exactly {MinItems} item(s).";

        if (MaxItems == int.MaxValue)
            return $"The {name} field must contain at least {MinItems} item(s).";

        if (MinItems == 0)
            return $"The {name} field must contain at most {MaxItems} item(s).";

        return $"The {name} field must contain between {MinItems} and {MaxItems} item(s).";
    }
}

/// <summary>
/// Validates that a date is not in the future
/// </summary>
public class NotFutureDateAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        if (value == null)
            return true; // Let Required attribute handle null validation

        if (value is not DateTime dateValue)
            return false;

        return dateValue <= DateTime.UtcNow;
    }

    public override string FormatErrorMessage(string name)
    {
        return $"The {name} field cannot be a future date.";
    }
}

/// <summary>
/// Validates that a date is not in the past
/// </summary>
public class NotPastDateAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        if (value == null)
            return true; // Let Required attribute handle null validation

        if (value is not DateTime dateValue)
            return false;

        return dateValue >= DateTime.UtcNow.Date;
    }

    public override string FormatErrorMessage(string name)
    {
        return $"The {name} field cannot be a past date.";
    }
}

/// <summary>
/// Validates that a date range is valid (start date before end date)
/// </summary>
public class ValidDateRangeAttribute : ValidationAttribute
{
    public string StartDateProperty { get; set; } = string.Empty;
    public string EndDateProperty { get; set; } = string.Empty;

    public override bool IsValid(object? value)
    {
        if (value == null)
            return true;

        var type = value.GetType();
        var startDateProperty = type.GetProperty(StartDateProperty);
        var endDateProperty = type.GetProperty(EndDateProperty);

        if (startDateProperty == null || endDateProperty == null)
            return true; // Properties don't exist, skip validation

        var startDate = startDateProperty.GetValue(value) as DateTime?;
        var endDate = endDateProperty.GetValue(value) as DateTime?;

        if (!startDate.HasValue || !endDate.HasValue)
            return true; // One or both dates are null, skip validation

        return startDate.Value <= endDate.Value;
    }

    public override string FormatErrorMessage(string name)
    {
        return $"The {StartDateProperty} must be before or equal to {EndDateProperty}.";
    }
}

/// <summary>
/// Validates that an IP address is valid
/// </summary>
public class IPAddressAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        if (value == null)
            return true; // Let Required attribute handle null validation

        if (value is not string ipString)
            return false;

        return System.Net.IPAddress.TryParse(ipString, out _);
    }

    public override string FormatErrorMessage(string name)
    {
        return $"The {name} field must be a valid IP address.";
    }
}

/// <summary>
/// Validates that a file size is within limits
/// </summary>
public class FileSizeAttribute : ValidationAttribute
{
    public long MaxSizeBytes { get; set; } = Constants.Files.MaxFileSize;

    public override bool IsValid(object? value)
    {
        if (value == null)
            return true; // Let Required attribute handle null validation

        return value switch
        {
            long longValue => longValue <= MaxSizeBytes,
            int intValue => intValue <= MaxSizeBytes,
            _ => false
        };
    }

    public override string FormatErrorMessage(string name)
    {
        var maxSizeMB = MaxSizeBytes / (1024 * 1024);
        return $"The {name} field must not exceed {maxSizeMB} MB.";
    }
}
