/**
 * Password reset confirmation email function
 */

import { sendEmail } from "./email";
import { getEmailHeader, getEmailFooter } from "./companyConfig";

/**
 * Send password reset confirmation email
 */
export async function sendPasswordResetConfirmationEmail(email: string, userName?: string): Promise<void> {
  const subject = "Password Reset Successful";
  const displayName = userName ? userName.split(" ")[0] : "User";
  
  const text = `
Hi ${displayName},

Your password has been successfully reset. You can now log in with your new password.

If you did not request this password reset, please contact our support team immediately at support@amerilendloan.com.

Best regards,
AmeriLend Team
  `.trim();

  const html = `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333;">
        ${getEmailHeader()}
        
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0033A0; font-size: 24px; margin-bottom: 20px;">Password Reset Successful</h1>
          
          <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
            Hi ${displayName},
          </p>

          <div class="section" style="background-color: #f0f9ff; border-left: 4px solid #28a745; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #28a745; font-size: 14px;">
              ✓ Your password has been successfully reset.
            </p>
          </div>

          <p style="font-size: 14px; color: #666; margin: 20px 0;">
            You can now log in to your AmeriLend account using your new password.
          </p>

          <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #856404;">Security Reminder:</h3>
            <ul style="color: #856404; margin-bottom: 0; padding-left: 20px;">
              <li>Never share your password with anyone</li>
              <li>Use a strong, unique password</li>
              <li>Log out from shared devices</li>
              <li>Change your password regularly</li>
            </ul>
          </div>

          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            <strong>Need Help?</strong><br>
            If you did not request this password reset or need assistance, please contact our support team at 
            <a href="mailto:support@amerilendloan.com" style="color: #0033A0; text-decoration: none;">support@amerilendloan.com</a>
          </p>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">This is an automated notification. Please do not reply to this email.</p>
        </div>
        ${getEmailFooter()}
      </body>
    </html>
  `;

  await sendEmail({ to: email, subject, text, html });
}
