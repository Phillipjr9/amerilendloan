# Sensitive Data Exposure Prevention Testing Guide

## Overview

This guide provides comprehensive instructions for testing the AmeriLend API to ensure **no sensitive information** (passwords, tokens, PII, secrets) is exposed in API responses or error messages.

## Quick Start

### Windows (PowerShell)
```powershell
powershell -ExecutionPolicy Bypass -File test-sensitive-data-endpoints.ps1
```

### Linux/macOS (Bash)
```bash
bash test-sensitive-data-endpoints.sh
```

### Node.js/TypeScript
```bash
# Run Vitest integration tests
pnpm test test-sensitive-data-api.ts

# Run security exposure tests
pnpm test test-sensitive-data-exposure.ts
```

### Python
```bash
python test-sensitive-data-scanner.py
```

## What's Being Tested

### 1. Password Protection (CRITICAL)
- ✅ No plaintext passwords in error messages
- ✅ No attempted passwords echoed in validation errors
- ✅ No old/previous passwords in responses
- ✅ No password hints or patterns exposed

**Example - BAD:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "providedPassword": "MyPassword123"  // ❌ EXPOSED
  }
}
```

**Example - GOOD:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"  // ✅ Generic message
  }
}
```

### 2. Token Protection (CRITICAL)
- ✅ No JWT tokens in responses
- ✅ No session IDs in error messages
- ✅ No API keys in logs or responses
- ✅ No OAuth tokens in callbacks

**Protected Tokens:**
- JWT tokens (eyJ...)
- Session IDs (app_session_id)
- Access/Refresh tokens
- API Keys (sk_*, AKIA*)

### 3. Personally Identifiable Information (CRITICAL)
- ✅ Full SSN masked: `***-**-6789` (show only last 4)
- ✅ Full bank account masked: `****6789`
- ✅ Full phone masked: `***-***-4567`
- ✅ Date of birth protected
- ✅ Driver license info hidden
- ✅ Credit card numbers masked

**Masking Examples:**
| Field | Bad | Good |
|-------|-----|------|
| SSN | 123-45-6789 | ***-**-6789 |
| Bank Account | 0123456789 | ****6789 |
| Phone | 555-123-4567 | ***-***-4567 |
| Credit Card | 4532-1111-2222-3333 | ****3333 |

### 4. Internal System Information (HIGH)
- ✅ No database connection strings
- ✅ No AWS/cloud credentials
- ✅ No stack traces in production
- ✅ No internal file paths
- ✅ No SQL queries in errors

### 5. Error Message Security (HIGH)
- ✅ Generic error messages to users
- ✅ No system details leaked
- ✅ No technical information exposed
- ✅ Sensitive field names protected

## Detailed Test Scenarios

### Authentication Endpoints

#### Test: Failed Login
**Endpoint:** `POST /api/trpc/auth.signInWithEmail`

**Payload:**
```json
{
  "email": "test@example.com",
  "password": "wrongpassword"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**What NOT to Expose:**
- ❌ Attempted password
- ❌ Whether email exists
- ❌ System details
- ❌ Database errors

---

#### Test: Duplicate Email Signup
**Endpoint:** `POST /api/trpc/auth.signUpWithEmail`

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_USER",
    "message": "Email already registered"
  }
}
```

**What NOT to Expose:**
- ❌ Full email address
- ❌ Previous user's details
- ❌ Account creation date
- ❌ Other user information

---

### User Profile Endpoints

#### Test: Get User Profile
**Endpoint:** `GET /api/trpc/auth.me`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "ssnMasked": "***-**-6789",
    "phoneMasked": "***-***-4567"
  }
}
```

**What NOT to Expose:**
- ❌ Full SSN: `123-45-6789`
- ❌ Full phone: `555-123-4567`
- ❌ Passwords
- ❌ Bank details
- ❌ Date of birth

---

#### Test: Bank Information
**Endpoint:** `GET /api/trpc/user.getBankInfo`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "bankName": "Example Bank",
    "accountNumberMasked": "****6789",
    "accountHolderName": "John Doe"
  }
}
```

**What NOT to Expose:**
- ❌ Full account number: `0123456789`
- ❌ Routing number details
- ❌ Account login information
- ❌ Previous transactions

---

### Payment Endpoints

#### Test: Payment Methods
**Endpoint:** `GET /api/trpc/payments.getPaymentMethods`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pm_123",
      "type": "CREDIT_CARD",
      "cardLastFour": "4567",
      "brand": "Visa"
    }
  ]
}
```

**What NOT to Expose:**
- ❌ Full card number: `4532-1111-2222-3333`
- ❌ CVV/CVC: `123`
- ❌ Expiration date
- ❌ Cardholder name
- ❌ Billing address

---

### Error Response Security

#### Test: Database Error
**Scenario:** Connection or query error

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Unable to process request. Please try again later."
  }
}
```

**What NOT to Expose:**
- ❌ Connection string: `postgresql://user:pass@localhost:5432/db`
- ❌ Query: `SELECT * FROM users WHERE email = ...`
- ❌ Error details: `FATAL: remaining connection slots reserved for non-replication superuser connections`
- ❌ Stack trace

---

#### Test: Validation Error
**Scenario:** Invalid form submission

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "missing_fields": ["password", "firstName"],
      "field_errors": {
        "password": ["Must be at least 8 characters"]
      }
    }
  }
}
```

**What NOT to Expose:**
- ❌ Actual provided values
- ❌ Full field-by-field input
- ❌ System validation logic
- ❌ Database column names

---

## Sensitive Data Patterns Detected

### Passwords
```regex
password["\']?\s*[:=]\s*["\'][^"\']*["\']
pwd["\']?\s*[:=]\s*["\'][^"\']*["\']
pass\s*[:=]\s*["\'][^"\']*["\']
```

### Tokens
```regex
eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+  # JWT
AKIA[0-9A-Z]{16}                                      # AWS Key
```

### PII
```regex
\d{3}-\d{2}-\d{4}                          # SSN
\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}     # Credit Card
```

### Internal Info
```regex
(postgresql|mysql|mongodb)://.*:.*@       # DB Connection
at\s+\w+\s+\([^)]*:\d+:\d+\)              # Stack Trace
```

## Test Execution Methods

### Method 1: PowerShell (Windows)
```powershell
# Set execution policy temporarily
powershell -ExecutionPolicy Bypass -File test-sensitive-data-endpoints.ps1

# Output locations
# - sensitive-data-test-results.txt (detailed results)
# - sensitive-data-test-log.txt (execution log)
```

### Method 2: Bash (Linux/macOS)
```bash
# Make script executable
chmod +x test-sensitive-data-endpoints.sh

# Run the tests
./test-sensitive-data-endpoints.sh

# Output locations
# - sensitive-data-test-results.txt
# - sensitive-data-test-log.txt
```

### Method 3: Node.js/Vitest
```bash
# Run integration tests
pnpm test test-sensitive-data-api.ts

# Run exposure prevention tests
pnpm test test-sensitive-data-exposure.ts

# Run with coverage
pnpm test -- --coverage test-sensitive-data*.ts
```

### Method 4: Python Scanner
```bash
# Run the scanner
python test-sensitive-data-scanner.py

# Output:
# - Standard output with colored results
# - Detailed findings report
# - JSON export of all findings
```

## Expected Results

### ✅ All Tests Pass When:
- No plaintext passwords in any response
- No JWT tokens exposed
- No full SSN/bank account numbers
- No database connection strings
- No stack traces in production
- No AWS credentials
- All error messages are generic and safe
- All PII is properly masked
- Validation errors don't echo input

### ❌ Tests Fail When:
- Password field contains actual password value
- JWT token appears in error message
- Full SSN format (XXX-XX-XXXX) detected
- Database connection string found
- Stack trace with file paths exposed
- AWS credentials visible
- Error includes system internals
- PII not masked properly

## Security Best Practices

### 1. Error Messages
✅ Do:
- Use generic error messages: "Invalid credentials"
- Don't include system details
- Return consistent error format
- Log detailed errors server-side

❌ Don't:
- "User with email test@example.com not found"
- "Database connection failed: connection timeout after 30000ms"
- "Stack trace: at processUser (db.ts:123:45)"

### 2. Response Data
✅ Do:
- Mask SSN: `***-**-6789`
- Show only last 4 of card: `****4567`
- Hide dob, driver license, etc.
- Return only necessary fields

❌ Don't:
- Include full SSN: `123-45-6789`
- Include full card number
- Include dob in responses
- Include "password" field

### 3. Logging
✅ Do:
- Log errors with codes only
- Omit passwords and tokens
- Use structured logging
- Mask PII in logs

❌ Don't:
- Log request bodies with passwords
- Include tokens in error logs
- Store PII in logs
- Include stack traces with paths

### 4. Status Codes
✅ Do:
- Use appropriate HTTP status codes
- 400 for validation errors
- 401 for auth failures
- 403 for forbidden
- 500 for server errors

❌ Don't:
- Return 200 with error details
- Include detailed error codes
- Expose internal error codes

## Security Headers

Recommended additional headers for API responses:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Compliance

This testing suite helps ensure compliance with:
- ✅ **OWASP**: Sensitive Data Exposure (A3:2021)
- ✅ **PCI-DSS**: Payment card data protection
- ✅ **GDPR**: Personal data protection
- ✅ **CCPA**: Consumer privacy rights
- ✅ **SOC 2**: Information security controls

## Troubleshooting

### Issue: Tests show connection failures
**Solution:** Ensure API is running and accessible
```bash
curl https://www.amerilendloan.com/api/trpc/system.health
```

### Issue: False positives in regex patterns
**Solution:** Review specific matches in detailed logs
```bash
grep -n "FAIL" sensitive-data-test-log.txt
```

### Issue: Masked data appears as raw data
**Solution:** Check if response transformation is applied
```bash
jq '.data.ssnMasked' response.json
```

## Next Steps

1. **Run all tests** to establish baseline
2. **Review failures** and fix exposed data
3. **Add to CI/CD** pipeline for continuous monitoring
4. **Schedule regular runs** (weekly/monthly)
5. **Monitor logs** for suspicious patterns
6. **Update tests** as new endpoints are added

## Support

For issues or questions:
- Review individual test details in log files
- Check OWASP Sensitive Data Exposure guidelines
- Consult security team for compliance questions
- Report vulnerabilities responsibly

---

**Last Updated:** November 20, 2025
**Version:** 1.0
**Test Files:** 4 (Vitest + PowerShell + Bash + Python)
