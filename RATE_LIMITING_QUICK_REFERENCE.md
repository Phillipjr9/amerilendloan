# Rate Limiting API Security - Quick Reference

## Quick Start (30 seconds)

### Run Tests Now

**TypeScript/Vitest** (Recommended):
```bash
pnpm test test-rate-limiting-api.ts
```

**Python** (Most detailed):
```bash
python test-rate-limiting-scanner.py
```

**PowerShell** (Windows):
```powershell
powershell -ExecutionPolicy Bypass -File test-rate-limiting-endpoints.ps1
```

**Bash** (Linux/macOS):
```bash
bash test-rate-limiting-endpoints.sh
```

---

## Rate Limit Rules

| Endpoint | Limit | Window | Per |
|----------|-------|--------|-----|
| `auth.login` | 5 failed | 15 min | Email |
| `otp.requestCode` | 3 | 5 min | Email |
| | 10 | 1 hour | IP |
| `otp.verifyCode` | 5 | Code lifetime | Code |
| `loans.search` | 20 | 1 hour | IP |
| `payments.create` | 50 | 1 hour | User |

---

## Expected Test Results

### Success (PASSED)
```
✓ NO VIOLATIONS FOUND

Login endpoint properly rate limited
OTP endpoint properly rate limited
Concurrent requests blocked after limit
Retry-After headers present in 429 responses
IP headers extracted correctly
Error responses safe (no sensitive data)
```

### Failure (FAILED)
```
✗ VIOLATIONS FOUND: N

Login endpoint not properly rate limited
OTP endpoint not properly rate limited
Concurrent requests not properly handled
Rate limit responses missing Retry-After header
IP header extraction not working properly
Rate limit error responses may leak sensitive data
```

---

## Rate Limit Response

### HTTP 429 Too Many Requests

**Headers**:
```
HTTP/1.1 429 Too Many Requests

X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1700500860
Retry-After: 59
```

**Body**:
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Too many requests. Please try again later."
  },
  "timestamp": "2025-11-20T10:30:00Z"
}
```

**What to Do**:
- Wait 59 seconds (from Retry-After header)
- Check X-RateLimit-Reset for exact time
- Don't retry immediately
- Verify your use case (may indicate attack)

---

## Test File Descriptions

### `test-rate-limiting-api.ts` (Vitest)
- **Lines**: 750+
- **Tests**: 50+
- **Run**: `pnpm test test-rate-limiting-api.ts`
- **Format**: Unit and integration tests
- **Best for**: CI/CD, comprehensive validation

**Covers**:
- IP tracking and distinction
- Time window management
- Rate limit enforcement
- Login/OTP/Search limits
- Error response safety
- Recovery after window expiration

### `test-rate-limiting-scanner.py` (Python)
- **Lines**: 600+
- **Purpose**: Automated API testing with real HTTP requests
- **Run**: `python test-rate-limiting-scanner.py`
- **Format**: Concurrent requests with analysis
- **Best for**: Production testing, detailed metrics

**Tests**:
- Login rate limiting (10 attempts)
- OTP rate limiting (5 attempts)
- Concurrent requests (parallel threads)
- Retry-After header validation
- IP header extraction
- Error response safety

**Output**:
- Console: Colored progress with status
- File: `rate-limiting-test-results.txt`

### `test-rate-limiting-endpoints.ps1` (PowerShell)
- **Lines**: 500+
- **Run**: `powershell -ExecutionPolicy Bypass -File test-rate-limiting-endpoints.ps1`
- **Format**: Windows-native jobs with concurrent threads
- **Best for**: Windows environments, background job management

**Features**:
- Colored console output
- Background job threading
- Configurable URL and thread count
- Results saved to log file

### `test-rate-limiting-endpoints.sh` (Bash)
- **Lines**: 450+
- **Run**: `bash test-rate-limiting-endpoints.sh`
- **Format**: Unix/Linux/macOS shell scripts with curl
- **Best for**: Linux/macOS environments, CI/CD pipelines

**Features**:
- ANSI colored output
- Background processes
- Cross-platform compatibility
- Lightweight and portable

---

## Status Code Reference

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Authentication failed |
| **429** | **Too Many Requests** | **Rate limit exceeded** |
| 500 | Server Error | API server error |
| 503 | Service Unavailable | API down for maintenance |

---

## Common Commands

### Start API Server
```bash
# Development
env NODE_ENV=development pnpm dev

# Production
pnpm build
pnpm start
```

### Test Single Endpoint
```bash
# Login endpoint (should rate limit after 5)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/trpc/auth.login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 0.5
done
```

### Check Rate Limit Headers
```bash
# Make request and show all headers
curl -i -X POST http://localhost:3000/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'
```

### Test IP Header Extraction
```bash
# Test X-Forwarded-For
curl -X POST http://localhost:3000/api/trpc/otp.requestCode \
  -H "X-Forwarded-For: 192.168.1.100" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","purpose":"login"}'

# Test X-Real-IP
curl -X POST http://localhost:3000/api/trpc/otp.requestCode \
  -H "X-Real-IP: 192.168.1.101" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","purpose":"login"}'
```

---

## Troubleshooting

### "Tests Show 0% Rate Limited"

**Cause**: Rate limiting not enforced

**Fix**:
```bash
# Verify rate limiting code exists
grep -r "checkRateLimit" server/routers.ts

# Check configuration
cat server/_core/security.ts | grep -A 5 "checkRateLimit("

# Test with same test data each time
# All 10 attempts should use SAME email for login tests
```

### "Request Timeout"

**Cause**: API not running or connectivity issue

**Fix**:
```bash
# Verify API is running
curl -s http://localhost:3000/health

# Check server console for errors
# Restart: env NODE_ENV=development pnpm dev
```

### "429 But Headers Missing"

**Cause**: Error handler not setting rate limit headers

**Fix**:
```bash
# Verify headers with curl -i
curl -i -X POST http://localhost:3000/api/trpc/auth.login ...

# Check response handler adds headers
grep -r "X-RateLimit" server/_core/
```

### "Sensitive Data in Error Response"

**Cause**: Error message includes system details

**Fix**:
```bash
# Use generic error message
throw new TRPCError({
  code: 'TOO_MANY_REQUESTS',
  message: 'Too many requests. Please try again later.'
});

# Don't include: IP, attempt count, reset time, system info
```

---

## Success Criteria

✅ **Test PASSES When**:
- 429 returned after limit exceeded
- Retry-After header present
- No sensitive data in errors
- IP headers extracted correctly
- Recovery after window expires
- Concurrent requests limited properly
- Error response structure correct

❌ **Test FAILS When**:
- 200 returned after 5+ login attempts
- 429 without Retry-After header
- Error reveals: passwords, tokens, secrets
- IP not extracted from headers
- Requests allowed after limit
- All concurrent requests succeed
- Error response missing required fields

---

## Performance Expectations

### Response Times
- **Healthy**: 50-200ms average
- **Acceptable**: <500ms average
- **Concerning**: >500ms average

### Rate Limit Percentage
- **Expected**: 40-50% blocked (at limit)
- **Too Low** (<10%): Limit too high
- **Too High** (>80%): Limit too strict

### Concurrent Requests
- **Expected**: 30-50% rate limited (10 threads, 5 limit)
- **All Blocked**: Window too strict
- **None Blocked**: Rate limiting not working

---

## IP Header Priority

Order that API tries to extract client IP:

1. **X-Forwarded-For** (first IP in chain)
   ```
   X-Forwarded-For: 192.168.1.100, 10.0.0.1, 172.16.0.1
   → Extracted: 192.168.1.100
   ```

2. **X-Real-IP** (single proxy)
   ```
   X-Real-IP: 192.168.1.100
   → Extracted: 192.168.1.100
   ```

3. **CF-Connecting-IP** (Cloudflare)
   ```
   CF-Connecting-IP: 192.168.1.100
   → Extracted: 192.168.1.100
   ```

4. **Socket IP** (direct connection)
   ```
   req.socket.remoteAddress: 192.168.1.100
   → Extracted: 192.168.1.100
   ```

---

## Compliance Checklist

- ✓ OWASP OAT-010 (Credential Stuffing Prevention)
- ✓ OWASP OAT-003 (Account Enumeration Prevention)
- ✓ OWASP OAT-004 (Brute Force Attack Prevention)
- ✓ PCI-DSS Requirement 6.5.10 (Rate Limiting)
- ✓ NIST SP 800-63B Authentication Guidelines
- ✓ RFC 6585 HTTP 429 Status Code
- ✓ SOC 2 Type II Control CC7.2 (Monitoring)
- ✓ GDPR Personal Data Protection (IP anonymization)

---

## Support Resources

### Full Guide
See `RATE_LIMITING_TESTING_GUIDE.md` for:
- Architecture details
- Complete test descriptions
- CI/CD integration examples
- Advanced troubleshooting
- Compliance requirements

### Technical Summary
See `RATE_LIMITING_TEST_SUMMARY.md` for:
- Implementation details
- Code examples
- Test result interpretation
- Security best practices

### Manual Testing
```bash
# Direct API testing
curl -i -X POST http://localhost:3000/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}' \
  -H "X-Forwarded-For: 192.168.1.100"
```

---

## Key Takeaways

1. **Rate Limiting Enforced**: API properly blocks excessive requests with 429 status
2. **Multiple Layers**: Different endpoints have different limits (login, OTP, search)
3. **Safe Errors**: 429 responses don't expose sensitive system information
4. **IP Detection**: Handles proxies and various IP header formats
5. **Recovery**: Requests allowed after time window expires
6. **Standards Compliant**: Follows OWASP, PCI-DSS, NIST, RFC 6585

---

## Test Report Files

After running tests, check:
- `rate-limiting-test-results.txt` - Test output and summary
- `rate-limiting-test-log.txt` - Detailed logs
- Console output - Colored pass/fail results

All files include:
- Timestamp of test execution
- Base URL tested
- Number of violations found
- Status (PASSED/FAILED)
- Individual test results

---

**Last Updated**: November 2025  
**Version**: 1.0  
**Quick Reference - Print Friendly**
