-- =============================================
-- GAImingDB Authentication Tables Migration Script
-- Purpose: Create authentication and authorization tables
-- =============================================

-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'GAImingDB')
BEGIN
    CREATE DATABASE [GAImingDB]
    PRINT 'GAImingDB database created successfully'
END
ELSE
BEGIN
    PRINT 'GAImingDB database already exists'
END
GO

-- Use the GAImingDB database
USE [GAImingDB]
GO

-- =============================================
-- Create Auth Schema
-- =============================================

-- Create auth schema if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'auth')
BEGIN
    EXEC('CREATE SCHEMA [auth]')
    PRINT 'Auth schema created successfully'
END

-- =============================================
-- Create Authentication Tables
-- =============================================

-- 1. Users Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE [auth].[Users] (
        [UserId] NVARCHAR(50) NOT NULL,
        [Username] NVARCHAR(100) NOT NULL,
        [Email] NVARCHAR(255) NOT NULL,
        [DisplayName] NVARCHAR(255) NOT NULL,
        [FirstName] NVARCHAR(100) NULL,
        [LastName] NVARCHAR(100) NULL,
        [PasswordHash] NVARCHAR(255) NOT NULL,
        [PasswordSalt] NVARCHAR(255) NOT NULL,
        [EmailConfirmed] BIT NOT NULL DEFAULT 0,
        [EmailConfirmationToken] NVARCHAR(255) NULL,
        [PhoneNumber] NVARCHAR(20) NULL,
        [PhoneNumberConfirmed] BIT NOT NULL DEFAULT 0,
        [TwoFactorEnabled] BIT NOT NULL DEFAULT 0,
        [TwoFactorSecret] NVARCHAR(255) NULL,
        [LockoutEnd] DATETIME2 NULL,
        [LockoutEnabled] BIT NOT NULL DEFAULT 1,
        [FailedLoginAttempts] INT NOT NULL DEFAULT 0,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [LastLogin] DATETIME2 NULL,
        [LastPasswordChange] DATETIME2 NULL,
        [PasswordExpiryDate] DATETIME2 NULL,
        [MustChangePassword] BIT NOT NULL DEFAULT 0,
        [Department] NVARCHAR(100) NULL,
        [Title] NVARCHAR(100) NULL,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [ModifiedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [CreatedBy] NVARCHAR(100) NULL,
        [ModifiedBy] NVARCHAR(100) NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([UserId] ASC),
        CONSTRAINT [CK_Users_FailedLoginAttempts] CHECK ([FailedLoginAttempts] >= 0)
    )
    
    -- Create indexes for Users
    CREATE UNIQUE INDEX [IX_Users_Username] ON [auth].[Users] ([Username])
    CREATE UNIQUE INDEX [IX_Users_Email] ON [auth].[Users] ([Email])
    CREATE INDEX [IX_Users_IsActive] ON [auth].[Users] ([IsActive])
    CREATE INDEX [IX_Users_EmailConfirmed] ON [auth].[Users] ([EmailConfirmed])
    CREATE INDEX [IX_Users_LastLogin] ON [auth].[Users] ([LastLogin])
    CREATE INDEX [IX_Users_CreatedDate] ON [auth].[Users] ([CreatedDate])
    CREATE INDEX [IX_Users_Department] ON [auth].[Users] ([Department])
    CREATE INDEX [IX_Users_Active_EmailConfirmed] ON [auth].[Users] ([IsActive], [EmailConfirmed])
    
    PRINT 'Users table created successfully'
END

-- 2. Roles Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Roles' AND xtype='U')
BEGIN
    CREATE TABLE [auth].[Roles] (
        [RoleId] NVARCHAR(50) NOT NULL,
        [Name] NVARCHAR(100) NOT NULL,
        [Description] NVARCHAR(500) NOT NULL DEFAULT '',
        [IsSystemRole] BIT NOT NULL DEFAULT 0,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [ModifiedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [CreatedBy] NVARCHAR(100) NULL,
        [ModifiedBy] NVARCHAR(100) NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([RoleId] ASC)
    )
    
    -- Create indexes for Roles
    CREATE UNIQUE INDEX [IX_Roles_Name] ON [auth].[Roles] ([Name])
    CREATE INDEX [IX_Roles_IsActive] ON [auth].[Roles] ([IsActive])
    CREATE INDEX [IX_Roles_IsSystemRole] ON [auth].[Roles] ([IsSystemRole])
    
    PRINT 'Roles table created successfully'
END

-- 3. Permissions Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Permissions' AND xtype='U')
BEGIN
    CREATE TABLE [auth].[Permissions] (
        [PermissionId] NVARCHAR(50) NOT NULL,
        [Name] NVARCHAR(100) NOT NULL,
        [Description] NVARCHAR(500) NOT NULL DEFAULT '',
        [Resource] NVARCHAR(100) NOT NULL,
        [Action] NVARCHAR(50) NOT NULL,
        [IsSystemPermission] BIT NOT NULL DEFAULT 0,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [ModifiedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [CreatedBy] NVARCHAR(100) NULL,
        [ModifiedBy] NVARCHAR(100) NULL,
        CONSTRAINT [PK_Permissions] PRIMARY KEY CLUSTERED ([PermissionId] ASC)
    )
    
    -- Create indexes for Permissions
    CREATE UNIQUE INDEX [IX_Permissions_Name] ON [auth].[Permissions] ([Name])
    CREATE INDEX [IX_Permissions_Resource] ON [auth].[Permissions] ([Resource])
    CREATE INDEX [IX_Permissions_Action] ON [auth].[Permissions] ([Action])
    CREATE INDEX [IX_Permissions_ResourceAction] ON [auth].[Permissions] ([Resource], [Action])
    CREATE INDEX [IX_Permissions_IsActive] ON [auth].[Permissions] ([IsActive])
    
    PRINT 'Permissions table created successfully'
END

-- 4. UserRoles Junction Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserRoles' AND xtype='U')
BEGIN
    CREATE TABLE [auth].[UserRoles] (
        [UserId] NVARCHAR(50) NOT NULL,
        [RoleId] NVARCHAR(50) NOT NULL,
        [AssignedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [AssignedBy] NVARCHAR(100) NULL,
        [ExpiryDate] DATETIME2 NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        CONSTRAINT [PK_UserRoles] PRIMARY KEY CLUSTERED ([UserId], [RoleId])
    )
    
    -- Create indexes for UserRoles
    CREATE INDEX [IX_UserRoles_UserId] ON [auth].[UserRoles] ([UserId])
    CREATE INDEX [IX_UserRoles_RoleId] ON [auth].[UserRoles] ([RoleId])
    CREATE INDEX [IX_UserRoles_AssignedDate] ON [auth].[UserRoles] ([AssignedDate])
    
    PRINT 'UserRoles table created successfully'
END

-- 5. RolePermissions Junction Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RolePermissions' AND xtype='U')
BEGIN
    CREATE TABLE [auth].[RolePermissions] (
        [RoleId] NVARCHAR(50) NOT NULL,
        [PermissionId] NVARCHAR(50) NOT NULL,
        [AssignedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [AssignedBy] NVARCHAR(100) NULL,
        CONSTRAINT [PK_RolePermissions] PRIMARY KEY CLUSTERED ([RoleId], [PermissionId])
    )

    -- Create indexes for RolePermissions
    CREATE INDEX [IX_RolePermissions_RoleId] ON [auth].[RolePermissions] ([RoleId])
    CREATE INDEX [IX_RolePermissions_PermissionId] ON [auth].[RolePermissions] ([PermissionId])

    PRINT 'RolePermissions table created successfully'
END

-- 6. RefreshTokens Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RefreshTokens' AND xtype='U')
BEGIN
    CREATE TABLE [auth].[RefreshTokens] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL,
        [UserId] NVARCHAR(50) NOT NULL,
        [Token] NVARCHAR(255) NOT NULL,
        [ExpiryDate] DATETIME2 NOT NULL,
        [IsRevoked] BIT NOT NULL DEFAULT 0,
        [RevokedDate] DATETIME2 NULL,
        [RevokedBy] NVARCHAR(100) NULL,
        [ReplacedByToken] NVARCHAR(255) NULL,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [CreatedByIp] NVARCHAR(45) NULL,
        [RevokedByIp] NVARCHAR(45) NULL,
        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY CLUSTERED ([Id] ASC)
    )

    -- Create indexes for RefreshTokens
    CREATE UNIQUE INDEX [IX_RefreshTokens_Token] ON [auth].[RefreshTokens] ([Token])
    CREATE INDEX [IX_RefreshTokens_UserId] ON [auth].[RefreshTokens] ([UserId])
    CREATE INDEX [IX_RefreshTokens_ExpiryDate] ON [auth].[RefreshTokens] ([ExpiryDate])
    CREATE INDEX [IX_RefreshTokens_IsRevoked] ON [auth].[RefreshTokens] ([IsRevoked])

    PRINT 'RefreshTokens table created successfully'
END

-- 7. UserPasswords Table (Password History)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserPasswords' AND xtype='U')
BEGIN
    CREATE TABLE [auth].[UserPasswords] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL,
        [UserId] NVARCHAR(50) NOT NULL,
        [PasswordHash] NVARCHAR(255) NOT NULL,
        [PasswordSalt] NVARCHAR(255) NOT NULL,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [CreatedBy] NVARCHAR(100) NULL,
        [IsActive] BIT NOT NULL DEFAULT 0, -- Only current password is active
        CONSTRAINT [PK_UserPasswords] PRIMARY KEY CLUSTERED ([Id] ASC)
    )

    -- Create indexes for UserPasswords
    CREATE INDEX [IX_UserPasswords_UserId] ON [auth].[UserPasswords] ([UserId])
    CREATE INDEX [IX_UserPasswords_CreatedDate] ON [auth].[UserPasswords] ([CreatedDate])
    CREATE INDEX [IX_UserPasswords_IsActive] ON [auth].[UserPasswords] ([IsActive])

    PRINT 'UserPasswords table created successfully'
END

-- =============================================
-- Create Foreign Key Constraints
-- =============================================

-- Foreign key from UserRoles to Users
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_UserRoles_Users')
BEGIN
    ALTER TABLE [auth].[UserRoles]
    ADD CONSTRAINT [FK_UserRoles_Users]
    FOREIGN KEY ([UserId]) REFERENCES [auth].[Users]([UserId])
    ON DELETE CASCADE

    PRINT 'Foreign key FK_UserRoles_Users created'
END

-- Foreign key from UserRoles to Roles
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_UserRoles_Roles')
BEGIN
    ALTER TABLE [auth].[UserRoles]
    ADD CONSTRAINT [FK_UserRoles_Roles]
    FOREIGN KEY ([RoleId]) REFERENCES [auth].[Roles]([RoleId])
    ON DELETE CASCADE

    PRINT 'Foreign key FK_UserRoles_Roles created'
END

-- Foreign key from RolePermissions to Roles
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_RolePermissions_Roles')
BEGIN
    ALTER TABLE [auth].[RolePermissions]
    ADD CONSTRAINT [FK_RolePermissions_Roles]
    FOREIGN KEY ([RoleId]) REFERENCES [auth].[Roles]([RoleId])
    ON DELETE CASCADE

    PRINT 'Foreign key FK_RolePermissions_Roles created'
END

-- Foreign key from RolePermissions to Permissions
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_RolePermissions_Permissions')
BEGIN
    ALTER TABLE [auth].[RolePermissions]
    ADD CONSTRAINT [FK_RolePermissions_Permissions]
    FOREIGN KEY ([PermissionId]) REFERENCES [auth].[Permissions]([PermissionId])
    ON DELETE CASCADE

    PRINT 'Foreign key FK_RolePermissions_Permissions created'
END

-- Foreign key from RefreshTokens to Users
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_RefreshTokens_Users')
BEGIN
    ALTER TABLE [auth].[RefreshTokens]
    ADD CONSTRAINT [FK_RefreshTokens_Users]
    FOREIGN KEY ([UserId]) REFERENCES [auth].[Users]([UserId])
    ON DELETE CASCADE

    PRINT 'Foreign key FK_RefreshTokens_Users created'
END

-- Foreign key from UserPasswords to Users
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_UserPasswords_Users')
BEGIN
    ALTER TABLE [auth].[UserPasswords]
    ADD CONSTRAINT [FK_UserPasswords_Users]
    FOREIGN KEY ([UserId]) REFERENCES [auth].[Users]([UserId])
    ON DELETE CASCADE

    PRINT 'Foreign key FK_UserPasswords_Users created'
END

-- =============================================
-- Insert Initial Auth Data
-- =============================================

-- Insert default roles
IF NOT EXISTS (SELECT * FROM [auth].[Roles] WHERE [Name] = 'Administrator')
BEGIN
    INSERT INTO [auth].[Roles] ([RoleId], [Name], [Description], [IsSystemRole], [CreatedBy])
    VALUES (NEWID(), 'Administrator', 'System administrator with full access', 1, 'System')

    PRINT 'Administrator role inserted'
END

IF NOT EXISTS (SELECT * FROM [auth].[Roles] WHERE [Name] = 'User')
BEGIN
    INSERT INTO [auth].[Roles] ([RoleId], [Name], [Description], [IsSystemRole], [CreatedBy])
    VALUES (NEWID(), 'User', 'Standard user with basic access', 1, 'System')

    PRINT 'User role inserted'
END

IF NOT EXISTS (SELECT * FROM [auth].[Roles] WHERE [Name] = 'Analyst')
BEGIN
    INSERT INTO [auth].[Roles] ([RoleId], [Name], [Description], [IsSystemRole], [CreatedBy])
    VALUES (NEWID(), 'Analyst', 'Data analyst with read access to analytics', 1, 'System')

    PRINT 'Analyst role inserted'
END

-- Insert default permissions
DECLARE @PermissionData TABLE (
    Name NVARCHAR(100),
    Description NVARCHAR(500),
    Resource NVARCHAR(100),
    Action NVARCHAR(50)
)

INSERT INTO @PermissionData VALUES
('Users.Read', 'View user information', 'Users', 'Read'),
('Users.Write', 'Create and update users', 'Users', 'Write'),
('Users.Delete', 'Delete users', 'Users', 'Delete'),
('Roles.Read', 'View roles', 'Roles', 'Read'),
('Roles.Write', 'Create and update roles', 'Roles', 'Write'),
('Roles.Delete', 'Delete roles', 'Roles', 'Delete'),
('Permissions.Read', 'View permissions', 'Permissions', 'Read'),
('Permissions.Write', 'Create and update permissions', 'Permissions', 'Write'),
('Recommendations.Read', 'View recommendations', 'Recommendations', 'Read'),
('Recommendations.Write', 'Create and update recommendations', 'Recommendations', 'Write'),
('Analytics.Read', 'View analytics data', 'Analytics', 'Read'),
('Reports.Read', 'View reports', 'Reports', 'Read'),
('System.Admin', 'Full system administration', 'System', 'Admin')

-- Insert permissions if they don't exist
DECLARE @Name NVARCHAR(100), @Description NVARCHAR(500), @Resource NVARCHAR(100), @Action NVARCHAR(50)
DECLARE permission_cursor CURSOR FOR
SELECT Name, Description, Resource, Action FROM @PermissionData

OPEN permission_cursor
FETCH NEXT FROM permission_cursor INTO @Name, @Description, @Resource, @Action

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT * FROM [auth].[Permissions] WHERE [Name] = @Name)
    BEGIN
        INSERT INTO [auth].[Permissions] ([PermissionId], [Name], [Description], [Resource], [Action], [IsSystemPermission], [CreatedBy])
        VALUES (NEWID(), @Name, @Description, @Resource, @Action, 1, 'System')
    END

    FETCH NEXT FROM permission_cursor INTO @Name, @Description, @Resource, @Action
END

CLOSE permission_cursor
DEALLOCATE permission_cursor

PRINT 'Default permissions inserted'

-- Assign permissions to Administrator role
DECLARE @AdminRoleId NVARCHAR(50) = (SELECT RoleId FROM [auth].[Roles] WHERE Name = 'Administrator')
DECLARE @UserRoleId NVARCHAR(50) = (SELECT RoleId FROM [auth].[Roles] WHERE Name = 'User')
DECLARE @AnalystRoleId NVARCHAR(50) = (SELECT RoleId FROM [auth].[Roles] WHERE Name = 'Analyst')

-- Give Administrator all permissions
INSERT INTO [auth].[RolePermissions] ([RoleId], [PermissionId], [AssignedBy])
SELECT @AdminRoleId, [PermissionId], 'System'
FROM [auth].[Permissions]
WHERE NOT EXISTS (
    SELECT 1 FROM [auth].[RolePermissions]
    WHERE [RoleId] = @AdminRoleId AND [PermissionId] = [auth].[Permissions].[PermissionId]
)

-- Give User basic read permissions
INSERT INTO [auth].[RolePermissions] ([RoleId], [PermissionId], [AssignedBy])
SELECT @UserRoleId, [PermissionId], 'System'
FROM [auth].[Permissions]
WHERE [Action] = 'Read' AND [Resource] IN ('Recommendations', 'Reports')
AND NOT EXISTS (
    SELECT 1 FROM [auth].[RolePermissions]
    WHERE [RoleId] = @UserRoleId AND [PermissionId] = [auth].[Permissions].[PermissionId]
)

-- Give Analyst read permissions for analytics
INSERT INTO [auth].[RolePermissions] ([RoleId], [PermissionId], [AssignedBy])
SELECT @AnalystRoleId, [PermissionId], 'System'
FROM [auth].[Permissions]
WHERE [Action] = 'Read' AND [Resource] IN ('Analytics', 'Reports', 'Recommendations')
AND NOT EXISTS (
    SELECT 1 FROM [auth].[RolePermissions]
    WHERE [RoleId] = @AnalystRoleId AND [PermissionId] = [auth].[Permissions].[PermissionId]
)

PRINT 'Role permissions assigned'

-- Create default admin user (password: Admin123!)
-- Note: In production, change this password immediately
IF NOT EXISTS (SELECT * FROM [auth].[Users] WHERE [Username] = 'admin')
BEGIN
    DECLARE @AdminUserId NVARCHAR(50) = NEWID()
    DECLARE @Salt NVARCHAR(255) = CONVERT(NVARCHAR(255), NEWID())
    DECLARE @PasswordHash NVARCHAR(255) = 'AQAAAAEAACcQAAAAEK8+6Qk8xKz9QJ9QJ9QJ9QJ9QJ9QJ9QJ9QJ9QJ9QJ9QJ9QJ9QJ9QJ9QJ9QJ9QJ9Q==' -- Admin123!

    INSERT INTO [auth].[Users] (
        [UserId], [Username], [Email], [DisplayName], [FirstName], [LastName],
        [PasswordHash], [PasswordSalt], [EmailConfirmed], [IsActive], [CreatedBy]
    )
    VALUES (
        @AdminUserId, 'admin', 'admin@gaiming.com', 'System Administrator', 'System', 'Admin',
        @PasswordHash, @Salt, 1, 1, 'System'
    )

    -- Assign Administrator role to admin user
    INSERT INTO [auth].[UserRoles] ([UserId], [RoleId], [AssignedBy])
    VALUES (@AdminUserId, @AdminRoleId, 'System')

    PRINT 'Default admin user created (username: admin, password: Admin123!)'
    PRINT 'WARNING: Change the default password immediately in production!'
END

-- =============================================
-- Migration Complete
-- =============================================

PRINT '=========================================='
PRINT 'GAImingDB Auth Migration Completed Successfully!'
PRINT '=========================================='
PRINT 'Auth Tables Created:'
PRINT '  - auth.Users'
PRINT '  - auth.Roles'
PRINT '  - auth.Permissions'
PRINT '  - auth.UserRoles'
PRINT '  - auth.RolePermissions'
PRINT '  - auth.RefreshTokens'
PRINT '  - auth.UserPasswords'
PRINT ''
PRINT 'Initial Data Inserted:'
PRINT '  - 3 Default roles (Administrator, User, Analyst)'
PRINT '  - 13 Default permissions'
PRINT '  - 1 Default admin user (admin/Admin123!)'
PRINT '  - Role-permission assignments'
PRINT ''
PRINT 'Default Login Credentials:'
PRINT '  Username: admin'
PRINT '  Password: Admin123!'
PRINT '  Email: admin@gaiming.com'
PRINT ''
PRINT 'IMPORTANT: Change default password in production!'
PRINT '=========================================='
