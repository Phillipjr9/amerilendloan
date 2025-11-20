# Sensitive Data Exposure Testing - Quick Reference

## 🚀 Quick Start (Choose One)

### Windows PowerShell
```powershell
powershell -ExecutionPolicy Bypass -File test-sensitive-data-endpoints.ps1
```

### Linux/macOS Bash
```bash
bash test-sensitive-data-endpoints.sh
```

### Node.js/TypeScript
```bash
pnpm test test-sensitive-data-api.ts
pnpm test test-sensitive-data-exposure.ts
```

### Python
```bash
python test-sensitive-data-scanner.py
```

## 📋 What Gets Tested

### 🔴 CRITICAL (Must Never Expose)
| Item | Bad Example | Good Example |
|------|-------------|--------------|
| **Password** | `password: "secret123"` | Generic error message |
| **JWT Token** | `eyJ...` visible in response | Not included |
| **Session ID** | `session_id: "abc123..."` | Not exposed |
| **SSN** | `123-45-6789` | `***-**-6789` |
| **Bank Account** | `0123456789` | `****6789` |
| **Credit Card** | `4532-1111-2222-3333` | `****3333` |

### 🟠 HIGH (Should Not Expose)
| Item | What Not to Do |
|------|---------------|
| **Stack Traces** | Don't show `at Function (file.ts:123:45)` |
| **File Paths** | Don't show `/home/user/server/index.ts` |
| **DB URLs** | Don't show `postgresql://user:pass@host:5432` |
| **SQL Queries** | Don't show `SELECT * FROM users WHERE...` |
| **AWS Keys** | Don't show `AKIA...` or secrets |

## 📊 Test Results

### ✅ PASS (Want This)
```
✓ PASS: Failed Login - No Password Exposure
✓ PASS: User Profile - No Full PII Exposure
✓ PASS: Payment Data - Card Numbers Masked
✓ PASS: Database Error - Connection Details Protected
✓ PASS: OTP Endpoint - Code not exposed
```

### ❌ FAIL (Fix This)
```
✗ FAIL: Database Error: Connection details exposed
✗ FAIL: OTP Endpoint: Code exposed in response
✗ FAIL: Payment Data: Full credit card number exposed
```

## 🔍 Detection Patterns

### Passwords
```
password["\']?\s*[:=]\s*["\'][^"\']*["\']
pwd["\']?\s*[:=]\s*["\'][^"\']*["\']
```

### Tokens
```
eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+  # JWT
AKIA[0-9A-Z]{16}                                      # AWS
```

### PII
```
\d{3}-\d{2}-\d{4}                              # SSN
\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}         # Credit Card
```

### Internal
```
at\s+\w+\s+\([^)]*:\d+:\d+\)                   # Stack Trace
(postgresql|mysql)://.*:.*@                    # DB Connection
```

## 📁 Test Files

| File | Type | Tests | Run Command |
|------|------|-------|------------|
| `test-sensitive-data-api.ts` | TypeScript | 30+ | `pnpm test test-sensitive-data-api.ts` |
| `test-sensitive-data-exposure.ts` | TypeScript | 23+ | `pnpm test test-sensitive-data-exposure.ts` |
| `test-sensitive-data-scanner.py` | Python | Suite | `python test-sensitive-data-scanner.py` |
| `test-sensitive-data-endpoints.ps1` | PowerShell | 8 | `powershell -ExecutionPolicy Bypass -File test-sensitive-data-endpoints.ps1` |
| `test-sensitive-data-endpoints.sh` | Bash | 8 | `bash test-sensitive-data-endpoints.sh` |

## 🛡️ Security Layers

```
Layer 1: Input Validation
├─ Zod schemas
├─ Type checking
└─ Format validation

Layer 2: Error Handling
├─ Generic messages
├─ No system details
├─ Consistent format
└─ Server-side logging

Layer 3: Data Masking
├─ SSN → ***-**-6789
├─ Phone → ***-***-4567
├─ Card → ****3333
└─ DOB → fully masked

Layer 4: Access Control
├─ Protected procedures
├─ Role-based checks
├─ User ownership validation
└─ Data isolation

Layer 5: Logging & Monitoring
├─ No passwords logged
├─ No tokens logged
├─ No PII in logs
└─ Audit trail
```

## 🎯 Test Scenarios

### Authentication
- ✅ Failed login (no password exposure)
- ✅ Duplicate signup (no email details)
- ✅ Invalid OTP (code not exposed)

### User Data
- ✅ Profile retrieval (SSN masked)
- ✅ Bank info (account masked)
- ✅ Personal details (DOB protected)

### Payments
- ✅ Card data (only last 4 digits)
- ✅ Payment methods (no CVV)
- ✅ Transaction history (masked amounts)

### Errors
- ✅ Database errors (no connection string)
- ✅ Validation errors (input not echoed)
- ✅ Server errors (no stack traces)

## 📈 Expected Results

| Test Category | Expected | Status |
|--------------|----------|--------|
| Passwords Protected | 100% | ✅ |
| Tokens Hidden | 100% | ✅ |
| PII Masked | 95%+ | ✅ |
| Error Messages Generic | 100% | ✅ |
| Stack Traces Hidden | 100% | ✅ |
| DB Credentials Protected | 100% | ✅ |

## 🔐 Masking Examples

### SSN (Social Security Number)
```
Raw:    123-45-6789
Masked: ***-**-6789
```

### Phone
```
Raw:    555-123-4567
Masked: ***-***-4567
```

### Bank Account
```
Raw:    0123456789
Masked: ****6789
```

### Credit Card
```
Raw:    4532-1111-2222-3333
Masked: ****3333
```

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| JWT exposed in response | Remove from response, send as HTTP-only cookie |
| SSN exposed | Apply regex masking: keep only last 4 digits |
| Password in error | Never include password, use generic message |
| Stack trace exposed | Catch error, return generic message, log server-side |
| DB URL exposed | Don't include connection details, use error codes |

## 📋 Compliance

- ✅ **OWASP** - Sensitive Data Exposure (A3:2021)
- ✅ **PCI-DSS** - Payment card protection
- ✅ **GDPR** - Personal data protection
- ✅ **CCPA** - Consumer privacy
- ✅ **SOC 2** - Information security

## 🚦 Traffic Light Status

| Status | Meaning | Action |
|--------|---------|--------|
| 🟢 GREEN | All tests pass | No action needed |
| 🟡 YELLOW | Some warnings | Review findings |
| 🔴 RED | Critical issues | Fix immediately |

## 📞 Support

**For Issues:**
1. Check detailed logs
2. Review test output
3. Consult documentation
4. Contact security team

**Log Files:**
- `sensitive-data-test-results.txt` - Detailed results
- `sensitive-data-test-log.txt` - Execution log

## 🎓 Learn More

- Full Guide: `SENSITIVE_DATA_EXPOSURE_TESTING_GUIDE.md`
- Test Summary: `SENSITIVE_DATA_EXPOSURE_TEST_SUMMARY.md`
- API Docs: `API_ERROR_HANDLING.md`
- Security Guide: `SECURITY_USAGE_GUIDE.md`

## ✨ Key Takeaways

1. **Never expose passwords** - Use generic error messages
2. **Always mask PII** - Show only last 4 digits/characters
3. **Hide system details** - No stack traces or file paths
4. **Protect tokens** - Don't include in responses
5. **Test regularly** - Run suite weekly or monthly
6. **Log securely** - Never log sensitive data
7. **Validate input** - Reject invalid formats early
8. **Control access** - Use proper auth/authz

---

**Version:** 1.0  
**Created:** November 20, 2025  
**Test Files:** 5  
**Total Tests:** 70+  
**Patterns:** 30+
