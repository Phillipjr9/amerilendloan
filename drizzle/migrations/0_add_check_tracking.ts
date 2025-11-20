import { pgTable, varchar, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export async function up(db: any) {
  // Add tracking columns to disbursements table
  await db.schema.alterTable("disbursements").addColumn("trackingNumber", varchar("trackingNumber", { length: 255 })).execute();
  await db.schema.alterTable("disbursements").addColumn("trackingCompany", varchar("trackingCompany", { length: 50 })).execute();
}

export async function down(db: any) {
  // Drop tracking columns from disbursements table
  await db.schema.alterTable("disbursements").dropColumn("trackingNumber").execute();
  await db.schema.alterTable("disbursements").dropColumn("trackingCompany").execute();
}
