-- =============================================
-- Update Admin User Password Script
-- Purpose: Update the admin user password to use proper BCrypt hash
-- =============================================

-- Use the GAImingDB database
USE [GAImingDB]
GO

PRINT '=========================================='
PRINT 'Updating Admin User Password'
PRINT '=========================================='

-- Generate BCrypt hash for "Admin123!" password
-- BCrypt hash for "Admin123!" with salt: $2a$12$LQv3c1yqBwEHXrjsHcisIeL6oUkVdQBi2m0J25Yu.Zr6PMQN/HOQG
DECLARE @NewPasswordHash NVARCHAR(255) = '$2a$12$LQv3c1yqBwEHXrjsHcisIeL6oUkVdQBi2m0J25Yu.Zr6PMQN/HOQG'
DECLARE @NewSalt NVARCHAR(255) = '' -- BCrypt includes salt in hash

-- Update admin user password
UPDATE [auth].[Users] 
SET 
    [PasswordHash] = @NewPasswordHash,
    [PasswordSalt] = @NewSalt,
    [LastPasswordChange] = GETUTCDATE(),
    [ModifiedDate] = GETUTCDATE(),
    [ModifiedBy] = 'System'
WHERE [Username] = 'admin'

-- Verify the update
IF @@ROWCOUNT > 0
BEGIN
    PRINT 'Admin password updated successfully'
    
    -- Display updated user info
    SELECT 
        [Username],
        [Email],
        [DisplayName],
        [IsActive],
        [EmailConfirmed],
        [LastPasswordChange],
        [ModifiedDate]
    FROM [auth].[Users] 
    WHERE [Username] = 'admin'
    
    PRINT ''
    PRINT 'Updated Login Credentials:'
    PRINT '  Username: admin'
    PRINT '  Password: Admin123!'
    PRINT '  Email: admin@gaiming.com'
END
ELSE
BEGIN
    PRINT 'ERROR: Admin user not found or password not updated'
END

PRINT '=========================================='
PRINT 'Password Update Complete'
PRINT '=========================================='
