import { createHash } from "node:crypto";
import type { BaseError } from "../../../../core/errors/base-error.js";
import { type Either, left, right } from "../../../../core/types/either.js";
import { Organization } from "../../enterprise/entities/organization.js";
import { OrganizationMembership } from "../../enterprise/entities/organization-membership.js";
import type { OrganizationRegistrationRepository } from "../repositories/organization-registration-repository.js";
import { IdempotencyConflictError } from "./errors/idempotency-conflict-error.js";
import { InvalidOrganizationNameError } from "./errors/invalid-organization-name-error.js";
import { OrganizationMembershipExistsError } from "./errors/organization-membership-exists-error.js";

export interface OrganizationCreation {
  organization: { id: string; name: string; createdAt: string };
  membership: { userId: string; role: "admin" };
}

export type CreateOrganizationResponse = Either<BaseError, OrganizationCreation>;

export class CreateOrganizationUseCase {
  constructor(private readonly repository: OrganizationRegistrationRepository) {}

  async execute(input: {
    actorId: string;
    sessionTokenHash: string;
    commandId: string;
    correlationId: string;
    name: string;
    now?: Date;
  }): Promise<CreateOrganizationResponse> {
    const name = input.name.trim();
    if (!name) return left(new InvalidOrganizationNameError());

    const now = input.now ?? new Date();
    const requestHash = createHash("sha256").update(JSON.stringify({ name })).digest("hex");
    const organization = Organization.create({ name, createdAt: now });
    const membership = OrganizationMembership.create({
      organizationId: organization.id.toString(),
      userId: input.actorId,
      role: "admin",
      createdAt: now
    });

    const result = await this.repository.register({
      organization,
      membership,
      actorId: input.actorId,
      sessionTokenHash: input.sessionTokenHash,
      commandId: input.commandId,
      correlationId: input.correlationId,
      requestHash
    });

    if (result.kind === "conflict") return left(new IdempotencyConflictError());
    if (result.kind === "already_member") return left(new OrganizationMembershipExistsError());

    return right({
      organization: {
        id: result.value.organization.id.toString(),
        name: result.value.organization.name,
        createdAt: result.value.organization.createdAt.toISOString()
      },
      membership: {
        userId: result.value.membership.userId,
        role: "admin"
      }
    });
  }
}
