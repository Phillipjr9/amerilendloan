import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  loanApplications,
  LoanApplication,
  InsertLoanApplication,
  feeConfiguration,
  FeeConfiguration,
  InsertFeeConfiguration,
  payments,
  Payment,
  InsertPayment,
  disbursements,
  Disbursement,
  InsertDisbursement,
  verificationDocuments,
  VerificationDocument,
  InsertVerificationDocument
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { 
  sendLoanApplicationReceivedEmail,
  sendLoanApplicationApprovedEmail,
  sendLoanApplicationRejectedEmail,
  sendLoanApplicationProcessingEmail,
  sendLoanApplicationMoreInfoEmail
} from "./_core/email";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmailOrPhone(identifier: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  // Try to find by email first
  const emailResult = await db.select().from(users).where(eq(users.email, identifier)).limit(1);
  if (emailResult.length > 0) return emailResult[0];

  // If not found by email, try phone (stored in loginMethod for OTP users)
  const phoneResult = await db.select().from(users).where(eq(users.loginMethod, identifier)).limit(1);
  return phoneResult.length > 0 ? phoneResult[0] : undefined;
}

// ============================================
// Loan Application Queries
// ============================================

/**
 * Generate a unique tracking number in format: AL-YYYYMMDD-XXXXX
 * AL = AmeriLend prefix
 * YYYYMMDD = Application date
 * XXXXX = 5-character alphanumeric code
 */
function generateTrackingNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Generate 5-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `AL-${dateStr}-${code}`;
}

export async function createLoanApplication(data: InsertLoanApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate unique tracking number
  let trackingNumber = generateTrackingNumber();
  
  // Ensure uniqueness (retry if collision)
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 10) {
    const existing = await db.select()
      .from(loanApplications)
      .where(eq(loanApplications.trackingNumber, trackingNumber))
      .limit(1);
    
    if (existing.length === 0) {
      isUnique = true;
    } else {
      trackingNumber = generateTrackingNumber();
      attempts++;
    }
  }
  
  if (!isUnique) {
    throw new Error("Failed to generate unique tracking number");
  }
  
  const result = await db.insert(loanApplications).values({
    ...data,
    trackingNumber,
  });
  
  // Send confirmation email asynchronously
  const insertedId = Number(result[0].insertId);
  getLoanApplicationById(insertedId).then(application => {
    if (application) {
      sendLoanApplicationReceivedEmail(
        application.email,
        application.fullName,
        application.trackingNumber,
        application.requestedAmount
      ).catch(err => console.error('Failed to send application submitted email:', err));
    }
  }).catch(err => console.error('Failed to get application for email:', err));
  
  return { ...result, trackingNumber };
}

export async function getLoanApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(loanApplications).where(eq(loanApplications.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLoanApplicationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(loanApplications).where(eq(loanApplications.userId, userId)).orderBy(desc(loanApplications.createdAt));
}

export async function getAllLoanApplications() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(loanApplications).orderBy(desc(loanApplications.createdAt));
}

export async function updateLoanApplicationStatus(
  id: number,
  status: LoanApplication["status"],
  additionalData?: Partial<LoanApplication> & { infoNeeded?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get application details before update for email notifications
  const application = await getLoanApplicationById(id);
  if (!application) throw new Error("Application not found");
  
  await db.update(loanApplications)
    .set({ status, ...additionalData, updatedAt: new Date() })
    .where(eq(loanApplications.id, id));
  
  // Send email notifications based on status change
  try {
    switch (status) {
      case "approved":
        if (additionalData?.approvedAmount && additionalData?.processingFeeAmount) {
          await sendLoanApplicationApprovedEmail(
            application.email,
            application.fullName,
            application.trackingNumber,
            additionalData.approvedAmount,
            additionalData.processingFeeAmount
          );
        }
        break;
      
      case "rejected":
        await sendLoanApplicationRejectedEmail(
          application.email,
          application.fullName,
          application.trackingNumber
        );
        break;
      
      case "fee_pending":
        if (additionalData?.processingFeeAmount) {
          await sendLoanApplicationProcessingEmail(
            application.email,
            application.fullName,
            application.trackingNumber,
            additionalData.processingFeeAmount
          );
        }
        break;
      
      case "under_review":
        if (additionalData?.infoNeeded) {
          await sendLoanApplicationMoreInfoEmail(
            application.email,
            application.fullName,
            application.trackingNumber,
            additionalData.infoNeeded
          );
        }
        break;
    }
  } catch (emailError) {
    console.error('Failed to send status update email:', emailError);
  }
}

// ============================================
// Fee Configuration Queries
// ============================================

export async function getActiveFeeConfiguration() {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(feeConfiguration)
    .where(eq(feeConfiguration.isActive, 1))
    .orderBy(desc(feeConfiguration.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createFeeConfiguration(data: InsertFeeConfiguration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Deactivate all existing configurations
  await db.update(feeConfiguration).set({ isActive: 0 });
  
  // Insert new active configuration
  const result = await db.insert(feeConfiguration).values({ ...data, isActive: 1 });
  return result;
}

export async function updateFeeConfiguration(id: number, data: Partial<FeeConfiguration>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(feeConfiguration)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(feeConfiguration.id, id));
}

// ============================================
// Payment Queries
// ============================================

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(payments).values(data);
  return result;
}

export async function getPaymentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPaymentsByLoanApplicationId(loanApplicationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(payments)
    .where(eq(payments.loanApplicationId, loanApplicationId))
    .orderBy(desc(payments.createdAt));
}

export async function updatePaymentStatus(
  id: number,
  status: Payment["status"],
  additionalData?: Partial<Payment>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(payments)
    .set({ status, ...additionalData, updatedAt: new Date() })
    .where(eq(payments.id, id));
}

// ============================================
// Disbursement Queries
// ============================================

export async function createDisbursement(data: InsertDisbursement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(disbursements).values(data);
  return result;
}

export async function getDisbursementById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(disbursements).where(eq(disbursements.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDisbursementByLoanApplicationId(loanApplicationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(disbursements)
    .where(eq(disbursements.loanApplicationId, loanApplicationId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDisbursementStatus(
  id: number,
  status: Disbursement["status"],
  additionalData?: Partial<Disbursement>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(disbursements)
    .set({ status, ...additionalData, updatedAt: new Date() })
    .where(eq(disbursements.id, id));
}

// ============================================
// Verification Documents Queries
// ============================================

export async function createVerificationDocument(data: InsertVerificationDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(verificationDocuments).values(data);
  return result;
}

export async function getVerificationDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(verificationDocuments)
    .where(eq(verificationDocuments.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getVerificationDocumentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(verificationDocuments)
    .where(eq(verificationDocuments.userId, userId))
    .orderBy(desc(verificationDocuments.createdAt));
}

export async function getAllVerificationDocuments() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(verificationDocuments)
    .orderBy(desc(verificationDocuments.createdAt));
}

export async function updateVerificationDocumentStatus(
  id: number,
  status: VerificationDocument["status"],
  reviewedBy: number,
  additionalData?: Partial<VerificationDocument>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(verificationDocuments)
    .set({ 
      status, 
      reviewedBy,
      reviewedAt: new Date(),
      ...additionalData, 
      updatedAt: new Date() 
    })
    .where(eq(verificationDocuments.id, id));
}
