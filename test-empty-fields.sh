#!/bin/bash

# Empty Fields Validation Test Suite - Bash
# Tests API rejection of loan applications with empty or missing fields
# Validates all required field validation and error handling
# 
# Usage: ./test-empty-fields.sh [API_URL]
# Example: ./test-empty-fields.sh "http://localhost:3000/api/trpc/loans.submit"

API_URL="${1:-http://localhost:3000/api/trpc/loans.submit}"
GENERATE_REPORT="${2:-true}"

# ANSI Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Results array
declare -a TEST_RESULTS

function print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

function print_error() {
    echo -e "${RED}✗ $1${NC}"
}

function print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

function print_test_header() {
    echo -e "\n${BLUE}$1${NC}"
}

function print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Base valid application data (JSON)
BASE_VALID_APP='{
  "fullName": "John Doe",
  "email": "test-'"$(date +%s)"'@example.com",
  "phone": "5551234567",
  "password": "SecurePass123!",
  "dateOfBirth": "1990-05-15",
  "ssn": "123-45-6789",
  "street": "123 Main Street",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "employmentStatus": "employed",
  "employer": "Tech Company Inc",
  "monthlyIncome": 5000,
  "loanType": "installment",
  "requestedAmount": 25000,
  "loanPurpose": "Home improvement and renovation",
  "disbursementMethod": "bank_transfer"
}'

function test_empty_field() {
    local test_name="$1"
    local app_json="$2"
    local should_fail="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Send request and capture response and status code
    local http_response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$app_json" \
        "$API_URL" 2>/dev/null)
    
    # Split response and status code
    local http_status=$(echo "$http_response" | tail -n1)
    local response_body=$(echo "$http_response" | sed '$d')
    
    if [ -z "$http_status" ]; then
        print_error "$test_name - Connection failed"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("{\"test\":\"$test_name\",\"expected\":\"Connection\",\"actual\":\"Failed\",\"status\":\"FAILED\"}")
        return
    fi
    
    if [ "$should_fail" = true ]; then
        if [ "$http_status" = "400" ]; then
            print_success "$test_name - Correctly rejected"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            TEST_RESULTS+=("{\"test\":\"$test_name\",\"expected\":\"400\",\"actual\":\"$http_status\",\"status\":\"PASSED\"}")
        else
            print_error "$test_name - Got status $http_status instead of 400"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            TEST_RESULTS+=("{\"test\":\"$test_name\",\"expected\":\"400\",\"actual\":\"$http_status\",\"status\":\"FAILED\"}")
        fi
    else
        if [[ "$http_status" =~ ^(200|201)$ ]]; then
            print_success "$test_name - Correctly accepted"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            TEST_RESULTS+=("{\"test\":\"$test_name\",\"expected\":\"200\",\"actual\":\"$http_status\",\"status\":\"PASSED\"}")
        else
            print_error "$test_name - Got status $http_status instead of 200"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            TEST_RESULTS+=("{\"test\":\"$test_name\",\"expected\":\"200\",\"actual\":\"$http_status\",\"status\":\"FAILED\"}")
        fi
    fi
}

function create_app_json() {
    local json="$BASE_VALID_APP"
    local key="$1"
    local value="$2"
    
    if [ "$value" = "null" ]; then
        echo "$json" | jq ".$key = null"
    elif [ -z "$value" ]; then
        echo "$json" | jq ".$key = \"\""
    else
        echo "$json" | jq ".$key = \"$value\""
    fi
}

# =============================================================================
# Test Suite 1: Completely Empty Application
# =============================================================================
print_test_header "Test Suite 1: Completely Empty Application"
test_empty_field "Empty Object" "{}" true

# =============================================================================
# Test Suite 2: Individual Empty Fields
# =============================================================================
print_test_header "Test Suite 2: Individual Empty Fields"

test_empty_field "Empty fullName" "$(create_app_json fullName "")" true
test_empty_field "Empty email" "$(create_app_json email "")" true
test_empty_field "Empty phone" "$(create_app_json phone "")" true
test_empty_field "Empty password" "$(create_app_json password "")" true
test_empty_field "Empty dateOfBirth" "$(create_app_json dateOfBirth "")" true
test_empty_field "Empty ssn" "$(create_app_json ssn "")" true
test_empty_field "Empty street" "$(create_app_json street "")" true
test_empty_field "Empty city" "$(create_app_json city "")" true
test_empty_field "Empty state" "$(create_app_json state "")" true
test_empty_field "Empty zipCode" "$(create_app_json zipCode "")" true
test_empty_field "Empty loanPurpose" "$(create_app_json loanPurpose "")" true

# =============================================================================
# Test Suite 3: Missing Required Fields
# =============================================================================
print_test_header "Test Suite 3: Missing Required Fields"

# Missing fullName
test_empty_field "Missing fullName" "$(echo "$BASE_VALID_APP" | jq 'del(.fullName)')" true

# Missing email
test_empty_field "Missing email" "$(echo "$BASE_VALID_APP" | jq 'del(.email)')" true

# Missing phone
test_empty_field "Missing phone" "$(echo "$BASE_VALID_APP" | jq 'del(.phone)')" true

# Missing password
test_empty_field "Missing password" "$(echo "$BASE_VALID_APP" | jq 'del(.password)')" true

# Missing dateOfBirth
test_empty_field "Missing dateOfBirth" "$(echo "$BASE_VALID_APP" | jq 'del(.dateOfBirth)')" true

# Missing ssn
test_empty_field "Missing ssn" "$(echo "$BASE_VALID_APP" | jq 'del(.ssn)')" true

# Missing street
test_empty_field "Missing street" "$(echo "$BASE_VALID_APP" | jq 'del(.street)')" true

# Missing city
test_empty_field "Missing city" "$(echo "$BASE_VALID_APP" | jq 'del(.city)')" true

# Missing state
test_empty_field "Missing state" "$(echo "$BASE_VALID_APP" | jq 'del(.state)')" true

# Missing zipCode
test_empty_field "Missing zipCode" "$(echo "$BASE_VALID_APP" | jq 'del(.zipCode)')" true

# Missing employmentStatus
test_empty_field "Missing employmentStatus" "$(echo "$BASE_VALID_APP" | jq 'del(.employmentStatus)')" true

# Missing monthlyIncome
test_empty_field "Missing monthlyIncome" "$(echo "$BASE_VALID_APP" | jq 'del(.monthlyIncome)')" true

# Missing loanType
test_empty_field "Missing loanType" "$(echo "$BASE_VALID_APP" | jq 'del(.loanType)')" true

# Missing requestedAmount
test_empty_field "Missing requestedAmount" "$(echo "$BASE_VALID_APP" | jq 'del(.requestedAmount)')" true

# Missing loanPurpose
test_empty_field "Missing loanPurpose" "$(echo "$BASE_VALID_APP" | jq 'del(.loanPurpose)')" true

# Missing disbursementMethod
test_empty_field "Missing disbursementMethod" "$(echo "$BASE_VALID_APP" | jq 'del(.disbursementMethod)')" true

# =============================================================================
# Test Suite 4: Whitespace and Null Values
# =============================================================================
print_test_header "Test Suite 4: Whitespace and Null Values"

test_empty_field "Whitespace-only fullName" "$(create_app_json fullName "   ")" true
test_empty_field "Null fullName" "$(create_app_json fullName "null")" true
test_empty_field "Null email" "$(create_app_json email "null")" true
test_empty_field "Null phone" "$(create_app_json phone "null")" true

# =============================================================================
# Test Suite 5: Invalid Format Tests
# =============================================================================
print_test_header "Test Suite 5: Invalid Format Tests"

test_empty_field "Invalid email format" "$(create_app_json email "not-an-email")" true
test_empty_field "Email without @" "$(create_app_json email "invalidemail.com")" true
test_empty_field "Phone too short" "$(create_app_json phone "555123")" true
test_empty_field "Password too short" "$(create_app_json password "short")" true
test_empty_field "Invalid dateOfBirth format" "$(create_app_json dateOfBirth "05/15/1990")" true
test_empty_field "Invalid SSN format" "$(create_app_json ssn "12345678")" true
test_empty_field "Invalid state (too long)" "$(create_app_json state "ILL")" true
test_empty_field "Invalid state (too short)" "$(create_app_json state "I")" true
test_empty_field "ZipCode too short" "$(create_app_json zipCode "123")" true
test_empty_field "LoanPurpose too short" "$(create_app_json loanPurpose "short")" true
test_empty_field "Invalid employmentStatus enum" "$(create_app_json employmentStatus "invalid_status")" true
test_empty_field "Invalid loanType enum" "$(create_app_json loanType "invalid_type")" true
test_empty_field "Invalid disbursementMethod enum" "$(create_app_json disbursementMethod "invalid_method")" true

# =============================================================================
# Test Suite 6: Valid Application Control Test
# =============================================================================
print_test_header "Test Suite 6: Valid Application Control Test"
test_empty_field "Valid complete application" "$BASE_VALID_APP" false

# =============================================================================
# Results Summary
# =============================================================================
print_test_header "Test Results Summary"

if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
else
    PASS_RATE=0
fi

print_info "Total Tests: $TOTAL_TESTS"
print_success "Passed: $PASSED_TESTS"
print_error "Failed: $FAILED_TESTS"
print_info "Pass Rate: $PASS_RATE%"

# Generate JSON report if requested
if [ "$GENERATE_REPORT" = "true" ] || [ "$GENERATE_REPORT" = "1" ]; then
    TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S")
    REPORT_FILE="empty-fields-test-report-$(date +%Y%m%d-%H%M%S).json"
    
    # Build results array JSON
    RESULTS_JSON="["
    first=true
    for result in "${TEST_RESULTS[@]}"; do
        if [ "$first" = true ]; then
            RESULTS_JSON="$RESULTS_JSON$result"
            first=false
        else
            RESULTS_JSON="$RESULTS_JSON,$result"
        fi
    done
    RESULTS_JSON="$RESULTS_JSON]"
    
    # Create complete report
    REPORT="{
  \"timestamp\": \"$TIMESTAMP\",
  \"apiUrl\": \"$API_URL\",
  \"totalTests\": $TOTAL_TESTS,
  \"passed\": $PASSED_TESTS,
  \"failed\": $FAILED_TESTS,
  \"passRate\": $PASS_RATE,
  \"results\": $RESULTS_JSON
}"
    
    echo "$REPORT" > "$REPORT_FILE"
    print_info "Report saved to: $REPORT_FILE"
fi

# Exit with appropriate code
if [ $FAILED_TESTS -eq 0 ]; then
    exit 0
else
    exit 1
fi
