require('dotenv').config();
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function run() {
  try {
    // Add missing columns to users table
    const alterStatements = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "accountStatus" varchar(50) DEFAULT 'active'`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "suspendedAt" timestamp`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "suspendedReason" text`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "suspendedBy" integer`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "bannedAt" timestamp`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "bannedReason" text`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "bannedBy" integer`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "adminNotes" text`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "forcePasswordReset" boolean DEFAULT false`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "loginCount" integer DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLoginIp" varchar(50)`,
    ];

    for (const stmt of alterStatements) {
      await sql.unsafe(stmt);
    }
    console.log('Users table columns added');

    // Create user_notification_settings table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS user_notification_settings (
        id serial PRIMARY KEY,
        user_id integer NOT NULL UNIQUE,
        payment_reminders boolean NOT NULL DEFAULT true,
        payment_confirmations boolean NOT NULL DEFAULT true,
        loan_status_updates boolean NOT NULL DEFAULT true,
        document_notifications boolean NOT NULL DEFAULT true,
        promotional_notifications boolean NOT NULL DEFAULT false,
        email_enabled boolean NOT NULL DEFAULT true,
        sms_enabled boolean NOT NULL DEFAULT false,
        email_digest boolean NOT NULL DEFAULT false,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      )
    `);
    console.log('user_notification_settings table created');

    // Create automation_rules table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS automation_rules (
        id serial PRIMARY KEY,
        name varchar(255) NOT NULL,
        enabled boolean NOT NULL DEFAULT true,
        type varchar(100) NOT NULL,
        conditions text NOT NULL DEFAULT '[]',
        action text NOT NULL DEFAULT '{}',
        created_by integer,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      )
    `);
    console.log('automation_rules table created');

    console.log('ALL SCHEMA CHANGES APPLIED');
  } catch(e) {
    console.error('ERROR:', e.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
