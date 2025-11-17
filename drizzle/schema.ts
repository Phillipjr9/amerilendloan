import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * OTP codes for authentication (signup, login, and reset)
 */
export const otpCodes = mysqlTable("otpCodes", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  purpose: mysqlEnum("purpose", ["signup", "login", "reset"]).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  verified: int("verified").default(0).notNull(), // 0 = not verified, 1 = verified
  attempts: int("attempts").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtpCode = typeof otpCodes.$inferInsert;

/**
 * Legal document acceptances tracking
 */
export const legalAcceptances = mysqlTable("legalAcceptances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  loanApplicationId: int("loanApplicationId"),  // Optional, for loan-specific agreements
  documentType: mysqlEnum("documentType", [
    "terms_of_service",
    "privacy_policy",
    "loan_agreement",
    "esign_consent"
  ]).notNull(),
  documentVersion: varchar("documentVersion", { length: 20 }).notNull(),  // e.g., "1.0", "2.1"
  ipAddress: varchar("ipAddress", { length: 45 }),  // IPv4 or IPv6
  userAgent: text("userAgent"),
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
});

export type LegalAcceptance = typeof legalAcceptances.$inferSelect;
export type InsertLegalAcceptance = typeof legalAcceptances.$inferInsert;

/**
 * Loan applications submitted by users
 */
export const loanApplications = mysqlTable("loanApplications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 20 }).notNull().unique(),
  
  // Applicant information
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  dateOfBirth: varchar("dateOfBirth", { length: 10 }).notNull(), // YYYY-MM-DD
  ssn: varchar("ssn", { length: 11 }).notNull(), // XXX-XX-XXXX
  
  // Address
  street: varchar("street", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(), // US state code
  zipCode: varchar("zipCode", { length: 10 }).notNull(),
  
  // Employment information
  employmentStatus: mysqlEnum("employmentStatus", ["employed", "self_employed", "unemployed", "retired"]).notNull(),
  employer: varchar("employer", { length: 255 }),
  monthlyIncome: int("monthlyIncome").notNull(), // in cents
  
  // Loan details
  loanType: mysqlEnum("loanType", ["installment", "short_term"]).notNull(),
  requestedAmount: int("requestedAmount").notNull(), // in cents
  loanPurpose: text("loanPurpose").notNull(),
  disbursementMethod: mysqlEnum("disbursementMethod", ["bank_transfer", "check", "debit_card", "paypal", "crypto"]).notNull(),
  
  // Approval details
  approvedAmount: int("approvedAmount"), // in cents, null if not approved
  processingFeeAmount: int("processingFeeAmount"), // in cents, calculated after approval
  
  // Status tracking
  status: mysqlEnum("status", [
    "pending",        // Initial submission
    "under_review",   // Being reviewed by admin
    "approved",       // Approved, awaiting fee payment
    "fee_pending",    // Fee payment initiated
    "fee_paid",       // Fee confirmed paid
    "disbursed",      // Loan disbursed
    "rejected",       // Application rejected
    "cancelled"       // Cancelled by user
  ]).default("pending").notNull(),
  
  rejectionReason: text("rejectionReason"),
  adminNotes: text("adminNotes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  disbursedAt: timestamp("disbursedAt"),
});

export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = typeof loanApplications.$inferInsert;

/**
 * System configuration for processing fees
 */
export const feeConfiguration = mysqlTable("feeConfiguration", {
  id: int("id").autoincrement().primaryKey(),
  
  // Fee calculation mode
  calculationMode: mysqlEnum("calculationMode", ["percentage", "fixed"]).default("percentage").notNull(),
  
  // Percentage mode settings (1.5% - 2.5%)
  percentageRate: int("percentageRate").default(200).notNull(), // stored as basis points (200 = 2.00%)
  
  // Fixed fee mode settings ($1.50 - $2.50)
  fixedFeeAmount: int("fixedFeeAmount").default(200).notNull(), // in cents (200 = $2.00)
  
  // Metadata
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  updatedBy: int("updatedBy"), // admin user id
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeeConfiguration = typeof feeConfiguration.$inferSelect;
export type InsertFeeConfiguration = typeof feeConfiguration.$inferInsert;

/**
 * Payment records for processing fees
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  loanApplicationId: int("loanApplicationId").notNull(),
  userId: int("userId").notNull(),
  
  // Payment details
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  // Payment provider details
  paymentProvider: mysqlEnum("paymentProvider", ["stripe", "authorizenet", "crypto"]).default("stripe").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["card", "crypto"]).default("card").notNull(),
  
  // Card payment details (Authorize.net or Stripe)
  paymentIntentId: varchar("paymentIntentId", { length: 255 }), // Payment intent/transaction ID
  paymentMethodId: varchar("paymentMethodId", { length: 255 }), // Payment method ID
  cardLast4: varchar("cardLast4", { length: 4 }), // Last 4 digits of card
  cardBrand: varchar("cardBrand", { length: 20 }), // Visa, Mastercard, Amex, etc.
  
  // Cryptocurrency payment details
  cryptoCurrency: varchar("cryptoCurrency", { length: 10 }), // BTC, ETH, USDT, etc.
  cryptoAddress: varchar("cryptoAddress", { length: 255 }), // Wallet address for payment
  cryptoTxHash: varchar("cryptoTxHash", { length: 255 }), // Blockchain transaction hash
  cryptoAmount: varchar("cryptoAmount", { length: 50 }), // Amount in crypto (string for precision)
  
  // Status tracking
  status: mysqlEnum("status", [
    "pending",      // Payment initiated
    "processing",   // Payment being processed
    "succeeded",    // Payment successful
    "failed",       // Payment failed
    "cancelled"     // Payment cancelled
  ]).default("pending").notNull(),
  
  failureReason: text("failureReason"),
  adminNotes: text("adminNotes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Loan disbursement records
 */
export const disbursements = mysqlTable("disbursements", {
  id: int("id").autoincrement().primaryKey(),
  loanApplicationId: int("loanApplicationId").notNull(),
  userId: int("userId").notNull(),
  
  // Disbursement details
  amount: int("amount").notNull(), // in cents
  
  // Bank account details (simplified for demo)
  accountHolderName: varchar("accountHolderName", { length: 255 }).notNull(),
  accountNumber: varchar("accountNumber", { length: 50 }).notNull(),
  routingNumber: varchar("routingNumber", { length: 20 }).notNull(),
  
  // Status tracking
  status: mysqlEnum("status", [
    "pending",      // Awaiting processing
    "processing",   // Being processed
    "completed",    // Successfully disbursed
    "failed"        // Disbursement failed
  ]).default("pending").notNull(),
  
  transactionId: varchar("transactionId", { length: 255 }), // External transaction reference
  failureReason: text("failureReason"),
  adminNotes: text("adminNotes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
  initiatedBy: int("initiatedBy"), // admin user id
});

export type Disbursement = typeof disbursements.$inferSelect;
export type InsertDisbursement = typeof disbursements.$inferInsert;

/**
 * Identity verification documents uploaded by users
 */
export const verificationDocuments = mysqlTable("verificationDocuments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  loanApplicationId: int("loanApplicationId"), // Optional link to specific loan application
  
  // Document details
  documentType: mysqlEnum("documentType", [
    "drivers_license_front",
    "drivers_license_back",
    "passport",
    "national_id_front",
    "national_id_back",
    "ssn_card",
    "bank_statement",
    "utility_bill",
    "pay_stub",
    "tax_return",
    "other"
  ]).notNull(),
  
  // File information
  fileName: varchar("fileName", { length: 255 }).notNull(),
  filePath: text("filePath").notNull(), // Storage path or URL
  fileSize: int("fileSize").notNull(), // in bytes
  mimeType: varchar("mimeType", { length: 100 }).notNull(), // e.g., image/jpeg, application/pdf
  
  // Verification status
  status: mysqlEnum("status", [
    "pending",      // Uploaded, awaiting review
    "under_review", // Being reviewed by admin
    "approved",     // Verified and approved
    "rejected",     // Rejected by admin
    "expired"       // Document expired
  ]).default("pending").notNull(),
  
  // Admin review details
  reviewedBy: int("reviewedBy"), // admin user id
  reviewedAt: timestamp("reviewedAt"),
  rejectionReason: text("rejectionReason"),
  adminNotes: text("adminNotes"),
  
  // Document metadata
  expiryDate: varchar("expiryDate", { length: 10 }), // YYYY-MM-DD for documents like IDs
  documentNumber: varchar("documentNumber", { length: 100 }), // License number, passport number, etc.
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type InsertVerificationDocument = typeof verificationDocuments.$inferInsert;