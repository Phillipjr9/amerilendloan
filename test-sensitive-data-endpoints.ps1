# Sensitive Data Exposure Testing Script for Windows
# Tests real API endpoints for sensitive information leaks
# Run with: powershell -ExecutionPolicy Bypass -File test-sensitive-data-endpoints.ps1

param(
    [string]$ApiBase = "https://www.amerilendloan.com/api/trpc",
    [string]$ReportFile = "sensitive-data-test-results.txt"
)

$ErrorActionPreference = "Continue"
$LogFile = "sensitive-data-test-log.txt"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Write-TestLog {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

function Write-TestResult {
    param(
        [string]$Status,
        [string]$Message
    )
    
    $colors = @{
        "PASS" = "Green"
        "FAIL" = "Red"
        "WARN" = "Yellow"
    }
    
    $symbol = @{
        "PASS" = "✓"
        "FAIL" = "✗"
        "WARN" = "⚠"
    }
    
    $color = $colors[$Status]
    $sym = $symbol[$Status]
    
    Write-Host "$sym $Status`: $Message" -ForegroundColor $color
    Write-TestLog "$sym $Status`: $Message" $Status
    
    return $Status -eq "PASS"
}

function Check-SensitiveData {
    param(
        [string]$Response,
        [string]$TestName
    )
    
    $issues = @()
    
    # Check for plaintext passwords
    if ($Response -match 'password["\x27]?\s*[:=]\s*["\x27][^"\x27]*["\x27]') {
        $issues += "Plaintext password exposed"
    }
    
    # Check for JWT tokens
    if ($Response -match 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+') {
        $issues += "JWT token exposed"
    }
    
    # Check for SSN pattern
    if ($Response -match '\d{3}-\d{2}-\d{4}') {
        $issues += "Full SSN exposed"
    }
    
    # Check for database credentials
    if ($Response -match '(postgresql|mysql|mongodb)://.*:.*@') {
        $issues += "Database credentials exposed"
    }
    
    # Check for stack traces
    if ($Response -match 'at\s+\w+\s+\([^)]*:\d+:\d+\)') {
        $issues += "Stack trace exposed"
    }
    
    # Check for AWS credentials
    if ($Response -match 'AKIA[0-9A-Z]{16}') {
        $issues += "AWS credentials exposed"
    }
    
    if ($issues.Count -gt 0) {
        $issueList = $issues -join ", "
        Write-TestResult "FAIL" "$TestName`: $issueList"
        return $false
    } else {
        Write-TestResult "PASS" "$TestName`: No sensitive data detected"
        return $true
    }
}

function Invoke-ApiTest {
    param(
        [string]$Endpoint,
        [string]$Method = "POST",
        [hashtable]$Payload,
        [string]$TestName
    )
    
    Write-TestLog "Testing: $TestName" "TEST"
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        $body = $Payload | ConvertTo-Json
        
        $params = @{
            Uri     = "$ApiBase/$Endpoint"
            Method  = $Method
            Headers = $headers
            Body    = $body
            ErrorAction = "SilentlyContinue"
        }
        
        $response = Invoke-RestMethod @params
        $responseJson = $response | ConvertTo-Json
        
        Check-SensitiveData $responseJson $TestName
        "Response: $responseJson" | Add-Content -Path $ReportFile
        
    } catch {
        Write-TestLog "Error invoking $Endpoint`: $_" "ERROR"
    }
}

# ============================================================================
# TEST SCENARIOS
# ============================================================================

function Initialize-TestReport {
    $header = @"
Sensitive Data Exposure Test Report
Generated: $(Get-Date)
API Base: $ApiBase
================================================

"@
    Set-Content -Path $ReportFile -Value $header
    Write-TestLog "Test report initialized" "INFO"
}

function Test-AuthFailedLogin {
    $payload = @{
        email    = "nonexistent@test.com"
        password = "wrongpassword"
    }
    
    Invoke-ApiTest -Endpoint "auth.signInWithEmail" -Payload $payload -TestName "Failed Login - No Password Exposure"
}

function Test-UserProfile {
    Write-TestLog "Testing: User Profile - No Full PII Exposure" "TEST"
    
    try {
        $response = Invoke-RestMethod -Uri "$ApiBase/auth.me" -Method Get -ErrorAction SilentlyContinue
        $responseJson = $response | ConvertTo-Json
        
        Check-SensitiveData $responseJson "User Profile"
    } catch {
        Write-TestLog "Not authenticated - Expected in test environment" "WARN"
    }
}

function Test-DatabaseErrorHandling {
    $payload = @{
        applicationId = "invalid-id-format"
    }
    
    Write-TestLog "Testing: Database Error - No Connection String Exposure" "TEST"
    
    try {
        $response = Invoke-RestMethod -Uri "$ApiBase/loans.getApplication" -Method Post -Body ($payload | ConvertTo-Json) -ContentType "application/json" -ErrorAction SilentlyContinue
        $responseJson = $response | ConvertTo-Json
        
        if ($responseJson -match 'postgresql|mysql|localhost|:5432') {
            Write-TestResult "FAIL" "Database Error`: Connection details exposed"
        } else {
            Write-TestResult "PASS" "Database Error`: Connection details protected"
        }
    } catch {
        Write-TestLog "Request failed (expected): $_" "WARN"
    }
}

function Test-ValidationErrorMasking {
    $payload = @{
        email    = "test@test.com"
        password = "pw"
    }
    
    Write-TestLog "Testing: Validation Errors - Input Not Echoed Back" "TEST"
    
    try {
        $response = Invoke-RestMethod -Uri "$ApiBase/auth.signUpWithEmail" -Method Post -Body ($payload | ConvertTo-Json) -ContentType "application/json" -ErrorAction SilentlyContinue
        $responseJson = $response | ConvertTo-Json
        
        if ($responseJson -match '"pw"') {
            Write-TestResult "FAIL" "Validation Error`: Provided password echoed back"
        } else {
            Write-TestResult "PASS" "Validation Error`: Input safely masked"
        }
    } catch {
        Write-TestLog "Request failed (expected): $_" "WARN"
    }
}

function Test-PaymentDataMasking {
    Write-TestLog "Testing: Payment Data - Card Numbers Masked" "TEST"
    
    try {
        $response = Invoke-RestMethod -Uri "$ApiBase/payments.getAuthorizeNetConfig" -Method Get -ErrorAction SilentlyContinue
        $responseJson = $response | ConvertTo-Json
        
        if ($responseJson -match '\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}') {
            Write-TestResult "FAIL" "Payment Data`: Full credit card number exposed"
        } else {
            Write-TestResult "PASS" "Payment Data`: Card numbers protected"
        }
    } catch {
        Write-TestLog "Not authenticated - Expected in test environment" "WARN"
    }
}

function Test-ResponseStructure {
    $payload = @{
        test = "invalid"
    }
    
    Write-TestLog "Testing: Response Structure - Consistent Error Format" "TEST"
    
    try {
        $response = Invoke-RestMethod -Uri "$ApiBase/loans.createApplication" -Method Post -Body ($payload | ConvertTo-Json) -ContentType "application/json" -ErrorAction SilentlyContinue
        $responseJson = $response | ConvertTo-Json
        
        if ($responseJson -match '"success"\s*:') {
            Write-TestResult "PASS" "Response Structure`: Standard format maintained"
        } else {
            Write-TestResult "WARN" "Response Structure`: Non-standard format detected"
        }
    } catch {
        Write-TestLog "Request failed: $_" "WARN"
    }
}

function Test-OtpNotExposed {
    $payload = @{
        email = "test@example.com"
    }
    
    Write-TestLog "Testing: OTP Endpoint - Codes Not Exposed" "TEST"
    
    try {
        $response = Invoke-RestMethod -Uri "$ApiBase/otp.sendOTP" -Method Post -Body ($payload | ConvertTo-Json) -ContentType "application/json" -ErrorAction SilentlyContinue
        $responseJson = $response | ConvertTo-Json
        
        if ($responseJson -match '"code"\s*:\s*"\d{6}"') {
            Write-TestResult "FAIL" "OTP Endpoint`: Code exposed in response"
        } else {
            Write-TestResult "PASS" "OTP Endpoint`: Code not exposed"
        }
    } catch {
        Write-TestLog "Request failed (expected): $_" "WARN"
    }
}

function Test-ApplicationSsnMasked {
    $payload = @{
        applicationId = "test-app-123"
    }
    
    Write-TestLog "Testing: Application Data - SSN Masked" "TEST"
    
    try {
        $response = Invoke-RestMethod -Uri "$ApiBase/loans.getApplication" -Method Post -Body ($payload | ConvertTo-Json) -ContentType "application/json" -ErrorAction SilentlyContinue
        $responseJson = $response | ConvertTo-Json
        
        if ($responseJson -match '\d{3}-\d{2}-\d{4}') {
            Write-TestResult "FAIL" "Application Data`: Full SSN exposed"
        } else {
            Write-TestResult "PASS" "Application Data`: SSN protected"
        }
    } catch {
        Write-TestLog "Not authenticated - Expected in test environment" "WARN"
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

function Main {
    Clear-Host
    Write-Host "Sensitive Data Exposure Testing Suite" -ForegroundColor Cyan
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host ""
    
    Initialize-TestReport
    
    # Run all tests
    Test-AuthFailedLogin
    Test-UserProfile
    Test-DatabaseErrorHandling
    Test-ValidationErrorMasking
    Test-PaymentDataMasking
    Test-ResponseStructure
    Test-OtpNotExposed
    Test-ApplicationSsnMasked
    
    Write-Host ""
    Write-Host "Test run completed. Results saved to:" -ForegroundColor Green
    Write-Host "  Report: $(Resolve-Path $ReportFile)" -ForegroundColor Yellow
    Write-Host "  Log: $(Resolve-Path $LogFile)" -ForegroundColor Yellow
}

# Run main function
Main
