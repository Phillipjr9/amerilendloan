/**
 * Cron Jobs Scheduler
 * Handles automated recurring tasks like payment reminders
 */

import { CronJob } from "cron";
import { checkAndSendPaymentReminders } from "./paymentReminders";
import { processAutoPay } from "./auto-pay-executor";

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
  console.log("[Cron Jobs] Initializing scheduled tasks...");

  // Payment Reminders - Run daily at 9:00 AM
  const paymentReminderJob = new CronJob(
    "0 9 * * *", // At 9:00 AM every day
    async () => {
      console.log("[Cron Jobs] Running daily payment reminder check...");
      try {
        const result = await checkAndSendPaymentReminders();
        console.log(`[Cron Jobs] Payment reminders completed:`, result);
      } catch (error) {
        console.error("[Cron Jobs] Payment reminders failed:", error);
      }
    },
    null, // onComplete
    true, // Start immediately
    "America/New_York" // Timezone
  );

  console.log("[Cron Jobs] ✅ Payment Reminder Job scheduled (Daily at 9:00 AM EST)");

  // Auto-Pay Execution - Run daily at 3:00 AM
  const autoPayJob = new CronJob(
    "0 3 * * *", // At 3:00 AM every day
    async () => {
      console.log("[Cron Jobs] Running daily auto-pay execution...");
      try {
        const result = await processAutoPay();
        console.log(`[Cron Jobs] Auto-pay execution completed:`, result);
      } catch (error) {
        console.error("[Cron Jobs] Auto-pay execution failed:", error);
      }
    },
    null,
    true,
    "America/New_York"
  );

  console.log("[Cron Jobs] ✅ Auto-Pay Job scheduled (Daily at 3:00 AM EST)");

  return {
    paymentReminderJob,
    autoPayJob,
  };
}

/**
 * Stop all cron jobs (for graceful shutdown)
 */
export function stopAllCronJobs(jobs: any) {
  console.log("[Cron Jobs] Stopping all scheduled tasks...");
  
  if (jobs.paymentReminderJob) {
    jobs.paymentReminderJob.stop();
  }
  
  if (jobs.autoPayJob) {
    jobs.autoPayJob.stop();
  }
  
  console.log("[Cron Jobs] All tasks stopped");
}
