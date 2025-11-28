# Admin Payment Verification Guide

## Overview
This guide explains how administrators verify and confirm payments (especially crypto payments) before disbursing loans.

---

## Payment Verification Workflow

### Step 1: Access Payment Verification Panel
1. Login as admin to the Admin Dashboard
2. Click **"Payments"** in the left sidebar navigation
3. You'll see the Payment Verification Panel with all payment transactions

### Step 2: Filter Payments
Use the filter options to find payments that need verification:

**Status Filters:**
- **Pending** - Payment address created, user hasn't sent crypto yet
- **Processing** - Transaction hash submitted, awaiting blockchain confirmation
- **Succeeded** - Payment confirmed on blockchain
- **Failed** - Payment failed or rejected

**Payment Method Filters:**
- **All Methods** - Shows card and crypto payments
- **Card Payments** - Credit/debit card transactions (auto-verified by Authorize.net)
- **Crypto Payments** - Bitcoin, Ethereum, USDT, USDC payments

**💡 Recommended Filter:** `Status: Processing` + `Method: Crypto Payments` to see payments needing review.

### Step 3: Review Payment Details
For each payment that needs verification:

1. Click **"Details"** button to expand payment information
2. Review the payment details:
   - **User Information**: Name, email
   - **Loan Information**: Tracking number, loan status
   - **Payment Amount**: USD amount + crypto amount
   - **Payment Method**: Crypto currency (BTC, ETH, USDT, USDC)
   - **Wallet Address**: Where user should send crypto
   - **Transaction Hash**: Submitted by user after sending crypto
   - **Status**: Current payment status
   - **Timestamps**: Created date, completed date

### Step 4: Verify Crypto Transaction on Blockchain

**For Crypto Payments with Transaction Hash:**

1. **Copy Transaction Hash**
   - Click the copy icon next to the transaction hash
   - Transaction hash is copied to clipboard

2. **Open Blockchain Explorer**
   - Click **"View on Blockchain Explorer"** button
   - Opens blockchain explorer in new tab:
     - **Bitcoin (BTC)**: Blockchair.com
     - **Ethereum/USDT/USDC (ETH)**: Etherscan.io

3. **Verify Transaction Details**
   - Check transaction status: ✅ Confirmed / ⏳ Pending
   - Verify recipient address matches the wallet address shown
   - Verify amount matches the crypto amount shown
   - Check number of confirmations (6+ confirmations recommended)

**Blockchain Confirmation Guidelines:**
- **Bitcoin**: Wait for 6 confirmations (~60 minutes)
- **Ethereum**: Wait for 12 confirmations (~3 minutes)
- **USDT/USDC**: Wait for 12 confirmations (~3 minutes)

### Step 5: Approve or Reject Payment

**To Approve Payment:**
1. Click **"Verify"** or **"Approve Payment"** button
2. Review the payment summary in the dialog
3. (Optional) Add admin notes explaining verification decision
4. Click **"Approve Payment"**
5. System will:
   - Mark payment as `succeeded`
   - Update loan status to `fee_paid`
   - Send confirmation email to user
   - Send payment receipt to user
   - Log action in admin audit trail

**To Reject Payment:**
1. Click **"Reject Payment"** button (in payment details)
2. Review the payment summary in the dialog
3. Add admin notes explaining why payment is rejected (REQUIRED for transparency)
4. Click **"Reject Payment"**
5. System will:
   - Mark payment as `failed`
   - Change loan status back to `approved`
   - Log action in admin audit trail
   - User will need to submit new payment

### Step 6: Disburse the Loan

After payment is verified and approved:

1. Navigate to **"Applications"** tab
2. Find the loan application (now shows `fee_paid` status)
3. Click **"Verify Payment"** button to mark fee as verified
4. Click **"Disburse"** button to initiate loan disbursement
5. Fill in disbursement details:
   - Disbursement method (Bank Transfer, Check, Crypto)
   - Bank account information (if bank transfer)
   - Amount to disburse
6. Submit disbursement
7. User receives disbursement confirmation email

---

## Payment Dashboard Statistics

The Payment Verification Panel shows real-time statistics:

| Metric | Description |
|--------|-------------|
| **Pending** | Payments awaiting user to send crypto |
| **Processing** | Payments with tx hash submitted, awaiting verification |
| **Succeeded** | Confirmed and verified payments |
| **Needs Review** | Crypto payments with tx hash that need admin verification |

---

## Payment Details Reference

### Card Payment Details
- **Card Brand**: Visa, Mastercard, Amex, Discover
- **Card Last 4**: Last 4 digits of card
- **Transaction ID**: Authorize.net transaction ID
- **Status**: Usually auto-verified as `succeeded`

### Crypto Payment Details
- **Currency**: BTC, ETH, USDT, USDC
- **Crypto Amount**: Amount in cryptocurrency
- **Wallet Address**: Unique address for this payment
- **Transaction Hash**: Blockchain transaction ID (submitted by user)
- **Status**: `pending` → `processing` → `succeeded`
- **Blockchain Explorer Link**: Direct link to verify on blockchain

---

## Common Scenarios

### Scenario 1: User Paid but Didn't Submit TX Hash
**Status:** `Pending`
**TX Hash:** NOT PROVIDED YET

**Actions:**
1. Contact user via support ticket or email reminder
2. Ask user to submit transaction hash from their wallet
3. Wait for user to submit hash via their dashboard

### Scenario 2: User Submitted TX Hash, Awaiting Confirmation
**Status:** `Processing`
**TX Hash:** Provided

**Actions:**
1. Click "View on Blockchain Explorer"
2. Check confirmations count
3. If less than 6 confirmations (BTC) or 12 (ETH), wait
4. If enough confirmations, approve payment
5. If invalid transaction, reject with explanation

### Scenario 3: User Sent Wrong Amount
**Status:** `Processing`
**TX Hash:** Provided
**Issue:** Amount doesn't match

**Actions:**
1. Verify actual amount sent vs required amount
2. If under-payment: Reject with note "Insufficient amount sent"
3. Contact user to send remaining balance
4. If over-payment: Approve and handle refund separately

### Scenario 4: User Sent to Wrong Address
**Status:** `Processing` or `Pending`
**TX Hash:** Provided (but wrong recipient)

**Actions:**
1. Verify recipient address on blockchain
2. If sent to wrong address: Reject payment
3. Add admin note: "Payment sent to incorrect address"
4. Contact user to make new payment to correct address
5. Original funds may be unrecoverable

### Scenario 5: Card Payment Auto-Verified
**Status:** `Succeeded`
**Method:** Card

**Actions:**
- No action needed - Authorize.net already verified
- Payment automatically marked as succeeded
- Proceed directly to verify fee and disburse loan

---

## Troubleshooting

### Problem: Transaction not found on blockchain
**Solution:**
- Wait 10-15 minutes for blockchain propagation
- Check if user provided correct transaction hash
- Ask user to verify transaction hash from their wallet

### Problem: Wrong cryptocurrency sent
**Solution:**
- Verify which currency was actually sent
- Reject payment with note about currency mismatch
- User must send correct cryptocurrency
- Original funds may need manual recovery

### Problem: Duplicate payment
**Solution:**
- Check if loan already has fee_paid status
- If duplicate: Reject second payment
- Add note: "Duplicate payment - fee already paid"
- Coordinate refund if needed

### Problem: Blockchain shows failed transaction
**Solution:**
- Check blockchain explorer for failure reason
- Reject payment with note: "Transaction failed on blockchain"
- User needs to make new payment with successful transaction

---

## Security Best Practices

1. **Always verify on blockchain** - Never approve based on screenshot alone
2. **Check wallet address match** - Ensure crypto sent to our wallet
3. **Verify amount exactly** - Must match processing fee amount
4. **Wait for confirmations** - Don't approve with 0 confirmations
5. **Document rejections** - Always add admin notes explaining why
6. **Audit trail** - All actions are logged for compliance
7. **Double-check before disbursing** - Verify payment succeeded before loan disbursement

---

## API Endpoints Used

### Backend Procedures (tRPC)
- `payments.adminGetAllPayments` - Fetch all payments with filters
- `payments.adminGetPaymentDetails` - Get detailed payment info
- `payments.adminVerifyCryptoPayment` - Approve/reject crypto payment
- `loans.adminVerifyFeePayment` - Mark fee as verified on loan
- `disbursements.adminCreate` - Create loan disbursement

### Database Functions
- `getAllPayments()` - Query all payments from database
- `getPaymentById()` - Get specific payment details
- `updatePaymentStatus()` - Update payment status
- `updateLoanApplicationStatus()` - Update loan status
- `logAdminActivity()` - Log verification actions

---

## Email Notifications

### When Admin Approves Payment:
1. **User Receives:**
   - Crypto Payment Confirmed Email
   - Payment Receipt Email
   
2. **Admin Receives:**
   - Payment Verification Log (in audit trail)

### When Admin Rejects Payment:
1. **User Should Receive:**
   - Payment Rejection Notice (TODO: implement)
   - Instructions to retry payment

---

## Quick Reference Checklist

### Before Approving Crypto Payment:
- [ ] Transaction hash provided by user
- [ ] Blockchain explorer shows confirmed transaction
- [ ] Recipient address matches our wallet address
- [ ] Amount sent matches processing fee exactly
- [ ] Currency matches (BTC/ETH/USDT/USDC as expected)
- [ ] At least 6 confirmations (BTC) or 12 (ETH)
- [ ] No red flags or suspicious activity

### After Approving Payment:
- [ ] Payment status changed to `succeeded`
- [ ] Loan status changed to `fee_paid`
- [ ] User received confirmation email
- [ ] Admin action logged in audit trail
- [ ] Ready to proceed with loan disbursement

---

## Support Contact

For questions about payment verification:
- **Technical Issues**: Check admin audit log for errors
- **Blockchain Issues**: Contact crypto payment provider
- **User Inquiries**: Use support ticket system
- **Refunds**: Follow company refund policy

---

**Last Updated:** November 28, 2025
**Feature Version:** 1.0.0
**Status:** Active
