# GAIming API Comprehensive Test Suite
# This script tests all major API endpoints systematically

$baseUrl = "http://localhost:65073"
$httpsUrl = "https://localhost:65072"

Write-Host "=== GAIming API Comprehensive Test Suite ===" -ForegroundColor Green
Write-Host "Testing API at: $baseUrl" -ForegroundColor Yellow
Write-Host "HTTPS URL: $httpsUrl" -ForegroundColor Yellow

# Global variables for test results
$global:TestResults = @()
$global:AuthToken = $null

# Function to make HTTP requests and track results
function Test-Endpoint {
    param(
        [string]$TestName,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [string]$ExpectedStatus = "200",
        [bool]$SaveResponse = $false
    )
    
    Write-Host "`n--- Testing: $TestName ---" -ForegroundColor Cyan
    Write-Host "URL: $Method $Url" -ForegroundColor Gray
    
    $testResult = @{
        TestName = $TestName
        Method = $Method
        Url = $Url
        Status = "FAILED"
        StatusCode = $null
        ResponseTime = $null
        ErrorMessage = $null
        Response = $null
    }
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params
        $stopwatch.Stop()
        
        $testResult.StatusCode = $response.StatusCode
        $testResult.ResponseTime = $stopwatch.ElapsedMilliseconds
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            $testResult.Status = "PASSED"
            Write-Host "✅ PASSED ($($stopwatch.ElapsedMilliseconds)ms)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ UNEXPECTED STATUS: $($response.StatusCode)" -ForegroundColor Yellow
        }
        
        if ($SaveResponse) {
            $testResult.Response = $response.Content
        }
        
        # Show response preview
        if ($response.Content.Length -lt 500) {
            Write-Host "Response: $($response.Content)" -ForegroundColor Gray
        } else {
            Write-Host "Response: [Large response - $($response.Content.Length) chars]" -ForegroundColor Gray
        }
        
        return $response
    }
    catch {
        $stopwatch.Stop()
        $testResult.ErrorMessage = $_.Exception.Message
        $testResult.ResponseTime = $stopwatch.ElapsedMilliseconds
        
        Write-Host "❌ FAILED ($($stopwatch.ElapsedMilliseconds)ms)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $testResult.StatusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
        
        return $null
    }
    finally {
        $global:TestResults += $testResult
    }
}

# Function to extract token from auth response
function Extract-AuthToken {
    param([string]$ResponseContent)
    
    try {
        $authResult = $ResponseContent | ConvertFrom-Json
        if ($authResult.isSuccess -and $authResult.token.accessToken) {
            return $authResult.token.accessToken
        }
    }
    catch {
        Write-Host "Failed to extract token: $($_.Exception.Message)" -ForegroundColor Red
    }
    return $null
}

Write-Host "`n🏥 PHASE 1: HEALTH & STATUS CHECKS" -ForegroundColor Magenta

# Test root endpoint
Test-Endpoint -TestName "Root Health Check" -Url "$baseUrl/"

# Test API health endpoints
Test-Endpoint -TestName "API Health Check" -Url "$baseUrl/api/health"
Test-Endpoint -TestName "Detailed Health Check" -Url "$baseUrl/api/health/detailed"

Write-Host "`n🔐 PHASE 2: AUTHENTICATION TESTS" -ForegroundColor Magenta

# Test login with valid credentials
$loginBody = '{"username":"testuser","password":"testpass"}'
$authResponse = Test-Endpoint -TestName "Login with Valid Credentials" -Url "$baseUrl/api/auth/login" -Method "POST" -Body $loginBody -SaveResponse $true

if ($authResponse) {
    $global:AuthToken = Extract-AuthToken -ResponseContent $authResponse.Content
    if ($global:AuthToken) {
        Write-Host "🔑 Auth token extracted successfully" -ForegroundColor Green
    }
}

# Test login with invalid credentials
$invalidLoginBody = '{"username":"invalid","password":"invalid"}'
Test-Endpoint -TestName "Login with Invalid Credentials" -Url "$baseUrl/api/auth/login" -Method "POST" -Body $invalidLoginBody -ExpectedStatus "401"

# Test refresh token (if we have a token)
if ($global:AuthToken) {
    $refreshBody = '{"refreshToken":"mock-refresh-token"}'
    Test-Endpoint -TestName "Refresh Token" -Url "$baseUrl/api/auth/refresh" -Method "POST" -Body $refreshBody
}

# Test logout
Test-Endpoint -TestName "Logout" -Url "$baseUrl/api/auth/logout" -Method "POST"

# Test /me endpoint with auth
if ($global:AuthToken) {
    $authHeaders = @{ "Authorization" = "Bearer $global:AuthToken" }
    Test-Endpoint -TestName "Get Current User Info" -Url "$baseUrl/api/auth/me" -Headers $authHeaders
}

Write-Host "`n👥 PHASE 3: USER MANAGEMENT TESTS" -ForegroundColor Magenta

# Test get all users
Test-Endpoint -TestName "Get All Users" -Url "$baseUrl/api/users"

# Test get specific user
Test-Endpoint -TestName "Get User by ID" -Url "$baseUrl/api/users/1"

# Test get non-existent user
Test-Endpoint -TestName "Get Non-existent User" -Url "$baseUrl/api/users/999" -ExpectedStatus "404"

# Test users with pagination
Test-Endpoint -TestName "Get Users with Pagination" -Url "$baseUrl/api/users?page=1&pageSize=5"

# Test users with search
Test-Endpoint -TestName "Search Users" -Url "$baseUrl/api/users?search=admin"

Write-Host "`n🎮 PHASE 4: GAMES ENDPOINTS TESTS" -ForegroundColor Magenta

# Test get all games
Test-Endpoint -TestName "Get All Games" -Url "$baseUrl/api/games"

# Test get specific game
Test-Endpoint -TestName "Get Game by ID" -Url "$baseUrl/api/games/1"

# Test get non-existent game
Test-Endpoint -TestName "Get Non-existent Game" -Url "$baseUrl/api/games/999" -ExpectedStatus "404"

# Test games with pagination
Test-Endpoint -TestName "Get Games with Pagination" -Url "$baseUrl/api/games?page=1&pageSize=5"

# Test games search
Test-Endpoint -TestName "Search Games" -Url "$baseUrl/api/games/search?query=zelda"

# Test popular games
Test-Endpoint -TestName "Get Popular Games" -Url "$baseUrl/api/games/popular?count=5"

# Test trending games
Test-Endpoint -TestName "Get Trending Games" -Url "$baseUrl/api/games/trending?count=5"

Write-Host "`n🎯 PHASE 5: RECOMMENDATIONS TESTS" -ForegroundColor Magenta

# Test get recommendations for player
Test-Endpoint -TestName "Get Player Recommendations" -Url "$baseUrl/api/recommendations/player/1"

# Test generate recommendations
Test-Endpoint -TestName "Generate Recommendations" -Url "$baseUrl/api/recommendations/generate?playerId=1&algorithm=collaborative&count=5" -Method "POST"

# Test recommendation click tracking
Test-Endpoint -TestName "Track Recommendation Click" -Url "$baseUrl/api/recommendations/1/click" -Method "POST"

# Test recommendation play tracking
Test-Endpoint -TestName "Track Recommendation Play" -Url "$baseUrl/api/recommendations/1/play" -Method "POST"

# Test recommendation performance
Test-Endpoint -TestName "Get Recommendation Performance" -Url "$baseUrl/api/recommendations/performance"

# Test recommendation analytics
Test-Endpoint -TestName "Get Recommendation Analytics" -Url "$baseUrl/api/recommendations/analytics"

# Test get all recommendations
Test-Endpoint -TestName "Get All Recommendations" -Url "$baseUrl/api/recommendations"

Write-Host "`n📊 PHASE 6: ANALYTICS TESTS" -ForegroundColor Magenta

# Test analytics dashboard
Test-Endpoint -TestName "Analytics Dashboard" -Url "$baseUrl/api/analytics/dashboard" -SaveResponse $true

# Test user engagement analytics
Test-Endpoint -TestName "User Engagement Analytics" -Url "$baseUrl/api/analytics/user-engagement"

# Test recommendation performance analytics
Test-Endpoint -TestName "Recommendation Performance Analytics" -Url "$baseUrl/api/analytics/recommendation-performance"

# Test system health analytics
Test-Endpoint -TestName "System Health Analytics" -Url "$baseUrl/api/analytics/system-health"

Write-Host "`n📋 PHASE 7: TEST RESULTS SUMMARY" -ForegroundColor Magenta

$passedTests = ($global:TestResults | Where-Object { $_.Status -eq "PASSED" }).Count
$failedTests = ($global:TestResults | Where-Object { $_.Status -eq "FAILED" }).Count
$totalTests = $global:TestResults.Count

Write-Host "`n=== FINAL TEST RESULTS ===" -ForegroundColor Green
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passedTests / $totalTests) * 100, 2))%" -ForegroundColor Yellow

Write-Host "`n📊 DETAILED RESULTS:" -ForegroundColor Cyan
foreach ($result in $global:TestResults) {
    $statusColor = if ($result.Status -eq "PASSED") { "Green" } else { "Red" }
    $statusIcon = if ($result.Status -eq "PASSED") { "✅" } else { "❌" }
    
    Write-Host "$statusIcon $($result.TestName) - $($result.Status) ($($result.ResponseTime)ms)" -ForegroundColor $statusColor

    if ($result.Status -eq "FAILED" -and $result.ErrorMessage) {
        Write-Host "   Error: $($result.ErrorMessage)" -ForegroundColor Red
    }
}

Write-Host "`n🚀 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Review failed tests and fix issues" -ForegroundColor White
Write-Host "2. Integrate working endpoints with frontend" -ForegroundColor White
Write-Host "3. Implement real database connections" -ForegroundColor White
Write-Host "4. Add advanced features and real data" -ForegroundColor White

Write-Host "`nTest suite completed!" -ForegroundColor Green
