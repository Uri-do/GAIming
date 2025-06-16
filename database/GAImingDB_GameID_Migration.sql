-- GAIming Database GameID Migration
-- This script updates the GAIming database to use BIGINT for GameId columns

USE [GAImingDB]
GO

PRINT 'Starting GAIming GameID data type migration...'

-- Step 1: Check current data types
PRINT 'Current data types in GAIming database:'
SELECT 
    t.name AS TableName,
    c.name AS ColumnName,
    ty.name AS DataType,
    c.max_length,
    c.precision,
    c.scale
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
WHERE c.name LIKE '%GameId%'
ORDER BY t.name, c.name

-- Step 2: Update GameRecommendations table
PRINT 'Updating GameRecommendations.GameId to BIGINT...'
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GameRecommendations') AND name = 'GameId')
BEGIN
    ALTER TABLE [GameRecommendations] ALTER COLUMN [GameId] BIGINT NOT NULL
    PRINT 'GameRecommendations.GameId updated to BIGINT'
END

-- Step 3: Update GameFeatures table
PRINT 'Updating GameFeatures.GameId to BIGINT...'
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GameFeatures') AND name = 'GameId')
BEGIN
    ALTER TABLE [GameFeatures] ALTER COLUMN [GameId] BIGINT NOT NULL
    PRINT 'GameFeatures.GameId updated to BIGINT'
END

-- Step 4: Update RecommendationInteractions table
PRINT 'Updating RecommendationInteractions.GameId to BIGINT...'
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('RecommendationInteractions') AND name = 'GameId')
BEGIN
    ALTER TABLE [RecommendationInteractions] ALTER COLUMN [GameId] BIGINT NOT NULL
    PRINT 'RecommendationInteractions.GameId updated to BIGINT'
END

-- Step 5: Verify the changes
PRINT 'Verification - Updated data types:'
SELECT 
    t.name AS TableName,
    c.name AS ColumnName,
    ty.name AS DataType,
    c.max_length,
    c.precision,
    c.scale
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
WHERE c.name LIKE '%GameId%'
ORDER BY t.name, c.name

PRINT 'GAIming GameID data type migration completed successfully!'
