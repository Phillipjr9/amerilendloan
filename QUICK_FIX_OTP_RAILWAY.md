# Quick Fix: Enable OTP Login on Railway

Your app is deployed! Now we just need to:
1. Get your Railway PostgreSQL URL
2. Run database migrations on Railway
3. You're done!

## Step 1: Get Your Railway Database URL

In Railway Dashboard:
1. Go to your project
2. Click the **PostgreSQL** service
3. Click **"Connect"** button
4. Copy the **DATABASE_URL** (looks like `postgresql://user:pass@host:port/db`)

## Step 2: Run Migrations on Railway Database

Replace `YOUR_DATABASE_URL` with the URL from Step 1:

```powershell
cd C:\Users\USER\Downloads\Amerilendloan.com
$env:DATABASE_URL = "postgresql://YOUR_DATABASE_URL_HERE"
npm run db:push
```

Example:
```powershell
$env:DATABASE_URL = "postgresql://postgres:abc123@containers-us-west-xx.railway.app:5432/railway"
npm run db:push
```

## Step 3: Verify Rails Environment Variables

In Railway Dashboard → Your Project → Variables, make sure you have:

```
SENDGRID_API_KEY = [your-sendgrid-key]
DATABASE_URL = [auto-filled]
JWT_SECRET = [any-random-string]
NODE_ENV = production
VITE_APP_ID = amerilend
VITE_APP_TITLE = AmeriLend Loans
VITE_APP_LOGO = https://www.amerilendloan.com/images/logo-new.jpg
```

## Step 4: Test Login

1. Go to your Railway URL (find it in Railway dashboard → Deployments)
2. Click "Sign In"
3. Enter any email address
4. Check your email inbox for 6-digit code
5. Enter the code on the website
6. ✅ Logged in!

---

## If it Still Doesn't Work

### Check 1: Database connection
```powershell
# Test connection
$env:DATABASE_URL = "postgresql://..."
npm run db:push
```

If this fails, you'll see a database connection error. Copy that and I can help debug.

### Check 2: SendGrid API key
Make sure `SENDGRID_API_KEY` is set in Railway Variables and is correct.

### Check 3: Application logs
In Railway:
1. Click your Node service
2. Click **"Logs"** tab
3. Look for errors mentioning:
   - "Database error"
   - "SendGrid API key"
   - "OTP"

---

## I'm Ready to Help!

Please provide:
1. Your Railway PostgreSQL **DATABASE_URL** (the full connection string)
2. I'll run the migrations for you directly

Just reply with the DATABASE_URL or tell me you need help getting it from Railway.
