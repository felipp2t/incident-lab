import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { and, count, eq, inArray } from "drizzle-orm";
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
const password = "a-secure-test-password";
const adminId = randomUUID();
const memberId = randomUUID();
const outsiderId = randomUUID();
const organizationAId = randomUUID();
const organizationBId = randomUUID();
const adminEmail = `admin-${randomUUID()}@example.test`;
const memberEmail = `member-${randomUUID()}@example.test`;
const outsiderEmail = `outsider-${randomUUID()}@example.test`;

async function login(email: string) {
  const response = await app.inject({
    method: "POST",
    url: "/api/sessions",
    payload: { email, password }
  });
  assert.equal(response.statusCode, 201);
  const sessionCookie = response.cookies[0];
  assert.ok(sessionCookie);
  return `${sessionCookie.name}=${sessionCookie.value}`;
}

async function switchOrganization(cookie: string, organizationId: string) {
  return app.inject({
    method: "PATCH",
    url: "/api/me/active-organization",
    headers: { cookie },
    payload: { organizationId }
  });
}

async function associate(
  cookie: string,
  organizationId: string,
  userId: string,
  role: string,
  commandId = randomUUID(),
  correlationId = randomUUID()
) {
  return app.inject({
    method: "POST",
    url: `/api/organizations/${organizationId}/members`,
    headers: {
      cookie,
      "idempotency-key": commandId,
      "x-correlation-id": correlationId
    },
    payload: { userId, role }
  });
}

before(async () => {
  await database.db.insert(users).values([
    {
      id: adminId,
      email: adminEmail,
      name: "Test Admin",
      passwordHash: await hashPassword(password)
    },
    {
      id: memberId,
      email: memberEmail,
      name: "Test Member",
      passwordHash: await hashPassword(password)
    },
    {
      id: outsiderId,
      email: outsiderEmail,
      name: "Test Outsider",
      passwordHash: await hashPassword(password)
    }
  ]);
  await database.db.insert(organizations).values([
    { id: organizationAId, name: "Organization A" },
    { id: organizationBId, name: "Organization B" }
  ]);
  await database.db.insert(organizationMemberships).values([
    { organizationId: organizationAId, userId: adminId, role: "admin" },
    { organizationId: organizationBId, userId: adminId, role: "admin" }
  ]);
  await app.ready();
});

after(async () => {
  await database.db.delete(commandReceipts).where(inArray(commandReceipts.actorId, [adminId, memberId, outsiderId]));
  await database.db.delete(outbox).where(inArray(outbox.actorId, [adminId, memberId, outsiderId]));
  await database.db.delete(sessions).where(inArray(sessions.userId, [adminId, memberId, outsiderId]));
  await database.db.delete(organizationMemberships).where(
    and(
      inArray(organizationMemberships.organizationId, [organizationAId, organizationBId]),
      inArray(organizationMemberships.userId, [adminId, memberId, outsiderId])
    )
  );
  await database.db.delete(organizations).where(inArray(organizations.id, [organizationAId, organizationBId]));
  await database.db.delete(users).where(inArray(users.id, [adminId, memberId, outsiderId]));
  await app.close();
  await database.pool.end();
});

test("associates idempotently, preserves roles per organization, and enforces active context", async () => {
  const adminCookie = await login(adminEmail);

  const activeA = await switchOrganization(adminCookie, organizationAId);
  assert.equal(activeA.statusCode, 200);
  assert.deepEqual(activeA.json(), {
    activeOrganizationId: organizationAId,
    activeOrganizationRole: "admin"
  });

  const commandId = randomUUID();
  const correlationId = randomUUID();
  const first = await associate(adminCookie, organizationAId, memberId, "respondente", commandId, correlationId);
  const retry = await associate(adminCookie, organizationAId, memberId, "respondente", commandId, randomUUID());
  const conflict = await associate(adminCookie, organizationAId, memberId, "visualizador", commandId);
  const duplicate = await associate(adminCookie, organizationAId, memberId, "respondente");

  assert.equal(first.statusCode, 201);
  assert.equal(first.json().role, "respondente");
  assert.equal(retry.statusCode, 201);
  assert.deepEqual(retry.json(), first.json());
  assert.equal(conflict.statusCode, 409);
  assert.equal(conflict.json().error, "idempotency_conflict");
  assert.equal(duplicate.statusCode, 409);
  assert.equal(duplicate.json().error, "organization_membership_exists");

  const associatedEvents = await database.db
    .select()
    .from(outbox)
    .where(eq(outbox.organizationId, organizationAId));
  assert.equal(associatedEvents.length, 1);
  assert.deepEqual(associatedEvents[0], {
    id: associatedEvents[0]?.id,
    eventType: "OrganizationMemberAssociated.v1",
    aggregateType: "OrganizationMembership",
    aggregateId: organizationAId,
    organizationId: organizationAId,
    actorId: adminId,
    correlationId,
    causationId: commandId,
    payload: {
      organizationId: organizationAId,
      userId: memberId,
      role: "respondente"
    },
    occurredAt: associatedEvents[0]?.occurredAt,
    createdAt: associatedEvents[0]?.createdAt
  });

  const activeB = await switchOrganization(adminCookie, organizationBId);
  assert.equal(activeB.statusCode, 200);
  assert.deepEqual(activeB.json(), {
    activeOrganizationId: organizationBId,
    activeOrganizationRole: "admin"
  });
  const second = await associate(adminCookie, organizationBId, memberId, "visualizador");
  assert.equal(second.statusCode, 201);
  assert.equal(second.json().role, "visualizador");

  const [memberMembershipCount] = await database.db
    .select({ value: count() })
    .from(organizationMemberships)
    .where(eq(organizationMemberships.userId, memberId));
  assert.equal(memberMembershipCount?.value, 2);

  const memberCookie = await login(memberEmail);
  const memberInA = await switchOrganization(memberCookie, organizationAId);
  assert.equal(memberInA.statusCode, 200);
  assert.equal(memberInA.json().activeOrganizationRole, "respondente");
  const meInA = await app.inject({ method: "GET", url: "/api/me", headers: { cookie: memberCookie } });
  assert.equal(meInA.statusCode, 200);
  assert.equal(meInA.json().activeOrganizationId, organizationAId);
  assert.equal(meInA.json().activeOrganizationRole, "respondente");
  assert.equal(meInA.json().organizations.find((item: { id: string }) => item.id === organizationAId)?.role, "respondente");
  assert.equal(meInA.json().organizations.find((item: { id: string }) => item.id === organizationBId)?.role, "visualizador");

  const memberInB = await switchOrganization(memberCookie, organizationBId);
  assert.equal(memberInB.statusCode, 200);
  assert.equal(memberInB.json().activeOrganizationRole, "visualizador");
  const memberMeInB = await app.inject({ method: "GET", url: "/api/me", headers: { cookie: memberCookie } });
  assert.equal(memberMeInB.statusCode, 200);
  assert.equal(memberMeInB.json().activeOrganizationId, organizationBId);
  assert.equal(memberMeInB.json().activeOrganizationRole, "visualizador");

  const forbiddenInB = await associate(memberCookie, organizationBId, outsiderId, "respondente");
  assert.equal(forbiddenInB.statusCode, 403);
  assert.deepEqual(forbiddenInB.json(), { error: "forbidden" });

  const forbiddenInA = await associate(memberCookie, organizationAId, outsiderId, "respondente");
  assert.equal(forbiddenInA.statusCode, 403);
  assert.deepEqual(forbiddenInA.json(), { error: "forbidden" });

  const adminBackInA = await switchOrganization(adminCookie, organizationAId);
  assert.equal(adminBackInA.statusCode, 200);
  const crossOrganization = await associate(adminCookie, organizationBId, outsiderId, "respondente");
  assert.equal(crossOrganization.statusCode, 404);
  assert.deepEqual(crossOrganization.json(), { error: "not_found" });

  const unknownOrganization = await switchOrganization(memberCookie, randomUUID());
  assert.equal(unknownOrganization.statusCode, 404);
  assert.deepEqual(unknownOrganization.json(), { error: "organization_not_found" });
});
