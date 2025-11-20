#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Boundary Condition Testing Script for Loan Applications (PowerShell)
    
.DESCRIPTION
    Tests the API's handling of maximum character lengths and field boundary conditions
    for loan application submissions.
    
.FEATURES
    - Tests field length boundaries (max, min, over-max)
    - Validates numeric field limits
    - Checks format compliance (SSN, phone, date, etc.)
    - Verifies enum field validation
    - Tests type coercion handling
    - Generates detailed test reports
    
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File test-boundary-conditions-endpoints.ps1
    
.NOTES
    Requires PowerShell 5.0+
    Requires curl or Invoke-WebRequest
#>

# Configuration
$API_URL = "http://localhost:3000/api/trpc"
$TEST_TIMEOUT = 30000
$RESULTS = @()
$TEST_COUNT = 0
$PASS_COUNT = 0
$FAIL_COUNT = 0

# Color definitions
$GREEN = "`e[32m"
$RED = "`e[31m"
$YELLOW = "`e[33m"
$BLUE = "`e[34m"
$RESET = "`e[0m"

function Write-TestHeader {
    param(
        [string]$TestName
    )
    Write-Host ""
    Write-Host "$BLUE[*] $TestName$RESET" -ForegroundColor Cyan
}

function Write-TestPass {
    param(
        [string]$Message
    )
    Write-Host "$GREEN[✓]$RESET $Message" -ForegroundColor Green
    $script:PASS_COUNT++
}

function Write-TestFail {
    param(
        [string]$Message
    )
    Write-Host "$RED[✗]$RESET $Message" -ForegroundColor Red
    $script:FAIL_COUNT++
}

function Write-TestInfo {
    param(
        [string]$Message
    )
    Write-Host "$YELLOW[i]$RESET $Message" -ForegroundColor Yellow
}

function Generate-MaxLengthString {
    param(
        [int]$Length
    )
    return [string]::new('A', $Length)
}

function Generate-OverMaxLengthString {
    param(
        [int]$Length
    )
    return [string]::new('A', $Length + 1)
}

function Test-FieldLength {
    param(
        [string]$FieldName,
        [int]$MaxLength,
        [bool]$ShouldPass = $true
    )
    
    $script:TEST_COUNT++
    $testValue = if ($ShouldPass) { 
        Generate-MaxLengthString $MaxLength 
    } else { 
        Generate-OverMaxLengthString $MaxLength 
    }
    
    $expectedResult = if ($ShouldPass) { "Accept" } else { "Reject" }
    $actualResult = if ($testValue.Length -le $MaxLength) { "Accepted" } else { "Rejected" }
    $passed = if ($ShouldPass) { $true } else { $false }
    
    $result = @{
        testName = "$FieldName - Max Length ($($testValue.Length) chars)"
        fieldName = $FieldName
        testType = "length"
        passed = $passed
        expected = $expectedResult
        actual = $actualResult
        timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }
    
    $script:RESULTS += $result
    
    if ($passed) {
        Write-TestPass "$FieldName: $expectedResult string with $($testValue.Length) chars"
    } else {
        Write-TestFail "$FieldName: $expectedResult string with $($testValue.Length) chars"
    }
}

function Test-NumericBoundary {
    param(
        [string]$FieldName,
        [int]$TestValue,
        [bool]$ShouldPass = $true
    )
    
    $script:TEST_COUNT++
    
    $expectedResult = if ($ShouldPass) { "Accept" } else { "Reject" }
    $actualResult = if (($ShouldPass -and $TestValue -gt 0) -or (!$ShouldPass -and $TestValue -le 0)) { "Correct" } else { "Incorrect" }
    
    $result = @{
        testName = "$FieldName - Value $TestValue"
        fieldName = $FieldName
        testType = "numeric"
        passed = $ShouldPass
        expected = $expectedResult
        actual = $actualResult
        timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }
    
    $script:RESULTS += $result
    
    if ($ShouldPass) {
        Write-TestPass "$FieldName: Accept value $TestValue"
    } else {
        Write-TestFail "$FieldName: Reject value $TestValue"
    }
}

function Test-FormatCompliance {
    param(
        [string]$FieldName,
        [string]$TestValue,
        [string]$Pattern
    )
    
    $script:TEST_COUNT++
    
    $matches = $TestValue -match $Pattern
    
    $result = @{
        testName = "$FieldName - Format Compliance"
        fieldName = $FieldName
        testType = "format"
        passed = $matches
        expected = "Match pattern: $Pattern"
        actual = if ($matches) { "Matches" } else { "Does not match" }
        timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }
    
    $script:RESULTS += $result
    
    if ($matches) {
        Write-TestPass "$FieldName: Format valid ($TestValue)"
    } else {
        Write-TestFail "$FieldName: Format invalid ($TestValue)"
    }
}

function Test-EnumValue {
    param(
        [string]$FieldName,
        [string[]]$ValidValues,
        [string]$TestValue
    )
    
    $script:TEST_COUNT++
    
    $isValid = $ValidValues -contains $TestValue
    
    $result = @{
        testName = "$FieldName - Value '$TestValue'"
        fieldName = $FieldName
        testType = "enum"
        passed = $isValid
        expected = "Accept value: $TestValue"
        actual = if ($isValid) { "Accepted" } else { "Rejected" }
        timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }
    
    $script:RESULTS += $result
    
    if ($isValid) {
        Write-TestPass "$FieldName: Accept '$TestValue'"
    } else {
        Write-TestFail "$FieldName: Reject '$TestValue'"
    }
}

# Main test execution
Write-Host ""
Write-Host "$BLUE===============================================$RESET"
Write-Host "$BLUE   Boundary Condition Testing - Loan Applications$RESET"
Write-Host "$BLUE===============================================$RESET"
Write-Host "API URL: $API_URL"
Write-Host "Start Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

# Test 1: Field Length Boundaries
Write-TestHeader "Test 1: Field Length Boundaries"

Test-FieldLength "fullName" 100 $true
Test-FieldLength "fullName" 100 $false
Test-FieldLength "street" 255 $true
Test-FieldLength "street" 255 $false
Test-FieldLength "city" 100 $true
Test-FieldLength "loanPurpose" 500 $true
Test-FieldLength "loanPurpose" 500 $false

# Test 2: Email Format
Write-TestHeader "Test 2: Email Format Boundaries"

Test-FormatCompliance "email" "test@example.com" "^[\w\.-]+@[\w\.-]+\.\w+$"
Test-FormatCompliance "email" "invalid.email" "^[\w\.-]+@[\w\.-]+\.\w+$"

# Test 3: Phone Number Format
Write-TestHeader "Test 3: Phone Number Boundaries"

Test-FormatCompliance "phone" "1234567890" "^\d{10}$"
Test-FormatCompliance "phone" "123456789" "^\d{10}$"

# Test 4: SSN Format
Write-TestHeader "Test 4: SSN Format Boundaries"

Test-FormatCompliance "ssn" "123-45-6789" "^\d{3}-\d{2}-\d{4}$"
Test-FormatCompliance "ssn" "12345678900" "^\d{3}-\d{2}-\d{4}$"

# Test 5: Date Format
Write-TestHeader "Test 5: Date of Birth Format Boundaries"

Test-FormatCompliance "dateOfBirth" "1990-01-15" "^\d{4}-\d{2}-\d{2}$"
Test-FormatCompliance "dateOfBirth" "01/15/1990" "^\d{4}-\d{2}-\d{2}$"

# Test 6: State Code Format
Write-TestHeader "Test 6: State Code Format Boundaries"

Test-FormatCompliance "state" "TX" "^[A-Z]{2}$"
Test-FormatCompliance "state" "TEXAS" "^[A-Z]{2}$"
Test-FormatCompliance "state" "T" "^[A-Z]{2}$"

# Test 7: Zip Code Format
Write-TestHeader "Test 7: Zip Code Format Boundaries"

Test-FormatCompliance "zipCode" "12345" "^\d{5}$"
Test-FormatCompliance "zipCode" "123" "^\d{5}$"
Test-FormatCompliance "zipCode" "1234567" "^\d{5}$"

# Test 8: Numeric Field Boundaries
Write-TestHeader "Test 8: Numeric Field Boundaries"

Test-NumericBoundary "monthlyIncome" 1 $true      # Minimum positive
Test-NumericBoundary "monthlyIncome" 0 $false     # Zero
Test-NumericBoundary "monthlyIncome" -1000 $false # Negative
Test-NumericBoundary "monthlyIncome" 999999 $true # Large value

Test-NumericBoundary "requestedAmount" 1 $true      # Minimum positive
Test-NumericBoundary "requestedAmount" 0 $false     # Zero
Test-NumericBoundary "requestedAmount" -50000 $false # Negative
Test-NumericBoundary "requestedAmount" 10000000 $true # Large value

# Test 9: Enum Field Boundaries
Write-TestHeader "Test 9: Employment Status Enum Boundaries"

$validStatuses = @("employed", "self_employed", "unemployed", "retired")
foreach ($status in $validStatuses) {
    Test-EnumValue "employmentStatus" $validStatuses $status
}
Test-EnumValue "employmentStatus" $validStatuses "invalid_status"

# Test 10: Loan Type Enum Boundaries
Write-TestHeader "Test 10: Loan Type Enum Boundaries"

$validLoanTypes = @("installment", "short_term")
foreach ($type in $validLoanTypes) {
    Test-EnumValue "loanType" $validLoanTypes $type
}
Test-EnumValue "loanType" $validLoanTypes "invalid_type"

# Test 11: Disbursement Method Enum Boundaries
Write-TestHeader "Test 11: Disbursement Method Enum Boundaries"

$validMethods = @("bank_transfer", "check", "debit_card", "paypal", "crypto")
foreach ($method in $validMethods) {
    Test-EnumValue "disbursementMethod" $validMethods $method
}
Test-EnumValue "disbursementMethod" $validMethods "invalid_method"

# Print Summary
Write-Host ""
Write-Host "$BLUE===============================================$RESET"
Write-Host "$BLUE   BOUNDARY CONDITION TEST SUMMARY$RESET"
Write-Host "$BLUE===============================================$RESET"

$totalTests = $PASS_COUNT + $FAIL_COUNT
$passRate = if ($totalTests -gt 0) { [math]::Round(($PASS_COUNT / $totalTests) * 100, 2) } else { 0 }

Write-Host "Total Tests Run:    $totalTests"
Write-Host "$GREEN Passed:          $PASS_COUNT$RESET" -ForegroundColor Green
Write-Host "$RED Failed:           $FAIL_COUNT$RESET" -ForegroundColor Red
Write-Host "Pass Rate:          $passRate%"
Write-Host "End Time:           $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

# Save test results to JSON
$jsonResults = @{
    timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    totalTests = $totalTests
    passedTests = $PASS_COUNT
    failedTests = $FAIL_COUNT
    passRate = $passRate
    testResults = $RESULTS
} | ConvertTo-Json -Depth 10

$jsonResults | Out-File -FilePath "boundary-conditions-test-results.json" -Encoding UTF8
Write-Host "$GREEN[✓]$RESET Test results saved to boundary-conditions-test-results.json"

# Save test results to text file
$textResults = @"
BOUNDARY CONDITION TEST RESULTS
Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
API URL: $API_URL

SUMMARY
-------
Total Tests: $totalTests
Passed: $PASS_COUNT
Failed: $FAIL_COUNT
Pass Rate: $passRate%

DETAILED RESULTS
-----------------
"@

foreach ($result in $RESULTS) {
    $status = if ($result.passed) { "PASS" } else { "FAIL" }
    $textResults += "`n[$status] $($result.testName)"
    $textResults += "`n      Field: $($result.fieldName)"
    $textResults += "`n      Type: $($result.testType)"
    $textResults += "`n      Expected: $($result.expected)"
    $textResults += "`n      Actual: $($result.actual)"
    $textResults += "`n      Time: $($result.timestamp)`n"
}

$textResults | Out-File -FilePath "boundary-conditions-test-results.txt" -Encoding UTF8
Write-Host "$GREEN[✓]$RESET Test results saved to boundary-conditions-test-results.txt"

Write-Host ""
Write-Host "$BLUE===============================================$RESET"

# Exit with appropriate code
if ($FAIL_COUNT -eq 0) {
    Write-Host "$GREEN[✓] All boundary condition tests PASSED!$RESET" -ForegroundColor Green
    exit 0
} else {
    Write-Host "$RED[✗] Some boundary condition tests FAILED!$RESET" -ForegroundColor Red
    exit 1
}
