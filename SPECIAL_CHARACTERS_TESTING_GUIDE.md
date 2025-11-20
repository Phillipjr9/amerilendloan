# Special Characters Testing Guide - Complete Documentation

## Overview

This guide provides comprehensive testing procedures for validating how the Amerilendloan API handles special characters, Unicode, HTML entities, SQL patterns, and potential injection vectors in loan application submissions.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Coverage](#test-coverage)
3. [Special Character Categories](#special-character-categories)
4. [Implementation Details](#implementation-details)
5. [Running Tests](#running-tests)
6. [Interpreting Results](#interpreting-results)
7. [Security Validation](#security-validation)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### TypeScript/Vitest (Recommended for Development)
```bash
npm install
pnpm test test-special-characters-api.ts
```

### Python Scanner (Comprehensive Analysis)
```bash
python3 test-special-characters-scanner.py --url http://localhost:3000/api/trpc
```

### Windows PowerShell
```powershell
powershell -ExecutionPolicy Bypass -File test-special-characters-endpoints.ps1 -ApiUrl "http://localhost:3000/api/trpc/loans.submit"
```

### macOS / Linux Bash
```bash
chmod +x test-special-characters-endpoints.sh
./test-special-characters-endpoints.sh "http://localhost:3000/api/trpc/loans.submit"
```

---

## Test Coverage

### Supported Fields for Special Character Testing

The following loan application fields accept and are tested with special characters:

| Field | Type | Accepts Special Chars | Test Vectors |
|-------|------|----------------------|--------------|
| fullName | String | ✓ Yes | Unicode, HTML, SQL, XSS |
| street | String | ✓ Yes | Unicode, HTML, SQL, XSS |
| city | String | ✓ Yes | Unicode, HTML, SQL, XSS |
| employer | String | ✓ Yes | Unicode, HTML, SQL, XSS |
| loanPurpose | String | ✓ Yes | Unicode, HTML, SQL, XSS |
| email | String | Limited | RFC 5322 validation |
| phone | String | Limited | Numeric validation |
| dateOfBirth | String | ✗ No | Regex: YYYY-MM-DD |
| ssn | String | ✗ No | Regex: XXX-XX-XXXX |
| state | String | ✗ No | Length: 2 |
| zipCode | String | Limited | Length-based |
| employmentStatus | Enum | ✗ No | Predefined values only |
| loanType | Enum | ✗ No | Predefined values only |
| disbursementMethod | Enum | ✗ No | Predefined values only |

### Total Test Cases

- **5 Unicode test categories**: 7 test cases each = 35 tests
- **2 HTML/XML test scenarios**: 3 test cases = 6 tests
- **3 SQL injection patterns**: 3 test cases = 3 tests
- **3 XSS injection patterns**: 3 test cases = 3 tests
- **2 Safe character categories**: 5 test cases = 10 tests
- **3 Mixed/edge cases**: 3 test cases = 3 tests
- **Whitespace/control chars**: 3 test cases = 3 tests
- **Emoji/symbols**: 3 test cases = 3 tests

**Total: 69+ Test Cases**

---

## Special Character Categories

### 1. Unicode and Accented Characters

**Purpose**: Verify the API handles international characters correctly

**Test Cases**:
- French accents: `café`, `naïve`, `résumé`, `Ñoño`
- German umlauts: `Müller`, `über`, `Straße`
- Cyrillic: `Владимир`, `Петровский`, `Москва`
- Chinese: `王小明`, `北京`, `中国公司`
- Japanese: `山田太郎`, `東京`, `日本会社`
- Arabic: `محمد علي`, `القاهرة`, `الشركة العربية`
- Hebrew: `דוד כהן`, `תל אביב`, `חברה ישראלית`

**Expected Behavior**:
- ✓ Characters accepted in validation
- ✓ Characters preserved in response
- ✓ Proper UTF-8 encoding in database
- ✓ No character corruption or mojibake

**Validation Example**:
```typescript
const applicationData = {
  fullName: "Jean-Claude François",
  street: "Rue de l'Église",
  city: "Montréal",
  employer: "Société Générale",
  loanPurpose: "Rénovation de maison"
};

const result = await trpc.loans.submit.mutate(applicationData);
expect(result.success).toBe(true);
expect(result.data?.fullName).toContain("François");
```

### 2. Safe Special Characters

**Purpose**: Verify common safe punctuation is handled correctly

**Test Cases**:

#### Hyphens and Apostrophes
```
Name: Mary-Ann O'Brien-Smith
Street: O'Malley Lane
Employer: O'Reilly & Associates
Purpose: Home-improvement and office-renovation
```

#### Periods and Commas
```
Name: John Smith
Street: 123 Main St., Suite 200, Building A
City: Los Angeles
Employer: Tech Corp., Inc.
Purpose: Commercial expansion and equipment purchase.
```

#### Ampersands
```
Employer: Brown & Associates LLC
Purpose: Business growth & equipment acquisition
```

#### Parentheses
```
Street: 789 Park Drive (rear building)
Employer: Wilson Group (formerly Hudson)
Purpose: Property improvement (home renovation)
```

**Expected Behavior**:
- ✓ Characters preserved exactly
- ✓ Validation passes without modification
- ✓ Characters stored in database as-is
- ✓ Response includes original characters

### 3. HTML/XML Special Characters

**Purpose**: Verify proper escaping of HTML special characters

**Test Cases**:
- Less-than: `<`
- Greater-than: `>`
- Ampersand: `&`
- Double quote: `"`
- Single quote: `'`

**Injection Attempts**:
```
employer: "Tech Solutions <Advanced>"
loanPurpose: "Equipment upgrade (< $50k budget)"
fullName: 'John "Jack" O\'Brien'
street: '"Premium" Ave'
```

**Expected Behavior**:
- ✓ Characters accepted during validation
- ✓ Characters escaped in response: `<` → `&lt;`, `>` → `&gt;`, `&` → `&amp;`
- ✓ Characters safely stored in database
- ✓ No HTML injection vulnerabilities

**Validation Example**:
```typescript
const response = await trpc.loans.submit.mutate({
  ...baseData,
  employer: 'Tech & Associates'
});

// Response should have & preserved or properly escaped
expect(response.data?.employer).toContain('&');
expect(response.success).toBe(true);
```

### 4. SQL Injection Patterns

**Purpose**: Verify SQL injection attempts are rejected or properly escaped

**Test Cases**:

#### Single Quote Injection
```
fullName: "Robert'; DROP TABLE users--"
street: "123 Street'; SELECT * FROM"
```

#### OR Clause Injection
```
fullName: "Admin' OR '1'='1"
loanPurpose: "Test' OR '1'='1"
```

#### Semicolon Commands
```
fullName: "Robert; DELETE FROM"
loanPurpose: "Test; DROP TABLE loans;"
```

**Expected Behavior**:
- ✓ Validation passes (strings accepted)
- ✓ Commands NOT executed (stored as literal strings)
- ✓ Characters properly escaped by parameterized queries
- ✓ Database integrity maintained

**Validation Example**:
```typescript
try {
  const result = await trpc.loans.submit.mutate({
    ...baseData,
    fullName: "Robert'; DROP TABLE--"
  });
  
  // Should accept as string, not execute
  expect(result.data?.fullName).toContain("'");
  expect(result.success).toBe(true);
} catch (error) {
  // Rejection also acceptable
  expect(error).toBeDefined();
}
```

### 5. XSS/Script Injection Patterns

**Purpose**: Verify cross-site scripting attempts are prevented

**Test Cases**:

#### Script Tag Injection
```
fullName: "John<script>alert('XSS')</script>"
loanPurpose: "Loan <script>alert('test')</script> purpose"
```

#### Image Tag with Event Handler
```
fullName: "Test<img src=x onerror=alert('XSS')>"
employer: "Company<img src=x onerror=alert(1)>"
```

#### Event Handler Injection
```
fullName: 'John" onload="alert(\'XSS\')" x="'
street: 'Street" onclick="alert(1)" x="'
```

**Expected Behavior**:
- ✓ Validation accepts the input
- ✓ Scripts NOT executed in frontend
- ✓ Tags either removed or escaped
- ✓ Event handlers neutralized

**Validation Example**:
```typescript
const result = await trpc.loans.submit.mutate({
  ...baseData,
  loanPurpose: 'Home improvement <script>alert("xss")</script> project'
});

// Should either reject or sanitize
if (result.success) {
  const stored = result.data?.loanPurpose;
  // Scripts should be escaped
  expect(!stored.includes('<script>') || 
          stored.includes('&lt;script&gt;')).toBe(true);
}
```

### 6. Whitespace and Control Characters

**Purpose**: Verify proper handling of whitespace and control characters

**Test Cases**:

#### Leading/Trailing Spaces
```
fullName: "  John Doe  "
street: "  123 Main Street  "
employer: "  Test Company  "
```

#### Multiple Spaces Between Words
```
fullName: "John    Doe"
street: "123    Main    Street"
loanPurpose: "Home    improvement    project"
```

#### Tabs
```
loanPurpose: "Phase\t1\tSetup\tand\tExpansion"
```

**Expected Behavior**:
- ✓ Spaces trimmed or preserved consistently
- ✓ Multiple spaces handled gracefully
- ✓ Tabs converted or preserved
- ✓ No data corruption

### 7. Emoji and Unicode Symbols

**Purpose**: Verify emoji and special Unicode are handled

**Test Cases**:
- Emoji in names: `John Doe 🚀`
- Status markers: `✅ PASS`, `❌ FAIL`
- Currency symbols: `€`, `£`, `¥`, `₹`
- Arrows: `→`, `←`, `↑`, `↓`
- Mathematical: `±`, `×`, `÷`, `≤`, `≥`

**Expected Behavior**:
- ✓ Emoji may be stripped or accepted
- ✓ No API crashes
- ✓ Response handles gracefully

### 8. Currency and Math Symbols

**Purpose**: Verify financial-related symbols are handled

**Test Cases**:
```
loanPurpose: "Equipment purchase ($5000-$10000) and inventory"
loanPurpose: "Phase 1 (±2 weeks) + Phase 2 (±4 weeks) = expansion"
loanPurpose: "Growth 25% expansion and 15% modernization"
```

**Expected Behavior**:
- ✓ Dollar signs preserved
- ✓ Percentage signs preserved
- ✓ Math operators preserved
- ✓ No parsing confusion

---

## Implementation Details

### API Endpoint

```
POST /api/trpc/loans.submit
Content-Type: application/json
```

### Request Format

```json
{
  "fullName": "string (min 1 char)",
  "email": "string (valid email)",
  "phone": "string (min 10 chars)",
  "password": "string (min 8 chars)",
  "dateOfBirth": "string (YYYY-MM-DD format)",
  "ssn": "string (XXX-XX-XXXX format)",
  "street": "string (min 1 char)",
  "city": "string (min 1 char)",
  "state": "string (exactly 2 chars)",
  "zipCode": "string (min 5 chars)",
  "employmentStatus": "enum: employed|self_employed|unemployed|retired",
  "employer": "string (optional)",
  "monthlyIncome": "number (positive integer)",
  "loanType": "enum: installment|short_term",
  "requestedAmount": "number (positive integer)",
  "loanPurpose": "string (min 10 chars)",
  "disbursementMethod": "enum: bank_transfer|check|debit_card|paypal|crypto"
}
```

### Response Format (Success)

```json
{
  "success": true,
  "data": {
    "fullName": "string",
    "email": "string",
    "street": "string",
    "city": "string",
    "employer": "string",
    "loanPurpose": "string",
    "id": "string",
    "createdAt": "ISO8601 timestamp"
  },
  "timestamp": "ISO8601 timestamp"
}
```

### Response Format (Error)

```json
{
  "success": false,
  "error": "string (generic error message)",
  "timestamp": "ISO8601 timestamp"
}
```

### Validation Logic

**Character handling flow**:

1. **Input Validation** → Zod schema validation
   - String fields accept any Unicode characters (except format-restricted fields)
   - Format fields use regex patterns
   - Enum fields limited to predefined values

2. **Character Processing** → Potential trimming/normalization
   - Whitespace may be trimmed
   - Unicode normalized (NFC form typically)
   - No characters removed

3. **Database Storage** → Parameterized queries
   - Characters stored safely with prepared statements
   - SQL injection prevented by query parameterization
   - UTF-8 encoding preserved

4. **Response Generation** → superjson serialization
   - Characters serialized to JSON
   - Special characters may be Unicode-escaped
   - HTML characters may be escaped for safety

---

## Running Tests

### 1. TypeScript/Vitest Tests

**File**: `test-special-characters-api.ts`

**Run Individual Test Suite**:
```bash
pnpm test test-special-characters-api.ts
```

**Run Specific Test**:
```bash
pnpm test test-special-characters-api.ts -t "Unicode and Accented Characters"
```

**With Coverage**:
```bash
pnpm test test-special-characters-api.ts --coverage
```

**Output**:
```
✓ test-special-characters-api.ts (69)
  ✓ Unicode and Accented Characters (7)
    ✓ should accept French accented characters in full name
    ✓ should accept Spanish special characters
    ✓ should accept German umlauts
    ... (4 more)
  ✓ Safe Special Characters (5)
    ✓ should accept hyphens and apostrophes in names
    ... (4 more)
  ... (more test suites)

Tests: 69 passed | 69 total
```

### 2. Python Scanner

**File**: `test-special-characters-scanner.py`

**Basic Usage**:
```bash
python3 test-special-characters-scanner.py
```

**Custom API URL**:
```bash
python3 test-special-characters-scanner.py --url http://localhost:3000/api/trpc
```

**Custom Output Directory**:
```bash
python3 test-special-characters-scanner.py --output ./test-reports
```

**Full Options**:
```bash
python3 test-special-characters-scanner.py \
  --url http://localhost:3000/api/trpc \
  --output ./reports
```

**Output**:
```
🔍 Special Character Handling Scanner
API URL: http://localhost:3000/api/trpc
Output: ./reports

Running tests...
✓ unicode_accents
✓ unicode_cyrillic
✓ unicode_chinese
... (13 more tests)

Generating reports...
✓ JSON report: ./reports/special-characters-report.json
✓ HTML report: ./reports/special-characters-report.html

==================================================
Summary:
  Total Tests: 16
  Passed: 15
  Failed: 1
  Pass Rate: 93.75%
==================================================
```

### 3. PowerShell Tests

**File**: `test-special-characters-endpoints.ps1`

**Basic Usage** (Windows):
```powershell
.\test-special-characters-endpoints.ps1
```

**Custom API URL**:
```powershell
.\test-special-characters-endpoints.ps1 -ApiUrl "http://localhost:3000/api/trpc/loans.submit"
```

**Verbose Output**:
```powershell
.\test-special-characters-endpoints.ps1 -Verbose
```

**Full Command**:
```powershell
powershell -ExecutionPolicy Bypass `
  -File test-special-characters-endpoints.ps1 `
  -ApiUrl "http://localhost:3000/api/trpc/loans.submit" `
  -Verbose
```

**Output**:
```
ℹ Loading special character test cases...
→ Testing: Unicode Accents - French
✓ Unicode Accents - French - Application accepted
→ Testing: Unicode - Cyrillic
✓ Unicode - Cyrillic - Application accepted
... (16 more tests)

============================================================
Test Summary
============================================================
✓ Total Tests: 18
✓ Passed: 17
✗ Failed: 1
ℹ Pass Rate: 94.44%
============================================================
ℹ Results saved to: special-characters-report-20240115-143022.json
```

### 4. Bash Tests

**File**: `test-special-characters-endpoints.sh`

**Make Executable**:
```bash
chmod +x test-special-characters-endpoints.sh
```

**Basic Usage**:
```bash
./test-special-characters-endpoints.sh
```

**Custom API URL**:
```bash
./test-special-characters-endpoints.sh "http://localhost:3000/api/trpc/loans.submit"
```

**With Debugging**:
```bash
bash -x test-special-characters-endpoints.sh
```

**Output**:
```
ℹ Special Character Handling Tests
ℹ API URL: http://localhost:3000/api/trpc/loans.submit
ℹ

→ Testing: Unicode Accents - French
✓ Unicode Accents - French - Application accepted (HTTP 200)
→ Testing: Unicode - Cyrillic
✓ Unicode - Cyrillic - Application accepted (HTTP 200)
... (16 more tests)

ℹ ============================================================
ℹ Test Summary
ℹ ============================================================
✓ Total Tests: 18
✓ Passed: 17
✗ Failed: 1
ℹ Pass Rate: 94%
ℹ ============================================================
ℹ Results saved to: special-characters-report-20240115-143022.json
```

---

## Interpreting Results

### Success Indicators

✓ **Passed**: 
- HTTP 200 response
- `success: true` in response
- Application data echoed back correctly
- Characters preserved as-is or safely escaped

✗ **Failed**:
- HTTP error status (4xx, 5xx)
- `success: false` in response
- Error message returned
- Character corruption detected

### Character Preservation Matrix

| Category | Result | Interpretation |
|----------|--------|-----------------|
| Unicode | Preserved | ✓ International support works |
| HTML special chars | Escaped | ✓ Security working |
| SQL patterns | Stored as string | ✓ Parameterized queries working |
| XSS patterns | Escaped/removed | ✓ XSS prevention working |
| Safe punctuation | Preserved | ✓ Standard characters accepted |

### Report Metrics

**From JSON Reports**:
```json
{
  "totalTests": 16,
  "passed": 15,
  "failed": 1,
  "passRate": 93.75,
  "characterPreservation": {
    "fullName": true,
    "street": true,
    "city": true,
    "employer": true,
    "loanPurpose": true
  },
  "htmlEscaping": {
    "angle_brackets_escaped": true,
    "ampersand_escaped": true,
    "quotes_escaped": true,
    "script_tags_removed": true,
    "event_handlers_removed": true
  }
}
```

---

## Security Validation

### OWASP Coverage

This test suite validates protection against:

1. **A03:2021 - Injection**
   - SQL injection patterns
   - Command injection attempts
   - Test status: ✓ Covered

2. **A07:2021 - Cross-Site Scripting (XSS)**
   - Script tag injection
   - Event handler injection
   - Attribute breakout
   - Test status: ✓ Covered

3. **A01:2021 - Broken Access Control**
   - Authorization bypass attempts
   - Test status: Covered in separate suite

4. **A02:2021 - Cryptographic Failures**
   - Data exposure prevention
   - Test status: Covered in separate suite

### Compliance Verification

- **PCI-DSS**: Validates input validation (Requirement 6.5.1)
- **GDPR**: Ensures character set support for international data
- **SOC 2**: Confirms data integrity during storage
- **CCPA**: Validates data preservation requirements

### Security Checklist

- [ ] No SQL injection vulnerabilities detected
- [ ] No XSS vulnerabilities detected
- [ ] Characters properly escaped in responses
- [ ] Database queries use parameterized statements
- [ ] Error messages don't leak system information
- [ ] All character types handled gracefully
- [ ] No application crashes on special input
- [ ] Unicode characters stored correctly

---

## Troubleshooting

### Common Issues

#### 1. "Connection Refused" Error

**Problem**: Tests fail to connect to API
```
Error: ECONNREFUSED 127.0.0.1:3000
```

**Solutions**:
- Verify development server is running: `pnpm dev`
- Check API URL is correct: `http://localhost:3000/api/trpc`
- Check firewall isn't blocking connections
- Verify environment variables are set

#### 2. "Invalid Input" Error

**Problem**: Validation fails unexpectedly
```
Error: Invalid input received
```

**Solutions**:
- Verify minimum field lengths are met
- Check dateOfBirth format is YYYY-MM-DD
- Verify SSN format is XXX-XX-XXXX
- Check enum values are correct
- Ensure email is valid format

#### 3. Character Encoding Issues

**Problem**: Special characters show as mojibake or ???
```
fullName: "Jean??ois" (should be "François")
```

**Solutions**:
- Verify terminal supports UTF-8: `chcp 65001` (Windows)
- Check file encoding is UTF-8
- Verify database uses UTF-8mb4
- Check response headers for charset

#### 4. Python Dependencies Missing

**Problem**: Import errors in Python script
```
ModuleNotFoundError: No module named 'requests'
```

**Solutions**:
```bash
pip install requests
# or for multiple packages
pip install -r requirements.txt
```

#### 5. PowerShell Execution Policy

**Problem**: Script won't run
```
Cannot be loaded because running scripts is disabled
```

**Solutions**:
```powershell
# Bypass for single execution
powershell -ExecutionPolicy Bypass -File test-special-characters-endpoints.ps1

# Or set policy permanently (requires admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 6. Bash Script Permission Denied

**Problem**: Script not executable
```
bash: ./test-special-characters-endpoints.sh: Permission denied
```

**Solutions**:
```bash
# Make executable
chmod +x test-special-characters-endpoints.sh

# Run with bash explicitly
bash test-special-characters-endpoints.sh
```

### Debug Mode

#### TypeScript
```bash
pnpm test test-special-characters-api.ts --reporter=verbose
```

#### Python
```bash
python3 -u test-special-characters-scanner.py  # Unbuffered output
```

#### PowerShell
```powershell
$VerbosePreference = "Continue"
.\test-special-characters-endpoints.ps1 -Verbose
```

#### Bash
```bash
bash -x test-special-characters-endpoints.sh  # Trace mode
set -v  # Print commands
```

---

## Performance Considerations

### Test Execution Times

| Platform | Count | Duration | Per-Test |
|----------|-------|----------|----------|
| TypeScript | 69 | ~5s | 72ms |
| Python | 16 | ~8s | 500ms |
| PowerShell | 18 | ~10s | 556ms |
| Bash | 18 | ~12s | 667ms |

### Optimization Tips

1. **Parallel Execution** (TypeScript/Vitest)
   ```bash
   pnpm test -- --threads
   ```

2. **Reduce API Latency** (All platforms)
   - Run server locally
   - Use `localhost` not `127.0.0.1`
   - Disable proxy/VPN

3. **Batch Requests** (Python)
   - Modify scanner to use connection pooling
   - Reduce MAX_WORKERS if rate limited

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Special Character Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Start dev server
        run: |
          pnpm dev &
          sleep 5
      
      - name: Run TypeScript tests
        run: pnpm test test-special-characters-api.ts
      
      - name: Run Python scanner
        run: |
          pip install requests
          python3 test-special-characters-scanner.py
      
      - name: Upload reports
        uses: actions/upload-artifact@v2
        with:
          name: test-reports
          path: reports/
```

---

## Additional Resources

- [Unicode Standard](https://unicode.org/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [MDN Web Docs - Special Characters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

---

## Support

For questions or issues:
1. Check the troubleshooting section above
2. Review test output logs
3. Consult the API documentation
4. Contact the development team

---

**Document Version**: 1.0.0
**Last Updated**: 2024
**Test Suite**: Special Character Handling v1.0
