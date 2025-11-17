# AmeriLend Deployment Guide

**Author:** Manus AI  
**Version:** 1.0  
**Last Updated:** 2025-11-02

## Overview

This guide provides step-by-step instructions for deploying the AmeriLend loan platform to production. The platform is designed to run on the Manus infrastructure with auto-scaling, global CDN, and managed database services.

## Prerequisites

Before deployment, ensure you have:

- [x] Manus account with project access
- [x] Admin access to the AmeriLend project
- [x] Database credentials configured
- [x] OAuth configuration completed
- [x] (Production only) Stripe account for payment processing

## Deployment Process

### Step 1: Save a Checkpoint

Before publishing, you must create a checkpoint of your current work.

1. Click the **Management UI** icon in the top-right corner
2. Verify all features are working correctly
3. The system has already created a checkpoint for you
4. Review the checkpoint in the UI to ensure it captures your latest changes

### Step 2: Publish to Production

1. In the Management UI, click the **Publish** button in the header
2. The system will deploy your checkpoint to production infrastructure
3. Wait for the deployment to complete (typically 2-3 minutes)
4. You'll receive a production URL (e.g., `https://amerilend.manus.space`)

### Step 3: Configure Custom Domain (Optional)

To use your own domain:

1. Go to **Settings → Domains** in the Management UI
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `loans.yourdomain.com`)
4. Add the provided DNS records to your domain registrar:
   - Type: CNAME
   - Name: `loans` (or your subdomain)
   - Value: `amerilend.manus.space`
5. Wait for DNS propagation (up to 24 hours)
6. SSL certificate will be automatically provisioned

## Production Configuration

### Environment Variables

The following environment variables are automatically configured by Manus:

**System Variables (Auto-configured):**
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session signing secret
- `OAUTH_SERVER_URL` - Manus OAuth backend
- `VITE_OAUTH_PORTAL_URL` - Manus login portal
- `OWNER_OPEN_ID` - Owner account identifier
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Logo URL

**Required for Production:**

For production deployment with real payment processing, you need to add Stripe credentials:

1. Go to **Settings → Secrets** in the Management UI
2. Click "Add Secret"
3. Add the following secrets:

| Secret Key | Description | How to Obtain |
|------------|-------------|---------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | Stripe Dashboard → Developers → API Keys |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | Stripe Dashboard → Developers → API Keys |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Frontend Stripe key | Same as above (for client-side) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Webhooks |

### Database Setup

The database is automatically provisioned and migrated. To verify:

1. Go to **Database** panel in Management UI
2. Verify the following tables exist:
   - `users`
   - `loanApplications`
   - `feeConfiguration`
   - `payments`
   - `disbursements`
3. Check that default fee configuration is seeded

### Initial Admin Setup

The owner account (configured via `OWNER_OPEN_ID`) is automatically assigned admin role on first login.

**To promote additional users to admin:**

1. Go to **Database** panel
2. Navigate to `users` table
3. Find the user by email or name
4. Edit the `role` field to `admin`
5. Save changes

## Payment Integration (Production)

### Stripe Setup

For production payment processing, you need to integrate Stripe:

**1. Create Stripe Account**
- Sign up at https://stripe.com
- Complete business verification
- Enable payment methods (cards, ACH, etc.)

**2. Configure Webhook**
- In Stripe Dashboard, go to Developers → Webhooks
- Add endpoint: `https://your-domain.com/api/webhooks/stripe`
- Select events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

**3. Update Payment Code**

Replace the simulated payment logic in `server/routers.ts`:

```typescript
// Current (demo):
createIntent: protectedProcedure
  .mutation(async ({ ctx, input }) => {
    // Creates payment record
    // Updates status to fee_pending
  }),

// Production:
createIntent: protectedProcedure
  .mutation(async ({ ctx, input }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: application.processingFeeAmount,
      currency: 'usd',
      metadata: {
        loanApplicationId: input.loanApplicationId,
        userId: ctx.user.id,
      },
    });
    
    // Create payment record with paymentIntentId
    // Return client secret for frontend
  }),
```

**4. Add Webhook Handler**

Create `server/webhooks/stripe.ts`:

```typescript
import { Router } from 'express';
import Stripe from 'stripe';
import * as db from '../db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const router = Router();

router.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { loanApplicationId } = paymentIntent.metadata;
      
      // Update payment status
      await db.updatePaymentStatus(paymentId, 'succeeded', {
        completedAt: new Date(),
      });
      
      // Update loan status
      await db.updateLoanApplicationStatus(
        parseInt(loanApplicationId),
        'fee_paid'
      );
    }
    
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
```

## Security Checklist

Before going live, verify:

- [ ] All environment variables are set in production
- [ ] Database connection uses SSL
- [ ] HTTPS is enabled (automatic with Manus)
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled (if needed)
- [ ] Admin accounts are properly secured
- [ ] Sensitive data (SSN, bank accounts) is encrypted at rest
- [ ] Audit logging is enabled for admin actions
- [ ] Backup strategy is in place

## Monitoring and Maintenance

### Analytics

The platform includes built-in analytics:

1. Go to **Dashboard** panel in Management UI
2. View UV (Unique Visitors) and PV (Page Views)
3. Track application submission rates
4. Monitor approval/rejection ratios

### Database Backups

Manus automatically backs up your database:
- Full backup: Daily
- Point-in-time recovery: Available
- Retention: 7 days

To restore from backup, contact Manus support.

### Performance Monitoring

Monitor key metrics:
- API response times
- Database query performance
- Payment processing success rate
- Disbursement completion rate

### Logs

Access application logs:
1. Go to **Management UI**
2. Check server logs in the deployment panel
3. Filter by error level, timestamp, or keyword

## Scaling Considerations

The platform automatically scales based on traffic. For high-volume scenarios:

**Database Optimization:**
- Add indexes on frequently queried fields
- Enable query caching
- Consider read replicas for reporting

**API Rate Limiting:**
- Implement per-user rate limits
- Add IP-based throttling
- Use Redis for distributed rate limiting

**File Storage:**
- Store documents (IDs, pay stubs) in S3
- Use CDN for static assets
- Implement file size limits

## Compliance and Regulations

### Data Privacy (GDPR, CCPA)

- Implement data retention policies
- Provide user data export functionality
- Add "Delete Account" feature
- Update privacy policy

### Financial Regulations

- Ensure compliance with state lending laws
- Implement required disclosures
- Add APR calculations
- Maintain audit trails

### Security Standards (PCI DSS)

- Never store full credit card numbers
- Use Stripe for PCI compliance
- Encrypt sensitive data at rest
- Implement access controls

## Troubleshooting

### Common Issues

**Issue: Users can't log in**
- Verify OAuth configuration
- Check `VITE_OAUTH_PORTAL_URL` is correct
- Ensure cookies are enabled

**Issue: Payments not processing**
- Verify Stripe keys are correct
- Check webhook endpoint is accessible
- Review Stripe dashboard for errors

**Issue: Database connection errors**
- Verify `DATABASE_URL` is correct
- Check database server is running
- Ensure SSL is configured

**Issue: Admin can't approve loans**
- Verify user has `role = 'admin'`
- Check admin procedures are not blocked
- Review error logs

## Rollback Procedure

If issues occur after deployment:

1. Go to **Management UI**
2. Find the previous checkpoint
3. Click "Rollback" button
4. Confirm rollback
5. System will restore to previous state

**Note:** Rollback affects code only, not database data. Database changes must be manually reverted if needed.

## Support and Resources

**Manus Support:**
- Help Center: https://help.manus.im
- Email: support@manus.im
- Documentation: https://docs.manus.im

**Third-Party Services:**
- Stripe Documentation: https://stripe.com/docs
- MySQL Documentation: https://dev.mysql.com/doc/

## Post-Deployment Checklist

After deployment, verify:

- [ ] Homepage loads correctly
- [ ] User can sign in
- [ ] Loan application form works
- [ ] Admin can approve loans
- [ ] Fee calculation is correct
- [ ] Payment processing works (test mode)
- [ ] Disbursement workflow completes
- [ ] Email notifications work (if configured)
- [ ] Mobile responsive design works
- [ ] All links and navigation work

## Next Steps

1. **Test in Production**: Submit a test loan application
2. **Configure Stripe**: Set up payment processing
3. **Customize Branding**: Update logo and colors
4. **Add Content**: Update terms of service, privacy policy
5. **Marketing**: Promote your loan platform

---

**Your AmeriLend platform is now live and ready to serve customers!**

For ongoing support or feature requests, contact Manus AI through the chat interface.
