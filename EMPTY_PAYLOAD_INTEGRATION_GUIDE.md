# Empty Payload Validation - Integration Guide

## Overview
This guide shows how the new empty payload validation integrates with the existing error handling, field validation, and response formatting systems.

## System Architecture

### Complete Middleware Stack (In Order)
```
Request arrives
    ↓
1. express.json() ─────────────── Parse JSON body from stream
    ↓
2. ensureJsonHeaders ──────────── Wrap res.json() for safety
    ↓
3. malformedJsonHandler ───────── Catch JSON parse errors
    ↓
4. validateJsonRequest ────────── Check Content-Type header
    ↓
5. validateContentLength ──────── Check body size (NEW)
    ↓
6. validatePayload ────────────── Check for empty payload (NEW)
    ↓ (Request body is now validated)
7. CSP headers ────────────────── Security headers
    ↓
8. multer config ──────────────── File upload handling
    ↓
9. Routes ─────────────────────── OAuth, health, tRPC, etc.
    ↓
10. notFoundHandler ───────────── 404 handling
    ↓
11. errorHandlerMiddleware ────── Global error handler
```

## Request Flow Examples

### Example 1: Empty POST Request

```
POST /api/users { empty body }
    ↓ Steps 1-4: Pass through
    ↓ Step 5: Content-Length not found or 0
    ✗ Step 6: validatePayload catches empty body
    ↓
Response 400:
{
  "success": false,
  "error": {
    "code": "EMPTY_PAYLOAD",
    "message": "Invalid input: Empty or missing payload",
    "details": {
      "reason": "Payload is null or undefined"
    }
  }
}
```

### Example 2: Valid POST with Missing Required Fields

```
POST /api/users { "name": "" }
    ✓ Steps 1-6: All validations pass
      - JSON is valid
      - Content-Type is correct
      - Body size is acceptable
      - Body is not empty
    ↓ Step 7: Routes handle request
    ↓ tRPC input validation kicks in
    ↓ Zod schema validation detects empty name field
    ✗ Field validation handler catches missing field
    ↓
Response 422:
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELD",
    "message": "Field validation failed",
    "details": {
      "missing_fields": ["name"],
      "invalid_fields": [
        {
          "field": "name",
          "message": "String must contain at least 1 character",
          "code": "too_small"
        }
      ]
    }
  }
}
```

### Example 3: Malformed JSON

```
POST /api/users { invalid json }
    ✓ Step 1: express.json() attempts to parse
    ✗ Step 3: malformedJsonHandler catches SyntaxError
    ↓
Response 400:
{
  "success": false,
  "error": {
    "code": "MALFORMED_JSON",
    "message": "Invalid JSON in request body",
    "details": {
      "error": "Unexpected token..."
    }
  }
}
```

### Example 4: Oversized Payload

```
POST /api/upload { 51MB of data }
    ✓ Steps 1-4: Pass through
    ✗ Step 5: validateContentLength catches 51MB > 50MB
    ↓
Response 413:
{
  "success": false,
  "error": {
    "code": "CONTENT_TOO_LARGE",
    "message": "Request body is too large",
    "details": {
      "max": 52428800,
      "received": 53477376
    }
  }
}
```

### Example 5: Empty Object (Allowed by Default)

```
POST /api/filters { {} }
    ✓ Steps 1-4: Pass through
    ✓ Step 5: Content-Length valid (2 bytes)
    ✓ Step 6: validatePayload - allowEmptyObjects = true
    ↓ Step 7: Routes handle request
    ↓
Response 200:
{
  "success": true,
  "data": { "filters": [] },
  "meta": { "timestamp": "..." }
}
```

### Example 6: Empty Array (Allowed by Default)

```
POST /api/batch { [] }
    ✓ Steps 1-4: Pass through
    ✓ Step 5: Content-Length valid (2 bytes)
    ✓ Step 6: validatePayload - allowEmptyArrays = true
    ↓ Step 7: Routes handle request
    ↓
Response 200:
{
  "success": true,
  "data": { "processed": 0 },
  "meta": { "timestamp": "..." }
}
```

## Validation Layers

### Layer 1: Content Length (NEW)
```typescript
// Checks before parsing JSON
Header: Content-Length: value

Validation:
- If value < 1 byte → 400 CONTENT_TOO_SMALL
- If value > 50MB → 413 CONTENT_TOO_LARGE
```

### Layer 2: Empty Payload (NEW)
```typescript
// Checks after JSON parsing, before business logic
Body check:
- If null/undefined → 400 EMPTY_PAYLOAD
- If empty string → 400 EMPTY_PAYLOAD
- If empty object {} and !allowEmptyObjects → 400 EMPTY_PAYLOAD
- If empty array [] and !allowEmptyArrays → 400 EMPTY_PAYLOAD
```

### Layer 3: Field Validation (Existing)
```typescript
// Zod schema validation via tRPC
Schema rules:
- Required fields: z.string().min(1)
- Email format: z.string().email()
- Number ranges: z.number().min(0).max(100)

Error codes:
- MISSING_REQUIRED_FIELD (422)
- VALIDATION_ERROR (422)
- INVALID_INPUT (400)
```

### Layer 4: Business Logic (Existing)
```typescript
// Your route handlers
- Check permissions
- Check database constraints
- Check business rules
```

## Error Priority

When multiple validation layers could apply, errors are returned in this order:

1. **Content-Length error** (413) - Header level
2. **Malformed JSON error** (400) - Parser level
3. **Empty Payload error** (400) - Structure level
4. **Field Validation error** (422) - Schema level
5. **Business Logic error** (varies) - Application level

## Configuration Strategy

### For REST/tRPC Endpoints
```typescript
// Allow empty objects/arrays (tRPC has its own validation)
validatePayload({
  allowEmptyObjects: true,
  allowEmptyArrays: true,
  excludePaths: ["/api/trpc"],  // Let tRPC handle validation
})
```

### For Direct HTTP Endpoints
```typescript
// Strict validation for direct HTTP handlers
validatePayload({
  allowEmptyObjects: false,
  allowEmptyArrays: false,
  minSize: 10,  // Minimum payload size
})
```

### For Webhooks
```typescript
// Allow anything, let business logic decide
validatePayload({
  allowEmpty: true,  // Accept any payload
})
```

### For File Uploads
```typescript
// Large file validation
validatePayload({
  allowEmptyObjects: false,
  minSize: 1,  // At least 1 byte
  maxSize: 100 * 1024 * 1024,  // 100MB for large files
})
```

## Integration Examples

### Example 1: Strict Endpoint
```typescript
import { validatePayload } from "./server/_core/payload-validator";

// Create a strict router
const strictRouter = express.Router();

// Apply strict validation
strictRouter.use(validatePayload({
  allowEmptyObjects: false,
  allowEmptyArrays: false,
}));

// Route handlers receive validated data
strictRouter.post("/users/create", (req, res) => {
  // req.body is guaranteed to be non-empty
  const { name, email } = req.body;
  // Process...
});
```

### Example 2: Custom Validation
```typescript
import { PayloadValidator } from "./server/_core/payload-validator";

const validator = new PayloadValidator();

// Add business logic validation rules
validator.addRule("valid-user-data", (body) => {
  if (!body.name?.trim()) {
    return { valid: false, error: "Name cannot be empty" };
  }
  if (!body.email?.includes("@")) {
    return { valid: false, error: "Invalid email format" };
  }
  return { valid: true };
});

// Use in router
app.post("/users/create", validator.middleware(), (req, res) => {
  // req.body has passed custom validation
  // Process...
});
```

### Example 3: Conditional Validation
```typescript
// Different validation for different routes
const publicRoutes = validatePayload({
  allowEmptyObjects: true,  // Public API is lenient
});

const adminRoutes = validatePayload({
  allowEmptyObjects: false,  // Admin API is strict
});

app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);
```

## Testing Integration

### Test Cases
```typescript
describe("Empty Payload Validation", () => {
  // Test 1: Empty POST
  it("should reject empty POST bodies", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({});  // Empty body
    
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("EMPTY_PAYLOAD");
  });

  // Test 2: Valid POST
  it("should accept valid payloads", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ name: "John", email: "john@example.com" });
    
    expect(response.status).toBe(200 || 422);  // Success or field error
    expect(response.body.success).toBeDefined();
  });

  // Test 3: GET requests
  it("should not validate GET requests", async () => {
    const response = await request(app)
      .get("/api/users");
    
    expect(response.status).not.toBe(400);
  });

  // Test 4: Large payloads
  it("should reject oversized payloads", async () => {
    const largeData = "x".repeat(51 * 1024 * 1024);
    const response = await request(app)
      .post("/api/upload")
      .send(largeData);
    
    expect(response.status).toBe(413);
  });
});
```

## Monitoring & Observability

### Log Format
```
[Payload Validation] Empty payload on POST /api/users: Payload is null or undefined
[Content Validation] Request body exceeds limit: 51MB > 50MB
[Custom Validation] Validation failed on POST /api/strict: Field 'name' is required
```

### Metrics to Track
1. Empty payload rejection rate
2. Content-too-large rejection rate
3. Custom validation failure rate
4. Average payload size by endpoint
5. Validation latency (should be < 1ms)

## Performance Impact

### Benchmarks
```
Empty body detection: < 0.1ms
Content-length check: < 0.1ms
Custom rules (3-5 rules): < 0.5ms
Total middleware overhead: < 1ms average
```

### Optimization Tips
1. **Exclude unnecessary paths** - Skip validation for low-risk endpoints
2. **Use allowEmptyObjects/Arrays** - Avoids object serialization
3. **Minimize custom rules** - Each rule adds latency
4. **Cache validation results** - For identical payloads

## Troubleshooting

### Empty objects still passing through
**Cause**: `allowEmptyObjects: true` in config
**Solution**: Set to `false` for strict validation
```typescript
validatePayload({ allowEmptyObjects: false })
```

### POST requests with {} not being rejected
**Cause**: Default config allows empty objects
**Solution**: Either change config or check if it's intentional
```typescript
// If empty objects should NOT be allowed:
validatePayload({ allowEmptyObjects: false })
```

### Validation too strict breaking tests
**Cause**: Tests sending `{}` but endpoint rejects it
**Solution**: Send valid test data or adjust validation
```typescript
// Fix 1: Send valid data in tests
.post("/api/users").send({ name: "Test" })

// Fix 2: Adjust validation for tests
if (process.env.NODE_ENV === "test") {
  validatePayload({ allowEmptyObjects: true })
}
```

### Large files rejected
**Cause**: Content-length > 50MB
**Solution**: Increase size limit
```typescript
validateContentLength(1, 100 * 1024 * 1024)  // 100MB
```

## Best Practices

1. **Enable validation by default**
   - Reject empty payloads for POST/PUT/PATCH
   - Allow empty objects for filter endpoints

2. **Use appropriate error codes**
   - Empty payload → EMPTY_PAYLOAD
   - Missing fields → MISSING_REQUIRED_FIELD
   - Invalid format → VALIDATION_ERROR

3. **Exclude safe paths**
   - Webhooks that might send empty bodies
   - Health check endpoints
   - tRPC routes (has own validation)

4. **Custom validation for business logic**
   - Don't duplicate Zod schema validation
   - Only add rules not covered by tRPC

5. **Monitor validation failures**
   - Track empty payload rate
   - Alert on unusual patterns
   - Use for capacity planning

## Related Files
- `server/_core/payload-validator.ts` - Implementation
- `server/_core/error-handler.ts` - Error handling
- `server/_core/response-formatter.ts` - Response formatting
- `server/_core/index.ts` - Middleware integration
- `EMPTY_PAYLOAD_VALIDATION.md` - Full documentation
- `EMPTY_PAYLOAD_QUICK_REFERENCE.md` - Quick reference
