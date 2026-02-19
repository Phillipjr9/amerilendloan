/**
 * Company Information Configuration
 * Used in email templates and footer
 */

export const COMPANY_INFO = {
  name: "AmeriLend",
  logo: {
    url: "https://www.amerilendloan.com/images/logo-new.jpg",
    alt: "AmeriLend Logo",
  },
  contact: {
    email: "support@amerilendloan.com",
    phone: "+1 (945) 212-1609",
    phoneFormatted: "+1 945 212-1609",
    whatsapp: "+1 (945) 212-1609",
    telegram: "@amerilendloans",
  },
  admin: {
    email: "admin@amerilendloan.com",
  },
  address: {
    street: "12707 High Bluff Drive, Suite 200",
    city: "San Diego",
    state: "CA",
    zip: "92130",
    country: "USA",
    formatted: "12707 High Bluff Drive, Suite 200, San Diego, CA 92130, USA",
  },
  website: "https://www.amerilendloan.com",
  social: {
    facebook: "https://facebook.com/amerilend",
    twitter: "https://twitter.com/amerilend",
    instagram: "https://instagram.com/amerilend",
    linkedin: "https://linkedin.com/company/amerilend",
  },
  images: {
    whatsappIcon: "https://www.amerilendloan.com/images/whatsapp-logo.png",
    telegramIcon: "https://www.amerilendloan.com/images/telegram-logo.png",
    emailIcon: "https://cdn-icons-png.flaticon.com/512/561/561127.png",
    trustpilotLogo: "https://www.amerilendloan.com/images/trustpilot-logo.svg",
    lendingTreeLogo: "https://www.amerilendloan.com/images/lending-tree-logo.svg",
    bbbLogo: "https://www.amerilendloan.com/images/bbb.png",
  },
};

/**
 * Generate email footer HTML with company info
 */
export function getEmailFooter(): string {
  return `
    <div style="background: linear-gradient(135deg, #001a4d 0%, #0033A0 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
      <!-- Social Links -->
      <div style="margin-bottom: 20px;">
        <a href="${COMPANY_INFO.social.facebook}" style="display: inline-block; margin: 0 8px; width: 36px; height: 36px; background-color: rgba(255,255,255,0.15); border-radius: 50%; line-height: 36px; text-decoration: none; font-size: 16px; color: #fff;">f</a>
        <a href="${COMPANY_INFO.social.twitter}" style="display: inline-block; margin: 0 8px; width: 36px; height: 36px; background-color: rgba(255,255,255,0.15); border-radius: 50%; line-height: 36px; text-decoration: none; font-size: 16px; color: #fff;">𝕏</a>
        <a href="${COMPANY_INFO.social.instagram}" style="display: inline-block; margin: 0 8px; width: 36px; height: 36px; background-color: rgba(255,255,255,0.15); border-radius: 50%; line-height: 36px; text-decoration: none; font-size: 14px; color: #fff;">📷</a>
        <a href="${COMPANY_INFO.social.linkedin}" style="display: inline-block; margin: 0 8px; width: 36px; height: 36px; background-color: rgba(255,255,255,0.15); border-radius: 50%; line-height: 36px; text-decoration: none; font-size: 16px; color: #fff;">in</a>
      </div>

      <!-- Contact Info -->
      <div style="margin-bottom: 20px;">
        <a href="mailto:${COMPANY_INFO.contact.email}" style="color: #FFA500; text-decoration: none; font-weight: 600; font-size: 14px;">${COMPANY_INFO.contact.email}</a>
        <span style="margin: 0 12px; color: rgba(255,255,255,0.3);">|</span>
        <a href="tel:${COMPANY_INFO.contact.phoneFormatted.replace(/\D/g, '')}" style="color: #FFA500; text-decoration: none; font-weight: 600; font-size: 14px;">${COMPANY_INFO.contact.phone}</a>
      </div>

      <!-- Address -->
      <p style="margin: 0 0 20px 0; color: rgba(255,255,255,0.7); font-size: 12px; line-height: 1.6;">
        ${COMPANY_INFO.address.formatted}
      </p>
      
      <!-- Divider -->
      <div style="border-top: 1px solid rgba(255,255,255,0.15); padding-top: 20px; margin-top: 5px;">
        <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.5); font-size: 11px;">
          © ${new Date().getFullYear()} ${COMPANY_INFO.name}. All rights reserved.
        </p>
        <p style="margin: 0; font-size: 11px;">
          <a href="${COMPANY_INFO.website}/legal/privacy-policy" style="color: rgba(255,255,255,0.6); text-decoration: none;">Privacy Policy</a>
          <span style="margin: 0 6px; color: rgba(255,255,255,0.3);">•</span>
          <a href="${COMPANY_INFO.website}/legal/terms-of-service" style="color: rgba(255,255,255,0.6); text-decoration: none;">Terms of Service</a>
          <span style="margin: 0 6px; color: rgba(255,255,255,0.3);">•</span>
          <a href="${COMPANY_INFO.website}" style="color: rgba(255,255,255,0.6); text-decoration: none;">Visit Website</a>
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate email header HTML with logo
 */
export function getEmailHeader(): string {
  return `
    <div style="background: linear-gradient(135deg, #001a4d 0%, #0033A0 60%, #0050d4 100%); padding: 40px 20px 30px; text-align: center;">
      <div style="margin-bottom: 12px;">
        <img src="${COMPANY_INFO.logo.url}" alt="${COMPANY_INFO.logo.alt}" style="height: 80px; max-width: 80%; object-fit: contain; border-radius: 8px;">
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">AmeriLend</h1>
      <p style="color: #FFA500; margin: 8px 0 0 0; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">Trusted Lending Solutions</p>
    </div>
  `;
}
