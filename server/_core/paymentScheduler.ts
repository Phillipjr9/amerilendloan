/**
 * Payment notification scheduler
 * Runs periodic checks for:
 * - Payments due in 7 days (send reminders)
 * - Overdue payments (send alerts)
 * - Delinquencies (send critical alerts)
 */

import { db } from "../db";
import {
  notifyPaymentDueReminder,
  notifyPaymentOverdue,
  notifyDelinquency,
} from "./paymentNotifications";

interface ScheduleOptions {
  intervalMs?: number; // Check interval in milliseconds (default: 1 hour)
  enablePaymentDueReminders?: boolean; // 7 days before due (default: true)
  enablePaymentOverdueAlerts?: boolean; // 1+ days overdue (default: true)
  enableDelinquencyAlerts?: boolean; // 30+ days overdue (default: true)
}

class PaymentNotificationScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private options: Required<ScheduleOptions> = {
    intervalMs: 60 * 60 * 1000, // 1 hour default
    enablePaymentDueReminders: true,
    enablePaymentOverdueAlerts: true,
    enableDelinquencyAlerts: true,
  };

  constructor(options?: ScheduleOptions) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.warn("[Payment Scheduler] Scheduler already running");
      return;
    }

    console.log(
      "[Payment Scheduler] Starting payment notification scheduler",
      `(interval: ${this.options.intervalMs}ms)`
    );

    this.isRunning = true;

    // Run immediately on start
    this.runCheck().catch((error) => {
      console.error("[Payment Scheduler] Error on initial check:", error);
    });

    // Then set up recurring interval
    this.intervalId = setInterval(
      () => {
        this.runCheck().catch((error) => {
          console.error("[Payment Scheduler] Error in scheduled check:", error);
        });
      },
      this.options.intervalMs
    );
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      console.warn("[Payment Scheduler] Scheduler not running");
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log("[Payment Scheduler] Payment notification scheduler stopped");
  }

  /**
   * Perform a single check
   */
  private async runCheck(): Promise<void> {
    try {
      console.log("[Payment Scheduler] Running payment notification check...");

      let totalProcessed = 0;
      let totalErrors = 0;

      // Check for payments due in 7 days
      if (this.options.enablePaymentDueReminders) {
        try {
          const result = await this.checkPaymentDueReminders();
          totalProcessed += result.processed;
          totalErrors += result.errors;
        } catch (error) {
          console.error("[Payment Scheduler] Error checking payment due reminders:", error);
          totalErrors++;
        }
      }

      // Check for overdue payments
      if (this.options.enablePaymentOverdueAlerts) {
        try {
          const result = await this.checkPaymentOverdue();
          totalProcessed += result.processed;
          totalErrors += result.errors;
        } catch (error) {
          console.error("[Payment Scheduler] Error checking overdue payments:", error);
          totalErrors++;
        }
      }

      // Check for delinquencies
      if (this.options.enableDelinquencyAlerts) {
        try {
          const result = await this.checkDelinquencies();
          totalProcessed += result.processed;
          totalErrors += result.errors;
        } catch (error) {
          console.error("[Payment Scheduler] Error checking delinquencies:", error);
          totalErrors++;
        }
      }

      console.log(
        `[Payment Scheduler] Check complete: ${totalProcessed} notifications sent, ${totalErrors} errors`
      );
    } catch (error) {
      console.error("[Payment Scheduler] Fatal error in runCheck:", error);
    }
  }

  /**
   * Check for payments due in 7 days and send reminders
   */
  private async checkPaymentDueReminders(): Promise<{
    processed: number;
    errors: number;
  }> {
    console.log("[Payment Scheduler] Checking for payment due reminders (7 days)...");

    let processed = 0;
    let errors = 0;

    try {
      // Query payment schedules with dueDate = today + 7 days (approximately)
      // This is a placeholder - actual implementation depends on your DB schema
      // You would query payment_schedules table where:
      // - dueDate is approximately today + 7 days
      // - status is 'pending' or 'not_paid'
      // - loan is not delinquent
      // - user has email notifications enabled

      // For now, log placeholder
      console.log(
        "[Payment Scheduler] [PLACEHOLDER] Would check for payments due in 7 days"
      );

      // Example of what the actual query might look like:
      // const paymentsDue = await db.query(
      //   `SELECT ps.*, u.id as userId, u.email, u.firstName, u.lastName, la.trackingNumber
      //    FROM payment_schedules ps
      //    JOIN loans la ON ps.loanId = la.id
      //    JOIN users u ON la.userId = u.id
      //    WHERE ps.status IN ('pending', 'not_paid')
      //    AND DATE(ps.dueDate) = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      //    AND la.status NOT IN ('delinquent', 'defaulted')
      //    AND (u.emailNotificationsEnabled IS NULL OR u.emailNotificationsEnabled = true)`
      // );

      // for (const payment of paymentsDue) {
      //   try {
      //     await notifyPaymentDueReminder(
      //       payment.userId,
      //       payment.trackingNumber,
      //       payment.amount,
      //       new Date(payment.dueDate)
      //     );
      //     processed++;
      //   } catch (error) {
      //     console.error(`Failed to send reminder for payment ${payment.id}:`, error);
      //     errors++;
      //   }
      // }
    } catch (error) {
      console.error("[Payment Scheduler] Error in checkPaymentDueReminders:", error);
      errors++;
    }

    console.log(
      `[Payment Scheduler] Payment due reminders: ${processed} sent, ${errors} errors`
    );
    return { processed, errors };
  }

  /**
   * Check for overdue payments and send alerts
   */
  private async checkPaymentOverdue(): Promise<{
    processed: number;
    errors: number;
  }> {
    console.log("[Payment Scheduler] Checking for overdue payments...");

    let processed = 0;
    let errors = 0;

    try {
      // Query payment schedules with dueDate in the past
      // Status: pending/not_paid, 1-29 days overdue

      // Example query:
      // const overduePayments = await db.query(
      //   `SELECT ps.*, u.id as userId, u.email, u.firstName, u.lastName, u.phone,
      //           u.smsNotificationsEnabled, la.trackingNumber,
      //           DATEDIFF(CURDATE(), DATE(ps.dueDate)) as daysOverdue
      //    FROM payment_schedules ps
      //    JOIN loans la ON ps.loanId = la.id
      //    JOIN users u ON la.userId = u.id
      //    WHERE ps.status IN ('pending', 'not_paid')
      //    AND ps.dueDate < CURDATE()
      //    AND DATEDIFF(CURDATE(), DATE(ps.dueDate)) BETWEEN 1 AND 29
      //    AND la.status NOT IN ('delinquent', 'defaulted')
      //    AND (u.emailNotificationsEnabled IS NULL OR u.emailNotificationsEnabled = true)`
      // );

      // for (const payment of overduePayments) {
      //   try {
      //     await notifyPaymentOverdue(
      //       payment.userId,
      //       payment.trackingNumber,
      //       payment.amount,
      //       payment.daysOverdue,
      //       new Date(payment.dueDate)
      //     );
      //     processed++;
      //   } catch (error) {
      //     console.error(`Failed to send overdue alert for payment ${payment.id}:`, error);
      //     errors++;
      //   }
      // }

      console.log(
        "[Payment Scheduler] [PLACEHOLDER] Would check for overdue payments (1-29 days)"
      );
    } catch (error) {
      console.error("[Payment Scheduler] Error in checkPaymentOverdue:", error);
      errors++;
    }

    console.log(
      `[Payment Scheduler] Overdue payment alerts: ${processed} sent, ${errors} errors`
    );
    return { processed, errors };
  }

  /**
   * Check for delinquent payments and send critical alerts
   */
  private async checkDelinquencies(): Promise<{
    processed: number;
    errors: number;
  }> {
    console.log("[Payment Scheduler] Checking for delinquencies (30+ days)...");

    let processed = 0;
    let errors = 0;

    try {
      // Query payment schedules with dueDate 30+ days in past
      // Mark loan as delinquent if not already

      // Example query:
      // const delinquentPayments = await db.query(
      //   `SELECT ps.*, u.id as userId, u.email, u.firstName, u.lastName, u.phone,
      //           la.trackingNumber, la.id as loanId,
      //           DATEDIFF(CURDATE(), DATE(ps.dueDate)) as daysOverdue
      //    FROM payment_schedules ps
      //    JOIN loans la ON ps.loanId = la.id
      //    JOIN users u ON la.userId = u.id
      //    WHERE ps.status IN ('pending', 'not_paid')
      //    AND ps.dueDate < CURDATE()
      //    AND DATEDIFF(CURDATE(), DATE(ps.dueDate)) >= 30
      //    AND (u.emailNotificationsEnabled IS NULL OR u.emailNotificationsEnabled = true)`
      // );

      // for (const payment of delinquentPayments) {
      //   try {
      //     // Mark loan as delinquent
      //     if (payment.loanStatus !== 'delinquent') {
      //       await db.updateLoanApplicationStatus(payment.loanId, 'delinquent');
      //     }

      //     await notifyDelinquency(
      //       payment.userId,
      //       payment.trackingNumber,
      //       payment.amount,
      //       payment.daysOverdue
      //     );
      //     processed++;
      //   } catch (error) {
      //     console.error(`Failed to send delinquency alert for payment ${payment.id}:`, error);
      //     errors++;
      //   }
      // }

      console.log(
        "[Payment Scheduler] [PLACEHOLDER] Would check for delinquencies (30+ days)"
      );
    } catch (error) {
      console.error("[Payment Scheduler] Error in checkDelinquencies:", error);
      errors++;
    }

    console.log(
      `[Payment Scheduler] Delinquency alerts: ${processed} sent, ${errors} errors`
    );
    return { processed, errors };
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    intervalMs: number;
    options: Required<ScheduleOptions>;
  } {
    return {
      isRunning: this.isRunning,
      intervalMs: this.options.intervalMs,
      options: this.options,
    };
  }

  /**
   * Update scheduler options
   */
  updateOptions(options: Partial<ScheduleOptions>): void {
    const wasRunning = this.isRunning;

    if (wasRunning) {
      this.stop();
    }

    this.options = { ...this.options, ...options };

    if (wasRunning) {
      this.start();
    }

    console.log("[Payment Scheduler] Options updated:", this.options);
  }
}

// Create singleton instance
export const paymentNotificationScheduler = new PaymentNotificationScheduler({
  intervalMs: process.env.PAYMENT_SCHEDULER_INTERVAL_MS
    ? parseInt(process.env.PAYMENT_SCHEDULER_INTERVAL_MS)
    : 60 * 60 * 1000, // 1 hour default
  enablePaymentDueReminders:
    process.env.PAYMENT_SCHEDULER_DUE_REMINDERS !== "false",
  enablePaymentOverdueAlerts:
    process.env.PAYMENT_SCHEDULER_OVERDUE_ALERTS !== "false",
  enableDelinquencyAlerts:
    process.env.PAYMENT_SCHEDULER_DELINQUENCY_ALERTS !== "false",
});

/**
 * Initialize the scheduler (should be called during app startup)
 */
export function initializePaymentNotificationScheduler(): void {
  if (process.env.DISABLE_PAYMENT_SCHEDULER === "true") {
    console.log(
      "[Payment Scheduler] Scheduler disabled via DISABLE_PAYMENT_SCHEDULER env var"
    );
    return;
  }

  paymentNotificationScheduler.start();
}

/**
 * Shutdown the scheduler (should be called during app shutdown)
 */
export function shutdownPaymentNotificationScheduler(): void {
  paymentNotificationScheduler.stop();
}

export default paymentNotificationScheduler;
