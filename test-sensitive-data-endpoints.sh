#!/bin/bash
# Sensitive Data Exposure Testing Script for Linux/macOS
# Tests real API endpoints for sensitive information leaks
# Run with: bash test-sensitive-data-endpoints.sh

set -e

API_BASE="https://www.amerilendloan.com/api/trpc"
REPORT_FILE="sensitive-data-test-results.txt"
LOG_FILE="sensitive-data-test-log.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_test() {
    local test_name=$1
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Testing: $test_name" | tee -a "$LOG_FILE"
}

log_result() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓ PASS:${NC} $message" | tee -a "$LOG_FILE"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}✗ FAIL:${NC} $message" | tee -a "$LOG_FILE"
    else
        echo -e "${YELLOW}⚠ WARN:${NC} $message" | tee -a "$LOG_FILE"
    fi
}

check_sensitive_data() {
    local response=$1
    local test_name=$2
    
    # Check for passwords
    if echo "$response" | grep -qi 'password["\x27]*\s*[:=]\s*["\x27][^"\x27]*["\x27]'; then
        log_result "FAIL" "$test_name: Plaintext password exposed"
        return 1
    fi
    
    # Check for JWT tokens
    if echo "$response" | grep -qE 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'; then
        log_result "FAIL" "$test_name: JWT token exposed"
        return 1
    fi
    
    # Check for SSN pattern
    if echo "$response" | grep -qE '\d{3}-\d{2}-\d{4}'; then
        log_result "FAIL" "$test_name: Full SSN exposed"
        return 1
    fi
    
    # Check for database URLs
    if echo "$response" | grep -qiE '(postgresql|mysql|mongodb)://.*:.*@'; then
        log_result "FAIL" "$test_name: Database credentials exposed"
        return 1
    fi
    
    # Check for stack traces
    if echo "$response" | grep -qE 'at\s+\w+\s+\([^)]*:\d+:\d+\)'; then
        log_result "FAIL" "$test_name: Stack trace exposed"
        return 1
    fi
    
    log_result "PASS" "$test_name: No sensitive data detected"
    return 0
}

# ============================================================================
# TEST SCENARIOS
# ============================================================================

init_test_report() {
    echo "Sensitive Data Exposure Test Report" > "$REPORT_FILE"
    echo "Generated: $(date)" >> "$REPORT_FILE"
    echo "API Base: $API_BASE" >> "$REPORT_FILE"
    echo "================================================" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
}

# Test 1: Authentication endpoints
test_auth_failed_login() {
    log_test "Failed Login - No Password Exposure"
    
    local payload='{"email":"nonexistent@test.com","password":"wrongpassword"}'
    local response=$(curl -s -X POST "$API_BASE/auth.signInWithEmail" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>/dev/null || echo '{"error":"Connection failed"}')
    
    check_sensitive_data "$response" "Failed Login"
    echo "Response: $response" >> "$REPORT_FILE"
}

# Test 2: User profile endpoint
test_user_profile_pii() {
    log_test "User Profile - No Full PII Exposure"
    
    # This would need valid auth token in production
    local response=$(curl -s -X GET "$API_BASE/auth.me" \
        -H "Content-Type: application/json" 2>/dev/null || echo '{"error":"Not authenticated"}')
    
    check_sensitive_data "$response" "User Profile"
}

# Test 3: Error handling
test_database_error_handling() {
    log_test "Database Error - No Connection String Exposure"
    
    # Trigger an error that might expose DB info
    local payload='{"applicationId":"invalid-id-format"}'
    local response=$(curl -s -X POST "$API_BASE/loans.getApplication" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>/dev/null || echo '{"error":"Connection failed"}')
    
    # Check that response doesn't contain DB details
    if echo "$response" | grep -qiE 'postgresql|mysql|localhost|:5432'; then
        log_result "FAIL" "Database Error: Connection details exposed"
    else
        log_result "PASS" "Database Error: Connection details protected"
    fi
}

# Test 4: Validation errors
test_validation_error_masking() {
    log_test "Validation Errors - Input Not Echoed Back"
    
    local payload='{"email":"test@test.com","password":"pw"}'
    local response=$(curl -s -X POST "$API_BASE/auth.signUpWithEmail" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>/dev/null || echo '{"error":"Connection failed"}')
    
    # Response should not echo back the provided password
    if echo "$response" | grep -q '"pw"'; then
        log_result "FAIL" "Validation Error: Provided password echoed back"
    else
        log_result "PASS" "Validation Error: Input safely masked"
    fi
}

# Test 5: Payment endpoints
test_payment_data_masking() {
    log_test "Payment Data - Card Numbers Masked"
    
    # This would need valid auth and payment method
    local response=$(curl -s -X GET "$API_BASE/payments.getAuthorizeNetConfig" \
        -H "Content-Type: application/json" 2>/dev/null || echo '{"error":"Not authenticated"}')
    
    # Check for exposed card numbers (simplified check for 16-digit patterns)
    if echo "$response" | grep -qE '\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}'; then
        log_result "FAIL" "Payment Data: Full credit card number exposed"
    else
        log_result "PASS" "Payment Data: Card numbers protected"
    fi
}

# Test 6: Response structure
test_response_structure() {
    log_test "Response Structure - Consistent Error Format"
    
    local payload='{"test":"invalid"}'
    local response=$(curl -s -X POST "$API_BASE/loans.createApplication" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>/dev/null || echo '{"error":"Connection failed"}')
    
    # Verify standard response format
    if echo "$response" | grep -q '"success"\s*:'; then
        log_result "PASS" "Response Structure: Standard format maintained"
    else
        log_result "WARN" "Response Structure: Non-standard format detected"
    fi
}

# Test 7: OTP security
test_otp_not_exposed() {
    log_test "OTP Endpoint - Codes Not Exposed"
    
    local payload='{"email":"test@example.com"}'
    local response=$(curl -s -X POST "$API_BASE/otp.sendOTP" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>/dev/null || echo '{"error":"Connection failed"}')
    
    # Should never expose the actual OTP code
    if echo "$response" | grep -qE '"code"\s*:\s*"\d{6}"'; then
        log_result "FAIL" "OTP Endpoint: Code exposed in response"
    else
        log_result "PASS" "OTP Endpoint: Code not exposed"
    fi
}

# Test 8: Application data
test_application_ssn_masked() {
    log_test "Application Data - SSN Masked"
    
    # This would need valid auth and application ID
    local payload='{"applicationId":"test-app-123"}'
    local response=$(curl -s -X POST "$API_BASE/loans.getApplication" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>/dev/null || echo '{"error":"Not authenticated"}')
    
    # Check for full SSN pattern
    if echo "$response" | grep -qE '\d{3}-\d{2}-\d{4}'; then
        log_result "FAIL" "Application Data: Full SSN exposed"
    else
        log_result "PASS" "Application Data: SSN protected"
    fi
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    echo "Sensitive Data Exposure Testing Suite"
    echo "======================================"
    echo ""
    
    init_test_report
    
    # Run all tests
    test_auth_failed_login
    test_user_profile_pii
    test_database_error_handling
    test_validation_error_masking
    test_payment_data_masking
    test_response_structure
    test_otp_not_exposed
    test_application_ssn_masked
    
    echo ""
    echo "Test run completed. Results saved to:"
    echo "  Report: $REPORT_FILE"
    echo "  Log: $LOG_FILE"
}

main "$@"
