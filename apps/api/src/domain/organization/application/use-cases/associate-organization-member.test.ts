import assert from "node:assert/strict";
import { test } from "node:test";
import {
  OrganizationMembershipRepository,
  type OrganizationMembershipAssociationResult
} from "../repositories/organization-membership-repository.js";
import { OrganizationMembership } from "../../enterprise/entities/organization-membership.js";
import { AssociateOrganizationMemberUseCase } from "./associate-organization-member.js";
import { ForbiddenError } from "./errors/forbidden-error.js";
import { IdempotencyConflictError } from "./errors/idempotency-conflict-error.js";
import { InvalidMembershipRoleError } from "./errors/invalid-membership-role-error.js";
import { OrganizationMembershipExistsError } from "./errors/organization-membership-exists-error.js";
import { UserNotFoundError } from "./errors/user-not-found-error.js";

class InMemoryOrganizationMembershipRepository extends OrganizationMembershipRepository {
  calls: Parameters<OrganizationMembershipRepository["associate"]>[0][] = [];
  result: OrganizationMembershipAssociationResult = { kind: "created", value: OrganizationMembership.create({
    organizationId: "organization-id",
    userId: "user-id",
    role: "respondente",
    createdAt: new Date("2026-09-10T12:00:00.000Z")
  }) };

  async associate(input: Parameters<OrganizationMembershipRepository["associate"]>[0]) {
    this.calls.push(input);
    return this.result;
  }
}

function input(role = "respondente") {
  return {
    actorId: "admin-id",
    organizationId: "organization-id",
    userId: "user-id",
    role,
    commandId: "command-id",
    correlationId: "correlation-id",
    now: new Date("2026-09-10T12:34:56.000Z")
  };
}

test("associates a member with a supported role and forwards command context", async () => {
  const repository = new InMemoryOrganizationMembershipRepository();
  const useCase = new AssociateOrganizationMemberUseCase(repository);

  const result = await useCase.execute(input("respondente"));

  assert.equal(result.isRight(), true);
  assert.deepEqual(result.value, {
    organizationId: "organization-id",
    userId: "user-id",
    role: "respondente",
    createdAt: "2026-09-10T12:00:00.000Z"
  });
  assert.equal(repository.calls.length, 1);
  assert.equal(repository.calls[0]?.actorId, "admin-id");
  assert.equal(repository.calls[0]?.commandId, "command-id");
  assert.equal(repository.calls[0]?.correlationId, "correlation-id");
  assert.equal(repository.calls[0]?.membership.role, "respondente");
  assert.equal(repository.calls[0]?.membership.createdAt.toISOString(), "2026-09-10T12:34:56.000Z");
  assert.equal(repository.calls[0]?.requestHash.length, 64);
});

test("supports visualizador and returns the same confirmed value when the command is replayed", async () => {
  const repository = new InMemoryOrganizationMembershipRepository();
  repository.result = {
    kind: "replayed",
    value: OrganizationMembership.create({
      organizationId: "organization-id",
      userId: "user-id",
      role: "visualizador",
      createdAt: new Date("2026-09-10T13:00:00.000Z")
    })
  };
  const useCase = new AssociateOrganizationMemberUseCase(repository);

  const result = await useCase.execute(input("visualizador"));

  assert.equal(result.isRight(), true);
  assert.deepEqual(result.value, {
    organizationId: "organization-id",
    userId: "user-id",
    role: "visualizador",
    createdAt: "2026-09-10T13:00:00.000Z"
  });
});

test("rejects an unsupported role without touching persistence", async () => {
  const repository = new InMemoryOrganizationMembershipRepository();
  const useCase = new AssociateOrganizationMemberUseCase(repository);

  const result = await useCase.execute(input("admin"));

  assert.equal(result.isLeft(), true);
  assert.ok(result.value instanceof InvalidMembershipRoleError);
  assert.equal(repository.calls.length, 0);
});

test("maps persistence outcomes to application errors", async (t) => {
  const outcomes: [OrganizationMembershipAssociationResult, new () => Error][] = [
    [{ kind: "conflict" }, IdempotencyConflictError],
    [{ kind: "forbidden" }, ForbiddenError],
    [{ kind: "user_not_found" }, UserNotFoundError],
    [{ kind: "already_member" }, OrganizationMembershipExistsError]
  ];

  for (const [outcome, expectedError] of outcomes) {
    await t.test(outcome.kind, async () => {
      const repository = new InMemoryOrganizationMembershipRepository();
      repository.result = outcome;
      const useCase = new AssociateOrganizationMemberUseCase(repository);

      const result = await useCase.execute(input());

      assert.equal(result.isLeft(), true);
      assert.ok(result.value instanceof expectedError);
    });
  }
});
