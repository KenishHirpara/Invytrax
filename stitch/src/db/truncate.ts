import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { sql } from "drizzle-orm";
import "dotenv/config"; // Ensure .env is read for truncate script

async function truncate() {
  console.log("Preparing to wipe all data inside Neon serverless database.");
  
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL");
  }

  const sqlClient = neon(process.env.DATABASE_URL);
  const db = drizzle(sqlClient, { schema });

  // Order doesn't strictly matter with CASCADE, but good to have a manifest
  const tables = [
    "stock_ledger",
    "delivery_lines",
    "deliveries",
    "receipt_lines",
    "receipts",
    "transfer_lines",
    "transfers",
    "adjustment_lines",
    "adjustments",
    "stock_per_location",
    "reorder_rules",
    "products",
    "categories",
    "locations",
    "warehouses",
    "users"
  ];

  try {
    for (const table of tables) {
      console.log(`Truncating ${table}...`);
      await db.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE;`));
    }
    console.log("✅ All data successfully cleared.");
  } catch (error) {
    console.error("❌ Failed to clear data:", error);
  }
}

truncate();
