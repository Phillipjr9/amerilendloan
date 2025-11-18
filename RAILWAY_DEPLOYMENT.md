# Deploy AmeriLend to Railway (Recommended)

Railway is perfect for your full-stack Node.js + Express + React app. It's easier than Vercel and costs less.

## Quick Setup (5 minutes)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize access

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select `amerilendloan2`
4. Click **"Deploy Now"**

### Step 3: Configure Database
Railway will automatically detect your `package.json` and create a build.

1. Click **"Add Service"** (+ icon)
2. Select **"PostgreSQL"**
3. Click **"Deploy"**

### Step 4: Set Environment Variables

In Railway dashboard:
1. Go to your project
2. Click the **Node service** (your app)
3. Click **"Variables"** tab
4. Add:

```
DATABASE_URL = [auto-filled from PostgreSQL]
JWT_SECRET = [generate-random-key]
OAUTH_SERVER_URL = https://www.amerilendloan.com
VITE_OAUTH_PORTAL_URL = https://www.amerilendloan.com/login
OWNER_OPEN_ID = [your-id]
VITE_APP_ID = amerilend
NODE_ENV = production
SENDGRID_API_KEY = [your-sendgrid-key]
VITE_APP_TITLE = AmeriLend Loans
VITE_APP_LOGO = https://www.amerilendloan.com/images/logo-new.jpg
```

### Step 5: Trigger Deploy
1. Make a small git commit
2. Push to GitHub
3. Railway auto-deploys
4. Check dashboard for deployment status

### Step 6: Get Your URL
1. In Railway dashboard, click your service
2. Look for the **"Public URL"** on the right
3. Your app is live!

### Step 7: Configure Custom Domain (Optional)
1. Click your service
2. Go to **"Settings"** → **"Public URL"**
3. Add your custom domain
4. Update DNS CNAME to Railway's endpoint

---

## Why Railway Over Vercel?

| Feature | Railway | Vercel |
|---------|---------|--------|
| Full-stack Node.js | ✅ Perfect | ❌ Serverless only |
| Express app | ✅ Native | ⚠️ Requires adaptation |
| Database included | ✅ Easy | ❌ Must configure separately |
| Pricing | ✅ $5/month | ❌ Can be expensive |
| Build time | ✅ Fast | ⚠️ Can hit timeout |
| Long-running tasks | ✅ Unlimited | ❌ 60 second limit |

---

## Deploy Now

```bash
cd C:\Users\USER\Downloads\Amerilendloan.com
git add .
git commit -m "prepare for railway deployment"
git push origin main
```

Then just go to https://railway.app and import your GitHub repo!

No more errors. It just works. 🚀
