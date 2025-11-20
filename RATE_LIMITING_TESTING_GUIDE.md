# Rate Limiting & Excessive Request Testing Guide

## Overview

This comprehensive guide explains how to test the API's rate limiting capabilities and verify that it properly handles excessive requests from a single IP address. Rate limiting is a critical security control that prevents abuse, brute force attacks, and denial-of-service (DoS) attacks.

## Table of Contents

1. [Introduction](#introduction)
2. [Rate Limiting Architecture](#rate-limiting-architecture)
3. [Test Suite Components](#test-suite-components)
4. [Running the Tests](#running-the-tests)
5. [Understanding Rate Limiting Rules](#understanding-rate-limiting-rules)
6. [Common Attack Patterns](#common-attack-patterns)
7. [Interpreting Results](#interpreting-results)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Compliance & Standards](#compliance--standards)

---

## Introduction

### What is Rate Limiting?

Rate limiting is a technique that restricts the number of requests a client can make within a specific time window. This protects the API from:

- **Brute Force Attacks**: Multiple failed login attempts
- **Denial of Service (DoS)**: Overwhelming the API with requests
- **Resource Exhaustion**: Preventing one user from monopolizing resources
- **Data Scraping**: Limiting automated data extraction
- **Account Enumeration**: Preventing user discovery via API

### Why Test Rate Limiting?

Rate limiting effectiveness depends on:
1. **Proper IP Detection**: Correctly identifying the client's real IP
2. **Window Management**: Accurately tracking time windows
3. **Consistent Enforcement**: Blocking all excessive requests
4. **Proper Error Responses**: Returning 429 status with guidance
5. **Recovery**: Allowing requests after the window expires

---

## Rate Limiting Architecture

### Current Implementation

The AmeriLend API implements rate limiting across multiple layers:

```
Request Flow:
    ↓
IP Detection (X-Forwarded-For, X-Real-IP, etc.)
    ↓
Rate Limit Check (Memory-based tracker)
    ↓
Time Window Validation
    ↓
Count Comparison vs. Limit
    ↓
Enforce (Allow/Block)
```

### Key Components

#### 1. IP Detection (`ipUtils.ts`)

Extracts real client IP from various headers:

```typescript
// Priority order:
1. X-Forwarded-For (proxy chain)
2. X-Real-IP (single proxy)
3. CF-Connecting-IP (Cloudflare)
4. Socket remote address (direct connection)
```

**Test Case**: Verify IP extraction works with:
- Direct connections
- Single proxy (X-Real-IP)
- Proxy chains (X-Forwarded-For)
- Cloudflare integration (CF-Connecting-IP)

#### 2. Rate Limit Tracking (`security.ts`)

In-memory tracking with configurable windows:

```typescript
const attemptTracker = new Map<string, {
  count: number;
  resetTime: number;
}>();

function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): boolean
```

**Characteristics**:
- Key-based (email, IP, or combination)
- Time window-based reset
- Per-IP or per-user tracking
- Automatic window expiration

#### 3. Protected Endpoints

Rate limiting applied to:

- **Login**: 5 failed attempts per 15 minutes
- **OTP Requests**: 3 per 5 minutes per email, 10 per hour per IP
- **OTP Verification**: 5 attempts per code
- **Search**: 20 per hour per IP
- **Payment Processing**: Depends on endpoint

---

## Test Suite Components

### 1. Vitest Integration Tests (`test-rate-limiting-api.ts`)

**Purpose**: Unit and integration tests using Vitest framework

**Test Categories**:

```typescript
// IP Tracking Tests
- Track requests by IP address
- Distinguish between different IPs
- Extract IPs from various headers

// Time Window Tests
- Enforce rate limit within window
- Reset after window expires
- Handle multiple concurrent windows

// Enforcement Tests
- Allow requests up to limit
- Block requests exceeding limit
- Return 429 status code
- Include rate limit headers

// Endpoint-Specific Tests
- Login endpoint (5/15min)
- OTP endpoint (3/5min per email, 10/hour per IP)
- Payment processing limits

// Attack Pattern Detection
- Distributed attacks (multiple IPs)
- Brute force attempts
- Suspicious patterns

// Error Response Tests
- Proper error structure
- Retry information included
- No sensitive data exposed

// Recovery Tests
- Allow requests after window expires
- Counter resets properly

// Configuration Tests
- Configurable thresholds
- Whitelist/blacklist support
- Dynamic adjustment capability
```

**File Size**: ~750 lines, 50+ test cases

**Run Command**:
```bash
pnpm test test-rate-limiting-api.ts
```

### 2. Python Scanner (`test-rate-limiting-scanner.py`)

**Purpose**: Automated API testing with concurrent requests

**Features**:

```python
# Test Methods
- test_login_rate_limiting() - 10 sequential requests
- test_otp_rate_limiting() - 5 sequential requests
- test_concurrent_requests() - Parallel threads from single IP
- test_retry_after_header() - Verify 429 response headers
- test_ip_header_handling() - Test various IP headers
- test_error_response_safety() - Verify no sensitive data

# Metrics Collected
- Response status codes
- Rate limit percentage
- Average response time
- Max response time
- Concurrent thread success rate
- 429 response frequency
```

**Usage**:
```bash
python test-rate-limiting-scanner.py --url http://localhost:3000 --threads 10
```

**Output**:
- Console progress with colored status
- Detailed response analysis
- `rate-limiting-test-results.txt` report

### 3. PowerShell Tests (`test-rate-limiting-endpoints.ps1`)

**Purpose**: Windows-native testing with concurrent jobs

**Features**:

```powershell
# Test Methods
- Test-LoginRateLimiting - Sequential login attempts
- Test-OTPRateLimiting - OTP request limiting
- Test-ConcurrentRequests - Background jobs with multiple threads
- Test-RetryAfterHeader - Verify response headers
- Test-IPHeaderHandling - Test IP extraction
- Test-ErrorResponseSafety - Check for sensitive data

# Features
- Colored console output (Green/Red/Yellow/Cyan)
- Concurrent job management
- Response time measurement (ms)
- Configurable thread count
- Results saved to log file
```

**Usage**:
```powershell
powershell -ExecutionPolicy Bypass -File test-rate-limiting-endpoints.ps1 -BaseUrl http://localhost:3000 -Threads 10
```

### 4. Bash Tests (`test-rate-limiting-endpoints.sh`)

**Purpose**: Unix/Linux/macOS compatibility testing

**Features**:

```bash
# Test Methods
- test_login_rate_limiting() - HTTP requests with curl
- test_otp_rate_limiting() - OTP endpoint testing
- test_concurrent_requests() - Background processes
- test_retry_after_header() - Header verification
- test_ip_header_handling() - Multiple header formats
- test_error_response_safety() - Pattern detection

# Features
- ANSI colored output
- Concurrent background processes
- Response time tracking
- Cross-platform compatibility
- JSON output parsing
```

**Usage**:
```bash
bash test-rate-limiting-endpoints.sh http://localhost:3000 10
chmod +x test-rate-limiting-endpoints.sh  # Make executable
./test-rate-limiting-endpoints.sh http://localhost:3000 10
```

---

## Running the Tests

### Step 1: Start API Server

```bash
# From repository root
env NODE_ENV=development pnpm dev

# Or production:
pnpm build
pnpm start
```

### Step 2: Run Tests by Platform

#### TypeScript/Vitest (Recommended for CI/CD)

```bash
# Run all rate limiting tests
pnpm test test-rate-limiting-api.ts

# Run with coverage
pnpm test test-rate-limiting-api.ts --coverage

# Run specific test suite
pnpm test test-rate-limiting-api.ts -t "Login Endpoint Rate Limiting"
```

#### Python Scanner (Most Detailed Analysis)

```bash
# Basic run
python test-rate-limiting-scanner.py

# Custom URL and thread count
python test-rate-limiting-scanner.py --url https://api.amerilendloan.com --threads 20

# Help
python test-rate-limiting-scanner.py --help
```

#### PowerShell (Windows)

```powershell
# Run with defaults (localhost:3000, 10 threads)
powershell -ExecutionPolicy Bypass -File test-rate-limiting-endpoints.ps1

# Custom parameters
powershell -ExecutionPolicy Bypass -File test-rate-limiting-endpoints.ps1 `
  -BaseUrl http://localhost:3000 `
  -Threads 15 `
  -LogFile my-results.txt
```

#### Bash (Linux/macOS)

```bash
# Run with defaults
bash test-rate-limiting-endpoints.sh

# Custom URL and threads
bash test-rate-limiting-endpoints.sh http://localhost:3000 15

# Make executable for future runs
chmod +x test-rate-limiting-endpoints.sh
./test-rate-limiting-endpoints.sh http://localhost:3000 15
```

---

## Understanding Rate Limiting Rules

### Per-Endpoint Limits

#### 1. Authentication Endpoints

```
auth.login (Failed Attempts):
- Limit: 5 failed attempts
- Window: 15 minutes
- Per: Email address
- Action: Account lockout, security alert
- Response: 429 Too Many Requests

auth.recordAttempt:
- Tracks login attempts for rate limiting
- Records IP address and user agent
- Used for fraud detection
```

#### 2. OTP (One-Time Password) Endpoints

```
otp.requestCode:
- Limit: 3 per email
- Window: 5 minutes
- Secondary: 10 per IP
- Window: 1 hour
- Purpose: Prevent OTP brute force and enumeration

otp.verifyCode:
- Limit: 5 attempts per code
- Window: Code lifetime (10 minutes)
- Action: Code invalidation after limit
```

#### 3. Search Endpoints

```
loans.search:
- Limit: 20 per IP
- Window: 1 hour
- Purpose: Prevent data scraping and enumeration
```

#### 4. Payment Endpoints

```
payments.create:
- Limit: 50 per user
- Window: 1 hour
- Purpose: Prevent fraud and automation
```

### Rate Limit Response Format

#### Successful Request
```json
HTTP 200 OK
{
  "success": true,
  "data": { /* ... */ }
}
```

#### Rate Limited Request
```json
HTTP 429 Too Many Requests

Headers:
  X-RateLimit-Limit: 5
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: 1700500860
  Retry-After: 59

Body:
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Too many requests. Please try again later."
  },
  "timestamp": "2025-11-20T10:30:00Z"
}
```

---

## Common Attack Patterns

### 1. Brute Force Attack (Login)

```
Pattern:
  - Same email, multiple passwords
  - High-frequency requests (1 per second)
  - From single IP
  - Failed authentication responses

Detection:
  - 5+ failed attempts in 15 minutes
  - Same email address
  - Same or related IPs

Response:
  - Block login endpoint (429)
  - Account lockout
  - Security alert email
  - IP tracking for future requests
```

**Test**:
```bash
# Run 10 login attempts with wrong password
pnpm test test-rate-limiting-api.ts -t "should limit failed login attempts"
```

### 2. Account Enumeration (OTP)

```
Pattern:
  - Many different emails
  - Requesting OTP codes
  - Testing email validity
  - From single IP

Detection:
  - 10+ OTP requests in 1 hour from single IP
  - Various email addresses
  - Rapid succession

Response:
  - Block OTP endpoint (429)
  - Temporary IP ban
  - CAPTCHA requirement
```

### 3. Data Scraping (Search)

```
Pattern:
  - Continuous search requests
  - Returning large datasets
  - No user interaction delays
  - From single IP

Detection:
  - 20+ search requests in 1 hour
  - High volume data extraction
  - No human-like behavior

Response:
  - Block search endpoint (429)
  - Temporary IP suspension
  - Require authentication
```

### 4. Distributed Attack (Multiple IPs)

```
Pattern:
  - Requests from many different IPs
  - Similar request patterns
  - Same target endpoint
  - Coordinated timing

Detection:
  - >100 requests per second
  - >50 unique IPs targeting same endpoint
  - Similar request signatures

Response:
  - DDoS mitigation (Cloudflare, AWS Shield)
  - Geographic blocking
  - Rate limit reduction globally
```

---

## Interpreting Results

### Test Execution Output

#### Success Indicators (✓)

```
✓ Rate limited (429)                          - Request properly blocked
✓ Attempt 5: Response 429 - 45ms             - At limit threshold
✓ No sensitive data found in response         - Error message safe
✓ Retry-After header present: 59             - Proper guidance
✓ Thread 5: Rate limited (429) - 52ms        - Concurrent blocking works
```

#### Warning Indicators (!)

```
! Unexpected status 500                       - Server error, may indicate issue
! Could not trigger rate limit response       - Tests inconclusive
! Rate limit responses missing header         - Incomplete 429 responses
```

#### Failure Indicators (✗)

```
✗ Rate limit not triggered                    - Rate limiting not enforced
✗ Found sensitive patterns: password, token  - Information leak
✗ Response $statusCode not 429               - Wrong status code
✗ No Retry-After header in 429               - Missing guidance
```

### Report Analysis

#### Status: PASSED

```
✓ NO VIOLATIONS FOUND

Interpretation:
  • All rate limiting rules enforced correctly
  • 429 responses returned properly
  • Error messages safe (no sensitive data)
  • Recovery after window works
  • All IP headers handled correctly
  • Concurrent requests properly limited

Action: 
  • Deploy with confidence
  • Schedule regular testing (weekly)
  • Monitor production metrics
```

#### Status: FAILED

```
✗ VIOLATIONS FOUND: 3
  ✗ Login endpoint not properly rate limited
  ✗ Rate limit responses missing Retry-After header
  ✗ Found sensitive patterns in error responses

Interpretation:
  • Some rate limiting checks failing
  • 429 responses incomplete
  • Potential information leaks
  • Endpoint vulnerability exists

Action:
  • Investigate and fix violations
  • Re-run tests after changes
  • Review rate limit configuration
  • Check error response handler
```

### Performance Metrics

#### Response Times

```
Healthy:
  Average: 50-200ms
  Max: <500ms
  Variation: <100ms

Concerning:
  Average: >500ms
  Max: >2000ms
  Variation: >200ms

Interpretation:
  • Long times may indicate database load
  • High variation suggests resource contention
  • Consider scaling or optimization
```

#### Rate Limited Percentage

```
Expected:
  Login (10 attempts): 40% rate limited (after attempt 6)
  OTP (5 attempts): 40% rate limited (after attempt 3)
  Concurrent (10 threads): 30-50% rate limited

Anomalies:
  0% rate limited: Rate limiting not working
  100% rate limited: Too strict, may block legit users
  Inconsistent: Window timing issues
```

---

## Best Practices

### 1. Testing Strategy

```
Development:
  • Run full test suite after code changes
  • Test both positive and negative cases
  • Verify error messages don't leak data
  • Use Python scanner for detailed analysis

Staging:
  • Run tests against staging environment
  • Use realistic load (Python with --threads 50)
  • Test with production-like data volumes
  • Verify with monitoring and logging

Production:
  • Run non-destructive tests only
  • Use Python scanner with lower concurrency
  • Monitor metrics in real-time
  • Run full suite during maintenance windows
```

### 2. Configuration Management

```typescript
// DO: Externalize rate limit config
export const RATE_LIMITS = {
  login: { attempts: 5, windowMs: 15 * 60 * 1000 },
  otp: { attempts: 3, windowMs: 5 * 60 * 1000 },
  search: { attempts: 20, windowMs: 60 * 60 * 1000 }
};

// DON'T: Hardcode limits
if (attempts > 5) { // ✗ Can't change without redeployment
```

### 3. Monitoring & Alerting

```
Key Metrics:
  • 429 response rate (should be <5% of total)
  • Rate limit violations per IP
  • False positives (blocked legitimate users)
  • Average response times
  • Peak concurrent requests

Alerts:
  • >100 429s per minute: Possible attack
  • Specific IP >1000 violations/hour: Block IP
  • Error rate spike: Service degradation
  • Response time increase: Capacity issue
```

### 4. Whitelist Management

```typescript
// Trusted IPs that bypass rate limiting
const WHITELIST = [
  '127.0.0.1',        // Localhost
  '::1',               // IPv6 localhost
  '203.0.113.50',      // Internal monitoring
];

// IPs temporarily blocked
const BLACKLIST = new Map<string, Date>();

// Use in rate limit check:
if (WHITELIST.includes(ip)) return true;
if (BLACKLIST.has(ip) && BLACKLIST.get(ip) > now) return false;
```

### 5. Error Response Safety

```typescript
// ✓ GOOD: Generic, safe error message
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Too many requests. Please try again later."
  }
}

// ✗ BAD: Exposes implementation details
{
  "error": "Rate limit exceeded: 6/5 attempts in 900000ms on 192.168.1.100"
}

// ✗ BAD: Leaks system information
{
  "error": "Database query timeout after 30s - rate limit check failed",
  "stack": "at checkRateLimit (server/security.ts:42)"
}
```

---

## Troubleshooting

### Problem: Tests Show 0% Rate Limited

**Symptoms**:
```
✗ 0% rate limited
Rate limiting not triggered after 10 attempts
Status: 400 or 401 (not 429)
```

**Causes**:
1. Rate limiting not implemented on endpoint
2. Rate limit configuration too high
3. Different IP addresses in requests
4. Test account not triggering the endpoint

**Solution**:
```bash
# 1. Check if endpoint has rate limiting
grep -r "checkRateLimit" server/routers.ts

# 2. Verify rate limit configuration
cat server/_core/security.ts | grep -A 10 "checkRateLimit("

# 3. Check IP extraction
curl -v -H "X-Forwarded-For: 192.168.1.100" http://localhost:3000/api/trpc/auth.login

# 4. Use consistent test data
# All attempts should use same email for login tests
```

### Problem: Tests Timeout or Hang

**Symptoms**:
```
Request timeout after 5 seconds
No response from server
Hanging on certain endpoints
```

**Causes**:
1. API server not running
2. Network connectivity issues
3. Endpoint has infinite loop or deadlock
4. Database connection issues

**Solution**:
```bash
# 1. Verify server is running
curl -s http://localhost:3000/health

# 2. Check server logs
# Look for errors in the running server terminal

# 3. Restart server
env NODE_ENV=development pnpm dev

# 4. Verify database connection
# Check DATABASE_URL environment variable
echo $DATABASE_URL
```

### Problem: Rate Limit Headers Missing

**Symptoms**:
```
Status: 429
But headers missing: X-RateLimit-Limit, Retry-After
```

**Causes**:
1. Error handler not setting headers
2. Proxy stripping headers
3. CORS removing headers

**Solution**:
```typescript
// In response handler, ensure headers are set:
res.set('X-RateLimit-Limit', '5');
res.set('X-RateLimit-Remaining', '0');
res.set('X-RateLimit-Reset', resetTimestamp.toString());
res.set('Retry-After', retryAfterSeconds.toString());

// Check headers with curl -i
curl -i -X POST http://localhost:3000/api/trpc/auth.login
```

### Problem: Sensitive Data in Error Response

**Symptoms**:
```
Found sensitive patterns: password, api_key
Error response contains: "database_url=..."
```

**Causes**:
1. Error message constructed from environment variables
2. Stack traces included in response
3. Debug mode enabled in production

**Solution**:
```typescript
// ✓ CORRECT: Generic, safe error message
throw new TRPCError({
  code: 'TOO_MANY_REQUESTS',
  message: 'Too many requests. Please try again later.'
  // Don't include: IP, time remaining, attempt count, etc.
});

// Disable debug error messages
if (process.env.NODE_ENV === 'production') {
  // Don't expose error details
}
```

---

## Compliance & Standards

### OWASP Rate Limiting

The test suite verifies compliance with OWASP Application Security recommendations:

```
✓ OAT-010: Credential Stuffing Prevention
  - Login endpoint rate limited (5/15min)
  - Failed attempt tracking
  - Account lockout

✓ OAT-003: Account Enumeration Prevention
  - OTP request throttling
  - Generic error messages
  - No user existence leakage

✓ OAT-004: Brute Force Attacks Prevention
  - Progressive delays between attempts
  - IP-based blocking
  - Account notifications

✓ OAT-001: Automated Scanning Prevention
  - Request pattern detection
  - Concurrent request limiting
  - Suspicious activity alerts
```

### PCI-DSS Compliance

```
Requirement 6.5.10 - Rate Limiting:
✓ Implements request throttling
✓ Prevents automated attacks
✓ Logs suspicious activity
✓ Protects against brute force

Evidence:
  - checkRateLimit() function
  - logSecurityEvent() calls
  - 429 responses on limit
  - IP-based tracking
```

### GDPR & Privacy

```
Considerations:
- IP addresses are personal data
- Limit retention: 30 days max
- Log only necessary information
- Anonymize in reports
- Comply with data retention policies

Implementation:
  // Pseudonymize IPs in logs
  const pseudoIp = crypto.createHash('sha256').update(ip).digest('hex');
  logSecurityEvent('rate_limit', null, `Limit exceeded for ${pseudoIp}`);
```

### SOC 2 Type II

```
Applicable Controls:
✓ CC7.2 - System Monitoring
  - Rate limit violations logged
  - Real-time alerting on anomalies
  - Trend analysis and reporting

✓ CC6.1 - Logical Access Controls
  - IP-based rate limiting
  - Account lockout mechanisms
  - Suspicious activity detection

✓ A1.2 - Change Management
  - Rate limit configuration versioned
  - Changes logged and auditable
```

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Rate Limiting Tests

on: [push, pull_request]

jobs:
  rate-limiting-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Start API server
        run: |
          env NODE_ENV=test pnpm dev &
          sleep 5
      
      - name: Run rate limiting tests
        run: pnpm test test-rate-limiting-api.ts
      
      - name: Run Python scanner
        run: |
          pip install requests
          python test-rate-limiting-scanner.py --url http://localhost:3000
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: rate-limiting-results
          path: rate-limiting-test-*.txt
```

---

## Additional Resources

### Files Included

```
test-rate-limiting-api.ts              # 750 lines - TypeScript/Vitest tests
test-rate-limiting-scanner.py          # 600 lines - Python analyzer
test-rate-limiting-endpoints.ps1       # 500 lines - PowerShell tests
test-rate-limiting-endpoints.sh        # 450 lines - Bash tests

RATE_LIMITING_TESTING_GUIDE.md         # This file
RATE_LIMITING_QUICK_REFERENCE.md       # Quick lookup guide
RATE_LIMITING_TEST_SUMMARY.md          # Technical summary
```

### External References

- [OWASP Rate Limiting](https://owasp.org/www-community/attacks/Rate_limiting)
- [NIST SP 800-63B Authentication](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [RFC 6585 - HTTP 429 Status Code](https://tools.ietf.org/html/rfc6585#section-4)
- [Cloudflare Rate Limiting Guide](https://developers.cloudflare.com/cache/about/default-cache-behavior/#caching-by-status-code)

---

## Support & Questions

For questions or issues with the rate limiting tests:

1. **Check Troubleshooting Section** - Common issues documented above
2. **Review Test Output** - Look for specific error messages
3. **Check Server Logs** - API server logs show rate limiting decisions
4. **Verify Configuration** - Ensure rate limits are configured correctly
5. **Test Manually** - Use curl to make direct API requests

### Manual Testing Commands

```bash
# Test login rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/trpc/auth.login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "Status: %{http_code}\n"
  sleep 0.5
done

# Check rate limit headers
curl -i -X POST http://localhost:3000/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'

# Test with custom IP header
curl -X POST http://localhost:3000/api/trpc/otp.requestCode \
  -H "X-Forwarded-For: 192.168.1.100" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","purpose":"login"}'
```

---

**Last Updated**: November 2025  
**Version**: 1.0  
**Status**: Production Ready
