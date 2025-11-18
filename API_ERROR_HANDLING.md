# Standardized API Error Handling

## Overview

All AmeriLend API endpoints now return standardized JSON responses with consistent error structures.

## Response Structure

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "timestamp": "2025-11-18T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional detailed error information
    }
  },
  "timestamp": "2025-11-18T10:30:00.000Z"
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/Query |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid input/validation error |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Authenticated but no permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry/resource already exists |
| 422 | Unprocessable Entity | Semantic validation error |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily down |

## Error Codes

### Validation Errors
- `VALIDATION_ERROR` - Input validation failed
- `INVALID_DATE_FORMAT` - Date format incorrect
- `INVALID_EMAIL_FORMAT` - Email format invalid
- `INVALID_SSN_FORMAT` - SSN format invalid
- `WEAK_PASSWORD` - Password doesn't meet requirements

### Business Logic Errors
- `DUPLICATE_ENTRY` - Duplicate record found (HTTP 409)
- `NOT_FOUND` - Resource not found
- `ACCOUNT_LOCKED` - Account is locked
- `INVALID_OTP` - OTP code invalid or expired
- `INVALID_CREDENTIALS` - Wrong email/password

### Authentication/Authorization
- `UNAUTHORIZED` - No authentication provided
- `FORBIDDEN` - No permission for this resource

### System Errors
- `INTERNAL_ERROR` - Unexpected server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable

## Examples

### Example 1: Duplicate Detection (409 Conflict)
**Request:**
```bash
POST /api/trpc/loans.checkDuplicate
{
  "dateOfBirth": "1990-01-01",
  "ssn": "123-45-6789"
}
```

**Response (Duplicate Found):**
```json
{
  "hasDuplicate": true,
  "isDuplicate": true,
  "status": "pending",
  "trackingNumber": "AMG-2025-001234",
  "maskedEmail": "joh***@example.com",
  "message": "Existing pending application found. Tracking: AMG-2025-001234",
  "canApply": false
}
```

**Response (No Duplicate):**
```json
{
  "hasDuplicate": false,
  "isDuplicate": false,
  "message": "No existing applications found. You can proceed with a new application.",
  "canApply": true
}
```

### Example 2: Validation Error (400 Bad Request)
**Request:**
```bash
POST /api/trpc/loans.checkDuplicate
{
  "dateOfBirth": "01-01-1990",  // Invalid format
  "ssn": "123456789"            // Invalid format
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "dateOfBirth": "Invalid date format. Use YYYY-MM-DD",
      "ssn": "Invalid SSN format. Use XXX-XX-XXXX"
    }
  },
  "timestamp": "2025-11-18T10:30:00.000Z"
}
```

### Example 3: Password Reset Success (200 OK)
**Request:**
```bash
POST /api/trpc/otp.resetPasswordWithOTP
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Password updated successfully"
  },
  "timestamp": "2025-11-18T10:30:00.000Z"
}
```

### Example 4: Invalid OTP (400 Bad Request)
**Request:**
```bash
POST /api/trpc/otp.resetPasswordWithOTP
{
  "email": "user@example.com",
  "code": "000000",  // Invalid code
  "newPassword": "NewSecurePass123"
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_OTP",
    "message": "Invalid or expired code"
  },
  "timestamp": "2025-11-18T10:30:00.000Z"
}
```

### Example 5: Missing Required Field (422 Unprocessable Entity)
**Request:**
```bash
POST /api/trpc/otp.resetPasswordWithOTP
{
  "code": "123456",
  "newPassword": "NewPassword123"
  // Missing: email
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field: email",
    "details": {
      "missing_fields": ["email"]
    }
  },
  "timestamp": "2025-11-18T10:30:00.000Z"
}
```

## Frontend Integration

### Handling Success
```typescript
if (response.data.success) {
  // Use response.data.data
  const result = response.data.data;
}
```

### Handling Errors
```typescript
if (!response.data.success) {
  const error = response.data.error;
  console.error(`[${error.code}] ${error.message}`);
  
  // Show detailed errors if available
  if (error.details) {
    Object.entries(error.details).forEach(([field, msg]) => {
      toast.error(`${field}: ${msg}`);
    });
  }
}
```

### Handling Duplicates
```typescript
const result = response.data;

if (result.hasDuplicate || result.isDuplicate) {
  toast.warning(result.message);
  
  if (!result.canApply) {
    // Disable apply button or redirect
  }
} else {
  // User can proceed with new application
}
```

## Testing

### Using curl
```bash
# Test validation error
curl -X POST https://www.amerilendloan.com/api/trpc/loans.checkDuplicate \
  -H "Content-Type: application/json" \
  -d '{"dateOfBirth":"invalid","ssn":"invalid"}'

# Test duplicate detection
curl -X POST https://www.amerilendloan.com/api/trpc/loans.checkDuplicate \
  -H "Content-Type: application/json" \
  -d '{"dateOfBirth":"1990-01-01","ssn":"123-45-6789"}'
```

### Using Python requests
```python
import requests

response = requests.post(
    'https://www.amerilendloan.com/api/trpc/otp.resetPasswordWithOTP',
    json={
        'email': 'test@example.com',
        'code': '123456',
        'newPassword': 'NewPass123'
    }
)

data = response.json()

if data['success']:
    print("Success:", data['data'])
else:
    print(f"Error [{data['error']['code']}]: {data['error']['message']}")
```

## Migration Notes

If you have existing code expecting the old response format:
- Old: `{ hasDuplicate: true, ... }`
- New: `{ hasDuplicate: true, isDuplicate: true, ... }`

Both `hasDuplicate` and `isDuplicate` are included for backwards compatibility.

## Best Practices

1. **Always check `success` field** - Don't assume success based on status code
2. **Use error codes for logic** - Check `error.code` for specific handling
3. **Display user-friendly messages** - Use `error.message` for UI
4. **Log detailed errors** - Use `error.details` for debugging
5. **Handle timestamps** - All responses include `timestamp` for logging
6. **Validate input** - Always validate before sending to API
7. **Handle network errors** - Distinguish from API errors

## Security Considerations

- Email addresses are masked in duplicate detection responses
- Sensitive data is never exposed in error messages
- Timestamps are always in UTC ISO 8601 format
- All responses are JSON (no HTML fallback to prevent XSS)
