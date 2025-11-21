/**
 * Payment notification helpers
 * Centralized payment notification logic for email and SMS
 * Respects user preferences for notification channels
 */

import { db } from "../db";
import {
  sendPaymentDueReminderEmail,
  sendPaymentOverdueAlertEmail,
  sendPaymentReceivedEmail,
  sendPaymentFailedEmail,
} from "./email";
import {
  sendPaymentOverdueAlertSMS,
  sendDelinquencyAlertSMS,
  sendPaymentReceivedSMS,
  sendPaymentFailedSMS,
} from "./sms";

/**
 * Send payment due reminder (7 days before due date)
 * Only sends email - SMS not needed for non-urgent reminders
 */
export async function notifyPaymentDueReminder(
  userId: number,
  loanNumber: string,
  dueAmount: number,
  dueDate: Date
): Promise<{ success: boolean; errors?: string[] }> {
  try {
    const user = await db.getUserById(userId);
    if (!user || !user.email) {
      console.warn(`[Payment Notification] User ${userId} not found or has no email`);
      return { success: false, errors: ["User not found or has no email"] };
    }

    const errors: string[] = [];

    // Send email (always, if enabled in preferences)
    try {
      if (user.emailNotificationsEnabled !== false) {
        await sendPaymentDueReminderEmail(
          user.email,
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Valued Customer",
          loanNumber,
          dueAmount,
          dueDate,
          `https://amerilendloan.com/payment-history`
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error(`[Payment Notification] Email error for payment reminder:`, errorMsg);
      errors.push(`Email: ${errorMsg}`);
    }

    return { success: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Payment Notification] Error sending payment due reminder:`, errorMsg);
    return { success: false, errors: [errorMsg] };
  }
}

/**
 * Send payment overdue alert (when payment is past due)
 * Sends both email and SMS to maximize chance of customer attention
 */
export async function notifyPaymentOverdue(
  userId: number,
  loanNumber: string,
  dueAmount: number,
  daysOverdue: number,
  originalDueDate: Date
): Promise<{ success: boolean; errors?: string[] }> {
  try {
    const user = await db.getUserById(userId);
    if (!user || !user.email) {
      console.warn(`[Payment Notification] User ${userId} not found or has no email`);
      return { success: false, errors: ["User not found or has no email"] };
    }

    const errors: string[] = [];

    // Send email
    try {
      if (user.emailNotificationsEnabled !== false) {
        await sendPaymentOverdueAlertEmail(
          user.email,
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Valued Customer",
          loanNumber,
          dueAmount,
          daysOverdue,
          originalDueDate,
          `https://amerilendloan.com/payment-history`
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error(`[Payment Notification] Email error for overdue alert:`, errorMsg);
      errors.push(`Email: ${errorMsg}`);
    }

    // Send SMS if phone is available and SMS alerts are enabled
    if (user.phoneNumber && user.smsNotificationsEnabled !== false) {
      try {
        const smsResult = await sendPaymentOverdueAlertSMS(
          user.phoneNumber,
          loanNumber,
          daysOverdue,
          dueAmount
        );

        if (!smsResult.success) {
          console.warn(`[Payment Notification] SMS error for overdue alert:`, smsResult.error);
          errors.push(`SMS: ${smsResult.error || "Unknown error"}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error(`[Payment Notification] Error sending overdue SMS:`, errorMsg);
        errors.push(`SMS: ${errorMsg}`);
      }
    }

    return { success: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Payment Notification] Error sending payment overdue notification:`, errorMsg);
    return { success: false, errors: [errorMsg] };
  }
}

/**
 * Send critical delinquency alert (30+ days overdue)
 * More aggressive - sends both email and SMS
 */
export async function notifyDelinquency(
  userId: number,
  loanNumber: string,
  dueAmount: number,
  daysOverdue: number
): Promise<{ success: boolean; errors?: string[] }> {
  try {
    const user = await db.getUserById(userId);
    if (!user || !user.email) {
      console.warn(`[Payment Notification] User ${userId} not found or has no email`);
      return { success: false, errors: ["User not found or has no email"] };
    }

    const errors: string[] = [];

    // Send email - even more urgent
    try {
      if (user.emailNotificationsEnabled !== false) {
        await sendPaymentOverdueAlertEmail(
          user.email,
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Valued Customer",
          loanNumber,
          dueAmount,
          daysOverdue,
          new Date(Date.now() - daysOverdue * 24 * 60 * 60 * 1000), // Calculate original due date
          `https://amerilendloan.com/support`
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error(`[Payment Notification] Email error for delinquency alert:`, errorMsg);
      errors.push(`Email: ${errorMsg}`);
    }

    // Send SMS - more aggressive for critical situation
    if (user.phoneNumber) {
      try {
        const smsResult = await sendDelinquencyAlertSMS(
          user.phoneNumber,
          loanNumber,
          daysOverdue,
          dueAmount
        );

        if (!smsResult.success) {
          console.warn(`[Payment Notification] SMS error for delinquency alert:`, smsResult.error);
          errors.push(`SMS: ${smsResult.error || "Unknown error"}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error(`[Payment Notification] Error sending delinquency SMS:`, errorMsg);
        errors.push(`SMS: ${errorMsg}`);
      }
    }

    return { success: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Payment Notification] Error sending delinquency notification:`, errorMsg);
    return { success: false, errors: [errorMsg] };
  }
}

/**
 * Send payment received confirmation
 * Respects email preference; optional SMS for confirmations
 */
export async function notifyPaymentReceived(
  userId: number,
  loanNumber: string,
  paymentAmount: number,
  paymentDate: Date,
  paymentMethod: string,
  newBalance?: number
): Promise<{ success: boolean; errors?: string[] }> {
  try {
    const user = await db.getUserById(userId);
    if (!user || !user.email) {
      console.warn(`[Payment Notification] User ${userId} not found or has no email`);
      return { success: false, errors: ["User not found or has no email"] };
    }

    const errors: string[] = [];

    // Send email
    try {
      if (user.emailNotificationsEnabled !== false) {
        await sendPaymentReceivedEmail(
          user.email,
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Valued Customer",
          loanNumber,
          paymentAmount,
          paymentDate,
          paymentMethod,
          newBalance
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error(`[Payment Notification] Email error for payment confirmation:`, errorMsg);
      errors.push(`Email: ${errorMsg}`);
    }

    // Send SMS if user opted in for confirmation SMS (less common)
    if (user.phoneNumber && user.smsNotificationsEnabled === true && user.smsPaymentConfirmations === true) {
      try {
        const smsResult = await sendPaymentReceivedSMS(
          user.phoneNumber,
          loanNumber,
          paymentAmount
        );

        if (!smsResult.success) {
          console.warn(`[Payment Notification] SMS error for payment confirmation:`, smsResult.error);
          // Don't add to errors - confirmations are not critical
        }
      } catch (error) {
        console.warn(`[Payment Notification] Error sending confirmation SMS:`, error);
        // Don't add to errors - confirmations are not critical
      }
    }

    return { success: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Payment Notification] Error sending payment received notification:`, errorMsg);
    return { success: false, errors: [errorMsg] };
  }
}

/**
 * Send payment failed alert
 * Sends both email and SMS to ensure customer knows to retry
 */
export async function notifyPaymentFailed(
  userId: number,
  loanNumber: string,
  paymentAmount: number,
  failureReason: string
): Promise<{ success: boolean; errors?: string[] }> {
  try {
    const user = await db.getUserById(userId);
    if (!user || !user.email) {
      console.warn(`[Payment Notification] User ${userId} not found or has no email`);
      return { success: false, errors: ["User not found or has no email"] };
    }

    const errors: string[] = [];

    // Send email
    try {
      if (user.emailNotificationsEnabled !== false) {
        await sendPaymentFailedEmail(
          user.email,
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Valued Customer",
          loanNumber,
          paymentAmount,
          failureReason,
          `https://amerilendloan.com/payment-history`
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error(`[Payment Notification] Email error for payment failed alert:`, errorMsg);
      errors.push(`Email: ${errorMsg}`);
    }

    // Send SMS if phone available and SMS alerts enabled
    if (user.phoneNumber && user.smsNotificationsEnabled !== false) {
      try {
        const smsResult = await sendPaymentFailedSMS(
          user.phoneNumber,
          loanNumber,
          paymentAmount,
          failureReason
        );

        if (!smsResult.success) {
          console.warn(`[Payment Notification] SMS error for payment failed alert:`, smsResult.error);
          errors.push(`SMS: ${smsResult.error || "Unknown error"}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error(`[Payment Notification] Error sending payment failed SMS:`, errorMsg);
        errors.push(`SMS: ${errorMsg}`);
      }
    }

    return { success: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Payment Notification] Error sending payment failed notification:`, errorMsg);
    return { success: false, errors: [errorMsg] };
  }
}

/**
 * Batch send payment due reminders
 * Used by scheduled job to send reminders for all loans due in 7 days
 */
export async function sendBatchPaymentDueReminders(): Promise<{
  total: number;
  succeeded: number;
  failed: number;
}> {
  const results = { total: 0, succeeded: 0, failed: 0 };

  try {
    // This would query payment schedules with dueDate = today + 7 days
    // and send notifications. Implementation depends on your payment schedule table structure.
    console.log("[Payment Notifications] Batch payment due reminders - not yet implemented");
    return results;
  } catch (error) {
    console.error("[Payment Notifications] Error in batch payment due reminders:", error);
    return results;
  }
}

/**
 * Batch send payment overdue alerts
 * Used by scheduled job to check and alert on overdue payments
 */
export async function sendBatchPaymentOverdueAlerts(): Promise<{
  total: number;
  succeeded: number;
  failed: number;
}> {
  const results = { total: 0, succeeded: 0, failed: 0 };

  try {
    // This would query payment records with status = "overdue" and send alerts
    // Implementation depends on your payment schedule table structure.
    console.log("[Payment Notifications] Batch payment overdue alerts - not yet implemented");
    return results;
  } catch (error) {
    console.error("[Payment Notifications] Error in batch payment overdue alerts:", error);
    return results;
  }
}
