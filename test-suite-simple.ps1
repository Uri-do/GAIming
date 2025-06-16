# GAIming API Simple Test Suite
$baseUrl = "http://localhost:65073"

Write-Host "=== GAIming API Test Suite ===" -ForegroundColor Green
Write-Host "Testing API at: $baseUrl" -ForegroundColor Yellow

$testResults = @()

function Test-ApiEndpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null
    )
    
    Write-Host "`nTesting: $Name" -ForegroundColor Cyan
    Write-Host "URL: $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params
        Write-Host "✅ SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
        
        $result = @{
            Name = $Name
            Status = "PASSED"
            StatusCode = $response.StatusCode
            Response = $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length))
        }
        
        return $result
    }
    catch {
        Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        
        $statusCode = "Unknown"
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        
        $result = @{
            Name = $Name
            Status = "FAILED"
            StatusCode = $statusCode
            Error = $_.Exception.Message
        }
        
        return $result
    }
}

Write-Host "`n🏥 HEALTH CHECKS" -ForegroundColor Magenta
$testResults += Test-ApiEndpoint -Name "Root Health" -Url "$baseUrl/"
$testResults += Test-ApiEndpoint -Name "API Health" -Url "$baseUrl/api/health"
$testResults += Test-ApiEndpoint -Name "Detailed Health" -Url "$baseUrl/api/health/detailed"

Write-Host "`n🔐 AUTHENTICATION" -ForegroundColor Magenta
$loginBody = '{"username":"testuser","password":"testpass"}'
$testResults += Test-ApiEndpoint -Name "Valid Login" -Url "$baseUrl/api/auth/login" -Method "POST" -Body $loginBody

$invalidLoginBody = '{"username":"invalid","password":"invalid"}'
$testResults += Test-ApiEndpoint -Name "Invalid Login" -Url "$baseUrl/api/auth/login" -Method "POST" -Body $invalidLoginBody

$testResults += Test-ApiEndpoint -Name "Logout" -Url "$baseUrl/api/auth/logout" -Method "POST"

Write-Host "`n👥 USER MANAGEMENT" -ForegroundColor Magenta
$testResults += Test-ApiEndpoint -Name "Get All Users" -Url "$baseUrl/api/users"
$testResults += Test-ApiEndpoint -Name "Get User by ID" -Url "$baseUrl/api/users/1"
$testResults += Test-ApiEndpoint -Name "Get Non-existent User" -Url "$baseUrl/api/users/999"
$testResults += Test-ApiEndpoint -Name "Users with Pagination" -Url "$baseUrl/api/users?page=1&pageSize=5"

Write-Host "`n🎮 GAMES" -ForegroundColor Magenta
$testResults += Test-ApiEndpoint -Name "Get All Games" -Url "$baseUrl/api/games"
$testResults += Test-ApiEndpoint -Name "Get Game by ID" -Url "$baseUrl/api/games/1"
$testResults += Test-ApiEndpoint -Name "Search Games" -Url "$baseUrl/api/games/search?query=zelda"
$testResults += Test-ApiEndpoint -Name "Popular Games" -Url "$baseUrl/api/games/popular"
$testResults += Test-ApiEndpoint -Name "Trending Games" -Url "$baseUrl/api/games/trending"

Write-Host "`n🎯 RECOMMENDATIONS" -ForegroundColor Magenta
$testResults += Test-ApiEndpoint -Name "Player Recommendations" -Url "$baseUrl/api/recommendations/player/1"
$testResults += Test-ApiEndpoint -Name "Generate Recommendations" -Url "$baseUrl/api/recommendations/generate?playerId=1&count=5" -Method "POST"
$testResults += Test-ApiEndpoint -Name "Recommendation Performance" -Url "$baseUrl/api/recommendations/performance"
$testResults += Test-ApiEndpoint -Name "All Recommendations" -Url "$baseUrl/api/recommendations"

Write-Host "`n📊 ANALYTICS" -ForegroundColor Magenta
$testResults += Test-ApiEndpoint -Name "Analytics Dashboard" -Url "$baseUrl/api/analytics/dashboard"
$testResults += Test-ApiEndpoint -Name "User Engagement" -Url "$baseUrl/api/analytics/user-engagement"
$testResults += Test-ApiEndpoint -Name "System Health" -Url "$baseUrl/api/analytics/system-health"

Write-Host "`n📋 SUMMARY" -ForegroundColor Magenta
$passed = ($testResults | Where-Object { $_.Status -eq "PASSED" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAILED" }).Count
$total = $testResults.Count

Write-Host "`n=== TEST RESULTS ===" -ForegroundColor Green
Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

if ($total -gt 0) {
    $successRate = [math]::Round(($passed / $total) * 100, 1)
    Write-Host "Success Rate: $successRate%" -ForegroundColor Yellow
}

Write-Host "`n📊 DETAILED RESULTS:" -ForegroundColor Cyan
foreach ($result in $testResults) {
    if ($result.Status -eq "PASSED") {
        Write-Host "✅ $($result.Name) - PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ $($result.Name) - FAILED" -ForegroundColor Red
        if ($result.Error) {
            Write-Host "   Error: $($result.Error)" -ForegroundColor Red
        }
    }
}

Write-Host "`n🚀 READY FOR FRONTEND INTEGRATION!" -ForegroundColor Green
Write-Host "Working endpoints can be used immediately in the frontend." -ForegroundColor White
