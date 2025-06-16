-- Migration: Add Game Management Tables
-- Description: Creates tables for game management, file import/export history, and real-time analytics
-- Date: 2024-06-14

-- Create Game Export History table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GameExportHistory' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[GameExportHistory] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [FileName] nvarchar(255) NOT NULL,
        [Format] nvarchar(10) NOT NULL,
        [RecordCount] int NOT NULL DEFAULT(0),
        [FileSizeBytes] bigint NOT NULL DEFAULT(0),
        [ExportedAt] datetime2(7) NOT NULL DEFAULT(GETUTCDATE()),
        [ExportedBy] nvarchar(100) NULL,
        [IncludedAnalytics] bit NOT NULL DEFAULT(0),
        [IncludedPlayerData] bit NOT NULL DEFAULT(0),
        [IncludedRecommendations] bit NOT NULL DEFAULT(0),
        [FilterCriteria] nvarchar(max) NULL,
        [DownloadCount] int NOT NULL DEFAULT(0),
        [LastDownloadedAt] datetime2(7) NULL,
        [IsAvailable] bit NOT NULL DEFAULT(1),
        [FilePath] nvarchar(500) NULL,
        [ExpiresAt] datetime2(7) NULL,
        CONSTRAINT [PK_GameExportHistory] PRIMARY KEY CLUSTERED ([Id] ASC)
    );

    CREATE NONCLUSTERED INDEX [IX_GameExportHistory_ExportedAt] ON [dbo].[GameExportHistory] ([ExportedAt] DESC);
    CREATE NONCLUSTERED INDEX [IX_GameExportHistory_ExportedBy] ON [dbo].[GameExportHistory] ([ExportedBy]);
    CREATE NONCLUSTERED INDEX [IX_GameExportHistory_IsAvailable] ON [dbo].[GameExportHistory] ([IsAvailable]);
END

-- Create Game Import History table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GameImportHistory' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[GameImportHistory] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [FileName] nvarchar(255) NOT NULL,
        [Format] nvarchar(10) NOT NULL,
        [TotalRecords] int NOT NULL DEFAULT(0),
        [ProcessedRecords] int NOT NULL DEFAULT(0),
        [CreatedRecords] int NOT NULL DEFAULT(0),
        [UpdatedRecords] int NOT NULL DEFAULT(0),
        [SkippedRecords] int NOT NULL DEFAULT(0),
        [ErrorCount] int NOT NULL DEFAULT(0),
        [WarningCount] int NOT NULL DEFAULT(0),
        [Success] bit NOT NULL DEFAULT(0),
        [ImportedAt] datetime2(7) NOT NULL DEFAULT(GETUTCDATE()),
        [ImportedBy] nvarchar(100) NULL,
        [ProcessingDuration] time(7) NOT NULL DEFAULT('00:00:00'),
        [FileSizeBytes] bigint NOT NULL DEFAULT(0),
        [UpdatedExisting] bit NOT NULL DEFAULT(0),
        [SkippedDuplicates] bit NOT NULL DEFAULT(1),
        [ErrorSummary] nvarchar(max) NULL,
        [WarningSummary] nvarchar(max) NULL,
        [ImportOptions] nvarchar(max) NULL,
        CONSTRAINT [PK_GameImportHistory] PRIMARY KEY CLUSTERED ([Id] ASC)
    );

    CREATE NONCLUSTERED INDEX [IX_GameImportHistory_ImportedAt] ON [dbo].[GameImportHistory] ([ImportedAt] DESC);
    CREATE NONCLUSTERED INDEX [IX_GameImportHistory_ImportedBy] ON [dbo].[GameImportHistory] ([ImportedBy]);
    CREATE NONCLUSTERED INDEX [IX_GameImportHistory_Success] ON [dbo].[GameImportHistory] ([Success]);
END

-- Create Recommendation Interactions table for real-time tracking
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RecommendationInteractions' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[RecommendationInteractions] (
        [Id] bigint IDENTITY(1,1) NOT NULL,
        [RecommendationId] bigint NOT NULL,
        [PlayerId] bigint NOT NULL,
        [GameId] bigint NOT NULL,
        [InteractionType] nvarchar(50) NOT NULL,
        [InteractionDate] datetime2(7) NOT NULL DEFAULT(GETUTCDATE()),
        [SessionId] nvarchar(100) NULL,
        [Platform] nvarchar(50) NULL,
        [UserAgent] nvarchar(500) NULL,
        [AdditionalData] nvarchar(max) NULL,
        [Algorithm] nvarchar(50) NULL,
        [Score] float NULL,
        [Position] int NULL,
        [Context] nvarchar(100) NULL,
        CONSTRAINT [PK_RecommendationInteractions] PRIMARY KEY CLUSTERED ([Id] ASC)
    );

    CREATE NONCLUSTERED INDEX [IX_RecommendationInteractions_PlayerId] ON [dbo].[RecommendationInteractions] ([PlayerId]);
    CREATE NONCLUSTERED INDEX [IX_RecommendationInteractions_GameId] ON [dbo].[RecommendationInteractions] ([GameId]);
    CREATE NONCLUSTERED INDEX [IX_RecommendationInteractions_InteractionDate] ON [dbo].[RecommendationInteractions] ([InteractionDate] DESC);
    CREATE NONCLUSTERED INDEX [IX_RecommendationInteractions_InteractionType] ON [dbo].[RecommendationInteractions] ([InteractionType]);
    CREATE NONCLUSTERED INDEX [IX_RecommendationInteractions_Algorithm] ON [dbo].[RecommendationInteractions] ([Algorithm]);
END

-- Update GameManagementSettings table if it exists but missing columns
IF EXISTS (SELECT * FROM sysobjects WHERE name='GameManagementSettings' AND xtype='U')
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GameManagementSettings') AND name = 'PromotionSettings')
    BEGIN
        ALTER TABLE [dbo].[GameManagementSettings] ADD [PromotionSettings] nvarchar(max) NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GameManagementSettings') AND name = 'ABTestSettings')
    BEGIN
        ALTER TABLE [dbo].[GameManagementSettings] ADD [ABTestSettings] nvarchar(max) NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GameManagementSettings') AND name = 'ResponsibleGamingSettings')
    BEGIN
        ALTER TABLE [dbo].[GameManagementSettings] ADD [ResponsibleGamingSettings] nvarchar(max) NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GameManagementSettings') AND name = 'RegionalSettings')
    BEGIN
        ALTER TABLE [dbo].[GameManagementSettings] ADD [RegionalSettings] nvarchar(max) NULL;
    END
END

-- Create Player Risk Assessments table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PlayerRiskAssessments' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[PlayerRiskAssessments] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [PlayerId] bigint NOT NULL,
        [RiskLevel] int NOT NULL,
        [RiskCategory] nvarchar(50) NOT NULL,
        [AssessmentDate] datetime2(7) NOT NULL DEFAULT(GETUTCDATE()),
        [RiskFactors] nvarchar(max) NULL,
        [Recommendations] nvarchar(max) NULL,
        [NextAssessmentDate] datetime2(7) NULL,
        [AssessedBy] nvarchar(100) NULL,
        [IsActive] bit NOT NULL DEFAULT(1),
        CONSTRAINT [PK_PlayerRiskAssessments] PRIMARY KEY CLUSTERED ([Id] ASC)
    );

    CREATE NONCLUSTERED INDEX [IX_PlayerRiskAssessments_PlayerId] ON [dbo].[PlayerRiskAssessments] ([PlayerId]);
    CREATE NONCLUSTERED INDEX [IX_PlayerRiskAssessments_RiskLevel] ON [dbo].[PlayerRiskAssessments] ([RiskLevel]);
    CREATE NONCLUSTERED INDEX [IX_PlayerRiskAssessments_AssessmentDate] ON [dbo].[PlayerRiskAssessments] ([AssessmentDate] DESC);
    CREATE NONCLUSTERED INDEX [IX_PlayerRiskAssessments_IsActive] ON [dbo].[PlayerRiskAssessments] ([IsActive]);
END

-- Create indexes for better performance on existing tables
IF EXISTS (SELECT * FROM sysobjects WHERE name='GameRecommendations' AND xtype='U')
BEGIN
    -- Add performance indexes if they don't exist
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('GameRecommendations') AND name = 'IX_GameRecommendations_CreatedDate_Algorithm')
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_GameRecommendations_CreatedDate_Algorithm] 
        ON [dbo].[GameRecommendations] ([CreatedDate] DESC, [Algorithm]);
    END

    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('GameRecommendations') AND name = 'IX_GameRecommendations_PlayerId_GameId')
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_GameRecommendations_PlayerId_GameId] 
        ON [dbo].[GameRecommendations] ([PlayerId], [GameId]);
    END

    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('GameRecommendations') AND name = 'IX_GameRecommendations_IsClicked_IsPlayed')
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_GameRecommendations_IsClicked_IsPlayed] 
        ON [dbo].[GameRecommendations] ([IsClicked], [IsPlayed]) 
        INCLUDE ([CreatedDate], [Algorithm], [Score]);
    END
END

-- Create stored procedures for common analytics queries
IF NOT EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetRealTimeGameMetrics')
BEGIN
    EXEC('
    CREATE PROCEDURE [dbo].[sp_GetRealTimeGameMetrics]
        @GameIds NVARCHAR(MAX),
        @TimeWindowMinutes INT = 60
    AS
    BEGIN
        SET NOCOUNT ON;
        
        DECLARE @StartTime DATETIME2 = DATEADD(MINUTE, -@GameIds, GETUTCDATE());
        
        -- Parse comma-separated game IDs
        DECLARE @GameIdTable TABLE (GameId BIGINT);
        INSERT INTO @GameIdTable (GameId)
        SELECT CAST(value AS BIGINT) 
        FROM STRING_SPLIT(@GameIds, '','') 
        WHERE value != '''';
        
        -- Get real-time metrics
        SELECT 
            g.GameId,
            COUNT(DISTINCT pg.PlayerID) AS ActivePlayers,
            COUNT(pg.Id) AS ActiveSessions,
            SUM(pg.TotalBet) AS TotalBets,
            SUM(pg.TotalWin) AS TotalWins,
            SUM(pg.TotalBet - pg.TotalWin) AS Revenue,
            AVG(pg.TotalBet) AS AverageBetSize,
            GETUTCDATE() AS Timestamp
        FROM @GameIdTable g
        LEFT JOIN PlayedGames pg ON g.GameId = pg.GameID 
            AND pg.CreationDate >= @StartTime
            AND pg.GameStatus = 1
        GROUP BY g.GameId;
    END
    ');
END

-- Create function for calculating recommendation CTR
IF NOT EXISTS (SELECT * FROM sys.objects WHERE type = 'FN' AND name = 'fn_CalculateRecommendationCTR')
BEGIN
    EXEC('
    CREATE FUNCTION [dbo].[fn_CalculateRecommendationCTR]
    (
        @GameId BIGINT,
        @TimeWindowMinutes INT
    )
    RETURNS FLOAT
    AS
    BEGIN
        DECLARE @CTR FLOAT = 0;
        DECLARE @StartTime DATETIME2 = DATEADD(MINUTE, -@TimeWindowMinutes, GETUTCDATE());
        
        DECLARE @TotalRecommendations INT;
        DECLARE @ClickedRecommendations INT;
        
        SELECT 
            @TotalRecommendations = COUNT(*),
            @ClickedRecommendations = SUM(CASE WHEN IsClicked = 1 THEN 1 ELSE 0 END)
        FROM GameRecommendations
        WHERE GameId = @GameId 
            AND CreatedDate >= @StartTime;
        
        IF @TotalRecommendations > 0
            SET @CTR = CAST(@ClickedRecommendations AS FLOAT) / @TotalRecommendations;
        
        RETURN @CTR;
    END
    ');
END

-- Insert default data for testing
IF NOT EXISTS (SELECT * FROM GameExportHistory)
BEGIN
    INSERT INTO GameExportHistory (FileName, Format, RecordCount, FileSizeBytes, ExportedBy, IncludedAnalytics)
    VALUES 
        ('games_export_sample.xlsx', 'xlsx', 150, 2048576, 'system', 1),
        ('games_export_basic.csv', 'csv', 75, 512000, 'admin', 0);
END

PRINT 'Game Management tables created successfully';
