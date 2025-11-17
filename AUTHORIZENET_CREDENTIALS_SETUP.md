# Authorize.Net Credentials Setup Guide

## Overview
This document provides instructions for setting up and testing the Authorize.Net payment integration with the provided sandbox credentials.

## Credentials Configured
The following Authorize.Net sandbox credentials have been configured in `.env`:

```
AUTHORIZENET_API_LOGIN_ID=48VRqhq22sMG
AUTHORIZENET_TRANSACTION_KEY=523uhCmXgW85724u
AUTHORIZENET_SIGNATURE_KEY=61F365F9C8EABB08B0ACC5A65B598049BD009D0ED64537845CC34EF786CDDEB7950951010E8332280904B054888E6DF50C15F46606B159B9B082B17F15B13BE1
AUTHORIZENET_ENVIRONMENT=sandbox
AUTHORIZENET_CLIENT_KEY=54x82h6XqzRztxYthv53kVwVv4HW77FESYV6D2VTmU4HU2y3sbRt4KwV6wY3ZbkF
```

**Environment**: Sandbox (Testing)

## Testing Card Numbers

The following card numbers work in Authorize.Net sandbox for testing:

### Success Scenarios
- **Visa**: `4111111111111111`
- **Mastercard**: `5555555555554444`
- **American Express**: `378282246310005`
- **Discover**: `6011111111111117`

### Expiration Date
Use any future date in format MM/YY:
- Example: `12/25` (December 2025)

### CVV
Use any 3-digit number for testing:
- Example: `123` (for Visa, Mastercard, Discover)
- Example: `1234` (for American Express - 4 digits)

## Payment Flow Testing

### Step 1: Start Development Server
```bash
env NODE_ENV=development pnpm dev
```

This starts:
- Express server on `http://localhost:5000`
- Vite dev server on `http://localhost:5173`
- Both connected with hot reloading

### Step 2: Test Loan Application
1. Navigate to `http://localhost:5173`
2. Complete the loan application form (all 6 steps)
3. Submit the application
4. Application should appear in your Dashboard with status "pending"

### Step 3: Admin Approval
1. Log in as an admin user
2. Go to Admin Dashboard
3. Navigate to the "Applications" tab
4. Find your test application
5. Click "Approve" to change status to "approved"

### Step 4: Payment Flow
1. Go back to your user Dashboard
2. Find the approved loan application
3. Click the "Pay Processing Fee" button (or similar CTA)
4. You'll be directed to the Payment Page

### Step 5: Test Card Payment

On the Payment Page:

1. **Select Payment Method**: Choose "Credit Card" tab
2. **Fill in Card Details**:
   - Cardholder Name: Any name (e.g., "Test User")
   - Card Number: `4111111111111111`
   - Expiration: `12/25`
   - CVV: `123`
3. **Review Fee**: Processing fee should display (default 3.5%)
4. **Submit Payment**

**Expected Result**:
- Accept.js tokenizes the card on the client side (PCI-compliant)
- Server creates an Authorize.Net transaction
- If successful:
  - Payment status changes to "succeeded"
  - Loan status changes to "fee_paid"
  - User sees success message
  - Payment record is created in database

### Step 6: Test Crypto Payment

On the Payment Page:

1. **Select Payment Method**: Choose "Cryptocurrency" tab
2. **Choose Currency**: Select from:
   - BTC (Bitcoin)
   - ETH (Ethereum)
   - USDT (Tether USDT)
   - USDC (USD Coin)
3. **View Details**:
   - USD amount displays
   - Equivalent crypto amount shows
   - Payment address appears
   - QR code displays (if available)
4. **Send Crypto**: (For real testing, you'd send actual crypto)
   - In sandbox, this would be simulated
   - For testing purposes, you can use payment confirmation endpoint

## Testing Verification System

### User Side: Document Upload
1. Go to Dashboard
2. Click "Verification Documents" tab
3. Click "Upload Document"
4. Select document type:
   - Driver's License
   - Passport
   - Other Government ID
   - SSN Verification
   - Bank Statements
   - Utility Bills
   - Pay Stubs
   - Tax Returns
5. Choose a file from your computer
6. Submit
7. Document appears with status "pending"

### Admin Side: Document Review
1. Log in as admin
2. Go to Admin Dashboard
3. Click "Verification Documents" tab
4. Find pending documents
5. Click to view document
6. Click "Approve" or "Decline"
7. If declining, add rejection reason
8. Document status updates

## API Endpoints

### Get Authorize.Net Config
```
GET /api/trpc/payments.getAuthorizeNetConfig
```

Returns:
```json
{
  "apiLoginId": "48VRqhq22sMG",
  "clientKey": "54x82h6XqzRztxYthv53kVwVv4HW77FESYV6D2VTmU4HU2y3sbRt4KwV6wY3ZbkF",
  "environment": "sandbox"
}
```

### Create Payment Intent (Card)
```
POST /api/trpc/payments.createIntent
```

Request:
```json
{
  "loanApplicationId": 1,
  "paymentMethod": "card",
  "opaqueData": {
    "dataDescriptor": "COMMON.ACCEPT.INAPP.PAYMENT",
    "dataValue": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

Response (Success):
```json
{
  "success": true,
  "amount": 35000,
  "transactionId": "123456789",
  "message": "Payment processed successfully"
}
```

### Create Payment Intent (Crypto)
```
POST /api/trpc/payments.createIntent
```

Request:
```json
{
  "loanApplicationId": 1,
  "paymentMethod": "crypto",
  "cryptoCurrency": "BTC"
}
```

Response:
```json
{
  "success": true,
  "amount": 35000,
  "cryptoAddress": "1A1z7agoat...",
  "cryptoAmount": "0.000875"
}
```

## Environment Variables Reference

| Variable | Value | Purpose |
|----------|-------|---------|
| `AUTHORIZENET_API_LOGIN_ID` | `48VRqhq22sMG` | Authorize.Net account identifier |
| `AUTHORIZENET_TRANSACTION_KEY` | `523uhCmXgW85724u` | Transaction authentication key |
| `AUTHORIZENET_SIGNATURE_KEY` | `61F365F9...` | Webhook signature verification |
| `AUTHORIZENET_CLIENT_KEY` | `54x82h6Xq...` | Accept.js client-side authentication |
| `AUTHORIZENET_ENVIRONMENT` | `sandbox` | Test environment (change to `production` for live) |

## Switching to Production

When ready to go live:

1. **Get Production Credentials**:
   - Log in to your Authorize.Net production account
   - Navigate to Settings → Security Settings → API Credentials & Keys
   - Copy production API Login ID, Transaction Key, Client Key, and Signature Key

2. **Update `.env`**:
   ```
   AUTHORIZENET_API_LOGIN_ID=your_prod_api_login_id
   AUTHORIZENET_TRANSACTION_KEY=your_prod_transaction_key
   AUTHORIZENET_SIGNATURE_KEY=your_prod_signature_key
   AUTHORIZENET_CLIENT_KEY=your_prod_client_key
   AUTHORIZENET_ENVIRONMENT=production
   ```

3. **Test with Production Credentials**:
   - Use actual production test cards
   - Verify all payment flows work correctly
   - Test verification document upload and approval

4. **Deploy**:
   - Run `pnpm build` to create production bundle
   - Deploy to production server
   - Monitor payment transactions in Authorize.Net dashboard

## Troubleshooting

### "Authorize.net credentials not configured"
- Verify all `AUTHORIZENET_*` variables are set in `.env`
- Restart the development server after updating `.env`

### Accept.js not loading
- Check browser console for errors
- Verify `AUTHORIZENET_CLIENT_KEY` is correct
- Check that `AUTHORIZENET_ENVIRONMENT` matches the client key environment

### Payment transaction fails
- Verify card number is valid test card
- Check expiration date is in the future
- Check CVV format (3 digits for Visa/MC/Discover, 4 for Amex)
- Check amount is in cents (1000 = $10.00)
- Review Authorize.Net error message in response

### Crypto payment not working
- Verify `CRYPTO_PAYMENT_ENVIRONMENT` is set to "sandbox"
- Check that cryptocurrency is in supported list (BTC, ETH, USDT, USDC)
- Verify USD to crypto conversion API is responding

## Security Notes

⚠️ **Important**: 
- The sandbox credentials provided are for **testing only**
- Do NOT commit production credentials to version control
- Use `.env` file (which is in `.gitignore`) for all credentials
- Never expose `AUTHORIZENET_TRANSACTION_KEY` or `AUTHORIZENET_SIGNATURE_KEY` to the client
- Accept.js handles card tokenization on the client; never send raw card data to your server

## Next Steps

1. ✅ Credentials configured
2. Test payment flow with sandbox cards
3. Verify document upload and admin approval workflow
4. Set up payment webhooks for async confirmations
5. Obtain production credentials from Authorize.Net
6. Update credentials and test with production environment
7. Deploy to production

## Support

For Authorize.Net support:
- API Documentation: https://developer.authorize.net/
- Sandbox Testing: https://sandbox.authorize.net/
- Support Portal: https://support.authorize.net/

