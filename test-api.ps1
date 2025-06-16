# GAIming API Test Script
# This script tests the main functionality of the GAIming API

$baseUrl = "http://localhost:65073"
$httpsUrl = "https://localhost:65072"

Write-Host "=== GAIming API Functionality Test ===" -ForegroundColor Green
Write-Host "Testing API at: $baseUrl" -ForegroundColor Yellow

# Function to make HTTP requests
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [string]$Description = ""
    )
    
    Write-Host "`n--- Testing: $Description ---" -ForegroundColor Cyan
    Write-Host "URL: $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Gray
        $response | ConvertTo-Json -Depth 3 | Write-Host
        return $response
    }
    catch {
        Write-Host "❌ FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
        return $null
    }
}

# Test 1: Health Check
Write-Host "`n[HEALTH] TESTING HEALTH ENDPOINTS" -ForegroundColor Magenta
Test-Endpoint -Url "$baseUrl/health" -Description "Basic Health Check"
Test-Endpoint -Url "$baseUrl/health/ready" -Description "Readiness Check"
Test-Endpoint -Url "$baseUrl/health/live" -Description "Liveness Check"

# Test 2: API Info/Swagger
Write-Host "`n[DOCS] TESTING API DOCUMENTATION" -ForegroundColor Magenta
Test-Endpoint -Url "$baseUrl/swagger/v1/swagger.json" -Description "Swagger JSON"

# Test 3: Games Endpoints
Write-Host "`n[GAMES] TESTING GAMES ENDPOINTS" -ForegroundColor Magenta
Test-Endpoint -Url "$baseUrl/api/games" -Description "Get All Games"
Test-Endpoint -Url "$baseUrl/api/games/featured" -Description "Get Featured Games"
Test-Endpoint -Url "$baseUrl/api/games/search?searchTerm=slot" -Description "Search Games"

# Test 4: Authentication Endpoints (without actual login)
Write-Host "`n[AUTH] TESTING AUTH ENDPOINTS STRUCTURE" -ForegroundColor Magenta
# Note: These will likely fail without proper credentials, but we can see if endpoints exist
Test-Endpoint -Url "$baseUrl/api/auth/login" -Method "POST" -Body '{"username":"test","password":"test"}' -Description "Login Endpoint (Expected to fail)"

# Test 5: Recommendations Endpoints
Write-Host "`n[RECS] TESTING RECOMMENDATIONS ENDPOINTS" -ForegroundColor Magenta
Test-Endpoint -Url "$baseUrl/api/recommendations/1" -Description "Get Recommendations for Player 1"
Test-Endpoint -Url "$baseUrl/api/game-recommendations/trending" -Description "Get Trending Games"

# Test 6: Analytics Endpoints
Write-Host "`n[ANALYTICS] TESTING ANALYTICS ENDPOINTS" -ForegroundColor Magenta
Test-Endpoint -Url "$baseUrl/api/analytics/dashboard" -Description "Analytics Dashboard"
Test-Endpoint -Url "$baseUrl/api/player-analytics/overview" -Description "Player Analytics Overview"

# Test 7: User Management
Write-Host "`n[USERS] TESTING USER MANAGEMENT ENDPOINTS" -ForegroundColor Magenta
Test-Endpoint -Url "$baseUrl/api/users" -Description "Get Users (May require auth)"

Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Green
Write-Host "API Testing Complete!" -ForegroundColor Yellow
Write-Host "Check the results above to see which endpoints are working." -ForegroundColor Gray
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. If health checks pass, the API is running correctly" -ForegroundColor White
Write-Host "2. If games endpoints work, basic functionality is good" -ForegroundColor White
Write-Host "3. If auth endpoints exist, we can test login functionality" -ForegroundColor White
Write-Host "4. If recommendations work, the core feature is functional" -ForegroundColor White
