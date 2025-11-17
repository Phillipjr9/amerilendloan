# Payment Integration Configuration

This document describes the environment variables needed for payment processing via Authorize.Net and cryptocurrency.

## Authorize.Net Configuration

To enable credit/debit card payments via Authorize.Net:

### Required Environment Variables

```env
# Authorize.Net API Credentials
AUTHORIZENET_API_LOGIN_ID=your_api_login_id
AUTHORIZENET_TRANSACTION_KEY=your_transaction_key
AUTHORIZENET_CLIENT_KEY=your_public_client_key
AUTHORIZENET_ENVIRONMENT=sandbox  # or 'production'
```

### How to Get Authorize.Net Credentials

1. **Sign up for Authorize.Net**
   - Go to https://www.authorize.net/
   - Create a merchant account (or use sandbox for testing)

2. **Get API Login ID and Transaction Key**
   - Log in to Authorize.Net Merchant Interface
   - Navigate to Account → Settings → API Credentials & Keys
   - Generate a new Transaction Key
   - Copy your API Login ID and Transaction Key

3. **Get Public Client Key (for Accept.js)**
   - In Merchant Interface, go to Account → Settings → Manage Public Client Key
   - Generate a new Public Client Key
   - This key is safe to expose in frontend code

4. **Test Mode (Sandbox)**
   - Set `AUTHORIZENET_ENVIRONMENT=sandbox`
   - Use test credit card numbers from: https://developer.authorize.net/hello_world/testing_guide/

### Test Card Numbers (Sandbox)

```
Visa: 4007000000027
Mastercard: 5424000000000015
American Express: 370000000000002
Discover: 6011000000000012

Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (4 for Amex)
```

## Cryptocurrency Payment Configuration

To enable cryptocurrency payments (Bitcoin, Ethereum, USDT, USDC):

### Option 1: Coinbase Commerce (Recommended)

```env
# Coinbase Commerce API
COINBASE_COMMERCE_API_KEY=your_api_key
COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret
CRYPTO_PAYMENT_ENVIRONMENT=production  # or 'sandbox'
```

**Setup:**
1. Sign up at https://commerce.coinbase.com/
2. Get your API key from Settings → API Keys
3. Set up webhook endpoint for payment confirmations
4. Copy the webhook secret

### Option 2: Custom Crypto Gateway

The system currently uses mock exchange rates for demo purposes. To implement real crypto payments:

1. **Integrate with a price API** (e.g., CoinGecko, CoinMarketCap)
2. **Set up wallet addresses** for receiving payments
3. **Implement blockchain monitoring** for payment confirmations
4. **Configure webhook handlers** for payment status updates

## Current Payment Flow

### Card Payments (Authorize.Net)

1. User enters card details on frontend
2. Accept.js tokenizes card data (client-side)
3. Secure token sent to backend
4. Backend processes payment via Authorize.Net API
5. Transaction result returned immediately
6. Loan status updated to "fee_paid" on success

### Crypto Payments

1. User selects cryptocurrency (BTC, ETH, USDT, USDC)
2. System converts USD amount to crypto using exchange rate
3. Payment address generated
4. User sends crypto to provided address
5. System monitors blockchain for confirmation
6. Loan status updated after required confirmations

## Security Best Practices

1. **Never commit credentials to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables or secrets management

2. **Use HTTPS in production**
   - Required for PCI compliance
   - Protects sensitive payment data

3. **Validate all inputs**
   - Server-side validation of amounts
   - Verify loan ownership before payment

4. **Log transactions**
   - Keep audit trail of all payment attempts
   - Store transaction IDs for reconciliation

5. **Handle webhooks securely**
   - Verify webhook signatures
   - Use HTTPS endpoints only
   - Implement idempotency

## Testing Payment Integration

### Test Card Payment Flow

```bash
# 1. Set environment variables
export AUTHORIZENET_API_LOGIN_ID=your_test_login_id
export AUTHORIZENET_TRANSACTION_KEY=your_test_key
export AUTHORIZENET_CLIENT_KEY=your_test_client_key
export AUTHORIZENET_ENVIRONMENT=sandbox

# 2. Start the application
npm run dev

# 3. Create and approve a loan application
# 4. Navigate to payment page
# 5. Use test card: 4007000000027, exp: 12/25, cvv: 123
```

### Test Crypto Payment Flow

```bash
# 1. System generates payment address
# 2. User copies address and amount
# 3. In demo mode, click "I've Sent the Payment" to simulate
# 4. In production, webhook confirms actual blockchain transaction
```

## Production Checklist

- [ ] Obtain production Authorize.Net account
- [ ] Configure production API credentials
- [ ] Set up SSL certificate (HTTPS)
- [ ] Enable webhook endpoints
- [ ] Configure proper error handling
- [ ] Set up payment monitoring/alerts
- [ ] Test with real small amounts
- [ ] Implement refund functionality
- [ ] Set up customer support for payment issues
- [ ] Configure automated reconciliation
- [ ] Enable fraud detection rules in Authorize.Net dashboard

## Troubleshooting

### "Payment system not ready" error
- Check that Accept.js script loaded (check browser console)
- Verify `AUTHORIZENET_CLIENT_KEY` is set correctly
- Ensure environment is set to 'sandbox' or 'production'

### "Transaction failed" error
- Verify API Login ID and Transaction Key are correct
- Check Authorize.Net account is active
- Review transaction details in Authorize.Net dashboard
- Ensure card number and details are valid

### Crypto payment address not generating
- Check `COINBASE_COMMERCE_API_KEY` is set
- Verify API key has required permissions
- Review server logs for API errors
- Check cryptocurrency is supported

## Support Resources

- **Authorize.Net Documentation**: https://developer.authorize.net/
- **Authorize.Net Support**: https://support.authorize.net/
- **Coinbase Commerce Docs**: https://commerce.coinbase.com/docs/
- **Test Cards**: https://developer.authorize.net/hello_world/testing_guide/
