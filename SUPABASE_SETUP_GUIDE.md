# Supabase Setup Guide

## Overview
Supabase provides backup authentication with email/password and OTP functionality. This guide helps you configure it for the AmeriLend application.

## Prerequisites
- Supabase account (free tier available at https://supabase.com)
- Access to Railway environment variables

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project" 
3. Fill in project details:
   - **Name**: `amerilendloan` (or your preferred name)
   - **Database Password**: Create a secure password (save it!)
   - **Region**: Select closest to your users
4. Click "Create new project" and wait for it to initialize (2-3 minutes)

## Step 2: Get Your Supabase Credentials

Once the project is created:

1. Go to **Settings** → **API** 
2. You'll see:
   - **Project URL** (looks like: `https://xxxxxxxxxxx.supabase.co`)
   - **API Keys** section with:
     - **public (anon)** key - This is what you need for `VITE_SUPABASE_ANON_KEY`
     - **secret** key - Only use on backend if needed

3. Copy these values:
   ```
   VITE_SUPABASE_URL = https://xxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGc....... (long string)
   ```

## Step 3: Configure Railway Environment Variables

1. Go to your Railway project dashboard
2. Find the application service
3. Go to **Variables** tab
4. Add/update the following variables:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc.......
   ```
5. Click **Deploy** to apply changes

## Step 4: Verify Setup

After deployment, check the Railway logs:

- **✅ Success**: You'll see `✅ Supabase client initialized successfully`
- **❌ Error**: If you see `❌ Failed to initialize Supabase client`, check:
  - Credentials are copied correctly (no extra spaces)
  - Both variables are set
  - Credentials haven't expired

## Step 5: Enable Auth Features (Optional)

In Supabase dashboard, configure authentication:

1. Go to **Authentication** → **Providers**
2. Enable desired providers:
   - Email (already enabled by default)
   - Phone
   - OAuth providers (Google, GitHub, etc.)

3. Go to **URL Configuration**
   - Add your application URLs to the allowed redirect URLs:
     ```
     http://localhost:3000/auth/callback
     https://yourdomain.com/auth/callback
     ```

## Authentication Methods Available

Once configured, users can authenticate via:

### 1. **Email/Password** (via supabaseSignUp, supabaseSignIn)
```typescript
// Sign up
const result = await trpc.auth.supabaseSignUp.mutate({
  email: "user@example.com",
  password: "securePassword123",
  fullName: "John Doe"
});

// Sign in
const result = await trpc.auth.supabaseSignIn.mutate({
  email: "user@example.com",
  password: "securePassword123"
});
```

### 2. **Email OTP** (via supabaseSignInWithOTP)
```typescript
// Request OTP
const result = await trpc.auth.supabaseSignInWithOTP.mutate({
  email: "user@example.com"
});

// Verify OTP
const result = await trpc.auth.supabaseVerifyOTP.mutate({
  email: "user@example.com",
  token: "123456"
});
```

## Troubleshooting

### "Invalid API key" Error
- **Cause**: API key is invalid or misconfigured
- **Solution**: 
  - Verify credentials from Supabase dashboard
  - Check for extra spaces or special characters
  - Ensure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
  - Re-deploy after updating

### User Email Verification Not Working
- **Cause**: Email provider not configured or rate limited
- **Solution**:
  1. Go to Supabase → **Settings** → **Auth** → **Email**
  2. Check SMTP configuration
  3. Verify SendGrid integration if using custom emails
  4. Check email sending limits

### Redirect URL Mismatch After Login
- **Cause**: OAuth redirect URI not configured in Supabase
- **Solution**:
  1. Go to Supabase → **Authentication** → **URL Configuration**
  2. Add the exact redirect URLs used in your app:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

### Session Not Persisting
- **Cause**: Session storage not configured in browser
- **Solution**: The app uses secure cookies for session management, which should work automatically

## Fallback Behavior

If Supabase is not configured:
- Email/password authentication is disabled
- OTP authentication still works (via your custom system)
- OAuth authentication (primary method) remains fully functional
- App continues to work normally with OAuth-only users

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit credentials** to Git
2. **Use environment variables** for all sensitive data
3. **Use ANON key only** in frontend/client code
4. **Rotate keys regularly** in production
5. **Monitor authentication logs** in Supabase dashboard
6. **Enable 2FA** on your Supabase account
7. **Review user permissions** in Supabase Auth settings

## Support

For Supabase documentation: https://supabase.com/docs
For issues: https://supabase.com/support

## Current Implementation Status

✅ **Implemented**:
- Email/password signup and signin
- Email OTP verification
- Password reset via email
- Profile updates
- Session management
- Error handling and logging

⏳ **Optional**:
- Social OAuth providers (can be added)
- Phone authentication (can be added)
- Row-level security (can be configured)
