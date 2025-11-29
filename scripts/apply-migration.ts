import { sql } from "drizzle-orm";
import { getDb } from "../server/db";

async function applyMigration() {
  const db = await getDb();
  
  try {
    console.log("Applying auto-pay Customer Profile fields migration...");
    
    // Using the sql tagged template from drizzle-orm
    await db.execute(sql`ALTER TABLE "auto_pay_settings" ADD COLUMN IF NOT EXISTS "customer_profile_id" varchar(255)`);
    await db.execute(sql`ALTER TABLE "auto_pay_settings" ADD COLUMN IF NOT EXISTS "payment_profile_id" varchar(255)`);
    await db.execute(sql`ALTER TABLE "auto_pay_settings" ADD COLUMN IF NOT EXISTS "card_brand" varchar(50)`);
    
    console.log("✅ Migration applied successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

applyMigration();
