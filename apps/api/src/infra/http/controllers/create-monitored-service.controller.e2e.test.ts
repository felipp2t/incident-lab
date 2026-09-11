import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { and, count, eq, inArray } from "drizzle-orm";
import { buildApp } from "../../../app.js";
import { MonitoredService } from "../../../domain/monitoring/enterprise/entities/monitored-service.js";
import { hashPassword } from "../../auth/password.js";
import { openDatabase } from "../../db/drizzle/index.js";
import {
  commandReceipts,
  monitoredServices,
  organizationMemberships,
  organizations,
  outbox,
  sessions,
  users
} from "../../db/drizzle/schema.js";
import { DrizzleMonitoredServiceRegistrationRepository } from "../../db/drizzle/repositories/monitored-service-registration-repository.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for integration tests");

const app = buildApp({ databaseUrl });
const database = openDatabase(databaseUrl);
const password = "a-secure-test-password";
const adminId = randomUUID();
const respondentId = randomUUID();
const viewerId = randomUUID();
const foreignAdminId = randomUUID();
const organizationAId = randomUUID();
const organizationBId = randomUUID();
const adminEmail = `service-admin-${randomUUID()}@example.test`;
const respondentEmail = `service-respondent-${randomUUID()}@example.test`;
const viewerEmail = `service-viewer-${randomUUID()}@example.test`;
const foreignAdminEmail = `service-foreign-admin-${randomUUID()}@example.test`;

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

async function createService(
  cookie: string,
  organizationId: string,
  name: string,
  commandId = randomUUID(),
  correlationId = randomUUID()
) {
  return app.inject({
    method: "POST",
    url: `/api/organizations/${organizationId}/services`,
    headers: {
      cookie,
      "idempotency-key": commandId,
      "x-correlation-id": correlationId
    },
    payload: { name }
  });
}

before(async () => {
  await database.db.insert(users).values([
    {
      id: adminId,
      email: adminEmail,
      name: "Service Admin",
      passwordHash: await hashPassword(password)
    },
    {
      id: respondentId,
      email: respondentEmail,
      name: "Service Respondent",
      passwordHash: await hashPassword(password)
    },
    {
      id: viewerId,
      email: viewerEmail,
      name: "Service Viewer",
      passwordHash: await hashPassword(password)
    },
    {
      id: foreignAdminId,
      email: foreignAdminEmail,
      name: "Foreign Admin",
      passwordHash: await hashPassword(password)
    }
  ]);
  await database.db.insert(organizations).values([
    { id: organizationAId, name: "Service Organization A" },
    { id: organizationBId, name: "Service Organization B" }
  ]);
  await database.db.insert(organizationMemberships).values([
    { organizationId: organizationAId, userId: adminId, role: "admin" },
    { organizationId: organizationAId, userId: respondentId, role: "respondente" },
    { organizationId: organizationAId, userId: viewerId, role: "visualizador" },
    { organizationId: organizationBId, userId: foreignAdminId, role: "admin" }
  ]);
  await app.ready();
});

after(async () => {
  await database.db.delete(monitoredServices).where(
    inArray(monitoredServices.organizationId, [organizationAId, organizationBId])
  );
  await database.db.delete(commandReceipts).where(
    inArray(commandReceipts.actorId, [adminId, respondentId, viewerId, foreignAdminId])
  );
  await database.db.delete(outbox).where(
    inArray(outbox.actorId, [adminId, respondentId, viewerId, foreignAdminId])
  );
  await database.db.delete(sessions).where(
    inArray(sessions.userId, [adminId, respondentId, viewerId, foreignAdminId])
  );
  await database.db.delete(organizationMemberships).where(
    and(
      inArray(organizationMemberships.organizationId, [organizationAId, organizationBId]),
      inArray(organizationMemberships.userId, [adminId, respondentId, viewerId, foreignAdminId])
    )
  );
  await database.db.delete(organizations).where(inArray(organizations.id, [organizationAId, organizationBId]));
  await database.db.delete(users).where(inArray(users.id, [adminId, respondentId, viewerId, foreignAdminId]));
  await app.close();
  await database.pool.end();
});

test("creates an active unknown service idempotently and isolates organization paths", async () => {
  const adminCookie = await login(adminEmail);
  const activeA = await switchOrganization(adminCookie, organizationAId);
  assert.equal(activeA.statusCode, 200);

  const commandId = randomUUID();
  const correlationId = randomUUID();
  const first = await createService(adminCookie, organizationAId, "Checkout API", commandId, correlationId);
  assert.equal(first.statusCode, 201);
  const firstBody = first.json();
  assert.equal(firstBody.organizationId, organizationAId);
  assert.equal(firstBody.name, "Checkout API");
  assert.equal(firstBody.active, true);
  assert.equal(firstBody.operationalState, "unknown");
  assert.match(firstBody.id, /^[0-9a-f-]{36}$/);
  assert.equal(typeof firstBody.createdAt, "string");
  assert.equal(Number.isNaN(Date.parse(firstBody.createdAt)), false);

  const retry = await createService(adminCookie, organizationAId, "Checkout API", commandId, randomUUID());
  assert.equal(retry.statusCode, 201);
  assert.deepEqual(retry.json(), firstBody);

  const conflict = await createService(adminCookie, organizationAId, "Payments API", commandId);
  assert.equal(conflict.statusCode, 409);
  assert.deepEqual(conflict.json(), { error: "idempotency_conflict" });

  const [serviceCount] = await database.db
    .select({ value: count() })
    .from(monitoredServices)
    .where(eq(monitoredServices.organizationId, organizationAId));
  assert.equal(serviceCount?.value, 1);

  const [eventCount] = await database.db
    .select({ value: count() })
    .from(outbox)
    .where(and(eq(outbox.organizationId, organizationAId), eq(outbox.eventType, "MonitoredServiceCreated.v1")));
  assert.equal(eventCount?.value, 1);

  const [event] = await database.db
    .select()
    .from(outbox)
    .where(and(eq(outbox.organizationId, organizationAId), eq(outbox.eventType, "MonitoredServiceCreated.v1")));
  assert.ok(event);
  assert.equal(event.aggregateId, firstBody.id);
  assert.equal(event.correlationId, correlationId);
  assert.equal(event.causationId, commandId);
  assert.deepEqual(event.payload, {
    serviceId: firstBody.id,
    organizationId: organizationAId,
    name: "Checkout API",
    active: true,
    operationalState: "unknown"
  });

  const crossOrganizationPath = await createService(adminCookie, organizationBId, "Leaked service");
  assert.equal(crossOrganizationPath.statusCode, 404);
  assert.deepEqual(crossOrganizationPath.json(), { error: "not_found" });

  const [otherOrganizationServiceCount] = await database.db
    .select({ value: count() })
    .from(monitoredServices)
    .where(eq(monitoredServices.organizationId, organizationBId));
  assert.equal(otherOrganizationServiceCount?.value, 0);

  const foreignAdminCookie = await login(foreignAdminEmail);
  const activeB = await switchOrganization(foreignAdminCookie, organizationBId);
  assert.equal(activeB.statusCode, 200);
  const foreignCrossOrganizationPath = await createService(
    foreignAdminCookie,
    organizationAId,
    "Foreign service"
  );
  assert.equal(foreignCrossOrganizationPath.statusCode, 404);
  assert.deepEqual(foreignCrossOrganizationPath.json(), { error: "not_found" });
});

test("rejects respondent and viewer from creating a monitored service", async () => {
  const respondentCookie = await login(respondentEmail);
  const respondentContext = await switchOrganization(respondentCookie, organizationAId);
  assert.equal(respondentContext.statusCode, 200);
  assert.equal(respondentContext.json().activeOrganizationRole, "respondente");

  const respondentResponse = await createService(respondentCookie, organizationAId, "Respondent service");
  assert.equal(respondentResponse.statusCode, 403);
  assert.deepEqual(respondentResponse.json(), { error: "forbidden" });

  const viewerCookie = await login(viewerEmail);
  const viewerContext = await switchOrganization(viewerCookie, organizationAId);
  assert.equal(viewerContext.statusCode, 200);
  assert.equal(viewerContext.json().activeOrganizationRole, "visualizador");

  const viewerResponse = await createService(viewerCookie, organizationAId, "Viewer service");
  assert.equal(viewerResponse.statusCode, 403);
  assert.deepEqual(viewerResponse.json(), { error: "forbidden" });

  const [serviceCount] = await database.db
    .select({ value: count() })
    .from(monitoredServices)
    .where(eq(monitoredServices.organizationId, organizationAId));
  assert.equal(serviceCount?.value, 1);
});

test("rejects a registration when command and service organizations differ", async () => {
  const repository = new DrizzleMonitoredServiceRegistrationRepository(database.db);
  const service = MonitoredService.create({
    organizationId: organizationBId,
    name: "Mismatched service"
  });

  const result = await repository.register({
    organizationId: organizationAId,
    service,
    actorId: adminId,
    commandId: randomUUID(),
    correlationId: randomUUID(),
    requestHash: "a".repeat(64)
  });

  assert.deepEqual(result, { kind: "forbidden" });
  const [createdService] = await database.db
    .select({ id: monitoredServices.id })
    .from(monitoredServices)
    .where(eq(monitoredServices.id, service.id.toString()));
  assert.equal(createdService, undefined);
});

test("does not replay a service after the actor loses admin membership", async () => {
  const foreignAdminCookie = await login(foreignAdminEmail);
  const activeB = await switchOrganization(foreignAdminCookie, organizationBId);
  assert.equal(activeB.statusCode, 200);

  const commandId = randomUUID();
  const first = await createService(
    foreignAdminCookie,
    organizationBId,
    "Temporary service",
    commandId
  );
  assert.equal(first.statusCode, 201);

  await database.db
    .delete(organizationMemberships)
    .where(and(eq(organizationMemberships.organizationId, organizationBId), eq(organizationMemberships.userId, foreignAdminId)));

  const replay = await createService(
    foreignAdminCookie,
    organizationBId,
    "Temporary service",
    commandId
  );
  assert.equal(replay.statusCode, 403);
  assert.deepEqual(replay.json(), { error: "forbidden" });

  const [serviceCount] = await database.db
    .select({ value: count() })
    .from(monitoredServices)
    .where(and(eq(monitoredServices.organizationId, organizationBId), eq(monitoredServices.name, "Temporary service")));
  assert.equal(serviceCount?.value, 1);
});
