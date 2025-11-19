# OAuth Secrets Setup - CRITICAL

## The Problem
OAuth authentication fails because **Client Secrets** are missing from Vercel environment variables.

The app needs:
- `GOOGLE_CLIENT_SECRET` (backend only)
- `GITHUB_CLIENT_SECRET` (backend only)

## How to Get the Secrets

### Google Client Secret
1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to: **Credentials** → **OAuth 2.0 Client ID**
4. Click on your web client
5. Copy: **Client Secret**
6. Save it (you got this with your Client ID)

### GitHub Client Secret  
1. Go to: https://github.com/settings/apps
2. Find your OAuth App
3. Go to: **General** section
4. Find: **Client Secret**
5. Click: **Generate a new client secret** (if not visible)
6. Copy the secret
7. Save it

## Add to Vercel

Go to: https://vercel.com → amerilendloan2 → Settings → Environment Variables

Add these **3 variables** for **Production**:

### Variable 1: Google Client ID (Frontend)
```
Name: VITE_GOOGLE_CLIENT_ID
Value: 914402975294-c445oav4stl7hvk9493um07ske47epti.apps.googleusercontent.com
Environment: Production
```

### Variable 2: Google Client Secret (Backend)
```
Name: GOOGLE_CLIENT_SECRET
Value: [YOUR_GOOGLE_CLIENT_SECRET_HERE]
Environment: Production
```

### Variable 3: GitHub Client ID (Frontend)
```
Name: VITE_GITHUB_CLIENT_ID
Value: Ov23liXHk1iYHB1nhIhB
Environment: Production
```

### Variable 4: GitHub Client Secret (Backend)
```
Name: GITHUB_CLIENT_SECRET
Value: [YOUR_GITHUB_CLIENT_SECRET_HERE]
Environment: Production
```

## Save & Redeploy

1. After adding all variables, click **Save**
2. Go to **Deployments**
3. Click the **...** on the latest deployment
4. Select **Redeploy**
5. Wait for deployment to complete (green checkmark)

## Test

1. Go to: https://www.amerilendloan.com
2. Click **Google** or **GitHub** login button
3. Should redirect to provider authorization page
4. After authorization, should login successfully

---

## Troubleshooting

**If still not working:**
1. Check browser console (F12 → Console) for errors
2. Look for "Client Secret" or "authentication" errors
3. Verify Client Secret values are correct (no extra spaces)
4. Verify deployment completed successfully

**Check Deployment:**
- Go to Vercel Deployments
- Click latest deployment
- Look for red errors or warnings
- Scroll down to see build logs

---

## Security Note
- Client IDs are public (safe to expose) ✅
- Client Secrets are private (never commit to git) ✅
- Always store secrets in Vercel, not in code ✅
