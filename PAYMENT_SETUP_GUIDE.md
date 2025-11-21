# Quick Setup Guide - Real Payments

## ✅ What's Already Done

Your payment page now supports **real payment processing**:
- ✅ Credit/Debit cards via Authorize.Net
- ✅ Cryptocurrency (BTC, ETH, USDT, USDC)
- ✅ Secure tokenization (PCI compliant)
- ✅ Error handling and retry logic

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Authorize.Net Credentials

**For Testing (Sandbox):**
1. Go to https://developer.authorize.net/hello_world/sandbox/
2. Create a free sandbox account
3. Get your credentials:
   - API Login ID
   - Transaction Key
   - Public Client Key

**Default Test Credentials:**
```bash
AUTHORIZENET_API_LOGIN_ID=5KP3u95bQpv
AUTHORIZENET_TRANSACTION_KEY=346HZ32z3fP4hTG2
AUTHORIZENET_CLIENT_KEY=your-sandbox-client-key
AUTHORIZENET_ENVIRONMENT=sandbox
```

### Step 2: Add to .env File

Create/update `.env` file in project root:

```bash
# Authorize.Net Payment Gateway
AUTHORIZENET_API_LOGIN_ID=5KP3u95bQpv
AUTHORIZENET_TRANSACTION_KEY=346HZ32z3fP4hTG2
AUTHORIZENET_CLIENT_KEY=your-client-key-here
AUTHORIZENET_ENVIRONMENT=sandbox
```

### Step 3: Restart Server

```bash
npm run dev
```

### Step 4: Test Payment

1. Create a loan application
2. Admin approves it
3. Go to `/payment/:id` page
4. Select "Credit/Debit Card"
5. Use test card: **4007 0000 0002 7**
6. Expiry: **12/25**
7. CVC: **123**
8. Name: **Test User**
9. Click "Pay"
10. Should see success! ✅

## 💳 Test Cards

| Card Number | Type | Result |
|-------------|------|--------|
| 4007000000027 | Visa | ✅ Approved |
| 4012888818888 | Visa | ✅ Approved |
| 5424000000000015 | Mastercard | ✅ Approved |
| 370000000000002 | Amex | ✅ Approved |
| 4000300011112220 | Visa | ❌ Declined |

## 🔐 Production Setup

When ready for production:

1. **Sign up:** https://www.authorize.net/
2. **Get production credentials**
3. **Update .env:**
   ```bash
   AUTHORIZENET_API_LOGIN_ID=your-prod-id
   AUTHORIZENET_TRANSACTION_KEY=your-prod-key
   AUTHORIZENET_CLIENT_KEY=your-prod-client-key
   AUTHORIZENET_ENVIRONMENT=production
   ```
4. **Enable HTTPS** (required for production)
5. **Test with real card** (small amount)

## 🪙 Cryptocurrency Payments

Works out of the box! No setup needed for basic functionality.

**Optional Enhancement (Coinbase Commerce):**
```bash
COINBASE_COMMERCE_API_KEY=your-api-key
COINBASE_COMMERCE_WEBHOOK_SECRET=your-secret
CRYPTO_PAYMENT_ENVIRONMENT=production
```

## 🎯 Payment Flow

### For Card Payments:
1. User enters card details
2. Accept.js tokenizes (secure, PCI compliant)
3. Server processes via Authorize.Net API
4. Payment confirmed
5. Loan status updated to "fee_paid"
6. Email sent to user

### For Crypto Payments:
1. User selects cryptocurrency
2. System shows amount + address
3. User sends crypto
4. User clicks "I've Sent Payment"
5. System verifies (blockchain check)
6. Payment confirmed
7. Loan status updated
8. Email sent to user

## 📊 Check Payment Status

**In Database:**
```sql
SELECT * FROM payments WHERE loanApplicationId = 123;
```

**In Admin Dashboard:**
- View all payments
- See success/failure rates
- Track transaction IDs

## ❓ Troubleshooting

### "Authorize.net credentials not configured"
- Check `.env` file exists in project root
- Verify all variables are set
- Restart server after changing `.env`

### "Accept.js failed to load"
- Must use HTTPS in production
- Check `AUTHORIZENET_ENVIRONMENT` matches
- Clear browser cache

### Card Declined
- Use test cards in sandbox mode only
- Real cards only work in production mode
- Check card details are correct

## 📁 Key Files

- **Payment Page:** `client/src/pages/PaymentPage.tsx`
- **Backend Integration:** `server/_core/authorizenet.ts`
- **Crypto Processing:** `server/_core/crypto-payment.ts`
- **Payment Router:** `server/routers.ts` (payments section)

## 📞 Support

- **Documentation:** `REAL_PAYMENT_INTEGRATION.md`
- **Authorize.Net Docs:** https://developer.authorize.net/
- **Phone:** (945) 212-1609
- **Email:** support@amerilendloan.com

---

**That's it! Your payment system is ready to accept real payments!** 🎉

Test in sandbox first, then switch to production when ready.
