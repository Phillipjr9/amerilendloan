# OAuth Authentication Setup Guide

This guide provides comprehensive instructions for setting up Google, GitHub, and Microsoft OAuth authentication for the AmeriLend application.

---

## Table of Contents

1. [Overview](#overview)
2. [Google OAuth Setup](#google-oauth-setup)
3. [GitHub OAuth Setup](#github-oauth-setup)
4. [Microsoft OAuth Setup](#microsoft-oauth-setup)
5. [Environment Variables](#environment-variables)
6. [Testing OAuth Flows](#testing-oauth-flows)
7. [Deployment Checklist](#deployment-checklist)
8. [Troubleshooting](#troubleshooting)
9. [Security Best Practices](#security-best-practices)

---

## Overview

The AmeriLend application supports OAuth 2.0 authentication through three providers:

| Provider | Best For | Requirements |
|----------|----------|--------------|
| **Google** | Universal login, email verification | Google Cloud Project, OAuth 2.0 Client ID |
| **GitHub** | Developer accounts, tech-savvy users | GitHub App Registration |
| **Microsoft** | Enterprise users, Office 365 integration | Azure AD Application Registration |

### Security Features Implemented

✅ OAuth 2.0 with PKCE support  
✅ State parameter validation  
✅ Nonce parameter generation  
✅ Encrypted session tokens  
✅ 24-hour session expiration  
✅ Automatic token refresh  
✅ Error handling and user feedback  

---

## Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **NEW PROJECT**
4. Enter project name: `AmeriLend`
5. Click **CREATE**

### Step 2: Enable Google+ API

1. In the Cloud Console, go to **APIs & Services** → **Library**
2. Search for **Google+ API**
3. Click on it and press **ENABLE**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - User type: **External**
   - Click **CREATE**
   - Fill in:
     - App name: `AmeriLend`
     - User support email: `support@amerilendloan.com`
     - Developer contact: your email
   - Add scopes: `openid`, `email`, `profile`
   - Click **SAVE AND CONTINUE**

4. Back to creating OAuth credentials:
   - Application type: **Web application**
   - Name: `AmeriLend Web`
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     http://localhost:5173
     https://www.amerilendloan.com
     https://amerilendloan.com
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/auth/google/callback
     http://localhost:5173/auth/google/callback
     https://www.amerilendloan.com/auth/google/callback
     https://amerilendloan.com/auth/google/callback
     ```

5. Click **CREATE**
6. Copy the **Client ID** (you'll need this)

### Step 4: Set Environment Variables

Add to your `.env.local`:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

---

## GitHub OAuth Setup

### Step 1: Register a New OAuth App

1. Go to [GitHub Settings → Developer settings](https://github.com/settings/apps)
2. Click **New GitHub App** (or OAuth App)
3. Fill in the form:
   - **Application name**: `AmeriLend`
   - **Homepage URL**: `https://www.amerilendloan.com`
   - **Authorization callback URL**:
     ```
     http://localhost:3000/auth/github/callback
     http://localhost:5173/auth/github/callback
     https://www.amerilendloan.com/auth/github/callback
     ```

### Step 2: Generate Client ID and Secret

1. After registration, you'll see:
   - **Client ID**
   - **Client secrets** section

2. Click **Generate a new client secret**
3. Copy both values

### Step 3: Set Environment Variables

Add to your `.env.local`:

```env
VITE_GITHUB_CLIENT_ID=your-client-id-here
```

> **Note**: For security, the client secret should only be used on the backend (server-side) if needed.

---

## Microsoft OAuth Setup

### Step 1: Register Application in Azure AD

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in:
   - **Name**: `AmeriLend`
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**:
     - Platform: **Web**
     - URL: `http://localhost:5173/auth/microsoft/callback`
     - (Add production URLs later)

5. Click **Register**

### Step 2: Configure Application

1. Go to **Certificates & secrets**
   - Click **New client secret**
   - Set expiration and copy the value

2. Go to **API permissions**
   - Click **Add a permission**
   - Select **Microsoft Graph**
   - Select **Delegated permissions**
   - Add: `openid`, `profile`, `email`
   - Click **Add permissions**

### Step 3: Get Client ID and Configure Redirect URIs

1. Go to **Overview** - copy the **Application (client) ID**

2. Go to **Authentication** → **Add a platform**
   - Platform: **Web**
   - Redirect URIs:
     ```
     http://localhost:3000/auth/microsoft/callback
     http://localhost:5173/auth/microsoft/callback
     https://www.amerilendloan.com/auth/microsoft/callback
     https://amerilendloan.com/auth/microsoft/callback
     ```
   - Front-channel logout URL: `https://www.amerilendloan.com`
   - Click **Configure**

### Step 4: Set Environment Variables

Add to your `.env.local`:

```env
VITE_MICROSOFT_CLIENT_ID=your-application-client-id
```

---

## Environment Variables

### Development (.env.local)

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your_github_client_id

# Microsoft OAuth
VITE_MICROSOFT_CLIENT_ID=your-microsoft-client-id

# App Configuration
VITE_APP_ID=amerilend
VITE_APP_TITLE=AmeriLend
VITE_APP_LOGO=https://www.amerilendloan.com/images/logo-new.jpg
VITE_OAUTH_PORTAL_URL=https://www.amerilendloan.com
```

### Production Environment Variables

Set these in your production deployment (Vercel, Netlify, AWS, etc.):

```
VITE_GOOGLE_CLIENT_ID=production-client-id
VITE_GITHUB_CLIENT_ID=production-github-id
VITE_MICROSOFT_CLIENT_ID=production-microsoft-id
```

---

## Testing OAuth Flows

### Test Locally

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Navigate to login page:**
   ```
   http://localhost:5173/
   ```

3. **Test each OAuth provider:**
   - Click the Google/GitHub/Microsoft button
   - You should be redirected to the OAuth provider
   - Log in or authorize access
   - Should redirect back with code parameter

4. **Check console for errors:**
   - Open DevTools (F12)
   - Check Network tab for OAuth requests
   - Check Console for error messages

### Common Test Scenarios

#### Scenario 1: New User via Google
1. Click "Google" button
2. Log in with a new Google account
3. Authorize permissions
4. Should create account and log in

#### Scenario 2: Existing User Login
1. Click "Google" button
2. Select previously authorized account
3. Should log in immediately
4. Redirect to dashboard

#### Scenario 3: Error Handling
1. Clear environment variables
2. Click "Google" button
3. Should show error message: "Google authentication not configured"

#### Scenario 4: Network Error
1. Disconnect internet
2. Click OAuth button
3. Should show error after timeout
4. Connection restores and user can retry

---

## Deployment Checklist

### Before Production Deployment

- [ ] All OAuth providers configured with production URLs
- [ ] Environment variables set in production deployment
- [ ] OAuth redirect URIs match production domain exactly
- [ ] HTTPS enabled for all OAuth URLs
- [ ] Session expiration set to 24 hours
- [ ] Rate limiting enabled on OAuth endpoints
- [ ] Error logging configured
- [ ] User data privacy policy updated
- [ ] OAuth token refresh logic tested
- [ ] Multi-region failover tested (if applicable)

### Production Deployment Steps

1. **Verify OAuth Credentials:**
   ```bash
   # Check that all env vars are set
   echo $VITE_GOOGLE_CLIENT_ID
   echo $VITE_GITHUB_CLIENT_ID
   echo $VITE_MICROSOFT_CLIENT_ID
   ```

2. **Deploy to staging first:**
   - Deploy to staging environment
   - Test all OAuth flows
   - Verify session handling

3. **Deploy to production:**
   - Set production environment variables
   - Deploy code
   - Monitor OAuth errors in logs
   - Test each provider immediately after deploy

### Post-Deployment Monitoring

Monitor these metrics:

```
OAuth Success Rate = (Successful logins / Total OAuth attempts) × 100
Target: > 95%

Average OAuth Duration = Time from OAuth redirect to dashboard load
Target: < 3 seconds

Error Rate = (Failed OAuth attempts / Total attempts) × 100
Target: < 5%
```

---

## Troubleshooting

### Google OAuth Not Working

**Issue:** "redirect_uri_mismatch"

**Solution:**
1. Check that redirect URI in code matches exactly what's registered in Google Cloud Console
2. Include/exclude www consistently
3. Ensure http/https matches
4. Check for trailing slashes

**Issue:** Blank page after OAuth

**Solution:**
1. Check browser console for errors
2. Verify Client ID is correct
3. Check network tab for failed requests
4. Ensure JavaScript origin is registered

### GitHub OAuth Not Working

**Issue:** "OAuth app not found"

**Solution:**
1. Verify Client ID is correct
2. Check that app is registered in correct GitHub account
3. Verify redirect URI matches exactly

**Issue:** "Redirect URI does not match"

**Solution:**
1. Ensure redirect URI in GitHub settings matches code exactly
2. Check for http vs https
3. Verify www prefix consistency

### Microsoft OAuth Not Working

**Issue:** "AADSTS700016: Application not found"

**Solution:**
1. Verify Client ID is from Azure AD app, not Office App ID
2. Check Application (client) ID format
3. Ensure app is registered in correct Azure tenant

**Issue:** "Admin consent required"

**Solution:**
1. Add required permissions in Azure Portal
2. Admin must grant consent
3. Or register app as multi-tenant

### General Debugging Steps

1. **Enable verbose logging:**
   ```typescript
   // In SocialAuthButtons.tsx, add before redirectToOAuth
   console.log("[OAuth Debug]", { 
     provider, 
     clientId, 
     redirectUri, 
     state 
   });
   ```

2. **Check stored state parameter:**
   ```javascript
   // In browser console
   console.log("Stored state:", sessionStorage.getItem("oauth_state"));
   ```

3. **Verify callback handler:**
   - Ensure `/auth/[provider]/callback` route exists
   - Check server logs for callback errors
   - Verify JWT token is being created

4. **Check CORS headers:**
   - Ensure OAuth domains can make cross-origin requests
   - Verify CORS headers in server responses

---

## Security Best Practices

### Client-Side Security

✅ **Never expose client secrets in frontend code**
- Only use Client IDs (public) in browser
- Client secrets should only be in backend

✅ **Validate state parameter on return**
```typescript
// In callback handler
const state = new URL(window.location.href).searchParams.get("state");
if (state !== sessionStorage.getItem("oauth_state")) {
  throw new Error("Invalid state parameter - possible CSRF attack");
}
```

✅ **Use PKCE when available**
```typescript
// Generate code_verifier and code_challenge
const codeVerifier = generateRandomString(128);
const codeChallenge = base64URLEncode(sha256(codeVerifier));
```

### Server-Side Security

✅ **Validate authorization codes**
- Don't trust the code parameter directly
- Exchange code for access token using client secret
- Verify token signature

✅ **Store tokens securely**
- Use HTTP-only cookies for session tokens
- Encrypt sensitive OAuth data
- Never log tokens

✅ **Implement rate limiting**
```
- Max 5 OAuth attempts per IP per minute
- Max 10 failed attempts before temporary lockout
- Monitor for brute force patterns
```

✅ **Configure secure redirect**
```javascript
// Whitelist only known redirect URIs
const ALLOWED_REDIRECTS = [
  "https://www.amerilendloan.com/dashboard",
  "https://www.amerilendloan.com/account"
];
```

### Data Privacy

✅ **User consent**
- Display what data will be requested
- Get explicit user consent before OAuth
- Show privacy policy link

✅ **Data minimization**
- Request only necessary scopes
- Don't store more user data than needed
- Implement data retention policies

✅ **GDPR Compliance**
- Allow users to disconnect OAuth
- Provide data export functionality
- Implement right to be forgotten

---

## Support & Resources

### Documentation Links

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Microsoft OAuth 2.0 Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

### Helpful Tools

- [OAuth Debugger](https://oauthdebugger.com/)
- [JWT Decoder](https://jwt.io/)
- [State Parameter Generator](https://www.random.org/strings/)

### Getting Help

For issues with:
- **Google OAuth**: [Google Cloud Support](https://cloud.google.com/support)
- **GitHub OAuth**: [GitHub Community Discussions](https://github.com/orgs/community/discussions)
- **Microsoft OAuth**: [Azure Support](https://azure.microsoft.com/en-us/support/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-19 | Initial OAuth setup guide with Google, GitHub, and Microsoft |

