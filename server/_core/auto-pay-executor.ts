/**
 * Auto-Pay Execution System
 * Automatically charges saved payment methods when payments are due
 */

import { db } from "../db";
import { createAuthorizeNetTransaction } from "./authorizenet";
import { createCryptoPayment } from "./crypto-payment";
import { sendPaymentConfirmationEmail, sendPaymentFailedEmail } from "./email";

/**
 * Process all auto-pay scheduled payments
 * Should run daily via cron job
 */
export async function processAutoPay() {
  console.log("[Auto-Pay] Starting auto-pay execution...");
  
  try {
    const now = new Date();
    
    // Get all loans with auto-pay enabled
    const autoPayLoans = await db.getAutoPayEnabledLoans();
    
    if (!autoPayLoans || autoPayLoans.length === 0) {
      console.log("[Auto-Pay] No auto-pay enabled loans found");
      return { success: true, processed: 0, successful: 0, failed: 0 };
    }

    let processed = 0;
    let successful = 0;
    let failed = 0;
    
    for (const loan of autoPayLoans) {
      try {
        // Calculate next payment due
        const schedule = calculatePaymentSchedule(loan);
        const nextPayment = schedule.find(p => {
          const dueDate = new Date(p.dueDate);
          return dueDate <= now && !p.paid;
        });
        
        if (!nextPayment) {
          console.log(`[Auto-Pay] No payment due for loan ${loan.id}`);
          continue;
        }
        
        // Check if payment was already attempted today
        const alreadyAttempted = await db.wasPaymentAttemptedToday(loan.id);
        if (alreadyAttempted) {
          console.log(`[Auto-Pay] Payment already attempted today for loan ${loan.id}`);
          continue;
        }
        
        // Get user's default payment method
        const paymentMethod = await db.getDefaultPaymentMethod(loan.userId);
        if (!paymentMethod) {
          console.log(`[Auto-Pay] No default payment method for loan ${loan.id}`);
          await db.logAutoPayFailure(loan.id, "No payment method");
          continue;
        }
        
        // Get user details
        const user = await db.getUserById(loan.userId);
        if (!user?.email) {
          console.log(`[Auto-Pay] No user found for loan ${loan.id}`);
          continue;
        }
        
        processed++;
        
        // Execute payment based on method type
        let paymentResult;
        
        if (paymentMethod.type === 'card') {
          // Process card payment
          paymentResult = await processCardAutoPayment(
            loan,
            paymentMethod,
            nextPayment.amount,
            user
          );
        } else if (paymentMethod.type === 'crypto') {
          // Process crypto payment
          paymentResult = await processCryptoAutoPayment(
            loan,
            paymentMethod,
            nextPayment.amount,
            user
          );
        } else {
          console.error(`[Auto-Pay] Unknown payment method type: ${paymentMethod.type}`);
          await db.logAutoPayFailure(loan.id, "Unknown payment method type");
          failed++;
          continue;
        }
        
        if (paymentResult.success) {
          successful++;
          console.log(`[Auto-Pay] ✅ Successfully processed payment for loan ${loan.id}`);
          
          // Send confirmation email
          await sendPaymentConfirmationEmail(
            user.email,
            user.name || user.email,
            loan.trackingNumber,
            nextPayment.amount,
            paymentMethod.type === 'card' ? `${paymentMethod.cardBrand} ****${paymentMethod.last4}` : 'Crypto Wallet'
          );
        } else {
          failed++;
          console.log(`[Auto-Pay] ❌ Failed to process payment for loan ${loan.id}: ${paymentResult.error}`);
          
          // Log failure
          await db.logAutoPayFailure(loan.id, paymentResult.error || "Payment failed");
          
          // Send failure notification
          await sendPaymentFailedEmail(
            user.email,
            user.name || user.email,
            loan.trackingNumber,
            nextPayment.amount,
            paymentResult.error || "Payment processing failed"
          );
        }
        
      } catch (loanError) {
        console.error(`[Auto-Pay] Error processing loan ${loan.id}:`, loanError);
        failed++;
        await db.logAutoPayFailure(loan.id, loanError instanceof Error ? loanError.message : "Unknown error");
      }
    }
    
    console.log(`[Auto-Pay] Completed. Processed: ${processed}, Successful: ${successful}, Failed: ${failed}`);
    return { success: true, processed, successful, failed };
    
  } catch (error) {
    console.error("[Auto-Pay] Fatal error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      processed: 0,
      successful: 0,
      failed: 0
    };
  }
}

/**
 * Process card auto-payment
 */
async function processCardAutoPayment(
  loan: any,
  paymentMethod: any,
  amount: number,
  user: any
) {
  try {
    // Note: In production, you'd retrieve the full card token from secure storage
    // For now, we'll create a transaction with the stored card details
    const result = await createAuthorizeNetTransaction({
      amount: amount / 100, // Convert cents to dollars
      cardNumber: "TOKENIZED", // In production, use tokenized card
      expiryMonth: paymentMethod.expiryMonth,
      expiryYear: paymentMethod.expiryYear,
      cvv: "000", // CVV not stored for security - use token instead
      cardholderName: paymentMethod.nameOnCard,
      billingAddress: {
        firstName: user.name?.split(' ')[0] || 'User',
        lastName: user.name?.split(' ')[1] || 'Name',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zip: user.zipCode || '',
        country: 'US'
      }
    });
    
    if (result.success) {
      // Record payment in database
      await db.createPayment({
        userId: user.id,
        loanApplicationId: loan.id,
        amount: amount,
        method: 'card',
        status: 'completed',
        transactionId: result.transactionId,
        metadata: {
          cardBrand: paymentMethod.cardBrand,
          last4: paymentMethod.last4,
          autoPayment: true
        }
      });
      
      return { success: true, transactionId: result.transactionId };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("[Auto-Pay] Card payment error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Card payment failed" 
    };
  }
}

/**
 * Process crypto auto-payment
 */
async function processCryptoAutoPayment(
  loan: any,
  paymentMethod: any,
  amount: number,
  user: any
) {
  try {
    const result = await createCryptoPayment({
      amount: amount / 100, // Convert cents to dollars
      walletAddress: paymentMethod.walletAddress,
      userId: user.id,
      loanId: loan.id
    });
    
    if (result.success) {
      // Record payment in database
      await db.createPayment({
        userId: user.id,
        loanApplicationId: loan.id,
        amount: amount,
        method: 'crypto',
        status: 'pending', // Crypto payments start as pending
        transactionId: result.chargeCode,
        metadata: {
          walletAddress: paymentMethod.walletAddress,
          autoPayment: true
        }
      });
      
      return { success: true, transactionId: result.chargeCode };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("[Auto-Pay] Crypto payment error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Crypto payment failed" 
    };
  }
}

/**
 * Calculate payment schedule for a loan
 */
function calculatePaymentSchedule(loan: any) {
  if (!loan.approvedAmount || !loan.disbursedAt) return [];
  
  const loanAmount = loan.approvedAmount / 100;
  const interestRate = loan.interestRate || 5.5; // APR
  const loanTermYears = loan.termYears || 5;
  
  const monthlyRate = (interestRate / 100) / 12;
  const numPayments = loanTermYears * 12;
  
  // Monthly payment calculation (amortization)
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const schedule = [];
  const disbursedDate = new Date(loan.disbursedAt);
  
  for (let i = 1; i <= numPayments; i++) {
    const dueDate = new Date(disbursedDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    schedule.push({
      month: i,
      dueDate: dueDate.toISOString(),
      amount: Math.round(monthlyPayment * 100), // Convert to cents
      paid: false, // Would check against payment records in production
    });
  }
  
  return schedule;
}

/**
 * Manual trigger for testing (admin only)
 */
export async function triggerAutoPayForLoan(loanId: number) {
  console.log(`[Auto-Pay] Manual trigger for loan ${loanId}...`);
  
  try {
    const loan = await db.getLoanApplicationById(loanId);
    if (!loan) {
      throw new Error("Loan not found");
    }
    
    if (!loan.autoPayEnabled) {
      throw new Error("Auto-pay not enabled for this loan");
    }
    
    // Process this single loan
    const result = await processAutoPay();
    
    console.log(`[Auto-Pay] Manual trigger completed`);
    return { success: true, result };
    
  } catch (error) {
    console.error("[Auto-Pay] Manual trigger failed:", error);
    throw error;
  }
}
