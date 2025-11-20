#!/bin/bash
#
# Special Character Handling Tests - Bash
# Tests the API's handling of special characters, symbols, and Unicode
#
# This script tests the loan application API with various special character inputs
# including Unicode, HTML entities, SQL patterns, and XSS vectors
#
# Usage:
#   ./test-special-characters-endpoints.sh [API_URL]
#   ./test-special-characters-endpoints.sh "http://localhost:3000/api/trpc/loans.submit"
#
# Requirements:
#   - bash 4.0+
#   - curl
#   - jq (optional, for JSON parsing)
#

API_URL="${1:-http://localhost:3000/api/trpc/loans.submit}"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_test() {
    echo -e "${CYAN}→ Testing: $1${NC}"
}

# Test function
test_loan_submission() {
    local test_name="$1"
    local app_data="$2"
    
    print_test "$test_name"
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$app_data" \
        -w "\n%{http_code}" \
        "$API_URL" 2>/dev/null)
    
    # Parse response
    local body=$(echo "$response" | head -n -1)
    local http_code=$(echo "$response" | tail -n 1)
    
    if [[ "$http_code" == "200" ]]; then
        print_success "$test_name - Application accepted (HTTP $http_code)"
        return 0
    else
        print_warning "$test_name - Application rejected (HTTP $http_code)"
        return 1
    fi
}

# Create loan application JSON
create_application() {
    local full_name="${1:-Test User}"
    local street="${2:-123 Main Street}"
    local city="${3:-Boston}"
    local employer="${4:-Test Company}"
    local loan_purpose="${5:-Test loan purpose}"
    
    cat <<EOF
{
    "fullName": "$full_name",
    "email": "test$(date +%s)@example.com",
    "phone": "5551234567",
    "password": "SecurePass123!@#",
    "dateOfBirth": "1990-01-01",
    "ssn": "123-45-6789",
    "street": "$street",
    "city": "$city",
    "state": "MA",
    "zipCode": "02101",
    "employmentStatus": "employed",
    "employer": "$employer",
    "monthlyIncome": 5000,
    "loanType": "installment",
    "requestedAmount": 25000,
    "loanPurpose": "$loan_purpose",
    "disbursementMethod": "bank_transfer"
}
EOF
}

# Main execution
print_info "Special Character Handling Tests"
print_info "API URL: $API_URL"
print_info ""

# Initialize counters
pass_count=0
fail_count=0
total_count=0

# Test cases
declare -A test_cases=(
    ["Unicode Accents - French"]="Jean-Claude François|Rue de l'Église|Montréal|Société Générale|Rénovation de maison"
    ["Unicode - Cyrillic"]="Владимир Петровский|Улица Ленина 100|Москва|Компания Россия|Расширение бизнеса"
    ["Unicode - Chinese"]="王小明|中关村大街 200 号|北京|中国公司|商业扩展和设备购置"
    ["HTML Special Characters"]="John <Test> Smith|123 Main Street & Oak Ave|Boston|Tech & Associates|Home improvement & expansion"
    ["Safe Symbols - Hyphens & Apostrophes"]="Mary-Ann O'Brien-Smith|O'Malley Lane|Boston|O'Reilly & Associates|Home-improvement and office-renovation"
    ["Safe Symbols - Periods & Commas"]="John Smith|123 Main St., Suite 200|Los Angeles|Tech Corp., Inc.|Commercial expansion and equipment."
    ["Currency Symbols"]="Currency Test|123 Main Street|Boston|Dollar Corp|Equipment purchase (\$5000-\$10000) and inventory"
    ["Mathematical Operators"]="Math Test|123 Main Street|Boston|Math Solutions|Phase 1 (±2 weeks) + Phase 2 (±4 weeks) = expansion"
    ["Mixed Special Characters"]="Jean-Pierre O'Sullivan-Müller|123-A Rue St. Jean, Suite #200|Montréal-Nord|O'Malley & Associates|Expansion of O'Sullivan's café & bakery (Phase 1: \$15K, Phase 2: \$16K)"
    ["Parentheses & Brackets"]="Test User|123 Street (rear building) [Section B]|Boston|Test Company|(Phase 1) - Equipment; [Phase 2] - Expansion"
    ["Quotes - Single & Double"]="John \"Jack\" O'Brien|123 Main Street|Boston|\"Premium\" Services Inc.|Office for 'team' expansion"
    ["SQL Injection - Single Quote"]="Robert'; DROP TABLE--|123 Street'; SELECT * FROM|Boston|Test Company|Loan for 'admin' access"
    ["SQL Injection - OR Clause"]="Admin' OR '1'='1|123 Main Street|Boston|Test Company|Test' OR '1'='1"
    ["XSS - Script Tag"]="John<script>alert('XSS')</script>|123 Main Street|Boston|Test Company|Loan <script>alert('test')</script> purpose"
    ["XSS - IMG onerror"]="Test<img src=x onerror=alert('XSS')>|123 Main Street|Boston|Test Company|Purpose<img src=x onerror=alert(1)>"
    ["Whitespace - Leading & Trailing"]="  John Doe  |  123 Main Street  |  Boston  |  Test Company  |Home improvement"
    ["Whitespace - Multiple Spaces"]="John    Doe|123    Main    Street|Boston|Test    Company|Home    improvement    project"
)

# Run tests
for test_name in "${!test_cases[@]}"; do
    IFS='|' read -r full_name street city employer loan_purpose <<< "${test_cases[$test_name]}"
    
    app_json=$(create_application "$full_name" "$street" "$city" "$employer" "$loan_purpose")
    
    if test_loan_submission "$test_name" "$app_json"; then
        ((pass_count++))
    else
        ((fail_count++))
    fi
    
    ((total_count++))
    sleep 0.1
done

# Summary
print_info ""
print_info "============================================================"
print_info "Test Summary"
print_info "============================================================"
print_success "Total Tests: $total_count"
print_success "Passed: $pass_count"
print_error "Failed: $fail_count"

pass_rate=0
if [ "$total_count" -gt 0 ]; then
    pass_rate=$((pass_count * 100 / total_count))
fi
print_info "Pass Rate: $pass_rate%"
print_info "============================================================"

# Save results to JSON
timestamp=$(date +"%Y-%m-%d %H:%M:%S")
report_file="special-characters-report-$(date +%Y%m%d-%H%M%S).json"

cat > "$report_file" <<EOF
{
  "timestamp": "$timestamp",
  "apiUrl": "$API_URL",
  "totalTests": $total_count,
  "passed": $pass_count,
  "failed": $fail_count,
  "passRate": $pass_rate
}
EOF

print_info "Results saved to: $report_file"

# Exit with fail count
exit $fail_count
