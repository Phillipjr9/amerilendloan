#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Unauthorized Access Testing Script - PowerShell
    
.DESCRIPTION
    Tests API endpoints with invalid/missing tokens and credentials
    to verify proper authorization enforcement and rejection
    
.EXAMPLE
    .\test-unauthorized-access.ps1
    
.NOTES
    Requires: PowerShell 5.1+, curl or Invoke-WebRequest
#>

param(
    [string]$BaseUrl = "http://localhost:5000",
    [switch]$Verbose = $false,
    [switch]$SaveResults = $true,
    [string]$ResultsFile = "unauthorized-access-test-results.txt"
)

# Color helpers
$Colors = @{
    Success = "Green"
    Error   = "Red"
    Warning = "Yellow"
    Info    = "Cyan"
    Test    = "Magenta"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Test results array
$TestResults = @()
$PassedTests = 0
$FailedTests = 0

# Invalid tokens for testing
$InvalidTokens = @{
    Empty                = ""
    Malformed            = "not-a-valid-jwt"
    Expired              = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJ1c2VyLWV4cGlyZWQiLCJhcHBJZCI6ImFtZXJpbGVuZCIsIm5hbWUiOiJFeHBpcmVkIFVzZXIiLCJleHAiOjE2MDAwMDAwMDB9.invalid"
    TamperedPayload      = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9.invalid"
    TamperedSignature    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJ1c2VyIn0.tampered"
    IncompleteJWT        = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVu"
    WrongAlgorithm       = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJ1c2VyIn0.sig"
    RandomString         = "asdfjkl@#`$%^&*()_+-={}[]|:;<>?,./"
    VeryLongInvalid      = "x" * 10000
}

function Test-Endpoint {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [string]$Token = "",
        [object]$Body = $null,
        [string]$TestName = "",
        [int]$ExpectedStatus = 401,
        [string]$ExpectedError = ""
    )

    $TestResult = @{
        TestName = $TestName
        Endpoint = $Endpoint
        Method = $Method
        Token = if ($Token.Length -gt 20) { $Token.Substring(0, 20) + "..." } else { $Token }
        ExpectedStatus = $ExpectedStatus
        ActualStatus = $null
        ActualError = $null
        Passed = $false
    }

    try {
        $Url = "$BaseUrl$Endpoint"
        $Headers = @{
            "Content-Type" = "application/json"
        }

        if ($Token) {
            $Headers["Cookie"] = "app_session_id=$Token"
        }

        $Params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
            ErrorAction = "SilentlyContinue"
        }

        if ($Body) {
            $Params["Body"] = $Body | ConvertTo-Json -Depth 10
        }

        $Response = Invoke-WebRequest @Params

        $TestResult.ActualStatus = $Response.StatusCode
        $TestResult.ActualError = $Response.Content

    } catch [System.Net.WebException] {
        $StatusCode = [int]$_.Exception.Response.StatusCode
        $TestResult.ActualStatus = $StatusCode
        
        try {
            $ErrorContent = $_.Exception.Response.GetResponseStream()
            $Reader = New-Object System.IO.StreamReader($ErrorContent)
            $TestResult.ActualError = $Reader.ReadToEnd()
        } catch {
            $TestResult.ActualError = "Could not read error response"
        }
    } catch {
        $TestResult.ActualStatus = 0
        $TestResult.ActualError = $_.Exception.Message
    }

    # Check if test passed
    $TestResult.Passed = $TestResult.ActualStatus -eq $ExpectedStatus

    # Verify error message if provided
    if ($ExpectedError -and $TestResult.ActualError) {
        $TestResult.Passed = $TestResult.Passed -and $TestResult.ActualError.Contains($ExpectedError)
    }

    if ($TestResult.Passed) {
        $PassedTests++
        Write-ColorOutput "  ✅ PASS" $Colors.Success
    } else {
        $FailedTests++
        Write-ColorOutput "  ❌ FAIL - Expected $($ExpectedStatus), got $($TestResult.ActualStatus)" $Colors.Error
    }

    return $TestResult
}

# ============================================================================
# TEST SUITE EXECUTION
# ============================================================================

Write-ColorOutput "`n" + ("=" * 80) $Colors.Test
Write-ColorOutput "UNAUTHORIZED ACCESS TESTING - API VALIDATION" $Colors.Test
Write-ColorOutput ("=" * 80) $Colors.Test
Write-ColorOutput "Base URL: $BaseUrl`n" $Colors.Info

# TEST 1: Missing Authentication
Write-ColorOutput "`n📋 TEST SET 1: Missing Authentication (No Token)" $Colors.Test
Write-ColorOutput ("-" * 80) $Colors.Info

$TestResults += Test-Endpoint -Method "GET" -Endpoint "/api/trpc/auth.me" -TestName "Get Current User - No Token" -ExpectedStatus 401 -ExpectedError "Unauthorized"
$TestResults += Test-Endpoint -Method "GET" -Endpoint "/api/trpc/loans.myApplications" -TestName "Get My Loans - No Token" -ExpectedStatus 401
$TestResults += Test-Endpoint -Method "GET" -Endpoint "/api/trpc/verification.myDocuments" -TestName "Get My Documents - No Token" -ExpectedStatus 401
$TestResults += Test-Endpoint -Method "GET" -Endpoint "/api/trpc/legal.getMyAcceptances" -TestName "Get Acceptances - No Token" -ExpectedStatus 401

# TEST 2: Invalid Token Formats
Write-ColorOutput "`n📋 TEST SET 2: Invalid Token Formats" $Colors.Test
Write-ColorOutput ("-" * 80) $Colors.Info

foreach ($TokenName in $InvalidTokens.Keys) {
    $Token = $InvalidTokens[$TokenName]
    Write-ColorOutput "  Testing: $TokenName" $Colors.Info
    $TestResults += Test-Endpoint -Method "GET" -Endpoint "/api/trpc/auth.me" -Token $Token -TestName "Auth.me - $TokenName Token" -ExpectedStatus 401
}

# TEST 3: Admin-Only Endpoints (Non-Admin Access)
Write-ColorOutput "`n📋 TEST SET 3: Admin-Only Endpoints (Non-Admin User)" $Colors.Test
Write-ColorOutput ("-" * 80) $Colors.Info

$UserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJ1c2VyLTEyMyIsImFwcElkIjoiYW1lcmlsZW5kIiwibmFtZSI6IlJlZ3VsYXIgVXNlciIsInJvbGUiOiJ1c2VyIn0.signature"

Write-ColorOutput "  Testing with regular user token (invalid signature for demo)" $Colors.Warning

$TestResults += Test-Endpoint -Method "GET" -Endpoint "/api/trpc/loans.adminList" -Token $UserToken -TestName "Admin: List Loans - Non-Admin User" -ExpectedStatus 403
$TestResults += Test-Endpoint -Method "GET" -Endpoint "/api/trpc/verification.adminList" -Token $UserToken -TestName "Admin: List Documents - Non-Admin User" -ExpectedStatus 403
$TestResults += Test-Endpoint -Method "POST" -Endpoint "/api/trpc/loans.adminApprove" -Token $UserToken -TestName "Admin: Approve Loan - Non-Admin User" -ExpectedStatus 403 -Body @{ id = 999; approvedAmount = 10000 }
$TestResults += Test-Endpoint -Method "GET" -Endpoint "/api/trpc/system.advancedStats" -Token $UserToken -TestName "Admin: Advanced Stats - Non-Admin User" -ExpectedStatus 403

# TEST 4: Protected Endpoints with Different Invalid Tokens
Write-ColorOutput "`n📋 TEST SET 4: Protected Endpoints - Various Invalid Tokens" $Colors.Test
Write-ColorOutput ("-" * 80) $Colors.Info

$TestResults += Test-Endpoint -Method "POST" -Endpoint "/api/trpc/loans.submit" -Token $InvalidTokens.Malformed -TestName "Submit Loan - Malformed Token" -ExpectedStatus 401 -Body @{ loanAmount = 5000 }
$TestResults += Test-Endpoint -Method "POST" -Endpoint "/api/trpc/verification.uploadDocument" -Token $InvalidTokens.Expired -TestName "Upload Document - Expired Token" -ExpectedStatus 401
$TestResults += Test-Endpoint -Method "POST" -Endpoint "/api/trpc/legal.acceptDocument" -Token $InvalidTokens.TamperedSignature -TestName "Accept Document - Tampered Signature" -ExpectedStatus 401 -Body @{ documentType = "terms_of_service"; documentVersion = "1.0" }

# TEST 5: Cross-User Access Prevention
Write-ColorOutput "`n📋 TEST SET 5: Cross-User Access Attempts" $Colors.Test
Write-ColorOutput ("-" * 80) $Colors.Info

$TestResults += Test-Endpoint -Method "GET" -Endpoint "/api/trpc/loans.getById?id=999" -Token $UserToken -TestName "Access Other User's Loan - Non-Existent ID" -ExpectedStatus 404
$TestResults += Test-Endpoint -Method "GET" -Endpoint "/api/trpc/verification.getById?id=999" -Token $UserToken -TestName "Access Other User's Document - Non-Existent ID" -ExpectedStatus 404

# TEST 6: Rapid Unauthorized Requests (Rate Limiting)
Write-ColorOutput "`n📋 TEST SET 6: Rate Limiting on Failed Auth Attempts" $Colors.Test
Write-ColorOutput ("-" * 80) $Colors.Info

Write-ColorOutput "  Sending 5 rapid failed auth attempts..." $Colors.Warning
for ($i = 1; $i -le 5; $i++) {
    $TestResults += Test-Endpoint -Method "GET" -Endpoint "/api/trpc/auth.me" -Token $InvalidTokens.Malformed -TestName "Failed Auth Attempt #$i" -ExpectedStatus 401
    Start-Sleep -Milliseconds 100
}

Write-ColorOutput "  ⚠️  If status changes to 429, rate limiting is working" $Colors.Warning

# ============================================================================
# RESULTS SUMMARY
# ============================================================================

Write-ColorOutput "`n" + ("=" * 80) $Colors.Test
Write-ColorOutput "TEST RESULTS SUMMARY" $Colors.Test
Write-ColorOutput ("=" * 80) $Colors.Test

$TotalTests = $PassedTests + $FailedTests
$PassRate = if ($TotalTests -gt 0) { [math]::Round(($PassedTests / $TotalTests) * 100, 1) } else { 0 }

Write-ColorOutput "`n📊 Statistics:"
Write-ColorOutput "  Total Tests:    $TotalTests"
Write-ColorOutput "  Passed:         $PassedTests" $Colors.Success
Write-ColorOutput "  Failed:         $FailedTests" $(if ($FailedTests -gt 0) { $Colors.Error } else { $Colors.Success })
Write-ColorOutput "  Pass Rate:      $PassRate%"

$SecurityScore = [math]::Round(($PassedTests / $TotalTests) * 100)
Write-ColorOutput "  Security Score: $SecurityScore/100"

# Detailed results
Write-ColorOutput "`n📋 Detailed Results:"
Write-ColorOutput ("-" * 80) $Colors.Info

$TestResults | ForEach-Object {
    $Status = if ($_.Passed) { "✅ PASS" } else { "❌ FAIL" }
    Write-ColorOutput "  $Status | $($_.TestName)"
    Write-ColorOutput "         Expected: $($_.ExpectedStatus), Actual: $($_.ActualStatus)" $Colors.Info
}

# Save results to file
if ($SaveResults) {
    $Output = @"
UNAUTHORIZED ACCESS TESTING RESULTS
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Base URL: $BaseUrl

SUMMARY
-------
Total Tests: $TotalTests
Passed:      $PassedTests
Failed:      $FailedTests
Pass Rate:   $PassRate%
Security Score: $SecurityScore/100

DETAILED RESULTS
----------------
"@

    $TestResults | ForEach-Object {
        $Status = if ($_.Passed) { "PASS" } else { "FAIL" }
        $Output += "`n[$Status] $($_.TestName)`n"
        $Output += "  Endpoint: $($_.Endpoint)`n"
        $Output += "  Expected Status: $($_.ExpectedStatus)`n"
        $Output += "  Actual Status: $($_.ActualStatus)`n"
        if ($_.ActualError) {
            $Output += "  Error: $($_.ActualError.Substring(0, [Math]::Min(100, $_.ActualError.Length)))`n"
        }
    }

    $Output | Out-File -FilePath $ResultsFile -Encoding UTF8
    Write-ColorOutput "`n✅ Results saved to: $ResultsFile" $Colors.Success
}

# Exit with appropriate code
exit $(if ($FailedTests -gt 0) { 1 } else { 0 })
