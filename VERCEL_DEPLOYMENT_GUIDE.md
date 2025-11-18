# AmeriLend Vercel Deployment Guide

## Step 1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account (or create one)
3. Click **"Add New..."** → **"Project"**
4. Select **"Import Git Repository"**
5. Search for `amerilendloan2` and select it
6. Click **"Import"**

## Step 2: Configure Environment Variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add ALL of these:

### Critical Variables (Required)

```
DATABASE_URL = postgresql://[your-database-url]
JWT_SECRET = [generate-a-strong-secret-key]
OAUTH_SERVER_URL = https://www.amerilendloan.com
VITE_OAUTH_PORTAL_URL = https://www.amerilendloan.com/login
OWNER_OPEN_ID = [your-owner-id]
VITE_APP_ID = amerilend
NODE_ENV = production
```

### Email Configuration (SendGrid)

```
SENDGRID_API_KEY = [your-sendgrid-api-key]
```

**Get SendGrid API Key:**
1. Go to [sendgrid.com](https://sendgrid.com) → Sign up/Login
2. Settings → API Keys → Create API Key
3. Copy the key and paste into Vercel

### Optional: File Upload (Forge API)

```
BUILT_IN_FORGE_API_URL = [your-forge-api-url]
BUILT_IN_FORGE_API_KEY = [your-forge-api-key]
```

*Note: If not provided, file uploads will use Base64 data URLs (works but not ideal)*

### Optional: AI Features

```
OPENAI_API_KEY = [your-openai-api-key]
```

### Optional: SMS (Twilio)

```
TWILIO_ACCOUNT_SID = [your-twilio-sid]
TWILIO_AUTH_TOKEN = [your-twilio-token]
TWILIO_PHONE_NUMBER = [your-twilio-phone]
```

### Frontend Configuration

```
VITE_APP_TITLE = AmeriLend Loans
VITE_APP_LOGO = https://www.amerilendloan.com/images/logo-new.jpg
VITE_SUPABASE_URL = [optional-supabase-url]
VITE_SUPABASE_ANON_KEY = [optional-supabase-key]
```

## Step 3: Create Production Database

Your app uses PostgreSQL. Choose one:

### Option A: Supabase (Recommended - Free tier available)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to **Settings → Database** → Copy connection string
4. Use this as `DATABASE_URL` in Vercel

### Option B: Railway (Simple)

1. Go to [railway.app](https://railway.app)
2. New Project → Provision PostgreSQL
3. Copy connection string → Set as `DATABASE_URL`

### Option C: PlanetScale (MySQL - also works)

1. Go to [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string → Set as `DATABASE_URL`

## Step 4: Deploy

1. In Vercel dashboard, click **"Deploy"**
2. Wait for build to complete (3-5 minutes)
3. Check deployment logs for errors
4. Your app will be available at: `https://[project-name].vercel.app`

## Step 5: Post-Deployment Setup

### Run Database Migrations

Since your database is fresh, you need to initialize it:

1. SSH into your production environment OR run locally with production DB:
```bash
DATABASE_URL="your-prod-database-url" npm run db:push
```

2. This creates all tables from `drizzle/schema.ts`

### Test Email Delivery

1. Login to your app at `https://[your-domain]/login`
2. Upload a document
3. Check admin email inbox for notification
4. Verify images display correctly

### Configure Custom Domain (Optional)

1. In Vercel: **Settings → Domains**
2. Add `www.amerilendloan.com`
3. Add DNS CNAME record pointing to Vercel
4. SSL certificate auto-provisions

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check if database IP is whitelisted (if using cloud DB)
- Test connection locally first

### Email Not Sending
- Verify SendGrid API key is set
- Check SendGrid dashboard → Email Activity for failures
- Ensure admin email in `server/_core/companyConfig.ts` is correct

### Images Not Showing in Emails
- Ensure image URLs are HTTPS (required by Vercel)
- Add CORS headers if using external CDN
- Test with inline Base64 for logo (see companyConfig.ts)

### 502 Bad Gateway
- Server timeout - check function logs
- Database connection pooling issue
- Increase memory allocation in vercel.json

## Monitoring

After deployment, monitor:

1. **Vercel Logs**: Dashboard → Deployments → Logs
2. **Error Tracking**: Check "Errors" tab
3. **Performance**: Analytics tab shows usage

## Rollback

If something breaks:

```bash
git revert [commit-hash]
git push origin main
# Vercel auto-redeploys
```

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- SendGrid Docs: [sendgrid.com/docs](https://sendgrid.com/docs)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
