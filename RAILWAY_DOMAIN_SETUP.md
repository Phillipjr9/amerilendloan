# Railway Environment Variables Setup

Your domain is set up! Now you need to update Railway variables to use your domain.

## Critical: Update These in Railway Dashboard

Go to Railway → Your Project → Node Service → Variables

### 1. Update Domain-Based URLs

**Change FROM:**
```
VITE_OAUTH_PORTAL_URL = https://www.amerilendloan.com
OAUTH_SERVER_URL = https://www.amerilendloan.com
```

**Change TO (Use your actual domain):**
```
VITE_OAUTH_PORTAL_URL = https://www.amerilendloan.com
OAUTH_SERVER_URL = https://www.amerilendloan.com
```

**Note:** These need to point to your actual OAuth provider's endpoints, not your website. If you don't have an OAuth server, use OTP login instead (which only needs SendGrid).

---

## Complete Variable List for Railway

Replace these in Railway Variables:

```
DATABASE_URL = [auto-filled by Railway PostgreSQL]
JWT_SECRET = your-secret-key-here-change-in-production
NODE_ENV = production
VITE_APP_ID = amerilend
VITE_APP_TITLE = AmeriLend
VITE_APP_LOGO = https://www.amerilendloan.com/images/logo-new.jpg
SENDGRID_API_KEY = [your-sendgrid-api-key]

# OAuth (only if you have a proper OAuth server)
VITE_OAUTH_PORTAL_URL = https://www.amerilendloan.com
OAUTH_SERVER_URL = https://www.amerilendloan.com
OWNER_OPEN_ID = 

# Payment (optional - authorize.net)
AUTHORIZENET_API_LOGIN_ID = 48VRqhq22sMG
AUTHORIZENET_TRANSACTION_KEY = 523uhCmXgW85724u
AUTHORIZENET_ENVIRONMENT = production
AUTHORIZENET_CLIENT_KEY = 54x82h6XqzRztxYthv53kVwVv4HW77FESYV6D2VTmU4HU2y3sbRt4KwV6wY3ZbkF

# Supabase (optional)
VITE_SUPABASE_URL = https://jrgjlizudizscwqvuqbe.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Steps to Update Railway

1. **Go to Railway Dashboard**
2. **Click your Project**
3. **Click the Node.js service**
4. **Click "Variables" tab**
5. **Add/Update each variable above**
6. **Railway auto-redeploys**

---

## Next: Run Database Migrations

After variables are set, run:

```powershell
cd C:\Users\USER\Downloads\Amerilendloan.com

# Get your Railway PostgreSQL URL from Railway → PostgreSQL → Connect
$env:DATABASE_URL = "postgresql://..."

npm run db:push
```

---

## Test Login

1. Go to **https://www.amerilendloan.com**
2. Click **Sign In**
3. Enter your email
4. Check email for 6-digit OTP code
5. Enter code → Logged in! ✅

---

## Issues?

**If login still doesn't work:**

1. Check Railway logs (Logs tab in Node service)
2. Look for errors mentioning:
   - SendGrid
   - Database
   - OTP
3. Verify all variables are set (no empty strings)

---

**Ready to test? Just confirm you've added all the variables to Railway!**
