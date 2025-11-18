# API Response Handling - Quick Reference

## Problem Solved

✅ **Empty Response Bodies** - Fixed with guaranteed JSON wrapper  
✅ **JSONDecodeError on Clients** - Eliminated by ensuring valid JSON always  
✅ **Missing Field Ambiguity** - Resolved with `missing_fields` array in errors  
✅ **Validation Error Details** - Complete field-level error mapping provided  
✅ **Circular References** - Handled with safe stringification  
✅ **Undefined Data** - Converted to `null` for JSON compatibility  

## Key Files

- `server/_core/response-formatter.ts` - JSON response formatting & serialization safety
- `server/_core/validation-handler.ts` - Field-level validation error parsing
- `server/_core/error-handler.ts` - Global error middleware with detailed parsing
- `server/_core/index.ts` - Middleware integration
- Documentation: `JSON_RESPONSE_GUARANTEE.md`, `FIELD_VALIDATION_ERRORS.md`

## Response Examples

### Success (200 OK)
```json
{
  "success": true,
  "data": { "id": 1, "name": "John" },
  "meta": { "timestamp": "2025-11-18T10:30:00.000Z" }
}
```

### Not Found (200 OK with null)
```json
{
  "success": true,
  "data": null,
  "meta": { "timestamp": "2025-11-18T10:30:00.000Z" }
}
```

### Missing Required Fields (422)
```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELD",
    "message": "Missing required fields: email, password",
    "details": {
      "missing_fields": ["email", "password"],
      "field_errors": {
        "email": ["Email is required"],
        "password": ["Password must be at least 8 characters"]
      }
    }
  },
  "meta": { "timestamp": "2025-11-18T10:30:00.000Z" }
}
```

### Validation Error (422)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "2 fields failed validation",
    "details": {
      "field_errors": {
        "dateOfBirth": ["Date must be YYYY-MM-DD format"],
        "ssn": ["SSN must be XXX-XX-XXXX format"]
      },
      "invalid_fields": [
        {
          "field": "dateOfBirth",
          "message": "Date must be YYYY-MM-DD format",
          "code": "invalid_string",
          "expected": "YYYY-MM-DD format",
          "received": "01/15/1990"
        }
      ]
    }
  },
  "meta": { "timestamp": "2025-11-18T10:30:00.000Z" }
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Database connection failed"
  },
  "meta": { "timestamp": "2025-11-18T10:30:00.000Z" }
}
```

## Client Implementation

### JavaScript
```typescript
// Guaranteed to parse (never JSONDecodeError)
const response = await fetch('/api/trpc/endpoint')
  .then(r => r.json())
  .then(data => {
    if (!data.success) {
      console.error(data.error.message);
      // Show field-level errors if available
      if (data.error.details?.missing_fields) {
        console.log('Missing:', data.error.details.missing_fields);
      }
    }
    return data.data; // Could be null - that's OK
  });
```

### Python
```python
# Always returns valid JSON
response = requests.get('/api/trpc/endpoint').json()

if not response['success']:
    error = response['error']
    print(f"Error [{error['code']}]: {error['message']}")
    
    # Show which fields are missing
    if 'missing_fields' in error['details']:
        print(f"Missing: {error['details']['missing_fields']}")

data = response['data']  # Could be None - that's OK
```

## Testing Examples

### Test Missing Fields
```bash
curl -X POST https://www.amerilendloan.com/api/trpc/auth.signUp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Returns 422 with missing_fields: ["password", "firstName", "lastName"]
```

### Test Malformed JSON
```bash
curl -X POST https://www.amerilendloan.com/api/trpc/auth.signIn \
  -H "Content-Type: application/json" \
  -d '{invalid json}'

# Returns 400 with MALFORMED_JSON error code
```

### Test Not Found
```bash
curl https://www.amerilendloan.com/api/trpc/user.getById?id=999

# Returns 200 with data: null
```

### Test 404
```bash
curl https://www.amerilendloan.com/api/nonexistent

# Returns 404 with NOT_FOUND error code
```

## Error Codes Reference

| Code | HTTP | Meaning |
|------|------|---------|
| `MISSING_REQUIRED_FIELD` | 422 | One or more required fields missing |
| `VALIDATION_ERROR` | 422 | Field validation failed |
| `MALFORMED_JSON` | 400 | Invalid JSON in request body |
| `INVALID_INPUT` | 400 | Wrong Content-Type or other input issue |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Route not found |
| `CONFLICT` | 409 | Duplicate entry |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service down |

## Response Details Structure

### `missing_fields` (Array)
List of field names that are required but missing:
```json
"missing_fields": ["email", "password"]
```

### `field_errors` (Object)
Map of field names to error messages:
```json
"field_errors": {
  "email": ["Email is required"],
  "password": ["Password must be at least 8 characters"]
}
```

### `invalid_fields` (Array)
Detailed validation errors for each field:
```json
"invalid_fields": [
  {
    "field": "dateOfBirth",
    "message": "Date must be YYYY-MM-DD format",
    "code": "invalid_string",
    "expected": "YYYY-MM-DD format",
    "received": "01/15/1990"
  }
]
```

## Guarantees

✅ **Every response is valid JSON** - parseable by `JSON.parse()` or equivalent  
✅ **No empty responses** - always includes `success`, `error` or `data`, and `meta`  
✅ **No undefined values** - converted to `null`  
✅ **Proper headers** - `Content-Type: application/json` on all responses  
✅ **Timestamps on all responses** - for debugging and tracing  
✅ **Consistent structure** - same format for success and error responses  

## Debugging Tips

1. **Check `success` flag first** - not just HTTP status code
2. **Look for `missing_fields`** - quick way to see what's required
3. **Check `field_errors`** - field-by-field error details
4. **Review `invalid_fields`** - for validation error details
5. **Use `meta.timestamp`** - to correlate with server logs
6. **Test with curl** - to verify raw response before integrating

## Common Issues & Solutions

### Issue: Field error not showing
**Solution:** Check if it's in `missing_fields` (required) or `invalid_fields` (validation)

### Issue: Can't parse response
**Solution:** Use `.json()` method - API guarantees valid JSON. If you see `JSONDecodeError`, report as bug.

### Issue: Data is null
**Solution:** That's normal for "not found" responses. Check `success: true` with `data: null`.

### Issue: Don't see field error
**Solution:** Check `field_errors` object (simple) and `invalid_fields` array (detailed)

## Migration Guide

### Old Behavior
```typescript
// Might throw JSONDecodeError
const data = await response.json();
// data could be undefined or empty string
```

### New Behavior
```typescript
// Always valid JSON, never throws
const { success, data, error } = await response.json();

if (!success) {
  // Check missing_fields for required fields
  const missing = error.details?.missing_fields || [];
  console.log('Missing:', missing);
  
  // Check field_errors for all errors
  const fieldErrs = error.details?.field_errors || {};
  Object.entries(fieldErrs).forEach(([field, errors]) => {
    console.log(`${field}: ${errors[0]}`);
  });
}

// data is guaranteed to be valid (could be null)
```

## Performance Notes

- Response formatting adds minimal overhead (< 1ms for typical responses)
- Safe stringification only activates for problematic objects
- Circular reference detection prevents infinite loops
- Depth limiting prevents stack overflow

## Security Notes

- Stack traces only included in development mode
- Error details don't expose sensitive information
- Timestamps help with security auditing
- All responses validated for JSON compliance

---

**For full documentation, see:**
- `JSON_RESPONSE_GUARANTEE.md` - Complete response handling guarantee
- `FIELD_VALIDATION_ERRORS.md` - Field-level validation details
- `GLOBAL_ERROR_HANDLING.md` - Global error handling architecture
