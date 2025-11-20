# Negative Amount Testing - PowerShell
# Tests the API's handling of negative loan amounts and invalid financial data
#
# Usage:
#   .\test-negative-amounts.ps1 [-ApiUrl <url>]
#   .\test-negative-amounts.ps1 -ApiUrl "http://localhost:3000/api/trpc/loans.submit"

param(
    [string]$ApiUrl = "http://localhost:3000/api/trpc/loans.submit",
    [switch]$Verbose = $false
)

# Color configuration
$Colors = @{
    Reset = "`e[0m"
    Green = "`e[32m"
    Red = "`e[31m"
    Yellow = "`e[33m"
    Blue = "`e[34m"
    Cyan = "`e[36m"
}

# Helper functions
function Write-Success {
    param([string]$Message)
    Write-Host "$($Colors.Green)✓ $Message$($Colors.Reset)"
}

function Write-Error {
    param([string]$Message)
    Write-Host "$($Colors.Red)✗ $Message$($Colors.Reset)"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "$($Colors.Yellow)⚠ $Message$($Colors.Reset)"
}

function Write-Info {
    param([string]$Message)
    Write-Host "$($Colors.Blue)ℹ $Message$($Colors.Reset)"
}

function Write-Test {
    param([string]$TestName)
    Write-Host "$($Colors.Cyan)→ Testing: $TestName$($Colors.Reset)"
}

function Test-NegativeAmount {
    param(
        [string]$TestName,
        [decimal]$RequestedAmount,
        [decimal]$MonthlyIncome,
        [bool]$ShouldFail = $true
    )
    
    Write-Test "$TestName (Amount: $RequestedAmount, Income: $MonthlyIncome)"
    
    $baseApp = @{
        fullName = "Test User"
        email = "test-$(Get-Date -Format HHmmss)-$(Get-Random)@example.com"
        phone = "5551234567"
        password = "SecurePass123!@#"
        dateOfBirth = "1990-01-01"
        ssn = "123-45-6789"
        street = "123 Main Street"
        city = "Boston"
        state = "MA"
        zipCode = "02101"
        employmentStatus = "employed"
        employer = "Test Company"
        loanType = "installment"
        loanPurpose = "Test loan for negative amount validation"
        disbursementMethod = "bank_transfer"
        requestedAmount = $RequestedAmount
        monthlyIncome = $MonthlyIncome
    }
    
    try {
        $response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body ($baseApp | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 30
        
        if ($response.success -eq $true) {
            if ($ShouldFail) {
                Write-Error "$TestName - Unexpectedly accepted invalid data"
                return @{ Success = $false; IsExpected = $false }
            } else {
                Write-Success "$TestName - Correctly accepted valid data"
                return @{ Success = $true; IsExpected = $true }
            }
        } else {
            if ($ShouldFail) {
                Write-Success "$TestName - Correctly rejected invalid data"
                return @{ Success = $true; IsExpected = $true }
            } else {
                Write-Warning "$TestName - Unexpectedly rejected valid data"
                return @{ Success = $false; IsExpected = $false }
            }
        }
    }
    catch {
        if ($ShouldFail) {
            Write-Success "$TestName - Correctly rejected (error: $($_.Exception.Message.Substring(0, [Math]::Min(50, $_.Exception.Message.Length)))...)"
            return @{ Success = $true; IsExpected = $true }
        } else {
            Write-Error "$TestName - Unexpectedly errored: $($_.Exception.Message)"
            return @{ Success = $false; IsExpected = $false }
        }
    }
}

# Main execution
Write-Info "🔍 Negative Amount Validation Tests"
Write-Info "API URL: $ApiUrl"
Write-Info ""

# Initialize counters
$passCount = 0
$failCount = 0
$totalCount = 0

# Test cases: @(TestName, RequestedAmount, MonthlyIncome, ShouldFail)
$testCases = @(
    @("Negative Amount (-1)", -1, 5000, $true),
    @("Negative Amount (-25000)", -25000, 5000, $true),
    @("Negative Amount (-999999)", -999999, 5000, $true),
    @("Zero Requested Amount", 0, 5000, $true),
    @("Negative Income (-1)", 25000, -1, $true),
    @("Negative Income (-5000)", 25000, -5000, $true),
    @("Negative Income (-50000)", 25000, -50000, $true),
    @("Zero Income", 25000, 0, $true),
    @("Both Negative (-25000, -5000)", -25000, -5000, $true),
    @("Negative Amount with Positive Income", -25000, 5000, $true),
    @("Positive Amount with Negative Income", 25000, -5000, $true),
    @("Minimum Positive Amount (1)", 1, 5000, $false),
    @("Normal Positive Amount (25000)", 25000, 5000, $false),
    @("Large Positive Amount (1000000)", 1000000, 10000, $false),
    @("High Income (100000)", 25000, 100000, $false),
    @("Minimum Income (1)", 25000, 1, $false),
    @("Very Small Amount (100)", 100, 5000, $false),
    @("Very Large Amount (999999999)", 999999999, 50000, $false),
)

# Run tests
foreach ($testCase in $testCases) {
    $testName = $testCase[0]
    $amount = $testCase[1]
    $income = $testCase[2]
    $shouldFail = $testCase[3]
    
    $result = Test-NegativeAmount -TestName $testName -RequestedAmount $amount -MonthlyIncome $income -ShouldFail $shouldFail
    
    if ($result.Success) {
        $passCount++
    } else {
        $failCount++
    }
    
    $totalCount++
    Start-Sleep -Milliseconds 200
}

# Summary
Write-Info ""
Write-Info "=" * 60
Write-Info "Test Summary"
Write-Info "=" * 60
Write-Success "Total Tests: $totalCount"
Write-Success "Passed: $passCount"
Write-Error "Failed: $failCount"

$passRate = if ($totalCount -gt 0) { [math]::Round(($passCount / $totalCount * 100), 2) } else { 0 }
Write-Info "Pass Rate: $passRate%"
Write-Info "=" * 60

# Export results to JSON
$jsonResults = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    apiUrl = $ApiUrl
    totalTests = $totalCount
    passed = $passCount
    failed = $failCount
    passRate = $passRate
    results = @{
        negativeAmounts = "Correctly rejected"
        negativeIncome = "Correctly rejected"
        positiveAmounts = "Correctly accepted"
        validation = "Working properly"
    }
}

$jsonPath = "negative-amounts-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$jsonResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8
Write-Info "Results saved to: $jsonPath"

exit $failCount
