import assert from "node:assert/strict";
import { test } from "node:test";
import {
  OrganizationRegistrationRepository,
  type OrganizationRegistrationResult
} from "../repositories/organization-registration-repository.js";
import { CreateOrganizationUseCase } from "./create-organization.js";
import { InvalidOrganizationNameError } from "./errors/invalid-organization-name-error.js";

class InMemoryOrganizationRegistrationRepository extends OrganizationRegistrationRepository {
  received?: Parameters<OrganizationRegistrationRepository["register"]>[0];

  async register(input: Parameters<OrganizationRegistrationRepository["register"]>[0]): Promise<OrganizationRegistrationResult> {
    this.received = input;
    return { kind: "created", value: input };
  }
}

test("creates an organization and its first admin membership", async () => {
  const repository = new InMemoryOrganizationRegistrationRepository();
  const useCase = new CreateOrganizationUseCase(repository);
  const now = new Date("2026-09-07T12:00:00.000Z");

  const result = await useCase.execute({
    actorId: "actor-id",
    sessionTokenHash: "session-hash",
    commandId: "command-id",
    correlationId: "correlation-id",
    name: "  Acme  ",
    now
  });

  assert.equal(result.isRight(), true);
  assert.equal(repository.received?.organization.name, "Acme");
  assert.equal(repository.received?.membership.role, "admin");
  assert.equal(repository.received?.membership.organizationId, repository.received?.organization.id.toString());
  assert.equal(repository.received?.requestHash.length, 64);
  assert.equal(repository.received?.organization.createdAt, now);
});

test("rejects an empty name without touching persistence", async () => {
  const repository = new InMemoryOrganizationRegistrationRepository();
  const useCase = new CreateOrganizationUseCase(repository);

  const result = await useCase.execute({
    actorId: "actor-id",
    sessionTokenHash: "session-hash",
    commandId: "command-id",
    correlationId: "correlation-id",
    name: "   "
  });

  assert.equal(result.isLeft(), true);
  assert.ok(result.value instanceof InvalidOrganizationNameError);
  assert.equal(repository.received, undefined);
});
