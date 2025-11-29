# 🚀 Quick Deploy Guide - Vercel Production Deployment

## Prerequisites
- ✅ GitHub repository: `Dianasmith6525/amerilendloan2`
- ✅ Vercel account (free tier works)
- ✅ All environment variables ready

---

## Step 1: Connect to Vercel (5 minutes)

### Option A: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/
2. Click "Add New Project"
3. Import from GitHub: `Dianasmith6525/amerilendloan2`
4. Click "Import"

### Option B: Via CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## Step 2: Configure Build Settings

**Framework Preset**: Other (custom Node.js)

**Build & Development Settings**:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

**Node.js Version**: 20.x

---

## Step 3: Add Environment Variables

Go to: Project Settings > Environment Variables

Copy-paste all from your `.env` file:

### Required Variables:
```env
DATABASE_URL=your_postgres_connection_string
VITE_APP_ID=your_app_id
JWT_SECRET=your_jwt_secret_min_32_chars
OAUTH_SERVER_URL=your_oauth_server
OWNER_OPEN_ID=admin_user_id
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@amerilendloan.com
AUTHORIZENET_API_LOGIN_ID=your_login_id
AUTHORIZENET_TRANSACTION_KEY=your_transaction_key
AUTHORIZENET_ENVIRONMENT=sandbox
AUTHORIZENET_CLIENT_KEY=your_client_key
ENCRYPTION_KEY=your_32_byte_encryption_key
VITE_APP_TITLE=Amerilend
VITE_APP_LOGO=/logo.png
VITE_OAUTH_PORTAL_URL=your_portal_url
BUILT_IN_FORGE_API_URL=your_forge_api
BUILT_IN_FORGE_API_KEY=your_forge_key
```

### Optional Variables:
```env
COINBASE_COMMERCE_API_KEY=your_coinbase_key
COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret
CRYPTO_PAYMENT_ENVIRONMENT=testnet
SENTRY_DSN=your_sentry_dsn
```

**Important**: Set environment scope to "Production", "Preview", and "Development"

---

## Step 4: Deploy

### First Deployment
1. Click "Deploy" button in Vercel dashboard
2. Wait 2-3 minutes for build
3. Vercel will show deployment URL: `https://your-app.vercel.app`

### Automatic Deployments
- Every push to `main` branch triggers production deployment
- Pull requests get preview deployments

---

## Step 5: Post-Deployment Verification (10 minutes)

### Critical Tests:
```bash
# 1. Site loads
curl https://your-app.vercel.app/

# 2. Health check (if implemented)
curl https://your-app.vercel.app/api/health

# 3. Database connection
# Login to admin dashboard and check applications list
```

### Manual Testing:
- [ ] Homepage loads
- [ ] User registration works
- [ ] Login successful
- [ ] Submit loan application
- [ ] Upload document
- [ ] Admin dashboard accessible
- [ ] Support ticket creation
- [ ] Email delivery (check SendGrid dashboard)

---

## Step 6: Custom Domain (Optional)

### Add Custom Domain:
1. Go to Project Settings > Domains
2. Add domain: `amerilendloan.com`
3. Add domain: `www.amerilendloan.com`
4. Update DNS records at your registrar:

**For root domain (amerilendloan.com)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

5. Wait for DNS propagation (5-60 minutes)
6. SSL certificate auto-provisions

---

## Step 7: Enable Production Features

### Switch Authorize.net to Production:
1. Get production API credentials from Authorize.net
2. Update Vercel environment variables:
   ```
   AUTHORIZENET_ENVIRONMENT=production
   AUTHORIZENET_API_LOGIN_ID=production_login_id
   AUTHORIZENET_TRANSACTION_KEY=production_key
   AUTHORIZENET_CLIENT_KEY=production_client_key
   ```
3. Redeploy (push to main or manual redeploy in Vercel)

### Switch Crypto to Mainnet:
1. Update environment variable:
   ```
   CRYPTO_PAYMENT_ENVIRONMENT=mainnet
   ```
2. Redeploy

---

## Monitoring & Maintenance

### Check Logs:
- **Vercel Dashboard**: Real-time function logs
- **SendGrid Dashboard**: Email delivery status
- **Authorize.net Dashboard**: Transaction history
- **Database Dashboard**: Connection health

### Auto-Pay Scheduler Verification:
Check Vercel function logs for:
```
[Auto-Pay Scheduler] ✅ Scheduler started (runs daily at 2:00 AM)
```

### Email Scheduler Verification:
```
[Payment Scheduler] Starting payment notification scheduler
```

---

## Troubleshooting

### Build Fails:
```bash
# Run locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check for missing dependencies
npm install
```

### Environment Variable Issues:
- Ensure all variables are in Vercel dashboard
- Check for typos (no spaces around `=`)
- Redeploy after adding variables

### Database Connection Fails:
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- Enable SSL if required: `?sslmode=require`

### 500 Errors:
- Check Vercel function logs
- Verify environment variables loaded
- Check database migrations applied

---

## Rollback Plan

### If deployment has issues:
1. Go to Vercel Dashboard > Deployments
2. Find previous working deployment
3. Click "..." > "Promote to Production"
4. Instant rollback (no downtime)

---

## Performance Tips

### Enable Vercel Speed Insights:
1. Go to Project Settings > Speed Insights
2. Enable tracking
3. Monitor Core Web Vitals

### Enable Vercel Analytics:
1. Go to Project Settings > Analytics
2. Enable analytics
3. Track pageviews and user behavior

### Optimize Images:
```bash
# Install Vercel image optimization
npm install @vercel/og
```

---

## Production Checklist

Before announcing launch:
- [ ] Site loads on production URL
- [ ] SSL certificate valid (https)
- [ ] Custom domain configured (if applicable)
- [ ] Admin can login
- [ ] Test user registration works
- [ ] Test loan application submission
- [ ] Test payment processing (test card)
- [ ] Email delivery verified
- [ ] Auto-pay scheduler running
- [ ] SendGrid has available quota (94/100)
- [ ] Authorize.net in correct mode (sandbox/production)
- [ ] Database backup configured
- [ ] Error tracking enabled (Sentry - optional)

---

## Support

### Vercel Issues:
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support

### Application Issues:
- GitHub Repo: https://github.com/Dianasmith6525/amerilendloan2
- Check PRODUCTION_LAUNCH_CHECKLIST.md
- Review server logs in Vercel dashboard

---

## Quick Commands Reference

```bash
# Deploy to production
git push origin main

# Force redeploy (if env variables changed)
# Go to Vercel Dashboard > Deployments > Redeploy

# Check build locally
npm run build

# Test production server locally
npm run start

# View logs
vercel logs --production
```

---

**You're ready to deploy!** 🚀

Next step: Click "Deploy" in Vercel Dashboard or run `vercel --prod`
