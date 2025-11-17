/**
 * SMS notification module using Twilio
 * Handles sending SMS messages including OTP codes
 */

import { ENV } from "./env";

/**
 * Send SMS using Twilio
 */
export async function sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (!ENV.twilioAccountSid || !ENV.twilioAuthToken || !ENV.twilioPhoneNumber) {
    console.error("Twilio credentials not configured");
    return { success: false, error: "SMS service not configured" };
  }

  try {
    const auth = Buffer.from(`${ENV.twilioAccountSid}:${ENV.twilioAuthToken}`).toString('base64');
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ENV.twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: ENV.twilioPhoneNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Twilio API error:', errorData);
      return { success: false, error: errorData.message || 'Failed to send SMS' };
    }

    const data = await response.json();
    console.log(`SMS sent successfully to ${to}. SID: ${data.sid}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send OTP code via SMS
 */
export async function sendOTPSMS(phone: string, code: string, purpose: "signup" | "login" | "reset"): Promise<void> {
  const purposeText = purpose === "reset" ? "account recovery" : purpose;
  const message = `Your AmeriLend ${purposeText} verification code is: ${code}. This code will expire in 10 minutes.`;
  
  const result = await sendSMS(phone, message);
  
  if (!result.success) {
    console.error(`Failed to send OTP SMS to ${phone}:`, result.error);
    // Log but don't throw - we'll still log to console as fallback
  }
  
  // Also log to console for development
  console.log(`
═══════════════════════════════════════
  OTP CODE FOR ${purpose.toUpperCase()} (SMS)
═══════════════════════════════════════
  Phone: ${phone}
  Code: ${code}
  Purpose: ${purposeText}
  Expires in: 10 minutes
═══════════════════════════════════════
  `);
}

/**
 * Send notification SMS
 */
export async function sendNotificationSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  return sendSMS(phone, message);
}
