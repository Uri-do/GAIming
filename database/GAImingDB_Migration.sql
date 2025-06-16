-- =============================================
-- GAImingDB Database Creation and Migration Script
-- Purpose: Create the GAIming recommendation system database
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
-- Create Recommendation System Tables
-- =============================================

-- Note: Authentication tables are created separately using GAImingDB_Auth_Migration.sql

-- 1. GameRecommendations Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GameRecommendations' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[GameRecommendations] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL,
        [PlayerId] BIGINT NOT NULL,
        [GameId] BIGINT NOT NULL,
        [Score] FLOAT NOT NULL,
        [Algorithm] NVARCHAR(50) NOT NULL,
        [Reason] NVARCHAR(500) NULL,
        [Position] INT NOT NULL,
        [Context] NVARCHAR(200) NULL,
        [Category] NVARCHAR(50) NULL,
        [IsClicked] BIT NOT NULL DEFAULT 0,
        [IsPlayed] BIT NOT NULL DEFAULT 0,
        [ClickedAt] DATETIME2 NULL,
        [PlayedAt] DATETIME2 NULL,
        [SessionId] NVARCHAR(100) NULL,
        [Variant] NVARCHAR(20) NULL,
        [ModelVersion] NVARCHAR(20) NULL,
        [Features] NVARCHAR(MAX) NULL,
        [Metadata] NVARCHAR(MAX) NULL,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_GameRecommendations] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
    
    -- Create indexes for GameRecommendations
    CREATE INDEX [IX_GameRecommendations_PlayerId] ON [dbo].[GameRecommendations] ([PlayerId])
    CREATE INDEX [IX_GameRecommendations_GameId] ON [dbo].[GameRecommendations] ([GameId])
    CREATE INDEX [IX_GameRecommendations_Algorithm] ON [dbo].[GameRecommendations] ([Algorithm])
    CREATE INDEX [IX_GameRecommendations_CreatedDate] ON [dbo].[GameRecommendations] ([CreatedDate])
    CREATE INDEX [IX_GameRecommendations_Score] ON [dbo].[GameRecommendations] ([Score])
    CREATE INDEX [IX_GameRecommendations_Context] ON [dbo].[GameRecommendations] ([Context])
    CREATE INDEX [IX_GameRecommendations_Category] ON [dbo].[GameRecommendations] ([Category])
    
    PRINT 'GameRecommendations table created successfully'
END

-- 2. PlayerFeatures Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PlayerFeatures' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[PlayerFeatures] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL,
        [PlayerId] BIGINT NOT NULL,
        [Age] INT NOT NULL DEFAULT 0,
        [Country] NVARCHAR(50) NOT NULL DEFAULT '',
        [RiskLevel] INT NOT NULL DEFAULT 1,
        [VIPLevel] INT NOT NULL DEFAULT 0,
        [TotalDeposits] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [TotalBets] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [TotalWins] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [SessionCount] INT NOT NULL DEFAULT 0,
        [AverageSessionDuration] FLOAT NOT NULL DEFAULT 0,
        [LastPlayDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [DaysSinceLastPlay] INT NOT NULL DEFAULT 0,
        [PreferredGameTypes] NVARCHAR(500) NOT NULL DEFAULT '',
        [PreferredProviders] NVARCHAR(500) NOT NULL DEFAULT '',
        [PreferredVolatility] FLOAT NOT NULL DEFAULT 0,
        [PreferredRTP] FLOAT NOT NULL DEFAULT 0,
        [AverageBetSize] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [PlayStyle] NVARCHAR(20) NOT NULL DEFAULT '',
        [WinRate] FLOAT NOT NULL DEFAULT 0,
        [ConsecutiveLosses] INT NOT NULL DEFAULT 0,
        [IsNewPlayer] BIT NOT NULL DEFAULT 1,
        [CustomFeatures] NVARCHAR(MAX) NOT NULL DEFAULT '',
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_PlayerFeatures] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
    
    -- Create indexes for PlayerFeatures
    CREATE UNIQUE INDEX [IX_PlayerFeatures_PlayerId] ON [dbo].[PlayerFeatures] ([PlayerId])
    CREATE INDEX [IX_PlayerFeatures_UpdatedDate] ON [dbo].[PlayerFeatures] ([UpdatedDate])
    CREATE INDEX [IX_PlayerFeatures_RiskLevel] ON [dbo].[PlayerFeatures] ([RiskLevel])
    CREATE INDEX [IX_PlayerFeatures_VIPLevel] ON [dbo].[PlayerFeatures] ([VIPLevel])
    
    PRINT 'PlayerFeatures table created successfully'
END

-- 3. GameFeatures Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GameFeatures' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[GameFeatures] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL,
        [GameId] BIGINT NOT NULL,
        [GameName] NVARCHAR(100) NOT NULL DEFAULT '',
        [ProviderId] INT NOT NULL DEFAULT 0,
        [GameTypeId] INT NOT NULL DEFAULT 0,
        [VolatilityId] INT NOT NULL DEFAULT 0,
        [AverageRTP] FLOAT NOT NULL DEFAULT 0,
        [MinBetAmount] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [IsMobile] BIT NOT NULL DEFAULT 0,
        [IsDesktop] BIT NOT NULL DEFAULT 1,
        [ThemeId] INT NOT NULL DEFAULT 0,
        [PopularityScore] FLOAT NOT NULL DEFAULT 0,
        [RevenueScore] FLOAT NOT NULL DEFAULT 0,
        [TotalPlayers] INT NOT NULL DEFAULT 0,
        [ActivePlayers] INT NOT NULL DEFAULT 0,
        [AverageSessionDuration] FLOAT NOT NULL DEFAULT 0,
        [RetentionRate] FLOAT NOT NULL DEFAULT 0,
        [Tags] NVARCHAR(500) NOT NULL DEFAULT '',
        [ReleaseDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [IsNewGame] BIT NOT NULL DEFAULT 0,
        [CustomFeatures] NVARCHAR(MAX) NOT NULL DEFAULT '',
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_GameFeatures] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
    
    -- Create indexes for GameFeatures
    CREATE UNIQUE INDEX [IX_GameFeatures_GameId] ON [dbo].[GameFeatures] ([GameId])
    CREATE INDEX [IX_GameFeatures_ProviderId] ON [dbo].[GameFeatures] ([ProviderId])
    CREATE INDEX [IX_GameFeatures_GameTypeId] ON [dbo].[GameFeatures] ([GameTypeId])
    CREATE INDEX [IX_GameFeatures_VolatilityId] ON [dbo].[GameFeatures] ([VolatilityId])
    CREATE INDEX [IX_GameFeatures_PopularityScore] ON [dbo].[GameFeatures] ([PopularityScore])
    CREATE INDEX [IX_GameFeatures_UpdatedDate] ON [dbo].[GameFeatures] ([UpdatedDate])
    
    PRINT 'GameFeatures table created successfully'
END

-- 4. RecommendationModels Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RecommendationModels' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[RecommendationModels] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL,
        [ModelName] NVARCHAR(100) NOT NULL,
        [Version] NVARCHAR(50) NOT NULL,
        [Algorithm] NVARCHAR(50) NOT NULL,
        [Description] NVARCHAR(500) NULL,
        [ModelPath] NVARCHAR(MAX) NOT NULL DEFAULT '',
        [Configuration] NVARCHAR(MAX) NOT NULL DEFAULT '',
        [Hyperparameters] NVARCHAR(MAX) NOT NULL DEFAULT '',
        [Metrics] NVARCHAR(MAX) NOT NULL DEFAULT '',
        [IsActive] BIT NOT NULL DEFAULT 0,
        [IsDefault] BIT NOT NULL DEFAULT 0,
        [TrainingStartDate] DATETIME2 NULL,
        [TrainingEndDate] DATETIME2 NULL,
        [CreatedBy] NVARCHAR(100) NULL,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_RecommendationModels] PRIMARY KEY CLUSTERED ([Id] ASC)
    )

    -- Create indexes for RecommendationModels
    CREATE UNIQUE INDEX [IX_RecommendationModels_ModelName_Version] ON [dbo].[RecommendationModels] ([ModelName], [Version])
    CREATE INDEX [IX_RecommendationModels_Algorithm] ON [dbo].[RecommendationModels] ([Algorithm])
    CREATE INDEX [IX_RecommendationModels_IsActive] ON [dbo].[RecommendationModels] ([IsActive])
    CREATE INDEX [IX_RecommendationModels_IsDefault] ON [dbo].[RecommendationModels] ([IsDefault])

    PRINT 'RecommendationModels table created successfully'
END

-- 5. ABTestExperiments Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ABTestExperiments' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[ABTestExperiments] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL,
        [ExperimentName] NVARCHAR(100) NOT NULL,
        [Description] NVARCHAR(500) NULL,
        [StartDate] DATETIME2 NOT NULL,
        [EndDate] DATETIME2 NULL,
        [Status] INT NOT NULL DEFAULT 0, -- 0=Draft, 1=Running, 2=Paused, 3=Completed, 4=Cancelled
        [Configuration] NVARCHAR(MAX) NOT NULL DEFAULT '',
        [Variants] NVARCHAR(MAX) NOT NULL DEFAULT '',
        [Results] NVARCHAR(MAX) NOT NULL DEFAULT '',
        [WinningVariant] NVARCHAR(100) NULL,
        [ConfidenceLevel] FLOAT NOT NULL DEFAULT 0,
        [IsStatisticallySignificant] BIT NOT NULL DEFAULT 0,
        [CreatedBy] NVARCHAR(100) NULL,
        [UpdatedBy] NVARCHAR(100) NULL,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_ABTestExperiments] PRIMARY KEY CLUSTERED ([Id] ASC)
    )

    -- Create indexes for ABTestExperiments
    CREATE UNIQUE INDEX [IX_ABTestExperiments_ExperimentName] ON [dbo].[ABTestExperiments] ([ExperimentName])
    CREATE INDEX [IX_ABTestExperiments_Status] ON [dbo].[ABTestExperiments] ([Status])
    CREATE INDEX [IX_ABTestExperiments_StartDate] ON [dbo].[ABTestExperiments] ([StartDate])
    CREATE INDEX [IX_ABTestExperiments_EndDate] ON [dbo].[ABTestExperiments] ([EndDate])

    PRINT 'ABTestExperiments table created successfully'
END

-- 6. PlayerRiskAssessments Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PlayerRiskAssessments' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[PlayerRiskAssessments] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL,
        [PlayerId] BIGINT NOT NULL,
        [RiskScore] FLOAT NOT NULL DEFAULT 0,
        [RiskLevel] INT NOT NULL DEFAULT 1, -- 1=Low, 2=Medium, 3=High, 4=Very High, 5=Critical
        [SpendingVelocity] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [SessionFrequency] FLOAT NOT NULL DEFAULT 0,
        [LossChasing] BIT NOT NULL DEFAULT 0,
        [TimeSpentGaming] FLOAT NOT NULL DEFAULT 0,
        [DepositFrequency] FLOAT NOT NULL DEFAULT 0,
        [WithdrawalPattern] NVARCHAR(50) NOT NULL DEFAULT '',
        [GameVariety] INT NOT NULL DEFAULT 0,
        [BettingPattern] NVARCHAR(50) NOT NULL DEFAULT '',
        [Triggers] NVARCHAR(MAX) NOT NULL DEFAULT '',
        [Recommendations] NVARCHAR(MAX) NOT NULL DEFAULT '',
        [LastAssessmentDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [NextAssessmentDate] DATETIME2 NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_PlayerRiskAssessments] PRIMARY KEY CLUSTERED ([Id] ASC)
    )

    -- Create indexes for PlayerRiskAssessments
    CREATE INDEX [IX_PlayerRiskAssessments_PlayerId] ON [dbo].[PlayerRiskAssessments] ([PlayerId])
    CREATE INDEX [IX_PlayerRiskAssessments_RiskLevel] ON [dbo].[PlayerRiskAssessments] ([RiskLevel])
    CREATE INDEX [IX_PlayerRiskAssessments_RiskScore] ON [dbo].[PlayerRiskAssessments] ([RiskScore])
    CREATE INDEX [IX_PlayerRiskAssessments_LastAssessmentDate] ON [dbo].[PlayerRiskAssessments] ([LastAssessmentDate])
    CREATE INDEX [IX_PlayerRiskAssessments_IsActive] ON [dbo].[PlayerRiskAssessments] ([IsActive])

    PRINT 'PlayerRiskAssessments table created successfully'
END

-- 7. RecommendationInteractions Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RecommendationInteractions' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[RecommendationInteractions] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL,
        [RecommendationId] BIGINT NOT NULL,
        [PlayerId] BIGINT NOT NULL,
        [GameId] BIGINT NOT NULL,
        [InteractionType] NVARCHAR(50) NOT NULL, -- 'view', 'click', 'play', 'dismiss', 'like', 'dislike'
        [InteractionValue] FLOAT NULL,
        [SessionId] NVARCHAR(100) NULL,
        [Context] NVARCHAR(200) NULL,
        [DeviceType] NVARCHAR(20) NULL,
        [UserAgent] NVARCHAR(500) NULL,
        [IPAddress] NVARCHAR(45) NULL,
        [Metadata] NVARCHAR(MAX) NULL,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_RecommendationInteractions] PRIMARY KEY CLUSTERED ([Id] ASC)
    )

    -- Create indexes for RecommendationInteractions
    CREATE INDEX [IX_RecommendationInteractions_RecommendationId] ON [dbo].[RecommendationInteractions] ([RecommendationId])
    CREATE INDEX [IX_RecommendationInteractions_PlayerId] ON [dbo].[RecommendationInteractions] ([PlayerId])
    CREATE INDEX [IX_RecommendationInteractions_GameId] ON [dbo].[RecommendationInteractions] ([GameId])
    CREATE INDEX [IX_RecommendationInteractions_InteractionType] ON [dbo].[RecommendationInteractions] ([InteractionType])
    CREATE INDEX [IX_RecommendationInteractions_CreatedDate] ON [dbo].[RecommendationInteractions] ([CreatedDate])
    CREATE INDEX [IX_RecommendationInteractions_SessionId] ON [dbo].[RecommendationInteractions] ([SessionId])

    PRINT 'RecommendationInteractions table created successfully'
END

-- 8. ModelPerformanceMetrics Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ModelPerformanceMetrics' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[ModelPerformanceMetrics] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL,
        [ModelId] BIGINT NOT NULL,
        [MetricName] NVARCHAR(100) NOT NULL,
        [MetricValue] FLOAT NOT NULL,
        [MetricType] NVARCHAR(50) NOT NULL, -- 'accuracy', 'precision', 'recall', 'f1', 'auc', 'ctr', 'conversion'
        [EvaluationDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [DatasetSize] INT NULL,
        [TestPeriodStart] DATETIME2 NULL,
        [TestPeriodEnd] DATETIME2 NULL,
        [Metadata] NVARCHAR(MAX) NULL,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_ModelPerformanceMetrics] PRIMARY KEY CLUSTERED ([Id] ASC)
    )

    -- Create indexes for ModelPerformanceMetrics
    CREATE INDEX [IX_ModelPerformanceMetrics_ModelId] ON [dbo].[ModelPerformanceMetrics] ([ModelId])
    CREATE INDEX [IX_ModelPerformanceMetrics_MetricName] ON [dbo].[ModelPerformanceMetrics] ([MetricName])
    CREATE INDEX [IX_ModelPerformanceMetrics_MetricType] ON [dbo].[ModelPerformanceMetrics] ([MetricType])
    CREATE INDEX [IX_ModelPerformanceMetrics_EvaluationDate] ON [dbo].[ModelPerformanceMetrics] ([EvaluationDate])

    PRINT 'ModelPerformanceMetrics table created successfully'
END

-- =============================================
-- Create Foreign Key Constraints
-- =============================================

-- Note: Auth table foreign keys are created in GAImingDB_Auth_Migration.sql
-- Note: Foreign keys to ProgressPlayDBTest tables are not created here
-- as they would be cross-database references. These should be handled
-- at the application level or through linked servers if needed.

-- Foreign key from ModelPerformanceMetrics to RecommendationModels
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ModelPerformanceMetrics_RecommendationModels')
BEGIN
    ALTER TABLE [dbo].[ModelPerformanceMetrics]
    ADD CONSTRAINT [FK_ModelPerformanceMetrics_RecommendationModels]
    FOREIGN KEY ([ModelId]) REFERENCES [dbo].[RecommendationModels]([Id])
    ON DELETE CASCADE

    PRINT 'Foreign key FK_ModelPerformanceMetrics_RecommendationModels created'
END

-- Foreign key from RecommendationInteractions to GameRecommendations
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_RecommendationInteractions_GameRecommendations')
BEGIN
    ALTER TABLE [dbo].[RecommendationInteractions]
    ADD CONSTRAINT [FK_RecommendationInteractions_GameRecommendations]
    FOREIGN KEY ([RecommendationId]) REFERENCES [dbo].[GameRecommendations]([Id])
    ON DELETE CASCADE

    PRINT 'Foreign key FK_RecommendationInteractions_GameRecommendations created'
END

-- =============================================
-- Insert Initial Data
-- =============================================

-- Insert default recommendation model
IF NOT EXISTS (SELECT * FROM [dbo].[RecommendationModels] WHERE [ModelName] = 'DefaultCollaborativeFiltering')
BEGIN
    INSERT INTO [dbo].[RecommendationModels]
    ([ModelName], [Version], [Algorithm], [Description], [IsActive], [IsDefault], [CreatedBy])
    VALUES
    ('DefaultCollaborativeFiltering', '1.0.0', 'CollaborativeFiltering', 'Default collaborative filtering model for game recommendations', 1, 1, 'System')

    PRINT 'Default recommendation model inserted'
END

-- Insert content-based filtering model
IF NOT EXISTS (SELECT * FROM [dbo].[RecommendationModels] WHERE [ModelName] = 'ContentBasedFiltering')
BEGIN
    INSERT INTO [dbo].[RecommendationModels]
    ([ModelName], [Version], [Algorithm], [Description], [IsActive], [IsDefault], [CreatedBy])
    VALUES
    ('ContentBasedFiltering', '1.0.0', 'ContentBased', 'Content-based filtering model using game features', 1, 0, 'System')

    PRINT 'Content-based filtering model inserted'
END

-- Insert hybrid model
IF NOT EXISTS (SELECT * FROM [dbo].[RecommendationModels] WHERE [ModelName] = 'HybridRecommendation')
BEGIN
    INSERT INTO [dbo].[RecommendationModels]
    ([ModelName], [Version], [Algorithm], [Description], [IsActive], [IsDefault], [CreatedBy])
    VALUES
    ('HybridRecommendation', '1.0.0', 'Hybrid', 'Hybrid model combining collaborative and content-based filtering', 0, 0, 'System')

    PRINT 'Hybrid recommendation model inserted'
END

-- Insert sample A/B test experiment
IF NOT EXISTS (SELECT * FROM [dbo].[ABTestExperiments] WHERE [ExperimentName] = 'RecommendationAlgorithmTest')
BEGIN
    INSERT INTO [dbo].[ABTestExperiments]
    ([ExperimentName], [Description], [StartDate], [Status], [Configuration], [Variants], [CreatedBy])
    VALUES
    ('RecommendationAlgorithmTest',
     'Testing different recommendation algorithms for game suggestions',
     GETUTCDATE(),
     0, -- Draft status
     '{"trafficSplit": 50, "duration": 30, "metrics": ["ctr", "conversion", "revenue"]}',
     '{"control": {"algorithm": "CollaborativeFiltering"}, "variant": {"algorithm": "ContentBased"}}',
     'System')

    PRINT 'Sample A/B test experiment inserted'
END

-- =============================================
-- Create Views for Common Queries
-- =============================================

-- View for active recommendations with game details
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'vw_ActiveRecommendations')
BEGIN
    EXEC('
    CREATE VIEW [dbo].[vw_ActiveRecommendations] AS
    SELECT
        gr.Id,
        gr.PlayerId,
        gr.GameId,
        gr.Score,
        gr.Algorithm,
        gr.Reason,
        gr.Position,
        gr.Context,
        gr.Category,
        gr.IsClicked,
        gr.IsPlayed,
        gr.CreatedDate,
        gf.GameName,
        gf.ProviderId,
        gf.GameTypeId,
        gf.PopularityScore
    FROM GameRecommendations gr
    LEFT JOIN GameFeatures gf ON gr.GameId = gf.GameId
    WHERE gr.CreatedDate >= DATEADD(day, -7, GETUTCDATE())
    ')

    PRINT 'View vw_ActiveRecommendations created'
END

-- View for player risk summary
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'vw_PlayerRiskSummary')
BEGIN
    EXEC('
    CREATE VIEW [dbo].[vw_PlayerRiskSummary] AS
    SELECT
        pra.PlayerId,
        pra.RiskScore,
        pra.RiskLevel,
        pra.SpendingVelocity,
        pra.LossChasing,
        pra.LastAssessmentDate,
        pf.TotalDeposits,
        pf.TotalBets,
        pf.TotalWins,
        pf.SessionCount,
        pf.AverageSessionDuration
    FROM PlayerRiskAssessments pra
    LEFT JOIN PlayerFeatures pf ON pra.PlayerId = pf.PlayerId
    WHERE pra.IsActive = 1
    ')

    PRINT 'View vw_PlayerRiskSummary created'
END

-- =============================================
-- Create Stored Procedures for Common Operations
-- =============================================

-- Procedure to update player features
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdatePlayerFeatures')
BEGIN
    EXEC('
    CREATE PROCEDURE [dbo].[sp_UpdatePlayerFeatures]
        @PlayerId BIGINT,
        @TotalDeposits DECIMAL(18,2) = NULL,
        @TotalBets DECIMAL(18,2) = NULL,
        @TotalWins DECIMAL(18,2) = NULL,
        @SessionCount INT = NULL,
        @AverageSessionDuration FLOAT = NULL
    AS
    BEGIN
        SET NOCOUNT ON;

        IF EXISTS (SELECT 1 FROM PlayerFeatures WHERE PlayerId = @PlayerId)
        BEGIN
            UPDATE PlayerFeatures
            SET
                TotalDeposits = ISNULL(@TotalDeposits, TotalDeposits),
                TotalBets = ISNULL(@TotalBets, TotalBets),
                TotalWins = ISNULL(@TotalWins, TotalWins),
                SessionCount = ISNULL(@SessionCount, SessionCount),
                AverageSessionDuration = ISNULL(@AverageSessionDuration, AverageSessionDuration),
                UpdatedDate = GETUTCDATE()
            WHERE PlayerId = @PlayerId
        END
        ELSE
        BEGIN
            INSERT INTO PlayerFeatures (PlayerId, TotalDeposits, TotalBets, TotalWins, SessionCount, AverageSessionDuration)
            VALUES (@PlayerId, ISNULL(@TotalDeposits, 0), ISNULL(@TotalBets, 0), ISNULL(@TotalWins, 0),
                    ISNULL(@SessionCount, 0), ISNULL(@AverageSessionDuration, 0))
        END
    END
    ')

    PRINT 'Stored procedure sp_UpdatePlayerFeatures created'
END

-- =============================================
-- Migration Complete
-- =============================================

PRINT '=========================================='
PRINT 'GAImingDB Migration Completed Successfully!'
PRINT '=========================================='
PRINT 'Tables Created:'
PRINT '  - GameRecommendations'
PRINT '  - PlayerFeatures'
PRINT '  - GameFeatures'
PRINT '  - RecommendationModels'
PRINT '  - ABTestExperiments'
PRINT '  - PlayerRiskAssessments'
PRINT '  - RecommendationInteractions'
PRINT '  - ModelPerformanceMetrics'
PRINT ''
PRINT 'Views Created:'
PRINT '  - vw_ActiveRecommendations'
PRINT '  - vw_PlayerRiskSummary'
PRINT ''
PRINT 'Stored Procedures Created:'
PRINT '  - sp_UpdatePlayerFeatures'
PRINT ''
PRINT 'Initial Data Inserted:'
PRINT '  - 3 Default recommendation models'
PRINT '  - 1 Sample A/B test experiment'
PRINT '=========================================='
