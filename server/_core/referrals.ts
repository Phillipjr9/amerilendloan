/**
 * Referral Program Logic
 * Handles referral code generation, tracking, and reward distribution
 */

import { nanoid } from "nanoid";

/**
 * Generate a unique referral code
 */
export function generateReferralCode(): string {
  // Generate 8-character alphanumeric code (uppercase for readability)
  return nanoid(8).toUpperCase();
}

/**
 * Create referral link from code
 */
export function createReferralLink(referralCode: string, baseUrl: string = process.env.VITE_APP_URL || "https://amerilendloan.com"): string {
  return `${baseUrl}/apply?ref=${referralCode}`;
}

/**
 * Referral reward configuration
 */
export const REFERRAL_CONFIG = {
  // Bonus amounts in cents
  REFERRER_BONUS: 5000, // $50 for the person who refers
  REFERRED_BONUS: 2500, // $25 for the person who signs up
  
  // Bonus type
  BONUS_TYPE: "credit" as const, // "credit" or "cashback"
  
  // Expiration (in days)
  EXPIRATION_DAYS: 365, // 1 year
  
  // Conditions for completion
  COMPLETION_REQUIREMENTS: {
    // Referred user must complete first loan payment
    REQUIRES_PAYMENT: true,
    // Minimum loan amount to qualify (in cents)
    MIN_LOAN_AMOUNT: 100000, // $1,000
  },
};

/**
 * Check if referral is eligible for completion
 */
export function isReferralEligible(params: {
  referredUserId: number;
  loanAmount: number;
  paymentCompleted: boolean;
}): { eligible: boolean; reason?: string } {
  const { loanAmount, paymentCompleted } = params;
  
  if (REFERRAL_CONFIG.COMPLETION_REQUIREMENTS.REQUIRES_PAYMENT && !paymentCompleted) {
    return {
      eligible: false,
      reason: "Referred user must complete first loan payment",
    };
  }
  
  if (loanAmount < REFERRAL_CONFIG.COMPLETION_REQUIREMENTS.MIN_LOAN_AMOUNT) {
    return {
      eligible: false,
      reason: `Loan amount must be at least $${REFERRAL_CONFIG.COMPLETION_REQUIREMENTS.MIN_LOAN_AMOUNT / 100}`,
    };
  }
  
  return { eligible: true };
}

/**
 * Calculate referral expiration date
 */
export function calculateExpirationDate(createdAt: Date = new Date()): Date {
  const expirationDate = new Date(createdAt);
  expirationDate.setDate(expirationDate.getDate() + REFERRAL_CONFIG.EXPIRATION_DAYS);
  return expirationDate;
}

/**
 * Check if referral has expired
 */
export function isReferralExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
