/**
 * Email module using SendGrid
 * Handles sending emails including OTP codes
 */

import { ENV } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

/**
 * Send email using SendGrid API
 */
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  if (!ENV.sendGridApiKey) {
    console.error("SendGrid API key not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ENV.sendGridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: payload.to }],
            subject: payload.subject,
          },
        ],
        from: {
          email: "noreply@amerilendloan.com",
          name: "AmeriLend",
        },
        reply_to: {
          email: "support@amerilendloan.com",
          name: "AmeriLend Support",
        },
        content: [
          {
            type: "text/plain",
            value: payload.text,
          },
          {
            type: "text/html",
            value: payload.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("SendGrid API error:", errorData);
      return { success: false, error: errorData.errors?.[0]?.message || "Failed to send email" };
    }

    console.log(`Email sent successfully to ${payload.to}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send OTP code via email using SendGrid
 */
export async function sendOTPEmail(email: string, code: string, purpose: "signup" | "login" | "reset"): Promise<void> {
  const purposes = {
    signup: {
      subject: "Verify Your Email - AmeriLend",
      title: "Email Verification",
      message: "Use this code to verify your email and complete your signup.",
    },
    login: {
      subject: "Your Login Code - AmeriLend",
      title: "Login Verification",
      message: "Use this code to login to your AmeriLend account.",
    },
    reset: {
      subject: "Reset Your Password - AmeriLend",
      title: "Password Reset",
      message: "Use this code to reset your password.",
    },
  };

  const { subject, title, message } = purposes[purpose];

  const text = `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0033A0; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">AmeriLend</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
          <h2 style="color: #0033A0; margin-top: 0;">${title}</h2>
          <p>${message}</p>
          <div style="background-color: #0033A0; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">Your verification code is:</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">${code}</p>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">This code will expire in 10 minutes.</p>
          <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this code, please ignore this email.</p>
        </div>
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">© 2025 AmeriLend. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to: email, subject, text, html });
}

/**
 * Send loan application received confirmation email
 */
export async function sendLoanApplicationReceivedEmail(
  email: string,
  fullName: string,
  trackingNumber: string,
  requestedAmount: number
): Promise<void> {
  const formattedAmount = (requestedAmount / 100).toFixed(2);
  const subject = "Loan Application Received - AmeriLend";
  const text = `Dear ${fullName},\n\nThank you for submitting your loan application to AmeriLend!\n\nYour application has been received and is now under review.\n\nApplication Details:\nTracking Number: ${trackingNumber}\nRequested Amount: $${formattedAmount}\n\nWhat's Next?\n- Our team will review your application within 24 hours\n- You'll receive an email notification once a decision is made\n- You can track your application status in your dashboard\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nThe AmeriLend Team`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0033A0; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">AmeriLend</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
          <h2 style="color: #0033A0; margin-top: 0;">Application Received!</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for submitting your loan application to AmeriLend. We've received your application and our team is reviewing it.</p>
          
          <div style="background-color: white; border-left: 4px solid #0033A0; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0033A0;">Application Details</h3>
            <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
            <p style="margin: 5px 0;"><strong>Requested Amount:</strong> $${formattedAmount}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Under Review</p>
          </div>

          <h3 style="color: #0033A0;">What's Next?</h3>
          <ul style="padding-left: 20px;">
            <li>Our team will review your application within 24 hours</li>
            <li>You'll receive an email notification once a decision is made</li>
            <li>You can track your application status in your dashboard</li>
          </ul>

          <p style="margin-top: 30px;">If you have any questions, please don't hesitate to contact our support team at <a href="mailto:support@amerilendloan.com" style="color: #0033A0;">support@amerilendloan.com</a> or call us at +1 945 212-1609.</p>
        </div>
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">© 2025 AmeriLend. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to: email, subject, text, html });
}

/**
 * Send loan application approved email
 */
export async function sendLoanApplicationApprovedEmail(
  email: string,
  fullName: string,
  trackingNumber: string,
  approvedAmount: number,
  processingFee: number
): Promise<void> {
  const formattedAmount = (approvedAmount / 100).toFixed(2);
  const formattedFee = (processingFee / 100).toFixed(2);
  const subject = "Congratulations! Your Loan Application is Approved - AmeriLend";
  const text = `Dear ${fullName},\n\nGreat news! Your loan application has been approved!\n\nApplication Details:\nTracking Number: ${trackingNumber}\nApproved Amount: $${formattedAmount}\nProcessing Fee: $${formattedFee}\n\nNext Steps:\n1. Log in to your dashboard to review the loan agreement\n2. Pay the processing fee to proceed with disbursement\n3. Once the fee is paid, your funds will be disbursed within 1-2 business days\n\nPlease log in to your account to complete the next steps.\n\nBest regards,\nThe AmeriLend Team`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0033A0; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">AmeriLend</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="background-color: #28a745; color: white; display: inline-block; padding: 10px 20px; border-radius: 5px; font-size: 18px; font-weight: bold;">
              ✓ APPROVED
            </div>
          </div>
          <h2 style="color: #0033A0; margin-top: 0;">Congratulations, ${fullName}!</h2>
          <p>Your loan application has been approved! We're excited to help you with your financial needs.</p>
          
          <div style="background-color: white; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0033A0;">Approval Details</h3>
            <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
            <p style="margin: 5px 0;"><strong>Approved Amount:</strong> $${formattedAmount}</p>
            <p style="margin: 5px 0;"><strong>Processing Fee:</strong> $${formattedFee}</p>
          </div>

          <h3 style="color: #0033A0;">Next Steps</h3>
          <ol style="padding-left: 20px;">
            <li>Log in to your dashboard to review the loan agreement</li>
            <li>Pay the processing fee to proceed with disbursement</li>
            <li>Once the fee is paid, your funds will be disbursed within 1-2 business days</li>
          </ol>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://amerilendloan.com/dashboard" style="background-color: #FFA500; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Go to Dashboard</a>
          </div>

          <p style="margin-top: 30px;">Questions? Contact us at <a href="mailto:support@amerilendloan.com" style="color: #0033A0;">support@amerilendloan.com</a> or +1 945 212-1609.</p>
        </div>
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">© 2025 AmeriLend. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to: email, subject, text, html });
}

/**
 * Send loan application rejected email
 */
export async function sendLoanApplicationRejectedEmail(
  email: string,
  fullName: string,
  trackingNumber: string
): Promise<void> {
  const subject = "Loan Application Update - AmeriLend";
  const text = `Dear ${fullName},\n\nThank you for your interest in AmeriLend.\n\nAfter careful review of your application (Tracking #${trackingNumber}), we regret to inform you that we are unable to approve your loan request at this time.\n\nThis decision was based on our standard lending criteria and does not reflect negatively on you personally.\n\nYou may reapply after 30 days or explore our other loan products that might better suit your current situation.\n\nIf you have questions about this decision, please contact our support team.\n\nBest regards,\nThe AmeriLend Team`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0033A0; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">AmeriLend</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
          <h2 style="color: #0033A0; margin-top: 0;">Application Update</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for your interest in AmeriLend and for taking the time to submit your loan application.</p>
          
          <div style="background-color: white; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
            <p style="margin: 10px 0 0 0;">After careful review, we regret to inform you that we are unable to approve your loan request at this time.</p>
          </div>

          <p>This decision was based on our standard lending criteria and does not reflect negatively on you personally. Factors such as credit history, income verification, and debt-to-income ratio are considered in our review process.</p>

          <h3 style="color: #0033A0;">What You Can Do</h3>
          <ul style="padding-left: 20px;">
            <li>You may reapply after 30 days</li>
            <li>Explore our other loan products that might better suit your current situation</li>
            <li>Work on improving your credit profile and financial standing</li>
          </ul>

          <p style="margin-top: 30px;">If you have questions about this decision or would like to discuss alternative options, please contact our support team at <a href="mailto:support@amerilendloan.com" style="color: #0033A0;">support@amerilendloan.com</a> or call +1 945 212-1609.</p>
        </div>
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">© 2025 AmeriLend. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to: email, subject, text, html });
}

/**
 * Send loan application processing email (fee payment pending)
 */
export async function sendLoanApplicationProcessingEmail(
  email: string,
  fullName: string,
  trackingNumber: string,
  processingFee: number
): Promise<void> {
  const formattedFee = (processingFee / 100).toFixed(2);
  const subject = "Action Required: Complete Your Loan Processing - AmeriLend";
  const text = `Dear ${fullName},\n\nYour loan application (${trackingNumber}) is currently being processed!\n\nTo complete the disbursement process, please pay the processing fee of $${formattedFee}.\n\nProcessing Fee: $${formattedFee}\n\nOnce we receive your payment, your loan funds will be disbursed within 1-2 business days using your selected disbursement method.\n\nPlease log in to your dashboard to complete the payment.\n\nBest regards,\nThe AmeriLend Team`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0033A0; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">AmeriLend</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
          <h2 style="color: #0033A0; margin-top: 0;">Action Required: Complete Payment</h2>
          <p>Dear ${fullName},</p>
          <p>Your loan application is currently being processed and we're almost ready to disburse your funds!</p>
          
          <div style="background-color: white; border-left: 4px solid #FFA500; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0033A0;">Processing Details</h3>
            <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
            <p style="margin: 5px 0;"><strong>Processing Fee:</strong> $${formattedFee}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Awaiting Payment</p>
          </div>

          <h3 style="color: #0033A0;">Next Steps</h3>
          <p>To complete the disbursement process, please pay the processing fee. Once we receive your payment, your loan funds will be disbursed within 1-2 business days using your selected disbursement method.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://amerilendloan.com/dashboard" style="background-color: #FFA500; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Pay Processing Fee</a>
          </div>

          <p style="margin-top: 30px;">Questions? Contact us at <a href="mailto:support@amerilendloan.com" style="color: #0033A0;">support@amerilendloan.com</a> or +1 945 212-1609.</p>
        </div>
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">© 2025 AmeriLend. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to: email, subject, text, html });
}

/**
 * Send login notification email
 */
export async function sendLoginNotificationEmail(
  email: string,
  fullName: string,
  loginTime: Date,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const formattedTime = loginTime.toLocaleString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/New_York'
  });
  
  // Parse user agent for device/browser info
  let deviceInfo = 'Unknown device';
  let browserInfo = 'Unknown browser';
  
  if (userAgent) {
    if (userAgent.includes('Windows')) deviceInfo = 'Windows PC';
    else if (userAgent.includes('Mac')) deviceInfo = 'Mac';
    else if (userAgent.includes('iPhone')) deviceInfo = 'iPhone';
    else if (userAgent.includes('iPad')) deviceInfo = 'iPad';
    else if (userAgent.includes('Android')) deviceInfo = 'Android device';
    
    if (userAgent.includes('Chrome')) browserInfo = 'Chrome';
    else if (userAgent.includes('Firefox')) browserInfo = 'Firefox';
    else if (userAgent.includes('Safari')) browserInfo = 'Safari';
    else if (userAgent.includes('Edge')) browserInfo = 'Edge';
  }
  
  const subject = "New Login to Your AmeriLend Account";
  const text = `Dear ${fullName},\n\nWe detected a new login to your AmeriLend account.\n\nLogin Details:\nTime: ${formattedTime} EST\nIP Address: ${ipAddress || 'Unknown'}\nDevice: ${deviceInfo}\nBrowser: ${browserInfo}\n\nIf this was you, no action is needed.\n\nIf you did not log in, please secure your account immediately by contacting our support team at support@amerilendloan.com or +1 945 212-1609.\n\nBest regards,\nThe AmeriLend Security Team`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0033A0; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">AmeriLend</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
          <div style="background-color: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin-bottom: 20px;">
            <h2 style="color: #0c5460; margin-top: 0; font-size: 18px;">
              🔒 Security Alert: New Login Detected
            </h2>
          </div>
          
          <p>Dear ${fullName},</p>
          <p>We detected a new login to your AmeriLend account. Please review the details below:</p>
          
          <div style="background-color: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #0033A0; font-size: 16px;">Login Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Time:</strong></td>
                <td style="padding: 8px 0;">${formattedTime} EST</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>IP Address:</strong></td>
                <td style="padding: 8px 0;">${ipAddress || 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Device:</strong></td>
                <td style="padding: 8px 0;">${deviceInfo}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Browser:</strong></td>
                <td style="padding: 8px 0;">${browserInfo}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; color: #155724;">
              <strong>✓ Was this you?</strong> No action needed. You're all set!
            </p>
          </div>

          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; color: #721c24;">
              <strong>⚠️ Wasn't you?</strong> Secure your account immediately!
            </p>
          </div>

          <h3 style="color: #0033A0; margin-top: 30px;">Protect Your Account</h3>
          <ul style="padding-left: 20px;">
            <li>Never share your OTP codes with anyone</li>
            <li>Use a strong, unique password</li>
            <li>Log out after each session on shared devices</li>
            <li>Contact us immediately if you notice suspicious activity</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 10px;">Need help? Contact our security team:</p>
            <a href="mailto:support@amerilendloan.com" style="color: #0033A0; text-decoration: none; font-weight: bold;">support@amerilendloan.com</a>
            <br>
            <span style="color: #0033A0; font-weight: bold;">+1 945 212-1609</span>
          </div>
        </div>
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">© 2025 AmeriLend. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated security notification.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to: email, subject, text, html });
}
export async function sendLoanApplicationMoreInfoEmail(
  email: string,
  fullName: string,
  trackingNumber: string,
  infoNeeded: string
): Promise<void> {
  const subject = "Additional Information Required - AmeriLend";
  const text = `Dear ${fullName},\n\nWe're reviewing your loan application (${trackingNumber}) and need some additional information to proceed.\n\nInformation Needed:\n${infoNeeded}\n\nPlease log in to your dashboard to provide the requested information. This will help us process your application more quickly.\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nThe AmeriLend Team`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0033A0; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">AmeriLend</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
          <h2 style="color: #0033A0; margin-top: 0;">Additional Information Required</h2>
          <p>Dear ${fullName},</p>
          <p>We're reviewing your loan application and need some additional information to proceed with the approval process.</p>
          
          <div style="background-color: white; border-left: 4px solid #FFA500; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0033A0;">Application Details</h3>
            <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Additional Information Needed</p>
          </div>

          <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #856404;">Information Needed:</h3>
            <p style="margin: 0; white-space: pre-line;">${infoNeeded}</p>
          </div>

          <p>Please log in to your dashboard to provide the requested information. This will help us process your application more quickly and efficiently.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://amerilendloan.com/dashboard" style="background-color: #0033A0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Go to Dashboard</a>
          </div>

          <p style="margin-top: 30px;">If you have any questions or need clarification, please contact our support team at <a href="mailto:support@amerilendloan.com" style="color: #0033A0;">support@amerilendloan.com</a> or call +1 945 212-1609.</p>
        </div>
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">© 2025 AmeriLend. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to: email, subject, text, html });
}

/**
 * Send notification email
 */
export async function sendNotificationEmail(
  to: string,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to,
    subject,
    text: message,
    html: `<p>${message.replace(/\n/g, "<br>")}</p>`,
  });
}
