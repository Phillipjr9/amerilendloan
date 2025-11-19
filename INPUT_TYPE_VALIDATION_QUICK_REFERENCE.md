# Input Type Validation - Quick Reference

## What It Does
Validates data types and values for loan calculation inputs (`amount`, `term`, `interest_rate`) before processing, returning detailed error messages when validation fails.

## API Endpoints

### Calculate Payment
```
GET /api/trpc/loanCalculator.calculatePayment?input={...}

Input:
  amount: number (cents) - min: 1000, max: 10000000
  term: number (months) - min: 3, max: 84
  interestRate: number (%) - min: 0.1, max: 35.99
```

### Validate Inputs
```
GET /api/trpc/loanCalculator.validateInputs?input={...}

Input:
  amount: unknown
  term: unknown
  interestRate: unknown
```

## Validation Rules

| Field | Type | Min | Max | Rules |
|-------|------|-----|-----|-------|
| amount | number | 1000¢ | 10M¢ | Must be integer, finite |
| term | number | 3 mo | 84 mo | Must be integer, finite |
| interestRate | number | 0.1% | 35.99% | Must be finite (decimals OK) |

## Success Response

```json
{
  "success": true,
  "data": {
    "amountCents": 100000,
    "monthlyPaymentCents": 8571,
    "totalPaymentCents": 102852,
    "totalInterestCents": 2852,
    "totalInterestDollars": 28.52
  }
}
```

## Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Invalid amount: must be a finite integer in cents",
    "details": {
      "field": "amount",
      "received": "not-a-number",
      "expectedType": "number (integer, in cents)",
      "constraints": ["Must be between 1000 and 10000000", "Must be an integer"]
    }
  }
}
```

## Error Codes

| Code | Status | Cause |
|------|--------|-------|
| INVALID_AMOUNT | 400 | Amount failed validation |
| INVALID_TERM | 400 | Term failed validation |
| INVALID_INTEREST_RATE | 400 | Interest rate failed validation |
| VALIDATION_ERROR | 400 | Multiple fields failed |
| INVALID_INPUT_TYPE | 400 | Not an object or wrong structure |

## Common Validation Failures

### Amount Errors

```javascript
// ✗ String instead of number
amount: "100000"
// Error: Amount is not a number

// ✗ Decimal instead of integer
amount: 100000.50
// Error: Must be an integer

// ✗ Out of range
amount: 500
// Error: Must be at least 1000 cents ($10.00)

// ✗ Infinity
amount: Infinity
// Error: Must be finite
```

### Term Errors

```javascript
// ✗ Decimal instead of integer
term: 12.5
// Error: Must be an integer

// ✗ Out of range
term: 150
// Error: Must not exceed 84 months

// ✗ Too small
term: 2
// Error: Must be at least 3 months
```

### Interest Rate Errors

```javascript
// ✗ String instead of number
interestRate: "5.5"
// Error: Interest rate is not a number

// ✗ Out of range
interestRate: 50
// Error: Must not exceed 35.99%

// ✗ Infinity/NaN
interestRate: NaN
// Error: Must be finite
```

## Usage Examples

### JavaScript/TypeScript
```javascript
// Using tRPC client
const result = await trpc.loanCalculator.calculatePayment.query({
  amount: 100000,      // $1000.00
  term: 12,            // 12 months
  interestRate: 5.5    // 5.5% APR
});

if (result.success) {
  console.log(`Monthly: $${result.data.monthlyPaymentDollars}`);
  console.log(`Total: $${result.data.totalPaymentDollars}`);
} else {
  console.error(`Error: ${result.error.message}`);
  console.error(`Details:`, result.error.details);
}
```

### cURL
```bash
# Calculate payment
curl "http://localhost:3000/api/trpc/loanCalculator.calculatePayment" \
  -G \
  --data-urlencode 'input={"amount":100000,"term":12,"interestRate":5.5}'

# Validate inputs
curl "http://localhost:3000/api/trpc/loanCalculator.validateInputs" \
  -G \
  --data-urlencode 'input={"amount":"bad","term":12,"interestRate":5.5}'
```

### Python
```python
import requests
import json

# Prepare input
payload = {
    "amount": 100000,
    "term": 12,
    "interestRate": 5.5
}

# Make request
response = requests.get(
    "http://localhost:3000/api/trpc/loanCalculator.calculatePayment",
    params={"input": json.dumps(payload)}
)

# Handle response
if response.json()["success"]:
    data = response.json()["data"]
    print(f"Monthly Payment: ${data['monthlyPaymentDollars']}")
else:
    error = response.json()["error"]
    print(f"Error: {error['message']}")
```

## Validation Sequence

```
1. Type Check
   ✓ Is amount a number?
   ✓ Is term a number?
   ✓ Is interestRate a number?

2. Finite Check (not Infinity, not NaN)
   ✓ amount is finite?
   ✓ term is finite?
   ✓ interestRate is finite?

3. Integer Check (for amount and term)
   ✓ amount has no decimal places?
   ✓ term has no decimal places?

4. Range Check
   ✓ 1000 ≤ amount ≤ 10000000?
   ✓ 3 ≤ term ≤ 84?
   ✓ 0.1 ≤ interestRate ≤ 35.99?

5. Success/Error
   → All pass → Calculate and return results
   → Any fail → Return detailed error
```

## Field Details

### Amount (Cents)
```
Examples:
  1000 = $10.00
  50000 = $500.00
  100000 = $1,000.00
  10000000 = $100,000.00

Constraints:
  • Must be whole number (no decimals)
  • Between $10 and $100,000
  • Stored as cents to avoid floating-point errors
```

### Term (Months)
```
Examples:
  3 = 3 months (0.25 years)
  12 = 12 months (1 year)
  36 = 36 months (3 years)
  84 = 84 months (7 years)

Constraints:
  • Must be whole number (no decimals)
  • Between 3 and 84 months
  • Represents number of monthly payments
```

### Interest Rate (Annual %)
```
Examples:
  0.1 = 0.1% per year
  5.5 = 5.5% per year
  10 = 10% per year
  35.99 = 35.99% per year (maximum)

Constraints:
  • Can be decimal (e.g., 5.5)
  • Between 0.1% and 35.99%
  • Represents annual percentage rate (APR)
```

## Response Fields

### Success Data
```json
{
  "amountCents": 100000,              // Input amount in cents
  "amountDollars": 1000,              // Amount in dollars
  "termMonths": 12,                   // Input term
  "interestRatePercent": 5.5,         // Input rate
  "monthlyPaymentCents": 8571,        // Monthly payment in cents
  "monthlyPaymentDollars": 85.71,     // Monthly payment in dollars
  "totalPaymentCents": 102852,        // Total of all payments
  "totalPaymentDollars": 1028.52,     // Total in dollars
  "totalInterestCents": 2852,         // Total interest in cents
  "totalInterestDollars": 28.52,      // Total interest in dollars
  "monthlyRatePercent": 0.458         // Monthly rate (APR/12)
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "amount is not a number" | Send a numeric value, not a string |
| "Must be an integer" | Remove decimal places (12 not 12.5) |
| "Must be between 1000 and 10000000" | Amount in cents, $10-$100k range |
| "Must be between 3 and 84" | Term between 3-84 months |
| "Must be between 0.1 and 35.99" | Interest rate 0.1%-35.99% |
| "Field is required" | Include amount, term, interestRate |

## File Locations

- **Implementation:** `server/_core/input-type-validator.ts`
- **Endpoints:** `server/routers.ts` (loanCalculator router)
- **Full Guide:** `INPUT_TYPE_VALIDATION_GUIDE.md`

## Related Docs
- See `INPUT_TYPE_VALIDATION_GUIDE.md` for detailed documentation
- See `EMPTY_PAYLOAD_VALIDATION.md` for payload validation
- See `API_DOCUMENTATION.md` for full API reference
