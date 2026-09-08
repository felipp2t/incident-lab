import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export function openDatabase(connectionString: string) {
  const pool = new Pool({ connectionString });
  return { db: drizzle(pool), pool };
}

export type Database = ReturnType<typeof openDatabase>["db"];
