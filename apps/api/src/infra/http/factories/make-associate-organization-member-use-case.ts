import { AssociateOrganizationMemberUseCase } from "../../../domain/organization/application/use-cases/associate-organization-member.js";
import type { Database } from "../../db/drizzle/index.js";
import { DrizzleOrganizationMembershipRepository } from "../../db/drizzle/repositories/organization-membership-repository.js";

export function makeAssociateOrganizationMemberUseCase(db: Database) {
  return new AssociateOrganizationMemberUseCase(new DrizzleOrganizationMembershipRepository(db));
}
