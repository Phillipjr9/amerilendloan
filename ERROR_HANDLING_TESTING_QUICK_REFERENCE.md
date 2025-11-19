## Error Handling Testing - Quick Reference

### Overview

Complete error handling and testing system for simulating server errors, testing recovery mechanisms, and validating client error handling.

### Status

✅ **All Tests Passing** (29/29)
✅ **TypeScript**: Zero compilation errors
✅ **Production Ready**: Error simulation only works in test environment

### Quick Start (30 seconds)

```typescript
import { errorSimulationRegistry, MockPaymentGateway } from "@/server/_core/error-simulation";

// 1. Enable simulation
errorSimulationRegistry.enableSimulation();

// 2. Register error for endpoint
errorSimulationRegistry.registerErrorSimulation("auth.signIn", "INTERNAL_SERVER_ERROR");

// 3. Check in endpoint and return error
if (errorSimulationRegistry.shouldSimulateError("auth.signIn")) {
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
}

// 4. Or use mock services directly
const gateway = new MockPaymentGateway({ failureRate: 0.8 });
const result = await gateway.processPayment(10000, "token");

// 5. Clean up
errorSimulationRegistry.disableSimulation();
```

### Core Components

#### 1. Error Simulation Registry

Control which endpoints simulate errors:

```typescript
// Enable/disable simulation
errorSimulationRegistry.enableSimulation();
errorSimulationRegistry.disableSimulation();

// Register error for specific endpoint
errorSimulationRegistry.registerErrorSimulation("endpoint.name", "ERROR_TYPE", {
  statusCode: 500,
  errorMessage: "Custom message",
  delayMs: 100
});

// Check if error should be simulated
if (errorSimulationRegistry.shouldSimulateError("endpoint.name")) {
  const config = errorSimulationRegistry.getErrorSimulation("endpoint.name");
  // Return error response
}

// Clean up
errorSimulationRegistry.unregisterErrorSimulation("endpoint.name");
errorSimulationRegistry.clearAllErrorSimulations();
```

#### 2. Mock Services

**Payment Gateway**
```typescript
const gateway = new MockPaymentGateway({ failureRate: 0.5, delayMs: 200 });
const result = await gateway.processPayment(10000, "token");
// Control: setFailureRate(), setDelay(), setThrowError()
```

**Email Service**
```typescript
const email = new MockEmailService({ failureRate: 0.2 });
const result = await email.sendEmail("user@example.com", "Subject", "<p>Body</p>");
```

**SMS Service**
```typescript
const sms = new MockSmsService({ failureRate: 0.1 });
const result = await sms.sendSms("+1234567890", "Message");
```

**Database Service**
```typescript
const db = new MockDatabaseService({ failureRate: 0.05, delayMs: 50 });
const result = await db.query("SELECT * FROM users", []);
```

**External API Service**
```typescript
const api = new MockExternalApiService({ failureRate: 0.15 });
const result = await api.callApi("/endpoint", "GET");
```

### Error Types (16 Total)

| Type | Status | Use Case |
|------|--------|----------|
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected crash |
| `SERVICE_UNAVAILABLE` | 503 | Maintenance/down |
| `BAD_GATEWAY` | 502 | Proxy error |
| `GATEWAY_TIMEOUT` | 504 | No response |
| `RATE_LIMIT` | 429 | Too many requests |
| `NETWORK_TIMEOUT` | 504 | Request timeout |
| `NETWORK_FAILURE` | 503 | No connection |
| `DATABASE_ERROR` | 500 | DB issue |
| `PAYMENT_GATEWAY_ERROR` | 502 | Payment down |
| `EMAIL_SERVICE_ERROR` | 503 | Email service down |
| `SMS_SERVICE_ERROR` | 503 | SMS service down |
| `EXTERNAL_API_ERROR` | 502 | 3rd party API down |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `AUTHENTICATION_ERROR` | 401 | Auth failed |
| `AUTHORIZATION_ERROR` | 403 | No permission |
| `NOT_FOUND` | 404 | Not found |

### Common Test Scenarios

#### Test 1: Payment Failure

```typescript
it("should handle payment failure", async () => {
  const gateway = new MockPaymentGateway({ failureRate: 1.0 });
  const result = await gateway.processPayment(10000, "token");
  
  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("PAYMENT_PROCESSING_ERROR");
});
```

#### Test 2: Transient Failure with Retry

```typescript
it("should recover from transient failure", async () => {
  const gateway = new MockPaymentGateway();
  
  // First attempt fails
  gateway.setFailureRate(1.0);
  let result = await gateway.processPayment(10000, "token");
  expect(result.success).toBe(false);
  
  // Retry succeeds
  gateway.setFailureRate(0);
  result = await gateway.processPayment(10000, "token");
  expect(result.success).toBe(true);
});
```

#### Test 3: Network Timeout

```typescript
it("should handle network timeout", async () => {
  const gateway = new MockPaymentGateway({ delayMs: 5000 });
  
  const start = Date.now();
  await gateway.processPayment(10000, "token");
  const duration = Date.now() - start;
  
  expect(duration).toBeGreaterThanOrEqual(5000);
});
```

#### Test 4: Cascading Failures

```typescript
it("should handle cascading failures", async () => {
  const payment = new MockPaymentGateway({ failureRate: 0.8 });
  const email = new MockEmailService({ failureRate: 0.8 });
  
  const p1 = await payment.processPayment(10000, "token");
  if (!p1.success) {
    console.log("Payment failed, logging alert...");
  }
  
  const p2 = await email.sendEmail("admin@example.com", "Alert", "Payment failed");
  if (!p2.success) {
    console.log("Email also failed, using SMS fallback...");
  }
});
```

#### Test 5: Endpoint Error Simulation

```typescript
it("should simulate endpoint error", () => {
  errorSimulationRegistry.enableSimulation();
  
  errorSimulationRegistry.registerErrorSimulation(
    "loans.create",
    "SERVICE_UNAVAILABLE",
    { errorMessage: "Loan service down for maintenance" }
  );
  
  const config = errorSimulationRegistry.getErrorSimulation("loans.create");
  expect(config?.statusCode).toBe(503);
  
  errorSimulationRegistry.disableSimulation();
});
```

### Failure Rate Reference

```typescript
gateway.setFailureRate(0.0);   // Always succeeds
gateway.setFailureRate(0.1);   // 10% fail (90% succeed)
gateway.setFailureRate(0.5);   // 50/50 chance
gateway.setFailureRate(0.8);   // 80% fail (20% succeed)
gateway.setFailureRate(1.0);   // Always fails
```

### Network Delay Reference

```typescript
gateway.setDelay(0);      // No delay
gateway.setDelay(100);    // 100ms (typical network latency)
gateway.setDelay(500);    // 500ms (slow server)
gateway.setDelay(5000);   // 5 seconds (timeout scenario)
```

### Test Results

```
Test Files  1 passed (1)
Tests       29 passed (29)

Test Coverage:
✓ Error Simulation Registry (7 tests)
✓ Mock Payment Gateway (4 tests)
✓ Mock Email Service (3 tests)
✓ Mock SMS Service (2 tests)
✓ Mock Database Service (3 tests)
✓ Mock External API Service (2 tests)
✓ Error Testing Utilities (4 tests)
✓ Error Recovery Scenarios (3 tests)
✓ Error Response Codes (1 test)
```

### Run Tests

```bash
# Run all error simulation tests
npm test server/_core/error-simulation.test.ts

# Run specific test suite
npm test server/_core/error-simulation.test.ts -t "Mock Payment Gateway"

# Run with coverage
npm test -- --coverage server/_core/error-simulation.test.ts

# Watch mode
npm test -- --watch server/_core/error-simulation.test.ts
```

### Integration Steps

1. **Enable in tests only**
   ```typescript
   beforeEach(() => {
     errorSimulationRegistry.enableSimulation();
   });
   ```

2. **Register errors for endpoints**
   ```typescript
   errorSimulationRegistry.registerErrorSimulation("endpoint", "ERROR_TYPE");
   ```

3. **Check and return error in handlers**
   ```typescript
   if (errorSimulationRegistry.shouldSimulateError("endpoint")) {
     const config = errorSimulationRegistry.getErrorSimulation("endpoint");
     throw new TRPCError({
       code: config?.errorCode || "INTERNAL_SERVER_ERROR",
       message: config?.errorMessage || "Server error",
     });
   }
   ```

4. **Test client error handling**
   - Verify error display
   - Test retry logic
   - Check fallback mechanisms

5. **Clean up**
   ```typescript
   afterEach(() => {
     errorSimulationRegistry.disableSimulation();
     errorSimulationRegistry.clearAllErrorSimulations();
   });
   ```

### Files

| File | Purpose |
|------|---------|
| `server/_core/error-simulation.ts` | Error simulation & mock services |
| `server/_core/error-simulation.test.ts` | Test suite (29 tests) |
| `ERROR_HANDLING_TESTING_GUIDE.md` | Complete guide with examples |
| `server/_core/error-handler.ts` | Global error handler |
| `server/_core/response-handler.ts` | Response formatting |

### Environment Safety

Error simulation **only works in test environment**:
```typescript
// Safe - only enabled in test/vitest
errorSimulationRegistry.enableSimulation();

// These are checked:
- process.env.NODE_ENV === "test"
- process.env.VITEST === "true"
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Simulation not working | Check `NODE_ENV=test` or `VITEST=true` |
| Tests take too long | Reduce `delayMs` or set to 0 |
| Flaky tests | Use `setFailureRate(0)` for deterministic tests |
| Random failures | Use fixed rate (0 or 1.0) during development |

### Next Steps

1. ✅ Error simulation system implemented
2. ✅ Mock services for all major services
3. ✅ 29 test cases covering all scenarios
4. ✅ TypeScript verification passing
5. ⏭️ Integrate into endpoint handlers
6. ⏭️ Add to CI/CD pipeline
7. ⏭️ Test client error handling UI

---

**Total Implementation**: 500+ lines of production-ready code + 600+ lines of tests
**Status**: ✅ Complete and tested
**Ready for**: Development and integration
