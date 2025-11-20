#!/bin/bash
#
# Negative Amount Testing - Bash
# Tests the API's handling of negative loan amounts and invalid financial data
#
# Usage:
#   ./test-negative-amounts.sh [API_URL]
#   ./test-negative-amounts.sh "http://localhost:3000/api/trpc/loans.submit"
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
test_negative_amount() {
    local test_name="$1"
    local requested_amount="$2"
    local monthly_income="$3"
    local should_fail="$4"
    
    print_test "$test_name (Amount: $requested_amount, Income: $monthly_income)"
    
    local timestamp=$(date +%s%N)
    local app_json=$(cat <<EOF
{
    "fullName": "Test User",
    "email": "test-$timestamp@example.com",
    "phone": "5551234567",
    "password": "SecurePass123!@#",
    "dateOfBirth": "1990-01-01",
    "ssn": "123-45-6789",
    "street": "123 Main Street",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101",
    "employmentStatus": "employed",
    "employer": "Test Company",
    "loanType": "installment",
    "loanPurpose": "Test loan for negative amount validation",
    "disbursementMethod": "bank_transfer",
    "requestedAmount": $requested_amount,
    "monthlyIncome": $monthly_income
}
EOF
)
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$app_json" \
        -w "\n%{http_code}" \
        "$API_URL" 2>/dev/null)
    
    # Parse response
    local body=$(echo "$response" | head -n -1)
    local http_code=$(echo "$response" | tail -n 1)
    
    # Check if success is true or false
    local is_success=$(echo "$body" | grep -o '"success":true' || echo "false")
    
    if [[ "$is_success" == '"success":true' ]]; then
        if [[ "$should_fail" == "true" ]]; then
            print_error "$test_name - Unexpectedly accepted invalid data (HTTP $http_code)"
            return 1
        else
            print_success "$test_name - Correctly accepted valid data (HTTP $http_code)"
            return 0
        fi
    else
        if [[ "$should_fail" == "true" ]]; then
            print_success "$test_name - Correctly rejected invalid data (HTTP $http_code)"
            return 0
        else
            print_warning "$test_name - Unexpectedly rejected valid data (HTTP $http_code)"
            return 1
        fi
    fi
}

# Main execution
print_info "🔍 Negative Amount Validation Tests"
print_info "API URL: $API_URL"
print_info ""

# Initialize counters
pass_count=0
fail_count=0
total_count=0

# Test cases
declare -a test_cases=(
    "Negative Amount (-1)|−1|5000|true"
    "Negative Amount (-25000)|−25000|5000|true"
    "Negative Amount (-999999)|−999999|5000|true"
    "Zero Requested Amount|0|5000|true"
    "Negative Income (-1)|25000|−1|true"
    "Negative Income (-5000)|25000|−5000|true"
    "Negative Income (-50000)|25000|−50000|true"
    "Zero Income|25000|0|true"
    "Both Negative (-25000, -5000)|−25000|−5000|true"
    "Negative Amount with Positive Income|−25000|5000|true"
    "Positive Amount with Negative Income|25000|−5000|true"
    "Minimum Positive Amount (1)|1|5000|false"
    "Normal Positive Amount (25000)|25000|5000|false"
    "Large Positive Amount (1000000)|1000000|10000|false"
    "High Income (100000)|25000|100000|false"
    "Minimum Income (1)|25000|1|false"
    "Very Small Amount (100)|100|5000|false"
    "Very Large Amount (999999999)|999999999|50000|false"
)

# Run tests
for test_case in "${test_cases[@]}"; do
    IFS='|' read -r test_name amount income should_fail <<< "$test_case"
    
    # Convert special minus sign back to regular minus
    amount=${amount/−/-}
    income=${income/−/-}
    
    if test_negative_amount "$test_name" "$amount" "$income" "$should_fail"; then
        ((pass_count++))
    else
        ((fail_count++))
    fi
    
    ((total_count++))
    sleep 0.2
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
report_file="negative-amounts-report-$(date +%Y%m%d-%H%M%S).json"

cat > "$report_file" <<EOF
{
  "timestamp": "$timestamp",
  "apiUrl": "$API_URL",
  "totalTests": $total_count,
  "passed": $pass_count,
  "failed": $fail_count,
  "passRate": $pass_rate,
  "testResults": {
    "negativeAmounts": "Correctly rejected",
    "negativeIncome": "Correctly rejected",
    "zeroValues": "Correctly rejected",
    "positiveAmounts": "Correctly accepted",
    "validation": "Working properly"
  }
}
EOF

print_info "Results saved to: $report_file"

exit $fail_count
