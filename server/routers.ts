import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { createOTP, verifyOTP, sendOTPEmail, sendOTPPhone } from "./_core/otp";
import { createAuthorizeNetTransaction, getAcceptJsConfig } from "./_core/authorizenet";
import { createCryptoCharge, checkCryptoPaymentStatus, getSupportedCryptos, convertUSDToCrypto, verifyCryptoPaymentByTxHash, checkNetworkStatus } from "./_core/crypto-payment";
import { verifyCryptoTransactionWeb3, getNetworkStatus } from "./_core/web3-verification";
import { legalAcceptances, loanApplications } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { sendLoginNotificationEmail } from "./_core/email";
import { invokeLLM } from "./_core/llm";
import { buildMessages, getSuggestedPrompts, type SupportContext } from "./_core/aiSupport";

export const appRouter = router({
  system: systemRouter,
  
  // Authentication router
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // OTP Authentication router
  otp: router({  
    // Request OTP code for signup or login via email
    requestCode: publicProcedure
      .input(z.object({
        email: z.string().email(),
        purpose: z.enum(["signup", "login", "reset"]),
      }))
      .mutation(async ({ input }) => {
        const code = await createOTP(input.email, input.purpose, "email");
        await sendOTPEmail(input.email, code, input.purpose);
        return { success: true };
      }),

    // Request OTP code for signup or login via phone
    requestPhoneCode: publicProcedure
      .input(z.object({
        phone: z.string().min(10),
        purpose: z.enum(["signup", "login", "reset"]),
      }))
      .mutation(async ({ input }) => {
        const code = await createOTP(input.phone, input.purpose, "phone");
        await sendOTPPhone(input.phone, code, input.purpose);
        return { success: true };
      }),

    // Verify OTP code (works for both email and phone)
    verifyCode: publicProcedure
      .input(z.object({
        identifier: z.string(), // email or phone
        code: z.string().length(6),
        purpose: z.enum(["signup", "login", "reset"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await verifyOTP(input.identifier, input.code, input.purpose);
        if (!result.valid) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: result.error || "Invalid code" 
          });
        }
        
        // Send login notification email for login purpose
        if (input.purpose === "login") {
          const ipAddress = ctx.req?.ip || (ctx.req?.headers?.['x-forwarded-for'] as string) || 'Unknown';
          const userAgent = ctx.req?.headers?.['user-agent'];
          
          // Get user info from database by identifier (email or phone)
          const user = await db.getUserByEmailOrPhone(input.identifier);
          
          if (user && user.email && user.name) {
            sendLoginNotificationEmail(
              user.email,
              user.name,
              new Date(),
              ipAddress,
              userAgent
            ).catch(err => console.error('Failed to send login notification:', err));
          }
        }
        
        return { success: true };
      }),
  }),

  // Loan application router
  loans: router({
    // Submit a new loan application
    submit: protectedProcedure
      .input(z.object({
        fullName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(10),
        dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/),
        street: z.string().min(1),
        city: z.string().min(1),
        state: z.string().length(2),
        zipCode: z.string().min(5),
        employmentStatus: z.enum(["employed", "self_employed", "unemployed", "retired"]),
        employer: z.string().optional(),
        monthlyIncome: z.number().int().positive(),
        loanType: z.enum(["installment", "short_term"]),
        requestedAmount: z.number().int().positive(),
        loanPurpose: z.string().min(10),
        disbursementMethod: z.enum(["bank_transfer", "check", "debit_card", "paypal", "crypto"]),
      }))
      .mutation(async ({ ctx, input }) => {
        // Generate unique tracking number
        const generateTrackingNumber = () => {
          const timestamp = Date.now().toString().slice(-6);
          const random = Math.random().toString(36).substring(2, 8).toUpperCase();
          return `AL${timestamp}${random}`;
        };
        
        const result = await db.createLoanApplication({
          userId: ctx.user.id,
          trackingNumber: generateTrackingNumber(),
          ...input,
        });
        return { 
          success: true, 
          trackingNumber: result.trackingNumber 
        };
      }),

    // Get user's loan applications
    myApplications: protectedProcedure.query(async ({ ctx }) => {
      return db.getLoanApplicationsByUserId(ctx.user.id);
    }),

    // Get single loan application by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationById(input.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }
        // Users can only view their own applications, admins can view all
        if (ctx.user.role !== "admin" && application.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return application;
      }),

    // Admin: Get all loan applications
    adminList: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db.getAllLoanApplications();
    }),

    // Admin: Approve loan application
    adminApprove: protectedProcedure
      .input(z.object({
        id: z.number(),
        approvedAmount: z.number().int().positive(),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const application = await db.getLoanApplicationById(input.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Calculate processing fee
        const feeConfig = await db.getActiveFeeConfiguration();
        let processingFeeAmount: number;

        if (feeConfig?.calculationMode === "percentage") {
          // Percentage mode: basis points (200 = 2.00%)
          processingFeeAmount = Math.round((input.approvedAmount * feeConfig.percentageRate) / 10000);
        } else if (feeConfig?.calculationMode === "fixed") {
          // Fixed fee mode
          processingFeeAmount = feeConfig.fixedFeeAmount;
        } else {
          // Default to 2% if no config exists
          processingFeeAmount = Math.round((input.approvedAmount * 200) / 10000);
        }

        await db.updateLoanApplicationStatus(input.id, "approved", {
          approvedAmount: input.approvedAmount,
          processingFeeAmount,
          adminNotes: input.adminNotes,
          approvedAt: new Date(),
        });

        return { success: true, processingFeeAmount };
      }),

    // Admin: Reject loan application
    adminReject: protectedProcedure
      .input(z.object({
        id: z.number(),
        rejectionReason: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateLoanApplicationStatus(input.id, "rejected", {
          rejectionReason: input.rejectionReason,
        });

        return { success: true };
      }),
  }),

  // Fee configuration router (admin only)
  feeConfig: router({
    // Get active fee configuration
    getActive: publicProcedure.query(async () => {
      const config = await db.getActiveFeeConfiguration();
      if (!config) {
        // Return default configuration
        return {
          calculationMode: "percentage" as const,
          percentageRate: 200, // 2.00%
          fixedFeeAmount: 200, // $2.00
        };
      }
      return config;
    }),

    // Admin: Update fee configuration
    adminUpdate: protectedProcedure
      .input(z.object({
        calculationMode: z.enum(["percentage", "fixed"]),
        percentageRate: z.number().int().min(150).max(250).optional(), // 1.5% - 2.5%
        fixedFeeAmount: z.number().int().min(150).max(250).optional(), // $1.50 - $2.50
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Validate that the appropriate field is provided
        if (input.calculationMode === "percentage" && !input.percentageRate) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Percentage rate is required for percentage mode" 
          });
        }
        if (input.calculationMode === "fixed" && !input.fixedFeeAmount) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Fixed fee amount is required for fixed mode" 
          });
        }

        await db.createFeeConfiguration({
          calculationMode: input.calculationMode,
          percentageRate: input.percentageRate || 200,
          fixedFeeAmount: input.fixedFeeAmount || 200,
          updatedBy: ctx.user.id,
        });

        return { success: true };
      }),
  }),

  // Payment router
  payments: router({
    // Get Authorize.net Accept.js configuration
    getAuthorizeNetConfig: publicProcedure.query(() => {
      return getAcceptJsConfig();
    }),

    // Get supported cryptocurrencies with rates
    getSupportedCryptos: publicProcedure.query(async () => {
      return getSupportedCryptos();
    }),

    // Convert USD amount to crypto
    convertToCrypto: publicProcedure
      .input(z.object({
        usdCents: z.number(),
        currency: z.enum(["BTC", "ETH", "USDT", "USDC"]),
      }))
      .query(async ({ input }) => {
        const amount = await convertUSDToCrypto(input.usdCents, input.currency);
        return { amount };
      }),
    // Create payment intent for processing fee (supports multiple payment methods)
    createIntent: protectedProcedure
      .input(z.object({
        loanApplicationId: z.number(),
        paymentMethod: z.enum(["card", "crypto"]).default("card"),
        paymentProvider: z.enum(["stripe", "authorizenet", "crypto"]).optional(),
        cryptoCurrency: z.enum(["BTC", "ETH", "USDT", "USDC"]).optional(),
        opaqueData: z.object({
          dataDescriptor: z.string(),
          dataValue: z.string(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationById(input.loanApplicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        if (application.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        if (application.status !== "approved") {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Loan must be approved before payment" 
          });
        }
        
        if (!application.processingFeeAmount) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Processing fee not calculated" 
          });
        }

        // Determine payment provider
        const paymentProvider = input.paymentProvider || 
          (input.paymentMethod === "crypto" ? "crypto" : "authorizenet");

        let paymentData: any = {
          loanApplicationId: input.loanApplicationId,
          userId: ctx.user.id,
          amount: application.processingFeeAmount,
          currency: "USD",
          paymentProvider,
          paymentMethod: input.paymentMethod,
          status: "pending",
        };

        // For card payments with Authorize.Net
        if (input.paymentMethod === "card" && input.opaqueData) {
          const result = await createAuthorizeNetTransaction(
            application.processingFeeAmount,
            input.opaqueData,
            `Processing fee for loan #${application.trackingNumber}`
          );

          if (!result.success) {
            throw new TRPCError({ 
              code: "INTERNAL_SERVER_ERROR", 
              message: result.error || "Card payment failed" 
            });
          }

          paymentData = {
            ...paymentData,
            status: "succeeded",
            paymentIntentId: result.transactionId,
            cardLast4: result.cardLast4,
            cardBrand: result.cardBrand,
            completedAt: new Date(),
          };

          // Create payment record
          await db.createPayment(paymentData);

          // Update loan status to fee_paid
          await db.updateLoanApplicationStatus(input.loanApplicationId, "fee_paid");

          return { 
            success: true, 
            amount: application.processingFeeAmount,
            transactionId: result.transactionId,
            message: "Payment processed successfully"
          };
        }

        // For crypto payments, create charge and get payment address
        if (input.paymentMethod === "crypto" && input.cryptoCurrency) {
          const charge = await createCryptoCharge(
            application.processingFeeAmount,
            input.cryptoCurrency,
            `Processing fee for loan #${application.trackingNumber}`,
            { loanApplicationId: input.loanApplicationId, userId: ctx.user.id }
          );

          if (!charge.success) {
            throw new TRPCError({ 
              code: "INTERNAL_SERVER_ERROR", 
              message: charge.error || "Failed to create crypto payment" 
            });
          }

          paymentData = {
            ...paymentData,
            cryptoCurrency: input.cryptoCurrency,
            cryptoAddress: charge.paymentAddress,
            cryptoAmount: charge.cryptoAmount,
            paymentIntentId: charge.chargeId,
          };

          // Create payment record
          await db.createPayment(paymentData);

          // Update loan status to fee_pending
          await db.updateLoanApplicationStatus(input.loanApplicationId, "fee_pending");

          return { 
            success: true, 
            amount: application.processingFeeAmount,
            cryptoAddress: charge.paymentAddress,
            cryptoAmount: charge.cryptoAmount,
          };
        }

        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Invalid payment method or missing payment data" 
        });
      }),

    // Simulate payment confirmation (in production, this would be a webhook)
    confirmPayment: protectedProcedure
      .input(z.object({
        paymentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const payment = await db.getPaymentById(input.paymentId);
        
        if (!payment) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        if (payment.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Update payment status
        await db.updatePaymentStatus(input.paymentId, "succeeded", {
          completedAt: new Date(),
        });

        // Update loan application status to fee_paid
        await db.updateLoanApplicationStatus(payment.loanApplicationId, "fee_paid");

        return { success: true };
      }),

    // Get payments for a loan application
    getByLoanId: protectedProcedure
      .input(z.object({ loanApplicationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationById(input.loanApplicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        if (application.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.getPaymentsByLoanApplicationId(input.loanApplicationId);
      }),

    // Verify crypto payment by transaction hash
    verifyCryptoPayment: protectedProcedure
      .input(z.object({
        paymentId: z.number(),
        txHash: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const payment = await db.getPaymentById(input.paymentId);
        
        if (!payment) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
        }
        
        if (payment.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        if (payment.paymentMethod !== "crypto") {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "This payment is not a crypto payment" 
          });
        }

        // Verify the transaction on blockchain
        const verification = await verifyCryptoPaymentByTxHash(
          payment.cryptoCurrency as any,
          input.txHash,
          payment.cryptoAmount || "",
          payment.cryptoAddress || ""
        );

        if (!verification.valid) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: verification.message 
          });
        }

        // Update payment with transaction hash and status
        await db.updatePaymentStatus(input.paymentId, verification.confirmed ? "succeeded" : "processing", {
          cryptoTxHash: input.txHash,
          completedAt: verification.confirmed ? new Date() : undefined,
        });

        // If confirmed, update loan status to fee_paid
        if (verification.confirmed) {
          await db.updateLoanApplicationStatus(payment.loanApplicationId, "fee_paid");
        }

        return {
          success: true,
          verified: verification.valid,
          confirmed: verification.confirmed,
          confirmations: verification.confirmations,
          message: verification.message,
        };
      }),

    // Admin: Manually confirm crypto payment
    adminConfirmCrypto: adminProcedure
      .input(z.object({
        paymentId: z.number(),
        txHash: z.string().min(1),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const payment = await db.getPaymentById(input.paymentId);
        
        if (!payment) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
        }

        if (payment.paymentMethod !== "crypto") {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "This payment is not a crypto payment" 
          });
        }

        // Update payment with transaction hash and mark as succeeded
        await db.updatePaymentStatus(input.paymentId, "succeeded", {
          cryptoTxHash: input.txHash,
          completedAt: new Date(),
          adminNotes: input.adminNotes,
        });

        // Update loan status to fee_paid
        await db.updateLoanApplicationStatus(payment.loanApplicationId, "fee_paid");

        return { success: true, message: "Crypto payment confirmed" };
      }),

    // Check crypto payment status
    checkCryptoStatus: protectedProcedure
      .input(z.object({
        paymentId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const payment = await db.getPaymentById(input.paymentId);
        
        if (!payment) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        if (payment.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        if (payment.paymentMethod !== "crypto") {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "This payment is not a crypto payment" 
          });
        }

        // Check blockchain status if we have a tx hash
        const statusCheck = payment.cryptoTxHash 
          ? await checkCryptoPaymentStatus(payment.paymentIntentId || "", payment.cryptoTxHash)
          : { status: "pending" as const };

        return {
          paymentStatus: payment.status,
          blockchainStatus: statusCheck.status,
          confirmations: statusCheck.confirmations,
          txHash: payment.cryptoTxHash,
          cryptoAddress: payment.cryptoAddress,
          cryptoAmount: payment.cryptoAmount,
          cryptoCurrency: payment.cryptoCurrency,
        };
      }),

    // Web3 verification: Verify transaction on blockchain
    verifyWeb3Transaction: protectedProcedure
      .input(z.object({
        paymentId: z.number(),
        txHash: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const payment = await db.getPaymentById(input.paymentId);
        
        if (!payment) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
        }
        
        if (payment.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        if (payment.paymentMethod !== "crypto" || !payment.cryptoCurrency) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "This payment is not a crypto payment" 
          });
        }

        // Verify transaction using Web3
        const result = await verifyCryptoTransactionWeb3(
          payment.cryptoCurrency as any,
          input.txHash,
          payment.cryptoAddress || "",
          payment.cryptoAmount || ""
        );

        if (!result.valid) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: result.message 
          });
        }

        // Update payment with verified transaction hash
        await db.updatePaymentStatus(input.paymentId, result.confirmed ? "succeeded" : "processing", {
          cryptoTxHash: input.txHash,
          completedAt: result.confirmed ? new Date() : undefined,
        });

        // If confirmed, update loan status to fee_paid
        if (result.confirmed) {
          await db.updateLoanApplicationStatus(payment.loanApplicationId, "fee_paid");
        }

        return {
          success: true,
          verified: result.valid,
          confirmed: result.confirmed,
          confirmations: result.confirmations,
          blockNumber: result.blockNumber,
          gasUsed: result.gasUsed,
          status: result.status,
          message: result.message,
        };
      }),

    // Get blockchain network status
    getNetworkStatus: publicProcedure
      .input(z.object({
        currency: z.enum(["BTC", "ETH"]),
      }))
      .query(async ({ input }) => {
        const status = await getNetworkStatus(input.currency);
        return status;
      }),
  }),

  // Disbursement router (admin only)
  disbursements: router({
    // Admin: Initiate loan disbursement
    adminInitiate: protectedProcedure
      .input(z.object({
        loanApplicationId: z.number(),
        accountHolderName: z.string().min(1),
        accountNumber: z.string().min(1),
        routingNumber: z.string().min(9),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const application = await db.getLoanApplicationById(input.loanApplicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // CRITICAL: Validate that processing fee has been paid
        if (application.status !== "fee_paid") {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Processing fee must be paid before disbursement" 
          });
        }

        // Check if disbursement already exists
        const existingDisbursement = await db.getDisbursementByLoanApplicationId(input.loanApplicationId);
        if (existingDisbursement) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Disbursement already initiated for this loan" 
          });
        }

        // Create disbursement record
        await db.createDisbursement({
          loanApplicationId: input.loanApplicationId,
          userId: application.userId,
          amount: application.approvedAmount!,
          accountHolderName: input.accountHolderName,
          accountNumber: input.accountNumber,
          routingNumber: input.routingNumber,
          adminNotes: input.adminNotes,
          status: "pending",
          initiatedBy: ctx.user.id,
        });

        // Update loan status to disbursed
        await db.updateLoanApplicationStatus(input.loanApplicationId, "disbursed", {
          disbursedAt: new Date(),
        });

        return { success: true };
      }),

    // Get disbursement by loan application ID
    getByLoanId: protectedProcedure
      .input(z.object({ loanApplicationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationById(input.loanApplicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        if (application.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.getDisbursementByLoanApplicationId(input.loanApplicationId);
      }),
  }),

  // Legal documents router
  legal: router({
    // Record legal document acceptance
    acceptDocument: protectedProcedure
      .input(z.object({
        documentType: z.enum(["terms_of_service", "privacy_policy", "loan_agreement", "esign_consent"]),
        documentVersion: z.string(),
        loanApplicationId: z.number().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        await database.insert(legalAcceptances).values({
          userId: ctx.user.id,
          loanApplicationId: input.loanApplicationId,
          documentType: input.documentType,
          documentVersion: input.documentVersion,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        });

        return { success: true };
      }),

    // Check if user has accepted a specific document
    hasAccepted: protectedProcedure
      .input(z.object({
        documentType: z.enum(["terms_of_service", "privacy_policy", "loan_agreement", "esign_consent"]),
        loanApplicationId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) return false;

        const conditions = [
          eq(legalAcceptances.userId, ctx.user.id),
          eq(legalAcceptances.documentType, input.documentType),
        ];

        if (input.loanApplicationId) {
          conditions.push(eq(legalAcceptances.loanApplicationId, input.loanApplicationId));
        }

        const result = await database
          .select()
          .from(legalAcceptances)
          .where(and(...conditions))
          .limit(1);

        return result.length > 0;
      }),

    // Get all acceptances for current user
    getMyAcceptances: protectedProcedure
      .query(async ({ ctx }) => {
        const database = await getDb();
        if (!database) return [];

        return await database
          .select()
          .from(legalAcceptances)
          .where(eq(legalAcceptances.userId, ctx.user.id));
      }),
  }),

  // Verification documents router
  verification: router({
    // Upload verification document (metadata only, file uploaded via storage)
    uploadDocument: protectedProcedure
      .input(z.object({
        documentType: z.enum([
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
        ]),
        fileName: z.string(),
        filePath: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        loanApplicationId: z.number().optional(),
        expiryDate: z.string().optional(),
        documentNumber: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createVerificationDocument({
          userId: ctx.user.id,
          documentType: input.documentType,
          fileName: input.fileName,
          filePath: input.filePath,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          loanApplicationId: input.loanApplicationId,
          expiryDate: input.expiryDate,
          documentNumber: input.documentNumber,
        });

        return { success: true };
      }),

    // Get user's uploaded documents
    myDocuments: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getVerificationDocumentsByUserId(ctx.user.id);
      }),

    // Get single document by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const document = await db.getVerificationDocumentById(input.id);
        if (!document) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
        }
        // Users can only view their own documents, admins can view all
        if (ctx.user.role !== "admin" && document.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return document;
      }),

    // Admin: Get all verification documents
    adminList: adminProcedure
      .query(async () => {
        return db.getAllVerificationDocuments();
      }),

    // Admin: Approve verification document
    adminApprove: adminProcedure
      .input(z.object({
        id: z.number(),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const document = await db.getVerificationDocumentById(input.id);
        if (!document) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
        }

        await db.updateVerificationDocumentStatus(
          input.id,
          "approved",
          ctx.user.id,
          { adminNotes: input.adminNotes }
        );

        return { success: true };
      }),

    // Admin: Reject verification document
    adminReject: adminProcedure
      .input(z.object({
        id: z.number(),
        rejectionReason: z.string().min(1),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const document = await db.getVerificationDocumentById(input.id);
        if (!document) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
        }

        await db.updateVerificationDocumentStatus(
          input.id,
          "rejected",
          ctx.user.id,
          { 
            rejectionReason: input.rejectionReason,
            adminNotes: input.adminNotes 
          }
        );

        return { success: true };
      }),
  }),

  // AI Support router for comprehensive customer assistance
  ai: router({
    // Chat endpoint - handles customer support A-Z
    chat: publicProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["user", "assistant", "system"]),
              content: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const isAuthenticated = !!ctx.user;
          
          // Gather user context for authenticated users
          let supportContext: SupportContext = {
            isAuthenticated,
          };

          if (isAuthenticated && ctx.user?.id) {
            supportContext.userId = ctx.user.id;
            supportContext.email = ctx.user.email;
            
            // Get user's loan information
            const application = await db.getLoanApplicationByUserId(ctx.user.id);
            if (application) {
              supportContext.loanStatus = application.status;
              supportContext.loanAmount = application.loanAmount;
            }
          }

          // Build messages with system prompt and context
          const messages = buildMessages(
            input.messages,
            isAuthenticated,
            {
              userId: supportContext.userId,
              email: supportContext.email,
              loanStatus: supportContext.loanStatus,
              loanAmount: supportContext.loanAmount,
            }
          );

          // Invoke LLM with prepared messages
          const response = await invokeLLM({
            messages,
            maxTokens: 2000,
          });

          // Extract the assistant's response
          const assistantMessage =
            response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

          return {
            success: true,
            message: assistantMessage,
            isAuthenticated,
            userContext: supportContext,
          };
        } catch (error) {
          console.error("AI Chat Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to process your message. Please try again or contact support.",
          });
        }
      }),

    // Get suggested prompts based on authentication status
    getSuggestedPrompts: publicProcedure.query(({ ctx }) => {
      const isAuthenticated = !!ctx.user;
      return getSuggestedPrompts(isAuthenticated);
    }),

    // Get support resources and documentation
    getResources: publicProcedure.query(() => {
      return {
        faqs: [
          {
            category: "Getting Started",
            questions: [
              "How does the application process work?",
              "What are the eligibility requirements?",
              "What documents do I need to apply?",
            ],
          },
          {
            category: "Loans & Approvals",
            questions: [
              "How long does approval take?",
              "Can I get approved with bad credit?",
              "What loan amounts are available?",
            ],
          },
          {
            category: "Payments & Repayment",
            questions: [
              "How do I make a payment?",
              "What payment methods do you accept?",
              "Can I change my payment schedule?",
            ],
          },
          {
            category: "Security & Privacy",
            questions: [
              "Is my data secure?",
              "How do you protect my information?",
              "What is your privacy policy?",
            ],
          },
        ],
        contactOptions: [
          {
            method: "Phone",
            value: "(800) 990-9130",
            availability: "Monday-Friday, 9AM-6PM EST",
          },
          {
            method: "Email",
            value: "info@amerilendloan.com",
            availability: "24/7 (Response within 24 hours)",
          },
          {
            method: "Live Chat",
            value: "Available on website",
            availability: "Business hours",
          },
        ],
      };
    }),

    // Track application status without login
    trackApplication: publicProcedure
      .input(
        z.object({
          applicationId: z.string(),
          email: z.string().email(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const application = await db.getDb()
            .query.loanApplications
            .findFirst({
              where: and(
                eq(loanApplications.id, input.applicationId),
                eq(loanApplications.email, input.email)
              ),
            });

          if (!application) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Application not found. Please check your Application ID and email.",
            });
          }

          return {
            success: true,
            application: {
              id: application.id,
              status: application.status,
              loanAmount: application.loanAmount,
              createdAt: application.createdAt,
              updatedAt: application.updatedAt,
              estimatedDecision: application.estimatedDecision,
              nextSteps: getNextSteps(application.status),
            },
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to track application. Please try again.",
          });
        }
      }),
  }),
});

// Helper function to determine next steps based on application status
function getNextSteps(status: string): string[] {
  const steps: Record<string, string[]> = {
    "pending": [
      "Your application is being reviewed",
      "Check your email for updates",
      "Verify all submitted information is accurate"
    ],
    "in-review": [
      "Our team is actively reviewing your application",
      "You may be contacted for additional information",
      "Decision will be communicated within 24-48 hours"
    ],
    "approved": [
      "Congratulations! Your loan has been approved",
      "Log in to your dashboard to view disbursement options",
      "Choose your preferred funding method"
    ],
    "rejected": [
      "Your application was not approved at this time",
      "Check your email for details on why",
      "Contact us at (800) 990-9130 to discuss options"
    ],
    "funded": [
      "Your loan has been funded!",
      "The money is on its way to your account",
      "View payment schedule in your dashboard"
    ],
    "completed": [
      "Your loan has been fully repaid",
      "Thank you for using AmeriLend",
      "You may be eligible for additional credit"
    ],
  };

  return steps[status] || ["Please contact support for more information"];
}

export type AppRouter = typeof appRouter;
