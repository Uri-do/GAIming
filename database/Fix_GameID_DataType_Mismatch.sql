-- Fix GameID Data Type Mismatch
-- This script fixes the data type inconsistency between Games.GameID (int) and PlayedGames.GameID (bigint)
-- We'll change Games.GameID to bigint to match PlayedGames and other related tables

USE [ProgressPlayDBTest]
GO

PRINT 'Starting GameID data type migration...'

-- Step 1: Check current data types
PRINT 'Current data types:'
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
WHERE (t.name = 'Games' AND c.name = 'GameID')
   OR (t.name = 'Games_PlayedGames' AND c.name = 'GameID')
ORDER BY t.name, c.name

-- Step 2: Drop foreign key constraints that reference Games.GameID
PRINT 'Dropping foreign key constraints...'

-- Drop FK from PlayedGames to Games (if exists)
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PlayedGames_Games')
BEGIN
    ALTER TABLE [Games].[Games_PlayedGames] DROP CONSTRAINT [FK_PlayedGames_Games]
    PRINT 'Dropped FK_PlayedGames_Games'
END

-- Step 3: Change Games.GameID from int to bigint
PRINT 'Changing Games.GameID from int to bigint...'
ALTER TABLE [Games].[Games] ALTER COLUMN [GameID] BIGINT NOT NULL

-- Step 4: Recreate foreign key constraints
PRINT 'Recreating foreign key constraints...'

-- Recreate FK from PlayedGames to Games
ALTER TABLE [Games].[Games_PlayedGames] 
ADD CONSTRAINT [FK_PlayedGames_Games] 
FOREIGN KEY ([GameID]) REFERENCES [Games].[Games] ([GameID])

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
WHERE (t.name = 'Games' AND c.name = 'GameID')
   OR (t.name = 'Games_PlayedGames' AND c.name = 'GameID')
ORDER BY t.name, c.name

PRINT 'GameID data type mismatch fix completed successfully!'
