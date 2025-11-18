# JSON Response Guarantee & Error Handling

## Overview

The API implements comprehensive JSON response handling that ensures **every** response from the API is valid JSON, even in edge cases, error conditions, or when no data is found. This eliminates `JSONDecodeError` issues and ensures client parsers never fail.

## Key Features

✅ **Always Valid JSON** - Every API response is guaranteed to be valid, parseable JSON  
✅ **No Empty Responses** - Null values are handled, never undefined or empty strings  
✅ **Serialization Safety** - Circular references and non-serializable objects handled gracefully  
✅ **Error Fallbacks** - If response formatting fails, a safe fallback is sent  
✅ **Consistent Headers** - All responses include proper `Content-Type: application/json`  
✅ **No Silent Failures** - Errors are logged and returned to client  

## Response Structure

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z",
    "path": "/api/endpoint"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional error details */ }
  },
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z",
    "path": "/api/endpoint"
  }
}
```

### Not Found Response (with null data)
```json
{
  "success": true,
  "data": null,
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z",
    "path": "/api/endpoint"
  }
}
```

### Empty List Response
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "total": 0,
      "page": 1,
      "limit": 20,
      "hasMore": false
    }
  },
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

## Response Handling Scenarios

### 1. Normal Data Response
**Status:** 200 OK

```bash
curl https://www.amerilendloan.com/api/trpc/user.getProfile

{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

### 2. Null/Not Found Response
**Status:** 200 OK (data is present but null)

```bash
curl https://www.amerilendloan.com/api/trpc/user.getById?id=nonexistent

{
  "success": true,
  "data": null,
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

### 3. Empty Array Response
**Status:** 200 OK

```bash
curl https://www.amerilendloan.com/api/trpc/loans.list

{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "total": 0,
      "page": 1,
      "limit": 20,
      "hasMore": false
    }
  },
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

### 4. Malformed JSON Error
**Status:** 400 Bad Request

```bash
curl -X POST https://www.amerilendloan.com/api/trpc/auth.signIn \
  -d '{invalid json}'

{
  "success": false,
  "error": {
    "code": "MALFORMED_JSON",
    "message": "Malformed JSON in request body",
    "details": {
      "expected": "Valid JSON",
      "received": "Invalid JSON format",
      "parseError": "Unexpected token i in JSON at position 1"
    }
  },
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

### 5. Missing Required Fields Error
**Status:** 422 Unprocessable Entity

```bash
curl -X POST https://www.amerilendloan.com/api/trpc/auth.signUp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELD",
    "message": "Missing required fields: password, firstName, lastName",
    "details": {
      "missing_fields": ["password", "firstName", "lastName"],
      "field_errors": {
        "password": ["Password must be at least 8 characters"],
        "firstName": ["First name is required"],
        "lastName": ["Last name is required"]
      }
    }
  },
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

### 6. Wrong Content-Type Error
**Status:** 400 Bad Request

```bash
curl -X POST https://www.amerilendloan.com/api/trpc/auth.signIn \
  -H "Content-Type: text/xml" \
  -d '<xml></xml>'

{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Content-Type must be application/json",
    "details": {
      "expected": "application/json",
      "received": "text/xml"
    }
  },
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

### 7. Route Not Found (404)
**Status:** 404 Not Found

```bash
curl https://www.amerilendloan.com/api/nonexistent-endpoint

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
    }
  },
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

### 8. Server Error (500)
**Status:** 500 Internal Server Error

```bash
curl https://www.amerilendloan.com/api/trpc/user.getProfile

{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Database connection failed",
    "details": {
      "error": "Connection timeout after 30000ms"
    }
  },
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

### 9. Service Unavailable (503)
**Status:** 503 Service Unavailable

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service temporarily unavailable. Please try again later.",
    "details": {
      "retry_after": 60
    }
  },
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

### 10. Serialization Fallback (Rare)
**Status:** 500 Internal Server Error

If the API encounters data that cannot be JSON-serialized (circular references, non-serializable objects, etc.), it sends a safe fallback:

```json
{
  "success": false,
  "error": {
    "code": "SERIALIZATION_ERROR",
    "message": "Failed to serialize response data"
  },
  "meta": {
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

## Response Formatter Features

### 1. Safe Stringification
Prevents circular references and converts non-serializable objects:
- `Date` objects → ISO string
- `Error` objects → error details
- `undefined` → `null`
- Circular references → `"[Circular Reference]"`
- Non-serializable objects → safe representation

### 2. Depth Limiting
Prevents stack overflow from deeply nested objects (max depth: 5)

### 3. Header Enforcement
All responses automatically include:
```
Content-Type: application/json
```

### 4. Null Handling
- `undefined` converted to `null` (JSON compatible)
- Empty arrays preserved as `[]`
- Empty objects preserved as `{}`
- `null` values preserved as `null`

## Frontend Integration

### JavaScript/TypeScript

```typescript
// Safe fetch with guaranteed JSON parsing
async function fetchApi(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`/api/trpc${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    // Always get JSON (API guarantees this)
    const data = await response.json();

    // Check success flag
    if (!data.success) {
      console.error(`API Error [${data.error.code}]: ${data.error.message}`);
      throw new Error(data.error.message);
    }

    // Data can be null, but it's valid
    return data.data;
  } catch (error) {
    // Will NOT be JSONDecodeError - API always returns valid JSON
    console.error('Request failed:', error);
    throw error;
  }
}

// Usage
const user = await fetchApi('/user.getProfile');
console.log(user); // Either an object or null, never undefined
```

### Python

```python
import requests
import json

def call_api(endpoint, method='GET', data=None):
    """Call API with guaranteed JSON response"""
    try:
        url = f'https://www.amerilendloan.com/api/trpc{endpoint}'
        
        response = requests.request(
            method,
            url,
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        
        # Always returns valid JSON
        result = response.json()
        
        if not result.get('success'):
            print(f"API Error [{result['error']['code']}]: {result['error']['message']}")
            return None
        
        # Data is either the value or null (never undefined)
        return result.get('data')
        
    except json.JSONDecodeError as e:
        # This WILL NEVER happen - API guarantees valid JSON
        print(f"Critical: API returned invalid JSON: {e}")
        raise
    except Exception as e:
        print(f"Request failed: {e}")
        raise

# Usage
user = call_api('/user.getProfile')
print(user)  # Either object or None

items = call_api('/items.list')
print(items['items'])  # Either list or []
```

### React Hook

```typescript
import { useState, useEffect } from 'react';

export function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/trpc${endpoint}`, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json()) // Always returns valid JSON
      .then(result => {
        if (result.success) {
          setData(result.data); // Can be null, but valid
        } else {
          setError(result.error.message);
        }
      })
      .catch(err => {
        // Network error - response was not JSON
        setError(`Network error: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading, error };
}

// Usage
function UserProfile() {
  const { data: user, loading, error } = useApi('/user.getProfile');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // data can be null (user not found) or an object (user found)
  if (!user) return <div>No user data</div>;

  return <div>{user.name}</div>;
}
```

## Testing Response Guarantees

### Test Cases

```python
import requests
import json

def test_json_response_guarantee():
    """Verify API always returns valid JSON"""
    
    test_cases = [
        # (endpoint, method, data, description)
        ('/health', 'GET', None, 'Health check'),
        ('/auth.signIn', 'POST', {'email': 'invalid'}, 'Invalid input'),
        ('/auth.signIn', 'POST', {}, 'Missing fields'),
        ('/user.getProfile', 'GET', None, 'Valid endpoint'),
        ('/nonexistent', 'GET', None, '404 Not Found'),
    ]
    
    for endpoint, method, data, description in test_cases:
        try:
            response = requests.request(
                method,
                f'https://www.amerilendloan.com/api/trpc{endpoint}',
                json=data,
                headers={'Content-Type': 'application/json'}
            )
            
            # Try to parse JSON
            result = response.json()
            
            # Verify structure
            assert isinstance(result, dict), f"Response not object: {description}"
            assert 'success' in result, f"Missing success field: {description}"
            assert 'meta' in result, f"Missing meta field: {description}"
            assert 'timestamp' in result['meta'], f"Missing timestamp: {description}"
            
            # Verify data handling
            if result['success']:
                assert 'data' in result, f"Missing data field on success: {description}"
                # data can be null, but should exist
            else:
                assert 'error' in result, f"Missing error field on failure: {description}"
                assert 'code' in result['error'], f"Missing error code: {description}"
                assert 'message' in result['error'], f"Missing error message: {description}"
            
            print(f"✓ {description} - Valid JSON response")
            
        except json.JSONDecodeError as e:
            print(f"✗ {description} - FAILED TO PARSE JSON: {e}")
            print(f"  Response: {response.text[:200]}")
            raise
        except AssertionError as e:
            print(f"✗ {description} - Structure validation failed: {e}")
            raise

if __name__ == '__main__':
    test_json_response_guarantee()
    print("\n✅ All responses are valid JSON!")
```

## Guarantees Summary

| Scenario | HTTP Status | Response | Data Field |
|----------|------------|----------|-----------|
| Success with data | 200 | Valid JSON | Object/Array |
| Success with no data | 200 | Valid JSON | `null` |
| Empty list | 200 | Valid JSON | `{items: []}` |
| Bad request | 400 | Valid JSON | Missing (error present) |
| Missing fields | 422 | Valid JSON | Missing (error present) |
| Not found | 404 | Valid JSON | Missing (error present) |
| Server error | 500 | Valid JSON | Missing (error present) |
| Serialization error | 500 | Valid JSON fallback | Missing |

## Best Practices

1. **Always Check `success` Flag** - Use this to determine success/failure, not HTTP status
2. **Handle `null` Data** - Don't assume data is an object; it may be `null`
3. **Check for Pagination** - Lists may include pagination metadata
4. **Use Proper Headers** - Always send `Content-Type: application/json`
5. **Parse Response Safely** - Use `.json()` method which is guaranteed to work
6. **Log Timestamps** - All responses include `meta.timestamp` for debugging

## Troubleshooting

### Issue: `JSONDecodeError` when parsing response
**Solution:** This should never happen! If it does, report the full response text as it indicates a bug in the error handling.

### Issue: Response is empty or undefined
**Solution:** The API now returns proper `null` values instead of undefined. Check if `data: null` in response.

### Issue: Data field sometimes missing
**Solution:** Check the `success` flag. When `success: false`, the `error` field is present instead of `data`.

### Issue: Circular reference error
**Solution:** The response formatter automatically detects and replaces circular references. Contact support if you see this in responses.
