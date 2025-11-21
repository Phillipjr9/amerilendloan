CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" varchar(50) NOT NULL,
	"key_name" varchar(100) NOT NULL,
	"encrypted_value" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "crypto_wallet_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"btc_address" varchar(100),
	"eth_address" varchar(100),
	"usdt_address" varchar(100),
	"usdc_address" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "email_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" varchar(50) NOT NULL,
	"smtp_host" varchar(255),
	"smtp_port" integer,
	"smtp_user" varchar(255),
	"encrypted_smtp_password" text,
	"from_email" varchar(255) NOT NULL,
	"from_name" varchar(255) NOT NULL,
	"reply_to_email" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"sms_notifications" boolean DEFAULT false NOT NULL,
	"application_approved" boolean DEFAULT true NOT NULL,
	"application_rejected" boolean DEFAULT true NOT NULL,
	"payment_reminders" boolean DEFAULT true NOT NULL,
	"payment_received" boolean DEFAULT true NOT NULL,
	"document_required" boolean DEFAULT true NOT NULL,
	"admin_alerts" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "system_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"auto_approval_enabled" boolean DEFAULT false NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"min_loan_amount" varchar(20) DEFAULT '1000.00' NOT NULL,
	"max_loan_amount" varchar(20) DEFAULT '5000.00' NOT NULL,
	"two_factor_required" boolean DEFAULT false NOT NULL,
	"session_timeout" integer DEFAULT 30 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_wallet_settings" ADD CONSTRAINT "crypto_wallet_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_config" ADD CONSTRAINT "email_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_config" ADD CONSTRAINT "system_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;