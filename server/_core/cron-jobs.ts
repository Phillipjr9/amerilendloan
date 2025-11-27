/**
 * Cron Jobs Scheduler
 * Handles automated recurring tasks like payment reminders
 */

import { CronJob } from "cron";
import { checkAndSendPaymentReminders } from "./paymentReminders";

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

  // Add more cron jobs here as needed
  // Example: Auto-pay processing
  // const autoPayJob = new CronJob("0 10 * * *", async () => { ... });

  return {
    paymentReminderJob,
    // Add other jobs here
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
  
  // Stop other jobs here
  
  console.log("[Cron Jobs] All tasks stopped");
}
