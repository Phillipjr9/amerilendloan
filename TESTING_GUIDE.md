# Quick Testing Guide - Payment System

## Pre-Flight Checks ✅
- [x] TypeScript compilation: 0 errors
- [x] All components created and integrated
- [x] Videos copied to public directory
- [x] Support icon copied
- [x] All endpoints defined
- [x] Bug fixes applied

---

## How to Test

### 1. Start Development Server
```bash
npm run dev
# or
$env:NODE_ENV="development"; npm run dev
```

### 2. Navigate to Payment Page
```
http://localhost:5173/payment/1
```

---

## Test Scenarios

### Scenario A: Successful Card Payment ✅
**Steps:**
1. Payment page loads
2. Select "Credit/Debit Card" tab
3. Fill in test data:
   - Cardholder Name: `Test User`
   - Card Number: `4111 1111 1111 1111` (Authorize.Net test card)
   - Expiry: `12/25`
   - CVV: `123`
4. Click "Pay ${amount} Securely"

**Expected Results:**
- ✅ Card processing begins
- ✅ Success animation plays (Tick Market.mp4)
- ✅ "Payment Successful!" message shows below video
- ✅ Checkmark icon bounces
- ✅ Animation fades after ~2 seconds
- ✅ Green status card appears: "✅ Payment Verified"
- ✅ Transaction details display
- ✅ "Go to Dashboard" button available
- ✅ Payment form is hidden

---

### Scenario B: Failed Card Payment ❌
**Steps:**
1. Payment page loads
2. Select "Credit/Debit Card" tab
3. Fill in invalid data:
   - Cardholder Name: `Test`
   - Card Number: `1234 5678 9012 3456` (Invalid)
   - Expiry: `01/20` (Expired)
   - CVV: `000`
4. Click "Pay Securely"

**Expected Results:**
- ✅ Error validation shows
- ✅ Toast notification appears with error message
- ✅ Payment not processed
- ✅ Form remains visible for retry

---

### Scenario C: Successful Crypto Payment ✅
**Steps:**
1. Payment page loads
2. Select "Cryptocurrency" tab
3. Choose cryptocurrency: `USDT` or `ETH`
4. Click "Generate ${CRYPTO} Payment Address"

**Expected Results:**
- ✅ Address generated and displays
- ✅ Amount shows in selected crypto
- ✅ Copy buttons work for address and amount
- ✅ Expiration warning shows (1 hour)
- ✅ Confirmation requirements display

**Continue with:**
5. Click "I've Sent the Payment (Demo)"

**Expected Results:**
- ✅ Success animation plays
- ✅ Status updates to "confirmed"
- ✅ Green status card displays

---

### Scenario D: Crypto Payment with Hash Verification ✅
**Steps:**
1. Crypto payment address generated
2. User sends cryptocurrency (simulated)
3. Enter transaction hash:
   - For ETH: `0x` + 64 hex characters
   - For BTC: Standard BTC tx format
4. Click "Verify Transaction"

**Expected Results:**
- ✅ Loading state shows
- ✅ Blockchain verification occurs
- ✅ If confirmed (12+ confirmations): 
  - Green status card: "✅ Payment Verified"
  - Confirmations display: `12/12`
- ✅ If pending (< 12 confirmations):
  - Amber status card: "⏳ Awaiting Confirmations"
  - Current confirmation count shows: `5/12`
- ✅ If failed:
  - Red status card: "❌ Verification Failed"
  - Error message displays

---

### Scenario E: Support Modal ❓
**Steps:**
1. Payment page loads
2. Click support icon (top right, next to "Back to Dashboard")

**Expected Results:**
- ✅ Modal opens with "Customer Support" title
- ✅ Three tabs visible: Contact Us | FAQ | Submit Ticket

**Test Contact Us Tab:**
- ✅ Phone number displays: 1-800-AMERILEND
- ✅ Email displays: support@amerilend.com
- ✅ Live chat button available

**Test FAQ Tab:**
- ✅ 5 FAQs display in expandable format
- ✅ Click FAQ to expand/collapse
- ✅ Answers contain relevant payment info

**Test Submit Ticket Tab:**
- ✅ Email input field
- ✅ Subject input field
- ✅ Message textarea
- ✅ Submit button
- ✅ Can fill out and submit

---

### Scenario F: Payment Form Visibility ✅
**Steps:**
1. Initiate successful payment
2. Watch animation play
3. Animation completes

**Expected Results:**
- ✅ Payment form (tabs, card fields, crypto options) is HIDDEN
- ✅ Only status verification card is VISIBLE
- ✅ No form inputs shown
- ✅ User sees only success/failure message

**If clicking "Clear & Retry":**
- ✅ Status card disappears
- ✅ Payment form re-appears
- ✅ Form is cleared and ready for new payment

---

### Scenario G: Real-Time Status Updates ⏱️
**Steps:**
1. Initiate crypto payment
2. Enter transaction hash
3. Watch status in real-time

**Expected Results:**
- ✅ Status changes from "pending" to "verifying"
- ✅ Confirmation count updates: `1/12` → `2/12` → ... → `12/12`
- ✅ When 12 confirmations reached, status changes to "confirmed"
- ✅ Green status card appears: "✅ Payment Verified"

---

## Common Issues & Solutions

### Issue: Video not playing
**Solution:**
1. Check video files exist: `client/public/videos/`
2. Verify filenames: `tick-market.mp4`, `payment-failed.mp4`
3. Rebuild project: `npm run build`

### Issue: Support icon not showing
**Solution:**
1. Check icon file: `client/public/icons/support.png`
2. Check it's 104.3 KB size
3. Rebuild project

### Issue: Web3 verification failing with "RPC not configured"
**Solution:**
1. This is expected in development without .env
2. To fix, add to `.env`:
   ```
   ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
   ALCHEMY_API_KEY=your_key_here
   ```
3. Restart development server

### Issue: Crypto payment address not generating
**Solution:**
1. Check Coinbase Commerce API key in `.env`
2. This is expected in demo mode (shows mock address)
3. For production, configure actual payment gateway

---

## Performance Metrics

| Metric | Expected | Notes |
|---|---|---|
| Page Load | <2s | Vite optimized |
| Card Payment Flow | ~2-3s | Tokenization + submission |
| Animation Display | ~2s | Video plays |
| Status Card Render | <100ms | Instant |
| Crypto Verification | <5s | Blockchain query |
| Support Modal Open | <300ms | Dialog animation |

---

## Browser DevTools Checks

### Console (F12 → Console)
- ✅ No TypeScript errors
- ✅ No console.error() calls
- ✅ Token submission debug logs appear

### Network (F12 → Network)
- ✅ Payment API calls complete successfully
- ✅ Video files load (9-18KB each)
- ✅ Support icon loads (104KB)

### Performance (F12 → Performance)
- ✅ Core Web Vitals are good
- ✅ No layout shifts during animation
- ✅ Smooth 60fps during transitions

---

## Success Criteria ✅

All the following should pass:

- [ ] TypeScript compilation: 0 errors
- [ ] Card payment: Animation plays on success
- [ ] Card payment: Form hides after success
- [ ] Card payment: Status card displays correctly
- [ ] Card payment failure: Error shows, form stays visible
- [ ] Crypto payment: Address generates
- [ ] Crypto payment: Hash verification works
- [ ] Crypto payment: Confirmations update in real-time
- [ ] Support icon: Opens modal
- [ ] Support modal: All tabs work
- [ ] Videos: Play without errors
- [ ] Icons: Display correctly
- [ ] State management: No race conditions
- [ ] Error handling: All errors shown gracefully
- [ ] UI: Responsive on mobile/tablet/desktop

---

## When Ready for Production

1. [ ] Configure `.env` with real credentials:
   - Authorize.Net API keys
   - Alchemy/Infura RPC URL
   - Database connection
   - JWT secret
   - Email service keys

2. [ ] Test with real payment methods (small amounts)

3. [ ] Update support contact information

4. [ ] Enable production mode in Authorize.Net

5. [ ] Enable mainnet for blockchain verification

6. [ ] Set up monitoring and logging

7. [ ] Configure CI/CD pipeline

8. [ ] Deploy to staging first

9. [ ] Get security audit

10. [ ] Deploy to production with rollback plan

---

**Happy Testing!** 🚀
