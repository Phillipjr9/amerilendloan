# AmeriLend - Application Flow Diagrams

This document provides comprehensive flow diagrams for the main application processes: document verification, payment processing, and loan application workflow.

---

## 1. Document Verification Flow

### Overview
Users upload identity and financial verification documents through the web interface. Documents are stored externally (or as base64 fallback) and tracked in the database for admin review.

### Actors
- **User**: Individual applying for or managing loan applications
- **System**: Express server with Drizzle ORM and external storage
- **Admin**: Loan officer reviewing and approving documents
- **Storage**: External storage service (Forge API) or local base64 fallback

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOCUMENT VERIFICATION FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: USER INITIATES UPLOAD
┌──────────────────────────────────────────┐
│ Client: VerificationUpload.tsx            │
│ - Select document type (dropdown)         │
│ - Select file (JPEG/PNG/PDF, max 10MB)   │
│ - Display preview (for images)           │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 2: CLIENT SENDS TO SERVER
┌──────────────────────────────────────────┐
│ POST /api/upload-document                │
│ Headers:                                  │
│ - Authorization: Bearer {sessionToken}   │
│ - Content-Type: multipart/form-data      │
│ Body: { file }                           │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 3: SERVER AUTHENTICATES & VALIDATES
┌──────────────────────────────────────────┐
│ server/_core/index.ts:155                │
│ - Authenticate user from JWT in cookies  │
│ - Validate file exists                   │
│ - Check MIME type (jpeg, png, pdf)       │
│ - Validate file size                     │
└──────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
    CONFIGURED             FALLBACK
    STORAGE?               (No Forge)
        │                       │
        ├─────────┬─────────┐   │
        │         │         │   │
        ▼         ▼         ▼   ▼
    USE      EXTERNAL   BASE64  BASE64
    FORGE    STORAGE    FALLBACK (PRIMARY)
    (via     ERROR      (as     (no config)
    Forge    fallback)  backup)


STEP 4A: STORE IN EXTERNAL STORAGE (Forge API)
┌──────────────────────────────────────────┐
│ storagePut(key, buffer, mimetype)        │
│ - Key: verification-documents/{userId}   │
│        /{timestamp}-{fileName}           │
│ - Upload file buffer to storage          │
│ - Receive: Storage URL                   │
└──────────────────────────────────────────┘
                    │
                    ▼
        ✓ Success: Use storage URL
        ✗ Error: Fall back to Base64


STEP 4B: FALLBACK TO BASE64 (if storage fails)
┌──────────────────────────────────────────┐
│ Buffer → Base64 Data URL                 │
│ Format: data:{mimeType};base64,{encoded} │
│ Example: data:image/jpeg;base64,/9j/... │
└──────────────────────────────────────────┘


STEP 5: SERVER RESPONDS TO CLIENT
┌──────────────────────────────────────────┐
│ HTTP 200 OK                              │
│ {                                        │
│   success: true,                         │
│   url: "{storage_url OR base64_url}",   │
│   fileName: "license_front.jpg",         │
│   fileSize: 245000,                      │
│   mimeType: "image/jpeg"                 │
│ }                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 6: CLIENT REGISTERS DOCUMENT IN DB
┌──────────────────────────────────────────┐
│ trpc.verification.uploadDocument()       │
│ - documentType: enum value               │
│ - filePath: URL from Step 5              │
│ - fileName, fileSize, mimeType from      │
│   server response                        │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 7: SERVER CREATES DOCUMENT RECORD
┌──────────────────────────────────────────┐
│ server/routers.ts:2476                   │
│ db.createVerificationDocument({          │
│   userId: ctx.user.id,                   │
│   documentType,                          │
│   fileName,                              │
│   filePath: URL,                         │
│   fileSize,                              │
│   mimeType,                              │
│   loanApplicationId: (optional),         │
│   status: "pending"                      │
│ })                                       │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 8: DATABASE STORES RECORD
┌──────────────────────────────────────────┐
│ drizzle/schema.ts:307                    │
│ verificationDocuments table:             │
│ - id: auto-increment                     │
│ - userId, loanApplicationId              │
│ - documentType, fileName, filePath       │
│ - fileSize, mimeType                     │
│ - status: "pending"                      │
│ - reviewedBy, reviewedAt: NULL           │
│ - createdAt: NOW(), updatedAt: NOW()     │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 9: SEND ADMIN NOTIFICATION (background)
┌──────────────────────────────────────────┐
│ sendAdminDocumentUploadNotification()    │
│ - Email to admin                         │
│ - User: {name}, Email: {email}           │
│ - Document: {type}, {fileName}           │
│ - Timestamp: {createdAt}                 │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 10: DOCUMENT VISIBLE TO USER & ADMIN
┌──────────────────────────────────────────┐
│ User Dashboard:                          │
│ - View in Profile → Documents            │
│ - Status: "pending" (yellow)             │
│ - Preview button                         │
│ - Delete option (if allowed)             │
│                                          │
│ Admin Dashboard:                         │
│ - Document appears in review queue       │
│ - Can view, approve, or reject           │
└──────────────────────────────────────────┘


ADMIN REVIEW FLOW:

STEP 11A: ADMIN APPROVES DOCUMENT
┌──────────────────────────────────────────┐
│ admin click "Approve" in AdminDashboard  │
│ trpc.verification.adminApprove({         │
│   id: docId,                             │
│   adminNotes: (optional)                 │
│ })                                       │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ db.updateVerificationDocumentStatus(     │
│   id,                                    │
│   "approved",                            │
│   ctx.user.id, // admin user ID          │
│   { adminNotes }                         │
│ )                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Update in DB:                            │
│ - status: "approved"                     │
│ - reviewedBy: {adminId}                  │
│ - reviewedAt: NOW()                      │
│ - adminNotes: (if provided)              │
│ - updatedAt: NOW()                       │
└──────────────────────────────────────────┘


STEP 11B: ADMIN REJECTS DOCUMENT
┌──────────────────────────────────────────┐
│ admin click "Reject" in AdminDashboard   │
│ trpc.verification.adminReject({          │
│   id: docId,                             │
│   rejectionReason: "Expired ID",         │
│   adminNotes: (optional)                 │
│ })                                       │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ db.updateVerificationDocumentStatus(     │
│   id,                                    │
│   "rejected",                            │
│   ctx.user.id,                           │
│   { rejectionReason, adminNotes }        │
│ )                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Update in DB:                            │
│ - status: "rejected"                     │
│ - reviewedBy: {adminId}                  │
│ - reviewedAt: NOW()                      │
│ - rejectionReason: {reason}              │
│ - adminNotes: (if provided)              │
│ - updatedAt: NOW()                       │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ User sees "Rejected" badge (red)         │
│ Can upload new document or retry         │
└──────────────────────────────────────────┘


DATA PERSISTENCE:

Storage Strategy:
┌─────────────────────────────────────────┐
│ ENVIRONMENT                    BEHAVIOR │
├─────────────────────────────────────────┤
│ Forge API + Key Configured   EXTERNAL   │
│ (production)                 STORAGE    │
├─────────────────────────────────────────┤
│ Forge API NOT Configured     BASE64     │
│ (development)                DATA URL   │
└─────────────────────────────────────────┘

Database Schema (verificationDocuments table):
┌──────────────────────────────┐
│ Column         │ Type        │
├──────────────────────────────┤
│ id             │ SERIAL PK   │
│ userId         │ INTEGER     │
│ documentType   │ ENUM        │
│ fileName       │ VARCHAR     │
│ filePath       │ TEXT        │  ← Stores URL or base64
│ fileSize       │ INTEGER     │
│ mimeType       │ VARCHAR     │
│ status         │ ENUM        │  ← pending/approved/rejected
│ reviewedBy     │ INTEGER     │  ← admin user id
│ reviewedAt     │ TIMESTAMP   │
│ rejectionReason│ TEXT        │
│ adminNotes     │ TEXT        │
│ createdAt      │ TIMESTAMP   │
│ updatedAt      │ TIMESTAMP   │
└──────────────────────────────┘
```

### Key Implementation Details

**File Size Validation**
- Client: Max 10MB
- Server: Checks via `req.file.size`

**Allowed MIME Types**
- Client: `image/jpeg`, `image/png`, `application/pdf`
- Server: Same validation

**Document Types (Enum)**
- `drivers_license_front` / `drivers_license_back`
- `passport`
- `national_id_front` / `national_id_back`
- `ssn_card`
- `bank_statement`
- `utility_bill`
- `pay_stub`
- `tax_return`
- `other`

**Status Transitions**
```
pending → approved
       → rejected → (user can re-upload)
       → (expires if expiryDate passed)
```

---

## 2. Payment Processing Flow

### Overview
After loan approval, users must pay a processing fee using either card (Authorize.Net) or cryptocurrency. The payment status determines when the loan can be disbursed.

### Actors
- **User**: Loan applicant paying processing fee
- **System**: tRPC router handling payment logic
- **Database**: Drizzle ORM with payment records
- **Payment Provider**: Authorize.Net (card) or Crypto gateway
- **Loan Service**: Updates loan application status

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PAYMENT PROCESSING FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

PREREQUISITE CONDITIONS:
┌──────────────────────────────────────────┐
│ Loan Application Status: "approved"      │
│ - processingFeeAmount calculated         │
│ - User authenticated                     │
│ - User owns the application              │
└──────────────────────────────────────────┘


STEP 1: USER INITIATES PAYMENT
┌──────────────────────────────────────────┐
│ Client: PaymentPage.tsx                  │
│ - Click "Pay Processing Fee" button      │
│ - Choose payment method:                 │
│   • Card (Authorize.Net)                 │
│   • Crypto (BTC, ETH, USDT, USDC)        │
└──────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
    CARD PAYMENT         CRYPTO PAYMENT
    (Authorize.Net)      (Blockchain)


═══════════════════════════════════════════════════════════════════════
CARD PAYMENT PATH (Authorize.Net)
═══════════════════════════════════════════════════════════════════════

STEP 2A: CREATE PAYMENT INTENT (CARD)
┌──────────────────────────────────────────┐
│ trpc.payments.createIntent({             │
│   loanApplicationId,                     │
│   paymentMethod: "card",                 │
│   opaqueData: {                          │
│     dataDescriptor: "...",               │
│     dataValue: "..."                     │
│   },                                     │
│   idempotencyKey: UUID (optional)        │
│ })                                       │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 3A: SERVER VALIDATES PAYMENT REQUEST
┌──────────────────────────────────────────┐
│ server/routers.ts:1840                   │
│ Checks:                                  │
│ - Error simulation (if configured)       │
│ - Idempotency key cached (if provided)   │
│ - Application exists & belongs to user   │
│ - Loan status is "approved"              │
│ - processingFeeAmount exists             │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 4A: CREATE PAYMENT RECORD
┌──────────────────────────────────────────┐
│ db.createPayment({                       │
│   loanApplicationId,                     │
│   userId: ctx.user.id,                   │
│   amount: processingFeeAmount,           │
│   currency: "USD",                       │
│   paymentProvider: "authorizenet",       │
│   paymentMethod: "card",                 │
│   status: "pending"                      │
│ })                                       │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 5A: SUBMIT TO AUTHORIZE.NET
┌──────────────────────────────────────────┐
│ createAuthorizeNetTransaction(           │
│   amount: 15000, // $150.00              │
│   opaqueData: { dataDescriptor, etc },   │
│   description: "Loan fee #{trackNum}"    │
│ )                                        │
│ - Uses AUTHORIZENET_API_LOGIN_ID         │
│ - Uses AUTHORIZENET_TRANSACTION_KEY      │
│ - AUTHORIZENET_ENVIRONMENT (prod/test)   │
│ - AUTHORIZENET_CLIENT_KEY                │
└──────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
    SUCCESS                  FAILURE
    (Approved)               (Declined)


STEP 6A-SUCCESS: CARD APPROVED
┌──────────────────────────────────────────┐
│ Result from Authorize.Net:               │
│ {                                        │
│   success: true,                         │
│   transactionId: "123456789",            │
│   cardLast4: "4242",                     │
│   cardBrand: "Visa"                      │
│ }                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Update Payment Record:                   │
│ db.updatePaymentStatus(payment.id,      │
│   "succeeded",                           │
│   {                                      │
│     paymentIntentId: transactionId,      │
│     cardLast4: "4242",                   │
│     cardBrand: "Visa",                   │
│     completedAt: NOW()                   │
│   }                                      │
│ )                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Update Loan Application Status:          │
│ db.updateLoanApplicationStatus(          │
│   loanApplicationId,                     │
│   "fee_paid"                             │
│ )                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Cache Result (if idempotencyKey):        │
│ db.storeIdempotencyResult(               │
│   idempotencyKey,                        │
│   payment.id,                            │
│   { success, amount, transactionId },    │
│   "success"                              │
│ )                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Return to Client:                        │
│ {                                        │
│   success: true,                         │
│   paymentId: 456,                        │
│   amount: 15000,                         │
│   transactionId: "123456789",            │
│   message: "Payment processed success"   │
│ }                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Client Updates UI:                       │
│ - Display success message                │
│ - Show "Payment Complete" screen         │
│ - Display:                               │
│   • Loan Amount                          │
│   • Processing Fee (paid)                │
│   • Next steps (disbursement timeline)   │
└──────────────────────────────────────────┘


STEP 6A-FAILURE: CARD DECLINED
┌──────────────────────────────────────────┐
│ Result from Authorize.Net:               │
│ {                                        │
│   success: false,                        │
│   error: "Card Declined - Insufficient   │
│           funds"                         │
│ }                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Update Payment Record:                   │
│ db.updatePaymentStatus(payment.id,      │
│   "failed",                              │
│   {                                      │
│     failureReason: error message         │
│   }                                      │
│ )                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Keep Loan in "fee_pending" Status:       │
│ db.updateLoanApplicationStatus(          │
│   loanApplicationId,                     │
│   "fee_pending"                          │
│ ) // User can retry                      │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Return Error to Client:                  │
│ TRPCError {                              │
│   code: "BAD_REQUEST",                   │
│   message: error message,                │
│   cause: "PAYMENT_DECLINED"              │
│ }                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Client UI Shows Error:                   │
│ - Toast: "Card Declined - Retry"         │
│ - User can try different card            │
│ - Return to payment screen               │
└──────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
CRYPTO PAYMENT PATH
═══════════════════════════════════════════════════════════════════════

STEP 2B: CREATE PAYMENT INTENT (CRYPTO)
┌──────────────────────────────────────────┐
│ trpc.payments.createIntent({             │
│   loanApplicationId,                     │
│   paymentMethod: "crypto",               │
│   cryptoCurrency: "BTC" | "ETH" |        │
│                   "USDT" | "USDC",       │
│   idempotencyKey: UUID (optional)        │
│ })                                       │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 3B: SERVER VALIDATES PAYMENT REQUEST
┌──────────────────────────────────────────┐
│ Same as card: application ownership,     │
│ status, fee amount checks                │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 4B: CREATE CRYPTO CHARGE
┌──────────────────────────────────────────┐
│ createCryptoCharge(                      │
│   amount: processingFeeAmount,           │
│   currency: "BTC" | "ETH" | etc.,        │
│   description: "Loan fee #{trackNum}",   │
│   metadata: {                            │
│     loanApplicationId,                   │
│     userId                               │
│   }                                      │
│ )                                        │
│ - Mocked in development                  │
│ - Future: Coinbase Commerce or Forge     │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Crypto Charge Result:                    │
│ {                                        │
│   success: true,                         │
│   chargeId: "charge_123",                │
│   paymentAddress: "0xabc...",            │
│   cryptoAmount: "0.0045", // BTC         │
│   expiresAt: timestamp + 1 hour          │
│ }                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 5B: STORE CRYPTO PAYMENT RECORD
┌──────────────────────────────────────────┐
│ db.createPayment({                       │
│   loanApplicationId,                     │
│   userId: ctx.user.id,                   │
│   amount: amountInUSD,                   │
│   paymentProvider: "crypto",             │
│   paymentMethod: "crypto",               │
│   cryptoCurrency: "BTC",                 │
│   cryptoAddress: paymentAddress,         │
│   cryptoAmount: "0.0045",                │
│   paymentIntentId: chargeId,             │
│   status: "pending"                      │
│ })                                       │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 6B: UPDATE LOAN STATUS TO "fee_pending"
┌──────────────────────────────────────────┐
│ db.updateLoanApplicationStatus(          │
│   loanApplicationId,                     │
│   "fee_pending"                          │
│ )                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 7B: CACHE RESULT (if idempotency key)
┌──────────────────────────────────────────┐
│ db.storeIdempotencyResult(               │
│   idempotencyKey,                        │
│   payment.id,                            │
│   { success, cryptoAddress, etc },       │
│   "success"                              │
│ )                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 8B: RETURN PAYMENT ADDRESS TO USER
┌──────────────────────────────────────────┐
│ {                                        │
│   success: true,                         │
│   paymentId: 789,                        │
│   amount: 15000, // USD cents             │
│   cryptoAddress: "0xabc...",             │
│   cryptoAmount: "0.0045"                 │
│ }                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 9B: USER SENDS CRYPTO TO ADDRESS
┌──────────────────────────────────────────┐
│ User's wallet:                           │
│ - Copy payment address                   │
│ - Send 0.0045 BTC to address             │
│ - Wait for blockchain confirmation       │
│ - (Charge expires in 1 hour)             │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 10B: USER VERIFIES PAYMENT
┌──────────────────────────────────────────┐
│ trpc.payments.verifyCryptoPayment({      │
│   paymentId: 789,                        │
│   txHash: "0x123def456..."               │
│ })                                       │
└──────────────────────────────────────────┘
                    │
                    ▼
STEP 11B: SERVER VERIFIES TRANSACTION
┌──────────────────────────────────────────┐
│ verifyCryptoPaymentByTxHash(             │
│   currency: "BTC",                       │
│   txHash,                                │
│   expectedAmount,                        │
│   expectedAddress                        │
│ )                                        │
│ - Check blockchain                       │
│ - Verify amount & address match          │
│ - Verify confirmation count              │
└──────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
    VERIFIED                NOT VERIFIED
    (Match)                 (Mismatch)


STEP 12B-VERIFIED: UPDATE PAYMENT
┌──────────────────────────────────────────┐
│ db.updatePaymentStatus(payment.id,      │
│   "succeeded",                           │
│   {                                      │
│     cryptoTxHash: txHash,                │
│     completedAt: NOW()                   │
│   }                                      │
│ )                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Update Loan Status:                      │
│ db.updateLoanApplicationStatus(          │
│   loanApplicationId,                     │
│   "fee_paid"                             │
│ )                                        │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Return Success to Client                 │
│ - Payment verified                       │
│ - Loan ready for disbursement            │
└──────────────────────────────────────────┘


STEP 12B-NOT-VERIFIED: PAYMENT FAILED
┌──────────────────────────────────────────┐
│ Error: Transaction hash doesn't match    │
│ - Amount mismatch                        │
│ - Address mismatch                       │
│ - Insufficient confirmations             │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ db.updatePaymentStatus(payment.id,      │
│   "failed",                              │
│   {                                      │
│     failureReason: error message         │
│   }                                      │
│ )                                        │
└──────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
PAYMENT CONFIRMATION (Alternative Flow)
═══════════════════════════════════════════════════════════════════════

In development, there's a confirmPayment endpoint for testing:

STEP X: SIMULATE PAYMENT CONFIRMATION
┌──────────────────────────────────────────┐
│ trpc.payments.confirmPayment({           │
│   paymentId: 456                         │
│ })                                       │
│ (For demo/testing only)                  │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ server/routers.ts:2047                   │
│ - Authenticate request                   │
│ - Verify payment ownership                │
│ - Mark payment as "succeeded"            │
│ - Update loan to "fee_paid"              │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Return { success: true }                 │
└──────────────────────────────────────────┘


DATABASE SCHEMA - Payments Table:
┌────────────────────────────────────────────┐
│ Column          │ Type       │ Purpose     │
├────────────────────────────────────────────┤
│ id              │ SERIAL PK  │ Primary key│
│ loanApplicationId│INTEGER    │ FK to loan │
│ userId          │ INTEGER    │ FK to user │
│ amount          │ INTEGER    │ Cents (USD)│
│ currency        │ VARCHAR    │ "USD"      │
│ paymentProvider │ ENUM       │ stripe,    │
│                 │            │ authoriznet│
│                 │            │ crypto     │
│ paymentMethod   │ ENUM       │ card/crypto│
│ paymentIntentId │ VARCHAR    │ Provider ID│
│ cardLast4       │ VARCHAR    │ Last 4 dig │
│ cardBrand       │ VARCHAR    │ Visa, etc. │
│ cryptoCurrency  │ VARCHAR    │ BTC, ETH   │
│ cryptoAddress   │ VARCHAR    │ Wallet adr │
│ cryptoTxHash    │ VARCHAR    │ Blockchain │
│ cryptoAmount    │ VARCHAR    │ 0.0045     │
│ status          │ ENUM       │ pending /  │
│                 │            │ processing │
│                 │            │ succeeded/ │
│                 │            │ failed     │
│ failureReason   │ TEXT       │ Error msg  │
│ adminNotes      │ TEXT       │ Admin cmnt │
│ createdAt       │ TIMESTAMP  │ Created    │
│ updatedAt       │ TIMESTAMP  │ Updated    │
│ completedAt     │ TIMESTAMP  │ Paid time  │
└────────────────────────────────────────────┘


STATUS FLOW DIAGRAM:
┌─────────────────────────────────────────┐
│                                         │
│    pending → processing → succeeded     │
│       ↓                                 │
│      failed ← (card declined or tx fail)│
│                                         │
│ (User can retry from fee_pending state) │
│                                         │
└─────────────────────────────────────────┘


LOAN STATUS TRANSITIONS:
┌─────────────────────────────────────────┐
│                                         │
│  approved → fee_pending → fee_paid      │
│                ↓                        │
│            (retry)                      │
│                                         │
└─────────────────────────────────────────┘
```

### Key Implementation Details

**Idempotency Protection**
- Optional `idempotencyKey` (UUID) prevents duplicate charges
- Server checks cache before processing payment
- Useful for retry scenarios (network timeout, etc.)

**Payment Providers**
```
┌─────────────────────────────────────┐
│ Card                │ Crypto         │
├─────────────────────────────────────┤
│ • Authorize.Net     │ • Mocked (dev) │
│ • Requires:         │ • Supports:    │
│   - API Login ID    │   - BTC        │
│   - Transaction Key │   - ETH        │
│   - Client Key      │   - USDT       │
│   - Environment     │   - USDC       │
│                     │ • Future:      │
│                     │   - Coinbase   │
│                     │   - Forge      │
└─────────────────────────────────────┘
```

**Error Simulation (Development)**
- Can configure `errorSimulationRegistry` to test failure paths
- Supports custom delay and error messages

---

## 3. Loan Application Workflow

### Overview
Complete journey from prequalification through disbursement.

### Status Transitions

```
┌─────────────────────────────────────────────────────────────────────┐
│                  LOAN APPLICATION STATUS FLOW                        │
└─────────────────────────────────────────────────────────────────────┘


1. PREQUALIFICATION PHASE
┌──────────────────────────────────────────┐
│ User completes quick eligibility check   │
│ - Annual income verification             │
│ - Credit requirements (mock)             │
│ - Employment status                      │
│                                          │
│ Possible Outcomes:                       │
│ ✓ Prequalified → Can apply for full loan│
│ ✗ Not qualified → Suggest alternatives  │
└──────────────────────────────────────────┘


2. LOAN APPLICATION PHASE
┌──────────────────────────────────────────┐
│ Status: "draft"                          │
│ - User fills out detailed form           │
│ - Personal information                   │
│ - Financial details                      │
│ - Employment history                     │
│ - Auto-save to localStorage              │
│                                          │
│ Action: Submit application               │
│ → Status changes to "submitted"          │
└──────────────────────────────────────────┘


3. ADMIN REVIEW PHASE
┌──────────────────────────────────────────┐
│ Status: "under_review"                   │
│ - Admin reviews application details      │
│ - Checks uploaded documents              │
│ - Verifies information accuracy          │
│                                          │
│ Possible Outcomes:                       │
│ ✓ Approved → Status: "approved"          │
│ ✗ Rejected → Status: "rejected"          │
│ ? Info needed → Status: "more_info"      │
└──────────────────────────────────────────┘


4. PAYMENT PHASE
┌──────────────────────────────────────────┐
│ Status: "approved"                       │
│ - processingFeeAmount calculated         │
│ - User must pay fee to proceed           │
│                                          │
│ Payment:                                 │
│ - Card (Authorize.Net) OR                │
│ - Crypto (BTC, ETH, USDT, USDC)         │
│                                          │
│ Status: "fee_pending" (during payment)   │
│ Status: "fee_paid" (after success)       │
└──────────────────────────────────────────┘


5. DISBURSEMENT PHASE
┌──────────────────────────────────────────┐
│ Status: "disbursement_pending"           │
│ - Loan amount ready to transfer          │
│ - User provides bank details             │
│                                          │
│ Admin initiates disbursement:            │
│ - Funds transferred to user's account    │
│ - Status: "disbursement_processing"      │
│                                          │
│ After completion:                        │
│ - Status: "disbursed"                    │
│ - Loan active                            │
└──────────────────────────────────────────┘


6. COMPLETED STATE
┌──────────────────────────────────────────┐
│ Status: "completed"                      │
│ - Loan fully repaid                      │
│ - Account settled                        │
└──────────────────────────────────────────┘


FULL STATUS DIAGRAM:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  draft → submitted → under_review → approved → fee_pending     │
│                           ↓                         ↓           │
│                        rejected             fee_paid             │
│                        ↓                       ↓                 │
│                  (end - declined)   disbursement_pending         │
│                                           ↓                     │
│                                 disbursement_processing          │
│                                           ↓                     │
│                                       disbursed                  │
│                                           ↓                     │
│                                       completed                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘


REJECTED/FAILED PATHS:

User rejects prequalification:
  Not qualified → User receives info on next steps

Application rejected by admin:
  rejected → User can reapply or contact support

Payment failed (card declined, crypto verification failed):
  fee_pending → User retries payment → fee_paid OR
             → User abandons → (pending state)
```

---

## 4. Data Flow Diagrams

### Document Verification Data Flow
```
┌─────────────┐
│   Browser   │
│  (User)     │
└──────┬──────┘
       │ Select file
       ▼
┌──────────────────────────────┐
│ VerificationUpload.tsx       │
│ (Client Component)           │
└──────┬───────────────────────┘
       │ FormData + file
       ▼
┌──────────────────────────────┐
│ POST /api/upload-document    │
│ (Express endpoint)           │
└──────┬───────────────────────┘
       │ file buffer
       ├──────────────────────────┬───────────────────┐
       │                          │                   │
       ▼                          ▼                   ▼
    Forge API            (fallback)           (no storage)
   (configured)         Fail/missing       base64 encode
       │                    │                   │
       └────────┬───────────┴───────────────────┘
                ▼
          Returns URL (external or base64)
                │
                ▼
    JSON response: { url, fileName, size, mimeType }
                │
                ▼
    trpc.verification.uploadDocument({
      documentType,
      filePath: url,
      ...metadata
    })
                │
                ▼
    server/db.ts:
    db.createVerificationDocument()
                │
                ▼
    drizzle INSERT into verificationDocuments
                │
                ▼
    Database stores record
    filePath = URL or base64 string
                │
                ▼
    Send admin notification (background)
                │
                ▼
    Document visible in:
    - User dashboard (status: pending)
    - Admin dashboard (review queue)
```

### Payment Data Flow
```
┌─────────────┐
│ User        │
│ (PaymentUI) │
└──────┬──────┘
       │ Choose method (card or crypto)
       │
       ├─────────────────────┬──────────────────────┐
       │                     │                      │
       ▼                     ▼                      ▼
    Card Payment         Crypto Payment         Error
  (Authorize.Net)       (Blockchain)        Simulation?
       │                     │
       ├─────────────────────┘
       │
       ▼
trpc.payments.createIntent()
       │
       ▼
server/routers.ts:1840
- Validate request
- Check idempotency cache
- Verify loan ownership/status
       │
       ▼
    ├─ Card Path:
    │  db.createPayment(status: pending)
    │       ↓
    │  createAuthorizeNetTransaction()
    │       ├─ Success: update status→succeeded
    │       └─ Fail: update status→failed
    │
    └─ Crypto Path:
       createCryptoCharge()
            ↓
       db.createPayment(status: pending)
            ↓
       Return paymentAddress to user
            ↓
       User sends crypto (offchain)
            ↓
       User calls verifyCryptoPayment(txHash)
            ↓
       Server verifies blockchain
            ├─ Match: update→succeeded
            └─ Mismatch: update→failed
       │
       ▼
Update db.payments record
       │
       ├─ succeeded: db.updateLoanApplicationStatus("fee_paid")
       └─ failed: db.updateLoanApplicationStatus("fee_pending")
       │
       ▼
Return response to client
       │
       ▼
Update UI
```

---

## 5. Key Tables & Relationships

### Database Entity Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                     DATABASE SCHEMA DIAGRAM                      │
└──────────────────────────────────────────────────────────────────┘

users
├─ id (PK)
├─ email (UNIQUE)
├─ name
├─ role: "user" | "admin"
├─ createdAt
└─ updatedAt
    │
    ├─────────────────────────────────┬──────────────────────────┐
    │                                 │                          │
    ▼                                 ▼                          ▼


loanApplications                verificationDocuments       payments
├─ id (PK)                      ├─ id (PK)                 ├─ id (PK)
├─ userId (FK→users)            ├─ userId (FK→users)       ├─ userId (FK→users)
├─ trackingNumber               ├─ loanApplicationId       ├─ loanApplicationId
├─ status                       │  (FK→loanApplications)   │  (FK→loanApplications)
├─ requestedAmount              ├─ documentType            ├─ amount
├─ approvedAmount               ├─ filePath (URL/base64)   ├─ paymentProvider
├─ processingFeeAmount          ├─ status                  ├─ paymentMethod
├─ createdAt                    ├─ reviewedBy (FK→users)   ├─ status
└─ updatedAt                    ├─ rejectionReason         ├─ cardLast4
                                ├─ createdAt               ├─ cryptoAddress
                                └─ updatedAt               ├─ cryptoTxHash
                                                           ├─ createdAt
                                                           └─ updatedAt


disbursements
├─ id (PK)
├─ loanApplicationId (FK→loanApplications)
├─ userId (FK→users)
├─ amount
├─ status
├─ accountHolderName
├─ accountNumber
├─ routingNumber
├─ transactionId
└─ completedAt


paymentAuditLog
├─ id (PK)
├─ paymentId (FK→payments)
├─ action
├─ oldStatus
├─ newStatus
├─ createdAt
└─ ...metadata


Keys & Constraints:
- Users (1) → Many (loanApplications)
- Users (1) → Many (verificationDocuments)
- Users (1) → Many (payments)
- LoanApplications (1) → Many (payments)
- LoanApplications (1) → Many (disbursements)
- LoanApplications (1) ← Many (verificationDocuments) [optional]
```

---

## 6. API Endpoint Reference

### Document Upload & Verification

| Endpoint | Method | Auth | Input | Purpose |
|----------|--------|------|-------|---------|
| `/api/upload-document` | POST | JWT | `file` (multipart) | Upload document to storage |
| `verification.uploadDocument` | tRPC | Protected | `documentType, filePath, ...` | Register document in DB |
| `verification.myDocuments` | tRPC Query | Protected | — | Get user's documents |
| `verification.adminList` | tRPC Query | Admin | — | Get all documents for review |
| `verification.adminApprove` | tRPC Mutation | Admin | `id, adminNotes` | Approve document |
| `verification.adminReject` | tRPC Mutation | Admin | `id, rejectionReason, adminNotes` | Reject document |

### Payment Processing

| Endpoint | Method | Auth | Input | Purpose |
|----------|--------|------|-------|---------|
| `payments.createIntent` | tRPC Mutation | Protected | `loanApplicationId, paymentMethod, ...` | Initiate payment |
| `payments.confirmPayment` | tRPC Mutation | Protected | `paymentId` | Confirm payment (demo) |
| `payments.getByLoanId` | tRPC Query | Protected | `loanApplicationId` | Get loan's payments |
| `payments.verifyCryptoPayment` | tRPC Mutation | Protected | `paymentId, txHash` | Verify crypto TX |

---

## 7. Error Handling & Edge Cases

### Document Upload Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| File too large | > 10 MB | User selects smaller file |
| Invalid format | Not JPEG/PNG/PDF | User selects allowed format |
| Network timeout | Connection lost | User retries upload |
| Storage failure | Forge API down | System uses base64 fallback |
| Authentication failed | Invalid/expired JWT | User re-authenticates |

### Payment Processing Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| Card declined | Insufficient funds, fraud block, etc. | User retries with different card |
| Duplicate payment | Idempotency key collision | Server returns cached result |
| Loan not approved | Application not in approved state | Admin must approve first |
| Crypto verification failed | TX hash doesn't match expectations | User re-verifies or provides correct hash |
| Crypto expired | Charge not completed in 1 hour | Create new payment intent |

---

## 8. Security Considerations

### Document Upload
- **Authentication**: JWT required (`app_session_id` cookie)
- **Authorization**: Users can only upload to their own account
- **File Validation**: MIME type & size checked server-side
- **Storage**: Files stored in external storage (Forge) with user ID in path
- **Access**: Admin can view all documents; users see only their own

### Payment Processing
- **Authentication**: Protected procedure (JWT required)
- **Authorization**: 
  - Users can only pay for their own loans
  - Admins can manage all payments
- **Idempotency**: UUID-based to prevent double-charging
- **PCI Compliance**: Sensitive card data handled via Authorize.Net (opaqueData)
- **Crypto Security**: No wallet keys stored; user manages offline
- **Audit Trail**: All payment status changes logged

---

## 9. Configuration & Environment Variables

### Required for Document Upload
- `BUILT_IN_FORGE_API_URL`: External storage endpoint
- `BUILT_IN_FORGE_API_KEY`: Storage authentication
- *Fallback*: Base64 encoding if not set

### Required for Card Payments
- `AUTHORIZENET_API_LOGIN_ID`
- `AUTHORIZENET_TRANSACTION_KEY`
- `AUTHORIZENET_ENVIRONMENT` (sandbox, production)
- `AUTHORIZENET_CLIENT_KEY`

### Required for Crypto Payments
- `CRYPTO_PAYMENT_ENVIRONMENT`
- `COINBASE_COMMERCE_API_KEY` (future)
- `COINBASE_COMMERCE_WEBHOOK_SECRET` (future)

---

## 10. Testing Checklist

### Document Upload Testing
- [ ] Upload valid document (JPEG, PNG, PDF)
- [ ] Reject oversized file (>10 MB)
- [ ] Reject invalid format
- [ ] Preview image documents
- [ ] Admin can view all uploads
- [ ] Admin can approve/reject with notes
- [ ] User sees updated status
- [ ] Fallback to base64 when storage unavailable

### Payment Processing Testing
- [ ] Card payment flow with Authorize.Net
- [ ] Card declined scenario
- [ ] Crypto payment address generation
- [ ] User sends crypto (simulated)
- [ ] Verify crypto transaction
- [ ] Idempotency key prevents duplicate charges
- [ ] Loan status updates to fee_paid
- [ ] Error simulation works (development)

### End-to-End Testing
- [ ] Complete loan application
- [ ] Document upload & approval
- [ ] Payment processing
- [ ] Loan status transitions
- [ ] Admin dashboard shows all stages

---

## 11. Monitoring & Debugging

### Key Metrics to Monitor
- Document upload success rate
- Average upload time
- Payment authorization rate
- Crypto verification success rate
- Payment retry rate
- Error simulation triggers (dev)

### Debug Logging

Document upload logs:
```
[Upload] Storage not configured, using base64 fallback
[Upload] Document upload error: {error message}
[Upload] Returning cached result for idempotency key: {key}
[Email] Failed to send admin document notification: {error}
```

Payment processing logs:
```
[Payment] Returning cached result for idempotency key: {key}
[Payment] Card payment failed: {error}
[Idempotency] Failed to cache card payment result: {error}
[Audit] Failed to log payment status change: {error}
```

---

## 12. Future Enhancements

1. **Document Processing**
   - OCR for automatic document validation
   - Facial recognition for ID verification
   - Document expiry checks

2. **Payment Options**
   - Stripe integration (currently Authorize.Net + Crypto)
   - Bank transfer / ACH
   - Multiple crypto gateways (Coinbase, Forge)
   - Installment payments

3. **Security**
   - Rate limiting on upload/payment endpoints
   - Advanced fraud detection
   - KYC/AML integration
   - 3D Secure for card payments

4. **UX**
   - Real-time payment status updates (WebSocket)
   - Document pre-screening feedback
   - Payment progress tracking
   - Automated retry logic

---

## Document Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Current | Initial flow diagrams for document upload, payment processing, and loan application workflow |

