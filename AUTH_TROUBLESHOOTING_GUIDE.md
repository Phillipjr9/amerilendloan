# Authentication Issues - Troubleshooting Guide

## Issue 1: Admin Login Showing "Incorrect Password"

### Root Cause
The admin user account doesn't exist in Supabase yet. When using Supabase email/password authentication, users need to be created first.

### Solutions

#### **Option A: Create Admin Account in Supabase Dashboard (Recommended)**

1. Go to **Supabase Dashboard** → Your project
2. Click **Authentication** → **Users**
3. Click **"Add user"** button
4. Fill in:
   - **Email**: `admin@amerilendloan.com`
   - **Password**: Enter a secure password
   - Check **"Auto confirm user"** checkbox
5. Click **"Create user"**

Now the admin can log in with email/password in the app.

#### **Option B: Use OAuth Instead (Faster)**

If you don't want to set up Supabase email/password:
1. Click **"Login with Manus OAuth"** button on the login page
2. This uses your OAuth provider and doesn't need Supabase email setup
3. Recommended for production use

#### **Option C: Implement Auto-Signup (For Testing)**

The app will automatically create users on first OAuth login. No manual setup needed.

---

## Issue 2: OAuth Returning 404 Error

### Root Cause
The OAuth callback URL might not be configured correctly on the OAuth server, or there's a mismatch between:
- Redirect URI in app: `{your-domain}/api/oauth/callback`
- Redirect URI on OAuth server: Must match exactly

### Diagnosis Steps

1. **Check Browser Console**:
   - Open DevTools (F12) → Console tab
   - Click "Login with Manus OAuth"
   - Look for any error messages

2. **Check the Redirect URL**:
   - The app constructs it as: `{window.location.origin}/api/oauth/callback`
   - For `https://amerilend.yourdomain.com`, it becomes: `https://amerilend.yourdomain.com/api/oauth/callback`

3. **Verify Environment Variables**:
   - `VITE_OAUTH_PORTAL_URL`: Should be the OAuth provider's URL
   - `VITE_APP_ID`: Should match the app ID registered on OAuth server

### Solutions

#### **If Using Manus OAuth**:

1. Go to **Manus OAuth Server** → App Settings
2. Find your app (ID: from `VITE_APP_ID`)
3. In **Redirect URIs**, ensure it includes:
   ```
   https://your-domain.com/api/oauth/callback
   ```
4. If you're testing locally:
   ```
   http://localhost:5173/api/oauth/callback
   ```
5. Save changes and retry

#### **Quick Test**:

Test the OAuth callback endpoint directly:
```
curl https://your-domain.com/api/oauth/callback?code=test&state=test
```

Should return error about missing code/state (that's normal), not 404.

---

## Issue 3: Password Reset Sends OTP Without New Password Entry

### Status: ✅ FIXED

The password reset flow now works correctly:

1. **Step 1**: Enter email or username
2. **Step 2**: Verify OTP code (6 digits sent to email)
3. **Step 3**: Enter new password (NEW - just added!)
4. **Done**: Password updated, can now log in

### What Changed

- Added new password entry screen after OTP verification
- Validates password meets security requirements
- Shows password confirmation field
- Only allows update if passwords match

---

## Complete Authentication Flow

### Email/Password Authentication (via Supabase)

```
User enters email + password
         ↓
  Supabase validates
         ↓
  Account found?
    ├─ Yes → Login successful → Create session → Redirect to dashboard
    └─ No → Show "Incorrect email/password" → Try OAuth fallback
```

### OAuth Authentication (Manus)

```
User clicks "Login with Manus OAuth"
         ↓
  Redirected to OAuth server
         ↓
  User authorizes AmeriLend
         ↓
  Redirected back to /api/oauth/callback
         ↓
  Exchange code for token
         ↓
  Get user info (openId, email, name)
         ↓
  Create/update user in database
         ↓
  Create session → Redirect to dashboard
```

### OTP Authentication (Email Code)

```
User enters email
         ↓
  Send 6-digit OTP to email
         ↓
  User enters code
         ↓
  Verify code matches
         ↓
  Create session → Redirect to dashboard
```

---

## Next Steps to Get Working

### For Admin to Login:

**Choose ONE option:**

1. **Create in Supabase** (5 minutes)
   - Go to Supabase → Auth → Users
   - Add admin@amerilendloan.com with password
   - Checkmark "Auto confirm user"
   - Save

2. **Use OAuth** (immediate)
   - Click "Login with Manus OAuth"
   - Authorize once
   - Done

3. **Use OTP** (immediate)
   - Switch to OTP login on login page
   - Email will receive code
   - Done

### For OAuth 404:

1. Verify `VITE_OAUTH_PORTAL_URL` is set correctly in Railway
2. Check OAuth server has correct redirect URI
3. Test callback endpoint with curl

### For Password Reset:

✅ Already working! Just tested the new flow.

---

## Environment Variables Checklist

Make sure these are set in Railway:

```
✅ VITE_SUPABASE_URL = https://sgimfnmtisqkitrghxrx.supabase.co
✅ VITE_SUPABASE_ANON_KEY = eyJhbGc...

✅ VITE_OAUTH_PORTAL_URL = https://your-oauth-server.com
✅ VITE_APP_ID = amerilend (or your app ID)

✅ OWNER_OPEN_ID = (admin's openId from OAuth, or empty if not used)
```

---

## Support

If issues persist:

1. Check Railway logs for error messages
2. Check browser console (F12) for frontend errors
3. Verify all environment variables are set
4. Try using OTP login as fallback while debugging

---

Last Updated: November 18, 2025
