import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { count, eq } from "drizzle-orm";
import { buildApp } from "../../../app.js";
import { hashPassword } from "../../auth/password.js";
import { openDatabase } from "../../db/drizzle/index.js";
import {
  commandReceipts,
  organizationMemberships,
  organizations,
  outbox,
  sessions,
  users
} from "../../db/drizzle/schema.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for integration tests");

const app = buildApp({ databaseUrl });
const database = openDatabase(databaseUrl);
const email = `admin-${randomUUID()}@example.test`;
const password = "a-secure-test-password";

before(async () => {
  await database.db.insert(users).values({
    id: randomUUID(),
    email,
    name: "Test Admin",
    passwordHash: await hashPassword(password)
  });
  await app.ready();
});

after(async () => {
  const [user] = await database.db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (user) {
    await database.db.delete(commandReceipts).where(eq(commandReceipts.actorId, user.id));
    await database.db.delete(outbox).where(eq(outbox.actorId, user.id));
    await database.db.delete(sessions).where(eq(sessions.userId, user.id));
    const memberships = await database.db
      .select({ organizationId: organizationMemberships.organizationId })
      .from(organizationMemberships)
      .where(eq(organizationMemberships.userId, user.id));
    await database.db.delete(organizationMemberships).where(eq(organizationMemberships.userId, user.id));
    for (const membership of memberships) {
      await database.db.delete(organizations).where(eq(organizations.id, membership.organizationId));
    }
    await database.db.delete(users).where(eq(users.id, user.id));
  }
  await app.close();
  await database.pool.end();
});

test("creates one organization and first admin across retries", async () => {
  const login = await app.inject({
    method: "POST",
    url: "/api/sessions",
    payload: { email, password }
  });
  assert.equal(login.statusCode, 201);
  const sessionCookie = login.cookies[0];
  assert.ok(sessionCookie);
  const cookie = `${sessionCookie.name}=${sessionCookie.value}`;

  const commandId = randomUUID();
  const headers = { cookie, "idempotency-key": commandId, "x-correlation-id": randomUUID() };
  const first = await app.inject({ method: "POST", url: "/api/organizations", headers, payload: { name: "Acme" } });
  const retry = await app.inject({ method: "POST", url: "/api/organizations", headers, payload: { name: "Acme" } });

  assert.equal(first.statusCode, 201);
  assert.equal(retry.statusCode, 201);
  assert.deepEqual(retry.json(), first.json());

  const conflict = await app.inject({
    method: "POST",
    url: "/api/organizations",
    headers,
    payload: { name: "Different" }
  });
  assert.equal(conflict.statusCode, 409);

  const secondOrganization = await app.inject({
    method: "POST",
    url: "/api/organizations",
    headers: { ...headers, "idempotency-key": randomUUID() },
    payload: { name: "Second organization" }
  });
  assert.equal(secondOrganization.statusCode, 409);
  assert.equal(secondOrganization.json().error, "organization_membership_exists");

  const organizationId = first.json().organization.id as string;
  const [membership] = await database.db
    .select({ role: organizationMemberships.role })
    .from(organizationMemberships)
    .where(eq(organizationMemberships.organizationId, organizationId));
  assert.equal(membership?.role, "admin");

  const [organizationCount] = await database.db.select({ value: count() }).from(organizations).where(eq(organizations.id, organizationId));
  const [eventCount] = await database.db.select({ value: count() }).from(outbox).where(eq(outbox.organizationId, organizationId));
  assert.equal(organizationCount?.value, 1);
  assert.equal(eventCount?.value, 1);
});
