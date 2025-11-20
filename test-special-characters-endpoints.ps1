# Special Character Handling Tests - PowerShell
# Tests the API's handling of special characters, symbols, and Unicode
#
# This script tests the loan application API with various special character inputs
# including Unicode, HTML entities, SQL patterns, and XSS vectors
#
# Usage:
#   .\test-special-characters-endpoints.ps1 [-ApiUrl <url>] [-Verbose]
#   .\test-special-characters-endpoints.ps1 -ApiUrl "http://localhost:3000/api/trpc"
#
# Requirements:
#   - PowerShell 5.0+
#   - curl or Invoke-RestMethod available
#

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

function Test-LoanSubmission {
    param(
        [string]$TestName,
        [PSCustomObject]$ApplicationData
    )
    
    Write-Test $TestName
    
    try {
        $response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body ($ApplicationData | ConvertTo-Json -Depth 10) -ContentType "application/json" -TimeoutSec 30
        
        if ($response.success -eq $true) {
            Write-Success "$TestName - Application accepted"
            return @{
                TestName = $TestName
                Success = $true
                StatusCode = 200
                Response = $response
            }
        } else {
            Write-Warning "$TestName - Application rejected"
            return @{
                TestName = $TestName
                Success = $false
                StatusCode = 400
                Response = $response
            }
        }
    }
    catch {
        Write-Error "$TestName - Error: $($_.Exception.Message)"
        return @{
            TestName = $TestName
            Success = $false
            StatusCode = $_.Exception.Response.StatusCode
            Error = $_.Exception.Message
        }
    }
}

function Create-TestApplication {
    param(
        [PSCustomObject]$SpecialData
    )
    
    $baseApp = @{
        email = $SpecialData.email ?? "test@example.com"
        phone = $SpecialData.phone ?? "5551234567"
        password = "SecurePass123!@#"
        dateOfBirth = $SpecialData.dateOfBirth ?? "1990-01-01"
        ssn = $SpecialData.ssn ?? "123-45-6789"
        state = $SpecialData.state ?? "MA"
        zipCode = $SpecialData.zipCode ?? "02101"
        employmentStatus = $SpecialData.employmentStatus ?? "employed"
        monthlyIncome = $SpecialData.monthlyIncome ?? 5000
        loanType = $SpecialData.loanType ?? "installment"
        requestedAmount = $SpecialData.requestedAmount ?? 25000
        disbursementMethod = $SpecialData.disbursementMethod ?? "bank_transfer"
    }
    
    # Add special fields
    if ($SpecialData.fullName) { $baseApp.fullName = $SpecialData.fullName }
    if ($SpecialData.street) { $baseApp.street = $SpecialData.street }
    if ($SpecialData.city) { $baseApp.city = $SpecialData.city }
    if ($SpecialData.employer) { $baseApp.employer = $SpecialData.employer }
    if ($SpecialData.loanPurpose) { $baseApp.loanPurpose = $SpecialData.loanPurpose }
    
    return $baseApp
}

# Test data
Write-Info "Loading special character test cases..."

$testCases = @(
    @{
        name = "Unicode Accents - French"
        data = @{
            fullName = "Jean-Claude François"
            street = "Rue de l'Église"
            city = "Montréal"
            employer = "Société Générale"
            loanPurpose = "Rénovation de maison"
        }
    },
    @{
        name = "Unicode - Cyrillic"
        data = @{
            fullName = "Владимир Петровский"
            street = "Улица Ленина 100"
            city = "Москва"
            employer = "Компания Россия"
            loanPurpose = "Расширение бизнеса"
        }
    },
    @{
        name = "Unicode - Chinese"
        data = @{
            fullName = "王小明"
            street = "中关村大街 200 号"
            city = "北京"
            employer = "中国公司"
            loanPurpose = "商业扩展和设备购置"
        }
    },
    @{
        name = "HTML Special Characters"
        data = @{
            fullName = "John <Test> Smith"
            employer = "Tech & Associates"
            street = "123 Main Street & Oak Ave"
            loanPurpose = "Home improvement & expansion"
        }
    },
    @{
        name = "Safe Symbols - Hyphens & Apostrophes"
        data = @{
            fullName = "Mary-Ann O'Brien-Smith"
            street = "O'Malley Lane"
            employer = "O'Reilly & Associates"
            loanPurpose = "Home-improvement and office-renovation"
        }
    },
    @{
        name = "Safe Symbols - Periods & Commas"
        data = @{
            fullName = "John Smith"
            street = "123 Main St., Suite 200, Building A"
            city = "Los Angeles"
            employer = "Tech Corp., Inc."
            loanPurpose = "Commercial expansion and equipment purchase."
        }
    },
    @{
        name = "Currency Symbols"
        data = @{
            fullName = "Currency Test"
            employer = "Dollar Corp"
            loanPurpose = "Equipment purchase (`$5000-`$10000 items) and inventory"
        }
    },
    @{
        name = "Mathematical Operators"
        data = @{
            fullName = "Math Test"
            employer = "Math Solutions"
            loanPurpose = "Phase 1 (±2 weeks) + Phase 2 (±4 weeks) = expansion timeline"
        }
    },
    @{
        name = "Mixed Special Characters"
        data = @{
            fullName = "Jean-Pierre O'Sullivan-Müller"
            street = "123-A Rue St. Jean, Suite #200 (Building B)"
            city = "Montréal-Nord"
            employer = "O'Malley & Associates, Inc. (Québec)"
            loanPurpose = "Expansion of O'Sullivan's café & bakery (Phase 1: `$15K, Phase 2: `$16K)"
        }
    },
    @{
        name = "Parentheses & Brackets"
        data = @{
            fullName = "Test User"
            street = "123 Street (rear building) [Section B]"
            loanPurpose = "(Phase 1) - Equipment; [Phase 2] - Expansion {2024}"
        }
    },
    @{
        name = "Quotes - Single & Double"
        data = @{
            fullName = "John `"Jack`" O'Brien"
            employer = "`"Premium`" Services Inc."
            loanPurpose = "Office for 'team' expansion"
        }
    },
    @{
        name = "SQL Injection Pattern - Single Quote"
        data = @{
            fullName = "Robert'; DROP TABLE--"
            street = "123 Street'; SELECT * FROM"
            loanPurpose = "Loan for 'admin' access"
        }
    },
    @{
        name = "SQL Injection Pattern - OR Clause"
        data = @{
            fullName = "Admin' OR '1'='1"
            loanPurpose = "Test' OR '1'='1"
        }
    },
    @{
        name = "XSS Pattern - Script Tag"
        data = @{
            fullName = "John<script>alert('XSS')</script>"
            loanPurpose = "Loan <script>alert('test')</script> purpose"
        }
    },
    @{
        name = "XSS Pattern - IMG onerror"
        data = @{
            fullName = "Test<img src=x onerror=alert('XSS')>"
            loanPurpose = "Purpose<img src=x onerror=alert(1)>"
        }
    },
    @{
        name = "Whitespace - Leading & Trailing"
        data = @{
            fullName = "  John Doe  "
            street = "  123 Main Street  "
            city = "  Boston  "
            employer = "  Test Company  "
        }
    },
    @{
        name = "Whitespace - Multiple Spaces"
        data = @{
            fullName = "John    Doe"
            street = "123    Main    Street"
            employer = "Test    Company"
            loanPurpose = "Home    improvement    project"
        }
    },
    @{
        name = "Comprehensive Mix"
        data = @{
            fullName = "Jean-Pierre Müller O'Brien"
            street = "123-A Rue St., Suite #200 (Building B) & Annex"
            city = "Montréal"
            employer = "Tech & Solutions (Ltd.) - Est. 2020"
            loanPurpose = "Expansion Phase 1 (±4 weeks) + Equipment (`$15K-`$20K); Staffing & Training"
        }
    }
)

# Run tests
Write-Info "Starting special character handling tests..."
Write-Info "API URL: $ApiUrl"
Write-Info ""

$results = @()
$passCount = 0
$failCount = 0

foreach ($testCase in $testCases) {
    $appData = Create-TestApplication -SpecialData $testCase.data
    $result = Test-LoanSubmission -TestName $testCase.name -ApplicationData $appData
    
    $results += $result
    
    if ($result.Success) {
        $passCount++
    } else {
        $failCount++
    }
    
    Start-Sleep -Milliseconds 100
}

# Summary
Write-Info ""
Write-Info "=" * 60
Write-Info "Test Summary"
Write-Info "=" * 60
Write-Success "Total Tests: $($results.Count)"
Write-Success "Passed: $passCount"
Write-Error "Failed: $failCount"
Write-Info "Pass Rate: $(($passCount / $results.Count * 100).ToString("F1"))%"
Write-Info "=" * 60

# Export results to JSON
$jsonResults = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    apiUrl = $ApiUrl
    totalTests = $results.Count
    passed = $passCount
    failed = $failCount
    passRate = [math]::Round(($passCount / $results.Count * 100), 2)
    results = $results
}

$jsonPath = "special-characters-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$jsonResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8
Write-Info "Results saved to: $jsonPath"

exit $failCount
