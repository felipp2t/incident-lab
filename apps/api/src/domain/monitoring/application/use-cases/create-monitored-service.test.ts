import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MonitoredServiceRegistrationRepository,
  type MonitoredServiceRegistrationResult
} from "../repositories/monitored-service-registration-repository.js";
import { MonitoredService } from "../../enterprise/entities/monitored-service.js";
import { CreateMonitoredServiceUseCase } from "./create-monitored-service.js";
import { ForbiddenError } from "./errors/forbidden-error.js";
import { IdempotencyConflictError } from "./errors/idempotency-conflict-error.js";
import { InvalidMonitoredServiceNameError } from "./errors/invalid-monitored-service-name-error.js";

class InMemoryMonitoredServiceRegistrationRepository extends MonitoredServiceRegistrationRepository {
  calls: Parameters<MonitoredServiceRegistrationRepository["register"]>[0][] = [];
  result?: MonitoredServiceRegistrationResult;

  async register(input: Parameters<MonitoredServiceRegistrationRepository["register"]>[0]) {
    this.calls.push(input);
    return this.result ?? { kind: "created" as const, value: input.service };
  }
}

function input(name = "Checkout API") {
  return {
    actorId: "admin-id",
    organizationId: "organization-id",
    commandId: "command-id",
    correlationId: "correlation-id",
    name,
    now: new Date("2026-09-10T12:34:56.000Z")
  };
}

test("creates an active service with unknown operational state", async () => {
  const repository = new InMemoryMonitoredServiceRegistrationRepository();
  const useCase = new CreateMonitoredServiceUseCase(repository);

  const result = await useCase.execute(input("  Checkout API  "));

  assert.equal(result.isRight(), true);
  assert.deepEqual(result.value, {
    id: repository.calls[0]?.service.id.toString(),
    organizationId: "organization-id",
    name: "Checkout API",
    active: true,
    operationalState: "unknown",
    createdAt: "2026-09-10T12:34:56.000Z"
  });
  assert.equal(repository.calls.length, 1);
  assert.equal(repository.calls[0]?.service.isActive, true);
  assert.equal(repository.calls[0]?.service.operationalState, "unknown");
  assert.equal(repository.calls[0]?.service.organizationId, "organization-id");
  assert.equal(repository.calls[0]?.requestHash.length, 64);
});

test("rejects an empty name without touching persistence", async () => {
  const repository = new InMemoryMonitoredServiceRegistrationRepository();
  const useCase = new CreateMonitoredServiceUseCase(repository);

  const result = await useCase.execute(input("   "));

  assert.equal(result.isLeft(), true);
  assert.ok(result.value instanceof InvalidMonitoredServiceNameError);
  assert.equal(repository.calls.length, 0);
});

test("returns the stored service when the command is replayed", async () => {
  const repository = new InMemoryMonitoredServiceRegistrationRepository();
  repository.result = {
    kind: "replayed",
    value: MonitoredService.create({
      organizationId: "organization-id",
      name: "Checkout API",
      active: true,
      operationalState: "unknown",
      createdAt: new Date("2026-09-10T13:00:00.000Z")
    })
  };
  const useCase = new CreateMonitoredServiceUseCase(repository);

  const result = await useCase.execute(input());

  assert.equal(result.isRight(), true);
  assert.deepEqual(result.value, {
    id: repository.result?.value.id.toString(),
    organizationId: "organization-id",
    name: "Checkout API",
    active: true,
    operationalState: "unknown",
    createdAt: "2026-09-10T13:00:00.000Z"
  });
});

test("maps a different payload for the same command to an idempotency conflict", async () => {
  const repository = new InMemoryMonitoredServiceRegistrationRepository();
  repository.result = { kind: "conflict" };
  const useCase = new CreateMonitoredServiceUseCase(repository);

  const result = await useCase.execute(input("Different service"));

  assert.equal(result.isLeft(), true);
  assert.ok(result.value instanceof IdempotencyConflictError);
  assert.equal(repository.calls.length, 1);
});

test("maps a non-admin replay attempt to forbidden", async () => {
  const repository = new InMemoryMonitoredServiceRegistrationRepository();
  repository.result = { kind: "forbidden" };
  const useCase = new CreateMonitoredServiceUseCase(repository);

  const result = await useCase.execute(input());

  assert.equal(result.isLeft(), true);
  assert.ok(result.value instanceof ForbiddenError);
});
