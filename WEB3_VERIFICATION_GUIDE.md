# Web3 Cryptocurrency Payment Verification Implementation

## Overview

Real-time blockchain verification system for cryptocurrency payments using ethers.js and blockchain APIs. This enables direct verification of BTC, ETH, USDT, and USDC transactions without relying on manual confirmation.

## Features Implemented

### 1. **Web3 Verification Module** (`server/_core/web3-verification.ts`)

#### Supported Cryptocurrencies
- **Ethereum (ETH)** - ERC-20 compatible, 12 confirmations required
- **Bitcoin (BTC)** - Native Bitcoin transactions, 3 confirmations required
- **USDT** - ERC-20 stablecoin on Ethereum
- **USDC** - ERC-20 stablecoin on Ethereum

#### Core Functions

**`verifyEthereumTransaction(txHash, expectedToAddress, expectedAmount)`**
- Validates Ethereum transaction hash format (0x + 64 hex chars)
- Checks transaction receipt and status
- Verifies recipient address matches
- Calculates confirmation count
- Returns detailed transaction info including gas used

**`verifyBitcoinTransaction(txHash, expectedToAddress, expectedAmount)`**
- Validates Bitcoin transaction hash format (64 hex chars)
- Uses Blockchair or similar API for verification
- Checks transaction confirmations
- Verifies payment to expected address

**`verifyERC20Transfer(txHash, expectedToAddress, expectedAmount, tokenAddress)`**
- Verifies USDT/USDC token transfers
- Checks transaction logs for transfer events
- Validates recipient and amount
- Uses ERC-20 Transfer event signature parsing

**`verifyCryptoTransactionWeb3(currency, txHash, expectedToAddress, expectedAmount)`**
- Main entry point for all crypto verification
- Routes to appropriate verification function based on currency
- Returns structured verification result

**`getNetworkStatus(currency)`**
- Checks blockchain network availability
- Returns current block number
- Provides gas price for Ethereum
- Validates RPC connectivity

### 2. **Crypto Payment Module Updates** (`server/_core/crypto-payment.ts`)

Enhanced with Web3 verification:
- `verifyCryptoPaymentByTxHash()` - Now uses Web3 verification
- `checkNetworkStatus()` - Checks blockchain network status
- Direct blockchain querying instead of mock data

### 3. **API Endpoints** (New tRPC procedures in `server/routers.ts`)

**`payments.verifyWeb3Transaction`** (Mutation)
```typescript
input: { paymentId: number, txHash: string }
returns: {
  success: boolean
  verified: boolean
  confirmed: boolean
  confirmations: number
  blockNumber?: number
  gasUsed?: string
  status?: "success" | "failed" | "pending"
  message: string
}
```
- Verifies transaction on blockchain
- Updates payment status in database
- Updates loan application status when confirmed
- Admin-accessible verification

**`payments.getNetworkStatus`** (Query)
```typescript
input: { currency: "BTC" | "ETH" }
returns: {
  online: boolean
  currentBlock: number
  gasPrice?: string
  message: string
}
```
- Public endpoint to check network status
- Useful for displaying network information to users

### 4. **Client-Side Hook** (`client/src/hooks/useWeb3Verification.ts`)

**`useWeb3Verification()` Hook**
- State management for verification process
- `verifyTransaction()` - Initiates blockchain verification
- `reset()` - Clears verification state
- Error handling and toast notifications

**Utility Functions**
- `getExplorerUrl()` - Links to blockchain explorer
- `formatTxHash()` - Formats hash for display
- `validateTxHash()` - Client-side hash format validation
- `getRequiredConfirmations()` - Returns required confirmation count

### 5. **Database Schema Updates**

Added to `payments` table:
- `adminNotes` - For admin review notes during verification
- Can store verification metadata

## Environment Configuration

Add these to `.env`:

```env
# Ethereum RPC (Alchemy or Infura)
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
ALCHEMY_API_KEY=your_alchemy_api_key

# Bitcoin RPC (optional, for Bitcoin verification)
BITCOIN_RPC_URL=https://blockbook.horizontalsystems.io/api

# Polygon RPC (for Polygon/MATIC if needed)
POLYGON_RPC_URL=https://polygon-rpc.com
```

## Workflow

### User Payment Flow

1. User initiates crypto payment
2. System generates wallet address
3. User sends crypto to address
4. User provides transaction hash
5. System verifies via Web3:
   - Hash format validation
   - Blockchain lookup
   - Recipient verification
   - Confirmation count check
6. If confirmed → Payment marked as succeeded → Loan fee marked as paid
7. If pending → User can wait or re-verify

### Verification Results

**Immediate Confirmation States:**
- ✅ **Confirmed** - Transaction has required confirmations
  - Payment marked as succeeded
  - Loan fee paid
  - Ready for disbursement

- ⏳ **Pending** - Transaction found but awaiting confirmations
  - Shows current confirmation count
  - Suggests waiting time

- ❌ **Failed/Invalid**
  - Invalid hash format
  - Transaction not found
  - Wrong recipient address
  - Transaction failed on-chain

## Confirmation Requirements

| Currency | Confirmations Required | Time Estimate |
|----------|----------------------|-----------------|
| BTC      | 3                     | ~30 minutes     |
| ETH      | 12                    | ~3 minutes      |
| USDT     | 12                    | ~3 minutes      |
| USDC     | 12                    | ~3 minutes      |

## Security Features

✅ **Hash Format Validation** - Prevents invalid hash submissions
✅ **Recipient Verification** - Ensures payment to correct wallet
✅ **On-Chain Status Check** - Verifies actual blockchain state
✅ **Confirmation Requirements** - Prevents double-spending risk
✅ **Permission Checks** - Only payment owner or admin can verify
✅ **Atomic Updates** - Payment and loan status updated together

## Production Readiness

### Required Before Production

1. **Configure RPC Providers**
   - Set up Alchemy, Infura, or Quicknode accounts
   - Add API keys to `.env`
   - Test RPC connectivity

2. **Bitcoin Verification**
   - Integrate with Bitcoin API (Blockchair, BlockBook, or Mempool.space)
   - Configure API authentication
   - Test Bitcoin transaction verification

3. **Gas Price Monitoring**
   - Consider high gas prices for ETH verification
   - Add retry logic for failed verifications
   - Implement gas price estimation for users

4. **Webhook Handling** (Optional)
   - Set up blockchain event webhooks
   - Automatic verification on transaction confirmation
   - Webhook signature validation

5. **Rate Limiting**
   - Implement rate limits on verification endpoints
   - Prevent spam verification attempts
   - Cache verification results

6. **Monitoring & Alerts**
   - Monitor RPC provider uptime
   - Alert on network issues
   - Track verification success rates

## Testing

### Local Testing

Test with transaction hashes from:
- **Ethereum Testnet**: https://sepolia.etherscan.io
- **Bitcoin Testnet**: https://testnet.blockchain.com
- Use test transaction hashes for verification

### Example Test Cases

```typescript
// Test Ethereum verification
await verifyEthereumTransaction(
  "0x123...abc", // valid hash format
  "0x742d35Cc6634C0532925a3b844Bc9e7595f5bEb9", // recipient
  "1.5" // amount in ETH
);

// Test Bitcoin verification
await verifyBitcoinTransaction(
  "abc123...", // 64 char hash
  "bc1qar0srrr7x...", // bech32 address
  "0.05" // amount in BTC
);
```

## Troubleshooting

### "RPC not configured"
- Check `.env` file has valid RPC URLs
- Verify API keys if using Alchemy/Infura
- Test RPC provider connectivity

### "Transaction not found"
- Verify hash is correct format
- Confirm network (mainnet vs testnet)
- Check transaction hasn't been replaced

### "Wrong recipient address"
- Verify payment address matches wallet config
- Check address format (0x for ETH, bc1q for BTC)
- Ensure no typos in wallet address

### High Gas Costs
- Consider batching verifications
- Use Layer 2 networks (Polygon)
- Implement off-chain verification cache

## Future Enhancements

- [ ] Multi-signature wallet support
- [ ] Batch transaction verification
- [ ] Lightning Network support for Bitcoin
- [ ] Real-time blockchain event webhooks
- [ ] Gas optimization for ETH verifications
- [ ] Cross-chain verification via bridges
- [ ] Stablecoin swap verification
- [ ] DeFi protocol payment verification

## API Documentation

See `API_DOCUMENTATION.md` for complete endpoint specifications including:
- Request/response schemas
- Error handling
- Rate limiting
- Authorization requirements

## Support

For issues or questions about Web3 verification:
1. Check RPC provider logs
2. Verify network connectivity
3. Test with known good transaction hashes
4. Review blockchain explorer for transaction details
