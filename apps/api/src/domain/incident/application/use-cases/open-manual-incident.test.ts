import assert from "node:assert/strict";
import { test } from "node:test";
import { Incident } from "../../enterprise/entities/incident.js";
import { ManualIncidentRegistrationRepository } from "../repositories/manual-incident-registration-repository.js";
import { InvalidManualIncidentInputError, OpenManualIncidentUseCase } from "./open-manual-incident.js";

class InMemoryRepository extends ManualIncidentRegistrationRepository {
  calls: Parameters<ManualIncidentRegistrationRepository["register"]>[0][] = [];
  async register(input: Parameters<ManualIncidentRegistrationRepository["register"]>[0]) {
    this.calls.push(input);
    return { kind: "created" as const, value: input.incident };
  }
}

test("opens a private manual incident in its initial state", async () => {
  const repository = new InMemoryRepository();
  const result = await new OpenManualIncidentUseCase(repository).execute({
    actorId: "respondent", organizationId: "org", serviceId: "service", commandId: "cmd", correlationId: "corr",
    severity: "high", operationalImpact: "degraded", now: new Date("2026-09-10T12:34:56.000Z")
  });
  assert.equal(result.isRight(), true);
  assert.deepEqual(result.value, { id: repository.calls[0]?.incident.id.toString(), organizationId: "org", serviceId: "service",
    origin: "manual", state: "open", severity: "high", operationalImpact: "degraded", visibility: "private", version: 1,
    openedAt: "2026-09-10T12:34:56.000Z", openedBy: "respondent" });
});

test("rejects invalid severity or impact before persistence", async () => {
  const repository = new InMemoryRepository();
  const result = await new OpenManualIncidentUseCase(repository).execute({
    actorId: "admin", organizationId: "org", serviceId: "service", commandId: "cmd", correlationId: "corr",
    severity: "urgent" as never, operationalImpact: "none"
  });
  assert.equal(result.isLeft(), true);
  assert.ok(result.value instanceof InvalidManualIncidentInputError);
  assert.equal(repository.calls.length, 0);
});

test("incident defaults are enforced by the aggregate", () => {
  const incident = Incident.create({ organizationId: "org", serviceId: "service", severity: "low", operationalImpact: "none", openedAt: new Date(), openedBy: "admin" });
  assert.equal(incident.origin, "manual");
  assert.equal(incident.state, "open");
  assert.equal(incident.visibility, "private");
  assert.equal(incident.version, 1);
});
