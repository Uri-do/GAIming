-- =============================================
-- GAImingDB Database Connection Test Script
-- Purpose: Test database connectivity and verify table structure
-- =============================================

-- Use the GAImingDB database
USE [GAImingDB]
GO

PRINT '=========================================='
PRINT 'GAImingDB Database Connection Test'
PRINT '=========================================='

-- Test 1: Check database exists and is accessible
PRINT 'Test 1: Database Connectivity'
SELECT 
    DB_NAME() as CurrentDatabase,
    @@SERVERNAME as ServerName,
    GETDATE() as CurrentDateTime
PRINT 'Database connectivity: OK'
PRINT ''

-- Test 2: Check auth schema and tables
PRINT 'Test 2: Authentication Tables'
IF EXISTS (SELECT * FROM sys.schemas WHERE name = 'auth')
BEGIN
    PRINT 'Auth schema: EXISTS'
    
    -- Check auth tables
    SELECT 
        TABLE_SCHEMA,
        TABLE_NAME,
        (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = t.TABLE_SCHEMA AND TABLE_NAME = t.TABLE_NAME) as ColumnCount
    FROM INFORMATION_SCHEMA.TABLES t
    WHERE TABLE_SCHEMA = 'auth'
    ORDER BY TABLE_NAME
    
    -- Check user count
    DECLARE @UserCount INT = (SELECT COUNT(*) FROM auth.Users)
    DECLARE @RoleCount INT = (SELECT COUNT(*) FROM auth.Roles)
    DECLARE @PermissionCount INT = (SELECT COUNT(*) FROM auth.Permissions)
    
    PRINT 'Users: ' + CAST(@UserCount AS VARCHAR(10))
    PRINT 'Roles: ' + CAST(@RoleCount AS VARCHAR(10))
    PRINT 'Permissions: ' + CAST(@PermissionCount AS VARCHAR(10))
END
ELSE
BEGIN
    PRINT 'Auth schema: NOT FOUND'
END
PRINT ''

-- Test 3: Check recommendation system tables
PRINT 'Test 3: Recommendation System Tables'
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = t.TABLE_SCHEMA AND TABLE_NAME = t.TABLE_NAME) as ColumnCount
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_SCHEMA = 'dbo' 
    AND TABLE_NAME IN (
        'GameRecommendations',
        'PlayerFeatures', 
        'GameFeatures',
        'RecommendationModels',
        'ABTestExperiments',
        'PlayerRiskAssessments',
        'RecommendationInteractions',
        'ModelPerformanceMetrics'
    )
ORDER BY TABLE_NAME

-- Check initial data
DECLARE @ModelCount INT = (SELECT COUNT(*) FROM RecommendationModels)
DECLARE @ExperimentCount INT = (SELECT COUNT(*) FROM ABTestExperiments)

PRINT 'Recommendation Models: ' + CAST(@ModelCount AS VARCHAR(10))
PRINT 'A/B Test Experiments: ' + CAST(@ExperimentCount AS VARCHAR(10))
PRINT ''

-- Test 4: Check views
PRINT 'Test 4: Database Views'
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME as VIEW_NAME
FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME
PRINT ''

-- Test 5: Check stored procedures
PRINT 'Test 5: Stored Procedures'
SELECT 
    ROUTINE_SCHEMA,
    ROUTINE_NAME
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_SCHEMA = 'dbo'
ORDER BY ROUTINE_NAME
PRINT ''

-- Test 6: Check foreign key constraints
PRINT 'Test 6: Foreign Key Constraints'
SELECT 
    fk.name AS ForeignKeyName,
    tp.name AS ParentTable,
    cp.name AS ParentColumn,
    tr.name AS ReferencedTable,
    cr.name AS ReferencedColumn
FROM sys.foreign_keys fk
INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
INNER JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
INNER JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
INNER JOIN sys.columns cp ON fkc.parent_column_id = cp.column_id AND fkc.parent_object_id = cp.object_id
INNER JOIN sys.columns cr ON fkc.referenced_column_id = cr.column_id AND fkc.referenced_object_id = cr.object_id
ORDER BY fk.name
PRINT ''

-- Test 7: Test default admin user
PRINT 'Test 7: Default Admin User'
IF EXISTS (SELECT * FROM auth.Users WHERE Username = 'admin')
BEGIN
    SELECT 
        Username,
        Email,
        DisplayName,
        IsActive,
        EmailConfirmed,
        CreatedDate
    FROM auth.Users 
    WHERE Username = 'admin'
    
    PRINT 'Default admin user: EXISTS'
    
    -- Check admin roles
    SELECT 
        r.Name as RoleName,
        r.Description
    FROM auth.UserRoles ur
    INNER JOIN auth.Roles r ON ur.RoleId = r.RoleId
    INNER JOIN auth.Users u ON ur.UserId = u.UserId
    WHERE u.Username = 'admin'
    
END
ELSE
BEGIN
    PRINT 'Default admin user: NOT FOUND'
END
PRINT ''

-- Test 8: Sample data insertion test
PRINT 'Test 8: Sample Data Insertion Test'
BEGIN TRY
    -- Test inserting a sample player feature
    IF NOT EXISTS (SELECT * FROM PlayerFeatures WHERE PlayerId = 999999)
    BEGIN
        INSERT INTO PlayerFeatures (PlayerId, Country, RiskLevel, VIPLevel, IsNewPlayer)
        VALUES (999999, 'TEST', 1, 0, 1)
        
        PRINT 'Sample PlayerFeature inserted: OK'
        
        -- Clean up test data
        DELETE FROM PlayerFeatures WHERE PlayerId = 999999
        PRINT 'Test data cleaned up: OK'
    END
    ELSE
    BEGIN
        PRINT 'Test player already exists, skipping insertion test'
    END
END TRY
BEGIN CATCH
    PRINT 'Sample data insertion test: FAILED'
    PRINT 'Error: ' + ERROR_MESSAGE()
END CATCH
PRINT ''

PRINT '=========================================='
PRINT 'GAImingDB Database Test Completed!'
PRINT '=========================================='
