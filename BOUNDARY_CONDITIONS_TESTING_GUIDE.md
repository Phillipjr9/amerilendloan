## Boundary Condition Testing Guide for Loan Applications

**Version:** 1.0.0  
**Date:** November 20, 2025  
**Status:** Complete

---

## Table of Contents

1. [Overview](#overview)
2. [What Are Boundary Conditions?](#what-are-boundary-conditions)
3. [Test Scenarios](#test-scenarios)
4. [Implementation Details](#implementation-details)
5. [Quick Start Guide](#quick-start-guide)
6. [Test Coverage](#test-coverage)
7. [Expected Results](#expected-results)
8. [Interpreting Results](#interpreting-results)
9. [Common Issues](#common-issues)
10. [Best Practices](#best-practices)
11. [Compliance Standards](#compliance-standards)

---

## Overview

Boundary condition testing ensures that an API correctly handles edge cases and extreme input values. This testing suite validates that the loan application API:

- **Enforces field length limits** - Accepts data at maximum length, rejects over-length data
- **Validates numeric limits** - Accepts valid ranges, rejects zero/negative values
- **Checks format compliance** - Validates SSN, phone, date, state, zip code formats
- **Handles enum constraints** - Validates allowed enum values
- **Type checks input** - Rejects incorrect data types
- **Stores data correctly** - Verifies maximum length values persist in database
- **Handles Unicode** - Supports international characters within limits

This comprehensive guide explains each test scenario and how to interpret results.

---

## What Are Boundary Conditions?

Boundary conditions are the edge cases at the limits of acceptable input. They test:

1. **Minimum Boundaries** - Smallest valid input (e.g., password: 8 characters minimum)
2. **Maximum Boundaries** - Largest valid input (e.g., full name: 100 characters maximum)
3. **Just-Beyond Boundaries** - One over maximum (e.g., 101 characters for 100-max field)
4. **Off-By-One Errors** - Common programming mistakes at exact boundaries
5. **Format Edges** - Valid vs. invalid format variations
6. **Type Mismatches** - Wrong data type handling

---

## Test Scenarios

### 1. String Field Length Tests

#### Full Name Field
- **Maximum**: 100 characters
- **Minimum**: 1 character
- **Test Cases**:
  - Accept exactly 100 characters ✓
  - Reject 101 characters ✗
  - Accept 1 character ✓

```typescript
// Valid: 100 chars (passes)
const fullName = 'A'.repeat(100);

// Invalid: 101 chars (fails)
const fullName = 'A'.repeat(101);
```

#### Street Address Field
- **Maximum**: 255 characters
- **Minimum**: 1 character
- **Test Cases**:
  - Accept exactly 255 characters ✓
  - Reject 256 characters ✗

#### City Field
- **Maximum**: 100 characters
- **Minimum**: 1 character
- **Test Cases**:
  - Accept exactly 100 characters ✓
  - Reject 101 characters ✗

#### Loan Purpose Field
- **Maximum**: 500 characters
- **Minimum**: 10 characters
- **Test Cases**:
  - Accept exactly 500 characters ✓
  - Reject 501 characters ✗
  - Accept exactly 10 characters ✓
  - Reject 9 characters ✗

```typescript
// Valid: At minimum
const loanPurpose = 'A'.repeat(10); // "AAAAAAAAAA"

// Invalid: Below minimum
const loanPurpose = 'Short'; // Only 5 characters

// Valid: At maximum
const loanPurpose = 'A'.repeat(500);

// Invalid: Over maximum
const loanPurpose = 'A'.repeat(501);
```

### 2. Email Field Tests

#### Email Format Validation
- **Required**: Contains @ symbol and domain
- **Test Cases**:
  - Valid: `test@example.com` ✓
  - Valid: `user.name@sub.domain.co.uk` ✓
  - Invalid: `notanemail.com` ✗
  - Invalid: `user@` ✗
  - Invalid: `@example.com` ✗

```typescript
// Valid patterns
'john.doe@example.com'
'test.email+tag@example.co.uk'

// Invalid patterns
'notanemail'
'john@'
'@example.com'
```

### 3. Phone Number Tests

#### Phone Number Format
- **Required**: Exactly 10 digits
- **Test Cases**:
  - Accept: `1234567890` ✓
  - Reject: `123456789` ✗ (9 digits)
  - Reject: `12345678901` ✗ (11 digits)
  - Reject: `123-456-7890` ✗ (contains dashes)

```typescript
// Valid
'5551234567'

// Invalid
'555-123-4567'  // Contains dashes
'123456789'     // Too short
'12345678901'   // Too long
```

### 4. SSN Format Tests

#### Social Security Number Format
- **Required**: XXX-XX-XXXX format with dashes
- **Test Cases**:
  - Accept: `123-45-6789` ✓
  - Reject: `12345678900` ✗ (no dashes)
  - Reject: `123-45-678` ✗ (incomplete)
  - Reject: `123456789` ✗ (wrong format)

```typescript
// Valid
'123-45-6789'

// Invalid
'12345678900'   // Missing dashes
'123-456-789'   // Wrong dash positions
'123 45 6789'   // Spaces instead of dashes
```

### 5. Date of Birth Format Tests

#### Date Format
- **Required**: YYYY-MM-DD format
- **Test Cases**:
  - Accept: `1990-01-15` ✓
  - Reject: `01/15/1990` ✗ (MM/DD/YYYY format)
  - Reject: `1990/01/15` ✗ (slashes instead of dashes)
  - Reject: `15-01-1990` ✗ (DD-MM-YYYY format)

```typescript
// Valid
'1990-01-15'

// Invalid
'01/15/1990'    // Wrong format
'1990/01/15'    // Wrong separator
'15-01-1990'    // Wrong order
```

### 6. State Code Tests

#### State Code Format
- **Required**: Exactly 2 uppercase letters
- **Test Cases**:
  - Accept: `TX` ✓
  - Accept: `CA` ✓
  - Reject: `TEXAS` ✗ (too long)
  - Reject: `T` ✗ (too short)
  - Reject: `tx` ✗ (lowercase)

```typescript
// Valid
'TX'
'CA'
'FL'

// Invalid
'TEXAS'         // Too long
'T'             // Too short
'tx'            // Not uppercase
```

### 7. Zip Code Tests

#### Zip Code Format
- **Required**: Exactly 5 digits
- **Test Cases**:
  - Accept: `12345` ✓
  - Reject: `123` ✗ (too short)
  - Reject: `123456` ✗ (too long)
  - Reject: `1234A` ✗ (contains letter)
  - Reject: `12-345` ✗ (contains dash)

```typescript
// Valid
'12345'
'90210'
'02134'

// Invalid
'123'           // Too short
'1234567'       // Too long
'1234A'         // Contains letter
```

### 8. Numeric Field Boundaries

#### Monthly Income Field
- **Required**: Positive integer
- **Minimum**: 1
- **Maximum**: No enforced upper limit (tested to 999,999)
- **Test Cases**:
  - Accept: `1` ✓ (minimum)
  - Reject: `0` ✗ (zero)
  - Reject: `-1000` ✗ (negative)
  - Accept: `5000` ✓ (typical)
  - Accept: `999999` ✓ (large)

```typescript
// Valid
monthlyIncome: 1        // Minimum
monthlyIncome: 5000     // Typical
monthlyIncome: 999999   // Large

// Invalid
monthlyIncome: 0        // Zero
monthlyIncome: -5000    // Negative
monthlyIncome: -1       // Negative
```

#### Requested Loan Amount
- **Required**: Positive integer
- **Minimum**: 1
- **Maximum**: Tested to 10,000,000
- **Test Cases**:
  - Accept: `1` ✓ (minimum)
  - Reject: `0` ✗ (zero)
  - Reject: `-50000` ✗ (negative)
  - Accept: `25000` ✓ (typical)
  - Accept: `10000000` ✓ (large)

```typescript
// Valid
requestedAmount: 1          // Minimum
requestedAmount: 25000      // Typical
requestedAmount: 10000000   // Large

// Invalid
requestedAmount: 0          // Zero
requestedAmount: -25000     // Negative
```

### 9. Enum Field Tests

#### Employment Status
- **Valid Values**: `employed`, `self_employed`, `unemployed`, `retired`
- **Test Cases**:
  - Accept: `employed` ✓
  - Accept: `self_employed` ✓
  - Accept: `unemployed` ✓
  - Accept: `retired` ✓
  - Reject: `invalid_status` ✗
  - Reject: `EMPLOYED` ✗ (wrong case)

```typescript
// Valid
employmentStatus: 'employed'
employmentStatus: 'self_employed'
employmentStatus: 'unemployed'
employmentStatus: 'retired'

// Invalid
employmentStatus: 'invalid_status'
employmentStatus: 'EMPLOYED'
employmentStatus: 'contract'
```

#### Loan Type
- **Valid Values**: `installment`, `short_term`
- **Test Cases**:
  - Accept: `installment` ✓
  - Accept: `short_term` ✓
  - Reject: `invalid_type` ✗
  - Reject: `long_term` ✗

#### Disbursement Method
- **Valid Values**: `bank_transfer`, `check`, `debit_card`, `paypal`, `crypto`
- **Test Cases**:
  - Accept: `bank_transfer` ✓
  - Accept: `check` ✓
  - Accept: `debit_card` ✓
  - Accept: `paypal` ✓
  - Accept: `crypto` ✓
  - Reject: `wire_transfer` ✗
  - Reject: `cash` ✗

### 10. Type Coercion Tests

#### String Type Enforcement
- **Test**: Sending number when string expected
- **Expected**: Rejected with type error

```typescript
// Invalid: sending string for numeric field
monthlyIncome: 'five thousand'  // String instead of number
requestedAmount: '25000'        // String instead of number

// Valid
monthlyIncome: 5000             // Number
requestedAmount: 25000          // Number
```

#### Numeric Type Enforcement
- **Test**: Sending string when number expected
- **Expected**: Rejected with type error

```typescript
// Invalid
employmentStatus: 1             // Number instead of string
state: 99                       // Number instead of string

// Valid
employmentStatus: 'employed'    // String
state: 'TX'                     // String
```

### 11. Password Field Tests

#### Password Requirements
- **Minimum Length**: 8 characters
- **Test Cases**:
  - Accept: `SecurePass123!` ✓ (8+ chars)
  - Accept: `P@ssw0rd` ✓ (8 chars exactly)
  - Reject: `Pass123` ✗ (7 chars)
  - Reject: `short` ✗ (5 chars)

```typescript
// Valid: At minimum length
password: 'Pass1234'      // Exactly 8 chars

// Valid: Above minimum
password: 'MySecure!Pass2023'  // Long password

// Invalid: Below minimum
password: 'Pass12'        // Only 7 chars
password: 'short'         // Only 5 chars
```

### 12. Optional Field Tests

#### Employer Field (Optional)
- **Maximum**: 100 characters (when provided)
- **Behavior**: Can be omitted or null
- **Test Cases**:
  - Omit field ✓
  - Null value ✓
  - Empty string ✓
  - 100 characters ✓
  - 101 characters ✗

```typescript
// All valid for optional field
{ employer: undefined }
{ employer: null }
{ employer: '' }
{ employer: 'Company Name' }
{ employer: 'A'.repeat(100) }

// Invalid
{ employer: 'A'.repeat(101) }   // Over max length
```

---

## Implementation Details

### Test Execution Flow

1. **Test Initialization**
   - Load API URL and configuration
   - Initialize tRPC client
   - Create test data structures
   - Prepare logging infrastructure

2. **Test Execution**
   - Generate test input data
   - Submit to API endpoint
   - Capture response
   - Record result

3. **Result Analysis**
   - Compare expected vs. actual
   - Extract error messages
   - Calculate pass/fail status
   - Aggregate statistics

4. **Report Generation**
   - Compile all results
   - Calculate pass rate
   - Generate JSON report
   - Generate HTML report

### Test Data Generation

```typescript
// Generate max length string
const maxString = 'A'.repeat(100);

// Generate just-over-max string
const overMaxString = 'A'.repeat(101);

// Generate valid boundary values
const boundaryValues = {
  minimum: 1,
  maximum: 999999,
  typical: 5000,
  large: 10000000
};
```

### Response Validation

```typescript
// Expected success response
{
  success: true,
  data: {
    id: number,
    fullName: string,
    email: string,
    // ... other fields
  }
}

// Expected error response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: object
  }
}
```

---

## Quick Start Guide

### Running TypeScript Tests (Vitest)

```bash
# Install dependencies (if not done)
pnpm install

# Run boundary condition tests
pnpm test test-boundary-conditions-loan.ts

# Run with coverage
pnpm test --coverage test-boundary-conditions-loan.ts

# Run with detailed output
pnpm test --reporter=verbose test-boundary-conditions-loan.ts
```

### Running Python Scanner

```bash
# Make script executable
chmod +x test-boundary-conditions-scanner.py

# Run Python scanner
python3 test-boundary-conditions-scanner.py

# Run with custom API URL
API_URL=http://api.example.com python3 test-boundary-conditions-scanner.py
```

### Running PowerShell Tests (Windows)

```powershell
# Run with execution policy bypass
powershell -ExecutionPolicy Bypass -File test-boundary-conditions-endpoints.ps1

# Run with custom API URL
$env:API_URL="http://api.example.com"; powershell -ExecutionPolicy Bypass -File test-boundary-conditions-endpoints.ps1

# View results
Get-Content boundary-conditions-test-results.json | ConvertFrom-Json
```

### Running Bash Tests (Linux/macOS)

```bash
# Make script executable
chmod +x test-boundary-conditions-endpoints.sh

# Run tests
bash test-boundary-conditions-endpoints.sh

# Run with custom API URL
API_URL=http://api.example.com bash test-boundary-conditions-endpoints.sh

# View results
cat boundary-conditions-test-results.json | jq '.'
```

---

## Test Coverage

### Field Coverage

| Field | Type | Min | Max | Format | Enum | Tests |
|-------|------|-----|-----|--------|------|-------|
| fullName | string | 1 | 100 | - | - | 3 |
| email | string | 5 | - | RFC 5322 | - | 3 |
| phone | string | 10 | 10 | XXXXXXXXXX | - | 3 |
| password | string | 8 | - | - | - | 3 |
| dateOfBirth | string | - | - | YYYY-MM-DD | - | 3 |
| ssn | string | - | - | XXX-XX-XXXX | - | 3 |
| street | string | 1 | 255 | - | - | 3 |
| city | string | 1 | 100 | - | - | 3 |
| state | string | 2 | 2 | [A-Z]{2} | - | 3 |
| zipCode | string | 5 | 5 | XXXXX | - | 3 |
| monthlyIncome | number | 1 | ∞ | integer | - | 4 |
| requestedAmount | number | 1 | ∞ | integer | - | 4 |
| employmentStatus | enum | - | - | - | 4 values | 5 |
| loanType | enum | - | - | - | 2 values | 3 |
| disbursementMethod | enum | - | - | - | 5 values | 6 |

**Total Test Cases: 56+**

### Test Type Coverage

| Type | Count | Examples |
|------|-------|----------|
| Length | 14 | Max/min string lengths |
| Format | 18 | Email, SSN, date, state, zip |
| Numeric | 8 | Min, max, zero, negative |
| Enum | 14 | Valid/invalid enum values |
| Type | 4 | Type coercion errors |
| Optional | 4 | Optional field handling |

---

## Expected Results

### All Tests Pass ✓

```
✓ Full Name at maximum length (100 characters)
✓ Full Name exceeds maximum length (101 characters)
✓ Street at maximum length (255 characters)
✓ Email format validation
✓ Phone number format validation
✓ SSN format validation
✓ Date format validation
✓ State code format validation
✓ Zip code format validation
✓ Monthly income boundaries
✓ Requested loan amount boundaries
✓ Employment status enum validation
✓ Loan type enum validation
✓ Disbursement method enum validation

Pass Rate: 100%
```

### Partial Failures (Indicates Bugs)

```
✗ Full Name exceeds maximum length (101 characters)
  Expected: Rejection
  Actual: Accepted

✗ SSN format validation
  Expected: Pattern XXX-XX-XXXX
  Actual: Accepted YYY-YY-YYYY format

✗ Monthly income boundaries
  Expected: Reject zero
  Actual: Accepted zero
```

---

## Interpreting Results

### Test Result Structure

```json
{
  "testName": "fullName at maximum length (100 chars)",
  "fieldName": "fullName",
  "testType": "length",
  "passed": true,
  "expectedResult": "Accept 100 character string",
  "actualResult": "Accepted",
  "responseTimeMs": 45.2,
  "timestamp": "2025-11-20T14:30:00.000Z"
}
```

### Result Interpretation

| Result | Meaning | Action |
|--------|---------|--------|
| ✓ PASS | API behaves as expected | None - working correctly |
| ✗ FAIL | API behavior unexpected | Debug and fix |
| ⚠ WARN | API needs investigation | Review edge cases |
| ✗ ERROR | Test execution failed | Check API connectivity |

### Common Failure Patterns

1. **Over-Length Strings Accepted**
   - Problem: Length validation not enforced
   - Impact: Database overflow risk
   - Fix: Add `.max()` to Zod schema

2. **Format Not Validated**
   - Problem: Regex pattern not applied
   - Impact: Invalid data stored
   - Fix: Add `.regex()` validation to Zod schema

3. **Negative Numbers Accepted**
   - Problem: Positive constraint missing
   - Impact: Data integrity violation
   - Fix: Add `.positive()` to Zod schema

---

## Common Issues

### Issue 1: API Connection Error

**Symptom**: "Connection refused" or "Timeout"

**Solution**:
```bash
# Check if API is running
curl http://localhost:3000/api/health

# Start API if not running
pnpm dev

# Check API URL in test configuration
# Default: http://localhost:3000/api/trpc
```

### Issue 2: Test Hangs

**Symptom**: Test runs forever without completing

**Solution**:
```bash
# Increase test timeout
# In Vitest config: testTimeout: 60000 (60 seconds)

# Or run with timeout flag
pnpm test --testTimeout 60000
```

### Issue 3: Database Connection Error

**Symptom**: "Database connection failed"

**Solution**:
```bash
# Check DATABASE_URL environment variable
echo $DATABASE_URL

# Verify database is running
# For MySQL: mysql -u root -p

# Check drizzle migrations are up to date
pnpm db:push
```

### Issue 4: Type Errors in TypeScript

**Symptom**: TypeScript compilation errors

**Solution**:
```bash
# Run type checker
pnpm run check

# Generate proper types
pnpm build

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## Best Practices

### 1. Test Regularly

```bash
# Run boundary tests before each release
pnpm test test-boundary-conditions-loan.ts

# Add to CI/CD pipeline
# .github/workflows/test.yml
```

### 2. Document Deviations

If your API has different boundaries:

```typescript
// Update test data to match your API
const FIELD_LIMITS = {
  fullName: 150,      // Changed from 100
  loanPurpose: 1000,  // Changed from 500
  zipCode: { min: 5, max: 9 }  // ZIP+4 support
};
```

### 3. Test with Real Data

```typescript
// Test with realistic maximum length values
const realWorldData = {
  fullName: 'Jean-Claude Pierre-Antoine Archambault-Lavoie',
  street: '1234 North Oak Avenue Extended, Suite 500',
  loanPurpose: 'Complete dental work including root canals, crown replacements, and implants'
};
```

### 4. Monitor Performance

```bash
# Check average response time
grep "Average Response Time" boundary-conditions-report.html

# Identify slow endpoints
# If any test takes > 1 second, investigate
```

### 5. Automate Test Execution

```yaml
# GitHub Actions example
name: Boundary Condition Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: pnpm install
      - run: pnpm test test-boundary-conditions-loan.ts
```

---

## Compliance Standards

### OWASP Standards

- **A5:2021 – Broken Access Control**: Validates that endpoint restrictions work
- **A7:2021 – Identification and Authentication Failures**: Tests auth boundary conditions
- **A6:2021 – Vulnerable and Outdated Components**: Checks input validation

### PCI-DSS Compliance

- **Requirement 6.5.1**: Input Validation
  - Tests field length constraints
  - Validates format compliance
  - Prevents buffer overflow

- **Requirement 6.5.3**: Data Integrity
  - Verifies data stored correctly
  - Tests database constraints

### GDPR Compliance

- **Data Minimization**: Tests that only required fields are accepted
- **Data Accuracy**: Validates format constraints
- **Data Storage**: Ensures data persists correctly

### CCPA Compliance

- **Consumer Privacy**: Validates data privacy through format validation
- **Transparency**: Provides clear error messages for invalid inputs

### SOC 2 Compliance

- **Security**: Input validation prevents attacks
- **Availability**: Boundary testing ensures API stability
- **Integrity**: Data validation maintains accuracy

---

## Summary

This boundary condition testing suite provides comprehensive validation of loan application API edge cases. By running these tests regularly, you can:

✓ **Prevent Data Corruption** - Enforce strict field limits
✓ **Improve Reliability** - Catch edge cases before production
✓ **Enhance Security** - Validate against injection attacks
✓ **Ensure Compliance** - Meet regulatory requirements
✓ **Maintain Quality** - Automated regression testing

Start with the Quick Start Guide above and refer back to specific scenarios as needed.
