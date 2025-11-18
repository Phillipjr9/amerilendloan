# Global Error Handling Implementation

## Overview

A comprehensive, standardized error handling system for the AmeriLend API that ensures all errors—from malformed JSON to business logic failures—return consistent JSON responses with appropriate HTTP status codes.

## Features

✅ **Malformed JSON Detection** - Catches and reports JSON parse errors  
✅ **Validation Error Handling** - Reports field-level validation issues  
✅ **Content-Type Validation** - Ensures requests use application/json  
✅ **404 Not Found Handling** - Standardized 404 responses  
✅ **Global Error Catching** - Catches unhandled errors  
✅ **Proper HTTP Status Codes** - 400, 409, 422, 500, etc.  
✅ **Type-Safe Responses** - All errors follow standard structure  

## Architecture

### Middleware Stack (Order Matters)

```
1. express.json()                 ← Parse JSON
2. malformedJsonHandler           ← Catch JSON parse errors
3. validateJsonRequest            ← Check Content-Type header
4. Other business logic middleware
5. tRPC router                    ← API endpoints
6. notFoundHandler                ← Catch unmatched routes
7. errorHandlerMiddleware         ← Global error handler
```

## Error Response Structure

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional detailed error information
      "field_name": "error description",
      "validation_errors": []
    },
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

## Error Codes & HTTP Status Codes

| Error Code | HTTP Status | Meaning |
|----------|---------|---------|
| `MALFORMED_JSON` | 400 | JSON parse error in request body |
| `INVALID_JSON` | 400 | Invalid JSON structure |
| `INVALID_INPUT` | 400 | Invalid input data |
| `MISSING_REQUIRED_FIELD` | 422 | Required field missing |
| `VALIDATION_ERROR` | 422 | Field validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `SESSION_EXPIRED` | 401 | Session token expired |
| `FORBIDDEN` | 403 | No permission for resource |
| `ACCOUNT_LOCKED` | 403 | Account is locked |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Conflicting data (duplicate) |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `INVALID_OTP` | 400 | OTP code invalid/expired |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily down |

## Examples

### Example 1: Malformed JSON (400)

**Request:**
```bash
curl -X POST https://www.amerilendloan.com/api/trpc/auth.supabaseSignIn \
  -H "Content-Type: application/json" \
  -d '{invalid json'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "MALFORMED_JSON",
    "message": "Malformed JSON in request body",
    "details": {
      "expected": "Valid JSON",
      "received": "Invalid JSON format",
      "parseError": "Unexpected token i in JSON at position 1"
    },
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```
**Status:** `400 Bad Request`

### Example 2: Validation Error (422)

**Request:**
```bash
curl -X POST https://www.amerilendloan.com/api/trpc/loans.checkDuplicate \
  -H "Content-Type: application/json" \
  -d '{
    "dateOfBirth": "invalid",
    "ssn": "bad-format"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "validation_errors": [
        {
          "path": "dateOfBirth",
          "message": "Invalid date format. Use YYYY-MM-DD",
          "code": "invalid_string",
          "received": "invalid",
          "expected": "YYYY-MM-DD format"
        },
        {
          "path": "ssn",
          "message": "Invalid SSN format. Use XXX-XX-XXXX",
          "code": "invalid_string",
          "received": "bad-format",
          "expected": "XXX-XX-XXXX format"
        }
      ]
    },
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```
**Status:** `422 Unprocessable Entity`

### Example 3: Wrong Content-Type (400)

**Request:**
```bash
curl -X POST https://www.amerilendloan.com/api/trpc/auth.supabaseSignIn \
  -H "Content-Type: text/plain" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Content-Type must be application/json",
    "details": {
      "expected": "application/json",
      "received": "text/plain"
    },
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```
**Status:** `400 Bad Request`

### Example 4: Route Not Found (404)

**Request:**
```bash
curl https://www.amerilendloan.com/api/nonexistent-endpoint
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Route not found: GET /api/nonexistent-endpoint",
    "details": {
      "method": "GET",
      "path": "/api/nonexistent-endpoint",
      "available_routes": [
        "POST /api/trpc/*",
        "GET /health",
        "GET /dist/public/*"
      ]
    },
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```
**Status:** `404 Not Found`

### Example 5: Duplicate Entry (409)

**Request:**
```bash
curl -X POST https://www.amerilendloan.com/api/trpc/loans.checkDuplicate \
  -H "Content-Type: application/json" \
  -d '{
    "dateOfBirth": "1990-01-01",
    "ssn": "123-45-6789"
  }'
```

**Response (when duplicate exists):**
```json
{
  "hasDuplicate": true,
  "status": "pending",
  "trackingNumber": "AMG-2025-001234",
  "maskedEmail": "joh***@example.com",
  "message": "Existing pending application found. Tracking: AMG-2025-001234",
  "canApply": false
}
```
**Status:** `409 Conflict` (via error handler)

### Example 6: Server Error (500)

**Request:**
```bash
curl -X POST https://www.amerilendloan.com/api/trpc/auth.supabaseSignIn \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Response (if database is down):**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Database connection failed",
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```
**Status:** `500 Internal Server Error`

### Example 7: Health Check (200)

**Request:**
```bash
curl https://www.amerilendloan.com/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-11-18T10:30:00.000Z",
    "uptime": 3600.5
  },
  "timestamp": "2025-11-18T10:30:00.000Z"
}
```
**Status:** `200 OK`

## Frontend Integration

### JavaScript/TypeScript

```typescript
import axios from 'axios';

async function makeApiCall() {
  try {
    const response = await axios.post(
      'https://www.amerilendloan.com/api/trpc/auth.supabaseSignIn',
      {
        email: 'user@example.com',
        password: 'password123'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Check success field
    if (response.data.success) {
      console.log('Success:', response.data.data);
    } else {
      console.error(`Error [${response.data.error.code}]: ${response.data.error.message}`);
      
      // Show detailed validation errors
      if (response.data.error.details?.validation_errors) {
        response.data.error.details.validation_errors.forEach(err => {
          console.error(`  ${err.path}: ${err.message}`);
        });
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      if (data?.error) {
        console.error(`API Error [${data.error.code}]: ${data.error.message}`);
      } else {
        console.error('Network error:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

### React Hook

```typescript
import { useState } from 'react';

function useApi() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const call = async (endpoint: string, data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://www.amerilendloan.com/api/trpc/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!result.success) {
        setError({
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
          status: response.status
        });
        return null;
      }

      return result.data;
    } catch (err) {
      setError({
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error',
        status: 0
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { call, error, loading };
}
```

## Testing

### Using curl

```bash
# Test malformed JSON
curl -X POST https://www.amerilendloan.com/api/trpc/auth.supabaseSignIn \
  -H "Content-Type: application/json" \
  -d '{bad json}'

# Test validation error
curl -X POST https://www.amerilendloan.com/api/trpc/loans.checkDuplicate \
  -H "Content-Type: application/json" \
  -d '{"dateOfBirth":"invalid","ssn":"invalid"}'

# Test wrong content-type
curl -X POST https://www.amerilendloan.com/api/trpc/auth.supabaseSignIn \
  -H "Content-Type: text/xml" \
  -d '<xml></xml>'

# Test health check
curl https://www.amerilendloan.com/health

# Test 404
curl https://www.amerilendloan.com/api/nonexistent
```

### Using Python

```python
import requests
import json

def test_malformed_json():
    response = requests.post(
        'https://www.amerilendloan.com/api/trpc/auth.supabaseSignIn',
        data='{bad json}',
        headers={'Content-Type': 'application/json'}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_validation():
    response = requests.post(
        'https://www.amerilendloan.com/api/trpc/loans.checkDuplicate',
        json={'dateOfBirth': 'invalid', 'ssn': 'invalid'},
        headers={'Content-Type': 'application/json'}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_health():
    response = requests.get('https://www.amerilendloan.com/health')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
```

## Logging

All errors are logged with context:

```
[Error Handler] {
  "path": "/api/trpc/auth.supabaseSignIn",
  "method": "POST",
  "error": "Invalid JSON",
  "code": "MALFORMED_JSON",
  "timestamp": "2025-11-18T10:30:00.000Z"
}
```

## Best Practices

1. **Always check `success` field** - Don't assume success based on status code
2. **Use error codes for logic** - Check `error.code` for specific handling
3. **Display user-friendly messages** - Use `error.message` in UI
4. **Log errors server-side** - All errors are logged automatically
5. **Handle network errors** - Distinguish from API errors
6. **Validate input** - Validate before sending to API
7. **Use proper Content-Type** - Always use `application/json`
8. **Test edge cases** - Malformed data, wrong types, etc.

## Debugging

### Enable Verbose Logging

```bash
DEBUG=* npm start
```

### Monitor Errors

```bash
curl https://www.amerilendloan.com/health  # Check if server is up
```

### Test Specific Endpoints

Each endpoint validation can be tested independently with sample payloads from `API_ERROR_HANDLING.md`.
