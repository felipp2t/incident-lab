import type { OrganizationMembership } from "../../enterprise/entities/organization-membership.js";

export type OrganizationMembershipAssociationResult =
  | { kind: "created" | "replayed"; value: OrganizationMembership }
  | { kind: "conflict" | "forbidden" | "user_not_found" | "already_member" };

export abstract class OrganizationMembershipRepository {
  abstract associate(input: {
    organizationId: string;
    membership: OrganizationMembership;
    actorId: string;
    commandId: string;
    correlationId: string;
    requestHash: string;
  }): Promise<OrganizationMembershipAssociationResult>;
}
