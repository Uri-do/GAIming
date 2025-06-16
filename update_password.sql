-- Update admin password with proper BCrypt hash
USE [GAImingDB]
GO

DECLARE @PasswordHash NVARCHAR(255) = '$2a$12$zjW2BRbrehjYB5vg.T3mlOHaahblqIolRsau80n/V36dJfdbeBh6K'

UPDATE [auth].[Users] 
SET 
    [PasswordHash] = @PasswordHash,
    [PasswordSalt] = '',
    [LastPasswordChange] = GETUTCDATE(),
    [ModifiedDate] = GETUTCDATE(),
    [ModifiedBy] = 'System'
WHERE [Username] = 'admin'

-- Verify the update
SELECT 
    'Password updated successfully' as Result,
    LEN(PasswordHash) as HashLength,
    PasswordHash
FROM [auth].[Users] 
WHERE [Username] = 'admin'
