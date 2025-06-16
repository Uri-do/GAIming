# Simple Games API Test
$baseUrl = "http://localhost:65073"

Write-Host "Testing Games API..." -ForegroundColor Green

# Test individual endpoints with detailed error info
try {
    Write-Host "`nTesting: GET /api/games" -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "$baseUrl/api/games" -Method GET -ContentType "application/json"
    Write-Host "SUCCESS: Status $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($content | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
}
catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

try {
    Write-Host "`nTesting: GET /api/games/popular" -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "$baseUrl/api/games/popular" -Method GET -ContentType "application/json"
    Write-Host "SUCCESS: Status $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($content | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
}
catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

try {
    Write-Host "`nTesting: GET /api/games/trending" -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "$baseUrl/api/games/trending" -Method GET -ContentType "application/json"
    Write-Host "SUCCESS: Status $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($content | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
}
catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

try {
    Write-Host "`nTesting: GET /api/games/1" -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "$baseUrl/api/games/1" -Method GET -ContentType "application/json"
    Write-Host "SUCCESS: Status $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($content | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
}
catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`nTest completed!" -ForegroundColor Green
