import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { hashPassword } from "../../../auth/password.js";
import { openDatabase } from "../index.js";
import { users } from "../schema.js";

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.DEMO_USER_EMAIL?.trim().toLowerCase();
const name = process.env.DEMO_USER_NAME?.trim();
const password = process.env.DEMO_USER_PASSWORD;

if (!databaseUrl || !email || !name || !password) {
  throw new Error("DATABASE_URL and DEMO_USER_EMAIL, DEMO_USER_NAME, DEMO_USER_PASSWORD are required");
}
if (password.length < 12) throw new Error("DEMO_USER_PASSWORD must have at least 12 characters");

const { db, pool } = openDatabase(databaseUrl);
try {
  const passwordHash = await hashPassword(password);
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    await db.update(users).set({ name, passwordHash }).where(eq(users.id, existing.id));
    console.log(`Updated demo user ${email}`);
  } else {
    await db.insert(users).values({ id: randomUUID(), email, name, passwordHash });
    console.log(`Created demo user ${email}`);
  }
} finally {
  await pool.end();
}
