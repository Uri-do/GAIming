-- =============================================
-- Create AuditLogs Table Script
-- Purpose: Create the missing AuditLogs table for audit trail functionality
-- =============================================

USE [GAImingDB]
GO

PRINT '=========================================='
PRINT 'Creating AuditLogs Table'
PRINT '=========================================='

-- Create AuditLogs table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AuditLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[AuditLogs] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL,
        [EntityName] NVARCHAR(100) NOT NULL,
        [EntityId] NVARCHAR(50) NOT NULL,
        [Action] INT NOT NULL,
        [ActionDescription] NVARCHAR(500) NULL,
        [UserId] NVARCHAR(100) NOT NULL,
        [Username] NVARCHAR(100) NULL,
        [Timestamp] DATETIME2(7) NOT NULL,
        [OldValues] NVARCHAR(4000) NULL,
        [NewValues] NVARCHAR(4000) NULL,
        [IpAddress] NVARCHAR(45) NULL,
        [UserAgent] NVARCHAR(500) NULL,
        [SessionId] NVARCHAR(100) NULL,
        [CorrelationId] NVARCHAR(100) NULL,
        [Source] NVARCHAR(100) NULL,
        [Severity] NVARCHAR(20) NOT NULL,
        [Metadata] NVARCHAR(4000) NULL,
        [DomainEntityId] INT NULL,
        
        CONSTRAINT [PK_AuditLogs] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
    
    PRINT 'AuditLogs table created successfully'
END
ELSE
BEGIN
    PRINT 'AuditLogs table already exists'
END

-- Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[AuditLogs]') AND name = N'IX_AuditLogs_EntityName_EntityId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_AuditLogs_EntityName_EntityId] ON [dbo].[AuditLogs]
    (
        [EntityName] ASC,
        [EntityId] ASC
    )
    PRINT 'Index IX_AuditLogs_EntityName_EntityId created'
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[AuditLogs]') AND name = N'IX_AuditLogs_UserId_Timestamp')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_AuditLogs_UserId_Timestamp] ON [dbo].[AuditLogs]
    (
        [UserId] ASC,
        [Timestamp] DESC
    )
    PRINT 'Index IX_AuditLogs_UserId_Timestamp created'
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[AuditLogs]') AND name = N'IX_AuditLogs_Timestamp')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_AuditLogs_Timestamp] ON [dbo].[AuditLogs]
    (
        [Timestamp] DESC
    )
    PRINT 'Index IX_AuditLogs_Timestamp created'
END

PRINT '=========================================='
PRINT 'AuditLogs Table Creation Complete'
PRINT '=========================================='
