# OAuth Configuration Fix - Add to Vercel

## Current Issue
Your OAuth Client IDs are in `.env.local` (local development) but NOT in **Vercel production environment variables**.

## Solution: Add to Vercel Dashboard

### Step 1: Go to Vercel Project Settings
1. Open https://vercel.com
2. Select your project: `amerilendloan2`
3. Go to **Settings** → **Environment Variables**

### Step 2: Add These Environment Variables

Add the following variables for **Production** environment:

```
Variable Name: VITE_GOOGLE_CLIENT_ID
Value: 914402975294-c445oav4stl7hvk9493um07ske47epti.apps.googleusercontent.com
Environment: Production

Variable Name: VITE_GITHUB_CLIENT_ID
Value: Ov23liXHk1iYHB1nhIhB
Environment: Production
```

### Step 3: Verify Google & GitHub OAuth Configuration

#### For Google:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Find your project that created `914402975294-c445oav4stl7hvk9493um07ske47epti`
3. Go to **Credentials** → **OAuth 2.0 Client ID**
4. Add **Authorized Redirect URI**:
   ```
   https://www.amerilendloan.com/auth/google/callback
   https://amerilendloan2.vercel.app/auth/google/callback
   ```
5. Save

#### For GitHub:
1. Go to https://github.com/settings/apps
2. Find your OAuth App (that created `Ov23liXHk1iYHB1nhIhB`)
3. Update **Authorization callback URL**:
   ```
   https://www.amerilendloan.com/auth/github/callback
   https://amerilendloan2.vercel.app/auth/github/callback
   ```
4. Save

### Step 4: Redeploy

After adding environment variables to Vercel:
1. Go to **Deployments** in Vercel
2. Click the three dots on the latest deployment
3. Select **Redeploy**
4. Wait for deployment to complete

### Step 5: Test

After redeployment:
1. Go to https://www.amerilendloan.com (or your Vercel URL)
2. Click the Google or GitHub login button
3. You should be redirected to the OAuth provider
4. After authorization, you should be logged in

---

## What's Happening

**Development (.env.local)** ✅
- Works on `localhost:5173`
- Uses `VITE_GOOGLE_CLIENT_ID` and `VITE_GITHUB_CLIENT_ID`

**Production (Vercel)** ⚠️ NEEDS FIX
- Needs same variables in Vercel dashboard
- Uses `https://www.amerilendloan.com` as redirect URI
- Must match OAuth provider settings

---

## Checklist

- [ ] Add `VITE_GOOGLE_CLIENT_ID` to Vercel Production env vars
- [ ] Add `VITE_GITHUB_CLIENT_ID` to Vercel Production env vars
- [ ] Add redirect URI to Google OAuth settings
- [ ] Add redirect URI to GitHub OAuth settings
- [ ] Redeploy on Vercel
- [ ] Test Google login on production
- [ ] Test GitHub login on production

---

## If Still Not Working

Check:
1. **Vercel deployment status** - Did the redeploy succeed?
2. **Browser console** - Any error messages? (Press F12 → Console)
3. **Google redirect URI** - Must exactly match your production domain
4. **GitHub redirect URI** - Must exactly match your production domain
5. **Network tab** - Check if OAuth redirect is happening

---

## Support

If you need help:
- Email: admin@amerilendloan.com
- Vercel Docs: https://vercel.com/docs/projects/environment-variables
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- GitHub OAuth: https://docs.github.com/en/developers/apps/building-oauth-apps
