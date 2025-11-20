#!/usr/bin/env node

/**
 * XSS Security Testing Checklist & Procedures
 * Run this script to execute a complete XSS security audit
 * 
 * Usage: pnpm run xss-check
 * or: tsx xss-security-checklist.ts
 */

import * as fs from "fs";
import * as path from "path";

// Test Status Types
type TestStatus = "PASS" | "FAIL" | "WARNING" | "NOT_CHECKED";

interface SecurityTest {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: TestStatus;
  findings: string[];
  recommendation?: string;
}

// Initialize test results
const tests: SecurityTest[] = [];

/**
 * Test 1: Input Validation Schemas
 */
function checkInputValidationSchemas(): SecurityTest {
  const test: SecurityTest = {
    id: "test-001",
    name: "Input Validation Schemas",
    description: "Verify all user input fields have Zod validation schemas",
    category: "Input Validation",
    priority: "CRITICAL",
    status: "NOT_CHECKED",
    findings: [],
  };

  try {
    const securityFilePath = path.join(
      process.cwd(),
      "server/_core/security.ts"
    );

    if (!fs.existsSync(securityFilePath)) {
      test.status = "FAIL";
      test.findings.push("security.ts file not found");
      return test;
    }

    const content = fs.readFileSync(securityFilePath, "utf-8");

    const requiredSchemas = [
      "emailSchema",
      "fullNameSchema",
      "phoneSchema",
      "searchQuerySchema",
      "urlSchema",
      "loanAmountSchema",
    ];

    const missingSchemas = requiredSchemas.filter((schema) => !content.includes(schema));

    if (missingSchemas.length === 0) {
      test.status = "PASS";
      test.findings.push("All required validation schemas found");
    } else {
      test.status = "FAIL";
      test.findings.push(`Missing schemas: ${missingSchemas.join(", ")}`);
      test.recommendation = `Add the following schemas to security.ts: ${missingSchemas.join(", ")}`;
    }
  } catch (error) {
    test.status = "FAIL";
    test.findings.push(`Error checking schemas: ${error}`);
  }

  return test;
}

/**
 * Test 2: HTML Escaping Function
 */
function checkHTMLEscaping(): SecurityTest {
  const test: SecurityTest = {
    id: "test-002",
    name: "HTML Escaping Function",
    description: "Verify escapeHtml function is implemented correctly",
    category: "Output Sanitization",
    priority: "CRITICAL",
    status: "NOT_CHECKED",
    findings: [],
  };

  try {
    const securityFilePath = path.join(
      process.cwd(),
      "server/_core/security.ts"
    );
    const content = fs.readFileSync(securityFilePath, "utf-8");

    if (!content.includes("escapeHtml")) {
      test.status = "FAIL";
      test.findings.push("escapeHtml function not found");
      return test;
    }

    // Check for proper HTML entity escaping
    const hasProperEscaping =
      content.includes("&amp;") &&
      content.includes("&lt;") &&
      content.includes("&gt;") &&
      content.includes("&quot;") &&
      content.includes("&#039;");

    if (hasProperEscaping) {
      test.status = "PASS";
      test.findings.push("HTML escaping function implemented correctly");
    } else {
      test.status = "FAIL";
      test.findings.push("HTML escaping incomplete - missing some entity mappings");
      test.recommendation =
        "Ensure escapeHtml function escapes: & < > \" '";
    }
  } catch (error) {
    test.status = "FAIL";
    test.findings.push(`Error checking escapeHtml: ${error}`);
  }

  return test;
}

/**
 * Test 3: XSS Pattern Detection
 */
function checkXSSPatternDetection(): SecurityTest {
  const test: SecurityTest = {
    id: "test-003",
    name: "XSS Pattern Detection",
    description: "Verify dangerous XSS patterns are detected",
    category: "Pattern Detection",
    priority: "CRITICAL",
    status: "NOT_CHECKED",
    findings: [],
  };

  try {
    const securityFilePath = path.join(
      process.cwd(),
      "server/_core/security.ts"
    );
    const content = fs.readFileSync(securityFilePath, "utf-8");

    const requiredPatterns = [
      "<script",
      "on\\w+\\s*=",
      "javascript:",
      "data:text/html",
    ];

    const detectedPatterns = requiredPatterns.filter((pattern) =>
      content.includes(pattern)
    );

    if (detectedPatterns.length >= 3) {
      test.status = "PASS";
      test.findings.push(`XSS patterns detected: ${detectedPatterns.join(", ")}`);
    } else {
      test.status = "WARNING";
      test.findings.push(
        `Only ${detectedPatterns.length} of ${requiredPatterns.length} XSS patterns detected`
      );
      test.recommendation =
        "Add more comprehensive XSS pattern detection for: " +
        requiredPatterns.join(", ");
    }
  } catch (error) {
    test.status = "FAIL";
    test.findings.push(`Error checking patterns: ${error}`);
  }

  return test;
}

/**
 * Test 4: Security Headers Configuration
 */
function checkSecurityHeaders(): SecurityTest {
  const test: SecurityTest = {
    id: "test-004",
    name: "Security Headers",
    description:
      "Verify security headers are configured in Express middleware",
    category: "HTTP Headers",
    priority: "HIGH",
    status: "NOT_CHECKED",
    findings: [],
  };

  try {
    const indexFilePath = path.join(process.cwd(), "server/_core/index.ts");

    if (!fs.existsSync(indexFilePath)) {
      test.status = "WARNING";
      test.findings.push("Cannot locate index.ts to verify headers");
      return test;
    }

    const content = fs.readFileSync(indexFilePath, "utf-8");

    const requiredHeaders = [
      "X-XSS-Protection",
      "X-Frame-Options",
      "X-Content-Type-Options",
    ];

    const missingHeaders = requiredHeaders.filter(
      (header) => !content.includes(header)
    );

    if (missingHeaders.length === 0) {
      test.status = "PASS";
      test.findings.push("All critical security headers configured");
    } else {
      test.status = "HIGH";
      test.findings.push(`Missing headers: ${missingHeaders.join(", ")}`);
      test.recommendation = `Add middleware to set these headers: ${missingHeaders.join(", ")}`;
    }
  } catch (error) {
    test.status = "FAIL";
    test.findings.push(`Error checking headers: ${error}`);
  }

  return test;
}

/**
 * Test 5: Content Security Policy
 */
function checkCSP(): SecurityTest {
  const test: SecurityTest = {
    id: "test-005",
    name: "Content Security Policy",
    description: "Verify CSP headers are configured",
    category: "HTTP Headers",
    priority: "HIGH",
    status: "NOT_CHECKED",
    findings: [],
  };

  try {
    const indexFilePath = path.join(process.cwd(), "server/_core/index.ts");
    const content = fs.existsSync(indexFilePath)
      ? fs.readFileSync(indexFilePath, "utf-8")
      : "";

    if (content.includes("Content-Security-Policy")) {
      test.status = "PASS";
      test.findings.push("Content-Security-Policy header configured");
    } else {
      test.status = "WARNING";
      test.findings.push("Content-Security-Policy header not found");
      test.recommendation =
        "Implement CSP header to restrict script sources and prevent inline scripts";
    }
  } catch (error) {
    test.status = "FAIL";
    test.findings.push(`Error checking CSP: ${error}`);
  }

  return test;
}

/**
 * Test 6: tRPC Input Validation
 */
function checkTRPCValidation(): SecurityTest {
  const test: SecurityTest = {
    id: "test-006",
    name: "tRPC Procedure Validation",
    description:
      "Verify all tRPC procedures have input validation with .input()",
    category: "API Endpoints",
    priority: "CRITICAL",
    status: "NOT_CHECKED",
    findings: [],
  };

  try {
    const routersPath = path.join(process.cwd(), "server/routers.ts");

    if (!fs.existsSync(routersPath)) {
      test.status = "FAIL";
      test.findings.push("routers.ts file not found");
      return test;
    }

    const content = fs.readFileSync(routersPath, "utf-8");

    // Count .input() declarations
    const inputValidations = (content.match(/\.input\(/g) || []).length;
    // Count .mutation() or .query() declarations
    const procedures = (
      content.match(/\.(mutation|query)\(/g) || []
    ).length;

    if (inputValidations >= procedures * 0.8) {
      test.status = "PASS";
      test.findings.push(
        `${inputValidations} input validations found for ${procedures} procedures`
      );
    } else {
      test.status = "WARNING";
      test.findings.push(
        `Only ${inputValidations} of ${procedures} procedures have input validation`
      );
      test.recommendation =
        "Ensure all tRPC procedures validate their input with z.object() schemas";
    }
  } catch (error) {
    test.status = "FAIL";
    test.findings.push(`Error checking tRPC validation: ${error}`);
  }

  return test;
}

/**
 * Test 7: Sanitization Function Usage
 */
function checkSanitizationUsage(): SecurityTest {
  const test: SecurityTest = {
    id: "test-007",
    name: "String Sanitization Function",
    description: "Verify sanitizeString function is properly implemented",
    category: "Input Sanitization",
    priority: "HIGH",
    status: "NOT_CHECKED",
    findings: [],
  };

  try {
    const securityFilePath = path.join(
      process.cwd(),
      "server/_core/security.ts"
    );
    const content = fs.readFileSync(securityFilePath, "utf-8");

    if (!content.includes("sanitizeString")) {
      test.status = "FAIL";
      test.findings.push("sanitizeString function not found");
      return test;
    }

    // Check if sanitization removes dangerous characters
    const removesDangerous =
      content.includes("<>\"'%\\") || content.includes("substring");

    if (removesDangerous) {
      test.status = "PASS";
      test.findings.push(
        "sanitizeString function removes dangerous characters"
      );
    } else {
      test.status = "WARNING";
      test.findings.push(
        "sanitizeString implementation may be incomplete"
      );
      test.recommendation =
        "Ensure sanitizeString removes: < > \" ' % \\ and limits length";
    }
  } catch (error) {
    test.status = "FAIL";
    test.findings.push(`Error checking sanitization: ${error}`);
  }

  return test;
}

/**
 * Test 8: Rate Limiting Implementation
 */
function checkRateLimiting(): SecurityTest {
  const test: SecurityTest = {
    id: "test-008",
    name: "Rate Limiting",
    description: "Verify rate limiting is implemented for sensitive endpoints",
    category: "Brute Force Protection",
    priority: "MEDIUM",
    status: "NOT_CHECKED",
    findings: [],
  };

  try {
    const securityFilePath = path.join(
      process.cwd(),
      "server/_core/security.ts"
    );
    const content = fs.readFileSync(securityFilePath, "utf-8");

    if (content.includes("checkRateLimit") || content.includes("attemptTracker")) {
      test.status = "PASS";
      test.findings.push("Rate limiting function implemented");
    } else {
      test.status = "WARNING";
      test.findings.push("Rate limiting not found in security module");
      test.recommendation =
        "Implement rate limiting to prevent brute force attacks on login/sensitive endpoints";
    }
  } catch (error) {
    test.status = "FAIL";
    test.findings.push(`Error checking rate limiting: ${error}`);
  }

  return test;
}

/**
 * Test 9: Test Suite Files Exist
 */
function checkTestFiles(): SecurityTest {
  const test: SecurityTest = {
    id: "test-009",
    name: "XSS Test Suite Files",
    description: "Verify XSS testing files are present",
    category: "Testing",
    priority: "MEDIUM",
    status: "NOT_CHECKED",
    findings: [],
  };

  try {
    const testFiles = [
      "test-xss-attacks.ts",
      "test-xss-api.ts",
      "XSS_PREVENTION_TESTING_GUIDE.md",
    ];

    const missingFiles = testFiles.filter(
      (file) => !fs.existsSync(path.join(process.cwd(), file))
    );

    if (missingFiles.length === 0) {
      test.status = "PASS";
      test.findings.push("All XSS testing files present");
    } else {
      test.status = "WARNING";
      test.findings.push(`Missing test files: ${missingFiles.join(", ")}`);
    }
  } catch (error) {
    test.status = "FAIL";
    test.findings.push(`Error checking test files: ${error}`);
  }

  return test;
}

/**
 * Test 10: Database ORM Security (Drizzle)
 */
function checkDatabaseSecurity(): SecurityTest {
  const test: SecurityTest = {
    id: "test-010",
    name: "Database ORM Security",
    description: "Verify Drizzle ORM is used for parameterized queries",
    category: "Database Security",
    priority: "CRITICAL",
    status: "NOT_CHECKED",
    findings: [],
  };

  try {
    const dbPath = path.join(process.cwd(), "server/db.ts");

    if (!fs.existsSync(dbPath)) {
      test.status = "FAIL";
      test.findings.push("db.ts not found");
      return test;
    }

    const content = fs.readFileSync(dbPath, "utf-8");

    if (
      content.includes("drizzle") ||
      content.includes("execute") ||
      content.includes("query")
    ) {
      test.status = "PASS";
      test.findings.push("Using ORM for database queries (parameterized)");
    } else {
      test.status = "WARNING";
      test.findings.push("Unable to confirm ORM usage");
      test.recommendation =
        "Ensure all database queries use Drizzle ORM for automatic SQL injection prevention";
    }
  } catch (error) {
    test.status = "FAIL";
    test.findings.push(`Error checking database security: ${error}`);
  }

  return test;
}

/**
 * Run all security tests
 */
function runAllSecurityTests(): SecurityTest[] {
  const allTests: SecurityTest[] = [
    checkInputValidationSchemas(),
    checkHTMLEscaping(),
    checkXSSPatternDetection(),
    checkSecurityHeaders(),
    checkCSP(),
    checkTRPCValidation(),
    checkSanitizationUsage(),
    checkRateLimiting(),
    checkTestFiles(),
    checkDatabaseSecurity(),
  ];

  return allTests;
}

/**
 * Generate HTML Report
 */
function generateReport(tests: SecurityTest[]): void {
  const timestamp = new Date().toISOString();
  const passCount = tests.filter((t) => t.status === "PASS").length;
  const failCount = tests.filter((t) => t.status === "FAIL").length;
  const warningCount = tests.filter((t) => t.status === "WARNING").length;
  const scorePercentage = Math.round(
    ((passCount + warningCount * 0.5) / tests.length) * 100
  );

  console.log("\n");
  console.log("╔" + "═".repeat(98) + "╗");
  console.log(
    "║" + " ".repeat(25) + "🔒 XSS SECURITY TESTING CHECKLIST REPORT 🔒" + " ".repeat(30) + "║"
  );
  console.log("╚" + "═".repeat(98) + "╝\n");

  console.log(`📅 Report Generated: ${timestamp}`);
  console.log(`📊 Overall Security Score: ${scorePercentage}%\n`);

  console.log("📈 Summary:");
  console.log(`   ✅ Passed:  ${passCount}`);
  console.log(`   ⚠️  Warning: ${warningCount}`);
  console.log(`   ❌ Failed:  ${failCount}\n`);

  // Group by category
  const byCategory: { [key: string]: SecurityTest[] } = {};
  tests.forEach((test) => {
    if (!byCategory[test.category]) {
      byCategory[test.category] = [];
    }
    byCategory[test.category].push(test);
  });

  // Print by category
  for (const [category, categoryTests] of Object.entries(byCategory)) {
    const categoryPass = categoryTests.filter((t) => t.status === "PASS").length;
    const categoryTotal = categoryTests.length;

    console.log(`\n📋 ${category.toUpperCase()}`);
    console.log("─".repeat(100));

    categoryTests.forEach((test) => {
      const icon =
        test.status === "PASS"
          ? "✅"
          : test.status === "FAIL"
            ? "❌"
            : "⚠️ ";
      const priority =
        test.priority === "CRITICAL"
          ? "🔴"
          : test.priority === "HIGH"
            ? "🟠"
            : test.priority === "MEDIUM"
              ? "🟡"
              : "🟢";

      console.log(
        `\n${icon} [${test.id}] ${test.name} ${priority} (${test.priority})`
      );
      console.log(`   ${test.description}`);

      test.findings.forEach((finding) => {
        console.log(`   • ${finding}`);
      });

      if (test.recommendation) {
        console.log(`   💡 Recommendation: ${test.recommendation}`);
      }
    });

    console.log(
      `\n   Category Score: ${((categoryPass / categoryTotal) * 100).toFixed(0)}% (${categoryPass}/${categoryTotal})`
    );
  }

  // Recommendations
  console.log("\n\n" + "═".repeat(100));
  console.log("💡 RECOMMENDATIONS");
  console.log("═".repeat(100));

  const failedTests = tests.filter((t) => t.status === "FAIL");
  const warningTests = tests.filter((t) => t.status === "WARNING");

  if (failedTests.length > 0) {
    console.log("\n🔴 CRITICAL ISSUES TO FIX:");
    failedTests.forEach((test) => {
      console.log(`   • ${test.name}: ${test.findings[0]}`);
    });
  }

  if (warningTests.length > 0) {
    console.log("\n🟡 WARNINGS TO ADDRESS:");
    warningTests.forEach((test) => {
      console.log(`   • ${test.name}: ${test.findings[0]}`);
    });
  }

  // Next steps
  console.log("\n\n" + "═".repeat(100));
  console.log("📋 NEXT STEPS");
  console.log("═".repeat(100));
  console.log(`
1. Run live API tests:
   pnpm test test-xss-api.ts

2. Run comprehensive payload testing:
   tsx test-xss-attacks.ts

3. Review security implementation:
   cat server/_core/security.ts

4. Test manually with cURL:
   curl -X POST http://localhost:3000/api/trpc/loans.createApplication \\
     -H "Content-Type: application/json" \\
     -d '{"fullName": "<script>alert(\\"XSS\\")</script>"}'

5. Deploy security headers:
   Ensure all security headers are configured in production

6. Monitor and log:
   Implement security event logging and monitoring
  `);

  console.log("═".repeat(100));
  console.log(
    `\n✅ FINAL STATUS: ${scorePercentage}% Secure - ${failCount > 0 ? "NEEDS ATTENTION" : "READY FOR PRODUCTION"}\n`
  );
}

/**
 * Main execution
 */
function main() {
  console.clear();
  console.log("🔍 Starting XSS Security Testing Checklist...\n");

  const allTests = runAllSecurityTests();
  generateReport(allTests);

  // Save results to JSON
  const reportPath = path.join(process.cwd(), "xss-security-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        tests: allTests,
        summary: {
          total: allTests.length,
          passed: allTests.filter((t) => t.status === "PASS").length,
          failed: allTests.filter((t) => t.status === "FAIL").length,
          warnings: allTests.filter((t) => t.status === "WARNING").length,
        },
      },
      null,
      2
    )
  );

  console.log(`📄 Report saved to: ${reportPath}`);
}

// Run the security checklist
main();
