ALTER TABLE "auto_pay_settings" ADD COLUMN "customer_profile_id" varchar(255);--> statement-breakpoint
ALTER TABLE "auto_pay_settings" ADD COLUMN "payment_profile_id" varchar(255);--> statement-breakpoint
ALTER TABLE "auto_pay_settings" ADD COLUMN "card_brand" varchar(50);