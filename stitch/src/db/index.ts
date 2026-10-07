import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as relations from "./relations";

// CRITICAL: Pass both schema AND relations to drizzle() so .query.xxx.findMany({ with:{} })
// resolves to concrete types instead of 'never'.
// VERIFY: DATABASE_URL must be set in .env.local
const sql = neon(process.env.DATABASE_URL!);

const schemaWithRelations = { ...schema, ...relations };

export const db = drizzle(sql, { schema: schemaWithRelations });

export type DB = typeof db;
