# Rate Limiting API Security Tests - PowerShell
# 
# Tests the API's ability to handle excessive requests from a single IP address
# and enforce rate limiting as expected.
#
# Usage: powershell -ExecutionPolicy Bypass -File test-rate-limiting-endpoints.ps1

param(
    [string]$BaseUrl = "http://localhost:3000",
    [int]$Threads = 10,
    [string]$LogFile = "rate-limiting-test-results.txt"
)

# Color output functions
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "! $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "[*] $Message" -ForegroundColor Cyan
}

# Initialize results
$results = @{
    TestName = "Rate Limiting Analysis"
    Timestamp = (Get-Date).ToIsoString()
    EndpointsTested = @()
    Violations = @()
    Status = "PENDING"
}

$logContent = @()

function Log-Message {
    param([string]$Message)
    $logContent += $Message
    Write-Host $Message
}

# Test 1: Login Rate Limiting
function Test-LoginRateLimiting {
    Write-Info "Testing login rate limiting..."
    
    $responses = @()
    $blockedCount = 0
    $email = "ratelimit@test.com"
    $attempts = 10
    
    for ($i = 1; $i -le $attempts; $i++) {
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            
            $response = Invoke-WebRequest `
                -Uri "$BaseUrl/api/trpc/auth.login" `
                -Method Post `
                -ContentType "application/json" `
                -Body (@{ email = $email; password = "wrongpassword" } | ConvertTo-Json) `
                -ErrorAction SilentlyContinue
            
            $stopwatch.Stop()
            $elapsed = $stopwatch.Elapsed.TotalMilliseconds
            
            if ($response.StatusCode -eq 429) {
                $blockedCount++
                Write-Success "Attempt $i: Rate limited (429) - ${elapsed}ms"
            } elseif ($response.StatusCode -in @(400, 401)) {
                Write-Info "Attempt $i: Response $($response.StatusCode) - ${elapsed}ms"
            } else {
                Write-Warning-Custom "Attempt $i: Unexpected status $($response.StatusCode) - ${elapsed}ms"
            }
            
            Start-Sleep -Milliseconds 100
        }
        catch [Microsoft.PowerShell.Commands.HttpRequestException] {
            $statusCode = $_.Exception.Response.StatusCode.Value__
            
            if ($statusCode -eq 429) {
                $blockedCount++
                Write-Success "Attempt $i: Rate limited (429)"
            } else {
                Write-Warning-Custom "Attempt $i: Exception $statusCode"
            }
        }
        catch {
            Write-Warning-Custom "Attempt $i: Error - $($_.Exception.Message)"
        }
    }
    
    $result = @{
        Endpoint = "auth.login"
        TotalAttempts = $attempts
        RateLimited = $blockedCount
        RateLimitPercentage = if ($attempts -gt 0) { ($blockedCount / $attempts * 100) } else { 0 }
        Violation = ($blockedCount -eq 0 -and $attempts -gt 5)
    }
    
    return $result
}

# Test 2: OTP Request Rate Limiting
function Test-OTPRateLimiting {
    Write-Info "Testing OTP rate limiting..."
    
    $blockedCount = 0
    $email = "otp@test.com"
    $attempts = 5
    
    for ($i = 1; $i -le $attempts; $i++) {
        try {
            $response = Invoke-WebRequest `
                -Uri "$BaseUrl/api/trpc/otp.requestCode" `
                -Method Post `
                -ContentType "application/json" `
                -Body (@{ email = $email; purpose = "login" } | ConvertTo-Json) `
                -ErrorAction SilentlyContinue
            
            if ($response.StatusCode -eq 429) {
                $blockedCount++
                Write-Success "Attempt $i: Rate limited (429)"
            } elseif ($response.StatusCode -eq 200) {
                Write-Info "Attempt $i: OTP sent (200)"
            } else {
                Write-Warning-Custom "Attempt $i: Status $($response.StatusCode)"
            }
            
            Start-Sleep -Milliseconds 500
        }
        catch [Microsoft.PowerShell.Commands.HttpRequestException] {
            $statusCode = $_.Exception.Response.StatusCode.Value__
            
            if ($statusCode -eq 429) {
                $blockedCount++
                Write-Success "Attempt $i: Rate limited (429)"
            }
        }
        catch {
            Write-Warning-Custom "Attempt $i: Error - $($_.Exception.Message)"
        }
    }
    
    $result = @{
        Endpoint = "otp.requestCode"
        TotalAttempts = $attempts
        RateLimited = $blockedCount
        RateLimitPercentage = if ($attempts -gt 0) { ($blockedCount / $attempts * 100) } else { 0 }
        Violation = ($blockedCount -eq 0 -and $attempts -gt 3)
    }
    
    return $result
}

# Test 3: Concurrent Requests
function Test-ConcurrentRequests {
    Write-Info "Testing concurrent requests from single IP..."
    
    $jobs = @()
    $results_concurrent = @{
        '200' = @()
        '429' = @()
        'Error' = @()
    }
    
    $scriptBlock = {
        param([int]$ThreadId, [string]$Url)
        
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            
            $response = Invoke-WebRequest `
                -Uri "$Url/api/trpc/loans.search" `
                -Method Get `
                -Headers @{ 'X-Forwarded-For' = '192.168.1.100' } `
                -ErrorAction SilentlyContinue
            
            $stopwatch.Stop()
            
            return @{
                ThreadId = $ThreadId
                StatusCode = $response.StatusCode
                Elapsed = $stopwatch.ElapsedMilliseconds
            }
        }
        catch [Microsoft.PowerShell.Commands.HttpRequestException] {
            $statusCode = $_.Exception.Response.StatusCode.Value__
            return @{
                ThreadId = $ThreadId
                StatusCode = $statusCode
                Elapsed = -1
            }
        }
        catch {
            return @{
                ThreadId = $ThreadId
                Error = $_.Exception.Message
                StatusCode = 0
            }
        }
    }
    
    # Start concurrent jobs
    for ($i = 0; $i -lt $Threads; $i++) {
        $job = Start-Job -ScriptBlock $scriptBlock -ArgumentList $i, $BaseUrl
        $jobs += $job
    }
    
    # Wait for all jobs
    $jobResults = @()
    foreach ($job in $jobs) {
        $result = Receive-Job -Job $job -Wait
        $jobResults += $result
        
        if ($result.StatusCode -eq 429) {
            Write-Success "Thread $($result.ThreadId): Rate limited (429) - $($result.Elapsed)ms"
        } elseif ($result.StatusCode -eq 200) {
            Write-Info "Thread $($result.ThreadId): Success (200) - $($result.Elapsed)ms"
        } elseif ($result.Error) {
            Write-Error-Custom "Thread $($result.ThreadId): Error - $($result.Error)"
        } else {
            Write-Warning-Custom "Thread $($result.ThreadId): Status $($result.StatusCode)"
        }
    }
    
    # Cleanup jobs
    Get-Job | Remove-Job
    
    $rateLimitedCount = @($jobResults | Where-Object { $_.StatusCode -eq 429 }).Count
    $successCount = @($jobResults | Where-Object { $_.StatusCode -eq 200 }).Count
    
    $result = @{
        Endpoint = "loans.search"
        ConcurrentThreads = $Threads
        RateLimitedCount = $rateLimitedCount
        SuccessfulCount = $successCount
        TotalResponses = $jobResults.Count
        Violation = ($rateLimitedCount -eq 0 -and $Threads -gt 5)
    }
    
    return $result
}

# Test 4: Retry-After Header
function Test-RetryAfterHeader {
    Write-Info "Testing Retry-After header in rate limit responses..."
    
    for ($i = 0; $i -lt 15; $i++) {
        try {
            $response = Invoke-WebRequest `
                -Uri "$BaseUrl/api/trpc/auth.login" `
                -Method Post `
                -ContentType "application/json" `
                -Body (@{ email = "test@example.com"; password = "wrong" } | ConvertTo-Json) `
                -ErrorAction SilentlyContinue
            
            if ($response.StatusCode -eq 429) {
                $hasRetryAfter = $response.Headers.ContainsKey('Retry-After')
                $retryValue = $response.Headers['Retry-After']
                
                if ($hasRetryAfter) {
                    Write-Success "Retry-After header present: $retryValue"
                } else {
                    Write-Warning-Custom "Retry-After header missing"
                }
                
                return @{
                    StatusCode = 429
                    HasRetryAfter = $hasRetryAfter
                    RetryAfterValue = $retryValue
                    Violation = -not $hasRetryAfter
                }
            }
            
            Start-Sleep -Milliseconds 100
        }
        catch {
            # Silently continue
        }
    }
    
    Write-Warning-Custom "Could not trigger rate limit response"
    return @{
        StatusCode = "NOT_FOUND"
        Violation = $true
    }
}

# Test 5: IP Header Handling
function Test-IPHeaderHandling {
    Write-Info "Testing IP header extraction..."
    
    $testCases = @(
        @{ Name = "X-Forwarded-For"; Headers = @{ 'X-Forwarded-For' = '192.168.1.100' } },
        @{ Name = "X-Real-IP"; Headers = @{ 'X-Real-IP' = '192.168.1.101' } }
    )
    
    $allPassed = $true
    
    foreach ($test in $testCases) {
        try {
            $response = Invoke-WebRequest `
                -Uri "$BaseUrl/api/trpc/auth.recordAttempt" `
                -Method Post `
                -ContentType "application/json" `
                -Headers $test.Headers `
                -Body (@{ email = "test@example.com"; successful = $false } | ConvertTo-Json) `
                -ErrorAction SilentlyContinue
            
            Write-Success "$($test.Name): $($response.StatusCode)"
        }
        catch [Microsoft.PowerShell.Commands.HttpRequestException] {
            $statusCode = $_.Exception.Response.StatusCode.Value__
            Write-Info "$($test.Name): $statusCode"
        }
        catch {
            Write-Error-Custom "$($test.Name): $($_.Exception.Message)"
            $allPassed = $false
        }
    }
    
    return @{
        AllPassed = $allPassed
        Violation = -not $allPassed
    }
}

# Test 6: Error Response Safety
function Test-ErrorResponseSafety {
    Write-Info "Testing error response safety..."
    
    $sensitivePatterns = @('password', 'token', 'secret', 'api_key', 'database_url')
    
    try {
        for ($i = 0; $i -lt 15; $i++) {
            $response = Invoke-WebRequest `
                -Uri "$BaseUrl/api/trpc/auth.login" `
                -Method Post `
                -ContentType "application/json" `
                -Body (@{ email = "test@example.com"; password = "wrong" } | ConvertTo-Json) `
                -ErrorAction SilentlyContinue
            
            if ($response.StatusCode -eq 429) {
                $responseText = $response.Content.ToLower()
                $foundSensitive = @()
                
                foreach ($pattern in $sensitivePatterns) {
                    if ($responseText -match $pattern) {
                        $foundSensitive += $pattern
                    }
                }
                
                if ($foundSensitive.Count -eq 0) {
                    Write-Success "No sensitive data found in response"
                } else {
                    Write-Error-Custom "Found sensitive patterns: $($foundSensitive -join ', ')"
                }
                
                return @{
                    StatusCode = 429
                    ResponseSafe = ($foundSensitive.Count -eq 0)
                    SensitivePatternsFound = $foundSensitive
                    Violation = ($foundSensitive.Count -gt 0)
                }
            }
            
            Start-Sleep -Milliseconds 100
        }
    }
    catch {
        Write-Error-Custom "Error: $($_.Exception.Message)"
        return @{
            Error = $_.Exception.Message
            Violation = $true
        }
    }
    
    Write-Warning-Custom "Could not trigger rate limit response"
    return @{ Violation = $true; Message = "Rate limit not triggered" }
}

# Main execution
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RATE LIMITING API SECURITY TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Info "Base URL: $BaseUrl"

# Run all tests
$test1 = Test-LoginRateLimiting
$results.EndpointsTested += $test1
if ($test1.Violation) { $results.Violations += "Login endpoint not properly rate limited" }

$test2 = Test-OTPRateLimiting
$results.EndpointsTested += $test2
if ($test2.Violation) { $results.Violations += "OTP endpoint not properly rate limited" }

$test3 = Test-ConcurrentRequests
$results.EndpointsTested += $test3
if ($test3.Violation) { $results.Violations += "Concurrent requests not properly handled" }

$test4 = Test-RetryAfterHeader
$results.EndpointsTested += $test4
if ($test4.Violation) { $results.Violations += "Rate limit responses missing Retry-After header" }

$test5 = Test-IPHeaderHandling
$results.EndpointsTested += $test5
if ($test5.Violation) { $results.Violations += "IP header extraction not working properly" }

$test6 = Test-ErrorResponseSafety
$results.EndpointsTested += $test6
if ($test6.Violation) { $results.Violations += "Rate limit error responses may leak sensitive data" }

# Generate report
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($results.Violations.Count -eq 0) {
    Write-Success "NO VIOLATIONS FOUND"
    $results.Status = "PASSED"
} else {
    Write-Error-Custom "VIOLATIONS FOUND: $($results.Violations.Count)"
    foreach ($violation in $results.Violations) {
        Write-Error-Custom "  • $violation"
    }
    $results.Status = "FAILED"
}

Write-Host "`n========================================" -ForegroundColor Cyan

# Save results to file
$reportContent = @"
RATE LIMITING API SECURITY ASSESSMENT REPORT
========================================
Timestamp: $((Get-Date).ToIsoString())
Base URL: $BaseUrl
Status: $($results.Status)

Endpoints Tested: $($results.EndpointsTested.Count)
$($results.EndpointsTested | ForEach-Object { "  • $($_.Endpoint)" })

Violations: $($results.Violations.Count)
$($results.Violations | ForEach-Object { "  ✗ $_" })
========================================
"@

$reportContent | Out-File -FilePath $LogFile -Encoding UTF8
Write-Info "Report saved to: $LogFile"

exit if ($results.Status -eq "PASSED") { 0 } else { 1 }
