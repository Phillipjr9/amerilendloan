# Password Reset Validation Testing Guide

## Overview
The password reset functionality now includes comprehensive validation and error handling.

## Password Reset Endpoint: `otp.resetPasswordWithOTP`

### Required Parameters
```json
{
  "email": "user@example.com",           // Must be valid email format
  "code": "123456",                      // Must be exactly 6 digits
  "newPassword": "NewPassword123"        // Minimum 8 characters
}
```

## Validation Tests

### Test 1: Missing Required Fields ✅
**Expected Behavior:** Returns error
- Missing email
- Missing code
- Missing newPassword

**Error Code:** 400 Bad Request

### Test 2: Invalid Email Format ✅
**Input:** `"invalid-email"` (missing @domain)
**Expected Response:** Validation error
**Error Code:** 400 Bad Request

### Test 3: Invalid OTP Code Length ✅
**Input:** `"12345"` (5 digits instead of 6)
**Expected Response:** Validation error - "code must be exactly 6 digits"
**Error Code:** 400 Bad Request

### Test 4: Weak Password ✅
**Input:** `"short"` (less than 8 characters)
**Expected Response:** Validation error - "password must be at least 8 characters"
**Error Code:** 400 Bad Request

### Test 5: Invalid/Expired OTP Code ✅
**Input:** Valid format but non-existent OTP
**Expected Response:** "Invalid or expired code"
**Error Code:** 400 Bad Request

### Test 6: User Not Found ✅
**Input:** Valid format but non-existent user email
**Expected Response:** "User not found"
**Error Code:** 404 Not Found

## Success Response

**Status Code:** 200 OK
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## Post-Reset Actions
1. ✅ Password is hashed and updated in database
2. ✅ Activity is logged: `password_reset` via OTP Flow
3. ✅ Confirmation email is sent with:
   - Password reset successful notification
   - Security reminders
   - Support contact information
4. ✅ User can immediately log in with new password

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid or expired code"
  }
}
```

### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found"
  }
}
```

## Running Tests Locally

### Option 1: Using curl
```bash
# Test missing email
curl -X POST https://www.amerilendloan.com/api/trpc/otp.resetPasswordWithOTP \
  -H "Content-Type: application/json" \
  -d '{"code":"123456","newPassword":"TestPass123"}'

# Test invalid password length
curl -X POST https://www.amerilendloan.com/api/trpc/otp.resetPasswordWithOTP \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456","newPassword":"short"}'

# Test invalid OTP code length
curl -X POST https://www.amerilendloan.com/api/trpc/otp.resetPasswordWithOTP \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"12345","newPassword":"ValidPassword123"}'
```

### Option 2: Using Python (test-password-reset.py)
```bash
python test-password-reset.py
```

Requires: `requests` library
```bash
pip install requests
```

## Security Features

✅ **Password Hashing:** Uses bcryptjs with salt rounds
✅ **OTP Validation:** Verifies code hasn't expired
✅ **Rate Limiting:** Login attempts tracked to prevent brute force
✅ **Activity Logging:** All password resets logged with timestamp
✅ **Email Notification:** User alerted of password change
✅ **Min Password Length:** 8 characters required
✅ **User Verification:** Email must exist in system

## Integration with Frontend

The OTPLogin.tsx component now:
1. Requests OTP code via `otp.requestCode`
2. User verifies OTP
3. User enters new password
4. Calls `otp.resetPasswordWithOTP` with all three parameters
5. On success:
   - Shows "Password updated successfully" toast
   - Redirects to login form
   - User can log in with new password

## Troubleshooting

### "Invalid or expired code"
- Code may have expired (typically valid for 10 minutes)
- Request a new code and try again
- Ensure code is exactly 6 digits

### "User not found"
- Email doesn't exist in system
- Check spelling of email address
- May need to sign up first

### "Password must be at least 8 characters"
- Password too short
- Use minimum 8 characters
- Consider adding uppercase, lowercase, numbers for security

### No confirmation email received
- Check spam/junk folder
- May take 30-60 seconds to deliver
- Contact support if issue persists
