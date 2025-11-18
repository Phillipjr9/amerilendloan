# AmeriLend Vercel Deployment Checklist

## ✅ Pre-Deployment (DONE)

- [x] Code committed to GitHub (`git commit` & `git push`)
- [x] `vercel.json` configured with proper settings
- [x] `npm run build` tested locally and working
- [x] All features tested locally (upload, email, auth)

## 📋 Deployment Steps (DO NOW)

### Step 1: Create Vercel Project (5 minutes)
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click "Add New" → "Project"
- [ ] Select "Import Git Repository"
- [ ] Find and select `amerilendloan2`
- [ ] Click "Import"
- [ ] **DO NOT DEPLOY YET** - Wait for next step

### Step 2: Set Up Database (10 minutes)

**Choose ONE:**

**Option A: Supabase (Recommended)**
- [ ] Go to https://supabase.com
- [ ] Create new project
- [ ] Get PostgreSQL connection string
- [ ] Save for Step 3

**Option B: Railway**
- [ ] Go to https://railway.app
- [ ] New Project → Provision PostgreSQL
- [ ] Get connection string
- [ ] Save for Step 3

**Option C: Use Existing Database**
- [ ] Get your current PostgreSQL connection string
- [ ] Make sure it's accessible from internet
- [ ] Save for Step 3

### Step 3: Configure Environment Variables (10 minutes)

In Vercel Dashboard → Settings → Environment Variables:

**Add These Variables:**

```
DATABASE_URL = [your-postgres-connection-string]
JWT_SECRET = [generate-random-secret-key-32-chars-min]
OAUTH_SERVER_URL = https://www.amerilendloan.com
VITE_OAUTH_PORTAL_URL = https://www.amerilendloan.com/login
OWNER_OPEN_ID = [your-email-or-id]
VITE_APP_ID = amerilend
NODE_ENV = production
SENDGRID_API_KEY = [your-sendgrid-key]
VITE_APP_TITLE = AmeriLend Loans
VITE_APP_LOGO = https://www.amerilendloan.com/images/logo-new.jpg
```

**How to Get SendGrid Key:**
- [ ] Go to https://sendgrid.com
- [ ] Create account or sign in
- [ ] Settings → API Keys → Create API Key
- [ ] Copy and paste into Vercel

### Step 4: Deploy (2 minutes)

- [ ] In Vercel, go back to **Deployments** tab
- [ ] Click the **"Deploy"** button
- [ ] Wait for green checkmark (3-5 minutes)
- [ ] Copy your deployment URL (e.g., `https://amerilendloan.vercel.app`)

### Step 5: Initialize Database (5 minutes)

After deployment succeeds:

- [ ] From your local machine, run:
  ```bash
  DATABASE_URL="[your-prod-database-url]" npm run db:push
  ```
- [ ] This creates all database tables
- [ ] Wait for completion

### Step 6: Test Everything (15 minutes)

- [ ] Go to https://[your-deployment-url]/login
- [ ] Test signup/login flow
- [ ] Upload a document
- [ ] Check admin email for notification
- [ ] Verify images show in email
- [ ] Check admin dashboard

### Step 7: Custom Domain (Optional, 10 minutes)

- [ ] In Vercel: Settings → Domains
- [ ] Add `www.amerilendloan.com`
- [ ] Go to your domain registrar
- [ ] Add CNAME record:
  - Name: `www`
  - Value: `cname.vercel.sh`
- [ ] Wait 24 hours for DNS to propagate
- [ ] SSL certificate auto-provisions

## 📊 After Deployment

**Monitor these:**
- [ ] Vercel Deployments tab for errors
- [ ] Error logs in Vercel dashboard
- [ ] User uploads working
- [ ] Emails sending to admin
- [ ] Custom domain working (if configured)

## 🆘 Need Help?

**If something fails:**

1. **Build errors**: Check Vercel logs → Copy error → Search online
2. **Database errors**: Verify DATABASE_URL is correct
3. **Email not sending**: Check SendGrid API key
4. **Images not showing**: Ensure HTTPS URLs in emails
5. **502 Bad Gateway**: Function timeout - check logs

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed troubleshooting.

## 🔗 Important URLs

- **Repository**: https://github.com/Dianasmith6525/amerilendloan2
- **Vercel Dashboard**: https://vercel.com/dashboard
- **SendGrid**: https://sendgrid.com
- **Supabase**: https://supabase.com
- **Deployment Docs**: See VERCEL_DEPLOYMENT_GUIDE.md

---

**Current Status**: Ready to deploy! 🚀

Everything is committed and pushed. Just follow the steps above to deploy to Vercel.
