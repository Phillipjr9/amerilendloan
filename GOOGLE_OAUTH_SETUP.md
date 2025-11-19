# Google, GitHub & Microsoft OAuth Setup Guide

This guide explains how to set up Google, GitHub, and Microsoft OAuth authentication for AmeriLend.

## Overview

The application now supports three additional OAuth providers alongside the existing Manus OAuth:
- **Google OAuth** (via Google Cloud Console)
- **GitHub OAuth** (via GitHub Developer Settings)
- **Microsoft OAuth** (via Azure Portal)

Users can sign in/sign up using any of these providers. Each provider requires credentials configured as environment variables.

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Search for "Google+ API" in the search bar
   - Click the result and enable it

### Step 2: Create OAuth 2.0 Credentials

1. Go to **Credentials** in the left sidebar
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Configure authorized redirect URIs:
   - Development: `http://localhost:5173/auth/google/callback`
   - Production: `https://www.amerilendloan.com/auth/google/callback`
5. Copy the **Client ID** and **Client Secret**

### Step 3: Add to Environment

Add these variables to your `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

## GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to GitHub Settings → **Developer settings** → **OAuth Apps**
2. Click **New OAuth App**
3. Fill in the form:
   - **Application name**: AmeriLend
   - **Homepage URL**: `https://www.amerilendloan.com`
   - **Authorization callback URL**: `https://www.amerilendloan.com/auth/github/callback`
4. Copy the **Client ID** and generate a **Client Secret**

### Step 2: Add to Environment

Add these variables to your `.env` file:

```env
VITE_GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET
```

## Microsoft OAuth Setup

### Step 1: Register Application in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: AmeriLend
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: `https://www.amerilendloan.com/auth/microsoft/callback`
5. Register the app

### Step 2: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Copy the **Value** (shown only once)

### Step 3: Get Application ID

1. Go to **Overview** tab
2. Copy the **Application (client) ID**

### Step 4: Add to Environment

Add these variables to your `.env` file:

```env
VITE_MICROSOFT_CLIENT_ID=YOUR_MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_ID=YOUR_MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET=YOUR_MICROSOFT_CLIENT_SECRET
```

## How It Works

### Frontend Flow

When a user clicks a provider button on the login/signup page:

1. **Google/GitHub/Microsoft OAuth Flow**:
   - User redirected to provider's login page
   - User grants permissions
   - Provider redirects to `/auth/{provider}/callback` with authorization code
   - Backend exchanges code for access token
   - Backend fetches user info and creates/updates user record
   - Session created and user redirected to home page

### Backend Implementation

**File**: `server/_core/oauth.ts`

Three new routes handle OAuth callbacks:
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/github/callback` - GitHub OAuth callback
- `GET /auth/microsoft/callback` - Microsoft OAuth callback

Each route:
1. Receives authorization code from provider
2. Exchanges code for access token via provider's OAuth endpoint
3. Fetches user info using access token
4. Creates/updates user in database
5. Creates JWT session token
6. Sets session cookie
7. Redirects to home page

### Frontend Implementation

**File**: `client/src/pages/OTPLogin.tsx`

Added OAuth provider buttons:
- Lines 372-423: Google sign-in button (login form)
- Lines 383-434: GitHub sign-in button (login form)
- Lines 445-496: Microsoft sign-in button (login form)
- Similar buttons in signup form (lines ~598-649)

Button handlers:
- Construct OAuth authorization URL with proper parameters
- Include redirect URI matching backend configuration
- Include scopes needed for user information
- Redirect browser to provider's authorization endpoint

### Database Schema

Users created via OAuth are stored in the same `users` table with:
- `openId`: Prefixed with provider name (e.g., `google_123456789`)
- `loginMethod`: Set to provider name (`google`, `github`, `microsoft`)
- `email`: Extracted from provider
- `name`: Extracted from provider
- `lastSignedIn`: Updated on each login

## Testing

### Local Development

1. Set up test credentials for each provider
2. Update `.env` with test credentials:
   ```env
   VITE_GOOGLE_CLIENT_ID=test_google_id
   GOOGLE_CLIENT_ID=test_google_id
   GOOGLE_CLIENT_SECRET=test_google_secret
   
   VITE_GITHUB_CLIENT_ID=test_github_id
   GITHUB_CLIENT_ID=test_github_id
   GITHUB_CLIENT_SECRET=test_github_secret
   
   VITE_MICROSOFT_CLIENT_ID=test_microsoft_id
   MICROSOFT_CLIENT_ID=test_microsoft_id
   MICROSOFT_CLIENT_SECRET=test_microsoft_secret
   ```

3. Start development server: `npm run dev`
4. Navigate to login/signup page
5. Test each provider button
6. Verify user is created and logged in

### Production Deployment

1. Configure credentials in your hosting environment (Vercel, AWS, etc.)
2. Update callback URLs to production domain: `https://www.amerilendloan.com/auth/{provider}/callback`
3. Test full flow in production environment
4. Monitor logs for any OAuth errors

## Security Notes

1. **Never commit credentials**: Keep Client IDs and Secrets in `.env` files (not in version control)
2. **Client ID on frontend**: It's safe to expose `VITE_GOOGLE_CLIENT_ID` etc. (prefixed with `VITE_`) in frontend code - these are not secrets
3. **Client Secret on backend**: Server-side Client Secrets are kept in Node.js environment and never exposed to frontend
4. **Redirect URI**: Redirect URIs are hardcoded and validated by OAuth providers
5. **HTTPS Required**: OAuth providers require HTTPS for production (except localhost)
6. **User Isolation**: Each provider account is isolated via prefixed `openId` (e.g., `google_123` vs `microsoft_456`)

## Troubleshooting

### "Invalid redirect URI" Error
- Ensure redirect URI in provider settings matches exactly: `https://www.amerilendloan.com/auth/{provider}/callback`
- No trailing slashes or different paths

### "Invalid client ID" or "Invalid client secret" Error
- Verify credentials are correctly copied from provider console
- Check `.env` file has correct variable names
- Restart dev server after changing `.env`

### User Not Logging In
- Check browser console for errors
- Check server logs at `console.log` outputs for OAuth errors
- Verify email is returned from provider
- Check database for user record with `openId` like `google_*`

### "Unknown error" After Clicking Provider Button
- Check that environment variables are set correctly
- Verify provider API URLs haven't changed
- Check server logs for detailed error message
- Ensure Node.js version supports global `fetch` (18+)

## API Reference

### OAuth Exchange Functions (server/_core/oauth.ts)

#### `exchangeGoogleCode(code: string)`
- **Purpose**: Exchange Google authorization code for user info
- **Params**: `code` - Authorization code from Google
- **Returns**: User object with `{ openId, email, name, picture, platform: 'google' }`

#### `exchangeGitHubCode(code: string)`
- **Purpose**: Exchange GitHub authorization code for user info
- **Params**: `code` - Authorization code from GitHub
- **Returns**: User object with `{ openId, email, name, picture, platform: 'github' }`

#### `exchangeMicrosoftCode(code: string)`
- **Purpose**: Exchange Microsoft authorization code for user info
- **Params**: `code` - Authorization code from Microsoft
- **Returns**: User object with `{ openId, email, name, picture, platform: 'microsoft' }`

## Files Modified

1. **`client/src/pages/OTPLogin.tsx`**
   - Added OAuth provider button UI for login form
   - Added OAuth provider button UI for signup form
   - Implemented click handlers that redirect to provider authorization URLs

2. **`server/_core/oauth.ts`**
   - Added helper functions for code exchange with each provider
   - Added three new Express routes for OAuth callbacks
   - Integrated with existing user creation/update logic
   - Sends login notification emails for OAuth logins

3. **`server/_core/env.ts`**
   - Added OAuth credential environment variables
   - Created `getEnv()` function for accessing OAuth secrets

4. **`.env`**
   - Added placeholder environment variables for all three providers

## Future Enhancements

1. **Apple OAuth**: Add Sign in with Apple support
2. **LinkedIn OAuth**: Add professional network login
3. **Discord OAuth**: Add gaming/community login
4. **Account Linking**: Allow users to link multiple providers to same account
5. **OAuth Refresh Tokens**: Implement token refresh for long-running sessions
6. **Profile Pictures**: Store and display provider profile pictures

## Support

For issues or questions about OAuth setup, check:
- Provider's OAuth documentation
- Server logs in terminal running `npm run dev`
- Browser console for client-side errors
- Network tab in DevTools for OAuth redirect requests
