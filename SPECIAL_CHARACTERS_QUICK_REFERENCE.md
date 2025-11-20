# Special Characters Testing - Quick Reference Guide

## At a Glance

**Total Test Cases**: 69+  
**Test Files**: 4 (TypeScript, Python, PowerShell, Bash)  
**Documentation**: This guide + Comprehensive guide  
**Estimated Runtime**: 5-12 seconds per platform  

---

## 🚀 Quick Start Commands

### TypeScript/Vitest (Fastest - Recommended)
```bash
pnpm test test-special-characters-api.ts
```
**Pros**: Fastest, integrated with dev environment  
**Cons**: Requires Node.js setup

### Python (Most Comprehensive)
```bash
pip install requests
python3 test-special-characters-scanner.py --url http://localhost:3000/api/trpc
```
**Pros**: Generates HTML & JSON reports  
**Cons**: Requires Python 3.7+

### Windows PowerShell
```powershell
.\test-special-characters-endpoints.ps1 -ApiUrl "http://localhost:3000/api/trpc/loans.submit"
```
**Pros**: Native Windows support  
**Cons**: Execution policy may need adjustment

### macOS / Linux Bash
```bash
chmod +x test-special-characters-endpoints.sh
./test-special-characters-endpoints.sh "http://localhost:3000/api/trpc/loans.submit"
```
**Pros**: Universal Unix support  
**Cons**: curl required

---

## ✅ What Gets Tested

| Category | Examples | Count | Status |
|----------|----------|-------|--------|
| Unicode | French, Cyrillic, Chinese, Arabic, Hebrew | 7 | ✓ |
| Safe Chars | Hyphens, apostrophes, periods, commas | 5 | ✓ |
| HTML Entities | `<`, `>`, `&`, quotes | 3 | ✓ |
| SQL Injection | Single quote, OR clause, semicolon | 3 | ✓ |
| XSS Patterns | Script tags, img handlers, events | 3 | ✓ |
| Whitespace | Leading/trailing, multiple spaces, tabs | 3 | ✓ |
| Currency/Math | $, %, ±, +, =, etc. | 2 | ✓ |
| Emoji/Symbols | 😀, ✅, ❌, arrows | 1 | ✓ |

---

## 📊 Expected Results

### Success Indicators ✓
- HTTP 200 response
- `"success": true` in JSON
- Characters preserved or safely escaped
- No application crashes
- Response time < 1 second

### Failure Indicators ✗
- HTTP 4xx/5xx errors
- `"success": false`
- Character corruption
- Generic error message (security good)

---

## 🔍 Test Execution Examples

### Example 1: French Characters
```
Input:  fullName: "Jean-Claude François"
Output: "Jean-Claude François"
Result: ✓ PASS
```

### Example 2: SQL Injection Attempt
```
Input:  fullName: "Robert'; DROP TABLE--"
Output: "Robert'; DROP TABLE--" (stored as string, NOT executed)
Result: ✓ PASS (safely handled)
```

### Example 3: XSS Attempt
```
Input:  loanPurpose: "<script>alert('xss')</script>"
Output: Escaped to "&lt;script&gt;..." OR removed
Result: ✓ PASS (neutralized)
```

### Example 4: Safe Symbols
```
Input:  employer: "O'Malley & Associates, Inc."
Output: "O'Malley & Associates, Inc."
Result: ✓ PASS
```

---

## 📋 Character Categories Tested

### 1. International (Unicode)
```
French:    café, naïve, résumé
German:    Müller, über, Straße
Russian:   Владимир, Петровский, Москва
Chinese:   王小明, 北京, 中国公司
Japanese:  山田太郎, 東京
Arabic:    محمد علي, القاهرة
Hebrew:    דוד כהן, תל אביב
```

### 2. Punctuation (Safe)
```
Hyphens:       Mary-Ann, O'Brien-Smith
Apostrophes:   O'Reilly, O'Malley, John's
Periods:       St., Inc., Ltd.
Commas:        Suite 200, Building A, etc.
Ampersands:    Smith & Associates, Tech & Co.
Parentheses:   (Phase 1), [Section B], {2024}
```

### 3. Dangerous (Tested for Escape)
```
HTML:  <script>, <img>, onerror=, onclick=
SQL:   '; DROP, ' OR '1'='1, --, ;
Chars: <, >, &, ', "
```

### 4. Numbers & Symbols
```
Currency:  $, €, £, ¥, ₹
Math:      ±, +, -, *, /, =, <, >
Percent:   %
Arrows:    →, ←, ↑, ↓
```

---

## 🎯 Pass Criteria

**For each test case:**

| Check | Requirement | Success Criteria |
|-------|------------|-----------------|
| Acceptance | Input accepted | HTTP 200 or accepted error |
| Preservation | Characters stored | Correct UTF-8 in database |
| Security | No injection | Commands not executed |
| Response | Data returned | Response matches input (or safely escaped) |
| Time | Performance | Response < 1 second |

**Overall Success**: 100% of tests must pass for full credit

---

## 📈 Reading Test Results

### From JSON Report
```json
{
  "totalTests": 69,
  "passed": 65,
  "failed": 4,
  "passRate": 94.2,
  "results": [
    {
      "testName": "unicode_accents",
      "description": "Unicode and accented characters",
      "success": true,
      "statusCode": 200,
      "htmlEscaping": {
        "angle_brackets_escaped": true,
        "script_tags_removed": true
      }
    }
  ]
}
```

### From HTML Report
- 📊 Visual pass/fail indicators
- ⏱️ Response time metrics
- 🔍 Character preservation details
- 🛡️ Escaping verification

---

## ⚠️ Common Issues & Fixes

### Issue: Connection Refused
```
Error: ECONNREFUSED 127.0.0.1:3000
```
**Fix**: 
```bash
pnpm dev  # Start development server
```

### Issue: "Invalid Input"
**Fix**: Verify in request:
- Email format is valid
- Phone has 10+ digits
- Password has 8+ chars
- State is 2 letters
- Enum values are correct

### Issue: Character Shows as ???
**Fix** (Windows):
```powershell
chcp 65001  # Switch to UTF-8 code page
```

### Issue: Script Won't Execute (PowerShell)
**Fix**:
```powershell
powershell -ExecutionPolicy Bypass -File test-special-characters-endpoints.ps1
```

### Issue: Permission Denied (Bash)
**Fix**:
```bash
chmod +x test-special-characters-endpoints.sh
```

---

## 📱 Platform Differences

| Feature | TypeScript | Python | PowerShell | Bash |
|---------|-----------|--------|-----------|------|
| Speed | ⚡ Fastest | 🐢 Slow | 🐢 Slow | 🐢 Slow |
| Reports | Terminal | JSON+HTML | JSON | JSON |
| Cross-platform | ✓ | ✓ | Windows | Unix |
| Setup | npm install | pip install | None | None |
| Best For | Dev, CI/CD | Analysis | Windows | Linux/Mac |

---

## 🔐 Security Checks

### SQL Injection Prevention ✓
- Input: `Robert'; DROP TABLE--`
- Result: Stored as literal string
- Validation: Parameterized queries prevent execution

### XSS Prevention ✓
- Input: `<script>alert('xss')</script>`
- Result: Either removed or escaped to `&lt;script&gt;`
- Validation: No script execution

### Authentication ✓
- All requests use authenticated session
- Authorization middleware enforced
- Invalid tokens rejected

### Rate Limiting ✓
- Excessive requests blocked
- Per-IP throttling active
- Tested in separate suite

---

## 📝 Test Case Reference

### Core Test Fields

**Always tested:**
- `fullName` - Text field (special chars)
- `street` - Text field (special chars)
- `city` - Text field (special chars)
- `employer` - Text field (special chars)
- `loanPurpose` - Text field (special chars)

**Format restricted (NOT fully tested):**
- `dateOfBirth` - Regex: YYYY-MM-DD
- `ssn` - Regex: XXX-XX-XXXX
- `state` - Length: 2 only
- `zipCode` - Length: 5+

**Enum restricted (NOT tested):**
- `employmentStatus` - Fixed values only
- `loanType` - Fixed values only
- `disbursementMethod` - Fixed values only

---

## 🎬 Sample Test Execution

```bash
$ pnpm test test-special-characters-api.ts

✓ test-special-characters-api.ts (69)
  ✓ Unicode and Accented Characters (7)
    ✓ should accept French accented characters
    ✓ should accept Spanish special characters
    ✓ should accept German umlauts
    ✓ should accept Cyrillic characters
    ✓ should accept Chinese characters
    ✓ should accept Japanese characters
    ✓ should accept Arabic characters
  ✓ Safe Special Characters (5)
    ✓ should accept hyphens and apostrophes
    ✓ should accept periods and commas
    ✓ should accept ampersand
    ✓ should accept parentheses
    ✓ should accept slashes
  ✓ HTML/XML Special Characters (3)
    ✓ should handle less-than and greater-than
    ✓ should handle ampersand
    ✓ should handle quotes
  ✓ SQL Injection Patterns (3)
    ✓ should reject SQL injection in full name
    ✓ should reject OR clause injection
    ✓ should handle semicolon in text
  ✓ Script Injection Patterns (3)
    ✓ should sanitize script tags
    ✓ should sanitize onclick handlers
    ✓ should handle javascript protocol
  ✓ Mixed Character Sets (5)
    ✓ should accept mixed English and French
    ✓ should accept mixed special characters
    ✓ should accept numbers with special chars
  ✓ Currency Symbols (3)
    ✓ should handle dollar sign
    ✓ should handle percentage symbol
    ✓ should handle mathematical operators
  ✓ Whitespace and Control (3)
    ✓ should handle leading/trailing spaces
    ✓ should handle multiple spaces
    ✓ should handle tabs
  ✓ Emoji and Symbols (3)
    ✓ should handle emoji in names
    ✓ should handle status markers
  ✓ Edge Cases (3)
    ✓ should handle comprehensive combinations

Tests: 69 passed
Duration: 5.234s
```

---

## 🔗 Integration Points

### Environment Variables
```
API_URL=http://localhost:3000/api/trpc
JWT_SECRET=your-secret
DATABASE_URL=mysql://user:pass@localhost/db
```

### Response Format
```typescript
{
  success: boolean,
  data?: {
    fullName: string,
    email: string,
    street: string,
    city: string,
    employer?: string,
    loanPurpose: string,
    id: string,
    createdAt: string
  },
  error?: string,
  timestamp: string
}
```

---

## 📚 Documentation Links

- **Full Guide**: See `SPECIAL_CHARACTERS_TESTING_GUIDE.md`
- **API Docs**: See `API_DOCUMENTATION.md`
- **Schema**: See `DATABASE_SCHEMA.md`
- **Other Tests**:
  - Unauthorized Access: `test-unauthorized-access-*`
  - Sensitive Data: `test-sensitive-data-*`
  - Rate Limiting: `test-rate-limiting-*`
  - Boundary Conditions: `test-boundary-conditions-*`

---

## 💡 Pro Tips

1. **Run all platforms** for comprehensive coverage
2. **Check JSON reports** for detailed analysis
3. **Look for patterns** in failures
4. **Test before deployment** to catch issues early
5. **Update test data** when schema changes
6. **Monitor response times** for performance regressions
7. **Integrate with CI/CD** for automated validation

---

## ✨ Success Checklist

- [ ] All 69 tests pass
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities  
- [ ] Unicode characters preserved
- [ ] Special characters handled safely
- [ ] Response time < 1 second per request
- [ ] Error messages are generic (no info leakage)
- [ ] Database integrity maintained
- [ ] All platforms show green status
- [ ] Reports generated successfully

---

**Quick Ref Version**: 1.0  
**Last Updated**: 2024  
**Total Tests**: 69+  
**Estimated Time**: 5-12 seconds  
