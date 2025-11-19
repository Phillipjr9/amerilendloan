## Error Handling & Server Error Simulation Testing Guide

### Overview

This guide provides comprehensive error handling with server error simulation capabilities for testing error scenarios, recovery mechanisms, and client error handling logic without needing actual failing services.

### Key Features

- ✅ **Error Simulation Registry** - Control which endpoints return errors
- ✅ **Mock Services** - Payment, Email, SMS, Database, External APIs
- ✅ **Failure Rate Simulation** - Simulate percentage-based failures (0-100%)
- ✅ **Network Delay Simulation** - Test timeout handling
- ✅ **Multiple Error Types** - 16+ error types with proper HTTP status codes
- ✅ **Comprehensive Test Suite** - 30+ test cases covering all scenarios
- ✅ **Environment Safe** - Only works in test environment

### Quick Start

#### 1. Enable Error Simulation

```typescript
import { errorSimulationRegistry } from "@/server/_core/error-simulation";

// In test file
beforeEach(() => {
  errorSimulationRegistry.enableSimulation();
});

afterEach(() => {
  errorSimulationRegistry.disableSimulation();
  errorSimulationRegistry.clearAllErrorSimulations();
});
```

#### 2. Register Endpoint Error

```typescript
// Simulate 500 error on auth.signIn endpoint
errorSimulationRegistry.registerErrorSimulation(
  "auth.signIn",
  "INTERNAL_SERVER_ERROR"
);
```

#### 3. Check If Error Should Be Simulated

```typescript
// In your endpoint handler
if (errorSimulationRegistry.shouldSimulateError("auth.signIn")) {
  const config = errorSimulationRegistry.getErrorSimulation("auth.signIn");
  // Return error response with config.statusCode, config.errorCode, etc.
}
```

### Supported Error Types

| Error Type | HTTP Status | Use Case |
|-----------|-----------|----------|
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server crash |
| `SERVICE_UNAVAILABLE` | 503 | Service down for maintenance |
| `BAD_GATEWAY` | 502 | Reverse proxy/load balancer issue |
| `GATEWAY_TIMEOUT` | 504 | Server didn't respond |
| `RATE_LIMIT` | 429 | Too many requests |
| `NETWORK_TIMEOUT` | 504 | Request took too long |
| `NETWORK_FAILURE` | 503 | Can't reach server |
| `DATABASE_ERROR` | 500 | Database connection failed |
| `PAYMENT_GATEWAY_ERROR` | 502 | Payment processor down |
| `EMAIL_SERVICE_ERROR` | 503 | Email service unavailable |
| `SMS_SERVICE_ERROR` | 503 | SMS service unavailable |
| `EXTERNAL_API_ERROR` | 502 | Third-party API error |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `AUTHENTICATION_ERROR` | 401 | Auth token invalid/expired |
| `AUTHORIZATION_ERROR` | 403 | User lacks permission |
| `NOT_FOUND` | 404 | Resource doesn't exist |

### Mock Services

#### Mock Payment Gateway

```typescript
import { MockPaymentGateway } from "@/server/_core/error-simulation";

// Create gateway with options
const gateway = new MockPaymentGateway({
  failureRate: 0.5,    // 50% of calls fail
  delayMs: 200,         // 200ms network delay
  throwError: false     // Return error response instead of throwing
});

// Process payment
const result = await gateway.processPayment(10000, "token_123");

if (result.success) {
  console.log("Transaction ID:", result.transactionId);
} else {
  console.error("Payment failed:", result.error.message);
}

// Adjust behavior at runtime
gateway.setFailureRate(0.8);  // Increase failure rate to 80%
gateway.setDelay(500);         // Increase delay to 500ms
gateway.setThrowError(true);   // Now throw errors instead of returning them
```

#### Mock Email Service

```typescript
import { MockEmailService } from "@/server/_core/error-simulation";

const emailService = new MockEmailService({ failureRate: 0.2 });

const result = await emailService.sendEmail(
  "user@example.com",
  "Welcome to AmeriLend",
  "<h1>Welcome!</h1>"
);

if (result.success) {
  console.log("Email sent:", result.messageId);
}
```

#### Mock SMS Service

```typescript
import { MockSmsService } from "@/server/_core/error-simulation";

const smsService = new MockSmsService({ delayMs: 300 });

const result = await smsService.sendSms(
  "+1-555-0123",
  "Your OTP is: 123456"
);
```

#### Mock Database Service

```typescript
import { MockDatabaseService } from "@/server/_core/error-simulation";

const dbService = new MockDatabaseService({ 
  failureRate: 0.1,  // 10% database errors
  delayMs: 50        // 50ms query latency
});

const result = await dbService.query(
  "SELECT * FROM users WHERE id = ?",
  [userId]
);
```

#### Mock External API Service

```typescript
import { MockExternalApiService } from "@/server/_core/error-simulation";

const apiService = new MockExternalApiService();

const result = await apiService.callApi(
  "/api/external/data",
  "GET"
);
```

### Testing Scenarios

#### Scenario 1: Test Payment Failure Handling

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { MockPaymentGateway } from "@/server/_core/error-simulation";

describe("Payment Failure Handling", () => {
  let gateway: MockPaymentGateway;

  beforeEach(() => {
    gateway = new MockPaymentGateway();
  });

  it("should handle payment gateway timeout", async () => {
    gateway.setDelay(5000);  // 5 second timeout
    gateway.setFailureRate(1.0);  // Always fail

    const start = Date.now();
    const result = await gateway.processPayment(100000, "token");
    const duration = Date.now() - start;

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("PAYMENT_PROCESSING_ERROR");
    expect(duration).toBeGreaterThanOrEqual(5000);
  });

  it("should retry on transient payment failure", async () => {
    gateway.setFailureRate(1.0);  // First attempt fails

    const attempt1 = await gateway.processPayment(100000, "token");
    expect(attempt1.success).toBe(false);

    gateway.setFailureRate(0);  // Second attempt succeeds

    const attempt2 = await gateway.processPayment(100000, "token");
    expect(attempt2.success).toBe(true);
  });

  it("should handle partial payment failures (80%)", async () => {
    gateway.setFailureRate(0.8);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < 100; i++) {
      const result = await gateway.processPayment(100000, "token");
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    expect(failureCount).toBeGreaterThan(70);  // ~80% failure rate
    expect(successCount).toBeGreaterThan(10);  // ~20% success rate
  });
});
```

#### Scenario 2: Test Cascading Failures

```typescript
it("should handle cascading service failures", async () => {
  const payment = new MockPaymentGateway({ failureRate: 0.8 });
  const email = new MockEmailService({ failureRate: 0.8 });
  const sms = new MockSmsService({ failureRate: 0.8 });

  // Simulate loan payment notification
  const paymentResult = await payment.processPayment(100000, "token");
  
  if (paymentResult.success) {
    // Try to send confirmation email
    const emailResult = await email.sendEmail(
      "user@example.com",
      "Payment Received",
      "<p>Your payment was received</p>"
    );

    if (!emailResult.success) {
      // Try SMS as fallback
      const smsResult = await sms.sendSms(
        "+1-555-0123",
        "Payment received. Transaction ID: " + paymentResult.transactionId
      );

      expect(smsResult.success).toBe(true);  // SMS should work
    }
  }
});
```

#### Scenario 3: Test Endpoint Error Simulation

```typescript
import { errorSimulationRegistry } from "@/server/_core/error-simulation";

describe("Endpoint Error Simulation", () => {
  beforeEach(() => {
    errorSimulationRegistry.enableSimulation();
  });

  afterEach(() => {
    errorSimulationRegistry.disableSimulation();
    errorSimulationRegistry.clearAllErrorSimulations();
  });

  it("should return 503 when loans.create is down", () => {
    errorSimulationRegistry.registerErrorSimulation(
      "loans.create",
      "SERVICE_UNAVAILABLE",
      {
        errorMessage: "Loan service temporarily down for maintenance"
      }
    );

    const config = errorSimulationRegistry.getErrorSimulation("loans.create");
    expect(config?.statusCode).toBe(503);
    expect(config?.errorMessage).toContain("maintenance");
  });

  it("should return 429 when rate limit is exceeded", () => {
    errorSimulationRegistry.registerErrorSimulation(
      "payments.process",
      "RATE_LIMIT",
      {
        delayMs: 1000  // 1 second delay before responding
      }
    );

    const config = errorSimulationRegistry.getErrorSimulation("payments.process");
    expect(config?.statusCode).toBe(429);
    expect(config?.delayMs).toBe(1000);
  });

  it("should simulate database error during transaction", () => {
    errorSimulationRegistry.registerErrorSimulation(
      "loans.updateStatus",
      "DATABASE_ERROR",
      {
        errorMessage: "Database connection lost"
      }
    );

    const config = errorSimulationRegistry.getErrorSimulation("loans.updateStatus");
    expect(config?.errorCode).toBe("DATABASE_ERROR");
  });
});
```

#### Scenario 4: Test Client Recovery Logic

```typescript
describe("Client Error Recovery", () => {
  it("should implement exponential backoff on errors", async () => {
    const gateway = new MockPaymentGateway({ failureRate: 0.5 });

    const executeWithRetry = async (
      maxRetries: number = 3,
      baseDelay: number = 100
    ) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = await gateway.processPayment(100000, "token");

        if (result.success) {
          return result;
        }

        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delay));
        }
      }

      throw new Error("Payment failed after retries");
    };

    // Should eventually succeed with retries
    const result = await executeWithRetry();
    expect(result.transactionId).toBeDefined();
  });
});
```

### Running Tests

```bash
# Run all error handling tests
pnpm test server/_core/error-simulation.test.ts

# Run specific test
pnpm test server/_core/error-simulation.test.ts -t "Mock Payment Gateway"

# Run with coverage
pnpm test --coverage server/_core/error-simulation.test.ts

# Watch mode
pnpm test --watch server/_core/error-simulation.test.ts
```

### Integration with Endpoints

#### Example: Add Error Simulation to Loan Calculator

```typescript
// In server/routers.ts
import { errorSimulationRegistry } from "./_core/error-simulation";

loanCalculator: router({
  calculatePayment: publicProcedure
    .input(z.object({
      amount: z.number(),
      term: z.number(),
      interestRate: z.number(),
    }))
    .query(async ({ input }) => {
      // Check if error should be simulated
      if (errorSimulationRegistry.shouldSimulateError("loanCalculator.calculatePayment")) {
        const errorConfig = errorSimulationRegistry.getErrorSimulation(
          "loanCalculator.calculatePayment"
        );

        if (errorConfig?.delayMs) {
          await new Promise((r) => setTimeout(r, errorConfig.delayMs));
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorConfig?.errorMessage || "Server error",
          cause: {
            statusCode: errorConfig?.statusCode,
            errorCode: errorConfig?.errorCode,
          },
        });
      }

      // Normal processing...
      return calculatePayment(input);
    }),
})
```

### Error Response Format

All error responses follow this standardized format:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected server error occurred. Please try again later.",
    "details": {
      "errorType": "INTERNAL_SERVER_ERROR",
      "statusCode": 500,
      "retryable": true
    }
  },
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

### Best Practices

1. **Always Enable/Disable in Tests**
   ```typescript
   beforeEach(() => errorSimulationRegistry.enableSimulation());
   afterEach(() => errorSimulationRegistry.disableSimulation());
   ```

2. **Clear Previous Simulations**
   ```typescript
   afterEach(() => errorSimulationRegistry.clearAllErrorSimulations());
   ```

3. **Test Both Success and Failure Paths**
   - Test normal flow
   - Test with errors enabled
   - Test recovery mechanisms

4. **Use Realistic Failure Rates**
   - 1.0 = 100% (guaranteed failure)
   - 0.8 = 80% failure rate
   - 0.5 = 50/50 chance
   - 0.0 = 0% (always succeeds)

5. **Simulate Real-World Delays**
   - 100-300ms for network latency
   - 500-1000ms for slow servers
   - > 5000ms for timeout scenarios

6. **Test Multiple Services Together**
   - Payment + Email notifications
   - Loan creation + Email confirmation
   - User signup + SMS verification

### Common Test Cases

| Test Case | Setup | Expected Outcome |
|-----------|-------|-----------------|
| Payment Failure | `failureRate: 1.0` | Error response with code PAYMENT_PROCESSING_ERROR |
| Database Timeout | `delayMs: 5000` | Request takes 5+ seconds |
| Transient Failure | `failureRate: 1.0` then reset to 0 | First fails, second succeeds |
| Cascading Failures | Multiple services with high failure rate | Some fail, some succeed |
| Rate Limiting | `RATE_LIMIT` error type | 429 status code with retry info |
| Service Down | `SERVICE_UNAVAILABLE` | 503 status code |

### Troubleshooting

**Q: Error simulation not working**
- A: Make sure you're in test environment (NODE_ENV=test or VITEST=true)
- A: Make sure you called `enableSimulation()` in beforeEach

**Q: Tests are flaky due to random failures**
- A: Use `setFailureRate(0)` for deterministic tests
- A: Use `setFailureRate(1.0)` to test error paths specifically

**Q: Mock services taking too long**
- A: Reduce `delayMs` for faster tests
- A: Use `setDelay(0)` when delay isn't relevant to test

**Q: Can't distinguish between real and simulated errors**
- A: Simulated errors include `errorType` in details
- A: Check `meta.timestamp` for simulation context

### Files & Locations

- **Error Simulation System**: `server/_core/error-simulation.ts`
- **Test Suite**: `server/_core/error-simulation.test.ts`
- **Error Handler**: `server/_core/error-handler.ts`
- **Response Handler**: `server/_core/response-handler.ts`

### See Also

- `GLOBAL_ERROR_HANDLING.md` - Global error handling architecture
- `API_ERROR_HANDLING.md` - API-specific error handling
- `API_DOCUMENTATION.md` - API endpoints and error codes
