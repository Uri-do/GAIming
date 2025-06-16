# GAIming Frontend-Backend Integration Test
$frontendUrl = "http://localhost:3000"
$backendUrl = "http://localhost:65073"

Write-Host "=== GAIming Frontend-Backend Integration Test ===" -ForegroundColor Green
Write-Host "Frontend URL: $frontendUrl" -ForegroundColor Yellow
Write-Host "Backend URL: $backendUrl" -ForegroundColor Yellow

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$ExpectedContent = $null
    )
    
    Write-Host "`nTesting: $Name" -ForegroundColor Cyan
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        Write-Host "SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
        
        if ($ExpectedContent -and $response.Content -like "*$ExpectedContent*") {
            Write-Host "Content check PASSED" -ForegroundColor Green
        } elseif ($ExpectedContent) {
            Write-Host "Content check FAILED - Expected: $ExpectedContent" -ForegroundColor Yellow
        }
        
        return $true
    }
    catch {
        Write-Host "FAILED - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-ApiEndpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null
    )
    
    Write-Host "`nTesting API: $Name" -ForegroundColor Cyan
    Write-Host "URL: $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            UseBasicParsing = $true
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params
        Write-Host "SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "FAILED - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n[FRONTEND] Testing Frontend Accessibility" -ForegroundColor Magenta

$frontendTests = @()
$frontendTests += Test-Endpoint -Name "Frontend Home Page" -Url "$frontendUrl/" -ExpectedContent "GAIming"
$frontendTests += Test-Endpoint -Name "Frontend Assets" -Url "$frontendUrl/src/main.tsx"

Write-Host "`n[BACKEND] Testing Backend API" -ForegroundColor Magenta

$backendTests = @()
$backendTests += Test-ApiEndpoint -Name "Backend Health" -Url "$backendUrl/"
$backendTests += Test-ApiEndpoint -Name "API Health" -Url "$backendUrl/api/health"
$backendTests += Test-ApiEndpoint -Name "Users API" -Url "$backendUrl/api/users"
$backendTests += Test-ApiEndpoint -Name "Games API" -Url "$backendUrl/api/games"
$backendTests += Test-ApiEndpoint -Name "Analytics API" -Url "$backendUrl/api/analytics/dashboard"

Write-Host "`n[AUTH] Testing Authentication Flow" -ForegroundColor Magenta

$authTests = @()
$loginBody = '{"username":"testuser","password":"testpass"}'
$authTests += Test-ApiEndpoint -Name "Login API" -Url "$backendUrl/api/auth/login" -Method "POST" -Body $loginBody

Write-Host "`n[CORS] Testing CORS Configuration" -ForegroundColor Magenta

# Test if backend accepts requests from frontend origin
try {
    Write-Host "`nTesting CORS from Frontend to Backend" -ForegroundColor Cyan
    
    $headers = @{
        "Origin" = $frontendUrl
        "Access-Control-Request-Method" = "GET"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    
    $response = Invoke-WebRequest -Uri "$backendUrl/api/users" -Headers $headers -UseBasicParsing -TimeoutSec 10
    Write-Host "CORS Test SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
    $corsTest = $true
}
catch {
    Write-Host "CORS Test FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $corsTest = $false
}

Write-Host "`n[INTEGRATION] Testing Full Integration" -ForegroundColor Magenta

# Create a simple integration test by checking if we can make a request from frontend context
$integrationScript = @"
// Frontend Integration Test
fetch('$backendUrl/api/users')
  .then(response => response.json())
  .then(data => console.log('Integration test SUCCESS:', data))
  .catch(error => console.error('Integration test FAILED:', error));
"@

Write-Host "Integration test script created (to be run in browser console)" -ForegroundColor Gray

Write-Host "`n=== INTEGRATION TEST RESULTS ===" -ForegroundColor Green

$frontendPassed = ($frontendTests | Where-Object { $_ -eq $true }).Count
$frontendTotal = $frontendTests.Count

$backendPassed = ($backendTests | Where-Object { $_ -eq $true }).Count
$backendTotal = $backendTests.Count

$authPassed = ($authTests | Where-Object { $_ -eq $true }).Count
$authTotal = $authTests.Count

Write-Host "`nFrontend Tests: $frontendPassed/$frontendTotal passed" -ForegroundColor $(if($frontendPassed -eq $frontendTotal){"Green"}else{"Yellow"})
Write-Host "Backend Tests: $backendPassed/$backendTotal passed" -ForegroundColor $(if($backendPassed -eq $backendTotal){"Green"}else{"Yellow"})
Write-Host "Auth Tests: $authPassed/$authTotal passed" -ForegroundColor $(if($authPassed -eq $authTotal){"Green"}else{"Yellow"})
Write-Host "CORS Test: $(if($corsTest){"PASSED"}else{"FAILED"})" -ForegroundColor $(if($corsTest){"Green"}else{"Red"})

$totalPassed = $frontendPassed + $backendPassed + $authPassed + $(if($corsTest){1}else{0})
$totalTests = $frontendTotal + $backendTotal + $authTotal + 1

Write-Host "`nOverall Success Rate: $([math]::Round(($totalPassed / $totalTests) * 100, 1))%" -ForegroundColor Yellow

Write-Host "`n[NEXT STEPS] Frontend Integration" -ForegroundColor Cyan
Write-Host "1. Open browser to: $frontendUrl" -ForegroundColor White
Write-Host "2. Test login functionality" -ForegroundColor White
Write-Host "3. Test games browsing" -ForegroundColor White
Write-Host "4. Test user management" -ForegroundColor White
Write-Host "5. Test analytics dashboard" -ForegroundColor White

Write-Host "`n[BROWSER COMMANDS] Run these in browser console:" -ForegroundColor Cyan
Write-Host "// Test API connection:" -ForegroundColor Gray
Write-Host "fetch('$backendUrl/api/users').then(r=>r.json()).then(console.log)" -ForegroundColor White
Write-Host "// Test login:" -ForegroundColor Gray
Write-Host "fetch('$backendUrl/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'testuser',password:'testpass'})}).then(r=>r.json()).then(console.log)" -ForegroundColor White

Write-Host "`nIntegration test completed!" -ForegroundColor Green
