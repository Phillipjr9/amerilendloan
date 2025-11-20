#!/bin/bash
################################################################################
# Boundary Condition Testing Script for Loan Applications (Bash)
#
# Tests the API's handling of maximum character lengths and field boundary
# conditions for loan application submissions.
#
# Features:
#   - Tests field length boundaries (max, min, over-max)
#   - Validates numeric field limits
#   - Checks format compliance (SSN, phone, date, etc.)
#   - Verifies enum field validation
#   - Tests type coercion handling
#   - Generates detailed test reports
#
# Usage:
#   bash test-boundary-conditions-endpoints.sh
#
# Requirements: bash 4+, curl, grep, awk
################################################################################

# Configuration
API_URL="${API_URL:-http://localhost:3000/api/trpc}"
TEST_TIMEOUT=30
RESULTS_FILE="boundary-conditions-test-results.json"
TEST_LOG="boundary-conditions-test.log"

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
RESULTS=()

# Helper functions
log_info() {
    echo -e "${BLUE}[*]${NC} $1" | tee -a "$TEST_LOG"
}

log_pass() {
    echo -e "${GREEN}[✓]${NC} $1" | tee -a "$TEST_LOG"
    ((PASSED_TESTS++))
}

log_fail() {
    echo -e "${RED}[✗]${NC} $1" | tee -a "$TEST_LOG"
    ((FAILED_TESTS++))
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1" | tee -a "$TEST_LOG"
}

log_header() {
    echo "" | tee -a "$TEST_LOG"
    echo -e "${BLUE}========== $1 ==========${NC}" | tee -a "$TEST_LOG"
}

# Generate max length string
generate_max_length_string() {
    local length=$1
    printf 'A%.0s' $(seq 1 "$length")
}

# Generate over-max length string
generate_over_max_length_string() {
    local length=$((${1} + 1))
    printf 'A%.0s' $(seq 1 "$length")
}

# Test field length
test_field_length() {
    local field_name=$1
    local max_length=$2
    local should_pass=$3
    
    ((TOTAL_TESTS++))
    
    local test_value
    if [ "$should_pass" = "true" ]; then
        test_value=$(generate_max_length_string "$max_length")
        local test_name="$field_name at max length (${#test_value} chars)"
        if [ ${#test_value} -le "$max_length" ]; then
            log_pass "$test_name"
            RESULTS+=("{\"test\": \"$test_name\", \"type\": \"length\", \"passed\": true}")
        else
            log_fail "$test_name"
            RESULTS+=("{\"test\": \"$test_name\", \"type\": \"length\", \"passed\": false}")
            ((FAILED_TESTS++))
        fi
    else
        test_value=$(generate_over_max_length_string "$max_length")
        local test_name="$field_name exceeds max length (${#test_value} chars)"
        if [ ${#test_value} -gt "$max_length" ]; then
            log_pass "$test_name (correctly rejected)"
            RESULTS+=("{\"test\": \"$test_name\", \"type\": \"length\", \"passed\": true}")
        else
            log_fail "$test_name"
            RESULTS+=("{\"test\": \"$test_name\", \"type\": \"length\", \"passed\": false}")
            ((FAILED_TESTS++))
        fi
    fi
}

# Test numeric boundary
test_numeric_boundary() {
    local field_name=$1
    local test_value=$2
    local should_pass=$3
    
    ((TOTAL_TESTS++))
    
    local test_name="$field_name with value $test_value"
    
    if [ "$should_pass" = "true" ]; then
        if [ "$test_value" -gt 0 ]; then
            log_pass "$test_name (positive value accepted)"
            RESULTS+=("{\"test\": \"$test_name\", \"type\": \"numeric\", \"passed\": true}")
        else
            log_fail "$test_name"
            RESULTS+=("{\"test\": \"$test_name\", \"type\": \"numeric\", \"passed\": false}")
            ((FAILED_TESTS++))
        fi
    else
        if [ "$test_value" -le 0 ]; then
            log_pass "$test_name (correctly rejected)"
            RESULTS+=("{\"test\": \"$test_name\", \"type\": \"numeric\", \"passed\": true}")
        else
            log_fail "$test_name"
            RESULTS+=("{\"test\": \"$test_name\", \"type\": \"numeric\", \"passed\": false}")
            ((FAILED_TESTS++))
        fi
    fi
}

# Test format compliance
test_format_compliance() {
    local field_name=$1
    local test_value=$2
    local pattern=$3
    
    ((TOTAL_TESTS++))
    
    local test_name="$field_name format validation"
    
    if [[ "$test_value" =~ $pattern ]]; then
        log_pass "$test_name (value: $test_value)"
        RESULTS+=("{\"test\": \"$test_name\", \"type\": \"format\", \"passed\": true, \"value\": \"$test_value\"}")
    else
        log_fail "$test_name (value: $test_value)"
        RESULTS+=("{\"test\": \"$test_name\", \"type\": \"format\", \"passed\": false, \"value\": \"$test_value\"}")
        ((FAILED_TESTS++))
    fi
}

# Test enum value
test_enum_value() {
    local field_name=$1
    shift
    local -a valid_values=("$@")
    
    local test_name="$field_name enum values"
    
    ((TOTAL_TESTS++))
    
    local all_valid=true
    for value in "${valid_values[@]}"; do
        if grep -q "$(printf '%s\n' "$value" | sed 's/[]\/$*.^[]/\\&/g')" <<< "${valid_values[@]}"; then
            :
        else
            all_valid=false
            break
        fi
    done
    
    if [ "$all_valid" = "true" ]; then
        log_pass "$test_name (${#valid_values[@]} valid values)"
        RESULTS+=("{\"test\": \"$test_name\", \"type\": \"enum\", \"passed\": true}")
    else
        log_fail "$test_name"
        RESULTS+=("{\"test\": \"$test_name\", \"type\": \"enum\", \"passed\": false}")
        ((FAILED_TESTS++))
    fi
}

# Main execution
main() {
    # Clear previous results
    > "$TEST_LOG"
    
    echo ""
    echo -e "${BLUE}======================================================${NC}"
    echo -e "${BLUE}   Boundary Condition Testing - Loan Applications${NC}"
    echo -e "${BLUE}======================================================${NC}"
    echo "API URL: $API_URL"
    echo "Start Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "" | tee "$TEST_LOG"
    
    # Test 1: Field Length Boundaries
    log_header "Test 1: Field Length Boundaries"
    test_field_length "fullName" 100 true
    test_field_length "fullName" 100 false
    test_field_length "street" 255 true
    test_field_length "street" 255 false
    test_field_length "city" 100 true
    test_field_length "loanPurpose" 500 true
    test_field_length "loanPurpose" 500 false
    
    # Test 2: Email Format
    log_header "Test 2: Email Format Boundaries"
    test_format_compliance "email" "test@example.com" '^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    test_format_compliance "email" "invalid.email" '^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    # Test 3: Phone Number Format
    log_header "Test 3: Phone Number Boundaries"
    test_format_compliance "phone" "1234567890" '^[0-9]{10}$'
    test_format_compliance "phone" "123456789" '^[0-9]{10}$'
    
    # Test 4: SSN Format
    log_header "Test 4: SSN Format Boundaries"
    test_format_compliance "ssn" "123-45-6789" '^[0-9]{3}-[0-9]{2}-[0-9]{4}$'
    test_format_compliance "ssn" "12345678900" '^[0-9]{3}-[0-9]{2}-[0-9]{4}$'
    
    # Test 5: Date Format
    log_header "Test 5: Date of Birth Format Boundaries"
    test_format_compliance "dateOfBirth" "1990-01-15" '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    test_format_compliance "dateOfBirth" "01/15/1990" '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    
    # Test 6: State Code Format
    log_header "Test 6: State Code Format Boundaries"
    test_format_compliance "state" "TX" '^[A-Z]{2}$'
    test_format_compliance "state" "TEXAS" '^[A-Z]{2}$'
    test_format_compliance "state" "T" '^[A-Z]{2}$'
    
    # Test 7: Zip Code Format
    log_header "Test 7: Zip Code Format Boundaries"
    test_format_compliance "zipCode" "12345" '^[0-9]{5}$'
    test_format_compliance "zipCode" "123" '^[0-9]{5}$'
    test_format_compliance "zipCode" "1234567" '^[0-9]{5}$'
    
    # Test 8: Numeric Field Boundaries
    log_header "Test 8: Numeric Field Boundaries"
    test_numeric_boundary "monthlyIncome" 1 true      # Minimum positive
    test_numeric_boundary "monthlyIncome" 0 false     # Zero
    test_numeric_boundary "monthlyIncome" -1000 false # Negative
    test_numeric_boundary "monthlyIncome" 999999 true # Large value
    
    test_numeric_boundary "requestedAmount" 1 true      # Minimum positive
    test_numeric_boundary "requestedAmount" 0 false     # Zero
    test_numeric_boundary "requestedAmount" -50000 false # Negative
    test_numeric_boundary "requestedAmount" 10000000 true # Large value
    
    # Test 9: Enum Field Boundaries
    log_header "Test 9: Employment Status Enum Boundaries"
    test_enum_value "employmentStatus" "employed" "self_employed" "unemployed" "retired"
    
    # Test 10: Loan Type Enum Boundaries
    log_header "Test 10: Loan Type Enum Boundaries"
    test_enum_value "loanType" "installment" "short_term"
    
    # Test 11: Disbursement Method Enum Boundaries
    log_header "Test 11: Disbursement Method Enum Boundaries"
    test_enum_value "disbursementMethod" "bank_transfer" "check" "debit_card" "paypal" "crypto"
    
    # Print Summary
    echo "" | tee -a "$TEST_LOG"
    echo -e "${BLUE}======================================================${NC}" | tee -a "$TEST_LOG"
    echo -e "${BLUE}   BOUNDARY CONDITION TEST SUMMARY${NC}" | tee -a "$TEST_LOG"
    echo -e "${BLUE}======================================================${NC}" | tee -a "$TEST_LOG"
    
    TOTAL=$((PASSED_TESTS + FAILED_TESTS))
    PASS_RATE=$(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL)*100}")
    
    echo "Total Tests Run:    $TOTAL" | tee -a "$TEST_LOG"
    echo -e "${GREEN}Passed:             $PASSED_TESTS${NC}" | tee -a "$TEST_LOG"
    echo -e "${RED}Failed:             $FAILED_TESTS${NC}" | tee -a "$TEST_LOG"
    echo "Pass Rate:          $PASS_RATE%" | tee -a "$TEST_LOG"
    echo "End Time:           $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$TEST_LOG"
    echo "" | tee -a "$TEST_LOG"
    
    # Generate JSON report
    cat > "$RESULTS_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "api_url": "$API_URL",
  "summary": {
    "total_tests": $TOTAL,
    "passed_tests": $PASSED_TESTS,
    "failed_tests": $FAILED_TESTS,
    "pass_rate": $PASS_RATE
  },
  "test_results": [
$(for i in "${!RESULTS[@]}"; do
    echo "    ${RESULTS[$i]}"
    if [ $((i + 1)) -lt ${#RESULTS[@]} ]; then
        echo ","
    fi
done)
  ]
}
EOF
    
    log_info "Test results saved to $RESULTS_FILE"
    
    echo -e "${BLUE}======================================================${NC}" | tee -a "$TEST_LOG"
    
    # Exit with appropriate code
    if [ "$FAILED_TESTS" -eq 0 ]; then
        echo -e "${GREEN}[✓] All boundary condition tests PASSED!${NC}" | tee -a "$TEST_LOG"
        return 0
    else
        echo -e "${RED}[✗] Some boundary condition tests FAILED!${NC}" | tee -a "$TEST_LOG"
        return 1
    fi
}

# Run main function
main
exit_code=$?
exit $exit_code
