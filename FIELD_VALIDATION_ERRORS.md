# Field-Level Validation Error Handling

## Overview

The API now implements comprehensive field-level validation with detailed error responses that specifically identify missing required fields and provide granular validation error information.

## Features

✅ **Missing Field Detection** - Identifies all missing required fields with specific error code  
✅ **Field-Level Error Details** - Reports errors for each field independently  
✅ **Validation Error Categorization** - Separates missing fields from other validation failures  
✅ **Comprehensive Error Objects** - Returns multiple error object formats for flexibility  
✅ **Clear Error Messages** - User-friendly messages with field names  
✅ **HTTP 422 Status** - Proper status code for unprocessable entities  

## Error Response Structure

When validation fails, the API returns a standardized error response:

```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELDS",
    "message": "Missing required fields: email, password",
    "details": {
      "missing_fields": ["email", "password"],
      "field_errors": {
        "email": ["Email is required", "Invalid email format"],
        "password": ["Password must be at least 8 characters"],
        "firstName": ["First name is required"],
        "lastName": ["Last name is required"]
      },
      "invalid_fields": [
        {
          "field": "password",
          "message": "Password must be at least 8 characters",
          "code": "too_small",
          "expected": "string",
          "received": "string"
        }
      ]
    },
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

## Error Codes

### MISSING_REQUIRED_FIELDS (422)
Returned when one or more required fields are missing from the request.

**Response Structure:**
```json
{
  "missing_fields": ["field1", "field2", ...],
  "field_errors": { "field1": ["error message"], ... }
}
```

### VALIDATION_ERROR (422)
Returned when fields are present but fail validation (wrong format, invalid value, etc.).

**Response Structure:**
```json
{
  "invalid_fields": [
    {
      "field": "fieldName",
      "message": "Error description",
      "code": "validation_code",
      "expected": "expected_value",
      "received": "actual_value"
    }
  ],
  "field_errors": { "fieldName": ["error message"], ... }
}
```

### VALIDATION_ERROR (422) - Mixed
Returned when both missing fields and validation errors are present.

**Response Structure:**
```json
{
  "missing_fields": ["field1", ...],
  "invalid_fields": [...],
  "field_errors": { ... }
}
```

## Error Details Object

Each error response includes a `details` object with three components:

### 1. `missing_fields` (Array)
Array of field names that are required but missing from the request.

```typescript
"missing_fields": ["email", "password", "firstName"]
```

### 2. `field_errors` (Object)
Map of field names to arrays of error messages. Includes both missing and validation errors.

```typescript
"field_errors": {
  "email": ["Email is required"],
  "password": ["Password must be at least 8 characters", "Weak password"],
  "dateOfBirth": ["Date must be YYYY-MM-DD format"]
}
```

### 3. `invalid_fields` (Array)
Detailed array of validation errors for fields that failed validation (excluding missing fields).

```typescript
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

## API Endpoints Using Validation

### Authentication Endpoints

#### POST `/api/trpc/auth.supabaseSignUp`

**Required Fields:**
- `email` - Valid email address
- `password` - Minimum 8 characters
- `firstName` - Non-empty string
- `lastName` - Non-empty string

**Example Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELDS",
    "message": "Missing required fields: firstName, lastName",
    "details": {
      "missing_fields": ["firstName", "lastName"],
      "field_errors": {
        "email": ["Invalid email format"],
        "password": ["Password must be at least 8 characters"],
        "firstName": ["First name is required"],
        "lastName": ["Last name is required"]
      }
    },
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

#### POST `/api/trpc/auth.supabaseSignIn`

**Required Fields:**
- `email` - Valid email address
- `password` - Non-empty string

**Example Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELDS",
    "message": "Missing required field: password",
    "details": {
      "missing_fields": ["password"],
      "field_errors": {
        "email": ["Invalid email format"],
        "password": ["Password is required"]
      }
    },
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

#### POST `/api/trpc/otp.resetPasswordWithOTP`

**Required Fields:**
- `email` - Valid email address
- `code` - 6-digit OTP code
- `newPassword` - Minimum 8 characters

**Example Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELDS",
    "message": "Missing required fields: code, newPassword",
    "details": {
      "missing_fields": ["code", "newPassword"],
      "field_errors": {
        "email": ["Invalid email format"],
        "code": ["OTP must be 6 digits"],
        "newPassword": ["Password must be at least 8 characters"]
      },
      "invalid_fields": [
        {
          "field": "code",
          "message": "OTP must be 6 digits",
          "code": "invalid_string",
          "expected": "6 digit format",
          "received": "12345"
        }
      ]
    },
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

### Loan Endpoints

#### POST `/api/trpc/loans.checkDuplicate`

**Required Fields:**
- `dateOfBirth` - Format: YYYY-MM-DD
- `ssn` - Format: XXX-XX-XXXX

**Example Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field: ssn and 1 invalid field",
    "details": {
      "missing_fields": ["ssn"],
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
    },
    "timestamp": "2025-11-18T10:30:00.000Z"
  }
}
```

## Frontend Integration Examples

### JavaScript/TypeScript

```typescript
async function handleSignUp(formData: any) {
  try {
    const response = await fetch('/api/trpc/auth.supabaseSignUp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (!result.success) {
      const { error } = result;
      
      // Check if it's a missing fields error
      if (error.code === 'MISSING_REQUIRED_FIELDS') {
        const missing = error.details.missing_fields;
        console.error(`Missing fields: ${missing.join(', ')}`);
        
        // Display to user
        missing.forEach(field => {
          displayFieldError(field, `${field} is required`);
        });
      }

      // Check for other validation errors
      if (error.details.field_errors) {
        Object.entries(error.details.field_errors).forEach(([field, errors]) => {
          displayFieldError(field, errors[0]);
        });
      }
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

function displayFieldError(fieldName: string, errorMessage: string) {
  const field = document.querySelector(`[name="${fieldName}"]`);
  if (field) {
    field.classList.add('error');
    field.nextElementSibling.textContent = errorMessage;
  }
}
```

### React Hook

```typescript
import { useState } from 'react';

export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const handleApiError = (errorResponse: any) => {
    const { error } = errorResponse;

    // Handle missing required fields
    if (error.code === 'MISSING_REQUIRED_FIELDS') {
      setMissingFields(error.details.missing_fields || []);
    }

    // Map all field errors
    const fieldErrors: Record<string, string> = {};
    if (error.details.field_errors) {
      Object.entries(error.details.field_errors).forEach(([field, messages]) => {
        fieldErrors[field] = (messages as string[])[0] || 'Invalid input';
      });
    }
    setErrors(fieldErrors);
  };

  return { errors, missingFields, handleApiError };
}

// Usage in component
function SignUpForm() {
  const { errors, missingFields, handleApiError } = useFormValidation();

  const onSubmit = async (formData) => {
    try {
      const response = await fetch('/api/trpc/auth.supabaseSignUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (!result.success) {
        handleApiError(result);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(new FormData(e.currentTarget));
    }}>
      <input 
        name="email" 
        type="email"
        className={errors.email ? 'input-error' : ''}
      />
      {errors.email && <span className="error-text">{errors.email}</span>}
      {missingFields.includes('email') && <span className="missing">Email is required</span>}
      
      {/* More fields... */}
    </form>
  );
}
```

### Python (Testing)

```python
import requests
import json

def test_missing_fields():
    """Test API validation with missing fields"""
    
    # Submit form with missing required fields
    response = requests.post(
        'https://www.amerilendloan.com/api/trpc/auth.supabaseSignUp',
        json={
            'email': 'user@example.com'
            # Missing: password, firstName, lastName
        },
        headers={'Content-Type': 'application/json'}
    )
    
    data = response.json()
    
    # Verify error response
    assert not data['success']
    assert data['error']['code'] == 'MISSING_REQUIRED_FIELDS'
    assert 'password' in data['error']['details']['missing_fields']
    assert 'firstName' in data['error']['details']['missing_fields']
    assert 'lastName' in data['error']['details']['missing_fields']
    
    # Check field_errors map
    assert 'password' in data['error']['details']['field_errors']
    assert 'firstName' in data['error']['details']['field_errors']
    
    print(f"✓ Missing fields correctly detected: {data['error']['details']['missing_fields']}")

def test_validation_error():
    """Test API validation with invalid format"""
    
    response = requests.post(
        'https://www.amerilendloan.com/api/trpc/auth.supabaseSignUp',
        json={
            'email': 'not-an-email',  # Invalid format
            'password': 'short',  # Too short
            'firstName': 'John',
            'lastName': 'Doe'
        },
        headers={'Content-Type': 'application/json'}
    )
    
    data = response.json()
    
    # Verify validation error
    assert not data['success']
    assert data['error']['code'] in ['VALIDATION_ERROR', 'MISSING_REQUIRED_FIELDS']
    assert 'email' in data['error']['details']['field_errors']
    assert 'password' in data['error']['details']['field_errors']
    
    print(f"✓ Validation errors detected: {data['error']['details']['field_errors']}")

def test_mixed_error():
    """Test API validation with both missing and invalid fields"""
    
    response = requests.post(
        'https://www.amerilendloan.com/api/trpc/loans.checkDuplicate',
        json={
            'dateOfBirth': 'invalid-date'  # Wrong format, ssn missing
        },
        headers={'Content-Type': 'application/json'}
    )
    
    data = response.json()
    
    # Verify both missing and validation errors
    assert not data['success']
    assert 'ssn' in data['error']['details']['missing_fields']
    assert 'dateOfBirth' in data['error']['details']['invalid_fields'][0]['field']
    
    print(f"✓ Mixed errors handled: Missing {data['error']['details']['missing_fields']}, Invalid {len(data['error']['details']['invalid_fields'])} fields")

if __name__ == '__main__':
    test_missing_fields()
    test_validation_error()
    test_mixed_error()
    print("\n✅ All validation tests passed!")
```

### cURL Examples

```bash
# Test missing required fields
curl -X POST https://www.amerilendloan.com/api/trpc/auth.supabaseSignUp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'

# Response:
# {
#   "success": false,
#   "error": {
#     "code": "MISSING_REQUIRED_FIELDS",
#     "message": "Missing required fields: password, firstName, lastName",
#     "details": {
#       "missing_fields": ["password", "firstName", "lastName"],
#       "field_errors": {
#         "password": ["Password must be at least 8 characters"],
#         "firstName": ["First name is required"],
#         "lastName": ["Last name is required"]
#       }
#     }
#   }
# }

# Test validation errors
curl -X POST https://www.amerilendloan.com/api/trpc/loans.checkDuplicate \
  -H "Content-Type: application/json" \
  -d '{
    "dateOfBirth": "invalid",
    "ssn": "123456789"
  }'

# Response:
# {
#   "success": false,
#   "error": {
#     "code": "VALIDATION_ERROR",
#     "message": "2 fields failed validation",
#     "details": {
#       "missing_fields": [],
#       "invalid_fields": [
#         {
#           "field": "dateOfBirth",
#           "message": "Date must be YYYY-MM-DD format",
#           "code": "invalid_string",
#           "expected": "YYYY-MM-DD format",
#           "received": "invalid"
#         },
#         {
#           "field": "ssn",
#           "message": "SSN must be XXX-XX-XXXX format",
#           "code": "invalid_string",
#           "expected": "XXX-XX-XXXX format",
#           "received": "123456789"
#         }
#       ]
#     }
#   }
# }
```

## Implementation Benefits

1. **Clear Missing Field Identification** - Clients can immediately see which required fields are missing
2. **Detailed Validation Context** - Full information about what was expected vs. what was received
3. **Flexible Error Handling** - Three different error object formats for different client needs
4. **User-Friendly Messages** - Automatic message generation based on error type
5. **Type-Safe** - Zod schema validation ensures type safety on the server
6. **Consistent Across APIs** - All endpoints follow the same validation and error format

## Best Practices for API Clients

1. **Check Error Code First** - Determine if it's missing fields vs. validation error
2. **Use missing_fields Array** - For quick checks on missing required fields
3. **Use field_errors Map** - For field-by-field error display in forms
4. **Check invalid_fields Array** - For detailed validation error information
5. **Display User-Friendly Messages** - Use the message string or field-level errors for UX
6. **Always Handle 422 Status** - Treat as user input validation, not server error

## Testing Checklist

- [ ] Test with all required fields missing
- [ ] Test with individual required fields missing
- [ ] Test with invalid format in one field
- [ ] Test with invalid format in multiple fields
- [ ] Test with both missing and invalid fields
- [ ] Verify `missing_fields` array is populated correctly
- [ ] Verify `field_errors` map includes all errors
- [ ] Verify `invalid_fields` details are accurate
- [ ] Verify HTTP 422 status code is returned
- [ ] Verify error message is user-friendly
