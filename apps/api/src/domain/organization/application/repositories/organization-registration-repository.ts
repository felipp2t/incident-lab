import type { Organization } from "../../enterprise/entities/organization.js";
import type { OrganizationMembership } from "../../enterprise/entities/organization-membership.js";

export interface OrganizationRegistration {
  organization: Organization;
  membership: OrganizationMembership;
}

export type OrganizationRegistrationResult =
  | { kind: "created" | "replayed"; value: OrganizationRegistration }
  | { kind: "conflict" }
  | { kind: "already_member" };

export abstract class OrganizationRegistrationRepository {
  abstract register(input: {
    organization: Organization;
    membership: OrganizationMembership;
    actorId: string;
    sessionTokenHash: string;
    commandId: string;
    correlationId: string;
    requestHash: string;
  }): Promise<OrganizationRegistrationResult>;
}
