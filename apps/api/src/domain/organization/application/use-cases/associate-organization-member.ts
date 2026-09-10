import { createHash } from "node:crypto";
import type { BaseError } from "../../../../core/errors/base-error.js";
import { type Either, left, right } from "../../../../core/types/either.js";
import { OrganizationMembership, type MembershipRole } from "../../enterprise/entities/organization-membership.js";
import type {
  OrganizationMembershipRepository,
  OrganizationMembershipAssociationResult
} from "../repositories/organization-membership-repository.js";
import { IdempotencyConflictError } from "./errors/idempotency-conflict-error.js";
import { InvalidMembershipRoleError } from "./errors/invalid-membership-role-error.js";
import { OrganizationMembershipExistsError } from "./errors/organization-membership-exists-error.js";
import { ForbiddenError } from "./errors/forbidden-error.js";
import { UserNotFoundError } from "./errors/user-not-found-error.js";

export interface OrganizationMemberAssociation {
  organizationId: string;
  userId: string;
  role: Exclude<MembershipRole, "admin">;
  createdAt: string;
}

export type AssociateOrganizationMemberResponse = Either<BaseError, OrganizationMemberAssociation>;

export class AssociateOrganizationMemberUseCase {
  constructor(private readonly repository: OrganizationMembershipRepository) {}

  async execute(input: {
    actorId: string;
    organizationId: string;
    userId: string;
    role: string;
    commandId: string;
    correlationId: string;
    now?: Date;
  }): Promise<AssociateOrganizationMemberResponse> {
    if (input.role !== "respondente" && input.role !== "visualizador") {
      return left(new InvalidMembershipRoleError());
    }

    const now = input.now ?? new Date();
    const role = input.role as Exclude<MembershipRole, "admin">;
    const requestHash = createHash("sha256")
      .update(JSON.stringify({ organizationId: input.organizationId, userId: input.userId, role }))
      .digest("hex");
    const membership = OrganizationMembership.create({
      organizationId: input.organizationId,
      userId: input.userId,
      role,
      createdAt: now
    });

    const result = await this.repository.associate({
      organizationId: input.organizationId,
      membership,
      actorId: input.actorId,
      commandId: input.commandId,
      correlationId: input.correlationId,
      requestHash
    });

    if (result.kind === "conflict") return left(new IdempotencyConflictError());
    if (result.kind === "forbidden") return left(new ForbiddenError());
    if (result.kind === "user_not_found") return left(new UserNotFoundError());
    if (result.kind === "already_member") return left(new OrganizationMembershipExistsError());
    if (result.kind !== "created" && result.kind !== "replayed") {
      return left(new Error("unexpected_membership_association_result"));
    }

    return right(toResponse(result));
  }
}

function toResponse(result: Extract<OrganizationMembershipAssociationResult, { value: unknown }>): OrganizationMemberAssociation {
  return {
    organizationId: result.value.organizationId,
    userId: result.value.userId,
    role: result.value.role as Exclude<MembershipRole, "admin">,
    createdAt: result.value.createdAt.toISOString()
  };
}
