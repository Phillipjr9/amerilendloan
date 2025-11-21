# Email & SMS Notification System - Configuration Guide

**Status:** ✅ IMPLEMENTED (Phase 4 Complete)  
**Components:** Payment Notifications, User Preferences, Background Scheduler  
**Last Updated:** November 20, 2025

---

## Quick Start

### 1. SendGrid Configuration (Email)

**Get Your API Key:**
1. Go to https://sendgrid.com
2. Create an account or sign in
3. Navigate to **Settings → API Keys**
4. Click **Create API Key**
5. Name it "AmeriLend Production"
6. Select **Full Access**
7. Copy the key

**Set Environment Variable:**
```bash
# .env file or Docker container environment
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@amerilendloan.com
```

**Test Email Sending:**
```bash
curl http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "type": "payment_due_reminder"
  }'
```

### 2. Twilio Configuration (SMS)

**Get Your Credentials:**
1. Go to https://www.twilio.com
2. Create an account or sign in
3. Navigate to **Console Dashboard**
4. Find your **Account SID** and **Auth Token**
5. Go to **Phone Numbers** and provision a number (or use existing)

**Set Environment Variables:**
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14155552671
```

**Test SMS Sending:**
```bash
curl http://localhost:3000/api/test/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+14155555555",
    "message": "Test SMS from AmeriLend"
  }'
```

### 3. Enable Scheduler

**Default Configuration:**
```bash
# Scheduler runs every 1 hour (3600000 ms)
PAYMENT_SCHEDULER_INTERVAL_MS=3600000

# Enable all checks
PAYMENT_SCHEDULER_DUE_REMINDERS=true
PAYMENT_SCHEDULER_OVERDUE_ALERTS=true
PAYMENT_SCHEDULER_DELINQUENCY_ALERTS=true

# Don't disable
DISABLE_PAYMENT_SCHEDULER=false
```

**Verify Scheduler Started:**
```
[Payment Scheduler] Starting payment notification scheduler (interval: 3600000ms)
```

---

## Complete Configuration Reference

### All Email & SMS Environment Variables

```bash
# ========================================
# EMAIL (SendGrid)
# ========================================

# Required: SendGrid API Key
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx

# Required: From address for emails
EMAIL_FROM=noreply@amerilendloan.com

# Optional: Email service name (default: sendgrid)
EMAIL_SERVICE=sendgrid

# ========================================
# SMS (Twilio)
# ========================================

# Required: Twilio Account SID
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx

# Required: Twilio Auth Token
TWILIO_AUTH_TOKEN=your_auth_token_here

# Required: Twilio Phone Number for outbound SMS
TWILIO_PHONE_NUMBER=+14155552671

# ========================================
# SCHEDULER (Background Jobs)
# ========================================

# Check interval in milliseconds (default: 3600000 = 1 hour)
PAYMENT_SCHEDULER_INTERVAL_MS=3600000

# Enable payment due reminders (7 days)
PAYMENT_SCHEDULER_DUE_REMINDERS=true

# Enable overdue alerts (1-29 days)
PAYMENT_SCHEDULER_OVERDUE_ALERTS=true

# Enable delinquency alerts (30+ days)
PAYMENT_SCHEDULER_DELINQUENCY_ALERTS=true

# Disable entire scheduler
DISABLE_PAYMENT_SCHEDULER=false

# ========================================
# DATABASE (for scheduler queries)
# ========================================

# Must be configured for any scheduler functionality
DATABASE_URL=mysql://user:password@host:3306/database
```

---

## Environment Setup by Deployment Type

### Local Development

**.env file:**
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@amerilendloan.com

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+14155552671

PAYMENT_SCHEDULER_INTERVAL_MS=3600000
DISABLE_PAYMENT_SCHEDULER=false

DATABASE_URL=mysql://localhost:3306/amerilend
```

**Run Development Server:**
```bash
# Loads .env automatically
npm run dev

# Or with explicit env
env SENDGRID_API_KEY=xxx npm run dev
```

### Docker Deployment

**Dockerfile environment variables:**
```dockerfile
ENV SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
ENV EMAIL_FROM=noreply@amerilendloan.com
ENV TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
ENV TWILIO_AUTH_TOKEN=your_auth_token
ENV TWILIO_PHONE_NUMBER=+14155552671
ENV PAYMENT_SCHEDULER_INTERVAL_MS=3600000
ENV DATABASE_URL=mysql://db-host:3306/amerilend
```

**Or via docker-compose:**
```yaml
services:
  web:
    image: amerilend:latest
    environment:
      SENDGRID_API_KEY: ${SENDGRID_API_KEY}
      EMAIL_FROM: noreply@amerilendloan.com
      TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
      TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN}
      TWILIO_PHONE_NUMBER: ${TWILIO_PHONE_NUMBER}
      DATABASE_URL: ${DATABASE_URL}
```

### Kubernetes Deployment

**Using Secrets:**
```bash
# Create secret
kubectl create secret generic amerilend-secrets \
  --from-literal=SENDGRID_API_KEY=SG.xxx \
  --from-literal=TWILIO_ACCOUNT_SID=AC.xxx \
  --from-literal=TWILIO_AUTH_TOKEN=xxx

# Reference in pod
env:
  - name: SENDGRID_API_KEY
    valueFrom:
      secretKeyRef:
        name: amerilend-secrets
        key: SENDGRID_API_KEY
```

### Cloud Platforms (AWS, GCP, Azure)

**AWS Lambda:**
```bash
# Set environment variables in Lambda console or via CLI
aws lambda update-function-configuration \
  --function-name amerilend-api \
  --environment Variables={
    SENDGRID_API_KEY=SG.xxx,
    TWILIO_ACCOUNT_SID=AC.xxx,
    DATABASE_URL=mysql://...
  }
```

**Google Cloud Run:**
```bash
gcloud run deploy amerilend \
  --set-env-vars SENDGRID_API_KEY=SG.xxx \
  --set-env-vars TWILIO_ACCOUNT_SID=AC.xxx \
  --set-env-vars DATABASE_URL=mysql://...
```

**Azure App Service:**
```bash
az webapp config appsettings set \
  --resource-group myResourceGroup \
  --name myWebApp \
  --settings \
    SENDGRID_API_KEY=SG.xxx \
    TWILIO_ACCOUNT_SID=AC.xxx \
    DATABASE_URL=mysql://...
```

---

## Email & SMS Service Providers

### SendGrid (Email)

**Pros:**
- ✅ Simple API
- ✅ Great deliverability
- ✅ Free tier: 100 emails/day
- ✅ Paid tier: $10-30/month

**Cons:**
- ❌ Limited templates
- ❌ No built-in retry queue

**Setup:** https://sendgrid.com/pricing/

**Alternatives:**
- AWS SES (cheaper but more setup)
- Mailgun (similar to SendGrid)
- SparkPost (enterprise)

### Twilio (SMS)

**Pros:**
- ✅ Reliable SMS delivery
- ✅ Global phone number support
- ✅ Simple API
- ✅ Free trial: $15 credit

**Cons:**
- ❌ SMS is expensive (~$0.01 per message)
- ❌ Regional restrictions

**Setup:** https://www.twilio.com/sms/pricing

**Alternatives:**
- AWS SNS (cheaper, ~$0.00645 per SMS)
- Bandwidth (similar to Twilio)
- MessageBird (global)

---

## Notification Preference Management

### User Settings in UI

Users can configure notifications in **User Profile → Preferences Tab:**

```
Email Notifications
✓ Payment Due Reminders
✓ Payment Overdue Alerts
✓ Payment Received Confirmations
✓ General Account Updates

Text Message (SMS) Alerts
✓ Critical Alerts Only
  (Currently using phone: +1-234-567-8900)

Marketing & Promotions
☐ Promotions & Special Offers
```

### Database Schema

**Required user table additions:**
```sql
ALTER TABLE users ADD COLUMN emailNotificationsEnabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN smsNotificationsEnabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN smsPaymentConfirmations BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN phoneNumber VARCHAR(20);
```

**Optional: Detailed preference table:**
```sql
CREATE TABLE notification_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  notificationType ENUM('payment_due', 'overdue', 'confirmation', 'delinquency'),
  emailEnabled BOOLEAN DEFAULT true,
  smsEnabled BOOLEAN DEFAULT false,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Testing Configuration

### Sandbox/Staging Environment

**Use with reduced volume:**
```bash
# Faster testing (checks every 1 minute instead of 1 hour)
PAYMENT_SCHEDULER_INTERVAL_MS=60000

# Or disable scheduler and test manually
DISABLE_PAYMENT_SCHEDULER=true
```

**Test with real services:**
```bash
# Use real SendGrid key for staging
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx

# Use real Twilio key for staging
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
```

**Or use mock services:**
```bash
# Mock mode (logs to console instead of sending)
SENDGRID_API_KEY=  # Leave empty
TWILIO_ACCOUNT_SID=  # Leave empty

# Output will be:
# [MOCK EMAIL] To: user@example.com
# [MOCK SMS] To: +1234567890
```

### Load Testing

**Simulate high notification volume:**
```bash
# Slower scheduler (2 hour interval)
PAYMENT_SCHEDULER_INTERVAL_MS=7200000

# Or disable scheduler during load testing
DISABLE_PAYMENT_SCHEDULER=true
```

**Test API directly:**
```bash
# Send 100 test emails
for i in {1..100}; do
  curl http://localhost:3000/api/test/send-email \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"test$i@example.com\", \"type\": \"payment_due\"}"
done
```

---

## Monitoring & Logging

### Key Logs to Monitor

**Scheduler startup:**
```
[Payment Scheduler] Starting payment notification scheduler (interval: 3600000ms)
[Payment Scheduler] Payment notification scheduler started
```

**Successful sends:**
```
Email sent to user@example.com: SG.xxxxx
SMS sent successfully to +1234567890. SID: SM.xxxxx
```

**Errors:**
```
[Email] Failed to send payment due reminder: Invalid API key
[SMS] Error sending SMS: Invalid phone number format
[Payment Scheduler] Error in scheduled check: Database connection failed
```

### Monitoring Dashboard

**Metrics to track:**
- Emails sent per hour
- SMS sent per hour
- Email delivery rate (via SendGrid webhooks)
- SMS delivery rate (via Twilio webhooks)
- Scheduler execution time
- Error rate by notification type

**Set up webhooks:**

**SendGrid Webhook:**
```
Event Webhook URL: https://yourapp.com/webhooks/sendgrid
Enable: Delivered, Bounce, Spam Report, Unsubscribe
```

**Twilio Webhook:**
```
Message Status Callback: https://yourapp.com/webhooks/twilio
```

---

## Troubleshooting

### Emails Not Sending

**Problem:** "SendGrid API key not configured"
```
Solution:
1. Set SENDGRID_API_KEY in environment
2. Verify key format starts with "SG."
3. Check SendGrid account has credits
4. Verify EMAIL_FROM is valid email
```

**Problem:** "Failed to send email: Invalid email"
```
Solution:
1. Verify user email is valid format
2. Check email isn't on bounce list
3. Verify email isn't in suppression list
4. Check user record has email field
```

**Problem:** "Email sent but not received"
```
Solution:
1. Check spam folder
2. Verify SPF/DKIM records configured
3. Check SendGrid Activity log for bounces
4. Verify domain reputation at https://sendgrid.com/resources/
```

### SMS Not Sending

**Problem:** "Twilio credentials not configured"
```
Solution:
1. Set TWILIO_ACCOUNT_SID
2. Set TWILIO_AUTH_TOKEN
3. Set TWILIO_PHONE_NUMBER
4. Verify all values from Twilio console
```

**Problem:** "Invalid phone number"
```
Solution:
1. Use format: +1XXXXXXXXXX (with country code)
2. Verify phone number is valid
3. Check country doesn't have SMS restrictions
4. Verify phone isn't on Do-Not-Disturb list
```

**Problem:** "No SMS credits"
```
Solution:
1. Add payment method to Twilio account
2. Check account balance: https://console.twilio.com
3. Verify number is provisioned and activated
4. Check SMS isn't rate limited
```

### Scheduler Not Running

**Problem:** "Scheduler not starting"
```
Solution:
1. Verify DISABLE_PAYMENT_SCHEDULER !== "true"
2. Check logs for errors
3. Verify DATABASE_URL is set
4. Verify database connection is working
5. Check server didn't crash during startup
```

**Problem:** "Scheduler running but no notifications"
```
Solution:
1. Verify payment due dates in database
2. Check user emailNotificationsEnabled = true
3. Verify user has valid email address
4. Check scheduler interval (may just not run yet)
5. Manually trigger scheduler: curl http://localhost:3000/api/scheduler/trigger
```

---

## Production Checklist

Before deploying to production:

- [ ] SendGrid API key configured and tested
- [ ] Twilio account configured with SMS credits
- [ ] Email FROM address verified with SendGrid
- [ ] Phone number provisioned in Twilio
- [ ] Database migrations run (notification preference columns added)
- [ ] Scheduler interval set appropriately (1 hour recommended)
- [ ] Webhooks configured for bounce/delivery tracking
- [ ] Email templates reviewed for branding
- [ ] SMS message length verified (< 160 chars)
- [ ] User preference migration plan (default preferences)
- [ ] Monitoring/alerting configured
- [ ] Load testing completed
- [ ] Backup email provider identified
- [ ] Backup SMS provider identified
- [ ] Runbook created for ops team

---

## Cost Estimation

### SendGrid (Email)

**Pricing:**
- Free: 100 emails/day
- Essentials: $10/month (5,000 emails)
- Pro: $80/month (50,000 emails)

**Monthly cost for 100,000 users:**
- 1 payment reminder per user per month: 100,000 emails = ~$240
- 1 overdue alert per user per month: 100,000 emails = ~$240
- Total: ~$480/month (Pro plan)

### Twilio (SMS)

**Pricing:**
- SMS: $0.0075 - $0.01 per SMS (varies by country)

**Monthly cost for 100,000 users:**
- Assume 10% get overdue alerts: 10,000 SMS
- At $0.01 each: ~$100/month
- Delinquency alerts: ~$50/month
- Total: ~$150/month

### Combined Monthly Cost
```
Email: ~$480
SMS: ~$150
Total: ~$630/month for 100,000 users
(Or $0.63 per user per month)
```

---

## API Endpoints (Future)

These endpoints may be added to support manual notification triggering:

```
POST /api/notifications/send-email
POST /api/notifications/send-sms
POST /api/notifications/preferences
GET /api/notifications/preferences
POST /api/scheduler/trigger
GET /api/scheduler/status
```

---

## Support & Resources

- **SendGrid Documentation:** https://docs.sendgrid.com
- **Twilio Documentation:** https://www.twilio.com/docs
- **AmeriLend Email Templates:** See `server/_core/email.ts`
- **AmeriLend SMS Templates:** See `server/_core/sms.ts`
- **Payment Notification Guide:** See `PAYMENT_NOTIFICATION_SYSTEM.md`

---

**Document Version:** 1.0  
**Last Updated:** November 20, 2025  
**Status:** ✅ PRODUCTION READY
