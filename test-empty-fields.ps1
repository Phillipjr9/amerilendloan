# Empty Fields Validation Test Suite - PowerShell
# Tests API rejection of loan applications with empty or missing fields
# Validates all required field validation and error handling

param(
    [string]$ApiUrl = "http://localhost:3000/api/trpc/loans.submit",
    [switch]$GenerateReport = $true
)

# Color configuration
$Colors = @{
    Success = "Green"
    Failure = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    TestHeader = "Blue"
}

function Write-TestResult {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-TestResult "✓ $Message" $Colors.Success
}

function Write-Error {
    param([string]$Message)
    Write-TestResult "✗ $Message" $Colors.Failure
}

function Write-Info {
    param([string]$Message)
    Write-TestResult "ℹ $Message" $Colors.Info
}

function Write-TestHeader {
    param([string]$Message)
    Write-TestResult "`n$Message" $Colors.TestHeader
}

# Base valid application data
$baseValidApp = @{
    fullName = "John Doe"
    email = "test-$(Get-Random)@example.com"
    phone = "5551234567"
    password = "SecurePass123!"
    dateOfBirth = "1990-05-15"
    ssn = "123-45-6789"
    street = "123 Main Street"
    city = "Springfield"
    state = "IL"
    zipCode = "62701"
    employmentStatus = "employed"
    employer = "Tech Company Inc"
    monthlyIncome = 5000
    loanType = "installment"
    requestedAmount = 25000
    loanPurpose = "Home improvement and renovation"
    disbursementMethod = "bank_transfer"
}

$testResults = @{
    total = 0
    passed = 0
    failed = 0
    results = @()
}

function Test-EmptyField {
    param(
        [string]$TestName,
        [hashtable]$ApplicationData,
        [bool]$ShouldFail = $true
    )
    
    $testResults.total++
    $testName = $testName -replace "^Test-", ""
    
    try {
        $jsonBody = $ApplicationData | ConvertTo-Json -Compress
        $response = Invoke-RestMethod -Uri $ApiUrl -Method Post `
            -ContentType "application/json" `
            -Body $jsonBody `
            -ErrorAction Stop
        
        if ($ShouldFail) {
            Write-Error "$TestName - Unexpectedly accepted empty/invalid data"
            $testResults.failed++
            $testResults.results += @{
                test = $TestName
                expected = "400 (Bad Request)"
                actual = "200 (Accepted)"
                status = "FAILED"
            }
        } else {
            Write-Success "$TestName - Correctly accepted valid data"
            $testResults.passed++
            $testResults.results += @{
                test = $TestName
                expected = "200 (Accepted)"
                actual = "200 (Accepted)"
                status = "PASSED"
            }
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        
        if ($ShouldFail) {
            if ($statusCode -eq 400) {
                Write-Success "$TestName - Correctly rejected"
                $testResults.passed++
                $testResults.results += @{
                    test = $TestName
                    expected = "400 (Bad Request)"
                    actual = "400 (Bad Request)"
                    status = "PASSED"
                }
            } else {
                Write-Error "$TestName - Got status $statusCode instead of 400"
                $testResults.failed++
                $testResults.results += @{
                    test = $TestName
                    expected = "400 (Bad Request)"
                    actual = "$statusCode"
                    status = "FAILED"
                }
            }
        } else {
            Write-Error "$TestName - Unexpectedly failed with status $statusCode"
            $testResults.failed++
            $testResults.results += @{
                test = $TestName
                expected = "200 (Accepted)"
                actual = "$statusCode"
                status = "FAILED"
            }
        }
    }
}

# =============================================================================
# Test Suite 1: Completely Empty Application
# =============================================================================
Write-TestHeader "Test Suite 1: Completely Empty Application"

$emptyApp = @{}
Test-EmptyField "Empty Object" $emptyApp $true

# =============================================================================
# Test Suite 2: Individual Empty Fields
# =============================================================================
Write-TestHeader "Test Suite 2: Individual Empty Fields"

$app = $baseValidApp.Clone()
$app.fullName = ""
Test-EmptyField "Empty fullName" $app $true

$app = $baseValidApp.Clone()
$app.email = ""
Test-EmptyField "Empty email" $app $true

$app = $baseValidApp.Clone()
$app.phone = ""
Test-EmptyField "Empty phone" $app $true

$app = $baseValidApp.Clone()
$app.password = ""
Test-EmptyField "Empty password" $app $true

$app = $baseValidApp.Clone()
$app.dateOfBirth = ""
Test-EmptyField "Empty dateOfBirth" $app $true

$app = $baseValidApp.Clone()
$app.ssn = ""
Test-EmptyField "Empty ssn" $app $true

$app = $baseValidApp.Clone()
$app.street = ""
Test-EmptyField "Empty street" $app $true

$app = $baseValidApp.Clone()
$app.city = ""
Test-EmptyField "Empty city" $app $true

$app = $baseValidApp.Clone()
$app.state = ""
Test-EmptyField "Empty state" $app $true

$app = $baseValidApp.Clone()
$app.zipCode = ""
Test-EmptyField "Empty zipCode" $app $true

$app = $baseValidApp.Clone()
$app.loanPurpose = ""
Test-EmptyField "Empty loanPurpose" $app $true

# =============================================================================
# Test Suite 3: Missing Required Fields
# =============================================================================
Write-TestHeader "Test Suite 3: Missing Required Fields"

$app = $baseValidApp.Clone()
$app.Remove("fullName")
Test-EmptyField "Missing fullName" $app $true

$app = $baseValidApp.Clone()
$app.Remove("email")
Test-EmptyField "Missing email" $app $true

$app = $baseValidApp.Clone()
$app.Remove("phone")
Test-EmptyField "Missing phone" $app $true

$app = $baseValidApp.Clone()
$app.Remove("password")
Test-EmptyField "Missing password" $app $true

$app = $baseValidApp.Clone()
$app.Remove("dateOfBirth")
Test-EmptyField "Missing dateOfBirth" $app $true

$app = $baseValidApp.Clone()
$app.Remove("ssn")
Test-EmptyField "Missing ssn" $app $true

$app = $baseValidApp.Clone()
$app.Remove("street")
Test-EmptyField "Missing street" $app $true

$app = $baseValidApp.Clone()
$app.Remove("city")
Test-EmptyField "Missing city" $app $true

$app = $baseValidApp.Clone()
$app.Remove("state")
Test-EmptyField "Missing state" $app $true

$app = $baseValidApp.Clone()
$app.Remove("zipCode")
Test-EmptyField "Missing zipCode" $app $true

$app = $baseValidApp.Clone()
$app.Remove("employmentStatus")
Test-EmptyField "Missing employmentStatus" $app $true

$app = $baseValidApp.Clone()
$app.Remove("monthlyIncome")
Test-EmptyField "Missing monthlyIncome" $app $true

$app = $baseValidApp.Clone()
$app.Remove("loanType")
Test-EmptyField "Missing loanType" $app $true

$app = $baseValidApp.Clone()
$app.Remove("requestedAmount")
Test-EmptyField "Missing requestedAmount" $app $true

$app = $baseValidApp.Clone()
$app.Remove("loanPurpose")
Test-EmptyField "Missing loanPurpose" $app $true

$app = $baseValidApp.Clone()
$app.Remove("disbursementMethod")
Test-EmptyField "Missing disbursementMethod" $app $true

# =============================================================================
# Test Suite 4: Whitespace and Null Values
# =============================================================================
Write-TestHeader "Test Suite 4: Whitespace and Null Values"

$app = $baseValidApp.Clone()
$app.fullName = "   "
Test-EmptyField "Whitespace-only fullName" $app $true

$app = $baseValidApp.Clone()
$app.fullName = $null
Test-EmptyField "Null fullName" $app $true

$app = $baseValidApp.Clone()
$app.email = $null
Test-EmptyField "Null email" $app $true

$app = $baseValidApp.Clone()
$app.phone = $null
Test-EmptyField "Null phone" $app $true

$app = $baseValidApp.Clone()
$app.monthlyIncome = $null
Test-EmptyField "Null monthlyIncome" $app $true

$app = $baseValidApp.Clone()
$app.requestedAmount = $null
Test-EmptyField "Null requestedAmount" $app $true

# =============================================================================
# Test Suite 5: Invalid Format Tests
# =============================================================================
Write-TestHeader "Test Suite 5: Invalid Format Tests"

$app = $baseValidApp.Clone()
$app.email = "not-an-email"
Test-EmptyField "Invalid email format" $app $true

$app = $baseValidApp.Clone()
$app.email = "invalidemail.com"
Test-EmptyField "Email without @" $app $true

$app = $baseValidApp.Clone()
$app.phone = "555123"
Test-EmptyField "Phone too short" $app $true

$app = $baseValidApp.Clone()
$app.password = "short"
Test-EmptyField "Password too short" $app $true

$app = $baseValidApp.Clone()
$app.dateOfBirth = "05/15/1990"
Test-EmptyField "Invalid dateOfBirth format" $app $true

$app = $baseValidApp.Clone()
$app.ssn = "12345678"
Test-EmptyField "Invalid SSN format" $app $true

$app = $baseValidApp.Clone()
$app.state = "ILL"
Test-EmptyField "Invalid state code (too long)" $app $true

$app = $baseValidApp.Clone()
$app.state = "I"
Test-EmptyField "Invalid state code (too short)" $app $true

$app = $baseValidApp.Clone()
$app.zipCode = "123"
Test-EmptyField "ZipCode too short" $app $true

$app = $baseValidApp.Clone()
$app.loanPurpose = "short"
Test-EmptyField "LoanPurpose too short" $app $true

$app = $baseValidApp.Clone()
$app.employmentStatus = "invalid_status"
Test-EmptyField "Invalid employmentStatus enum" $app $true

$app = $baseValidApp.Clone()
$app.loanType = "invalid_type"
Test-EmptyField "Invalid loanType enum" $app $true

$app = $baseValidApp.Clone()
$app.disbursementMethod = "invalid_method"
Test-EmptyField "Invalid disbursementMethod enum" $app $true

# =============================================================================
# Test Suite 6: Valid Application Control Test
# =============================================================================
Write-TestHeader "Test Suite 6: Valid Application Control Test"
Test-EmptyField "Valid complete application" $baseValidApp $false

# =============================================================================
# Results Summary
# =============================================================================
Write-TestHeader "Test Results Summary"

$passRate = if ($testResults.total -gt 0) { 
    [math]::Round(($testResults.passed / $testResults.total) * 100, 2) 
} else { 
    0 
}

Write-Info "Total Tests: $($testResults.total)"
Write-Success "Passed: $($testResults.passed)"
Write-Error "Failed: $($testResults.failed)"
Write-Info "Pass Rate: $passRate%"

# Generate JSON report if requested
if ($GenerateReport) {
    $report = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        apiUrl = $ApiUrl
        totalTests = $testResults.total
        passed = $testResults.passed
        failed = $testResults.failed
        passRate = $passRate
        results = $testResults.results
    } | ConvertTo-Json -Depth 10
    
    $reportFile = "empty-fields-test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $report | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Info "Report saved to: $reportFile"
}

# Exit with appropriate code
if ($testResults.failed -eq 0) {
    exit 0
} else {
    exit 1
}
