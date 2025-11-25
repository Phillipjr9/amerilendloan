ALTER TABLE "loanApplications" ADD COLUMN "feePaymentVerified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "loanApplications" ADD COLUMN "feeVerifiedAt" timestamp;--> statement-breakpoint
ALTER TABLE "loanApplications" ADD COLUMN "feeVerifiedBy" integer;